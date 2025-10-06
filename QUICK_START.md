# ⚡ Inicio Rápido - Trading Bot Discord

## 🚀 Configuración en 5 Pasos

### 1️⃣ Configuración Automática (Recomendado)

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**Linux/Mac (Bash):**
```bash
bash scripts/setup.sh
```

### 2️⃣ Configuración Manual

```bash
# Instalar dependencias
npm install

# Crear archivo de configuración
cp env.example .env

# Editar .env con tus datos de Discord
```

### 3️⃣ Configurar Variables de Entorno

Edita el archivo `.env` con tus datos:

```env
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
GUILD_ID=tu_server_id
TRADING_CHANNEL_ID=id_del_canal
ADMIN_IDS=123456789012345678,987654321098765432
```

### 4️⃣ Registrar Comandos

```bash
npm run deploy
```

### 5️⃣ Ejecutar Bot

```bash
npm start
```

## 🧪 Probar el Bot

### Comando de Prueba Básico
```
/entry asset:US30 type:BUY entry_price:35000 take_profit:35100 stop_loss:34900 notes:Prueba
```

### Verificar Lista
```
/list
```

## 📋 Checklist Rápido

- [ ] Node.js v18+ instalado
- [ ] Bot creado en Discord Developer Portal
- [ ] Bot invitado al servidor con permisos
- [ ] Archivo .env configurado
- [ ] `npm install` ejecutado
- [ ] `npm run deploy` ejecutado
- [ ] `npm start` ejecutado
- [ ] Bot aparece como "Online" en Discord
- [ ] Comandos slash aparecen al escribir `/`

## 🐛 Problemas Comunes

### Bot No Se Conecta
1. Verificar `DISCORD_TOKEN` en .env
2. Verificar que el bot tenga permisos en el servidor
3. Revisar logs en la consola

### Comandos No Aparecen
1. Ejecutar `npm run deploy`
2. Esperar hasta 1 hora para propagación
3. Verificar `GUILD_ID` en .env

### Errores de Base de Datos
1. Verificar que la carpeta `data/` tenga permisos de escritura
2. Verificar `DATABASE_PATH` en .env

## 📖 Documentación Completa

- **`SETUP_LOCAL.md`** - Guía completa de configuración local
- **`scripts/test-commands.md`** - Lista de comandos de prueba
- **`MICRO_FUTURES_GUIDE.md`** - Guía específica de micro futuros
- **`DEPLOYMENT.md`** - Guía para deployment en Render

## 🎯 Activos Soportados

- **🏛️ US30** - Micro Dow Jones ($5 por punto)
- **📊 MNQ** - Micro NASDAQ 100 ($2 por punto)
- **🥇 MGC** - Micro Gold ($10 por onza)

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del bot
2. Ejecuta `npm run verify` para verificar configuración
3. Consulta la documentación completa
4. Verifica que todas las dependencias estén instaladas

---

**¡El bot estará funcionando en menos de 10 minutos! 🚀**
