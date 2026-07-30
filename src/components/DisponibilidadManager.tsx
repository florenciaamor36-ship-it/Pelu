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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Configuración de Horarios de Atención
          </h2>
          <p className="text-xs text-slate-400">
            Define las franjas horarias en las que Gustavo Bettiol acepta turnos durante la semana.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Horarios de atención actualizados correctamente.
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-[#12151c] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0a0c10]/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Días y Franjas Horarias
          </span>
          <span className="text-xs text-slate-500">
            Habilita o inhabilita días según la agenda comercial
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {localHorarios.map(h => (
            <div
              key={h.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                h.activo ? 'bg-[#12151c]' : 'bg-[#0a0c10]/40 opacity-60'
              }`}
            >
              {/* Day Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`day-${h.id}`}
                  checked={h.activo}
                  onChange={() => handleToggleDia(h.id)}
                  className="w-4 h-4 accent-indigo-600 rounded bg-[#0a0c10] border-slate-800"
                />
                <label
                  htmlFor={`day-${h.id}`}
                  className="text-sm font-semibold text-white cursor-pointer min-w-[100px]"
                >
                  {h.dia_nombre}
                </label>
              </div>

              {/* Time Inputs */}
              {h.activo ? (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-1.5">
                    <span className="text-slate-400">Desde:</span>
                    <input
                      type="time"
                      value={h.hora_inicio}
                      onChange={e => handleChangeHora(h.id, 'hora_inicio', e.target.value)}
                      className="bg-transparent text-white font-mono font-semibold focus:outline-none"
                    />
                  </div>

                  <span className="text-slate-600">—</span>

                  <div className="flex items-center gap-2 bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-1.5">
                    <span className="text-slate-400">Hasta:</span>
                    <input
                      type="time"
                      value={h.hora_fin}
                      onChange={e => handleChangeHora(h.id, 'hora_fin', e.target.value)}
                      className="bg-transparent text-white font-mono font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-medium italic">Día no laboral / Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Timeline View */}
      <div className="bg-[#12151c] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" /> Vista de Ocupación para Hoy ({todayStr})
        </h3>

        {turnosHoy.length === 0 ? (
          <p className="text-xs text-slate-400">No hay turnos programados para hoy. Todo el horario de atención está disponible.</p>
        ) : (
          <div className="space-y-2">
            {turnosHoy.map(t => {
              const hora = new Date(t.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={t.id}
                  className="p-3 bg-[#0a0c10] border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                      {hora} hs
                    </span>
                    <div>
                      <p className="font-semibold text-white">{t.cliente?.nombre || 'Cliente'}</p>
                      <p className="text-slate-400 text-[11px]">{t.servicio?.nombre || 'Consulta'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 uppercase">
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
