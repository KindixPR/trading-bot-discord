import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        tradingChannelId: process.env.TRADING_CHANNEL_ID
    },
    
    permissions: {
        adminIds: process.env.ADMIN_IDS?.split(',').map(id => id.trim()) || []
    },
    
    database: {
        path: process.env.DATABASE_PATH || './data/trading_bot.db'
    },
    
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/bot.log'
    },
    
    bot: {
        prefix: process.env.BOT_PREFIX || '!'
    },
    
    colors: {
        success: parseInt(process.env.EMBED_COLOR_SUCCESS || '0x00ff00'),
        error: parseInt(process.env.EMBED_COLOR_ERROR || '0xff0000'),
        warning: parseInt(process.env.EMBED_COLOR_WARNING || '0xffaa00'),
        info: parseInt(process.env.EMBED_COLOR_INFO || '0x0099ff'),
        primary: 0x7289da,
        secondary: 0x99aab5
    },
    
    trading: {
        supportedAssets: process.env.SUPPORTED_ASSETS?.split(',') || [
            'US30', 'MNQ', 'MGC'  // Micro Futures Only: US30, NASDAQ Micro, Gold Micro
        ],
        
        orderTypes: ['BUY', 'SELL'],
        
        statusTypes: [
            'OPEN',
            'BE', // Break Even
            'TP1',
            'TP2', 
            'TP3',
            'CLOSED',
            'STOPPED'
        ]
    }
};

// Validar configuración crítica
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
    console.error('Por favor, crea un archivo .env basado en env.example');
    process.exit(1);
}
