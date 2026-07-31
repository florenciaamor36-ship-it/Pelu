import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  MessageCircle,
  DollarSign,
  RefreshCw,
  Trash2,
  Dog,
  ShieldAlert,
  Shield,
  Scissors,
  Check,
  Syringe,
  Car,
  Footprints,
  Truck
} from 'lucide-react';
import { Turno, TurnoEstado, Mascota, Servicio, Cliente, PerfilPeluqueria } from '../types';
import { AlmanaqueCalendar } from './AlmanaqueCalendar';

interface TurnosManagerProps {
  turnos: Turno[];
  mascotas: Mascota[];
  servicios: Servicio[];
  perfilPeluqueria?: PerfilPeluqueria;
  onUpdateEstado: (id: string, estado: TurnoEstado) => Promise<void>;
  onDeleteTurno: (id: string) => Promise<void>;
  onOpenNewTurnoModal: () => void;
  onOpenNewTurnoWithDateTime: (fecha: string, hora?: string) => void;
  onRefresh: () => void;
}

export const TurnosManager: React.FC<TurnosManagerProps> = ({
  turnos,
  mascotas,
  servicios,
  perfilPeluqueria,
  onUpdateEstado,
  onDeleteTurno,
  onOpenNewTurnoModal,
  onOpenNewTurnoWithDateTime,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'almanaque' | 'lista'>('almanaque');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterFechaMode, setFilterFechaMode] = useState<'todos' | 'hoy' | 'manana' | 'semana'>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const manana = new Date(now);
  manana.setDate(manana.getDate() + 1);
  const mananaStr = manana.toISOString().split('T')[0];

  // Filtering
  const filteredTurnos = turnos.filter(t => {
    const turnoFecha = new Date(t.fecha_hora);
    const turnoFechaStr = turnoFecha.toISOString().split('T')[0];

    // Status filter
    if (filterEstado !== 'todos' && t.estado !== filterEstado) return false;

    // Date filter
    if (filterFechaMode === 'hoy' && turnoFechaStr !== todayStr) return false;
    if (filterFechaMode === 'manana' && turnoFechaStr !== mananaStr) return false;
    if (filterFechaMode === 'semana') {
      const diffTime = turnoFecha.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      if (diffDays < -1 || diffDays > 7) return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const dogName = t.mascota?.nombre?.toLowerCase() || '';
      const dogBreed = t.mascota?.raza?.toLowerCase() || '';
      const clientName = t.cliente?.nombre?.toLowerCase() || '';
      const clientPhone = t.cliente?.telefono || '';
      const serviceName = t.servicio?.nombre?.toLowerCase() || '';
      if (
        !dogName.includes(q) &&
        !dogBreed.includes(q) &&
        !clientName.includes(q) &&
        !clientPhone.includes(q) &&
        !serviceName.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats
  const totalHoy = turnos.filter(t => t.fecha_hora.startsWith(todayStr)).length;
  const pendientesCount = turnos.filter(t => t.estado === 'pendiente').length;
  const confirmadosCount = turnos.filter(t => t.estado === 'confirmado' || t.estado === 'en_proceso').length;
  const ingresosEstimados = turnos
    .filter(t => t.estado === 'confirmado' || t.estado === 'en_proceso' || t.estado === 'completado')
    .reduce((acc, curr) => acc + (curr.precio_cobrado || 0), 0);

  const getStatusBadge = (estado: TurnoEstado) => {
    switch (estado) {
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmado
          </span>
        );
      case 'en_proceso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Scissors className="w-3.5 h-3.5" /> En Peluquería
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Check className="w-3.5 h-3.5" /> Listo / Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
    }
  };

  const getWhatsAppMessage = (t: Turno, tipo: 'recordatorio' | 'confirmacion' | 'listo' = 'recordatorio') => {
    const fechaObj = new Date(t.fecha_hora);
    const fechaFormatted = fechaObj.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const horaFormatted = fechaObj.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const dogName = t.mascota?.nombre || 'tu mascota';
    const clientName = t.cliente?.nombre || 'Cliente';
    const salonName = perfilPeluqueria?.nombre_peluqueria || 'la Peluquería Canina';
    const ticketMsg = perfilPeluqueria?.mensaje_ticket || '';

    let template = '';
    if (tipo === 'confirmacion' && perfilPeluqueria?.plantilla_confirmacion_turno) {
      template = perfilPeluqueria.plantilla_confirmacion_turno;
    } else if (tipo === 'listo' && perfilPeluqueria?.plantilla_mascota_lista) {
      template = perfilPeluqueria.plantilla_mascota_lista;
    } else if (perfilPeluqueria?.plantilla_recordatorio_turno) {
      template = perfilPeluqueria.plantilla_recordatorio_turno;
    }

    let msg = '';
    if (template) {
      msg = template
        .replace(/\{CLIENTE\}/g, clientName)
        .replace(/\{MASCOTA\}/g, dogName)
        .replace(/\{FECHA\}/g, fechaFormatted)
        .replace(/\{HORA\}/g, horaFormatted)
        .replace(/\{PELUQUERIA\}/g, salonName);
      if (ticketMsg) {
        msg += `\n\n${ticketMsg}`;
      }
    } else {
      if (tipo === 'listo') {
        msg = `¡Hola ${clientName}! Te avisamos de *${salonName}* que ${dogName} ya está bañado/a, cortado/a y listo/a para ser retirado/a. 🐶✂️\n\n${ticketMsg}`;
      } else {
        msg = `Hola ${clientName}! Te escribimos de *${salonName}* para recordarte el turno de ${dogName} para el día ${fechaFormatted} a las ${horaFormatted} hs.\n\n${ticketMsg}`;
      }
    }

    const cleanPhone = (t.cliente?.telefono || '').replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg.trim())}`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-[#12151c] border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Turnos para Hoy</p>
            <p className="text-xl font-bold text-white">{totalHoy}</p>
          </div>
        </div>

        <div className="p-4 bg-[#12151c] border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Por Confirmar</p>
            <p className="text-xl font-bold text-white">{pendientesCount}</p>
          </div>
        </div>

        <div className="p-4 bg-[#12151c] border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Dog className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">En Agenda / Taller</p>
            <p className="text-xl font-bold text-white">{confirmadosCount}</p>
          </div>
        </div>

        <div className="p-4 bg-[#12151c] border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Cobros Estimados</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              {perfilPeluqueria?.moneda || '$'} {ingresosEstimados.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-3 sm:p-4 bg-[#12151c] border border-slate-800 rounded-xl space-y-3 xl:space-y-0 xl:flex xl:items-center xl:justify-between gap-3">
        {/* View Switch Mode */}
        <div className="flex items-center bg-[#0a0c10] p-1 rounded-xl border border-slate-800 shrink-0 w-full sm:w-auto justify-stretch">
          <button
            onClick={() => setViewMode('almanaque')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              viewMode === 'almanaque'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Almanaque</span>
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              viewMode === 'lista'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Lista ({filteredTurnos.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar perro, cliente, raza, teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Quick date chips */}
          <div className="flex items-center bg-[#0a0c10] p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilterFechaMode('todos')}
              className={`px-2.5 py-1 rounded-md transition-all shrink-0 ${
                filterFechaMode === 'todos' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterFechaMode('hoy')}
              className={`px-2.5 py-1 rounded-md transition-all shrink-0 ${
                filterFechaMode === 'hoy' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFilterFechaMode('manana')}
              className={`px-2.5 py-1 rounded-md transition-all shrink-0 ${
                filterFechaMode === 'manana' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mañana
            </button>
            <button
              onClick={() => setFilterFechaMode('semana')}
              className={`px-2.5 py-1 rounded-md transition-all shrink-0 ${
                filterFechaMode === 'semana' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Status dropdown */}
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="flex-1 sm:flex-initial bg-[#0a0c10] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="confirmado">Confirmados</option>
            <option value="en_proceso">En Peluquería</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados / Entregados</option>
            <option value="cancelado">Cancelados</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 bg-[#0a0c10] border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
            title="Actualizar agenda"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Almanaque vs Lista */}
      {viewMode === 'almanaque' ? (
        <AlmanaqueCalendar
          turnos={filteredTurnos}
          mascotas={mascotas}
          servicios={servicios}
          perfilPeluqueria={perfilPeluqueria}
          onOpenNewTurnoWithDateTime={onOpenNewTurnoWithDateTime}
          onUpdateEstado={onUpdateEstado}
          onDeleteTurno={onDeleteTurno}
        />
      ) : filteredTurnos.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#12151c]/60 border border-slate-800 rounded-xl space-y-3">
          <Dog className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-semibold text-white">No hay turnos agendados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No se encontraron turnos con los filtros seleccionados o la agenda de peluquería está libre.
          </p>
          <button
            onClick={onOpenNewTurnoModal}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Agendar Primer Turno
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTurnos.map(t => {
            const fechaObj = new Date(t.fecha_hora);
            const isToday = fechaObj.toISOString().split('T')[0] === todayStr;

            return (
              <div
                key={t.id}
                className={`bg-[#12151c] border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden shadow-xl ${
                  isToday ? 'border-indigo-500/60 shadow-indigo-950/30' : 'border-slate-800'
                }`}
              >
                {isToday && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">
                    HOY
                  </div>
                )}

                <div className="space-y-4">
                  {/* Date & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#0a0c10] border border-slate-800 text-indigo-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white capitalize">
                          {fechaObj.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs font-mono font-bold text-indigo-400">
                          {fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(t.estado)}</div>
                  </div>

                  {/* Dog & Owner Header */}
                  <div className="p-3 bg-[#0a0c10] border border-slate-800/80 rounded-lg flex items-start gap-3">
                    <img
                      src={t.mascota?.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                      alt={t.mascota?.nombre || 'Perro'}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">
                          {t.mascota?.nombre || 'Perro sin nombre'}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                          {t.mascota?.tamano || 'Mediano'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{t.mascota?.raza || 'Mestizo'}</p>
                      <p className="text-[11px] text-indigo-300/80 flex items-center gap-1 pt-1 truncate">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>Dueño: {t.cliente?.nombre || 'Sin cliente'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dog Operational Badges: Bozal, Transporte, Vacunas */}
                  {t.mascota && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      {t.mascota.usa_bozal ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                          <Shield className="w-3 h-3 text-rose-400" /> USA BOZAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-slate-500" /> Sin bozal
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-indigo-300 border border-slate-700/50 font-medium flex items-center gap-1">
                        {t.mascota.transporte_llegada === 'En vehículo' ? (
                          <Car className="w-3 h-3 text-cyan-400" />
                        ) : t.mascota.transporte_llegada === 'Retiro a domicilio' ? (
                          <Truck className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Footprints className="w-3 h-3 text-indigo-400" />
                        )}
                        {t.mascota.transporte_llegada || 'Caminando'}
                      </span>

                      {t.mascota.fecha_ultima_vacunacion && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
                          <Syringe className="w-3 h-3" /> {new Date(t.mascota.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Skin Alert Badge if present */}
                  {t.mascota?.alergias_afecciones && (
                    <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-lg text-[11px] text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">Alerta Piel: {t.mascota.alergias_afecciones}</span>
                    </div>
                  )}

                  {/* Service & Price */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-medium truncate max-w-[190px]">
                      {t.servicio?.nombre || 'Peluquería Canina'}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ${t.precio_cobrado ? t.precio_cobrado.toLocaleString('es-AR') : '0'}
                    </span>
                  </div>

                  {/* Turno Notes */}
                  {t.notas && (
                    <p className="text-xs text-slate-400 italic bg-[#0a0c10]/60 p-2 rounded-lg border border-slate-800/60">
                      "{t.notas}"
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  {/* WhatsApp confirmation button */}
                  {t.cliente?.telefono ? (
                    <a
                      href={getWhatsAppMessage(t)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  ) : <div />}

                  {/* Change Status Controls */}
                  <div className="flex items-center gap-1">
                    {t.estado !== 'en_proceso' && t.estado !== 'completado' && (
                      <button
                        onClick={() => onUpdateEstado(t.id, 'en_proceso')}
                        className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium transition-colors"
                        title="Marcar como En Peluquería"
                      >
                        En Peluquería
                      </button>
                    )}

                    {t.estado !== 'completado' && (
                      <button
                        onClick={() => onUpdateEstado(t.id, 'completado')}
                        className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-medium transition-colors"
                        title="Marcar como Entregado"
                      >
                        Listo
                      </button>
                    )}

                    {t.estado !== 'cancelado' && (
                      <button
                        onClick={() => onUpdateEstado(t.id, 'cancelado')}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Cancelar Turno"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar turno para ${t.mascota?.nombre || 'perro'}?`)) {
                          onDeleteTurno(t.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Eliminar turno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
