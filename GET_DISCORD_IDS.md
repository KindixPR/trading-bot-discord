# 🆔 Cómo Obtener IDs de Discord

Esta guía te ayudará a obtener todos los IDs necesarios para configurar el bot.

## 🔧 Activar Modo Desarrollador

Antes de obtener cualquier ID, necesitas activar el "Modo Desarrollador":

1. Abre Discord
2. Ve a **Configuración de Usuario** (engranaje en la esquina inferior izquierda)
3. Ve a **Avanzado**
4. Activa **"Modo Desarrollador"**

## 📋 IDs Necesarios

### 1️⃣ CLIENT_ID (ID de la Aplicación)

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación/bot
3. Ve a **"General Information"**
4. Copia el **"Application ID"**
5. Este es tu `CLIENT_ID`

### 2️⃣ GUILD_ID (ID del Servidor)

1. En Discord, haz clic derecho en el nombre de tu servidor
2. Selecciona **"Copiar ID"**
3. Este es tu `GUILD_ID`

### 3️⃣ TRADING_CHANNEL_ID (ID del Canal)

1. Haz clic derecho en el canal donde quieres que funcione el bot
2. Selecciona **"Copiar ID"**
3. Este es tu `TRADING_CHANNEL_ID`

### 4️⃣ ADMIN_IDS (IDs de Usuarios Administradores)

Para cada persona que quieras que pueda usar el bot:

1. Haz clic derecho en su nombre de usuario
2. Selecciona **"Copiar ID"**
3. Agrega todos los IDs separados por comas

**Ejemplo:**
```env
ADMIN_IDS=123456789012345678,987654321098765432,111222333444555666
```

## 📝 Ejemplo Completo de .env

```env
# Discord Bot Configuration
DISCORD_TOKEN=tu_token_del_bot_aqui
CLIENT_ID=1424194726210572329
GUILD_ID=1342545548909215764

# Trading Configuration
ADMIN_IDS=123456789012345678,987654321098765432
TRADING_CHANNEL_ID=1234567890123456789

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

## 🔍 Verificar IDs

### Verificar que los IDs son correctos:

1. **CLIENT_ID**: Debe ser un número de 17-18 dígitos
2. **GUILD_ID**: Debe ser un número de 17-18 dígitos
3. **TRADING_CHANNEL_ID**: Debe ser un número de 17-18 dígitos
4. **ADMIN_IDS**: Cada ID debe ser un número de 17-18 dígitos

### Ejemplo de IDs válidos:
```
CLIENT_ID=1424194726210572329
GUILD_ID=1342545548909215764
TRADING_CHANNEL_ID=1234567890123456789
ADMIN_IDS=123456789012345678,987654321098765432
```

## ⚠️ Problemas Comunes

### No puedo copiar IDs
1. Asegúrate de que "Modo Desarrollador" esté activado
2. Haz clic derecho directamente en el elemento (no en el texto)
3. La opción "Copiar ID" debe aparecer en el menú

### Los IDs no funcionan
1. Verifica que no haya espacios extra
2. Asegúrate de que sean números (no texto)
3. Verifica que el bot tenga permisos en el servidor
4. Verifica que el bot esté en el servidor

### El bot no responde a mis comandos
1. Verifica que tu ID esté en `ADMIN_IDS`
2. Verifica que no haya espacios en la lista de IDs
3. Verifica que el canal esté configurado correctamente

## 🛠️ Comandos de Discord para Verificar

Una vez configurado, puedes verificar que todo funciona:

### En el canal de trading:
```
/entry asset:US30 type:BUY entry_price:35000
```

### Si tienes permisos, deberías ver:
- El comando se ejecuta sin errores
- Se muestra el embed de la operación
- No aparece mensaje de "Acceso Denegado"

### Si no tienes permisos, verás:
- Mensaje de "❌ Acceso Denegado"
- "No tienes permisos para usar este comando"

## 📞 Soporte

Si sigues teniendo problemas:

1. **Verifica que todos los IDs sean correctos**
2. **Ejecuta `npm run verify` para verificar configuración**
3. **Revisa los logs del bot para errores específicos**
4. **Asegúrate de que el bot esté invitado al servidor con permisos**

---

**¡Con estos IDs configurados correctamente, tu bot funcionará perfectamente! 🚀**
