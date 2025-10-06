import { SlashCommandBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Limpiar sesión atascada (si estás bloqueado en un proceso)');

const permissions = ['ADMINISTRATOR'];

async function execute(interaction) {
    const userId = interaction.user.id;
    
    // Verificar si la interacción ya fue respondida
    if (interaction.replied || interaction.deferred) {
        logger.warn(`Interacción ya fue respondida para usuario ${interaction.user.tag}`);
        return;
    }
    
    // Deferir respuesta INMEDIATAMENTE
    try {
        await interaction.deferReply({ flags: 64 });
    } catch (error) {
        if (error.code === 10062) {
            logger.warn(`Interacción expirada para usuario ${interaction.user.tag} antes de poder responder`);
            return;
        }
        if (error.code === 40060) {
            logger.warn(`Interacción ya fue reconocida para usuario ${interaction.user.tag}`);
            return;
        }
        throw error;
    }
    
    try {
        logger.info(`Comando /clear ejecutado por ${interaction.user.tag}`);
        
        // Importar los maps de locks dinámicamente para evitar dependencias circulares
        const { userLocks, userTimeouts } = await import('./entry.js');
        const { updateUserLocks, updateUserTimeouts } = await import('./update.js');
        
        let cleared = false;
        let clearedTypes = [];
        
        // Limpiar locks de entry
        if (userLocks.has(userId)) {
            const lockTime = userLocks.get(userId);
            const minutesSinceLock = Math.floor((Date.now() - lockTime) / 60000);
            userLocks.delete(userId);
            userTimeouts.delete(userId);
            cleared = true;
            clearedTypes.push(`entry (${minutesSinceLock} min)`);
        }
        
        // Limpiar locks de update
        if (updateUserLocks.has(userId)) {
            const lockTime = updateUserLocks.get(userId);
            const minutesSinceLock = Math.floor((Date.now() - lockTime) / 60000);
            updateUserLocks.delete(userId);
            updateUserTimeouts.delete(userId);
            cleared = true;
            clearedTypes.push(`update (${minutesSinceLock} min)`);
        }
        
        if (cleared) {
            await interaction.editReply({
                content: `✅ **Sesión limpiada exitosamente**\n\n` +
                        `🧹 Procesos eliminados: ${clearedTypes.join(', ')}\n` +
                        `🔄 Ahora puedes usar los comandos normalmente.`,
                ephemeral: true
            });
            logger.info(`Sesión limpiada para usuario ${interaction.user.tag}: ${clearedTypes.join(', ')}`);
        } else {
            await interaction.editReply({
                content: `ℹ️ **No hay sesiones activas**\n\n` +
                        `No tienes ningún proceso bloqueado actualmente.\n` +
                        `Puedes usar los comandos normalmente.`,
                ephemeral: true
            });
        }
        
    } catch (error) {
        logger.error('Error ejecutando comando clear:', error);
        try {
            await interaction.editReply({
                content: '❌ Error al limpiar la sesión. Contacta al administrador.',
                ephemeral: true
            });
        } catch (editError) {
            logger.error('Error editando respuesta de clear:', editError);
        }
    }
}

export { execute, permissions };