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
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('memberships')
            .setDescription('💰 Configurar canal de membresías con embeds y botones')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('verify-system')
            .setDescription('🎭 Configurar sistema de verificación automática')
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

// Configuración premium BDX Trades - Nueva estructura jerárquica
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
        color: 0xffd700,
        reason: 'Tier 3 - Trader Élite - Nivel más alto',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages'],
        position: 2,
        hoist: true,
        mentionable: true
    },
    {
        name: '💎 BDX ELITE TRADER',
        color: 0x3498db,
        reason: 'Tier 2 - Trader Avanzado - Nivel premium',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
        position: 3,
        hoist: true,
        mentionable: true
    },
    {
        name: '🎖️ BDX PREMIUM MEMBER',
        color: 0x95a5a6,
        reason: 'Tier 1 - Trader Básico - Acceso comunidad',
        permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
        position: 4,
        hoist: true,
        mentionable: false
    },
    {
        name: '📈 BDX TRADER',
        color: 0x2ecc71,
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
        reason: 'Miembros verificados - Acceso base',
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

// Configuración de categorías premium - Nueva estructura jerárquica
const BDX_CATEGORIES_CONFIG = [
    {
        name: '🏠 INICIO',
        color: 0x2ecc71,
        reason: 'Categoría de bienvenida, verificación y soporte inicial',
        position: 1,
        permissions: {
            '@everyone': ['ViewChannel'],
            '👤 BDX GUEST': ['ViewChannel', 'SendMessages'],
            '🔍 BDX VERIFIED': ['ViewChannel', 'SendMessages']
        }
    },
    {
        name: '📢 INFORMACIÓN OFICIAL',
        color: 0xe74c3c,
        reason: 'Categoría de información oficial de BDX',
        position: 2,
        permissions: {
            '@everyone': ['ViewChannel'],
            '🔍 BDX VERIFIED': ['ViewChannel', 'SendMessages'],
            '🎓 BDX STUDENT': ['ViewChannel', 'SendMessages'],
            '📈 BDX TRADER': ['ViewChannel', 'SendMessages'],
            '🎖️ BDX PREMIUM MEMBER': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '👥 COMUNIDAD',
        color: 0x95a5a6,
        reason: 'Tier 1 - Trader Básico - Comunidad y análisis',
        position: 3,
        permissions: {
            '🎖️ BDX PREMIUM MEMBER': ['ViewChannel', 'SendMessages', 'EmbedLinks'],
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '💎 ZONA VIP',
        color: 0x3498db,
        reason: 'Tier 2 - Trader Avanzado - Alertas, entradas y chat VIP',
        position: 4,
        permissions: {
            '💎 BDX ELITE TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles'],
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '👑 ZONA ÉLITE',
        color: 0xffd700,
        reason: 'Tier 3 - Trader Élite - Clases 1-1, material exclusivo y mentoría',
        position: 5,
        permissions: {
            '🥇 BDX MASTER TRADER': ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageMessages']
        }
    },
    {
        name: '📚 EDUCACIÓN & RECURSOS',
        color: 0x9b59b6,
        reason: 'Categoría educativa y recursos de trading',
        position: 6,
        permissions: {
            '🔍 BDX VERIFIED': ['ViewChannel'],
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
        position: 7,
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

// Configuración de canales premium - Nueva estructura jerárquica
const BDX_CHANNELS_CONFIG = [
    // INICIO
    {
        name: '👋 bienvenida',
        type: ChannelType.GuildText,
        category: '🏠 INICIO',
        reason: 'Canal de bienvenida con embed y logo BDX',
        topic: '🏛️ Bienvenido a BDX Trades - Comunidad Premium de Trading',
        slowmode: 0
    },
    {
        name: '✅ verificación',
        type: ChannelType.GuildText,
        category: '🏠 INICIO',
        reason: 'Canal de verificación automática',
        topic: '✅ Completa tu verificación para acceder al contenido',
        slowmode: 0
    },
    {
        name: '🆘 soporte-inicial',
        type: ChannelType.GuildText,
        category: '🏠 INICIO',
        reason: 'Soporte inicial para nuevos miembros',
        topic: '🆘 Soporte inicial - Preguntas frecuentes y ayuda',
        slowmode: 0
    },
    
    // INFORMACIÓN OFICIAL
    {
        name: '📋 sobre-bdx',
        type: ChannelType.GuildText,
        category: '📢 INFORMACIÓN OFICIAL',
        reason: 'Información sobre BDX Trades',
        topic: '📋 Información oficial sobre BDX Trades y nuestros servicios',
        slowmode: 0
    },
    {
        name: '📜 reglas',
        type: ChannelType.GuildText,
        category: '📢 INFORMACIÓN OFICIAL',
        reason: 'Reglas y términos de servicio',
        topic: '📜 Reglas y términos de servicio de BDX Trades',
        slowmode: 0
    },
    {
        name: '📢 anuncios',
        type: ChannelType.GuildText,
        category: '📢 INFORMACIÓN OFICIAL',
        reason: 'Anuncios oficiales importantes',
        topic: '📢 Anuncios oficiales importantes de BDX Trades',
        slowmode: 0
    },
    {
        name: '💰 membresías',
        type: ChannelType.GuildText,
        category: '📢 INFORMACIÓN OFICIAL',
        reason: 'Información sobre membresías y beneficios',
        topic: '💰 Información sobre membresías y beneficios de cada tier',
        slowmode: 0
    },
    
    // COMUNIDAD (Tier 1 - Trader Básico)
    {
        name: '💬 chat-general',
        type: ChannelType.GuildText,
        category: '👥 COMUNIDAD',
        reason: 'Chat general de la comunidad',
        topic: '💬 Chat general de la comunidad BDX Trades',
        slowmode: 0
    },
    {
        name: '📈 profits',
        type: ChannelType.GuildText,
        category: '👥 COMUNIDAD',
        reason: 'Compartir ganancias y resultados',
        topic: '📈 Comparte tus ganancias y resultados de trading',
        slowmode: 0
    },
    {
        name: '📊 análisis-diarios',
        type: ChannelType.GuildText,
        category: '👥 COMUNIDAD',
        reason: 'Análisis diarios del mercado',
        topic: '📊 Análisis diarios del mercado y tendencias',
        slowmode: 0
    },
    {
        name: '❓ preguntas-y-respuestas',
        type: ChannelType.GuildText,
        category: '👥 COMUNIDAD',
        reason: 'Preguntas y respuestas de la comunidad',
        topic: '❓ Preguntas y respuestas de la comunidad',
        slowmode: 0
    },
    
    // ZONA VIP (Tier 2 - Trader Avanzado)
    {
        name: '🎯 entradas-de-vitaly',
        type: ChannelType.GuildText,
        category: '💎 ZONA VIP',
        reason: 'Entradas y señales de Vitaly',
        topic: '🎯 Entradas y señales exclusivas de Vitaly',
        slowmode: 0
    },
    {
        name: '🤖 alertas-de-bots',
        type: ChannelType.GuildText,
        category: '💎 ZONA VIP',
        reason: 'Alertas automáticas de bots',
        topic: '🤖 Alertas automáticas de bots de trading',
        slowmode: 0
    },
    {
        name: '💎 chat-privado-vip',
        type: ChannelType.GuildText,
        category: '💎 ZONA VIP',
        reason: 'Chat privado para miembros VIP',
        topic: '💎 Chat privado exclusivo para miembros VIP',
        slowmode: 0
    },
    {
        name: '📚 estrategias-avanzadas',
        type: ChannelType.GuildText,
        category: '💎 ZONA VIP',
        reason: 'Estrategias avanzadas de trading',
        topic: '📚 Estrategias avanzadas de trading para VIP',
        slowmode: 0
    },
    
    // ZONA ÉLITE (Tier 3 - Trader Élite)
    {
        name: '🎓 clases-1-a-1',
        type: ChannelType.GuildText,
        category: '👑 ZONA ÉLITE',
        reason: 'Clases personalizadas 1 a 1',
        topic: '🎓 Clases personalizadas 1 a 1 con Vitaly',
        slowmode: 0
    },
    {
        name: '📖 material-de-estudio',
        type: ChannelType.GuildText,
        category: '👑 ZONA ÉLITE',
        reason: 'Material de estudio exclusivo',
        topic: '📖 Material de estudio exclusivo para élite',
        slowmode: 0
    },
    {
        name: '🔒 consultas-privadas',
        type: ChannelType.GuildText,
        category: '👑 ZONA ÉLITE',
        reason: 'Consultas privadas con Vitaly',
        topic: '🔒 Consultas privadas exclusivas con Vitaly',
        slowmode: 0
    },
    {
        name: '🎬 replays-de-clases',
        type: ChannelType.GuildText,
        category: '👑 ZONA ÉLITE',
        reason: 'Replays de clases grabadas',
        topic: '🎬 Replays de clases grabadas para élite',
        slowmode: 0
    },
    
    // EDUCACIÓN & RECURSOS
    {
        name: '📚 trading-academy',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Academia de trading',
        topic: '📚 Academia de trading - Aprende con los mejores',
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
        name: '🧠 psicología-del-trader',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Psicología del trader',
        topic: '🧠 Psicología del trader y mentalidad',
        slowmode: 0
    },
    {
        name: '🛠️ herramientas-y-plantillas',
        type: ChannelType.GuildText,
        category: '📚 EDUCACIÓN & RECURSOS',
        reason: 'Herramientas y plantillas de trading',
        topic: '🛠️ Herramientas y plantillas de trading',
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
        name: '📊 estadísticas',
        type: ChannelType.GuildText,
        category: '🔧 SISTEMA & SOPORTE',
        reason: 'Estadísticas del servidor',
        topic: '📊 Estadísticas y métricas del servidor',
        slowmode: 0
    },
    {
        name: '🛠️ soporte-técnico',
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
            case 'memberships':
                await handleMembershipsSetup(interaction, guild);
                break;
            case 'verify-system':
                await handleVerificationSystemSetup(interaction, guild);
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

async function handleMembershipsSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('💰 Configurando Canal de Membresías')
        .setDescription('Creando embeds y botones de membresías...')
        .setColor(0xffd700)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    // Buscar el canal de membresías
    const membershipsChannel = guild.channels.cache.find(c => c.name === 'membresías');
    if (!membershipsChannel) {
        await interaction.editReply({
            content: '❌ No se encontró el canal #💰membresías. Ejecuta primero `/setup premium`.'
        });
        return;
    }

    try {
        // Crear embed principal de membresías
        const mainEmbed = new EmbedBuilder()
            .setTitle('💰 Membresías BDX Trades')
            .setDescription(`
**🏛️ BDX Trades - Comunidad Premium de Trading**

Elige tu nivel de membresía y desbloquea acceso exclusivo a contenido premium, señales de trading, análisis profesionales y mucho más.

**🎯 ¿Por qué unirte a BDX Trades?**
• **Señales de trading** en tiempo real
• **Análisis profesionales** del mercado
• **Comunidad exclusiva** de traders
• **Educación premium** y mentoría
• **Herramientas avanzadas** de trading
            `)
            .setColor(0xffd700)
            .setThumbnail('https://via.placeholder.com/128x128/FFD700/000000?text=BDX')
            .setFooter({ text: 'BDX Trades • Membresías Premium' })
            .setTimestamp();

        // Crear embeds para cada tier
        const tier1Embed = new EmbedBuilder()
            .setTitle('🎖️ Tier 1 - Trader Básico')
            .setDescription(`
**💰 Precio:** Consultar disponibilidad
**🎯 Beneficios incluidos:**
• ✅ Acceso a comunidad general
• ✅ Análisis diarios del mercado
• ✅ Chat general con otros traders
• ✅ Compartir ganancias y resultados
• ✅ Preguntas y respuestas
• ✅ Recursos educativos básicos

**📈 Perfecto para:**
• Traders principiantes
• Quienes buscan aprender
• Interacción con la comunidad
            `)
            .setColor(0x95a5a6)
            .setThumbnail('https://via.placeholder.com/64x64/95A5A6/FFFFFF?text=T1');

        const tier2Embed = new EmbedBuilder()
            .setTitle('💎 Tier 2 - Trader Avanzado')
            .setDescription(`
**💰 Precio:** Consultar disponibilidad
**🎯 Beneficios incluidos:**
• ✅ Todo lo del Tier 1
• ✅ Entradas y señales de Vitaly
• ✅ Alertas automáticas de bots
• ✅ Chat privado VIP
• ✅ Estrategias avanzadas
• ✅ Análisis en tiempo real

**📈 Perfecto para:**
• Traders con experiencia
• Quienes buscan señales premium
• Acceso a contenido exclusivo
            `)
            .setColor(0x3498db)
            .setThumbnail('https://via.placeholder.com/64x64/3498DB/FFFFFF?text=T2');

        const tier3Embed = new EmbedBuilder()
            .setTitle('👑 Tier 3 - Trader Élite')
            .setDescription(`
**💰 Precio:** Consultar disponibilidad
**🎯 Beneficios incluidos:**
• ✅ Todo lo del Tier 2
• ✅ Clases personalizadas 1 a 1
• ✅ Material de estudio exclusivo
• ✅ Consultas privadas con Vitaly
• ✅ Replays de clases grabadas
• ✅ Mentoría directa

**📈 Perfecto para:**
• Traders profesionales
• Quienes buscan mentoría
• Acceso total y exclusivo
            `)
            .setColor(0xffd700)
            .setThumbnail('https://via.placeholder.com/64x64/FFD700/000000?text=T3');

        // Crear botones para cada tier
        const tier1Button = new ButtonBuilder()
            .setCustomId('membership_tier1')
            .setLabel('🎖️ Tier 1 - Básico')
            .setStyle(ButtonStyle.Secondary);

        const tier2Button = new ButtonBuilder()
            .setCustomId('membership_tier2')
            .setLabel('💎 Tier 2 - Avanzado')
            .setStyle(ButtonStyle.Primary);

        const tier3Button = new ButtonBuilder()
            .setCustomId('membership_tier3')
            .setLabel('👑 Tier 3 - Élite')
            .setStyle(ButtonStyle.Success);

        const infoButton = new ButtonBuilder()
            .setCustomId('membership_info')
            .setLabel('ℹ️ Más Información')
            .setStyle(ButtonStyle.Secondary);

        const contactButton = new ButtonBuilder()
            .setCustomId('membership_contact')
            .setLabel('📞 Contactar')
            .setStyle(ButtonStyle.Secondary);

        const actionRow1 = new ActionRowBuilder()
            .addComponents(tier1Button, tier2Button, tier3Button);

        const actionRow2 = new ActionRowBuilder()
            .addComponents(infoButton, contactButton);

        // Enviar mensajes al canal de membresías
        await membershipsChannel.send({ embeds: [mainEmbed], components: [actionRow1, actionRow2] });
        await membershipsChannel.send({ embeds: [tier1Embed] });
        await membershipsChannel.send({ embeds: [tier2Embed] });
        await membershipsChannel.send({ embeds: [tier3Embed] });

        // Embed de confirmación
        const confirmEmbed = new EmbedBuilder()
            .setTitle('✅ Canal de Membresías Configurado')
            .setDescription(`
**💰 Canal:** #membresías
**📊 Embeds:** 4 embeds creados
**🔘 Botones:** 5 botones interactivos
**🎨 Diseño:** Profesional y atractivo

**📋 Incluye:**
• Embed principal con información general
• Embed detallado para cada tier
• Botones para seleccionar membresía
• Botones de información y contacto
            `)
            .setColor(0x2ecc71)
            .setTimestamp();

        await interaction.editReply({ embeds: [confirmEmbed] });

        logger.info(`Canal de membresías configurado por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error configurando canal de membresías:', error);
        await interaction.editReply({
            content: '❌ Error configurando el canal de membresías.'
        });
    }
}

async function handleVerificationSystemSetup(interaction, guild) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('🎭 Configurando Sistema de Verificación')
        .setDescription('Creando sistema de verificación automática...')
        .setColor(0x2ecc71)
        .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    try {
        // Buscar canales necesarios
        const welcomeChannel = guild.channels.cache.find(c => c.name === 'bienvenida');
        const verificationChannel = guild.channels.cache.find(c => c.name === 'verificación');
        const membershipsChannel = guild.channels.cache.find(c => c.name === 'membresías');
        
        if (!welcomeChannel || !verificationChannel) {
            await interaction.editReply({
                content: '❌ No se encontraron los canales necesarios. Ejecuta primero `/setup premium`.'
            });
            return;
        }

        // Crear embed de bienvenida profesional
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🏛️ ¡Bienvenido a BDX Trades!')
            .setDescription(`
**🎯 Comunidad Premium de Trading**

¡Hola! Bienvenido a **BDX Trades**, la comunidad de trading más exclusiva y profesional. Aquí encontrarás:

**✨ ¿Qué te espera?**
• **Señales de trading** en tiempo real
• **Análisis profesionales** del mercado
• **Comunidad exclusiva** de traders
• **Educación premium** y mentoría
• **Herramientas avanzadas** de trading

**🚀 Para comenzar:**
1. **Lee las reglas** en #📜reglas
2. **Completa tu verificación** en #✅verificación
3. **Elige tu membresía** en #💰membresías
4. **¡Comienza a tradear!** 🎯

**👑 Fundado por Vitaly** - Experto en trading con años de experiencia
            `)
            .setColor(0xffd700)
            .setThumbnail('https://via.placeholder.com/128x128/FFD700/000000?text=BDX')
            .setImage('https://via.placeholder.com/600x200/FFD700/000000?text=BDX+TRADES+PREMIUM')
            .setFooter({ text: 'BDX Trades • Comunidad Premium de Trading' })
            .setTimestamp();

        // Crear botón de verificación
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_user')
            .setLabel('✅ Verificarme Ahora')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const rulesButton = new ButtonBuilder()
            .setCustomId('view_rules')
            .setLabel('📜 Ver Reglas')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📜');

        const membershipsButton = new ButtonBuilder()
            .setCustomId('view_memberships')
            .setLabel('💰 Ver Membresías')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('💰');

        const actionRow = new ActionRowBuilder()
            .addComponents(verifyButton, rulesButton, membershipsButton);

        // Enviar embed de bienvenida
        await welcomeChannel.send({ 
            embeds: [welcomeEmbed], 
            components: [actionRow] 
        });

        // Crear embed de verificación
        const verificationEmbed = new EmbedBuilder()
            .setTitle('✅ Verificación de Cuenta')
            .setDescription(`
**🎯 Completa tu verificación para acceder al contenido**

**📋 Pasos para verificar:**
1. **Haz clic en "Verificarme Ahora"** en el canal #👋bienvenida
2. **Confirma tu identidad** siguiendo las instrucciones
3. **Recibe tu rol** 🔍 BDX VERIFIED automáticamente
4. **Accede al contenido** premium de la comunidad

**🔒 ¿Por qué verificarse?**
• **Acceso garantizado** al contenido
• **Protección contra bots** y spam
• **Experiencia personalizada** según tu tier
• **Soporte prioritario** en la comunidad

**❓ ¿Problemas con la verificación?**
Contacta a un administrador en #🛠️soporte-técnico
            `)
            .setColor(0x2ecc71)
            .setThumbnail('https://via.placeholder.com/64x64/2ECC71/FFFFFF?text=✓')
            .setFooter({ text: 'BDX Trades • Sistema de Verificación' })
            .setTimestamp();

        // Crear botón de verificación rápida
        const quickVerifyButton = new ButtonBuilder()
            .setCustomId('quick_verify')
            .setLabel('⚡ Verificación Rápida')
            .setStyle(ButtonStyle.Success)
            .setEmoji('⚡');

        const helpButton = new ButtonBuilder()
            .setCustomId('verify_help')
            .setLabel('❓ Ayuda')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❓');

        const verificationActionRow = new ActionRowBuilder()
            .addComponents(quickVerifyButton, helpButton);

        // Enviar embed de verificación
        await verificationChannel.send({ 
            embeds: [verificationEmbed], 
            components: [verificationActionRow] 
        });

        // Crear embed de reglas si no existe
        const rulesChannel = guild.channels.cache.find(c => c.name === 'reglas');
        if (rulesChannel) {
            const rulesEmbed = new EmbedBuilder()
                .setTitle('📜 Reglas de BDX Trades')
                .setDescription(`
**🏛️ Bienvenido a BDX Trades - Comunidad Premium de Trading**

**📋 Reglas Generales:**
• **Respeta a todos** los miembros de la comunidad
• **No spam** ni contenido inapropiado
• **Mantén la privacidad** - No compartas información personal
• **Usa los canales correctos** para cada tipo de contenido
• **Sigue las instrucciones** de los moderadores

**💼 Reglas de Trading:**
• **No compartas señales** de otras fuentes sin permiso
• **Respeta la propiedad intelectual** de BDX Trades
• **No hagas trading** con dinero que no puedas permitirte perder
• **Mantén la confidencialidad** de las estrategias premium

**🎯 Reglas de Membresías:**
• **Tier 1 (Básico):** Acceso a comunidad general
• **Tier 2 (VIP):** Acceso a señales y análisis premium
• **Tier 3 (Élite):** Acceso completo y mentoría personalizada

**⚠️ Sanciones:**
• **Primera infracción:** Advertencia
• **Segunda infracción:** Mute temporal
• **Tercera infracción:** Expulsión temporal
• **Infracciones graves:** Expulsión permanente

**📞 Contacto:**
Para reportar infracciones o solicitar ayuda, contacta a un administrador.
                `)
                .setColor(0xe74c3c)
                .setThumbnail('https://via.placeholder.com/64x64/E74C3C/FFFFFF?text=📜')
                .setFooter({ text: 'BDX Trades • Reglas y Términos' })
                .setTimestamp();

            await rulesChannel.send({ embeds: [rulesEmbed] });
        }

        // Embed de confirmación
        const confirmEmbed = new EmbedBuilder()
            .setTitle('✅ Sistema de Verificación Configurado')
            .setDescription(`
**🎭 Sistema de verificación automática implementado exitosamente**

**📊 Configuración completada:**
• **Canal de bienvenida:** #👋bienvenida
• **Canal de verificación:** #✅verificación
• **Canal de reglas:** #📜reglas
• **Botones interactivos:** 5 botones creados
• **Embeds profesionales:** 3 embeds configurados

**🔧 Funcionalidades incluidas:**
• **Verificación automática** con un clic
• **Asignación de roles** automática
• **Redirección inteligente** a membresías
• **Sistema de ayuda** integrado
• **Embeds profesionales** con branding BDX

**🎯 Próximos pasos:**
1. Los nuevos miembros verán el embed de bienvenida
2. Podrán verificarse con un clic
3. Recibirán el rol 🔍 BDX VERIFIED automáticamente
4. Serán redirigidos a #💰membresías
            `)
            .setColor(0x2ecc71)
            .setTimestamp();

        await interaction.editReply({ embeds: [confirmEmbed] });

        logger.info(`Sistema de verificación configurado por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error configurando sistema de verificación:', error);
        await interaction.editReply({
            content: '❌ Error configurando el sistema de verificación.'
        });
    }
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