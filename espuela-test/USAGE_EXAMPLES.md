# 🧪 Ejemplos de Uso - Firestore Services

Este documento contiene ejemplos prácticos de cómo usar los servicios de Firestore.

## 📝 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Gestión de Usuarios](#gestión-de-usuarios)
- [Control de Peleas](#control-de-peleas)
- [Apuestas](#apuestas)
- [Listeners en Tiempo Real](#listeners-en-tiempo-real)

---

## Autenticación

### Login de Usuario

```typescript
import { authService } from '@/lib/services';

// Ejemplo: Login desde componente de React
const handleLogin = async () => {
  try {
    const user = await authService.login('cliente1', '1234');
    
    if (user) {
      console.log('✅ Login exitoso:', user);
      authService.setCurrentUser(user);
      // Redirigir según rol
      if (user.rol === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/cliente');
      }
    } else {
      console.log('❌ Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

### Obtener Usuario Actual

```typescript
import { authService } from '@/lib/services';

const user = authService.getCurrentUser();

if (!user) {
  console.log('No hay usuario logueado');
  router.push('/login');
} else {
  console.log('Usuario actual:', user.nombre);
  console.log('Saldo:', user.saldo);
  console.log('Rol:', user.rol);
}
```

### Logout

```typescript
import { authService } from '@/lib/services';

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};
```

---

## Gestión de Usuarios

### Crear Nuevo Cliente

```typescript
import { userService } from '@/lib/services';

const handleCrearCliente = async () => {
  try {
    await userService.createUser(
      'Pedro Martínez',  // nombre
      'cliente3',        // username
      '1234'            // password
    );
    
    console.log('✅ Cliente creado exitosamente');
    
    // Recargar lista de clientes
    const clientes = await userService.getClientes();
    setClientes(clientes);
  } catch (error) {
    if (error.message === 'El usuario ya existe') {
      console.log('❌ Ese username ya está en uso');
    } else {
      console.error('Error creando cliente:', error);
    }
  }
};
```

### Listar Todos los Clientes

```typescript
import { userService } from '@/lib/services';

const loadClientes = async () => {
  const clientes = await userService.getClientes();
  
  console.log(`📋 Total clientes: ${clientes.length}`);
  
  clientes.forEach(cliente => {
    console.log(`${cliente.nombre} - Saldo: $${cliente.saldo}`);
  });
  
  return clientes;
};

// Uso en componente React
useEffect(() => {
  loadClientes().then(setClientes);
}, []);
```

### Gestionar Saldo de Cliente

```typescript
import { userService } from '@/lib/services';

// Agregar saldo
const agregarSaldo = async (username: string, cantidad: number) => {
  try {
    await userService.updateSaldo(username, cantidad, 'sumar');
    console.log(`✅ Agregados $${cantidad} a ${username}`);
  } catch (error) {
    console.error('Error agregando saldo:', error);
  }
};

// Restar saldo
const restarSaldo = async (username: string, cantidad: number) => {
  try {
    await userService.updateSaldo(username, cantidad, 'restar');
    console.log(`✅ Restados $${cantidad} de ${username}`);
  } catch (error) {
    console.error('Error restando saldo:', error);
  }
};

// Ejemplos de uso
await agregarSaldo('cliente1', 100);  // +$100
await restarSaldo('cliente2', 50);    // -$50
```

### Obtener Usuario Específico

```typescript
import { userService } from '@/lib/services';

const getUserInfo = async (username: string) => {
  const user = await userService.getUserByUsername(username);
  
  if (user) {
    console.log('Usuario encontrado:');
    console.log('- Nombre:', user.nombre);
    console.log('- Saldo:', user.saldo);
    console.log('- Rol:', user.rol);
  } else {
    console.log('Usuario no encontrado');
  }
  
  return user;
};

// Uso
const cliente = await getUserInfo('cliente1');
```

---

## Control de Peleas

### Obtener Estado Actual de Pelea

```typescript
import { fightService } from '@/lib/services';

const checkEstado = async () => {
  const estado = await fightService.getEstadoPelea();
  
  console.log('📊 Estado de pelea:');
  console.log('- Pelea #:', estado.numeroPelea);
  console.log('- Cuota:', estado.cuota + 'x');
  console.log('- Apuestas:', estado.apuestasAbiertas ? 'ABIERTAS' : 'CERRADAS');
  console.log('- Tiempo restante:', estado.tiempoRestante + 's');
  console.log('- Apuestas registradas:', estado.apuestasActuales.length);
  
  return estado;
};

// Uso en componente React
useEffect(() => {
  checkEstado().then(setPelea);
}, []);
```

### Cambiar Número de Pelea

```typescript
import { fightService } from '@/lib/services';

const cambiarPelea = async (nuevaPelea: number) => {
  try {
    await fightService.updateNumeroPelea(nuevaPelea);
    console.log(`✅ Cambiado a Pelea #${nuevaPelea}`);
  } catch (error) {
    console.error('Error cambiando pelea:', error);
  }
};

// Ejemplo: Siguiente pelea
const siguientePelea = async () => {
  const estado = await fightService.getEstadoPelea();
  await cambiarPelea(estado.numeroPelea + 1);
};
```

### Actualizar Cuota

```typescript
import { fightService } from '@/lib/services';

const actualizarCuota = async (nuevaCuota: number) => {
  try {
    await fightService.updateCuota(nuevaCuota);
    console.log(`✅ Cuota actualizada a ${nuevaCuota}x`);
  } catch (error) {
    console.error('Error actualizando cuota:', error);
  }
};

// Ejemplos
await actualizarCuota(1.5);   // Cuota baja
await actualizarCuota(2.0);   // Cuota media
await actualizarCuota(3.5);   // Cuota alta
```

### Abrir Apuestas

```typescript
import { fightService } from '@/lib/services';

const abrirApuestas = async (segundos: number) => {
  try {
    await fightService.controlarApuestas(true, segundos);
    console.log(`✅ Apuestas abiertas por ${segundos} segundos`);
    
    // Nota: Las apuestas anteriores se limpian automáticamente
  } catch (error) {
    console.error('Error abriendo apuestas:', error);
  }
};

// Ejemplo con diferentes tiempos
await abrirApuestas(30);   // 30 segundos
await abrirApuestas(60);   // 1 minuto
await abrirApuestas(120);  // 2 minutos
```

### Cerrar Apuestas Manualmente

```typescript
import { fightService } from '@/lib/services';

const cerrarApuestas = async () => {
  try {
    await fightService.controlarApuestas(false);
    console.log('✅ Apuestas cerradas');
  } catch (error) {
    console.error('Error cerrando apuestas:', error);
  }
};
```

### Countdown Timer (Decrementar Tiempo)

```typescript
import { fightService } from '@/lib/services';

// En un componente React con useEffect
useEffect(() => {
  const interval = setInterval(async () => {
    await fightService.decrementarTiempo();
    
    // Recargar estado para mostrar nuevo tiempo
    const nuevoEstado = await fightService.getEstadoPelea();
    setPelea(nuevoEstado);
    
    // Si llegó a 0, se cierra automáticamente
    if (nuevoEstado.tiempoRestante === 0) {
      console.log('⏰ Tiempo agotado - Apuestas cerradas');
    }
  }, 1000); // Cada segundo

  return () => clearInterval(interval);
}, []);
```

---

## Apuestas

### Realizar una Apuesta

```typescript
import { betService } from '@/lib/services';

const apostar = async (
  username: string,
  opcion: 'Rojo' | 'Azul' | 'Empate',
  monto: number
) => {
  try {
    await betService.realizarApuesta(username, opcion, monto);
    console.log(`✅ Apuesta de $${monto} al ${opcion} registrada`);
    
    // Actualizar saldo del usuario
    const updatedUser = await userService.getUserByUsername(username);
    console.log('Nuevo saldo:', updatedUser?.saldo);
  } catch (error) {
    if (error.message === 'Las apuestas están cerradas') {
      console.log('❌ Las apuestas ya cerraron');
    } else if (error.message === 'Saldo insuficiente') {
      console.log('❌ No tienes suficiente saldo');
    } else {
      console.error('Error en apuesta:', error);
    }
  }
};

// Ejemplos
await apostar('cliente1', 'Rojo', 50);    // $50 al Rojo
await apostar('cliente2', 'Azul', 100);   // $100 al Azul
await apostar('cliente1', 'Empate', 25);  // $25 al Empate
```

### Ver Apuestas Actuales

```typescript
import { betService } from '@/lib/services';

const verApuestas = async () => {
  const apuestas = await betService.getApuestasActuales();
  
  console.log(`📊 Total de apuestas: ${apuestas.length}`);
  
  // Agrupar por opción
  const porRojo = apuestas.filter(a => a.opcion === 'Rojo');
  const porAzul = apuestas.filter(a => a.opcion === 'Azul');
  const porEmpate = apuestas.filter(a => a.opcion === 'Empate');
  
  console.log(`🔴 Rojo: ${porRojo.length} apuestas`);
  console.log(`🔵 Azul: ${porAzul.length} apuestas`);
  console.log(`⚪ Empate: ${porEmpate.length} apuestas`);
  
  // Total apostado
  const totalRojo = porRojo.reduce((sum, a) => sum + a.monto, 0);
  const totalAzul = porAzul.reduce((sum, a) => sum + a.monto, 0);
  const totalEmpate = porEmpate.reduce((sum, a) => sum + a.monto, 0);
  
  console.log(`💰 Total Rojo: $${totalRojo}`);
  console.log(`💰 Total Azul: $${totalAzul}`);
  console.log(`💰 Total Empate: $${totalEmpate}`);
  
  return apuestas;
};
```

### Pagar Ganadores

```typescript
import { betService } from '@/lib/services';

const pagarGanador = async (ganador: 'Rojo' | 'Azul' | 'Empate') => {
  try {
    const totalPagado = await betService.pagarGanadores(ganador);
    
    console.log(`🏆 Ganó: ${ganador}`);
    console.log(`💰 Total pagado en premios: $${totalPagado.toFixed(2)}`);
    
    // Las apuestas se limpian y cierran automáticamente
    console.log('✅ Apuestas limpiadas y cerradas');
    
    // Recargar clientes para ver nuevos saldos
    const clientes = await userService.getClientes();
    return { totalPagado, clientes };
  } catch (error) {
    console.error('Error pagando ganadores:', error);
  }
};

// Ejemplos
await pagarGanador('Rojo');
await pagarGanador('Azul');
await pagarGanador('Empate');
```

### Flujo Completo de una Pelea

```typescript
import { fightService, betService, userService } from '@/lib/services';

const flujoCompletoPelea = async () => {
  console.log('🎮 Iniciando nueva pelea...\n');
  
  // 1. Configurar pelea
  await fightService.updateNumeroPelea(5);
  await fightService.updateCuota(1.8);
  console.log('✅ Pelea #5 configurada con cuota 1.8x\n');
  
  // 2. Abrir apuestas
  await fightService.controlarApuestas(true, 60);
  console.log('✅ Apuestas abiertas por 60 segundos\n');
  
  // 3. Clientes apuestan
  await betService.realizarApuesta('cliente1', 'Rojo', 100);
  await betService.realizarApuesta('cliente2', 'Azul', 50);
  console.log('✅ Apuestas registradas\n');
  
  // 4. Ver estado
  const apuestas = await betService.getApuestasActuales();
  console.log(`📊 Total apuestas: ${apuestas.length}\n`);
  
  // 5. Cerrar apuestas (después del tiempo o manual)
  await fightService.controlarApuestas(false);
  console.log('✅ Apuestas cerradas\n');
  
  // 6. Declarar ganador
  const resultado = await betService.pagarGanadores('Rojo');
  console.log(`🏆 Ganó Rojo - Pagado: $${resultado}\n`);
  
  // 7. Ver clientes actualizados
  const clientes = await userService.getClientes();
  clientes.forEach(c => {
    console.log(`${c.nombre}: $${c.saldo}`);
  });
};
```

---

## Listeners en Tiempo Real

### Suscribirse a Cambios Globales

```typescript
import { subscribeToChanges } from '@/lib/services';

// En un componente React
useEffect(() => {
  const unsubscribe = subscribeToChanges(() => {
    console.log('🔄 Hubo cambios en los datos');
    
    // Recargar datos necesarios
    loadClientes();
    loadEstadoPelea();
    loadApuestas();
  });

  // Cleanup al desmontar componente
  return () => unsubscribe();
}, []);
```

### Listener de Estado de Pelea (Firestore nativo)

```typescript
import { subscribeToEstadoPelea } from '@/lib/services/firestore-services';

// Solo disponible en implementación Firestore
useEffect(() => {
  if (process.env.NEXT_PUBLIC_USE_FIRESTORE === 'true') {
    const unsubscribe = subscribeToEstadoPelea((nuevoEstado) => {
      console.log('⚡ Estado actualizado en tiempo real:', nuevoEstado);
      setPelea(nuevoEstado);
    });

    return () => unsubscribe();
  }
}, []);
```

### Auto-refresh de Usuario

```typescript
import { authService, subscribeToChanges } from '@/lib/services';

const refreshUserData = async (username: string) => {
  const updatedUser = await userService.getUserByUsername(username);
  if (updatedUser) {
    setUser(updatedUser);
    authService.setCurrentUser(updatedUser);
    console.log('✅ Usuario actualizado:', updatedUser.saldo);
  }
};

useEffect(() => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;

  const unsubscribe = subscribeToChanges(() => {
    refreshUserData(currentUser.user);
  });

  return () => unsubscribe();
}, []);
```

---

## 🎯 Ejemplos Completos por Rol

### Panel de Cliente Completo

```typescript
'use client';
import { useState, useEffect } from 'react';
import { authService, fightService, betService, subscribeToChanges } from '@/lib/services';

function ClienteDashboard() {
  const [user, setUser] = useState(null);
  const [pelea, setPelea] = useState(null);
  const [montoApuesta, setMontoApuesta] = useState(10);

  // Cargar datos iniciales
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    loadEstadoPelea();
    
    // Listener de cambios
    const unsub = subscribeToChanges(() => {
      loadEstadoPelea();
      refreshUser(currentUser.user);
    });
    
    return () => unsub();
  }, []);

  const loadEstadoPelea = async () => {
    const estado = await fightService.getEstadoPelea();
    setPelea(estado);
  };

  const refreshUser = async (username) => {
    const updated = await userService.getUserByUsername(username);
    if (updated) {
      setUser(updated);
      authService.setCurrentUser(updated);
    }
  };

  const handleApostar = async (opcion) => {
    try {
      await betService.realizarApuesta(user.user, opcion, montoApuesta);
      alert(`Apuesta de $${montoApuesta} al ${opcion} registrada`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Saldo: ${user?.saldo}</h1>
      <h2>Pelea #{pelea?.numeroPelea}</h2>
      <button onClick={() => handleApostar('Rojo')}>Apostar Rojo</button>
      <button onClick={() => handleApostar('Azul')}>Apostar Azul</button>
    </div>
  );
}
```

### Panel de Admin Completo

```typescript
'use client';
import { useState, useEffect } from 'react';
import { userService, fightService, betService } from '@/lib/services';

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [numeroPelea, setNumeroPelea] = useState(1);
  const [cuota, setCuota] = useState(1.8);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    const data = await userService.getClientes();
    setClientes(data);
  };

  const handleAbrirApuestas = async () => {
    await fightService.controlarApuestas(true, 60);
    alert('Apuestas abiertas');
  };

  const handlePagarGanadores = async (ganador) => {
    const total = await betService.pagarGanadores(ganador);
    alert(`Pagado: $${total}`);
    loadClientes();
  };

  return (
    <div>
      <h1>Panel Admin</h1>
      <button onClick={handleAbrirApuestas}>Abrir Apuestas</button>
      <button onClick={() => handlePagarGanadores('Rojo')}>Ganó Rojo</button>
      <ul>
        {clientes.map(c => (
          <li key={c.user}>{c.nombre} - ${c.saldo}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📚 Recursos Adicionales

- Ver [FIRESTORE_SETUP.md](FIRESTORE_SETUP.md) para configuración
- Ver [FIRESTORE_MIGRATION.md](FIRESTORE_MIGRATION.md) para guía técnica
- Consulta [Firebase Docs](https://firebase.google.com/docs/firestore) para referencia
