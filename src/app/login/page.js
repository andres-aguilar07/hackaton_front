'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleRedirect = (rol) => {
    switch (rol) {
      case 'enfermera_jefe':
        router.push('/head-nurse');
        break;
      case 'administrador':
        router.push('/administrador');
        break;
      case 'central':
        router.push('/central');
        break;
      case 'farmacia':
        router.push('/pharmacy');
        break;
      case 'instrumentador':
        router.push('/surgical-tech');
        break;
      default:
        setError('Rol no válido');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al iniciar sesión');
      }

      if (responseData.success && responseData.data) {
        const { token, user } = responseData.data;
        
        if (token && user && user.rol) {
          // Store the token in localStorage or a secure storage method
          localStorage.setItem('token', token);
          // Store user data if needed
          localStorage.setItem('userData', JSON.stringify(user));
          // Redirect based on role
          handleRoleRedirect(user.rol.nombre);
        } else {
          setError('Datos de usuario incompletos');
        }
      } else {
        setError('Respuesta del servidor inválida');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center"
      >
        <div className="mb-6">
          <Image src="/logo.png" alt="Logo" width={100} height={100} className="mx-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center tracking-tight">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="w-full">
          <label className="block mb-2 text-sm font-semibold text-gray-700">Correo</label>
          <input
            type="email"
            className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-2 text-sm font-semibold text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.38.28-2.693.781-3.893m16.438 2.328A9.99 9.99 0 0122 9c0 5.523-4.477 10-10 10a9.99 9.99 0 01-7.071-2.929M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18M10.477 10.477a3 3 0 004.243 4.243M9.88 5.88a9.964 9.964 0 017.778 4.122M6.36 6.36A9.965 9.965 0 003 12c0 5.523 4.477 10 10 10a9.965 9.965 0 006.364-2.64"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full bg-gray-900 text-white py-3 rounded-md hover:bg-gray-700 transition font-medium ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
