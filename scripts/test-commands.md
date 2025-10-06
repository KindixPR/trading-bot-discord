# 🧪 Comandos de Prueba - Trading Bot Discord

Esta lista te ayudará a probar todos los comandos del bot de manera sistemática.

## 📋 Checklist de Pruebas

### ✅ 1. Verificar Conexión
- [ ] Bot aparece como "Online" en Discord
- [ ] Actividad muestra "Watching Trading Operations"
- [ ] No hay errores en la consola

### ✅ 2. Verificar Comandos Slash
- [ ] `/entry` aparece en autocompletado
- [ ] `/update` aparece en autocompletado
- [ ] `/close` aparece en autocompletado
- [ ] `/list` aparece en autocompletado
- [ ] `/info` aparece en autocompletado

## 🎯 Comandos de Prueba por Activo

### 🏛️ US30 (Micro Dow Jones)

#### Crear Operación de Compra
```
/entry asset:US30 type:BUY entry_price:35000 take_profit:35100 stop_loss:34900 notes:Prueba US30 Compra
```

#### Crear Operación de Venta
```
/entry asset:US30 type:SELL entry_price:35000 take_profit:34900 stop_loss:35100 notes:Prueba US30 Venta
```

### 📊 MNQ (Micro NASDAQ 100)

#### Crear Operación de Compra
```
/entry asset:MNQ type:BUY entry_price:15000 take_profit:15050 stop_loss:14950 notes:Prueba MNQ Compra
```

#### Crear Operación de Venta
```
/entry asset:MNQ type:SELL entry_price:15000 take_profit:14950 stop_loss:15050 notes:Prueba MNQ Venta
```

### 🥇 MGC (Micro Gold)

#### Crear Operación de Compra
```
/entry asset:MGC type:BUY entry_price:2000 take_profit:2010 stop_loss:1990 notes:Prueba MGC Compra
```

#### Crear Operación de Venta
```
/entry asset:MGC type:SELL entry_price:2000 take_profit:1990 stop_loss:2010 notes:Prueba MGC Venta
```

## 🔄 Comandos de Actualización

### Obtener ID de Operación
Primero ejecuta `/list` para obtener el ID de una operación activa.

### Actualizar a Break Even
```
/update operation_id:TRADE_ABC123 status:BE notes:Movido a Break Even
```

### Actualizar a Take Profit 1
```
/update operation_id:TRADE_ABC123 status:TP1 notes:TP1 Alcanzado
```

### Actualizar a Take Profit 2
```
/update operation_id:TRADE_ABC123 status:TP2 notes:TP2 Alcanzado
```

### Actualizar a Take Profit 3
```
/update operation_id:TRADE_ABC123 status:TP3 notes:TP3 Alcanzado
```

## 🚪 Comandos de Cierre

### Cerrar con Take Profit
```
/close operation_id:TRADE_ABC123 close_price:35100 reason:TAKE_PROFIT notes:TP Alcanzado
```

### Cerrar con Stop Loss
```
/close operation_id:TRADE_ABC123 close_price:34900 reason:STOP_LOSS notes:SL Alcanzado
```

### Cerrar Manualmente
```
/close operation_id:TRADE_ABC123 close_price:35050 reason:MANUAL_CLOSE notes:Cierre Manual
```

### Cerrar por Tiempo
```
/close operation_id:TRADE_ABC123 close_price:35025 reason:TIME_CLOSE notes:Cierre por Tiempo
```

## 📊 Comandos de Consulta

### Listar Operaciones Activas
```
/list filter:active
```

### Listar Operaciones Cerradas
```
/list filter:closed
```

### Listar Todas las Operaciones
```
/list filter:all
```

### Filtrar por Activo
```
/list filter:active asset:US30
```

### Información Detallada
```
/info operation_id:TRADE_ABC123
```

## 🧪 Pruebas de Validación

### ❌ Pruebas de Error - Activos Inválidos
```
/entry asset:INVALID type:BUY entry_price:1000
```

### ❌ Pruebas de Error - Precios Inválidos
```
/entry asset:US30 type:BUY entry_price:-1000
```

### ❌ Pruebas de Error - Lógica TP/SL Incorrecta
```
/entry asset:US30 type:BUY entry_price:35000 take_profit:34900 stop_loss:35100
```

### ❌ Pruebas de Error - Operación No Encontrada
```
/update operation_id:INVALID_ID status:BE
```

## 📋 Checklist de Verificaciones

### ✅ Embeds Visuales
- [ ] Colores correctos (verde para BUY, rojo para SELL)
- [ ] Emojis específicos por activo (🏛️ US30, 📊 MNQ, 🥇 MGC)
- [ ] Información del contrato se muestra correctamente
- [ ] Precios formateados según el activo
- [ ] Timestamps y footers correctos

### ✅ Cálculos Monetarios
- [ ] US30: $5 por punto
- [ ] MNQ: $2 por punto
- [ ] MGC: $10 por onza
- [ ] Valor monetario se calcula correctamente en cierres

### ✅ Base de Datos
- [ ] Operaciones se guardan correctamente
- [ ] Actualizaciones se registran
- [ ] Historial se mantiene
- [ ] Archivo .db se crea en data/

### ✅ Logs
- [ ] Logs se generan en logs/
- [ ] Diferentes niveles de log funcionan
- [ ] Errores se registran correctamente
- [ ] Operaciones de trading se logean

### ✅ Permisos
- [ ] Solo administradores pueden usar comandos
- [ ] Usuarios sin permisos reciben error
- [ ] Mensajes de error son claros

### ✅ Autocompletado
- [ ] Activos aparecen en autocompletado
- [ ] IDs de operaciones aparecen en autocompletado
- [ ] Filtrado funciona correctamente

## 🐛 Problemas Comunes y Soluciones

### Bot No Responde
1. Verificar que esté online
2. Revisar logs para errores
3. Verificar permisos del bot en el canal

### Comandos No Aparecen
1. Ejecutar `npm run deploy`
2. Esperar hasta 1 hora
3. Verificar GUILD_ID en .env

### Errores de Base de Datos
1. Verificar permisos de escritura
2. Revisar ruta de base de datos
3. Verificar que SQLite esté disponible

### Embeds No Se Muestran
1. Verificar permisos "Embed Links"
2. Revisar formato de datos
3. Verificar configuración de colores

## 📊 Ejemplo de Sesión de Prueba Completa

1. **Crear operación US30:**
   ```
   /entry asset:US30 type:BUY entry_price:35000 take_profit:35100 stop_loss:34900
   ```

2. **Listar operaciones:**
   ```
   /list
   ```

3. **Actualizar a BE:**
   ```
   /update operation_id:TRADE_XXX status:BE
   ```

4. **Actualizar a TP1:**
   ```
   /update operation_id:TRADE_XXX status:TP1
   ```

5. **Cerrar operación:**
   ```
   /close operation_id:TRADE_XXX close_price:35100 reason:TAKE_PROFIT
   ```

6. **Ver información:**
   ```
   /info operation_id:TRADE_XXX
   ```

---

**¡Una vez que todas las pruebas pasen, el bot estará listo para producción! 🚀**
