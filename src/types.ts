export type TurnoEstado = 'pendiente' | 'confirmado' | 'en_proceso' | 'completado' | 'cancelado';

export type TamanoMascota = 'Pequeño' | 'Mediano' | 'Grande' | 'Gigante';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  email?: string;
  notas?: string;
  created_at: string;
}

export interface Mascota {
  id: string;
  cliente_id: string;
  nombre: string;
  foto_url?: string;
  raza: string;
  tamano: TamanoMascota;
  peso_kg: number;
  color_pelo: string;
  cumpleanos?: string; // YYYY-MM-DD or text
  vacunas_al_dia: boolean;
  fecha_ultima_vacunacion?: string; // YYYY-MM-DD
  vacunas_detalle?: string;
  usa_bozal: boolean; // Si usa bozal o no
  bozal_notas?: string; // Ej: "Solo si se estresa al secar"
  transporte_llegada: 'Caminando' | 'En vehículo' | 'Retiro a domicilio'; // Si viene caminando o en vehículo
  alergias_afecciones?: string; // Skin conditions, allergies, ear issues
  comportamiento?: string; // Behaviors: calm, bites, nervous, friendly
  productos_favoritos?: string; // Shampoo, special conditioner, etc.
  observaciones?: string;
  created_at: string;

  // Joined field
  cliente?: Cliente;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  duracion_min: number;
  precio: number;
  tamano_aplicable?: string; // 'Todos' | 'Pequeño' | 'Mediano' | etc.
  categoria: string; // 'Corte', 'Baño', 'Higiene', 'Especial'
  activo: boolean;
}

export interface Turno {
  id: string;
  mascota_id: string;
  cliente_id: string;
  servicio_id: string;
  fecha_hora: string; // ISO string
  estado: TurnoEstado;
  notas?: string;
  precio_cobrado: number;
  productos_usados_ids?: string[];
  created_at: string;

  // Joined optional fields
  mascota?: Mascota;
  cliente?: Cliente;
  servicio?: Servicio;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string; // 'Shampoos', 'Acondicionadores', 'Accesorios', 'Salud & Antiparasitarios', 'Herramientas'
  stock_actual: number;
  stock_minimo: number;
  precio_costo: number;
  precio_venta?: number;
  unidad: string; // 'Unidades', 'Litros', 'Botellas', 'Packs'
}

export interface Gasto {
  id: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  categoria: 'Insumos' | 'Servicios & Alquiler' | 'Mantenimiento Equipos' | 'Sueldos' | 'Otros';
  monto: number;
}

export interface HorarioDisponibilidad {
  id: string;
  dia_semana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  dia_nombre: string;
  hora_inicio: string; // '09:00'
  hora_fin: string; // '18:00'
  activo: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  projectId: string;
}

export interface PerfilPeluqueria {
  id: string;
  nombre_peluqueria: string;
  slogan?: string;
  logo_url?: string;
  telefono_whatsapp: string;
  direccion: string;
  email_contacto?: string;
  instagram?: string;
  facebook?: string;
  horario_atencion?: string;
  mensaje_ticket?: string;
  moneda: string;
}
