import React, { useState } from 'react';
import { Users, Search, Plus, Phone, Mail, FileText, Calendar, DollarSign, MessageCircle, Trash2, Edit3, X, User } from 'lucide-react';
import { Cliente, Turno } from '../types';

interface ClientesManagerProps {
  clientes: Cliente[];
  turnos: Turno[];
  onSaveCliente: (cliente: Omit<Cliente, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onDeleteCliente: (id: string) => Promise<void>;
  onOpenNewTurnoForClient?: (clienteId: string) => void;
}

export const ClientesManager: React.FC<ClientesManagerProps> = ({
  clientes,
  turnos,
  onSaveCliente,
  onDeleteCliente,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<Partial<Cliente> | null>(null);

  // Form states
  const [formNombre, setFormNombre] = useState<string>('');
  const [formTelefono, setFormTelefono] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formNotas, setFormNotas] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const filteredClientes = clientes.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleOpenCreateModal = () => {
    setEditingCliente(null);
    setFormNombre('');
    setFormTelefono('');
    setFormEmail('');
    setFormNotas('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setFormNombre(c.nombre);
    setFormTelefono(c.telefono);
    setFormEmail(c.email || '');
    setFormNotas(c.notas || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formTelefono.trim()) {
      alert('Nombre y teléfono son campos requeridos.');
      return;
    }

    setSaving(true);
    try {
      await onSaveCliente({
        id: editingCliente?.id,
        nombre: formNombre,
        telefono: formTelefono,
        email: formEmail,
        notas: formNotas,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar cliente.');
    } finally {
      setSaving(false);
    }
  };

  const getClientTurnos = (clienteId: string) => {
    return turnos.filter(t => t.cliente_id === clienteId);
  };

  const getClientTotalSpend = (clienteId: string) => {
    return getClientTurnos(clienteId)
      .filter(t => t.estado === 'completado' || t.estado === 'confirmado')
      .reduce((acc, curr) => acc + (curr.precio_cobrado || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded p-4 shadow-xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2271b1] dark:text-[#72aee6]" /> Directorio de Clientes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administra los contactos de Gustavo Bettiol, historial de turnos y facturación por cliente.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search box */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, teléfono o email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded pl-9 pr-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
        />
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map(c => {
          const clientTurnos = getClientTurnos(c.id);
          const totalSpend = getClientTotalSpend(c.id);
          const cleanPhone = c.telefono.replace(/[^\d]/g, '');

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 hover:border-[#8c8f94] dark:hover:border-slate-700 rounded p-4 flex flex-col justify-between transition-colors shadow-xs group space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#f0f6fc] dark:bg-indigo-950/40 border border-[#2271b1]/20 dark:border-indigo-800/40 text-[#2271b1] dark:text-[#72aee6] font-bold flex items-center justify-center text-xs">
                      {c.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1d2327] dark:text-white group-hover:text-[#2271b1] dark:group-hover:text-[#72aee6] transition-colors">
                        {c.nombre}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.telefono}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#2271b1] dark:hover:text-[#72aee6] hover:bg-[#f0f0f1] dark:hover:bg-slate-800 rounded transition-colors"
                      title="Editar cliente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar cliente ${c.nombre}?`)) {
                          onDeleteCliente(c.id);
                        }
                      }}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#d63638] dark:hover:text-rose-400 hover:bg-[#fcf0f1] dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {c.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pl-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
                  </p>
                )}

                {c.notas && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-[#f6f7f7] dark:bg-[#0e1117] p-2 rounded border border-[#c3c4c7] dark:border-slate-800 italic">
                    "{c.notas}"
                  </p>
                )}

                {/* Stats bar */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#c3c4c7] dark:border-slate-800 text-xs">
                  <div className="bg-[#f6f7f7] dark:bg-[#0e1117] p-2 rounded border border-[#c3c4c7] dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Turnos Registrados</span>
                    <span className="font-bold text-[#1d2327] dark:text-white font-mono">{clientTurnos.length}</span>
                  </div>
                  <div className="bg-[#f6f7f7] dark:bg-[#0e1117] p-2 rounded border border-[#c3c4c7] dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Inversión Total</span>
                    <span className="font-bold text-[#00a32a] dark:text-emerald-400 font-mono">
                      ${totalSpend.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#c3c4c7] dark:border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-[#f0f6e8] dark:bg-emerald-950/40 border border-[#00a32a]/30 dark:border-emerald-900/40 text-[#00a32a] dark:text-emerald-400 rounded text-xs font-semibold flex items-center gap-1 hover:bg-[#e0f0d8] dark:hover:bg-emerald-900/60 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#00a32a] dark:text-emerald-400" /> WhatsApp
                </a>

                <button
                  onClick={() => setSelectedCliente(c)}
                  className="px-2.5 py-1 bg-[#f6f7f7] dark:bg-slate-800 hover:bg-[#f0f0f1] dark:hover:bg-slate-700 border border-[#8c8f94] dark:border-slate-700 text-[#2c3338] dark:text-slate-200 rounded text-xs font-semibold transition-colors"
                >
                  Ver Historial
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLIENT DETAILS DRAWER/MODAL */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-xl shadow-2xl overflow-hidden my-8 transition-colors">
            <div className="p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1d2327] dark:text-white text-sm">{selectedCliente.nombre}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedCliente.telefono}</p>
              </div>
              <button
                onClick={() => setSelectedCliente(null)}
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-[#f6f7f7] dark:bg-[#0e1117] p-3 rounded border border-[#c3c4c7] dark:border-slate-800 space-y-1.5">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-[#1d2327] dark:text-white">Email:</strong> {selectedCliente.email || 'No registrado'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-[#1d2327] dark:text-white">Notas internas:</strong> {selectedCliente.notas || 'Sin notas'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#1d2327] dark:text-white uppercase tracking-wider mb-2">
                  Historial de Turnos de {selectedCliente.nombre}
                </h4>

                {getClientTurnos(selectedCliente.id).length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">Este cliente aún no tiene turnos registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {getClientTurnos(selectedCliente.id).map(t => {
                      const fechaObj = new Date(t.fecha_hora);
                      return (
                        <div key={t.id} className="p-2.5 bg-[#f6f7f7] dark:bg-[#0e1117] border border-[#c3c4c7] dark:border-slate-800 rounded flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#1d2327] dark:text-white">
                              {fechaObj.toLocaleDateString('es-AR')} — {fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">{t.servicio?.nombre || 'Consulta'}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#00a32a] dark:text-emerald-400 block">${t.precio_cobrado}</span>
                            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">{t.estado}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded w-full max-w-md shadow-2xl overflow-hidden transition-colors">
            <div className="p-4 border-b border-[#c3c4c7] dark:border-slate-800 bg-[#f6f7f7] dark:bg-[#0e1117] flex items-center justify-between">
              <h3 className="font-bold text-[#1d2327] dark:text-white text-sm">
                {editingCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-[#1d2327] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Nombre Completo o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  placeholder="Ej: Distribuidora Norte S.A."
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={formTelefono}
                  onChange={e => setFormTelefono(e.target.value)}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Correo Electrónico (opcional)</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1d2327] dark:text-slate-300">Notas / Preferencias del Cliente</label>
                <textarea
                  rows={3}
                  value={formNotas}
                  onChange={e => setFormNotas(e.target.value)}
                  placeholder="Detalles clave, preferencias de horario, facturación..."
                  className="w-full bg-white dark:bg-[#0e1117] border border-[#8c8f94] dark:border-slate-700 rounded px-3 py-1.5 text-xs text-[#2c3338] dark:text-slate-100 placeholder-slate-400 focus:border-[#2271b1] resize-none"
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
                  {saving ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
