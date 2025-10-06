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
            logger.info(`Intentando conectar a la base de datos: ${this.dbPath}`);
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    logger.error('Error conectando a la base de datos:', err);
                    reject(err);
                } else {
                    logger.info(`Conectado exitosamente a la base de datos: ${this.dbPath}`);
                    this.createTables().then(() => {
                        logger.info('Tablas creadas/verificadas, base de datos lista');
                        resolve();
                    }).catch(reject);
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

        try {
            for (const query of queries) {
                logger.info(`Ejecutando query: ${query.substring(0, 50)}...`);
                await this.run(query);
                logger.info('Query ejecutado correctamente');
            }
            logger.info('Tablas de la base de datos creadas/verificadas correctamente');
        } catch (error) {
            logger.error('Error creando tablas:', error);
            throw error;
        }
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
            
            // Obtener y devolver la operación creada
            const createdOperation = await this.getOperation(operationId);
            return createdOperation;
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
            setClause.push('take_profit_1 = ?');
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
        try {
            // Primero intentar con query simple
            const simpleQuery = "SELECT * FROM trading_operations WHERE status = 'OPEN' ORDER BY created_at DESC";
            const simpleOps = await this.all(simpleQuery);
            logger.info(`getActiveOperations (OPEN only): ${simpleOps ? simpleOps.length : 0} operaciones`);
            
            // Luego con query completa
            const query = "SELECT * FROM trading_operations WHERE status IN ('OPEN', 'BE', 'TP1', 'TP2', 'TP3') ORDER BY created_at DESC";
            const operations = await this.all(query);
            logger.info(`getActiveOperations (all active): ${operations ? operations.length : 0} operaciones activas`);
            
            if (operations && operations.length > 0) {
                logger.info(`Primera operación: ${JSON.stringify(operations[0])}`);
            }
            
            return operations;
        } catch (error) {
            logger.error('Error en getActiveOperations:', error);
            return [];
        }
    }

    async getOperationsByAsset(asset) {
        const query = 'SELECT * FROM trading_operations WHERE asset = ? ORDER BY created_at DESC';
        return await this.all(query, [asset]);
    }

    async getClosedOperations() {
        const query = "SELECT * FROM trading_operations WHERE status = 'CLOSED' ORDER BY created_at DESC";
        return await this.all(query);
    }

    async getAllOperations() {
        const query = 'SELECT * FROM trading_operations ORDER BY created_at DESC';
        const operations = await this.all(query);
        logger.info(`getAllOperations: Encontradas ${operations ? operations.length : 0} operaciones totales`);
        if (operations && operations.length > 0) {
            logger.info(`Primera operación: ${JSON.stringify(operations[0])}`);
        }
        return operations;
    }

    // Función de debugging para verificar el estado de la base de datos
    async debugDatabase() {
        try {
            logger.info('=== DEBUG DATABASE START ===');
            
            // Verificar conexión
            if (!this.db) {
                logger.error('Base de datos no está conectada');
                return;
            }
            
            // Verificar si la tabla existe
            const tableCheck = await this.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_operations'");
            logger.info(`Tabla trading_operations existe: ${!!tableCheck}`);
            
            // Contar registros totales
            const countResult = await this.get("SELECT COUNT(*) as count FROM trading_operations");
            logger.info(`Total registros en trading_operations: ${countResult ? countResult.count : 0}`);
            
            // Obtener todas las operaciones
            const allOps = await this.getAllOperations();
            logger.info(`getAllOperations() devolvió: ${allOps ? allOps.length : 'null/undefined'} operaciones`);
            
            // Obtener operaciones activas
            const activeOps = await this.getActiveOperations();
            logger.info(`getActiveOperations() devolvió: ${activeOps ? activeOps.length : 'null/undefined'} operaciones`);
            
            // Obtener operaciones cerradas
            const closedOps = await this.getClosedOperations();
            logger.info(`getClosedOperations() devolvió: ${closedOps ? closedOps.length : 'null/undefined'} operaciones`);
            
            // Mostrar estructura de la primera operación si existe
            if (allOps && allOps.length > 0) {
                logger.info('Primera operación encontrada:');
                logger.info(JSON.stringify(allOps[0], null, 2));
                
                // Contar por estado
                const statusCounts = {};
                allOps.forEach(op => {
                    statusCounts[op.status] = (statusCounts[op.status] || 0) + 1;
                });
                logger.info('Conteo por estado:');
                logger.info(JSON.stringify(statusCounts, null, 2));
            } else {
                logger.warn('No se encontraron operaciones en la base de datos');
                
                // Verificar si hay datos en la tabla directamente
                const directQuery = await this.all("SELECT * FROM trading_operations LIMIT 5");
                logger.info(`Query directo devolvió: ${directQuery ? directQuery.length : 'null/undefined'} registros`);
                if (directQuery && directQuery.length > 0) {
                    logger.info('Primer registro de query directo:');
                    logger.info(JSON.stringify(directQuery[0], null, 2));
                }
            }
            
            logger.info('=== DEBUG DATABASE END ===');
        } catch (error) {
            logger.error('Error en debugDatabase:', error);
        }
    }

    async getOperationUpdates(operationId) {
        const query = 'SELECT * FROM operation_updates WHERE operation_id = ? ORDER BY updated_at DESC';
        return await this.all(query, [operationId]);
    }

    // Función específica para debugging de operaciones OPEN
    async debugOpenOperations() {
        try {
            logger.info('=== DEBUG OPEN OPERATIONS ===');
            
            // Query directo para operaciones OPEN
            const openQuery = "SELECT * FROM trading_operations WHERE status = 'OPEN' ORDER BY created_at DESC";
            const openOps = await this.all(openQuery);
            logger.info(`Query directo OPEN: ${openOps ? openOps.length : 'null/undefined'} operaciones`);
            
            // Query para todas las operaciones con estado
            const allStatusQuery = "SELECT operation_id, status, asset, order_type, created_at FROM trading_operations ORDER BY created_at DESC";
            const allStatusOps = await this.all(allStatusQuery);
            logger.info(`Todas las operaciones con estado: ${allStatusOps ? allStatusOps.length : 'null/undefined'}`);
            
            if (allStatusOps && allStatusOps.length > 0) {
                logger.info('Todas las operaciones encontradas:');
                allStatusOps.forEach((op, index) => {
                    logger.info(`${index + 1}. ID: ${op.operation_id}, Status: ${op.status}, Asset: ${op.asset}, Type: ${op.order_type}, Created: ${op.created_at}`);
                });
            }
            
            logger.info('=== END DEBUG OPEN OPERATIONS ===');
        } catch (error) {
            logger.error('Error en debugOpenOperations:', error);
        }
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
