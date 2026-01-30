import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  query,
  where,
  onSnapshot,
  increment,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Database, Usuario, Apuesta, HistorialPelea, HistorialApuesta } from '@/types';

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

// Helper: Referencia al documento de estado de pelea
const getEstadoPeleaRef = () => doc(db, 'config', 'estadoPelea');

// Helper: Inicializar estado de pelea si no existe
const initEstadoPelea = async () => {
  const ref = getEstadoPeleaRef();
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    await setDoc(ref, {
      numeroPelea: 1,
      cuota: 1.80,
      apuestasAbiertas: false,
      tiempoRestante: 0,
      updatedAt: serverTimestamp()
    });
  }
};

// ==================== Servicios de Autenticación ====================
export const authService = {
  login: async (username: string, password: string): Promise<Usuario | null> => {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('user', '==', username));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const userData = snapshot.docs[0].data() as Usuario;
      
      // Verificar contraseña (en producción usar Firebase Auth)
      if (userData.pass === password) {
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  },

  getCurrentUser: (): Usuario | null => {
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

// ==================== Servicios de Usuarios ====================
export const userService = {
  createUser: async (nombre: string, username: string, password: string): Promise<boolean> => {
    try {
      // Verificar si el usuario ya existe
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('user', '==', username));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error('El usuario ya existe');
      }

      // Crear nuevo usuario con ID personalizado
      const userDocRef = doc(db, 'usuarios', username);
      await setDoc(userDocRef, {
        user: username,
        pass: password, // En producción, usar Firebase Auth
        nombre,
        saldo: 0,
        rol: 'cliente',
        createdAt: serverTimestamp()
      });
      
      notifyListeners();
      return true;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  },

  getClientes: async (): Promise<Usuario[]> => {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('rol', '==', 'cliente'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => doc.data() as Usuario);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      return [];
    }
  },

  updateSaldo: async (username: string, cantidad: number, operacion: 'sumar' | 'restar'): Promise<boolean> => {
    try {
      const userRef = doc(db, 'usuarios', username);
      
      if (operacion === 'sumar') {
        await updateDoc(userRef, {
          saldo: increment(cantidad)
        });
      } else {
        await updateDoc(userRef, {
          saldo: increment(-cantidad)
        });
      }

      notifyListeners();
      return true;
    } catch (error) {
      console.error('Error actualizando saldo:', error);
      return false;
    }
  },

  getUserByUsername: async (username: string): Promise<Usuario | null> => {
    try {
      const userRef = doc(db, 'usuarios', username);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as Usuario;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  },
};

// ==================== Servicios de Peleas ====================
export const fightService = {
  getEstadoPelea: async () => {
    try {
      await initEstadoPelea();
      const ref = getEstadoPeleaRef();
      const snap = await getDoc(ref);
      
      if (!snap.exists()) {
        return {
          numeroPelea: 1,
          cuota: 1.80,
          apuestasAbiertas: false,
          tiempoRestante: 0,
          apuestasActuales: []
        };
      }

      const data = snap.data();
      
      // Obtener apuestas actuales
      const apuestasSnapshot = await getDocs(collection(db, 'apuestasActuales'));
      const apuestasActuales = apuestasSnapshot.docs.map(doc => doc.data() as Apuesta);

      return {
        numeroPelea: data.numeroPelea || 1,
        cuota: data.cuota || 1.80,
        apuestasAbiertas: data.apuestasAbiertas || false,
        tiempoRestante: data.tiempoRestante || 0,
        apuestasActuales
      };
    } catch (error) {
      console.error('Error obteniendo estado de pelea:', error);
      return {
        numeroPelea: 1,
        cuota: 1.80,
        apuestasAbiertas: false,
        tiempoRestante: 0,
        apuestasActuales: []
      };
    }
  },

  updateNumeroPelea: async (numero: number): Promise<boolean> => {
    try {
      await initEstadoPelea();
      const ref = getEstadoPeleaRef();
      await updateDoc(ref, {
        numeroPelea: numero,
        updatedAt: serverTimestamp()
      });
      
      notifyListeners();
      return true;
    } catch (error) {
      console.error('Error actualizando número de pelea:', error);
      return false;
    }
  },

  updateCuota: async (cuota: number): Promise<boolean> => {
    try {
      await initEstadoPelea();
      const ref = getEstadoPeleaRef();
      await updateDoc(ref, {
        cuota,
        updatedAt: serverTimestamp()
      });
      
      notifyListeners();
      return true;
    } catch (error) {
      console.error('Error actualizando cuota:', error);
      return false;
    }
  },

  controlarApuestas: async (abrir: boolean, segundos?: number): Promise<boolean> => {
    try {
      await initEstadoPelea();
      const ref = getEstadoPeleaRef();
      
      const updateData: any = {
        apuestasAbiertas: abrir,
        updatedAt: serverTimestamp()
      };

      if (abrir && segundos) {
        updateData.tiempoRestante = segundos;
        updateData.fechaInicio = serverTimestamp(); // Marcar inicio de pelea
        
        // Limpiar apuestas anteriores
        const apuestasSnapshot = await getDocs(collection(db, 'apuestasActuales'));
        const batch = writeBatch(db);
        apuestasSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } else {
        updateData.tiempoRestante = 0;
      }

      await updateDoc(ref, updateData);
      
      notifyListeners();
      return true;
    } catch (error) {
      console.error('Error controlando apuestas:', error);
      return false;
    }
  },

  decrementarTiempo: async () => {
    try {
      const ref = getEstadoPeleaRef();
      const snap = await getDoc(ref);
      
      if (!snap.exists()) return;
      
      const data = snap.data();
      const tiempoRestante = data.tiempoRestante || 0;
      
      if (tiempoRestante > 0) {
        const nuevoTiempo = tiempoRestante - 1;
        const updateData: any = {
          tiempoRestante: nuevoTiempo,
          updatedAt: serverTimestamp()
        };

        if (nuevoTiempo === 0) {
          updateData.apuestasAbiertas = false;
        }

        await updateDoc(ref, updateData);
        notifyListeners();
      }
    } catch (error) {
      console.error('Error decrementando tiempo:', error);
    }
  },
};

// ==================== Servicios de Apuestas ====================
export const betService = {
  realizarApuesta: async (username: string, opcion: 'Rojo' | 'Azul' | 'Empate', monto: number): Promise<boolean> => {
    try {
      // Verificar que las apuestas estén abiertas
      const estadoRef = getEstadoPeleaRef();
      const estadoSnap = await getDoc(estadoRef);
      
      if (!estadoSnap.exists()) {
        throw new Error('Estado de pelea no encontrado');
      }

      const estado = estadoSnap.data();
      
      if (!estado.apuestasAbiertas || estado.tiempoRestante <= 0) {
        throw new Error('Las apuestas están cerradas');
      }

      // Verificar usuario y saldo
      const userRef = doc(db, 'usuarios', username);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userSnap.data() as Usuario;
      
      if (monto > userData.saldo || monto <= 0) {
        throw new Error('Saldo insuficiente');
      }

      // Descontar saldo
      await updateDoc(userRef, {
        saldo: increment(-monto)
      });

      // Registrar apuesta
      await addDoc(collection(db, 'apuestasActuales'), {
        user: username,
        opcion,
        monto,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      });

      notifyListeners();
      return true;
    } catch (error) {
      console.error('Error realizando apuesta:', error);
      throw error;
    }
  },

  pagarGanadores: async (ganador: 'Rojo' | 'Azul' | 'Empate'): Promise<number> => {
    try {
      let totalPagado = 0;
      let totalApuestas = 0;

      // Obtener estado actual
      const estadoRef = getEstadoPeleaRef();
      const estadoSnap = await getDoc(estadoRef);
      
      if (!estadoSnap.exists()) {
        throw new Error('Estado no encontrado');
      }
      
      const estadoData = estadoSnap.data();
      const cuota = estadoData.cuota || 1.80;
      const numeroPelea = estadoData.numeroPelea || 1;
      const fechaInicio = estadoData.fechaInicio || serverTimestamp();

      // Obtener todas las apuestas actuales
      const apuestasSnapshot = await getDocs(collection(db, 'apuestasActuales'));
      const apuestasArray = apuestasSnapshot.docs.map(doc => doc.data() as Apuesta);
      
      // Procesar pagos y guardar historial de cada apuesta
      for (const apuestaDoc of apuestasSnapshot.docs) {
        const apuesta = apuestaDoc.data() as Apuesta;
        const gano = apuesta.opcion === ganador;
        let premio = 0;
        
        totalApuestas += apuesta.monto;
        
        if (gano) {
          const userRef = doc(db, 'usuarios', apuesta.user);
          premio = apuesta.monto * cuota;
          
          await updateDoc(userRef, {
            saldo: increment(premio)
          });
          
          totalPagado += premio;
        }

        // Guardar en historial del usuario
        await addDoc(collection(db, `usuarios/${apuesta.user}/historialApuestas`), {
          numeroPelea,
          opcion: apuesta.opcion,
          monto: apuesta.monto,
          cuota,
          ganador,
          gano,
          premio: gano ? premio : 0,
          fecha: serverTimestamp()
        });
      }

      // Guardar historial de la pelea
      await addDoc(collection(db, 'historialPeleas'), {
        numeroPelea,
        cuota,
        ganador,
        totalApuestas,
        totalPagado,
        cantidadApuestas: apuestasArray.length,
        fechaInicio,
        fechaFin: serverTimestamp(),
        apuestas: apuestasArray
      });

      // Limpiar apuestas actuales
      const batch = writeBatch(db);
      apuestasSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Cerrar apuestas
      await updateDoc(estadoRef, {
        apuestasAbiertas: false,
        tiempoRestante: 0,
        updatedAt: serverTimestamp()
      });

      notifyListeners();
      return totalPagado;
    } catch (error) {
      console.error('Error pagando ganadores:', error);
      return 0;
    }
  },

  getApuestasActuales: async (): Promise<Apuesta[]> => {
    try {
      const apuestasSnapshot = await getDocs(collection(db, 'apuestasActuales'));
      return apuestasSnapshot.docs.map(doc => doc.data() as Apuesta);
    } catch (error) {
      console.error('Error obteniendo apuestas:', error);
      return [];
    }
  },
};

// ==================== Servicios de Historial ====================
export const historialService = {
  // Obtener historial de peleas (últimas N peleas)
  getHistorialPeleas: async (limitCount: number = 20): Promise<HistorialPelea[]> => {
    try {
      const q = query(
        collection(db, 'historialPeleas'),
        orderBy('fechaFin', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as HistorialPelea);
    } catch (error) {
      console.error('Error obteniendo historial de peleas:', error);
      return [];
    }
  },

  // Obtener historial de peleas del día (hoy)
  getHistorialPeleasHoy: async (limitCount: number = 50): Promise<HistorialPelea[]> => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const q = query(
        collection(db, 'historialPeleas'),
        where('fechaFin', '>=', Timestamp.fromDate(start)),
        where('fechaFin', '<=', Timestamp.fromDate(end)),
        orderBy('fechaFin', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as HistorialPelea);
    } catch (error) {
      console.error('Error obteniendo historial de peleas (hoy):', error);
      return [];
    }
  },

  // Obtener historial de apuestas de un usuario
  getHistorialApuestasUsuario: async (username: string, limitCount: number = 50): Promise<HistorialApuesta[]> => {
    try {
      const q = query(
        collection(db, `usuarios/${username}/historialApuestas`),
        orderBy('fecha', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as HistorialApuesta);
    } catch (error) {
      console.error('Error obteniendo historial de apuestas:', error);
      return [];
    }
  },

  // Obtener estadísticas de un usuario
  getEstadisticasUsuario: async (username: string): Promise<{
    totalApuestas: number;
    totalGanadas: number;
    totalPerdidas: number;
    totalApostado: number;
    totalGanado: number;
    porcentajeExito: number;
  }> => {
    try {
      const historial = await historialService.getHistorialApuestasUsuario(username, 1000);
      
      const totalApuestas = historial.length;
      const totalGanadas = historial.filter(h => h.gano).length;
      const totalPerdidas = totalApuestas - totalGanadas;
      const totalApostado = historial.reduce((sum, h) => sum + h.monto, 0);
      const totalGanado = historial.reduce((sum, h) => sum + (h.premio || 0), 0);
      const porcentajeExito = totalApuestas > 0 ? (totalGanadas / totalApuestas) * 100 : 0;

      return {
        totalApuestas,
        totalGanadas,
        totalPerdidas,
        totalApostado,
        totalGanado,
        porcentajeExito
      };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      return {
        totalApuestas: 0,
        totalGanadas: 0,
        totalPerdidas: 0,
        totalApostado: 0,
        totalGanado: 0,
        porcentajeExito: 0
      };
    }
  },

  // Obtener detalles de una pelea específica
  getPeleaDetalle: async (numeroPelea: number): Promise<HistorialPelea | null> => {
    try {
      const q = query(
        collection(db, 'historialPeleas'),
        where('numeroPelea', '==', numeroPelea),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      return snapshot.docs[0].data() as HistorialPelea;
    } catch (error) {
      console.error('Error obteniendo detalle de pelea:', error);
      return null;
    }
  }
};

// Suscripción en tiempo real al estado de pelea (opcional, para uso avanzado)
export const subscribeToEstadoPelea = (callback: (estado: any) => void) => {
  const ref = getEstadoPeleaRef();
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
};
