import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Dog,
  Package,
  TrendingUp,
  Scissors,
  Clock,
  Store,
  Database,
  Info,
} from 'lucide-react';
import { Header, TabType } from './components/Header';
import { TurnosManager } from './components/TurnosManager';
import { MascotasManager } from './components/MascotasManager';
import { InventarioManager } from './components/InventarioManager';
import { FinanzasManager } from './components/FinanzasManager';
import { ServiciosManager } from './components/ServiciosManager';
import { DisponibilidadManager } from './components/DisponibilidadManager';
import { MiPeluqueriaManager } from './components/MiPeluqueriaManager';
import { SobreNosotrosManager } from './components/SobreNosotrosManager';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginScreen } from './components/LoginScreen';
import { Footer } from './components/Footer';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { NewTurnoModal } from './components/NewTurnoModal';
import { AuthModal } from './components/AuthModal';
import { subscribeToAuth, logoutUser, User } from './lib/firebase';

import {
  Cliente,
  Mascota,
  Servicio,
  Turno,
  Producto,
  Gasto,
  HorarioDisponibilidad,
  SupabaseConfig,
  PerfilPeluqueria,
  TurnoEstado
} from './types';

import {
  fetchClientes,
  saveCliente,
  deleteCliente,
  fetchMascotas,
  saveMascota,
  deleteMascota,
  fetchServicios,
  saveServicio,
  deleteServicio,
  fetchTurnos,
  saveTurno,
  updateTurnoEstado,
  deleteTurno,
  fetchProductos,
  saveProducto,
  deleteProducto,
  fetchGastos,
  saveGasto,
  deleteGasto,
  fetchHorarios,
  saveHorarios,
  fetchPerfilPeluqueria,
  savePerfilPeluqueria,
  INITIAL_PERFIL,
  getSupabaseConfig,
} from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('turnos');
  const [isNewTurnoModalOpen, setIsNewTurnoModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [preSelectedMascotaId, setPreSelectedMascotaId] = useState<string | undefined>(undefined);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>(undefined);
  const [preSelectedTime, setPreSelectedTime] = useState<string | undefined>(undefined);

  // Core States
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponibilidad[]>([]);
  const [perfilPeluqueria, setPerfilPeluqueria] = useState<PerfilPeluqueria>(INITIAL_PERFIL);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [loading, setLoading] = useState<boolean>(true);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cliData, masData, srvData, turData, proData, gasData, horData, perfData] = await Promise.all([
        fetchClientes(),
        fetchMascotas(),
        fetchServicios(),
        fetchTurnos(),
        fetchProductos(),
        fetchGastos(),
        fetchHorarios(),
        fetchPerfilPeluqueria(),
      ]);
      setClientes(cliData);
      setMascotas(masData);
      setServicios(srvData);
      setTurnos(turData);
      setProductos(proData);
      setGastos(gasData);
      setHorarios(horData);
      setPerfilPeluqueria(perfData);
      setSupabaseConfig(getSupabaseConfig());
    } catch (err) {
      console.error('Error cargando datos del sistema', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSavePerfil = async (updatedPerfil: PerfilPeluqueria) => {
    const saved = await savePerfilPeluqueria(updatedPerfil);
    setPerfilPeluqueria(saved);
  };

  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Subscribe to Firebase Auth changes & reload user database
  useEffect(() => {
    let isMounted = true;

    // Safety timeout in case Firebase auth initialization takes long or encounters network/iframe delays
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setAuthChecked(true);
        setLoading(false);
      }
    }, 2000);

    const unsubscribe = subscribeToAuth((user) => {
      clearTimeout(safetyTimer);
      if (isMounted) {
        setCurrentUser(user);
        setAuthChecked(true);
        if (user) {
          loadData();
        } else {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [loadData]);

  const handleLogout = async () => {
    localStorage.removeItem('caningroom_guest_user');
    setCurrentUser(null);
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error logout:', err);
    }
  };

  // Turno Handlers
  const handleSaveTurno = async (turnoData: {
    mascota_id: string;
    cliente_id: string;
    servicio_id: string;
    fecha_hora: string;
    estado: TurnoEstado;
    notas?: string;
    precio_cobrado: number;
  }) => {
    await saveTurno(turnoData);
    await loadData();
  };

  const handleUpdateTurnoEstado = async (id: string, estado: TurnoEstado) => {
    await updateTurnoEstado(id, estado);
    await loadData();
  };

  const handleDeleteTurno = async (id: string) => {
    await deleteTurno(id);
    await loadData();
  };

  const handleOpenTurnoModalForMascota = (m: Mascota) => {
    setPreSelectedMascotaId(m.id);
    setPreSelectedDate(undefined);
    setPreSelectedTime(undefined);
    setIsNewTurnoModalOpen(true);
  };

  const handleOpenTurnoWithDateTime = (fecha: string, hora?: string) => {
    setPreSelectedMascotaId(undefined);
    setPreSelectedDate(fecha);
    setPreSelectedTime(hora);
    setIsNewTurnoModalOpen(true);
  };

  // Mascota Handlers
  const handleSaveMascota = async (mascota: Omit<Mascota, 'id' | 'created_at'> & { id?: string }) => {
    await saveMascota(mascota);
    await loadData();
  };

  const handleDeleteMascota = async (id: string) => {
    await deleteMascota(id);
    await loadData();
  };

  // Cliente Handlers
  const handleSaveCliente = async (cliente: Omit<Cliente, 'id' | 'created_at'> & { id?: string }) => {
    const created = await saveCliente(cliente);
    await loadData();
    return created;
  };

  // Producto Handlers
  const handleSaveProducto = async (producto: Omit<Producto, 'id'> & { id?: string }) => {
    const saved = await saveProducto(producto);
    await loadData();
    return saved;
  };

  const handleDeleteProducto = async (id: string) => {
    await deleteProducto(id);
    await loadData();
  };

  // Gasto Handlers
  const handleSaveGasto = async (gasto: Omit<Gasto, 'id'> & { id?: string }) => {
    const saved = await saveGasto(gasto);
    await loadData();
    return saved;
  };

  const handleDeleteGasto = async (id: string) => {
    await deleteGasto(id);
    await loadData();
  };

  // Servicio Handlers
  const handleSaveServicio = async (servicio: Omit<Servicio, 'id'> & { id?: string }) => {
    await saveServicio(servicio);
    await loadData();
  };

  const handleDeleteServicio = async (id: string) => {
    await deleteServicio(id);
    await loadData();
  };

  // Horario Handlers
  const handleSaveHorarios = async (newHorarios: HorarioDisponibilidad[]) => {
    await saveHorarios(newHorarios);
    await loadData();
  };

  const turnosPendientesCount = turnos.filter(t => t.estado === 'pendiente').length;
  const stockAlertsCount = productos.filter(p => p.stock_actual <= p.stock_minimo).length;

  const handleGuestLogin = () => {
    const guestUser = {
      uid: 'guest-demo-user',
      email: 'demo@caningroom.com',
    } as User;
    setCurrentUser(guestUser);
    loadData();
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] dark:bg-[#0e1117] text-[#1d2327] dark:text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#2271b1]/20 border-t-[#2271b1] rounded-full animate-spin" />
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Iniciando sistema de autenticación CaninGroom Pro...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onSuccess={loadData} onGuestLogin={handleGuestLogin} />;
  }

  const navItems = [
    { id: 'turnos' as TabType, label: 'Agenda & Turnos', icon: Calendar, count: turnosPendientesCount },
    { id: 'mascotas' as TabType, label: 'Mascotas & Clientes', icon: Dog },
    { id: 'inventario' as TabType, label: 'Stock de Productos', icon: Package, count: stockAlertsCount },
    { id: 'finanzas' as TabType, label: 'Finanzas & Caja', icon: TrendingUp },
    { id: 'servicios' as TabType, label: 'Servicios & Precios', icon: Scissors },
    { id: 'disponibilidad' as TabType, label: 'Horarios de Atención', icon: Clock },
    { id: 'mi_peluqueria' as TabType, label: 'Perfil del Salón', icon: Store },
    { id: 'supabase' as TabType, label: 'Estado Nube DB', icon: Database },
    { id: 'sobre_nosotros' as TabType, label: 'Acerca de', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f1] dark:bg-[#0e1117] text-[#1d2327] dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#2271b1] selection:text-white transition-colors duration-150">
      {/* Admin Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTurnoModal={() => {
          setPreSelectedMascotaId(undefined);
          setIsNewTurnoModalOpen(true);
        }}
        supabaseConfig={supabaseConfig}
        turnosPendientesCount={turnosPendientesCount}
        stockAlertsCount={stockAlertsCount}
        currentUserEmail={currentUser?.email}
        perfilPeluqueria={perfilPeluqueria}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container: Left Sidebar + Main Body */}
      <div className="flex-1 flex w-full">
        {/* Desktop Persistent Admin Sidebar */}
        <aside className="hidden md:block w-52 bg-[#1d2327] dark:bg-[#161b22] text-[#f0f0f1] shrink-0 border-r border-[#2c3338] dark:border-slate-800 select-none py-2 transition-colors">
          <nav className="space-y-0.5 sticky top-12">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Escritorio
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors border-l-4 ${
                    isActive
                      ? 'bg-[#2271b1] text-white border-white'
                      : 'text-[#f0f0f1] border-transparent hover:bg-[#2c3338] hover:text-[#72aee6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#d63638] text-white shrink-0 ml-1">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-3 border-[#2271b1]/30 border-t-[#2271b1] rounded-full animate-spin" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Cargando panel de administración...</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              {activeTab === 'turnos' && (
                <TurnosManager
                  turnos={turnos}
                  mascotas={mascotas}
                  servicios={servicios}
                  perfilPeluqueria={perfilPeluqueria}
                  onUpdateEstado={handleUpdateTurnoEstado}
                  onDeleteTurno={handleDeleteTurno}
                  onOpenNewTurnoModal={() => {
                    setPreSelectedMascotaId(undefined);
                    setPreSelectedDate(undefined);
                    setPreSelectedTime(undefined);
                    setIsNewTurnoModalOpen(true);
                  }}
                  onOpenNewTurnoWithDateTime={handleOpenTurnoWithDateTime}
                  onRefresh={loadData}
                />
              )}

              {activeTab === 'mascotas' && (
                <MascotasManager
                  mascotas={mascotas}
                  clientes={clientes}
                  onSaveMascota={handleSaveMascota}
                  onSaveCliente={handleSaveCliente}
                  onDeleteMascota={handleDeleteMascota}
                  onOpenNewTurnoForMascota={handleOpenTurnoModalForMascota}
                />
              )}

              {activeTab === 'inventario' && (
                <InventarioManager
                  productos={productos}
                  onSaveProducto={handleSaveProducto}
                  onDeleteProducto={handleDeleteProducto}
                />
              )}

              {activeTab === 'finanzas' && (
                <FinanzasManager
                  gastos={gastos}
                  turnos={turnos}
                  moneda={perfilPeluqueria?.moneda}
                  onSaveGasto={handleSaveGasto}
                  onDeleteGasto={handleDeleteGasto}
                />
              )}

              {activeTab === 'servicios' && (
                <ServiciosManager
                  servicios={servicios}
                  onSaveServicio={handleSaveServicio}
                  onDeleteServicio={handleDeleteServicio}
                />
              )}

              {activeTab === 'disponibilidad' && (
                <DisponibilidadManager
                  horarios={horarios}
                  turnos={turnos}
                  onSaveHorarios={handleSaveHorarios}
                />
              )}

              {activeTab === 'mi_peluqueria' && (
                <MiPeluqueriaManager
                  perfil={perfilPeluqueria}
                  onSavePerfil={handleSavePerfil}
                />
              )}

              {activeTab === 'supabase' && (
                <SupabaseGuideModal
                  config={supabaseConfig}
                  onConfigChange={loadData}
                />
              )}

              {activeTab === 'sobre_nosotros' && (
                <SobreNosotrosManager />
              )}
            </div>
          )}
        </main>
      </div>

      {/* New Turno Modal */}
      <NewTurnoModal
        isOpen={isNewTurnoModalOpen}
        onClose={() => setIsNewTurnoModalOpen(false)}
        mascotas={mascotas}
        servicios={servicios}
        preSelectedMascotaId={preSelectedMascotaId}
        preSelectedDate={preSelectedDate}
        preSelectedTime={preSelectedTime}
        onSaveTurno={handleSaveTurno}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUserEmail={currentUser?.email}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-[#161b22] border-t border-[#c3c4c7] dark:border-slate-800 py-3 px-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto transition-colors">
        <p className="flex items-center gap-1">
          <span>Gracias por utilizar </span>
          <strong className="text-[#2271b1] dark:text-[#72aee6]">CaninGroom Pro</strong>
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Versión 2.5.0 | Servidor Nube OK
        </p>
      </footer>
    </div>
  );
}
