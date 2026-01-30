# 🚀 Deploy Rápido - Pasos Exactos

## Prerequisitos Verificados

- ✅ Proyecto compilando sin errores
- ✅ Firestore configurado (espuela-test)
- ✅ Datos iniciales creados (`npm run init-firestore`)
- ✅ `NEXT_PUBLIC_USE_FIRESTORE=true` en `.env.local`

## 🎯 Deploy en 3 Pasos

### Paso 1: Instalar Firebase CLI (si no lo tienes)

```bash
npm install -g firebase-tools
```

Verifica:
```bash
firebase --version
```

### Paso 2: Login en Firebase

```bash
firebase login
```

Se abrirá el navegador para autenticarte.

### Paso 3: Deploy

#### Opción A - Script Automatizado (Recomendado)

```bash
cd /Users/ariel/tmp/espuelabrava/espuela-test
./deploy.sh
```

#### Opción B - Manual

```bash
cd /Users/ariel/tmp/espuelabrava/espuela-test

# Build
npm run build

# Deploy
firebase deploy
```

## 📊 Resultado Esperado

Después de `firebase deploy`, verás:

```
=== Deploying to 'espuela-test'...

i  deploying firestore, hosting
i  firestore: reading indexes from firestore.indexes.json...
i  firestore: reading rules from firestore.rules...
✔  firestore: rules file firestore.rules compiled successfully
✔  firestore: deployed indexes successfully
✔  firestore: deployed rules successfully

i  hosting[espuela-test]: beginning deploy...
i  hosting[espuela-test]: found 100 files in out
✔  hosting[espuela-test]: file upload complete
✔  hosting[espuela-test]: version finalized
✔  hosting[espuela-test]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/espuela-test/overview
Hosting URL: https://espuela-test.web.app
```

## ✅ Verificación Post-Deploy

### 1. Abre la URL

```
https://espuela-test.web.app
```

### 2. Prueba el Login

- Usuario: `admin`
- Password: `8888`

### 3. Verifica Funcionalidades

En el dashboard de admin:
- ✅ Crear cliente
- ✅ Abrir pelea
- ✅ Ver historial de peleas (si hay)

En el dashboard de cliente (login con `cliente1 / 1234`):
- ✅ Ver saldo
- ✅ Hacer apuesta
- ✅ Ver historial personal (si hay)

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# 1. Edita código
# 2. Build + Deploy
./deploy.sh

# O manualmente:
npm run build
firebase deploy --only hosting
```

## 🐛 Si algo falla...

### Error: "Firebase project not found"

```bash
firebase use espuela-test
firebase projects:list  # Verificar que existe
```

### Error: "Permission denied"

```bash
firebase login --reauth
```

### Error en build

```bash
rm -rf .next out
npm run build
```

### Página en blanco después del deploy

1. Abre la consola del navegador (F12)
2. Verifica errores
3. Revisa que `firebase.json` apunte a `out/`
4. Verifica que exista la carpeta `out/` con archivos

### Los cambios no se ven

```bash
# Limpia cache y redeploy
rm -rf .next out
npm run build
firebase deploy --only hosting

# En el navegador: Ctrl+Shift+R (forzar recarga)
```

## 📝 Comandos de Emergencia

```bash
# Ver proyecto actual
firebase projects:current

# Cambiar proyecto
firebase use espuela-test

# Ver logs de hosting
firebase hosting:logs

# Probar localmente antes de deploy
npm run build
firebase serve  # http://localhost:5000

# Rollback a versión anterior
firebase hosting:rollback
```

## 🎉 ¡Listo!

Después de estos pasos, tu app estará en:

🌐 **https://espuela-test.web.app**

Con:
- ✅ Firestore conectado
- ✅ Historial de peleas funcionando
- ✅ Historial de apuestas por usuario
- ✅ Estadísticas automáticas
- ✅ Todo persistente en la nube

---

**Tiempo estimado:** 5-10 minutos  
**Costo:** $0 (Plan gratuito de Firebase)
