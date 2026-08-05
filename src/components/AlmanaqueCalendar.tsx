import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Dog,
  Scissors,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
  MessageCircle,
  ExternalLink,
  Download,
  FileText,
  User,
  Phone,
  Trash2,
  X,
  Syringe,
  Car,
  Footprints,
  Truck
} from 'lucide-react';
import { Turno, Mascota, Servicio, TurnoEstado, PerfilPeluqueria } from '../types';

interface AlmanaqueCalendarProps {
  turnos: Turno[];
  mascotas: Mascota[];
  servicios: Servicio[];
  perfilPeluqueria?: PerfilPeluqueria;
  onOpenNewTurnoWithDateTime: (fecha: string, hora?: string) => void;
  onUpdateEstado: (id: string, estado: TurnoEstado) => Promise<void>;
  onDeleteTurno: (id: string) => Promise<void>;
}

export const AlmanaqueCalendar: React.FC<AlmanaqueCalendarProps> = ({
  turnos,
  mascotas,
  servicios,
  perfilPeluqueria,
  onOpenNewTurnoWithDateTime,
  onUpdateEstado,
  onDeleteTurno,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create array of days for month view
  const calendarDays: { date: Date; isCurrentMonth: boolean; dayNum: number; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({ date: d, isCurrentMonth: false, dayNum: d.getDate(), dateStr });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    // Format YYYY-MM-DD using local time
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    calendarDays.push({ date: d, isCurrentMonth: true, dayNum: i, dateStr });
  }

  // Next month leading days to complete grid (42 cells = 6 rows)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    calendarDays.push({ date: d, isCurrentMonth: false, dayNum: i, dateStr });
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Helper to format local date string YYYY-MM-DD from ISO or Date
  const getLocalDateStr = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalDateStr(new Date());

  // Filter turnos by dateStr
  const getTurnosForDate = (dateStr: string) => {
    return turnos.filter(t => {
      const tDateStr = getLocalDateStr(t.fecha_hora);
      return tDateStr === dateStr;
    }).sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  };

  // Status badge styles
  const getStatusBadge = (estado: TurnoEstado) => {
    switch (estado) {
      case 'completado':
        return {
          bg: 'bg-[#f0f6e8] dark:bg-emerald-950/40 border-[#00a32a]/30 dark:border-emerald-800/40 text-[#00a32a] dark:text-emerald-400',
          dot: 'bg-[#00a32a]',
          label: 'Completado'
        };
      case 'en_proceso':
        return {
          bg: 'bg-[#f0f6fc] dark:bg-indigo-950/40 border-[#2271b1]/30 dark:border-indigo-800/40 text-[#2271b1] dark:text-indigo-400',
          dot: 'bg-[#2271b1] animate-pulse',
          label: 'En Baño/Corte'
        };
      case 'confirmado':
        return {
          bg: 'bg-[#f0f6fc] dark:bg-indigo-950/40 border-[#2271b1]/30 dark:border-indigo-800/40 text-[#2271b1] dark:text-indigo-400',
          dot: 'bg-[#2271b1]',
          label: 'Confirmado'
        };
      case 'cancelado':
        return {
          bg: 'bg-[#fcf0f1] dark:bg-rose-950/40 border-[#d63638]/30 dark:border-rose-800/40 text-[#d63638] dark:text-rose-400 line-through opacity-70',
          dot: 'bg-[#d63638]',
          label: 'Cancelado'
        };
      default:
        return {
          bg: 'bg-[#fff8e5] dark:bg-amber-950/40 border-[#dba617]/30 dark:border-amber-800/40 text-[#996800] dark:text-amber-400',
          dot: 'bg-[#dba617]',
          label: 'Pendiente'
        };
    }
  };

  // Google Calendar export link generator
  const getGoogleCalendarUrl = (t: Turno) => {
    const startDate = new Date(t.fecha_hora);
    const endDate = new Date(startDate.getTime() + (t.servicio?.duracion_min || 60) * 60000);

    const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`Peluquería Canina: ${t.mascota?.nombre || 'Perro'} (${t.servicio?.nombre || 'Servicio'})`);
    const details = encodeURIComponent(
      `Turno de Peluquería Canina CaninGroom Pro\n` +
      `Mascota: ${t.mascota?.nombre} (${t.mascota?.raza})\n` +
      `Cliente: ${t.cliente?.nombre} (Tel: ${t.cliente?.telefono})\n` +
      `Servicio: ${t.servicio?.nombre}\n` +
      `Boza: ${t.mascota?.usa_bozal ? 'Sí, requiere bozal' : 'No'}\n` +
      `Observaciones: ${t.notas || 'Sin observaciones'}`
    );
    const location = encodeURIComponent('Peluquería Canina CaninGroom');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${details}&location=${location}`;
  };

  // Download .ics file
  const downloadIcsFile = (t: Turno) => {
    const startDate = new Date(t.fecha_hora);
    const endDate = new Date(startDate.getTime() + (t.servicio?.duracion_min || 60) * 60000);

    const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CaninGroom Pro//Peluqueria Canina//ES',
      'BEGIN:VEVENT',
      `SUMMARY:Turno Peluquería: ${t.mascota?.nombre || 'Perro'} (${t.servicio?.nombre || 'Servicio'})`,
      `DESCRIPTION:Cliente: ${t.cliente?.nombre} | Tel: ${t.cliente?.telefono} | Bozal: ${t.mascota?.usa_bozal ? 'SI' : 'NO'} | Notas: ${t.notas || ''}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      'LOCATION:Peluquería Canina CaninGroom',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `turno-${t.mascota?.nombre || 'peluqueria'}-${startDate.toISOString().split('T')[0]}.ics`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header / Toolbar */}
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#f0f6fc] dark:bg-[#2271b1]/15 text-[#2271b1] dark:text-[#72aee6] border border-[#2271b1]/20 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1d2327] dark:text-white leading-tight">
              Almanaque & Agenda Mensual
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualización de turnos programados en el salón.
            </p>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1 bg-[#f0f0f1] dark:bg-[#0e1117] p-1 border border-[#c3c4c7] dark:border-slate-700 rounded">
            <button
              onClick={prevMonth}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs sm:text-sm text-[#1d2327] dark:text-white px-2 font-mono text-center min-w-[110px] sm:min-w-[130px]">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-[#f6f7f7] dark:bg-slate-800 hover:bg-[#f0f0f1] dark:hover:bg-slate-700 text-[#2c3338] dark:text-slate-200 text-xs font-semibold rounded border border-[#8c8f94] dark:border-slate-700 transition-colors"
          >
            Hoy
          </button>

          <button
            onClick={() => onOpenNewTurnoWithDateTime(todayStr, '10:00')}
            className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo Turno
          </button>
        </div>
      </div>

      {/* MONTH GRID */}
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-3 sm:p-4 shadow-xs overflow-x-auto transition-colors">
        <div className="min-w-[320px]">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {weekDayNames.map((d, idx) => (
              <div
                key={d}
                className={`py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded ${
                  idx === 0 || idx === 6
                    ? 'text-[#2271b1] dark:text-[#72aee6] bg-[#f0f6fc] dark:bg-[#2271b1]/15'
                    : 'text-slate-600 dark:text-slate-300 bg-[#f0f0f1] dark:bg-[#0e1117]'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
            {calendarDays.map((cell, idx) => {
              const dayTurnos = getTurnosForDate(cell.dateStr);
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  className={`min-h-[70px] sm:min-h-[120px] p-1 sm:p-1.5 rounded border flex flex-col justify-between transition-colors group relative ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-[#f0f6fc] dark:bg-[#2271b1]/15 border-[#2271b1] shadow-xs'
                        : 'bg-white dark:bg-[#161b22] border-[#dcdcde] dark:border-slate-800 hover:border-[#8c8f94] dark:hover:border-slate-700'
                      : 'bg-[#f6f7f7] dark:bg-[#0e1117]/60 border-[#e0e0e0] dark:border-slate-900 text-[#a7aaad] dark:text-slate-600'
                  }`}
                >
                {/* Cell Top Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                      isToday
                        ? 'bg-[#2271b1] text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-[#1d2327] dark:text-slate-200'
                        : 'text-[#a7aaad] dark:text-slate-600'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isCurrentMonth && (
                    <button
                      onClick={() => onOpenNewTurnoWithDateTime(cell.dateStr, '10:00')}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 dark:text-slate-400 hover:text-[#2271b1] dark:hover:text-[#72aee6] hover:bg-[#f0f0f1] dark:hover:bg-slate-800 rounded transition-colors"
                      title={`Agendar turno para el ${cell.dateStr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* List of Turnos in Cell */}
                <div className="my-1 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {dayTurnos.map(t => {
                    const st = getStatusBadge(t.estado);
                    const timeStr = new Date(t.fecha_hora).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    });

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTurno(t)}
                        className={`p-1.5 rounded border text-[11px] cursor-pointer transition-colors shadow-2xs flex flex-col gap-0.5 ${st.bg}`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1 truncate text-[#1d2327] dark:text-slate-100">
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} shrink-0`} />
                            {t.mascota?.nombre || 'Perro'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
                            {timeStr}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                          <span className="truncate">{t.servicio?.nombre}</span>
                          {t.mascota?.usa_bozal && (
                            <span className="text-[#d63638] dark:text-rose-400 font-bold shrink-0 ml-1">⚠️ Bozal</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cell Bottom Action */}
                {dayTurnos.length === 0 && cell.isCurrentMonth && (
                  <button
                    onClick={() => onOpenNewTurnoWithDateTime(cell.dateStr, '10:00')}
                    className="w-full text-[10px] text-slate-400 hover:text-[#2271b1] py-0.5 rounded border border-dashed border-[#c3c4c7] hover:border-[#2271b1] text-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    + Agendar
                  </button>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* TURNO DETAILS / MODAL FROM CALENDAR */}
      {selectedTurno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1d2327]/60 dark:bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-md shadow-lg overflow-hidden my-8 transition-colors">
            {/* Header */}
            <div className="p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f0f0f1] dark:bg-[#0e1117] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTurno.mascota?.foto_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                  alt={selectedTurno.mascota?.nombre}
                  className="w-11 h-11 rounded object-cover border border-[#c3c4c7] dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-[#1d2327] dark:text-white text-sm flex items-center gap-2">
                    {selectedTurno.mascota?.nombre}
                    {selectedTurno.mascota?.usa_bozal && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fcf0f1] dark:bg-rose-950/40 text-[#d63638] dark:text-rose-400 border border-[#d63638]/30 dark:border-rose-900/40 font-bold">
                        ⚠️ USA BOZAL
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Raza: {selectedTurno.mascota?.raza} • Dueño: {selectedTurno.cliente?.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTurno(null)}
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white hover:bg-[#e0e0e0] dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3">
              {/* Date & Time */}
              <div className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" />
                  <span className="text-xs font-semibold text-[#1d2327] dark:text-slate-200 font-mono">
                    {new Date(selectedTurno.fecha_hora).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#2271b1] dark:text-[#72aee6] bg-[#f0f6fc] dark:bg-[#2271b1]/20 px-2 py-0.5 rounded border border-[#2271b1]/30">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedTurno.fecha_hora).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })} hs
                </div>
              </div>

              {/* Service & Price */}
              <div className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-[#2271b1] dark:text-[#72aee6]" /> Servicio:
                  </span>
                  <span className="font-bold text-[#1d2327] dark:text-white">{selectedTurno.servicio?.nombre}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Precio Cobrado:</span>
                  <span className="font-mono font-bold text-[#00a32a] dark:text-emerald-400 text-sm">
                    {perfilPeluqueria?.moneda || '$'} {selectedTurno.precio_cobrado?.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Clinical & Behavior badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 text-[10px]">
                    <Syringe className="w-3 h-3 text-[#00a32a] dark:text-emerald-400" /> ÚLTIMA VACUNACIÓN
                  </span>
                  <p className="font-mono text-[#1d2327] dark:text-slate-200 font-bold">
                    {selectedTurno.mascota?.fecha_ultima_vacunacion
                      ? new Date(selectedTurno.mascota.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR')
                      : 'S/D'}
                  </p>
                </div>

                <div className="p-2 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 text-[10px]">
                    <Car className="w-3 h-3 text-[#2271b1] dark:text-[#72aee6]" /> LLEGADA
                  </span>
                  <p className="text-[#1d2327] dark:text-slate-200 font-bold">
                    {selectedTurno.mascota?.transporte_llegada || 'Caminando'}
                  </p>
                </div>
              </div>

              {/* Observations / Notes */}
              <div className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#2271b1] dark:text-[#72aee6]" /> Observaciones del Turno
                </span>
                <p className="text-xs text-[#2c3338] dark:text-slate-300">
                  {selectedTurno.notas || 'Sin observaciones registradas para este turno.'}
                </p>
              </div>

              {/* Change Status Buttons */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2c3338] dark:text-slate-300">Cambiar Estado del Turno:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      await onUpdateEstado(selectedTurno.id, 'en_proceso');
                      setSelectedTurno(prev => prev ? { ...prev, estado: 'en_proceso' } : null);
                    }}
                    className={`py-1.5 px-2.5 rounded text-xs font-semibold border flex items-center justify-center gap-1 transition-colors ${
                      selectedTurno.estado === 'en_proceso'
                        ? 'bg-[#2271b1] text-white border-[#2271b1]'
                        : 'bg-[#f6f7f7] dark:bg-slate-800 text-[#2c3338] dark:text-slate-200 border border-[#8c8f94] dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    ✂️ En Baño/Corte
                  </button>

                  <button
                    onClick={async () => {
                      await onUpdateEstado(selectedTurno.id, 'completado');
                      setSelectedTurno(prev => prev ? { ...prev, estado: 'completado' } : null);
                    }}
                    className={`py-1.5 px-2.5 rounded text-xs font-semibold border flex items-center justify-center gap-1 transition-colors ${
                      selectedTurno.estado === 'completado'
                        ? 'bg-[#00a32a] text-white border-[#00a32a]'
                        : 'bg-[#f6f7f7] dark:bg-slate-800 text-[#2c3338] dark:text-slate-200 border border-[#8c8f94] dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a32a] dark:text-emerald-400" /> Completado
                  </button>
                </div>
              </div>

              {/* Export to Google Calendar / ICS Sync Buttons */}
              <div className="pt-2 border-t border-[#c3c4c7] dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sincronización con Calendario
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleCalendarUrl(selectedTurno)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-[#f6f7f7] dark:bg-slate-800 hover:bg-[#f0f0f1] dark:hover:bg-slate-700 text-[#2c3338] dark:text-slate-200 text-xs font-medium rounded border border-[#8c8f94] dark:border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#2271b1] dark:text-[#72aee6]" /> Google Calendar
                  </a>

                  <button
                    onClick={() => downloadIcsFile(selectedTurno)}
                    className="p-1.5 bg-[#f6f7f7] dark:bg-slate-800 hover:bg-[#f0f0f1] dark:hover:bg-slate-700 text-[#2c3338] dark:text-slate-200 text-xs font-medium rounded border border-[#8c8f94] dark:border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00a32a] dark:text-emerald-400" /> Descargar .ics
                  </button>
                </div>
              </div>

              {/* WhatsApp & Delete Actions */}
              <div className="pt-2 border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar turno de ${selectedTurno.mascota?.nombre}?`)) {
                      onDeleteTurno(selectedTurno.id);
                      setSelectedTurno(null);
                    }
                  }}
                  className="px-2.5 py-1.5 text-[#d63638] dark:text-rose-400 hover:bg-[#fcf0f1] dark:hover:bg-rose-950/40 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>

                {selectedTurno.cliente?.telefono && (
                  <a
                    href={`https://wa.me/${selectedTurno.cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola ${selectedTurno.cliente.nombre}! Te escribimos de *${perfilPeluqueria?.nombre_peluqueria || 'la Peluquería Canina'}* para recordarte el turno de ${selectedTurno.mascota?.nombre || 'tu mascota'} el día ${new Date(selectedTurno.fecha_hora).toLocaleDateString('es-AR')} a las ${new Date(selectedTurno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs.\n\n${perfilPeluqueria?.mensaje_ticket || '¡Gracias por confiar en nosotros!'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#25d366] hover:bg-[#128c7e] text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
