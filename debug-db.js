#!/usr/bin/env node

// Script simple para verificar el estado de la base de datos
import { database } from './src/database/database.js';
import { logger } from './src/utils/logger.js';

async function debugDatabase() {
    try {
        console.log('🔍 Iniciando verificación de base de datos...');
        
        // Inicializar base de datos
        await database.initialize();
        console.log('✅ Base de datos inicializada');
        
        // Verificar si hay operaciones
        const allOps = await database.getAllOperations();
        console.log(`📊 Total operaciones: ${allOps ? allOps.length : 0}`);
        
        if (allOps && allOps.length > 0) {
            console.log('📋 Operaciones encontradas:');
            allOps.forEach((op, index) => {
                console.log(`${index + 1}. ID: ${op.operation_id}, Status: ${op.status}, Asset: ${op.asset}`);
            });
            
            // Verificar operaciones activas
            const activeOps = await database.getActiveOperations();
            console.log(`🟢 Operaciones activas: ${activeOps ? activeOps.length : 0}`);
        } else {
            console.log('❌ No se encontraron operaciones en la base de datos');
        }
        
        // Cerrar conexión
        await database.close();
        console.log('✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugDatabase();