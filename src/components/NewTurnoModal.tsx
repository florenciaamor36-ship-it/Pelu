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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#12151c] border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0a0c10]/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Agendar Turno de Peluquería</h3>
              <p className="text-xs text-slate-400">Selecciona el perro y servicio de peluquería</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* DOG SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Dog className="w-4 h-4 text-indigo-400" />
              Seleccionar Perro / Mascota *
            </label>
            <select
              value={selectedMascotaId}
              onChange={e => setSelectedMascotaId(e.target.value)}
              className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {mascotas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.raza}, {m.tamano}) — Dueño: {m.cliente?.nombre || 'Sin cliente'}
                </option>
              ))}
            </select>

            {/* Selected Dog Preview Card */}
            {selectedMascota && (
              <div className="p-3 bg-[#0a0c10] border border-slate-800 rounded-lg flex items-start gap-3">
                <img
                  src={selectedMascota.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                  alt={selectedMascota.nombre}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                />
                <div className="text-xs space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{selectedMascota.nombre} ({selectedMascota.raza})</p>
                    {selectedMascota.usa_bozal ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        ⚠️ USA BOZAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Sin bozal
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-[11px] truncate">
                    Dueño: {selectedMascota.cliente?.nombre} • Tel: {selectedMascota.cliente?.telefono}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] pt-1">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Syringe className="w-3 h-3" /> Últ. Vacuna: {selectedMascota.fecha_ultima_vacunacion ? new Date(selectedMascota.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR') : 'S/D'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      {selectedMascota.transporte_llegada === 'En vehículo' ? <Car className="w-3 h-3" /> : selectedMascota.transporte_llegada === 'Retiro a domicilio' ? <Truck className="w-3 h-3" /> : <Footprints className="w-3 h-3" />}
                      {selectedMascota.transporte_llegada || 'Caminando'}
                    </span>
                  </div>

                  {selectedMascota.alergias_afecciones && (
                    <p className="text-rose-400 text-[11px] flex items-center gap-1 font-semibold truncate pt-0.5">
                      <ShieldAlert className="w-3 h-3 shrink-0" /> Piel: {selectedMascota.alergias_afecciones}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SERVICE SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Servicio de Peluquería
            </label>
            <select
              value={selectedServicioId}
              onChange={e => handleServicioChange(e.target.value)}
              className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Hora
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* STATUS & PRICE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Estado Inicial</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as TurnoEstado)}
                className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="confirmado">Confirmado</option>
                <option value="en_proceso">En Peluquería</option>
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Precio ($ ARS)
              </label>
              <input
                type="number"
                min="0"
                value={precio}
                onChange={e => setPrecio(Number(e.target.value))}
                className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* NOTES */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Indicaciones del Turno
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Pedir moño rojo, bañar con shampoo avena, cuidado en oídos..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Confirmar & Agendar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
