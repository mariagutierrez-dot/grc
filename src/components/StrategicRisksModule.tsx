import React, { useState, useMemo } from 'react';
import { Risk, getRiskLevel, getRiskColor, getRiskEmoji, getAcceptability, getExposureUSD, PATRIMONIO_BASE, ProcessArea, RoamStatus } from '../types';
import { Shield, ShieldAlert, Zap, Globe, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, Info, HelpCircle, Activity, Edit2, Save, X, RefreshCw, Lock, Sparkles, Layers, Check, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StrategicRisksModuleProps {
  risks: Risk[];
  onNavigateToRisk?: (id: string) => void;
  onUpdateRisk?: (id: string, updates: Partial<Risk>) => void;
}

interface StrategicVector {
  id: string;
  title: string;
  description: string;
  scenario: string;
  criticalKRI: string;
  riskIds: string[];
  countries: string[];
  vulnerabilityIndex: Record<string, 'Alto' | 'Extremo' | 'Moderado' | 'Bajo'>;
  killScenario: string;
  wefLink: string; // Linking to WEF 2026 core risk
}

export function StrategicRisksModule({ risks, onNavigateToRisk, onUpdateRisk }: StrategicRisksModuleProps) {
  const [selectedVectorId, setSelectedVectorId] = useState<string>('vector-1');
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<'inherent' | 'residual'>('inherent');
  const [heatmapScope, setHeatmapScope] = useState<'vector' | 'all'>('vector');
  const [stressCountry, setStressCountry] = useState<string>('Chile');

  // Form State for editing / rating strategic risk
  const [formProbability, setFormProbability] = useState<number>(3);
  const [formImpact, setFormProbabilityImpact] = useState<number>(3);
  const [formRoamStatus, setFormRoamStatus] = useState<RoamStatus>('Mitigated');
  const [formRoamOwner, setFormRoamOwner] = useState<string>('');
  const [formSuggestedControl, setFormSuggestedControl] = useState<string>('');
  const [formProcessArea, setFormProcessArea] = useState<ProcessArea>('Cumplimiento');
  const [formProcess, setFormProcess] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // WEF 2026 Core Risks mapped to Global66 regional operations
  const WEF_2026_RISKS = [
    {
      rank: '#1 Short-Term',
      title: 'Geoeconomic Confrontation (Confrontación Geoeconómica)',
      description: 'The weaponization of trade, investment, and currencies creates severe regulatory volatility and correspondent banking "De-Risking" threats.',
      global66Impact: 'Terminación unilateral de cuentas clearing en dólares (De-Risking) y descalces de spread cambiario por bloqueos de liquidación.',
      associatedVectors: ['Vector #2: Cierre de Cuentas Corresponsales', 'Vector #5: Arbitraje & Descalce FX']
    },
    {
      rank: '#2 Short-Term',
      title: 'Misinformation & Disinformation (Desinformación y Deepfakes)',
      description: 'The rapid spread of synthetic media and viral rumors erodes trust in financial institutions, triggering liquidity rushes.',
      global66Impact: 'Ataques reputacionales coordinados sobre liquidez o multas falsas de entes reguladores, induciendo retiros de pánico de saldos en app.',
      associatedVectors: ['Vector #1: Pérdida de Licencia Cambiaria']
    },
    {
      rank: '#6 Short-Term',
      title: 'Cyber Insecurity (Inseguridad Cibernética)',
      description: 'Increasing sophistication of automated cyber threats targeting financial infrastructure, database systems, and user APIs.',
      global66Impact: 'Inyección de saldos ficticios o exfiltración de credenciales admin y selfies KYC para fraudes masivos de identidad sintética.',
      associatedVectors: ['Vector #4: Brecha del Core Transaccional']
    },
    {
      rank: '#11 Short-Term',
      title: 'Economic Downturn (Desaceleración Económica)',
      description: 'Persistent inflation pressures and volatile debt burdens lead to stagnation, decreasing cross-border remittance volumes.',
      global66Impact: 'Caída de transaccionalidad regional en pasarelas, aumento de contracargos por fraudes en pasarelas y pérdida de spreads operativos.',
      associatedVectors: ['Vector #3: Fraude Sistémico en Pasarelas', 'Vector #5: Arbitraje & Descalce FX']
    },
    {
      rank: '#5 Long-Term',
      title: 'Adverse Outcomes of AI Technologies (Efectos de IA)',
      description: 'Generative AI supercharges fraud orchestration, creating smart bots that easily bypass legacy KYC/AML and 3DS controls.',
      global66Impact: 'Bypass coordinado de 3DS 2.0 y Onboarding digital usando identidades sintéticas generadas por IA a gran escala.',
      associatedVectors: ['Vector #1: Pérdida de Licencia Cambiaria', 'Vector #3: Fraude Sistémico en Pasarelas']
    }
  ];

  // Core Strategic Vectors linked directly to the real system risk IDs
  const STRATEGIC_VECTORS: StrategicVector[] = [
    {
      id: 'vector-1',
      title: 'Pérdida de Licencia Cambiaria o Sanción Regulatoria',
      description: 'Infracción grave a normativas AML/CFT (UAF, SARLAFT, FinCEN) que derive en suspensión de licencia regional.',
      scenario: 'Apertura de billeteras con identidades sintéticas o triangulación de activos, llevando a multas millonarias y suspensión definitiva para operar remesas transfronterizas.',
      criticalKRI: 'Alertas KYT de velocidad sin resolver > 24 hrs o transacciones con PEPs no declarados',
      riskIds: ['R-COM-003', 'R-COM-001', 'R-FRA-003'],
      countries: ['Chile', 'Perú', 'Colombia', 'Ecuador', 'México', 'USA'],
      vulnerabilityIndex: {
        'Chile': 'Alto',
        'Perú': 'Alto',
        'Colombia': 'Extremo',
        'Ecuador': 'Extremo',
        'México': 'Alto',
        'USA': 'Extremo'
      },
      killScenario: 'La SFC de Colombia o la CMF en Chile retiran la habilitación para operar giros, inhabilitando el 45% del volumen regional y provocando default reputacional ante socios bancarios.',
      wefLink: 'Misinformation & Disinformation (WEF #2) + AI Adverse Outcomes (WEF #5)'
    },
    {
      id: 'vector-2',
      title: 'Cierre de Cuentas Corresponsales (De-Risking Bancario)',
      description: 'Terminación unilateral de cuentas de clearing por parte de bancos locales (BICE, Guayaquil, etc.), inhabilitando el cash-in/cash-out.',
      scenario: 'La falta de controles automatizados Maker-Checker y la dependencia de correos manuales provocan que los bancos asuman la operación como de alto riesgo, procediendo al cierre unilateral inmediato.',
      criticalKRI: 'Transacciones de tesorería ejecutadas mediante correos manuales o sin aprobación dual (Maker-Checker)',
      riskIds: ['R-OPS-001', 'R-OPS-009', 'R-OPS-011', 'R-OPS-013', 'R-OPS-010'],
      countries: ['Chile', 'Ecuador', 'Perú', 'Colombia'],
      vulnerabilityIndex: {
        'Chile': 'Extremo',
        'Ecuador': 'Extremo',
        'Perú': 'Alto',
        'Colombia': 'Moderado',
        'México': 'Bajo',
        'USA': 'Moderado'
      },
      killScenario: 'El banco liquidador de Chile (BICE) o de Ecuador cierra las cuentas operativas corporativas de Global66 por sospechas operativas, dejando a miles de clientes con saldos atrapados sin capacidad de cash-out por más de 15 días.',
      wefLink: 'Geoeconomic Confrontation (WEF #1)'
    },
    {
      id: 'vector-3',
      title: 'Drenado de Liquidez por Fraude Sistémico en Pasarelas',
      description: 'Explotación coordinada de fallas en el scoring de fraude o bypass de protocolos de seguridad (3DS 2.0).',
      scenario: 'Bandas organizadas inyectan tarjetas clonadas mediante ataques de velocidad (Carding) en pasarelas locales sin scoring predictivo ni 3DS, drenando capital de trabajo mediante contracargos masivos obligatorios.',
      criticalKRI: 'Tasa mensual de contracargos (Chargebacks) > 1.1% o alertas de enrolamiento fraudulento duplicadas',
      riskIds: ['R-FRA-SHEET-01', 'R-FRA-001', 'R-LIB-FRA-01'],
      countries: ['Chile', 'Perú', 'Colombia', 'México', 'Ecuador'],
      vulnerabilityIndex: {
        'Chile': 'Moderado',
        'Perú': 'Alto',
        'Colombia': 'Extremo',
        'México': 'Extremo',
        'Ecuador': 'Alto',
        'USA': 'Bajo'
      },
      killScenario: 'Ataques masivos coordinados explotan el bypass de 3DS 2.0 en México o Colombia, acumulando $1.5M USD en contracargos en menos de 72 horas, consumiendo la liquidez inmediata del payout regional.',
      wefLink: 'Economic Downturn (WEF #11) + AI Adverse Outcomes (WEF #5)'
    },
    {
      id: 'vector-4',
      title: 'Brecha Crítica de Datos o Hackeo del Core Transaccional',
      description: 'Acceso no autorizado al backend, alteración de saldos en base de datos o exposición pública de bases de datos.',
      scenario: 'La API de administración pública sin VPN/mTLS o el almacenamiento de selfies en texto claro permite a un actor malicioso alterar el saldo contable, liberando transferencias millonarias falsificadas.',
      criticalKRI: 'Accesos directos a base de datos de producción fuera de horario laboral o fallas mTLS de APIs',
      riskIds: ['R-CIB-001', 'R-CIB-003', 'R-CIB-002'],
      countries: ['Chile', 'Perú', 'Colombia', 'Ecuador', 'México', 'USA'],
      vulnerabilityIndex: {
        'Chile': 'Alto',
        'Perú': 'Alto',
        'Colombia': 'Alto',
        'Ecuador': 'Alto',
        'México': 'Alto',
        'USA': 'Bajo'
      },
      killScenario: 'Exposición pública de credenciales de admin del portal permite inyecciones de saldos ficticios directas a la base de datos de producción por más de $3,000,000 USD, extraídos mediante remesas inmediatas e irrecuperables.',
      wefLink: 'Cyber Insecurity (WEF #6)'
    },
    {
      id: 'vector-5',
      title: 'Pérdida Crítica por Arbitraje y Descalce Cambiario (FX)',
      description: 'Ejecución tardía de coberturas y errores de digitación en la mesa de dinero que destruyan el spread operativo.',
      scenario: 'El descalce entre transacciones CLP/USD y la liquidación diferida en la cámara CCA, sumado al uso de plataformas manuales web sin redundancia de APIs, causa un spread inverso catastrófico.',
      criticalKRI: 'Volumen de transacciones pendientes de cobertura cambiaria > $500K USD o errores de calce manual',
      riskIds: ['R-MD-001', 'R-MD-002', 'R-MD-008'],
      countries: ['Chile', 'Colombia', 'Perú'],
      vulnerabilityIndex: {
        'Chile': 'Extremo',
        'Colombia': 'Alto',
        'Perú': 'Alto',
        'Ecuador': 'Bajo',
        'México': 'Moderado',
        'USA': 'Bajo'
      },
      killScenario: 'Durante una jornada de extrema volatilidad cambiaria del CLP, el sistema experimenta un descalce del tipo de cambio debido al retraso del calce en la cámara CCA, forzando a Global66 a asumir un diferencial cambiario adverso por $2.2M USD.',
      wefLink: 'Geoeconomic Confrontation (WEF #1) + Economic Downturn (WEF #11)'
    }
  ];

  // Selected Vector
  const activeVector = useMemo(() => {
    return STRATEGIC_VECTORS.find(v => v.id === selectedVectorId) || STRATEGIC_VECTORS[0];
  }, [selectedVectorId]);

  // Associated Risk Records from the active list
  const associatedRiskDetails = useMemo(() => {
    return risks.filter(r => activeVector.riskIds.includes(r.id) && r.status !== 'Rechazado');
  }, [risks, activeVector]);

  // Combined List of all risks referenced by ALL strategic vectors
  const allStrategicRiskIds = useMemo(() => {
    return STRATEGIC_VECTORS.flatMap(v => v.riskIds);
  }, []);

  const allStrategicRisks = useMemo(() => {
    return risks.filter(r => allStrategicRiskIds.includes(r.id) && r.status !== 'Rechazado');
  }, [risks, allStrategicRiskIds]);

  // Risks to display in the local Heatmap (scope selection)
  const heatmapTargetRisks = useMemo(() => {
    return heatmapScope === 'vector' ? associatedRiskDetails : allStrategicRisks;
  }, [heatmapScope, associatedRiskDetails, allStrategicRisks]);

  // Form initialization
  const startEditing = (risk: Risk) => {
    setEditingRiskId(risk.id);
    setFormProbability(risk.probability);
    setFormProbabilityImpact(risk.impact);
    setFormRoamStatus(risk.roamStatus || 'Mitigated');
    setFormRoamOwner(risk.roamOwner || '');
    setFormSuggestedControl(risk.suggestedControl || '');
    setFormProcessArea(risk.processArea);
    setFormProcess(risk.process);
    setSaveSuccess(false);
  };

  const handleSaveRiskRating = () => {
    if (!editingRiskId || !onUpdateRisk) return;

    // Build GRC Updates
    const updates: Partial<Risk> = {
      probability: formProbability,
      impact: formImpact,
      roamStatus: formRoamStatus,
      roamOwner: formRoamOwner,
      suggestedControl: formSuggestedControl,
      processArea: formProcessArea,
      process: formProcess,
      acceptability: getAcceptability(formImpact * formProbability)
    };

    onUpdateRisk(editingRiskId, updates);
    setSaveSuccess(true);
    setTimeout(() => {
      setEditingRiskId(null);
      setSaveSuccess(false);
    }, 1500);
  };

  // Dedicated Heatmap Matrix Logic (Y-Axis: Impact, X-Axis: Probability)
  const yLevels = [5, 4, 3, 2, 1];
  const xLevels = [1, 2, 3, 4, 5];

  const getHeatmapCellColor = (impact: number, prob: number) => {
    const score = impact * prob;
    if (score > 20) return 'bg-red-500/20 text-red-800 border-red-500 hover:bg-red-500/30'; // EXTREMO
    if (score > 12) return 'bg-orange-500/20 text-orange-800 border-orange-500 hover:bg-orange-500/30'; // ALTO
    if (score > 7) return 'bg-yellow-400/25 text-yellow-800 border-yellow-400 hover:bg-yellow-400/35'; // MODERADO
    return 'bg-green-500/20 text-green-800 border-green-500 hover:bg-green-500/30'; // BAJO
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* EXECUTIVE TOP BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <ShieldAlert size={14} /> Comité GRC - Reporte Global WEF 2026
            </span>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full">
              Patrimonio Base Corporativo: $22,000,000 USD
            </span>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-black tracking-tight leading-none text-white">
              Análisis de Riesgos Globales e Impacto Regional Global66
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Conexión bidireccional entre los macro-riesgos identificados en el <strong>Reporte de Riesgos Globales del Foro Económico Mundial (WEF) 2026</strong> y la matriz de operaciones regionales de Global66. Evalúe, califique y ajuste el tratamiento inmutable de riesgos estratégicos corporativos.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-bold bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 w-max max-w-full">
            <Info size={16} className="shrink-0 text-amber-400" />
            <span>Nota de GRC: De acuerdo a la gobernanza corporativa, los riesgos en estado 'Aprobado' son inmutables en su causa/descripción original. Únicamente se permite calificar probabilidad, impacto y plan de mitigación.</span>
          </div>
        </div>
      </div>

      {/* HEATMAP & VECTOR SELECTOR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* HEATMAP PANEL (xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              1. Mapa de Calor GRC (ISO 31000)
            </h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setHeatmapScope('vector')}
                className={`px-2 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${heatmapScope === 'vector' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Vector Activo
              </button>
              <button
                onClick={() => setHeatmapScope('all')}
                className={`px-2 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${heatmapScope === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Ver Todos
              </button>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-black text-slate-500 flex items-center gap-1.5">
                <Layers size={14} className="text-rose-500" />
                Matriz Corporativa de Riesgos Estratégicos
              </span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-black border border-slate-200">
                <button
                  onClick={() => setHeatmapMode('inherent')}
                  className={`px-2 py-0.5 rounded ${heatmapMode === 'inherent' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Incoado
                </button>
                <button
                  onClick={() => setHeatmapMode('residual')}
                  className={`px-2 py-0.5 rounded ${heatmapMode === 'residual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Residual (Plan)
                </button>
              </div>
            </div>

            {/* Matrix Core */}
            <div className="relative pt-4 pl-4 pr-1">
              {/* Y Axis label */}
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Impacto (Criticidad)
              </div>

              <div className="grid grid-cols-1 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {yLevels.map((impact) => (
                  <div key={impact} className="flex min-h-[52px] items-stretch">
                    {/* Y label number */}
                    <div className="w-8 flex flex-col items-center justify-center bg-slate-50 border-r border-slate-200 font-mono text-[9px] font-bold text-slate-400 shrink-0 select-none">
                      <span className="font-extrabold text-slate-700 leading-none">{impact}</span>
                    </div>

                    <div className="flex flex-1 divide-x divide-slate-100">
                      {xLevels.map((prob) => {
                        const cellRisks = heatmapTargetRisks.filter(r => {
                          const currentImpact = heatmapMode === 'residual' ? (r.residualImpact || r.impact) : r.impact;
                          const currentProb = heatmapMode === 'residual' ? (r.residualProbability || r.probability) : r.probability;
                          
                          const clampedImpact = Math.min(5, Math.max(1, currentImpact));
                          const clampedProb = Math.min(5, Math.max(1, currentProb));
                          return clampedImpact === impact && clampedProb === prob;
                        });

                        const cellColor = getHeatmapCellColor(impact, prob);

                        return (
                          <div
                            key={`${impact}-${prob}`}
                            className={`flex-1 p-1 transition-all flex flex-col justify-between group relative min-w-[50px] ${cellColor}`}
                          >
                            <span className="absolute right-0.5 top-0.5 text-[6px] font-mono text-slate-450 opacity-0 group-hover:opacity-40 select-none">
                              {impact}x{prob}
                            </span>
                            
                            {/* Bullet of counts */}
                            <div className="flex items-center justify-between">
                              {cellRisks.length > 0 && (
                                <span className="text-[9px] font-black bg-slate-900/10 px-1 py-0.5 rounded text-slate-800 leading-none">
                                  {cellRisks.length}
                                </span>
                              )}
                            </div>

                            {/* Render small tag bullets of risks in cell */}
                            <div className="flex flex-wrap gap-0.5 leading-none overflow-y-auto max-h-[26px]">
                              {cellRisks.map((r) => (
                                <button
                                  key={r.id}
                                  onClick={() => startEditing(r)}
                                  className="px-1 py-0.5 rounded bg-slate-900 text-white font-mono text-[7px] font-black tracking-tighter shrink-0 hover:bg-slate-800 transition-colors shadow-xs"
                                  title={`${r.id}: ${r.process}`}
                                >
                                  {r.id.split('-').pop()}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X Axis Numbers */}
              <div className="flex pl-8 mt-1">
                {xLevels.map((prob) => (
                  <div key={prob} className="flex-1 text-center font-mono text-[9px] font-bold text-slate-400 select-none">
                    {prob}
                  </div>
                ))}
              </div>
              <div className="text-center text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                Probabilidad (Frecuencia)
              </div>
            </div>

            {/* Colors reference legend */}
            <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-slate-100">
              <div className="p-1 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-black uppercase">🟢 Bajo (1-7)</div>
              <div className="p-1 bg-yellow-50 text-yellow-700 border border-yellow-250 rounded text-[9px] font-black uppercase">🟡 Moderado (8-12)</div>
              <div className="p-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[9px] font-black uppercase">🟠 Alto (13-20)</div>
              <div className="p-1 bg-red-50 text-red-700 border border-red-200 rounded text-[9px] font-black uppercase">🔴 Extremo (21-25)</div>
            </div>
          </div>

          {/* VECTORS LIST SELECTOR */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Vectores de Amenaza Estratégica (Haga clic para filtrar)
            </h4>
            <div className="space-y-2">
              {STRATEGIC_VECTORS.map((vector) => {
                const isActive = vector.id === selectedVectorId;
                const vectorRisks = risks.filter(r => vector.riskIds.includes(r.id) && r.status !== 'Rechazado');
                const avgScore = vectorRisks.length > 0 
                  ? (vectorRisks.reduce((acc, r) => acc + (r.impact * r.probability), 0) / vectorRisks.length).toFixed(1)
                  : '0.0';
                const isHigh = parseFloat(avgScore) > 12;

                return (
                  <button
                    key={vector.id}
                    onClick={() => {
                      setSelectedVectorId(vector.id);
                      setEditingRiskId(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                      isActive 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                        : isHigh ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isActive ? <ShieldAlert size={16} /> : <AlertTriangle size={15} />}
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 leading-none">
                        <span className="text-[8px] font-mono font-bold uppercase opacity-60 tracking-wider">
                          Vector #{vector.id.split('-')[1]}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider ${
                          isActive ? 'bg-white/10 text-white' : isHigh ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          NR Promedio: {avgScore}
                        </span>
                      </div>
                      <h4 className="text-xs font-black leading-snug truncate">
                        {vector.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* DETAILED VIEW & RATINGS BOARD (xl:col-span-7) */}
        <div className="xl:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVector.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6"
            >
              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-rose-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                    ESCENARIO DE FALLA CORPORATIVA (ISO 31000)
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {activeVector.title}
                  </h2>
                  <div className="text-[10px] text-red-600 font-extrabold flex items-center gap-1">
                    <Sparkles size={12} className="shrink-0" />
                    <span>Fuerza WEF: {activeVector.wefLink}</span>
                  </div>
                </div>
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl border border-red-100">
                  <Activity size={24} className="animate-pulse" />
                </div>
              </div>

              {/* Narrativa del Riesgo de Muerte */}
              <div className="space-y-2 bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 relative">
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-20">
                  <Zap size={14} />
                  <span className="text-[8px] font-mono font-bold tracking-wider">SYS_KILL</span>
                </div>
                <h4 className="text-[10px] font-black uppercase text-red-400 tracking-wider">¿Cómo puede impactar fatalmente a Global66?</h4>
                <p className="text-xs leading-relaxed font-semibold text-slate-200">
                  {activeVector.killScenario}
                </p>
              </div>

              {/* Editable/Ratable Associated Risk Records */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Calificación de Riesgos Vinculados en el Catálogo ({associatedRiskDetails.length})
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold">Seleccione un riesgo para calificar e implementar mitigaciones</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {associatedRiskDetails.length > 0 ? (
                    associatedRiskDetails.map((risk) => {
                      const score = risk.impact * risk.probability;
                      const resScore = risk.residualImpact && risk.residualProbability
                        ? risk.residualImpact * risk.residualProbability
                        : score;

                      const isSelectedForEdit = editingRiskId === risk.id;

                      const level = getRiskLevel(score);
                      const resLevel = getRiskLevel(resScore);

                      // Acceptability determination as requested:
                      // Bajo/Moderado = ACEPTABLE
                      // Alto/Extremo = NO ACEPTABLE (Requiere tratamiento urgente)
                      const inherentAcceptability = getAcceptability(score);
                      const residualAcceptability = getAcceptability(resScore);

                      return (
                        <div key={risk.id} className={`p-4 rounded-2xl border transition-all ${
                          isSelectedForEdit 
                            ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/10' 
                            : 'bg-white border-slate-200 hover:border-slate-350'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{risk.id}</span>
                                <span className="text-[10px] font-bold text-slate-500">{risk.processArea} - {risk.process}</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-black uppercase flex items-center gap-1">
                                  <Lock size={10} /> {risk.status}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-slate-800 leading-snug">
                                {risk.riskDescription}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500">
                                <strong>Causa Original:</strong> {risk.cause}
                              </p>
                              {risk.suggestedControl && (
                                <p className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg font-medium border border-slate-200/50">
                                  <strong>Mitigación / Control sugerido:</strong> {risk.suggestedControl}
                                </p>
                              )}

                              {/* ACCEPTABILITY AND GRC SCORES */}
                              <div className="pt-2 flex flex-wrap items-center gap-4 text-[10px] font-bold">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">Score Incoado:</span>
                                  <span className={`px-2 py-0.5 rounded font-black ${
                                    score > 20 ? 'bg-red-100 text-red-700' :
                                    score > 12 ? 'bg-orange-100 text-orange-700' :
                                    score > 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'
                                  }`}>
                                    {score} ({level})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">Veredicto Aceptabilidad Incoado:</span>
                                  <span className={`px-2 py-0.5 rounded font-black uppercase ${
                                    inherentAcceptability.startsWith('ACEPTABLE') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {inherentAcceptability}
                                  </span>
                                </div>

                                {risk.roamStatus && (
                                  <div className="flex items-center gap-3 w-full pt-1 border-t border-dashed border-slate-100 mt-1">
                                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded font-mono">ROAM: {risk.roamStatus}</span>
                                    {risk.roamOwner && <span className="text-slate-500 font-semibold flex items-center gap-1"><User size={12} /> {risk.roamOwner}</span>}
                                    <span className="text-slate-400">| Score Residual:</span>
                                    <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${
                                      resScore > 20 ? 'bg-red-100 text-red-700' :
                                      resScore > 12 ? 'bg-orange-100 text-orange-700' :
                                      resScore > 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'
                                    }`}>
                                      {resScore} ({resLevel})
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded font-black text-[9px] uppercase ${
                                      residualAcceptability.startsWith('ACEPTABLE') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      Tratamiento: {residualAcceptability}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 flex sm:flex-col items-end gap-2 justify-end">
                              <button
                                onClick={() => startEditing(risk)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isSelectedForEdit
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <Edit2 size={13} />
                                Calificar & Editar
                              </button>
                            </div>
                          </div>

                          {/* INLINE EDITING BOARD PANEL */}
                          <AnimatePresence>
                            {isSelectedForEdit && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-slate-200 space-y-4 overflow-hidden"
                              >
                                <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800 space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <Sparkles size={12} className="text-red-400" />
                                      Panel de Calificación e Impacto (ISO 31000)
                                    </h5>
                                    <span className="text-[9px] font-mono text-slate-400">Risk ID: {risk.id}</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Probability calification */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase block">Calificar Probabilidad de Ocurrencia (1-5)</label>
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((val) => (
                                          <button
                                            key={val}
                                            onClick={() => setFormProbability(val)}
                                            className={`flex-1 py-1.5 rounded font-mono font-bold text-xs transition-colors cursor-pointer ${
                                              formProbability === val 
                                                ? 'bg-red-600 text-white font-extrabold' 
                                                : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                            }`}
                                          >
                                            {val}
                                          </button>
                                        ))}
                                      </div>
                                      <span className="text-[9px] text-slate-500 font-bold block">
                                        {formProbability === 5 ? '5 - Casi Seguro (Diario)' :
                                         formProbability === 4 ? '4 - Probable (Semanal)' :
                                         formProbability === 3 ? '3 - Posible (Mensual)' :
                                         formProbability === 2 ? '2 - Poco Probable (Semestral)' : '1 - Muy Improbable (Anual)'}
                                      </span>
                                    </div>

                                    {/* Impact calification */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase block">Calificar Impacto en Operación (1-5)</label>
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((val) => (
                                          <button
                                            key={val}
                                            onClick={() => setFormProbabilityImpact(val)}
                                            className={`flex-1 py-1.5 rounded font-mono font-bold text-xs transition-colors cursor-pointer ${
                                              formImpact === val 
                                                ? 'bg-red-600 text-white font-extrabold' 
                                                : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                            }`}
                                          >
                                            {val}
                                          </button>
                                        ))}
                                      </div>
                                      <span className="text-[9px] text-slate-500 font-bold block">
                                        {formImpact === 5 ? '5 - Catastrófico (> $2.2M USD / Patrimonio completo)' :
                                         formImpact === 4 ? '4 - Mayor ($1.76M USD)' :
                                         formImpact === 3 ? '3 - Moderado ($1.1M USD)' :
                                         formImpact === 2 ? '2 - Menor ($880K USD)' : '1 - Insignificante ($660K USD)'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* ROAM Status treatment selection */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase block">Clasificación de Tratamiento ROAM</label>
                                      <select
                                        value={formRoamStatus}
                                        onChange={(e) => setFormRoamStatus(e.target.value as RoamStatus)}
                                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-semibold"
                                      >
                                        <option value="Resolved">Resolved (Riesgo eliminado / Resuelto)</option>
                                        <option value="Owned">Owned (Asignado a un propietario con plan)</option>
                                        <option value="Accepted">Accepted (Aceptado bajo umbral de tolerancia)</option>
                                        <option value="Mitigated">Mitigated (Mitigado mediante controles activos)</option>
                                      </select>
                                    </div>

                                    {/* ROAM Owner input */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase block">Propietario del Riesgo (Owner)</label>
                                      <input
                                        type="text"
                                        value={formRoamOwner}
                                        onChange={(e) => setFormRoamOwner(e.target.value)}
                                        placeholder="ej: Rodrigo Wagner (Finance) o GRC Lead"
                                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-semibold placeholder:text-slate-500"
                                      />
                                    </div>
                                  </div>

                                  {/* suggestedControl input */}
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase block">Actualizar Plan de Mitigación / Control sugerido</label>
                                    <textarea
                                      value={formSuggestedControl}
                                      onChange={(e) => setFormSuggestedControl(e.target.value)}
                                      rows={2}
                                      placeholder="Defina un control automatizado regional (ej: conciliación automatizada por API mTLS, 3DS mandatorio, o validación de KYC...)"
                                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-medium placeholder:text-slate-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Process Area selection */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase block">Proceso Principal</label>
                                      <select
                                        value={formProcessArea}
                                        onChange={(e) => setFormProcessArea(e.target.value as ProcessArea)}
                                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-semibold"
                                      >
                                        <option value="Cumplimiento">Compliance (Cumplimiento)</option>
                                        <option value="Fraude">Fraude</option>
                                        <option value="Ciberseguridad">Ciberseguridad</option>
                                        <option value="Operaciones">OPs (Operaciones)</option>
                                        <option value="Mesa de Dinero">Tesorería (Mesa de Dinero)</option>
                                        <option value="TI">TI</option>
                                      </select>
                                    </div>

                                    {/* Process tag name */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase block">Subproceso Específico</label>
                                      <input
                                        type="text"
                                        value={formProcess}
                                        onChange={(e) => setFormProcess(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-semibold"
                                      />
                                    </div>
                                  </div>

                                  <div className="pt-2 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-green-400">
                                      {saveSuccess && (
                                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1">
                                          <Check size={14} /> ¡Calificación guardada y recalculada!
                                        </motion.div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingRiskId(null)}
                                        className="px-3.5 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-black transition-colors cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveRiskRating}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                                      >
                                        <Save size={13} />
                                        Guardar Calificación
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium">
                      No hay registros activos o calificados para este vector estratégico regional.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* C-LEVEL REGIONAL STRESS TESTING TOOL */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight leading-none">2. C-Level Stress Tester Regional</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Simule escenarios de pérdida extrema y evalúe la resiliencia contra el Patrimonio Base Corporativo ($22M USD).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">País de la Crisis</label>
                <select
                  value={stressCountry}
                  onChange={(e) => setStressCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                >
                  <option value="Chile">Chile (Base Central / BICE Clearing)</option>
                  <option value="Perú">Perú (Banco BCP / Retiros parciales restrictivos)</option>
                  <option value="Colombia">Colombia (SFC Regulator / Altas Alertas KYT)</option>
                  <option value="Ecuador">Ecuador (Banco Austro & Guayaquil / Fallas API)</option>
                  <option value="México">México (Socio STP / 3DS Bypass carding)</option>
                  <option value="USA">USA (Corresponsal Central de Clearing / Remesas)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Probabilidad del Escenario (1-5)</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((prob) => (
                    <button
                      key={prob}
                      onClick={() => setFormProbability(prob)}
                      className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                        formProbability === prob
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                      }`}
                    >
                      {prob}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Magnitud del Impacto Operacional / Financiero</label>
                <span className="text-xs font-mono font-bold text-red-400">{formImpact * 20}% del Patrimonio</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formImpact}
                onChange={(e) => setFormProbabilityImpact(parseInt(e.target.value))}
                className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                <span>Insignificante (1)</span>
                <span>Moderado (3)</span>
                <span>Catastrófico (5)</span>
              </div>
            </div>
          </div>

          {/* Verdict Box (lg:col-span-5) */}
          <div className="lg:col-span-5 p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">VEREDICTO DE RESILIENCIA</span>
              <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-black uppercase">Simulado</span>
            </div>

            {(() => {
              const simulatedLoss = PATRIMONIO_BASE * (formImpact * 0.2) * (formProbability * 0.2);
              const simulatedLossPercent = (simulatedLoss / PATRIMONIO_BASE) * 100;
              
              let verdict = {
                status: 'DAÑO CONTROLADO',
                color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                desc: 'La pérdida es absorbible por las reservas de capital, pero con fuerte penalización en la rentabilidad anual y desconfianza de socios bancarios.',
                icon: <CheckCircle2 className="text-yellow-500" size={24} />
              };

              if (simulatedLossPercent > 40) {
                verdict = {
                  status: 'CRÍTICO / QUIEBRA TÉCNICA',
                  color: 'text-red-500 bg-red-500/10 border-red-500/20',
                  desc: 'La pérdida supera la capacidad de solvencia inmediata. Global66 entraría en proceso de insolvencia o intervención en el país de ocurrencia.',
                  icon: <ShieldAlert className="text-red-500" size={24} />
                };
              } else if (simulatedLossPercent > 15) {
                verdict = {
                  status: 'VULNERABILIDAD EXTREMA',
                  color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
                  desc: 'El patrimonio base se vería severamente afectado. Requiere inyección inmediata de capital extranjero y congelamiento de operaciones regionales.',
                  icon: <AlertTriangle className="text-orange-500" size={24} />
                };
              }

              return (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {verdict.icon}
                      <span className="text-sm font-black tracking-tight">{verdict.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                      {verdict.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Pérdida Esperada (USD)</div>
                      <div className="text-lg font-black text-red-400 mt-0.5">
                        ${simulatedLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Impacto Patrimonial</div>
                      <div className="text-lg font-black text-red-400 mt-0.5">
                        {simulatedLossPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

        </div>
      </div>

    </div>
  );
}
