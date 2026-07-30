import React, { useState } from 'react';
import {
  Dog,
  Plus,
  Search,
  Phone,
  MapPin,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Edit3,
  Trash2,
  Calendar,
  Sparkles,
  MessageCircle,
  Syringe,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Tag,
  Scale,
  Heart,
  Package,
  Car,
  Footprints,
  Truck,
  Camera,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Mascota, Cliente, TamanoMascota } from '../types';

interface MascotasManagerProps {
  mascotas: Mascota[];
  clientes: Cliente[];
  onSaveMascota: (mascota: Omit<Mascota, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onSaveCliente: (cliente: Omit<Cliente, 'id' | 'created_at'> & { id?: string }) => Promise<Cliente>;
  onDeleteMascota: (id: string) => Promise<void>;
  onOpenNewTurnoForMascota: (mascota: Mascota) => void;
}

const DOG_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300', // Poodle / Caniche
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300', // Golden
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300', // Schnauzer
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=300', // Beagle
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=300', // Pug
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300', // Bulldog
];

export const MascotasManager: React.FC<MascotasManagerProps> = ({
  mascotas,
  clientes,
  onSaveMascota,
  onSaveCliente,
  onDeleteMascota,
  onOpenNewTurnoForMascota,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTamano, setSelectedTamano] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);

  // Form states
  const [clienteId, setClienteId] = useState('');
  const [isCreatingNewCliente, setIsCreatingNewCliente] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteNotas, setClienteNotas] = useState('');

  // Dog form states
  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState(DOG_AVATAR_PRESETS[0]);
  const [raza, setRaza] = useState('');
  const [tamano, setTamano] = useState<TamanoMascota>('Pequeño');
  const [pesoKg, setPesoKg] = useState<number>(5);
  const [colorPelo, setColorPelo] = useState('');
  const [cumpleanos, setCumpleanos] = useState('');
  const [vacunasAlDia, setVacunasAlDia] = useState(true);
  const [fechaUltimaVacunacion, setFechaUltimaVacunacion] = useState('');
  const [vacunasDetalle, setVacunasDetalle] = useState('');
  const [usaBozal, setUsaBozal] = useState(false);
  const [bozalNotas, setBozalNotas] = useState('');
  const [transporteLlegada, setTransporteLlegada] = useState<'Caminando' | 'En vehículo' | 'Retiro a domicilio'>('Caminando');
  const [alergiasAfecciones, setAlergiasAfecciones] = useState('');
  const [comportamiento, setComportamiento] = useState('');
  const [productosFavoritos, setProductosFavoritos] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [saving, setSaving] = useState(false);

  // Camera capture state & helpers
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert('No se pudo abrir la cámara. Revisa si diste permisos en el navegador.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCameraOpen(false);
  };

  const takeCameraSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFotoUrl(dataUrl);
      }
    }
    stopCamera();
  };

  // Filter mascotas
  const filteredMascotas = mascotas.filter(m => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.raza.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.cliente?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.cliente?.telefono || '').includes(searchTerm) ||
      (m.alergias_afecciones || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.transporte_llegada || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTamano = selectedTamano === 'todos' || m.tamano === selectedTamano;

    return matchesSearch && matchesTamano;
  });

  const handleOpenCreate = () => {
    setEditingMascota(null);
    setClienteId(clientes.length > 0 ? clientes[0].id : '');
    setIsCreatingNewCliente(clientes.length === 0);
    setClienteNombre('');
    setClienteTelefono('');
    setClienteDireccion('');
    setClienteEmail('');
    setClienteNotas('');

    setNombre('');
    setFotoUrl(DOG_AVATAR_PRESETS[Math.floor(Math.random() * DOG_AVATAR_PRESETS.length)]);
    setRaza('Caniche');
    setTamano('Pequeño');
    setPesoKg(4.5);
    setColorPelo('Blanco');
    setCumpleanos('');
    setVacunasAlDia(true);
    setFechaUltimaVacunacion(new Date().toISOString().split('T')[0]);
    setVacunasDetalle('Antirrábica y Séxtuple al día');
    setUsaBozal(false);
    setBozalNotas('');
    setTransporteLlegada('Caminando');
    setAlergiasAfecciones('');
    setComportamiento('Tranquilo / Noble');
    setProductosFavoritos('Shampoo Hipoalergénico de Avena');
    setObservaciones('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Mascota) => {
    setEditingMascota(m);
    setClienteId(m.cliente_id);
    setIsCreatingNewCliente(false);
    if (m.cliente) {
      setClienteNombre(m.cliente.nombre);
      setClienteTelefono(m.cliente.telefono);
      setClienteDireccion(m.cliente.direccion);
      setClienteEmail(m.cliente.email || '');
      setClienteNotas(m.cliente.notas || '');
    }

    setNombre(m.nombre);
    setFotoUrl(m.foto_url || DOG_AVATAR_PRESETS[0]);
    setRaza(m.raza);
    setTamano(m.tamano);
    setPesoKg(m.peso_kg || 0);
    setColorPelo(m.color_pelo || '');
    setCumpleanos(m.cumpleanos || '');
    setVacunasAlDia(m.vacunas_al_dia);
    setFechaUltimaVacunacion(m.fecha_ultima_vacunacion || '');
    setVacunasDetalle(m.vacunas_detalle || '');
    setUsaBozal(m.usa_bozal ?? false);
    setBozalNotas(m.bozal_notas || '');
    setTransporteLlegada(m.transporte_llegada || 'Caminando');
    setAlergiasAfecciones(m.alergias_afecciones || '');
    setComportamiento(m.comportamiento || '');
    setProductosFavoritos(m.productos_favoritos || '');
    setObservaciones(m.observaciones || '');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setSaving(true);
    try {
      let finalClienteId = clienteId;

      if (isCreatingNewCliente || !finalClienteId) {
        if (!clienteNombre.trim() || !clienteTelefono.trim()) {
          alert('Por favor, ingresa el nombre y teléfono del dueño/a.');
          setSaving(false);
          return;
        }
        const createdCli = await onSaveCliente({
          nombre: clienteNombre.trim(),
          telefono: clienteTelefono.trim(),
          direccion: clienteDireccion.trim(),
          email: clienteEmail.trim(),
          notas: clienteNotas.trim(),
        });
        finalClienteId = createdCli.id;
      }

      await onSaveMascota({
        id: editingMascota?.id,
        cliente_id: finalClienteId,
        nombre: nombre.trim(),
        foto_url: fotoUrl,
        raza: raza.trim(),
        tamano,
        peso_kg: Number(pesoKg),
        color_pelo: colorPelo.trim(),
        cumpleanos,
        vacunas_al_dia: vacunasAlDia,
        fecha_ultima_vacunacion: fechaUltimaVacunacion,
        vacunas_detalle: vacunasDetalle.trim(),
        usa_bozal: usaBozal,
        bozal_notas: bozalNotas.trim(),
        transporte_llegada: transporteLlegada,
        alergias_afecciones: alergiasAfecciones.trim(),
        comportamiento: comportamiento.trim(),
        productos_favoritos: productosFavoritos.trim(),
        observaciones: observaciones.trim(),
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la ficha de la mascota');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar definitivamente la ficha de ${name}?`)) {
      await onDeleteMascota(id);
    }
  };

  const openWhatsApp = (phone: string, dogName: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const message = encodeURIComponent(`¡Hola! Te escribimos de la Peluquería Canina CaninGroom respecto a la ficha de ${dogName}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Dog className="w-5 h-5 text-indigo-400" /> Fichas Caninas & Clientes
          </h2>
          <p className="text-xs text-slate-400">
            Registro completo de perros: raza, vacunas, afecciones de piel, productos usados, dirección y contacto del dueño.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Mascota / Dueño
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por perro, raza, dueño, teléfono, alergia o dirección..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#12151c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['todos', 'Pequeño', 'Mediano', 'Grande', 'Gigante'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTamano(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap capitalize ${
                selectedTamano === t
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-[#12151c] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {t === 'todos' ? 'Todos los Tamaños' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMascotas.map(m => (
          <div
            key={m.id}
            className="bg-[#12151c] border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all shadow-xl space-y-4 relative group"
          >
            {/* Top header: Photo, Name, Breed, Actions */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={m.foto_url || DOG_AVATAR_PRESETS[0]}
                    alt={m.nombre}
                    className="w-14 h-14 rounded-xl object-cover border border-indigo-500/30 shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {m.nombre}
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {m.tamano}
                      </span>
                    </h3>
                    <p className="text-xs font-medium text-slate-300">{m.raza}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{m.color_pelo || 'Pelo standar'}</span> •{' '}
                      <span className="flex items-center gap-1 font-mono">
                        <Scale className="w-3 h-3 text-slate-400" /> {m.peso_kg || 0} kg
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Editar ficha completa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.nombre)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Eliminar mascota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Owner Info Box */}
              <div className="p-3 bg-[#0a0c10] border border-slate-800/80 rounded-lg space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1">
                    Dueño/a: {m.cliente?.nombre || 'Sin registrar'}
                  </span>
                  {m.cliente?.telefono && (
                    <button
                      onClick={() => openWhatsApp(m.cliente!.telefono, m.nombre)}
                      className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </button>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {m.cliente?.telefono || 'N/A'}
                </p>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> {m.cliente?.direccion || 'Sin dirección registrada'}
                </p>
              </div>

              {/* Health & Skin alerts */}
              {m.alergias_afecciones && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5" /> Piel / Alergias / Afecciones:
                  </span>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    {m.alergias_afecciones}
                  </p>
                </div>
              )}

              {/* Behavioral observations */}
              {m.comportamiento && (
                <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-[11px] flex items-center gap-1 text-indigo-400">
                    <Heart className="w-3.5 h-3.5" /> Comportamiento / Manejo:
                  </span>
                  <p className="text-[11px] text-slate-300">{m.comportamiento}</p>
                </div>
              )}

              {/* Preferred products */}
              {m.productos_favoritos && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Usar: <span className="text-slate-200">{m.productos_favoritos}</span></span>
                </p>
              )}

              {/* Operational info badges: Vacunas, Bozal, Transporte */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {/* Vacunación */}
                <div className="p-2 bg-[#0a0c10] border border-slate-800/80 rounded-lg space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Syringe className="w-3 h-3 text-emerald-400" /> ÚLTIMA VACUNACIÓN
                  </span>
                  <p className="font-mono text-slate-200 font-semibold text-[11px]">
                    {m.fecha_ultima_vacunacion ? new Date(m.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR') : 'Sin fecha'}
                  </p>
                </div>

                {/* Bozal */}
                <div className={`p-2 border rounded-lg space-y-0.5 ${
                  m.usa_bozal
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-[#0a0c10] border-slate-800/80'
                }`}>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" /> BOZAL
                  </span>
                  <p className={`font-bold text-[11px] ${m.usa_bozal ? 'text-rose-400' : 'text-slate-300'}`}>
                    {m.usa_bozal ? '⚠️ USA BOZAL' : 'No usa bozal'}
                  </p>
                </div>

                {/* Transporte / Llegada */}
                <div className="col-span-2 p-2 bg-[#0a0c10] border border-slate-800/80 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    {m.transporte_llegada === 'En vehículo' ? (
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                    ) : m.transporte_llegada === 'Retiro a domicilio' ? (
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Footprints className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    MEDIO DE LLEGADA
                  </span>
                  <span className="font-semibold text-white text-[11px] px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700/60">
                    {m.transporte_llegada || 'Caminando'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom bar & Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                m.vacunas_al_dia
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <Syringe className="w-3 h-3" />
                {m.vacunas_al_dia ? 'Vacunas Al Día' : 'Vacunas Pendientes'}
              </span>

              <button
                onClick={() => onOpenNewTurnoForMascota(m)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" /> Agendar Turno
              </button>
            </div>
          </div>
        ))}

        {filteredMascotas.length === 0 && (
          <div className="col-span-full py-16 bg-[#12151c] border border-slate-800 rounded-xl text-center space-y-3">
            <Dog className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron mascotas</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta cambiar los filtros de búsqueda o agrega una nueva ficha canina.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Registrar Mascota
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12151c] border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 bg-[#0a0c10]/60 flex items-center justify-between">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Dog className="w-5 h-5 text-indigo-400" />
                {editingMascota ? `Editar Ficha de ${editingMascota.nombre}` : 'Nueva Ficha de Mascota & Dueño'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* SECTION 1: DATOS DEL PERRO */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Dog className="w-4 h-4" /> 1. Datos del Perro / Mascota
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Nombre del Perro *</label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej: Lola, Thor, Max..."
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Raza *</label>
                    <input
                      type="text"
                      required
                      value={raza}
                      onChange={e => setRaza(e.target.value)}
                      placeholder="Ej: Caniche, Golden, Mestizo, Schnauzer..."
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Tamaño</label>
                    <select
                      value={tamano}
                      onChange={e => setTamano(e.target.value as TamanoMascota)}
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Pequeño">Pequeño (hasta 8 kg)</option>
                      <option value="Mediano">Mediano (8 a 20 kg)</option>
                      <option value="Grande">Grande (20 a 35 kg)</option>
                      <option value="Gigante">Gigante (+35 kg)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Peso Aprox. (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={pesoKg}
                      onChange={e => setPesoKg(Number(e.target.value))}
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Color / Pelo</label>
                    <input
                      type="text"
                      value={colorPelo}
                      onChange={e => setColorPelo(e.target.value)}
                      placeholder="Ej: Blanco, Doblado..."
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Avatar Picker & Photo Capture */}
                <div className="space-y-3 p-3 bg-[#0a0c10] border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-400" /> Foto del Perro / Ficha Médica
                    </label>

                    {fotoUrl && (
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        ✓ Foto Seleccionada
                      </span>
                    )}
                  </div>

                  {/* Photo Preview & Options */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={fotoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                        alt="Vista Previa"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-indigo-500 shadow-lg"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      {/* Upload & Camera Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <label className="cursor-pointer p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-center">
                          <Upload className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Subir de Galería</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={startCamera}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-md flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Tomar Foto Cámara</span>
                        </button>
                      </div>

                      <input
                        type="url"
                        placeholder="O pega una URL directa de imagen (opcional)..."
                        value={fotoUrl}
                        onChange={e => setFotoUrl(e.target.value)}
                        className="w-full bg-[#12151c] border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
                      O elige una ilustración de avatar predeterminada:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {DOG_AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt="Avatar"
                          onClick={() => setFotoUrl(preset)}
                          className={`w-10 h-10 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                            fotoUrl === preset ? 'border-indigo-500 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SALUD & COMPORTAMIENTO */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <ShieldAlert className="w-4 h-4" /> 2. Salud, Piel y Comportamiento
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Enfermedades, Alergias o Afecciones de la Piel</label>
                  <textarea
                    rows={2}
                    value={alergiasAfecciones}
                    onChange={e => setAlergiasAfecciones(e.target.value)}
                    placeholder="Ej: Dermatitis atópica, alergia a fragancias, sensibilidad en oídos, pulgas, etc..."
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Comportamiento en Peluquería</label>
                    <input
                      type="text"
                      value={comportamiento}
                      onChange={e => setComportamiento(e.target.value)}
                      placeholder="Ej: Tranquilo, muerde al secar patas, inquieto con uñas..."
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Productos Preferidos / Usados</label>
                    <input
                      type="text"
                      value={productosFavoritos}
                      onChange={e => setProductosFavoritos(e.target.value)}
                      placeholder="Ej: Shampoo hipoalergénico avena, crema de enjuague..."
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Vacunas & Fecha de Última Vacunación */}
                <div className="p-3 bg-[#0a0c10] border border-slate-800 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-vacunas"
                        checked={vacunasAlDia}
                        onChange={e => setVacunasAlDia(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded bg-[#0a0c10] border-slate-800"
                      />
                      <label htmlFor="chk-vacunas" className="text-xs font-semibold text-white flex items-center gap-1">
                        <Syringe className="w-3.5 h-3.5 text-emerald-400" /> Vacunas al día
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400 font-medium shrink-0">Fecha Última Vacunación:</label>
                      <input
                        type="date"
                        value={fechaUltimaVacunacion}
                        onChange={e => setFechaUltimaVacunacion(e.target.value)}
                        className="bg-[#12151c] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={vacunasDetalle}
                    onChange={e => setVacunasDetalle(e.target.value)}
                    placeholder="Detalle de vacunas (Antirrábica, Séxtuple, fecha de vencimiento)..."
                    className="w-full bg-[#12151c] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Bozal & Manejo */}
                <div className="p-3 bg-[#0a0c10] border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-400" /> ¿Requiere Bozal en Peluquería?
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUsaBozal(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          !usaBozal
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-[#12151c] text-slate-400 border-slate-800'
                        }`}
                      >
                        No usa bozal
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsaBozal(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          usaBozal
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950'
                            : 'bg-[#12151c] text-slate-400 border-slate-800'
                        }`}
                      >
                        ⚠️ Sí, usa bozal
                      </button>
                    </div>
                  </div>

                  {usaBozal && (
                    <input
                      type="text"
                      value={bozalNotas}
                      onChange={e => setBozalNotas(e.target.value)}
                      placeholder="Notas sobre el uso de bozal (Ej: Solo al cortar uñas o usar secador)..."
                      className="w-full bg-[#12151c] border border-rose-500/30 rounded-lg px-3 py-1.5 text-xs text-rose-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  )}
                </div>

                {/* Transporte / Medio de llegada */}
                <div className="p-3 bg-[#0a0c10] border border-slate-800 rounded-lg space-y-2">
                  <label className="text-xs font-semibold text-white flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-cyan-400" /> Medio de Transporte / ¿Cómo llega a la Peluquería?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransporteLlegada('Caminando')}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        transporteLlegada === 'Caminando'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-[#12151c] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Footprints className="w-3.5 h-3.5" /> Caminando
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransporteLlegada('En vehículo')}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        transporteLlegada === 'En vehículo'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-[#12151c] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" /> En vehículo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransporteLlegada('Retiro a domicilio')}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        transporteLlegada === 'Retiro a domicilio'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-[#12151c] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" /> Retiro a domicilio
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DATOS DEL DUEÑO */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Phone className="w-4 h-4" /> 3. Datos del Dueño / Cliente
                </h4>

                {clientes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCliente(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        !isCreatingNewCliente
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#0a0c10] text-slate-400 border-slate-800'
                      }`}
                    >
                      Seleccionar Dueño Existente
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCliente(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        isCreatingNewCliente
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#0a0c10] text-slate-400 border-slate-800'
                      }`}
                    >
                      + Crear Nuevo Dueño
                    </button>
                  </div>
                )}

                {!isCreatingNewCliente && clientes.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Seleccionar Dueño Existente</label>
                    <select
                      value={clienteId}
                      onChange={e => setClienteId(e.target.value)}
                      className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.telefono}) - {c.direccion}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Nombre del Dueño/a *</label>
                      <input
                        type="text"
                        required={isCreatingNewCliente}
                        value={clienteNombre}
                        onChange={e => setClienteNombre(e.target.value)}
                        placeholder="Ej: Carolina Méndez"
                        className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Teléfono / WhatsApp *</label>
                      <input
                        type="text"
                        required={isCreatingNewCliente}
                        value={clienteTelefono}
                        onChange={e => setClienteTelefono(e.target.value)}
                        placeholder="+54 9 11 1234-5678"
                        className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-300">Dirección *</label>
                      <input
                        type="text"
                        value={clienteDireccion}
                        onChange={e => setClienteDireccion(e.target.value)}
                        placeholder="Ej: Av. Corrientes 3420, CABA"
                        className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? 'Guardando Ficha...' : 'Guardar Ficha Canina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Capture Live Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/90 backdrop-blur-md">
          <div className="bg-[#12151c] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Tomar Foto del Perro</h3>
                  <p className="text-xs text-slate-400">Enfoca a la mascota y presiona Capturar</p>
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewfinder */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none rounded-xl m-4 border-dashed" />
            </div>

            {/* Camera Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={takeCameraSnapshot}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" /> 📸 Capturar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
