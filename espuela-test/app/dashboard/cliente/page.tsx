'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, fightService, betService, subscribeToChanges } from '@/lib/services';
import type { Usuario, EstadoPelea } from '@/types';
import HistorialApuestasCliente from '@/app/components/HistorialApuestasCliente';

export default function ClienteDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [pelea, setPelea] = useState<EstadoPelea | null>(null);
  const [montoApuesta, setMontoApuesta] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser.rol !== 'cliente') {
      router.push('/dashboard/admin');
      return;
    }

    setUser(currentUser);
    loadEstadoPelea();
    setLoading(false);

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToChanges(() => {
      loadEstadoPelea();
      refreshUserData(currentUser.user);
    });

    // Actualizar timer cada segundo
    const interval = setInterval(() => {
      fightService.decrementarTiempo();
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  const loadEstadoPelea = async () => {
    const estado = await fightService.getEstadoPelea();
    setPelea(estado);
  };

  const refreshUserData = async (username: string) => {
    const updatedUser = await authService.login(username, user?.pass || '');
    if (updatedUser) {
      setUser(updatedUser);
      authService.setCurrentUser(updatedUser);
    }
  };

  const handleApostar = async (opcion: 'Rojo' | 'Azul' | 'Empate') => {
    if (!user || !pelea) return;

    try {
      await betService.realizarApuesta(user.user, opcion, montoApuesta);
      alert(`¡Apuesta al ${opcion} recibida!`);
      await refreshUserData(user.user);
      await loadEstadoPelea();
    } catch (error: any) {
      alert(error.message || 'Error al realizar apuesta');
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (loading || !user || !pelea) {
    return <div className="loading">Cargando...</div>;
  }

  const showOverlay = !pelea.apuestasAbiertas || pelea.tiempoRestante <= 0;

  return (
    <div id="main-dashboard">
      <nav className="navbar">
        <div className="logo">🥊 Espuela Brava</div>
        <div className="user-info">
          <div className="saldo-box">
            <span>SALDO DISPONIBLE</span>
            <strong>${user.saldo.toFixed(2)}</strong>
          </div>
          <div className="profile">
            <span>{user.nombre}</span>
            <div className="avatar">🐓</div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </nav>

      <div className="game-container">
        <div className="timer-container">
          <div className="timer-circle">
            <span id="reloj-display">
              {pelea.tiempoRestante < 10 ? `0${pelea.tiempoRestante}` : pelea.tiempoRestante}
            </span>
            <small>SEGUNDOS</small>
          </div>
          <div className={pelea.apuestasAbiertas && pelea.tiempoRestante > 0 ? 'status-open' : 'status-closed'}>
            {pelea.apuestasAbiertas && pelea.tiempoRestante > 0 ? '● APUESTAS ABIERTAS' : '● CERRADO'}
          </div>
        </div>

        <h2 className="pelea-titulo">
          Pelea No. <span>{pelea.numeroPelea}</span>
        </h2>
        <p className="subtitulo">Arena Principal • Derby Invernal</p>

        <div className="apuesta-selector">
          <span>CUÁNTO QUIERES APOSTAR:</span>
          <div className="monto-control">
            <input
              type="number"
              value={montoApuesta}
              onChange={(e) => setMontoApuesta(Number(e.target.value))}
              min="1"
              max={user.saldo}
            />
          </div>
        </div>

        <div className="bet-grid">
          <button className="card rojo" onClick={() => handleApostar('Rojo')}>
            <div className="icon">🐓</div>
            <h3>GALLO ROJO</h3>
            <span className="cuota-badge">
              CUOTA: <b>{pelea.cuota}x</b>
            </span>
          </button>

          <button className="card empate" onClick={() => handleApostar('Empate')}>
            <div className="icon">⚖️</div>
            <h3>EMPATE</h3>
            <span className="cuota-badge">TABLAS</span>
          </button>

          <button className="card azul" onClick={() => handleApostar('Azul')}>
            <div className="icon">🐓</div>
            <h3>GALLO AZUL</h3>
            <span className="cuota-badge">
              CUOTA: <b>{pelea.cuota}x</b>
            </span>
          </button>
        </div>

        <p className="footer-msg">Las apuestas se bloquean al llegar a cero.</p>
        
        {/* Historial de apuestas del cliente */}
        <HistorialApuestasCliente username={user.user} />
      </div>

      {showOverlay && (
        <div className="closed-overlay">
          <div className="closed-message">
            <div style={{ fontSize: '50px' }}>🔒</div>
            <h1>APUESTAS CERRADAS</h1>
            <p>ESPERA A LA SIGUIENTE PELEA</p>
          </div>
        </div>
      )}
    </div>
  );
}
