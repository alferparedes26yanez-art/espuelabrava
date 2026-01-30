# 📊 Historial de Peleas y Apuestas - Resumen de Implementación

## ✅ Nuevas Funcionalidades Agregadas

### 1. Historial de Peleas Completadas

**Colección en Firestore:** `historialPeleas/`

Cada vez que se declara un ganador (pagarGanadores), se guarda automáticamente:

```typescript
{
  numeroPelea: number,
  cuota: number,
  ganador: 'Rojo' | 'Azul' | 'Empate',
  totalApuestas: number,         // Total de dinero apostado
  totalPagado: number,            // Total pagado a ganadores
  cantidadApuestas: number,       // Cantidad de apuestas registradas
  fechaInicio: Timestamp,         // Cuando se abrió la pelea
  fechaFin: Timestamp,            // Cuando se cerró
  apuestas: Apuesta[]             // Array con todas las apuestas
}
```

**Beneficios:**
- 📈 Ver rendimiento histórico del negocio
- 💰 Calcular ganancias de la casa por pelea
- 📊 Análisis de cuotas y comportamiento de apuestas

### 2. Historial Personal de Apuestas

**Colección en Firestore:** `usuarios/{username}/historialApuestas/`

Cada vez que un usuario apuesta, se guarda en su historial:

```typescript
{
  numeroPelea: number,
  opcion: 'Rojo' | 'Azul' | 'Empate',
  monto: number,
  cuota: number,
  ganador: 'Rojo' | 'Azul' | 'Empate',
  gano: boolean,
  premio: number,                 // 0 si perdió, monto*cuota si ganó
  fecha: Timestamp
}
```

**Beneficios:**
- 📜 Cada usuario ve su historial completo
- 📊 Estadísticas personalizadas
- ✅ Transparencia total en apuestas

### 3. Estadísticas por Usuario

El sistema calcula automáticamente:

- **Total de apuestas realizadas**
- **Total ganadas vs perdidas**
- **Porcentaje de éxito**
- **Total apostado** (todo el dinero que ha puesto)
- **Total ganado** (premios recibidos)
- **Balance neto** (ganado - apostado)

### 4. Componentes de UI

#### Para Clientes: `HistorialApuestasCliente`

Muestra en el dashboard del cliente:
- Tarjeta de estadísticas con 6 métricas clave
- Lista scrolleable de últimas 20 apuestas
- Código de colores: verde (ganó), rojo (perdió)
- Fecha, opción apostada, monto y resultado

#### Para Admin: `HistorialPeleasAdmin`

Muestra en el dashboard admin:
- Lista de últimas 15 peleas completadas
- Para cada pelea:
  - Ganador destacado
  - Cuota utilizada
  - Total apostado vs total pagado
  - Ganancia de la casa
  - Detalle expandible con todas las apuestas

## 🗄️ Estructura de Datos en Firestore

```
Firestore
├── usuarios/
│   ├── {username}/
│   │   ├── (datos del usuario)
│   │   └── historialApuestas/          ← NUEVO
│   │       ├── {apuestaId1}
│   │       ├── {apuestaId2}
│   │       └── ...
│   
├── config/
│   └── estadoPelea
│       ├── numeroPelea
│       ├── cuota
│       ├── apuestasAbiertas
│       ├── tiempoRestante
│       └── fechaInicio                 ← NUEVO
│
├── apuestasActuales/
│   └── (se limpian al pagar ganadores)
│
└── historialPeleas/                    ← NUEVO
    ├── {peleaId1}
    ├── {peleaId2}
    └── ...
```

## 📝 Nuevos Servicios Disponibles

### `historialService` (solo con Firestore)

```typescript
import { historialService } from '@/lib/services';

// Obtener últimas peleas
const peleas = await historialService.getHistorialPeleas(20);

// Obtener apuestas de un usuario
const apuestas = await historialService.getHistorialApuestasUsuario('cliente1', 50);

// Obtener estadísticas de un usuario
const stats = await historialService.getEstadisticasUsuario('cliente1');
// Retorna: { totalApuestas, totalGanadas, totalPerdidas, 
//           totalApostado, totalGanado, porcentajeExito }

// Obtener detalle de una pelea específica
const pelea = await historialService.getPeleaDetalle(5);
```

## 🔄 Flujo de Datos

### Cuando un usuario apuesta:

1. Se descuenta el saldo
2. Se agrega a `apuestasActuales/`
3. ✨ NO se guarda historial aún (espera al resultado)

### Cuando se declara ganador:

1. Se calculan premios
2. Se actualiza saldo de ganadores
3. ✨ **Se crea documento en `historialPeleas/`**
4. ✨ **Se crea documento en cada `usuarios/{user}/historialApuestas/`**
5. Se limpian `apuestasActuales/`
6. Se cierra la pelea

## 🎨 Capturas de Funcionalidad

### Dashboard Cliente (con historial):

```
┌────────────────────────────────────────┐
│  📊 Mis Estadísticas                   │
├────────────────────────────────────────┤
│ Total: 15  Ganadas: 8  Éxito: 53.3%   │
│ Apostado: $450  Ganado: $612           │
│ Balance: +$162                          │
├────────────────────────────────────────┤
│  📜 Últimas Apuestas                   │
│                                        │
│ [VERDE] Pelea #5 → Rojo → +$36        │
│ [ROJO]  Pelea #4 → Azul → -$20        │
│ [VERDE] Pelea #3 → Empate → +$90      │
│ ...                                    │
└────────────────────────────────────────┘
```

### Dashboard Admin (con historial):

```
┌────────────────────────────────────────┐
│  📜 Historial de Peleas                │
├────────────────────────────────────────┤
│ Pelea #5         🏆 Rojo               │
│ Cuota: 1.8x  Apuestas: 12              │
│ Apostado: $340  Pagado: $280           │
│ Ganancia Casa: +$60                    │
│ ▼ Ver detalle (12 apuestas)            │
├────────────────────────────────────────┤
│ Pelea #4         🏆 Azul               │
│ ...                                    │
└────────────────────────────────────────┘
```

## 🚀 Cómo Usar

### Ver el historial en la app:

1. **Como Cliente:**
   - Login con tus credenciales
   - Scroll hacia abajo en el dashboard
   - Verás tus estadísticas y últimas apuestas

2. **Como Admin:**
   - Login como admin
   - Scroll hacia abajo en el panel
   - Verás el historial de todas las peleas

### Consultar desde código:

```typescript
// En cualquier componente
import { historialService } from '@/lib/services';

// Verificar que esté usando Firestore
if (historialService) {
  const stats = await historialService.getEstadisticasUsuario('cliente1');
  console.log('Porcentaje de éxito:', stats.porcentajeExito);
}
```

## 📊 Análisis de Datos Posibles

Con este historial puedes:

1. **Análisis de rentabilidad:**
   - ¿Qué cuotas generan más ganancia?
   - ¿Cuánto gana la casa por pelea?
   - Tendencias de apuestas por opción

2. **Comportamiento de usuarios:**
   - ¿Quiénes son los mejores apostadores?
   - ¿Qué opción se apuesta más?
   - Patrones de apuestas por hora/día

3. **Optimización:**
   - Ajustar cuotas según historial
   - Identificar usuarios VIP
   - Detectar patrones de fraude

## 🔐 Seguridad

### Reglas de Firestore Sugeridas:

```javascript
// Historial de peleas: solo lectura pública
match /historialPeleas/{peleaId} {
  allow read: if true;
  allow write: if false; // Solo desde el servidor
}

// Historial personal: solo el usuario lo ve
match /usuarios/{userId}/historialApuestas/{apuestaId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Solo desde el servidor
}
```

Esto asegura que:
- ✅ Los usuarios solo ven su propio historial
- ✅ Nadie puede modificar historiales (inmutables)
- ✅ El historial de peleas es público (transparencia)

## 📈 Próximas Mejoras Sugeridas

1. **Exportar historial a CSV/Excel**
2. **Gráficos de tendencias** (Chart.js)
3. **Filtros por fecha** en el historial
4. **Ranking de mejores apostadores**
5. **Notificaciones de resultados** por email
6. **Dashboard analítico** para admin con métricas avanzadas

## 🧪 Testing

Para probar el historial:

1. Abre apuestas como admin
2. Apuesta como varios clientes
3. Declara un ganador
4. Refresca el dashboard del cliente → verás tu apuesta en el historial
5. Refresca el dashboard admin → verás la pelea en el historial

## 📝 Notas Técnicas

- **Historial solo con Firestore:** Los mocks no guardan historial
- **Performance:** Se usa `limit()` para evitar cargar demasiados docs
- **Orden:** `orderBy('fecha', 'desc')` muestra lo más reciente primero
- **Timestamps:** Se usa `serverTimestamp()` para consistencia

## ✅ Checklist de Verificación

- [x] Tipos TypeScript para historial
- [x] Servicio de historial en Firestore
- [x] Guardar historial al pagar ganadores
- [x] Componente de historial para clientes
- [x] Componente de historial para admin
- [x] Estadísticas calculadas automáticamente
- [x] UI responsive y con scroll
- [x] Sin errores de compilación
- [x] Compatible con mocks (no rompe nada)

---

**Implementado por:** GitHub Copilot  
**Fecha:** 28 de Enero, 2026  
**Estado:** ✅ Listo para producción
