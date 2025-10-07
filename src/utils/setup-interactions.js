import { 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder,
    EmbedBuilder,
    Colors
} from 'discord.js';
import { logger } from '../utils/logger.js';
import { database } from '../database/database.js';

export async function handleSetupButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    try {
        await interaction.deferUpdate();
        
        switch (customId) {
            case 'setup_verify':
                await handleVerifyButton(interaction);
                break;
            case 'setup_permissions':
                await handlePermissionsButton(interaction);
                break;
            case 'setup_status':
                await handleStatusButton(interaction);
                break;
            case 'reset_confirm':
                await handleResetConfirm(interaction);
                break;
            case 'reset_cancel':
                await handleResetCancel(interaction);
                break;
            default:
                await interaction.editReply({
                    content: '❌ Interacción no reconocida.'
                });
        }
    } catch (error) {
        logger.error('Error en handleSetupButtonInteraction:', error);
        try {
            await interaction.editReply({
                content: '❌ Hubo un error procesando tu solicitud.'
            });
        } catch (replyError) {
            logger.error('Error editando respuesta:', replyError);
        }
    }
}

async function handleVerifyButton(interaction) {
    const guild = interaction.guild;
    const serverConfig = await database.getServerConfig(guild.id);
    
    const verificationResults = {
        database: !!serverConfig,
        roles: await verifyRoles(guild),
        channels: await verifyChannels(guild),
        permissions: await verifyPermissions(guild),
        webhook: await verifyWebhook(guild)
    };

    const allGood = Object.values(verificationResults).every(result => result === true);

    const verificationEmbed = new EmbedBuilder()
        .setTitle('✅ Verificación del Sistema')
        .setDescription(allGood ? 
            '🎉 Todo está configurado correctamente' : 
            '⚠️ Se encontraron algunos problemas'
        )
        .setColor(allGood ? Colors.Green : Colors.Orange)
        .addFields(
            { name: 'Base de Datos', value: verificationResults.database ? '✅' : '❌', inline: true },
            { name: 'Roles', value: verificationResults.roles ? '✅' : '❌', inline: true },
            { name: 'Canales', value: verificationResults.channels ? '✅' : '❌', inline: true },
            { name: 'Permisos', value: verificationResults.permissions ? '✅' : '❌', inline: true },
            { name: 'Webhook', value: verificationResults.webhook ? '✅' : '❌', inline: true }
        )
        .setTimestamp();

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setup_verify')
                .setLabel('🔄 Verificar Nuevamente')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('setup_status')
                .setLabel('📊 Estado Detallado')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [verificationEmbed], 
        components: [actionRow] 
    });
}

async function handlePermissionsButton(interaction) {
    const guild = interaction.guild;
    const requiredPermissions = [
        'ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles',
        'UseExternalEmojis', 'ManageRoles', 'ManageChannels',
        'ReadMessageHistory', 'AddReactions'
    ];

    const botMember = guild.members.cache.get(interaction.client.user.id);
    const botPermissions = botMember?.permissions.toArray() || [];
    
    const missingPermissions = requiredPermissions.filter(perm => !botPermissions.includes(perm));
    const hasAllPermissions = missingPermissions.length === 0;

    const statusEmbed = new EmbedBuilder()
        .setTitle('🔐 Verificación de Permisos')
        .setDescription(hasAllPermissions ? 
            '✅ El bot tiene todos los permisos necesarios' : 
            '❌ El bot no tiene todos los permisos necesarios'
        )
        .setColor(hasAllPermissions ? Colors.Green : Colors.Red)
        .addFields(
            {
                name: 'Permisos Requeridos',
                value: requiredPermissions.map(perm => 
                    botPermissions.includes(perm) ? `✅ ${perm}` : `❌ ${perm}`
                ).join('\n'),
                inline: false
            }
        )
        .setTimestamp();

    if (missingPermissions.length > 0) {
        statusEmbed.addFields({
            name: 'Permisos Faltantes',
            value: missingPermissions.join(', '),
            inline: false
        });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setup_permissions')
                .setLabel('🔄 Verificar Permisos')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('setup_verify')
                .setLabel('🔍 Verificación Completa')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [statusEmbed], 
        components: [actionRow] 
    });
}

async function handleStatusButton(interaction) {
    const guild = interaction.guild;
    const serverConfig = await database.getServerConfig(guild.id);
    
    const statusEmbed = new EmbedBuilder()
        .setTitle('📊 Estado Detallado del Servidor')
        .setDescription(`**Servidor:** ${guild.name}\n**ID:** ${guild.id}`)
        .setColor(Colors.Blue)
        .addFields(
            {
                name: 'Configuración',
                value: serverConfig ? '✅ Guardada en base de datos' : '❌ No configurado',
                inline: true
            },
            {
                name: 'Miembros',
                value: guild.memberCount.toString(),
                inline: true
            },
            {
                name: 'Canales',
                value: guild.channels.cache.size.toString(),
                inline: true
            },
            {
                name: 'Roles',
                value: guild.roles.cache.size.toString(),
                inline: true
            },
            {
                name: 'Bot Online',
                value: interaction.client.user.presence?.status === 'online' ? '✅' : '❌',
                inline: true
            },
            {
                name: 'Ping',
                value: `${interaction.client.ws.ping}ms`,
                inline: true
            }
        )
        .setTimestamp();

    if (serverConfig) {
        statusEmbed.addFields({
            name: 'Última Verificación',
            value: new Date(serverConfig.last_verified).toLocaleString(),
            inline: false
        });

        if (serverConfig.trading_channel_id) {
            const tradingChannel = guild.channels.cache.get(serverConfig.trading_channel_id);
            statusEmbed.addFields({
                name: 'Canal de Trading',
                value: tradingChannel ? `✅ ${tradingChannel.name}` : '❌ No encontrado',
                inline: true
            });
        }

        if (serverConfig.logs_channel_id) {
            const logsChannel = guild.channels.cache.get(serverConfig.logs_channel_id);
            statusEmbed.addFields({
                name: 'Canal de Logs',
                value: logsChannel ? `✅ ${logsChannel.name}` : '❌ No encontrado',
                inline: true
            });
        }
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setup_status')
                .setLabel('🔄 Actualizar Estado')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('setup_verify')
                .setLabel('🔍 Verificación Completa')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [statusEmbed], 
        components: [actionRow] 
    });
}

async function handleResetConfirm(interaction) {
    const guild = interaction.guild;
    
    try {
        // Eliminar configuración de la base de datos
        await database.run('DELETE FROM server_config WHERE guild_id = ?', [guild.id]);
        
        const resetEmbed = new EmbedBuilder()
            .setTitle('🔄 Configuración Reseteada')
            .setDescription('La configuración del servidor ha sido eliminada de la base de datos.')
            .setColor(Colors.Orange)
            .setTimestamp();

        await interaction.editReply({ 
            embeds: [resetEmbed],
            components: []
        });

        logger.info(`Configuración reseteada para servidor ${guild.name} por ${interaction.user.tag}`);
    } catch (error) {
        logger.error('Error reseteando configuración:', error);
        await interaction.editReply({
            content: '❌ Error al resetear la configuración.'
        });
    }
}

async function handleResetCancel(interaction) {
    const cancelEmbed = new EmbedBuilder()
        .setTitle('❌ Reset Cancelado')
        .setDescription('La operación de reset ha sido cancelada.')
        .setColor(Colors.Gray)
        .setTimestamp();

    await interaction.editReply({ 
        embeds: [cancelEmbed],
        components: []
    });
}

// Funciones auxiliares para verificación
async function verifyRoles(guild) {
    const requiredRoles = [
        'Vitaly Signals Bot',
        'Signal Provider', 
        'Trading Assistant',
        'Market Analyst',
        'Trading Member'
    ];
    
    return requiredRoles.every(roleName => 
        guild.roles.cache.some(role => role.name === roleName)
    );
}

async function verifyChannels(guild) {
    const requiredChannels = [
        'vitaly-signals',
        'trading-logs',
        'trading-announcements'
    ];
    
    return requiredChannels.every(channelName => 
        guild.channels.cache.some(channel => channel.name === channelName)
    );
}

async function verifyPermissions(guild) {
    const botMember = guild.members.cache.get(guild.client.user.id);
    const requiredPermissions = ['ViewChannel', 'SendMessages', 'EmbedLinks', 'ManageRoles', 'ManageChannels'];
    const botPermissions = botMember?.permissions.toArray() || [];
    return requiredPermissions.every(perm => botPermissions.includes(perm));
}

async function verifyWebhook(guild) {
    const channel = guild.channels.cache.find(c => c.name === 'vitaly-signals');
    if (!channel) return false;
    
    try {
        const webhooks = await channel.fetchWebhooks();
        return webhooks.size > 0;
    } catch (error) {
        return false;
    }
}