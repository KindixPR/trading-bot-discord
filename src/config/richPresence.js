// Configuración de Rich Presence personalizado para BDX Traders

export const richPresenceConfig = {
    // Actividades principales del bot
    mainActivities: [
        {
            name: 'BDX Traders - Micro Futures',
            type: 'Watching',
            state: 'Sistema Profesional de Trading',
            emoji: '🏛️'
        },
        {
            name: 'US30, MNQ, MGC',
            type: 'Playing',
            state: 'Micro Futures Trading',
            emoji: '📈'
        },
        {
            name: 'Operaciones Activas',
            type: 'Listening',
            state: 'Monitoreando Mercados',
            emoji: '👂'
        },
        {
            name: 'BDX Traders',
            type: 'Streaming',
            state: 'Trading en Tiempo Real',
            emoji: '📺',
            url: 'https://twitch.tv/bdx-traders' // Cambiar por tu stream si tienes
        },
        {
            name: 'Sistema Profesional',
            type: 'Watching',
            state: 'Analizando Mercados',
            emoji: '🔍'
        },
        {
            name: 'Micro Futures',
            type: 'Playing',
            state: 'BDX Trading Platform',
            emoji: '🎮'
        },
        {
            name: 'BDX Traders',
            type: 'Watching',
            state: 'Servidores: 1 | Usuarios: Activos',
            emoji: '👥'
        },
        {
            name: 'Trading Signals',
            type: 'Listening',
            state: 'Procesando Señales',
            emoji: '📡'
        }
    ],

    // Actividades específicas por comando
    commandActivities: {
        'entry': {
            name: 'Creando Operación',
            type: 'Playing',
            state: 'Nueva Señal de Trading',
            emoji: '➕'
        },
        'update': {
            name: 'Actualizando Operación',
            type: 'Watching',
            state: 'Modificando Estado',
            emoji: '🔄'
        },
        'trades': {
            name: 'Consultando Operaciones',
            type: 'Listening',
            state: 'Analizando Historial',
            emoji: '📊'
        }
    },

    // Actividades por tipo de activo
    assetActivities: {
        'US30': {
            name: 'Dow Jones Micro',
            type: 'Watching',
            state: 'US30 - Índice Industrial',
            emoji: '🇺🇸'
        },
        'MNQ': {
            name: 'NASDAQ Micro',
            type: 'Watching',
            state: 'MNQ - Tecnología',
            emoji: '📈'
        },
        'MGC': {
            name: 'Gold Micro',
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
        streaming: 'https://twitch.tv/bdx-traders',
        website: 'https://bdx-traders.com',
        support: 'https://discord.gg/bdx-traders'
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
