'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService, fightService, betService, subscribeToChanges } from '@/lib/services';
import type { Usuario } from '@/types';
import HistorialPeleasAdmin from '@/app/components/HistorialPeleasAdmin';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para formularios
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoUser, setNuevoUser] = useState('');
  const [nuevoPass, setNuevoPass] = useState('');
  const [numeroPelea, setNumeroPelea] = useState(1);
  const [segundos, setSegundos] = useState(60);
  const [cuota, setCuota] = useState(1.8);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser.rol !== 'admin') {
      router.push('/dashboard/cliente');
      return;
    }

    setUser(currentUser);
    loadClientes();
    loadEstadoPelea();
    setLoading(false);

    // Suscribirse a cambios
    const unsubscribe = subscribeToChanges(() => {
      loadClientes();
      loadEstadoPelea();
    });

    return () => unsubscribe();
  }, [router]);

  const loadClientes = async () => {
    const clientesData = await userService.getClientes();
    setClientes(clientesData);
  };

  const loadEstadoPelea = async () => {
    const estado = await fightService.getEstadoPelea();
    setNumeroPelea(estado.numeroPelea);
    setCuota(estado.cuota);
  };

  const handleCrearCliente = async () => {
    if (!nuevoNombre || !nuevoUser || !nuevoPass) {
      alert('Faltan datos');
      return;
    }

    try {
      await userService.createUser(nuevoNombre, nuevoUser, nuevoPass);
      alert('Usuario creado exitosamente');
      setNuevoNombre('');
      setNuevoUser('');
      setNuevoPass('');
      await loadClientes();
    } catch (error: any) {
      alert(error.message || 'Error al crear usuario');
    }
  };

  const handleGestionarSaldo = async (username: string, operacion: 'sumar' | 'restar') => {
    const cantidadStr = prompt('Cantidad:');
    if (!cantidadStr) return;

    const cantidad = parseFloat(cantidadStr);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Cantidad inválida');
      return;
    }

    try {
      await userService.updateSaldo(username, cantidad, operacion);
      await loadClientes();
    } catch (error) {
      alert('Error al actualizar saldo');
    }
  };

  const handleActualizarPelea = async () => {
    await fightService.updateNumeroPelea(numeroPelea);
    alert(`Cambiado a Pelea ${numeroPelea}`);
  };

  const handleFijarCuota = async () => {
    await fightService.updateCuota(cuota);
    alert('Cuota actualizada');
  };

  const handleControlarApuestas = async (abrir: boolean) => {
    await fightService.controlarApuestas(abrir, abrir ? segundos : undefined);
    alert(abrir ? 'Apuestas abiertas' : 'Apuestas cerradas');
  };

  const handlePagarGanadores = async (ganador: 'Rojo' | 'Azul' | 'Empate') => {
    if (!confirm(`¿Confirmar que ganó ${ganador}?`)) return;

    try {
      const totalPagado = await betService.pagarGanadores(ganador);
      await loadClientes();
      alert(`Premios pagados para ${ganador}. Total: $${totalPagado.toFixed(2)}`);
    } catch (error) {
      alert('Error al pagar ganadores');
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (loading || !user) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div id="main-dashboard">
      <nav className="navbar">
        <div className="logo">🥊 Espuela Brava - ADMIN</div>
        <div className="user-info">
          <div className="profile">
            <span>{user.nombre}</span>
            <div className="avatar">👑</div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </nav>

      <div className="admin-section">
        <h2 style={{ color: '#d4af37', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          Panel Master Administrativo
        </h2>

        <div className="admin-grid">
          {/* Crear Clientes */}
          <div className="admin-card">
            <h3>👥 Crear Clientes</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
            <input
              type="text"
              placeholder="Usuario"
              value={nuevoUser}
              onChange={(e) => setNuevoUser(e.target.value)}
            />
            <input
              type="text"
              placeholder="Clave"
              value={nuevoPass}
              onChange={(e) => setNuevoPass(e.target.value)}
            />
            <button onClick={handleCrearCliente} style={{ background: '#27ae60' }}>
              CREAR USUARIO
            </button>

            <h4>Lista de Clientes</h4>
            <div className="scroll-lista">
              {clientes.map((cliente) => (
                <div
                  key={cliente.user}
                  style={{
                    background: '#222',
                    margin: '5px',
                    padding: '10px',
                    borderRadius: '5px',
                  }}
                >
                  {cliente.nombre} - <b>${cliente.saldo.toFixed(2)}</b>
                  <br />
                  <button onClick={() => handleGestionarSaldo(cliente.user, 'sumar')}>
                    +
                  </button>
                  <button onClick={() => handleGestionarSaldo(cliente.user, 'restar')}>
                    -
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Control de Pelea */}
          <div className="admin-card">
            <h3>⏱️ Control de Pelea</h3>
            <label>Número de Pelea:</label>
            <input
              type="number"
              value={numeroPelea}
              onChange={(e) => setNumeroPelea(Number(e.target.value))}
            />
            <button onClick={handleActualizarPelea} style={{ background: '#2980b9' }}>
              ACTUALIZAR PELEA
            </button>

            <hr />

            <label>Segundos:</label>
            <input
              type="number"
              value={segundos}
              onChange={(e) => setSegundos(Number(e.target.value))}
            />
            <button
              onClick={() => handleControlarApuestas(true)}
              style={{ background: '#d4af37', color: '#000' }}
            >
              ABRIR PELEA
            </button>
            <button
              onClick={() => handleControlarApuestas(false)}
              style={{ background: '#c0392b' }}
            >
              CERRAR
            </button>

            <hr />

            <label>Cuota:</label>
            <input
              type="number"
              step="0.1"
              value={cuota}
              onChange={(e) => setCuota(Number(e.target.value))}
            />
            <button onClick={handleFijarCuota} style={{ background: '#8e44ad' }}>
              FIJAR CUOTA
            </button>
          </div>

          {/* Declarar Ganador */}
          <div className="admin-card">
            <h3>🏆 Declarar Ganador</h3>
            <button
              onClick={() => handlePagarGanadores('Rojo')}
              className="btn-pago-rojo"
            >
              GANÓ ROJO
            </button>
            <button
              onClick={() => handlePagarGanadores('Empate')}
              className="btn-pago-gris"
            >
              EMPATE
            </button>
            <button
              onClick={() => handlePagarGanadores('Azul')}
              className="btn-pago-azul"
            >
              GANÓ AZUL
            </button>
          </div>

          {/* Historial de peleas */}
          <HistorialPeleasAdmin />
        </div>
      </div>
    </div>
  );
}
