// Configuración de branding y apariencia profesional del bot

export const branding = {
    // Información de la empresa
    company: {
        name: 'BDX Traders',
        tagline: 'Sistema Profesional de Trading',
        website: 'https://bdx-traders.com', // Cambiar por tu sitio web real
        support: 'support@bdx-traders.com' // Cambiar por tu email de soporte
    },
    
    // Colores del tema profesional
    colors: {
        primary: '#2c3e50',      // Azul oscuro elegante
        secondary: '#34495e',    // Gris azulado
        accent: '#1abc9c',       // Verde azulado
        gold: '#ffd700',         // Dorado premium
        success: '#00d4aa',      // Verde profesional
        error: '#e74c3c',        // Rojo elegante
        warning: '#f39c12',      // Naranja dorado
        info: '#3498db'          // Azul profesional
    },
    
    // Emojis profesionales
    emojis: {
        company: '🏛️',
        trading: '📈',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        money: '💰',
        chart: '📊',
        target: '🎯',
        shield: '🛡️',
        clock: '⏰',
        user: '👤',
        rocket: '🚀'
    },
    
    // Mensajes profesionales
    messages: {
        welcome: 'Bienvenido a BDX Traders - Tu sistema profesional de trading',
        support: '¿Necesitas ayuda? Contacta a nuestro equipo de soporte',
        footer: 'BDX Traders • Sistema Profesional de Trading',
        poweredBy: 'Powered by BDX Traders Technology'
    },
    
    // URLs de recursos
    assets: {
        logo: 'https://cdn.discordapp.com/embed/avatars/0.png', // Cambiar por tu logo
        banner: 'https://via.placeholder.com/600x200/2c3e50/ffffff?text=BDX+Traders', // Cambiar por tu banner
        icon: 'https://cdn.discordapp.com/embed/avatars/0.png' // Cambiar por tu icono
    }
};

// Función para obtener un color aleatorio del tema
export function getRandomThemeColor() {
    const colors = Object.values(branding.colors);
    return colors[Math.floor(Math.random() * colors.length)];
}

// Función para crear un embed con branding consistente
export function createBrandedEmbed(options = {}) {
    const {
        title,
        description,
        color = branding.colors.primary,
        fields = [],
        footer = branding.messages.footer,
        thumbnail = null,
        image = null
    } = options;
    
    const embed = {
        title: title ? `${branding.emojis.company} ${title}` : undefined,
        description,
        color: parseInt(color.replace('#', ''), 16),
        fields,
        footer: {
            text: footer,
            icon_url: branding.assets.icon
        },
        thumbnail,
        image,
        timestamp: new Date().toISOString()
    };
    
    return embed;
}

// Función para formatear números con estilo profesional
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Función para formatear porcentajes
export function formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
}
