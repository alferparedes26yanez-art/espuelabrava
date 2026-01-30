# 🔄 Migración de Mocks a Firestore - Guía Técnica

## ✅ Lo que se ha implementado

### 1. Servicios Firestore (`lib/services/firestore-services.ts`)

Se han implementado todos los servicios con la misma interfaz que los mocks:

#### Estructura de datos en Firestore:

```
Firestore
├── usuarios/{username}
│   ├── user: string
│   ├── pass: string (⚠️ solo para dev, usar Firebase Auth en producción)
│   ├── nombre: string
│   ├── saldo: number
│   ├── rol: 'admin' | 'cliente'
│   └── createdAt: timestamp
│
├── config/estadoPelea
│   ├── numeroPelea: number
│   ├── cuota: number
│   ├── apuestasAbiertas: boolean
│   ├── tiempoRestante: number
│   └── updatedAt: timestamp
│
└── apuestasActuales/{apuestaId}
    ├── user: string
    ├── opcion: 'Rojo' | 'Azul' | 'Empate'
    ├── monto: number
    ├── timestamp: number
    └── createdAt: timestamp
```

### 2. Sistema de configuración dinámico

- **`lib/services/index.ts`**: Exporta automáticamente los servicios correctos según `NEXT_PUBLIC_USE_FIRESTORE`
- **`.env.local`**: Controla qué implementación usar
- **No requiere cambios en el código** de las páginas para cambiar entre mocks y Firestore

### 3. Script de inicialización

- `npm run init-firestore` crea la estructura inicial en Firestore
- Usuarios de prueba con saldo
- Estado inicial de pelea configurado

## 🚀 Cómo usar

### Desarrollo con Mocks (actual)
```bash
# No necesitas hacer nada o asegúrate que .env.local tenga:
NEXT_PUBLIC_USE_FIRESTORE=false
# o simplemente no tengas .env.local

npm run dev
```

### Desarrollo con Firestore
```bash
# 1. Inicializar datos
npm run init-firestore

# 2. Activar Firestore
echo "NEXT_PUBLIC_USE_FIRESTORE=true" > .env.local

# 3. Ejecutar
npm run dev
```

### Producción
```bash
# 1. Asegúrate de tener NEXT_PUBLIC_USE_FIRESTORE=true en tus variables de entorno
# 2. Build normal
npm run build
npm start
```

## 📊 Diferencias clave entre Mocks y Firestore

| Aspecto | Mocks | Firestore |
|---------|-------|-----------|
| **Persistencia** | Solo en memoria (se pierde al recargar) | Persistente en la nube |
| **Tiempo real** | Simulado con callbacks locales | Opcional con `onSnapshot` |
| **Latencia** | Simulada (50-300ms) | Real (50-500ms según red) |
| **Concurrencia** | No soportada (un solo usuario) | Soportada (múltiples usuarios) |
| **Seguridad** | No aplicable | Reglas de Firestore |

## 🔧 Mejoras recomendadas para producción

### 1. Implementar Firebase Authentication

Actualmente, las contraseñas se almacenan en texto plano en Firestore. **NO usar en producción**.

**Cambios sugeridos:**

```typescript
// En lib/services/firestore-services.ts
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

export const authService = {
  login: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
    return userDoc.data() as Usuario;
  },
  
  // ... resto de métodos usando Firebase Auth
};
```

### 2. Listeners en tiempo real con `onSnapshot`

Reemplazar el polling manual con listeners de Firestore:

```typescript
// En las páginas (ej: dashboard/cliente/page.tsx)
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'config', 'estadoPelea'),
    (snapshot) => {
      if (snapshot.exists()) {
        setPelea(snapshot.data());
      }
    }
  );
  
  return () => unsubscribe();
}, []);
```

### 3. Cloud Functions para lógica crítica

Mover operaciones sensibles al servidor:

```javascript
// functions/index.js (Firebase Functions)
exports.pagarGanadores = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario es admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Solo admins');
  }
  
  const { ganador } = data;
  
  // Lógica de pago en el servidor
  // ...
});
```

### 4. Optimizar lecturas con índices

Crear índices en Firestore para queries frecuentes:

```javascript
// En firestore.indexes.json (ya existe en el proyecto)
{
  "indexes": [
    {
      "collectionGroup": "usuarios",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "rol", "order": "ASCENDING" },
        { "fieldPath": "saldo", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 5. Reglas de seguridad robustas

Ejemplo de reglas más estrictas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Usuarios
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow create: if isAdmin();
      allow update: if isAdmin() || isOwner(userId);
      allow delete: if isAdmin();
    }
    
    // Config
    match /config/{document} {
      allow read: if true; // Público para mostrar estado
      allow write: if isAdmin();
    }
    
    // Apuestas
    match /apuestasActuales/{apuestaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      request.resource.data.user == request.auth.uid &&
                      get(/databases/$(database)/documents/config/estadoPelea).data.apuestasAbiertas == true;
      allow update, delete: if isAdmin();
    }
  }
}
```

## 🧪 Testing

### Probar localmente con Firestore Emulator

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar emuladores
firebase emulators:start

# Actualizar .env.local
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
NEXT_PUBLIC_USE_FIRESTORE=true
```

Luego actualiza `lib/firebase.ts`:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📈 Monitoreo y costos

### Costos de Firestore (precios aproximados 2026)

- **Lecturas**: $0.036 por 100,000 documentos
- **Escrituras**: $0.108 por 100,000 documentos
- **Almacenamiento**: $0.018 por GB/mes

### Optimizaciones de costo

1. **Cachear datos localmente** para reducir lecturas
2. **Usar listeners selectivos** (no escuchar toda la colección)
3. **Batch writes** cuando sea posible
4. **Limpiar apuestas antiguas** periódicamente

## 🐛 Debugging

### Ver logs de Firestore

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

setLogLevel('debug'); // Solo en desarrollo
```

### Inspeccionar en consola de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `espuela-test`
3. Ve a Firestore Database
4. Inspecciona las colecciones y documentos

## 💡 Tips y Trucos

### 1. Usar transacciones para operaciones críticas

```typescript
import { runTransaction } from 'firebase/firestore';

await runTransaction(db, async (transaction) => {
  const userRef = doc(db, 'usuarios', username);
  const userDoc = await transaction.get(userRef);
  
  if (!userDoc.exists()) throw 'Usuario no existe';
  
  const newSaldo = userDoc.data().saldo - monto;
  if (newSaldo < 0) throw 'Saldo insuficiente';
  
  transaction.update(userRef, { saldo: newSaldo });
  transaction.set(doc(collection(db, 'apuestasActuales')), apuestaData);
});
```

### 2. Paginación para grandes listas

```typescript
import { query, collection, orderBy, limit, startAfter } from 'firebase/firestore';

const first = query(
  collection(db, 'usuarios'),
  orderBy('nombre'),
  limit(25)
);

const lastVisible = docs[docs.length - 1];
const next = query(
  collection(db, 'usuarios'),
  orderBy('nombre'),
  startAfter(lastVisible),
  limit(25)
);
```

### 3. Offline persistence

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Múltiples tabs abiertas
  } else if (err.code === 'unimplemented') {
    // Navegador no soportado
  }
});
```

## 🎯 Roadmap sugerido

- [x] Implementar servicios básicos de Firestore
- [x] Sistema de configuración con variables de entorno
- [x] Script de inicialización de datos
- [ ] Migrar a Firebase Authentication
- [ ] Implementar listeners en tiempo real
- [ ] Crear Cloud Functions para lógica sensible
- [ ] Agregar tests unitarios
- [ ] Configurar Firestore Emulator para desarrollo
- [ ] Implementar paginación en listados
- [ ] Agregar logging y monitoreo
- [ ] Optimizar reglas de seguridad
- [ ] Documentar API con TypeDoc

## 📚 Recursos adicionales

- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Guía de seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Best practices](https://firebase.google.com/docs/firestore/best-practices)
- [Pricing calculator](https://firebase.google.com/pricing)
