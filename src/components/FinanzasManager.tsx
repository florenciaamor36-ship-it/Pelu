import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Receipt,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Gasto, Turno } from '../types';

interface FinanzasManagerProps {
  gastos: Gasto[];
  turnos: Turno[];
  moneda?: string;
  onSaveGasto: (gasto: Omit<Gasto, 'id'> & { id?: string }) => Promise<Gasto>;
  onDeleteGasto: (id: string) => Promise<void>;
}

export const FinanzasManager: React.FC<FinanzasManagerProps> = ({
  gastos,
  turnos,
  moneda = '$',
  onSaveGasto,
  onDeleteGasto,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState<number>(0);
  const [categoria, setCategoria] = useState('Insumos');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  // Financial calculations
  const totalIngresos = turnos
    .filter(t => t.estado === 'completado' || t.estado === 'confirmado' || t.estado === 'en_proceso')
    .reduce((acc, t) => acc + (t.precio_cobrado || 0), 0);

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const balanceNeto = totalIngresos - totalGastos;

  const handleOpenCreate = () => {
    setConcepto('');
    setMonto(15000);
    setCategoria('Insumos');
    setFecha(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || monto <= 0) return;

    setSaving(true);
    try {
      await onSaveGasto({
        concepto: concepto.trim(),
        monto: Number(monto),
        categoria,
        fecha,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el gasto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta entrada de gasto?')) {
      await onDeleteGasto(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Control Financiero & Gastos
          </h2>
          <p className="text-xs text-slate-400">
            Seguimiento de ingresos por peluquería canina vs gastos operativos (insumos, luz, local, tijeras).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Gasto
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#12151c] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Ingresos por Turnos</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {moneda} {totalIngresos.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500">De turnos activos y entregados</p>
        </div>

        <div className="p-5 bg-[#12151c] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Gastos Registrados</span>
            <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono">
            {moneda} {totalGastos.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500">Insumos, local y servicios</p>
        </div>

        <div className="p-5 bg-[#12151c] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Balance Estimado</span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className={`text-2xl font-bold font-mono ${balanceNeto >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {moneda} {balanceNeto.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500">Ganancia neta del negocio</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#12151c] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-400" /> Historial de Gastos
          </h3>
          <span className="text-xs text-slate-400 font-mono">{gastos.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0a0c10] text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Concepto / Detalle</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Monto ($)</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {gastos.map(g => (
                <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{g.concepto}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px] font-medium border border-slate-700">
                      {g.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{g.fecha}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">
                    -${g.monto.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {gastos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    No se han registrado gastos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE GASTO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-sm">
          <div className="bg-[#12151c] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-[#0a0c10]/60 flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">Registrar Nuevo Gasto</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Concepto del Gasto *</label>
                <input
                  type="text"
                  required
                  value={concepto}
                  onChange={e => setConcepto(e.target.value)}
                  placeholder="Ej: Compra de 5L Shampoo Avena, Factura Luz, Afilado Tijeras..."
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Monto ($ ARS) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={monto}
                    onChange={e => setMonto(Number(e.target.value))}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Categoría</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Insumos">Insumos & Shampoos</option>
                    <option value="Herramientas">Herramientas & Maquinarias</option>
                    <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                    <option value="Alquiler">Alquiler del Local</option>
                    <option value="Varios">Varios / Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Fecha del Gasto</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
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
                  {saving ? 'Guardando...' : 'Guardar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
