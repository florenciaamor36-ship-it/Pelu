import React from 'react';
import {
  Calendar,
  Dog,
  Plus,
  Package,
  TrendingUp,
  Store,
  Info
} from 'lucide-react';
import { TabType } from './Header';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewTurnoModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTurnoModal,
}) => {
  return (
    <nav aria-label="Navegación Móvil" className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1017]/95 backdrop-blur-xl border-t border-slate-800/90 z-50 px-1 py-1.5 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => setActiveTab('turnos')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all shrink-0 ${
          activeTab === 'turnos' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Turnos</span>
      </button>

      <button
        onClick={() => setActiveTab('mascotas')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all shrink-0 ${
          activeTab === 'mascotas' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Dog className="w-5 h-5 mb-0.5" />
        <span>Mascotas</span>
      </button>

      <button
        onClick={() => setActiveTab('inventario')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all shrink-0 ${
          activeTab === 'inventario' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Package className="w-5 h-5 mb-0.5" />
        <span>Stock</span>
      </button>

      <button
        onClick={onOpenNewTurnoModal}
        className="flex flex-col items-center justify-center p-2.5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-600/40 border-2 border-[#0a0c10] active:scale-95 transition-transform shrink-0 -mt-2"
        title="Nuevo Turno"
      >
        <Plus className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveTab('finanzas')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all shrink-0 ${
          activeTab === 'finanzas' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span>Finanzas</span>
      </button>

      <button
        onClick={() => setActiveTab('mi_peluqueria')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all shrink-0 ${
          activeTab === 'mi_peluqueria' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Store className="w-5 h-5 mb-0.5" />
        <span>Perfil</span>
      </button>

      <button
        onClick={() => setActiveTab('sobre_nosotros')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all shrink-0 ${
          activeTab === 'sobre_nosotros' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Info className="w-5 h-5 mb-0.5" />
        <span>Info</span>
      </button>
    </nav>
  );
};
