import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Globe, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CaninGroom Pro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Error de ejecución inesperado.';
      const isDomainError = errorMsg.includes('unauthorized-domain') || errorMsg.includes('auth/unauthorized-domain');

      return (
        <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-rose-500 selection:text-white">
          <div className="max-w-md w-full bg-[#11141c] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Atención: Error al cargar el sistema</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se ha producido un detalle al inicializar la aplicación.
              </p>
            </div>

            <div className="p-3 bg-[#07090d] border border-slate-800 rounded-xl text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-32">
              {errorMsg}
            </div>

            {isDomainError && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-left text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Dominio de GitHub Pages no autorizado en Firebase</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-300/80">
                  Debes agregar este dominio (por ejemplo <code className="bg-amber-900/50 px-1 rounded">6-ship-it.github.io</code>) en tu consola de Firebase:
                </p>
                <ol className="list-decimal list-inside text-[11px] space-y-1 text-amber-200">
                  <li>Ve a <strong className="text-white">Firebase Console &gt; Authentication &gt; Settings</strong></li>
                  <li>Añade el dominio a <strong className="text-white">Authorized domains</strong>.</li>
                </ol>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar Cargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
