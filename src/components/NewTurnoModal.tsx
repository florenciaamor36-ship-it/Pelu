import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Dog, Briefcase, DollarSign, FileText, User, ShieldAlert, Shield, Syringe, Car, Footprints, Truck } from 'lucide-react';
import { Mascota, Servicio, TurnoEstado, Cliente } from '../types';

interface NewTurnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mascotas: Mascota[];
  servicios: Servicio[];
  preSelectedMascotaId?: string;
  preSelectedDate?: string;
  preSelectedTime?: string;
  onSaveTurno: (turnoData: {
    mascota_id: string;
    cliente_id: string;
    servicio_id: string;
    fecha_hora: string;
    estado: TurnoEstado;
    notas?: string;
    precio_cobrado: number;
  }) => Promise<void>;
}

export const NewTurnoModal: React.FC<NewTurnoModalProps> = ({
  isOpen,
  onClose,
  mascotas,
  servicios,
  preSelectedMascotaId,
  preSelectedDate,
  preSelectedTime,
  onSaveTurno,
}) => {
  const [selectedMascotaId, setSelectedMascotaId] = useState<string>('');
  const [selectedServicioId, setSelectedServicioId] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState<string>('10:00');
  const [estado, setEstado] = useState<TurnoEstado>('confirmado');
  const [precio, setPrecio] = useState<number>(0);
  const [notas, setNotas] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (preSelectedMascotaId) {
      setSelectedMascotaId(preSelectedMascotaId);
    } else if (mascotas.length > 0 && !selectedMascotaId) {
      setSelectedMascotaId(mascotas[0].id);
    }

    if (preSelectedDate) {
      setFecha(preSelectedDate);
    }
    if (preSelectedTime) {
      setHora(preSelectedTime);
    }

    if (servicios.length > 0 && !selectedServicioId) {
      setSelectedServicioId(servicios[0].id);
      setPrecio(servicios[0].precio);
    }
  }, [mascotas, servicios, isOpen, preSelectedMascotaId, preSelectedDate, preSelectedTime]);

  const selectedMascota = mascotas.find(m => m.id === selectedMascotaId);

  const handleServicioChange = (srvId: string) => {
    setSelectedServicioId(srvId);
    const found = servicios.find(s => s.id === srvId);
    if (found) {
      setPrecio(found.precio);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMascotaId) {
      alert('Por favor selecciona una mascota.');
      return;
    }

    setLoading(true);
    try {
      const isoFechaHora = new Date(`${fecha}T${hora}:00`).toISOString();
      const targetMascota = mascotas.find(m => m.id === selectedMascotaId);

      await onSaveTurno({
        mascota_id: selectedMascotaId,
        cliente_id: targetMascota?.cliente_id || '',
        servicio_id: selectedServicioId,
        fecha_hora: isoFechaHora,
        estado,
        notas,
        precio_cobrado: Number(precio),
      });

      setNotas('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-lg shadow-2xl overflow-hidden my-8 text-[#1d2327] dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f0f0f1] dark:bg-[#0e1117]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#f0f6fc] dark:bg-indigo-950/40 border border-[#2271b1]/30 dark:border-indigo-800/40 text-[#2271b1] dark:text-[#72aee6]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1d2327] dark:text-white text-sm">Agendar Turno de Peluquería</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona el perro y servicio de peluquería</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-[#1d2327] dark:hover:text-white hover:bg-[#e0e0e0] dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* DOG SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200 flex items-center gap-1.5">
              <Dog className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
              Seleccionar Perro / Mascota *
            </label>
            <select
              value={selectedMascotaId}
              onChange={e => setSelectedMascotaId(e.target.value)}
              className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            >
              {mascotas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.raza}, {m.tamano}) — Dueño: {m.cliente?.nombre || 'Sin cliente'}
                </option>
              ))}
            </select>

            {/* Selected Dog Preview Card */}
            {selectedMascota && (
              <div className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-start gap-3">
                <img
                  src={selectedMascota.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                  alt={selectedMascota.nombre}
                  className="w-11 h-11 rounded object-cover border border-[#c3c4c7] dark:border-slate-700 shrink-0"
                />
                <div className="text-xs space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#1d2327] dark:text-white">{selectedMascota.nombre} ({selectedMascota.raza})</p>
                    {selectedMascota.usa_bozal ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fcf0f1] dark:bg-rose-950/40 text-[#d63638] dark:text-rose-400 border border-[#d63638]/30">
                        ⚠️ USA BOZAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#e0e0e0] dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Sin bozal
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                    Dueño: {selectedMascota.cliente?.nombre} • Tel: {selectedMascota.cliente?.telefono}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] pt-0.5">
                    <span className="text-[#00a32a] dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <Syringe className="w-3 h-3" /> Últ. Vacuna: {selectedMascota.fecha_ultima_vacunacion ? new Date(selectedMascota.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR') : 'S/D'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[#2271b1] dark:text-[#72aee6] flex items-center gap-1 font-medium">
                      {selectedMascota.transporte_llegada === 'En vehículo' ? <Car className="w-3 h-3" /> : selectedMascota.transporte_llegada === 'Retiro a domicilio' ? <Truck className="w-3 h-3 text-[#dba617]" /> : <Footprints className="w-3 h-3" />}
                      {selectedMascota.transporte_llegada || 'Caminando'}
                    </span>
                  </div>

                  {selectedMascota.alergias_afecciones && (
                    <p className="text-[#d63638] dark:text-rose-400 text-[11px] flex items-center gap-1 font-semibold truncate pt-0.5">
                      <ShieldAlert className="w-3 h-3 shrink-0" /> Piel: {selectedMascota.alergias_afecciones}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SERVICE SELECTOR */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
              Servicio de Peluquería
            </label>
            <select
              value={selectedServicioId}
              onChange={e => handleServicioChange(e.target.value)}
              className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            >
              {servicios.map(srv => (
                <option key={srv.id} value={srv.id}>
                  {srv.nombre} — ${srv.precio.toLocaleString('es-AR')} ({srv.duracion_min} min)
                </option>
              ))}
            </select>
          </div>

          {/* DATE & TIME */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
                Hora
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
          </div>

          {/* STATUS & PRICE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200">Estado Inicial</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as TurnoEstado)}
                className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              >
                <option value="confirmado">Confirmado</option>
                <option value="en_proceso">En Peluquería</option>
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
                Precio ($ ARS)
              </label>
              <input
                type="number"
                min="0"
                value={precio}
                onChange={e => setPrecio(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 font-mono focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
          </div>

          {/* NOTES */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
              Indicaciones del Turno
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Pedir moño rojo, bañar con shampoo avena, cuidado en oídos..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Confirmar & Agendar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
