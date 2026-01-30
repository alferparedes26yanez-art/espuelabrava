'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(username, password);
      
      if (!user) {
        setError('Usuario o contraseña incorrecta');
        return;
      }

      authService.setCurrentUser(user);

      // Redirigir según rol
      if (user.rol === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/cliente');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h1 style={{ color: '#d4af37', marginBottom: '10px' }}>ESPUELA BRAVAA</h1>
        <p style={{ color: '#888', marginBottom: '20px' }}>Ingreso Privado</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          {error && (
            <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '10px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#888' : '#d4af37',
              color: '#000',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'INGRESANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Usuarios de prueba:</p>
          <p>Admin: admin / 8888</p>
          <p>Cliente: cliente1 / 1234</p>
        </div>
      </div>
    </div>
  );
}
