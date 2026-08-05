import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('¡Sesión iniciada con Google exitosamente!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        setError('El cuadro de diálogo de Google fue bloqueado o cerrado. Si estás en una app instalada PWA, por favor usa correo y contraseña a continuación.');
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
      setError('Por favor completa todos los campos.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('¡Bienvenido! Sesión iniciada.');
      } else {
        await registerWithEmail(email, password);
        setSuccessMsg('¡Cuenta de peluquería creada exitosamente!');
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <div className="flex items-center justify-between border-b border-[#c3c4c7] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#f0f6fc] dark:bg-indigo-950/40 rounded-lg text-[#2271b1] dark:text-[#72aee6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1d2327] dark:text-white text-base">Acceso Cloud Database</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Google Workspace & Firebase Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white hover:bg-[#f6f7f7] dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUserEmail && (
          <div className="p-3 bg-[#f0f6e8] dark:bg-emerald-950/40 border border-[#00a32a]/30 rounded-lg flex items-center gap-2 text-xs text-[#00a32a] dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#00a32a] dark:text-emerald-400 shrink-0" />
            <span>Sesión activa como: <strong className="text-[#1d2327] dark:text-white">{currentUserEmail}</strong></span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white dark:bg-[#0e1117] hover:bg-[#f6f7f7] dark:hover:bg-slate-800 border border-[#c3c4c7] dark:border-slate-700 text-[#1d2327] dark:text-slate-100 font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continuar con Cuenta de Google</span>
          </button>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1">
            <Smartphone className="w-3 h-3 text-[#2271b1] dark:text-[#72aee6]" />
            <span>Optimizada para PWA móvil y navegadores</span>
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#c3c4c7] dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-[#161b22] px-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider absolute">
            O con correo y clave
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {error && (
            <div className="p-3 bg-[#fcf0f1] dark:bg-rose-950/40 border border-[#d63638]/30 rounded-lg text-xs text-[#d63638] dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#d63638] dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#f0f6e8] dark:bg-emerald-950/40 border border-[#00a32a]/30 rounded-lg text-xs text-[#00a32a] dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00a32a] dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@peluqueria.com"
                className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-[#c3c4c7]">
          {mode === 'login' ? (
            <p className="text-xs text-slate-400">
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-indigo-400 font-semibold hover:underline"
              >
                Crear cuenta de peluquería
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              ¿Ya tienes una cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-indigo-400 font-semibold hover:underline"
              >
                Iniciar sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
