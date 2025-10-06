#!/usr/bin/env node

// Script simple para verificar la base de datos sin dependencias
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usar la misma ruta que el bot
const dbPath = path.resolve(__dirname, 'data', 'trading_bot.db');

console.log('🔍 Verificando base de datos...');
console.log(`📁 Ruta: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    
    console.log('✅ Conectado a la base de datos');
    
    // Verificar si la tabla existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_operations'", (err, row) => {
        if (err) {
            console.error('❌ Error verificando tabla:', err);
            return;
        }
        
        if (row) {
            console.log('✅ Tabla trading_operations existe');
            
            // Contar registros
            db.get("SELECT COUNT(*) as count FROM trading_operations", (err, countRow) => {
                if (err) {
                    console.error('❌ Error contando registros:', err);
                    return;
                }
                
                console.log(`📊 Total registros: ${countRow.count}`);
                
                if (countRow.count > 0) {
                    // Mostrar todas las operaciones
                    db.all("SELECT operation_id, status, asset, order_type, created_at FROM trading_operations ORDER BY created_at DESC", (err, rows) => {
                        if (err) {
                            console.error('❌ Error obteniendo operaciones:', err);
                            return;
                        }
                        
                        console.log('📋 Operaciones encontradas:');
                        rows.forEach((op, index) => {
                            console.log(`${index + 1}. ID: ${op.operation_id}, Status: ${op.status}, Asset: ${op.asset}, Type: ${op.order_type}, Created: ${op.created_at}`);
                        });
                        
                        // Contar por estado
                        const statusCounts = {};
                        rows.forEach(op => {
                            statusCounts[op.status] = (statusCounts[op.status] || 0) + 1;
                        });
                        
                        console.log('📈 Conteo por estado:');
                        Object.entries(statusCounts).forEach(([status, count]) => {
                            console.log(`  ${status}: ${count}`);
                        });
                        
                        db.close();
                    });
                } else {
                    console.log('❌ No hay registros en la base de datos');
                    db.close();
                }
            });
        } else {
            console.log('❌ Tabla trading_operations no existe');
            db.close();
        }
    });
});