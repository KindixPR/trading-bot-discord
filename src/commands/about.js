import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { database } from '../database/database.js';

const data = new SlashCommandBuilder()
    .setName('about')
    .setDescription('Información sobre Vitaly Signals Bot');

const permissions = [];

async function execute(interaction) {
    try {
        // Deferir respuesta INMEDIATAMENTE para evitar timeout
        try {
            await interaction.deferReply({ flags: 64 }); // 64 = EPHEMERAL
        } catch (error) {
            if (error.code === 10062) {
                logger.warn(`Interacción expirada para usuario ${interaction.user.tag} antes de poder responder`);
                return;
            }
            throw error;
        }

        logger.info(`Comando /about ejecutado por ${interaction.user.tag}`);

        // Crear embed principal con información del bot
        const aboutEmbed = new EmbedBuilder()
            .setTitle('🏛️ Vitaly Signals Bot')
            .setDescription(`
**Bot creado y programado por Vitaly**

🤖 **Sistema Profesional de Trading**
Desarrollado específicamente para operaciones de Micro Futures con análisis en tiempo real y gestión inteligente de señales.

📊 **Activos Soportados:**
• 🇺🇸 **US30** - Dow Jones Micro
• 📈 **MNQ** - NASDAQ Micro  
• 🥇 **MGC** - Gold Micro

⚡ **Características Principales:**
• Sistema interactivo de comandos
• Rich Presence dinámico
• Gestión automática de operaciones
• Análisis profesional de mercados
• Notificaciones inteligentes

🔧 **Tecnología:**
• Node.js + Discord.js v14
• Base de datos SQLite3
• Sistema de logs profesional
                `)
            .setColor(config.colors.primary)
            .setThumbnail('https://cdn.discordapp.com/embed/avatars/0.png') // Cambiar por tu avatar
            .addFields(
                {
                    name: '👨‍💻 Desarrollador',
                    value: '**Vitaly** - Especialista en Trading Bots',
                    inline: true
                },
                {
                    name: '📱 Redes Sociales',
                    value: '**Instagram:** [@5vitaly](https://instagram.com/5vitaly)',
                    inline: true
                },
                {
                    name: '🏷️ Tags',
                    value: '`trading` `signals` `futures` `professional` `vitaly`',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Vitaly Signals • Bot creado por @5vitaly',
                iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png'
            })
            .setTimestamp(new Date());

        // Crear botones de acción
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📱 Seguir en Instagram')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://instagram.com/5vitaly'),
                new ButtonBuilder()
                    .setLabel('📊 Ver Comandos')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('about_commands'),
                new ButtonBuilder()
                    .setLabel('📈 Estadísticas')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('about_stats')
            );

        await interaction.editReply({ 
            embeds: [aboutEmbed], 
            components: [actionRow]
        });

        logger.info(`Información del bot mostrada por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en comando about:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('Hubo un error al mostrar la información del bot.')
            .setColor(config.colors.error)
            .setTimestamp(new Date());

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
}

// Manejar interacciones de botones para about
async function handleButtonInteraction(interaction) {
    try {
        const customId = interaction.customId;

        if (customId === 'about_commands') {
            const commandsEmbed = new EmbedBuilder()
                .setTitle('📊 Comandos Disponibles')
                .setDescription(`
**Comandos Principales:**

🔸 **\`/entry\`** - Crear nueva operación de trading
   • Sistema interactivo con botones
   • Soporte para US30, MNQ, MGC
   • Gestión de TP1, TP2, SL

🔸 **\`/update\`** - Actualizar estado de operación
   • Cambio de estado (BE, TP1, TP2, TP3, SL)
   • Mensajes personalizados
   • Notificaciones automáticas

🔸 **\`/trades\`** - Ver historial de operaciones
   • Filtros por estado
   • Estadísticas detalladas
   • Gestión completa

🔸 **\`/about\`** - Información del bot
   • Detalles técnicos
   • Enlaces de contacto
   • Estadísticas del sistema
                `)
                .setColor(config.colors.info)
                .setFooter({ 
                    text: 'Vitaly Signals • Desarrollado por @5vitaly'
                })
                .setTimestamp(new Date());

            await interaction.update({ embeds: [commandsEmbed] });

        } else if (customId === 'about_stats') {
            // Obtener estadísticas de la base de datos
            const allOperations = await database.getAllOperations();
            const activeOperations = allOperations.filter(op => op.status === 'OPEN');
            const closedOperations = allOperations.filter(op => op.status === 'CLOSED');

            const statsEmbed = new EmbedBuilder()
                .setTitle('📈 Estadísticas del Sistema')
                .setDescription(`
**Estadísticas Generales:**

🔸 **Total de Operaciones:** ${allOperations.length}
🔸 **Operaciones Activas:** ${activeOperations.length}
🔸 **Operaciones Cerradas:** ${closedOperations.length}

**Por Activo:**
🔸 **US30:** ${allOperations.filter(op => op.asset === 'US30').length}
🔸 **MNQ:** ${allOperations.filter(op => op.asset === 'MNQ').length}
🔸 **MGC:** ${allOperations.filter(op => op.asset === 'MGC').length}

**Estado del Bot:**
🔸 **Uptime:** ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
🔸 **Memoria:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
🔸 **Servidores:** ${interaction.client.guilds.cache.size}
                `)
                .setColor(config.colors.success)
                .setFooter({ 
                    text: 'Vitaly Signals • Sistema Profesional'
                })
                .setTimestamp(new Date());

            await interaction.update({ embeds: [statsEmbed] });
        }

    } catch (error) {
        logger.error('Error en handleButtonInteraction (about):', error);
        await interaction.update({ 
            content: '❌ Error al procesar la solicitud.',
            components: []
        });
    }
}

export default { 
    data, 
    execute, 
    permissions,
    handleButtonInteraction
};
