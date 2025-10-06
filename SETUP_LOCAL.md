# 🚀 Guía de Configuración Local - Trading Bot Discord

Esta guía te ayudará a configurar y probar el bot localmente antes de subirlo a GitHub y hacer el deployment en Render.

## 📋 Prerrequisitos

1. ✅ **Node.js v18+** instalado
2. ✅ **Git** instalado
3. ✅ **Bot de Discord** creado en Discord Developer Portal
4. ✅ **Servidor de Discord** para pruebas

## 🔧 Paso 1: Configurar Variables de Entorno

### 1.1 Crear archivo .env
```bash
# Copiar el archivo de ejemplo
cp env.example .env
```

### 1.2 Editar .env con tus datos
```env
# Discord Bot Configuration
DISCORD_TOKEN=tu_token_del_bot_aqui
CLIENT_ID=tu_client_id_aqui
GUILD_ID=tu_server_id_aqui

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

# Trading Assets Configuration - Micro Futures Only
SUPPORTED_ASSETS=US30,MNQ,MGC
```

## 🚀 Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install
```

## 📝 Paso 3: Obtener Credenciales de Discord

### 3.1 Crear Bot en Discord Developer Portal
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Clic en "New Application"
3. Dale un nombre (ej: "Trading Bot")
4. Ve a "Bot" en el menú lateral
5. Clic en "Add Bot"
6. Copia el **Token** (este es tu `DISCORD_TOKEN`)

### 3.2 Obtener Client ID
1. En la misma página, ve a "General Information"
2. Copia el **Application ID** (este es tu `CLIENT_ID`)

### 3.3 Invitar Bot al Servidor
1. Ve a "OAuth2" > "URL Generator"
2. Selecciona scopes: `bot` y `applications.commands`
3. Selecciona permisos del bot:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History
4. Copia la URL generada y ábrela en tu navegador
5. Selecciona tu servidor y autoriza

### 3.4 Obtener Guild ID (ID del Servidor)
1. En Discord, ve a Configuración del Usuario > Avanzado
2. Activa "Modo Desarrollador"
3. Haz clic derecho en tu servidor > "Copiar ID"
4. Este es tu `GUILD_ID`

### 3.5 Obtener Channel ID (ID del Canal)
1. Haz clic derecho en el canal donde quieres que funcione el bot
2. "Copiar ID"
3. Este es tu `TRADING_CHANNEL_ID`

### 3.6 Obtener tu User ID (ID de Usuario)
1. Haz clic derecho en tu nombre de usuario en Discord
2. "Copiar ID"
3. Agrega tu ID a `ADMIN_IDS` en el archivo .env
4. Puedes agregar múltiples IDs separados por comas

## 🔧 Paso 4: Registrar Comandos Slash

```bash
# Registrar todos los comandos slash en Discord
npm run deploy
```

**Salida esperada:**
```
✅ Iniciando deployment de comandos...
✅ Registrando 5 comandos...
✅ Comandos registrados en servidor específico.
✅ Deployment de comandos completado exitosamente!
```

## 🚀 Paso 5: Ejecutar el Bot

### 5.1 Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

### 5.2 Modo Producción
```bash
npm start
```

**Salida esperada:**
```
✅ Base de datos inicializada correctamente
✅ Cargados 5 comandos
✅ Bot conectado como TradingBot#1234
```

## 🧪 Paso 6: Probar el Bot

### 6.1 Verificar Conexión
- El bot debe aparecer como "Online" en tu servidor
- Debe mostrar actividad "Watching Trading Operations"

### 6.2 Probar Comandos
1. Ve al canal configurado
2. Escribe `/` y verifica que aparezcan los comandos:
   - `/entry`
   - `/update`
   - `/close`
   - `/list`
   - `/info`

### 6.3 Crear Operación de Prueba
```
/entry asset:US30 type:BUY entry_price:35000 take_profit:35100 stop_loss:34900 notes:Prueba local
```

**Verificaciones:**
- ✅ El embed se muestra correctamente
- ✅ La operación se guarda en la base de datos
- ✅ Los precios se formatean correctamente
- ✅ La información del contrato aparece

### 6.4 Probar Otros Comandos
```
/list
/update operation_id:TRADE_XXX status:BE
/close operation_id:TRADE_XXX close_price:35050 reason:MANUAL_CLOSE
```

## 📊 Paso 7: Verificar Base de Datos

### 7.1 Verificar Archivos Creados
```bash
# Verificar que se crearon las carpetas y archivos
ls -la data/
ls -la logs/
```

### 7.2 Verificar Logs
```bash
# Ver los logs del bot
tail -f logs/bot.log
```

## 🐛 Solución de Problemas

### Bot No Se Conecta
1. **Verificar Token**: Asegúrate de que el `DISCORD_TOKEN` sea correcto
2. **Verificar Permisos**: El bot debe tener permisos en el servidor
3. **Verificar Internet**: Conexión a internet estable

### Comandos No Aparecen
1. **Ejecutar deploy**: `npm run deploy`
2. **Esperar propagación**: Hasta 1 hora para comandos globales
3. **Verificar GUILD_ID**: Debe ser correcto

### Errores de Base de Datos
1. **Permisos de escritura**: La carpeta debe tener permisos de escritura
2. **Ruta correcta**: Verificar `DATABASE_PATH` en .env
3. **SQLite instalado**: Debe estar disponible en el sistema

### Errores de Permisos
1. **Roles de administrador**: Verificar que tienes uno de los roles en `ADMIN_ROLES`
2. **Canal correcto**: Verificar `TRADING_CHANNEL_ID`

## 📁 Estructura de Archivos Después del Setup

```
trading-bot-discord/
├── .env                    # Variables de entorno (NO subir a Git)
├── data/
│   └── trading_bot.db     # Base de datos SQLite
├── logs/
│   ├── bot.log            # Logs principales
│   ├── error.log          # Solo errores
│   ├── exceptions.log     # Excepciones no capturadas
│   └── rejections.log     # Promesas rechazadas
├── src/                   # Código fuente
├── node_modules/          # Dependencias
└── package.json
```

## 🚀 Paso 8: Preparar para GitHub

### 8.1 Verificar .gitignore
Asegúrate de que `.gitignore` incluya:
```
.env
data/
logs/
node_modules/
```

### 8.2 Crear README Local
El README.md ya está configurado con instrucciones completas.

### 8.3 Probar Todo Localmente
Antes de subir a GitHub, asegúrate de que:
- ✅ El bot se conecta correctamente
- ✅ Todos los comandos funcionan
- ✅ La base de datos se crea y funciona
- ✅ Los logs se generan correctamente
- ✅ Los embeds se muestran bien
- ✅ Los cálculos monetarios son correctos

## 📤 Paso 9: Subir a GitHub

### 9.1 Inicializar Git (si no está inicializado)
```bash
git init
git add .
git commit -m "Initial commit: Trading Bot Discord for Micro Futures"
```

### 9.2 Crear Repositorio en GitHub
1. Ve a GitHub.com
2. Clic en "New repository"
3. Nombre: `trading-bot-discord`
4. Descripción: "Bot profesional de Discord para Micro Futures"
5. Clic en "Create repository"

### 9.3 Conectar y Subir
```bash
git remote add origin https://github.com/tu-usuario/trading-bot-discord.git
git branch -M main
git push -u origin main
```

## 🎯 Verificación Final

Antes de hacer deployment en Render, verifica:

1. ✅ **Bot funciona localmente**
2. ✅ **Todos los comandos probados**
3. ✅ **Base de datos funciona**
4. ✅ **Logs se generan correctamente**
5. ✅ **Código subido a GitHub**
6. ✅ **Variables de entorno documentadas**

## 🚀 Siguiente Paso: Deployment

Una vez que todo funcione localmente y esté en GitHub, puedes proceder con el deployment en Render siguiendo la guía `DEPLOYMENT.md`.

---

**¡Tu bot estará listo para funcionar 24/7 en producción! 🚀**
