import React, { useState, useMemo } from 'react';
import { Risk, GLOBAL66_PROCESS_TAXONOMY, ProcessMacroCategory } from '../types';
import { PlusCircle, X, Layers, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_SUBPROCESSES, resolveTaxonomyForRisk } from '../lib/processTaxonomyHelper';

interface RiskFormProps {
  onAddRisk: (risk: Risk) => void;
}

export const RiskForm: React.FC<RiskFormProps> = ({ onAddRisk }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMacrocategory, setSelectedMacrocategory] = useState<ProcessMacroCategory>('Misionales');
  const [selectedProcessId, setSelectedProcessId] = useState<number>(7); // Default a Proceso 7 Operaciones y Tesorería
  const [selectedSubproceso, setSelectedSubproceso] = useState<string>('Tesorería (Custodia, cuentas de salvaguarda, DAP)');

  const [formData, setFormData] = useState<Partial<Risk>>({
    process: 'Tesorería: Custodia, cuentas de salvaguarda y liquidez',
    processArea: 'Tesorería',
    secondaryProcessArea: undefined,
    origin: undefined,
    riskDescription: '',
    timestamp: '',
    cause: '',
    impact: 3,
    probability: 3,
    suggestedControl: '',
    controlDuration: 'Permanente',
    financiero: 3,
    procesos: undefined,
    reputacional: undefined,
    legal: undefined,
  });

  // Procesos disponibles filtrados por la macrocategoría seleccionada
  const availableProcesses = useMemo(() => {
    return GLOBAL66_PROCESS_TAXONOMY.filter(p => p.macrocategory === selectedMacrocategory);
  }, [selectedMacrocategory]);

  // Subprocesos oficiales disponibles para el proceso seleccionado
  const availableSubprocesses = useMemo(() => {
    return OFFICIAL_SUBPROCESSES[selectedProcessId] || [
      'Operación general del proceso',
      'Control y aseguramiento interno'
    ];
  }, [selectedProcessId]);

  const handleMacrocategoryChange = (macro: ProcessMacroCategory) => {
    setSelectedMacrocategory(macro);
    const firstProc = GLOBAL66_PROCESS_TAXONOMY.find(p => p.macrocategory === macro) || GLOBAL66_PROCESS_TAXONOMY[0];
    setSelectedProcessId(firstProc.id);
    const subps = OFFICIAL_SUBPROCESSES[firstProc.id] || ['Operación general del proceso'];
    const initialSubp = subps[0];
    setSelectedSubproceso(initialSubp);

    const resolved = resolveTaxonomyForRisk({
      macrocategory: macro,
      taxonomyProcessId: firstProc.id,
      subproceso: initialSubp
    });

    setFormData(prev => ({
      ...prev,
      processArea: resolved.processArea,
      process: `${firstProc.categoryLevel1} - ${initialSubp}`
    }));
  };

  const handleProcessChange = (procId: number) => {
    setSelectedProcessId(procId);
    const procDef = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === procId);
    if (!procDef) return;

    setSelectedMacrocategory(procDef.macrocategory);
    const subps = OFFICIAL_SUBPROCESSES[procId] || ['Operación general del proceso'];
    const initialSubp = subps[0];
    setSelectedSubproceso(initialSubp);

    const resolved = resolveTaxonomyForRisk({
      macrocategory: procDef.macrocategory,
      taxonomyProcessId: procId,
      subproceso: initialSubp
    });

    setFormData(prev => ({
      ...prev,
      processArea: resolved.processArea,
      process: `${procDef.categoryLevel1} - ${initialSubp}`
    }));
  };

  const handleSubprocesoChange = (subp: string) => {
    setSelectedSubproceso(subp);
    const procDef = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === selectedProcessId);
    if (!procDef) return;

    const resolved = resolveTaxonomyForRisk({
      macrocategory: procDef.macrocategory,
      taxonomyProcessId: procDef.id,
      subproceso: subp
    });

    setFormData(prev => ({
      ...prev,
      processArea: resolved.processArea,
      process: `${procDef.categoryLevel1} - ${subp}`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submittedControl = (formData.suggestedControl || '').trim();
    const hasControl = submittedControl.length > 0;
    
    // One-Click / Math.max Impact Calculation
    const fin = formData.financiero || 3;
    const proc = formData.procesos;
    const rep = formData.reputacional;
    const leg = formData.legal;

    let finalImpact = fin;
    const activeDimensions = [fin];
    if (proc !== undefined && proc > 0) activeDimensions.push(proc);
    if (rep !== undefined && rep > 0) activeDimensions.push(rep);
    if (leg !== undefined && leg > 0) activeDimensions.push(leg);
    finalImpact = Math.max(...activeDimensions);

    const currentProcDef = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === selectedProcessId)!;
    const resolved = resolveTaxonomyForRisk({
      macrocategory: currentProcDef.macrocategory,
      taxonomyProcessId: currentProcDef.id,
      subproceso: selectedSubproceso,
      processArea: formData.processArea,
      riskDescription: formData.riskDescription
    });

    const finalRisk: Partial<Risk> = {
      ...formData,
      macrocategory: resolved.macrocategory,
      taxonomyProcessId: resolved.taxonomyProcessId,
      taxonomyProcessName: resolved.taxonomyProcessName,
      subproceso: resolved.subproceso,
      processArea: resolved.processArea,
      process: formData.process || `${resolved.taxonomyProcessName} - ${resolved.subproceso}`,
      impact: finalImpact,
      suggestedControl: hasControl 
        ? submittedControl 
        : 'Soporte y Mitigación de Auditoría Interna Permanente - ISO 31000',
      controlDuration: hasControl 
        ? (formData.controlDuration || 'Permanente') 
        : 'Permanente'
    };
    
    onAddRisk(finalRisk as any);
    
    setIsOpen(false);
    setFormData({
      process: 'Tesorería: Custodia, cuentas de salvaguarda y liquidez',
      processArea: 'Tesorería',
      secondaryProcessArea: undefined,
      origin: undefined,
      riskDescription: '',
      timestamp: '',
      cause: '',
      impact: 3,
      probability: 3,
      suggestedControl: '',
      controlDuration: 'Permanente',
      financiero: 3,
      procesos: undefined,
      reputacional: undefined,
      legal: undefined,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm cursor-pointer"
      >
        <PlusCircle size={18} />
        Nuevo Riesgo
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#102A97] text-white flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Identificar Nuevo Riesgo (ISO 31000)</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Alineación estricta con la Taxonomía Regional de 14 Procesos</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* SELECCIÓN ESTRUCTURADA DE LA TAXONOMÍA CORPORATIVA (CASCADA) */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#102A97] flex items-center gap-1.5">
                <Layers size={14} className="text-[#102A97]" />
                <span>Taxonomía Unificada Regional (Sin Procesos Inventados)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#102A97]">
                Proceso #{selectedProcessId}
              </span>
            </div>

            {/* NIVEL 0: MACROCATEGORÍA */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                1. Macroproceso Corporativo:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Estratégicos', 'Misionales', 'De Apoyo', 'Evaluación Independiente'] as ProcessMacroCategory[]).map(macro => (
                  <button
                    key={macro}
                    type="button"
                    onClick={() => handleMacrocategoryChange(macro)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer ${
                      selectedMacrocategory === macro
                        ? 'bg-[#102A97] text-white border-[#102A97] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {macro === 'Evaluación Independiente' ? 'Evaluación Indep.' : macro}
                  </button>
                ))}
              </div>
            </div>

            {/* NIVEL 1: PROCESO OFICIAL (1 a 14) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                2. Proceso Regional Nivel 1:
              </label>
              <select
                className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#102A97] outline-none shadow-sm"
                value={selectedProcessId}
                onChange={e => handleProcessChange(Number(e.target.value))}
              >
                {availableProcesses.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.categoryLevel1}
                  </option>
                ))}
              </select>
            </div>

            {/* NIVEL 2: SUBPROCESO ESPECÍFICO */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                3. Subproceso Nivel 2 Oficial:
              </label>
              <select
                className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#102A97] outline-none shadow-sm"
                value={selectedSubproceso}
                onChange={e => handleSubprocesoChange(e.target.value)}
              >
                {availableSubprocesses.map(subp => (
                  <option key={subp} value={subp}>
                    {subp}
                  </option>
                ))}
              </select>
            </div>

            {/* ÁREA ASIGNADA AUTOMÁTICAMENTE */}
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
              <span>Área Operativa Mapeada:</span>
              <span className="font-mono font-black text-[#102A97] bg-white px-2 py-0.5 rounded border border-blue-200">
                {formData.processArea}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Actividad o Detalle Específico</label>
              <input
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-xs font-medium"
                value={formData.process}
                onChange={e => setFormData({ ...formData, process: e.target.value })}
                placeholder="Ej: Conciliación de saldos y cuentas de salvaguarda"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
                <span>⚡ Línea de Producto (Opcional)</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-slate-800 text-xs"
                value={formData.product || ''}
                onChange={e => setFormData({ ...formData, product: e.target.value ? e.target.value : undefined })}
              >
                <option value="">Transversal / General</option>
                <option value="Stablecoins">🪙 Stablecoins (USDT / USDC)</option>
                <option value="Integración SII Chile">🇨🇱 Integración SII Chile (B2B)</option>
                <option value="Bre-B">⚡ Bre-B (Pagos Inmediatos CO)</option>
                <option value="Adquirencia Global">💳 Adquirencia Global (B2B Deposit)</option>
                <option value="APIB2B(MCP)">🤖 APIB2B (MCP AI Agents)</option>
                <option value="Integración CCE - Perú">🇵🇪 Integración CCE - Perú</option>
                <option value="Payout Swift JPMorgan">🏛️ Payout Swift JPMorgan</option>
                <option value="Global chats">💬 Global chats (Kit P2P Wow)</option>
                <option value="Tarjetas Temporales">⏱️ Tarjetas Temporales</option>
                <option value="Flujo de Bloqueos">🔒 Flujo de Bloqueos</option>
                <option value="Multitarjeta">💳 Multitarjeta</option>
                <option value="Cuentas Virtuales">🏦 Cuentas Virtuales</option>
                <option value="GlobalID">🪪 GlobalID</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Timestamp (Opcional)</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              value={formData.timestamp}
              onChange={e => setFormData({ ...formData, timestamp: e.target.value })}
              placeholder="Ej: Min 09:38"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Área Secundaria (Vinculada)</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 bg-white"
                value={formData.secondaryProcessArea || ''}
                onChange={e => setFormData({ ...formData, secondaryProcessArea: e.target.value ? e.target.value as any : undefined })}
              >
                <option value="">Ninguna</option>
                <option value="Conciliaciones">Conciliaciones</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Tesorería">Tesorería</option>
                <option value="Mesa de Dinero">Mesa de Dinero</option>
                <option value="Cumplimiento">Cumplimiento</option>
                <option value="Fraude">Fraude</option>
                <option value="Ciberseguridad">Ciberseguridad</option>
                <option value="TI">TI</option>
                <option value="Nuevos Productos">Nuevos Productos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Origen del Riesgo</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 bg-white"
                value={formData.origin || ''}
                onChange={e => setFormData({ ...formData, origin: e.target.value ? e.target.value as any : undefined })}
              >
                <option value="">Sin especificar</option>
                <option value="Interno">Interno (Proceso/Personal)</option>
                <option value="Externo">Externo (Usuario/Ataque)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Descripción del Riesgo (Narrativa Natural)</label>
            <textarea
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none min-h-[80px]"
              value={formData.riskDescription}
              onChange={e => setFormData({ ...formData, riskDescription: e.target.value })}
              placeholder="Ej: Una deficiencia operativa en el proceso X que derivaría en Y. (Nota: si escribe 'originado por Z', el sistema extraerá automáticamente Z a la sección de causas)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Causa Raíz</label>
            <textarea
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              value={formData.cause}
              onChange={e => setFormData({ ...formData, cause: e.target.value })}
            />
          </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Calificación de Impacto (ISO 31000)</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">1. Financiero *</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold text-slate-700 outline-none"
                  value={formData.financiero || 3}
                  onChange={e => {
                    const finVal = parseInt(e.target.value);
                    const active = [finVal];
                    if (formData.procesos && formData.procesos > 0) active.push(formData.procesos);
                    if (formData.reputacional && formData.reputacional > 0) active.push(formData.reputacional);
                    if (formData.legal && formData.legal > 0) active.push(formData.legal);
                    setFormData({
                      ...formData,
                      financiero: finVal,
                      impact: Math.max(...active)
                    });
                  }}
                >
                  <option value={1}>1 - Menor (&lt; $660K)</option>
                  <option value={2}>2 - Moderado ($660K - $880K)</option>
                  <option value={3}>3 - Serio ($880K - $1.1M)</option>
                  <option value={4}>4 - Mayor ($1.1M - $1.76M)</option>
                  <option value={5}>5 - Catastrófico (&gt; $1.76M)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">2. Procesos</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold text-slate-700 outline-none"
                  value={formData.procesos !== undefined ? formData.procesos : 0}
                  onChange={e => {
                    const procVal = parseInt(e.target.value);
                    const active = [formData.financiero || 3];
                    if (procVal > 0) active.push(procVal);
                    if (formData.reputacional && formData.reputacional > 0) active.push(formData.reputacional);
                    if (formData.legal && formData.legal > 0) active.push(formData.legal);
                    setFormData({
                      ...formData,
                      procesos: procVal > 0 ? procVal : undefined,
                      impact: Math.max(...active)
                    });
                  }}
                >
                  <option value={0}>No calificado (Express)</option>
                  <option value={1}>1 - Menor (&le; 1 día)</option>
                  <option value={2}>2 - Moderado (2-3 días)</option>
                  <option value={3}>3 - Serio (4-5 días)</option>
                  <option value={4}>4 - Mayor (5-7 días)</option>
                  <option value={5}>5 - Catastrófico (&gt; 7 días)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">3. Reputacional</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold text-slate-700 outline-none"
                  value={formData.reputacional !== undefined ? formData.reputacional : 0}
                  onChange={e => {
                    const repVal = parseInt(e.target.value);
                    const active = [formData.financiero || 3];
                    if (formData.procesos && formData.procesos > 0) active.push(formData.procesos);
                    if (repVal > 0) active.push(repVal);
                    if (formData.legal && formData.legal > 0) active.push(formData.legal);
                    setFormData({
                      ...formData,
                      reputacional: repVal > 0 ? repVal : undefined,
                      impact: Math.max(...active)
                    });
                  }}
                >
                  <option value={0}>No calificado (Express)</option>
                  <option value={1}>1 - Menor (Interno)</option>
                  <option value={2}>2 - Moderado (Entidad)</option>
                  <option value={3}>3 - Serio (Sectorial)</option>
                  <option value={4}>4 - Mayor (Nacional)</option>
                  <option value={5}>5 - Catastrófico (Internacional)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">4. Legal / Cumplimiento</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold text-slate-700 outline-none"
                  value={formData.legal !== undefined ? formData.legal : 0}
                  onChange={e => {
                    const legVal = parseInt(e.target.value);
                    const active = [formData.financiero || 3];
                    if (formData.procesos && formData.procesos > 0) active.push(formData.procesos);
                    if (formData.reputacional && formData.reputacional > 0) active.push(formData.reputacional);
                    if (legVal > 0) active.push(legVal);
                    setFormData({
                      ...formData,
                      legal: legVal > 0 ? legVal : undefined,
                      impact: Math.max(...active)
                    });
                  }}
                >
                  <option value={0}>No calificado (Express)</option>
                  <option value={1}>1 - Menor (Recomendación)</option>
                  <option value={2}>2 - Moderado (Vigilancia)</option>
                  <option value={3}>3 - Serio (Glosa efectos)</option>
                  <option value={4}>4 - Mayor (Multas)</option>
                  <option value={5}>5 - Catastrófico (Cierre/Interv.)</option>
                </select>
              </div>
            </div>

            <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between text-xs font-black text-indigo-700">
              <span>Impacto General Decidido (Math.max):</span>
              <span>{formData.impact || 3} / 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Probabilidad (Frecuencia)</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700"
                value={formData.probability}
                onChange={e => setFormData({ ...formData, probability: parseInt(e.target.value) })}
              >
                <option value={1}>1 - Muy Improbable (Anual)</option>
                <option value={2}>2 - Poco Probable (Semestral)</option>
                <option value={3}>3 - Posible (Mensual)</option>
                <option value={4}>4 - Probable (Semanal)</option>
                <option value={5}>5 - Casi Seguro (Diario)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Control Sugerido (Opcional)</label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none hover:border-slate-300 transition-colors"
                value={formData.suggestedControl || ''}
                onChange={e => setFormData({ ...formData, suggestedControl: e.target.value })}
                placeholder="Ej: Automatización de API"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Plazo del Control</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white font-medium"
                value={formData.controlDuration || 'Permanente'}
                onChange={e => setFormData({ ...formData, controlDuration: e.target.value as any })}
              >
                <option value="Permanente">Permanente</option>
                <option value="Temporal">Temporal</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Guardar Riesgo
          </button>
        </form>
      </div>
    </div>
  );
};
