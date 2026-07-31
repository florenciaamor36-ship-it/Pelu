import React, { useState } from 'react';
import {
  Dog,
  Scissors,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Smartphone,
  Sparkles,
  Award,
  Building2,
  Check
} from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';
import { Footer } from './Footer';

interface LoginScreenProps {
  onSuccess: () => void;
  onGuestLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onGuestLogin }) => {
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
      await loginWithGoogle();
      setSuccessMsg('¡Sesión iniciada con Google exitosamente!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError(`El dominio actual (${window.location.hostname}) no está autorizado en Firebase Auth. Puedes acceder usando el botón "Probar en Modo Demostración" más abajo o agregando el dominio a Firebase Console > Auth > Settings > Authorized Domains.`);
      } else if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        setError('El cuadro de diálogo de Google fue cerrado o bloqueado. Si estás desde un navegador móvil, utiliza correo y contraseña o el Modo Demostración.');
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
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background radial effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0a0c10]/90 backdrop-blur-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Dog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                CaninGroom <span className="text-indigo-400 font-light">Pro</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Sistema de Gestión de Peluquerías Caninas
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 px-3 py-1.5 rounded-full font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Acceso Seguro Nube Firestore</span>
          </div>
        </div>
      </header>

      {/* Main Centered Auth Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#11141c]/90 border border-slate-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* App Branding Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/30 border border-indigo-400/30 mx-auto transform hover:scale-105 transition-transform">
              <Dog className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                CaninGroom <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-light">Pro</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sistema de Gestión de Peluquería Canina
              </p>
            </div>
          </div>

          <div className="text-center space-y-1 pt-1 border-t border-slate-800/60">
            <h3 className="text-base font-bold text-slate-200">
              {mode === 'login' ? 'Ingreso al Sistema' : 'Crear Nueva Cuenta'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {mode === 'login'
                ? 'Ingresa tus credenciales para acceder'
                : 'Registra tu negocio para comenzar'}
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Ingresar con Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#11141c] px-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider absolute">
              O con correo
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@peluqueria.com"
                  className="w-full bg-[#07090d] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#07090d] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Ingresar
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Registrar mi Peluquería
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Toggle */}
          <div className="text-center pt-2 border-t border-slate-800 space-y-2">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400">
                ¿Aún no tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Registrarse
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Iniciar sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer with Full Developer Credits */}
      <Footer />
    </div>
  );
};
