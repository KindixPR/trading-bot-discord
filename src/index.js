import { Client, GatewayIntentBits, Collection, Events, ActivityType } from 'discord.js';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { database } from './database/database.js';
import { loadCommands } from './utils/commandLoader.js';
import { checkPermissions } from './utils/permissions.js';
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

    async start() {
        try {
            // Inicializar base de datos
            await database.initialize();
            logger.info('Base de datos inicializada correctamente');

            // Cargar comandos
            await loadCommands(this.commands);
            logger.info(`Cargados ${this.commands.size} comandos`);

            // Conectar al bot
            await this.client.login(config.discord.token);
        } catch (error) {
            logger.error('Error al iniciar el bot:', error);
            process.exit(1);
        }
    }

    setupEventHandlers() {
        // Evento de conexión
        this.client.once(Events.ClientReady, (readyClient) => {
            logger.info(`Bot conectado como ${readyClient.user.tag}`);
            
            // Establecer actividad
            this.client.user.setActivity('Trading Operations', { 
                type: ActivityType.Watching 
            });
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
