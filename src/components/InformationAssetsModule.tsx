import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Database, 
  Cpu, 
  FileSpreadsheet, 
  Mail, 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Download,
  Flame,
  FileText
} from 'lucide-react';
import { InformationAsset, ProcessArea } from '../types';

interface InformationAssetsModuleProps {
  selectedGlobalArea: string;
}

const INITIAL_ASSETS: InformationAsset[] = [
  {
    id: 'AST-01',
    name: 'Core Transaccional de Dispersión (Global66 API Core)',
    type: 'Sistema de Información',
    description: 'Orquestador central que ejecuta los cobros, validación de saldos y la dispersión síncrona de remesas transfronterizas hacia wallets locales de Chile, Colombia y Ecuador.',
    owner: 'Líder de Arquitectura Core TI',
    criticality: 'Crítica',
    classification: 'Confidencial',
    associatedProcesses: ['TI', 'Operaciones', 'Mesa de Dinero'],
    originDoc: 'Planilla de Continuidad Económica y Mesa de Dinero',
    lastReviewDate: '2026-06-01'
  },
  {
    id: 'AST-02',
    name: 'Sistemas de Protección de API Gateway (WAF & mTLS)',
    type: 'Infraestructura Cloud',
    description: 'Nivel perimetral que asegura las credenciales criptográficas, previene el secuestro de sesiones e impone políticas mTLS/VPN restrictivas para desarrolladores y sistemas integrados.',
    owner: 'Coordinador de Ciberseguridad',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['Ciberseguridad', 'TI'],
    originDoc: 'Planilla de Control de Riesgos Integrada (Fuga de Datos)',
    lastReviewDate: '2026-05-18'
  },
  {
    id: 'AST-03',
    name: 'Motor KYT (Know Your Transaction) en Tiempo Real',
    type: 'Sistema de Información',
    description: 'Software analítico centralizado que analiza el volumen y velocidad de depósitos acumulados, aplicando reglas síncronas de prevención de lavado de dinero y smurfing antes del pago.',
    owner: 'Oficial de Cumplimiento Regional',
    criticality: 'Crítica',
    classification: 'Confidencial',
    associatedProcesses: ['Cumplimiento', 'Fraude'],
    originDoc: 'Planilla Integrada & Control de Lavado Ecuador',
    lastReviewDate: '2026-06-10'
  },
  {
    id: 'AST-04',
    name: 'Base de Datos de Wallet y Producción Local (PostgreSQL)',
    type: 'Base de Datos',
    description: 'Instancia persistente con información sobre identificadores de identidad gubernamentales encriptados (RUT, Cédulas chilenas, colombianas y ecuatorianas) y saldos contables en USD/COP/CLP.',
    owner: 'Administrador de Base de Datos (DBA)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['Ciberseguridad', 'TI'],
    originDoc: 'Planilla Ecuador (Riesgos de Bases de Datos) & Colombia',
    lastReviewDate: '2026-06-12'
  },
  {
    id: 'AST-05',
    name: 'Servicio de Solución Biométrica y Facial (Liveness Check)',
    type: 'Sistema de Información',
    description: 'API integradora de Onboarding que ejecuta la detección activa de suplantaciones con prueba de vida animada cruzada instantáneamente con bases estatales de registros civiles nacionales.',
    owner: 'Gerente de Prevención de Fraudes',
    criticality: 'Alta',
    classification: 'Confidencial',
    associatedProcesses: ['Fraude', 'Cumplimiento'],
    originDoc: 'Onboarding Procedimiento de Captación y Validación',
    lastReviewDate: '2026-05-25'
  },
  {
    id: 'AST-06',
    name: 'Módulo Orquestador de Failover Inteligente',
    type: 'Sistema de Información',
    description: 'Subsistema de reintento transaccional que conmuta dinámicamente el ruteo de pagos hacia pasarelas adquirentes secundarias del país ante caídas de proveedores de base de datos bancaria o timeouts de red.',
    owner: 'Líder SRE y Sistemas Operativos',
    criticality: 'Alta',
    classification: 'Uso Interno',
    associatedProcesses: ['TI', 'Operaciones'],
    originDoc: 'Matriz de Continuidad y Caídas de Adquirencia',
    lastReviewDate: '2026-06-03'
  },
  {
    id: 'AST-07',
    name: 'Panel Administrativo de Backend (Consola Operativa Ops)',
    type: 'Sistema de Información',
    description: 'Módulo web de administración interna utilizado por analistas para la corrección de dobles abonos de saldo y reprocesamientos de cartolas con descalces.',
    owner: 'Supervisor de Operaciones de Pago',
    criticality: 'Alta',
    classification: 'Restringido',
    associatedProcesses: ['Operaciones', 'TI'],
    originDoc: 'Planilla de Procesamiento de Cartolas Manuales',
    lastReviewDate: '2026-06-05'
  },
  {
    id: 'AST-08',
    name: 'Hojas de Conciliación Bancaria y Cartolas del Corredor (Excel/PDF)',
    type: 'Documento Digital',
    description: 'Ficheros estructurados descargados directamente de portales bancarios de adquirencia local (Pichincha, Bancolombia, Banco de Chile) para cuadres manuales y transmisión interbancaria offline de tesorería y tipo de cambio.',
    owner: 'Coordinador de Tesorería Regional',
    criticality: 'Alta',
    classification: 'Confidencial',
    associatedProcesses: ['Mesa de Dinero', 'Operaciones'],
    originDoc: 'Procedimiento de Conciliación Manual y Fondeo de Cajas',
    lastReviewDate: '2026-06-11'
  },
  {
    id: 'AST-09',
    name: 'Bandejas Corporativas Seguras de Liquidación Cambiaria',
    type: 'Repositorio',
    description: 'Cuentas de e-mail institucional dedicadas a las comunicaciones seguras, envío de cartolas consolidadas y cotizaciones síncronas aprobadas de la Mesa de Dinero corporativa.',
    owner: 'Oficial de Mesa de Dinero',
    criticality: 'Media',
    classification: 'Restringido',
    associatedProcesses: ['Mesa de Dinero'],
    originDoc: 'Manual de Liquidación Cambiaria Multi-divisas G66',
    lastReviewDate: '2026-04-30'
  },
  {
    id: 'AST-10',
    name: 'Plataforma Analítica de Alertamientos (Salesforce / Notion / Inspektor)',
    type: 'Sistema de Información',
    description: 'Suite de herramientas conectadas para documentar alertas inusuales, escalar sospechas detectadas por analistas y archivar sustentos regulatorios de la debida diligencia de clientes.',
    owner: 'Analista de Compliance Senior',
    criticality: 'Media',
    classification: 'Confidencial',
    associatedProcesses: ['Cumplimiento'],
    originDoc: 'Sustentación de Flujos de Alertas de Prevención',
    lastReviewDate: '2026-05-12'
  }
];

export const InformationAssetsModule: React.FC<InformationAssetsModuleProps> = ({ selectedGlobalArea }) => {
  const [assets, setAssets] = useState<InformationAsset[]>(() => {
    const saved = localStorage.getItem('g66_information_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing assets', e);
      }
    }
    return INITIAL_ASSETS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('TODOS');
  const [syncWithGlobalArea, setSyncWithGlobalArea] = useState<boolean>(true);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InformationAsset | null>(null);
  
  const [formData, setFormData] = useState<Omit<InformationAsset, 'id'>>({
    name: '',
    type: 'Sistema de Información',
    description: '',
    owner: '',
    criticality: 'Media',
    classification: 'Uso Interno',
    associatedProcesses: ['TI'],
    originDoc: '',
    lastReviewDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('g66_information_assets', JSON.stringify(assets));
  }, [assets]);

  const activeProcessFilter = syncWithGlobalArea ? selectedGlobalArea : 'TODOS';

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.originDoc && asset.originDoc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Type
      const matchesType = selectedType === 'TODOS' || asset.type === selectedType;

      // Criticality
      const matchesCriticality = selectedCriticality === 'TODOS' || asset.criticality === selectedCriticality;

      // Process Area (Mapping process labels to exact process ids matches)
      let matchesArea = true;
      if (activeProcessFilter !== 'TODOS') {
        // Map top process area labels to the array tags
        let targetTag = activeProcessFilter;
        if (activeProcessFilter === 'Mesa de Dinero') targetTag = 'Mesa de Dinero';
        if (activeProcessFilter === 'Operaciones') targetTag = 'Operaciones';
        if (activeProcessFilter === 'Cumplimiento') targetTag = 'Cumplimiento';
        
        matchesArea = asset.associatedProcesses.some(p => p.toLowerCase() === targetTag.toLowerCase());
      }

      return matchesSearch && matchesType && matchesCriticality && matchesArea;
    });
  }, [assets, searchTerm, selectedType, selectedCriticality, activeProcessFilter]);

  const stats = useMemo(() => {
    const total = assets.length;
    const criticalCount = assets.filter(a => a.criticality === 'Crítica').length;
    const systemsCount = assets.filter(a => a.type === 'Sistema de Información').length;
    const dbCount = assets.filter(a => a.type === 'Base de Datos').length;
    
    return { total, criticalCount, systemsCount, dbCount };
  }, [assets]);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `AST-${String(assets.length + 1).padStart(2, '0')}`;
    const newAsset: InformationAsset = {
      ...formData,
      id: newId
    };
    setAssets([...assets, newAsset]);
    setShowAddForm(false);
    resetForm();
  };

  const handleUpdateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    const updated = assets.map(a => a.id === editingAsset.id ? { ...formData, id: editingAsset.id } : a);
    setAssets(updated);
    setEditingAsset(null);
    resetForm();
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm(`¿Está seguro de eliminar el activo corporativo ${id}?`)) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const startEdit = (asset: InformationAsset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      description: asset.description,
      owner: asset.owner,
      criticality: asset.criticality,
      classification: asset.classification,
      associatedProcesses: [...asset.associatedProcesses],
      originDoc: asset.originDoc || '',
      lastReviewDate: asset.lastReviewDate || new Date().toISOString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Sistema de Información',
      description: '',
      owner: '',
      criticality: 'Media',
      classification: 'Uso Interno',
      associatedProcesses: ['TI'],
      originDoc: '',
      lastReviewDate: new Date().toISOString().split('T')[0]
    });
  };

  const toggleProcessTag = (tag: string) => {
    const current = formData.associatedProcesses;
    if (current.includes(tag)) {
      setFormData({
        ...formData,
        associatedProcesses: current.filter(t => t !== tag)
      });
    } else {
      setFormData({
        ...formData,
        associatedProcesses: [...current, tag]
      });
    }
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'Crítica': return 'bg-red-50 text-red-700 border border-red-200';
      case 'Alta': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Media': return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'Baja': return 'bg-green-50 text-green-700 border border-green-200';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Altamente Confidencial': return 'bg-purple-100 text-purple-900 font-extrabold border border-purple-200';
      case 'Confidencial': return 'bg-blue-100 text-blue-900 font-bold border border-blue-200';
      case 'Restringido': return 'bg-indigo-50 text-indigo-800 border border-indigo-100';
      case 'Uso Interno': return 'bg-slate-100 text-slate-800 border border-slate-200';
      default: return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Sistema de Información': return <Cpu className="w-4 h-4 text-indigo-500" />;
      case 'Base de Datos': return <Database className="w-4 h-4 text-sky-500" />;
      case 'Documento Digital': return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'Repositorio': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'Infraestructura Cloud': return <Layers className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div id="assets-module-root" className="space-y-6">
      
      {/* Banner de Cabecera */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-905 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-black uppercase tracking-wider border border-indigo-500/30">
              ISO 27001 & ISO 31000
            </span>
            <span className="text-xs text-indigo-300 font-mono">Secuencia G66</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Gobernanza de Activos y Sistemas de Información
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Repositorio unificado de activos de información extraídos de las planillas de continuidad cambiaria, onboarding biométrico, control de lavado de activos de Chile, Colombia y Ecuador.
          </p>
        </div>

        <button 
          id="btn-trigger-add-asset"
          onClick={() => {
            resetForm();
            setEditingAsset(null);
            setShowAddForm(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Activo</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas Avanzadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-slate-50 text-slate-700 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Activos de Información</p>
            <h4 className="text-2xl font-black text-slate-950">{stats.total}</h4>
            <p className="text-[10px] text-slate-500 font-medium">Bajo gobernanza técnica</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Criticidad Crítica</p>
            <h4 className="text-2xl font-black text-red-600">{stats.criticalCount}</h4>
            <p className="text-[10px] text-red-700 font-bold">Requieren cifrado / mTLS</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Sistemas de Software</p>
            <h4 className="text-2xl font-black text-indigo-950">{stats.systemsCount}</h4>
            <p className="text-[10px] text-indigo-500 font-semibold">APIs, Orquestadores, Core</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">BBDD e Inventarios</p>
            <h4 className="text-2xl font-black text-sky-950">{stats.dbCount}</h4>
            <p className="text-[10px] text-sky-500 font-semibold">Seguridad de datos en reposo</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtrado Interactivo */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Búsqueda de Activos */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              id="search-assets-input"
              type="text"
              placeholder="Buscar por nombre, ID, descripción, propietario, planilla de origen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white placeholder-slate-400 font-medium"
            />
          </div>

          {/* Filtros Dropdowns */}
          <div className="flex flex-wrap gap-2.5 items-center">
            
            {/* Tipo */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Tipo:</span>
              <select
                id="select-asset-type"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="Sistema de Información">Sistemas</option>
                <option value="Base de Datos">Bases de datos</option>
                <option value="Documento Digital">Documentos Digitales</option>
                <option value="Repositorio">Repositorios / E-mail</option>
                <option value="Infraestructura Cloud">Infraestructura</option>
                <option value="Otro">Otros activos</option>
              </select>
            </div>

            {/* Criticidad */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Criticidad:</span>
              <select
                id="select-asset-criticality"
                value={selectedCriticality}
                onChange={e => setSelectedCriticality(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                <option value="TODOS">Todas</option>
                <option value="Crítica">🔴 Crítica</option>
                <option value="Alta">🟠 Alta</option>
                <option value="Media">🟡 Media</option>
                <option value="Baja">🟢 Baja</option>
              </select>
            </div>

          </div>
        </div>

        {/* Sync con el Selector de Proceso Global */}
        <div id="sync-indicator-area" className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <input 
              id="checkbox-sync-global-area"
              type="checkbox"
              checked={syncWithGlobalArea}
              onChange={e => setSyncWithGlobalArea(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="checkbox-sync-global-area" className="text-slate-500 font-medium cursor-pointer">
              Sincronizar resultados con el selector de procesos del encabezado corporativo {syncWithGlobalArea && <span>(Área activa: <strong className="text-indigo-900 font-bold">{selectedGlobalArea}</strong>)</span>}
            </label>
          </div>
          {activeProcessFilter !== 'TODOS' && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-500" />
              Filtrado por: {activeProcessFilter}
            </span>
          )}
        </div>
      </div>

      {/* Formulario Inline para Crear o Editar Activos */}
      {showAddForm && (
        <div id="add-asset-form-container" className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900">
              {editingAsset ? `Editar Activo: ${editingAsset.id}` : 'Registrar Nuevo Activo de Información'}
            </h3>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setEditingAsset(null);
                resetForm();
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nombre del Activo</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Base de Datos de Transacciones Chile G66"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tipo de Activo</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                >
                  <option value="Sistema de Información">Sistema de Información (Software)</option>
                  <option value="Base de Datos">Base de Datos</option>
                  <option value="Documento Digital">Documento Digital / Ficheros</option>
                  <option value="Repositorio">Repositorio de Almacenamiento</option>
                  <option value="Infraestructura Cloud">Infraestructura Cloud / Servidores</option>
                  <option value="Otro">Otro activo de información</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Descripción Tecnológica & Negocio</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Indique el fin, su importancia operativa, interacciones y el tipo de información que procesa (ej: datos bancarios, saldos en USD, biometría, etc)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Propietario / Responsable Técnico</label>
                <input
                  required
                  type="text"
                  value={formData.owner}
                  onChange={e => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Ej: Lider de Seguridad / DBA / Oficial de Tesorería"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Material / Planilla de Origen</label>
                <input
                  type="text"
                  value={formData.originDoc}
                  onChange={e => setFormData({ ...formData, originDoc: e.target.value })}
                  placeholder="Ej: Planilla Integrada de Control de Riesgos Ecuador"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Criticidad (ISO 31000)</label>
                <select
                  value={formData.criticality}
                  onChange={e => setFormData({ ...formData, criticality: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Clasificación de Seguridad</label>
                <select
                  value={formData.classification}
                  onChange={e => setFormData({ ...formData, classification: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                >
                  <option value="Público">Público</option>
                  <option value="Uso Interno">Uso Interno</option>
                  <option value="Restringido">Restringido</option>
                  <option value="Confidencial">Confidencial</option>
                  <option value="Altamente Confidencial">Altamente Confidencial</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Fecha de Última Revisión</label>
                <input
                  type="date"
                  value={formData.lastReviewDate}
                  onChange={e => setFormData({ ...formData, lastReviewDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-900 text-sm font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Áreas de Procesos Asociados */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Procesos Asociados (Para Clasificación Unificada ISO)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Cumplimiento', 'Fraude', 'Ciberseguridad', 'Operaciones', 'Mesa de Dinero', 'TI'].map(area => {
                  const isChecked = formData.associatedProcesses.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleProcessTag(area)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {area === 'Mesa de Dinero' ? 'tesoreriá' : area === 'Operaciones' ? 'OPs' : area}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAsset(null);
                  resetForm();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cerrar sin guardar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-white bg-slate-900 border border-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                {editingAsset ? 'Actualizar Cambios' : 'Anexar Activo de Información'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Activos */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h5 className="font-extrabold text-slate-800 text-sm">No se encontraron activos</h5>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              Ajuste los criterios de la barra de búsqueda o el tipo de activo seleccionado para visualizar registros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Clasificación & Activo</th>
                  <th className="px-6 py-3.5">Descripción & Detalle</th>
                  <th className="px-6 py-3.5">Propietario / Origen</th>
                  <th className="px-6 py-3.5">Procesos ISO</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* ID */}
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-500 font-bold">
                      {asset.id}
                    </td>

                    {/* Clasificación y Activo */}
                    <td className="px-6 py-4.5 max-w-sm">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${getCriticalityColor(asset.criticality)}`}>
                            {asset.criticality === 'Crítica' ? '⚠️ ' : ''}{asset.criticality}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] rounded-lg text-slate-600 border ${getClassificationColor(asset.classification)}`}>
                            {asset.classification}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                          {getAssetIcon(asset.type)}
                          <span>{asset.name}</span>
                        </h4>
                        <div className="text-[10px] font-semibold text-slate-400">
                          <span>Tipo: {asset.type}</span>
                        </div>
                      </div>
                    </td>

                    {/* Descripción */}
                    <td className="px-6 py-4.5 max-w-md">
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {asset.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Último análisis: {asset.lastReviewDate || 'Sin revisar'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Propietario / Origen */}
                    <td className="px-6 py-4.5 text-xs text-slate-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{asset.owner}</span>
                        </div>
                        {asset.originDoc && (
                          <div className="flex items-start gap-1 text-[10px] text-slate-400 leading-snug">
                            <Tag className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="italic">{asset.originDoc}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Procesos Marcados */}
                    <td className="px-6 py-4.5">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {asset.associatedProcesses.map(p => (
                          <span 
                            key={p} 
                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200/50"
                          >
                            {p === 'Mesa de Dinero' ? 'tesoreriá' : p === 'Operaciones' ? 'OPs' : p}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(asset)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Editar parámetros"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remover activo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pie Metodológico Informativo */}
      <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Relación de Activos ISO 27001 e ISO 31000
          </p>
          <p>
            El establecimiento de un inventario de activos es el paso precursor fundamental para la mitigación y diseño de controles según la norma ISO 31000. Cada control permanente asignado a los riesgos del canal multilateral de Global66 opera directamente sobre uno o más sistemas de información documentados en este módulo.
          </p>
        </div>
      </div>

    </div>
  );
};
