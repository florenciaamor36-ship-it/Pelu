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
    <div className="space-y-5">
      {/* Page Heading (Admin H1 + Action button) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#c3c4c7] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327] dark:text-white tracking-tight">
            Gestión de Turnos & Agenda
          </h1>
          <button
            onClick={onOpenNewTurnoModal}
            className="px-2.5 py-1 bg-[#f6f7f7] dark:bg-slate-800 hover:bg-[#f0f0f1] dark:hover:bg-slate-700 text-[#2271b1] dark:text-[#72aee6] hover:text-[#135e96] border border-[#2271b1] dark:border-[#2271b1] font-semibold text-xs rounded transition-colors"
          >
            + Añadir nuevo
          </button>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Total en sistema: <strong className="text-[#1d2327] dark:text-white">{turnos.length} turnos</strong>
        </div>
      </div>

      {/* Notice Banner WP-style */}
      <div className="bg-white dark:bg-[#161b22] border-l-4 border-[#2271b1] border border-[#c3c4c7] dark:border-slate-800 p-3 text-xs text-[#1d2327] dark:text-slate-200 shadow-xs flex items-center justify-between gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6] shrink-0" />
          <span>Agenda diaria de peluquería canina. Los cambios se guardan automáticamente en el servidor.</span>
        </div>
        <button
          onClick={onRefresh}
          className="text-[#2271b1] dark:text-[#72aee6] hover:underline font-semibold text-[11px] shrink-0"
        >
          Actualizar ahora
        </button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded shadow-xs flex items-center gap-3 transition-colors">
          <div className="p-2.5 bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-indigo-400 rounded border border-[#2271b1]/20 dark:border-indigo-900/40">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Turnos para Hoy</p>
            <p className="text-lg font-bold text-[#1d2327] dark:text-white">{totalHoy}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded shadow-xs flex items-center gap-3 transition-colors">
          <div className="p-2.5 bg-[#fcf0f1] dark:bg-rose-950/40 text-[#d63638] dark:text-rose-400 rounded border border-[#d63638]/20 dark:border-rose-900/40">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Por Confirmar</p>
            <p className="text-lg font-bold text-[#d63638] dark:text-rose-400">{pendientesCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded shadow-xs flex items-center gap-3 transition-colors">
          <div className="p-2.5 bg-[#f0f6e8] dark:bg-emerald-950/40 text-[#00a32a] dark:text-emerald-400 rounded border border-[#00a32a]/20 dark:border-emerald-900/40">
            <Dog className="w-5 h-5 text-[#00a32a] dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">En Agenda / Salón</p>
            <p className="text-lg font-bold text-[#1d2327] dark:text-white">{confirmadosCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded shadow-xs flex items-center gap-3 transition-colors">
          <div className="p-2.5 bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-indigo-400 rounded border border-[#2271b1]/20 dark:border-indigo-900/40">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cobros Estimados</p>
            <p className="text-lg font-bold text-[#00a32a] dark:text-emerald-400 font-mono">
              {perfilPeluqueria?.moneda || '$'} {ingresosEstimados.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-3 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded shadow-xs space-y-3 xl:space-y-0 xl:flex xl:items-center xl:justify-between gap-3 transition-colors">
        {/* View Switch Mode */}
        <div className="flex items-center bg-[#f0f0f1] dark:bg-[#0e1117] p-1 rounded border border-[#c3c4c7] dark:border-slate-700 shrink-0 w-full sm:w-auto justify-stretch">
          <button
            onClick={() => setViewMode('almanaque')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              viewMode === 'almanaque'
                ? 'bg-[#2271b1] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Almanaque</span>
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              viewMode === 'lista'
                ? 'bg-[#2271b1] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Lista ({filteredTurnos.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar perro, cliente, raza, teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded pl-9 pr-4 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Quick date chips */}
          <div className="flex items-center bg-[#f0f0f1] dark:bg-[#0e1117] p-0.5 rounded border border-[#c3c4c7] dark:border-slate-700 text-xs overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilterFechaMode('todos')}
              className={`px-2.5 py-1 rounded transition-colors shrink-0 text-xs ${
                filterFechaMode === 'todos' ? 'bg-[#2271b1] text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterFechaMode('hoy')}
              className={`px-2.5 py-1 rounded transition-colors shrink-0 text-xs ${
                filterFechaMode === 'hoy' ? 'bg-[#2271b1] text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFilterFechaMode('manana')}
              className={`px-2.5 py-1 rounded transition-colors shrink-0 text-xs ${
                filterFechaMode === 'manana' ? 'bg-[#2271b1] text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white'
              }`}
            >
              Mañana
            </button>
            <button
              onClick={() => setFilterFechaMode('semana')}
              className={`px-2.5 py-1 rounded transition-colors shrink-0 text-xs ${
                filterFechaMode === 'semana' ? 'bg-[#2271b1] text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Status dropdown */}
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="flex-1 sm:flex-initial bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
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
            className="p-1.5 bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 hover:text-[#2271b1] hover:border-[#2271b1] transition-colors"
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
        <div className="text-center py-12 px-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded shadow-xs space-y-3 transition-colors">
          <Dog className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500" />
          <h3 className="text-sm font-bold text-[#1d2327] dark:text-white">No hay turnos agendados</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No se encontraron turnos con los filtros seleccionados o la agenda de peluquería está libre.
          </p>
          <button
            onClick={onOpenNewTurnoModal}
            className="px-3.5 py-1.5 bg-[#2271b1] text-white text-xs font-semibold rounded hover:bg-[#135e96] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Agendar Primer Turno
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTurnos.map(t => {
            const fechaObj = new Date(t.fecha_hora);
            const isToday = fechaObj.toISOString().split('T')[0] === todayStr;

            return (
              <div
                key={t.id}
                className={`bg-white dark:bg-[#161b22] border rounded p-4 flex flex-col justify-between transition-colors relative shadow-xs ${
                  isToday ? 'border-[#2271b1] dark:border-[#2271b1] bg-[#f0f6fc]/20 dark:bg-[#2271b1]/10' : 'border-[#c3c4c7] dark:border-slate-800 hover:border-[#8c8f94] dark:hover:border-slate-700'
                }`}
              >
                {isToday && (
                  <div className="absolute top-0 right-0 bg-[#2271b1] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                    HOY
                  </div>
                )}

                <div className="space-y-3">
                  {/* Date & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-[#f0f0f1] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-700 text-[#2271b1] dark:text-[#72aee6]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1d2327] dark:text-slate-200 capitalize">
                          {fechaObj.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs font-mono font-bold text-[#2271b1] dark:text-[#72aee6]">
                          {fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(t.estado)}</div>
                  </div>

                  {/* Dog & Owner Header */}
                  <div className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-start gap-3">
                    <img
                      src={t.mascota?.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                      alt={t.mascota?.nombre || 'Perro'}
                      className="w-11 h-11 rounded object-cover border border-[#c3c4c7] dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#1d2327] dark:text-white truncate">
                          {t.mascota?.nombre || 'Perro sin nombre'}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#e0e0e0] dark:bg-slate-800 text-[#1d2327] dark:text-slate-200 rounded">
                          {t.mascota?.tamano || 'Mediano'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.mascota?.raza || 'Mestizo'}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-0.5 truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Dueño: {t.cliente?.nombre || 'Sin cliente'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dog Operational Badges: Bozal, Transporte, Vacunas */}
                  {t.mascota && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      {t.mascota.usa_bozal ? (
                        <span className="px-1.5 py-0.5 rounded bg-[#fcf0f1] dark:bg-rose-950/40 text-[#d63638] dark:text-rose-400 border border-[#d63638]/30 dark:border-rose-900/40 font-bold flex items-center gap-1">
                          <Shield className="w-3 h-3 text-[#d63638] dark:text-rose-400" /> USA BOZAL
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-[#f0f0f1] dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-slate-400" /> Sin bozal
                        </span>
                      )}

                      <span className="px-1.5 py-0.5 rounded bg-[#f0f0f1] dark:bg-slate-800 text-[#2271b1] dark:text-[#72aee6] border border-[#c3c4c7] dark:border-slate-700 font-medium flex items-center gap-1">
                        {t.mascota.transporte_llegada === 'En vehículo' ? (
                          <Car className="w-3 h-3 text-[#2271b1] dark:text-[#72aee6]" />
                        ) : t.mascota.transporte_llegada === 'Retiro a domicilio' ? (
                          <Truck className="w-3 h-3 text-[#dba617]" />
                        ) : (
                          <Footprints className="w-3 h-3 text-[#2271b1] dark:text-[#72aee6]" />
                        )}
                        {t.mascota.transporte_llegada || 'Caminando'}
                      </span>

                      {t.mascota.fecha_ultima_vacunacion && (
                        <span className="px-1.5 py-0.5 rounded bg-[#f0f6e8] dark:bg-emerald-950/40 text-[#00a32a] dark:text-emerald-400 border border-[#00a32a]/20 dark:border-emerald-900/40 flex items-center gap-1 font-mono">
                          <Syringe className="w-3 h-3" /> {new Date(t.mascota.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Skin Alert Badge if present */}
                  {t.mascota?.alergias_afecciones && (
                    <div className="p-1.5 bg-[#fcf0f1] dark:bg-rose-950/40 border border-[#d63638]/30 dark:border-rose-900/40 rounded text-[11px] text-[#d63638] dark:text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Alerta Piel: {t.mascota.alergias_afecciones}</span>
                    </div>
                  )}

                  {/* Service & Price */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#c3c4c7] dark:border-slate-800">
                    <span className="text-[#1d2327] dark:text-slate-200 font-medium truncate max-w-[190px]">
                      {t.servicio?.nombre || 'Peluquería Canina'}
                    </span>
                    <span className="font-mono font-bold text-[#00a32a] dark:text-emerald-400">
                      ${t.precio_cobrado ? t.precio_cobrado.toLocaleString('es-AR') : '0'}
                    </span>
                  </div>

                  {/* Turno Notes */}
                  {t.notas && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-[#f6f7f7] dark:bg-[#0e1117] p-1.5 rounded border border-[#c3c4c7] dark:border-slate-800">
                      "{t.notas}"
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-2.5 mt-2.5 border-t border-[#c3c4c7] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {/* WhatsApp confirmation button */}
                  {t.cliente?.telefono ? (
                    <a
                      href={getWhatsAppMessage(t)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-[#25d366] hover:bg-[#128c7e] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : <div />}

                  {/* Change Status Controls */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {t.estado !== 'en_proceso' && t.estado !== 'completado' && (
                      <button
                        onClick={() => onUpdateEstado(t.id, 'en_proceso')}
                        className="px-2 py-1 bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-indigo-400 border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded text-xs font-medium transition-colors"
                        title="Marcar como En Peluquería"
                      >
                        En Peluquería
                      </button>
                    )}

                    {t.estado !== 'completado' && (
                      <button
                        onClick={() => onUpdateEstado(t.id, 'completado')}
                        className="px-2 py-1 bg-[#f0f6e8] dark:bg-emerald-950/40 text-[#00a32a] dark:text-emerald-400 border border-[#00a32a] hover:bg-[#00a32a] hover:text-white rounded text-xs font-medium transition-colors"
                        title="Marcar como Entregado"
                      >
                        Listo / Entregado
                      </button>
                    )}

                    {t.estado !== 'cancelado' && (
                      <button
                        onClick={() => onUpdateEstado(t.id, 'cancelado')}
                        className="p-1 text-slate-400 hover:text-[#d63638] rounded transition-colors"
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
                      className="p-1 text-slate-400 hover:text-[#d63638] rounded transition-colors"
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
