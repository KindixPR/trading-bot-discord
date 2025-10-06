import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../utils/logger.js';

const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configurar roles y permisos del bot (Solo administradores)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const permissions = ['ADMINISTRATOR'];

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

        logger.info(`Comando /setup ejecutado por ${interaction.user.tag}`);

        const guild = interaction.guild;
        if (!guild) {
            await interaction.editReply({
                content: '❌ Este comando solo puede usarse en un servidor.'
            });
            return;
        }

        // Crear roles del bot si no existen
        const rolesToCreate = [
            {
                name: 'Vitaly Signals Bot',
                color: 0x1abc9c, // Verde azulado
                reason: 'Rol principal del bot Vitaly Signals',
                permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'UseExternalEmojis']
            },
            {
                name: 'Trading Assistant',
                color: 0x3498db, // Azul
                reason: 'Rol de asistente de trading',
                permissions: ['ViewChannel', 'SendMessages', 'EmbedLinks']
            },
            {
                name: 'Market Analyst',
                color: 0xf39c12, // Naranja
                reason: 'Rol de analista de mercados',
                permissions: ['ViewChannel', 'SendMessages']
            },
            {
                name: 'Signal Provider',
                color: 0xe74c3c, // Rojo
                reason: 'Rol de proveedor de señales',
                permissions: ['ViewChannel', 'SendMessages']
            }
        ];

        const createdRoles = [];
        const existingRoles = [];

        for (const roleConfig of rolesToCreate) {
            try {
                // Verificar si el rol ya existe
                let role = guild.roles.cache.find(r => r.name === roleConfig.name);
                
                if (!role) {
                    // Crear el rol
                    role = await guild.roles.create({
                        name: roleConfig.name,
                        color: roleConfig.color,
                        reason: roleConfig.reason,
                        permissions: roleConfig.permissions
                    });
                    createdRoles.push(role.name);
                    logger.info(`Rol creado: ${role.name}`);
                } else {
                    existingRoles.push(role.name);
                    logger.info(`Rol ya existe: ${role.name}`);
                }
            } catch (error) {
                logger.error(`Error creando rol ${roleConfig.name}:`, error);
            }
        }

        // Asignar el rol principal al bot
        try {
            const botRole = guild.roles.cache.find(r => r.name === 'Vitaly Signals Bot');
            const botMember = guild.members.cache.get(interaction.client.user.id);
            
            if (botRole && botMember && !botMember.roles.cache.has(botRole.id)) {
                await botMember.roles.add(botRole);
                logger.info('Rol principal asignado al bot');
            }
        } catch (error) {
            logger.error('Error asignando rol al bot:', error);
        }

        // Crear canales si no existen
        const channelsToCreate = [
            {
                name: 'vitaly-signals',
                type: 'GUILD_TEXT',
                reason: 'Canal principal para señales de Vitaly',
                topic: '📈 Canal oficial de Vitaly Signals - Trading profesional'
            },
            {
                name: 'trading-logs',
                type: 'GUILD_TEXT',
                reason: 'Canal para logs de trading',
                topic: '📊 Logs y estadísticas del sistema de trading'
            }
        ];

        const createdChannels = [];
        const existingChannels = [];

        for (const channelConfig of channelsToCreate) {
            try {
                // Verificar si el canal ya existe
                let channel = guild.channels.cache.find(c => c.name === channelConfig.name);
                
                if (!channel) {
                    // Crear el canal
                    channel = await guild.channels.create({
                        name: channelConfig.name,
                        type: channelConfig.type,
                        reason: channelConfig.reason,
                        topic: channelConfig.topic
                    });
                    createdChannels.push(channel.name);
                    logger.info(`Canal creado: ${channel.name}`);
                } else {
                    existingChannels.push(channel.name);
                    logger.info(`Canal ya existe: ${channel.name}`);
                }
            } catch (error) {
                logger.error(`Error creando canal ${channelConfig.name}:`, error);
            }
        }

        // Crear embed de confirmación
        const setupEmbed = {
            title: '🏛️ Configuración de Vitaly Signals Completada',
            description: `
**Bot creado y programado por Vitaly**

✅ **Roles configurados:**
${createdRoles.length > 0 ? `• Creados: ${createdRoles.join(', ')}` : ''}
${existingRoles.length > 0 ? `• Existentes: ${existingRoles.join(', ')}` : ''}

✅ **Canales configurados:**
${createdChannels.length > 0 ? `• Creados: ${createdChannels.join(', ')}` : ''}
${existingChannels.length > 0 ? `• Existentes: ${existingChannels.join(', ')}` : ''}

📱 **Redes Sociales:**
• Instagram: [@5vitaly](https://instagram.com/5vitaly)

🏷️ **Tags del Bot:**
\`trading\` \`signals\` \`futures\` \`professional\` \`vitaly\`
            `,
            color: 0x1abc9c,
            footer: {
                text: 'Vitaly Signals • Desarrollado por @5vitaly'
            },
            timestamp: new Date().toISOString()
        };

        await interaction.editReply({ 
            embeds: [setupEmbed]
        });

        logger.info(`Configuración completada por ${interaction.user.tag}`);

    } catch (error) {
        logger.error('Error en comando setup:', error);
        await interaction.editReply({
            content: '❌ Hubo un error durante la configuración. Por favor, verifica los permisos del bot.'
        });
    }
}

export default { 
    data, 
    execute, 
    permissions
};
