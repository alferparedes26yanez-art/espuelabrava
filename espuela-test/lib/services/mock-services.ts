import type { Database, Usuario, Apuesta } from '@/types';

// Base de datos simulada en memoria (reemplaza localStorage)
let mockDB: Database = {
  usuarios: [
    { user: 'admin', pass: '8888', nombre: 'Dueño', saldo: 0, rol: 'admin' },
    { user: 'cliente1', pass: '1234', nombre: 'Juan Pérez', saldo: 500, rol: 'cliente' },
    { user: 'cliente2', pass: '1234', nombre: 'María García', saldo: 300, rol: 'cliente' },
  ],
  cuota: 1.80,
  apuestasAbiertas: false,
  tiempoRestante: 0,
  apuestasActuales: [],
  numeroPelea: 1,
};

// Listeners para cambios en tiempo real
let listeners: Array<() => void> = [];

export const subscribeToChanges = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

const notifyListeners = () => {
  listeners.forEach(callback => callback());
};

// Servicios de autenticación
export const authService = {
  login: async (username: string, password: string): Promise<Usuario | null> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular latencia
    const user = mockDB.usuarios.find(u => u.user === username && u.pass === password);
    return user || null;
  },

  getCurrentUser: (): Usuario | null => {
    // En producción, esto vendría de un token/sesión
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser: (user: Usuario | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentUser');
    }
  },
};

// Servicios de usuarios
export const userService = {
  createUser: async (nombre: string, username: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (mockDB.usuarios.find(u => u.user === username)) {
      throw new Error('El usuario ya existe');
    }

    mockDB.usuarios.push({
      user: username,
      pass: password,
      nombre,
      saldo: 0,
      rol: 'cliente',
    });
    
    notifyListeners();
    return true;
  },

  getClientes: async (): Promise<Usuario[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockDB.usuarios.filter(u => u.rol === 'cliente');
  },

  updateSaldo: async (username: string, cantidad: number, operacion: 'sumar' | 'restar'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const user = mockDB.usuarios.find(u => u.user === username);
    if (!user) return false;

    if (operacion === 'sumar') {
      user.saldo += cantidad;
    } else {
      user.saldo -= cantidad;
    }

    notifyListeners();
    return true;
  },

  getUserByUsername: async (username: string): Promise<Usuario | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockDB.usuarios.find(u => u.user === username) || null;
  },
};

// Servicios de peleas y apuestas
export const fightService = {
  getEstadoPelea: async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      numeroPelea: mockDB.numeroPelea,
      cuota: mockDB.cuota,
      apuestasAbiertas: mockDB.apuestasAbiertas,
      tiempoRestante: mockDB.tiempoRestante,
      apuestasActuales: mockDB.apuestasActuales,
    };
  },

  updateNumeroPelea: async (numero: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockDB.numeroPelea = numero;
    notifyListeners();
    return true;
  },

  updateCuota: async (cuota: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockDB.cuota = cuota;
    notifyListeners();
    return true;
  },

  controlarApuestas: async (abrir: boolean, segundos?: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    mockDB.apuestasAbiertas = abrir;
    
    if (abrir && segundos) {
      mockDB.tiempoRestante = segundos;
      mockDB.apuestasActuales = []; // Limpiar apuestas anteriores
    } else {
      mockDB.tiempoRestante = 0;
    }

    notifyListeners();
    return true;
  },

  decrementarTiempo: () => {
    if (mockDB.tiempoRestante > 0) {
      mockDB.tiempoRestante--;
      if (mockDB.tiempoRestante === 0) {
        mockDB.apuestasAbiertas = false;
      }
      notifyListeners();
    }
  },
};

// Servicios de apuestas
export const betService = {
  realizarApuesta: async (username: string, opcion: 'Rojo' | 'Azul' | 'Empate', monto: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 150));

    if (!mockDB.apuestasAbiertas || mockDB.tiempoRestante <= 0) {
      throw new Error('Las apuestas están cerradas');
    }

    const user = mockDB.usuarios.find(u => u.user === username);
    if (!user) throw new Error('Usuario no encontrado');
    
    if (monto > user.saldo || monto <= 0) {
      throw new Error('Saldo insuficiente');
    }

    // Descontar saldo
    user.saldo -= monto;

    // Registrar apuesta
    mockDB.apuestasActuales.push({
      user: username,
      opcion,
      monto,
      timestamp: Date.now(),
    });

    notifyListeners();
    return true;
  },

  pagarGanadores: async (ganador: 'Rojo' | 'Azul' | 'Empate'): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    let totalPagado = 0;

    mockDB.apuestasActuales.forEach(apuesta => {
      if (apuesta.opcion === ganador) {
        const user = mockDB.usuarios.find(u => u.user === apuesta.user);
        if (user) {
          const premio = apuesta.monto * mockDB.cuota;
          user.saldo += premio;
          totalPagado += premio;
        }
      }
    });

    // Limpiar apuestas y cerrar
    mockDB.apuestasActuales = [];
    mockDB.apuestasAbiertas = false;
    mockDB.tiempoRestante = 0;

    notifyListeners();
    return totalPagado;
  },

  getApuestasActuales: async (): Promise<Apuesta[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...mockDB.apuestasActuales];
  },
};

// Para desarrollo: Exponer DB en consola
if (typeof window !== 'undefined') {
  (window as any).mockDB = mockDB;
}
