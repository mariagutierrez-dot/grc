import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  FileText, 
  Clock, 
  DollarSign, 
  Building2, 
  Landmark, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  Download, 
  Users, 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Flame, 
  RefreshCw, 
  ShieldCheck, 
  Globe2, 
  ChevronRight, 
  FileSpreadsheet,
  Calendar,
  Lock,
  X,
  AlertCircle,
  CreditCard,
  Smartphone,
  Server,
  MapPin,
  Hash,
  SlidersHorizontal,
  Activity,
  Sparkles
} from 'lucide-react';
import { 
  RegulatoryRiskEvent, 
  EventActionPlanItem, 
  EventStatus, 
  EventSeverity, 
  Jurisdiction, 
  ProcessArea,
  FraudulentTransactionRecord,
  FraudulentClientRecord
} from '../types';
import { INITIAL_RISK_EVENTS } from '../data/riskEventsData';
import { FRAUDULENT_TRANSACTIONS_INSWITCH, FRAUDULENT_TRANSACTION_SUMMARY } from '../data/inswitchFraudulentTransactions';
import { exportToExcel, exportFraudTransactionsToExcel } from '../lib/excelExport';

interface RiskEventsModuleProps {
  onNavigateToPlans?: () => void;
  onNavigateToRisk?: (riskId: string) => void;
}

export const RiskEventsModule: React.FC<RiskEventsModuleProps> = ({
  onNavigateToPlans,
  onNavigateToRisk
}) => {
  // Estado de Eventos de Riesgo con persistencia local
  const [events, setEvents] = useState<RegulatoryRiskEvent[]>(() => {
    const saved = localStorage.getItem('g66_regulatory_risk_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: RegulatoryRiskEvent) => {
            const initMatch = INITIAL_RISK_EVENTS.find(i => i.id === p.id);
            if (initMatch) {
              return {
                ...initMatch,
                ...p,
                fraudulentTransactions: (p.fraudulentTransactions && p.fraudulentTransactions.length > 0)
                  ? p.fraudulentTransactions
                  : initMatch.fraudulentTransactions,
                fraudulentClients: (p.fraudulentClients && p.fraudulentClients[0]?.hadInswitchIn !== 'Por diligenciar')
                  ? p.fraudulentClients
                  : initMatch.fraudulentClients,
                actionPlans: p.actionPlans && p.actionPlans.length > 0 ? p.actionPlans : initMatch.actionPlans
              };
            }
            return p;
          });
        }
      } catch (e) {
        console.error('Error al cargar eventos guardados:', e);
      }
    }
    return INITIAL_RISK_EVENTS;
  });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    localStorage.setItem('g66_regulatory_risk_events', JSON.stringify(events));

    // Sincronizar planes de acción de eventos con el storage de Planes de Acción
    const allEventPlans = events.flatMap(ev => ev.actionPlans.map(ap => ({
      id: ap.id,
      eventTitle: ap.eventTitle || ev.title,
      eventDate: ev.dateOccurred,
      impactUSD: ev.grossAmountUSD,
      processArea: ev.processArea,
      description: `${ap.title}. Acción inmediata: ${ap.immediateAction}`,
      immediateCorrectiveAction: ap.immediateAction,
      longTermPreventativeAction: ap.longTermPreventativeAction,
      responsible: ap.responsible,
      status: ap.status === 'Completado' ? 'Cerrado' : ap.status === 'En proceso' ? 'En Mitigación' : 'Planificado',
      framework: ap.framework === 'CMF' || ap.framework === 'SFC' ? 'SARO' : ap.framework,
      evidences: []
    })));

    try {
      const existingEventPlansRaw = localStorage.getItem('g66_event_plans');
      const existingEventPlans = existingEventPlansRaw ? JSON.parse(existingEventPlansRaw) : [];
      // Combinar sin duplicados
      const existingIds = new Set(existingEventPlans.map((p: any) => p.id));
      const mergedPlans = [...existingEventPlans];
      allEventPlans.forEach(newP => {
        if (!existingIds.has(newP.id)) {
          mergedPlans.unshift(newP);
        } else {
          const idx = mergedPlans.findIndex((p: any) => p.id === newP.id);
          if (idx >= 0) mergedPlans[idx] = newP;
        }
      });
      localStorage.setItem('g66_event_plans', JSON.stringify(mergedPlans));
    } catch (e) {
      console.error('Error sincronizando con g66_event_plans:', e);
    }
  }, [events]);

  // Filtros
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<'TODOS' | Jurisdiction>('TODOS');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'TODOS' | EventSeverity>('TODOS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'TODOS' | EventStatus>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || 'EVT-2026-001');

  // Subpestaña interna para el evento seleccionado
  const [activeTab, setActiveTab] = useState<'general' | 'cmf' | 'sfc' | 'plans' | 'transactions'>('general');

  // Subpestaña interna de la sección 5 (Transacciones y Cuentas)
  const [fraudSubTab, setFraudSubTab] = useState<'transactions' | 'accounts' | 'analytics'>('transactions');

  // Filtros para la tabla de 78 transacciones fraudulentas
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [selected3DSFilter, setSelected3DSFilter] = useState('TODOS');
  const [selectedRailFilter, setSelectedRailFilter] = useState('TODOS');
  const [selectedBankFilter, setSelectedBankFilter] = useState('TODOS');

  // Filtros y ordenamiento para la tabla de 43 cuentas fraudulentas
  const [fraudSearchQuery, setFraudSearchQuery] = useState('');
  const [fraudStatusFilter, setFraudStatusFilter] = useState<'TODOS' | 'FULLY_BLOCKED' | 'BLOCKED'>('TODOS');
  const [fraudSortBy, setFraudSortBy] = useState<'balance_desc' | 'balance_asc' | 'transactions_desc' | 'email'>('balance_desc');

  // Modales de Inspección Forense
  const [selectedTransaction, setSelectedTransaction] = useState<FraudulentTransactionRecord | null>(null);
  const [selectedClientForModal, setSelectedClientForModal] = useState<FraudulentClientRecord | null>(null);

  // Modales
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RegulatoryRiskEvent | null>(null);

  // Formulario nuevo plan
  const [planFormData, setPlanFormData] = useState({
    title: '',
    immediateAction: '',
    longTermPreventativeAction: '',
    responsible: '',
    responsibleRole: '',
    targetDate: '',
    budgetUSD: '0 USD',
    framework: 'Fraude' as 'CMF' | 'SFC' | 'ISO 31000' | 'SARO' | 'Fraude' | 'Continuidad',
    notes: ''
  });

  // Evento activo actual
  const currentEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  // Lista consolidada de transacciones fraudulentas
  const allFraudTransactions = useMemo(() => {
    return currentEvent?.fraudulentTransactions && currentEvent.fraudulentTransactions.length > 0
      ? currentEvent.fraudulentTransactions
      : FRAUDULENT_TRANSACTIONS_INSWITCH;
  }, [currentEvent]);

  // 78 Transacciones fraudulentas filtradas
  const filteredFraudTransactions = useMemo(() => {
    return allFraudTransactions.filter(tx => {
      const q = transactionSearchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        tx.transactionId.toLowerCase().includes(q) ||
        tx.externalReference.toLowerCase().includes(q) ||
        tx.clientEmail.toLowerCase().includes(q) ||
        tx.clientId.toLowerCase().includes(q) ||
        tx.cardBin.includes(q) ||
        tx.cardLast4.includes(q) ||
        tx.issuingBank.toLowerCase().includes(q) ||
        tx.ipAddress.toLowerCase().includes(q) ||
        tx.fraudPattern.toLowerCase().includes(q);

      const matches3DS = selected3DSFilter === 'TODOS' || tx.threeDSStatus === selected3DSFilter;
      const matchesRail = selectedRailFilter === 'TODOS' || tx.paymentRail === selectedRailFilter;
      const matchesBank = selectedBankFilter === 'TODOS' || tx.issuingBank === selectedBankFilter;

      return matchesSearch && matches3DS && matchesRail && matchesBank;
    });
  }, [allFraudTransactions, transactionSearchQuery, selected3DSFilter, selectedRailFilter, selectedBankFilter]);

  // Eventos filtrados
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.partnerInvolved.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEntity = selectedEntityFilter === 'TODOS' || 
        e.affectedEntities.includes(selectedEntityFilter) || 
        e.primaryEntity === selectedEntityFilter;

      const matchesSeverity = selectedSeverityFilter === 'TODOS' || e.severity === selectedSeverityFilter;
      const matchesStatus = selectedStatusFilter === 'TODOS' || e.status === selectedStatusFilter;

      return matchesSearch && matchesEntity && matchesSeverity && matchesStatus;
    });
  }, [events, searchQuery, selectedEntityFilter, selectedSeverityFilter, selectedStatusFilter]);

  // Cuentas y transacciones fraudulentas filtradas y ordenadas
  const filteredFraudClients = useMemo(() => {
    if (!currentEvent?.fraudulentClients) return [];
    const list = currentEvent.fraudulentClients.filter(c => {
      const q = fraudSearchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        c.clientEmail.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.ipOrigin && c.ipOrigin.toLowerCase().includes(q)) ||
        (c.fraudPattern && c.fraudPattern.toLowerCase().includes(q));

      const matchesStatus = fraudStatusFilter === 'TODOS' || c.status === fraudStatusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (fraudSortBy === 'balance_desc') return b.currentBalanceCOP - a.currentBalanceCOP;
      if (fraudSortBy === 'balance_asc') return a.currentBalanceCOP - b.currentBalanceCOP;
      if (fraudSortBy === 'transactions_desc') {
        const countA = typeof a.transactionCount === 'number' ? a.transactionCount : 0;
        const countB = typeof b.transactionCount === 'number' ? b.transactionCount : 0;
        return countB - countA;
      }
      if (fraudSortBy === 'email') return a.clientEmail.localeCompare(b.clientEmail);
      return b.blockDate.localeCompare(a.blockDate);
    });
  }, [currentEvent, fraudSearchQuery, fraudStatusFilter, fraudSortBy]);

  const handleExportFraudAccountsExcel = () => {
    if (!currentEvent?.fraudulentClients) return;
    const data = currentEvent.fraudulentClients.map((c, idx) => ({
      'N°': idx + 1,
      'ID Registro': c.id,
      Cliente: c.clientEmail,
      'Fecha Vinculación': c.registrationDate,
      'Tuvo In por Inswitch?': c.hadInswitchIn,
      'Cantidad Transacciones': c.transactionCount || 0,
      'Monto Transaccionado': c.transactionValue || '$0 USD',
      'Monto USD': c.transactionValueUSD || 0,
      'Monto COP': c.transactionValueCOP || 0,
      'Estado Bloqueo': c.status,
      'Fecha Bloqueo': c.blockDate,
      'Saldo Remanente COP': c.currentBalanceFormatted,
      'Saldo Remanente COP (Num)': c.currentBalanceCOP,
      'BINs Utilizados': (c.associatedCardBins || []).join(' | '),
      'Patrón de Fraude': c.fraudPattern || 'Anomalía de velocidad',
      'Geolocalización IP': c.ipOrigin || 'No especificada'
    }));
    exportToExcel(data as any, 'Inswitch_43_Cuentas_Auditadas_Bloqueadas_Global66', 'Cuentas Bloqueadas');
  };

  const handleExportTransactionsExcel = () => {
    exportFraudTransactionsToExcel(
      filteredFraudTransactions,
      'Inswitch_78_Transacciones_Fraudulentas_Auditoria'
    );
  };

  // Estadísticas globales
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalGrossUSD = events.reduce((sum, e) => sum + (e.grossAmountUSD || 0), 0);
    const totalHeldUSD = events.reduce((sum, e) => sum + (e.heldAmountUSD || 0), 0);
    const totalTransactions = events.reduce((sum, e) => sum + (e.affectedTransactionsCount || 0), 0);
    const totalPlans = events.reduce((sum, e) => sum + (e.actionPlans?.length || 0), 0);
    const completedPlans = events.reduce((sum, e) => sum + (e.actionPlans?.filter(p => p.status === 'Completado').length || 0), 0);
    const inProgressPlans = events.reduce((sum, e) => sum + (e.actionPlans?.filter(p => p.status === 'En proceso').length || 0), 0);
    const avgProgress = totalPlans > 0 
      ? Math.round(events.flatMap(e => e.actionPlans || []).reduce((acc, p) => acc + (p.progress || 0), 0) / totalPlans)
      : 0;

    return {
      totalEvents,
      totalGrossUSD,
      totalHeldUSD,
      totalTransactions,
      totalPlans,
      completedPlans,
      inProgressPlans,
      avgProgress
    };
  }, [events]);

  // Manejar guardado de nuevo plan para el evento actual
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !planFormData.title.trim()) return;

    const newPlanItem: EventActionPlanItem = {
      id: `ACT-EVT-${String((currentEvent.actionPlans?.length || 0) + 1).padStart(2, '0')}`,
      eventId: currentEvent.id,
      eventTitle: currentEvent.title,
      title: planFormData.title,
      immediateAction: planFormData.immediateAction || 'Por diligenciar',
      longTermPreventativeAction: planFormData.longTermPreventativeAction || 'Por diligenciar',
      responsible: planFormData.responsible || 'Por diligenciar',
      responsibleRole: planFormData.responsibleRole || 'Líder del Proceso',
      targetDate: planFormData.targetDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'En proceso',
      progress: 15,
      budgetUSD: planFormData.budgetUSD || '0 USD',
      framework: planFormData.framework,
      createdAt: new Date().toISOString().split('T')[0],
      notes: planFormData.notes || ''
    };

    setEvents(prev => prev.map(ev => {
      if (ev.id === currentEvent.id) {
        return {
          ...ev,
          actionPlans: [...(ev.actionPlans || []), newPlanItem],
          updatedAt: new Date().toISOString()
        };
      }
      return ev;
    }));

    setIsNewPlanModalOpen(false);
    setPlanFormData({
      title: '',
      immediateAction: '',
      longTermPreventativeAction: '',
      responsible: '',
      responsibleRole: '',
      targetDate: '',
      budgetUSD: '0 USD',
      framework: 'Fraude',
      notes: ''
    });
  };

  // Actualizar progreso o estado de un plan
  const handleUpdatePlanStatus = (planId: string, newStatus: EventActionPlanItem['status']) => {
    if (!currentEvent) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === currentEvent.id) {
        return {
          ...ev,
          actionPlans: (ev.actionPlans || []).map(p => {
            if (p.id === planId) {
              const newProgress = newStatus === 'Completado' ? 100 : newStatus === 'En proceso' ? Math.max(25, p.progress) : 0;
              return { ...p, status: newStatus, progress: newProgress };
            }
            return p;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return ev;
    }));
  };

  // Exportar matriz de eventos a Excel
  const handleExportEventsExcel = () => {
    const dataToExport = events.map(e => ({
      ID: e.id,
      Código: e.code,
      Título: e.title,
      Estado: e.status,
      Severidad: e.severity,
      Producto: e.product,
      'Entidad Primaria': e.primaryEntity,
      'Entidades Afectadas': e.affectedEntities.join(', '),
      'Entidades Legales': e.legalEntities.join(' | '),
      'Fecha Ocurrencia': e.dateOccurred,
      'Fecha Descubrimiento': e.dateDiscovered,
      'Monto Bruto USD': e.grossAmountUSD,
      'Fondos Retenidos USD': e.heldAmountUSD,
      'N° Transacciones': e.affectedTransactionsCount,
      'Partner Involucrado': e.partnerInvolved,
      'Tipo Evento CMF': e.cmfEventType,
      'Estado Reporte CMF': e.cmfReportStatus,
      'Clase Evento SFC': e.sfcEventClass,
      'Estado Reporte SFC': e.sfcReportStatus,
      'Planes de Acción': e.actionPlans?.length || 0,
      Descripción: e.description
    }));

    exportToExcel(dataToExport as any, 'Eventos_Riesgo_CMF_SFC_Global66', 'Eventos de Riesgo');
  };

  return (
    <div id="risk_events_module_root" className="space-y-6">
      
      {/* Header Principal del Módulo */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 border border-red-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-amber-500/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-black uppercase tracking-wider border border-red-500/30 flex items-center gap-1.5">
                <Flame size={13} className="text-red-400 animate-pulse" />
                Módulo Regulador de Eventos de Riesgo
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-500/30 flex items-center gap-1.5">
                <Landmark size={13} />
                Reporte CMF (Chile) & SFC (Colombia)
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                Línea de Base LED & Planes Integrados
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Registro de Eventos de Riesgo</span>
              <span className="text-red-500 font-mono text-2xl">| CMF & SFC</span>
            </h1>

            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Módulo integral para documentar, investigar y reportar eventos e incidentes operacionales materializados en los productos financieros de Global66. Consolida los campos normativos requeridos por la <strong>Comisión para el Mercado Financiero (CMF - NCG 464)</strong> y la <strong>Superintendencia Financiera de Colombia (SFC - Circular 029 SARO)</strong>, vinculando planes de acción correctivos de cumplimiento.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setIsNewPlanModalOpen(true)}
              className="px-4 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Generar Plan para Evento</span>
            </button>

            <button
              onClick={handleExportEventsExcel}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
            >
              <FileSpreadsheet size={16} className="text-emerald-400" />
              <span>Exportar Excel CMF/SFC</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eventos Totales</div>
            <div className="text-xl font-black text-white mt-1">{stats.totalEvents}</div>
            <div className="text-[10px] text-red-400 font-bold mt-0.5">1 Crítico Activo</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto Expuesto</div>
            <div className="text-xl font-black text-amber-300 mt-1">${stats.totalGrossUSD.toLocaleString()} USD</div>
            <div className="text-[10px] text-slate-400 mt-0.5">78 txs fraudulentas</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fondos Retenidos (Hold)</div>
            <div className="text-xl font-black text-red-400 mt-1">${stats.totalHeldUSD.toLocaleString()} USD</div>
            <div className="text-[10px] text-red-300 mt-0.5">Partner Inswitch (100%)</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entidades Afectadas</div>
            <div className="text-xl font-black text-white mt-1">3 Jurisdicciones</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">CO (SFC) • CL (CMF) • REG</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planes de Acción</div>
            <div className="text-xl font-black text-indigo-300 mt-1">{stats.totalPlans} Derivados</div>
            <div className="text-[10px] text-indigo-200 mt-0.5">{stats.inProgressPlans} En Proceso</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avance de Mitigación</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{stats.avgProgress}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats.avgProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Selección de Entidad Afectada */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-black text-slate-700">
            <Building2 size={14} className="text-slate-500" />
            <span>Entidad Afectada:</span>
          </div>

          {(['TODOS', 'Colombia', 'Chile', 'Regional', 'Argentina'] as const).map(ent => {
            const count = ent === 'TODOS' 
              ? events.length 
              : events.filter(e => e.affectedEntities.includes(ent as any) || e.primaryEntity === ent).length;
            const isSelected = selectedEntityFilter === ent;

            return (
              <button
                key={ent}
                onClick={() => setSelectedEntityFilter(ent)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white font-black shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{ent === 'TODOS' ? 'Consolidado Global' : ent}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Buscar evento, código o partner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <select
            value={selectedSeverityFilter}
            onChange={e => setSelectedSeverityFilter(e.target.value as any)}
            className="border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none bg-white cursor-pointer"
          >
            <option value="TODOS">Todas las Severidades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Grid Principal: Selector Lateral de Eventos y Ficha Detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Lista de Eventos (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Eventos Documentados ({filteredEvents.length})
            </span>
            <span className="text-[11px] font-bold text-red-600">Alerta Regulatoria</span>
          </div>

          {filteredEvents.map(evt => {
            const isSelected = selectedEventId === evt.id;
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-white border-red-500 ring-2 ring-red-500/20 shadow-md'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-600" />
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 font-mono text-[11px] font-black border border-red-200">
                    {evt.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black">
                      {evt.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {evt.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                  {evt.title}
                </h4>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Building2 size={12} className="text-slate-400" />
                    {evt.primaryEntity}
                  </span>
                  <span className="font-black text-red-600">
                    ${evt.grossAmountUSD.toLocaleString()} USD
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {evt.affectedEntities.map(ent => (
                    <span key={ent} className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                      {ent}
                    </span>
                  ))}
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold ml-auto">
                    {evt.actionPlans?.length || 0} Planes
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Ficha Exhaustiva del Evento Seleccionado (8 Cols) */}
        <div className="lg:col-span-8">
          {currentEvent ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
              
              {/* Encabezado del Evento Activo */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-900 font-mono text-xs font-black border border-red-200">
                      {currentEvent.code}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Flame size={12} />
                      Severidad: {currentEvent.severity}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                      Estado: {currentEvent.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                      Producto: {currentEvent.product}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {currentEvent.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsNewPlanModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Añadir Plan de Acción</span>
                  </button>
                </div>
              </div>

              {/* Navegación por Pestañas del Evento */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {[
                  { id: 'general', label: '1. Diagnóstico e Impacto', icon: <FileText size={15} /> },
                  { id: 'cmf', label: '2. Ficha Regulatoria CMF (Chile)', icon: <Landmark size={15} /> },
                  { id: 'sfc', label: '3. Ficha Regulatoria SFC (Colombia)', icon: <Building2 size={15} /> },
                  { id: 'plans', label: `4. Planes de Acción (${currentEvent.actionPlans?.length || 0})`, icon: <CheckSquare size={15} /> },
                  { id: 'transactions', label: `5. Cuentas y Transacciones (${currentEvent.fraudulentClients?.length || 43})`, icon: <Users size={15} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white font-black shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: DIAGNÓSTICO E IMPACTO */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* Tarjetas de Cuantificación Económica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4">
                      <div className="text-[11px] font-bold text-red-700 uppercase">Monto Total Expuesto</div>
                      <div className="text-2xl font-black text-red-900 mt-1">${currentEvent.grossAmountUSD.toLocaleString()} USD</div>
                      <div className="text-[11px] text-red-600 font-semibold mt-1">78 transacciones fraudulentas</div>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                      <div className="text-[11px] font-bold text-amber-800 uppercase">Fondos Hold en Partner</div>
                      <div className="text-2xl font-black text-amber-950 mt-1">${currentEvent.heldAmountUSD.toLocaleString()} USD</div>
                      <div className="text-[11px] text-amber-700 font-semibold mt-1">Congelamiento 100% Inswitch</div>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase">Saldo Retenido Billeteras</div>
                      <div className="text-xl font-black text-emerald-950 mt-1">$13.850.654,61 COP</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">~4.285,73 USD congelados (43 usuarios)</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="text-[11px] font-bold text-slate-600 uppercase">Reserva Contractual (5%)</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">${currentEvent.contractualReserveUSD.toLocaleString()} USD</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">Insuficiente según partner</div>
                    </div>
                  </div>

                  {/* Banner de Cuentas y Transacciones Fraudulentas Vinculadas */}
                  <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white rounded-2xl border border-red-500/40 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 text-[10px] font-black uppercase tracking-wider">
                          Auditoría Forense de Cuentas
                        </span>
                        <span className="text-xs font-bold text-amber-300">
                          43 Clientes Bloqueados • $13.850.654,61 COP Retenidos
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Se identificó y ejecutó el bloqueo preventivo de 43 cuentas sospechosas (17 FULLY_BLOCKED y 26 BLOCKED) vinculadas a las ráfagas de PayIn con tarjeta por Inswitch entre el 01-10 y el 06-10-2026.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
                    >
                      <Users size={14} />
                      <span>Ver 43 Cuentas Auditadas</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Entidades Afectadas (Requerimiento explícito) */}
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-4 rounded-2xl border border-blue-200/80">
                    <h4 className="text-xs font-black text-[#102A97] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Building2 size={14} />
                      Entidades Afectadas y Jurisdicciones Supervisoras
                    </h4>
                    <div className="space-y-1.5">
                      {currentEvent.legalEntities.map((ent, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white/80 px-3 py-1.5 rounded-lg border border-blue-100">
                          <span className="w-2 h-2 rounded-full bg-[#102A97]" />
                          <span>{ent}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cronología */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Fecha Ocurrencia:</div>
                      <div className="font-black text-slate-900 mt-0.5">{currentEvent.dateOccurred} ({currentEvent.timeOccurred})</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Fecha Detección:</div>
                      <div className="font-black text-slate-900 mt-0.5">{currentEvent.dateDiscovered} ({currentEvent.timeDiscovered})</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Apagado del Producto:</div>
                      <div className="font-black text-red-600 mt-0.5">{currentEvent.dateSuspensionProduct || '2026-10-02'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Reportado Por:</div>
                      <div className="font-bold text-slate-800 mt-0.5 line-clamp-1" title={currentEvent.reportedBy}>
                        {currentEvent.reportedBy}
                      </div>
                    </div>
                  </div>

                  {/* Descripción de los Hechos */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-500" />
                      Descripción de los Hechos y Cronología del Bloqueo
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
                      {currentEvent.description}
                    </p>
                  </div>

                  {/* Causa Raíz */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertOctagon size={14} className="text-red-500" />
                      Causa Raíz Identificada
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-red-50/40 p-4 rounded-2xl border border-red-200 whitespace-pre-line">
                      {currentEvent.rootCause}
                    </p>
                  </div>

                  {/* Acciones Inmediatas Adoptadas */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      Medidas Inmediatas de Contención
                    </h4>
                    <div className="text-xs text-slate-700 leading-relaxed bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 whitespace-pre-line">
                      {currentEvent.immediateActionsTaken}
                    </div>
                  </div>

                  {/* Riesgos Vinculados de la Matriz ISO 31000 */}
                  {currentEvent.associatedRiskIds && currentEvent.associatedRiskIds.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers size={14} className="text-indigo-600" />
                        Riesgos Asociados en la Matriz ISO 31000 de Adquirencia Global
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentEvent.associatedRiskIds.map(rid => (
                          <span
                            key={rid}
                            onClick={() => onNavigateToRisk?.(rid)}
                            className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1 cursor-pointer transition"
                            title="Ver en matriz de riesgos"
                          >
                            <span>{rid}</span>
                            <ArrowRight size={12} />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: FICHA REGULATORIA CMF (CHILE - NCG 464) */}
              {activeTab === 'cmf' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
                    <Landmark size={24} className="text-blue-300 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase tracking-wider text-blue-200">
                        Comisión para el Mercado Financiero de Chile (CMF) — Reporte de Incidentes Operacionales
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Conforme a la Norma de Carácter General NCG 464, RAN 20-10 y la Circular de Incidentes Operacionales Significativos de la CMF, las entidades emisoras y operadoras de medios de pago deben notificar todo evento que afecte o amenace la continuidad de los servicios y la seguridad del ecosistema.
                      </p>
                    </div>
                  </div>

                  {/* Campos Requeridos por CMF */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    <div className="p-3.5 bg-slate-50 flex justify-between items-center font-bold text-slate-700">
                      <span>Campo Requerido CMF</span>
                      <span>Valor Registrado / Estado de Diligenciamiento</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Entidad Supervisada en Chile:</span>
                      <span className="font-black text-slate-900">Global Card S.P.A. (RUT 77.123.456-7)</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Tipología de Incidente CMF:</span>
                      <span className="font-bold text-slate-800 text-right sm:max-w-md">{currentEvent.cmfEventType}</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">¿Supera Umbral de Obligatoriedad CMF?:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-[11px] self-start sm:self-auto">
                        SÍ (Incidente Operacional Significativo)
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Plazo Legal de Reporte CMF:</span>
                      <span className="font-bold text-slate-800">{currentEvent.cmfReportDeadline}</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Estado de Envío del Reporte:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs self-start sm:self-auto">
                        {currentEvent.cmfReportStatus}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Número de Oficio / Formulario CMF:</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold self-start sm:self-auto">
                        {currentEvent.cmfOfficialFormNumber}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Clientes Afectados en Chile:</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold self-start sm:self-auto">
                        {currentEvent.cmfAffectedClientsChile}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Afectación de Continuidad Operacional en Chile:</span>
                      <span className="font-bold text-slate-800">{currentEvent.cmfContinuityImpactChile}</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Oficial de Cumplimiento / Responsable CMF:</span>
                      <span className="font-black text-slate-900">{currentEvent.cmfResponsibleOfficer}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                      <div className="text-xs text-amber-900">
                        <span className="font-bold">Acción de Cumplimiento:</span> Los campos marcados como <span className="font-bold bg-amber-200 px-1 rounded">"Por diligenciar"</span> deben ser completados formalmente una vez concluida la auditoría con el equipo de Inswitch para elevar el oficio final a la CMF.
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Generador de borrador de oficio CMF activado. Minuta en preparación con datos de Global Card S.P.A.')}
                      className="px-3.5 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Borrador CMF
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: FICHA REGULATORIA SFC (COLOMBIA - CIRCULAR 029 SARO) */}
              {activeTab === 'sfc' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
                    <Building2 size={24} className="text-emerald-300 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase tracking-wider text-emerald-200">
                        Superintendencia Financiera de Colombia (SFC) — Sistema SARO (Circular Externa 029)
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        En virtud del Sistema de Administración de Riesgo Operativo (SARO), la entidad debe registrar en su base de datos de eventos de pérdida todos los incidentes ocurridos, clasificándolos por factor de riesgo y clase de evento para remitir en los reportes periódicos y de materialidad inmediata.
                      </p>
                    </div>
                  </div>

                  {/* Campos Requeridos por SFC */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    <div className="p-3.5 bg-slate-50 flex justify-between items-center font-bold text-slate-700">
                      <span>Campo Regulatorio SFC (SARO)</span>
                      <span>Valor Registrado / Estado de Diligenciamiento</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Entidad Supervisada en Colombia:</span>
                      <span className="font-black text-slate-900">Global66 Colombia S.A.S. (SEDPE en trámite / Vigilada)</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Clase de Evento SARO:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-[11px] self-start sm:self-auto">
                        {currentEvent.sfcEventClass}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Factor de Riesgo SARO:</span>
                      <span className="font-bold text-slate-800">{currentEvent.sfcRiskFactor}</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Categoría Homologada:</span>
                      <span className="font-bold text-slate-800">{currentEvent.sfcBilateralCategory}</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Monto Cuantificado en Moneda Local:</span>
                      <span className="font-black text-emerald-700">{currentEvent.grossAmountLocalCurrency}</span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Afectación a Consumidores Financieros en Colombia:</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold self-start sm:self-auto">
                        {currentEvent.sfcConsumerImpact}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Estado del Reporte SFC:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs self-start sm:self-auto">
                        {currentEvent.sfcReportStatus}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Formato de Transmisión SFC:</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold self-start sm:self-auto">
                        {currentEvent.sfcFormatTransmission}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Cuenta Contable de Provisión:</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold self-start sm:self-auto">
                        {currentEvent.sfcAccountingAccount}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="font-bold text-slate-600">Responsable SARO Colombia:</span>
                      <span className="font-black text-slate-900">{currentEvent.sfcResponsibleOfficer}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                      <div className="text-xs text-emerald-950">
                        <span className="font-bold">Registro en Base SARO:</span> Evento precargado en la base consolidada de eventos de riesgo operacional de Global66 Colombia para evaluación de provisiones trimestrales.
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Generador de minuta SARO para la Superintendencia Financiera de Colombia activado.')}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Minuta SARO SFC
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PLANES DE ACCIÓN DEL EVENTO (INTEGRACIÓN PRINCIPAL) */}
              {activeTab === 'plans' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Planes de Acción Vinculados al Evento ({currentEvent.actionPlans?.length || 0})
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Planes correctivos y preventivos integrados directamente con el módulo corporativo de Planes de Acción.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsNewPlanModalOpen(true)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Nuevo Plan</span>
                      </button>

                      {onNavigateToPlans && (
                        <button
                          onClick={onNavigateToPlans}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckSquare size={14} className="text-indigo-600" />
                          <span>Ver en Módulo General</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Listado de Planes de Acción */}
                  <div className="space-y-3.5">
                    {currentEvent.actionPlans && currentEvent.actionPlans.length > 0 ? (
                      currentEvent.actionPlans.map(plan => {
                        const statusColors = {
                          'Completado': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                          'En proceso': 'bg-amber-100 text-amber-900 border-amber-300',
                          'Por iniciar': 'bg-slate-100 text-slate-700 border-slate-300',
                          'Vencido': 'bg-red-100 text-red-800 border-red-300'
                        };

                        return (
                          <div 
                            key={plan.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                  {plan.id}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusColors[plan.status]}`}>
                                  {plan.status}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Marco: {plan.framework}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                  <Calendar size={13} />
                                  Meta: {plan.targetDate}
                                </span>
                                <select
                                  value={plan.status}
                                  onChange={e => handleUpdatePlanStatus(plan.id, e.target.value as any)}
                                  className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 outline-none bg-white cursor-pointer"
                                >
                                  <option value="Por iniciar">Por iniciar</option>
                                  <option value="En proceso">En proceso</option>
                                  <option value="Completado">Completado</option>
                                </select>
                              </div>
                            </div>

                            <h5 className="text-sm font-black text-slate-900">
                              {plan.title}
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <span className="font-bold text-red-700 uppercase text-[10px] block">Acción Inmediata Correctiva:</span>
                                <p className="text-slate-700 mt-0.5 leading-relaxed">{plan.immediateAction}</p>
                              </div>
                              <div>
                                <span className="font-bold text-emerald-700 uppercase text-[10px] block">Acción Preventiva de Largo Plazo:</span>
                                <p className="text-slate-700 mt-0.5 leading-relaxed">{plan.longTermPreventativeAction}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500">Responsable:</span>
                                <span className="font-black text-slate-800">{plan.responsible}</span>
                                {plan.responsibleRole && (
                                  <span className="text-slate-400 text-[11px]">({plan.responsibleRole})</span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="flex items-center gap-2 flex-1 sm:w-36">
                                  <span className="text-[10px] font-bold text-slate-500">{plan.progress}%</span>
                                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                                      style={{ width: `${plan.progress}%` }} 
                                    />
                                  </div>
                                </div>

                                {plan.budgetUSD && (
                                  <span className="font-mono text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                                    {plan.budgetUSD}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">No hay planes de acción vinculados aún</p>
                        <button
                          onClick={() => setIsNewPlanModalOpen(true)}
                          className="mt-3 px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                        >
                          Generar primer plan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: AUDITORÍA FORENSE DE CUENTAS Y 78 TRANSACCIONES FRAUDULENTAS */}
              {activeTab === 'transactions' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* Banner Forense Principal */}
                  <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white p-6 rounded-3xl border border-red-500/40 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-red-600/15 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/40 flex items-center gap-1.5">
                            <ShieldAlert size={13} className="text-red-400" />
                            Auditoría Forense Culminada — Inswitch & CredibanCo
                          </span>
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40">
                            Hold 100% de Fondos en Liquidación
                          </span>
                          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/40">
                            Ficha para CMF & SFC
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          Log Transaccional de Fraude: 78 Transacciones ($128,598.00 USD)
                        </h3>

                        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                          Consolidación forense detallada de la transaccionalidad fraudulenta que ocasionó el bloqueo de la cuenta recaudadora en Inswitch y la suspensión de Adquirencia Global. Incluye 54 tarjetas únicas, cruce de BINs bancarios, resultados de autenticación 3DS y el congelamiento preventivo de 43 cuentas de usuarios con $13.850.654,61 COP en billeteras.
                        </p>
                      </div>

                      <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                        <button
                          onClick={handleExportTransactionsExcel}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
                          title="Exportar archivo Excel formal para CMF, SFC e Inswitch"
                        >
                          <Download size={15} />
                          <span>Descargar Log Forense (.xlsx)</span>
                        </button>

                        <button
                          onClick={handleExportFraudAccountsExcel}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                        >
                          <FileSpreadsheet size={15} className="text-amber-400" />
                          <span>Descargar 43 Cuentas (.xlsx)</span>
                        </button>
                      </div>
                    </div>

                    {/* KPI Cards del Fraude */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-red-500/30 text-xs">
                      <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Transacciones</span>
                        <span className="text-xl font-black text-white mt-0.5 block">78</span>
                        <span className="text-[10px] text-red-300 font-semibold">100% auditadas</span>
                      </div>

                      <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Monto Total USD</span>
                        <span className="text-xl font-black text-red-400 mt-0.5 block">$128,598</span>
                        <span className="text-[10px] text-slate-300 font-semibold">En Hold Inswitch</span>
                      </div>

                      <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Equivalente COP</span>
                        <span className="text-sm font-black text-emerald-400 mt-1 block">$540.111.600</span>
                        <span className="text-[10px] text-slate-300 font-semibold">TRM $4.200 COP</span>
                      </div>

                      <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuentas Bloqueadas</span>
                        <span className="text-xl font-black text-amber-300 mt-0.5 block">43</span>
                        <span className="text-[10px] text-slate-300 font-semibold">17 FULL / 26 BLOCKED</span>
                      </div>

                      <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Retenido Wallet</span>
                        <span className="text-sm font-black text-emerald-300 mt-1 block">$13.850.654 COP</span>
                        <span className="text-[10px] text-slate-300 font-semibold">~$4.285,73 USD seguros</span>
                      </div>

                      <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-red-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarjetas Únicas</span>
                        <span className="text-xl font-black text-white mt-0.5 block">54</span>
                        <span className="text-[10px] text-slate-300 font-semibold">8 Bancos emisores</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Navegación Interna de Tab 5 */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setFraudSubTab('transactions')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                          fraudSubTab === 'transactions'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <CreditCard size={15} className="text-red-500" />
                        <span>1. Log de 78 Transacciones Forenses ({filteredFraudTransactions.length})</span>
                      </button>

                      <button
                        onClick={() => setFraudSubTab('accounts')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                          fraudSubTab === 'accounts'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Users size={15} className="text-amber-500" />
                        <span>2. Auditoría de 43 Cuentas Bloqueadas ({filteredFraudClients.length})</span>
                      </button>

                      <button
                        onClick={() => setFraudSubTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                          fraudSubTab === 'analytics'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Activity size={15} className="text-blue-500" />
                        <span>3. Análisis de Bancos, 3DS y Vectores</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-bold text-slate-500 px-3">
                      Suma filtrada: <span className="text-red-700 font-black">${filteredFraudTransactions.reduce((s, t) => s + t.amountUSD, 0).toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* SUB-VISTA 1: LOG DE 78 TRANSACCIONES FORENSES */}
                  {fraudSubTab === 'transactions' && (
                    <div className="space-y-4">
                      {/* Barra de Filtros y Búsqueda de Transacciones */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Search */}
                          <div className="relative">
                            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              value={transactionSearchQuery}
                              onChange={e => setTransactionSearchQuery(e.target.value)}
                              placeholder="Buscar TX ID, Email, BIN, Últimos 4, Banco, IP..."
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            />
                            {transactionSearchQuery && (
                              <button
                                onClick={() => setTransactionSearchQuery('')}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {/* Filtro 3DS */}
                          <div>
                            <select
                              value={selected3DSFilter}
                              onChange={e => setSelected3DSFilter(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            >
                              <option value="TODOS">Todos los Protocolos 3DS</option>
                              <option value="APROBADO_SIN_FRICCIÓN">APROBADO_SIN_FRICCIÓN (Sin Desafío OTP)</option>
                              <option value="NO_ENROLADO">NO_ENROLADO (Sin Soporte 3DS 2.0)</option>
                              <option value="FALLIDO">FALLIDO (Desafío Fallido/Abandonado)</option>
                              <option value="RECHAZADO">RECHAZADO (Rechazo de Emisor)</option>
                              <option value="BYPASS_INTENT">BYPASS_INTENT (Intento Evasión API)</option>
                            </select>
                          </div>

                          {/* Filtro Banco Emisor */}
                          <div>
                            <select
                              value={selectedBankFilter}
                              onChange={e => setSelectedBankFilter(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            >
                              <option value="TODOS">Todos los Bancos Emisores</option>
                              <option value="Bancolombia">Bancolombia (22 txs - $36.8k)</option>
                              <option value="Davivienda">Davivienda (18 txs - $29.8k)</option>
                              <option value="Nu Colombia">Nu Colombia (14 txs - $22.6k)</option>
                              <option value="JPMorgan Chase">JPMorgan Chase US (9 txs - $16.8k)</option>
                              <option value="Banco de Bogotá">Banco de Bogotá (7 txs - $11.4k)</option>
                              <option value="Citibank">Citibank US (4 txs - $6.0k)</option>
                              <option value="Wells Fargo">Wells Fargo US (2 txs - $3.0k)</option>
                              <option value="Capital One">Capital One US (2 txs - $1.9k)</option>
                            </select>
                          </div>

                          {/* Filtro Canal de Pago */}
                          <div>
                            <select
                              value={selectedRailFilter}
                              onChange={e => setSelectedRailFilter(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            >
                              <option value="TODOS">Todos los Canales</option>
                              <option value="PayIn Tarjeta (CredibanCo)">PayIn Tarjeta (CredibanCo)</option>
                              <option value="Link de Cobro B2B">Link de Cobro B2B</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Tabla Interactiva de Transacciones */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-900 text-white sticky top-0 z-10 text-[11px] font-black uppercase tracking-wider">
                              <tr>
                                <th className="p-3">ID Transacción</th>
                                <th className="p-3">Fecha / Hora</th>
                                <th className="p-3">Cliente / Email</th>
                                <th className="p-3">Tarjeta & Banco</th>
                                <th className="p-3 text-right">Monto (USD / COP)</th>
                                <th className="p-3">Resultado 3DS</th>
                                <th className="p-3">Respuesta Gateway</th>
                                <th className="p-3">Patrón</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-center">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredFraudTransactions.length > 0 ? (
                                filteredFraudTransactions.map(tx => {
                                  const status3DSStyles = {
                                    'APROBADO_SIN_FRICCIÓN': 'bg-red-100 text-red-900 border-red-300 font-black',
                                    'NO_ENROLADO': 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
                                    'FALLIDO': 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
                                    'RECHAZADO': 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
                                    'BYPASS_INTENT': 'bg-purple-100 text-purple-900 border-purple-300 font-black'
                                  };

                                  return (
                                    <tr 
                                      key={tx.transactionId}
                                      onClick={() => setSelectedTransaction(tx)}
                                      className="hover:bg-red-50/40 transition cursor-pointer group"
                                    >
                                      <td className="p-3 font-mono text-[11px] font-bold text-slate-900">
                                        <div className="flex items-center gap-1.5">
                                          <Hash size={12} className="text-slate-400" />
                                          <span>{tx.transactionId}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                          {tx.externalReference}
                                        </div>
                                      </td>

                                      <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                          <Clock size={11} className="text-slate-400" />
                                          <span>{tx.timestamp}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 block mt-0.5">{tx.paymentRail}</span>
                                      </td>

                                      <td className="p-3">
                                        <div className="font-bold text-slate-900 max-w-[180px] truncate" title={tx.clientEmail}>
                                          {tx.clientEmail}
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-400">{tx.clientId}</span>
                                      </td>

                                      <td className="p-3">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono">
                                            {tx.cardBrand} •••• {tx.cardLast4}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                          BIN <span className="font-mono">{tx.cardBin}</span> — {tx.issuingBank} ({tx.cardCountry === 'Colombia' ? '🇨🇴' : '🇺🇸'})
                                        </div>
                                      </td>

                                      <td className="p-3 text-right whitespace-nowrap">
                                        <div className="font-black text-red-700 text-xs font-mono">
                                          ${tx.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                                        </div>
                                        <div className="text-[10px] text-emerald-700 font-bold font-mono mt-0.5">
                                          ${tx.amountCOP.toLocaleString('es-CO')} COP
                                        </div>
                                      </td>

                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] border inline-block ${status3DSStyles[tx.threeDSStatus]}`}>
                                          {tx.threeDSStatus}
                                        </span>
                                      </td>

                                      <td className="p-3 max-w-[200px]">
                                        <span className="text-[11px] text-slate-700 font-medium block truncate" title={tx.gatewayResponseCode}>
                                          {tx.gatewayResponseCode}
                                        </span>
                                        {tx.authCode && (
                                          <span className="text-[10px] text-slate-400 font-mono">Auth: {tx.authCode}</span>
                                        )}
                                      </td>

                                      <td className="p-3 whitespace-nowrap">
                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                                          {tx.fraudPattern}
                                        </span>
                                      </td>

                                      <td className="p-3 whitespace-nowrap">
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-black">
                                          {tx.inswitchStatus}
                                        </span>
                                      </td>

                                      <td className="p-3 text-center whitespace-nowrap">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTransaction(tx);
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 transition cursor-pointer"
                                          title="Inspeccionar Dossier Forense"
                                        >
                                          <Eye size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={10} className="p-8 text-center text-slate-500">
                                    No se encontraron transacciones con los filtros seleccionados.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VISTA 2: AUDITORÍA DE 43 CUENTAS BLOQUEADAS */}
                  {fraudSubTab === 'accounts' && (
                    <div className="space-y-4">
                      {/* Filtros de Cuentas */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                          <div className="relative flex-1 sm:w-72">
                            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              value={fraudSearchQuery}
                              onChange={e => setFraudSearchQuery(e.target.value)}
                              placeholder="Buscar por email, ID o ubicación..."
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {(['TODOS', 'FULLY_BLOCKED', 'BLOCKED'] as const).map(st => (
                              <button
                                key={st}
                                onClick={() => setFraudStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                  fraudStatusFilter === st
                                    ? 'bg-slate-900 text-white font-black'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st === 'TODOS' ? 'Todas (43)' : st === 'FULLY_BLOCKED' ? 'Fully Blocked (17)' : 'Blocked (26)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-[11px] font-bold text-slate-500">Ordenar:</span>
                          <select
                            value={fraudSortBy}
                            onChange={e => setFraudSortBy(e.target.value as any)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                          >
                            <option value="balance_desc">Mayor Saldo COP</option>
                            <option value="balance_asc">Menor Saldo COP</option>
                            <option value="transactions_desc">Más Transacciones</option>
                            <option value="email">Email Alfabético</option>
                          </select>
                        </div>
                      </div>

                      {/* Tabla de 43 Cuentas Auditadas */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-900 text-white sticky top-0 z-10 text-[11px] font-black uppercase tracking-wider">
                              <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Email Usuario</th>
                                <th className="p-3">Registro</th>
                                <th className="p-3 text-center">In Inswitch</th>
                                <th className="p-3 text-center">Txs</th>
                                <th className="p-3 text-right">Monto Acumulado (USD / COP)</th>
                                <th className="p-3 text-right">Saldo Retenido Wallet</th>
                                <th className="p-3">Estado Bloqueo</th>
                                <th className="p-3">Patrón & Ubicación</th>
                                <th className="p-3 text-center">Dossier</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredFraudClients.map(c => (
                                <tr 
                                  key={c.id}
                                  onClick={() => setSelectedClientForModal(c)}
                                  className="hover:bg-amber-50/40 transition cursor-pointer"
                                >
                                  <td className="p-3 font-mono font-bold text-slate-900">{c.id}</td>
                                  <td className="p-3 font-bold text-slate-800 max-w-[200px] truncate" title={c.clientEmail}>
                                    {c.clientEmail}
                                  </td>
                                  <td className="p-3 text-slate-500 text-[11px] font-mono whitespace-nowrap">{c.registrationDate}</td>
                                  <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                      {c.hadInswitchIn}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-bold font-mono text-slate-900">{c.transactionCount}</td>
                                  <td className="p-3 text-right font-mono whitespace-nowrap">
                                    <span className="font-black text-red-700 block">{c.transactionValue}</span>
                                  </td>
                                  <td className="p-3 text-right font-mono whitespace-nowrap">
                                    <span className="font-black text-emerald-700 block">${c.currentBalanceFormatted} COP</span>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      ~${((c.currentBalanceCOP || 0) / 4200).toFixed(2)} USD
                                    </span>
                                  </td>
                                  <td className="p-3 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      c.status === 'FULLY_BLOCKED'
                                        ? 'bg-red-100 text-red-900 border border-red-300'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                                    }`}>
                                      {c.status}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{c.blockDate}</span>
                                  </td>
                                  <td className="p-3 text-[11px]">
                                    <div className="font-bold text-slate-800">{c.fraudPattern || 'Anomalía'}</div>
                                    <div className="text-[10px] text-slate-400">{c.ipOrigin}</div>
                                  </td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClientForModal(c);
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-700 transition cursor-pointer"
                                    >
                                      <Eye size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VISTA 3: ANÁLISIS DE BANCOS, 3DS Y VECTORES */}
                  {fraudSubTab === 'analytics' && (
                    <div className="space-y-6">
                      
                      {/* Grid de Desglose */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* 1. Bancos Emisores Vulnerados */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                              <Landmark size={15} className="text-blue-600" />
                              Distribución por Banco Emisor de la Tarjeta (54 BINs)
                            </h4>
                            <span className="text-[11px] font-bold text-slate-400">Total: $128,598 USD</span>
                          </div>

                          <div className="space-y-3">
                            {FRAUDULENT_TRANSACTION_SUMMARY.bankDistribution.map((b, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-800">{b.bank}</span>
                                  <span className="font-mono text-slate-600">
                                    <strong className="text-red-700">${b.amountUSD.toLocaleString()} USD</strong> ({b.count} txs • {b.percentage})
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: b.percentage }} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Resultados del Protocolo 3DS */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                              <Lock size={15} className="text-red-600" />
                              Vulnerabilidad 3DS Explotada en Inswitch
                            </h4>
                            <span className="text-[11px] font-bold text-slate-400">78 Intentos</span>
                          </div>

                          <div className="space-y-3">
                            {FRAUDULENT_TRANSACTION_SUMMARY.threeDSDistribution.map((tds, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-black text-slate-900 font-mono">{tds.status}</span>
                                  <span className="font-mono text-red-700 font-black">{tds.count} txs ({tds.percentage})</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">{tds.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cronología del Ataque */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                          <Clock size={15} className="text-amber-600" />
                          Cronología de los 3 Días del Ataque Transaccional
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-slate-800">Día 1: 30-Sep-2026</span>
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">16 Txs</span>
                            </div>
                            <div className="text-lg font-black text-slate-900 font-mono">$26,800 USD</div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Primeras ráfagas de prueba (card testing) canalizadas por CredibanCo. Cuentas como espinayuchichi@gmail.com ejecutan múltiples transacciones con BINs de Bancolombia y Chase.
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-red-900">Día 2: 01-Oct-2026</span>
                              <span className="px-2 py-0.5 rounded bg-red-200 text-red-900 font-mono font-bold text-[10px]">36 Txs</span>
                            </div>
                            <div className="text-lg font-black text-red-900 font-mono">$58,950 USD</div>
                            <p className="text-[11px] text-red-800 leading-relaxed">
                              Intensificación del ataque automatizado. Múltiples cuentas creadas en 24h intentan cobros simultáneos aprovechando tarjetas extranjeras sin 3DS 2.0 y links de cobro B2B.
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-amber-950">Día 3: 02-Oct-2026</span>
                              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-mono font-bold text-[10px]">26 Txs</span>
                            </div>
                            <div className="text-lg font-black text-amber-950 font-mono">$42,848 USD</div>
                            <p className="text-[11px] text-amber-900 leading-relaxed">
                              Inswitch notifica hold cautelar total a las 14:37. Global66 procede al apagado inmediato del producto y bloqueo preventivo de 43 cuentas sospechosas antes de nuevas extracciones.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vinculación a Planes de Acción */}
                      <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-blue-500/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-blue-200">
                            Planes de Mitigación Integrados para Inswitch
                          </h4>
                          <p className="text-xs text-slate-300">
                            Las 78 transacciones sustentan la auditoría tripartita en curso (ACT-EVT-01) y la renegociación contractual de fondos de reserva y liquidación (ACT-EVT-02).
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab('plans')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition cursor-pointer shrink-0"
                        >
                          Ver Planes de Acción (4)
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <AlertOctagon size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">Selecciona un evento de la lista izquierda para auditar sus detalles.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: GENERAR PLAN DE ACCIÓN PARA EL EVENTO */}
      {isNewPlanModalOpen && currentEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsNewPlanModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                Generar Plan de Acción para Evento
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Plan de Mitigación: {currentEvent.code}
              </h3>
              <p className="text-xs text-slate-500">
                Evento asociado: {currentEvent.title}
              </p>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título del Plan de Acción *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Auditoría Forense y Levantamiento de Medidas Antifraude..."
                  value={planFormData.title}
                  onChange={e => setPlanFormData({ ...planFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Acción Inmediata Correctiva *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Acción inmediata para contener el impacto..."
                    value={planFormData.immediateAction}
                    onChange={e => setPlanFormData({ ...planFormData, immediateAction: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Acción Preventiva de Largo Plazo *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Salvaguarda estructural para impedir recurrencia..."
                    value={planFormData.longTermPreventativeAction}
                    onChange={e => setPlanFormData({ ...planFormData, longTermPreventativeAction: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del líder"
                    value={planFormData.responsible}
                    onChange={e => setPlanFormData({ ...planFormData, responsible: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol / Cargo</label>
                  <input
                    type="text"
                    placeholder="ej. Head of Fraud / Tech Lead"
                    value={planFormData.responsibleRole}
                    onChange={e => setPlanFormData({ ...planFormData, responsibleRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Límite *</label>
                  <input
                    type="date"
                    required
                    value={planFormData.targetDate}
                    onChange={e => setPlanFormData({ ...planFormData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marco Regulatorio</label>
                  <select
                    value={planFormData.framework}
                    onChange={e => setPlanFormData({ ...planFormData, framework: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white font-bold cursor-pointer"
                  >
                    <option value="Fraude">Fraude</option>
                    <option value="SARO">SARO (SFC Colombia)</option>
                    <option value="CMF">CMF (Chile)</option>
                    <option value="Continuidad">Continuidad de Negocio</option>
                    <option value="ISO 31000">ISO 31000</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Presupuesto Estimado</label>
                  <input
                    type="text"
                    placeholder="ej. 10,000 USD / Recursos internos"
                    value={planFormData.budgetUSD}
                    onChange={e => setPlanFormData({ ...planFormData, budgetUSD: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black cursor-pointer shadow-sm"
                >
                  Guardar Plan de Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOSSIER FORENSE DE TRANSACCIÓN */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                Auditoría Transaccional Individual • CredibanCo & Inswitch
              </span>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Dossier Forense:</span>
                <span className="font-mono text-red-700">{selectedTransaction.transactionId}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Referencia externa de pasarela: <span className="font-mono font-bold text-slate-700">{selectedTransaction.externalReference}</span>
              </p>
            </div>

            {/* Badges de Estado */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-900 font-black text-xs border border-red-300">
                {selectedTransaction.inswitchStatus}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 font-mono">
                3DS: {selectedTransaction.threeDSStatus}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                {selectedTransaction.fraudPattern}
              </span>
            </div>

            {/* Grid de Datos Técnicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Monto Transaccionado:</span>
                <span className="text-base font-black text-red-700 font-mono block mt-0.5">
                  ${selectedTransaction.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
                <span className="text-[11px] text-emerald-700 font-bold font-mono">
                  ${selectedTransaction.amountCOP.toLocaleString('es-CO')} COP (TRM $4.200)
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Fecha y Hora Registro:</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">{selectedTransaction.timestamp}</span>
                <span className="text-[10px] text-slate-500">{selectedTransaction.paymentRail}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Usuario Afectado:</span>
                <span className="font-bold text-slate-900 block mt-0.5 truncate" title={selectedTransaction.clientEmail}>
                  {selectedTransaction.clientEmail}
                </span>
                <span className="text-[10px] font-mono text-slate-500">ID Cliente: {selectedTransaction.clientId}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Tarjeta & Banco Emisor:</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {selectedTransaction.cardBrand} •••• {selectedTransaction.cardLast4} (BIN {selectedTransaction.cardBin})
                </span>
                <span className="text-[11px] text-slate-600 font-medium">
                  {selectedTransaction.issuingBank} ({selectedTransaction.cardCountry})
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Respuesta de Pasarela:</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedTransaction.gatewayResponseCode}</span>
                {selectedTransaction.authCode && (
                  <span className="text-[10px] font-mono text-slate-500">Código Auth: {selectedTransaction.authCode}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Velocidad / Reintentos:</span>
                <span className="font-bold text-red-600 block mt-0.5 font-mono">
                  {selectedTransaction.velocityAttemptsInHour} intentos en la misma hora
                </span>
                <span className="text-[10px] text-slate-500">Patrón de ráfaga automatizada</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Dirección IP y Geolocalización:</span>
                <span className="font-mono font-bold text-slate-800 block mt-0.5">{selectedTransaction.ipAddress}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Device Fingerprint:</span>
                <span className="font-mono text-[11px] text-slate-700 block mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                  {selectedTransaction.deviceFingerprint}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Evidencia requerida para el Reporte de Incidentes CMF (NCG 464) y SFC (Circular 029).
              </span>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOSSIER FORENSE DE CLIENTE BLOQUEADO */}
      {selectedClientForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedClientForModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                Auditoría de Cuenta de Usuario • Prevención de Fraude
              </span>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Cuenta:</span>
                <span className="font-mono text-slate-800 text-base">{selectedClientForModal.clientEmail}</span>
              </h3>
              <p className="text-xs text-slate-500">
                ID de Registro: <span className="font-mono font-bold text-slate-700">{selectedClientForModal.id}</span> • Registro: {selectedClientForModal.registrationDate}
              </p>
            </div>

            {/* Badges de Estado */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                selectedClientForModal.status === 'FULLY_BLOCKED'
                  ? 'bg-red-100 text-red-900 border border-red-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Estado: {selectedClientForModal.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                Bloqueado: {selectedClientForModal.blockDate}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                Inswitch In: {selectedClientForModal.hadInswitchIn}
              </span>
            </div>

            {/* Grid de Información */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Saldo Remanente Congelado en Wallet Global66:</span>
                <span className="font-black text-emerald-700 text-sm font-mono">
                  ${selectedClientForModal.currentBalanceFormatted} COP (~${((selectedClientForModal.currentBalanceCOP || 0) / 4200).toFixed(2)} USD)
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Transacciones Fraudulentas Ejecutadas:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{selectedClientForModal.transactionCount} intentos</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Monto Acumulado en Inswitch:</span>
                <span className="font-black text-red-700 font-mono">{selectedClientForModal.transactionValue}</span>
              </div>

              <div className="py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">BINs de Tarjeta Vinculados:</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedClientForModal.associatedCardBins || []).map((bin, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono font-bold text-[11px] text-slate-800">
                      {bin}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Patrón Forense:</span>
                <span className="font-bold text-amber-800">{selectedClientForModal.fraudPattern || 'Anomalía multicard'}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 font-bold">Ubicación IP Reportada:</span>
                <span className="font-mono text-slate-800">{selectedClientForModal.ipOrigin || 'Colombia'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Fondos congelados preventivamente conforme a políticas antifraude de Global66.
              </span>
              <button
                onClick={() => setSelectedClientForModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

