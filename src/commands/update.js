import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { database } from '../database/database.js';
import { createTradeUpdateEmbed, createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { 
    generateOperationId, 
    isValidAsset, 
    isValidOrderType, 
    isValidPrice,
    sanitizeText,
    formatPrice 
} from '../utils/helpers.js';
import { formatPriceForAsset, getAssetInfo } from '../config/microFutures.js';
import { config } from '../config/config.js';
import { logTradingOperation, logTradingError, logger } from '../utils/logger.js';

const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Actualizar estado de una operación (Sistema Interactivo)');

const permissions = ['ADMINISTRATOR'];

// Store para mantener el estado de las interacciones
const updateInteractionState = new Map();

// Sistema de locks por usuario para prevenir conflictos
const updateUserLocks = new Map();

// Mapa para almacenar timeouts de limpieza por usuario
const updateUserTimeouts = new Map();

// Función para limpiar el estado de un usuario
function cleanupUpdateUserState(userId) {
    updateUserLocks.delete(userId);
    updateInteractionState.delete(userId);
    updateUserTimeouts.delete(userId);
    logger.info(`Estado de actualización limpiado para usuario ${userId}`);
}

// Función para resetear el timeout de un usuario
function resetUpdateUserTimeout(userId) {
    // Limpiar timeout anterior si existe
    if (updateUserTimeouts.has(userId)) {
        clearTimeout(updateUserTimeouts.get(userId));
    }
    
    // Establecer nuevo timeout de 5 minutos (300000ms)
    const timeoutId = setTimeout(() => {
        cleanupUpdateUserState(userId);
    }, 300000); // 5 minutos en lugar de 30 segundos
    
    updateUserTimeouts.set(userId, timeoutId);
}

// Función para generar mensajes específicos por estado
function getStatusMessage(status, operation) {
    const assetInfo = getAssetInfo(operation.asset);
    const assetName = assetInfo?.name || operation.asset || 'Activo';
    const assetEmoji = assetInfo?.emoji || '📊';
    
    switch (status) {
        case 'BE':
            return {
                title: `🔄 ${assetEmoji} ${assetName} - Operación nos sacó en BE`,
                description: `**Operación nos sacó en Break Even**\n\n🔄 **Esperamos si el mercado nos da otra oportunidad**\n\n*La operación salió en break even, sin pérdidas ni ganancias.*`,
                color: config.colors.warning
            };
            
        case 'TP1':
            return {
                title: `🎯 ${assetEmoji} ${assetName} - Primer Objetivo Alcanzado`,
                description: `**Movemos el SL al precio de entrada (Break Even)**\n\n✅ **Posición asegurada** - Ya no podemos perder dinero\n🎯 **Tomamos parciales** (opcional para cada persona)\n\n*Primer nivel de Take Profit ejecutado exitosamente.*`,
                color: config.colors.success
            };
            
        case 'TP2':
            return {
                title: `🎯 ${assetEmoji} ${assetName} - Operación Completada`,
                description: `**Cerramos la operación - Trade con éxito**\n\n✅ **Objetivo principal alcanzado**\n💰 **Operación exitosa**\n\n*Segundo nivel de Take Profit ejecutado. Operación cerrada.*`,
                color: config.colors.success
            };
            
        case 'TP3':
            return {
                title: `🎯 ${assetEmoji} ${assetName} - Objetivo Extra Alcanzado`,
                description: `**Objetivo adicional completado**\n\n✅ **Máximo beneficio obtenido**\n💰 **Operación extraordinaria**\n\n*Tercer nivel de Take Profit ejecutado. Máxima ganancia.*`,
                color: config.colors.success
            };
            
        case 'STOPPED':
            return {
                title: `🛡️ ${assetEmoji} ${assetName} - El mercado nos sacó en pérdidas`,
                description: `**El mercado nos sacó en pérdidas**\n\n⏳ **Esperaré si veo alguna otra entrada o todo por hoy**\n\n*El stop loss fue ejecutado. Protegimos el capital.*`,
                color: config.colors.error
            };
            
        default:
            return {
                title: `📝 ${assetEmoji} ${assetName} - Actualización`,
                description: `**Actualización de operación**\n\n📊 **Estado modificado**\n\n*La operación ha sido actualizada.*`,
                color: config.colors.info
            };
    }
}

async function execute(interaction) {
    const userId = interaction.user.id;
    
    // Deferir respuesta INMEDIATAMENTE - SIN NINGUNA VERIFICACIÓN PREVIA
    try {
        await interaction.deferReply({ flags: 64 });
    } catch (error) {
        if (error.code === 10062) {
            logger.warn(`Interacción expirada para usuario ${interaction.user.tag} antes de poder responder`);
            return;
        }
        throw error;
    }
    
    // AHORA verificar si el usuario ya tiene un lock activo
    if (updateUserLocks.has(userId)) {
        logger.warn(`Usuario ${interaction.user.tag} intentó ejecutar /update mientras ya está en proceso`);
        try {
            await interaction.editReply({ content: '⏳ Ya tienes una actualización en proceso. Espera a que termine.' });
        } catch (error) {
            logger.error('Error editando respuesta de usuario bloqueado:', error);
        }
        return;
    }
    
    // Crear lock para el usuario
    updateUserLocks.set(userId, Date.now());
    
    try {
        
        logger.info(`Comando /update ejecutado por ${interaction.user.tag}`);
        
        // Debug: Verificar estado de la base de datos
        logger.info('=== INICIANDO DEBUG UPDATE ===');
        try {
            await database.debugDatabase();
            await database.debugOpenOperations();
        } catch (debugError) {
            logger.error('Error en debugging:', debugError);
        }
        logger.info('=== FIN DEBUG UPDATE ===');
        
        // Obtener operaciones abiertas
        logger.info('Obteniendo operaciones activas...');
        const openOperations = await database.getActiveOperations();
        logger.info(`Resultado de getActiveOperations: ${openOperations ? openOperations.length : 'null/undefined'}`);
        
        if (!openOperations || openOperations.length === 0) {
            logger.warn(`No se encontraron operaciones activas para usuario ${interaction.user.tag}`);
            const embed = createErrorEmbed('Sin Operaciones', 'No hay operaciones abiertas para actualizar.');
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        // Crear botones para las operaciones (máximo 5 por fila)
        const operationRows = [];
        const operationsToShow = openOperations.slice(0, 10); // Mostrar hasta 10 operaciones
        
        // Dividir en filas de 5 botones cada una
        for (let i = 0; i < operationsToShow.length; i += 5) {
            const row = new ActionRowBuilder();
            const rowOperations = operationsToShow.slice(i, i + 5);
            
            for (const operation of rowOperations) {
                const assetInfo = getAssetInfo(operation.asset);
                const emoji = assetInfo?.emoji || '📊';
                const button = new ButtonBuilder()
                    .setCustomId(`update_op_${operation.operation_id}`)
                    .setLabel(`${emoji} ${operation.asset}`)
                    .setStyle(operation.order_type === 'BUY' ? ButtonStyle.Success : ButtonStyle.Danger);
                
                row.addComponents(button);
            }
            
            operationRows.push(row);
        }

        const embed = {
            title: '🔄 Actualizar Operación',
            description: `**Paso 1/2:** Selecciona la operación que quieres actualizar\n\n📊 **Operaciones disponibles:** ${openOperations.length}`,
            color: config.colors.warning,
            fields: operationsToShow.map(op => {
                const assetInfo = getAssetInfo(op.asset);
                const emoji = assetInfo?.emoji || '📊';
                const typeEmoji = op.order_type === 'BUY' ? '🟢' : '🔴';
                
                return {
                    name: `${emoji} ${op.asset} ${typeEmoji} ${op.order_type}`,
                    value: `**ID:** \`${op.operation_id ? op.operation_id.substring(0, 12) + '...' : 'N/A'}\`\n**Precio:** ${formatPriceForAsset(op.asset, op.entry_price)}\n**Estado:** ${op.status}`,
                    inline: true
                };
            }),
            footer: {
                text: `Sistema Interactivo - ${operationsToShow.length} de ${openOperations.length} operaciones mostradas`
            },
            timestamp: new Date()
        };

        await interaction.editReply({ 
            embeds: [embed], 
            components: operationRows
        });

        logger.info(`Sistema de actualización iniciado por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en comando update interactivo:', error);
        
        try {
            const embed = createErrorEmbed('Error', 'Hubo un error al iniciar el sistema de actualización. Por favor, inténtalo de nuevo.');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], flags: 64 }); // 64 = EPHEMERAL
            } else {
                await interaction.reply({ embeds: [embed], flags: 64 }); // 64 = EPHEMERAL
            }
        } catch (replyError) {
            logger.error('Error al responder en update interactivo:', replyError);
            // NO intentar responder aquí para evitar doble respuesta
        }
    } finally {
        // Establecer timeout de limpieza de 5 minutos
        resetUpdateUserTimeout(userId);
    }
}

// Manejar interacciones de botones para update
async function handleButtonInteraction(interaction) {
    // Verificar si la interacción ya fue respondida
    if (interaction.replied || interaction.deferred) {
        logger.warn(`Interacción de botón ya fue respondida para usuario ${interaction.user.tag}`);
        return;
    }
    
    // Verificar si la interacción es muy antigua (más de 10 minutos)
    const interactionAge = Date.now() - interaction.createdTimestamp;
    if (interactionAge > 600000) { // 10 minutos
        logger.warn(`Interacción muy antigua para usuario ${interaction.user.tag} (${Math.round(interactionAge / 1000)}s)`);
        try {
            await interaction.reply({ 
                content: '⏰ **Interacción muy antigua**: Esta interacción es muy antigua.\n\n🔄 **Para continuar**: Usa `/update` para iniciar un nuevo proceso.',
                flags: 64 
            });
        } catch (error) {
            if (error.code === 10062) {
                logger.warn(`Interacción expirada para usuario ${interaction.user.tag} (muy antigua)`);
                return;
            }
            logger.error('Error respondiendo a interacción antigua:', error);
        }
        return;
    }
    
    // Deferir respuesta INMEDIATAMENTE para evitar timeout
    try {
        await interaction.deferUpdate();
    } catch (error) {
        if (error.code === 10062) {
            logger.warn(`Interacción de botón expirada para usuario ${interaction.user.tag}`);
            return;
        }
        if (error.code === 40060) {
            logger.warn(`Interacción de botón ya fue reconocida para usuario ${interaction.user.tag}`);
            return;
        }
        // Para otros errores, no hacer nada para evitar más errores
        logger.error('Error en deferUpdate (update):', error);
        return;
    }
    
    try {
        const customId = interaction.customId;
        
        if (customId.startsWith('update_op_')) {
            // Paso 1: Operación seleccionada
            const operationId = customId.replace('update_op_', '');
            
            // Obtener la operación
            const operation = await database.getOperation(operationId);
            
            if (!operation) {
                await interaction.editReply({
                    content: '❌ Error: No se encontró la operación seleccionada.',
                    components: []
                });
                return;
            }
            
            // Guardar estado y resetear timeout
            updateInteractionState.set(interaction.user.id, { operationId, operation });
            resetUpdateUserTimeout(interaction.user.id);
            
            // Crear botones para estados
            const statusRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('status_be')
                        .setLabel('🔄 BE (Break Even)')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('status_tp1')
                        .setLabel('🎯 TP1')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('status_tp2')
                        .setLabel('🎯 TP2')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('status_tp3')
                        .setLabel('🎯 TP3')
                        .setStyle(ButtonStyle.Success)
                );

            // Segunda fila para SL y Notas
            const slRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('status_stopped')
                        .setLabel('🛡️ SL (Stop Loss)')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('status_notes')
                        .setLabel('📢 Mensaje Importante')
                        .setStyle(ButtonStyle.Primary)
                );

            const assetInfo = getAssetInfo(operation.asset);
            const embed = {
                title: `🔄 Actualizar ${operation.asset} ${operation.order_type}`,
                description: `**Paso 2/2:** Selecciona el nuevo estado para la operación\n\n**Operación:** \`${operationId}\``,
                color: assetInfo?.color || config.colors.warning,
                fields: [
                    {
                        name: '📊 Estado Actual',
                        value: `**${operation.status}**`,
                        inline: true
                    },
                    {
                        name: '💰 Precio Entrada',
                        value: `**${formatPriceForAsset(operation.asset, operation.entry_price)}**`,
                        inline: true
                    }
                ],
                footer: {
                    text: `Operación: ${operationId} | Sistema Interactivo`
                },
                timestamp: new Date()
            };

            await interaction.editReply({ 
                embeds: [embed], 
                components: [statusRow, slRow] 
            });

            logger.info(`Usuario ${interaction.user.tag} seleccionó operación: ${operationId}`);

        } else if (customId.startsWith('status_')) {
            
            // Paso 2: Estado seleccionado
            const newStatus = customId.replace('status_', '').toUpperCase();
            const userState = updateInteractionState.get(interaction.user.id);
            
            if (!userState || !userState.operationId) {
                // Limpiar cualquier estado residual
                cleanupUpdateUserState(interaction.user.id);
                
                await interaction.editReply({
                    content: '❌ **Sesión expirada**: No se encontró la operación seleccionada. La sesión puede haber expirado.\n\n🔄 **Solución**: Inicia el proceso nuevamente con `/update`.',
                    components: []
                });
                return;
            }

            // Resetear timeout ya que el usuario está progresando
            resetUpdateUserTimeout(interaction.user.id);
            
            // Manejar botón de notas personalizadas
            if (newStatus === 'NOTES') {
                // Crear modal para notas personalizadas
                const modal = new ModalBuilder()
                    .setCustomId('update_notes_modal')
                    .setTitle('📢 Mensaje Importante');

                const notesInput = new TextInputBuilder()
                    .setCustomId('custom_notes')
                    .setLabel('💬 Escribe tu mensaje importante')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Escribe aquí el mensaje que quieres enviar a la comunidad...')
                    .setRequired(true)
                    .setMaxLength(1000);

                const actionRow = new ActionRowBuilder().addComponents(notesInput);
                modal.addComponents(actionRow);

                await interaction.showModal(modal);
                return;
            }
            
            // Actualizar la operación
            const updatedOperation = await database.updateOperation(userState.operationId, { status: newStatus });
            
            if (!updatedOperation) {
                await interaction.editReply({
                    content: '❌ Error: No se pudo actualizar la operación.',
                    components: []
                });
                return;
            }
            
            // Crear embed personalizado con mensaje específico
            const statusMessage = getStatusMessage(newStatus, updatedOperation);
            const embed = {
                title: statusMessage.title,
                description: statusMessage.description,
                color: statusMessage.color,
                timestamp: new Date(),
                footer: {
                    text: 'BDX Traders'
                }
            };
            
            // Limpiar estado del usuario
            cleanupUpdateUserState(interaction.user.id);
            
                   // Primero confirmar privadamente
                   await interaction.editReply({
                       content: '✅ **Operación actualizada exitosamente!** Se está publicando al canal...',
                       components: []
                   });

            // Luego enviar al canal público
            await interaction.followUp({ 
                embeds: [embed]
            });

            // Log de la operación
            logTradingOperation('UPDATE', updatedOperation, interaction.user);

            logger.info(`Operación actualizada exitosamente: ${userState.operationId} a ${newStatus} por ${interaction.user.tag}`);

        }
    } catch (error) {
        logger.error('Error en handleButtonInteraction (update):', error);
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '❌ Hubo un error procesando tu selección. Por favor, inténtalo de nuevo.',
                    flags: 64 // 64 = EPHEMERAL
                });
            } else {
                await interaction.editReply({
                    content: '❌ Hubo un error procesando tu selección. Por favor, inténtalo de nuevo.',
                    components: []
                });
            }
        } catch (replyError) {
            logger.error('Error al responder en handleButtonInteraction (update):', replyError);
            // NO intentar responder aquí para evitar doble respuesta
        }
    }
}

// Manejar modal para notas personalizadas
async function handleModalSubmit(interaction) {
    try {
        if (interaction.customId !== 'update_notes_modal') return;
        
        // Verificar si la interacción ya fue respondida
        if (interaction.replied || interaction.deferred) {
            logger.warn(`Interacción ya fue respondida para usuario ${interaction.user.tag}`);
            return;
        }
        
        // Deferir respuesta para modal con timeout
        try {
            await interaction.deferReply({ flags: 64 });
        } catch (error) {
            if (error.code === 10062) {
                logger.warn(`Interacción expirada para usuario ${interaction.user.tag}`);
                return;
            }
            throw error;
        }
        
        const userState = updateInteractionState.get(interaction.user.id);
        
        // Resetear timeout ya que el usuario está progresando
        if (userState) {
            resetUpdateUserTimeout(interaction.user.id);
        }
        
        if (!userState || !userState.operationId) {
            // Limpiar cualquier estado residual
            cleanupUpdateUserState(interaction.user.id);
            
            await interaction.editReply({
                content: '❌ **Sesión expirada**: No se encontró la operación seleccionada. La sesión puede haber expirado.\n\n🔄 **Solución**: Inicia el proceso nuevamente con `/update`.'
            });
            return;
        }

        // Obtener las notas personalizadas
        const customNotes = interaction.fields.getTextInputValue('custom_notes');
        
        if (!customNotes || customNotes.trim().length === 0) {
            await interaction.editReply({
                content: '❌ Error: Debes escribir un mensaje personalizado.'
            });
            return;
        }

        // Actualizar la operación con las notas personalizadas
        const updatedOperation = await database.updateOperation(userState.operationId, { 
            notes: customNotes.trim() 
        });
        
        if (!updatedOperation) {
            await interaction.editReply({
                content: '❌ Error: No se pudo actualizar la operación.'
            });
            return;
        }

        // Crear embed personalizado para las notas
        const assetInfo = getAssetInfo(updatedOperation.asset);
        const assetName = assetInfo?.name || updatedOperation.asset;
        const assetEmoji = assetInfo?.emoji || '📊';
        
        const embed = {
            title: `📢 ${assetEmoji} ${assetName} - Mensaje Importante`,
            description: `**${customNotes.trim()}**`,
            color: config.colors.warning,
            timestamp: new Date(),
            footer: {
                text: 'BDX Traders'
            }
        };
        
        // Limpiar estado del usuario
        cleanupUpdateUserState(interaction.user.id);
        
        // Primero confirmar privadamente
        await interaction.editReply({
            content: '✅ **Mensaje personalizado enviado exitosamente!**'
        });

        // Luego enviar al canal público
        await interaction.followUp({ 
            embeds: [embed]
        });

        // Log de la operación
        logTradingOperation('UPDATE_NOTES', updatedOperation, interaction.user);

        logger.info(`Notas personalizadas enviadas para operación: ${userState.operationId} por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en handleModalSubmit (update):', error);
        
        try {
            await interaction.editReply({
                content: '❌ Error: Hubo un problema al procesar las notas personalizadas.'
            });
        } catch (replyError) {
            logger.error('Error al responder en handleModalSubmit (update):', replyError);
        }
    }
}

export default { 
    data, 
    execute, 
    permissions,
    handleButtonInteraction,
    handleModalSubmit
};