import React, { useState } from 'react';
import {
  Dog,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onSuccess: () => void;
  onGuestLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onGuestLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        setSuccessMsg('¡Sesión iniciada con Google exitosamente!');
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err: any) {
      console.error(err);
      const errStr = String(err?.message || err?.code || '');
      if (err.code === 'auth/unauthorized-domain' || errStr.includes('unauthorized-domain')) {
        setError(`El dominio "${window.location.hostname}" no está autorizado en la consola de Firebase. Agrega este dominio en Firebase Console > Authentication > Settings > Authorized domains, o inicia sesión con correo y contraseña.`);
      } else if (errStr.includes('Database is closing') || errStr.includes('closing/hidden')) {
        setError('El navegador interrumpió el almacenamiento de la ventana emergente. Vuelve a hacer clic en "Acceder con Google" o usa tu correo y contraseña.');
      } else if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        setError('El cuadro de diálogo fue cerrado. Intenta de nuevo o utiliza tu correo y contraseña.');
      } else {
        setError(err.message || 'Error al iniciar sesión con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('¡Bienvenido! Sesión iniciada.');
      } else {
        await registerWithEmail(email, password);
        setSuccessMsg('¡Cuenta de peluquería creada e iniciada exitosamente!');
      }
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos. Verifica tus datos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Selecciona "Iniciar Sesión".');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(err.message || 'Error en autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] dark:bg-[#0e1117] text-[#1d2327] dark:text-slate-100 flex flex-col justify-between selection:bg-[#2271b1] selection:text-white transition-colors">
      {/* Top Admin bar */}
      <header className="bg-[#1d2327] dark:bg-[#161b22] py-2.5 px-4 text-white text-xs font-semibold flex items-center justify-between border-b border-[#2c3338] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Dog className="w-4 h-4 text-[#2271b1]" />
          <span>CaninGroom Pro — Control de Acceso</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2c3338] text-xs text-amber-300 dark:text-indigo-300 border border-[#3c434a] hover:bg-[#3c434a] transition-colors"
            title="Cambiar Tema"
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
            <span className="text-[11px] font-semibold">{theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso Seguro Servidor</span>
          </div>
        </div>
      </header>

      {/* Classic Login Box */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          
          {/* Icon Logo Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2271b1] text-white shadow-sm border border-[#135e96] mx-auto">
              <Dog className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1d2327] dark:text-white tracking-tight">
                CaninGroom <span className="font-normal text-[#2271b1] dark:text-[#72aee6]">Pro</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Panel de Administración de Peluquería Canina
              </p>
            </div>
          </div>

          {/* Main Card Form */}
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#1d2327] dark:text-white pb-2 border-b border-[#dcdcde] dark:border-slate-800">
              {mode === 'login' ? 'Acceder al Sistema' : 'Registrar Nuevo Salón'}
            </h2>

            {error && (
              <div className="p-3 bg-[#fcf0f1] dark:bg-rose-950/40 border-l-4 border-[#d63638] text-xs text-[#d63638] dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-[#f0f6e8] dark:bg-emerald-950/40 border-l-4 border-[#00a32a] text-xs text-[#00a32a] dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-300 block">Nombre de usuario o correo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@peluqueria.com"
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-300 block">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span>Procesando...</span>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-3.5 h-3.5" /> Acceder
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" /> Registrar Salón
                  </>
                )}
              </button>
            </form>

            {/* Google Button */}
            <div className="pt-2 border-t border-[#dcdcde] dark:border-slate-800">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-1.5 px-3 bg-[#f6f7f7] dark:bg-slate-800 hover:bg-[#f0f0f1] dark:hover:bg-slate-700 border border-[#2271b1] text-[#2271b1] dark:text-[#72aee6] font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Acceder con Google</span>
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#2271b1] dark:text-[#72aee6] hover:underline font-semibold"
                >
                  ¿Registrar un nuevo salón de peluquería?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#2271b1] dark:text-[#72aee6] hover:underline font-semibold"
                >
                  ¿Ya tienes cuenta? Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#161b22] border-t border-[#c3c4c7] dark:border-slate-800 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Sistema de Gestión | CaninGroom Pro v2.5</p>
      </footer>
    </div>
  );
};
