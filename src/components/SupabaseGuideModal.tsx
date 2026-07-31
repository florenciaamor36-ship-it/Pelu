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
      <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-[#12151c] to-indigo-950/50 border border-emerald-500/30 rounded-2xl shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Base de Datos 100% Automática Activada</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Cero Configuración
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Diseñado para que te enfoques en atender perritos sin preocuparte por sistemas complejos. Toda tu información (fichas de mascotas, turnos, ventas y stock) se guarda y respalda automáticamente en la nube encriptada.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Status Card 1 */}
          <div className="p-4 bg-[#0a0c10]/80 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Cloud className="w-4 h-4" /> Cloud Database
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white">Conexión Directa Cloud</p>
            <p className="text-[11px] text-slate-400">
              Servidor activo en tiempo real. No requiere ingresar claves, tokens ni instalar nada.
            </p>
          </div>

          {/* Status Card 2 */}
          <div className="p-4 bg-[#0a0c10]/80 border border-indigo-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <UserCheck className="w-4 h-4" /> Inicio de Sesión
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                Google / Mail
              </span>
            </div>
            <p className="text-xs font-semibold text-white">Acceso en Varios Dispositivos</p>
            <p className="text-[11px] text-slate-400">
              Inicia sesión con tu cuenta de Google o correo en el celular, tablet o PC para ver tus turnos actualizados.
            </p>
          </div>

          {/* Status Card 3 */}
          <div className="p-4 bg-[#0a0c10]/80 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Smartphone className="w-4 h-4" /> Modo Offline
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                Protección Wi-Fi
              </span>
            </div>
            <p className="text-xs font-semibold text-white">Trabaja sin Internet</p>
            <p className="text-[11px] text-slate-400">
              Si se corta la señal en la peluquería, puedes seguir cargando turnos. Se sincronizan solos al reconectar.
            </p>
          </div>
        </div>
      </div>

      {/* Local Backup Section */}
      <div className="p-6 bg-[#12151c] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Copia de Seguridad de Tu Peluquería</h3>
              <p className="text-xs text-slate-400">Tus datos siempre son tuyos y puedes descargarlos en cualquier momento</p>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia Completa (JSON)</span>
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Options for Programmers / Supabase */}
      <div className="p-6 bg-[#12151c] border border-slate-800 rounded-2xl space-y-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Opciones Avanzadas para Desarrolladores / Supabase (Opcional)
            </h4>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Si deseas conectar una instancia personalizada de Supabase además del almacenamiento Nube por defecto, puedes pegar tus credenciales a continuación:
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Supabase URL</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Supabase Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Probar...' : 'Guardar y Validar Supabase'}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
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
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Script SQL de Supabase</span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-[#0a0c10] hover:bg-slate-800 text-white font-medium text-xs rounded-lg border border-slate-800 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#0a0c10] p-4 rounded-lg border border-slate-800 overflow-x-auto max-h-60">
                <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed whitespace-pre">
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
