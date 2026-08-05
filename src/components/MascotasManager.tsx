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
  X,
  Printer,
  Eye,
  Copy,
  Check,
  Share2,
  FileText
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

  // Modal to view/print full ficha
  const [viewingFichaMascota, setViewingFichaMascota] = useState<Mascota | null>(null);
  const [copiedFicha, setCopiedFicha] = useState(false);

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

  const buildWhatsAppFichaMessage = (m: Mascota) => {
    const cli = m.cliente;
    const text = `🐾 *FICHA CANINA COMPLETA - CANINGROOM PRO* 🐾
========================================
🐶 *MASCOTA:* ${m.nombre}
🐕 *Raza:* ${m.raza} (${m.tamano} • ${m.peso_kg || 0} kg)
🎨 *Color:* ${m.color_pelo || 'Estándar'}
🎂 *Cumpleaños:* ${m.cumpleanos ? new Date(m.cumpleanos + 'T00:00:00').toLocaleDateString('es-AR') : 'No especificado'}

👤 *DUEÑO/A:* ${cli?.nombre || 'No registrado'}
📞 *Teléfono:* ${cli?.telefono || 'No registrado'}
📍 *Dirección:* ${cli?.direccion || 'No registrada'}

💉 *VACUNACIÓN:* ${m.vacunas_al_dia ? '✅ Vacunas al día' : '⚠️ Vacunas pendientes'}
🗓️ *Última Dosis:* ${m.fecha_ultima_vacunacion ? new Date(m.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR') : 'Sin fecha'}
📝 *Detalle Vacunas:* ${m.vacunas_detalle || 'Sin detalle'}

⚠️ *BOZAL:* ${m.usa_bozal ? 'SI (Usa bozal por prevención)' : 'NO (No requiere bozal)'} ${m.bozal_notas ? `\n💬 *Notas Bozal:* ${m.bozal_notas}` : ''}
🚗 *MEDIO DE LLEGADA:* ${m.transporte_llegada || 'Caminando'}

🩺 *PIEL Y ALERGIAS:* ${m.alergias_afecciones || 'Sin alergias o afecciones registradas'}
❤️ *COMPORTAMIENTO:* ${m.comportamiento || 'Tranquilo / Normal'}
🧼 *PRODUCTOS RECOMENDADOS:* ${m.productos_favoritos || 'Shampoo neutro de avena'}
📌 *OBSERVACIONES:* ${m.observaciones || 'Sin observaciones'}
========================================
_Peluquería Canina CaninGroom Pro_`;
    return text;
  };

  const handleSendWhatsAppFicha = (m: Mascota) => {
    const phone = m.cliente?.telefono || '';
    const text = buildWhatsAppFichaMessage(m);
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const encoded = encodeURIComponent(text);
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handleCopyFichaText = (m: Mascota) => {
    const text = buildWhatsAppFichaMessage(m);
    navigator.clipboard.writeText(text);
    setCopiedFicha(true);
    setTimeout(() => setCopiedFicha(false), 2500);
  };

  const handlePrintFicha = (m: Mascota) => {
    setViewingFichaMascota(m);
    setTimeout(() => {
      window.print();
    }, 200);
  };

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
    <div className="space-y-5">
      {/* Header section with BIG prominent button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <div>
          <h2 className="text-lg font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
            <Dog className="w-6 h-6 text-[#2271b1] dark:text-[#72aee6]" /> Fichas Caninas & Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registro completo de perros: raza, vacunas, afecciones de piel, productos usados, dirección y contacto del dueño.
          </p>
        </div>

        {/* LARGE ACTION BUTTON */}
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 shrink-0 self-stretch sm:self-auto min-h-[46px]"
        >
          <Plus className="w-5 h-5" /> Registrar Mascota / Dueño
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por perro, raza, dueño, teléfono, alergia o dirección..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['todos', 'Pequeño', 'Mediano', 'Grande', 'Gigante'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTamano(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap capitalize ${
                selectedTamano === t
                  ? 'bg-[#2271b1] text-white border-[#2271b1]'
                  : 'bg-white dark:bg-[#161b22] text-[#2c3338] dark:text-slate-200 border-[#8c8f94] dark:border-slate-700 hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327]'
              }`}
            >
              {t === 'todos' ? 'Todos los Tamaños' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMascotas.map(m => (
          <div
            key={m.id}
            className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 hover:border-[#8c8f94] dark:hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all shadow-xs hover:shadow-md space-y-3.5 relative"
          >
            {/* Top header: Photo, Name, Breed, Actions */}
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={m.foto_url || DOG_AVATAR_PRESETS[0]}
                    alt={m.nombre}
                    className="w-14 h-14 rounded-xl object-cover border border-[#c3c4c7] dark:border-slate-700 shrink-0 shadow-xs"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#1d2327] dark:text-white flex items-center gap-1.5">
                      {m.nombre}
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] border border-[#2271b1]/30 dark:border-indigo-800/40">
                        {m.tamano}
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{m.raza}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{m.color_pelo || 'Pelo estándar'}</span> •{' '}
                      <span className="flex items-center gap-1 font-mono">
                        <Scale className="w-3 h-3 text-slate-400" /> {m.peso_kg || 0} kg
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#2271b1] dark:hover:text-[#72aee6] hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327] rounded-lg transition-colors"
                    title="Editar ficha completa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.nombre)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#d63638] dark:hover:text-rose-400 hover:bg-[#fcf0f1] dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Eliminar mascota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Owner Info Box */}
              <div className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1d2327] dark:text-white flex items-center gap-1">
                    Dueño/a: {m.cliente?.nombre || 'Sin registrar'}
                  </span>
                  {m.cliente?.telefono && (
                    <button
                      onClick={() => openWhatsApp(m.cliente!.telefono, m.nombre)}
                      className="px-2.5 py-1 bg-[#25d366] hover:bg-[#128c7e] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {m.cliente?.telefono || 'N/A'}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {m.cliente?.direccion || 'Sin dirección registrada'}
                </p>
              </div>

              {/* Health & Skin alerts */}
              {m.alergias_afecciones && (
                <div className="p-2 bg-[#fcf0f1] dark:bg-rose-950/40 border border-[#d63638]/30 dark:border-rose-900/40 text-[#d63638] dark:text-rose-400 rounded-lg text-xs space-y-0.5">
                  <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Piel / Alergias / Afecciones:
                  </span>
                  <p className="text-[11px] font-medium leading-relaxed">
                    {m.alergias_afecciones}
                  </p>
                </div>
              )}

              {/* Behavioral observations */}
              {m.comportamiento && (
                <div className="p-2 bg-[#f0f6fc] dark:bg-indigo-950/40 border border-[#2271b1]/30 dark:border-indigo-800/40 text-[#2271b1] dark:text-[#72aee6] rounded-lg text-xs space-y-0.5">
                  <span className="font-bold text-[10px] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> Comportamiento / Manejo:
                  </span>
                  <p className="text-[11px] text-[#2c3338] dark:text-slate-200">{m.comportamiento}</p>
                </div>
              )}

              {/* Operational info badges: Vacunas, Bozal, Transporte */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#c3c4c7] dark:border-slate-800">
                {/* Vacunación */}
                <div className="p-1.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-lg space-y-0.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Syringe className="w-3 h-3 text-[#00a32a] dark:text-emerald-400" /> VACUNACIÓN
                  </span>
                  <p className="font-mono text-[#1d2327] dark:text-white font-bold text-[11px]">
                    {m.fecha_ultima_vacunacion ? new Date(m.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR') : 'Sin fecha'}
                  </p>
                </div>

                {/* Bozal */}
                <div className={`p-1.5 border rounded-lg space-y-0.5 ${
                  m.usa_bozal
                    ? 'bg-[#fcf0f1] dark:bg-rose-950/40 border-[#d63638]/40'
                    : 'bg-[#f6f7f7] dark:bg-[#0e1117] border-[#c3c4c7] dark:border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#dba617]" /> BOZAL
                  </span>
                  <p className={`font-bold text-[11px] ${m.usa_bozal ? 'text-[#d63638] dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {m.usa_bozal ? '⚠️ USA BOZAL' : 'No usa bozal'}
                  </p>
                </div>
              </div>
            </div>

            {/* LARGE ACTION BUTTONS PANEL FOR EVERY PET */}
            <div className="pt-3 border-t border-[#c3c4c7] dark:border-slate-800 space-y-2">
              {/* Primary View Ficha Button */}
              <button
                onClick={() => setViewingFichaMascota(m)}
                className="w-full py-2.5 px-3 bg-[#f0f6fc] dark:bg-indigo-950/40 hover:bg-[#e0edfe] dark:hover:bg-indigo-900/50 text-[#2271b1] dark:text-[#72aee6] font-bold text-xs rounded-xl border border-[#2271b1]/30 dark:border-indigo-800/40 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
              >
                <Eye className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" /> Ver Ficha Completa
              </button>

              {/* Big Buttons Bar: WhatsApp, Print, Turno */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleSendWhatsAppFicha(m)}
                  className="py-2 px-2 bg-[#25d366] hover:bg-[#128c7e] text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Enviar Ficha por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handlePrintFicha(m)}
                  className="py-2 px-2 bg-[#1d2327] dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Imprimir Ficha Completa"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>Imprimir</span>
                </button>

                <button
                  onClick={() => onOpenNewTurnoForMascota(m)}
                  className="py-2 px-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Agendar Turno de Peluquería"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Turno</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMascotas.length === 0 && (
          <div className="col-span-full py-16 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl text-center space-y-3 transition-colors">
            <Dog className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-[#1d2327] dark:text-white">No se encontraron mascotas</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Intenta cambiar los filtros de búsqueda o agrega una nueva ficha canina.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" /> Registrar Mascota / Dueño
            </button>
          </div>
        )}
      </div>

      {/* FULL FICHA VIEW & PRINT MODAL */}
      {viewingFichaMascota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 transition-colors print-document">
            
            {/* Modal Top Header (Hidden on print via CSS) */}
            <div className="no-print p-4 sm:p-5 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#f0f6fc] dark:bg-indigo-950/40 border border-[#2271b1]/30 rounded-xl text-[#2271b1] dark:text-[#72aee6]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1d2327] dark:text-white text-base sm:text-lg">
                    Ficha Clínica & Sanitaria Canina
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registro médico y técnico de peluquería • {viewingFichaMascota.nombre}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingFichaMascota(null)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white hover:bg-[#e0e0e0] dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BIG ACTION BUTTONS TOOLBAR (Top of Modal) */}
            <div className="no-print p-4 bg-[#f0f6fc] dark:bg-[#0e1117] border-b border-[#c3c4c7] dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handlePrintFicha(viewingFichaMascota)}
                className="py-2.5 px-3 bg-[#1d2327] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-200" />
                <span>Imprimir Ficha</span>
              </button>

              <button
                onClick={() => handleSendWhatsAppFicha(viewingFichaMascota)}
                className="py-2.5 px-3 bg-[#25d366] hover:bg-[#128c7e] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar WhatsApp</span>
              </button>

              <button
                onClick={() => handleCopyFichaText(viewingFichaMascota)}
                className="py-2.5 px-3 bg-white dark:bg-[#161b22] hover:bg-[#f0f0f1] dark:hover:bg-slate-800 text-[#1d2327] dark:text-slate-100 border border-[#c3c4c7] dark:border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {copiedFicha ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedFicha ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={() => {
                  const m = viewingFichaMascota;
                  setViewingFichaMascota(null);
                  onOpenNewTurnoForMascota(m);
                }}
                className="py-2.5 px-3 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Turno</span>
              </button>
            </div>

            {/* PRINTABLE CONTENT BODY */}
            <div className="p-5 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Header card with Pet & Owner Avatar */}
              <div className="p-5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <img
                    src={viewingFichaMascota.foto_url || DOG_AVATAR_PRESETS[0]}
                    alt={viewingFichaMascota.nombre}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#2271b1] shadow-md shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-black text-[#1d2327] dark:text-white">
                        {viewingFichaMascota.nombre}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2271b1] text-white">
                        {viewingFichaMascota.tamano}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Raza: {viewingFichaMascota.raza}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Color: {viewingFichaMascota.color_pelo || 'Estándar'} • Peso: {viewingFichaMascota.peso_kg || 0} kg
                    </p>
                    {viewingFichaMascota.cumpleanos && (
                      <p className="text-xs text-[#2271b1] dark:text-[#72aee6] font-semibold flex items-center justify-center sm:justify-start gap-1">
                        🎂 Cumpleaños: {new Date(viewingFichaMascota.cumpleanos + 'T00:00:00').toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Owner info */}
                <div className="w-full sm:w-auto p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">DATOS DEL DUEÑO/A</p>
                  <p className="font-bold text-sm text-[#1d2327] dark:text-white">{viewingFichaMascota.cliente?.nombre || 'No registrado'}</p>
                  <p className="font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2271b1]" /> {viewingFichaMascota.cliente?.telefono || 'Sin teléfono'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2271b1]" /> {viewingFichaMascota.cliente?.direccion || 'Sin dirección'}
                  </p>
                </div>
              </div>

              {/* Grid 2 Columns: Health & Behavior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sanidad & Vacunas */}
                <div className="p-4 bg-white dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#00a32a] dark:text-emerald-400 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Syringe className="w-4 h-4" /> Estado de Vacunación & Sanidad
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Estado:</span>
                      <strong className={viewingFichaMascota.vacunas_al_dia ? 'text-[#00a32a]' : 'text-[#dba617]'}>
                        {viewingFichaMascota.vacunas_al_dia ? '✅ Vacunas al Día' : '⚠️ Pendientes'}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Última aplicación:</span>
                      <strong className="font-mono">
                        {viewingFichaMascota.fecha_ultima_vacunacion ? new Date(viewingFichaMascota.fecha_ultima_vacunacion + 'T00:00:00').toLocaleDateString('es-AR') : 'Sin registro'}
                      </strong>
                    </p>
                    {viewingFichaMascota.vacunas_detalle && (
                      <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Detalle:</span> {viewingFichaMascota.vacunas_detalle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bozal & Prevención */}
                <div className={`p-4 border rounded-xl space-y-2 ${
                  viewingFichaMascota.usa_bozal
                    ? 'bg-[#fcf0f1] dark:bg-rose-950/30 border-[#d63638]/40'
                    : 'bg-white dark:bg-[#0e1117] border-[#c3c4c7] dark:border-slate-800'
                }`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#d63638] dark:text-rose-400 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Shield className="w-4 h-4" /> Requerimiento de Bozal
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">
                      {viewingFichaMascota.usa_bozal ? '⚠️ REQUIERE BOZAL POR SEGURIDAD' : '🟢 No requiere bozal'}
                    </p>
                    {viewingFichaMascota.bozal_notas && (
                      <p className="text-[11px] text-slate-700 dark:text-slate-300">
                        <strong>Especifiación:</strong> {viewingFichaMascota.bozal_notas}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alergias & Piel */}
                <div className="p-4 bg-white dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#d63638] dark:text-rose-400 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <ShieldAlert className="w-4 h-4" /> Piel, Alergias & Sensibilidad
                  </h4>
                  <p className="text-xs text-[#2c3338] dark:text-slate-200 font-medium">
                    {viewingFichaMascota.alergias_afecciones || 'Sin alergias o afecciones registradas.'}
                  </p>
                </div>

                {/* Comportamiento & Manejo */}
                <div className="p-4 bg-white dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#2271b1] dark:text-[#72aee6] flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Heart className="w-4 h-4" /> Temperamento en Peluquería
                  </h4>
                  <p className="text-xs text-[#2c3338] dark:text-slate-200 font-medium">
                    {viewingFichaMascota.comportamiento || 'Tranquilo / Dócil.'}
                  </p>
                </div>

                {/* Productos recomendados */}
                <div className="p-4 bg-white dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#dba617] flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Package className="w-4 h-4" /> Productos & Cosmética Usada
                  </h4>
                  <p className="text-xs text-[#2c3338] dark:text-slate-200 font-medium">
                    {viewingFichaMascota.productos_favoritos || 'Shampoo neutro de avena.'}
                  </p>
                </div>

                {/* Medio de transporte */}
                <div className="p-4 bg-white dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Car className="w-4 h-4" /> Medio de Transporte habitual
                  </h4>
                  <p className="text-xs text-[#2c3338] dark:text-slate-200 font-bold">
                    {viewingFichaMascota.transporte_llegada || 'Caminando'}
                  </p>
                </div>
              </div>

              {/* Observaciones generales */}
              {viewingFichaMascota.observaciones && (
                <div className="p-4 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-1 text-xs">
                  <h4 className="font-bold text-[#1d2327] dark:text-white uppercase tracking-wider text-[10px]">
                    OBSERVACIONES GENERALES
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {viewingFichaMascota.observaciones}
                  </p>
                </div>
              )}

              {/* Footer Stamp on Print */}
              <div className="pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-mono">
                Peluquería Canina CaninGroom Pro • Documento impreso el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Bottom Actions for Modal (Hidden on print) */}
            <div className="no-print p-4 bg-[#f6f7f7] dark:bg-[#0e1117] border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const m = viewingFichaMascota;
                  setViewingFichaMascota(null);
                  handleOpenEdit(m);
                }}
                className="px-4 py-2 bg-white dark:bg-[#161b22] hover:bg-[#f0f0f1] dark:hover:bg-slate-800 border border-[#c3c4c7] dark:border-slate-700 font-bold text-xs text-[#1d2327] dark:text-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Editar Ficha
              </button>

              <button
                onClick={() => setViewingFichaMascota(null)}
                className="px-6 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 transition-colors">
            <div className="p-5 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
              <h3 className="font-bold text-[#1d2327] dark:text-white text-base flex items-center gap-2">
                <Dog className="w-5 h-5 text-[#2271b1] dark:text-[#72aee6]" />
                {editingMascota ? `Editar Ficha de ${editingMascota.nombre}` : 'Nueva Ficha de Mascota & Dueño'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white text-xs font-mono p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* SECTION 1: DATOS DEL PERRO */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#2271b1] dark:text-[#72aee6] uppercase tracking-wider flex items-center gap-2 border-b border-[#c3c4c7] dark:border-slate-800 pb-2">
                  <Dog className="w-4 h-4" /> 1. Datos del Perro / Mascota
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Nombre del Perro *</label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej: Lola, Thor, Max..."
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Raza *</label>
                    <input
                      type="text"
                      required
                      value={raza}
                      onChange={e => setRaza(e.target.value)}
                      placeholder="Ej: Caniche, Golden, Mestizo, Schnauzer..."
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Tamaño</label>
                    <select
                      value={tamano}
                      onChange={e => setTamano(e.target.value as TamanoMascota)}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1]"
                    >
                      <option value="Pequeño">Pequeño (hasta 8 kg)</option>
                      <option value="Mediano">Mediano (8 a 20 kg)</option>
                      <option value="Grande">Grande (20 a 35 kg)</option>
                      <option value="Gigante">Gigante (+35 kg)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={pesoKg}
                      onChange={e => setPesoKg(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 font-mono focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Color del Pelo</label>
                    <input
                      type="text"
                      value={colorPelo}
                      onChange={e => setColorPelo(e.target.value)}
                      placeholder="Ej: Blanco, Dorado, Negro, Apricot..."
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>
                </div>

                {/* Foto / Preset Avatar / Camera */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200 flex items-center justify-between">
                    <span>Foto / Avatar del Perro</span>
                    <span className="text-[11px] text-slate-500 font-normal">Sube foto o usa la cámara</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl">
                    <img
                      src={fotoUrl || DOG_AVATAR_PRESETS[0]}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-[#c3c4c7] dark:border-slate-700 shrink-0 shadow-xs"
                    />

                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" /> Cámara Vivo
                        </button>

                        <label className="px-3 py-1.5 bg-white dark:bg-[#161b22] hover:bg-[#f0f0f1] dark:hover:bg-slate-800 text-[#1d2327] dark:text-slate-100 border border-[#c3c4c7] dark:border-slate-700 font-semibold text-xs rounded-lg cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" /> Subir Archivo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] text-slate-500 font-semibold shrink-0">Presets:</span>
                        {DOG_AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFotoUrl(preset)}
                            className={`w-7 h-7 rounded-lg overflow-hidden border-2 shrink-0 ${
                              fotoUrl === preset ? 'border-[#2271b1] scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cumpleaños y Transporte */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Fecha de Nacimiento / Cumpleaños</label>
                    <input
                      type="date"
                      value={cumpleanos}
                      onChange={e => setCumpleanos(e.target.value)}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Llegada / Medio de Traslado</label>
                    <select
                      value={transporteLlegada}
                      onChange={e => setTransporteLlegada(e.target.value as any)}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1]"
                    >
                      <option value="Caminando">Caminando con dueño</option>
                      <option value="En vehículo">En vehículo particular</option>
                      <option value="Retiro a domicilio">Retiro a domicilio (Mascotamóvil)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SANIDAD, VACUNAS, BOZAL */}
              <div className="space-y-4 pt-2 border-t border-[#c3c4c7] dark:border-slate-800">
                <h4 className="text-xs font-bold text-[#2271b1] dark:text-[#72aee6] uppercase tracking-wider flex items-center gap-2 border-b border-[#c3c4c7] dark:border-slate-800 pb-2">
                  <Syringe className="w-4 h-4 text-[#00a32a]" /> 2. Salud, Vacunas, Bozal & Piel
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vacunas toggle */}
                  <div className="p-3 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1d2327] dark:text-white flex items-center gap-1.5">
                        <Syringe className="w-4 h-4 text-[#00a32a]" /> Vacunas al Día *
                      </label>
                      <input
                        type="checkbox"
                        checked={vacunasAlDia}
                        onChange={e => setVacunasAlDia(e.target.checked)}
                        className="w-4 h-4 accent-[#2271b1] rounded"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-600 dark:text-slate-300">Fecha de última dosis:</label>
                      <input
                        type="date"
                        value={fechaUltimaVacunacion}
                        onChange={e => setFechaUltimaVacunacion(e.target.value)}
                        className="w-full bg-white dark:bg-[#161b22] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej: Antirrábica + Séxtuple en Enero 2026"
                      value={vacunasDetalle}
                      onChange={e => setVacunasDetalle(e.target.value)}
                      className="w-full bg-white dark:bg-[#161b22] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>

                  {/* Bozal toggle */}
                  <div className="p-3 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1d2327] dark:text-white flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-[#dba617]" /> ¿Usa Bozal en Peluquería?
                      </label>
                      <input
                        type="checkbox"
                        checked={usaBozal}
                        onChange={e => setUsaBozal(e.target.checked)}
                        className="w-4 h-4 accent-[#2271b1] rounded"
                      />
                    </div>
                    {usaBozal && (
                      <input
                        type="text"
                        placeholder="Ej: Poner al secar la cabeza, se reactiva con ruidos..."
                        value={bozalNotas}
                        onChange={e => setBozalNotas(e.target.value)}
                        className="w-full bg-white dark:bg-[#161b22] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400"
                      />
                    )}
                    <p className="text-[11px] text-slate-500">
                      Indica si el perro requiere bozal preventivo durante el baño, corte de uñas o secado.
                    </p>
                  </div>
                </div>

                {/* Alergias, Comportamiento, Productos */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-[#d63638]" /> Piel, Dermatitis, Alergias o Afecciones médicas
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sensibilidad en oídos, pulguicida reciente, dermatitis atópica en lomo..."
                      value={alergiasAfecciones}
                      onChange={e => setAlergiasAfecciones(e.target.value)}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200 flex items-center gap-1">
                        <Heart className="w-4 h-4 text-[#2271b1]" /> Comportamiento / Temperamento
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Le asusta la turbina de secado, le gusta que le mimen las patas..."
                        value={comportamiento}
                        onChange={e => setComportamiento(e.target.value)}
                        className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200 flex items-center gap-1">
                        <Package className="w-4 h-4 text-[#dba617]" /> Productos Favoritos / Shampoo Usado
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Shampoo Hipoalergénico Avena, Bálsamo desenredante, Perfume Vainilla..."
                        value={productosFavoritos}
                        onChange={e => setProductosFavoritos(e.target.value)}
                        className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Observaciones Generales de la Ficha</label>
                    <textarea
                      rows={2}
                      placeholder="Cualquier indicación adicional respecto a cortes preferidos, antecedentes, etc."
                      value={observaciones}
                      onChange={e => setObservaciones(e.target.value)}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DATOS DEL CLIENTE / DUEÑO */}
              <div className="space-y-4 pt-2 border-t border-[#c3c4c7] dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-[#c3c4c7] dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-[#2271b1] dark:text-[#72aee6] uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4" /> 3. Datos del Dueño / Cliente
                  </h4>

                  {clientes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCliente(!isCreatingNewCliente)}
                      className="text-xs text-[#2271b1] dark:text-[#72aee6] font-semibold underline hover:text-[#135e96]"
                    >
                      {isCreatingNewCliente ? 'Seleccionar Cliente Existente' : '+ Registrar Nuevo Dueño'}
                    </button>
                  )}
                </div>

                {!isCreatingNewCliente && clientes.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Seleccionar Dueño Existente</label>
                    <select
                      value={clienteId}
                      onChange={e => setClienteId(e.target.value)}
                      className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 focus:outline-none focus:border-[#2271b1]"
                    >
                      {clientes.map(cli => (
                        <option key={cli.id} value={cli.id}>
                          {cli.nombre} • Tel: {cli.telefono} {cli.direccion ? `• Dir: ${cli.direccion}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#f6f7f7] dark:bg-[#0e1117] p-3.5 border border-[#c3c4c7] dark:border-slate-800 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Nombre del Dueño/a *</label>
                        <input
                          type="text"
                          required
                          value={clienteNombre}
                          onChange={e => setClienteNombre(e.target.value)}
                          placeholder="Ej: Ana María González"
                          className="w-full bg-white dark:bg-[#161b22] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Teléfono / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={clienteTelefono}
                          onChange={e => setClienteTelefono(e.target.value)}
                          placeholder="Ej: +54 9 11 4567-8901"
                          className="w-full bg-white dark:bg-[#161b22] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Dirección de Domicilio</label>
                      <input
                        type="text"
                        value={clienteDireccion}
                        onChange={e => setClienteDireccion(e.target.value)}
                        placeholder="Ej: Av. Corrientes 3420, CABA"
                        className="w-full bg-white dark:bg-[#161b22] border border-[#8c8f94] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2271b1]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[#c3c4c7] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1d2327] dark:text-white text-base">Tomar Foto del Perro</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enfoca a la mascota y presiona Capturar</p>
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white hover:bg-[#f6f7f7] dark:hover:bg-[#0e1117] transition-colors"
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
                className="px-4 py-2 bg-[#f6f7f7] dark:bg-[#0e1117] hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327] text-slate-700 dark:text-slate-200 border border-[#c3c4c7] dark:border-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={takeCameraSnapshot}
                className="px-6 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-all active:scale-95"
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

