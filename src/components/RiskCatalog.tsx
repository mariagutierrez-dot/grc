import React, { useState, useEffect } from 'react';
import { Risk, getAcceptability, getRiskLevel, AssociatedControl, ControlType } from '../types';
import { CheckCircle2, Edit3, Trash2, Clock, CheckCircle, Plus, X, Shield, Activity, Sparkles, Sliders, Check } from 'lucide-react';
import ControlRatingModal from './ControlRatingModal';

interface ImpactCalculadora {
  financiero: number;
  procesos: number;
  reputacional: number;
  legal: number;
}

interface RiskCatalogProps {
  risks: Risk[];
  onAccept: (id: string) => void;
  onModify: (id: string, updates: Partial<Risk>) => void;
  onReject: (id: string) => void;
  highlightId?: string | null;
}

export default function RiskCatalog({ risks, onAccept, onModify, onReject, highlightId }: RiskCatalogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [editImpactCalc, setEditImpactCalc] = useState<ImpactCalculadora>({
    financiero: 1, procesos: 1, reputacional: 1, legal: 1
  });
  const [editProbability, setEditProbability] = useState(1);
  const [editCauses, setEditCauses] = useState<string[]>([]);
  const [editRoamStatus, setEditRoamStatus] = useState<'Resolved' | 'Owned' | 'Accepted' | 'Mitigated'>('Mitigated');
  const [editRoamOwner, setEditRoamOwner] = useState('');

  // States for modal rating of controls according to methodology
  const [ratingModalRisk, setRatingModalRisk] = useState<Risk | null>(null);
  const [ratingModalControl, setRatingModalControl] = useState<AssociatedControl | null>(null);

  // States for inline associated controls
  const [addingControlToId, setAddingControlToId] = useState<string | null>(null);
  const [newCtrlDesc, setNewCtrlDesc] = useState('');
  const [newCtrlType, setNewCtrlType] = useState<ControlType>('Preventivo');
  const [newCtrlEfficiency, setNewCtrlEfficiency] = useState<'Excelente' | 'Bueno' | 'Débil'>('Excelente');
  const [newCtrlImpactRed, setNewCtrlImpactRed] = useState(1);
  const [newCtrlProbRed, setNewCtrlProbRed] = useState(2);

  const openAddControlModal = (risk: Risk) => {
    setRatingModalRisk(risk);
    setRatingModalControl(null);
  };

  const openEditControlModal = (risk: Risk, ctrl: AssociatedControl) => {
    setRatingModalRisk(risk);
    setRatingModalControl(ctrl);
  };

  const handleSaveControlFromModal = (updatedControl: AssociatedControl, riskUpdates?: Partial<Risk>) => {
    if (!ratingModalRisk) return;
    const currentControls = ratingModalRisk.associatedControls || [];
    let newControls: AssociatedControl[];

    if (ratingModalControl) {
      newControls = currentControls.map(c => c.id === updatedControl.id ? updatedControl : c);
    } else {
      newControls = [...currentControls, updatedControl];
    }

    const targetInherentImpact = riskUpdates?.impact ?? ratingModalRisk.impact;
    const targetInherentProbability = riskUpdates?.probability ?? ratingModalRisk.probability;

    const { residualImpact, residualProbability } = calculateResidualsOutput(
      targetInherentImpact,
      targetInherentProbability,
      newControls
    );

    onModify(ratingModalRisk.id, {
      ...riskUpdates,
      associatedControls: newControls,
      residualImpact,
      residualProbability,
      acceptability: getAcceptability(residualImpact * residualProbability)
    });

    setRatingModalRisk(null);
    setRatingModalControl(null);
  };

  const calculateResidualsOutput = (inherentImpact: number, inherentProbability: number, controls: AssociatedControl[]) => {
    const totalImpactReduction = controls.reduce((sum, c) => sum + c.impactReduction, 0);
    const totalProbReduction = controls.reduce((sum, c) => sum + c.probabilityReduction, 0);

    const residualImpact = Math.max(1, inherentImpact - totalImpactReduction);
    const residualProbability = Math.max(1, inherentProbability - totalProbReduction);
    return {
      residualImpact,
      residualProbability
    };
  };

  const handleAddControl = (risk: Risk) => {
    if (!newCtrlDesc.trim()) return;
    const newControl: AssociatedControl = {
      id: `C-${risk.id}-${Date.now().toString().slice(-4)}`,
      description: newCtrlDesc,
      type: newCtrlType,
      efficiency: newCtrlEfficiency,
      impactReduction: newCtrlImpactRed,
      probabilityReduction: newCtrlProbRed
    };

    const currentControls = risk.associatedControls || [];
    const updatedControls = [...currentControls, newControl];
    const { residualImpact, residualProbability } = calculateResidualsOutput(risk.impact, risk.probability, updatedControls);

    onModify(risk.id, {
      associatedControls: updatedControls,
      residualImpact,
      residualProbability
    });

    // Reset local state
    setNewCtrlDesc('');
    setNewCtrlType('Preventivo');
    setNewCtrlEfficiency('Excelente');
    setNewCtrlImpactRed(1);
    setNewCtrlProbRed(2);
    setAddingControlToId(null);
  };

  const handleDeleteControl = (risk: Risk, controlId: string) => {
    const currentControls = risk.associatedControls || [];
    const updatedControls = currentControls.filter(c => c.id !== controlId);
    const { residualImpact, residualProbability } = calculateResidualsOutput(risk.impact, risk.probability, updatedControls);

    onModify(risk.id, {
      associatedControls: updatedControls,
      residualImpact,
      residualProbability
    });
  };

  const DIMENSION_OPTIONS: Record<string, { value: number; label: string }[]> = {
    financiero: [
      { value: 1, label: '1 - Menor (< $660K / ≤ 30%)' },
      { value: 2, label: '2 - Moderado ($660K - $880K / 40%)' },
      { value: 3, label: '3 - Serio ($880K - $1.1M / 50%)' },
      { value: 4, label: '4 - Mayor ($1.1M - $1.76M / 80%)' },
      { value: 5, label: '5 - Catastrófico (> $1.76M / > 80%)' },
    ],
    procesos: [
      { value: 1, label: '1 - Menor (Interrupción ≤ 1d)' },
      { value: 2, label: '2 - Moderado (Interrupción 2-3d)' },
      { value: 3, label: '3 - Serio (Interrupción 4-5d)' },
      { value: 4, label: '4 - Mayor (Interrupción 5-7d)' },
      { value: 5, label: '5 - Catastrófico (Interrupción > 7d)' },
    ],
    reputacional: [
      { value: 1, label: '1 - Menor (Afectación interna)' },
      { value: 2, label: '2 - Moderado (Afectación entidad)' },
      { value: 3, label: '3 - Serio (Afectación sectorial)' },
      { value: 4, label: '4 - Mayor (Afectación nacional)' },
      { value: 5, label: '5 - Catastrófico (Afectación internacional)' },
    ],
    legal: [
      { value: 1, label: '1 - Menor (Recomendación control)' },
      { value: 2, label: '2 - Moderado (Glosa vigilancia)' },
      { value: 3, label: '3 - Serio (Glosa efectos jurídicos)' },
      { value: 4, label: '4 - Mayor (Multas y sanciones)' },
      { value: 5, label: '5 - Catastrófico (Intervención/Cierre)' },
    ]
  };

  // Calculate Impact Final as the maximum between the 4 sub-criteria following ISO 31000 standard
  const calculateFinalImpact = (calc: ImpactCalculadora) => {
    return Math.max(calc.financiero, calc.procesos, calc.reputacional, calc.legal);
  };

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(highlightId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightId]);

  const startEditing = (risk: Risk) => {
    setEditingId(risk.id);
    setEditValue(risk.riskDescription);
    // Use stored sub-criteria if available, otherwise compute a clamped fallback estimation
    const defaultVal = Math.max(1, Math.min(5, risk.impact <= 5 ? risk.impact : Math.round(risk.impact / 2)));
    setEditImpactCalc({
      financiero: risk.financiero !== undefined ? risk.financiero : defaultVal,
      procesos: risk.procesos !== undefined ? risk.procesos : defaultVal,
      reputacional: risk.reputacional !== undefined ? risk.reputacional : defaultVal,
      legal: risk.legal !== undefined ? risk.legal : defaultVal
    });
    setEditProbability(risk.probability);
    setEditCauses(risk.cause.split('\n').filter(c => c.trim() !== ''));
    setEditRoamStatus(risk.roamStatus || 'Mitigated');
    setEditRoamOwner(risk.roamOwner || '');
  };

  const addCause = () => setEditCauses([...editCauses, '']);
  const updateCause = (index: number, val: string) => {
    const newCauses = [...editCauses];
    newCauses[index] = val;
    setEditCauses(newCauses);
  };
  const removeCause = (index: number) => setEditCauses(editCauses.filter((_, i) => i !== index));

  const saveEdit = (id: string) => {
    const finalImpact = calculateFinalImpact(editImpactCalc);
    const finalCause = editCauses.join('\n');
    
    onModify(id, { 
      riskDescription: editValue,
      impact: finalImpact,
      probability: editProbability,
      cause: finalCause,
      acceptability: getAcceptability(finalImpact * editProbability),
      roamStatus: editRoamStatus,
      roamOwner: editRoamOwner,
      financiero: editImpactCalc.financiero,
      procesos: editImpactCalc.procesos,
      reputacional: editImpactCalc.reputacional,
      legal: editImpactCalc.legal
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">ID / Área</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción Narrativa / Evaluación</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48 text-right">Acciones de Decisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {risks.map(risk => (
              <tr 
                key={risk.id} 
                id={risk.id}
                className={`transition-all ${highlightId === risk.id ? 'bg-amber-50 ring-2 ring-amber-400 ring-inset ring-opacity-50' : 'hover:bg-slate-50/50'}`}
              >
                <td className="px-6 py-4">
                  {risk.status === 'Pendiente' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      <Clock size={12} />
                      Pendiente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle size={12} />
                      Aprobado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{risk.id}</div>
                  <div className="text-xs text-slate-500 font-medium">{risk.processArea}</div>
                  {risk.product && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] rounded-md">
                      {risk.product === 'Bre-B' ? '⚡' : risk.product === 'Stablecoins' ? '🪙' : risk.product === 'Integración SII Chile' ? '🇨🇱' : risk.product === 'APIB2B(MCP)' ? '🤖' : risk.product === 'Integración CCE - Perú' ? '🇵🇪' : risk.product === 'Adquirencia Global' ? '💳' : risk.product === 'Payout Swift JPMorgan' ? '🏛️' : risk.product === 'Global chats' ? '💬' : risk.product === 'Cuentas Virtuales' ? '🏦' : risk.product === 'GlobalID' ? '🪪' : '✨'} {risk.product}
                    </span>
                  )}
                  {risk.process && (
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">Proceso: {risk.process}</div>
                  )}
                  {risk.categoriaBCRA && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded border border-blue-200">
                      🇦🇷 BCRA: {risk.categoriaBCRA}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === risk.id ? (
                    <div className="space-y-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                          <Edit3 size={12} />
                          Descripción Narrativa del Riesgo
                        </label>
                        <textarea
                          className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none min-h-[80px] bg-white"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                        />
                      </div>

                      {/* Gestión de Causas */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                          Gestión de Causas Raíz
                          <button onClick={addCause} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            <Plus size={12} /> Añadir Causa
                          </button>
                        </label>
                        <div className="space-y-2">
                          {editCauses.map((cause, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                                value={cause}
                                onChange={e => updateCause(idx, e.target.value)}
                                placeholder="Describa la causa..."
                              />
                              <button onClick={() => removeCause(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          {editCauses.length === 0 && (
                            <p className="text-xs text-slate-400 italic">No hay causas definidas.</p>
                          )}
                        </div>
                      </div>

                      {/* Calculadora de Impacto */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            Calculadora de Impacto Ponderada (ISO 31000 - Escala 1 a 5)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              openAddControlModal(risk);
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Sliders size={11} /> Abrir Calibración de Controles y Criterios GRC (IC)
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'financiero', label: 'Financiero (50%)', weight: '50%' },
                            { key: 'procesos', label: 'Procesos (20%)', weight: '20%' },
                            { key: 'reputacional', label: 'Reputacional (15%)', weight: '15%' },
                            { key: 'legal', label: 'Legal/Contr. (15%)', weight: '15%' }
                          ].map(item => (
                            <div key={item.key} className="space-y-1">
                              <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                              <select
                                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold text-slate-700 outline-none"
                                value={editImpactCalc[item.key as keyof ImpactCalculadora]}
                                onChange={e => setEditImpactCalc({...editImpactCalc, [item.key]: Number(e.target.value)})}
                              >
                                {DIMENSION_OPTIONS[item.key]?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                )) || (
                                  <>
                                    <option value={1}>1 - Menor</option>
                                    <option value={2}>2 - Moderado</option>
                                    <option value={3}>3 - Serio</option>
                                    <option value={4}>4 - Mayor</option>
                                    <option value={5}>5 - Catastrófico</option>
                                  </>
                                )}
                              </select>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs font-bold text-slate-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex justify-between">
                          <span>Impacto Final Calculado:</span>
                          <span>{calculateFinalImpact(editImpactCalc)} / 5</span>
                        </div>
                      </div>

                      {/* Selección de Probabilidad */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Probabilidad (Frecuencia)</label>
                        <select
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                          value={editProbability}
                          onChange={e => setEditProbability(Number(e.target.value))}
                        >
                          <option value={1}>1 - Muy Improbable (Anual)</option>
                          <option value={2}>2 - Poco Probable (Semestral)</option>
                          <option value={3}>3 - Posible (Mensual)</option>
                          <option value={4}>4 - Probable (Semanal)</option>
                          <option value={5}>5 - Casi Seguro (Diario)</option>
                        </select>
                      </div>

                      {/* Selección de Estado ROAM */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-indigo-600 uppercase">Seguimiento ROAM</label>
                          <select
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-bold"
                            value={editRoamStatus}
                            onChange={e => setEditRoamStatus(e.target.value as any)}
                          >
                            <option value="Resolved">🟢 Resolved</option>
                            <option value="Owned">🔵 Owned</option>
                            <option value="Accepted">🟡 Accepted</option>
                            <option value="Mitigated">🟣 Mitigated</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Asignar Responsable</label>
                          <input
                            type="text"
                            placeholder="Nombre del dueño..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                            value={editRoamOwner}
                            onChange={e => setEditRoamOwner(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => saveEdit(risk.id)}
                          className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-shadow shadow-lg shadow-slate-200"
                        >
                          Actualizar Riesgo y Mapa
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed mb-1">
                          {risk.riskDescription}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {risk.cause.split('\n').map((c, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                              Causa: {c}
                            </span>
                          ))}
                        </div>
                        {/* Plan de Acción displaying Suggested Control with AI Assist */}
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 max-w-2xl space-y-2 mt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="font-extrabold text-[10px] text-slate-600 uppercase tracking-widest flex items-center gap-1">
                              ✨ Plan de Acción Definido
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  const btn = document.getElementById(`ai-gen-btn-${risk.id}`);
                                  if (btn) {
                                    btn.setAttribute('disabled', 'true');
                                    btn.innerText = '🤖 Generando Plan con IA...';
                                  }
                                  
                                  const response = await fetch("/api/generate-action-plan", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      description: risk.riskDescription,
                                      processArea: risk.processArea
                                    })
                                  });
                                  const data = await response.json();
                                  if (data.actionPlan) {
                                    onModify(risk.id, { suggestedControl: data.actionPlan });
                                  } else {
                                    alert('Error generando el plan con IA.');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Ocurrió un error al contactar al servidor.');
                                } finally {
                                  const btn = document.getElementById(`ai-gen-btn-${risk.id}`);
                                  if (btn) {
                                    btn.removeAttribute('disabled');
                                    btn.innerText = 'Generar Plan de Acción Express con IA';
                                  }
                                }
                              }}
                              id={`ai-gen-btn-${risk.id}`}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                            >
                              Generar Plan de Acción Express con IA
                            </button>
                          </div>
                          <textarea
                            className="w-full bg-white border border-slate-200 text-xs font-medium rounded-lg p-2 outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-700"
                            value={risk.suggestedControl || ''}
                            onChange={(e) => onModify(risk.id, { suggestedControl: e.target.value })}
                            placeholder="Defina el plan de acción..."
                            rows={2}
                          />
                        </div>

                        {/* Interactive ROAM dropdown and Responsible Assignment */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 pt-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 max-w-2xl mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seguimiento ROAM:</span>
                            <select
                              value={risk.roamStatus || 'Mitigated'}
                              onChange={(e) => onModify(risk.id, { roamStatus: e.target.value as any })}
                              className="bg-white border border-slate-200 text-xs font-black rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-xs"
                            >
                              <option value="Resolved">🟢 Resolved (Residual = 1)</option>
                              <option value="Owned">🔵 Owned (Asignado)</option>
                              <option value="Accepted">🟡 Accepted (Aceptado)</option>
                              <option value="Mitigated">🟣 Mitigated (Imp -1, Prob -2)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dueño de Proceso (ROAM Owner):</span>
                            <input
                              type="text"
                              value={risk.roamOwner || ''}
                              onChange={(e) => onModify(risk.id, { roamOwner: e.target.value })}
                              placeholder="Ej: María Gutiérrez / Oficial Compliance"
                              className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-slate-900 w-52 shadow-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 🛡️ SECCIÓN DE CONTROLES ASOCIADOS & EVALUACIÓN DE MITIGACIÓN */}
                      <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14} className="text-slate-500" />
                            Controles Asociados (Inherent vs Residual GRC)
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openAddControlModal(risk)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black transition-all shadow-sm cursor-pointer"
                              title="Calificar Control bajo los 5 Criterios de la Metodología Oficial (IC)"
                            >
                              <Sparkles size={12} className="text-amber-300" />
                              Calificar Control (Metodología IC)
                            </button>
                            <button
                              id={`add-ctrl-btn-${risk.id}`}
                              onClick={() => {
                                if (addingControlToId === risk.id) {
                                  setAddingControlToId(null);
                                } else {
                                  setAddingControlToId(risk.id);
                                  setNewCtrlDesc('');
                                  setNewCtrlType('Preventivo');
                                  setNewCtrlEfficiency('Excelente');
                                  setNewCtrlImpactRed(1);
                                  setNewCtrlProbRed(2);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                            >
                              {addingControlToId === risk.id ? <X size={12} /> : <Plus size={12} />}
                              {addingControlToId === risk.id ? 'Cerrar' : 'Agregar Rápido'}
                            </button>
                          </div>
                        </div>

                        {/* Form to Add Control */}
                        {addingControlToId === risk.id && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nuevo Control de Mitigación</div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingControlToId(null);
                                  openAddControlModal(risk);
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles size={11} /> Usar Evaluación Completa (5 Criterios IC)
                              </button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase">Descripción / Paso Operativo del Control</label>
                              <textarea
                                rows={2}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-800"
                                value={newCtrlDesc}
                                onChange={e => setNewCtrlDesc(e.target.value)}
                                placeholder="Escriba los detalles del control..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Tipo */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Tipo de Control</label>
                                <select
                                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                                  value={newCtrlType}
                                  onChange={e => setNewCtrlType(e.target.value as any)}
                                >
                                  <option value="Preventivo">✔️ Preventivo</option>
                                  <option value="Detectivo">🔍 Detectivo</option>
                                  <option value="Correctivo">🩹 Correctivo</option>
                                </select>
                              </div>

                              {/* Eficacia */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Eficacia / Robusto</label>
                                <select
                                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                                  value={newCtrlEfficiency}
                                  onChange={e => {
                                    const eff = e.target.value as 'Excelente' | 'Bueno' | 'Débil';
                                    setNewCtrlEfficiency(eff);
                                    if (eff === 'Excelente') {
                                      setNewCtrlImpactRed(1);
                                      setNewCtrlProbRed(2);
                                    } else if (eff === 'Bueno') {
                                      setNewCtrlImpactRed(1);
                                      setNewCtrlProbRed(1);
                                    } else {
                                      setNewCtrlImpactRed(0);
                                      setNewCtrlProbRed(1);
                                    }
                                  }}
                                >
                                  <option value="Excelente">🟢 Excelente (Fuerte)</option>
                                  <option value="Bueno">🟡 Bueno (Suficiente)</option>
                                  <option value="Débil">🔴 Débil (Incompleto)</option>
                                </select>
                              </div>

                              {/* Mitigations */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Mitigación Estimada</label>
                                <div className="flex gap-2">
                                  <select
                                    className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none hover:border-slate-400"
                                    value={newCtrlImpactRed}
                                    onChange={e => setNewCtrlImpactRed(Number(e.target.value))}
                                    title="Reducción de Impacto"
                                  >
                                    <option value={0}>0 Impacto</option>
                                    <option value={1}>-1 Impacto</option>
                                    <option value={2}>-2 Impacto</option>
                                  </select>
                                  <select
                                    className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none hover:border-slate-400"
                                    value={newCtrlProbRed}
                                    onChange={e => setNewCtrlProbRed(Number(e.target.value))}
                                    title="Reducción de Probabilidad"
                                  >
                                    <option value={0}>0 Prob.</option>
                                    <option value={1}>-1 Prob.</option>
                                    <option value={2}>-2 Prob.</option>
                                    <option value={3}>-3 Prob.</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                              <button
                                onClick={() => setAddingControlToId(null)}
                                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleAddControl(risk)}
                                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                Vincular Control
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Control Listing */}
                        <div className="space-y-2">
                          {(!risk.associatedControls || risk.associatedControls.length === 0) ? (
                            <div className="text-xs text-slate-400 italic bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                              No hay controles asignados en esta vista. El riesgo residual es idéntico al riesgo inherente.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                              {risk.associatedControls.map((ctrl) => (
                                <div key={ctrl.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-850 leading-relaxed">{ctrl.description}</p>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                        {ctrl.type}
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                        ctrl.efficiency === 'Excelente' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        ctrl.efficiency === 'Bueno' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-rose-50 text-rose-700 border-rose-200'
                                      }`}>
                                        Eficacia: {ctrl.efficiency}
                                      </span>
                                      {ctrl.controlIndex !== undefined && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                                          IC: {ctrl.controlIndex}%
                                        </span>
                                      )}
                                      {ctrl.nature && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                                          {ctrl.nature}
                                        </span>
                                      )}
                                      {ctrl.responsibility && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          {ctrl.responsibility}
                                        </span>
                                      )}
                                      {(ctrl.impactReduction > 0 || ctrl.probabilityReduction > 0) && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                          Mitiga: {ctrl.impactReduction > 0 ? `-${ctrl.impactReduction} Impacto ` : ''}{ctrl.probabilityReduction > 0 ? `-${ctrl.probabilityReduction} Prob.` : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => openEditControlModal(risk, ctrl)}
                                      className="px-2 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-black border border-indigo-100"
                                      title="Modificar y Calificar Control bajo los 5 Criterios de la Metodología Oficial"
                                    >
                                      <Edit3 size={13} />
                                      <span>Calificar</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteControl(risk, ctrl.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar control"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dual Score Evaluation */}
                        {(() => {
                          const inherentScore = risk.impact * risk.probability;
                          const inherentLevel = getRiskLevel(inherentScore);

                          const controlsList = risk.associatedControls || [];
                          const sumImpactRed = controlsList.reduce((sum, c) => sum + c.impactReduction, 0);
                          const sumProbRed = controlsList.reduce((sum, c) => sum + c.probabilityReduction, 0);

                          const residualImpact = Math.max(1, risk.impact - sumImpactRed);
                          const residualProbability = Math.max(1, risk.probability - sumProbRed);
                          const residualScore = residualImpact * residualProbability;
                          const residualLevel = getRiskLevel(residualScore);

                          const getLevelTagColor = (level: string) => {
                            switch (level) {
                              case 'EXTREMO': return 'bg-red-600 text-white';
                              case 'ALTO': return 'bg-orange-500 text-white';
                              case 'MODERADO': return 'bg-yellow-400 text-black';
                              case 'BAJO': return 'bg-green-500 text-white';
                              default: return 'bg-slate-400 text-white';
                            }
                          };

                          const isAcceptable = residualScore <= 12;

                          return (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {/* Inherent */}
                                <div className="space-y-2.5 pr-0 lg:pr-3 border-slate-200 lg:border-r lg:border-dashed">
                                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    RIESGO INHERENTE
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 items-end">
                                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-xs flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Impacto</span>
                                      <span className="text-sm font-extrabold text-slate-800 mt-0.5">{risk.impact} / 5</span>
                                    </div>
                                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-xs flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Probabilidad</span>
                                      <span className="text-sm font-extrabold text-slate-800 mt-0.5">{risk.probability} / 5</span>
                                    </div>
                                    <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200/60 shadow-xs flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">Nivel (NR)</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase text-center truncate ${getLevelTagColor(inherentLevel)}`}>
                                        {inherentScore} - {inherentLevel}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Residual */}
                                <div className="space-y-2.5 pl-0 lg:pl-3">
                                  <div className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    RIESGO RESIDUAL
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 items-end">
                                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-xs flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Impacto</span>
                                      <span className="text-sm font-extrabold text-slate-800 mt-0.5">{residualImpact} / 5</span>
                                    </div>
                                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-xs flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Probabilidad</span>
                                      <span className="text-sm font-extrabold text-slate-800 mt-0.5">{residualProbability} / 5</span>
                                    </div>
                                    <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200/60 shadow-xs flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">Nivel Residual</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase text-center truncate ${getLevelTagColor(residualLevel)}`}>
                                        {residualScore} - {residualLevel}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Aceptabilidad */}
                              <div className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                                isAcceptable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                <span>Aceptabilidad: {isAcceptable ? '🟢 ACEPTABLE' : '🔴 NO ACEPTABLE (Requiere tratamiento urgente)'}</span>
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Normativa ISO 31000</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {risk.status === 'Pendiente' && (
                      <button
                        onClick={() => onAccept(risk.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group relative"
                        title="Aceptar Riesgo"
                      >
                        <CheckCircle2 size={20} />
                        <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Aceptar (🟢)</span>
                      </button>
                    )}
                    <button
                      onClick={() => openAddControlModal(risk)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group relative cursor-pointer"
                      title="Calificar Controles y Riesgos bajo Metodología Oficial (IC)"
                    >
                      <Shield size={20} />
                      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                        Calificar Metodología (IC)
                      </span>
                    </button>
                    <button
                      onClick={() => startEditing(risk)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors group relative"
                      title="Modificar Redacción"
                    >
                      <Edit3 size={20} />
                      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Modificar (🟡)</span>
                    </button>
                    <button
                      disabled={risk.status === 'Aprobado'}
                      onClick={() => onReject(risk.id)}
                      className={`p-2 rounded-lg transition-colors group relative ${
                        risk.status === 'Aprobado'
                          ? 'text-slate-300 cursor-not-allowed opacity-50 bg-transparent'
                          : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                      }`}
                      title={risk.status === 'Aprobado' ? "Los riesgos aprobados son definitivos e inmutables" : "Rechazar y Eliminar"}
                    >
                      <Trash2 size={20} />
                      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        {risk.status === 'Aprobado' ? "Aprobado (Definitivo)" : "Rechazar (🔴)"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {risks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No hay riesgos en el catálogo para esta sección.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CALIFICACIÓN DE CONTROLES BAJO METODOLOGÍA OFICIAL */}
      {ratingModalRisk && (
        <ControlRatingModal
          isOpen={true}
          onClose={() => {
            setRatingModalRisk(null);
            setRatingModalControl(null);
          }}
          risk={ratingModalRisk}
          controlToEdit={ratingModalControl}
          onSaveControl={handleSaveControlFromModal}
        />
      )}
    </div>
  );
}
