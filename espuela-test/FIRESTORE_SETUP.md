# 🥊 Espuela Brava - Conexión a Firestore

## 📋 Resumen

Este proyecto ahora soporta **dos modos de funcionamiento**:

1. **Modo Mock** (por defecto): Los datos se almacenan en memoria
2. **Modo Firestore**: Los datos se almacenan en Firebase Firestore

## 🔧 Configuración

### Opción 1: Usar Mocks (comportamiento actual)

No necesitas hacer nada. Por defecto, la aplicación usa los servicios mock.

### Opción 2: Conectar a Firestore

#### Paso 1: Instalar dependencias

```bash
npm install
# o
pnpm install
```

Si no tienes `tsx`, instálalo:

```bash
npm install -D tsx
# o
pnpm add -D tsx
```

#### Paso 2: Inicializar datos en Firestore

Ejecuta el script de inicialización para crear los usuarios de prueba y el estado inicial en Firestore:

```bash
npm run init-firestore
# o
pnpm init-firestore
```

Este script creará:
- 3 usuarios de prueba (admin, cliente1, cliente2)
- Estado inicial de pelea (numeroPelea: 1, cuota: 1.80, etc.)

#### Paso 3: Activar Firestore

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_USE_FIRESTORE=true
```

O copia el ejemplo:

```bash
cp .env.local.example .env.local
```

Y cambia `NEXT_PUBLIC_USE_FIRESTORE=false` a `NEXT_PUBLIC_USE_FIRESTORE=true`

#### Paso 4: Reiniciar el servidor

```bash
npm run dev
# o
pnpm dev
```

## 🗄️ Estructura de Firestore

### Colecciones

1. **usuarios/** - Almacena los usuarios del sistema
   - Documento ID: username (ej: `cliente1`, `admin`)
   - Campos: `user`, `pass`, `nombre`, `saldo`, `rol`, `createdAt`

2. **config/estadoPelea** - Estado global de la pelea actual
   - Campos: `numeroPelea`, `cuota`, `apuestasAbiertas`, `tiempoRestante`, `updatedAt`

3. **apuestasActuales/** - Apuestas de la pelea en curso
   - Campos: `user`, `opcion`, `monto`, `timestamp`, `createdAt`
   - Se limpia automáticamente al pagar ganadores o abrir nueva pelea

## 🔐 Seguridad

### Reglas de Firestore Recomendadas

Edita el archivo `firestore.rules` con estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios: solo lectura para autenticados
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     (request.auth.token.admin == true || 
                      request.resource.data.rol == 'cliente');
    }
    
    // Estado de pelea: lectura pública, escritura solo admin
    match /config/estadoPelea {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Apuestas: usuarios pueden crear sus propias apuestas
    match /apuestasActuales/{apuestaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      request.resource.data.user == request.auth.uid;
      allow delete, update: if request.auth != null && 
                              request.auth.token.admin == true;
    }
  }
}
```

**Nota:** Actualmente, la autenticación usa contraseñas almacenadas en Firestore (solo para desarrollo). En producción, deberías usar **Firebase Authentication** para gestionar usuarios de forma segura.

## 🔄 Cambiar entre Mocks y Firestore

Simplemente cambia el valor en `.env.local`:

- **Usar Mocks:** `NEXT_PUBLIC_USE_FIRESTORE=false` (o elimina la variable)
- **Usar Firestore:** `NEXT_PUBLIC_USE_FIRESTORE=true`

Reinicia el servidor después de cambiar.

## 📝 Servicios Implementados

Todos los servicios tienen la misma interfaz en ambas implementaciones:

### `authService`
- `login(username, password)` - Autenticar usuario
- `getCurrentUser()` - Obtener usuario actual
- `setCurrentUser(user)` - Guardar usuario en sesión
- `logout()` - Cerrar sesión

### `userService`
- `createUser(nombre, username, password)` - Crear nuevo cliente
- `getClientes()` - Obtener lista de clientes
- `updateSaldo(username, cantidad, operacion)` - Sumar/restar saldo
- `getUserByUsername(username)` - Obtener usuario por username

### `fightService`
- `getEstadoPelea()` - Obtener estado actual de la pelea
- `updateNumeroPelea(numero)` - Cambiar número de pelea
- `updateCuota(cuota)` - Actualizar cuota
- `controlarApuestas(abrir, segundos?)` - Abrir/cerrar apuestas
- `decrementarTiempo()` - Decrementar contador (llamado cada segundo)

### `betService`
- `realizarApuesta(username, opcion, monto)` - Realizar apuesta
- `pagarGanadores(ganador)` - Pagar a los ganadores
- `getApuestasActuales()` - Obtener apuestas de la pelea actual

### `subscribeToChanges(callback)`
- Suscribirse a cambios en tiempo real (ambas implementaciones)

## 🚀 Próximos Pasos (Producción)

Para llevar esto a producción, considera:

1. **Firebase Authentication**: Reemplazar el login manual con Firebase Auth
2. **Reglas de seguridad**: Implementar reglas robustas en Firestore
3. **Cloud Functions**: Mover lógica sensible (pagar ganadores, decrementar tiempo) al servidor
4. **Realtime listeners**: Usar `onSnapshot` para actualizaciones en tiempo real sin polling
5. **Índices**: Crear índices en Firestore para queries más eficientes

## 👥 Usuarios de Prueba

Después de ejecutar `npm run init-firestore`:

- **Admin:** admin / 8888
- **Cliente 1:** cliente1 / 1234 (saldo: $500)
- **Cliente 2:** cliente2 / 1234 (saldo: $300)

## 🐛 Troubleshooting

### "Permission denied" en Firestore
- Verifica que las reglas de Firestore permitan lectura/escritura
- En desarrollo, puedes temporalmente permitir todo (⚠️ no en producción):
  ```javascript
  allow read, write: if true;
  ```

### Los cambios no se reflejan
- Asegúrate de haber reiniciado el servidor después de cambiar `.env.local`
- Verifica que `NEXT_PUBLIC_USE_FIRESTORE=true` esté en `.env.local`

### Error al inicializar
- Verifica que las credenciales de Firebase en `lib/firebase.ts` sean correctas
- Comprueba tu conexión a internet
