#!/usr/bin/env node

// Script para inicializar la base de datos manualmente
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'data', 'trading_bot.db');

console.log('🔧 Inicializando base de datos...');
console.log(`📁 Ruta: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    
    console.log('✅ Conectado a la base de datos');
    
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

    let completed = 0;
    
    queries.forEach((query, index) => {
        console.log(`📝 Ejecutando query ${index + 1}...`);
        db.run(query, (err) => {
            if (err) {
                console.error(`❌ Error en query ${index + 1}:`, err);
                return;
            }
            
            completed++;
            console.log(`✅ Query ${index + 1} ejecutado correctamente`);
            
            if (completed === queries.length) {
                console.log('🎉 Todas las tablas creadas correctamente');
                
                // Verificar que las tablas existen
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_operations'", (err, row) => {
                    if (err) {
                        console.error('❌ Error verificando tabla:', err);
                        return;
                    }
                    
                    if (row) {
                        console.log('✅ Tabla trading_operations verificada');
                    } else {
                        console.log('❌ Tabla trading_operations no encontrada');
                    }
                    
                    db.close();
                });
            }
        });
    });
});