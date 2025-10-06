import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { database } from '../database/database.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { formatPriceForAsset, getAssetInfo } from '../config/microFutures.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const data = new SlashCommandBuilder()
    .setName('trades')
    .setDescription('Ver todas las operaciones de trading organizadas por estado');

const permissions = ['ADMINISTRATOR'];

async function execute(interaction) {
    try {
        logger.info(`Comando /trades ejecutado por ${interaction.user.tag}`);
        
        // Obtener todas las operaciones
        const allOperations = await database.getAllOperations();
        
        if (!allOperations || allOperations.length === 0) {
            const embed = createErrorEmbed('Sin Operaciones', 'No hay operaciones registradas.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Separar operaciones por estado
        const activeOperations = allOperations.filter(op => op.status === 'OPEN');
        const beOperations = allOperations.filter(op => op.status === 'BE');
        const tpOperations = allOperations.filter(op => ['TP1', 'TP2', 'TP3'].includes(op.status));
        const closedOperations = allOperations.filter(op => op.status === 'CLOSED');

        // Crear embed principal
        const embed = new EmbedBuilder()
            .setTitle('📊 Dashboard de Operaciones')
            .setDescription('**Resumen de todas las operaciones de trading**')
            .setColor(config.colors.info)
            .setTimestamp();

        // Agregar estadísticas
        embed.addFields(
            {
                name: '📈 Estadísticas Generales',
                value: `**Total:** ${allOperations.length}\n**Activas:** ${activeOperations.length}\n**BE:** ${beOperations.length}\n**TP:** ${tpOperations.length}\n**Cerradas:** ${closedOperations.length}`,
                inline: true
            },
            {
                name: '💰 Por Activo',
                value: getAssetStats(allOperations),
                inline: true
            },
            {
                name: '📊 Por Tipo',
                value: getTypeStats(allOperations),
                inline: true
            }
        );

        // Crear botones para navegación
        const navRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('trades_active')
                    .setLabel(`🟢 Activas (${activeOperations.length})`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('trades_be')
                    .setLabel(`🔄 BE (${beOperations.length})`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('trades_tp')
                    .setLabel(`🎯 TP (${tpOperations.length})`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('trades_closed')
                    .setLabel(`❌ Cerradas (${closedOperations.length})`)
                    .setStyle(ButtonStyle.Danger)
            );

        // Segunda fila con botón de limpiar
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('trades_clear')
                    .setLabel('🧹 Limpiar Todas')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('trades_refresh')
                    .setLabel('🔄 Actualizar')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [navRow, actionRow],
            ephemeral: true 
        });

        logger.info(`Dashboard de operaciones mostrado por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en comando trades:', error);
        
        try {
            const embed = createErrorEmbed('Error', 'Hubo un error al obtener las operaciones. Por favor, inténtalo de nuevo.');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (replyError) {
            logger.error('Error al responder en trades:', replyError);
        }
    }
}

// Función para obtener estadísticas por activo
function getAssetStats(operations) {
    const stats = {};
    operations.forEach(op => {
        stats[op.asset] = (stats[op.asset] || 0) + 1;
    });
    
    return Object.entries(stats)
        .map(([asset, count]) => `**${asset}:** ${count}`)
        .join('\n') || 'N/A';
}

// Función para obtener estadísticas por tipo
function getTypeStats(operations) {
    const buyCount = operations.filter(op => op.order_type === 'BUY').length;
    const sellCount = operations.filter(op => op.order_type === 'SELL').length;
    
    return `**BUY:** ${buyCount}\n**SELL:** ${sellCount}`;
}

// Manejar interacciones de botones para trades
async function handleButtonInteraction(interaction) {
    try {
        const customId = interaction.customId;
        
        if (customId.startsWith('trades_')) {
            const filter = customId.replace('trades_', '');
            
            // Manejar casos especiales de confirmación y cancelación primero
            if (filter === 'confirm_clear') {
                // Confirmar limpieza
                try {
                    // Eliminar todas las operaciones y logs relacionados
                    await database.run('DELETE FROM trading_operations');
                    await database.run('DELETE FROM operation_updates');
                    
                    const successEmbed = new EmbedBuilder()
                        .setTitle('✅ Limpieza Completada')
                        .setDescription('Todas las operaciones y su historial han sido eliminados exitosamente.\n\n🔄 **El sistema se ha reiniciado completamente.**')
                        .setColor(config.colors.success)
                        .setTimestamp();

                    await interaction.update({
                        embeds: [successEmbed],
                        components: []
                    });

                    logger.info(`Usuario ${interaction.user.tag} limpió todas las operaciones y logs`);
                    return;

                } catch (error) {
                    logger.error('Error limpiando operaciones:', error);
                    await interaction.update({
                        content: '❌ Error al limpiar las operaciones. Por favor, inténtalo de nuevo.',
                        components: []
                    });
                    return;
                }
            }
            
            if (filter === 'cancel_clear') {
                // Cancelar limpieza
                await interaction.update({
                    content: '❌ Limpieza cancelada.',
                    components: []
                });
                return;
            }
            
            // Continuar con los filtros normales
            let operations = [];
            let title = '';
            let color = config.colors.info;
            
            logger.info(`Filtro seleccionado: ${filter}`);
            
            switch (filter) {
                case 'active':
                    operations = await database.getActiveOperations();
                    title = '🟢 Operaciones Activas';
                    color = config.colors.success;
                    break;
                case 'be':
                    const allOps = await database.getAllOperations();
                    operations = allOps.filter(op => op.status === 'BE');
                    title = '🔄 Operaciones en Break Even';
                    color = config.colors.warning;
                    break;
                case 'tp':
                    const allOpsTP = await database.getAllOperations();
                    operations = allOpsTP.filter(op => ['TP1', 'TP2', 'TP3'].includes(op.status));
                    title = '🎯 Operaciones con Take Profit';
                    color = config.colors.info;
                    break;
                case 'closed':
                    operations = await database.getClosedOperations();
                    title = '❌ Operaciones Cerradas';
                    color = config.colors.error;
                    break;
                case 'clear':
                    // Manejar botón de limpiar
                    const allOperations = await database.getAllOperations();
                    
                    if (!allOperations || allOperations.length === 0) {
                        await interaction.update({
                            content: '❌ No hay operaciones para limpiar.',
                            components: []
                        });
                        return;
                    }

                    // Crear embed de confirmación
                    const confirmEmbed = new EmbedBuilder()
                        .setTitle('🧹 Confirmar Limpieza')
                        .setDescription(`¿Estás seguro de que quieres eliminar **${allOperations.length}** operaciones?\n\n⚠️ **Esta acción no se puede deshacer.**`)
                        .setColor(config.colors.warning)
                        .setTimestamp();

                    const confirmRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('trades_confirm_clear')
                                .setLabel('✅ Sí, Eliminar Todas')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('trades_cancel_clear')
                                .setLabel('❌ Cancelar')
                                .setStyle(ButtonStyle.Secondary)
                        );

                    await interaction.update({
                        embeds: [confirmEmbed],
                        components: [confirmRow]
                    });
                    return;
                case 'refresh':
                    // Actualizar dashboard
                    await interaction.deferUpdate();
                    
                    // Re-ejecutar el comando principal
                    await execute(interaction);
                    return;
                default:
                    logger.warn(`Filtro no reconocido: ${filter}`);
                    await interaction.update({
                        content: `❌ Filtro no reconocido: ${filter}`,
                        components: []
                    });
                    return;
            }
            
            if (!operations || operations.length === 0) {
                await interaction.update({
                    content: `❌ No hay operaciones en la categoría "${filter}".`,
                    components: []
                });
                return;
            }
            
            // Crear embed con las operaciones filtradas
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`**${operations.length} operaciones encontradas**`)
                .setColor(color)
                .setTimestamp();
            
            // Mostrar las primeras 10 operaciones
            const operationsToShow = operations.slice(0, 10);
            operationsToShow.forEach((op, index) => {
                const assetInfo = getAssetInfo(op.asset);
                const emoji = assetInfo?.emoji || '📊';
                const typeEmoji = op.order_type === 'BUY' ? '🟢' : '🔴';
                
                embed.addFields({
                    name: `${index + 1}. ${emoji} ${op.asset} ${typeEmoji} ${op.order_type}`,
                    value: `**ID:** \`${op.operation_id ? op.operation_id.substring(0, 12) + '...' : 'N/A'}\`\n**Precio:** ${formatPriceForAsset(op.asset, op.entry_price)}\n**Estado:** ${op.status}`,
                    inline: true
                });
            });
            
            if (operations.length > 10) {
                embed.setFooter({ text: `Mostrando 10 de ${operations.length} operaciones` });
            }
            
            await interaction.update({
                embeds: [embed],
                components: []
            });
            
            logger.info(`Usuario ${interaction.user.tag} filtró operaciones por: ${filter}`);

        }
    } catch (error) {
        logger.error('Error en handleButtonInteraction (trades):', error);
        
        try {
            await interaction.update({
                content: '❌ Hubo un error procesando tu selección. Por favor, inténtalo de nuevo.',
                components: []
            });
        } catch (replyError) {
            logger.error('Error al responder en handleButtonInteraction (trades):', replyError);
        }
    }
}

export default { 
    data, 
    execute, 
    permissions,
    handleButtonInteraction
};
