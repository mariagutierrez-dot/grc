import React, { useState, useMemo, useEffect } from 'react';
import { 
  Risk, 
  AssociatedControl, 
  ControlType, 
  ControlNature, 
  ControlResponsibility, 
  ControlFormality, 
  ControlFrequency, 
  ControlEvaluation,
  CONTROL_METHODOLOGY_SCORES,
  calculateControlIndex,
  getControlEfficiencyFromIC,
  getSuggestedMitigation,
  getRiskLevel,
  getRiskColor,
  getAcceptability,
  RoamStatus
} from '../types';
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Users, 
  FileText, 
  Activity, 
  Check, 
  X, 
  Lock, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ControlRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: Risk;
  controlToEdit?: AssociatedControl | null;
  onSaveControl: (updatedControl: AssociatedControl, riskUpdates?: Partial<Risk>) => void;
}

export const ControlRatingModal: React.FC<ControlRatingModalProps> = ({
  isOpen,
  onClose,
  risk,
  controlToEdit,
  onSaveControl
}) => {
  const isApproved = risk.status === 'Aprobado';

  // Control core attributes
  const [controlDescription, setControlDescription] = useState('');
  const [controlOwner, setControlOwner] = useState('');

  // 5 Official Control Criteria
  const [evaluation, setEvaluation] = useState<ControlEvaluation>({
    type: 'Preventivo',
    nature: 'Automático',
    responsibility: 'Asignado y Monitoreado',
    formality: 'Divulgado y Evidenciable',
    frequency: 'Continuo y Total 100%'
  });

  // Reductions
  const [impactReduction, setImpactReduction] = useState(1);
  const [probabilityReduction, setProbabilityReduction] = useState(2);
  const [isManualReductionOverride, setIsManualReductionOverride] = useState(false);

  // Inherent Risk criteria (ISO 31000)
  const [riskFinanciero, setRiskFinanciero] = useState<number>(3);
  const [riskProcesos, setRiskProcesos] = useState<number>(3);
  const [riskReputacional, setRiskReputacional] = useState<number>(3);
  const [riskLegal, setRiskLegal] = useState<number>(3);
  const [riskProbability, setRiskProbability] = useState<number>(3);

  // ROAM Governance
  const [roamStatus, setRoamStatus] = useState<RoamStatus>('Mitigated');
  const [roamOwner, setRoamOwner] = useState('');

  // Active view tab inside modal
  const [activeTab, setActiveTab] = useState<'control' | 'risk_iso'>('control');

  // Initialize or reset form state when modal opens or controlToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (controlToEdit) {
      setControlDescription(controlToEdit.description);
      setControlOwner(controlToEdit.owner || risk.roamOwner || '');
      
      const evalData: ControlEvaluation = controlToEdit.evaluation || {
        type: controlToEdit.type || 'Preventivo',
        nature: controlToEdit.nature || (controlToEdit.mechanism as any) || 'Automático',
        responsibility: controlToEdit.responsibility || 'Asignado y Monitoreado',
        formality: controlToEdit.formality || 'Divulgado y Evidenciable',
        frequency: controlToEdit.frequency as any || 'Continuo y Total 100%'
      };
      setEvaluation(evalData);
      setImpactReduction(controlToEdit.impactReduction ?? 1);
      setProbabilityReduction(controlToEdit.probabilityReduction ?? 2);
      setIsManualReductionOverride(true);
    } else {
      // New control defaults
      setControlDescription('');
      setControlOwner(risk.roamOwner || 'Líder del Proceso');
      const defaultEval: ControlEvaluation = {
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%'
      };
      setEvaluation(defaultEval);
      const suggested = getSuggestedMitigation('Preventivo', 100);
      setImpactReduction(suggested.impactReduction);
      setProbabilityReduction(suggested.probabilityReduction);
      setIsManualReductionOverride(false);
    }

    // Inherent risk parameters from the risk
    const defaultImpVal = Math.max(1, Math.min(5, risk.impact <= 5 ? risk.impact : 3));
    setRiskFinanciero(risk.financiero ?? defaultImpVal);
    setRiskProcesos(risk.procesos ?? defaultImpVal);
    setRiskReputacional(risk.reputacional ?? defaultImpVal);
    setRiskLegal(risk.legal ?? defaultImpVal);
    setRiskProbability(risk.probability ?? 3);

    setRoamStatus(risk.roamStatus || 'Mitigated');
    setRoamOwner(risk.roamOwner || '');
  }, [isOpen, controlToEdit, risk]);

  // Calculate Control Index (IC) in real time
  const controlIndex = useMemo(() => {
    return calculateControlIndex(evaluation);
  }, [evaluation]);

  const controlEfficiency = useMemo(() => {
    return getControlEfficiencyFromIC(controlIndex);
  }, [controlIndex]);

  // Update suggested mitigations when evaluation changes unless user manually overrode
  const handleCriterionChange = <K extends keyof ControlEvaluation>(key: K, value: ControlEvaluation[K]) => {
    const nextEval = { ...evaluation, [key]: value };
    setEvaluation(nextEval);
    
    if (!isManualReductionOverride) {
      const nextIC = calculateControlIndex(nextEval);
      const suggested = getSuggestedMitigation(nextEval.type, nextIC);
      setImpactReduction(suggested.impactReduction);
      setProbabilityReduction(suggested.probabilityReduction);
    }
  };

  // Re-apply suggested reduction
  const applySuggestedMitigation = () => {
    const suggested = getSuggestedMitigation(evaluation.type, controlIndex);
    setImpactReduction(suggested.impactReduction);
    setProbabilityReduction(suggested.probabilityReduction);
    setIsManualReductionOverride(false);
  };

  // Calculate Inherent Impact based on ISO 31000 standard (maximum of the 4 dimensions)
  const currentInherentImpact = isApproved 
    ? risk.impact 
    : Math.max(riskFinanciero, riskProcesos, riskReputacional, riskLegal);
  
  const currentInherentProbability = isApproved ? risk.probability : riskProbability;
  const inherentScore = currentInherentImpact * currentInherentProbability;
  const inherentLevel = getRiskLevel(inherentScore);

  // Calculate Residual Impact & Probability with other existing controls + this control
  const otherControls = useMemo(() => {
    if (!risk.associatedControls) return [];
    if (!controlToEdit) return risk.associatedControls;
    return risk.associatedControls.filter(c => c.id !== controlToEdit.id);
  }, [risk.associatedControls, controlToEdit]);

  const otherImpactReduction = useMemo(() => {
    return otherControls.reduce((sum, c) => sum + (c.impactReduction || 0), 0);
  }, [otherControls]);

  const otherProbReduction = useMemo(() => {
    return otherControls.reduce((sum, c) => sum + (c.probabilityReduction || 0), 0);
  }, [otherControls]);

  const totalImpactReduction = otherImpactReduction + impactReduction;
  const totalProbReduction = otherProbReduction + probabilityReduction;

  const residualImpact = Math.max(1, currentInherentImpact - totalImpactReduction);
  const residualProbability = Math.max(1, currentInherentProbability - totalProbReduction);
  const residualScore = residualImpact * residualProbability;
  const residualLevel = getRiskLevel(residualScore);
  const residualAcceptability = getAcceptability(residualScore);
  const isAcceptable = residualScore <= 12;

  const handleSave = () => {
    if (!controlDescription.trim()) {
      return;
    }

    const controlId = controlToEdit?.id || `CTRL-${risk.id}-${Date.now().toString().slice(-4)}`;

    const updatedControl: AssociatedControl = {
      id: controlId,
      description: controlDescription.trim(),
      type: evaluation.type,
      efficiency: controlEfficiency,
      impactReduction,
      probabilityReduction,
      nature: evaluation.nature,
      responsibility: evaluation.responsibility,
      formality: evaluation.formality,
      frequency: evaluation.frequency,
      controlIndex: Math.round(controlIndex * 10) / 10,
      evaluation,
      owner: controlOwner.trim() || undefined,
      mechanism: evaluation.nature === 'Automático' ? 'Automático' : evaluation.nature === 'Combinado' ? 'Semiautomático' : 'Manual'
    };

    const riskUpdates: Partial<Risk> = {
      residualImpact,
      residualProbability,
      acceptability: residualAcceptability,
      roamStatus,
      roamOwner: roamOwner.trim() || controlOwner.trim() || risk.roamOwner,
      controlIndex: Math.round(controlIndex * 10) / 10
    };

    // If risk is NOT approved, allow updating inherent rating fields
    if (!isApproved) {
      riskUpdates.impact = currentInherentImpact;
      riskUpdates.probability = currentInherentProbability;
      riskUpdates.financiero = riskFinanciero;
      riskUpdates.procesos = riskProcesos;
      riskUpdates.reputacional = riskReputacional;
      riskUpdates.legal = riskLegal;
    }

    onSaveControl(updatedControl, riskUpdates);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-white/10 text-white">
                {risk.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {risk.processArea}
              </span>
              {risk.product && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  {risk.product}
                </span>
              )}
              {isApproved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <Lock size={10} /> Riesgo Aprobado (Definitivo)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  <AlertCircle size={10} /> Riesgo en Revisión
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {controlToEdit ? 'Modificar y Calificar Control' : 'Agregar y Calificar Nuevo Control'}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1">
              {risk.process || risk.riskDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('control')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'control'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} className="text-emerald-600" />
              1. Calificación del Control (5 Criterios IC)
            </button>
            <button
              onClick={() => setActiveTab('risk_iso')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'risk_iso'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator size={14} className="text-blue-600" />
              2. Parámetros de Riesgo Inherente (ISO 31000)
            </button>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-black">
            <span className="text-slate-500 uppercase tracking-wider">Índice IC:</span>
            <span className={`px-2 py-0.5 rounded font-mono ${
              controlIndex >= 85 ? 'bg-emerald-100 text-emerald-800' :
              controlIndex >= 60 ? 'bg-amber-100 text-amber-800' :
              'bg-rose-100 text-rose-800'
            }`}>
              {controlIndex.toFixed(1)}% — {controlEfficiency}
            </span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* TAB 1: CALIFICACIÓN DEL CONTROL */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              
              {/* Descripción y Dueño */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-400" />
                    Descripción Operativa del Control
                  </label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Detalle el paso técnico, salvaguarda sistémica, verificación dual o política aplicada..."
                    value={controlDescription}
                    onChange={e => setControlDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={12} className="text-slate-400" />
                    Responsable / Dueño Operativo
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Ej: Oficial de Riesgos / Tech Lead"
                    value={controlOwner}
                    onChange={e => setControlOwner(e.target.value)}
                  />
                  <span className="text-[9px] text-slate-400 block">Encargado de la ejecución y monitoreo.</span>
                </div>
              </div>

              {/* LOS 5 CRITERIOS OFICIALES DE METODOLOGÍA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={14} className="text-indigo-600" />
                    Evaluación de los 5 Criterios de Control (Metodología Global66 GRC)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500">
                    Ponderación Total: 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 1. TIPO DE CONTROL (40%) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1">
                        <Target size={12} className="text-blue-600" />
                        1. Tipo de Control (40%)
                      </label>
                      <span className="text-[10px] font-mono font-bold text-blue-700">
                        {CONTROL_METHODOLOGY_SCORES.type[evaluation.type] * 0.40} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Preventivo', 'Detectivo', 'Correctivo'] as ControlType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleCriterionChange('type', t)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                            evaluation.type === t
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{t}</span>
                          <span className="text-[9px] opacity-75 font-mono">{CONTROL_METHODOLOGY_SCORES.type[t]} pts</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 italic">
                      {evaluation.type === 'Preventivo' && 'Evita la materialización en la causa raíz (reduce probabilidad).'}
                      {evaluation.type === 'Detectivo' && 'Alerta desviaciones post-ejecución (reduce impacto/tiempo de exposición).'}
                      {evaluation.type === 'Correctivo' && 'Restaura la operación o compensa el daño una vez materializado.'}
                    </p>
                  </div>

                  {/* 2. NATURALEZA / GRADO DE AUTOMATIZACIÓN (20%) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1">
                        <Zap size={12} className="text-purple-600" />
                        2. Naturaleza / Automatización (20%)
                      </label>
                      <span className="text-[10px] font-mono font-bold text-purple-700">
                        {CONTROL_METHODOLOGY_SCORES.nature[evaluation.nature] * 0.20} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Automático', 'Combinado', 'Manual'] as ControlNature[]).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleCriterionChange('nature', n)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                            evaluation.nature === n
                              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600 ring-offset-1'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{n}</span>
                          <span className="text-[9px] opacity-75 font-mono">{CONTROL_METHODOLOGY_SCORES.nature[n]} pts</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 italic">
                      {evaluation.nature === 'Automático' && 'Sistemas, validaciones en API, bots, WAF, sin intervención manual.'}
                      {evaluation.nature === 'Combinado' && 'Alertas o reportes automáticos con revisión y firma humana.'}
                      {evaluation.nature === 'Manual' && 'Ejecutado enteramente por personas mediante planillas o firmas.'}
                    </p>
                  </div>

                  {/* 3. RESPONSABILIDAD / ASIGNACIÓN (20%) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1">
                        <Users size={12} className="text-emerald-600" />
                        3. Responsabilidad (20%)
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-700">
                        {CONTROL_METHODOLOGY_SCORES.responsibility[evaluation.responsibility] * 0.20} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Asignado y Monitoreado', 'Solo Asignado', 'No Asignado'] as ControlResponsibility[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleCriterionChange('responsibility', r)}
                          className={`p-2 rounded-xl text-[11px] font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                            evaluation.responsibility === r
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate w-full">{r === 'Asignado y Monitoreado' ? 'Monitoreado' : r}</span>
                          <span className="text-[9px] opacity-75 font-mono">{CONTROL_METHODOLOGY_SCORES.responsibility[r]} pts</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 italic">
                      {evaluation.responsibility === 'Asignado y Monitoreado' && 'Dueño formalmente designado con KPIs y seguimiento en comités.'}
                      {evaluation.responsibility === 'Solo Asignado' && 'Responsable nominal sin monitoreo continuo ni auditoría.'}
                      {evaluation.responsibility === 'No Asignado' && 'Sin doliente formal ni responsable designado.'}
                    </p>
                  </div>

                  {/* 4. FORMALIDAD / DOCUMENTACIÓN (10%) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1">
                        <FileText size={12} className="text-amber-600" />
                        4. Formalidad / Documentación (10%)
                      </label>
                      <span className="text-[10px] font-mono font-bold text-amber-700">
                        {CONTROL_METHODOLOGY_SCORES.formality[evaluation.formality] * 0.10} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Divulgado y Evidenciable', 'Solo Documentado', 'Informal'] as ControlFormality[]).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => handleCriterionChange('formality', f)}
                          className={`p-2 rounded-xl text-[11px] font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                            evaluation.formality === f
                              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600 ring-offset-1'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate w-full">{f === 'Divulgado y Evidenciable' ? 'Evidenciable' : f}</span>
                          <span className="text-[9px] opacity-75 font-mono">{CONTROL_METHODOLOGY_SCORES.formality[f]} pts</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 italic">
                      {evaluation.formality === 'Divulgado y Evidenciable' && 'Procedimiento formal, capacitado y con registros auditables.'}
                      {evaluation.formality === 'Solo Documentado' && 'Existe manual escrito pero sin evidencia sistemática de ejecución.'}
                      {evaluation.formality === 'Informal' && 'Práctica consuetudinaria o verbal sin soporte formal.'}
                    </p>
                  </div>

                  {/* 5. FRECUENCIA Y COBERTURA (10%) */}
                  <div className="md:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1">
                        <Activity size={12} className="text-rose-600" />
                        5. Frecuencia y Cobertura (10%)
                      </label>
                      <span className="text-[10px] font-mono font-bold text-rose-700">
                        {CONTROL_METHODOLOGY_SCORES.frequency[evaluation.frequency] * 0.10} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(['Continuo y Total 100%', 'Muestreo Frecuente', 'Inadecuado o Esporádico'] as ControlFrequency[]).map((fq) => (
                        <button
                          key={fq}
                          type="button"
                          onClick={() => handleCriterionChange('frequency', fq)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all text-center flex justify-between items-center px-3 cursor-pointer ${
                            evaluation.frequency === fq
                              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600 ring-offset-1'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{fq}</span>
                          <span className="text-[9px] opacity-75 font-mono">{CONTROL_METHODOLOGY_SCORES.frequency[fq]} pts</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 italic">
                      {evaluation.frequency === 'Continuo y Total 100%' && 'Aplica al 100% de las transacciones u operaciones de forma continua 24/7.'}
                      {evaluation.frequency === 'Muestreo Frecuente' && 'Revisiones periódicas diarias o semanales por lotes o muestras.'}
                      {evaluation.frequency === 'Inadecuado o Esporádico' && 'Revisiones aleatorias o únicamente reactivas ante quejas o fallas.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* RESUMEN DE CALIFICACIÓN DEL CONTROL (ÍNDICE IC) */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Índice de Control Resultante (IC)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      controlIndex >= 85 ? 'bg-emerald-400 text-slate-950' :
                      controlIndex >= 60 ? 'bg-amber-400 text-slate-950' :
                      'bg-rose-400 text-slate-950'
                    }`}>
                      {controlEfficiency} (IC: {controlIndex.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Tipo (40%)</span>
                    <span className="font-mono font-bold text-blue-300">{(CONTROL_METHODOLOGY_SCORES.type[evaluation.type] * 0.40).toFixed(1)}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Naturaleza (20%)</span>
                    <span className="font-mono font-bold text-purple-300">{(CONTROL_METHODOLOGY_SCORES.nature[evaluation.nature] * 0.20).toFixed(1)}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Resp. (20%)</span>
                    <span className="font-mono font-bold text-emerald-300">{(CONTROL_METHODOLOGY_SCORES.responsibility[evaluation.responsibility] * 0.20).toFixed(1)}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Form. (10%)</span>
                    <span className="font-mono font-bold text-amber-300">{(CONTROL_METHODOLOGY_SCORES.formality[evaluation.formality] * 0.10).toFixed(1)}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Frec. (10%)</span>
                    <span className="font-mono font-bold text-rose-300">{(CONTROL_METHODOLOGY_SCORES.frequency[evaluation.frequency] * 0.10).toFixed(1)}</span>
                  </div>
                </div>

                {/* Mitigación sobre el riesgo */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Efecto Mitigante sobre el Riesgo
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      Sugerido automáticamente por la metodología (IC {controlIndex.toFixed(0)}%): Reducción de Impacto y Probabilidad.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                      <span className="text-[10px] text-slate-300 font-bold">Red. Impacto:</span>
                      <select
                        value={impactReduction}
                        onChange={e => {
                          setImpactReduction(Number(e.target.value));
                          setIsManualReductionOverride(true);
                        }}
                        className="bg-slate-800 text-white font-black text-xs px-2 py-0.5 rounded outline-none cursor-pointer"
                      >
                        <option value={0}>0 (Sin red.)</option>
                        <option value={1}>-1 Nivel</option>
                        <option value={2}>-2 Niveles</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                      <span className="text-[10px] text-slate-300 font-bold">Red. Probabilidad:</span>
                      <select
                        value={probabilityReduction}
                        onChange={e => {
                          setProbabilityReduction(Number(e.target.value));
                          setIsManualReductionOverride(true);
                        }}
                        className="bg-slate-800 text-white font-black text-xs px-2 py-0.5 rounded outline-none cursor-pointer"
                      >
                        <option value={0}>0 (Sin red.)</option>
                        <option value={1}>-1 Nivel</option>
                        <option value={2}>-2 Niveles</option>
                        <option value={3}>-3 Niveles</option>
                      </select>
                    </div>

                    {isManualReductionOverride && (
                      <button
                        type="button"
                        onClick={applySuggestedMitigation}
                        className="text-[10px] text-amber-300 hover:underline cursor-pointer"
                        title="Restablecer a valores sugeridos por la metodología"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRITERIOS DE RIESGO INHERENTE ISO 31000 */}
          {activeTab === 'risk_iso' && (
            <div className="space-y-6">
              {isApproved && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <Lock size={16} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Inmutabilidad Regulatoria (Regla 1 GRC):</strong> Este riesgo ya está formalmente aprobado. Los valores de causa e impacto inherente son definitivos y no pueden ser alterados para preservar el historial de la matriz.
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calculator size={14} className="text-blue-600" />
                    Calificación de Impacto Inherente (4 Criterios ISO 31000)
                  </h4>
                  <span className="text-xs font-bold text-slate-600">
                    Impacto Máximo Calculado: <strong className="text-slate-900">{currentInherentImpact} / 5</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Financiero */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase flex items-center justify-between">
                      <span>Financiero (50% de Exposición)</span>
                      <span className="font-mono text-indigo-600">{riskFinanciero}/5</span>
                    </label>
                    <select
                      disabled={isApproved}
                      value={riskFinanciero}
                      onChange={e => setRiskFinanciero(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value={1}>1 - Menor (&lt; $660K / ≤ 30% patrimonio base)</option>
                      <option value={2}>2 - Moderado ($660K - $880K / 40%)</option>
                      <option value={3}>3 - Serio ($880K - $1.1M / 50%)</option>
                      <option value={4}>4 - Mayor ($1.1M - $1.76M / 80%)</option>
                      <option value={5}>5 - Catastrófico (&gt; $1.76M / &gt; 80%)</option>
                    </select>
                  </div>

                  {/* Procesos */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase flex items-center justify-between">
                      <span>Procesos / Operacional (20%)</span>
                      <span className="font-mono text-indigo-600">{riskProcesos}/5</span>
                    </label>
                    <select
                      disabled={isApproved}
                      value={riskProcesos}
                      onChange={e => setRiskProcesos(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value={1}>1 - Menor (Interrupción operativa ≤ 1 día)</option>
                      <option value={2}>2 - Moderado (Interrupción 2 - 3 días)</option>
                      <option value={3}>3 - Serio (Interrupción 4 - 5 días)</option>
                      <option value={4}>4 - Mayor (Interrupción 5 - 7 días)</option>
                      <option value={5}>5 - Catastrófico (Interrupción &gt; 7 días)</option>
                    </select>
                  </div>

                  {/* Reputacional */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase flex items-center justify-between">
                      <span>Reputacional (15%)</span>
                      <span className="font-mono text-indigo-600">{riskReputacional}/5</span>
                    </label>
                    <select
                      disabled={isApproved}
                      value={riskReputacional}
                      onChange={e => setRiskReputacional(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value={1}>1 - Menor (Afectación interna / quejas aisladas)</option>
                      <option value={2}>2 - Moderado (Afectación en una entidad específica)</option>
                      <option value={3}>3 - Serio (Afectación sectorial / cobertura fintech)</option>
                      <option value={4}>4 - Mayor (Afectación en medios nacionales)</option>
                      <option value={5}>5 - Catastrófico (Crisis internacional de marca)</option>
                    </select>
                  </div>

                  {/* Legal */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase flex items-center justify-between">
                      <span>Legal / Contractual / Regulatorio (15%)</span>
                      <span className="font-mono text-indigo-600">{riskLegal}/5</span>
                    </label>
                    <select
                      disabled={isApproved}
                      value={riskLegal}
                      onChange={e => setRiskLegal(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value={1}>1 - Menor (Recomendación formal de control)</option>
                      <option value={2}>2 - Moderado (Glosa u observación de vigilancia)</option>
                      <option value={3}>3 - Serio (Glosa con efectos jurídicos / requerimiento CMF/SFC)</option>
                      <option value={4}>4 - Mayor (Multas económicas y sanciones formales)</option>
                      <option value={5}>5 - Catastrófico (Intervención, revocatoria de licencia o cierre)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PROBABILIDAD INHERENTE */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-600 uppercase">
                    Probabilidad Inherente (Frecuencia de Ocurrencia)
                  </label>
                  <span className="font-mono text-xs font-bold text-slate-800">{currentInherentProbability} / 5</span>
                </div>
                <select
                  disabled={isApproved}
                  value={riskProbability}
                  onChange={e => setRiskProbability(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value={1}>1 - Muy Improbable (Frecuencia anual o &lt; 1 vez cada 3 años)</option>
                  <option value={2}>2 - Poco Probable (Semestral o 1 vez cada 1 a 3 años)</option>
                  <option value={3}>3 - Posible (Mensual o 1 vez cada 3 a 12 meses)</option>
                  <option value={4}>4 - Probable (Semanal o 1 vez al mes)</option>
                  <option value={5}>5 - Casi Seguro (Diario o continuo / recurrente)</option>
                </select>
              </div>

              {/* ROAM GOVERNANCE */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">
                  Tratamiento y Gobernanza ROAM
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Estado ROAM:</span>
                    <select
                      value={roamStatus}
                      onChange={e => setRoamStatus(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="Resolved">🟢 Resolved (Resuelto - Causa eliminada al 100%)</option>
                      <option value="Owned">🔵 Owned (Asignado al dueño de proceso)</option>
                      <option value="Accepted">🟡 Accepted (Aceptado formalmente por Comité)</option>
                      <option value="Mitigated">🟣 Mitigated (Mitigado por controles vigentes)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">ROAM Owner (Dueño del Riesgo):</span>
                    <input
                      type="text"
                      value={roamOwner}
                      onChange={e => setRoamOwner(e.target.value)}
                      placeholder="Ej: María Gutiérrez / Gerente de Operaciones"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DUAL EVALUATION MATRIX (INHERENTE VS RESIDUAL EN TIEMPO REAL) */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-slate-500" />
                Matriz Comparativa Dual: Inherente vs Residual
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Metodología ISO 31000
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inherente */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Riesgo Inherente
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getRiskColor(inherentLevel)}`}>
                    {inherentScore} - {inherentLevel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Impacto</span>
                    <span className="text-base font-black text-slate-800">{currentInherentImpact} / 5</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Probabilidad</span>
                    <span className="text-base font-black text-slate-800">{currentInherentProbability} / 5</span>
                  </div>
                </div>
              </div>

              {/* Residual */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Riesgo Residual Post-Control
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getRiskColor(residualLevel)}`}>
                    {residualScore} - {residualLevel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-emerald-50/50 p-2 rounded-lg">
                    <span className="text-[9px] text-emerald-700 block uppercase font-bold">
                      Impacto Residual (-{totalImpactReduction})
                    </span>
                    <span className="text-base font-black text-slate-800">{residualImpact} / 5</span>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-lg">
                    <span className="text-[9px] text-emerald-700 block uppercase font-bold">
                      Prob. Residual (-{totalProbReduction})
                    </span>
                    <span className="text-base font-black text-slate-800">{residualProbability} / 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aceptabilidad */}
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
              isAcceptable 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {isAcceptable ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
                <span>
                  Veredicto de Aceptabilidad: {isAcceptable ? '🟢 ACEPTABLE (Dentro del Apetito y Tolerancia)' : '🔴 NO ACEPTABLE (Requiere Plan de Mitigación Inmediato)'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-normal opacity-80">
                Límite de Tolerancia: ≤ 12 pts
              </span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!controlDescription.trim()}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check size={16} />
            Guardar Calificación y Actualizar Matriz
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default ControlRatingModal;
