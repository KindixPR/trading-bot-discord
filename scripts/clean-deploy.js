import { REST, Routes } from 'discord.js';
import { config } from '../src/config/config.js';
import { logger } from '../src/utils/logger.js';

async function cleanDeploy() {
    try {
        logger.info('🧹 Iniciando limpieza completa de comandos...');

        // Crear instancia REST
        const rest = new REST({ version: '10' }).setToken(config.discord.token);

        // PASO 1: Eliminar TODOS los comandos existentes
        logger.info('🗑️ Eliminando todos los comandos existentes...');
        
        if (config.discord.guildId) {
            // Limpiar comandos del servidor específico
            await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: [] }
            );
            logger.info('✅ Comandos del servidor eliminados.');
        } else {
            // Limpiar comandos globales
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: [] }
            );
            logger.info('✅ Comandos globales eliminados.');
        }

        // PASO 2: Registrar solo los 3 comandos principales
        logger.info('📝 Registrando solo los 3 comandos principales...');

        const commands = [
            {
                name: 'entry',
                description: 'Crear una nueva operación de trading (Sistema Interactivo)'
            },
            {
                name: 'update', 
                description: 'Actualizar estado de una operación (Sistema Interactivo)'
            },
            {
                name: 'trades',
                description: 'Ver todas las operaciones de trading organizadas por estado'
            }
        ];

        if (config.discord.guildId) {
            // Registrar en servidor específico
            await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: commands }
            );
            logger.info('✅ 3 comandos registrados en servidor específico.');
        } else {
            // Registrar globalmente
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            logger.info('✅ 3 comandos registrados globalmente.');
        }

        logger.info('🎉 ¡Limpieza y registro completados exitosamente!');
        logger.info('📋 Comandos registrados:');
        commands.forEach(cmd => {
            logger.info(`   - /${cmd.name}: ${cmd.description}`);
        });

    } catch (error) {
        logger.error('❌ Error durante la limpieza de comandos:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    cleanDeploy();
}

export { cleanDeploy };
