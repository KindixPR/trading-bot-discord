# 📊 Guía de Micro Futures - Trading Bot Discord

Esta guía explica cómo usar el bot específicamente para operar **Micro Futures** y las características especiales de cada activo.

## 🎯 Activos Soportados

### 🏛️ US30 - Micro Dow Jones
- **Símbolo**: US30
- **Nombre Completo**: E-mini Dow Jones Industrial Average
- **Multiplicador**: $5 por punto
- **Tick Size**: 1 punto (movimiento mínimo)
- **Horarios**: 24/5 (24 horas, 5 días a la semana)
- **Ejemplo**: Si compras a 35,000 y vendes a 35,100, ganas $500

### 📊 MNQ - Micro NASDAQ 100
- **Símbolo**: MNQ
- **Nombre Completo**: E-mini NASDAQ-100 Index
- **Multiplicador**: $2 por punto
- **Tick Size**: 0.25 puntos (movimiento mínimo)
- **Horarios**: 24/5
- **Ejemplo**: Si compras a 15,000 y vendes a 15,025, ganas $50

### 🥇 MGC - Micro Gold
- **Símbolo**: MGC
- **Nombre Completo**: E-micro Gold Futures
- **Multiplicador**: $10 por onza
- **Tick Size**: $0.10 (movimiento mínimo)
- **Horarios**: 24/5
- **Ejemplo**: Si compras a $2,000 y vendes a $2,005, ganas $50

## 💰 Cálculo de Ganancias/Pérdidas

El bot calcula automáticamente el valor monetario de tus operaciones:

### Fórmula:
```
Valor = Puntos de Movimiento × Multiplicador del Contrato
```

### Ejemplos Prácticos:

#### US30 (Multiplicador: $5)
- **Compra**: 35,000
- **Venta**: 35,050
- **Movimiento**: +50 puntos
- **Ganancia**: $250

#### MNQ (Multiplicador: $2)
- **Compra**: 15,000
- **Venta**: 15,100
- **Movimiento**: +100 puntos
- **Ganancia**: $200

#### MGC (Multiplicador: $10)
- **Compra**: $2,000
- **Venta**: $2,015
- **Movimiento**: +15 puntos
- **Ganancia**: $150

## 🎯 Comandos Específicos para Micro Futures

### `/entry` - Crear Operación

**Ejemplo para US30:**
```
/entry asset:US30 type:BUY entry_price:35000 take_profit:35100 stop_loss:34950
```

**Ejemplo para MNQ:**
```
/entry asset:MNQ type:SELL entry_price:15000 take_profit:14900 stop_loss:15050
```

**Ejemplo para MGC:**
```
/entry asset:MGC type:BUY entry_price:2000 take_profit:2015 stop_loss:1990
```

### `/update` - Actualizar Operación

**Estados disponibles:**
- `BE` - Break Even (mover SL a precio de entrada)
- `TP1` - Primer Take Profit alcanzado
- `TP2` - Segundo Take Profit alcanzado
- `TP3` - Tercer Take Profit alcanzado

**Ejemplo:**
```
/update operation_id:TRADE_ABC123 status:TP1
```

### `/close` - Cerrar Operación

**Ejemplo:**
```
/close operation_id:TRADE_ABC123 close_price:35050 reason:TAKE_PROFIT
```

## 📈 Estrategias Recomendadas

### 1. Gestión de Riesgo
- **US30**: Stop Loss recomendado 100-200 puntos ($500-$1,000)
- **MNQ**: Stop Loss recomendado 50-100 puntos ($100-$200)
- **MGC**: Stop Loss recomendado 10-20 puntos ($100-$200)

### 2. Take Profit Múltiples
- **TP1**: 50% de la posición
- **TP2**: 30% de la posición
- **TP3**: 20% de la posición

### 3. Break Even
- Mover Stop Loss a precio de entrada cuando tengas ganancia de 1:1

## 🔍 Información en Embeds

El bot muestra información específica de cada contrato:

```
📈 Información del Contrato
Multiplicador: $5 por punto
Tick Size: 1
Horarios: 24/5
```

## 📊 Ejemplos de Operaciones Completas

### Operación Ganadora en US30:
1. **Entrada**: `/entry asset:US30 type:BUY entry_price:35000 take_profit:35100 stop_loss:34900`
2. **Actualización**: `/update operation_id:TRADE_XYZ789 status:BE` (mover SL a 35000)
3. **Cierre**: `/close operation_id:TRADE_XYZ789 close_price:35100 reason:TAKE_PROFIT`

**Resultado**: +100 puntos = $500 de ganancia

### Operación Perdedora en MNQ:
1. **Entrada**: `/entry asset:MNQ type:SELL entry_price:15000 take_profit:14900 stop_loss:15050`
2. **Stop Loss**: `/close operation_id:TRADE_ABC456 close_price:15050 reason:STOP_LOSS`

**Resultado**: -50 puntos = $100 de pérdida

## ⚠️ Consideraciones Importantes

### 1. Horarios de Trading
- Los micro futuros están disponibles 24/5
- Horario de cierre: Viernes 5:00 PM EST
- Horario de apertura: Domingo 6:00 PM EST

### 2. Volatilidad
- **US30**: Menos volátil, movimientos más predecibles
- **MNQ**: Más volátil, especialmente durante noticias tech
- **MGC**: Volátil según eventos geopolíticos y datos económicos

### 3. Spreads
- Los spreads pueden variar según la hora y volatilidad
- Considera el spread al calcular tu Take Profit y Stop Loss

## 📱 Notificaciones Automáticas

El bot te notificará cuando:
- ✅ Una operación alcance su Take Profit
- 🛑 Una operación sea detenida por Stop Loss
- ⚖️ Una operación llegue a Break Even
- 📊 Se actualice el estado de una operación

## 🎯 Mejores Prácticas

1. **Siempre usa Stop Loss** - Los micro futuros pueden moverse rápido
2. **Planifica tu Take Profit** - Define objetivos claros antes de entrar
3. **Usa Break Even** - Protege tu capital cuando tengas ganancia
4. **Documenta tus operaciones** - Usa el campo de notas para registrar tu análisis
5. **Monitorea el mercado** - Los micro futuros son sensibles a noticias económicas

---

**¡Opera con responsabilidad y siempre gestiona tu riesgo! 🚀**
