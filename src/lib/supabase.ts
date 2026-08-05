import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, auth, collection, getDocs, setDoc, deleteDoc, doc } from './firebase';
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
} from '../types';

const DEFAULT_PROJECT_ID = 'ypzudkxowpxvdggvongz';
const DEFAULT_SUPABASE_URL = `https://${DEFAULT_PROJECT_ID}.supabase.co`;

// Initial sample data for Peluquería Canina (Start empty)
const INITIAL_CLIENTES: Cliente[] = [];
const INITIAL_MASCOTAS: Mascota[] = [];
const INITIAL_SERVICIOS: Servicio[] = [];
const INITIAL_PRODUCTOS: Producto[] = [];
const INITIAL_GASTOS: Gasto[] = [];

const INITIAL_HORARIOS: HorarioDisponibilidad[] = [
  { id: 'h-1', dia_semana: 1, dia_nombre: 'Lunes', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-2', dia_semana: 2, dia_nombre: 'Martes', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-3', dia_semana: 3, dia_nombre: 'Miércoles', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-4', dia_semana: 4, dia_nombre: 'Jueves', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-5', dia_semana: 5, dia_nombre: 'Viernes', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-6', dia_semana: 6, dia_nombre: 'Sábado', hora_inicio: '09:00', hora_fin: '15:00', activo: true },
  { id: 'h-0', dia_semana: 0, dia_nombre: 'Domingo', hora_inicio: '10:00', hora_fin: '14:00', activo: false },
];

const INITIAL_TURNOS: Turno[] = [];

// SQL Schema for Peluquería Canina
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- ESTRUCTURA DE TABLAS SUPABASE PARA PELUQUERÍA CANINA
-- Proyecto Supabase ID: ${DEFAULT_PROJECT_ID}
-- ========================================================

-- 1. Tabla de Clientes (Dueños)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT NOT NULL DEFAULT '',
    email TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Mascotas (Perros)
CREATE TABLE IF NOT EXISTS public.mascotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    foto_url TEXT,
    raza TEXT NOT NULL DEFAULT 'Mestizo',
    tamano TEXT CHECK (tamano IN ('Pequeño', 'Mediano', 'Grande', 'Gigante')) DEFAULT 'Mediano',
    peso_kg NUMERIC(5,2) DEFAULT 0,
    color_pelo TEXT DEFAULT '',
    cumpleanos TEXT,
    vacunas_al_dia BOOLEAN DEFAULT TRUE,
    vacunas_detalle TEXT,
    alergias_afecciones TEXT,
    comportamiento TEXT,
    productos_favoritos TEXT,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Servicios / Catálogo
CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    duracion_min INT NOT NULL DEFAULT 60,
    precio NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tamano_aplicable TEXT DEFAULT 'Todos',
    categoria TEXT DEFAULT 'General',
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Tabla de Turnos
CREATE TABLE IF NOT EXISTS public.turnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mascota_id UUID REFERENCES public.mascotas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES public.servicios(id) ON DELETE SET NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    estado TEXT CHECK (estado IN ('pendiente', 'confirmado', 'en_proceso', 'completado', 'cancelado')) DEFAULT 'confirmado',
    notas TEXT,
    precio_cobrado NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    productos_usados_ids TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Productos (Stock e Inventario)
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 2,
    precio_costo NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    precio_venta NUMERIC(10,2) DEFAULT 0.00,
    unidad TEXT DEFAULT 'Unidades'
);

-- 6. Tabla de Gastos
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    monto NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

-- 7. Tabla de Horarios de Disponibilidad
CREATE TABLE IF NOT EXISTS public.horarios_disponibilidad (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dia_semana INT NOT NULL,
    dia_nombre TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_disponibilidad ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas
CREATE POLICY "Anon Clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Mascotas" ON public.mascotas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Servicios" ON public.servicios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Turnos" ON public.turnos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Gastos" ON public.gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Horarios" ON public.horarios_disponibilidad FOR ALL USING (true) WITH CHECK (true);
`;

// Helper to check if an item is explicit sample data (e.g. sample-)
function isSampleId(id: string): boolean {
  if (!id) return false;
  return id.startsWith('sample-') || id.startsWith('demo-');
}

// Local Storage helpers
const getStorageKey = (key: string) => {
  const uid = auth.currentUser?.uid;
  return uid ? `caningroom_${uid}_${key}` : `caningroom_${key}`;
};

const getStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(getStorageKey(key));
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(i => !i || !i.id || !isSampleId(i.id));
      return filtered as unknown as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage error', err);
  }
};

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('caningroom_sb_url') || envUrl;
  const storedKey = localStorage.getItem('caningroom_sb_key') || envKey;

  const isConnected = Boolean(storedUrl && storedKey && storedKey.trim().length > 10);

  return {
    url: storedUrl,
    anonKey: storedKey,
    isConnected,
    projectId: DEFAULT_PROJECT_ID,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem('caningroom_sb_url', url);
  localStorage.setItem('caningroom_sb_key', anonKey);
  supabaseClient = null;
}

export function getSupabaseInstance(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConnected) return null;

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Failed to init Supabase client', e);
      return null;
    }
  }
  return supabaseClient;
}

// Helper function to get collection reference scoped by logged-in Peluquería (User UID)
function getUserCollectionRef(collName: string) {
  const userId = auth.currentUser?.uid;
  if (userId) {
    return collection(db, 'users', userId, collName);
  }
  return collection(db, 'public_demo', collName);
}

function getUserDocRef(collName: string, id: string) {
  const userId = auth.currentUser?.uid;
  if (userId) {
    return doc(db, 'users', userId, collName, id);
  }
  return doc(db, 'public_demo', collName, id);
}

// Timeout helper for network calls to ensure immediate local fallback when offline
function withTimeout<T>(promiseLike: PromiseLike<any>, timeoutMs = 2000): Promise<T> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return Promise.reject(new Error('Offline'));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    Promise.resolve(promiseLike)
      .then((res) => {
        clearTimeout(timer);
        resolve(res as T);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Firestore Helper Functions for automatic cloud persistence & local fallback
async function fetchFirestoreCollection<T extends { id: string }>(collName: string, initialData: T[]): Promise<T[]> {
  const storageKey = auth.currentUser?.uid ? `${auth.currentUser.uid}_${collName}` : collName;
  const localItems = getStorage<T[]>(storageKey, initialData) || [];

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return localItems.filter(i => !isSampleId(i.id));
  }

  try {
    const collRef = getUserCollectionRef(collName);
    const snap = await withTimeout<any>(getDocs(collRef), 2000);
    if (snap && !snap.empty) {
      const items: T[] = [];
      snap.forEach((d: any) => {
        const item = d.data() as T;
        if (!isSampleId(item.id)) {
          items.push(item);
        }
      });
      setStorage(storageKey, items);
      return items;
    } else {
      const cleanInitial = (initialData || []).filter(i => !isSampleId(i.id));
      setStorage(storageKey, cleanInitial);
      return cleanInitial;
    }
  } catch (err) {
    console.warn(`Firestore collection ${collName} fetch failed or timed out, returning local cache:`, err);
    return localItems.filter(i => !isSampleId(i.id));
  }
}

// Function to wipe all data completely for a clean slate
export async function clearAllDatabaseData(): Promise<void> {
  const collections = ['clientes', 'mascotas', 'servicios', 'turnos', 'productos', 'gastos'];
  const userId = auth.currentUser?.uid;

  // Clear local storage keys
  for (const collName of collections) {
    const storageKey = userId ? `${userId}_${collName}` : collName;
    localStorage.removeItem(getStorageKey(storageKey));
    localStorage.removeItem(getStorageKey(collName));
    localStorage.removeItem(`caningroom_${storageKey}`);
    localStorage.removeItem(`caningroom_${collName}`);

    // Try deleting Firestore docs in background
    try {
      const collRef = getUserCollectionRef(collName);
      const snap = await withTimeout<any>(getDocs(collRef), 2000);
      if (snap && snap.docs) {
        for (const docSnap of snap.docs) {
          deleteDoc(docSnap.ref).catch(() => {});
        }
      }
    } catch (e) {
      console.warn(`Error clearing Firestore collection ${collName}`, e);
    }
  }
}

async function saveFirestoreDocument<T extends { id: string }>(collName: string, item: T): Promise<void> {
  withTimeout(setDoc(getUserDocRef(collName, item.id), item), 2500).catch(err => {
    console.warn(`Cloud sync for ${collName} deferred or offline:`, err);
  });
}

async function deleteFirestoreDocument(collName: string, id: string): Promise<void> {
  withTimeout(deleteDoc(getUserDocRef(collName, id)), 2500).catch(err => {
    console.warn(`Cloud delete for ${collName} deferred or offline:`, err);
  });
}

// CLIENTES API
export async function fetchClientes(): Promise<Cliente[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await withTimeout<any>(sb.from('clientes').select('*').order('nombre'), 2000);
      if (!error && data && data.length > 0) return data as Cliente[];
    } catch (err) {
      console.warn('Supabase fetch clientes failed, using Firestore/local', err);
    }
  }
  return await fetchFirestoreCollection<Cliente>('clientes', INITIAL_CLIENTES);
}

export async function saveCliente(cliente: Omit<Cliente, 'id' | 'created_at'> & { id?: string }): Promise<Cliente> {
  const id = cliente.id || `cli-${Date.now()}`;
  const newCliente: Cliente = {
    id,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    direccion: cliente.direccion || '',
    email: cliente.email || '',
    notas: cliente.notas || '',
    created_at: new Date().toISOString(),
  };

  // 1. Immediately update local storage for 100% offline reliability
  const clientes = getStorage<Cliente[]>('clientes', INITIAL_CLIENTES);
  const index = clientes.findIndex(c => c.id === id);
  if (index >= 0) clientes[index] = newCliente;
  else clientes.push(newCliente);
  setStorage('clientes', clientes);

  // 2. Non-blocking cloud syncs
  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(
      cliente.id ? sb.from('clientes').update(newCliente).eq('id', id) : sb.from('clientes').insert(newCliente),
      2500
    ).catch(err => console.warn('Supabase save cliente deferred/offline', err));
  }
  saveFirestoreDocument('clientes', newCliente);

  return newCliente;
}

export async function deleteCliente(id: string): Promise<void> {
  const clientes = getStorage<Cliente[]>('clientes', INITIAL_CLIENTES).filter(c => c.id !== id);
  setStorage('clientes', clientes);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('clientes').delete().eq('id', id), 2500).catch(e => console.warn('Supabase delete client failed', e));
  }
  deleteFirestoreDocument('clientes', id);
}

// MASCOTAS API
export async function fetchMascotas(): Promise<Mascota[]> {
  const clientes = await fetchClientes();
  const sb = getSupabaseInstance();
  let rawMascotas: Mascota[] = [];

  if (sb) {
    try {
      const { data, error } = await withTimeout<any>(sb.from('mascotas').select('*').order('nombre'), 2000);
      if (!error && data && data.length > 0) rawMascotas = data as Mascota[];
      else rawMascotas = await fetchFirestoreCollection<Mascota>('mascotas', INITIAL_MASCOTAS);
    } catch (err) {
      rawMascotas = await fetchFirestoreCollection<Mascota>('mascotas', INITIAL_MASCOTAS);
    }
  } else {
    rawMascotas = await fetchFirestoreCollection<Mascota>('mascotas', INITIAL_MASCOTAS);
  }

  return rawMascotas.map(m => ({
    ...m,
    cliente: clientes.find(c => c.id === m.cliente_id),
  }));
}

export async function saveMascota(mascota: Omit<Mascota, 'id' | 'created_at'> & { id?: string }): Promise<Mascota> {
  const id = mascota.id || `mas-${Date.now()}`;
  const newMascota: Mascota = {
    ...mascota,
    id,
    created_at: new Date().toISOString(),
  };

  // 1. Immediately update local storage so pet card is saved 100% reliably
  const mascotas = getStorage<Mascota[]>('mascotas', INITIAL_MASCOTAS);
  const index = mascotas.findIndex(m => m.id === id);
  if (index >= 0) mascotas[index] = newMascota;
  else mascotas.push(newMascota);
  setStorage('mascotas', mascotas);

  // 2. Non-blocking cloud syncs
  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(
      mascota.id ? sb.from('mascotas').update(newMascota).eq('id', id) : sb.from('mascotas').insert(newMascota),
      2500
    ).catch(err => console.warn('Supabase save mascota error/offline', err));
  }
  saveFirestoreDocument('mascotas', newMascota);

  // Read client from local storage cache for instant response
  const clientes = getStorage<Cliente[]>('clientes', INITIAL_CLIENTES);
  return {
    ...newMascota,
    cliente: clientes.find(c => c.id === newMascota.cliente_id),
  };
}

export async function deleteMascota(id: string): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('mascotas').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete mascota error', e);
    }
  }
  await deleteFirestoreDocument('mascotas', id);
  const mascotas = getStorage<Mascota[]>('mascotas', INITIAL_MASCOTAS).filter(m => m.id !== id);
  setStorage('mascotas', mascotas);
}

// SERVICIOS API
export async function fetchServicios(): Promise<Servicio[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await sb.from('servicios').select('*').order('nombre');
      if (!error && data && data.length > 0) return data as Servicio[];
    } catch (err) {
      console.warn('Supabase fetch servicios failed', err);
    }
  }
  return await fetchFirestoreCollection<Servicio>('servicios', INITIAL_SERVICIOS);
}

export async function saveServicio(servicio: Omit<Servicio, 'id'> & { id?: string }): Promise<Servicio> {
  const id = servicio.id || `srv-${Date.now()}`;
  const newServicio: Servicio = { ...servicio, id };

  const servicios = getStorage<Servicio[]>('servicios', INITIAL_SERVICIOS);
  const index = servicios.findIndex(s => s.id === id);
  if (index >= 0) servicios[index] = newServicio;
  else servicios.push(newServicio);
  setStorage('servicios', servicios);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(
      servicio.id ? sb.from('servicios').update(newServicio).eq('id', id) : sb.from('servicios').insert(newServicio),
      2500
    ).catch(err => console.warn('Supabase save servicio failed', err));
  }
  saveFirestoreDocument('servicios', newServicio);

  return newServicio;
}

export async function deleteServicio(id: string): Promise<void> {
  const servicios = getStorage<Servicio[]>('servicios', INITIAL_SERVICIOS).filter(s => s.id !== id);
  setStorage('servicios', servicios);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('servicios').delete().eq('id', id), 2500).catch(e => console.warn('Supabase delete servicio error', e));
  }
  deleteFirestoreDocument('servicios', id);
}

// TURNOS API
export async function fetchTurnos(): Promise<Turno[]> {
  const clientes = await fetchClientes();
  const mascotas = await fetchMascotas();
  const servicios = await fetchServicios();

  const sb = getSupabaseInstance();
  let rawTurnos: Turno[] = [];

  if (sb) {
    try {
      const { data, error } = await withTimeout<any>(sb.from('turnos').select('*').order('fecha_hora', { ascending: true }), 2000);
      if (!error && data && data.length > 0) rawTurnos = data as Turno[];
      else rawTurnos = await fetchFirestoreCollection<Turno>('turnos', INITIAL_TURNOS);
    } catch (err) {
      rawTurnos = await fetchFirestoreCollection<Turno>('turnos', INITIAL_TURNOS);
    }
  } else {
    rawTurnos = await fetchFirestoreCollection<Turno>('turnos', INITIAL_TURNOS);
  }

  return rawTurnos.map(t => {
    const mascota = mascotas.find(m => m.id === t.mascota_id);
    const cliente = clientes.find(c => c.id === (t.cliente_id || mascota?.cliente_id));
    const servicio = servicios.find(s => s.id === t.servicio_id);
    return {
      ...t,
      mascota,
      cliente,
      servicio,
    };
  });
}

export async function saveTurno(turno: Omit<Turno, 'id' | 'created_at'> & { id?: string }): Promise<Turno> {
  const id = turno.id || `tur-${Date.now()}`;
  const newTurno: Turno = {
    id,
    mascota_id: turno.mascota_id,
    cliente_id: turno.cliente_id,
    servicio_id: turno.servicio_id,
    fecha_hora: turno.fecha_hora,
    estado: turno.estado,
    notas: turno.notas || '',
    precio_cobrado: turno.precio_cobrado,
    productos_usados_ids: turno.productos_usados_ids || [],
    created_at: new Date().toISOString(),
  };

  const turnos = getStorage<Turno[]>('turnos', INITIAL_TURNOS);
  const index = turnos.findIndex(t => t.id === id);
  if (index >= 0) turnos[index] = newTurno;
  else turnos.push(newTurno);
  setStorage('turnos', turnos);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(
      turno.id ? sb.from('turnos').update(newTurno).eq('id', id) : sb.from('turnos').insert(newTurno),
      2500
    ).catch(err => console.warn('Supabase save turno failed', err));
  }
  saveFirestoreDocument('turnos', newTurno);

  const mascotas = getStorage<Mascota[]>('mascotas', INITIAL_MASCOTAS);
  const clientes = getStorage<Cliente[]>('clientes', INITIAL_CLIENTES);
  const servicios = getStorage<Servicio[]>('servicios', INITIAL_SERVICIOS);
  const mascota = mascotas.find(m => m.id === newTurno.mascota_id);
  return {
    ...newTurno,
    mascota,
    cliente: clientes.find(c => c.id === (newTurno.cliente_id || mascota?.cliente_id)),
    servicio: servicios.find(s => s.id === newTurno.servicio_id),
  };
}

export async function updateTurnoEstado(id: string, estado: Turno['estado']): Promise<void> {
  const turnos = getStorage<Turno[]>('turnos', INITIAL_TURNOS);
  const index = turnos.findIndex(t => t.id === id);
  if (index >= 0) {
    turnos[index].estado = estado;
    setStorage('turnos', turnos);
    saveFirestoreDocument('turnos', turnos[index]);
  }

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('turnos').update({ estado }).eq('id', id), 2500).catch(e => console.warn('Supabase update status failed', e));
  }
}

export async function deleteTurno(id: string): Promise<void> {
  const turnos = getStorage<Turno[]>('turnos', INITIAL_TURNOS).filter(t => t.id !== id);
  setStorage('turnos', turnos);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('turnos').delete().eq('id', id), 2500).catch(e => console.warn('Supabase delete turno error', e));
  }
  deleteFirestoreDocument('turnos', id);
}

// PRODUCTOS / STOCK API
export async function fetchProductos(): Promise<Producto[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await withTimeout<any>(sb.from('productos').select('*').order('nombre'), 2000);
      if (!error && data && data.length > 0) return data as Producto[];
    } catch (err) {
      console.warn('Supabase fetch productos failed', err);
    }
  }
  return await fetchFirestoreCollection<Producto>('productos', INITIAL_PRODUCTOS);
}

export async function saveProducto(producto: Omit<Producto, 'id'> & { id?: string }): Promise<Producto> {
  const id = producto.id || `prod-${Date.now()}`;
  const newProducto: Producto = { ...producto, id };

  const productos = getStorage<Producto[]>('productos', INITIAL_PRODUCTOS);
  const index = productos.findIndex(p => p.id === id);
  if (index >= 0) productos[index] = newProducto;
  else productos.push(newProducto);
  setStorage('productos', productos);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(
      producto.id ? sb.from('productos').update(newProducto).eq('id', id) : sb.from('productos').insert(newProducto),
      2500
    ).catch(err => console.warn('Supabase save producto failed', err));
  }
  saveFirestoreDocument('productos', newProducto);

  return newProducto;
}

export async function deleteProducto(id: string): Promise<void> {
  const productos = getStorage<Producto[]>('productos', INITIAL_PRODUCTOS).filter(p => p.id !== id);
  setStorage('productos', productos);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('productos').delete().eq('id', id), 2500).catch(e => console.warn('Supabase delete producto error', e));
  }
  deleteFirestoreDocument('productos', id);
}

// GASTOS API
export async function fetchGastos(): Promise<Gasto[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await withTimeout<any>(sb.from('gastos').select('*').order('fecha', { ascending: false }), 2000);
      if (!error && data && data.length > 0) return data as Gasto[];
    } catch (err) {
      console.warn('Supabase fetch gastos failed', err);
    }
  }
  return await fetchFirestoreCollection<Gasto>('gastos', INITIAL_GASTOS);
}

export async function saveGasto(gasto: Omit<Gasto, 'id'> & { id?: string }): Promise<Gasto> {
  const id = gasto.id || `gas-${Date.now()}`;
  const newGasto: Gasto = { ...gasto, id };

  const gastos = getStorage<Gasto[]>('gastos', INITIAL_GASTOS);
  const index = gastos.findIndex(g => g.id === id);
  if (index >= 0) gastos[index] = newGasto;
  else gastos.push(newGasto);
  setStorage('gastos', gastos);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(
      gasto.id ? sb.from('gastos').update(newGasto).eq('id', id) : sb.from('gastos').insert(newGasto),
      2500
    ).catch(err => console.warn('Supabase save gasto failed', err));
  }
  saveFirestoreDocument('gastos', newGasto);

  return newGasto;
}

export async function deleteGasto(id: string): Promise<void> {
  const gastos = getStorage<Gasto[]>('gastos', INITIAL_GASTOS).filter(g => g.id !== id);
  setStorage('gastos', gastos);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('gastos').delete().eq('id', id), 2500).catch(e => console.warn('Supabase delete gasto error', e));
  }
  deleteFirestoreDocument('gastos', id);
}

// HORARIOS DISPONIBILIDAD API
export async function fetchHorarios(): Promise<HorarioDisponibilidad[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await sb.from('horarios_disponibilidad').select('*').order('dia_semana');
      if (!error && data && data.length > 0) return data as HorarioDisponibilidad[];
    } catch (err) {
      console.warn('Supabase fetch horarios failed', err);
    }
  }
  return await fetchFirestoreCollection<HorarioDisponibilidad>('horarios', INITIAL_HORARIOS);
}

export async function saveHorarios(horarios: HorarioDisponibilidad[]): Promise<void> {
  setStorage('horarios', horarios);

  const sb = getSupabaseInstance();
  if (sb) {
    withTimeout(sb.from('horarios_disponibilidad').upsert(horarios), 2500).catch(e => console.warn('Supabase save horarios failed', e));
  }
  for (const h of horarios) {
    saveFirestoreDocument('horarios', h);
  }
}

// PERFIL PELUQUERÍA API
export const INITIAL_PERFIL: PerfilPeluqueria = {
  id: 'perfil-main',
  nombre_peluqueria: 'CaninGroom Pro',
  slogan: 'Estética & Estilo Canino de Alta Calidad',
  logo_url: '',
  telefono_whatsapp: '+54 9 11 5544-3322',
  direccion: 'Av. Corrientes 3420, CABA',
  email_contacto: 'contacto@peluqueriacanina.com',
  instagram: '@peluqueriacanina_pro',
  facebook: 'PeluqueriaCaninaPro',
  horario_atencion: 'Lunes a Sábados: 09:00 - 18:30 hs',
  mensaje_ticket: '¡Gracias por confiar el cuidado de tu mascota en nosotros! 🐾✂️',
  moneda: '$',
};

export async function fetchPerfilPeluqueria(): Promise<PerfilPeluqueria> {
  const perfList = await fetchFirestoreCollection<PerfilPeluqueria>('perfil', [INITIAL_PERFIL]);
  return perfList[0] || INITIAL_PERFIL;
}

export async function savePerfilPeluqueria(perfil: PerfilPeluqueria): Promise<PerfilPeluqueria> {
  const perfilToSave = { ...perfil, id: 'perfil-main' };
  setStorage('perfil', [perfilToSave]);
  saveFirestoreDocument('perfil', perfilToSave);
  return perfilToSave;
}

// Backup JSON Export / Import
export async function exportFullDataJSON() {
  const perfil = await fetchPerfilPeluqueria();
  const clientes = await fetchClientes();
  const mascotas = await fetchMascotas();
  const servicios = await fetchServicios();
  const turnos = await fetchTurnos();
  const productos = await fetchProductos();
  const gastos = await fetchGastos();
  const horarios = await fetchHorarios();

  return JSON.stringify(
    {
      version: 'caningroom-1.0',
      exported_at: new Date().toISOString(),
      perfil,
      clientes,
      mascotas,
      servicios,
      turnos,
      productos,
      gastos,
      horarios,
    },
    null,
    2
  );
}

