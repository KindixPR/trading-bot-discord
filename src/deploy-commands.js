import { REST, Routes } from 'discord.js';
import { config } from './config/config.js';
import { loadCommands, getCommandsForRegistration } from './utils/commandLoader.js';
import { logger } from './utils/logger.js';

async function deployCommands() {
    try {
        logger.info('🧹 Iniciando limpieza y deployment de comandos...');

        // Crear instancia REST
        const rest = new REST({ version: '10' }).setToken(config.discord.token);

        // PASO 1: Limpiar TODOS los comandos existentes (más agresivo)
        logger.info('🗑️ Limpiando TODOS los comandos existentes...');
        
        // Limpiar comandos globales primero
        try {
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: [] }
            );
            logger.info('✅ Comandos globales eliminados.');
        } catch (error) {
            logger.warn('⚠️ Error limpiando comandos globales:', error.message);
        }
        
        // Limpiar comandos del servidor específico si existe
        if (config.discord.guildId) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                    { body: [] }
                );
                logger.info('✅ Comandos del servidor eliminados.');
            } catch (error) {
                logger.warn('⚠️ Error limpiando comandos del servidor:', error.message);
            }
        }
        
        // Esperar un momento para que Discord procese la limpieza
        await new Promise(resolve => setTimeout(resolve, 2000));

        // PASO 2: Cargar todos los comandos disponibles
        const commands = new Map();
        await loadCommands(commands);
        
        const commandData = getCommandsForRegistration(commands);
        
        logger.info(`📝 Registrando ${commandData.length} comandos principales...`);
        commandData.forEach(cmd => {
            logger.info(`   - /${cmd.name}: ${cmd.description}`);
        });

        // PASO 3: Registrar solo los comandos principales
        if (config.discord.guildId) {
            // Registro en servidor específico (desarrollo)
            logger.info('Registrando comandos en servidor específico...');
            await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: commandData }
            );
            logger.info('✅ Comandos registrados en servidor específico.');
        } else {
            // Registro global (producción)
            logger.info('Registrando comandos globalmente...');
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commandData }
            );
            logger.info('✅ Comandos registrados globalmente.');
        }

        logger.info('🎉 ¡Limpieza y deployment completados exitosamente!');
        logger.info('📋 Solo estos comandos están ahora registrados:');
        commandData.forEach(cmd => {
            logger.info(`   ✅ /${cmd.name}`);
        });

    } catch (error) {
        logger.error('❌ Error durante la limpieza y deployment de comandos:', error);
        process.exit(1);
    }
}

// Ejecutar deployment si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    deployCommands();
}

export { deployCommands };
