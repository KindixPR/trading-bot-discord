import { REST, Routes } from 'discord.js';
import { config } from './config/config.js';
import { loadCommands, getCommandsForRegistration } from './utils/commandLoader.js';
import { logger } from './utils/logger.js';

async function deployCommands() {
    try {
        logger.info('Iniciando deployment de comandos...');

        // Cargar comandos
        const commands = new Map();
        await loadCommands(commands);
        
        const commandData = getCommandsForRegistration(commands);
        
        logger.info(`Registrando ${commandData.length} comandos...`);

        // Crear instancia REST
        const rest = new REST({ version: '10' }).setToken(config.discord.token);

        // Registrar comandos
        if (config.discord.guildId) {
            // Registro en servidor específico (desarrollo)
            logger.info('Registrando comandos en servidor específico...');
            await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: commandData }
            );
            logger.info('Comandos registrados en servidor específico.');
        } else {
            // Registro global (producción)
            logger.info('Registrando comandos globalmente...');
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commandData }
            );
            logger.info('Comandos registrados globalmente.');
        }

        logger.info('✅ Deployment de comandos completado exitosamente!');

    } catch (error) {
        logger.error('❌ Error durante el deployment de comandos:', error);
        process.exit(1);
    }
}

// Ejecutar deployment si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    deployCommands();
}

export { deployCommands };
