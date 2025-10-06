# 🚀 Guía de Deploy en Render.com

## 📋 **PREPARACIÓN PREVIA**

### ✅ **1. Verificar que todo funciona localmente:**
```bash
npm install
npm start
```

### ✅ **2. Variables de entorno requeridas:**
- `DISCORD_TOKEN` - Token del bot
- `CLIENT_ID` - ID de la aplicación Discord
- `GUILD_ID` - ID del servidor Discord
- `ADMIN_IDS` - IDs de usuarios administradores (separados por comas)
- `TRADING_CHANNEL_ID` - ID del canal de trading

## 🔧 **CONFIGURACIÓN EN RENDER.COM**

### 📁 **1. Crear Repositorio GitHub:**
```bash
git init
git add .
git commit -m "Trading Bot Discord - Ready for deploy"
git branch -M main
git remote add origin https://github.com/tu-usuario/trading-bot-discord.git
git push -u origin main
```

### 🌐 **2. Conectar con Render.com:**
1. Ve a [render.com](https://render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio GitHub
4. Selecciona el repositorio del bot

### ⚙️ **3. Configuración del Servicio:**
- **Name:** `trading-bot-discord`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free` (para empezar)

### 🔑 **4. Variables de Entorno:**
Configura estas variables en Render.com:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Token del bot Discord | `MTQyNDE5NDcyNjIxMDU3MjMyOQ.Gr4CdM...` |
| `CLIENT_ID` | ID de la aplicación | `1424194726210572329` |
| `GUILD_ID` | ID del servidor | `1342545548909215764` |
| `ADMIN_IDS` | IDs de administradores | `344529428778450946` |
| `TRADING_CHANNEL_ID` | ID del canal | `1342582985722957912` |
| `NODE_ENV` | Entorno de producción | `production` |

## 🚀 **DEPLOY AUTOMÁTICO**

### ✅ **5. Deploy:**
1. Haz clic en "Create Web Service"
2. Render.com comenzará el deploy automáticamente
3. Monitorea los logs en tiempo real
4. El bot estará disponible en unos minutos

## 📊 **MONITOREO Y MANTENIMIENTO**

### 🔍 **Logs en Tiempo Real:**
- Ve a tu servicio en Render.com
- Clic en "Logs" para ver la actividad del bot
- Los logs se actualizan automáticamente

### 🔄 **Auto-Restart:**
- El bot se reinicia automáticamente si falla
- Render.com monitorea la salud del servicio
- Notificaciones por email si hay problemas

### 📈 **Métricas:**
- CPU y memoria utilizados
- Tiempo de respuesta
- Estado del servicio (UP/DOWN)

## 🛠️ **TROUBLESHOOTING**

### ❌ **Problemas Comunes:**

#### **1. Bot no responde:**
- Verificar que el token sea correcto
- Revisar logs para errores
- Confirmar que los comandos estén registrados

#### **2. Error de permisos:**
- Verificar `ADMIN_IDS` en variables de entorno
- Confirmar IDs de usuarios Discord
- Revisar permisos del bot en Discord

#### **3. Base de datos no funciona:**
- Verificar rutas de archivos
- Confirmar permisos de escritura
- Revisar logs de base de datos

### 🔧 **Comandos de Debug:**
```bash
# Ver logs del bot
npm start

# Verificar configuración
npm run verify

# Deploy de comandos
npm run deploy
```

## 💰 **PLANES Y COSTOS**

### 🆓 **Plan Gratuito:**
- ✅ 750 horas/mes
- ✅ Auto-sleep cuando no hay tráfico
- ✅ SSL automático
- ✅ Deploy automático desde GitHub

### 💎 **Plan Pago ($7/mes):**
- ⚡ Siempre activo (sin sleep)
- 📊 Más recursos (CPU/RAM)
- 🔔 Alertas avanzadas
- 📈 Métricas detalladas

## 🎯 **PRÓXIMOS PASOS**

1. **✅ Deploy del bot principal**
2. **📊 Crear bot de track record**
3. **🔗 Configurar comunicación entre bots**
4. **📈 Monitoreo y optimización**

---

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs en Render.com
2. Verifica las variables de entorno
3. Confirma que el bot tenga permisos en Discord
4. Contacta soporte si persisten los problemas

**¡Tu bot estará funcionando 24/7 en Render.com! 🚀✨**
