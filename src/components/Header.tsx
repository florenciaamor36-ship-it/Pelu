import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Dog,
  Calendar,
  Clock,
  Database,
  Plus,
  Package,
  TrendingUp,
  Scissors,
  User as UserIcon,
  LogOut,
  Store,
  Info,
  Menu,
  X,
  LayoutDashboard,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { SupabaseConfig, PerfilPeluqueria } from '../types';
import { useTheme } from '../context/ThemeContext';

export type TabType = 'turnos' | 'mascotas' | 'inventario' | 'finanzas' | 'servicios' | 'disponibilidad' | 'mi_peluqueria' | 'supabase' | 'sobre_nosotros';

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
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nombreSalon = perfilPeluqueria?.nombre_peluqueria || 'CaninGroom Pro';
  const logoUrl = perfilPeluqueria?.logo_url;

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'turnos' as TabType, label: 'Agenda & Turnos', icon: Calendar, count: turnosPendientesCount, countColor: 'bg-[#d63638] text-white' },
    { id: 'mascotas' as TabType, label: 'Mascotas & Clientes', icon: Dog },
    { id: 'inventario' as TabType, label: 'Stock de Productos', icon: Package, count: stockAlertsCount, countColor: 'bg-[#d63638] text-white' },
    { id: 'finanzas' as TabType, label: 'Finanzas & Caja', icon: TrendingUp },
    { id: 'servicios' as TabType, label: 'Servicios & Tarifas', icon: Scissors },
    { id: 'disponibilidad' as TabType, label: 'Horarios de Atención', icon: Clock },
    { id: 'mi_peluqueria' as TabType, label: 'Perfil del Salón', icon: Store },
    { id: 'supabase' as TabType, label: 'Estado Nube DB', icon: Database },
    { id: 'sobre_nosotros' as TabType, label: 'Acerca de', icon: Info },
  ];

  return (
    <>
      {/* Admin Top Bar */}
      <header className="bg-[#1d2327] text-[#f0f0f1] sticky top-0 z-40 h-11 flex items-center px-3 sm:px-4 border-b border-[#2c3338] shadow-xs select-none">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Left: Hamburger Toggle + Logo + Site Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Hamburger button for sidebar menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded hover:bg-[#2c3338] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Menú de Navegación"
              aria-label="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">Menú</span>
            </button>

            {/* Site Title with logo icon */}
            <div
              onClick={() => handleSelectTab('turnos')}
              className="flex items-center gap-2 cursor-pointer hover:text-[#72aee6] transition-colors"
            >
              <div className="w-6 h-6 rounded bg-[#2271b1] text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#2271b1]">
                {logoUrl ? (
                  <img src={logoUrl} alt={nombreSalon} className="w-full h-full object-cover" />
                ) : (
                  <Dog className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-white truncate max-w-[150px] sm:max-w-xs">
                {nombreSalon}
              </span>
              <span className="text-[11px] text-[#a7aaad] hidden md:inline-block">
                | Panel de Gestión
              </span>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Theme Mode Selector Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold select-none transition-all border cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#2c3338] hover:bg-[#3c434a] text-indigo-300 border-indigo-500/40 shadow-xs'
                  : 'bg-[#2c3338] hover:bg-[#3c434a] text-amber-300 border-[#3c434a] shadow-xs'
              }`}
              title={theme === 'dark' ? 'Cambiar a Modo Claro (Sol)' : 'Cambiar a Modo Oscuro (Luna)'}
              aria-label="Cambiar Tema de Color"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline text-indigo-200">Modo Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline text-slate-200">Modo Claro</span>
                </>
              )}
            </button>

            {/* + Añadir Turno Button */}
            <button
              onClick={onOpenNewTurnoModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ Añadir Turno</span>
            </button>

            {/* Cloud Sync Badge */}
            <button
              onClick={() => handleSelectTab('supabase')}
              className="hidden sm:flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-[#2c3338] text-emerald-400 border border-[#3c434a] hover:bg-[#3c434a] transition-colors font-mono"
              title="Estado de la Nube"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Nube OK</span>
            </button>

            {/* Admin User Profile */}
            {currentUserEmail ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#2c3338]">
                <div className="w-6 h-6 rounded bg-[#2271b1] text-white text-[11px] font-bold flex items-center justify-center">
                  {currentUserEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-300 hidden lg:inline max-w-[120px] truncate">
                  Hola, {currentUserEmail.split('@')[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-[#2c3338] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Acceder</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile / Overlay Drawer */}
      {isMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-150">
          <div
            className="absolute inset-0"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#1d2327] text-[#f0f0f1] h-full flex flex-col justify-between border-r border-[#2c3338] shadow-2xl overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="p-3.5 bg-[#101517] border-b border-[#2c3338] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-4 h-4 text-[#2271b1]" />
                  <span className="font-bold text-xs text-white uppercase tracking-wider">Menú Principal</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#2c3338]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Menu Links */}
              <nav className="py-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Panel Principal
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors border-l-4 ${
                        isActive
                          ? 'bg-[#2271b1] text-white border-white'
                          : 'text-[#f0f0f1] border-transparent hover:bg-[#2c3338] hover:text-[#72aee6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.countColor || 'bg-slate-700 text-white'}`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer info */}
            <div className="p-4 bg-[#101517] border-t border-[#2c3338] text-xs text-slate-400 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-300 text-xs">{nombreSalon}</p>
                  <p className="text-[10px] text-slate-500">CaninGroom Pro v2.5</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded bg-[#2c3338] hover:bg-[#3c434a] text-slate-200 text-xs flex items-center gap-1.5 border border-[#3c434a]"
                  title="Cambiar Tema"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="text-indigo-200">Oscuro</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-amber-300" />
                      <span className="text-amber-200">Claro</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenNewTurnoModal();
                }}
                className="w-full py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded text-center transition-colors shadow-xs"
              >
                + Crear Nuevo Turno
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
