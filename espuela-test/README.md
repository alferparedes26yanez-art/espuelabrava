# 🥊 Espuela Brava - Sistema de Apuestas

Sistema de apuestas para peleas de gallos con panel administrativo y cliente.

## 🚀 Inicio Rápido

### Opción 1: Desarrollo con Mocks (Recomendado para empezar)

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y usa:
- **Admin:** admin / 8888
- **Cliente:** cliente1 / 1234

### Opción 2: Desarrollo con Firestore

```bash
npm install
npm run init-firestore
echo "NEXT_PUBLIC_USE_FIRESTORE=true" > .env.local
npm run dev
```

## 📋 Características

- ✅ **Sistema de autenticación** (admin/cliente)
- ✅ **Gestión de usuarios y saldos**
- ✅ **Control de peleas en tiempo real**
- ✅ **Sistema de apuestas** (Rojo/Azul/Empate)
- ✅ **Panel administrativo completo**
- ✅ **Countdown timer dinámico**
- ✅ **Cálculo automático de premios**
- ✅ **Dos modos**: Mocks (memoria) o Firestore (cloud)
- ✅ **Historial de peleas completadas** (Firestore)
- ✅ **Historial personal de apuestas** (Firestore)
- ✅ **Estadísticas por usuario** (Firestore)

## 🗂️ Estructura del Proyecto

```
espuela-test/
├── app/                          # Páginas Next.js
│   ├── login/                    # Página de login
│   ├── dashboard/
│   │   ├── admin/                # Panel de administración
│   │   └── cliente/              # Panel de cliente
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── firebase.ts               # Configuración de Firebase
│   └── services/
│       ├── index.ts              # Selector de servicios (mocks vs Firestore)
│       ├── mock-services.ts      # Implementación con datos en memoria
│       └── firestore-services.ts # Implementación con Firestore
├── types/
│   └── index.ts                  # TypeScript types
├── scripts/
│   └── init-firestore.ts         # Script de inicialización
├── FIRESTORE_SETUP.md            # Guía de configuración
└── FIRESTORE_MIGRATION.md        # Guía técnica de migración
```

## 🔧 Modos de Funcionamiento

### Modo Mock (Por defecto)
- Datos en memoria (se pierden al recargar)
- Sin configuración necesaria
- Ideal para desarrollo y pruebas rápidas

### Modo Firestore
- Datos persistentes en la nube
- Soporte para múltiples usuarios simultáneos
- Requiere configuración inicial

**Cambiar de modo:**
```bash
# .env.local
NEXT_PUBLIC_USE_FIRESTORE=true  # Usar Firestore
NEXT_PUBLIC_USE_FIRESTORE=false # Usar Mocks (o eliminar variable)
```

## 📚 Documentación

- **[FIRESTORE_SETUP.md](FIRESTORE_SETUP.md)** - Guía paso a paso para conectar Firestore
- **[FIRESTORE_MIGRATION.md](FIRESTORE_MIGRATION.md)** - Guía técnica y mejores prácticas
- **[FIREBASE_DEPLOY.md](FIREBASE_DEPLOY.md)** - Guía completa de deploy en Firebase Hosting
- **[HISTORIAL_FEATURE.md](HISTORIAL_FEATURE.md)** - Documentación de historial de peleas y apuestas
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Ejemplos de código

## 🎮 Uso del Sistema

### Como Administrador

1. Login con `admin / 8888`
2. **Crear clientes** con saldo inicial
3. **Configurar pelea**: número y cuota
4. **Abrir apuestas** con tiempo límite
5. **Declarar ganador** y pagar premios automáticamente

### Como Cliente

1. Login con credenciales de cliente
2. Ver **saldo disponible**
3. **Apostar** cuando las apuestas estén abiertas
4. Elegir: Rojo, Azul o Empate
5. Recibir premios automáticamente si ganas

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # Linting
npm run init-firestore   # Inicializar datos en Firestore
```

## 🌐 Deploy en Producción

### Deploy en Firebase Hosting

```bash
# 1. Build del proyecto
npm run build

# 2. Deploy a Firebase
firebase deploy
```

**Ver guía completa:** [FIREBASE_DEPLOY.md](FIREBASE_DEPLOY.md)

Tu app estará disponible en: `https://espuela-test.web.app`

## 🔐 Seguridad

⚠️ **Importante para producción:**

- El sistema actual usa contraseñas en texto plano (solo para desarrollo)
- Para producción, implementar **Firebase Authentication**
- Configurar **reglas de seguridad** en Firestore
- Ver [FIRESTORE_MIGRATION.md](FIRESTORE_MIGRATION.md) para detalles

## 🌐 Deploy

### Vercel (Recomendado)

```bash
# Asegúrate de configurar la variable de entorno en Vercel
NEXT_PUBLIC_USE_FIRESTORE=true
```

Deploy directo desde GitHub en [Vercel](https://vercel.com)

### Otros servicios

El proyecto es un Next.js estándar, compatible con:
- Netlify
- Firebase Hosting
- AWS Amplify
- Cualquier servicio que soporte Next.js

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y propietario.

## 🆘 Soporte

Para problemas o preguntas:
1. Revisa [FIRESTORE_SETUP.md](FIRESTORE_SETUP.md)
2. Revisa [FIRESTORE_MIGRATION.md](FIRESTORE_MIGRATION.md)
3. Crea un issue en el repositorio

---

## Learn More sobre Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
