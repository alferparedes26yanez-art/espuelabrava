'use client';

import { useEffect, useState } from 'react';
import { historialService } from '@/lib/services';
import type { HistorialApuesta } from '@/types';

interface Props {
  username: string;
}

export default function HistorialApuestasCliente({ username }: Props) {
  const [historial, setHistorial] = useState<HistorialApuesta[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistorial();
  }, [username]);

  const loadHistorial = async () => {
    if (!historialService) {
      console.warn('Historial solo disponible con Firestore');
      setLoading(false);
      return;
    }

    try {
      const [hist, stats] = await Promise.all([
        historialService.getHistorialApuestasUsuario(username, 20),
        historialService.getEstadisticasUsuario(username)
      ]);
      
      setHistorial(hist);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!historialService) {
    return null; // No mostrar si no está usando Firestore
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#888' }}>Cargando historial...</div>;
  }

  return (
    <div style={{ 
      background: '#1a1a1a', 
      padding: '20px', 
      borderRadius: '8px', 
      marginTop: '20px' 
    }}>
      <h3 style={{ color: '#d4af37', marginBottom: '15px' }}>📊 Mis Estadísticas</h3>
      
      {estadisticas && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            <small style={{ color: '#888' }}>Total Apuestas</small>
            <div style={{ fontSize: '20px', color: '#d4af37' }}>{estadisticas.totalApuestas}</div>
          </div>
          <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            <small style={{ color: '#888' }}>Ganadas</small>
            <div style={{ fontSize: '20px', color: '#27ae60' }}>{estadisticas.totalGanadas}</div>
          </div>
          <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            <small style={{ color: '#888' }}>% Éxito</small>
            <div style={{ fontSize: '20px', color: '#d4af37' }}>
              {estadisticas.porcentajeExito.toFixed(1)}%
            </div>
          </div>
          <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            <small style={{ color: '#888' }}>Total Apostado</small>
            <div style={{ fontSize: '20px', color: '#e74c3c' }}>
              ${estadisticas.totalApostado.toFixed(2)}
            </div>
          </div>
          <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            <small style={{ color: '#888' }}>Total Ganado</small>
            <div style={{ fontSize: '20px', color: '#27ae60' }}>
              ${estadisticas.totalGanado.toFixed(2)}
            </div>
          </div>
          <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            <small style={{ color: '#888' }}>Balance</small>
            <div style={{ 
              fontSize: '20px', 
              color: (estadisticas.totalGanado - estadisticas.totalApostado) >= 0 ? '#27ae60' : '#e74c3c' 
            }}>
              ${(estadisticas.totalGanado - estadisticas.totalApostado).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>📜 Últimas Apuestas</h3>
      
      {historial.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
          No tienes apuestas registradas aún
        </p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {historial.map((apuesta, index) => (
            <div 
              key={index}
              style={{
                background: apuesta.gano ? '#1a3a1a' : '#3a1a1a',
                border: apuesta.gano ? '1px solid #27ae60' : '1px solid #e74c3c',
                padding: '12px',
                margin: '8px 0',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', color: '#d4af37' }}>
                  Pelea #{apuesta.numeroPelea}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {apuesta.fecha?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {apuesta.opcion}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  ${apuesta.monto} x {apuesta.cuota}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: apuesta.gano ? '#27ae60' : '#e74c3c'
                }}>
                  {apuesta.gano ? `+$${apuesta.premio?.toFixed(2)}` : `-$${apuesta.monto.toFixed(2)}`}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Ganó: {apuesta.ganador}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
