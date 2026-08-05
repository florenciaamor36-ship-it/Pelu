import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit3,
  Trash2,
  CheckCircle2,
  Tag,
  DollarSign,
  TrendingDown,
  Layers
} from 'lucide-react';
import { Producto } from '../types';

interface InventarioManagerProps {
  productos: Producto[];
  onSaveProducto: (producto: Omit<Producto, 'id'> & { id?: string }) => Promise<Producto>;
  onDeleteProducto: (id: string) => Promise<void>;
}

export const InventarioManager: React.FC<InventarioManagerProps> = ({
  productos,
  onSaveProducto,
  onDeleteProducto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Shampoos');
  const [stockActual, setStockActual] = useState<number>(5);
  const [stockMinimo, setStockMinimo] = useState<number>(2);
  const [precioCosto, setPrecioCosto] = useState<number>(0);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [unidad, setUnidad] = useState('Unidades');
  const [saving, setSaving] = useState(false);

  const lowStockItems = productos.filter(p => p.stock_actual <= p.stock_minimo);
  const totalValorInventario = productos.reduce((acc, p) => acc + p.stock_actual * p.precio_costo, 0);

  const filteredProductos = productos.filter(p => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'todas' || p.categoria === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stock_actual <= p.stock_minimo;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categoriesList = Array.from(new Set(productos.map(p => p.categoria)));

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setNombre('');
    setCategoria('Shampoos');
    setStockActual(5);
    setStockMinimo(2);
    setPrecioCosto(5000);
    setPrecioVenta(8500);
    setUnidad('Botellas');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Producto) => {
    setEditingProducto(p);
    setNombre(p.nombre);
    setCategoria(p.categoria);
    setStockActual(p.stock_actual);
    setStockMinimo(p.stock_minimo);
    setPrecioCosto(p.precio_costo);
    setPrecioVenta(p.precio_venta || 0);
    setUnidad(p.unidad);
    setIsModalOpen(true);
  };

  const handleQuickStockChange = async (p: Producto, delta: number) => {
    const newStock = Math.max(0, p.stock_actual + delta);
    await onSaveProducto({
      ...p,
      stock_actual: newStock,
    });
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setSaving(true);
    try {
      await onSaveProducto({
        id: editingProducto?.id,
        nombre: nombre.trim(),
        categoria,
        stock_actual: Number(stockActual),
        stock_minimo: Number(stockMinimo),
        precio_costo: Number(precioCosto),
        precio_venta: Number(precioVenta),
        unidad,
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar el producto "${name}" del inventario?`)) {
      await onDeleteProducto(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 shadow-xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2271b1] dark:text-[#72aee6]" /> Inventario & Stock de Peluquería
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de insumos consumibles (shampoos, acondicionadores, perfumes, antipulgas) y accesorios.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Producto
        </button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-center gap-3 shadow-xs transition-colors">
          <div className="p-2.5 bg-[#f0f6fc] dark:bg-indigo-950/40 text-[#2271b1] dark:text-[#72aee6] rounded">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Productos</p>
            <p className="text-lg font-bold text-[#1d2327] dark:text-white">{productos.length}</p>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-center gap-3 shadow-xs transition-colors">
          <div className="p-2.5 bg-[#fcf0f1] dark:bg-rose-950/40 text-[#d63638] dark:text-rose-400 rounded">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Alertas de Stock Bajo</p>
            <p className="text-lg font-bold text-[#d63638] dark:text-rose-400">{lowStockItems.length}</p>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-center gap-3 shadow-xs transition-colors">
          <div className="p-2.5 bg-[#f0f6e8] dark:bg-emerald-950/40 text-[#00a32a] dark:text-emerald-400 rounded">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valor Total Inventario</p>
            <p className="text-lg font-bold text-[#00a32a] dark:text-emerald-400 font-mono">
              ${totalValorInventario.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              onlyLowStock
                ? 'bg-[#d63638] text-white border-[#d63638]'
                : 'bg-white dark:bg-[#161b22] text-[#2c3338] dark:text-slate-200 border-[#8c8f94] dark:border-slate-700 hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Stock Bajo ({lowStockItems.length})
          </button>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1]"
          >
            <option value="todas">Todas las Categorías</option>
            {categoriesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProductos.map(p => {
          const isLow = p.stock_actual <= p.stock_minimo;

          return (
            <div
              key={p.id}
              className={`bg-white dark:bg-[#161b22] border rounded p-4 flex flex-col justify-between transition-colors shadow-xs space-y-3 ${
                isLow ? 'border-[#d63638]/60 dark:border-rose-900/60 bg-[#fcf0f1]/50 dark:bg-rose-950/20' : 'border-[#c3c4c7] dark:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-700 text-[#2271b1] dark:text-[#72aee6] text-[10px] font-semibold rounded uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {p.categoria}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#2271b1] dark:hover:text-[#72aee6] hover:bg-[#f0f0f1] dark:hover:bg-[#1d2327] rounded transition-colors"
                      title="Editar producto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.nombre)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#d63638] dark:hover:text-rose-400 hover:bg-[#fcf0f1] dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#1d2327] dark:text-white">{p.nombre}</h3>

                {/* Pricing info */}
                <div className="flex items-center gap-3 text-xs pt-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    Costo: <span className="font-mono font-semibold text-[#1d2327] dark:text-slate-200">${p.precio_costo.toLocaleString('es-AR')}</span>
                  </span>
                  {p.precio_venta && p.precio_venta > 0 ? (
                    <span className="text-slate-500 dark:text-slate-400">
                      Venta: <span className="font-mono font-semibold text-[#00a32a] dark:text-emerald-400">${p.precio_venta.toLocaleString('es-AR')}</span>
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Stock Bar & Adjuster */}
              <div className="pt-2 border-t border-[#c3c4c7] dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Stock Actual ({p.unidad}):
                  </span>
                  <span className={`font-mono font-bold text-xs ${isLow ? 'text-[#d63638] dark:text-rose-400' : 'text-[#00a32a] dark:text-emerald-400'}`}>
                    {p.stock_actual} / min {p.stock_minimo}
                  </span>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center justify-between bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded p-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">Ajuste rápido:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickStockChange(p, -1)}
                      className="w-6 h-6 bg-[#e0e0e0] dark:bg-slate-800 hover:bg-[#d0d0d0] dark:hover:bg-slate-700 text-[#1d2327] dark:text-white font-bold rounded flex items-center justify-center text-xs"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleQuickStockChange(p, +1)}
                      className="w-6 h-6 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold rounded flex items-center justify-center text-xs"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleQuickStockChange(p, +5)}
                      className="w-7 h-6 bg-[#f0f6fc] dark:bg-indigo-950/40 hover:bg-[#e0f0fe] dark:hover:bg-indigo-900/60 text-[#2271b1] dark:text-[#72aee6] border border-[#2271b1]/30 dark:border-indigo-800/40 font-bold rounded flex items-center justify-center text-xs"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProductos.length === 0 && (
          <div className="col-span-full py-12 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded text-center space-y-3 transition-colors">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-[#1d2327] dark:text-white">No se encontraron productos</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o agrega un nuevo producto al stock.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 bg-[#2271b1] text-white text-xs font-semibold rounded hover:bg-[#135e96] transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agregar Producto
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-md shadow-2xl overflow-hidden transition-colors">
            <div className="p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
              <h3 className="font-bold text-[#1d2327] dark:text-white text-sm">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto / Insumo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Shampoo Hipoalergénico Avena 5L"
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
                    <option value="Shampoos">Shampoos</option>
                    <option value="Acondicionadores">Acondicionadores</option>
                    <option value="Accesorios & Estética">Accesorios & Estética</option>
                    <option value="Salud & Antiparasitarios">Salud & Antiparasitarios</option>
                    <option value="Herramientas">Herramientas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Unidad de Medida</label>
                  <input
                    type="text"
                    value={unidad}
                    onChange={e => setUnidad(e.target.value)}
                    placeholder="Ej: Botellas, Litros..."
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={stockActual}
                    onChange={e => setStockActual(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="0"
                    value={stockMinimo}
                    onChange={e => setStockMinimo(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Precio de Costo ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={precioCosto}
                    onChange={e => setPrecioCosto(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-200">Precio de Venta (Opcional $)</label>
                  <input
                    type="number"
                    min="0"
                    value={precioVenta}
                    onChange={e => setPrecioVenta(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 focus:border-[#2271b1] font-mono"
                  />
                </div>
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
                  {saving ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
