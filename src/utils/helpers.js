import crypto from 'crypto';
import moment from 'moment';

// Configurar moment para español
moment.locale('es');

/**
 * Genera un ID único para una operación
 * @returns {string} - ID único generado
 */
export function generateOperationId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `TRADE_${timestamp}_${random}`.toUpperCase();
}

/**
 * Formatea un precio para mostrar
 * @param {number} price - Precio a formatear
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} - Precio formateado
 */
export function formatPrice(price, decimals = 2) {
    if (price === null || price === undefined) return 'N/A';
    return Number(price).toFixed(decimals);
}

/**
 * Calcula la diferencia en pips entre dos precios
 * @param {number} entryPrice - Precio de entrada
 * @param {number} currentPrice - Precio actual
 * @param {string} orderType - Tipo de orden (BUY/SELL)
 * @returns {number} - Diferencia en pips
 */
export function calculatePips(entryPrice, currentPrice, orderType) {
    if (orderType === 'BUY') {
        return (currentPrice - entryPrice).toFixed(2);
    } else {
        return (entryPrice - currentPrice).toFixed(2);
    }
}

/**
 * Valida si un activo está soportado
 * @param {string} asset - Nombre del activo
 * @param {Array} supportedAssets - Lista de activos soportados
 * @returns {boolean} - True si está soportado
 */
export function isValidAsset(asset, supportedAssets = ['US30', 'MNQ', 'MGC']) {
    return supportedAssets.includes(asset.toUpperCase());
}

/**
 * Valida si un tipo de orden es válido
 * @param {string} orderType - Tipo de orden
 * @returns {boolean} - True si es válido
 */
export function isValidOrderType(orderType) {
    return ['BUY', 'SELL'].includes(orderType.toUpperCase());
}

/**
 * Valida si un estado de operación es válido
 * @param {string} status - Estado de la operación
 * @returns {boolean} - True si es válido
 */
export function isValidStatus(status) {
    return ['OPEN', 'BE', 'TP1', 'TP2', 'TP3', 'CLOSED', 'STOPPED'].includes(status.toUpperCase());
}

/**
 * Formatea una fecha para mostrar
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado (default: 'DD/MM/YYYY HH:mm:ss')
 * @returns {string} - Fecha formateada
 */
export function formatDate(date, format = 'DD/MM/YYYY HH:mm:ss') {
    if (!date) return 'N/A';
    return moment(date).format(format);
}

/**
 * Formatea un tiempo relativo (ej: "hace 2 horas")
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Tiempo relativo formateado
 */
export function formatRelativeTime(date) {
    if (!date) return 'N/A';
    return moment(date).fromNow();
}

/**
 * Sanitiza texto para evitar inyección de código
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export function sanitizeText(text) {
    if (!text) return '';
    return text.replace(/[<>@#&!]/g, '');
}

/**
 * Valida si un precio es válido
 * @param {string|number} price - Precio a validar
 * @returns {boolean} - True si es válido
 */
export function isValidPrice(price) {
    if (!price) return false;
    const numPrice = Number(price);
    return !isNaN(numPrice) && numPrice > 0 && numPrice < 1000000;
}

/**
 * Obtiene el emoji correspondiente a un tipo de orden
 * @param {string} orderType - Tipo de orden
 * @returns {string} - Emoji correspondiente
 */
export function getOrderTypeEmoji(orderType) {
    switch (orderType.toUpperCase()) {
        case 'BUY':
            return '🟢';
        case 'SELL':
            return '🔴';
        default:
            return '📊';
    }
}

/**
 * Obtiene el emoji correspondiente a un estado de operación
 * @param {string} status - Estado de la operación
 * @returns {string} - Emoji correspondiente
 */
export function getStatusEmoji(status) {
    switch (status.toUpperCase()) {
        case 'OPEN':
            return '📊';
        case 'BE':
            return '⚖️';
        case 'TP1':
        case 'TP2':
        case 'TP3':
            return '🎯';
        case 'CLOSED':
            return '✅';
        case 'STOPPED':
            return '🛑';
        default:
            return '❓';
    }
}

/**
 * Trunca texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convierte un objeto a string JSON seguro
 * @param {Object} obj - Objeto a convertir
 * @returns {string} - JSON string
 */
export function safeJsonStringify(obj) {
    try {
        return JSON.stringify(obj, null, 2);
    } catch (error) {
        return 'Error serializando objeto';
    }
}
