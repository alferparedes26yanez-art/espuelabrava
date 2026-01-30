# 🚀 Guía de Deploy en Firebase Hosting

Esta guía te muestra cómo hacer deploy de la aplicación Espuela Brava en Firebase Hosting con Firestore conectado.

## 📋 Pre-requisitos

- Node.js instalado (v18 o superior)
- Cuenta de Firebase (ya la tienes - proyecto: `espuela-test`)
- Firebase CLI instalado
- Proyecto compilando sin errores

## 🔧 Paso 1: Instalar Firebase CLI

Si no lo tienes instalado:

```bash
npm install -g firebase-tools
```

Verificar instalación:

```bash
firebase --version
```

## 🔐 Paso 2: Login en Firebase

```bash
firebase login
```

Esto abrirá el navegador para que inicies sesión con tu cuenta de Google.

## 📁 Paso 3: Configurar el Proyecto

### 3.1 Inicializar Firebase (solo si no está configurado)

Tu proyecto ya tiene `firebase.json` y `.firebaserc`, pero si necesitas reconfigurar:

```bash
cd /ruta/a/espuela-test
firebase init
```

Selecciona:
- ✅ Firestore
- ✅ Hosting

Cuando pregunte por el proyecto, selecciona `espuela-test`.

### 3.2 Verificar firebase.json

Tu archivo `firebase.json` debería verse así:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 3.3 Actualizar next.config.ts para static export

Abre `next.config.ts` y asegúrate que tenga:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Importante para Firebase Hosting
  images: {
    unoptimized: true  // Firebase Hosting no soporta Image Optimization
  }
};

export default nextConfig;
```

## 🏗️ Paso 4: Build del Proyecto

### 4.1 Activar Firestore en producción

Edita `.env.local` (o crea `.env.production`):

```bash
NEXT_PUBLIC_USE_FIRESTORE=true
```

### 4.2 Build

```bash
npm run build
```

Esto creará la carpeta `out/` con los archivos estáticos.

### 4.3 Verificar build

```bash
ls -la out/
```

Deberías ver archivos HTML, JS, CSS, etc.

## 🔥 Paso 5: Deploy a Firebase Hosting

### 5.1 Inicializar datos en Firestore (si no lo has hecho)

```bash
npm run init-firestore
```

Esto creará los usuarios y configuración inicial en Firestore.

### 5.2 Deploy de Firestore Rules e Indexes

```bash
firebase deploy --only firestore
```

Esto subirá:
- `firestore.rules` - Reglas de seguridad
- `firestore.indexes.json` - Índices para queries

### 5.3 Deploy del Hosting

```bash
firebase deploy --only hosting
```

Esto subirá los archivos de la carpeta `out/` a Firebase Hosting.

### 5.4 Deploy completo (todo junto)

```bash
firebase deploy
```

Esto hace deploy de Firestore rules + Hosting en un solo comando.

## 🌐 Paso 6: Verificar el Deploy

Después del deploy, verás una URL como:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/espuela-test/overview
Hosting URL: https://espuela-test.web.app
```

Abre la URL en tu navegador y verifica:

1. ✅ La página de login carga
2. ✅ Puedes hacer login con `admin / 8888`
3. ✅ Los datos se cargan desde Firestore
4. ✅ Puedes crear clientes, abrir peleas, etc.

## 🔄 Paso 7: Actualizar el Deploy

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios en el código
# 2. Build
npm run build

# 3. Deploy
firebase deploy --only hosting
```

Si cambias las reglas de Firestore:

```bash
firebase deploy --only firestore:rules
```

## 📊 Comandos Útiles

### Ver logs

```bash
firebase hosting:logs
```

### Probar localmente antes de deploy

```bash
# Build
npm run build

# Servir localmente
firebase serve
```

Abre http://localhost:5000

### Ver proyectos de Firebase

```bash
firebase projects:list
```

### Cambiar de proyecto

```bash
firebase use espuela-test
```

### Ver estado actual

```bash
firebase projects:current
```

## 🔐 Seguridad en Producción

### Actualizar Reglas de Firestore

Edita `firestore.rules` para hacerlas más estrictas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: lectura autenticada, escritura solo admin
    match /usuarios/{userId} {
      allow read: if true; // Público para login
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
      allow update: if request.auth != null && 
                      (request.auth.uid == userId || 
                       get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin');
      allow delete: if request.auth != null && 
                      get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
      
      // Historial de apuestas del usuario
      match /historialApuestas/{apuestaId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Solo desde el servidor
      }
    }
    
    // Config de pelea: lectura pública, escritura admin
    match /config/estadoPelea {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Apuestas actuales: usuarios pueden crear, admin puede todo
    match /apuestasActuales/{apuestaId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Historial de peleas: solo lectura
    match /historialPeleas/{peleaId} {
      allow read: if true;
      allow write: if false; // Solo desde servidor
    }
  }
}
```

**⚠️ Importante:** Las reglas actuales permiten escritura temporal. Actualízalas antes del 26 de febrero de 2026.

### Variables de Entorno

No incluyas credenciales sensibles en el código. Las credenciales de Firebase cliente (en `lib/firebase.ts`) son seguras para exponer públicamente.

## 🐛 Troubleshooting

### Error: "Firebase project not found"

```bash
firebase use espuela-test
```

### Error: "Permission denied" en Firestore

Verifica las reglas en `firestore.rules` y haz deploy:

```bash
firebase deploy --only firestore:rules
```

### Error: "Build failed"

Verifica que `next.config.ts` tenga `output: 'export'`.

### Página en blanco después del deploy

1. Verifica que `out/` tenga archivos
2. Revisa la consola del navegador (F12) para errores
3. Verifica que `NEXT_PUBLIC_USE_FIRESTORE=true` esté en las variables de entorno

### Cambios no se reflejan

1. Limpia cache:
   ```bash
   rm -rf .next out
   npm run build
   ```
2. Haz deploy de nuevo:
   ```bash
   firebase deploy --only hosting
   ```
3. Limpia cache del navegador (Ctrl+Shift+R o Cmd+Shift+R)

## 📈 Monitoreo Post-Deploy

### Ver uso de Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: `espuela-test`
3. Ve a "Firestore Database"
4. Pestaña "Usage"

### Ver tráfico de Hosting

1. Firebase Console → Hosting
2. Pestaña "Usage"

### Alertas

Configura alertas en Firebase Console para:
- Uso de Firestore cerca del límite gratuito
- Errores en Hosting
- Reglas de seguridad que fallan

## 💰 Costos Estimados

### Plan Spark (Gratuito)
- ✅ Hosting: 10 GB almacenamiento, 360 MB/día transferencia
- ✅ Firestore: 1 GB almacenamiento, 50K lecturas/día, 20K escrituras/día

Para tu aplicación, esto debería ser suficiente para desarrollo y uso moderado.

### Cuando escalar

Si excedes el plan gratuito, considera:
- **Plan Blaze (Pay as you go)**: Solo pagas por lo que usas
- Costos típicos para apps pequeñas: $5-20/mes

## 🎯 Checklist Final

Antes de considerar el deploy completo:

- [ ] Build exitoso sin errores
- [ ] `NEXT_PUBLIC_USE_FIRESTORE=true` configurado
- [ ] Datos iniciales creados en Firestore
- [ ] Reglas de Firestore actualizadas
- [ ] Deploy de Firestore rules
- [ ] Deploy de Hosting
- [ ] Probado en la URL de producción
- [ ] Login funciona
- [ ] Crear clientes funciona
- [ ] Sistema de apuestas funciona
- [ ] Historial se muestra correctamente

## 📚 Recursos Adicionales

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 🚀 Script Rápido de Deploy

Crea un script `deploy.sh` para automatizar:

```bash
#!/bin/bash

echo "🏗️  Building proyecto..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build exitoso"
  echo "🚀 Desplegando a Firebase..."
  firebase deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Deploy completado!"
    echo "🌐 URL: https://espuela-test.web.app"
  else
    echo "❌ Error en deploy"
    exit 1
  fi
else
  echo "❌ Error en build"
  exit 1
fi
```

Uso:

```bash
chmod +x deploy.sh
./deploy.sh
```

¡Listo! Tu aplicación estará en producción en Firebase. 🎉
