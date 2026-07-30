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

// Initial sample data for Peluquería Canina
const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Carolina Méndez',
    telefono: '+54 9 11 5544-3322',
    direccion: 'Av. Corrientes 3420, Depto 4B, CABA',
    email: 'carolina.mendez@gmail.com',
    notas: 'Puntual. Le gusta que le dejen moño rojo a Lola.',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'cli-2',
    nombre: 'Gonzalo Fernández',
    telefono: '+54 9 11 4411-8899',
    direccion: 'Calle Laprida 1280, San Isidro',
    email: 'gfernandez@hotmail.com',
    notas: 'Solicita retiro y entrega a domicilio si es posible.',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'cli-3',
    nombre: 'Valeria Rossi',
    telefono: '+54 9 11 6677-2211',
    direccion: 'Av. Libertador 4500, Belgrano',
    email: 'vrossi@empresa.com',
    notas: 'Suele traer a sus 2 caniches juntos.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_MASCOTAS: Mascota[] = [
  {
    id: 'mas-1',
    cliente_id: 'cli-1',
    nombre: 'Lola',
    foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300',
    raza: 'Caniche Toy',
    tamano: 'Pequeño',
    peso_kg: 3.8,
    color_pelo: 'Blanco / Crema',
    cumpleanos: '2022-04-12',
    vacunas_al_dia: true,
    fecha_ultima_vacunacion: '2025-10-15',
    vacunas_detalle: 'Antirrábica y Séxtuple al día (Vence 10/2026)',
    usa_bozal: false,
    transporte_llegada: 'Caminando',
    alergias_afecciones: 'Piel sensible en lomo. Usar shampoo hipoalergénico de avena.',
    comportamiento: 'Muy mansa y alegre. Le asusta un poco el secador de aire fuerte.',
    productos_favoritos: 'Shampoo Hipoalergénico Avena, Acondicionador Desenredante',
    observaciones: 'Corte de tijera en carita acorazonada, corte higiénico suave.',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'mas-2',
    cliente_id: 'cli-2',
    nombre: 'Thor',
    foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300',
    raza: 'Golden Retriever',
    tamano: 'Grande',
    peso_kg: 32.5,
    color_pelo: 'Dorado Intenso',
    cumpleanos: '2020-09-05',
    vacunas_al_dia: true,
    fecha_ultima_vacunacion: '2025-11-20',
    vacunas_detalle: 'Sextuple, Antirrábica y Tos de las Perreras al día',
    usa_bozal: false,
    transporte_llegada: 'En vehículo',
    alergias_afecciones: 'Sensibilidad en oídos (tendencia a otitis). Secar muy bien canal auditivo.',
    comportamiento: 'Súper amigable, le encanta el agua y los mimos.',
    productos_favoritos: 'Shampoo Deslanador Profundo, Perfume Canino Coco',
    observaciones: 'Deslanado intenso con furminator + baño térmico. No cortar manto.',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'mas-3',
    cliente_id: 'cli-3',
    nombre: 'Rocky',
    foto_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300',
    raza: 'Schnauzer Mini',
    tamano: 'Pequeño',
    peso_kg: 7.2,
    color_pelo: 'Sal y Pimienta',
    cumpleanos: '2021-11-20',
    vacunas_al_dia: true,
    fecha_ultima_vacunacion: '2025-08-05',
    vacunas_detalle: 'Antirrábica al día',
    usa_bozal: true,
    bozal_notas: 'Para secado y corte de uñas si se estresa',
    transporte_llegada: 'En vehículo',
    alergias_afecciones: 'Ligera dermatitis en patas traseras.',
    comportamiento: 'Guau inquieto, poner bozal suave para corte de uñas si se estresa.',
    productos_favoritos: 'Shampoo Nutritivo Pelos Oscuros, Jabón Antiséptico Patas',
    observaciones: 'Corte estilo raza Schnauzer (faldón, cejas y barba definidas).',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_SERVICIOS: Servicio[] = [
  {
    id: 'srv-1',
    nombre: 'Corte Completo & Baño Comercial',
    descripcion: 'Corte de pelo a máquina/tijera según raza, baño profundo, secado, limpieza de oídos, corte de uñas y perfume.',
    duracion_min: 90,
    precio: 22000,
    tamano_aplicable: 'Pequeño',
    categoria: 'Corte & Estética',
    activo: true,
  },
  {
    id: 'srv-2',
    nombre: 'Baño & Deslanado Profundo (Perro Grande)',
    descripcion: 'Baño para mantos dobles (Golden, Ovejero, Husky), cepillado técnico deslanador, secado expulsador, oídos y uñas.',
    duracion_min: 120,
    precio: 35000,
    tamano_aplicable: 'Grande',
    categoria: 'Baño & Manto',
    activo: true,
  },
  {
    id: 'srv-3',
    nombre: 'Mantenimiento Higiénico & Uñas',
    descripcion: 'Corte higiénico (plantales, zona genital y vientre), vaciado de glándulas si requiere, limado de uñas y oídos.',
    duracion_min: 45,
    precio: 14000,
    tamano_aplicable: 'Todos',
    categoria: 'Higiene Básica',
    activo: true,
  },
  {
    id: 'srv-4',
    nombre: 'Baño Medicinal / Dermoprotector',
    descripcion: 'Baño especial con shampoo antiséptico o de avena con tiempo de reposo de 10 min para pieles sensibles o atópicas.',
    duracion_min: 60,
    precio: 25000,
    tamano_aplicable: 'Todos',
    categoria: 'Tratamientos Especiales',
    activo: true,
  },
];

const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: 'prod-1',
    nombre: 'Shampoo Hipoalergénico Avena Orgánica (5 Litros)',
    categoria: 'Shampoos',
    stock_actual: 4,
    stock_minimo: 2,
    precio_costo: 18500,
    precio_venta: 28000,
    unidad: 'Bidones 5L',
  },
  {
    id: 'prod-2',
    nombre: 'Acondicionador Desenredante Keratina Pro (1 Litro)',
    categoria: 'Acondicionadores',
    stock_actual: 8,
    stock_minimo: 3,
    precio_costo: 8200,
    precio_venta: 14000,
    unidad: 'Botellas 1L',
  },
  {
    id: 'prod-3',
    nombre: 'Perfume Canino Brisa Silvestre (250ml)',
    categoria: 'Accesorios & Estética',
    stock_actual: 15,
    stock_minimo: 5,
    precio_costo: 3500,
    precio_venta: 6500,
    unidad: 'Frascos',
  },
  {
    id: 'prod-4',
    nombre: 'Pipeta Antipulgas & Garrapatas Perro Pequeño',
    categoria: 'Salud & Antiparasitarios',
    stock_actual: 22,
    stock_minimo: 8,
    precio_costo: 4200,
    precio_venta: 7800,
    unidad: 'Pipetas',
  },
  {
    id: 'prod-5',
    nombre: 'Moños y Corbatas de Seda (Pack x50 u.)',
    categoria: 'Accesorios & Estética',
    stock_actual: 3,
    stock_minimo: 2,
    precio_costo: 4500,
    precio_venta: 9000,
    unidad: 'Packs',
  },
];

const INITIAL_GASTOS: Gasto[] = [
  {
    id: 'gas-1',
    fecha: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    descripcion: 'Compra reposición de Shampoos y Acondicionadores',
    categoria: 'Insumos',
    monto: 54000,
  },
  {
    id: 'gas-2',
    fecha: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    descripcion: 'Afilado técnico de cuchillas N10 y tijeras rectas',
    categoria: 'Mantenimiento Equipos',
    monto: 16500,
  },
  {
    id: 'gas-3',
    fecha: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    descripcion: 'Servicio de Luz y Agua del salón',
    categoria: 'Servicios & Alquiler',
    monto: 42000,
  },
];

const INITIAL_HORARIOS: HorarioDisponibilidad[] = [
  { id: 'h-1', dia_semana: 1, dia_nombre: 'Lunes', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-2', dia_semana: 2, dia_nombre: 'Martes', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-3', dia_semana: 3, dia_nombre: 'Miércoles', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-4', dia_semana: 4, dia_nombre: 'Jueves', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-5', dia_semana: 5, dia_nombre: 'Viernes', hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h-6', dia_semana: 6, dia_nombre: 'Sábado', hora_inicio: '09:00', hora_fin: '15:00', activo: true },
  { id: 'h-0', dia_semana: 0, dia_nombre: 'Domingo', hora_inicio: '10:00', hora_fin: '14:00', activo: false },
];

const today = new Date();
const formatIso = (offsetDays: number, hour: number, min: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

const INITIAL_TURNOS: Turno[] = [
  {
    id: 'tur-1',
    mascota_id: 'mas-1',
    cliente_id: 'cli-1',
    servicio_id: 'srv-1',
    fecha_hora: formatIso(0, 10, 0), // Today 10:00 AM
    estado: 'confirmado',
    notas: 'Pedir moño rosa. Usar shampoo de avena en Lola.',
    precio_cobrado: 22000,
    productos_usados_ids: ['prod-1', 'prod-3'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'tur-2',
    mascota_id: 'mas-2',
    cliente_id: 'cli-2',
    servicio_id: 'srv-2',
    fecha_hora: formatIso(0, 15, 0), // Today 15:00
    estado: 'pendiente',
    notas: 'Cuidar oídos durante secado de Thor.',
    precio_cobrado: 35000,
    productos_usados_ids: ['prod-2', 'prod-3'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'tur-3',
    mascota_id: 'mas-3',
    cliente_id: 'cli-3',
    servicio_id: 'srv-1',
    fecha_hora: formatIso(1, 11, 30), // Tomorrow 11:30 AM
    estado: 'confirmado',
    notas: 'Corte típico Schnauzer.',
    precio_cobrado: 22000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tur-4',
    mascota_id: 'mas-1',
    cliente_id: 'cli-1',
    servicio_id: 'srv-3',
    fecha_hora: formatIso(-3, 11, 0), // 3 days ago
    estado: 'completado',
    notas: 'Mantenimiento higiénico rápido sin complicaciones.',
    precio_cobrado: 14000,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

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

// Local Storage helpers
const getStorageKey = (key: string) => {
  const uid = auth.currentUser?.uid;
  return uid ? `caningroom_${uid}_${key}` : `caningroom_${key}`;
};

const getStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(getStorageKey(key));
    return item ? JSON.parse(item) : fallback;
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

// Firestore Helper Functions for automatic cloud persistence & local fallback
async function fetchFirestoreCollection<T extends { id: string }>(collName: string, initialData: T[]): Promise<T[]> {
  try {
    const collRef = getUserCollectionRef(collName);
    const snap = await getDocs(collRef);
    const storageKey = auth.currentUser?.uid ? `${auth.currentUser.uid}_${collName}` : collName;
    if (!snap.empty) {
      const items: T[] = [];
      snap.forEach(d => items.push(d.data() as T));
      setStorage(storageKey, items);
      return items;
    } else {
      // Seed Firestore with initial sample data so new database isn't blank
      for (const item of initialData) {
        await setDoc(getUserDocRef(collName, item.id), item);
      }
      setStorage(storageKey, initialData);
      return initialData;
    }
  } catch (err) {
    console.warn(`Firestore collection ${collName} fetch failed, using local storage fallback:`, err);
    const storageKey = auth.currentUser?.uid ? `${auth.currentUser.uid}_${collName}` : collName;
    return getStorage<T[]>(storageKey, initialData);
  }
}

async function saveFirestoreDocument<T extends { id: string }>(collName: string, item: T): Promise<void> {
  try {
    await setDoc(getUserDocRef(collName, item.id), item);
  } catch (err) {
    console.warn(`Firestore save to ${collName} failed, fallback to local:`, err);
  }
}

async function deleteFirestoreDocument(collName: string, id: string): Promise<void> {
  try {
    await deleteDoc(getUserDocRef(collName, id));
  } catch (err) {
    console.warn(`Firestore delete from ${collName} failed:`, err);
  }
}

// CLIENTES API
export async function fetchClientes(): Promise<Cliente[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await sb.from('clientes').select('*').order('nombre');
      if (!error && data && data.length > 0) return data as Cliente[];
    } catch (err) {
      console.warn('Supabase fetch clientes failed, using Firestore/local', err);
    }
  }
  return await fetchFirestoreCollection<Cliente>('clientes', INITIAL_CLIENTES);
}

export async function saveCliente(cliente: Omit<Cliente, 'id' | 'created_at'> & { id?: string }): Promise<Cliente> {
  const sb = getSupabaseInstance();
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

  if (sb) {
    try {
      if (cliente.id) {
        await sb.from('clientes').update(newCliente).eq('id', cliente.id);
      } else {
        await sb.from('clientes').insert(newCliente);
      }
    } catch (err) {
      console.warn('Supabase save cliente failed', err);
    }
  }

  await saveFirestoreDocument('clientes', newCliente);

  const clientes = getStorage<Cliente[]>('clientes', INITIAL_CLIENTES);
  const index = clientes.findIndex(c => c.id === id);
  if (index >= 0) clientes[index] = newCliente;
  else clientes.push(newCliente);
  setStorage('clientes', clientes);
  return newCliente;
}

export async function deleteCliente(id: string): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('clientes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete client failed', e);
    }
  }
  await deleteFirestoreDocument('clientes', id);
  const clientes = getStorage<Cliente[]>('clientes', INITIAL_CLIENTES).filter(c => c.id !== id);
  setStorage('clientes', clientes);
}

// MASCOTAS API
export async function fetchMascotas(): Promise<Mascota[]> {
  const clientes = await fetchClientes();
  const sb = getSupabaseInstance();
  let rawMascotas: Mascota[] = [];

  if (sb) {
    try {
      const { data, error } = await sb.from('mascotas').select('*').order('nombre');
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
  const sb = getSupabaseInstance();
  const id = mascota.id || `mas-${Date.now()}`;
  const newMascota: Mascota = {
    ...mascota,
    id,
    created_at: new Date().toISOString(),
  };

  if (sb) {
    try {
      if (mascota.id) {
        await sb.from('mascotas').update(newMascota).eq('id', id);
      } else {
        await sb.from('mascotas').insert(newMascota);
      }
    } catch (err) {
      console.warn('Supabase save mascota error', err);
    }
  }

  await saveFirestoreDocument('mascotas', newMascota);

  const mascotas = getStorage<Mascota[]>('mascotas', INITIAL_MASCOTAS);
  const index = mascotas.findIndex(m => m.id === id);
  if (index >= 0) mascotas[index] = newMascota;
  else mascotas.push(newMascota);
  setStorage('mascotas', mascotas);

  const clientes = await fetchClientes();
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
  const sb = getSupabaseInstance();
  const id = servicio.id || `srv-${Date.now()}`;
  const newServicio: Servicio = { ...servicio, id };

  if (sb) {
    try {
      if (servicio.id) {
        await sb.from('servicios').update(newServicio).eq('id', id);
      } else {
        await sb.from('servicios').insert(newServicio);
      }
    } catch (err) {
      console.warn('Supabase save servicio failed', err);
    }
  }

  await saveFirestoreDocument('servicios', newServicio);

  const servicios = getStorage<Servicio[]>('servicios', INITIAL_SERVICIOS);
  const index = servicios.findIndex(s => s.id === id);
  if (index >= 0) servicios[index] = newServicio;
  else servicios.push(newServicio);
  setStorage('servicios', servicios);
  return newServicio;
}

export async function deleteServicio(id: string): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('servicios').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete servicio error', e);
    }
  }
  await deleteFirestoreDocument('servicios', id);
  const servicios = getStorage<Servicio[]>('servicios', INITIAL_SERVICIOS).filter(s => s.id !== id);
  setStorage('servicios', servicios);
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
      const { data, error } = await sb.from('turnos').select('*').order('fecha_hora', { ascending: true });
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
  const sb = getSupabaseInstance();
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

  if (sb) {
    try {
      if (turno.id) {
        await sb.from('turnos').update(newTurno).eq('id', id);
      } else {
        await sb.from('turnos').insert(newTurno);
      }
    } catch (err) {
      console.warn('Supabase save turno failed', err);
    }
  }

  await saveFirestoreDocument('turnos', newTurno);

  const turnos = getStorage<Turno[]>('turnos', INITIAL_TURNOS);
  const index = turnos.findIndex(t => t.id === id);
  if (index >= 0) turnos[index] = newTurno;
  else turnos.push(newTurno);
  setStorage('turnos', turnos);

  const mascotas = await fetchMascotas();
  const clientes = await fetchClientes();
  const servicios = await fetchServicios();
  const mascota = mascotas.find(m => m.id === newTurno.mascota_id);
  return {
    ...newTurno,
    mascota,
    cliente: clientes.find(c => c.id === (newTurno.cliente_id || mascota?.cliente_id)),
    servicio: servicios.find(s => s.id === newTurno.servicio_id),
  };
}

export async function updateTurnoEstado(id: string, estado: Turno['estado']): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('turnos').update({ estado }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update status failed', e);
    }
  }

  const turnos = getStorage<Turno[]>('turnos', INITIAL_TURNOS);
  const index = turnos.findIndex(t => t.id === id);
  if (index >= 0) {
    turnos[index].estado = estado;
    await saveFirestoreDocument('turnos', turnos[index]);
    setStorage('turnos', turnos);
  }
}

export async function deleteTurno(id: string): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('turnos').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete turno error', e);
    }
  }
  await deleteFirestoreDocument('turnos', id);
  const turnos = getStorage<Turno[]>('turnos', INITIAL_TURNOS).filter(t => t.id !== id);
  setStorage('turnos', turnos);
}

// PRODUCTOS / STOCK API
export async function fetchProductos(): Promise<Producto[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await sb.from('productos').select('*').order('nombre');
      if (!error && data && data.length > 0) return data as Producto[];
    } catch (err) {
      console.warn('Supabase fetch productos failed', err);
    }
  }
  return await fetchFirestoreCollection<Producto>('productos', INITIAL_PRODUCTOS);
}

export async function saveProducto(producto: Omit<Producto, 'id'> & { id?: string }): Promise<Producto> {
  const sb = getSupabaseInstance();
  const id = producto.id || `prod-${Date.now()}`;
  const newProducto: Producto = { ...producto, id };

  if (sb) {
    try {
      if (producto.id) {
        await sb.from('productos').update(newProducto).eq('id', id);
      } else {
        await sb.from('productos').insert(newProducto);
      }
    } catch (err) {
      console.warn('Supabase save producto failed', err);
    }
  }

  await saveFirestoreDocument('productos', newProducto);

  const productos = getStorage<Producto[]>('productos', INITIAL_PRODUCTOS);
  const index = productos.findIndex(p => p.id === id);
  if (index >= 0) productos[index] = newProducto;
  else productos.push(newProducto);
  setStorage('productos', productos);
  return newProducto;
}

export async function deleteProducto(id: string): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('productos').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete producto error', e);
    }
  }
  await deleteFirestoreDocument('productos', id);
  const productos = getStorage<Producto[]>('productos', INITIAL_PRODUCTOS).filter(p => p.id !== id);
  setStorage('productos', productos);
}

// GASTOS API
export async function fetchGastos(): Promise<Gasto[]> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      const { data, error } = await sb.from('gastos').select('*').order('fecha', { ascending: false });
      if (!error && data && data.length > 0) return data as Gasto[];
    } catch (err) {
      console.warn('Supabase fetch gastos failed', err);
    }
  }
  return await fetchFirestoreCollection<Gasto>('gastos', INITIAL_GASTOS);
}

export async function saveGasto(gasto: Omit<Gasto, 'id'> & { id?: string }): Promise<Gasto> {
  const sb = getSupabaseInstance();
  const id = gasto.id || `gas-${Date.now()}`;
  const newGasto: Gasto = { ...gasto, id };

  if (sb) {
    try {
      if (gasto.id) {
        await sb.from('gastos').update(newGasto).eq('id', id);
      } else {
        await sb.from('gastos').insert(newGasto);
      }
    } catch (err) {
      console.warn('Supabase save gasto failed', err);
    }
  }

  await saveFirestoreDocument('gastos', newGasto);

  const gastos = getStorage<Gasto[]>('gastos', INITIAL_GASTOS);
  const index = gastos.findIndex(g => g.id === id);
  if (index >= 0) gastos[index] = newGasto;
  else gastos.push(newGasto);
  setStorage('gastos', gastos);
  return newGasto;
}

export async function deleteGasto(id: string): Promise<void> {
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('gastos').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete gasto error', e);
    }
  }
  await deleteFirestoreDocument('gastos', id);
  const gastos = getStorage<Gasto[]>('gastos', INITIAL_GASTOS).filter(g => g.id !== id);
  setStorage('gastos', gastos);
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
  const sb = getSupabaseInstance();
  if (sb) {
    try {
      await sb.from('horarios_disponibilidad').upsert(horarios);
    } catch (e) {
      console.warn('Supabase save horarios failed', e);
    }
  }
  for (const h of horarios) {
    await saveFirestoreDocument('horarios', h);
  }
  setStorage('horarios', horarios);
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
  await saveFirestoreDocument('perfil', perfilToSave);
  setStorage('perfil', [perfilToSave]);
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

