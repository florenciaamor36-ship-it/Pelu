import React, { useState, useEffect, useCallback } from 'react';
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

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Iniciando sistema de autenticación CaninGroom Pro...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onSuccess={loadData} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar Header */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 md:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Cargando sistema de gestión CaninGroom...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

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
      <Footer onOpenSobreNosotros={() => setActiveTab('sobre_nosotros')} />

      {/* Mobile Native Fixed Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTurnoModal={() => {
          setPreSelectedMascotaId(undefined);
          setIsNewTurnoModalOpen(true);
        }}
      />
    </div>
  );
}
