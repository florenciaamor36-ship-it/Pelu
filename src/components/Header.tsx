import React from 'react';
import {
  Dog,
  Calendar,
  Users,
  Briefcase,
  Clock,
  Database,
  Plus,
  Package,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Scissors,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { SupabaseConfig, PerfilPeluqueria } from '../types';

export type TabType = 'turnos' | 'mascotas' | 'inventario' | 'finanzas' | 'servicios' | 'disponibilidad' | 'mi_peluqueria' | 'supabase';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewTurnoModal: () => void;
  supabaseConfig: SupabaseConfig;
  turnosPendientesCount: number;
  stockAlertsCount: number;
  currentUserEmail?: string | null;
  perfilPeluqueria?: PerfilPeluqueria;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTurnoModal,
  supabaseConfig,
  turnosPendientesCount,
  stockAlertsCount,
  currentUserEmail,
  perfilPeluqueria,
  onOpenAuthModal,
  onLogout,
}) => {
  const nombreSalon = perfilPeluqueria?.nombre_peluqueria || 'CaninGroom Pro';
  const sloganSalon = perfilPeluqueria?.slogan || 'Peluquería Canina';
  const logoUrl = perfilPeluqueria?.logo_url;

  return (
    <header className="border-b border-slate-800 bg-[#0a0c10] backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('mi_peluqueria')}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center shadow-lg shadow-indigo-500/25 overflow-hidden shrink-0 border border-indigo-500/30">
                {logoUrl ? (
                  <img src={logoUrl} alt={nombreSalon} className="w-full h-full object-cover" />
                ) : (
                  <Dog className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{nombreSalon}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-indigo-400" /> Estética Canina
                  </span>
                </h1>
                <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                  {sloganSalon}
                </p>
              </div>
            </div>

            {/* Mobile menu action */}
            <div className="md:hidden">
              <button
                onClick={onOpenNewTurnoModal}
                className="px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Nuevo Turno
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-end md:self-auto">
            {/* User Auth Button / Badge */}
            {currentUserEmail ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {currentUserEmail.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-[11px] font-semibold text-white leading-none truncate max-w-[120px]">
                    {currentUserEmail.split('@')[0]}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-mono">Google/Firebase OK</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-all font-semibold"
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            {/* Supabase / Firebase status badge */}
            <button
              onClick={() => setActiveTab('supabase')}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border transition-all bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
              title="Ver estado de base de datos local y nube Firebase / Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-mono">
                Base Firebase Automática OK
              </span>
              <span className="sm:hidden font-mono">
                Firebase OK
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {/* Quick action button */}
            <button
              onClick={onOpenNewTurnoModal}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Agendar Turno
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('turnos')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all relative whitespace-nowrap ${
              activeTab === 'turnos'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Turnos & Calendario</span>
            {turnosPendientesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[10px] rounded-full">
                {turnosPendientesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mascotas')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'mascotas'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Dog className="w-4 h-4" />
            <span>Fichas de Mascotas & Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'inventario'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos & Stock</span>
            {stockAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-[10px] rounded-full">
                {stockAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'finanzas'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Finanzas & Gastos</span>
          </button>

          <button
            onClick={() => setActiveTab('servicios')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'servicios'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Servicios</span>
          </button>

          <button
            onClick={() => setActiveTab('disponibilidad')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'disponibilidad'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Horarios</span>
          </button>

          <button
            onClick={() => setActiveTab('mi_peluqueria')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'mi_peluqueria'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Mi Peluquería</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Nube & Respaldos</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
