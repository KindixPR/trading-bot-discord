#!/usr/bin/env node
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio data si no existe
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`📁 Directorio creado: ${dataDir}`);
}

const dbPath = path.resolve(__dirname, 'data', 'trading_bot.db');
console.log('🔧 Forzando inicialización de base de datos...');
console.log(`📁 Ruta: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos');
    
    // Verificar si las tablas ya existen
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_operations'", (err, row) => {
        if (err) {
            console.error('❌ Error verificando tabla:', err);
            process.exit(1);
        }
        
        if (row) {
            console.log('⚠️  Tabla trading_operations ya existe');
            // Verificar registros
            db.get("SELECT COUNT(*) as count FROM trading_operations", (err, countRow) => {
                if (err) {
                    console.error('❌ Error contando registros:', err);
                    process.exit(1);
                }
                console.log(`📊 Registros existentes: ${countRow.count}`);
                db.close();
            });
        } else {
            console.log('🔨 Creando tablas...');
            createTables();
        }
    });
});

function createTables() {
    const queries = [
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
        `CREATE TABLE IF NOT EXISTS bot_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];
    
    let completed = 0;
    const totalQueries = queries.length;
    
    queries.forEach((query, index) => {
        console.log(`📝 Ejecutando query ${index + 1}/${totalQueries}...`);
        db.run(query, (err) => {
            if (err) {
                console.error(`❌ Error en query ${index + 1}:`, err);
                process.exit(1);
            }
            completed++;
            console.log(`✅ Query ${index + 1} ejecutado correctamente`);
            
            if (completed === totalQueries) {
                console.log('🎉 Todas las tablas creadas correctamente');
                
                // Verificar que las tablas se crearon
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_operations'", (err, row) => {
                    if (err) {
                        console.error('❌ Error verificando tabla:', err);
                        process.exit(1);
                    }
                    if (row) {
                        console.log('✅ Tabla trading_operations verificada');
                        
                        // Verificar registros
                        db.get("SELECT COUNT(*) as count FROM trading_operations", (err, countRow) => {
                            if (err) {
                                console.error('❌ Error contando registros:', err);
                                process.exit(1);
                            }
                            console.log(`📊 Total registros: ${countRow.count}`);
                            
                            // Crear una operación de prueba si no hay registros
                            if (countRow.count === 0) {
                                console.log('🧪 Creando operación de prueba...');
                                const testOperation = {
                                    operation_id: 'TEST-' + Date.now(),
                                    asset: 'US30',
                                    order_type: 'BUY',
                                    entry_price: 35000.0,
                                    take_profit_1: 35100.0,
                                    stop_loss: 34900.0,
                                    status: 'OPEN',
                                    notes: 'Operación de prueba creada por force-init-db.js',
                                    created_by: 'system'
                                };
                                
                                const insertQuery = `INSERT INTO trading_operations 
                                    (operation_id, asset, order_type, entry_price, take_profit_1, stop_loss, status, notes, created_by)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                
                                db.run(insertQuery, [
                                    testOperation.operation_id,
                                    testOperation.asset,
                                    testOperation.order_type,
                                    testOperation.entry_price,
                                    testOperation.take_profit_1,
                                    testOperation.stop_loss,
                                    testOperation.status,
                                    testOperation.notes,
                                    testOperation.created_by
                                ], (err) => {
                                    if (err) {
                                        console.error('❌ Error creando operación de prueba:', err);
                                    } else {
                                        console.log('✅ Operación de prueba creada exitosamente');
                                    }
                                    db.close();
                                });
                            } else {
                                db.close();
                            }
                        });
                    } else {
                        console.log('❌ Tabla trading_operations no encontrada después de la creación');
                        process.exit(1);
                    }
                });
            }
        });
    });
}