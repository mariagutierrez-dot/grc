import React, { useState, useMemo } from 'react';
import { Risk, AssociatedControl, ControlType, ProcessArea, getAcceptability } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle, 
  FileSpreadsheet, 
  FileText, 
  Cpu, 
  UserCheck, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  Edit3, 
  Save, 
  X, 
  Info,
  Sliders,
  Check,
  RefreshCw,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ControlRatingModal from './ControlRatingModal';

interface CompanyControlsModuleProps {
  risks: Risk[];
  onUpdateRisk?: (riskId: string, updates: Partial<Risk>) => void;
}

export interface CompanyControlItem {
  id: string;
  riskId: string;
  riskProcessArea: ProcessArea;
  riskTitle: string;
  causeMitigated: string;
  description: string;
  type: ControlType;
  mechanism: 'Automático' | 'Semiautomático' | 'Manual';
  frequency: 'Continuo' | 'Diario' | 'Semanal' | 'Mensual' | 'A requerimiento';
  efficiency: 'Excelente' | 'Buena' | 'Suficiente' | 'Deficiente';
  owner: string;
  impactReduction: number;
  probabilityReduction: number;
  isCompanyEstablished: boolean; // ALWAYS true for this module to differentiate from AI
  lastVerifiedDate?: string;
  controlIndex?: number;
}

export const CompanyControlsModule: React.FC<CompanyControlsModuleProps> = ({ risks, onUpdateRisk }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('TODOS');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [selectedMechanism, setSelectedMechanism] = useState<string>('TODOS');
  const [selectedEfficiency, setSelectedEfficiency] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Rating Modal state
  const [ratingModalRisk, setRatingModalRisk] = useState<Risk | null>(null);
  const [ratingModalControl, setRatingModalControl] = useState<AssociatedControl | null>(null);

  const handleSaveControlFromRatingModal = (updatedControl: AssociatedControl, riskUpdates?: Partial<Risk>) => {
    if (!ratingModalRisk || !onUpdateRisk) return;
    const currentControls = ratingModalRisk.associatedControls || [];
    let newControls: AssociatedControl[];

    if (ratingModalControl) {
      newControls = currentControls.map(c => c.id === updatedControl.id ? updatedControl : c);
    } else {
      newControls = [...currentControls, updatedControl];
    }

    const targetInherentImpact = riskUpdates?.impact ?? ratingModalRisk.impact;
    const targetInherentProbability = riskUpdates?.probability ?? ratingModalRisk.probability;

    const totalImpactReduction = newControls.reduce((sum, c) => sum + (c.impactReduction || 0), 0);
    const totalProbReduction = newControls.reduce((sum, c) => sum + (c.probabilityReduction || 0), 0);
    const residualImpact = Math.max(1, targetInherentImpact - totalImpactReduction);
    const residualProbability = Math.max(1, targetInherentProbability - totalProbReduction);

    onUpdateRisk(ratingModalRisk.id, {
      ...riskUpdates,
      associatedControls: newControls,
      residualImpact,
      residualProbability,
      acceptability: getAcceptability(residualImpact * residualProbability)
    });

    setRatingModalRisk(null);
    setRatingModalControl(null);
    triggerDownloadSuccess('Control oficial calificado y actualizado según metodología.');
  };

  const openRatingModalForControl = (ctrl: CompanyControlItem) => {
    const targetRisk = risks.find(r => r.id === ctrl.riskId);
    if (targetRisk) {
      const assCtrl = targetRisk.associatedControls?.find(c => c.id === ctrl.id) || {
        id: ctrl.id,
        description: ctrl.description,
        type: ctrl.type,
        efficiency: (ctrl.efficiency === 'Buena' ? 'Bueno' : ctrl.efficiency === 'Suficiente' ? 'Bueno' : ctrl.efficiency === 'Deficiente' ? 'Débil' : ctrl.efficiency) as any,
        impactReduction: ctrl.impactReduction,
        probabilityReduction: ctrl.probabilityReduction,
        owner: ctrl.owner,
        mechanism: ctrl.mechanism
      };
      setRatingModalRisk(targetRisk);
      setRatingModalControl(assCtrl);
    }
  };

  const openRatingModalForNew = () => {
    if (risks.length > 0) {
      setRatingModalRisk(risks[0]);
      setRatingModalControl(null);
    }
  };

  // Edit Modal / Form state
  const [editingControl, setEditingControl] = useState<CompanyControlItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newControlForm, setNewControlForm] = useState<{
    riskId: string;
    description: string;
    type: ControlType;
    mechanism: 'Automático' | 'Semiautomático' | 'Manual';
    frequency: 'Continuo' | 'Diario' | 'Semanal' | 'Mensual' | 'A requerimiento';
    efficiency: 'Excelente' | 'Buena' | 'Suficiente' | 'Deficiente';
    owner: string;
    impactReduction: number;
    probabilityReduction: number;
  }>({
    riskId: risks[0]?.id || 'R-OPS-001',
    description: '',
    type: 'Preventivo',
    mechanism: 'Automático',
    frequency: 'Continuo',
    efficiency: 'Excelente',
    owner: 'Dueño de Proceso Global66',
    impactReduction: 1,
    probabilityReduction: 1
  });

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Flatten all official associated controls from the risks catalog
  const companyControls = useMemo<CompanyControlItem[]>(() => {
    const items: CompanyControlItem[] = [];

    risks.forEach((risk) => {
      if (risk.associatedControls && risk.associatedControls.length > 0) {
        risk.associatedControls.forEach((ctrl, idx) => {
          // Infer mechanism based on description
          const lower = ctrl.description.toLowerCase();
          let mechanism: 'Automático' | 'Semiautomático' | 'Manual' = 'Semiautomático';
          if (lower.includes('api') || lower.includes('automátic') || lower.includes('automatiz') || lower.includes('motor') || lower.includes('cifrado') || lower.includes('sistema') || lower.includes('bot') || lower.includes('waf') || lower.includes('jit')) {
            mechanism = 'Automático';
          } else if (lower.includes('manual') || lower.includes('política') || lower.includes('protocolo') || lower.includes('firma') || lower.includes('revisión manual') || lower.includes('capatación')) {
            mechanism = 'Manual';
          }

          // Infer frequency
          let frequency: 'Continuo' | 'Diario' | 'Semanal' | 'Mensual' | 'A requerimiento' = 'Continuo';
          if (lower.includes('diari')) frequency = 'Diario';
          else if (lower.includes('semanal')) frequency = 'Semanal';
          else if (lower.includes('mensual') || lower.includes('cierre')) frequency = 'Mensual';
          else if (lower.includes('requerimiento') || lower.includes('evento')) frequency = 'A requerimiento';

          items.push({
            id: ctrl.id || `C-${risk.id}-${idx + 1}`,
            riskId: risk.id,
            riskProcessArea: risk.processArea,
            riskTitle: risk.process || risk.riskDescription.substring(0, 60),
            causeMitigated: risk.cause,
            description: ctrl.description,
            type: ctrl.type,
            mechanism,
            frequency,
            efficiency: (ctrl.efficiency as any) || 'Excelente',
            owner: risk.roamOwner || 'Líder del Proceso',
            impactReduction: ctrl.impactReduction ?? 1,
            probabilityReduction: ctrl.probabilityReduction ?? 1,
            isCompanyEstablished: true,
            lastVerifiedDate: '2026-08-15'
          });
        });
      }
    });

    return items;
  }, [risks]);

  // Filtered list
  const filteredControls = useMemo(() => {
    return companyControls.filter((ctrl) => {
      const matchSearch = 
        ctrl.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctrl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctrl.riskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctrl.riskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctrl.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctrl.causeMitigated.toLowerCase().includes(searchTerm.toLowerCase());

      const matchArea = selectedArea === 'TODOS' || ctrl.riskProcessArea === selectedArea;
      const matchType = selectedType === 'TODOS' || ctrl.type === selectedType;
      const matchMechanism = selectedMechanism === 'TODOS' || ctrl.mechanism === selectedMechanism;
      const matchEfficiency = selectedEfficiency === 'TODOS' || ctrl.efficiency === selectedEfficiency;

      return matchSearch && matchArea && matchType && matchMechanism && matchEfficiency;
    });
  }, [companyControls, searchTerm, selectedArea, selectedType, selectedMechanism, selectedEfficiency]);

  // Metric summaries
  const totalCount = companyControls.length;
  const preventivosCount = companyControls.filter(c => c.type === 'Preventivo').length;
  const detectivosCount = companyControls.filter(c => c.type === 'Detectivo').length;
  const correctivosCount = companyControls.filter(c => c.type === 'Correctivo').length;
  const automaticosCount = companyControls.filter(c => c.mechanism === 'Automático').length;

  const triggerDownloadSuccess = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['ID Control', 'ID Riesgo', 'Área', 'Descripción Control', 'Tipo', 'Mecanismo', 'Frecuencia', 'Eficacia', 'Propietario'];
    const rows = filteredControls.map(c => [
      c.id,
      c.riskId,
      c.riskProcessArea,
      `"${c.description.replace(/"/g, '""')}"`,
      c.type,
      c.mechanism,
      c.frequency,
      c.efficiency,
      `"${c.owner.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventario_Controles_Establecidos_Global66_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerDownloadSuccess('Inventario de Controles exportado en CSV.');
  };

  const handleSaveEditControl = () => {
    if (!editingControl || !onUpdateRisk) return;

    const targetRisk = risks.find(r => r.id === editingControl.riskId);
    if (!targetRisk) return;

    const updatedAssociatedControls = (targetRisk.associatedControls || []).map(c => {
      if (c.id === editingControl.id) {
        return {
          ...c,
          description: editingControl.description,
          type: editingControl.type,
          efficiency: editingControl.efficiency as any,
          impactReduction: editingControl.impactReduction,
          probabilityReduction: editingControl.probabilityReduction
        };
      }
      return c;
    });

    onUpdateRisk(targetRisk.id, {
      associatedControls: updatedAssociatedControls
    });

    setEditingControl(null);
    triggerDownloadSuccess('Control de la compañía actualizado correctamente.');
  };

  const handleCreateNewControl = () => {
    if (!newControlForm.description.trim() || !onUpdateRisk) return;

    const targetRisk = risks.find(r => r.id === newControlForm.riskId);
    if (!targetRisk) return;

    const newControlId = `C-${targetRisk.id}-${(targetRisk.associatedControls?.length || 0) + 1}`;
    const newControl: AssociatedControl = {
      id: newControlId,
      description: newControlForm.description.trim(),
      type: newControlForm.type,
      efficiency: newControlForm.efficiency as any,
      impactReduction: newControlForm.impactReduction,
      probabilityReduction: newControlForm.probabilityReduction
    };

    const updatedAssociatedControls = [...(targetRisk.associatedControls || []), newControl];

    onUpdateRisk(targetRisk.id, {
      associatedControls: updatedAssociatedControls
    });

    setIsAddingNew(false);
    setNewControlForm({
      riskId: risks[0]?.id || 'R-OPS-001',
      description: '',
      type: 'Preventivo',
      mechanism: 'Automático',
      frequency: 'Continuo',
      efficiency: 'Excelente',
      owner: 'Dueño de Proceso Global66',
      impactReduction: 1,
      probabilityReduction: 1
    });

    triggerDownloadSuccess('Nuevo Control Oficial registrado e integrado en el riesgo.');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Distinction Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <Building2 size={12} />
                Controles Oficiales de la Compañía
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                NO IA • Implementados & Vigentes
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="text-emerald-400 shrink-0" size={32} />
              Inventario de Controles Establecidos de Global66
            </h2>

            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              Catálogo oficial de salvaguardas y mecanismos de control interno aprobados por los dueños de proceso (ROAM Owners) y auditores. A diferencia de las sugerencias generadas por IA, estos controles forman parte de la arquitectura operativa real de la compañía.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={openRatingModalForNew}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Registrar Control Oficial
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} className="text-emerald-400" />
              Exportar (.CSV)
            </button>
          </div>
        </div>

        {/* Warning Badge comparing vs AI controls */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <CheckCircle size={14} />
            </div>
            <span>
              <strong>Diferenciación Operativa:</strong> Este inventario contiene únicamente los <span className="text-emerald-300 font-bold">{totalCount} controles reales</span>. Los controles propuestos por IA se gestionan por separado en el módulo de Propuestas.
            </span>
          </div>

          {downloadSuccess && (
            <motion.span 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1 bg-emerald-950 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-800 flex items-center gap-1.5"
            >
              <Check size={14} /> {downloadSuccess}
            </motion.span>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Controles Reales</span>
          <p className="text-3xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[10px] font-bold text-emerald-600 block">100% Verificados en Proceso</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Controles Preventivos</span>
          <p className="text-3xl font-black text-blue-600">{preventivosCount}</p>
          <span className="text-[10px] font-medium text-slate-500 block">
            {totalCount > 0 ? Math.round((preventivosCount / totalCount) * 100) : 0}% del inventario
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Controles Detectivos</span>
          <p className="text-3xl font-black text-amber-600">{detectivosCount}</p>
          <span className="text-[10px] font-medium text-slate-500 block">
            {totalCount > 0 ? Math.round((detectivosCount / totalCount) * 100) : 0}% del inventario
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Automatización Sistémica</span>
          <p className="text-3xl font-black text-purple-600">{automaticosCount}</p>
          <span className="text-[10px] font-medium text-purple-700 block font-bold">
            {totalCount > 0 ? Math.round((automaticosCount / totalCount) * 100) : 0}% Automáticos / API
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, descripción de control, riesgo o responsable..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mode toggle button */}
          <div className="flex p-1 bg-slate-100 rounded-xl shrink-0 self-start lg:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tabla Detallada
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Área de Proceso:</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todas las Áreas</option>
              <option value="Cumplimiento">Cumplimiento</option>
              <option value="Fraude">Fraude</option>
              <option value="Ciberseguridad">Ciberseguridad</option>
              <option value="Mesa de Dinero">Mesa de Dinero</option>
              <option value="Operaciones">Operaciones</option>
              <option value="TI">TI</option>
              <option value="Nuevos Productos">Nuevos Productos</option>
              <option value="Riesgos Nube">Riesgos Nube</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Tipo de Control:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Detectivo">Detectivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Mecanismo:</label>
            <select
              value={selectedMechanism}
              onChange={(e) => setSelectedMechanism(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos los Mecanismos</option>
              <option value="Automático">Automático</option>
              <option value="Semiautomático">Semiautomático</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Eficacia Evaluada:</label>
            <select
              value={selectedEfficiency}
              onChange={(e) => setSelectedEfficiency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todas las Calificaciones</option>
              <option value="Excelente">Excelente</option>
              <option value="Buena">Buena</option>
              <option value="Suficiente">Suficiente</option>
              <option value="Deficiente">Deficiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Listing View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Mostrando <strong className="text-slate-900">{filteredControls.length}</strong> de <strong>{companyControls.length}</strong> controles oficiales de la compañía
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase tracking-wider">
              Estatus: Implementados & Aprobados
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs font-medium text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-wider font-extrabold">
                  <th className="py-3 px-4">ID Control</th>
                  <th className="py-3 px-4">Área / Riesgo Asociado</th>
                  <th className="py-3 px-4">Descripción del Control Oficial</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4 text-center">Mecanismo</th>
                  <th className="py-3 px-4 text-center">Eficacia</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredControls.length > 0 ? (
                  filteredControls.map((ctrl) => (
                    <tr key={ctrl.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                          <span>{ctrl.id}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            ctrl.riskProcessArea === 'Cumplimiento' ? 'bg-blue-50 text-blue-700' :
                            ctrl.riskProcessArea === 'Fraude' ? 'bg-purple-50 text-purple-700' :
                            ctrl.riskProcessArea === 'Ciberseguridad' ? 'bg-cyan-50 text-cyan-700' :
                            ctrl.riskProcessArea === 'Mesa de Dinero' ? 'bg-amber-50 text-amber-700' :
                            ctrl.riskProcessArea === 'Operaciones' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ctrl.riskProcessArea}
                          </span>
                          <span className="block text-[11px] font-bold text-slate-800 line-clamp-1 font-mono">
                            {ctrl.riskId}: {ctrl.riskTitle}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-lg">
                          {ctrl.description}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ctrl.type === 'Preventivo' ? 'bg-blue-100 text-blue-700' :
                          ctrl.type === 'Detectivo' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ctrl.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ctrl.mechanism === 'Automático' ? 'bg-purple-100 text-purple-700' :
                          ctrl.mechanism === 'Semiautomático' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {ctrl.mechanism}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded text-[10px] font-bold">
                          {ctrl.efficiency}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-700">{ctrl.owner}</span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openRatingModalForControl(ctrl)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-black rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer border border-indigo-200"
                          title="Calificar Control bajo la Metodología Oficial (5 Criterios IC)"
                        >
                          <Edit3 size={12} />
                          Calificar (IC)
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No se encontraron controles oficiales que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredControls.map((ctrl) => (
            <div 
              key={ctrl.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded border border-emerald-200 font-mono flex items-center gap-1">
                    <ShieldCheck size={12} /> {ctrl.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ctrl.type === 'Preventivo' ? 'bg-blue-50 text-blue-700' :
                    ctrl.type === 'Detectivo' ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {ctrl.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    Riesgo {ctrl.riskId} ({ctrl.riskProcessArea})
                  </span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-2">
                    {ctrl.riskTitle}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                  {ctrl.description}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-bold">{ctrl.owner}</span>
                <button
                  onClick={() => openRatingModalForControl(ctrl)}
                  className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Edit3 size={11} />
                  Calificar según Metodología
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: EDIT EXISTING CONTROL */}
      {editingControl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={20} />
                Editar Control Oficial de la Compañía ({editingControl.id})
              </h3>
              <button 
                onClick={() => setEditingControl(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción del Control:</label>
                <textarea
                  rows={3}
                  value={editingControl.description}
                  onChange={(e) => setEditingControl({ ...editingControl, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Control:</label>
                  <select
                    value={editingControl.type}
                    onChange={(e) => setEditingControl({ ...editingControl, type: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Detectivo">Detectivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Eficacia Evaluada:</label>
                  <select
                    value={editingControl.efficiency}
                    onChange={(e) => setEditingControl({ ...editingControl, efficiency: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Buena">Buena</option>
                    <option value="Suficiente">Suficiente</option>
                    <option value="Deficiente">Deficiente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingControl(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditControl}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-500 flex items-center gap-1.5 shadow"
              >
                <Save size={14} /> Guardar Cambios
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD NEW OFFICIAL CONTROL */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="text-emerald-500" size={20} />
                Registrar Nuevo Control de la Compañía
              </h3>
              <button 
                onClick={() => setIsAddingNew(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asociar a Riesgo Existente:</label>
                <select
                  value={newControlForm.riskId}
                  onChange={(e) => setNewControlForm({ ...newControlForm, riskId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                >
                  {risks.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} ({r.processArea}): {r.process || r.riskDescription.substring(0, 45)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción del Control Oficial:</label>
                <textarea
                  rows={3}
                  value={newControlForm.description}
                  onChange={(e) => setNewControlForm({ ...newControlForm, description: e.target.value })}
                  placeholder="Detalle el procedimiento, salvaguarda sistémica o política aprobada..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Control:</label>
                  <select
                    value={newControlForm.type}
                    onChange={(e) => setNewControlForm({ ...newControlForm, type: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Detectivo">Detectivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mecanismo:</label>
                  <select
                    value={newControlForm.mechanism}
                    onChange={(e) => setNewControlForm({ ...newControlForm, mechanism: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Automático">Automático</option>
                    <option value="Semiautomático">Semiautomático</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewControl}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-500 flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Crear e Integrar Control
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL COMPLETO DE CALIFICACIÓN DE CONTROL SEGÚN METODOLOGÍA OFICIAL (5 CRITERIOS IC) */}
      {ratingModalRisk && (
        <ControlRatingModal
          isOpen={true}
          onClose={() => {
            setRatingModalRisk(null);
            setRatingModalControl(null);
          }}
          risk={ratingModalRisk}
          controlToEdit={ratingModalControl}
          onSaveControl={handleSaveControlFromRatingModal}
        />
      )}
    </div>
  );
};
