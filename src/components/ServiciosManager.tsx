import React, { useState } from 'react';
import { Scissors, Plus, Clock, DollarSign, Edit3, Trash2, Tag, CheckCircle2, XCircle, X } from 'lucide-react';
import { Servicio } from '../types';

interface ServiciosManagerProps {
  servicios: Servicio[];
  onSaveServicio: (servicio: Omit<Servicio, 'id'> & { id?: string }) => Promise<void>;
  onDeleteServicio: (id: string) => Promise<void>;
}

export const ServiciosManager: React.FC<ServiciosManagerProps> = ({
  servicios,
  onSaveServicio,
  onDeleteServicio,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  // Form
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [duracionMin, setDuracionMin] = useState<number>(60);
  const [precio, setPrecio] = useState<number>(0);
  const [categoria, setCategoria] = useState<string>('Peluquería');
  const [activo, setActivo] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const handleOpenCreate = () => {
    setEditingServicio(null);
    setNombre('');
    setDescripcion('Incluye baño con agua tibia, champú especial, secado a turbina, corte higiénico y corte de uñas.');
    setDuracionMin(90);
    setPrecio(18000);
    setCategoria('Peluquería');
    setActivo(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Servicio) => {
    setEditingServicio(s);
    setNombre(s.nombre);
    setDescripcion(s.descripcion || '');
    setDuracionMin(s.duracion_min);
    setPrecio(s.precio);
    setCategoria(s.categoria);
    setActivo(s.activo);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Ingresa el nombre del servicio.');
      return;
    }

    setSaving(true);
    try {
      await onSaveServicio({
        id: editingServicio?.id,
        nombre,
        descripcion,
        duracion_min: Number(duracionMin),
        precio: Number(precio),
        categoria,
        activo,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el servicio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-indigo-400" /> Catálogo de Servicios de Peluquería Canina
          </h2>
          <p className="text-xs text-slate-400">
            Precios y tiempos estimados para Baño, Corte de Raza, Deslanado, Higiénico y Baños Medicados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Servicio
        </button>
      </div>

      {/* Grid of services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map(s => (
          <div
            key={s.id}
            className={`bg-[#12151c] border rounded-xl p-5 flex flex-col justify-between transition-all shadow-xl ${
              s.activo ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 bg-[#0a0c10] border border-slate-800 text-indigo-400 text-[10px] font-semibold uppercase rounded-md flex items-center gap-1">
                  <Tag className="w-3 h-3 text-indigo-400" /> {s.categoria}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Editar servicio"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el servicio "${s.nombre}"?`)) {
                        onDeleteServicio(s.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{s.nombre}</h3>
                {s.descripcion && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.descripcion}</p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> {s.duracion_min} min
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ${s.precio.toLocaleString('es-AR')}
                </span>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                s.activo ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500'
              }`}>
                {s.activo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {s.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-sm">
          <div className="bg-[#12151c] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-[#0a0c10]/60 flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">
                {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio de Peluquería'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Corte Tijera & Baño Completo Caniche"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Categoría</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Peluquería">Peluquería & Estética</option>
                    <option value="Baño & Deslanado">Baño & Deslanado</option>
                    <option value="Salud & Higiene">Salud & Higiene</option>
                    <option value="Baño Medicado">Baño Medicado / Piel</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duración (minutos)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={duracionMin}
                    onChange={e => setDuracionMin(Number(e.target.value))}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Precio Sugerido ($ ARS)</label>
                <input
                  type="number"
                  min="0"
                  value={precio}
                  onChange={e => setPrecio(Number(e.target.value))}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-emerald-400 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Descripción del Servicio</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalles de lo que incluye el servicio..."
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-activo"
                  checked={activo}
                  onChange={e => setActivo(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded bg-[#0a0c10] border-slate-800"
                />
                <label htmlFor="chk-activo" className="text-xs text-slate-300">
                  Servicio activo (disponible para selección)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
