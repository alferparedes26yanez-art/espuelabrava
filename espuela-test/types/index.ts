export type UserRole = 'admin' | 'cliente';

export interface Usuario {
  user: string;
  pass: string;
  nombre: string;
  saldo: number;
  rol: UserRole;
}

export interface Apuesta {
  user: string;
  opcion: 'Rojo' | 'Azul' | 'Empate';
  monto: number;
  timestamp?: number;
}

export interface EstadoPelea {
  numeroPelea: number;
  cuota: number;
  apuestasAbiertas: boolean;
  tiempoRestante: number;
  apuestasActuales: Apuesta[];
}

export interface Database {
  usuarios: Usuario[];
  cuota: number;
  apuestasAbiertas: boolean;
  tiempoRestante: number;
  apuestasActuales: Apuesta[];
  numeroPelea: number;
}
