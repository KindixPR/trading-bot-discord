/**
 * Servidor HTTP simple para Render.com
 * Los bots Discord no necesitan puertos HTTP, pero Render requiere uno para servicios "web"
 */

import http from 'http';
import { deployCommands } from './deploy-commands.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Respuesta simple para health check
    if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'trading-bot-discord',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }
    
    // Endpoint para limpiar comandos
    if (req.url === '/cleanup-commands') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        // Ejecutar limpieza de comandos
        deployCommands()
            .then(() => {
                logger.info('🧹 Limpieza de comandos ejecutada via HTTP');
                res.end(JSON.stringify({
                    success: true,
                    message: 'Comandos limpiados exitosamente',
                    timestamp: new Date().toISOString(),
                    commands: ['entry', 'update', 'trades', 'about', 'clear']
                }));
            })
            .catch((error) => {
                logger.error('❌ Error en limpieza via HTTP:', error);
                res.end(JSON.stringify({
                    success: false,
                    message: 'Error limpiando comandos',
                    error: error.message,
                    timestamp: new Date().toISOString()
                }));
            });
        return;
    }
    
    // 404 para otras rutas
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        error: 'Not Found',
        message: 'This is a Discord bot service. No web interface available.'
    }));
});

server.listen(PORT, () => {
    console.log(`🚀 HTTP Server running on port ${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Manejo de errores del servidor
server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

export default server;
