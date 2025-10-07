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
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('premium')
            .setDescription('👑 Configuración premium BDX Trades - Experiencia de élite')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('brand')
            .setDescription('🎨 Aplicar identidad visual BDX Trades')
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

// Configuración premium BDX Trades
const BDX_ROLES_CONFIG = [
    {
        name: '👑 BDX FOUNDER',
        color: 0xffd700,
        reason: 'Fundador de BDX Trades - Vitaly',
        permissions: ['Administrator'],
        position: 1,
        hoist: true,
        mentionable: true
    },
    {
        name: '🥇 BDX MASTER TRADER',
        color: 0xc0c0c0,
        reason: 'Maestros del trading - Nivel más alto',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages'],
        position: 2,
        hoist: true,
        mentionable: true
    },
    {
        name: '💎 BDX ELITE TRADER',
        color: 0x9b59b6,
        reason: 'Traders de élite - Nivel premium',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
        position: 3,
        hoist: true,
        mentionable: true
    },
    {
        name: '🎖️ BDX PREMIUM MEMBER',
        color: 0xe67e22,
        reason: 'Miembros premium - Acceso completo',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
        position: 4,
        hoist: true,
        mentionable: false
    },
    {
        name: '📈 BDX TRADER',
        color: 0x27ae60,
        reason: 'Traders activos - Nivel intermedio',
        permissions: ['ViewChannel', 'SendMessages'],
        position: 5,
        hoist: true,
        mentionable: false
    },
    {
        name: '🎓 BDX STUDENT',
        color: 0x3498db,
        reason: 'Estudiantes - Nivel principiante',
        permissions: ['ViewChannel', 'SendMessages'],
        position: 6,
        hoist: true,
        mentionable: false
    },
    {
        name: '🔍 BDX VERIFIED',
        color: 0x2ecc71,
        reason: 'Miembros verificados',
        permissions: ['ViewChannel'],
        position: 7,
        hoist: false,
        mentionable: false
    },
    {
        name: '👤 BDX GUEST',
        color: 0x95a5a6,
        reason: 'Invitados - Acceso limitado',
        permissions: ['ViewChannel'],
        position: 8,
        hoist: false,
        mentionable: false
    }
];

// Configuración de categorías premium
const BDX_CATEGORIES_CONFIG = [
    {
        name: '🔒 VERIFICACIÓN & ACCESO',
        color: 0xe74c3c,
        reason: 'Categoría para verificación y acceso inicial',
        position: 1,
        permissions: {
            '@everyone': ['ViewChannel'],
            '👤 BDX GUEST': ['ViewChannel', 'SendMessages'],
            '🔍 BDX VERIFIED': ['ViewChannel', 'SendMessages']
        }
    },
    {
        name: '👑 BDX TRADES - CORE',
        color: 0xffd700,
        reason: 'Categoría principal de trading',
        position: 2,
        permissions: {
            '🎓 BDX STUDENT': ['ViewChannel'],
            '📈 BDX TRADER': ['ViewChannel', 'SendMessages'],
            '🎖️ BDX PREMIUM MEMBER': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '🏆 MIEMBROS VIP',
        color: 0x9b59b6,
        reason: 'Categoría exclusiva para miembros VIP',
        position: 3,
        permissions: {
            '🎖️ BDX PREMIUM MEMBER': ['ViewChannel'],
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '📚 EDUCACIÓN & RECURSOS',
        color: 0x3498db,
        reason: 'Categoría educativa y recursos',
        position: 4,
        permissions: {
            '🎓 BDX STUDENT': ['ViewChannel', 'SendMessages'],
            '📈 BDX TRADER': ['ViewChannel', 'SendMessages'],
            '🎖️ BDX PREMIUM MEMBER': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '🔧 SISTEMA & SOPORTE',
        color: 0x34495e,
        reason: 'Categoría de sistema y soporte técnico',
        position: 5,
        permissions: {
            '@everyone': ['ViewChannel'],
            '🔍 BDX VERIFIED': ['ViewChannel', 'SendMessages'],
            '🎓 BDX STUDENT': ['ViewChannel', 'SendMessages'],
            '📈 BDX TRADER': ['ViewChannel', 'SendMessages'],
            '🎖️ BDX PREMIUM MEMBER': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    }
];

// Configuración de canales premium
const BDX_CHANNELS_CONFIG = [
    // Verificación & Acceso
    {
        name: '📋 reglas-y-terminos',
        type: ChannelType.GuildText,
        category: '🔒 VERIFICACIÓN & ACCESO',
        reason: 'Canal de reglas y términos de servicio',
        topic: '📜 Reglas y términos de servicio de BDX Trades',
        slowmode: 0
    },
    {
        name: '🎫 solicitar-acceso',
        type: ChannelType.GuildText,
        category: '🔒 VERIFICACIÓN & ACCESO',
        reason: 'Canal para solicitar acceso a la comunidad',
        topic: '🎫 Solicita tu acceso a BDX Trades - Comunidad premium de trading',
        slowmode: 60
    },
    {
        name: '✅ verificacion-completada',
        type: ChannelType.GuildText,
        category: '🔒 VERIFICACIÓN & ACCESO',
        reason: 'Canal de confirmación de verificación',
        topic: '✅ Verificación completada - Bienvenido a BDX Trades',
        slowmode: 0
    },
    
    // BDX TRADES - CORE
    {
        name: '📈 trading-signals',
        type: ChannelType.GuildText,
        category: '👑 BDX TRADES - CORE',
        reason: 'Canal principal de señales de trading',
        topic: '📈 Señales de trading en tiempo real - BDX Trades Premium',
        slowmode: 0
    },
    {
        name: '📊 market-analysis',
        type: ChannelType.GuildText,
        category: '👑 BDX TRADES - CORE',
        reason: 'Canal de análisis de mercados',
        topic: '📊 Análisis profundo de mercados y tendencias',
        slowmode: 0
    },
    {
        name: '💎 premium-insights',
        type: ChannelType.GuildText,
        category: '👑 BDX TRADES - CORE',
        reason: 'Canal de insights premium',
        topic: '💎 Insights exclusivos para miembros premium',
        slowmode: 0
    },
    {
        name: '🎯 trade-execution',
        type: ChannelType.GuildText,
        category: '👑 BDX TRADES - CORE',
        reason: 'Canal de ejecución de trades',
        topic: '🎯 Ejecución de trades y seguimiento de operaciones',
        slowmode: 0
    },
    
    // MIEMBROS VIP
    {
        name: '💼 vip-lounge',
        type: ChannelType.GuildText,
        category: '🏆 MIEMBROS VIP',
        reason: 'Lounge exclusivo para miembros VIP',
        topic: '💼 Lounge VIP - Espacio exclusivo para miembros premium',
        slowmode: 0
    },
    {
        name: '🥇 elite-traders',
        type: ChannelType.GuildText,
        category: '🏆 MIEMBROS VIP',
        reason: 'Canal para traders de élite',
        topic: '🥇 Canal exclusivo para traders de élite',
        slowmode: 0
    },
    {
        name: '🎖️ master-traders',
        type: ChannelType.GuildText,
        category: '🏆 MIEMBROS VIP',
        reason: 'Canal para maestros del trading',
        topic: '🎖️ Canal exclusivo para maestros del trading',
        slowmode: 0
    },
    {
        name: '👑 bdx-ambassadors',
        type: ChannelType.GuildText,
        category: '🏆 MIEMBROS VIP',
        reason: 'Canal para embajadores de BDX',
        topic: '👑 Canal exclusivo para embajadores de BDX Trades',
        slowmode: 0
    },
    
    // EDUCACIÓN & RECURSOS
    {
        name: '📖 trading-academy',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Academia de trading',
        topic: '📖 Academia de trading - Aprende con los mejores',
        slowmode: 0
    },
    {
        name: '📝 estrategias-pro',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Estrategias profesionales',
        topic: '📝 Estrategias profesionales de trading',
        slowmode: 0
    },
    {
        name: '🎓 cursos-premium',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Cursos premium',
        topic: '🎓 Cursos premium de trading',
        slowmode: 0
    },
    {
        name: '📚 biblioteca-trading',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Biblioteca de recursos',
        topic: '📚 Biblioteca de recursos de trading',
        slowmode: 0
    },
    
    // SISTEMA & SOPORTE
    {
        name: '🤖 bot-commands',
        type: ChannelType.GuildText,
        category: '🔧 SISTEMA & SOPORTE',
        reason: 'Comandos del bot',
        topic: '🤖 Comandos del bot BDX Trades',
        slowmode: 0
    },
    {
        name: '📊 estadisticas',
        type: ChannelType.GuildText,
        category: '🔧 SISTEMA & SOPORTE',
        reason: 'Estadísticas del servidor',
        topic: '📊 Estadísticas y métricas del servidor',
        slowmode: 0
    },
    {
        name: '🛠️ soporte-tecnico',
        type: ChannelType.GuildText,
        category: '🔧 SISTEMA & SOPORTE',
        reason: 'Soporte técnico',
        topic: '🛠️ Soporte técnico y ayuda',
        slowmode: 0
    },
    {
        name: '📢 anuncios-sistema',
        type: ChannelType.GuildText,
        category: '🔧 SISTEMA & SOPORTE',
        reason: 'Anuncios del sistema',
        topic: '📢 Anuncios importantes del sistema',
        slowmode: 0
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
            case 'premium':
                await handlePremiumSetup(interaction, guild);
                break;
            case 'brand':
                await handleBrandSetup(interaction, guild);
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

async function handlePremiumSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('👑 Iniciando Configuración Premium BDX Trades')
        .setDescription('Creando experiencia de élite...')
        .setColor(0xffd700)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    const results = {
        roles: { created: [], existing: [], errors: [] },
        categories: { created: [], existing: [], errors: [] },
        channels: { created: [], existing: [], errors: [] },
        webhooks: { created: [], errors: [] },
        database: false
    };

    // 1. Crear roles premium
    for (const roleConfig of BDX_ROLES_CONFIG) {
        try {
            const role = await createBDXRole(guild, roleConfig);
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

    // 2. Crear categorías premium
    for (const categoryConfig of BDX_CATEGORIES_CONFIG) {
        try {
            const category = await createBDXCategory(guild, categoryConfig);
            if (category) {
                results.categories.created.push(category.name);
            } else {
                results.categories.existing.push(categoryConfig.name);
            }
        } catch (error) {
            results.categories.errors.push(`${categoryConfig.name}: ${error.message}`);
            logger.error(`Error creando categoría ${categoryConfig.name}:`, error);
        }
    }

    // 3. Crear canales premium
    for (const channelConfig of BDX_CHANNELS_CONFIG) {
        try {
            const channel = await createBDXChannel(guild, channelConfig);
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

    // 4. Crear webhooks para canales principales
    const mainChannels = ['trading-signals', 'market-analysis', 'premium-insights'];
    for (const channelName of mainChannels) {
        try {
            const channel = guild.channels.cache.find(c => c.name === channelName);
            if (channel) {
                const webhook = await channel.createWebhook({
                    name: `BDX ${channelName} Webhook`,
                    reason: 'Webhook para integraciones premium'
                });
                results.webhooks.created.push(`${channelName} webhook`);
            }
        } catch (error) {
            results.webhooks.errors.push(`${channelName}: ${error.message}`);
            logger.error(`Error creando webhook para ${channelName}:`, error);
        }
    }

    // 5. Guardar configuración premium en base de datos
    try {
        const premiumConfig = {
            tradingChannelId: guild.channels.cache.find(c => c.name === 'trading-signals')?.id,
            analysisChannelId: guild.channels.cache.find(c => c.name === 'market-analysis')?.id,
            premiumChannelId: guild.channels.cache.find(c => c.name === 'premium-insights')?.id,
            vipLoungeId: guild.channels.cache.find(c => c.name === 'vip-lounge')?.id,
            setupBy: interaction.user.id,
            configType: 'premium',
            configData: {
                roles: results.roles,
                categories: results.categories,
                channels: results.channels,
                webhooks: results.webhooks
            }
        };

        results.database = await database.saveServerConfig(guild.id, premiumConfig);
    } catch (error) {
        logger.error('Error guardando configuración premium:', error);
    }

    // 6. Crear embed de resultado premium
    const resultEmbed = createPremiumResultEmbed(results, guild);
    const actionRow = createPremiumActionRow();

    await interaction.editReply({ 
        embeds: [resultEmbed], 
        components: [actionRow] 
    });

    logger.info(`Configuración premium BDX Trades completada por ${interaction.user.tag}`);
}

async function handleBrandSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('🎨 Aplicando Identidad Visual BDX Trades')
        .setDescription('Configurando elementos visuales...')
        .setColor(0x9b59b6)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    const brandResults = {
        channels: { updated: [], errors: [] }
    };

    // 1. Actualizar temas de canales con identidad BDX
    const channelsToUpdate = [
        'trading-signals',
        'market-analysis', 
        'premium-insights',
        'vip-lounge'
    ];

    for (const channelName of channelsToUpdate) {
        try {
            const channel = guild.channels.cache.find(c => c.name === channelName);
            if (channel) {
                // Actualizar tema con identidad BDX
                const bdxTopic = `🏛️ BDX Trades Premium - ${channelName.replace('-', ' ').toUpperCase()}`;
                await channel.setTopic(bdxTopic);
                brandResults.channels.updated.push(channelName);
            }
        } catch (error) {
            brandResults.channels.errors.push(`${channelName}: ${error.message}`);
        }
    }

    // 2. Crear embed de resultado de marca
    const brandEmbed = new EmbedBuilder()
        .setTitle('🎨 Identidad Visual BDX Trades Aplicada')
        .setDescription(`
**🏛️ BDX Trades - Comunidad Premium de Trading**

✅ **Elementos Visuales:**
• Canales actualizados: ${brandResults.channels.updated.length} con identidad BDX
• Temas personalizados aplicados

🎨 **Paleta de Colores BDX:**
• **Dorado Premium:** #FFD700 (Fundador, VIP)
• **Púrpura Elite:** #9B59B6 (Elite Traders)
• **Verde Trading:** #27AE60 (Traders Activos)
• **Azul Profesional:** #3498DB (Estudiantes)
• **Gris Corporativo:** #34495E (Sistema)

🏷️ **Identidad de Marca:**
• **Nombre:** BDX Trades
• **Slogan:** "Trading de Élite, Resultados Reales"
• **Estilo:** Premium, Profesional, Exclusivo
        `)
        .setColor(0xffd700)
        .setFooter({ text: 'BDX Trades • Identidad Visual Premium' })
        .setTimestamp();

    const brandActionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('brand_verify')
                .setLabel('🎨 Verificar Identidad')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('brand_customize')
                .setLabel('⚙️ Personalizar')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [brandEmbed], 
        components: [brandActionRow] 
    });

    logger.info(`Identidad visual BDX Trades aplicada por ${interaction.user.tag}`);
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

// Funciones para configuración premium BDX Trades
async function createBDXRole(guild, roleConfig) {
    const existingRole = guild.roles.cache.find(r => r.name === roleConfig.name);
    if (existingRole) return existingRole;

    return await guild.roles.create({
        name: roleConfig.name,
        color: roleConfig.color,
        reason: roleConfig.reason,
        permissions: roleConfig.permissions,
        position: roleConfig.position,
        hoist: roleConfig.hoist || false,
        mentionable: roleConfig.mentionable || false
    });
}

async function createBDXCategory(guild, categoryConfig) {
    const existingCategory = guild.channels.cache.find(c => c.name === categoryConfig.name);
    if (existingCategory) return existingCategory;

    const permissionOverwrites = [];
    
    // Configurar permisos para @everyone
    permissionOverwrites.push({
        id: guild.id,
        deny: ['ViewChannel']
    });

    // Configurar permisos para roles específicos
    Object.entries(categoryConfig.permissions).forEach(([roleName, perms]) => {
        if (roleName === '@everyone') {
            permissionOverwrites.push({
                id: guild.id,
                allow: perms
            });
        } else {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                permissionOverwrites.push({
                    id: role.id,
                    allow: perms
                });
            }
        }
    });

    return await guild.channels.create({
        name: categoryConfig.name,
        type: ChannelType.GuildCategory,
        reason: categoryConfig.reason,
        position: categoryConfig.position,
        permissionOverwrites: permissionOverwrites
    });
}

async function createBDXChannel(guild, channelConfig) {
    const existingChannel = guild.channels.cache.find(c => c.name === channelConfig.name);
    if (existingChannel) return existingChannel;

    const category = guild.channels.cache.find(c => c.name === channelConfig.category);
    
    const options = {
        name: channelConfig.name,
        type: channelConfig.type,
        reason: channelConfig.reason,
        topic: channelConfig.topic,
        rateLimitPerUser: channelConfig.slowmode || 0
    };

    if (category) {
        options.parent = category;
    }

    return await guild.channels.create(options);
}

function createPremiumResultEmbed(results, guild) {
    const embed = new EmbedBuilder()
        .setTitle('👑 Configuración Premium BDX Trades Completada')
        .setDescription(`
**🏛️ BDX Trades - Comunidad Premium de Trading**

✅ **Roles Premium:** ${results.roles.created.length} creados, ${results.roles.existing.length} existentes
✅ **Categorías:** ${results.categories.created.length} creadas, ${results.categories.existing.length} existentes  
✅ **Canales:** ${results.channels.created.length} creados, ${results.channels.existing.length} existentes
✅ **Webhooks:** ${results.webhooks.created.length} creados
✅ **Base de Datos:** ${results.database ? 'Configuración guardada' : 'Error al guardar'}

🎨 **Experiencia Premium:**
• **Flujo de entrada** optimizado para exclusividad
• **Roles jerárquicos** que reflejan niveles de acceso
• **Categorías organizadas** con propósito específico
• **Canales temáticos** con identidad de marca

📱 **Redes Sociales:**
• Instagram: [@5vitaly](https://instagram.com/5vitaly)

🏷️ **Tags de Marca:**
\`bdx\` \`trades\` \`premium\` \`trading\` \`elite\` \`vitaly\`
        `)
        .setColor(0xffd700)
        .setFooter({ text: 'BDX Trades • Experiencia Premium' })
        .setTimestamp();

    if (results.roles.errors.length > 0 || results.channels.errors.length > 0 || results.categories.errors.length > 0) {
        embed.addFields({
            name: '⚠️ Errores Encontrados',
            value: [
                ...results.roles.errors,
                ...results.channels.errors,
                ...results.categories.errors
            ].join('\n'),
            inline: false
        });
    }

    return embed;
}

function createPremiumActionRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('premium_verify')
                .setLabel('👑 Verificar Premium')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('brand_setup')
                .setLabel('🎨 Aplicar Marca')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('premium_status')
                .setLabel('📊 Estado Premium')
                .setStyle(ButtonStyle.Secondary)
        );
}

export default { 
    data, 
    execute, 
    permissions
};