import { EmbedBuilder } from 'discord.js';
import moment from 'moment';
import { config } from '../config/config.js';
import { getAssetInfo, calculateMovementValue, formatPriceForAsset } from '../config/microFutures.js';

// Configurar moment para español
moment.locale('es');

// Función helper para obtener timestamp para Discord
function getDiscordTimestamp() {
    return new Date(); // Discord.js v14 maneja automáticamente la conversión
}

// Función helper para formatear fecha en formato de 12 horas (para campos de texto)
function getFormattedTimestamp() {
    return moment().format('YYYY-MM-DD h:mm A');
}

/**
 * Crea un embed para una nueva operación de trading
 * @param {Object} operation - Datos de la operación
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createTradeEntryEmbed(operation) {
    const { asset, orderType, entryPrice, takeProfit1, takeProfit2, stopLoss, notes, operationId, createdBy } = operation;
    
    // Obtener información del activo
    const assetInfo = getAssetInfo(asset);
    const assetEmoji = assetInfo?.emoji || '📊';
    const assetName = assetInfo?.name || asset;
    
    // Colores más profesionales
    const embedColor = orderType === 'BUY' ? config.colors.success : config.colors.error;
    const typeEmoji = orderType === 'BUY' ? '🟢' : '🔴';
    
    const embed = new EmbedBuilder()
        .setTitle(`${typeEmoji} ${assetEmoji} ${assetName} - Nueva Operación`)
        .setDescription(`**Tipo:** ${orderType} | **Activo:** ${asset}`)
        .setColor(embedColor)
        .addFields(
            {
                name: '📊 Tipo de Orden',
                value: `${orderType === 'BUY' ? '🟢 COMPRA' : '🔴 VENTA'}`,
                inline: true
            },
            {
                name: '💰 Precio de Entrada',
                value: `**${formatPriceForAsset(asset, parseFloat(entryPrice))}**`,
                inline: true
            },
            {
                name: '🎯 Take Profit 1',
                value: takeProfit1 ? `**${formatPriceForAsset(asset, parseFloat(takeProfit1))}**` : 'No establecido',
                inline: true
            },
            {
                name: '🎯 Take Profit 2',
                value: takeProfit2 ? `**${formatPriceForAsset(asset, parseFloat(takeProfit2))}**` : 'No establecido',
                inline: true
            },
            {
                name: '🛡️ Stop Loss',
                value: stopLoss ? `**${formatPriceForAsset(asset, parseFloat(stopLoss))}**` : 'No establecido',
                inline: true
            },
            {
                name: '💬 Notas Importantes',
                value: notes ? `**${notes}**` : '*Sin notas adicionales*',
                inline: false
            },
            {
                name: '👤 Operador',
                value: `<@${createdBy}>`,
                inline: true
            }
        )
        .setTimestamp(new Date());

    // Información del contrato removida para un diseño más limpio

    embed.setFooter({ 
        text: 'BDX Traders • Sistema Profesional de Trading'
    });

    return embed;
}

/**
 * Crea un embed para actualización de operación
 * @param {Object} operation - Datos de la operación actualizada
 * @param {string} updateType - Tipo de actualización
 * @param {string} updatedBy - Usuario que actualizó
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createTradeUpdateEmbed(operation, updateType, updatedBy) {
    const { asset, orderType, status, takeProfit, stopLoss, operationId } = operation;
    
    let statusEmoji = '📊';
    let statusColor = config.colors.info;
    
    switch (status) {
        case 'BE':
            statusEmoji = '⚖️';
            statusColor = config.colors.warning;
            break;
        case 'TP1':
        case 'TP2':
        case 'TP3':
            statusEmoji = '🎯';
            statusColor = config.colors.success;
            break;
        case 'CLOSED':
            statusEmoji = '✅';
            statusColor = config.colors.success;
            break;
        case 'STOPPED':
            statusEmoji = '🛑';
            statusColor = config.colors.error;
            break;
    }
    
    const embed = new EmbedBuilder()
        .setTitle(`${statusEmoji} Actualización de Operación - ${asset}`)
        .setColor(statusColor)
        .addFields(
            {
                name: '📊 Operación',
                value: `${orderType === 'BUY' ? '🟢 COMPRA' : '🔴 VENTA'} ${asset}`,
                inline: true
            },
            {
                name: '📈 Estado Actual',
                value: `**${status}**`,
                inline: true
            },
            {
                name: '🎯 Take Profit',
                value: takeProfit ? `**${takeProfit}**` : 'No establecido',
                inline: true
            },
            {
                name: '🛡️ Stop Loss',
                value: stopLoss ? `**${stopLoss}**` : 'No establecido',
                inline: true
            },
            {
                name: '🔄 Tipo de Actualización',
                value: `**${updateType}**`,
                inline: true
            },
            {
                name: '🆔 ID de Operación',
                value: `\`${operationId}\``,
                inline: true
            },
            {
                name: '👤 Actualizado por',
                value: `<@${updatedBy}>`,
                inline: true
            }
        )
        .setTimestamp(new Date())
        .setFooter({ 
            text: 'BDX Traders • Sistema Profesional de Trading'
        });

    return embed;
}

/**
 * Crea un embed para cierre de operación
 * @param {Object} operation - Datos de la operación cerrada
 * @param {number} finalPrice - Precio final de cierre
 * @param {string} closedBy - Usuario que cerró la operación
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createTradeCloseEmbed(operation, finalPrice, closedBy) {
    const { asset, orderType, entryPrice, operationId } = operation;
    
    const entry = parseFloat(entryPrice);
    const final = parseFloat(finalPrice);
    
    const points = orderType === 'BUY' 
        ? (final - entry).toFixed(2)
        : (entry - final).toFixed(2);
    
    const isProfit = (orderType === 'BUY' && final > entry) || 
                    (orderType === 'SELL' && final < entry);
    
    // Calcular valor monetario del movimiento
    const assetInfo = getAssetInfo(asset);
    const monetaryValue = assetInfo ? calculateMovementValue(asset, Math.abs(points)) : null;
    
    const embed = new EmbedBuilder()
        .setTitle(`✅ Operación Cerrada - ${asset}`)
        .setColor(isProfit ? config.colors.success : config.colors.error)
        .addFields(
            {
                name: '📊 Operación',
                value: `${orderType === 'BUY' ? '🟢 COMPRA' : '🔴 VENTA'} ${asset}`,
                inline: true
            },
            {
                name: '💰 Precio de Entrada',
                value: `**${formatPriceForAsset(asset, entry)}**`,
                inline: true
            },
            {
                name: '💰 Precio de Cierre',
                value: `**${formatPriceForAsset(asset, final)}**`,
                inline: true
            },
            {
                name: '📈 Resultado',
                value: `${isProfit ? '🟢 GANANCIA' : '🔴 PÉRDIDA'}`,
                inline: true
            },
            {
                name: '📊 Puntos',
                value: `${isProfit ? '+' : ''}${points}`,
                inline: true
            },
            {
                name: '🆔 ID de Operación',
                value: `\`${operationId}\``,
                inline: true
            },
            {
                name: '👤 Cerrado por',
                value: `<@${closedBy}>`,
                inline: true
            }
        )
        .setTimestamp(new Date());

    // Agregar valor monetario si está disponible
    if (monetaryValue !== null) {
        embed.addFields({
            name: '💰 Valor Monetario',
            value: `**$${monetaryValue.toFixed(2)}**`,
            inline: true
        });
    }

    embed.setFooter({ 
        text: 'BDX Traders • Sistema Profesional de Trading'
    });

    return embed;
}

/**
 * Crea un embed de error genérico
 * @param {string} title - Título del error
 * @param {string} description - Descripción del error
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setColor(config.colors.error)
        .setTimestamp(new Date());
}

/**
 * Crea un embed de éxito genérico
 * @param {string} title - Título del éxito
 * @param {string} description - Descripción del éxito
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setColor(config.colors.success)
        .setTimestamp(new Date());
}

/**
 * Crea un embed de información genérico
 * @param {string} title - Título de la información
 * @param {string} description - Descripción de la información
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createInfoEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .setColor(config.colors.info)
        .setTimestamp(new Date());
}

/**
 * Crea un embed con lista de operaciones activas
 * @param {Array} operations - Lista de operaciones activas
 * @returns {EmbedBuilder} - Embed formateado
 */
export function createActiveOperationsEmbed(operations) {
    const embed = new EmbedBuilder()
        .setTitle('📊 Operaciones Activas')
        .setColor(config.colors.info)
        .setTimestamp(new Date());

    if (operations.length === 0) {
        embed.setDescription('No hay operaciones activas en este momento.');
        return embed;
    }

    operations.forEach(operation => {
        const statusEmoji = operation.status === 'BE' ? '⚖️' : 
                           operation.status.startsWith('TP') ? '🎯' : '📊';
        
        embed.addFields({
            name: `${statusEmoji} ${operation.asset} - ${operation.order_type}`,
            value: `**Estado:** ${operation.status}\n**Entrada:** ${operation.entry_price}\n**TP:** ${operation.take_profit || 'N/A'}\n**SL:** ${operation.stop_loss || 'N/A'}\n**ID:** \`${operation.operation_id}\``,
            inline: true
        });
    });

    embed.setFooter({ text: `Total: ${operations.length} operaciones activas` });
    
    return embed;
}
