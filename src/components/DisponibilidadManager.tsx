import React, { useState } from 'react';
import { Clock, Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { HorarioDisponibilidad, Turno } from '../types';

interface DisponibilidadManagerProps {
  horarios: HorarioDisponibilidad[];
  turnos: Turno[];
  onSaveHorarios: (horarios: HorarioDisponibilidad[]) => Promise<void>;
}

export const DisponibilidadManager: React.FC<DisponibilidadManagerProps> = ({
  horarios,
  turnos,
  onSaveHorarios,
}) => {
  const [localHorarios, setLocalHorarios] = useState<HorarioDisponibilidad[]>(horarios);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setLocalHorarios(horarios);
  }, [horarios]);

  const handleToggleDia = (id: string) => {
    setLocalHorarios(prev =>
      prev.map(h => (h.id === id ? { ...h, activo: !h.activo } : h))
    );
  };

  const handleChangeHora = (id: string, field: 'hora_inicio' | 'hora_fin', value: string) => {
    setLocalHorarios(prev =>
      prev.map(h => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveHorarios(localHorarios);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  // Timeline slots preview for today
  const todayStr = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha_hora.startsWith(todayStr) && t.estado !== 'cancelado');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 shadow-xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2271b1] dark:text-[#72aee6]" /> Configuración de Horarios de Atención
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define las franjas horarias en las que Gustavo Bettiol acepta turnos durante la semana.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#f0f6e8] dark:bg-emerald-950/40 border border-[#00a32a]/40 dark:border-emerald-900/40 text-[#00a32a] dark:text-emerald-400 text-xs rounded flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#00a32a] dark:text-emerald-400" /> Horarios de atención actualizados correctamente.
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded overflow-hidden shadow-xs transition-colors">
        <div className="p-3.5 bg-[#f6f7f7] dark:bg-[#0e1117] border-b border-[#c3c4c7] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <span className="text-xs font-bold text-[#1d2327] dark:text-white uppercase tracking-wider">
            Días y Franjas Horarias
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Habilita o inhabilita días según la agenda comercial
          </span>
        </div>

        <div className="divide-y divide-[#c3c4c7] dark:divide-slate-800">
          {localHorarios.map(h => (
            <div
              key={h.id}
              className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-colors ${
                h.activo
                  ? 'bg-white dark:bg-[#161b22]'
                  : 'bg-[#f6f7f7] dark:bg-[#0e1117]/60 opacity-70'
              }`}
            >
              {/* Day Toggle */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id={`day-${h.id}`}
                  checked={h.activo}
                  onChange={() => handleToggleDia(h.id)}
                  className="w-4 h-4 accent-[#2271b1] rounded bg-white dark:bg-[#0e1117] border-[#8c8f94] dark:border-slate-700"
                />
                <label
                  htmlFor={`day-${h.id}`}
                  className="text-xs font-bold text-[#1d2327] dark:text-white cursor-pointer min-w-[90px] sm:min-w-[100px]"
                >
                  {h.dia_nombre}
                </label>
              </div>

              {/* Time Inputs */}
              {h.activo ? (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-2 py-1">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">Desde:</span>
                    <input
                      type="time"
                      value={h.hora_inicio}
                      onChange={e => handleChangeHora(h.id, 'hora_inicio', e.target.value)}
                      className="bg-transparent text-[#1d2327] dark:text-slate-100 font-mono font-bold focus:outline-none text-xs w-[70px] sm:w-auto"
                    />
                  </div>

                  <span className="text-slate-400 text-xs">—</span>

                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-2 py-1">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">Hasta:</span>
                    <input
                      type="time"
                      value={h.hora_fin}
                      onChange={e => handleChangeHora(h.id, 'hora_fin', e.target.value)}
                      className="bg-transparent text-[#1d2327] dark:text-slate-100 font-mono font-bold focus:outline-none text-xs w-[70px] sm:w-auto"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">Día no laboral / Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Timeline View */}
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 space-y-3 shadow-xs transition-colors">
        <h3 className="text-xs font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" /> Vista de Ocupación para Hoy ({todayStr})
        </h3>

        {turnosHoy.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No hay turnos programados para hoy. Todo el horario de atención está disponible.</p>
        ) : (
          <div className="space-y-2">
            {turnosHoy.map(t => {
              const hora = new Date(t.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={t.id}
                  className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#2271b1] dark:text-[#72aee6] bg-[#f0f6fc] dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-[#2271b1]/20 dark:border-indigo-800/40">
                      {hora} hs
                    </span>
                    <div>
                      <p className="font-bold text-[#1d2327] dark:text-white">{t.cliente?.nombre || 'Cliente'}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{t.servicio?.nombre || 'Consulta'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f0f6e8] dark:bg-emerald-950/40 text-[#00a32a] dark:text-emerald-400 uppercase">
                    {t.estado}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
