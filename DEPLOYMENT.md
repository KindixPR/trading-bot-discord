# 🚀 Guía de Deployment - Trading Bot Discord

Esta guía te ayudará a desplegar tu bot de trading en Render.com de forma profesional y confiable.

## 📋 Prerrequisitos

1. ✅ Código del bot subido a GitHub
2. ✅ Cuenta en [Render.com](https://render.com)
3. ✅ Bot de Discord creado y configurado
4. ✅ Variables de entorno listas

## 🔧 Configuración en Render.com

### Paso 1: Crear Nuevo Servicio

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio del bot

### Paso 2: Configurar el Servicio

**Configuración Básica:**
- **Name**: `trading-bot-discord`
- **Environment**: `Node`
- **Branch**: `main` (o tu rama principal)
- **Root Directory**: Dejar vacío
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Configuración Avanzada:**
- **Instance Type**: `Free` (para empezar) o `Starter` (recomendado)
- **Auto-Deploy**: `Yes` (para actualizaciones automáticas)

### Paso 3: Variables de Entorno

Agrega las siguientes variables en la sección "Environment":

```env
NODE_ENV=production
DISCORD_TOKEN=tu_token_del_bot_aqui
CLIENT_ID=tu_client_id_aqui
GUILD_ID=tu_server_id_aqui
TRADING_CHANNEL_ID=id_del_canal_de_trading
ADMIN_IDS=123456789012345678,987654321098765432
DATABASE_PATH=/opt/render/project/src/data/trading_bot.db
LOG_LEVEL=info
LOG_FILE=/opt/render/project/src/logs/bot.log
EMBED_COLOR_SUCCESS=0x00ff00
EMBED_COLOR_ERROR=0xff0000
EMBED_COLOR_WARNING=0xffaa00
EMBED_COLOR_INFO=0x0099ff
SUPPORTED_ASSETS=US30,MNQ,MGC
```

### Paso 4: Desplegar

1. Haz clic en "Create Web Service"
2. Render comenzará a construir y desplegar tu bot
3. El proceso puede tomar 2-5 minutos
4. Verás el estado en tiempo real en los logs

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

1. Ve a tu servicio en Render Dashboard
2. Haz clic en la pestaña "Logs"
3. Podrás ver todos los logs del bot en tiempo real

### Logs Importantes a Monitorear

```bash
# Inicio exitoso
✅ Bot conectado como TradingBot#1234
✅ Base de datos inicializada correctamente
✅ Cargados 5 comandos

# Errores comunes
❌ Error conectando a la base de datos
❌ Comando no encontrado
❌ Error ejecutando comando
```

## 🔄 Actualizaciones Automáticas

Con Auto-Deploy habilitado:

1. Haz push a tu rama principal en GitHub
2. Render detectará los cambios automáticamente
3. Reconstruirá y redesplegará el bot
4. Recibirás notificación por email

## 🛠️ Comandos Post-Deployment

### Registrar Comandos Slash

Después del primer deployment, necesitas registrar los comandos:

1. Ve a la pestaña "Shell" de tu servicio en Render
2. Ejecuta: `npm run deploy`
3. Esto registrará todos los comandos slash en Discord

### Verificar Estado del Bot

1. Ve a tu servidor de Discord
2. Verifica que el bot esté online
3. Prueba un comando básico como `/list`

## 🔧 Configuración Avanzada

### Health Checks

Render verificará automáticamente que tu bot esté funcionando. El bot responde a:

- **GET** `/` - Health check básico
- **Status Code** `200` - Bot funcionando

### Persistent Storage

La base de datos SQLite se almacena en:
```
/opt/render/project/src/data/trading_bot.db
```

Los logs se guardan en:
```
/opt/render/project/src/logs/
```

### Variables de Entorno Sensibles

⚠️ **NUNCA** pongas tokens o datos sensibles en el código. Usa siempre variables de entorno.

## 🚨 Solución de Problemas

### Bot No Inicia

**Problema**: El bot no se conecta
**Solución**:
1. Verifica el `DISCORD_TOKEN` en variables de entorno
2. Revisa los logs para errores específicos
3. Asegúrate de que el bot tenga permisos en el servidor

### Comandos No Aparecen

**Problema**: Los comandos slash no se muestran
**Solución**:
1. Ejecuta `npm run deploy` en el shell de Render
2. Espera hasta 1 hora para propagación global
3. Verifica que el bot tenga el scope `applications.commands`

### Errores de Base de Datos

**Problema**: Errores al acceder a la base de datos
**Solución**:
1. Verifica que la ruta de la base de datos sea correcta
2. Revisa permisos de escritura
3. El bot creará automáticamente la estructura necesaria

### Memory Issues

**Problema**: El bot se queda sin memoria
**Solución**:
1. Actualiza a un plan superior (Starter o Professional)
2. Optimiza el código para usar menos memoria
3. Revisa los logs para detectar memory leaks

## 📈 Escalabilidad

### Planes de Render

- **Free**: Para desarrollo y testing
- **Starter ($7/mes)**: Para bots pequeños-medianos
- **Professional ($25/mes)**: Para bots con alta demanda
- **Enterprise**: Para bots corporativos

### Recomendaciones

1. **Empezar con Free** para testing
2. **Actualizar a Starter** cuando el bot esté en producción
3. **Monitorear uso de recursos** regularmente
4. **Configurar alertas** para downtime

## 🔐 Seguridad en Producción

### Mejores Prácticas

1. ✅ Usar variables de entorno para datos sensibles
2. ✅ Rotar tokens regularmente
3. ✅ Monitorear logs para actividad sospechosa
4. ✅ Mantener dependencias actualizadas
5. ✅ Usar HTTPS para webhooks (si aplica)

### Backup de Datos

1. **Base de datos**: Render mantiene backups automáticos
2. **Configuración**: Mantén copia de variables de entorno
3. **Código**: GitHub actúa como backup del código

## 📞 Soporte

### Recursos de Ayuda

1. **Render Docs**: [render.com/docs](https://render.com/docs)
2. **Discord.js Docs**: [discord.js.org](https://discord.js.org)
3. **Discord Developer Portal**: [discord.com/developers](https://discord.com/developers)

### Contacto

Si tienes problemas específicos con el deployment:
1. Revisa los logs de Render
2. Verifica la configuración
3. Consulta la documentación
4. Crea un issue en el repositorio

---

**¡Tu bot estará funcionando 24/7 en Render! 🚀**
