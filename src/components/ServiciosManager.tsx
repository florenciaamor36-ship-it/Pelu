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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 shadow-xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#2271b1] dark:text-[#72aee6]" /> Catálogo de Servicios de Peluquería Canina
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Precios y tiempos estimados para Baño, Corte de Raza, Deslanado, Higiénico y Baños Medicados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Servicio
        </button>
      </div>

      {/* Grid of services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map(s => (
          <div
            key={s.id}
            className={`bg-white dark:bg-[#161b22] border rounded p-4 flex flex-col justify-between transition-colors shadow-xs ${
              s.activo ? 'border-[#c3c4c7] dark:border-slate-800 hover:border-[#8c8f94] dark:hover:border-slate-700' : 'border-[#c3c4c7]/50 dark:border-slate-800/50 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-700 text-[#2271b1] dark:text-[#72aee6] text-[10px] font-semibold uppercase rounded flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#2271b1] dark:text-[#72aee6]" /> {s.categoria}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#2271b1] dark:hover:text-[#72aee6] hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327] rounded transition-colors"
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
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#d63638] dark:hover:text-rose-400 hover:bg-[#fcf0f1] dark:hover:bg-rose-950/40 rounded transition-colors"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1d2327] dark:text-white">{s.nombre}</h3>
                {s.descripcion && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{s.descripcion}</p>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2271b1] dark:text-[#72aee6]" /> {s.duracion_min} min
                </span>
                <span className="text-sm font-mono font-bold text-[#00a32a] dark:text-emerald-400">
                  ${s.precio.toLocaleString('es-AR')}
                </span>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                s.activo ? 'bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] border border-[#2271b1]/30 dark:border-indigo-800/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-md shadow-2xl overflow-hidden transition-colors">
            <div className="p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
              <h3 className="font-bold text-[#1d2327] dark:text-white text-sm">
                {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio de Peluquería'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Corte Tijera & Baño Completo Caniche"
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Categoría</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1]"
                  >
                    <option value="Peluquería">Peluquería & Estética</option>
                    <option value="Baño & Deslanado">Baño & Deslanado</option>
                    <option value="Salud & Higiene">Salud & Higiene</option>
                    <option value="Baño Medicado">Baño Medicado / Piel</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Duración (minutos)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={duracionMin}
                    onChange={e => setDuracionMin(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Precio Sugerido ($ ARS)</label>
                <input
                  type="number"
                  min="0"
                  value={precio}
                  onChange={e => setPrecio(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#00a32a] dark:text-emerald-400 focus:border-[#2271b1] font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Descripción del Servicio</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalles de lo que incluye el servicio..."
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-activo"
                  checked={activo}
                  onChange={e => setActivo(e.target.checked)}
                  className="w-4 h-4 accent-[#2271b1] rounded bg-white dark:bg-[#161b22] border-[#8c8f94] dark:border-slate-700"
                />
                <label htmlFor="chk-activo" className="text-xs text-[#1d2327] dark:text-slate-200">
                  Servicio activo (disponible para selección)
                </label>
              </div>

              <div className="pt-3 border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50"
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
