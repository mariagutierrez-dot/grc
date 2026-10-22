import React, { useState, useMemo } from 'react';
import { Risk, ControlProposal, ControlEvaluation, ControlType, ControlNature, ControlResponsibility, ControlFormality, ControlFrequency, getRiskLevel, getRiskColor } from '../types';
import { Sparkles, Check, X, AlertCircle, ShieldCheck, Zap, Target, Users, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ControlProposalModuleProps {
  risks: Risk[];
  onApplyControl: (riskId: string, proposal: ControlProposal) => void;
}

export const ControlProposalModule: React.FC<ControlProposalModuleProps> = ({ risks, onApplyControl }) => {
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  
  const getAISuggestions = (risk: Risk): ControlProposal[] => {
    const baseId = `PROP-${risk.id}`;
    
    return [
      {
        id: `${baseId}-1`,
        riskId: risk.id,
        type: 'Preventivo',
        description: `Implementar automatización de controles para ${risk.process} mediante integración API y validación en tiempo real.`,
        status: 'Pendiente'
      },
      {
        id: `${baseId}-2`,
        riskId: risk.id,
        type: 'Detectivo',
        description: `Establecer un tablero de monitoreo continuo con alertas de desviación para ${risk.riskDescription}.`,
        status: 'Pendiente'
      },
      {
        id: `${baseId}-3`,
        riskId: risk.id,
        type: 'Correctivo',
        description: `Definir un protocolo de respuesta rápida y plan de contingencia específico para mitigar el impacto de ${risk.cause}.`,
        status: 'Pendiente'
      }
    ];
  };

  const selectedRisk = useMemo(() => risks.find(r => r.id === selectedRiskId), [risks, selectedRiskId]);
  const proposals = useMemo(() => selectedRisk ? getAISuggestions(selectedRisk) : [], [selectedRisk]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={18} className="text-slate-500" />
              Mesa de Trabajo
            </h3>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
              {risks.length} Riesgos
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {risks.map((risk) => (
              <button
                key={risk.id}
                onClick={() => setSelectedRiskId(risk.id)}
                className={`w-full text-left p-4 transition-all hover:bg-slate-50 flex flex-col gap-2 ${selectedRiskId === risk.id ? 'bg-slate-100 ring-2 ring-inset ring-slate-900' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{risk.id}</span>
                  <div className="flex gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getRiskColor(getRiskLevel(risk.impact * risk.probability))}`}>
                      INH: {risk.impact * risk.probability}
                    </span>
                    {risk.residualImpact && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700">
                        RES: {risk.residualImpact * risk.residualProbability!}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{risk.process}</p>
                {risk.appliedControlId && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase">
                    <ShieldCheck size={10} /> Control Aplicado (IC: {risk.controlIndex}%)
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <AnimatePresence mode="wait">
          {selectedRisk ? (
            <motion.div
              key={selectedRisk.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-mono font-bold">{selectedRisk.id}</span>
                    <span className="text-white/60 text-xs uppercase font-bold tracking-widest">{selectedRisk.processArea}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{selectedRisk.process}</h2>
                  <p className="text-slate-300 text-sm mb-4">{selectedRisk.riskDescription}</p>
                  <div className="flex gap-4">
                    <div className="bg-white/10 rounded-lg px-3 py-2">
                      <span className="block text-[10px] text-white/50 uppercase font-bold">Impacto</span>
                      <span className="text-lg font-bold">{selectedRisk.impact}</span>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-2">
                      <span className="block text-[10px] text-white/50 uppercase font-bold">Probabilidad</span>
                      <span className="text-lg font-bold">{selectedRisk.probability}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  Calificación de Controles Definitivos
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {proposals.map((prop) => (
                    <ProposalCard 
                      key={prop.id} 
                      proposal={prop} 
                      onApply={(p) => onApplyControl(selectedRisk.id, p)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Selecciona un riesgo para calificar controles</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProposalCard: React.FC<{ proposal: ControlProposal, onApply: (p: ControlProposal) => void }> = ({ proposal, onApply }) => {
  const [evaluation, setEvaluation] = useState<ControlEvaluation>({
    type: proposal.type,
    nature: 'Manual',
    responsibility: 'Solo Asignado',
    formality: 'Solo Documentado',
    frequency: 'Muestreo Frecuente'
  });

  const scores = {
    type: { 'Preventivo': 100, 'Detectivo': 50, 'Correctivo': 20 },
    nature: { 'Automático': 100, 'Combinado': 50, 'Manual': 20 },
    responsibility: { 'Asignado y Monitoreado': 100, 'Solo Asignado': 50, 'No Asignado': 0 },
    formality: { 'Divulgado y Evidenciable': 100, 'Solo Documentado': 50, 'Informal': 0 },
    frequency: { 'Continuo y Total 100%': 100, 'Muestreo Frecuente': 50, 'Inadecuado o Esporádico': 10 }
  };

  const ic = useMemo(() => {
    return (
      scores.type[evaluation.type] * 0.4 +
      scores.nature[evaluation.nature] * 0.2 +
      scores.responsibility[evaluation.responsibility] * 0.2 +
      scores.formality[evaluation.formality] * 0.1 +
      scores.frequency[evaluation.frequency] * 0.1
    );
  }, [evaluation]);

  const getICColor = (val: number) => {
    if (val >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (val >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (val >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getICLabel = (val: number) => {
    if (val >= 85) return 'Excelente';
    if (val >= 60) return 'Bueno';
    return 'Débil';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
            evaluation.type === 'Preventivo' ? 'bg-blue-50 text-blue-600' :
            evaluation.type === 'Detectivo' ? 'bg-purple-50 text-purple-600' :
            'bg-amber-50 text-amber-600'
          }`}>
            {evaluation.type}
          </span>
          <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-2 ${getICColor(ic)}`}>
            Índice de Control (IC): {ic.toFixed(1)}% - {getICLabel(ic)}
          </div>
        </div>
        
        <p className="text-slate-800 font-medium leading-relaxed">
          {proposal.description}
        </p>
      </div>

      <div className="p-6 bg-slate-50/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Control */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Target size={12} /> Tipo de Control (40%)
            </label>
            <div className="flex flex-col gap-1">
              {(['Preventivo', 'Detectivo', 'Correctivo'] as ControlType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setEvaluation(prev => ({ ...prev, type: v }))}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex justify-between items-center ${
                    evaluation.type === v 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {v}
                  <span className="opacity-60 font-mono">{scores.type[v]} pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Naturaleza */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Zap size={12} /> Naturaleza (20%)
            </label>
            <div className="flex flex-col gap-1">
              {(['Automático', 'Combinado', 'Manual'] as ControlNature[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setEvaluation(prev => ({ ...prev, nature: v }))}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex justify-between items-center ${
                    evaluation.nature === v 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {v}
                  <span className="opacity-60 font-mono">{scores.nature[v]} pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Responsabilidad */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Users size={12} /> Responsabilidad (20%)
            </label>
            <div className="flex flex-col gap-1">
              {(['Asignado y Monitoreado', 'Solo Asignado', 'No Asignado'] as ControlResponsibility[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setEvaluation(prev => ({ ...prev, responsibility: v }))}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex justify-between items-center ${
                    evaluation.responsibility === v 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {v}
                  <span className="opacity-60 font-mono">{scores.responsibility[v]} pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formalidad */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <FileText size={12} /> Formalidad (10%)
            </label>
            <div className="flex flex-col gap-1">
              {(['Divulgado y Evidenciable', 'Solo Documentado', 'Informal'] as ControlFormality[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setEvaluation(prev => ({ ...prev, formality: v }))}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex justify-between items-center ${
                    evaluation.formality === v 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {v}
                  <span className="opacity-60 font-mono">{scores.formality[v]} pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Activity size={12} /> Frecuencia y Cobertura (10%)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['Continuo y Total 100%', 'Muestreo Frecuente', 'Inadecuado o Esporádico'] as ControlFrequency[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setEvaluation(prev => ({ ...prev, frequency: v }))}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex justify-between items-center ${
                    evaluation.frequency === v 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {v}
                  <span className="opacity-60 font-mono">{scores.frequency[v]} pts</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Puntos */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Resumen de Calificación</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Tipo', val: scores.type[evaluation.type] * 0.4 },
              { label: 'Nat', val: scores.nature[evaluation.nature] * 0.2 },
              { label: 'Resp', val: scores.responsibility[evaluation.responsibility] * 0.2 },
              { label: 'Form', val: scores.formality[evaluation.formality] * 0.1 },
              { label: 'Freq', val: scores.frequency[evaluation.frequency] * 0.1 },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <span className="block text-[8px] font-bold text-slate-400 uppercase">{item.label}</span>
                <span className="text-sm font-black text-slate-700">{item.val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => onApply({ ...proposal, evaluation, controlIndex: ic })}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
          >
            <Check size={18} />
            Aplicar Control y Mitigar Riesgo
          </button>
          <button
            className="px-4 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
