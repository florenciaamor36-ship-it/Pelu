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
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorMsg = error?.message || '';
    if (
      errorMsg.includes('removeChild') ||
      errorMsg.includes('insertBefore') ||
      errorMsg.includes('replaceChild') ||
      errorMsg.includes('is not a child of this node')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMsg = error?.message || '';
    if (
      errorMsg.includes('removeChild') ||
      errorMsg.includes('insertBefore') ||
      errorMsg.includes('replaceChild') ||
      errorMsg.includes('is not a child of this node')
    ) {
      this.setState({ hasError: false, error: null });
      return;
    }
    console.error('Uncaught error in CaninGroom Pro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Error de ejecución inesperado.';
      const isDomainError = errorMsg.includes('unauthorized-domain') || errorMsg.includes('auth/unauthorized-domain');
      const isRemoveChildError = errorMsg.includes('removeChild') || errorMsg.includes('is not a child of this node') || errorMsg.includes('insertBefore');

      return (
        <div className="min-h-screen bg-[#f6f7f7] dark:bg-[#0e1117] text-[#1d2327] dark:text-slate-100 flex flex-col items-center justify-center p-6 transition-colors">
          <div className="max-w-md w-full bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl p-6 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 bg-[#fcf0f1] dark:bg-rose-950/40 border border-[#d63638]/30 text-[#d63638] dark:text-rose-400 rounded-xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#1d2327] dark:text-white">
                {isRemoveChildError ? 'Conflicto de Traducción Automática' : 'Atención: Error al cargar el sistema'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isRemoveChildError 
                  ? 'El traductor automático del navegador o una extensión modificó el contenido visual mientras la aplicación procesaba los datos.'
                  : 'Se ha producido un detalle al inicializar la aplicación.'}
              </p>
            </div>

            <div className="p-3 bg-[#fcf0f1] dark:bg-rose-950/40 border border-[#d63638]/30 rounded-lg text-left text-xs font-mono text-[#d63638] dark:text-rose-300 overflow-x-auto max-h-32">
              {errorMsg}
            </div>

            {isRemoveChildError && (
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-left text-xs text-blue-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Solución recomendada</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-200/90">
                  Desactiva la traducción automática para este sitio en la barra de direcciones de tu navegador Chrome / Google o haz clic en "Reintentar Cargar".
                </p>
              </div>
            )}

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
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
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
