'use client';

import { useEffect, useState } from 'react';
import { historialService } from '@/lib/services';
import type { HistorialPelea } from '@/types';

export default function HistorialPeleasAdmin() {
  const [historial, setHistorial] = useState<HistorialPelea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    if (!historialService) {
      console.warn('Historial solo disponible con Firestore');
      setLoading(false);
      return;
    }

    try {
      // Obtener solo las peleas del día de hoy
      const hist = await historialService.getHistorialPeleasHoy(15);
      setHistorial(hist);
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
    <div className="admin-card">
      <h3>📜 Historial de Peleas</h3>
      
      {historial.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
          No hay peleas en el historial
        </p>
      ) : (
        <div className="scroll-lista" style={{ maxHeight: '500px' }}>
          {historial.map((pelea, index) => (
            <div 
              key={index}
              style={{
                background: '#222',
                padding: '15px',
                margin: '10px 0',
                borderRadius: '8px',
                border: '1px solid #333'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div>
                  <h4 style={{ color: '#d4af37', margin: '0 0 5px 0' }}>
                    Pelea #{pelea.numeroPelea}
                  </h4>
                  <small style={{ color: '#888' }}>
                    {pelea.fechaFin?.toDate?.()?.toLocaleString() || 'Fecha no disponible'}
                  </small>
                </div>
                <div style={{ 
                  background: '#d4af37',
                  color: '#000',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}>
                  🏆 {pelea.ganador}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '10px',
                marginTop: '10px'
              }}>
                <div>
                  <small style={{ color: '#888' }}>Cuota</small>
                  <div style={{ color: '#d4af37', fontWeight: 'bold' }}>
                    {pelea.cuota}x
                  </div>
                </div>
                <div>
                  <small style={{ color: '#888' }}>Apuestas</small>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>
                    {pelea.cantidadApuestas}
                  </div>
                </div>
                <div>
                  <small style={{ color: '#888' }}>Total Apostado</small>
                  <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                    ${pelea.totalApuestas?.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Total Pagado:</span>
                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                    ${pelea.totalPagado?.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  <span style={{ color: '#888' }}>Ganancia Casa:</span>
                  <span style={{ 
                    color: (pelea.totalApuestas - pelea.totalPagado) >= 0 ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold'
                  }}>
                    ${((pelea.totalApuestas || 0) - (pelea.totalPagado || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Resumen de apuestas */}
              {pelea.apuestas && pelea.apuestas.length > 0 && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    color: '#d4af37',
                    fontSize: '12px'
                  }}>
                    Ver detalle ({pelea.apuestas.length} apuestas)
                  </summary>
                  <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                    {pelea.apuestas.map((apuesta, i) => (
                      <div 
                        key={i}
                        style={{ 
                          fontSize: '11px',
                          padding: '5px',
                          margin: '3px 0',
                          background: '#1a1a1a',
                          borderRadius: '3px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{apuesta.user}</span>
                        <span>{apuesta.opcion}</span>
                        <span>${apuesta.monto}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
