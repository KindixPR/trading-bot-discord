import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de logs si no existe
const logDir = path.dirname(config.logging.file);
import fs from 'fs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configurar formato personalizado
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
);

// Crear logger
export const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: [
        // Archivo para todos los logs
        new winston.transports.File({
            filename: config.logging.file,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Archivo solo para errores
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 3
        }),
        
        // Consola para desarrollo
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
    
    // Manejar excepciones no capturadas
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log')
        })
    ],
    
    // Manejar rechazos de promesas no manejados
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log')
        })
    ]
});

// Función para logging de operaciones de trading
export const logTradingOperation = (operation, details) => {
    logger.info('TRADING OPERATION', {
        operation,
        details,
        timestamp: new Date().toISOString()
    });
};

// Función para logging de errores de trading
export const logTradingError = (error, context) => {
    logger.error('TRADING ERROR', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};
