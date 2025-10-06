# 🤖 Trading Bot Discord - Micro Futures

Un bot profesional de Discord especializado en **Micro Futures** para gestión de operaciones de trading con interfaz moderna y sistema de base de datos integrado.

**Activos Soportados:**
- 🏛️ **US30** - Micro Dow Jones
- 📊 **MNQ** - Micro NASDAQ 100  
- 🥇 **MGC** - Micro Gold

## ✨ Características

- 🎯 **Gestión de Operaciones**: Crear, actualizar y cerrar operaciones de trading
- 📊 **Embeds Visuales**: Interfaz atractiva con colores y emojis
- 🔐 **Sistema de Permisos**: Solo usuarios específicos (por ID) pueden usar los comandos
- 💾 **Base de Datos SQLite**: Almacenamiento persistente de operaciones
- 📝 **Sistema de Logs**: Registro detallado de todas las actividades
- 🚀 **Deployment en Render**: Configurado para hosting 24/7
- 🔄 **Autocompletado**: Sugerencias inteligentes en comandos
- 📈 **Micro Futures Especializado**: Enfoque exclusivo en US30, MNQ y MGC

## 🛠️ Comandos Disponibles

### `/entry` - Nueva Operación
Crea una nueva operación de trading con todos los detalles necesarios.

**Parámetros:**
- `asset`: Activo a operar (US30, MNQ, MGC)
- `type`: Tipo de orden (BUY/SELL)
- `entry_price`: Precio de entrada
- `take_profit`: Precio de Take Profit (opcional)
- `stop_loss`: Precio de Stop Loss (opcional)
- `notes`: Notas adicionales (opcional)

### `/update` - Actualizar Operación
Actualiza el estado de una operación existente.

**Parámetros:**
- `operation_id`: ID de la operación
- `status`: Nuevo estado (BE, TP1, TP2, TP3, CLOSED, STOPPED)
- `take_profit`: Nuevo TP (opcional)
- `stop_loss`: Nuevo SL (opcional)
- `notes`: Notas de la actualización (opcional)

### `/close` - Cerrar Operación
Cierra una operación con precio final y razón.

**Parámetros:**
- `operation_id`: ID de la operación
- `close_price`: Precio de cierre
- `reason`: Razón del cierre (TP, SL, Manual, etc.)
- `notes`: Notas adicionales (opcional)

### `/list` - Listar Operaciones
Muestra todas las operaciones activas o filtradas.

**Parámetros:**
- `filter`: Filtro por estado (active, closed, all)
- `asset`: Filtrar por activo específico (opcional)

### `/info` - Información Detallada
Muestra información completa de una operación específica.

**Parámetros:**
- `operation_id`: ID de la operación

## 🚀 Instalación y Configuración

### Requisitos Previos

1. **Node.js** v18 o superior
2. **Cuenta de Discord** con un servidor
3. **Bot de Discord** creado en [Discord Developer Portal](https://discord.com/developers/applications)

### 1. Crear Bot de Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a la sección "Bot" y crea un bot
4. Copia el **Token** del bot
5. Ve a "OAuth2" > "URL Generator"
6. Selecciona "bot" y "applications.commands"
7. Copia la URL generada e invita el bot a tu servidor

### 2. Configuración Local

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd trading-bot-discord

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env` con tus datos:

```env
# Discord Bot Configuration
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
GUILD_ID=tu_server_id

# Trading Configuration
ADMIN_IDS=123456789012345678,987654321098765432
TRADING_CHANNEL_ID=id_del_canal_de_trading

# Database Configuration
DATABASE_PATH=./data/trading_bot.db

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/bot.log

# Bot Settings
BOT_PREFIX=!
EMBED_COLOR_SUCCESS=0x00ff00
EMBED_COLOR_ERROR=0xff0000
EMBED_COLOR_WARNING=0xffaa00
EMBED_COLOR_INFO=0x0099ff

# Trading Assets Configuration
SUPPORTED_ASSETS=NASDAQ,US30,GOLD,OIL,EURUSD,GBPUSD,USDJPY,BTCUSD,ETHUSD
```

### 4. Registrar Comandos

```bash
# Registrar comandos slash
npm run deploy
```

### 5. Ejecutar el Bot

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

## 🌐 Deployment en Render.com

### 1. Preparar Repositorio

1. Sube tu código a GitHub
2. Asegúrate de que el archivo `render.yaml` esté en la raíz

### 2. Crear Servicio en Render

1. Ve a [Render.com](https://render.com) y conéctate con GitHub
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio
4. Render detectará automáticamente la configuración del `render.yaml`

### 3. Configurar Variables de Entorno

En el dashboard de Render, ve a "Environment" y agrega:

```
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
GUILD_ID=tu_server_id
TRADING_CHANNEL_ID=id_del_canal_de_trading
```

### 4. Desplegar

1. Haz clic en "Deploy"
2. Espera a que se complete el deployment
3. El bot estará funcionando 24/7

## 📁 Estructura del Proyecto

```
trading-bot-discord/
├── src/
│   ├── commands/          # Comandos slash del bot
│   │   ├── entry.js       # Comando /entry
│   │   ├── update.js      # Comando /update
│   │   ├── close.js       # Comando /close
│   │   ├── list.js        # Comando /list
│   │   └── info.js        # Comando /info
│   ├── config/            # Configuración del bot
│   │   └── config.js      # Variables de entorno y configuración
│   ├── database/          # Base de datos
│   │   └── database.js    # Manejo de SQLite
│   ├── utils/             # Utilidades
│   │   ├── logger.js      # Sistema de logs
│   │   ├── embeds.js      # Creación de embeds
│   │   ├── helpers.js     # Funciones auxiliares
│   │   ├── permissions.js # Sistema de permisos
│   │   └── commandLoader.js # Cargador de comandos
│   ├── index.js           # Archivo principal
│   └── deploy-commands.js # Deployment de comandos
├── data/                  # Base de datos (se crea automáticamente)
├── logs/                  # Archivos de log (se crea automáticamente)
├── .env.example          # Ejemplo de variables de entorno
├── .gitignore            # Archivos ignorados por Git
├── package.json          # Dependencias y scripts
├── render.yaml           # Configuración de Render
├── Procfile              # Comando de inicio para Render
└── README.md             # Este archivo
```

## 🔧 Configuración Avanzada

### Activos Soportados - Micro Futures

El bot está especializado en Micro Futures únicamente:

```env
SUPPORTED_ASSETS=US30,MNQ,MGC
```

**Activos Disponibles:**
- **US30** - Micro Dow Jones ($5 por punto)
- **MNQ** - Micro NASDAQ 100 ($2 por punto) 
- **MGC** - Micro Gold ($10 por onza)

### Configurar Administradores por ID

```env
ADMIN_IDS=123456789012345678,987654321098765432,111222333444555666
```

**Cómo obtener tu ID de Discord:**
1. Activa "Modo Desarrollador" en Configuración de Usuario > Avanzado
2. Haz clic derecho en tu nombre de usuario > "Copiar ID"
3. Agrega tu ID a la lista separado por comas

### Personalizar Colores de Embeds

```env
EMBED_COLOR_SUCCESS=0x00ff00  # Verde
EMBED_COLOR_ERROR=0xff0000    # Rojo
EMBED_COLOR_WARNING=0xffaa00  # Naranja
EMBED_COLOR_INFO=0x0099ff     # Azul
```

## 📊 Base de Datos

El bot utiliza SQLite para almacenar:

- **trading_operations**: Operaciones de trading
- **operation_updates**: Historial de actualizaciones
- **bot_config**: Configuración del bot

### Esquema de Operaciones

```sql
CREATE TABLE trading_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id TEXT UNIQUE NOT NULL,
    asset TEXT NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
    entry_price REAL NOT NULL,
    take_profit REAL,
    stop_loss REAL,
    status TEXT DEFAULT 'OPEN',
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 Logs y Monitoreo

### Niveles de Log

- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Información detallada (solo desarrollo)

### Archivos de Log

- `logs/bot.log`: Todos los logs
- `logs/error.log`: Solo errores
- `logs/exceptions.log`: Excepciones no capturadas
- `logs/rejections.log`: Promesas rechazadas

## 🛡️ Seguridad

- ✅ Validación de permisos por roles
- ✅ Sanitización de inputs
- ✅ Validación de tipos de datos
- ✅ Manejo de errores robusto
- ✅ Logs de seguridad
- ✅ Variables de entorno para datos sensibles

## 🚨 Solución de Problemas

### Bot No Responde

1. Verifica que el token sea correcto
2. Asegúrate de que el bot tenga permisos en el servidor
3. Revisa los logs para errores

### Comandos No Aparecen

1. Ejecuta `npm run deploy` para registrar comandos
2. Espera hasta 1 hora para propagación global
3. Verifica que el bot tenga el scope `applications.commands`

### Errores de Base de Datos

1. Verifica permisos de escritura en la carpeta `data/`
2. Asegúrate de que SQLite esté instalado
3. Revisa la ruta de la base de datos

### Deployment en Render Falla

1. Verifica todas las variables de entorno
2. Revisa los logs de deployment en Render
3. Asegúrate de que `render.yaml` esté configurado correctamente

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs del bot
2. Verifica la configuración
3. Consulta la documentación de Discord.js
4. Crea un issue en el repositorio

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Desarrollado con ❤️ para la comunidad de trading**
