import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { database } from '../database/database.js';
import { createTradeEntryEmbed, createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
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

// Mapa para almacenar el estado de la interacción por usuario
const interactionState = new Map();

const data = new SlashCommandBuilder()
    .setName('entry')
    .setDescription('Crear una nueva operación de trading (Sistema Interactivo)');

const permissions = ['ADMINISTRATOR'];

async function execute(interaction) {
    try {
        // Iniciar el proceso interactivo con la selección de activo
        const assetRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('asset_us30')
                    .setLabel('🇺🇸 US30')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('asset_mnq')
                    .setLabel('📈 MNQ')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('asset_mgc')
                    .setLabel('🥇 MGC')
                    .setStyle(ButtonStyle.Primary)
            );

        const embed = {
            title: '🎯 Crear Nueva Operación',
            description: '**Paso 1/3:** Selecciona el activo que quieres operar',
            color: config.colors.info,
            footer: {
                text: 'BDX Traders'
            },
            timestamp: new Date()
        };

        await interaction.reply({ 
            embeds: [embed], 
            components: [assetRow],
            ephemeral: true // Solo el usuario ve esto
        });

        logger.info(`Sistema interactivo iniciado por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en comando entry interactivo:', error);
        const errorEmbed = createErrorEmbed('Error', 'Hubo un error al iniciar el proceso de entrada. Por favor, inténtalo de nuevo.');
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

// Manejar interacciones de botones para entry
async function handleButtonInteraction(interaction) {
    try {
        const customId = interaction.customId;
        
        if (customId.startsWith('asset_')) {
            // Paso 1: Activo seleccionado
            const asset = customId.replace('asset_', '').toUpperCase();
            
            if (!isValidAsset(asset)) {
                await interaction.update({
                    content: '❌ Error: Activo no válido.',
                    components: []
                });
                return;
            }
            
            // Guardar estado
            interactionState.set(interaction.user.id, { asset });
            
            // Crear botones para tipo de orden
            const typeRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('type_BUY')
                        .setLabel('🟢 BUY (Compra)')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('type_SELL')
                        .setLabel('🔴 SELL (Venta)')
                        .setStyle(ButtonStyle.Danger)
                );

            const assetInfo = getAssetInfo(asset);
            const embed = {
                title: `🎯 ${assetInfo?.name || asset} - Seleccionar Tipo`,
                description: `**Paso 2/3:** Selecciona el tipo de operación para ${asset}`,
                color: assetInfo?.color || config.colors.info,
                footer: {
                    text: `Activo: ${asset} | Sistema Interactivo`
                },
                timestamp: new Date()
            };

            await interaction.update({ 
                embeds: [embed], 
                components: [typeRow] 
            });

            logger.info(`Usuario ${interaction.user.tag} seleccionó activo: ${asset}`);

        } else if (customId.startsWith('type_')) {
            // Paso 2: Tipo seleccionado
            const orderType = customId.replace('type_', '');
            const userState = interactionState.get(interaction.user.id);
            
            if (!userState || !userState.asset) {
                await interaction.update({
                    content: '❌ Error: No se encontró el activo seleccionado. Por favor, inicia el proceso nuevamente con `/entry`.',
                    components: []
                });
                return;
            }
            
            if (!isValidOrderType(orderType)) {
                await interaction.update({
                    content: '❌ Error: Tipo de orden no válido.',
                    components: []
                });
                return;
            }
            
            // Actualizar estado
            userState.orderType = orderType;
            interactionState.set(interaction.user.id, userState);
            
            // Crear modal para detalles de la operación
            const modal = new ModalBuilder()
                .setCustomId('trade_modal')
                .setTitle(`Operación ${userState.asset} ${orderType}`);

            // Precio de entrada
            const entryPriceInput = new TextInputBuilder()
                .setCustomId('entry_price')
                .setLabel('💰 Precio de Entrada')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ejemplo: 35100.50')
                .setRequired(true)
                .setMaxLength(20);

            // Take Profit 1
            const takeProfit1Input = new TextInputBuilder()
                .setCustomId('take_profit_1')
                .setLabel('🎯 Take Profit 1 (Opcional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ejemplo: 35150.00')
                .setRequired(false)
                .setMaxLength(20);

            // Take Profit 2
            const takeProfit2Input = new TextInputBuilder()
                .setCustomId('take_profit_2')
                .setLabel('🎯 Take Profit 2 (Opcional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ejemplo: 35200.00')
                .setRequired(false)
                .setMaxLength(20);

            // Stop Loss
            const stopLossInput = new TextInputBuilder()
                .setCustomId('stop_loss')
                .setLabel('🛡️ Stop Loss (Opcional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ejemplo: 35000.00')
                .setRequired(false)
                .setMaxLength(20);

            // Notas
            const notesInput = new TextInputBuilder()
                .setCustomId('notes')
                .setLabel('💬 Notas Importantes (Opcional)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Escribe aquí cualquier mensaje importante para la comunidad...')
                .setRequired(false)
                .setMaxLength(500);

            // Agregar componentes al modal
            const firstActionRow = new ActionRowBuilder().addComponents(entryPriceInput);
            const secondActionRow = new ActionRowBuilder().addComponents(takeProfit1Input);
            const thirdActionRow = new ActionRowBuilder().addComponents(takeProfit2Input);
            const fourthActionRow = new ActionRowBuilder().addComponents(stopLossInput);
            const fifthActionRow = new ActionRowBuilder().addComponents(notesInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

            // Mostrar modal
            await interaction.showModal(modal);

            logger.info(`Usuario ${interaction.user.tag} seleccionó tipo: ${orderType} para ${userState.asset}`);

        }
    } catch (error) {
        logger.error('Error en handleButtonInteraction (entry):', error);
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '❌ Hubo un error procesando tu selección. Por favor, inténtalo de nuevo.',
                    ephemeral: true
                });
            } else {
                await interaction.update({
                    content: '❌ Hubo un error procesando tu selección. Por favor, inténtalo de nuevo.',
                    components: []
                });
            }
        } catch (replyError) {
            logger.error('Error al responder en handleButtonInteraction (entry):', replyError);
        }
    }
}

// Manejar modal submit para entry
async function handleModalSubmit(interaction) {
    try {
        if (interaction.customId !== 'trade_modal') return;
        
        const userState = interactionState.get(interaction.user.id);
        
        if (!userState || !userState.asset || !userState.orderType) {
            await interaction.reply({
                content: '❌ Error: No se encontró la información de la operación. Por favor, inicia el proceso nuevamente con `/entry`.',
                ephemeral: true
            });
            return;
        }

        // Obtener valores del modal
        const entryPrice = parseFloat(interaction.fields.getTextInputValue('entry_price'));
        const takeProfit1 = interaction.fields.getTextInputValue('take_profit_1') ? 
            parseFloat(interaction.fields.getTextInputValue('take_profit_1')) : null;
        const takeProfit2 = interaction.fields.getTextInputValue('take_profit_2') ? 
            parseFloat(interaction.fields.getTextInputValue('take_profit_2')) : null;
        const stopLoss = interaction.fields.getTextInputValue('stop_loss') ? 
            parseFloat(interaction.fields.getTextInputValue('stop_loss')) : null;
        const notes = sanitizeText(interaction.fields.getTextInputValue('notes') || '');

        // Validaciones
        if (!isValidPrice(entryPrice)) {
            await interaction.reply({
                content: '❌ Error: El precio de entrada no es válido.',
                ephemeral: true
            });
            return;
        }

        if (takeProfit1 && !isValidPrice(takeProfit1)) {
            await interaction.reply({
                content: '❌ Error: El precio de Take Profit 1 no es válido.',
                ephemeral: true
            });
            return;
        }

        if (takeProfit2 && !isValidPrice(takeProfit2)) {
            await interaction.reply({
                content: '❌ Error: El precio de Take Profit 2 no es válido.',
                ephemeral: true
            });
            return;
        }

        if (stopLoss && !isValidPrice(stopLoss)) {
            await interaction.reply({
                content: '❌ Error: El precio de stop loss no es válido.',
                ephemeral: true
            });
            return;
        }

        // Generar ID de operación
        const operationId = generateOperationId(userState.asset, userState.orderType);

        // Crear objeto de operación
        const operationData = {
            operationId,
            asset: userState.asset,
            orderType: userState.orderType,
            entryPrice,
            takeProfit1,
            takeProfit2,
            stopLoss,
            notes,
            status: 'OPEN',
            createdBy: interaction.user.id
        };

        // Guardar en la base de datos
        const savedOperation = await database.createOperation(operationData);
        
        if (!savedOperation) {
            await interaction.reply({
                content: '❌ Error: No se pudo guardar la operación.',
                ephemeral: true
            });
            return;
        }

        // Crear embed de la operación
        const embed = createTradeEntryEmbed(operationData);

        // Limpiar estado del usuario
        interactionState.delete(interaction.user.id);

        // Primero confirmar privadamente
        await interaction.reply({
            content: '✅ **Operación creada exitosamente!** Se está publicando al canal...',
            ephemeral: true
        });

        // Luego enviar al canal público
        await interaction.followUp({ 
            embeds: [embed]
        });

        // Log de la operación
        logTradingOperation('CREATE', operationData, interaction.user);

        logger.info(`Operación creada exitosamente: ${operationId} por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en handleModalSubmit (entry):', error);
        
        try {
            await interaction.reply({
                content: '❌ Hubo un error creando la operación. Por favor, inténtalo de nuevo.',
                ephemeral: true
            });
        } catch (replyError) {
            logger.error('Error al responder en handleModalSubmit (entry):', replyError);
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