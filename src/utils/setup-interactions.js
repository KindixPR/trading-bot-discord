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
            case 'verify_user':
            case 'quick_verify':
                await handleUserVerification(interaction);
                break;
            case 'view_rules':
                await handleViewRules(interaction);
                break;
            case 'view_memberships':
                await handleViewMemberships(interaction);
                break;
            case 'verify_help':
                await handleVerificationHelp(interaction);
                break;
            case 'back_to_welcome':
                await handleBackToWelcome(interaction);
                break;
            case 'explore_community':
                await handleExploreCommunity(interaction);
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

// Funciones de verificación de usuarios
async function handleUserVerification(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;
    
    try {
        // Buscar el rol BDX VERIFIED
        const verifiedRole = guild.roles.cache.find(role => role.name === '🔍 BDX VERIFIED');
        
        if (!verifiedRole) {
            await interaction.editReply({
                content: '❌ El rol de verificación no está configurado. Contacta a un administrador.'
            });
            return;
        }

        // Verificar si ya tiene el rol
        if (member.roles.cache.has(verifiedRole.id)) {
            const alreadyVerifiedEmbed = new EmbedBuilder()
                .setTitle('✅ Ya Estás Verificado')
                .setDescription(`
**🎉 ¡Felicidades!** Ya tienes el rol **🔍 BDX VERIFIED**.

**🎯 Próximos pasos:**
• Explora la comunidad en #💬chat-general
• Revisa las membresías en #💰membresías
• Lee las reglas en #📜reglas
• ¡Comienza a tradear! 🚀
                `)
                .setColor(0x2ecc71)
                .setThumbnail('https://via.placeholder.com/64x64/2ECC71/FFFFFF?text=✓')
                .setFooter({ text: 'BDX Trades • Verificación' })
                .setTimestamp();

            await interaction.editReply({ embeds: [alreadyVerifiedEmbed] });
            return;
        }

        // Asignar el rol de verificado
        await member.roles.add(verifiedRole);

        // Crear embed de verificación exitosa
        const successEmbed = new EmbedBuilder()
            .setTitle('🎉 ¡Verificación Exitosa!')
            .setDescription(`
**✅ ¡Bienvenido a BDX Trades!**

Has sido verificado exitosamente y ahora tienes acceso a:

**🎯 Contenido Disponible:**
• **Comunidad general** - #💬chat-general
• **Análisis diarios** - #📊análisis-diarios
• **Preguntas y respuestas** - #❓preguntas-y-respuestas
• **Recursos educativos** - #📚trading-academy

**💰 ¿Quieres más?**
Explora nuestras **membresías premium** en #💰membresías para acceder a:
• Señales de trading en tiempo real
• Análisis profesionales
• Chat VIP exclusivo
• Mentoría personalizada

**👑 Fundado por Vitaly** - Tu éxito es nuestro objetivo
            `)
            .setColor(0x2ecc71)
            .setThumbnail('https://via.placeholder.com/128x128/2ECC71/FFFFFF?text=✓')
            .setImage('https://via.placeholder.com/600x200/2ECC71/FFFFFF?text=¡BIENVENIDO+A+BDX+TRADES!')
            .setFooter({ text: 'BDX Trades • Comunidad Premium de Trading' })
            .setTimestamp();

        // Crear botones de acción
        const exploreButton = new ButtonBuilder()
            .setCustomId('explore_community')
            .setLabel('🌍 Explorar Comunidad')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🌍');

        const membershipsButton = new ButtonBuilder()
            .setCustomId('view_memberships')
            .setLabel('💰 Ver Membresías')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💰');

        const rulesButton = new ButtonBuilder()
            .setCustomId('view_rules')
            .setLabel('📜 Ver Reglas')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📜');

        const actionRow = new ActionRowBuilder()
            .addComponents(exploreButton, membershipsButton, rulesButton);

        await interaction.editReply({ 
            embeds: [successEmbed], 
            components: [actionRow] 
        });

        // Enviar mensaje de bienvenida al canal de verificación
        const welcomeChannel = guild.channels.cache.find(c => c.name === 'verificación');
        if (welcomeChannel) {
            const welcomeMessage = new EmbedBuilder()
                .setTitle('🎉 Nuevo Miembro Verificado')
                .setDescription(`
**¡Bienvenido ${member.user.username}!** 🎊

Se ha unido a nuestra comunidad premium de trading y ya tiene acceso al contenido base.

**🎯 Próximos pasos:**
• Explora la comunidad
• Considera una membresía premium
• ¡Comienza a tradear!

**👑 BDX Trades** - Donde los traders se convierten en profesionales
                `)
                .setColor(0x2ecc71)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: 'BDX Trades • Nuevo Miembro' })
                .setTimestamp();

            await welcomeChannel.send({ embeds: [welcomeMessage] });
        }

        logger.info(`Usuario ${member.user.tag} verificado exitosamente`);

    } catch (error) {
        logger.error('Error verificando usuario:', error);
        await interaction.editReply({
            content: '❌ Error durante la verificación. Contacta a un administrador.'
        });
    }
}

async function handleViewRules(interaction) {
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

    const backButton = new ButtonBuilder()
        .setCustomId('back_to_welcome')
        .setLabel('🏠 Volver al Inicio')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏠');

    const actionRow = new ActionRowBuilder()
        .addComponents(backButton);

    await interaction.editReply({ 
        embeds: [rulesEmbed], 
        components: [actionRow] 
    });
}

async function handleViewMemberships(interaction) {
    const membershipsEmbed = new EmbedBuilder()
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

**📊 Niveles de Membresía:**
• **🎖️ Tier 1 - Trader Básico** - Comunidad y análisis
• **💎 Tier 2 - Trader Avanzado** - Alertas y chat VIP
• **👑 Tier 3 - Trader Élite** - Clases 1-1 y mentoría

**💡 ¿Listo para comenzar?**
Visita #💰membresías para más información detallada.
        `)
        .setColor(0xffd700)
        .setThumbnail('https://via.placeholder.com/128x128/FFD700/000000?text=BDX')
        .setFooter({ text: 'BDX Trades • Membresías Premium' })
        .setTimestamp();

    const backButton = new ButtonBuilder()
        .setCustomId('back_to_welcome')
        .setLabel('🏠 Volver al Inicio')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏠');

    const actionRow = new ActionRowBuilder()
        .addComponents(backButton);

    await interaction.editReply({ 
        embeds: [membershipsEmbed], 
        components: [actionRow] 
    });
}

async function handleVerificationHelp(interaction) {
    const helpEmbed = new EmbedBuilder()
        .setTitle('❓ Ayuda con la Verificación')
        .setDescription(`
**🎯 ¿Necesitas ayuda con la verificación?**

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

**❓ ¿Problemas comunes?**
• **Botón no funciona:** Intenta recargar Discord
• **No recibo el rol:** Espera unos segundos y verifica
• **Error de permisos:** Contacta a un administrador

**📞 ¿Necesitas más ayuda?**
Contacta a un administrador en #🛠️soporte-técnico
        `)
        .setColor(0x3498db)
        .setThumbnail('https://via.placeholder.com/64x64/3498DB/FFFFFF?text=❓')
        .setFooter({ text: 'BDX Trades • Ayuda' })
        .setTimestamp();

    const backButton = new ButtonBuilder()
        .setCustomId('back_to_welcome')
        .setLabel('🏠 Volver al Inicio')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏠');

    const actionRow = new ActionRowBuilder()
        .addComponents(backButton);

    await interaction.editReply({ 
        embeds: [helpEmbed], 
        components: [actionRow] 
    });
}

async function handleBackToWelcome(interaction) {
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

    await interaction.editReply({ 
        embeds: [welcomeEmbed], 
        components: [actionRow] 
    });
}

async function handleExploreCommunity(interaction) {
    const exploreEmbed = new EmbedBuilder()
        .setTitle('🌍 Explora la Comunidad BDX Trades')
        .setDescription(`
**🎯 ¡Bienvenido a la comunidad!**

Ahora que estás verificado, puedes explorar todos los canales disponibles:

**🏠 INICIO:**
• **#👋bienvenida** - Mensaje de bienvenida
• **#✅verificación** - Sistema de verificación
• **#🆘soporte-inicial** - Ayuda para nuevos miembros

**📢 INFORMACIÓN OFICIAL:**
• **#📋sobre-bdx** - Información sobre BDX Trades
• **#📜reglas** - Reglas y términos
• **#📢anuncios** - Anuncios importantes
• **#💰membresías** - Información de membresías

**👥 COMUNIDAD (Tier 1):**
• **#💬chat-general** - Chat general
• **#📈profits** - Compartir ganancias
• **#📊análisis-diarios** - Análisis del mercado
• **#❓preguntas-y-respuestas** - Preguntas y respuestas

**📚 EDUCACIÓN & RECURSOS:**
• **#📚trading-academy** - Academia de trading
• **#📝estrategias-pro** - Estrategias profesionales
• **#🧠psicología-del-trader** - Psicología del trader
• **#🛠️herramientas-y-plantillas** - Herramientas

**🔧 SISTEMA & SOPORTE:**
• **#🤖bot-commands** - Comandos del bot
• **#📊estadísticas** - Estadísticas del servidor
• **#🛠️soporte-técnico** - Soporte técnico
• **#📢anuncios-sistema** - Anuncios del sistema

**💡 ¿Quieres más acceso?**
Considera una **membresía premium** para acceder a contenido exclusivo.
        `)
        .setColor(0x2ecc71)
        .setThumbnail('https://via.placeholder.com/128x128/2ECC71/FFFFFF?text=🌍')
        .setFooter({ text: 'BDX Trades • Explorar Comunidad' })
        .setTimestamp();

    const membershipsButton = new ButtonBuilder()
        .setCustomId('view_memberships')
        .setLabel('💰 Ver Membresías')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💰');

    const backButton = new ButtonBuilder()
        .setCustomId('back_to_welcome')
        .setLabel('🏠 Volver al Inicio')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏠');

    const actionRow = new ActionRowBuilder()
        .addComponents(membershipsButton, backButton);

    await interaction.editReply({ 
        embeds: [exploreEmbed], 
        components: [actionRow] 
    });
}