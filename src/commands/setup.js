import { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder,
    EmbedBuilder,
    Colors
} from 'discord.js';
import { logger } from '../utils/logger.js';
import { database } from '../database/database.js';
import { config } from '../config/config.js';

const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🏛️ Sistema profesional de configuración de Vitaly Signals Bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
        subcommand
            .setName('full')
            .setDescription('🚀 Configuración completa automática del bot')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('roles')
            .setDescription('👥 Configurar roles del bot')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('channels')
            .setDescription('📺 Configurar canales del bot')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('permissions')
            .setDescription('🔐 Verificar permisos del bot')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('verify')
            .setDescription('✅ Verificar estado de la configuración')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('reset')
            .setDescription('🔄 Resetear configuración del bot')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('status')
            .setDescription('📊 Ver estado detallado del servidor')
    );

const permissions = ['ADMINISTRATOR'];

// Configuración de roles profesionales
const ROLES_CONFIG = [
    {
        name: 'Vitaly Signals Bot',
        color: 0x1abc9c,
        reason: 'Rol principal del bot Vitaly Signals',
        permissions: [
            'ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 
            'UseExternalEmojis', 'ManageMessages', 'ReadMessageHistory'
        ],
        position: 1
    },
    {
        name: 'Signal Provider',
        color: 0xe74c3c,
        reason: 'Rol para proveedores de señales',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
        position: 2
    },
    {
        name: 'Trading Assistant',
        color: 0x3498db,
        reason: 'Rol para asistentes de trading',
        permissions: ['ViewChannel', 'SendMessages'],
        position: 3
    },
    {
        name: 'Market Analyst',
        color: 0xf39c12,
        reason: 'Rol para analistas de mercados',
        permissions: ['ViewChannel', 'SendMessages'],
        position: 4
    },
    {
        name: 'Trading Member',
        color: 0x95a5a6,
        reason: 'Rol para miembros del trading',
        permissions: ['ViewChannel'],
        position: 5
    }
];

// Configuración de canales
const CHANNELS_CONFIG = [
    {
        name: 'vitaly-signals',
        type: ChannelType.GuildText,
        reason: 'Canal principal para señales de Vitaly',
        topic: '📈 Canal oficial de Vitaly Signals - Trading profesional y señales en tiempo real'
    },
    {
        name: 'trading-logs',
        type: ChannelType.GuildText,
        reason: 'Canal para logs y estadísticas',
        topic: '📊 Logs del sistema, estadísticas y reportes de trading'
    },
    {
        name: 'trading-announcements',
        type: ChannelType.GuildText,
        reason: 'Canal para anuncios importantes',
        topic: '📢 Anuncios importantes del sistema de trading'
    }
];

// Configuración de categoría
const CATEGORY_CONFIG = {
    name: '📈 VITALY SIGNALS',
    reason: 'Categoría principal para el sistema de trading',
    permissions: {
        'Vitaly Signals Bot': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
        'Signal Provider': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
        'Trading Assistant': ['ViewChannel', 'SendMessages'],
        'Market Analyst': ['ViewChannel', 'SendMessages'],
        'Trading Member': ['ViewChannel'],
        '@everyone': ['ViewChannel']
    }
};

async function execute(interaction) {
    try {
        await interaction.deferReply({ flags: 64 });
        logger.info(`Comando /setup ejecutado por ${interaction.user.tag}`);

        const guild = interaction.guild;
        if (!guild) {
            await interaction.editReply({
                content: '❌ Este comando solo puede usarse en un servidor.'
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'full':
                await handleFullSetup(interaction, guild);
                break;
            case 'roles':
                await handleRolesSetup(interaction, guild);
                break;
            case 'channels':
                await handleChannelsSetup(interaction, guild);
                break;
            case 'permissions':
                await handlePermissionsCheck(interaction, guild);
                break;
            case 'verify':
                await handleVerification(interaction, guild);
                break;
            case 'reset':
                await handleReset(interaction, guild);
                break;
            case 'status':
                await handleStatus(interaction, guild);
                break;
            default:
                await interaction.editReply({
                    content: '❌ Subcomando no reconocido.'
                });
        }

    } catch (error) {
        logger.error('Error en comando setup:', error);
        await interaction.editReply({
            content: '❌ Hubo un error durante la configuración. Por favor, verifica los permisos del bot.'
        });
    }
}

async function handleFullSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('🚀 Iniciando Configuración Completa')
        .setDescription('Configurando Vitaly Signals Bot...')
        .setColor(Colors.Blue)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    const results = {
        roles: { created: [], existing: [], errors: [] },
        channels: { created: [], existing: [], errors: [] },
        category: { created: false, existing: false, error: null },
        webhook: { created: false, error: null },
        database: false
    };

    // 1. Crear categoría
    try {
        const category = await createCategory(guild);
        if (category) {
            results.category.created = true;
            logger.info(`Categoría creada: ${category.name}`);
        }
    } catch (error) {
        results.category.error = error.message;
        logger.error('Error creando categoría:', error);
    }

    // 2. Crear roles
    for (const roleConfig of ROLES_CONFIG) {
        try {
            const role = await createRole(guild, roleConfig);
            if (role) {
                results.roles.created.push(role.name);
            } else {
                results.roles.existing.push(roleConfig.name);
            }
        } catch (error) {
            results.roles.errors.push(`${roleConfig.name}: ${error.message}`);
            logger.error(`Error creando rol ${roleConfig.name}:`, error);
        }
    }

    // 3. Crear canales
    for (const channelConfig of CHANNELS_CONFIG) {
        try {
            const channel = await createChannel(guild, channelConfig, results.category.created);
            if (channel) {
                results.channels.created.push(channel.name);
            } else {
                results.channels.existing.push(channelConfig.name);
            }
        } catch (error) {
            results.channels.errors.push(`${channelConfig.name}: ${error.message}`);
            logger.error(`Error creando canal ${channelConfig.name}:`, error);
        }
    }

    // 4. Crear webhook
    try {
        const webhook = await createWebhook(guild, results.channels.created.includes('vitaly-signals'));
        if (webhook) {
            results.webhook.created = true;
        }
    } catch (error) {
        results.webhook.error = error.message;
        logger.error('Error creando webhook:', error);
    }

    // 5. Guardar configuración en base de datos
    try {
        const serverConfig = {
            tradingChannelId: guild.channels.cache.find(c => c.name === 'vitaly-signals')?.id,
            logsChannelId: guild.channels.cache.find(c => c.name === 'trading-logs')?.id,
            categoryId: guild.channels.cache.find(c => c.name === '📈 VITALY SIGNALS')?.id,
            webhookUrl: results.webhook.created ? 'created' : null,
            setupBy: interaction.user.id,
            configData: {
                roles: results.roles,
                channels: results.channels,
                category: results.category,
                webhook: results.webhook
            }
        };

        results.database = await database.saveServerConfig(guild.id, serverConfig);
    } catch (error) {
        logger.error('Error guardando configuración:', error);
    }

    // 6. Crear embed de resultado
    const resultEmbed = createSetupResultEmbed(results, guild);
    const actionRow = createSetupActionRow();

    await interaction.editReply({ 
        embeds: [resultEmbed], 
        components: [actionRow] 
    });

    logger.info(`Configuración completa finalizada por ${interaction.user.tag}`);
}

async function handleRolesSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('👥 Configurando Roles')
        .setDescription('Creando roles del sistema...')
        .setColor(Colors.Orange)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    const results = { created: [], existing: [], errors: [] };

    for (const roleConfig of ROLES_CONFIG) {
        try {
            const role = await createRole(guild, roleConfig);
            if (role) {
                results.created.push(role.name);
            } else {
                results.existing.push(roleConfig.name);
            }
        } catch (error) {
            results.errors.push(`${roleConfig.name}: ${error.message}`);
        }
    }

    const resultEmbed = new EmbedBuilder()
        .setTitle('✅ Configuración de Roles Completada')
        .setDescription(`
**Roles Creados:** ${results.created.length > 0 ? results.created.join(', ') : 'Ninguno'}
**Roles Existentes:** ${results.existing.length > 0 ? results.existing.join(', ') : 'Ninguno'}
${results.errors.length > 0 ? `**Errores:** ${results.errors.join(', ')}` : ''}
        `)
        .setColor(Colors.Green)
        .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });
}

async function handleChannelsSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('📺 Configurando Canales')
        .setDescription('Creando canales del sistema...')
        .setColor(Colors.Purple)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    const results = { created: [], existing: [], errors: [] };

    for (const channelConfig of CHANNELS_CONFIG) {
        try {
            const channel = await createChannel(guild, channelConfig);
            if (channel) {
                results.created.push(channel.name);
            } else {
                results.existing.push(channelConfig.name);
            }
        } catch (error) {
            results.errors.push(`${channelConfig.name}: ${error.message}`);
        }
    }

    const resultEmbed = new EmbedBuilder()
        .setTitle('✅ Configuración de Canales Completada')
        .setDescription(`
**Canales Creados:** ${results.created.length > 0 ? results.created.join(', ') : 'Ninguno'}
**Canales Existentes:** ${results.existing.length > 0 ? results.existing.join(', ') : 'Ninguno'}
${results.errors.length > 0 ? `**Errores:** ${results.errors.join(', ')}` : ''}
        `)
        .setColor(Colors.Green)
        .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });
}

async function handlePermissionsCheck(interaction, guild) {
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

    await interaction.editReply({ embeds: [statusEmbed] });
}

async function handleVerification(interaction, guild) {
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

    await interaction.editReply({ embeds: [verificationEmbed] });
}

async function handleReset(interaction, guild) {
    const confirmEmbed = new EmbedBuilder()
        .setTitle('⚠️ Confirmar Reset')
        .setDescription('¿Estás seguro de que quieres resetear la configuración? Esta acción no se puede deshacer.')
        .setColor(Colors.Red)
        .setTimestamp();

    const confirmRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('reset_confirm')
                .setLabel('✅ Confirmar Reset')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('reset_cancel')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [confirmEmbed], 
        components: [confirmRow] 
    });
}

async function handleStatus(interaction, guild) {
    const serverConfig = await database.getServerConfig(guild.id);
    
    const statusEmbed = new EmbedBuilder()
        .setTitle('📊 Estado del Servidor')
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
            }
        )
        .setTimestamp();

    if (serverConfig) {
        statusEmbed.addFields({
            name: 'Última Verificación',
            value: new Date(serverConfig.last_verified).toLocaleString(),
            inline: false
        });
    }

    await interaction.editReply({ embeds: [statusEmbed] });
}

// Funciones auxiliares
async function createRole(guild, roleConfig) {
    const existingRole = guild.roles.cache.find(r => r.name === roleConfig.name);
    if (existingRole) return existingRole;

    return await guild.roles.create({
        name: roleConfig.name,
        color: roleConfig.color,
        reason: roleConfig.reason,
        permissions: roleConfig.permissions,
        position: roleConfig.position
    });
}

async function createChannel(guild, channelConfig, hasCategory = false) {
    const existingChannel = guild.channels.cache.find(c => c.name === channelConfig.name);
    if (existingChannel) return existingChannel;

    const options = {
        name: channelConfig.name,
        type: channelConfig.type,
        reason: channelConfig.reason,
        topic: channelConfig.topic
    };

    if (hasCategory) {
        const category = guild.channels.cache.find(c => c.name === '📈 VITALY SIGNALS');
        if (category) {
            options.parent = category;
        }
    }

    return await guild.channels.create(options);
}

async function createCategory(guild) {
    const existingCategory = guild.channels.cache.find(c => c.name === '📈 VITALY SIGNALS');
    if (existingCategory) return existingCategory;

    return await guild.channels.create({
        name: CATEGORY_CONFIG.name,
        type: ChannelType.GuildCategory,
        reason: CATEGORY_CONFIG.reason,
        permissionOverwrites: Object.entries(CATEGORY_CONFIG.permissions).map(([id, perms]) => ({
            id: id === '@everyone' ? guild.id : guild.roles.cache.find(r => r.name === id)?.id || guild.id,
            allow: perms
        }))
    });
}

async function createWebhook(guild, hasTradingChannel) {
    if (!hasTradingChannel) return null;

    const channel = guild.channels.cache.find(c => c.name === 'vitaly-signals');
    if (!channel) return null;

    try {
        return await channel.createWebhook({
            name: 'Vitaly Signals Webhook',
            reason: 'Webhook para integraciones del sistema'
        });
    } catch (error) {
        logger.error('Error creando webhook:', error);
        return null;
    }
}

async function verifyRoles(guild) {
    return ROLES_CONFIG.every(roleConfig => 
        guild.roles.cache.has(guild.roles.cache.find(r => r.name === roleConfig.name)?.id)
    );
}

async function verifyChannels(guild) {
    return CHANNELS_CONFIG.every(channelConfig => 
        guild.channels.cache.has(guild.channels.cache.find(c => c.name === channelConfig.name)?.id)
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

function createSetupResultEmbed(results, guild) {
    const embed = new EmbedBuilder()
        .setTitle('🏛️ Configuración de Vitaly Signals Completada')
        .setDescription(`
**Bot creado y programado por Vitaly**

✅ **Roles:** ${results.roles.created.length} creados, ${results.roles.existing.length} existentes
✅ **Canales:** ${results.channels.created.length} creados, ${results.channels.existing.length} existentes
✅ **Categoría:** ${results.category.created ? 'Creada' : results.category.existing ? 'Existente' : 'Error'}
✅ **Webhook:** ${results.webhook.created ? 'Creado' : 'No creado'}
✅ **Base de Datos:** ${results.database ? 'Guardado' : 'Error'}

📱 **Redes Sociales:**
• Instagram: [@5vitaly](https://instagram.com/5vitaly)

🏷️ **Tags del Bot:**
\`trading\` \`signals\` \`futures\` \`professional\` \`vitaly\`
        `)
        .setColor(Colors.Green)
        .setFooter({ text: 'Vitaly Signals • Desarrollado por @5vitaly' })
        .setTimestamp();

    if (results.roles.errors.length > 0 || results.channels.errors.length > 0) {
        embed.addFields({
            name: '⚠️ Errores Encontrados',
            value: [
                ...results.roles.errors,
                ...results.channels.errors
            ].join('\n'),
            inline: false
        });
    }

    return embed;
}

function createSetupActionRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setup_verify')
                .setLabel('🔍 Verificar Estado')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('setup_permissions')
                .setLabel('🔐 Verificar Permisos')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('setup_status')
                .setLabel('📊 Estado Detallado')
                .setStyle(ButtonStyle.Secondary)
        );
}

export default { 
    data, 
    execute, 
    permissions
};