import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  Shield, 
  FileText, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Coins,
  HeartHandshake,
  Users,
  BadgeDollarSign,
  Package,
  Scale,
  Compass,
  CheckSquare2,
  FileCheck,
  CreditCard,
  Landmark,
  Crown,
  ExternalLink,
  BookOpen,
  Info,
  SlidersHorizontal,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  GLOBAL66_PROCESS_TAXONOMY, 
  RegionalProcessDefinition, 
  ProcessMacroCategory,
  CompanyScopeId,
  CompanyProcessRoleType,
  Risk 
} from '../types';

interface RegionalProcessArchitectureViewProps {
  risks?: Risk[];
  onSelectProcessToDocument?: (processDef: RegionalProcessDefinition, companyScope?: CompanyScopeId) => void;
  onFilterRisksByProcess?: (processArea: string, companyScope?: CompanyScopeId, taxonomyProcessId?: number) => void;
  onNavigateToRepository?: (companyScope?: CompanyScopeId, taxonomyProcessId?: number) => void;
}

// METADATA DE LAS EMPRESAS
export const COMPANY_PROFILES: Record<CompanyScopeId, {
  id: CompanyScopeId;
  name: string;
  shortName: string;
  legalEntity: string;
  country: string;
  flag: string;
  regulator: string;
  normativeBase: string;
  roleInGroup: string;
  primaryColor: string;
  badgeBg: string;
  icon: React.ReactNode;
  description: string;
}> = {
  REGIONAL: {
    id: 'REGIONAL',
    name: 'Mapa Regional Consolidado',
    shortName: 'Regional Holding',
    legalEntity: 'Global66 Regional Holding & Filiales Latam',
    country: 'América Latina',
    flag: '🌎',
    regulator: 'Gobierno Corporativo Regional & Directorio Holding',
    normativeBase: 'ISO 31000:2018, APQC Process Classification Framework & ROAM',
    roleInGroup: 'Visión consolidada multi-entidad que unifica los 14 macroprocesos en todas las filiales.',
    primaryColor: '#102A97',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: <Layers size={20} className="text-[#102A97]" />,
    description: 'Arquitectura transversal de procesos de negocio, gobierno corporativo, control interno y líneas de defensa para todas las operaciones en Chile, Colombia, Perú, Argentina y Estados Unidos.'
  },
  CARD: {
    id: 'CARD',
    name: 'Global Card (Chile)',
    shortName: 'Global Card S.A.',
    legalEntity: 'Global Card S.A. Emisora de Tarjetas de Pago',
    country: 'Chile',
    flag: '🇨🇱',
    regulator: 'Comisión para el Mercado Financiero (CMF)',
    normativeBase: 'NCG 464, RAN 20-10, Cap. III.J.1 Banco Central & Ley FinTech 21.521',
    roleInGroup: 'Emisión y operación de tarjetas de pago con provisión de fondos en Chile.',
    primaryColor: '#00B582',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CreditCard size={20} className="text-[#00B582]" />,
    description: 'Entidad financiera fiscalizada por la CMF. Dueña directa del proceso de Gestión Regulatoria (#3) y ejecutora local de SARO, Ciberseguridad RAN 20-10, tesorería de saldos en salvaguarda y contratos locales.'
  },
  SEDPE: {
    id: 'SEDPE',
    name: 'SEDPE / Global Colombia S.A.',
    shortName: 'Global66 Colombia SEDPE',
    legalEntity: 'Global66 Colombia S.A.S. SEDPE',
    country: 'Colombia',
    flag: '🇨🇴',
    regulator: 'Superintendencia Financiera de Colombia (SFC)',
    normativeBase: 'Circular Externa 029/2014 (SARO), Ley 1735, Decreto 1491 & Circular 007',
    roleInGroup: 'Sociedad Especializada en Depósitos y Pagos Electrónicos vigilada por la SFC.',
    primaryColor: '#F49A24',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <Landmark size={20} className="text-[#F49A24]" />,
    description: 'Entidad de mayor profundidad operativa y documental (#7): conciliación bancaria diaria, compensación de depósitos electrónicos, mesa de dinero, calce de liquidez (SARL), SAC formal y Defensor del Consumidor Financiero.'
  },
  SPA: {
    id: 'SPA',
    name: 'Global 81 SpA (Chile Hub)',
    shortName: 'Global 81 SpA Hub',
    legalEntity: 'Global 81 SpA (Casa Matriz & Hub Regional de Servicios Compartidos)',
    country: 'Chile (Hub)',
    flag: '🏢',
    regulator: 'UAF Chile, Banco Central de Chile & Directorio Global',
    normativeBase: 'Marco Corporativo de Grupo, Políticas Maestras IFRS & ISO 27001',
    roleInGroup: 'Casa matriz proveedora de servicios tecnológicos, diseño de producto y tesorería central.',
    primaryColor: '#6366F1',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    icon: <Building2 size={20} className="text-indigo-600" />,
    description: 'Hub de servicios compartidos y dueña transversal de Estrategia (#1), Producto (#4), Growth/Data (#5), Infraestructura Tecnológica (#6), Tesorería Central (#7), Legal Corporativo (#12) y Auditoría (#14).'
  }
};

export const RegionalProcessArchitectureView: React.FC<RegionalProcessArchitectureViewProps> = ({
  risks = [],
  onSelectProcessToDocument,
  onFilterRisksByProcess,
  onNavigateToRepository
}) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyScopeId>('REGIONAL');
  const [selectedMacrocategory, setSelectedMacrocategory] = useState<string>('TODAS');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'TODOS' | CompanyProcessRoleType>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProcessId, setActiveProcessId] = useState<number>(7); // Default a Operaciones y Tesorería
  const [quickViewMode, setQuickViewMode] = useState<'grid' | 'detailed'>('detailed');

  const currentCompany = COMPANY_PROFILES[selectedCompany];

  // Helper para obtener icono según ID de proceso
  const getProcessIcon = (id: number) => {
    switch (id) {
      case 1: return <Compass className="text-blue-500" size={18} />;
      case 2: return <Shield className="text-emerald-500" size={18} />;
      case 3: return <Scale className="text-purple-500" size={18} />;
      case 4: return <Package className="text-amber-500" size={18} />;
      case 5: return <TrendingUp className="text-indigo-500" size={18} />;
      case 6: return <Cpu className="text-cyan-500" size={18} />;
      case 7: return <Coins className="text-emerald-600" size={18} />;
      case 8: return <HeartHandshake className="text-rose-500" size={18} />;
      case 9: return <Users className="text-blue-600" size={18} />;
      case 10: return <BadgeDollarSign className="text-amber-600" size={18} />;
      case 11: return <Layers className="text-orange-500" size={18} />;
      case 12: return <Scale className="text-slate-600" size={18} />;
      case 13: return <TrendingUp className="text-teal-500" size={18} />;
      case 14: return <CheckSquare2 className="text-violet-600" size={18} />;
      default: return <FileText className="text-slate-500" size={18} />;
    }
  };

  // Helper de badges para Macrocategorías
  const getMacroBadgeColor = (macro: ProcessMacroCategory) => {
    switch (macro) {
      case 'Estratégicos':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Misionales':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'De Apoyo':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Evaluación Independiente':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper de badge según el rol de la empresa en el proceso
  const getRoleBadge = (roleType?: CompanyProcessRoleType) => {
    switch (roleType) {
      case 'DUENO':
        return {
          label: '👑 Dueño Corporativo',
          className: 'bg-purple-100 text-purple-800 border-purple-300 font-black',
          dot: 'bg-purple-600'
        };
      case 'EJECUTA_LOCAL':
        return {
          label: '⚙️ Ejecuta Localmente',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
          dot: 'bg-emerald-600'
        };
      case 'CONSUME_SERVICIO':
        return {
          label: '🔌 Consume Servicio Central',
          className: 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold',
          dot: 'bg-blue-600'
        };
      case 'APLICA_PROPIO':
        return {
          label: '🛡️ Aplica Régimen Propio',
          className: 'bg-teal-100 text-teal-800 border-teal-300 font-black',
          dot: 'bg-teal-600'
        };
      case 'NO_FORMALIZADO':
        return {
          label: '⚠️ Brecha / No Formalizado',
          className: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
          dot: 'bg-amber-600'
        };
      default:
        return {
          label: 'Definido en Matriz',
          className: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
          dot: 'bg-slate-500'
        };
    }
  };

  // Obtener rol específico para la empresa seleccionada
  const getProcessRoleForCompany = (proc: RegionalProcessDefinition, company: CompanyScopeId) => {
    if (company === 'REGIONAL') {
      return {
        roleType: 'DUENO' as CompanyProcessRoleType,
        roleLabel: 'Consolidado Regional',
        scopeDescription: `G81 Hub: ${proc.global81Hub} | Card: ${proc.globalCardChile} | SEDPE: ${proc.sedpeColombia}`,
        regulatorScope: proc.notes || 'Marco de Grupo',
        isGap: proc.notes?.includes('APQC') || false
      };
    }
    if (proc.companyRoles && proc.companyRoles[company]) {
      return proc.companyRoles[company];
    }
    // Fallback descriptivo
    let text = proc.global81Hub;
    if (company === 'CARD') text = proc.globalCardChile;
    if (company === 'SEDPE') text = proc.sedpeColombia;

    let roleType: CompanyProcessRoleType = 'EJECUTA_LOCAL';
    if (text.toLowerCase().includes('dueño')) roleType = 'DUENO';
    else if (text.toLowerCase().includes('consume')) roleType = 'CONSUME_SERVICIO';
    else if (text.toLowerCase().includes('aplica')) roleType = 'APLICA_PROPIO';
    else if (text.toLowerCase().includes('no formalizado')) roleType = 'NO_FORMALIZADO';

    return {
      roleType,
      roleLabel: text,
      scopeDescription: text,
      regulatorScope: proc.notes || 'Regulación local',
      isGap: text.toLowerCase().includes('no formalizado')
    };
  };

  // Filtrado reactivo de procesos
  const filteredProcesses = useMemo(() => {
    return GLOBAL66_PROCESS_TAXONOMY.filter(proc => {
      const matchMacro = selectedMacrocategory === 'TODAS' || proc.macrocategory === selectedMacrocategory;
      
      const roleInfo = getProcessRoleForCompany(proc, selectedCompany);
      const matchRole = selectedRoleFilter === 'TODOS' || roleInfo.roleType === selectedRoleFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        proc.categoryLevel1.toLowerCase().includes(q) ||
        proc.processGroupLevel2.toLowerCase().includes(q) ||
        roleInfo.scopeDescription.toLowerCase().includes(q) ||
        (proc.notes && proc.notes.toLowerCase().includes(q));

      return matchMacro && matchRole && matchSearch;
    });
  }, [selectedMacrocategory, selectedRoleFilter, searchQuery, selectedCompany]);

  // Proceso actualmente enfocado
  const selectedProcess = useMemo(() => {
    return GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === activeProcessId) || GLOBAL66_PROCESS_TAXONOMY[6];
  }, [activeProcessId]);

  const selectedProcessRole = useMemo(() => {
    return getProcessRoleForCompany(selectedProcess, selectedCompany);
  }, [selectedProcess, selectedCompany]);

  // Métricas de la empresa seleccionada
  const companyMetrics = useMemo(() => {
    let duenoCount = 0;
    let ejecutaCount = 0;
    let consumeCount = 0;
    let propioCount = 0;
    let gapCount = 0;
    let totalSubprocesses = 0;

    GLOBAL66_PROCESS_TAXONOMY.forEach(proc => {
      const role = getProcessRoleForCompany(proc, selectedCompany);
      if (role.roleType === 'DUENO') duenoCount++;
      else if (role.roleType === 'EJECUTA_LOCAL') ejecutaCount++;
      else if (role.roleType === 'CONSUME_SERVICIO') consumeCount++;
      else if (role.roleType === 'APLICA_PROPIO') propioCount++;
      else if (role.roleType === 'NO_FORMALIZADO') gapCount++;

      const subpList = proc.processGroupLevel2.split(';').map(s => s.trim()).filter(Boolean);
      totalSubprocesses += subpList.length;
    });

    return {
      duenoCount,
      ejecutaCount,
      consumeCount,
      propioCount,
      gapCount,
      totalSubprocesses
    };
  }, [selectedCompany]);

  // EXPORTAR A EXCEL / CSV
  const handleExportToCSV = () => {
    const headers = [
      'ID Proceso',
      'Macrocategoría',
      'Nivel 1 (Categoría Regional)',
      'Nivel 2 (Grupos de Proceso)',
      'Empresa Seleccionada',
      'Rol de la Empresa',
      'Alcance Operativo Local',
      'Marco Regulatorio Aplicable',
      'Global 81 SpA (Hub)',
      'Global Card (Chile)',
      'SEDPE (Colombia)',
      'Notas / Brechas APQC'
    ];

    const rows = GLOBAL66_PROCESS_TAXONOMY.map(proc => {
      const role = getProcessRoleForCompany(proc, selectedCompany);
      return [
        proc.id,
        proc.macrocategory,
        `"${proc.categoryLevel1.replace(/"/g, '""')}"`,
        `"${proc.processGroupLevel2.replace(/"/g, '""')}"`,
        `"${currentCompany.name}"`,
        `"${role.roleLabel}"`,
        `"${role.scopeDescription.replace(/"/g, '""')}"`,
        `"${(role.regulatorScope || '-').replace(/"/g, '""')}"`,
        `"${proc.global81Hub.replace(/"/g, '""')}"`,
        `"${proc.globalCardChile.replace(/"/g, '""')}"`,
        `"${proc.sedpeColombia.replace(/"/g, '""')}"`,
        `"${(proc.notes || '-').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mapa_Procesos_${selectedCompany}_Global66.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* SELECTOR MAESTRO DE EMPRESA / ALCANCE */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 size={13} className="text-[#102A97]" />
              <span>Seleccione la Empresa para el Mapa de Procesos:</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
            Base para Gestión de Riesgos & Repositorio Documental
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {(['REGIONAL', 'CARD', 'SEDPE', 'SPA'] as CompanyScopeId[]).map((companyId) => {
            const comp = COMPANY_PROFILES[companyId];
            const isSelected = selectedCompany === companyId;

            return (
              <button
                key={companyId}
                onClick={() => {
                  setSelectedCompany(companyId);
                  setSelectedRoleFilter('TODOS');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/15 ring-2 ring-[#102A97]'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
                id={`btn_company_scope_${companyId.toLowerCase()}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{comp.flag}</span>
                    <span className="text-xs font-black leading-tight">
                      {comp.shortName}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {comp.regulator}
                  </p>
                  <p className={`text-[9px] font-semibold truncate ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {companyId === 'REGIONAL' ? '14 Procesos Consolidados' : comp.legalEntity}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BANNER CORPORATIVO DE LA EMPRESA SELECCIONADA */}
      <div className="bg-gradient-to-r from-slate-900 via-[#102A97] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#3F5EDF]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-slate-950 flex items-center gap-1.5 shadow-sm">
                  <span>{currentCompany.flag}</span>
                  <span>{currentCompany.name}</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-100 border border-white/15">
                  Supervisado por: {currentCompany.regulator}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {currentCompany.normativeBase}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Mapa de Procesos: {currentCompany.shortName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
                {currentCompany.description}
              </p>
            </div>

            {/* BOTÓN EXPORTAR */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={handleExportToCSV}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-black flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
                title="Descargar este mapa en formato Excel / CSV"
                id="btn_export_company_map"
              >
                <Download size={14} />
                <span>Exportar Mapa (Excel)</span>
              </button>
            </div>
          </div>

          {/* BARRA DE MÉTRICAS OPERATIVAS Y ROLES DE ESTA EMPRESA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 border-t border-white/15">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-blue-200 block uppercase">Total Procesos</span>
              <span className="text-xl font-black text-white">14</span>
              <span className="text-[9px] text-blue-300 font-semibold block">Taxonomía Matriz</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-purple-300 block uppercase">👑 Dueño / Diseña</span>
              <span className="text-xl font-black text-purple-300">{companyMetrics.duenoCount}</span>
              <span className="text-[9px] text-purple-200 font-semibold block">Liderazgo Corporativo</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase">⚙️ Ejecuta Local</span>
              <span className="text-xl font-black text-emerald-300">{companyMetrics.ejecutaCount + companyMetrics.propioCount}</span>
              <span className="text-[9px] text-emerald-200 font-semibold block">Operación & Regulación</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-cyan-300 block uppercase">🔌 Consume Servicio</span>
              <span className="text-xl font-black text-cyan-300">{companyMetrics.consumeCount}</span>
              <span className="text-[9px] text-cyan-200 font-semibold block">Core / Infraestructura</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-amber-300 block uppercase">⚠️ Brechas APQC</span>
              <span className="text-xl font-black text-amber-300">{companyMetrics.gapCount}</span>
              <span className="text-[9px] text-amber-200 font-semibold block">10.0 y 13.0 Por Formalizar</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-teal-300 block uppercase">🏛️ Subprocesos N2</span>
              <span className="text-xl font-black text-teal-300">{companyMetrics.totalSubprocesses}</span>
              <span className="text-[9px] text-teal-200 font-semibold block">Catálogo Estandarizado</span>
            </div>
          </div>

          {/* FILTROS SECUNDARIOS (MACROCATEGORÍAS & ROLES) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-white/15">
            {/* MACROCATEGORÍAS TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['TODAS', 'Estratégicos', 'Misionales', 'De Apoyo', 'Evaluación Independiente'].map((macro) => (
                <button
                  key={macro}
                  onClick={() => setSelectedMacrocategory(macro)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedMacrocategory === macro
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'bg-white/10 text-blue-100 hover:bg-white/15'
                  }`}
                >
                  {macro === 'TODAS' ? 'Todos (14)' : macro}
                </button>
              ))}
            </div>

            {/* BUSCADOR */}
            <div className="relative min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder={`Buscar en mapa de ${currentCompany.shortName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VISTA PRINCIPAL: LISTADO DEL MAPA DE PROCESOS + DETALLE OPERATIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LISTADO DE PROCESOS ADAPTADO A LA EMPRESA SELECCIONADA */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Procesos de {currentCompany.shortName} ({filteredProcesses.length} de 14)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Filtro Rol:
              </span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                className="text-xs font-bold py-1 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none"
              >
                <option value="TODOS">Todos los roles</option>
                <option value="DUENO">Dueño Corporativo</option>
                <option value="EJECUTA_LOCAL">Ejecuta Localmente</option>
                <option value="CONSUME_SERVICIO">Consume Servicio</option>
                <option value="APLICA_PROPIO">Aplica Régimen Propio</option>
                <option value="NO_FORMALIZADO">Brechas / No Formalizado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredProcesses.map((proc) => {
              const isSelected = activeProcessId === proc.id;
              const roleInfo = getProcessRoleForCompany(proc, selectedCompany);
              const badge = getRoleBadge(roleInfo.roleType);

              return (
                <div
                  key={proc.id}
                  onClick={() => setActiveProcessId(proc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#102A97] shadow-md ring-2 ring-[#102A97]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                  id={`process_card_${proc.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        {getProcessIcon(proc.id)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{proc.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMacroBadgeColor(proc.macrocategory)}`}>
                            {proc.macrocategory}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {proc.categoryLevel1}
                        </h3>

                        {/* DESCRIPCIÓN ESPECÍFICA PARA LA EMPRESA SELECCIONADA */}
                        <p className="text-xs text-slate-800 font-semibold leading-relaxed bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                          <strong className="text-[#102A97] font-black">Rol {currentCompany.shortName}: </strong>
                          {roleInfo.scopeDescription}
                        </p>

                        <p className="text-[11px] text-slate-500 font-medium">
                          <span className="font-bold text-slate-600">Subprocesos (N2): </span>
                          {proc.processGroupLevel2}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {proc.processGroupLevel2.split(';').length} subprocesos
                      </span>
                      <ChevronRight size={16} className={`transition-transform ${isSelected ? 'text-[#102A97] translate-x-1' : 'text-slate-300'}`} />
                    </div>
                  </div>

                  {/* VISIÓN COMPARATIVA MULTI-EMPRESA (SI ESTAMOS EN MAPA REGIONAL) */}
                  {selectedCompany === 'REGIONAL' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-blue-700 block uppercase">Global 81 SpA</span>
                        <p className="text-slate-700 font-semibold truncate" title={proc.global81Hub}>
                          {proc.global81Hub}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-emerald-700 block uppercase">Global Card (CL)</span>
                        <p className="text-slate-700 font-semibold truncate" title={proc.globalCardChile}>
                          {proc.globalCardChile}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-amber-700 block uppercase">SEDPE (Colombia)</span>
                        <p className="text-slate-700 font-semibold truncate" title={proc.sedpeColombia}>
                          {proc.sedpeColombia}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DETALLE PROFUNDO DEL PROCESO SELECCIONADO & ACCIONES DIRECTAS */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            {/* ENCABEZADO DEL DETALLE */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getMacroBadgeColor(selectedProcess.macrocategory)}`}>
                  {selectedProcess.macrocategory}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Categoría Regional #{selectedProcess.id}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${getRoleBadge(selectedProcessRole.roleType).className}`}>
                  {getRoleBadge(selectedProcessRole.roleType).label}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {selectedProcess.categoryLevel1}
              </h2>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Grupos de Proceso (Nivel 2)
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {selectedProcess.processGroupLevel2}
                </p>
              </div>
            </div>

            {/* SECCIÓN ESPECÍFICA: DETALLE PARA LA EMPRESA SELECCIONADA */}
            <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#102A97]" />
                  <span>Alcance en {currentCompany.shortName}</span>
                </span>
                <span className="text-[10px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {currentCompany.flag} {currentCompany.country}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                {selectedProcessRole.scopeDescription}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500 font-bold">Regulador competente:</span>
                <span className="font-black text-[#102A97]">{currentCompany.regulator}</span>
              </div>
            </div>

            {/* SECCIÓN MULTI-FILIAL: MAPEO EN LAS OTRAS EMPRESAS DEL GRUPO */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Gobernanza Cruzada en las Entidades del Grupo
              </span>

              {/* GLOBAL 81 SPA (CHILE - HUB) */}
              <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${selectedCompany === 'SPA' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">🏢 Global 81 SpA (Chile Hub)</span>
                  <span className="text-[9px] font-bold text-slate-500">Matriz & Central</span>
                </div>
                <p className="text-slate-700 font-semibold">{selectedProcess.global81Hub}</p>
              </div>

              {/* GLOBAL CARD (CHILE) */}
              <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${selectedCompany === 'CARD' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-300' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">💳 Global Card (Chile)</span>
                  <span className="text-[9px] font-bold text-slate-500">Emisor Prepago CMF</span>
                </div>
                <p className="text-slate-700 font-semibold">{selectedProcess.globalCardChile}</p>
              </div>

              {/* SEDPE / GLOBAL COLOMBIA S.A. */}
              <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${selectedCompany === 'SEDPE' ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-300' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">🏦 SEDPE / Colombia</span>
                  <span className="text-[9px] font-bold text-slate-500">Regulada SFC</span>
                </div>
                <p className="text-slate-700 font-semibold">{selectedProcess.sedpeColombia}</p>
              </div>
            </div>

            {/* NOTAS Y BRECHAS APQC */}
            {selectedProcess.notes && selectedProcess.notes !== '-' && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-amber-950 block text-[11px] uppercase">Nota Arquitectura & Brecha:</span>
                  <span>{selectedProcess.notes}</span>
                </div>
              </div>
            )}

            {/* ACCIONES INTEGRADAS CON RIESGOS Y REPOSITORIO */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {/* ACCIÓN 1: DOCUMENTAR EN EL GOBERNADOR */}
              {onSelectProcessToDocument && (
                <button
                  onClick={() => onSelectProcessToDocument(selectedProcess, selectedCompany)}
                  className="w-full py-3 px-4 rounded-xl bg-[#102A97] hover:bg-[#3F5EDF] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
                  id="btn_doc_process_with_ai"
                >
                  <Sparkles size={15} className="text-amber-300" />
                  <span>Documentar con IA para {currentCompany.shortName}</span>
                </button>
              )}

              {/* ACCIÓN 2: REPOSITORIO DOCUMENTAL */}
              {onNavigateToRepository && (
                <button
                  onClick={() => onNavigateToRepository(selectedCompany, selectedProcess.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#102A97] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-200"
                  id="btn_view_repo_docs_for_process"
                >
                  <FolderOpen size={14} className="text-[#102A97]" />
                  <span>Explorar Documentos en Repositorio Master</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
