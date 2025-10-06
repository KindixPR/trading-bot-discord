// Configuración específica para Micro Futures
export const microFuturesConfig = {
    US30: {
        name: 'Micro Dow Jones',
        symbol: 'US30',
        fullName: 'E-mini Dow Jones Industrial Average',
        multiplier: 5, // $5 por punto
        tickSize: 1, // Movimiento mínimo de 1 punto
        tradingHours: '24/5', // 24 horas, 5 días a la semana
        description: 'Índice del Dow Jones Industrial Average en formato micro',
        emoji: '🏛️',
        color: 0x0066cc
    },
    MNQ: {
        name: 'Micro NASDAQ 100',
        symbol: 'MNQ', 
        fullName: 'E-mini NASDAQ-100 Index',
        multiplier: 2, // $2 por punto
        tickSize: 0.25, // Movimiento mínimo de 0.25 puntos
        tradingHours: '24/5',
        description: 'Índice NASDAQ 100 en formato micro',
        emoji: '📊',
        color: 0x00aa00
    },
    MGC: {
        name: 'Micro Gold',
        symbol: 'MGC',
        fullName: 'E-micro Gold Futures',
        multiplier: 10, // $10 por onza
        tickSize: 0.1, // Movimiento mínimo de $0.10
        tradingHours: '24/5',
        description: 'Contrato de oro en formato micro',
        emoji: '🥇',
        color: 0xffaa00
    }
};

// Función para obtener información de un activo
export function getAssetInfo(symbol) {
    return microFuturesConfig[symbol] || null;
}

// Función para obtener todos los activos disponibles
export function getAllAssets() {
    return Object.keys(microFuturesConfig);
}

// Función para validar si un activo es válido
export function isValidMicroFuture(symbol) {
    return symbol in microFuturesConfig;
}

// Función para calcular el valor monetario de un movimiento
export function calculateMovementValue(symbol, points) {
    const asset = getAssetInfo(symbol);
    if (!asset) return null;
    return points * asset.multiplier;
}

// Función para formatear precio según el activo
export function formatPriceForAsset(symbol, price) {
    const asset = getAssetInfo(symbol);
    if (!asset) return price.toFixed(2);
    
    // US30 y MNQ: 2 decimales, MGC: 1 decimal
    switch (symbol) {
        case 'US30':
        case 'MNQ':
            return price.toFixed(2);
        case 'MGC':
            return price.toFixed(1);
        default:
            return price.toFixed(2);
    }
}
