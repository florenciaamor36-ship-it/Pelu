import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Cloud,
  ShieldCheck,
  UserCheck,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Key,
  Layers,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { SupabaseConfig } from '../types';
import { SUPABASE_SQL_SCHEMA, saveSupabaseConfig, getSupabaseInstance } from '../lib/supabase';

interface SupabaseGuideModalProps {
  config: SupabaseConfig;
  onConfigChange: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ config, onConfigChange }) => {
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      saveSupabaseConfig(urlInput, keyInput);
      const sb = getSupabaseInstance();
      if (!sb) {
        setTestResult({ success: false, message: 'URL o Key no válidas.' });
        setTesting(false);
        return;
      }

      const { error } = await sb.from('clientes').select('id').limit(1);

      if (error) {
        setTestResult({
          success: false,
          message: `Error de respuesta: ${error.message}.`,
        });
      } else {
        setTestResult({
          success: true,
          message: '¡Conexión exitosa a la base de datos de Supabase!',
        });
        onConfigChange();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Fallo de conexión: ${err?.message || 'Verifica la URL y la Anon Key.'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleExportBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caningroom_respaldo_peluqueria_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Zero Setup Hero Banner */}
      <div className="p-6 bg-[#f0f6e8] dark:bg-emerald-950/30 border border-[#00a32a]/30 dark:border-emerald-800/40 rounded-xl shadow-xs space-y-4 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-[#161b22] text-[#00a32a] dark:text-emerald-400 rounded-lg border border-[#00a32a]/30 dark:border-emerald-800/40 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1d2327] dark:text-white">Base de Datos 100% Automática Activada</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00a32a] text-white text-[10px] font-bold">
                  Cero Configuración
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Diseñado para que te enfoques en atender perritos sin preocuparte por sistemas complejos. Toda tu información (fichas de mascotas, turnos, ventas y stock) se guarda y respalda automáticamente en la nube encriptada.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Status Card 1 */}
          <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-lg space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00a32a] dark:text-emerald-400">
                <Cloud className="w-4 h-4" /> Cloud Database
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00a32a] dark:bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-[#1d2327] dark:text-white">Conexión Directa Cloud</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Servidor activo en tiempo real. No requiere ingresar claves, tokens ni instalar nada.
            </p>
          </div>

          {/* Status Card 2 */}
          <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-lg space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2271b1] dark:text-[#72aee6]">
                <UserCheck className="w-4 h-4" /> Inicio de Sesión
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] font-semibold border border-[#2271b1]/30 dark:border-indigo-800/40">
                Google / Mail
              </span>
            </div>
            <p className="text-xs font-bold text-[#1d2327] dark:text-white">Acceso en Varios Dispositivos</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inicia sesión con tu cuenta de Google o correo en el celular, tablet o PC para ver tus turnos actualizados.
            </p>
          </div>

          {/* Status Card 3 */}
          <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-lg space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Smartphone className="w-4 h-4" /> Modo Offline
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/40">
                Protección Wi-Fi
              </span>
            </div>
            <p className="text-xs font-bold text-[#1d2327] dark:text-white">Trabaja sin Internet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Si se corta la señal en la peluquería, puedes seguir cargando turnos. Se sincronizan solos al reconectar.
            </p>
          </div>
        </div>
      </div>

      {/* Local Backup Section */}
      <div className="p-6 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] rounded-lg border border-[#2271b1]/20 dark:border-indigo-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1d2327] dark:text-white">Copia de Seguridad de Tu Peluquería</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tus datos siempre son tuyos y puedes descargarlos en cualquier momento</p>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia Completa (JSON)</span>
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Options for Programmers / Supabase */}
      <div className="p-6 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-4 shadow-xs transition-colors">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Opciones Avanzadas para Desarrolladores / Supabase (Opcional)
            </h4>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-[#c3c4c7] dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Si deseas conectar una instancia personalizada de Supabase además del almacenamiento Nube por defecto, puedes pegar tus credenciales a continuación:
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Supabase URL</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 font-mono focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Supabase Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 font-mono focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Probar...' : 'Guardar y Validar Supabase'}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                      testResult.success
                        ? 'bg-[#f0f6e8] dark:bg-emerald-950/40 border-[#00a32a]/40 text-[#00a32a] dark:text-emerald-400'
                        : 'bg-[#fcf0f1] dark:bg-rose-950/40 border-[#d63638]/40 text-[#d63638] dark:text-rose-400'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
                  <span className="text-xs font-bold text-[#1d2327] dark:text-white">Script SQL de Supabase</span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-[#f6f7f7] dark:bg-[#0e1117] hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327] text-[#1d2327] dark:text-white font-semibold text-xs rounded-lg border border-[#c3c4c7] dark:border-slate-800 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00a32a] dark:text-emerald-400" />
                      <span className="text-[#00a32a] dark:text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#f6f7f7] dark:bg-[#0e1117] p-4 rounded-lg border border-[#c3c4c7] dark:border-slate-800 overflow-x-auto max-h-60">
                <pre className="text-[11px] font-mono text-[#2271b1] dark:text-[#72aee6] leading-relaxed whitespace-pre">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
