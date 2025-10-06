import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Carga todos los comandos desde la carpeta de comandos
 * @param {Collection} commands - Colección de comandos de Discord.js
 */
export async function loadCommands(commands) {
    try {
        const commandsPath = join(__dirname, '../commands');
        const commandFiles = readdirSync(commandsPath).filter(file => 
            file.endsWith('.js') && !file.startsWith('_')
        );

        logger.info(`Encontrados ${commandFiles.length} archivos de comandos`);

        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = await import(`file://${filePath}`);
            
            if (command.default && 'data' in command.default && 'execute' in command.default) {
                commands.set(command.default.data.name, command.default);
                logger.info(`Comando cargado: ${command.default.data.name}`);
            } else {
                logger.warn(`El comando en ${file} no tiene la estructura requerida`);
            }
        }

        logger.info(`Total de comandos cargados: ${commands.size}`);
    } catch (error) {
        logger.error('Error cargando comandos:', error);
        throw error;
    }
}

/**
 * Obtiene la lista de comandos para registro
 * @param {Collection} commands - Colección de comandos
 * @returns {Array} - Array de comandos para registro
 */
export function getCommandsForRegistration(commands) {
    const commandArray = [];
    
    commands.forEach(command => {
        commandArray.push(command.data.toJSON());
    });
    
    return commandArray;
}
