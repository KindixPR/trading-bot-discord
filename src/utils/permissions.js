import { config } from '../config/config.js';
import { logger } from './logger.js';

/**
 * Verifica si un usuario tiene permisos para usar un comando
 * @param {Object} interaction - La interacción de Discord
 * @param {Object} command - El comando que se está ejecutando
 * @returns {boolean} - True si tiene permisos, false si no
 */
export function checkPermissions(interaction, command) {
    try {
        // Si el comando no requiere permisos especiales, permitir
        if (!command.permissions || command.permissions.length === 0) {
            return true;
        }

        const userId = interaction.user.id;
        const member = interaction.member;

        // Verificar si el usuario está en la lista de administradores por ID
        const isAdminById = config.permissions.adminIds.includes(userId);
        
        if (isAdminById) {
            logger.info(`Usuario ${interaction.user.tag} (${userId}) tiene permisos de administrador por ID`);
            return true;
        }

        // Verificar permisos específicos del comando (fallback para compatibilidad)
        if (!member) {
            logger.warn('No se pudo obtener el miembro de la interacción');
            return false;
        }

        for (const permission of command.permissions) {
            switch (permission) {
                case 'ADMINISTRATOR':
                    if (member.permissions.has('Administrator')) {
                        logger.info(`Usuario ${interaction.user.tag} tiene permisos de administrador del servidor`);
                        return true;
                    }
                    break;
                    
                case 'MANAGE_GUILD':
                    if (member.permissions.has('ManageGuild')) {
                        return true;
                    }
                    break;
                    
                case 'MANAGE_CHANNELS':
                    if (member.permissions.has('ManageChannels')) {
                        return true;
                    }
                    break;
                    
                case 'MANAGE_MESSAGES':
                    if (member.permissions.has('ManageMessages')) {
                        return true;
                    }
                    break;
                    
                case 'MANAGE_ROLES':
                    if (member.permissions.has('ManageRoles')) {
                        return true;
                    }
                    break;
                    
                default:
                    logger.warn(`Permiso no reconocido: ${permission}`);
                    break;
            }
        }

        logger.warn(`Usuario ${interaction.user.tag} (${userId}) no tiene permisos para usar el comando ${command.data.name}`);
        return false;

    } catch (error) {
        logger.error('Error verificando permisos:', error);
        return false;
    }
}

/**
 * Verifica si un usuario es administrador del bot
 * @param {string} userId - ID del usuario de Discord
 * @returns {boolean} - True si es administrador, false si no
 */
export function isAdmin(userId) {
    try {
        if (!userId) return false;
        
        return config.permissions.adminIds.includes(userId);
    } catch (error) {
        logger.error('Error verificando si es administrador:', error);
        return false;
    }
}

/**
 * Verifica si el canal es el canal de trading configurado
 * @param {Object} channel - El canal de Discord
 * @returns {boolean} - True si es el canal correcto, false si no
 */
export function isTradingChannel(channel) {
    try {
        if (!config.discord.tradingChannelId) {
            return true; // Si no está configurado, permitir en cualquier canal
        }
        
        return channel.id === config.discord.tradingChannelId;
    } catch (error) {
        logger.error('Error verificando canal de trading:', error);
        return false;
    }
}
