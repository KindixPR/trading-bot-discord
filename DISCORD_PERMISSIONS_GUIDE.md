# 🔐 Guía de Permisos de Discord - Trading Bot

Esta guía te explica exactamente qué permisos configurar en el Discord Developer Portal para que el bot funcione correctamente.

## 🎯 Permisos Necesarios en Discord Developer Portal

### 1️⃣ **Intents (Intenciones)**

Ve a tu bot en [Discord Developer Portal](https://discord.com/developers/applications) → Selecciona tu bot → **"Bot"** → Scroll hacia abajo hasta **"Privileged Gateway Intents"**

#### ✅ **Intents Requeridos:**
- ✅ **SERVER MEMBERS INTENT** - NO (no lo necesitamos)
- ✅ **MESSAGE CONTENT INTENT** - NO (no lo necesitamos para slash commands)
- ✅ **PRESENCE INTENT** - NO (no lo necesitamos)

**Para nuestro bot solo necesitamos los intents básicos:**
- ✅ **Guilds** (automáticamente habilitado)
- ❌ **Guild Members** (NO habilitar)
- ❌ **Message Content** (NO habilitar)

### 2️⃣ **Bot Permissions (Permisos del Bot)**

Cuando invites el bot al servidor, necesita estos permisos:

#### 📋 **Permisos Esenciales:**
- ✅ **Send Messages** - Para enviar embeds de operaciones
- ✅ **Use Slash Commands** - Para que funcionen los comandos /
- ✅ **Embed Links** - Para mostrar embeds con colores y formato
- ✅ **Read Message History** - Para leer mensajes (opcional)

#### 📋 **Permisos Opcionales:**
- ❌ **Manage Messages** - NO necesario
- ❌ **Manage Roles** - NO necesario
- ❌ **Administrator** - NO necesario

### 3️⃣ **OAuth2 Scopes (Alcances)**

Cuando generes la URL de invitación, selecciona estos scopes:

#### ✅ **Scopes Requeridos:**
- ✅ **bot** - Permite que el bot se una al servidor
- ✅ **applications.commands** - Permite usar comandos slash

#### ❌ **Scopes NO Necesarios:**
- ❌ **guilds** - NO necesario
- ❌ **guilds.members.read** - NO necesario
- ❌ **guilds.messages.read** - NO necesario

## 🚀 **Pasos Detallados para Configurar**

### **Paso 1: Verificar Intents**
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación/bot
3. Ve a **"Bot"** en el menú lateral
4. Scroll hacia abajo hasta **"Privileged Gateway Intents"**
5. **DEJA TODO DESHABILITADO** (Server Members Intent, Message Content Intent, Presence Intent)

### **Paso 2: Generar URL de Invitación**
1. Ve a **"OAuth2"** → **"URL Generator"**
2. En **"Scopes"** selecciona:
   - ✅ **bot**
   - ✅ **applications.commands**
3. En **"Bot Permissions"** selecciona:
   - ✅ **Send Messages**
   - ✅ **Use Slash Commands**
   - ✅ **Embed Links**
   - ✅ **Read Message History**
4. Copia la URL generada
5. Abre la URL en tu navegador e invita el bot a tu servidor

### **Paso 3: Verificar Configuración**

#### **Configuración Correcta:**
```
Intents: Solo Guilds (básico)
Scopes: bot + applications.commands
Bot Permissions: Send Messages, Use Slash Commands, Embed Links, Read Message History
```

#### **Configuración Incorrecta (que causa errores):**
```
❌ Intents: Server Members Intent habilitado
❌ Intents: Message Content Intent habilitado
❌ Permissions: Administrator habilitado (innecesario)
❌ Scopes: guilds.members.read habilitado
```

## 🔧 **Configuración Mínima Recomendada**

### **Para Desarrollo Local:**
```yaml
Intents:
  - Guilds (automático)

Scopes:
  - bot
  - applications.commands

Bot Permissions:
  - Send Messages
  - Use Slash Commands
  - Embed Links
  - Read Message History
```

### **Para Producción (Render.com):**
```yaml
Intents:
  - Guilds (automático)

Scopes:
  - bot
  - applications.commands

Bot Permissions:
  - Send Messages
  - Use Slash Commands
  - Embed Links
  - Read Message History
```

## 🐛 **Solucionando Errores Comunes**

### **Error: "Used disallowed intents"**
**Causa:** Tienes habilitado un intent privilegiado que no necesitas
**Solución:**
1. Ve a Discord Developer Portal → Bot → Privileged Gateway Intents
2. **DESHABILITA** todos los intents privilegiados
3. Reinicia el bot

### **Error: "Missing Permissions"**
**Causa:** El bot no tiene permisos en el canal
**Solución:**
1. Verifica que el bot tenga permisos en el canal
2. Asegúrate de que `TRADING_CHANNEL_ID` sea correcto
3. Verifica que el bot esté en el servidor

### **Error: "Application Commands Not Found"**
**Causa:** Los comandos no están registrados
**Solución:**
1. Ejecuta `npm run deploy`
2. Espera hasta 1 hora para propagación global
3. Verifica que el bot tenga el scope `applications.commands`

## 📋 **Checklist de Configuración**

Antes de ejecutar el bot, verifica:

- [ ] ✅ **Intents:** Solo Guilds habilitado
- [ ] ✅ **Scopes:** bot + applications.commands
- [ ] ✅ **Bot Permissions:** Send Messages, Use Slash Commands, Embed Links
- [ ] ✅ **Bot invitado al servidor**
- [ ] ✅ **Variables de entorno configuradas**
- [ ] ✅ **Comandos registrados** (`npm run deploy`)

## 🎯 **URL de Invitación Ejemplo**

Una URL de invitación correcta se ve así:
```
https://discord.com/api/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=2048&scope=bot%20applications.commands
```

Donde:
- `client_id=TU_CLIENT_ID` - Tu Client ID
- `permissions=2048` - Permisos mínimos (Send Messages, Use Slash Commands, Embed Links)
- `scope=bot%20applications.commands` - Scopes necesarios

## ⚠️ **Importante**

1. **NO habilites intents privilegiados** a menos que sea absolutamente necesario
2. **Usa permisos mínimos** - solo los que realmente necesitas
3. **Los comandos slash pueden tardar hasta 1 hora** en propagarse globalmente
4. **Para desarrollo, usa GUILD_ID** en .env para comandos instantáneos

---

**Con esta configuración, tu bot funcionará perfectamente sin errores de permisos! 🚀**
