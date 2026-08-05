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
  const [categoria, setCategoria] = useState<Gasto['categoria']>('Insumos');
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
        descripcion: concepto.trim(),
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 shadow-xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2271b1] dark:text-[#72aee6]" /> Control Financiero & Gastos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seguimiento de ingresos por peluquería canina vs gastos operativos (insumos, luz, local, tijeras).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Gasto
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-1.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Ingresos por Turnos</span>
            <span className="p-1.5 bg-[#f0f6e8] dark:bg-emerald-950/40 text-[#00a32a] dark:text-emerald-400 rounded">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-bold text-[#00a32a] dark:text-emerald-400 font-mono">
            {moneda} {totalIngresos.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">De turnos activos y entregados</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-1.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total Gastos Registrados</span>
            <span className="p-1.5 bg-[#fcf0f1] dark:bg-rose-950/40 text-[#d63638] dark:text-rose-400 rounded">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-bold text-[#d63638] dark:text-rose-400 font-mono">
            {moneda} {totalGastos.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Insumos, local y servicios</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded space-y-1.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Balance Estimado</span>
            <span className="p-1.5 bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] rounded">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className={`text-xl font-bold font-mono ${balanceNeto >= 0 ? 'text-[#2271b1] dark:text-[#72aee6]' : 'text-[#d63638] dark:text-rose-400'}`}>
            {moneda} {balanceNeto.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Ganancia neta del negocio</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded overflow-hidden shadow-xs transition-colors">
        <div className="p-3.5 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
          <h3 className="font-bold text-[#1d2327] dark:text-white text-xs flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#2271b1] dark:text-[#72aee6]" /> Historial de Gastos
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{gastos.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2c3338] dark:text-slate-200">
            <thead className="bg-[#f6f7f7] dark:bg-[#0e1117] text-slate-600 dark:text-slate-300 uppercase font-mono text-[10px] border-b border-[#c3c4c7] dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Concepto / Detalle</th>
                <th className="px-4 py-2.5">Categoría</th>
                <th className="px-4 py-2.5">Fecha</th>
                <th className="px-4 py-2.5 text-right">Monto ($)</th>
                <th className="px-4 py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c4c7] dark:divide-slate-800">
              {gastos.map(g => (
                <tr key={g.id} className="hover:bg-[#f6f7f7] dark:hover:bg-[#0e1117]/60 transition-colors">
                  <td className="px-4 py-2.5 font-semibold text-[#1d2327] dark:text-white">{g.descripcion || (g as unknown as { concepto?: string }).concepto}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] text-[10px] font-medium border border-[#2271b1]/30 dark:border-indigo-800/40">
                      {g.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-mono">{g.fecha}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-[#d63638] dark:text-rose-400">
                    -${g.monto.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#d63638] dark:hover:text-rose-400 hover:bg-[#fcf0f1] dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {gastos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-md shadow-2xl overflow-hidden transition-colors">
            <div className="p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
              <h3 className="font-bold text-[#1d2327] dark:text-white text-sm">Registrar Nuevo Gasto</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Concepto del Gasto *</label>
                <input
                  type="text"
                  required
                  value={concepto}
                  onChange={e => setConcepto(e.target.value)}
                  placeholder="Ej: Compra de 5L Shampoo Avena, Factura Luz, Afilado Tijeras..."
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Monto ($ ARS) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={monto}
                    onChange={e => setMonto(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Categoría</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as Gasto['categoria'])}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1]"
                  >
                    <option value="Insumos">Insumos & Shampoos</option>
                    <option value="Servicios & Alquiler">Servicios & Alquiler</option>
                    <option value="Mantenimiento Equipos">Mantenimiento Equipos</option>
                    <option value="Sueldos">Sueldos</option>
                    <option value="Otros">Otros / Varios</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Fecha del Gasto</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1]"
                />
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
