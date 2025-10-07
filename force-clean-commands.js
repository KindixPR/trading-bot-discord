import { REST, Routes } from 'discord.js';
import { config } from './src/config/config.js';
import { logger } from './src/utils/logger.js';

async function forceCleanCommands() {
    try {
        logger.info('🧹 FORZANDO LIMPIEZA COMPLETA DE COMANDOS...');

        // Crear instancia REST
        const rest = new REST({ version: '10' }).setToken(config.discord.token);

        // Limpiar comandos globales
        logger.info('🗑️ Limpiando comandos globales...');
        await rest.put(
            Routes.applicationCommands(config.discord.clientId),
            { body: [] }
        );
        logger.info('✅ Comandos globales eliminados.');

        // Limpiar comandos del servidor específico si existe
        if (config.discord.guildId) {
            logger.info('🗑️ Limpiando comandos del servidor...');
            await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: [] }
            );
            logger.info('✅ Comandos del servidor eliminados.');
        }

        // Esperar para que Discord procese
        logger.info('⏳ Esperando 3 segundos para que Discord procese...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Ahora registrar solo los comandos que queremos
        logger.info('📝 Registrando comandos deseados...');
        const { deployCommands } = await import('./src/deploy-commands.js');
        await deployCommands();

        logger.info('🎉 ¡LIMPIEZA FORZADA COMPLETADA!');
        logger.info('📋 Solo estos comandos deberían estar registrados:');
        logger.info('   - /entry');
        logger.info('   - /update');
        logger.info('   - /trades');
        logger.info('   - /about');
        logger.info('   - /clear');

    } catch (error) {
        logger.error('❌ Error en limpieza forzada:', error);
        process.exit(1);
    }
}

// Ejecutar limpieza forzada
forceCleanCommands();