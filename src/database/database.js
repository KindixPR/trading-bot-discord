import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.resolve(config.database.path);
        this.ensureDataDirectory();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            logger.info(`Directorio de datos creado: ${dataDir}`);
        }
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    logger.error('Error conectando a la base de datos:', err);
                    reject(err);
                } else {
                    logger.info(`Conectado a la base de datos: ${this.dbPath}`);
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const queries = [
            // Tabla de operaciones de trading
            `CREATE TABLE IF NOT EXISTS trading_operations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_id TEXT UNIQUE NOT NULL,
                asset TEXT NOT NULL,
                order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
                entry_price REAL NOT NULL,
                take_profit_1 REAL,
                take_profit_2 REAL,
                stop_loss REAL,
                status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'BE', 'TP1', 'TP2', 'TP3', 'CLOSED', 'STOPPED')),
                notes TEXT,
                created_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Tabla de actualizaciones de operaciones
            `CREATE TABLE IF NOT EXISTS operation_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_id TEXT NOT NULL,
                update_type TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                notes TEXT,
                updated_by TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (operation_id) REFERENCES trading_operations (operation_id)
            )`,
            
            // Tabla de configuración del bot
            `CREATE TABLE IF NOT EXISTS bot_config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                description TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const query of queries) {
            await this.run(query);
        }

        logger.info('Tablas de la base de datos creadas/verificadas correctamente');
    }

    async run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    logger.error('Error ejecutando query:', err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    logger.error('Error obteniendo datos:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    logger.error('Error obteniendo todos los datos:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Métodos específicos para operaciones de trading
    async createOperation(operationData) {
        const { operationId, asset, orderType, entryPrice, takeProfit1, takeProfit2, stopLoss, notes, createdBy } = operationData;
        
        const query = `
            INSERT INTO trading_operations 
            (operation_id, asset, order_type, entry_price, take_profit_1, take_profit_2, stop_loss, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [operationId, asset, orderType, entryPrice, takeProfit1, takeProfit2, stopLoss, notes, createdBy];
        
        try {
            const result = await this.run(query, params);
            logger.info(`Operación creada: ${operationId}`);
            return result;
        } catch (error) {
            logger.error('Error creando operación:', error);
            throw error;
        }
    }

    async getOperation(operationId) {
        const query = 'SELECT * FROM trading_operations WHERE operation_id = ?';
        return await this.get(query, [operationId]);
    }

    async updateOperation(operationId, updateData) {
        const { status, takeProfit, stopLoss, notes } = updateData;
        const setClause = [];
        const params = [];
        
        if (status !== undefined) {
            setClause.push('status = ?');
            params.push(status);
        }
        if (takeProfit !== undefined) {
            setClause.push('take_profit = ?');
            params.push(takeProfit);
        }
        if (stopLoss !== undefined) {
            setClause.push('stop_loss = ?');
            params.push(stopLoss);
        }
        if (notes !== undefined) {
            setClause.push('notes = ?');
            params.push(notes);
        }
        
        setClause.push('updated_at = CURRENT_TIMESTAMP');
        params.push(operationId);
        
        const query = `UPDATE trading_operations SET ${setClause.join(', ')} WHERE operation_id = ?`;
        
        try {
            const result = await this.run(query, params);
            logger.info(`Operación actualizada: ${operationId}`);
            return result;
        } catch (error) {
            logger.error('Error actualizando operación:', error);
            throw error;
        }
    }

    async getActiveOperations() {
        const query = 'SELECT * FROM trading_operations WHERE status IN ("OPEN", "BE", "TP1", "TP2", "TP3") ORDER BY created_at DESC';
        return await this.all(query);
    }

    async getOperationsByAsset(asset) {
        const query = 'SELECT * FROM trading_operations WHERE asset = ? ORDER BY created_at DESC';
        return await this.all(query, [asset]);
    }

    async getClosedOperations() {
        const query = 'SELECT * FROM trading_operations WHERE status = "CLOSED" ORDER BY created_at DESC';
        return await this.all(query);
    }

    async getAllOperations() {
        const query = 'SELECT * FROM trading_operations ORDER BY created_at DESC';
        return await this.all(query);
    }

    async getOperationUpdates(operationId) {
        const query = 'SELECT * FROM operation_updates WHERE operation_id = ? ORDER BY updated_at DESC';
        return await this.all(query, [operationId]);
    }

    async logOperationUpdate(operationId, updateType, oldValue, newValue, notes, updatedBy) {
        const query = `
            INSERT INTO operation_updates 
            (operation_id, update_type, old_value, new_value, notes, updated_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [operationId, updateType, oldValue, newValue, notes, updatedBy];
        
        try {
            await this.run(query, params);
            logger.info(`Actualización registrada para operación: ${operationId}`);
        } catch (error) {
            logger.error('Error registrando actualización:', error);
            throw error;
        }
    }

    async close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        logger.error('Error cerrando base de datos:', err);
                        reject(err);
                    } else {
                        logger.info('Base de datos cerrada correctamente');
                        resolve();
                    }
                });
            });
        }
    }
}

export const database = new Database();
