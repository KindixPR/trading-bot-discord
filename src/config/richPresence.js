// Configuración de Rich Presence personalizado para BDX Traders

export const richPresenceConfig = {
    // Actividades principales del bot
    mainActivities: [
        {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'Sistema Profesional de Trading',
            emoji: '🏛️'
        },
        {
            name: 'Vitaly Signals',
            type: 'Playing',
            state: 'Trading en Tiempo Real',
            emoji: '📈'
        },
        {
            name: 'Vitaly Signals',
            type: 'Listening',
            state: 'Monitoreando Mercados',
            emoji: '👂'
        },
        {
            name: 'Vitaly Signals',
            type: 'Streaming',
            state: 'Análisis de Mercados',
            emoji: '📺',
            url: 'https://twitch.tv/vitaly-signals' // Cambiar por tu stream si tienes
        },
        {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'Analizando Señales',
            emoji: '🔍'
        },
        {
            name: 'Vitaly Signals',
            type: 'Playing',
            state: 'BDX Trading Platform',
            emoji: '🎮'
        },
        {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'Servidores: 1 | Usuarios: Activos',
            emoji: '👥'
        },
        {
            name: 'Vitaly Signals',
            type: 'Listening',
            state: 'Procesando Operaciones',
            emoji: '📡'
        }
    ],

    // Actividades específicas por comando
    commandActivities: {
        'entry': {
            name: 'Vitaly Signals',
            type: 'Playing',
            state: 'Nueva Señal de Trading',
            emoji: '➕'
        },
        'update': {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'Actualizando Operación',
            emoji: '🔄'
        },
        'trades': {
            name: 'Vitaly Signals',
            type: 'Listening',
            state: 'Consultando Historial',
            emoji: '📊'
        }
    },

    // Actividades por tipo de activo
    assetActivities: {
        'US30': {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'US30 - Índice Industrial',
            emoji: '🇺🇸'
        },
        'MNQ': {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'MNQ - Tecnología',
            emoji: '📈'
        },
        'MGC': {
            name: 'Vitaly Signals',
            type: 'Watching',
            state: 'MGC - Oro',
            emoji: '🥇'
        }
    },

    // Configuración de timing
    timing: {
        mainRotationInterval: 30000,    // 30 segundos entre cambios principales
        commandDisplayDuration: 10000,  // 10 segundos para mostrar actividad de comando
        assetDisplayDuration: 15000     // 15 segundos para mostrar actividad de activo
    },

    // URLs personalizadas (opcional)
    customUrls: {
        streaming: 'https://twitch.tv/vitaly-signals',
        website: 'https://vitaly-signals.com',
        support: 'https://discord.gg/vitaly-signals'
    }
};

// Función para obtener actividad aleatoria de las principales
export function getRandomMainActivity() {
    const activities = richPresenceConfig.mainActivities;
    return activities[Math.floor(Math.random() * activities.length)];
}

// Función para obtener actividad específica de comando
export function getCommandActivity(commandName) {
    return richPresenceConfig.commandActivities[commandName] || null;
}

// Función para obtener actividad específica de activo
export function getAssetActivity(assetName) {
    return richPresenceConfig.assetActivities[assetName] || null;
}

// Función para formatear estado con información dinámica
export function formatStateWithStats(baseState, stats = {}) {
    let formattedState = baseState;
    
    if (stats.activeOperations) {
        formattedState += ` | Activas: ${stats.activeOperations}`;
    }
    
    if (stats.totalOperations) {
        formattedState += ` | Total: ${stats.totalOperations}`;
    }
    
    if (stats.serverCount) {
        formattedState += ` | Servidores: ${stats.serverCount}`;
    }
    
    return formattedState;
}
