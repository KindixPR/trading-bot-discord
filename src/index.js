import { Client, GatewayIntentBits, Collection, Events, ActivityType } from 'discord.js';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { database } from './database/database.js';
import { loadCommands } from './utils/commandLoader.js';
import { checkPermissions } from './utils/permissions.js';
import { richPresenceConfig, getRandomMainActivity, getCommandActivity, getAssetActivity } from './config/richPresence.js';
import { deployCommands } from './deploy-commands.js';
import server from './server.js';

class TradingBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds
            ]
        });

        this.commands = new Collection();
        this.setupEventHandlers();
    }

    // Sistema de Rich Presence dinámico y profesional
    setupRichPresence() {
        let currentIndex = 0;
        
        const updateActivity = () => {
            const activity = richPresenceConfig.mainActivities[currentIndex];
            const activityType = ActivityType[activity.type];
            
            // Usar solo el estado como nombre para evitar "Viendo/Jugando"
            this.client.user.setActivity(activity.state, {
                type: activityType,
                url: activity.url
            });
            
            logger.info(`Rich Presence actualizado: ${activity.emoji} ${activity.state}`);
            currentIndex = (currentIndex + 1) % richPresenceConfig.mainActivities.length;
        };

        // Establecer actividad inicial
        updateActivity();
        
        // Cambiar cada 30 segundos
        setInterval(updateActivity, richPresenceConfig.timing.mainRotationInterval);
        
        logger.info('✅ Rich Presence dinámico configurado exitosamente');
    }

    // Método para actualizar Rich Presence basado en actividad específica
    async updateRichPresenceForOperation(operationType, asset = null) {
        const activity = getCommandActivity(operationType);
        
        if (activity) {
            const activityType = ActivityType[activity.type];
            
            // Si hay un activo específico, personalizar el mensaje
            let displayState = activity.state;
            
            if (asset && operationType === 'entry') {
                const assetActivity = getAssetActivity(asset);
                if (assetActivity) {
                    displayState = `Nueva Operación ${asset}`;
                }
            }
            
            // Usar solo el estado como nombre para evitar "Viendo/Jugando"
            this.client.user.setActivity(displayState, {
                type: activityType
            });
            
            logger.info(`Rich Presence temporal: ${activity.emoji} ${displayState}`);
            
            // Volver al Rich Presence normal después del tiempo configurado
            setTimeout(() => {
                this.setupRichPresence();
            }, richPresenceConfig.timing.commandDisplayDuration);
        }
    }

    async start() {
        try {
            // Inicializar base de datos
            await database.initialize();
            logger.info('Base de datos inicializada correctamente');
            
            // Verificar que las tablas existen y crear operación de prueba si es necesario
            await this.verifyDatabaseSetup();

            // Cargar comandos
            await loadCommands(this.commands);
            logger.info(`Cargados ${this.commands.size} comandos`);

            // Registrar comandos en Discord
            logger.info('🔄 Registrando comandos en Discord...');
            await deployCommands();
            logger.info('✅ Comandos registrados en Discord');

            // Conectar al bot
            await this.client.login(config.discord.token);
        } catch (error) {
            logger.error('Error al iniciar el bot:', error);
            process.exit(1);
        }
    }

    async verifyDatabaseSetup() {
        try {
            logger.info('🔍 Verificando configuración de base de datos...');
            
            // Verificar que las tablas existen
            const tableCheck = await database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_operations'");
            if (!tableCheck) {
                logger.error('CRÍTICO: Tabla trading_operations no existe');
                throw new Error('Tabla trading_operations no existe');
            }
            logger.info('✅ Tabla trading_operations verificada');
            
            // Verificar si hay operaciones
            const operations = await database.getActiveOperations();
            logger.info(`📊 Operaciones activas encontradas: ${operations ? operations.length : 0}`);
            
            // Si no hay operaciones, crear una de prueba
            if (!operations || operations.length === 0) {
                logger.info('🧪 No hay operaciones, creando operación de prueba...');
                const testOperation = {
                    operationId: 'TEST-' + Date.now(),
                    asset: 'US30',
                    orderType: 'BUY',
                    entryPrice: 35000.0,
                    takeProfit1: 35100.0,
                    stopLoss: 34900.0,
                    status: 'OPEN',
                    notes: 'Operación de prueba - Sistema funcionando correctamente',
                    createdBy: 'system'
                };
                
                const createdOp = await database.createOperation(testOperation);
                if (createdOp) {
                    logger.info('✅ Operación de prueba creada exitosamente');
                } else {
                    logger.warn('⚠️ No se pudo crear operación de prueba');
                }
            }
            
            logger.info('✅ Verificación de base de datos completada');
        } catch (error) {
            logger.error('Error verificando configuración de base de datos:', error);
            // No lanzar error para no detener el bot
        }
    }

    setupEventHandlers() {
        // Evento de conexión
        this.client.once(Events.ClientReady, (readyClient) => {
            logger.info(`Bot conectado como ${readyClient.user.tag}`);
            
            // Establecer actividad del bot - Rich Presence profesional
            this.setupRichPresence();
        });

        // Evento de comandos slash
        this.client.on(Events.InteractionCreate, async (interaction) => {
            try {
                // Manejar autocompletado
                if (interaction.isAutocomplete()) {
                    const command = this.commands.get(interaction.commandName);
                    if (command && command.autocomplete) {
                        try {
                            await command.autocomplete(interaction);
                        } catch (error) {
                            logger.error(`Error en autocompletado para comando ${interaction.commandName}:`, error);
                        }
                    }
                    return;
                }

                // Manejar comandos slash
                if (interaction.isChatInputCommand()) {
                    await this.handleSlashCommand(interaction);
                    return;
                }

                // Manejar botones
                if (interaction.isButton()) {
                    await this.handleButtonInteraction(interaction);
                    return;
                }

                // Manejar modales
                if (interaction.isModalSubmit()) {
                    await this.handleModalSubmit(interaction);
                    return;
                }
            } catch (error) {
                logger.error('Error en manejo de interacción:', error);
            }
        });

        // Evento de errores
        this.client.on(Events.Error, (error) => {
            logger.error('Error del cliente Discord:', error);
        });

        // Evento de warnings
        this.client.on(Events.Warn, (warning) => {
            logger.warn('Warning del cliente Discord:', warning);
        });

        // Manejo de cierre graceful
        process.on('SIGINT', async () => {
            logger.info('Cerrando bot...');
            await database.close();
            this.client.destroy();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            logger.info('Cerrando bot...');
            await database.close();
            this.client.destroy();
            process.exit(0);
        });
    }

    // Método para manejar comandos slash
    async handleSlashCommand(interaction) {
        const command = this.commands.get(interaction.commandName);
        if (!command) {
            logger.warn(`Comando no encontrado: ${interaction.commandName}`);
            return;
        }

        // Verificar permisos
        if (!checkPermissions(interaction, command)) {
            const embed = {
                color: config.colors.error,
                title: '❌ Acceso Denegado',
                description: 'No tienes permisos para usar este comando.',
                timestamp: new Date().toISOString()
            };
            
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        try {
            // Actualizar Rich Presence basado en el comando
            await this.updateRichPresenceForOperation(interaction.commandName);
            
            await command.execute(interaction);
            logger.info(`Comando ejecutado: ${interaction.commandName} por ${interaction.user.tag}`);
        } catch (error) {
            logger.error(`Error ejecutando comando ${interaction.commandName}:`, error);
            // NO intentar responder aquí para evitar conflictos
        }
    }

    // Método para manejar interacciones de botones
    async handleButtonInteraction(interaction) {
        try {
            const customId = interaction.customId;
            
            if (customId.startsWith('asset_') || customId.startsWith('type_')) {
                // Comando entry
                const { default: entryCommand } = await import('./commands/entry.js');
                if (entryCommand.handleButtonInteraction) {
                    await entryCommand.handleButtonInteraction(interaction);
                }
            } else if (customId.startsWith('update_op_') || customId.startsWith('status_')) {
                // Comando update
                const { default: updateCommand } = await import('./commands/update.js');
                if (updateCommand.handleButtonInteraction) {
                    await updateCommand.handleButtonInteraction(interaction);
                }
            } else if (customId.startsWith('trades_')) {
                // Comando trades
                const { default: tradesCommand } = await import('./commands/trades.js');
                if (tradesCommand.handleButtonInteraction) {
                    await tradesCommand.handleButtonInteraction(interaction);
                }
            } else if (customId.startsWith('setup_') || customId.startsWith('reset_')) {
                // Comando setup
                const { handleSetupButtonInteraction } = await import('./utils/setup-interactions.js');
                await handleSetupButtonInteraction(interaction);
            } else {
                logger.warn(`Botón no reconocido: ${customId}`);
                await interaction.reply({ content: '❌ Botón no reconocido.', flags: 64 });
            }
        } catch (error) {
            logger.error('Error en handleButtonInteraction:', error);
            // NO intentar responder aquí para evitar errores
        }
    }

    // Método para manejar envío de modales
    async handleModalSubmit(interaction) {
        try {
            const customId = interaction.customId;
            
            if (customId === 'trade_modal') {
                // Comando entry
                const { default: entryCommand } = await import('./commands/entry.js');
                if (entryCommand.handleModalSubmit) {
                    await entryCommand.handleModalSubmit(interaction);
                }
            } else if (customId === 'update_notes_modal') {
                // Comando update
                const { default: updateCommand } = await import('./commands/update.js');
                if (updateCommand.handleModalSubmit) {
                    await updateCommand.handleModalSubmit(interaction);
                }
            } else {
                logger.warn(`Modal no reconocido: ${customId}`);
                await interaction.reply({ content: '❌ Modal no reconocido.', flags: 64 });
            }
        } catch (error) {
            logger.error('Error en handleModalSubmit:', error);
            // NO intentar responder aquí para evitar errores
        }
    }
}

// Iniciar el bot
const bot = new TradingBot();
bot.start().catch(error => {
    logger.error('Error fatal al iniciar el bot:', error);
    process.exit(1);
});

export default TradingBot;
