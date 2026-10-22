import React, { useState } from 'react';
import { LossEvent, BCRACategory, BCRA_CATEGORIES, ProcessArea } from '../types';
import { Database, Plus, Search, Filter, AlertCircle, DollarSign, ShieldAlert, CheckCircle2, FileSpreadsheet, Download, RefreshCw, X, Calendar, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BcraLossEventDatabaseProps {
  events: LossEvent[];
  onAddEvent: (newEvent: LossEvent) => void;
  onUpdateEvent: (id: string, updates: Partial<LossEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

export const BcraLossEventDatabase: React.FC<BcraLossEventDatabaseProps> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [formCategory, setFormCategory] = useState<BCRACategory>('Fraude Externo');
  const [formArea, setFormArea] = useState<ProcessArea>('Fraude');
  const [formDesc, setFormDesc] = useState('');
  const [formGrossARS, setFormGrossARS] = useState<number>(1000000);
  const [formRecoveryARS, setFormRecoveryARS] = useState<number>(0);
  const [formDateOccurred, setFormDateOccurred] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formResponsible, setFormResponsible] = useState<string>('Oficial de Prevención de Fraude');

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    const matchCategory = selectedCategory === 'TODAS' || evt.bcraCategory === selectedCategory;
    const matchStatus = selectedStatus === 'TODOS' || evt.status === selectedStatus;
    const matchSearch = evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        evt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        evt.responsibleArea.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  // KPI Calculations
  const totalGrossLoss = events.reduce((sum, e) => sum + e.grossAmountARS, 0);
  const totalRecoveries = events.reduce((sum, e) => sum + e.recoveryAmountARS, 0);
  const totalNetLoss = totalGrossLoss - totalRecoveries;

  // Highest Loss Category
  const categoryTotals: Record<string, number> = {};
  events.forEach(e => {
    categoryTotals[e.bcraCategory] = (categoryTotals[e.bcraCategory] || 0) + e.netAmountARS;
  });
  let highestCategory = 'N/A';
  let highestVal = -1;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > highestVal) {
      highestVal = val;
      highestCategory = cat;
    }
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) return;

    const gross = Number(formGrossARS) || 0;
    const rec = Number(formRecoveryARS) || 0;
    const net = Math.max(0, gross - rec);

    const newEvt: LossEvent = {
      id: `EV-ARG-${Date.now().toString().slice(-4)}`,
      code: `EV-BCRA-2026-${(events.length + 1).toString().padStart(3, '0')}`,
      dateOccurred: formDateOccurred,
      dateDiscovered: formDateOccurred,
      dateAccounted: new Date().toISOString().slice(0, 10),
      bcraCategory: formCategory,
      processArea: formArea,
      description: formDesc,
      grossAmountARS: gross,
      recoveryAmountARS: rec,
      netAmountARS: net,
      status: rec >= gross && gross > 0 ? 'Recuperado' : 'Confirmado',
      responsibleArea: formResponsible
    };

    onAddEvent(newEvt);
    setFormDesc('');
    setFormGrossARS(1000000);
    setFormRecoveryARS(0);
    setShowAddModal(false);
  };

  const exportCSV = () => {
    const headers = ['Codigo', 'Fecha', 'Categoria_BCRA', 'Area', 'Descripcion', 'Monto_Bruto_ARS', 'Recupero_ARS', 'Perdida_Neta_ARS', 'Estado', 'Responsable'];
    const rows = events.map(e => [
      e.code,
      e.dateOccurred,
      `"${e.bcraCategory}"`,
      e.processArea,
      `"${e.description.replace(/"/g, '""')}"`,
      e.grossAmountARS,
      e.recoveryAmountARS,
      e.netAmountARS,
      e.status,
      `"${e.responsibleArea}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LED_Loss_Events_BCRA_A7783_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-400/30">
              <Database size={14} /> BCRA Com. A 7783 - Sección 3.2
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Base de Datos de Eventos de Pérdida (LED)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Registro obligatorio e inmutable de eventos de pérdida operacional reales, contabilizados bajo las 7 categorías estandarizadas del Banco Central de la República Argentina (BCRA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download size={15} /> Exportar LED (.csv)
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Registrar Evento de Pérdida
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pérdida Bruta Acumulada</span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
            ${Math.round(totalGrossLoss).toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-1">Total contabilizado antes de recuperos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Recuperos Efectivos</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            ${Math.round(totalRecoveries).toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-1">Recuperado por seguros/contracargos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Impacto Neto Residual</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ${Math.round(totalNetLoss).toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-1">Carga real sobre el patrimonio</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Categoría de Mayor Pérdida</span>
          <div className="text-sm font-black text-indigo-900 truncate" title={highestCategory}>
            {highestCategory}
          </div>
          <p className="text-[11px] text-indigo-600 font-bold pt-1">
            {events.length} eventos registrados en LED
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por código, descripción o responsable..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Categoría BCRA:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODAS">TODAS LAS CATEGORÍAS (7)</option>
                {BCRA_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Estado:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">TODOS LOS ESTADOS</option>
                <option value="En Investigación">En Investigación</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Recuperado">Recuperado</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-indigo-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Listado Oficial de Eventos de Pérdida LED ({filteredEvents.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Com. A 7783 - BCRA Compliance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Código / Fecha</th>
                <th className="p-3.5">Categoría BCRA A 7783</th>
                <th className="p-3.5">Área / Proceso</th>
                <th className="p-3.5">Descripción del Evento</th>
                <th className="p-3.5 text-right">Pérdida Bruta (ARS)</th>
                <th className="p-3.5 text-right">Recupero (ARS)</th>
                <th className="p-3.5 text-right">Pérdida Neta (ARS)</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    No hay eventos de pérdida registrados que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      <div>{evt.code}</div>
                      <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {evt.dateOccurred}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-[10px] border border-indigo-200/80">
                        🇦🇷 {evt.bcraCategory}
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-800">
                      <div>{evt.processArea}</div>
                      <div className="text-[10px] text-slate-400">{evt.responsibleArea}</div>
                    </td>

                    <td className="p-3.5 max-w-xs leading-relaxed text-slate-800">
                      {evt.description}
                    </td>

                    <td className="p-3.5 text-right font-mono font-extrabold text-rose-700">
                      ${Math.round(evt.grossAmountARS).toLocaleString('es-AR')}
                    </td>

                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600">
                      ${Math.round(evt.recoveryAmountARS).toLocaleString('es-AR')}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-slate-900">
                      ${Math.round(evt.netAmountARS).toLocaleString('es-AR')}
                    </td>

                    <td className="p-3.5 text-center">
                      <select
                        value={evt.status}
                        onChange={e => onUpdateEvent(evt.id, { status: e.target.value as any })}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                          evt.status === 'Recuperado' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          evt.status === 'Confirmado' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          evt.status === 'En Investigación' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="En Investigación">🔍 En Investigación</option>
                        <option value="Confirmado">🔴 Confirmado</option>
                        <option value="Recuperado">🟢 Recuperado</option>
                        <option value="Cerrado">⚪ Cerrado</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onDeleteEvent(evt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar evento de pérdida"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Loss Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-blue-400" />
                  <h3 className="font-bold text-sm">Registrar Nuevo Evento de Pérdida (LED BCRA)</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs font-medium text-slate-700">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Categoría BCRA Com. A 7783</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as BCRACategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {BCRA_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Área Operativa</label>
                    <select
                      value={formArea}
                      onChange={e => setFormArea(e.target.value as ProcessArea)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      <option value="Fraude">Fraude</option>
                      <option value="Operaciones">Operaciones</option>
                      <option value="Cumplimiento">Cumplimiento</option>
                      <option value="Mesa de Dinero">Mesa de Dinero</option>
                      <option value="Ciberseguridad">Ciberseguridad</option>
                      <option value="TI">TI</option>
                      <option value="Nuevos Productos">Nuevos Productos</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Fecha Ocurrencia</label>
                    <input
                      type="date"
                      value={formDateOccurred}
                      onChange={e => setFormDateOccurred(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Descripción del Evento de Pérdida</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describa el incidente, causas determinantes e impacto cuantificado..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Monto Pérdida Bruta (ARS)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formGrossARS}
                      onChange={e => setFormGrossARS(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-rose-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Monto Recupero (ARS)</label>
                    <input
                      type="number"
                      min={0}
                      value={formRecoveryARS}
                      onChange={e => setFormRecoveryARS(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Área Responsable de la Gestión</label>
                  <input
                    type="text"
                    required
                    value={formResponsible}
                    onChange={e => setFormResponsible(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Guardar Evento en LED
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
