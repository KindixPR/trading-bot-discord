import express from 'express';
import { deployCommands } from './deploy-commands.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint para limpiar comandos
app.get('/cleanup-commands', async (req, res) => {
    try {
        logger.info('🧹 Limpieza de comandos solicitada via HTTP...');
        
        // Ejecutar limpieza de comandos
        await deployCommands();
        
        res.json({
            success: true,
            message: 'Comandos limpiados exitosamente',
            timestamp: new Date().toISOString()
        });
        
        logger.info('✅ Limpieza de comandos completada via HTTP');
    } catch (error) {
        logger.error('❌ Error en limpieza via HTTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error limpiando comandos',
            error: error.message
        });
    }
});

// Endpoint de estado
app.get('/status', (req, res) => {
    res.json({
        status: 'Bot running',
        timestamp: new Date().toISOString(),
        commands: ['entry', 'update', 'trades', 'about', 'clear']
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`🌐 Servidor HTTP iniciado en puerto ${PORT}`);
    logger.info(`🔗 Endpoint de limpieza: http://localhost:${PORT}/cleanup-commands`);
});

export default app;