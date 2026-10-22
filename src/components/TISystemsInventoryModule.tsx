import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Globe, 
  Cpu, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Shield, 
  Key, 
  Download, 
  X, 
  UserCheck, 
  DollarSign, 
  Building, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Lock,
  Layers2,
  HardDrive,
  UserX,
  FileSpreadsheet
} from 'lucide-react';
import { 
  SystemInventoryItem, 
  SystemCategoryType, 
  SystemRiskLevel, 
  SystemStatus, 
  RAW_SYSTEMS_INVENTORY 
} from '../data/systemsInventoryData';

interface TISystemsInventoryModuleProps {
  onLinkToRisk?: (systemName: string) => void;
}

export const TISystemsInventoryModule: React.FC<TISystemsInventoryModuleProps> = ({
  onLinkToRisk
}) => {
  // Systems state with local persistence
  const [systems, setSystems] = useState<SystemInventoryItem[]>(() => {
    const saved = localStorage.getItem('g66_systems_inventory_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return RAW_SYSTEMS_INVENTORY;
  });

  // Save changes
  React.useEffect(() => {
    localStorage.setItem('g66_systems_inventory_v1', JSON.stringify(systems));
  }, [systems]);

  // View state
  const [selectedTypeTab, setSelectedTypeTab] = useState<'TODOS' | SystemCategoryType>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'TODOS' | SystemRiskLevel>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | SystemStatus>('TODOS');
  const [selectedAccessOwnerFilter, setSelectedAccessOwnerFilter] = useState('TODOS');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [selectedSystemDetail, setSelectedSystemDetail] = useState<SystemInventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemInventoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<SystemInventoryItem>({
    id: '',
    name: '',
    categoryType: 'Sistema',
    subCategory: 'Operaciones',
    riskLevel: 'Medio',
    technicalOwner: '',
    accessOwner: '',
    financialOwner: '',
    status: 'Activo',
    description: '',
    accessUrl: '',
    mfaEnforced: true
  });

  // Unique list of access owners for filtering
  const accessOwnersList = useMemo(() => {
    const set = new Set<string>();
    systems.forEach(s => {
      if (s.accessOwner && s.accessOwner.trim()) {
        set.add(s.accessOwner.trim());
      }
    });
    return Array.from(set).sort();
  }, [systems]);

  // Statistics
  const statistics = useMemo(() => {
    const total = systems.length;
    const sistemasCount = systems.filter(s => s.categoryType === 'Sistema').length;
    const plataformasCount = systems.filter(s => s.categoryType === 'Plataforma').length;
    const infraCount = systems.filter(s => s.categoryType === 'Infraestructura').length;
    
    const activeCount = systems.filter(s => s.status === 'Activo').length;
    const decommissionedCount = systems.filter(s => s.status === 'Dado de Baja').length;
    
    const highRiskCount = systems.filter(s => s.riskLevel === 'Alto' && s.status === 'Activo').length;
    const mediumRiskCount = systems.filter(s => s.riskLevel === 'Medio' && s.status === 'Activo').length;
    const lowRiskCount = systems.filter(s => s.riskLevel === 'Bajo' && s.status === 'Activo').length;

    return {
      total,
      sistemasCount,
      plataformasCount,
      infraCount,
      activeCount,
      decommissionedCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount
    };
  }, [systems]);

  // Filtered systems
  const filteredSystems = useMemo(() => {
    return systems.filter(sys => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        sys.name.toLowerCase().includes(q) ||
        sys.description.toLowerCase().includes(q) ||
        sys.technicalOwner.toLowerCase().includes(q) ||
        sys.accessOwner.toLowerCase().includes(q) ||
        sys.financialOwner.toLowerCase().includes(q) ||
        sys.subCategory.toLowerCase().includes(q) ||
        sys.accessUrl.toLowerCase().includes(q);

      const matchesType = selectedTypeTab === 'TODOS' || sys.categoryType === selectedTypeTab;
      const matchesRisk = riskFilter === 'TODOS' || sys.riskLevel === riskFilter;
      const matchesStatus = statusFilter === 'TODOS' || sys.status === statusFilter;
      const matchesAccessOwner = selectedAccessOwnerFilter === 'TODOS' || sys.accessOwner.trim() === selectedAccessOwnerFilter;

      return matchesSearch && matchesType && matchesRisk && matchesStatus && matchesAccessOwner;
    });
  }, [systems, searchQuery, selectedTypeTab, riskFilter, statusFilter, selectedAccessOwnerFilter]);

  const handleOpenCreateModal = () => {
    setEditingSystem(null);
    setFormData({
      id: `SYS-${String(systems.length + 1).padStart(3, '0')}`,
      name: '',
      categoryType: selectedTypeTab === 'TODOS' ? 'Sistema' : selectedTypeTab,
      subCategory: 'Core & Pagos',
      riskLevel: 'Medio',
      technicalOwner: '',
      accessOwner: '',
      financialOwner: '',
      status: 'Activo',
      description: '',
      accessUrl: '',
      mfaEnforced: true
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: SystemInventoryItem) => {
    setEditingSystem(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('El nombre del sistema es obligatorio.');
      return;
    }

    if (editingSystem) {
      // Update
      const updated = systems.map(s => s.id === editingSystem.id ? formData : s);
      setSystems(updated);
    } else {
      // Create
      setSystems([formData, ...systems]);
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteSystem = (id: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar este registro del inventario?`)) {
      setSystems(systems.filter(s => s.id !== id));
      if (selectedSystemDetail?.id === id) {
        setSelectedSystemDetail(null);
      }
    }
  };

  const handleDownloadCSV = () => {
    let csv = '\uFEFF';
    csv += ['ID', 'Nombre del Sistema', 'Tipo (Diferenciación)', 'Subcategoría', 'Nivel de Riesgo', 'Owner Técnico', 'Owner de Accesos (Altas/Bajas)', 'Owner Financiero (Pagos)', 'Estado', 'Descripción / Notas', 'URL Acceso'].join(';') + '\n';

    systems.forEach(s => {
      const row = [
        `"${s.id}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.categoryType}"`,
        `"${s.subCategory}"`,
        `"${s.riskLevel}"`,
        `"${s.technicalOwner.replace(/"/g, '""')}"`,
        `"${s.accessOwner.replace(/"/g, '""')}"`,
        `"${s.financialOwner.replace(/"/g, '""')}"`,
        `"${s.status}"`,
        `"${s.description.replace(/"/g, '""')}"`,
        `"${s.accessUrl.replace(/"/g, '""')}"`
      ];
      csv += row.join(';') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventario_Sistemas_Plataformas_Infraestructura_Global66_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper colors and icons
  const getCategoryBadge = (cat: SystemCategoryType) => {
    switch (cat) {
      case 'Sistema':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-600" />
            <span>Sistema</span>
          </span>
        );
      case 'Plataforma':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-200 flex items-center gap-1">
            <Globe className="w-3 h-3 text-sky-600" />
            <span>Plataforma SaaS</span>
          </span>
        );
      case 'Infraestructura':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
            <Server className="w-3 h-3 text-emerald-600" />
            <span>Infraestructura</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: SystemRiskLevel) => {
    switch (risk) {
      case 'Alto':
        return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase border border-red-200">🔴 Riesgo Alto</span>;
      case 'Medio':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-200">🟡 Riesgo Medio</span>;
      case 'Bajo':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">🟢 Riesgo Bajo</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">⚪ Sin Calificar</span>;
    }
  };

  return (
    <div id="ti_systems_inventory_module_root" className="space-y-6">
      
      {/* Top Banner explaining the Module & Differentiation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950 p-6 md:p-8 rounded-3xl border border-purple-500/20 shadow-xl text-white space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-black uppercase tracking-widest border border-purple-500/30">
                Inventario Oficial de Sistemas
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                Triple Ownership (Técnico / Accesos / Financiero)
              </span>
              <span className="px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-black uppercase tracking-widest border border-sky-500/30">
                ciberseguridad@global66.com
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Layers2 className="w-7 h-7 text-purple-400" />
              <span>Inventario de Sistemas, Plataformas e Infraestructura</span>
            </h2>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Planilla corporativa de todos los sistemas (internos y externos) utilizados para la operación de Global66. Permite <strong>diferenciar explícitamente entre Sistemas de negocio, Plataformas SaaS e Infraestructura Cloud/BBDD/Redes</strong>, garantizando la auditoría de permisos, control de bajas de acceso (offboarding) y seguimiento de responsables financieros.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Sistema</span>
            </button>
          </div>
        </div>

        {/* Big Categorical Differentiation Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedTypeTab('TODOS')}
            className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              selectedTypeTab === 'TODOS'
                ? 'bg-white/10 text-white border-white/30 shadow-md backdrop-blur-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase">Todos los Componentes</span>
              <span className="px-2 py-0.5 rounded bg-slate-700 text-white text-[10px] font-mono font-bold">
                {statistics.total}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Consolidado general de sistemas y herramientas</p>
          </button>

          <button
            onClick={() => setSelectedTypeTab('Sistema')}
            className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              selectedTypeTab === 'Sistema'
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-md backdrop-blur-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-purple-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>Sistemas</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 text-[10px] font-mono font-bold">
                {statistics.sistemasCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Core Wallet, ERPs, Portales Payin/Payout, CRM</p>
          </button>

          <button
            onClick={() => setSelectedTypeTab('Plataforma')}
            className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              selectedTypeTab === 'Plataforma'
                ? 'bg-sky-600/30 text-sky-200 border-sky-500/50 shadow-md backdrop-blur-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-sky-300">
                <Globe className="w-3.5 h-3.5" />
                <span>Plataformas SaaS</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 text-[10px] font-mono font-bold">
                {statistics.plataformasCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Colaboración, KYC externo, Marketing, Analítica, IA</p>
          </button>

          <button
            onClick={() => setSelectedTypeTab('Infraestructura')}
            className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              selectedTypeTab === 'Infraestructura'
                ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 shadow-md backdrop-blur-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-emerald-300">
                <Server className="w-3.5 h-3.5" />
                <span>Infraestructura</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-[10px] font-mono font-bold">
                {statistics.infraCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Nube AWS/GCP, BBDD Aurora/MySQL, VPN, Sophos EDR</p>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Activos Operativos</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{statistics.activeCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">En producción activa</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dados de Baja</p>
          <h3 className="text-2xl font-black text-slate-400 mt-1">{statistics.decommissionedCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Auditar baja de accesos</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riesgo Alto (Activos)</p>
          <h3 className="text-2xl font-black text-red-600 mt-1">{statistics.highRiskCount}</h3>
          <p className="text-[10px] text-red-700 font-bold mt-1">Prioritarios offboarding</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riesgo Medio</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{statistics.mediumRiskCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Herramientas operativas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riesgo Bajo</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{statistics.lowRiskCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">SaaS de apoyo</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Owners de Accesos</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{accessOwnersList.length}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Responsables identificados</p>
        </div>
      </div>

      {/* Offboarding Audit Advisory Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-extrabold text-amber-950 block">Procedimiento Crítico de Desvinculación (Offboarding) & Auditoría de Permisos</strong>
          <p className="leading-relaxed text-amber-900/90">
            Cuando un colaborador deja de pertenecer a Global66, el área de People y Ciberseguridad debe consultar este inventario y notificar a cada <strong>Owner de Accesos</strong> de los sistemas asignados. Para los <strong>{statistics.highRiskCount} sistemas de Riesgo Alto</strong>, la revocación debe ejecutarse en menos de 2 horas tras la notificación formal.
          </p>
        </div>
      </div>

      {/* Multi-Filters and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, owner técnico, accesos, financiero, notas o URL..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tabla de Auditoría
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Diferenciación</label>
            <select
              value={selectedTypeTab}
              onChange={e => setSelectedTypeTab(e.target.value as any)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="Sistema">🖥️ Sistemas</option>
              <option value="Plataforma">☁️ Plataformas SaaS</option>
              <option value="Infraestructura">⚙️ Infraestructura</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Estado Operativo</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Activo">🟢 Activo</option>
              <option value="Dado de Baja">⚪ Dado de Baja</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nivel de Riesgo</label>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="TODOS">Todos los riesgos</option>
              <option value="Alto">🔴 Alto</option>
              <option value="Medio">🟡 Medio</option>
              <option value="Bajo">🟢 Bajo</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Owner de Accesos (Offboarding)</label>
            <select
              value={selectedAccessOwnerFilter}
              onChange={e => setSelectedAccessOwnerFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="TODOS">Todos los owners de acceso</option>
              {accessOwnersList.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || selectedTypeTab !== 'TODOS' || statusFilter !== 'TODOS' || riskFilter !== 'TODOS' || selectedAccessOwnerFilter !== 'TODOS') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Resultados: <strong>{filteredSystems.length}</strong> de {systems.length} sistemas</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTypeTab('TODOS');
                setStatusFilter('TODOS');
                setRiskFilter('TODOS');
                setSelectedAccessOwnerFilter('TODOS');
              }}
              className="text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* RENDER VIEW: CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSystems.map(system => {
            const isDecommissioned = system.status === 'Dado de Baja';
            return (
              <div
                key={system.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isDecommissioned 
                    ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                    : 'bg-white border-slate-200 hover:border-purple-300 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Card Header badges */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-black">
                        {system.id}
                      </span>
                      {getCategoryBadge(system.categoryType)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {getRiskBadge(system.riskLevel)}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        system.status === 'Activo' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-600 line-through'
                      }`}>
                        {system.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between">
                      <span>{system.name}</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      Subcategoría: {system.subCategory}
                    </span>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {system.description || 'Sin notas adicionales.'}
                    </p>
                  </div>

                  {/* Triple Owners Grid (Key Requirement of Global66) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-500" />
                        Owner Técnico:
                      </span>
                      <strong className="text-slate-800 text-[11px] truncate max-w-[170px]" title={system.technicalOwner}>
                        {system.technicalOwner || 'Sin Asignar'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] font-black uppercase text-purple-900/70 flex items-center gap-1">
                        <Key className="w-3 h-3 text-purple-600" />
                        Owner Accesos:
                      </span>
                      <strong className="text-purple-950 text-[11px] truncate max-w-[170px]" title={system.accessOwner}>
                        {system.accessOwner || 'Sin Asignar'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] font-black uppercase text-emerald-900/70 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        Owner Financiero:
                      </span>
                      <strong className="text-emerald-950 text-[11px] truncate max-w-[170px]" title={system.financialOwner}>
                        {system.financialOwner || 'Sin Asignar'}
                      </strong>
                    </div>
                  </div>

                  {/* URL */}
                  {system.accessUrl && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-purple-700 truncate" title={system.accessUrl}>
                        {system.accessUrl}
                      </span>
                    </div>
                  )}

                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 font-medium">
                    {system.categoryType === 'Sistema' ? 'Core Operacional' : system.categoryType === 'Plataforma' ? 'SaaS Externo' : 'Infraestructura'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(system)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar registro"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedSystemDetail(system)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>Ficha</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* RENDER VIEW: TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Sistema / Plataforma / Infraestructura</th>
                  <th className="px-5 py-3.5">Diferenciación</th>
                  <th className="px-5 py-3.5">Nivel de Riesgo</th>
                  <th className="px-5 py-3.5">Owner Técnico</th>
                  <th className="px-5 py-3.5">Owner de Accesos (Offboarding)</th>
                  <th className="px-5 py-3.5">Owner Financiero</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSystems.map(sys => (
                  <tr key={sys.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-black text-slate-800 whitespace-nowrap">
                      {sys.id}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-extrabold text-slate-900 text-xs">
                        {sys.name}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sys.description}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getCategoryBadge(sys.categoryType)}
                      <span className="text-[10px] text-slate-400 block mt-0.5">{sys.subCategory}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getRiskBadge(sys.riskLevel)}
                    </td>
                    <td className="px-5 py-3.5 max-w-[140px] truncate" title={sys.technicalOwner}>
                      <strong className="text-slate-800 font-semibold">{sys.technicalOwner || 'Sin Asignar'}</strong>
                    </td>
                    <td className="px-5 py-3.5 max-w-[140px] truncate" title={sys.accessOwner}>
                      <strong className="text-purple-950 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {sys.accessOwner || 'Sin Asignar'}
                      </strong>
                    </td>
                    <td className="px-5 py-3.5 max-w-[140px] truncate" title={sys.financialOwner}>
                      <span className="text-slate-700">{sys.financialOwner || 'Sin Asignar'}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sys.status === 'Activo' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-600 line-through'
                      }`}>
                        {sys.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(sys)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedSystemDetail(sys)}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: FICHA DETALLADA DEL SISTEMA */}
      {selectedSystemDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-slate-950 text-white font-mono text-xs font-black">
                    {selectedSystemDetail.id}
                  </span>
                  {getCategoryBadge(selectedSystemDetail.categoryType)}
                  {getRiskBadge(selectedSystemDetail.riskLevel)}
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    selectedSystemDetail.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600 line-through'
                  }`}>
                    {selectedSystemDetail.status}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-950 mt-1">
                  {selectedSystemDetail.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedSystemDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              
              {/* Description & Purpose */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Descripción y/o Notas Operativas:</span>
                <p className="text-slate-700 text-xs leading-relaxed font-medium">
                  {selectedSystemDetail.description || 'Sin descripción ingresada en el inventario.'}
                </p>
              </div>

              {/* Triple Ownership Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-600" />
                    Owner Técnico
                  </span>
                  <div className="font-extrabold text-slate-900 text-xs">{selectedSystemDetail.technicalOwner || 'Sin definir'}</div>
                  <p className="text-[10px] text-slate-400 leading-snug">Contacto para integraciones y funcionamiento.</p>
                </div>

                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-900 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    Owner de Accesos
                  </span>
                  <div className="font-extrabold text-purple-950 text-xs">{selectedSystemDetail.accessOwner || 'Sin definir'}</div>
                  <p className="text-[10px] text-purple-800/80 leading-snug">Responsable de altas y bajas (offboarding).</p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-900 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    Owner Financiero
                  </span>
                  <div className="font-extrabold text-emerald-950 text-xs">{selectedSystemDetail.financialOwner || 'Sin definir'}</div>
                  <p className="text-[10px] text-emerald-800/80 leading-snug">Aprueba pagos al proveedor del servicio.</p>
                </div>
              </div>

              {/* URL and Access points */}
              {selectedSystemDetail.accessUrl && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">URL de Acceso / Consola:</span>
                    <a 
                      href={selectedSystemDetail.accessUrl.startsWith('http') ? selectedSystemDetail.accessUrl : `https://${selectedSystemDetail.accessUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                    >
                      <span>{selectedSystemDetail.accessUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Security Advisory */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900 text-[11px] leading-relaxed">
                ℹ️ Para solicitar modificaciones de permisos, cambio de owners o reporte de incidentes en este sistema, contacte a <strong>ciberseguridad@global66.com</strong>.
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedSystemDetail(null);
                  handleOpenEditModal(selectedSystemDetail);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Editar Registro
              </button>

              <button
                onClick={() => setSelectedSystemDetail(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR SISTEMA */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <Layers2 className="w-5 h-5 text-purple-600" />
                <span>{editingSystem ? `Editar: ${editingSystem.name}` : 'Registrar Nuevo Componente en Inventario'}</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSystem} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nombre del Sistema / Herramienta</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    placeholder="Ej: Mambu, AWS, Slack..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Diferenciación (Tipo)</label>
                  <select
                    value={formData.categoryType}
                    onChange={e => setFormData({ ...formData, categoryType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Sistema">🖥️ Sistema (Core, ERP, Pasarela)</option>
                    <option value="Plataforma">☁️ Plataforma SaaS (Colaboración, KYC)</option>
                    <option value="Infraestructura">⚙️ Infraestructura (Nube, BBDD, Redes)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Subcategoría</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800"
                    placeholder="Core Wallet, Marketing..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nivel de Riesgo</label>
                  <select
                    value={formData.riskLevel}
                    onChange={e => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Alto">🔴 Alto</option>
                    <option value="Medio">🟡 Medio</option>
                    <option value="Bajo">🟢 Bajo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Estado</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Activo">🟢 Activo</option>
                    <option value="Dado de Baja">⚪ Dado de Baja</option>
                  </select>
                </div>
              </div>

              {/* Triple Ownership Inputs */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                <h5 className="font-black text-slate-800 text-xs">Asignación de Responsabilidades (Triple Ownership)</h5>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Owner Técnico (Integraciones & Operación)</label>
                    <input
                      type="text"
                      value={formData.technicalOwner}
                      onChange={e => setFormData({ ...formData, technicalOwner: e.target.value })}
                      placeholder="Nombre del responsable técnico"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-purple-900 block">Owner de Accesos (Altas y Bajas / Offboarding)</label>
                    <input
                      type="text"
                      value={formData.accessOwner}
                      onChange={e => setFormData({ ...formData, accessOwner: e.target.value })}
                      placeholder="Nombre del responsable de altas/bajas"
                      className="w-full px-3 py-1.5 border border-purple-200 rounded-lg text-xs bg-white font-bold text-purple-950"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-emerald-900 block">Owner Financiero (Aprobación de Pagos)</label>
                    <input
                      type="text"
                      value={formData.financialOwner}
                      onChange={e => setFormData({ ...formData, financialOwner: e.target.value })}
                      placeholder="Nombre del aprobador financiero"
                      className="w-full px-3 py-1.5 border border-emerald-200 rounded-lg text-xs bg-white font-bold text-emerald-950"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Descripción y Notas</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre el uso, cuentas o integraciones..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">URL de Acceso</label>
                <input
                  type="text"
                  value={formData.accessUrl}
                  onChange={e => setFormData({ ...formData, accessUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm"
                >
                  {editingSystem ? 'Actualizar Sistema' : 'Guardar en Inventario'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
