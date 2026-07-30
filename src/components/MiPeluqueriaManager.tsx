import React, { useState } from 'react';
import {
  Store,
  Upload,
  Sparkles,
  Save,
  CheckCircle2,
  Phone,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  Clock,
  MessageSquare,
  Scissors,
  Dog,
  Crown,
  Heart,
  DollarSign,
  Image as ImageIcon,
  Trash2,
  Eye,
  Building
} from 'lucide-react';
import { PerfilPeluqueria } from '../types';

interface MiPeluqueriaManagerProps {
  perfil: PerfilPeluqueria;
  onSavePerfil: (updatedPerfil: PerfilPeluqueria) => Promise<void>;
}

const DEFAULT_AVATAR_ICONS = [
  { id: 'dog', name: 'Perro Zen', icon: Dog },
  { id: 'scissors', name: 'Tijeras Grooming', icon: Scissors },
  { id: 'crown', name: 'Corona VIP', icon: Crown },
  { id: 'heart', name: 'Corazón Pet', icon: Heart },
  { id: 'sparkles', name: 'Estilo Sparkle', icon: Sparkles },
];

export const MiPeluqueriaManager: React.FC<MiPeluqueriaManagerProps> = ({ perfil, onSavePerfil }) => {
  const [formData, setFormData] = useState<PerfilPeluqueria>(perfil);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePresetIcon, setActivePresetIcon] = useState<string>('dog');

  const handleChange = (field: keyof PerfilPeluqueria, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB para un rendimiento óptimo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('logo_url', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logo_url', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onSavePerfil(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (error) {
      console.error('Error al guardar perfil de la peluquería:', error);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-[#12151c] to-purple-950/80 border border-indigo-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-2xl shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Personalización de Mi Peluquería
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Configura el nombre de tu negocio, tu logo, teléfonos y mensajes para personalizar la app y los comprobantes.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ¡Perfil Guardado y Actualizado!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identidad de la Peluquería */}
          <div className="p-6 bg-[#12151c] border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Building className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Identidad & Marca</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Nombre de la Peluquería / Estética Canina *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Grooming Canino Lola / Peluquería Huellitas"
                  value={formData.nombre_peluqueria}
                  onChange={e => handleChange('nombre_peluqueria', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Slogan o Subtítulo</label>
                <input
                  type="text"
                  placeholder="Ej: Estética, amor y cuidado profesional para tu perro"
                  value={formData.slogan || ''}
                  onChange={e => handleChange('slogan', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Logo Selection Section */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Logo de tu Peluquería</span>
                <span className="text-[10px] text-slate-400 font-normal">Sube una imagen o usa una URL</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#0a0c10] border border-slate-800/80 rounded-xl">
                {/* Logo Preview box */}
                <div className="relative group w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Logo Peluquería"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Dog className="w-8 h-8 text-indigo-400 mx-auto" />
                      <span className="text-[9px] text-slate-400 block font-mono mt-0.5">Sin Logo</span>
                    </div>
                  )}

                  {formData.logo_url && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      title="Quitar logo"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Subir Foto/Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Quitar Logo
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="O pega una URL directa de imagen (https://...)"
                      value={formData.logo_url || ''}
                      onChange={e => handleChange('logo_url', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="p-6 bg-[#12151c] border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Phone className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Contacto & Ubicación</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Teléfono / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 5544-3322"
                  value={formData.telefono_whatsapp}
                  onChange={e => handleChange('telefono_whatsapp', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Dirección del Local
                </label>
                <input
                  type="text"
                  placeholder="Av. Corrientes 3420, CABA"
                  value={formData.direccion}
                  onChange={e => handleChange('direccion', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" /> Email de Contacto
                </label>
                <input
                  type="email"
                  placeholder="contacto@peluqueriacanina.com"
                  value={formData.email_contacto || ''}
                  onChange={e => handleChange('email_contacto', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Horario de Atención
                </label>
                <input
                  type="text"
                  placeholder="Lun a Sáb: 09:00 a 18:30 hs"
                  value={formData.horario_atencion || ''}
                  onChange={e => handleChange('horario_atencion', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram
                </label>
                <input
                  type="text"
                  placeholder="@peluqueriacanina_pro"
                  value={formData.instagram || ''}
                  onChange={e => handleChange('instagram', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook
                </label>
                <input
                  type="text"
                  placeholder="PeluqueriaCaninaPro"
                  value={formData.facebook || ''}
                  onChange={e => handleChange('facebook', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Mensajes & Facturación */}
          <div className="p-6 bg-[#12151c] border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Mensajes de WhatsApp & Moneda</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Símbolo de Moneda
                </label>
                <input
                  type="text"
                  required
                  placeholder="$"
                  value={formData.moneda}
                  onChange={e => handleChange('moneda', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">
                  Mensaje al Pie de los Recordatorios / Tickets WhatsApp
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: ¡Gracias por confiar en nosotros! Recuerda traer la cartilla de vacunas."
                  value={formData.mensaje_ticket || ''}
                  onChange={e => handleChange('mensaje_ticket', e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Guardando...' : 'Guardar Todos los Cambios'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview Card */}
        <div className="space-y-6">
          <div className="p-6 bg-[#12151c] border border-slate-800 rounded-2xl space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Vista Previa en Vivo</span>
            </div>

            {/* Header Preview */}
            <div className="p-4 bg-[#0a0c10] border border-slate-800 rounded-xl space-y-3">
              <p className="text-[10px] text-slate-500 font-mono uppercase">1. Encabezado de la App</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">
                    {formData.nombre_peluqueria || 'Nombre de tu Peluquería'}
                  </h4>
                  <p className="text-[11px] text-indigo-400 font-light truncate">
                    {formData.slogan || 'Estética Canina Profesional'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Preview */}
            <div className="p-4 bg-[#0a0c10] border border-slate-800 rounded-xl space-y-2">
              <p className="text-[10px] text-slate-500 font-mono uppercase">2. Mensaje de Turno por WhatsApp</p>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-200 text-xs space-y-1.5 font-sans leading-relaxed">
                <p className="font-bold text-emerald-300">
                  🐾 *{formData.nombre_peluqueria || 'Mi Peluquería'}*
                </p>
                <p className="text-[11px]">
                  Hola Carolina, confirmamos el turno de *Lola* para mañana a las 10:30 hs.
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Monto: {formData.moneda} 4.500
                </p>
                <p className="text-[10px] text-slate-300 italic border-t border-emerald-500/20 pt-1">
                  "{formData.mensaje_ticket || '¡Gracias por tu confianza!'}"
                </p>
                <p className="text-[10px] text-emerald-400/80">
                  📍 {formData.direccion || 'Dirección del local'} | 📱 {formData.telefono_whatsapp}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
