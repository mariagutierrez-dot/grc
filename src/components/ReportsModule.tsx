import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Shield, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download,
  User,
  Search,
  X,
  FileText,
  Clock,
  ArrowRight,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Risk, GLOBAL66_PROCESS_TAXONOMY, ProcessMacroCategory } from '../types';
import { resolveTaxonomyForRisk } from '../lib/processTaxonomyHelper';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportToExcel } from '../lib/excelExport';

interface ReportsModuleProps {
  existingRisks: Risk[];
  onUpdateRisk?: (riskId: string, updates: Partial<Risk>) => void;
}

export interface ProcessAggregated {
  processArea: string;
  totalRisks: number;
  inherent: { extreme: number; high: number; moderate: number; low: number };
  residual: { extreme: number; high: number; moderate: number; low: number };
  risks: Risk[];
}

// Default Action Plan Mapping by Risk ID
const ACTION_PLANS_DICT: Record<string, { plan: string; responsible: string }> = {
  'R-OPS-001': {
    plan: 'Desplegar integración automatizada vía API con dLocal y partners, ampliar matriz de apoderados autorizados y digitalizar base de firmas.',
    responsible: 'Head de Operaciones'
  },
  'R-OPS-009': {
    plan: 'Priorizar e implementar desarrollo de pasarelas Host-to-Host (H2H) con el sector bancario ecuatoriano e integraciones directas.',
    responsible: 'Head de Operaciones'
  },
  'R-OPS-013': {
    plan: 'Desplegar módulo de devoluciones y reversiones en Backoffice con validación automatizada de montos y flujo granular.',
    responsible: 'Head de Operaciones'
  },
  'R-OPS-010': {
    plan: 'Implementar Health Check para bots scrapers con alertas en tiempo real e integración de canales Host-to-Host directos.',
    responsible: 'Head de Operaciones'
  },
  'R-OPS-011': {
    plan: 'Aprobación dual Maker-Checker obligatoria en portal Admin para liberaciones manuales con precarga inmutable de montos.',
    responsible: 'Head de Operaciones'
  },
  'R-MD-001': {
    plan: 'Restringir cotizaciones exclusivamente al módulo RFQ integrado en plataforma con firma en firme y registro de auditoría.',
    responsible: 'Head de Mesa de Dinero'
  },
  'R-MD-002': {
    plan: 'Implementar motor de conciliación automatizada en tiempo real entre pasivos de wallets y saldos en cuentas de salvaguarda.',
    responsible: 'Head de Tesorería'
  },
  'R-MD-003': {
    plan: 'Algoritmo dinámico de spreads con circuit breaker ante volatilidad y actualización de curvas FX en sub-segundos vía FIX protocol.',
    responsible: 'Head de Mesa de Dinero'
  },
  'R-MD-008': {
    plan: 'Firma digital remota con token biométrico para operaciones de alto valor en LBTR y portales bancarios.',
    responsible: 'Head de Tesorería'
  },
  'R-TES-001': {
    plan: 'Motor de conciliación automatizada en tiempo real entre pasivos de wallets y saldos bancarios de salvaguarda.',
    responsible: 'Head de Tesorería'
  },
  'R-TES-002': {
    plan: 'Digitalización integral de poderes bancarios con esquemas multi-firma biométrica móvil y monitoreo automático de cut-offs.',
    responsible: 'Head de Tesorería'
  },
  'R-TI-001': {
    plan: 'Desplegar escáneres automáticos SAST/DAST en CI/CD y encriptación de datos sensibles en repositorio PostgreSQL.',
    responsible: 'Head de TI'
  },
  'R-CIB-001': {
    plan: 'Implementar autenticación mTLS y política WAF restrictiva en endpoints expuestos de API.',
    responsible: 'CISO / Head de Ciberseguridad'
  },
  'R-FRA-001': {
    plan: 'Integrar motor biométrico con prueba de vida pasiva 3D y listas de restricción AML automáticas.',
    responsible: 'Head de Prevención de Fraude'
  }
};

export const ReportsModule: React.FC<ReportsModuleProps> = ({ existingRisks, onUpdateRisk }) => {
  // Navigation tabs for report dashboard
  const [activeTab, setActiveTab] = useState<'consolidated_table' | 'heatmaps' | 'detailed_matrix' | 'controls_inventory'>('consolidated_table');
  
  // Profile filter for Heatmaps
  const [heatmapProfile, setHeatmapProfile] = useState<'entidad' | 'estrategico' | 'gestion'>('entidad');

  // Filters for Detailed Matrix
  const [selectedProcess, setSelectedProcess] = useState<string>('TODOS');
  const [selectedAcceptability, setSelectedAcceptability] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Inline editing state for Detailed Matrix (Control, Plan, Responsible)
  const [editingControlId, setEditingControlId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingRespId, setEditingRespId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  // Modal detail view for clicked risk in heatmaps
  const [selectedCellRisks, setSelectedCellRisks] = useState<{ title: string; risks: Risk[] } | null>(null);

  // Load treatment plans from localStorage if present
  const treatmentPlansFromStorage = useMemo(() => {
    try {
      const saved = localStorage.getItem('g66_treatment_plans');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  }, []);

  // Helper to resolve responsible for a risk (Strictly Head de Operaciones for R-OPS-001)
  const getResponsibleForRisk = (r: Risk): string => {
    if (r.id === 'R-OPS-001') return 'Head de Operaciones';
    if (r.roamOwner && r.roamOwner !== 'Equipo Compliance' && r.roamOwner !== 'Sin dueño') {
      return r.roamOwner;
    }
    if (ACTION_PLANS_DICT[r.id]?.responsible) {
      return ACTION_PLANS_DICT[r.id].responsible;
    }
    if (r.processArea === 'Operaciones') return 'Head de Operaciones';
    if (r.processArea === 'Mesa de Dinero') return 'Head de Mesa de Dinero';
    if (r.processArea === 'Tesorería') return 'Head de Tesorería';
    if (r.processArea === 'TI') return 'Head de TI';
    if (r.processArea === 'Cumplimiento') return 'Compliance Officer';
    if (r.processArea === 'Fraude') return 'Head de Prevención de Fraude';
    if (r.processArea === 'Ciberseguridad') return 'CISO / Head de Ciberseguridad';
    if (r.processArea === 'Nuevos Productos') return 'Head de Producto';
    return r.roamOwner || 'Líder del Proceso';
  };

  // Helper to resolve Action Plan for a risk
  const getActionPlanForRisk = (r: Risk): string => {
    // Check localStorage treatment plans
    const matchedPlan = treatmentPlansFromStorage.find((p: any) => p.riskId === r.id || p.riskTitle?.includes(r.id));
    if (matchedPlan && matchedPlan.tasks && matchedPlan.tasks.trim()) {
      return matchedPlan.tasks;
    }
    if (ACTION_PLANS_DICT[r.id]?.plan) {
      return ACTION_PLANS_DICT[r.id].plan;
    }
    return 'Sin plan de acción definido';
  };

  // Helper to clean and format cause text
  const formatCauseText = (causeStr?: string): string => {
    if (!causeStr) return 'Causa raíz en proceso de documentación técnica.';
    // Clean bullet brackets like - [R-OPS-001]:
    return causeStr
      .replace(/-?\s*\[R-[^\]]+\]:\s*/g, '• ')
      .trim();
  };

  // Dynamic grouping strictly by PROCESS (processArea)
  const processAggregated = useMemo<ProcessAggregated[]>(() => {
    const map = new Map<string, ProcessAggregated>();

    existingRisks.forEach(r => {
      const area = r.processArea || 'General';

      if (!map.has(area)) {
        map.set(area, {
          processArea: area,
          totalRisks: 0,
          inherent: { extreme: 0, high: 0, moderate: 0, low: 0 },
          residual: { extreme: 0, high: 0, moderate: 0, low: 0 },
          risks: []
        });
      }

      const item = map.get(area)!;
      item.totalRisks += 1;
      item.risks.push(r);

      // Inherent score
      const inhScore = r.impact * r.probability;
      if (inhScore > 20) item.inherent.extreme += 1;
      else if (inhScore > 12) item.inherent.high += 1;
      else if (inhScore > 7) item.inherent.moderate += 1;
      else item.inherent.low += 1;

      // Residual score
      const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const resScore = resImpact * resProb;

      if (resScore > 20) item.residual.extreme += 1;
      else if (resScore > 12) item.residual.high += 1;
      else if (resScore > 7) item.residual.moderate += 1;
      else item.residual.low += 1;
    });

    return Array.from(map.values());
  }, [existingRisks]);

  // Overall totals and KPI metrics calculated 100% dynamically
  const totals = useMemo(() => {
    const totalRisks = existingRisks.length;
    let inhExtreme = 0, inhHigh = 0, inhModerate = 0, inhLow = 0;
    let resExtreme = 0, resHigh = 0, resModerate = 0, resLow = 0;

    existingRisks.forEach(r => {
      const inhScore = r.impact * r.probability;
      if (inhScore > 20) inhExtreme++;
      else if (inhScore > 12) inhHigh++;
      else if (inhScore > 7) inhModerate++;
      else inhLow++;

      const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const resScore = resImpact * resProb;

      if (resScore > 20) resExtreme++;
      else if (resScore > 12) resHigh++;
      else if (resScore > 7) resModerate++;
      else resLow++;
    });

    const inherentCritical = inhExtreme + inhHigh;
    const residualCritical = resExtreme + resHigh;
    const containedPct = inherentCritical > 0
      ? Math.round(((inherentCritical - residualCritical) / inherentCritical) * 100)
      : 100;

    const acceptableResidualCount = resModerate + resLow;
    const acceptableResidualPct = totalRisks > 0
      ? Math.round((acceptableResidualCount / totalRisks) * 100)
      : 100;

    return {
      totalRisks,
      inh: { extreme: inhExtreme, high: inhHigh, moderate: inhModerate, low: inhLow, critical: inherentCritical },
      res: { extreme: resExtreme, high: resHigh, moderate: resModerate, low: resLow, critical: residualCritical },
      containedPct,
      acceptableResidualPct,
      acceptableResidualCount
    };
  }, [existingRisks]);

  // Filtered risks for detailed matrix
  const filteredDetailedRisks = useMemo(() => {
    return existingRisks.filter(r => {
      if (selectedProcess !== 'TODOS' && r.processArea !== selectedProcess) return false;
      
      const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const resScore = resImpact * resProb;
      const isAcceptable = resScore <= 12;

      if (selectedAcceptability === 'ACEPTABLE' && !isAcceptable) return false;
      if (selectedAcceptability === 'NO_ACEPTABLE' && isAcceptable) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const resp = getResponsibleForRisk(r).toLowerCase();
        const plan = getActionPlanForRisk(r).toLowerCase();
        const tax = resolveTaxonomyForRisk(r);
        return (
          r.id.toLowerCase().includes(q) ||
          r.processArea.toLowerCase().includes(q) ||
          tax.macrocategory.toLowerCase().includes(q) ||
          tax.taxonomyProcessName.toLowerCase().includes(q) ||
          tax.subproceso.toLowerCase().includes(q) ||
          r.riskDescription.toLowerCase().includes(q) ||
          (r.cause && r.cause.toLowerCase().includes(q)) ||
          (r.suggestedControl && r.suggestedControl.toLowerCase().includes(q)) ||
          (r.documentControl && r.documentControl.toLowerCase().includes(q)) ||
          resp.includes(q) ||
          plan.includes(q)
        );
      }

      return true;
    });
  }, [existingRisks, selectedProcess, selectedAcceptability, searchTerm, treatmentPlansFromStorage]);

  // Filtered risks for heatmaps based on selected profile
  const heatmapActiveRisks = useMemo(() => {
    if (heatmapProfile === 'estrategico') {
      return existingRisks.filter(r => 
        r.processArea === 'Mesa de Dinero' || 
        r.processArea === 'Tesorería' || 
        r.processArea === 'TI' || 
        r.processArea === 'Nuevos Productos' ||
        r.id.startsWith('R-ES') || 
        r.id.startsWith('R-GOB')
      );
    }
    if (heatmapProfile === 'gestion') {
      return existingRisks.filter(r => 
        r.processArea === 'Cumplimiento' || 
        r.processArea === 'Fraude' || 
        r.processArea === 'Ciberseguridad' || 
        r.processArea === 'Operaciones'
      );
    }
    return existingRisks; // Perfil Entidad completo
  }, [existingRisks, heatmapProfile]);

  // Map coordinate keys to list of risk objects for heatmap cells with 1..5 clamping
  const heatmapGridMapping = useMemo(() => {
    const inherentMap: Record<string, Risk[]> = {};
    const residualMap: Record<string, Risk[]> = {};

    heatmapActiveRisks.forEach(r => {
      // Clamp inherent coords to 1..5
      const inhImpClamped = Math.min(5, Math.max(1, r.impact));
      const inhProbClamped = Math.min(5, Math.max(1, r.probability));
      const inhKey = `${inhImpClamped}-${inhProbClamped}`;
      if (!inherentMap[inhKey]) inherentMap[inhKey] = [];
      inherentMap[inhKey].push(r);

      // Residual impact and probability
      const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const resImpClamped = Math.min(5, Math.max(1, resImpact));
      const resProbClamped = Math.min(5, Math.max(1, resProb));
      const resKey = `${resImpClamped}-${resProbClamped}`;

      if (!residualMap[resKey]) residualMap[resKey] = [];
      residualMap[resKey].push(r);
    });

    return { inherentMap, residualMap };
  }, [heatmapActiveRisks]);

  // Unique process areas for select filter
  const processAreaOptions = useMemo(() => {
    const set = new Set<string>();
    existingRisks.forEach(r => {
      if (r.processArea) set.add(r.processArea);
    });
    return Array.from(set);
  }, [existingRisks]);

  // PDF Export Function
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [15, 23, 42]; // dark slate

    // PAGE 1: HEADER & KPI SUMMARY
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 297, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("GLOBAL66 - INFORME CONSOLIDADO POR PROCESOS Y MATRIZ DE RIESGOS (GRC)", 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Auditoría Consolidada de Riesgos Procesados | Norma ISO 31000 & Marco ROAM", 14, 26);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')} | Estado de Riesgos: APROBADO`, 14, 31);

    // KPI Summary Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 42, 269, 36, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 42, 269, 36, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("RESUMEN DE MÉTRICAS CLAVE Y EFECTIVIDAD DE MITIGACIÓN", 20, 50);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Total Riesgos Procesados", 25, 58);
    doc.text("Riesgos Inherentes Críticos", 95, 58);
    doc.text("Riesgos Residuales Críticos", 165, 58);
    doc.text("Tasa de Contención", 235, 58);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totals.totalRisks}`, 25, 68);
    doc.text(`${totals.inh.critical}`, 95, 68);
    doc.setTextColor(220, 38, 38); // RED for residual critical
    doc.text(`${totals.res.critical}`, 165, 68);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totals.containedPct}%`, 235, 68);

    // Table 1: Process Aggregated Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("1. CONSOLIDADO CONSOLIDADO POR PROCESO", 14, 86);

    const table1Headers = [
      ['Proceso', 'Total Riesgos', 'Inherente (Ext/Alt/Mod/Baj)', 'Residual (Ext/Alt/Mod/Baj)']
    ];

    const table1Body = processAggregated.map(p => [
      p.processArea,
      p.totalRisks,
      `${p.inherent.extreme} / ${p.inherent.high} / ${p.inherent.moderate} / ${p.inherent.low}`,
      `${p.residual.extreme} / ${p.residual.high} / ${p.residual.moderate} / ${p.residual.low}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: table1Headers,
      body: table1Body,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // PAGE 2: DETAILED RISKS TABLE
    doc.addPage();
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 297, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("2. DETALLE DE MATRIZ DE RIESGOS, CAUSAS, CONTROLES DEFINIDOS, PLANES DE ACCIÓN Y RESPONSABLES", 14, 12);

    const table2Headers = [
      ['ID', 'Proceso', 'Riesgo', 'Causa Raíz', 'Inh. (PxI)', 'Control Definido', 'Res. (PxI)', 'Plan de Acción', 'Responsable']
    ];

    const table2Body = existingRisks.map(r => {
      const inhVal = r.impact * r.probability;
      const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const resVal = resImpact * resProb;

      return [
        r.id,
        r.processArea,
        r.riskDescription,
        formatCauseText(r.cause),
        `${inhVal}`,
        r.documentControl || r.suggestedControl,
        `${resVal}`,
        getActionPlanForRisk(r),
        getResponsibleForRisk(r)
      ];
    });

    autoTable(doc, {
      startY: 22,
      head: table2Headers,
      body: table2Body,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
      headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold', textColor: [29, 78, 216] },
        1: { cellWidth: 28, fontStyle: 'bold' },
        2: { cellWidth: 45 },
        3: { cellWidth: 45 },
        4: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 42 },
        6: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        7: { cellWidth: 42 },
        8: { cellWidth: 25, fontStyle: 'bold' }
      }
    });

    doc.save(`G66_Informe_Consolidado_GRC_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // CSV Download function
  const handleDownloadCSV = () => {
    let csv = "\uFEFF";
    csv += ["ID", "Macroproceso", "Proceso Oficial", "Subproceso", "Area Operativa", "Descripcion del Riesgo", "Causa Raiz", "Impacto Inh", "Probabilidad Inh", "Inh Score", "Control Definido", "Impacto Res", "Probabilidad Res", "Res Score", "Plan de Accion", "Responsable", "Estado", "Aceptabilidad"].map(h => `"${h}"`).join(",") + "\n";

    existingRisks.forEach(r => {
      const inhScore = r.impact * r.probability;
      const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const resScore = resImpact * resProb;
      const isAcc = resScore <= 12;
      const tax = resolveTaxonomyForRisk(r);

      const row = [
        r.id,
        tax.macrocategory,
        `#${tax.taxonomyProcessId} ${tax.taxonomyProcessName}`,
        tax.subproceso,
        r.processArea,
        r.riskDescription,
        formatCauseText(r.cause),
        r.impact,
        r.probability,
        inhScore,
        r.documentControl || r.suggestedControl,
        resImpact,
        resProb,
        resScore,
        getActionPlanForRisk(r),
        getResponsibleForRisk(r),
        r.status || 'Aprobado',
        isAcc ? 'ACEPTABLE' : 'NO ACEPTABLE'
      ];

      csv += row.map(v => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `G66_Consolidado_Riesgos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Helper for Cell Background Color in Heatmaps based on ISO 31000 methodology
  const getCellBgColor = (impact: number, probability: number, count: number) => {
    const score = impact * probability;
    if (count === 0) return 'bg-slate-50 border-slate-200 text-slate-400';
    if (score > 20) return 'bg-red-100 text-red-900 border-red-300 font-black shadow-xs';
    if (score > 12) return 'bg-orange-100 text-orange-900 border-orange-300 font-black shadow-xs';
    if (score > 7) return 'bg-amber-100 text-amber-900 border-amber-300 font-black shadow-xs';
    return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black shadow-xs';
  };

  // Helper for Risk Level Badge
  const getLevelBadge = (score: number) => {
    if (score > 20) {
      return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black border border-red-200 uppercase">EXTREMO</span>;
    }
    if (score > 12) {
      return <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-black border border-orange-200 uppercase">ALTO</span>;
    }
    if (score > 7) {
      return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200 uppercase">MODERADO</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 uppercase">BAJO</span>;
  };

  return (
    <div className="space-y-8 text-slate-800 font-sans" id="informes_panel">
      {/* HEADER BANNER - CLEAN LIGHT THEME */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-200">
              Módulo de Informes y Auditoría GRC 2026
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            Consolidado de Riesgos Procesados
          </h1>
          <p className="text-slate-600 text-sm font-medium max-w-3xl">
            Informe consolidado generado 100% en tiempo real a partir de los riesgos activos del catálogo. Visualiza el consolidado por procesos, mapas de calor por perfil y la matriz detallada con causas, controles, planes de acción y responsables.
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Descargar PDF</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Descargar CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(existingRisks)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Exportar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Risks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Total Riesgos Evaluados</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totals.totalRisks}</span>
              <span className="text-[10px] text-slate-500 font-semibold">en {processAggregated.length} procesos</span>
            </div>
          </div>
        </div>

        {/* Inherent Critical */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Riesgo Inherente Crítico</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-600">{totals.inh.critical}</span>
              <span className="text-[10px] text-slate-500 font-semibold">Extremo ({totals.inh.extreme}) + Alto ({totals.inh.high})</span>
            </div>
          </div>
        </div>

        {/* Residual Critical - STRICTLY RED BG & TEXT WHEN RESIDUAL CRITICAL EXISTS */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${
          totals.res.critical > 0 
            ? 'bg-red-50 border-red-200 text-red-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className={`p-3.5 rounded-xl ${
            totals.res.critical > 0 
              ? 'bg-red-100 text-red-600 border border-red-200' 
              : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
              Riesgo Residual Crítico
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${totals.res.critical > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {totals.res.critical}
              </span>
              <span className={`text-[10px] font-bold ${totals.res.critical > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {totals.res.critical > 0 ? 'Requiere Atención Urgente' : 'Perfil Bajo Control'}
              </span>
            </div>
          </div>
        </div>

        {/* Acceptable Residual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Shield size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Perfil Residual Aceptable</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-600">{totals.acceptableResidualPct}%</span>
              <span className="text-[10px] text-slate-500 font-semibold">{totals.res.low} Bajo / {totals.res.moderate} Moderado</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5">
        <button
          onClick={() => setActiveTab('consolidated_table')}
          className={`px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
            activeTab === 'consolidated_table'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <FileText size={16} />
          <span>📊 Consolidado por Proceso</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmaps')}
          className={`px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
            activeTab === 'heatmaps'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Activity size={16} />
          <span>🔥 Mapas de Calor por Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('detailed_matrix')}
          className={`px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
            activeTab === 'detailed_matrix'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Layers size={16} />
          <span>📋 Matriz Detallada ({totals.totalRisks} Riesgos)</span>
        </button>

        <button
          onClick={() => setActiveTab('controls_inventory')}
          className={`px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
            activeTab === 'controls_inventory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Shield size={16} />
          <span>🛡️ Controles de Dueños de Proceso</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONSOLIDADO RIESGOS SOLO POR PROCESO                              */}
      {/* ========================================================================= */}
      {activeTab === 'consolidated_table' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                Agrupación Macro - Riesgos Procesados
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight mt-1">
                <FileText className="text-emerald-600" size={22} />
                Consolidado de Riesgos por Proceso
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Resumen macro de la matriz de riesgos agrupado exclusivamente por área de proceso, mostrando el volumen transaccional y la mitigación de Riesgo Inherente a Residual.
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all self-start md:self-center"
            >
              <Download size={14} />
              <span>Descargar Tabla PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">Área de Proceso</th>
                  <th className="py-3.5 px-3 text-center bg-slate-900 text-blue-300 font-bold">TOTAL RIESGOS</th>
                  <th className="py-3.5 px-3 text-center bg-red-900 text-red-100" colSpan={4}>Riesgo Inherente</th>
                  <th className="py-3.5 px-3 text-center bg-emerald-900 text-emerald-100" colSpan={4}>Riesgo Residual</th>
                </tr>
                <tr className="bg-slate-700 text-slate-200 text-[9px] font-bold uppercase tracking-wider border-b border-slate-600">
                  <th className="py-2 px-4"></th>
                  <th className="py-2 px-3 bg-slate-800"></th>
                  <th className="py-2 px-2 text-center text-red-200 bg-red-950">Extremo</th>
                  <th className="py-2 px-2 text-center text-orange-200 bg-red-950">Alto</th>
                  <th className="py-2 px-2 text-center text-yellow-200 bg-red-950">Moderado</th>
                  <th className="py-2 px-2 text-center text-emerald-200 bg-red-950">Bajo</th>
                  <th className="py-2 px-2 text-center text-red-200 bg-emerald-950">Extremo</th>
                  <th className="py-2 px-2 text-center text-orange-200 bg-emerald-950">Alto</th>
                  <th className="py-2 px-2 text-center text-yellow-200 bg-emerald-950">Moderado</th>
                  <th className="py-2 px-2 text-center text-emerald-200 bg-emerald-950">Bajo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {processAggregated.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      {row.processArea}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black bg-blue-50/50 text-blue-900 border-x border-slate-200 text-base">
                      {row.totalRisks}
                    </td>

                    {/* Inherents */}
                    <td className={`py-3.5 px-2 text-center font-bold ${row.inherent.extreme > 0 ? 'bg-red-100 text-red-900 font-black' : 'text-slate-400'}`}>
                      {row.inherent.extreme}
                    </td>
                    <td className={`py-3.5 px-2 text-center font-bold ${row.inherent.high > 0 ? 'bg-orange-100 text-orange-900 font-black' : 'text-slate-400'}`}>
                      {row.inherent.high}
                    </td>
                    <td className={`py-3.5 px-2 text-center font-bold ${row.inherent.moderate > 0 ? 'bg-yellow-100 text-yellow-900 font-black' : 'text-slate-400'}`}>
                      {row.inherent.moderate}
                    </td>
                    <td className={`py-3.5 px-2 text-center font-bold ${row.inherent.low > 0 ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-slate-400'}`}>
                      {row.inherent.low}
                    </td>

                    {/* Residuals */}
                    <td className={`py-3.5 px-2 text-center font-bold ${row.residual.extreme > 0 ? 'bg-red-100 text-red-900 font-black' : 'text-slate-400'}`}>
                      {row.residual.extreme}
                    </td>
                    <td className={`py-3.5 px-2 text-center font-bold ${row.residual.high > 0 ? 'bg-orange-100 text-orange-900 font-black' : 'text-slate-400'}`}>
                      {row.residual.high}
                    </td>
                    <td className={`py-3.5 px-2 text-center font-bold ${row.residual.moderate > 0 ? 'bg-yellow-100 text-yellow-900 font-black' : 'text-slate-400'}`}>
                      {row.residual.moderate}
                    </td>
                    <td className={`py-3.5 px-2 text-center font-bold ${row.residual.low > 0 ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-slate-400'}`}>
                      {row.residual.low}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black text-xs">
                  <td className="py-3.5 px-4 uppercase tracking-wider">GRAND TOTAL (MATRIZ COMPLETA)</td>
                  <td className="py-3.5 px-3 text-center text-base bg-blue-600 text-white font-black">{totals.totalRisks}</td>
                  
                  {/* Total Inherents */}
                  <td className="py-3.5 px-2 text-center text-red-300 font-black">{totals.inh.extreme}</td>
                  <td className="py-3.5 px-2 text-center text-orange-300 font-black">{totals.inh.high}</td>
                  <td className="py-3.5 px-2 text-center text-yellow-300 font-black">{totals.inh.moderate}</td>
                  <td className="py-3.5 px-2 text-center text-emerald-300 font-black">{totals.inh.low}</td>

                  {/* Total Residuals */}
                  <td className="py-3.5 px-2 text-center text-red-300 font-black">{totals.res.extreme}</td>
                  <td className="py-3.5 px-2 text-center text-orange-300 font-black">{totals.res.high}</td>
                  <td className="py-3.5 px-2 text-center text-yellow-300 font-black">{totals.res.moderate}</td>
                  <td className="py-3.5 px-2 text-center text-emerald-300 font-black">{totals.res.low}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MAPAS DE CALOR POR PERFIL (INHERENTE VS RESIDUAL)                 */}
      {/* ========================================================================= */}
      {activeTab === 'heatmaps' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-200">
                Matriz de Calor ISO 31000 5x5
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight mt-1">
                <Activity className="text-blue-600" size={22} />
                Mapas de Calor por Perfil Operativo
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Compara gráficamente la migración del perfil de riesgo (Inherente vs Residual). Haz clic en las celdas para ver el detalle de los riesgos en esa coordenada.
              </p>
            </div>

            {/* Profile Selector */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setHeatmapProfile('entidad')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  heatmapProfile === 'entidad'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏢 Perfil Entidad Completo
              </button>
              <button
                onClick={() => setHeatmapProfile('estrategico')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  heatmapProfile === 'estrategico'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎯 Perfil Estratégico
              </button>
              <button
                onClick={() => setHeatmapProfile('gestion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  heatmapProfile === 'gestion'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛡️ Gestión del Riesgo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* INHERENT HEATMAP */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Mapa de Riesgo Inherente ({heatmapActiveRisks.length} Riesgos)
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Sin Controles Aplicados</span>
              </div>

              {/* 5x5 GRID */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Impacto (Vertical) vs Probabilidad (Horizontal)</div>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map(imp => (
                    <React.Fragment key={imp}>
                      {[1, 2, 3, 4, 5].map(prob => {
                        const cellKey = `${imp}-${prob}`;
                        const cellRisks = heatmapGridMapping.inherentMap[cellKey] || [];
                        const bgClass = getCellBgColor(imp, prob, cellRisks.length);

                        return (
                          <div
                            key={cellKey}
                            onClick={() => cellRisks.length > 0 && setSelectedCellRisks({ title: `Riesgo Inherente - Coordenada ${imp}x${prob}`, risks: cellRisks })}
                            className={`p-3 rounded-xl border flex flex-col justify-between items-center min-h-[75px] transition-all ${
                              cellRisks.length > 0 ? 'cursor-pointer hover:scale-105 shadow-xs' : 'opacity-80'
                            } ${bgClass}`}
                          >
                            <span className="text-[9px] opacity-75 font-mono">{imp}x{prob}</span>
                            <span className="text-xl font-black">{cellRisks.length}</span>
                            <div className="flex flex-wrap gap-0.5 justify-center max-w-full overflow-hidden">
                              {cellRisks.slice(0, 3).map(r => (
                                <span key={r.id} className="text-[8px] bg-black/10 px-1 rounded font-bold">{r.id}</span>
                              ))}
                              {cellRisks.length > 3 && <span className="text-[8px] font-bold">+{cellRisks.length - 3}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* RESIDUAL HEATMAP */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Mapa de Riesgo Residual ({heatmapActiveRisks.length} Riesgos)
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Con Controles Aplicados</span>
              </div>

              {/* 5x5 GRID */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Impacto Residual vs Probabilidad Residual</div>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map(imp => (
                    <React.Fragment key={imp}>
                      {[1, 2, 3, 4, 5].map(prob => {
                        const cellKey = `${imp}-${prob}`;
                        const cellRisks = heatmapGridMapping.residualMap[cellKey] || [];
                        const bgClass = getCellBgColor(imp, prob, cellRisks.length);

                        return (
                          <div
                            key={cellKey}
                            onClick={() => cellRisks.length > 0 && setSelectedCellRisks({ title: `Riesgo Residual - Coordenada ${imp}x${prob}`, risks: cellRisks })}
                            className={`p-3 rounded-xl border flex flex-col justify-between items-center min-h-[75px] transition-all ${
                              cellRisks.length > 0 ? 'cursor-pointer hover:scale-105 shadow-xs' : 'opacity-80'
                            } ${bgClass}`}
                          >
                            <span className="text-[9px] opacity-75 font-mono">{imp}x{prob}</span>
                            <span className="text-xl font-black">{cellRisks.length}</span>
                            <div className="flex flex-wrap gap-0.5 justify-center max-w-full overflow-hidden">
                              {cellRisks.slice(0, 3).map(r => (
                                <span key={r.id} className="text-[8px] bg-black/10 px-1 rounded font-bold">{r.id}</span>
                              ))}
                              {cellRisks.length > 3 && <span className="text-[8px] font-bold">+{cellRisks.length - 3}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MATRIZ DETALLADA DE RIESGOS (CON RIESGO, CAUSA, CONTROL, PLAN)     */}
      {/* ========================================================================= */}
      {activeTab === 'detailed_matrix' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                Matriz Completa ISO 31000
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight mt-1">
                <Layers className="text-indigo-600" size={22} />
                Matriz Detallada de Riesgos y Evaluación
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Detalle exhaustivo conteniendo Descripción del Riesgo, Causa Raíz, Calificaciones (Inherente y Residual), Control del Dueño de Proceso, Plan de Acción y Responsables asignados.
              </p>
            </div>

            {/* FILTERS TOOLBAR */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar riesgo, causa, plan o responsable..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none w-64"
                />
              </div>

              <select
                value={selectedProcess}
                onChange={e => setSelectedProcess(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="TODOS">Todas las Áreas de Proceso</option>
                {processAreaOptions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={selectedAcceptability}
                onChange={e => setSelectedAcceptability(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="TODOS">Todos los Veredictos</option>
                <option value="ACEPTABLE">Aceptable (DENTRO DE APETITO)</option>
                <option value="NO_ACEPTABLE">No Aceptable (REQUIERE TRATAMIENTO)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-3 min-w-[85px]">ID</th>
                  <th className="py-3.5 px-3 min-w-[110px]">Proceso</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Riesgo (Descripción Excel)</th>
                  <th className="py-3.5 px-4 min-w-[190px]">Causa Raíz</th>
                  <th className="py-3.5 px-3 text-center min-w-[100px]">Calificación Inherente</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Control Definido (Columna N - Editable)</th>
                  <th className="py-3.5 px-3 text-center min-w-[120px]">Calificación de Control</th>
                  <th className="py-3.5 px-3 text-center min-w-[110px]">Riesgo Residual (PxI)</th>
                  <th className="py-3.5 px-4 min-w-[230px]">Plan de Acción (Editable)</th>
                  <th className="py-3.5 px-3 min-w-[160px]">Responsable (Cargo Excel)</th>
                  <th className="py-3.5 px-3 text-center min-w-[110px]">Aceptabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredDetailedRisks.map((r) => {
                  const inhScore = r.impact * r.probability;
                  const resImpact = r.residualImpact ?? Math.max(1, r.impact - 1);
                  const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
                  const resScore = resImpact * resProb;
                  const isAcceptable = resScore <= 12;

                  const responsible = getResponsibleForRisk(r);
                  const actionPlan = getActionPlanForRisk(r);
                  const causeText = formatCauseText(r.cause);
                  const currentControl = r.documentControl || r.suggestedControl || '';

                  // Control evaluation calculation
                  const diffScore = inhScore - resScore;
                  let controlRatingBadge = (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 uppercase">
                      EFECTIVO
                    </span>
                  );
                  let controlRatingLabel = "Diseño y Operación Óptimos";

                  if (diffScore < 3 || resScore > 12) {
                    controlRatingBadge = (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 uppercase">
                        MODERADO
                      </span>
                    );
                    controlRatingLabel = "Requiere Refuerzo de Control";
                  } else if (resScore > 16) {
                    controlRatingBadge = (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300 uppercase">
                        DEFICIENTE
                      </span>
                    );
                    controlRatingLabel = "Sin Reducción Sustancial";
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-3 font-black text-blue-700 font-mono text-xs align-top">
                        {r.id}
                      </td>

                      {/* Proceso */}
                      <td className="py-3.5 px-3 font-bold text-slate-900 align-top">
                        {(() => {
                          const tax = resolveTaxonomyForRisk(r);
                          return (
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 block">
                                {tax.macrocategory}
                              </span>
                              <div className="text-[11px] font-bold text-slate-900 leading-tight">
                                #{tax.taxonomyProcessId} {tax.taxonomyProcessName}
                              </div>
                              <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                                <span>🎯</span>
                                <span>{tax.subproceso}</span>
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {r.processArea} {r.process ? `• ${r.process}` : ''}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Riesgo */}
                      <td className="py-3.5 px-4 text-slate-800 leading-snug align-top">
                        <p className="font-medium text-xs">{r.riskDescription}</p>
                      </td>

                      {/* Causa */}
                      <td className="py-3.5 px-4 text-slate-700 leading-snug align-top">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] whitespace-pre-line font-normal text-slate-600">
                          {causeText}
                        </div>
                      </td>

                      {/* Calificación Inherente */}
                      <td className="py-3.5 px-3 text-center font-black align-top">
                        <div className="flex flex-col items-center gap-1">
                          {getLevelBadge(inhScore)}
                          <span className="text-[10px] text-slate-500 font-mono">{inhScore} ({r.impact}x{r.probability})</span>
                        </div>
                      </td>

                      {/* Control Definido (Columna N - EDITABLE) */}
                      <td className="py-3.5 px-4 text-slate-800 leading-snug align-top">
                        {editingControlId === r.id ? (
                          <div className="space-y-2 p-2 bg-blue-50/90 rounded-2xl border border-blue-300">
                            <textarea
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              rows={4}
                              className="w-full text-xs p-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                              placeholder="Desarrolle o ajuste la idea del control definido..."
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingControlId(null)}
                                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateRisk?.(r.id, { documentControl: tempValue, suggestedControl: tempValue });
                                  setEditingControlId(null);
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Save size={12} /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative p-3 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-[11px] font-medium text-slate-800 space-y-1.5 transition-all hover:border-blue-300">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-blue-800 tracking-wider">
                                Control Definido
                              </span>
                              <button
                                onClick={() => {
                                  setEditingControlId(r.id);
                                  setTempValue(currentControl);
                                }}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-md hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                <Edit2 size={10} /> Editar
                              </button>
                            </div>
                            <p className="leading-relaxed">{currentControl || 'Sin control definido'}</p>
                          </div>
                        )}
                      </td>

                      {/* Calificación / Evaluación del Control */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                          {controlRatingBadge}
                          <span className="text-[9px] text-slate-600 font-bold leading-tight">
                            {controlRatingLabel}
                          </span>
                        </div>
                      </td>

                      {/* Calificación Residual */}
                      <td className="py-3.5 px-3 text-center font-black align-top">
                        <div className="flex flex-col items-center gap-1">
                          {getLevelBadge(resScore)}
                          <span className="text-[10px] text-slate-500 font-mono">{resScore} ({resImpact}x{resProb})</span>
                        </div>
                      </td>

                      {/* Plan de Acción (EDITABLE) */}
                      <td className="py-3.5 px-4 text-slate-800 leading-snug align-top">
                        {editingPlanId === r.id ? (
                          <div className="space-y-2 p-2 bg-emerald-50/90 rounded-2xl border border-emerald-300">
                            <textarea
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              rows={3}
                              className="w-full text-xs p-2 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                              placeholder="Escriba el plan de acción..."
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingPlanId(null)}
                                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  try {
                                    const saved = localStorage.getItem('g66_treatment_plans');
                                    let list = saved ? JSON.parse(saved) : [];
                                    const idx = list.findIndex((p: any) => p.riskId === r.id || p.riskTitle?.includes(r.id));
                                    if (idx >= 0) {
                                      list[idx].tasks = tempValue;
                                    } else {
                                      list.push({ riskId: r.id, tasks: tempValue });
                                    }
                                    localStorage.setItem('g66_treatment_plans', JSON.stringify(list));
                                  } catch (e) {
                                    console.error(e);
                                  }
                                  onUpdateRisk?.(r.id, { suggestedControl: tempValue });
                                  setEditingPlanId(null);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Save size={12} /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-[11px] font-medium text-slate-800 transition-all hover:border-emerald-300">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-800 uppercase">
                                <Clock size={12} /> Plan de Mitigación
                              </div>
                              <button
                                onClick={() => {
                                  setEditingPlanId(r.id);
                                  setTempValue(actionPlan);
                                }}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-50 transition-all cursor-pointer"
                              >
                                <Edit2 size={10} /> Editar
                              </button>
                            </div>
                            <p className="leading-snug">{actionPlan}</p>
                          </div>
                        )}
                      </td>

                      {/* Responsable (Cargo Excel - SELECTOR/EDITABLE) */}
                      <td className="py-3.5 px-3 text-xs align-top">
                        {editingRespId === r.id ? (
                          <div className="space-y-1.5 p-2 bg-slate-100 rounded-xl border border-slate-300">
                            <select
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                            >
                              <option value="Head de Operaciones">Head de Operaciones</option>
                              <option value="Head de Mesa de Dinero">Head de Mesa de Dinero</option>
                              <option value="Head de Tesorería">Head de Tesorería</option>
                              <option value="Head de TI">Head de TI</option>
                              <option value="CISO / Head de Ciberseguridad">CISO / Head de Ciberseguridad</option>
                              <option value="Head de Prevención de Fraude">Head de Prevención de Fraude</option>
                              <option value="Compliance Officer">Compliance Officer</option>
                              <option value="Head de Producto">Head de Producto</option>
                              <option value="Líder del Proceso">Líder del Proceso</option>
                            </select>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingRespId(null)}
                                className="px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 rounded"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateRisk?.(r.id, { roamOwner: tempValue });
                                  setEditingRespId(null);
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded"
                              >
                                OK
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative p-2 rounded-xl bg-slate-100 border border-slate-200 space-y-1 hover:border-slate-300 transition-all">
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <User size={13} className="text-blue-600 shrink-0" />
                                <span className="text-xs font-bold text-slate-900">{responsible}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingRespId(r.id);
                                  setTempValue(responsible);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 hover:underline cursor-pointer"
                              >
                                <Edit2 size={10} />
                              </button>
                            </div>
                            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200 uppercase">
                              {r.roamStatus || 'Mitigated'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Veredicto Aceptabilidad */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          isAcceptable
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {isAcceptable ? 'ACEPTABLE' : 'NO ACEPTABLE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INVENTARIO DE CONTROLES DE DUEÑOS DE PROCESO                     */}
      {/* ========================================================================= */}
      {activeTab === 'controls_inventory' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                Catálogo de Salvaguardas y Controles
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight mt-1">
                <Shield className="text-indigo-600" size={22} />
                Controles Definidos por los Dueños de Proceso
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Salvaguardas reales formalizadas e identificadas para mitigar la probabilidad e impacto de los riesgos corporativos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingRisks.map(r => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {r.id} - {r.processArea}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <User size={12} /> {getResponsibleForRisk(r)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{r.riskDescription}</h4>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Control del Dueño de Proceso:</span>
                  <p className="font-medium">{r.documentControl || r.suggestedControl}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CELL DETAIL MODAL FOR HEATMAPS */}
      <AnimatePresence>
        {selectedCellRisks && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="text-blue-600" size={20} />
                  {selectedCellRisks.title}
                </h3>
                <button
                  onClick={() => setSelectedCellRisks(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {selectedCellRisks.risks.map(r => (
                  <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-blue-700">{r.id} - {r.processArea}</span>
                      <span className="text-xs font-bold text-slate-700">{getResponsibleForRisk(r)}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{r.riskDescription}</p>
                    <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                      <strong>Control:</strong> {r.documentControl || r.suggestedControl}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
