import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Cpu, 
  Layers, 
  Lock, 
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
  Server, 
  Globe, 
  Key, 
  BookOpen, 
  ChevronRight, 
  Download, 
  X, 
  HardDrive, 
  FileText,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Landmark,
  UserCheck
} from 'lucide-react';
import { ComprehensiveITAsset, ISO_CLASSIFICATION_GUIDELINES } from '../data/tiAssetsAndDataClassification';
import { ITThreatRisk } from './TIRiskApp';

interface TIAssetInventoryViewProps {
  assets: ComprehensiveITAsset[];
  onUpdateAssets: (newAssets: ComprehensiveITAsset[]) => void;
  itRisks: ITThreatRisk[];
  onSelectAssetForRiskEvaluation?: (assetId: string) => void;
}

export const TIAssetInventoryView: React.FC<TIAssetInventoryViewProps> = ({
  assets,
  onUpdateAssets,
  itRisks,
  onSelectAssetForRiskEvaluation
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [classificationFilter, setClassificationFilter] = useState('TODOS');
  const [criticalityFilter, setCriticalityFilter] = useState('TODOS');
  const [personalDataFilter, setPersonalDataFilter] = useState<'TODOS' | 'CON_DATOS' | 'SENSIBLES' | 'SIN_DATOS'>('TODOS');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Detail Modal State
  const [selectedAsset, setSelectedAsset] = useState<ComprehensiveITAsset | null>(null);

  // Create / Edit Asset Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ComprehensiveITAsset | null>(null);
  const [assetFormData, setAssetFormData] = useState<ComprehensiveITAsset>({
    id: '',
    name: '',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: '',
    owner: '',
    technicalOwner: '',
    criticality: 'Alta',
    classification: 'Confidencial',
    associatedProcesses: ['TI'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / ApiGw-resument',
    lastReviewDate: new Date().toISOString().split('T')[0],
    cValue: 4,
    iValue: 4,
    aValue: 4,
    apiEndpoint: '',
    httpMethods: ['GET', 'POST'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: [],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C'],
    securityMeasures: ['A.8.12 Cifrado KMS AES-256', 'A.5.15 Control de accesos'],
    retentionPeriod: '5 años conforme a NCG 464 CMF',
    internationalTransfer: true
  });

  const [personalDataInput, setPersonalDataInput] = useState('');
  const [securityMeasureInput, setSecurityMeasureInput] = useState('');

  // Statistics calculation
  const stats = useMemo(() => {
    const total = assets.length;
    const apiGwCount = assets.filter(a => a.category === 'API Gateway / Microservicio').length;
    const personalDataCount = assets.filter(a => a.containsPersonalData).length;
    const sensitiveDataCount = assets.filter(a => a.isSensitivePersonalData).length;
    const criticalCount = assets.filter(a => a.criticality === 'Crítica').length;
    const highlyConfidentialCount = assets.filter(a => a.classification === 'Altamente Confidencial').length;

    const avgC = (assets.reduce((sum, a) => sum + (a.cValue || 3), 0) / (total || 1)).toFixed(1);
    const avgI = (assets.reduce((sum, a) => sum + (a.iValue || 3), 0) / (total || 1)).toFixed(1);
    const avgA = (assets.reduce((sum, a) => sum + (a.aValue || 3), 0) / (total || 1)).toFixed(1);

    return {
      total,
      apiGwCount,
      personalDataCount,
      sensitiveDataCount,
      criticalCount,
      highlyConfidentialCount,
      avgC,
      avgI,
      avgA
    };
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        asset.name.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q) ||
        asset.description.toLowerCase().includes(q) ||
        (asset.apiEndpoint && asset.apiEndpoint.toLowerCase().includes(q)) ||
        (asset.technicalOwner && asset.technicalOwner.toLowerCase().includes(q)) ||
        asset.owner.toLowerCase().includes(q) ||
        asset.personalDataTypes.some(t => t.toLowerCase().includes(q));

      const matchesCategory = categoryFilter === 'TODOS' || asset.category === categoryFilter;
      const matchesClassification = classificationFilter === 'TODOS' || asset.classification === classificationFilter;
      const matchesCriticality = criticalityFilter === 'TODOS' || asset.criticality === criticalityFilter;

      let matchesPersonalData = true;
      if (personalDataFilter === 'CON_DATOS') {
        matchesPersonalData = asset.containsPersonalData;
      } else if (personalDataFilter === 'SENSIBLES') {
        matchesPersonalData = asset.isSensitivePersonalData === true;
      } else if (personalDataFilter === 'SIN_DATOS') {
        matchesPersonalData = !asset.containsPersonalData;
      }

      return matchesSearch && matchesCategory && matchesClassification && matchesCriticality && matchesPersonalData;
    });
  }, [assets, searchQuery, categoryFilter, classificationFilter, criticalityFilter, personalDataFilter]);

  const handleOpenCreateModal = () => {
    setEditingAsset(null);
    setAssetFormData({
      id: `AST-GW-${String(assets.length + 1).padStart(2, '0')}`,
      name: '',
      type: 'Sistema de Información',
      category: 'API Gateway / Microservicio',
      description: '',
      owner: 'Líder Técnico de Microservicios',
      technicalOwner: 'Tech Lead (AWS CodeCommit / CloudTrail)',
      criticality: 'Alta',
      classification: 'Confidencial',
      associatedProcesses: ['TI', 'Operaciones'],
      originDoc: 'Inventario_Activos_Global66_Ley21719 / ApiGw-resument',
      lastReviewDate: new Date().toISOString().split('T')[0],
      cValue: 4,
      iValue: 4,
      aValue: 4,
      apiEndpoint: '/v1/',
      httpMethods: ['GET', 'POST'],
      authMethod: 'Cognito JWT / OAuth2',
      cloudInfrastructure: 'AWS us-east-1 (API Gateway, EKS, Aurora)',
      containsPersonalData: true,
      isSensitivePersonalData: false,
      personalDataTypes: ['RUT/Cédula', 'E-mail', 'Historial Transaccional'],
      legalBasisLey21719: 'Ejecución contractual',
      dataSubjects: ['Clientes Persona Natural B2C'],
      securityMeasures: ['A.8.12 Cifrado KMS AES-256', 'A.5.15 Control de accesos RBAC', 'A.8.2 Logs CloudTrail'],
      retentionPeriod: '5 años conforme a NCG 464 CMF',
      internationalTransfer: true
    });
    setPersonalDataInput('');
    setSecurityMeasureInput('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (asset: ComprehensiveITAsset) => {
    setEditingAsset(asset);
    setAssetFormData({ ...asset });
    setPersonalDataInput('');
    setSecurityMeasureInput('');
    setIsEditModalOpen(true);
  };

  const handleDeleteAsset = (assetId: string) => {
    if (window.confirm(`¿Confirmas que deseas remover el activo ${assetId} del inventario corporativo?`)) {
      const updated = assets.filter(a => a.id !== assetId);
      onUpdateAssets(updated);
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(null);
      }
    }
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetFormData.id || !assetFormData.name) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    if (editingAsset) {
      // Update
      const updated = assets.map(a => a.id === editingAsset.id ? assetFormData : a);
      onUpdateAssets(updated);
    } else {
      // Add
      onUpdateAssets([assetFormData, ...assets]);
    }

    setIsEditModalOpen(false);
  };

  const handleDownloadCSV = () => {
    let csv = '\uFEFF';
    csv += ['ID', 'Nombre del Activo', 'Categoría', 'Endpoint API Gateway', 'Método Autenticación', 'Dueño Técnico (CloudTrail)', 'Criticidad', 'Clasificación ISO 27001', 'Confidencialidad (C)', 'Integridad (I)', 'Disponibilidad (A)', 'Contiene Datos Personales (Ley 21.719)', 'Datos Sensibles Art. 2', 'Tipos de Datos Personales', 'Base Legal Ley 21.719', 'Plazo de Retención', 'Infraestructura Cloud'].join(';') + '\n';

    assets.forEach(a => {
      const row = [
        `"${a.id}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        `"${a.apiEndpoint || 'N/A'}"`,
        `"${a.authMethod}"`,
        `"${a.technicalOwner || a.owner}"`,
        `"${a.criticality}"`,
        `"${a.classification}"`,
        a.cValue,
        a.iValue,
        a.aValue,
        a.containsPersonalData ? 'SÍ' : 'NO',
        a.isSensitivePersonalData ? 'SÍ (Sensible)' : 'NO',
        `"${(a.personalDataTypes || []).join(', ')}"`,
        `"${a.legalBasisLey21719 || 'N/A'}"`,
        `"${a.retentionPeriod || 'N/A'}"`,
        `"${a.cloudInfrastructure || 'AWS us-east-1'}"`
      ];
      csv += row.join(';') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventario_Activos_TI_Global66_ISO27001_Ley21719_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'API Gateway / Microservicio':
        return <Globe className="w-4 h-4 text-emerald-500" />;
      case 'Base de Datos':
        return <Database className="w-4 h-4 text-sky-500" />;
      case 'Almacenamiento S3 / Bóvedas':
        return <HardDrive className="w-4 h-4 text-indigo-500" />;
      case 'Criptografía & Identidad':
        return <Key className="w-4 h-4 text-amber-500" />;
      case 'Infraestructura Cloud & EKS':
        return <Server className="w-4 h-4 text-purple-500" />;
      case 'Repositorio & CI/CD':
        return <Layers className="w-4 h-4 text-slate-500" />;
      default:
        return <Cpu className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getClassificationBadge = (classification: string) => {
    const guide = ISO_CLASSIFICATION_GUIDELINES[classification];
    const badgeColor = guide?.badgeColor || 'bg-slate-100 text-slate-800 border-slate-200';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase inline-flex items-center gap-1 ${badgeColor}`}>
        <Lock className="w-3 h-3" />
        <span>{classification}</span>
      </span>
    );
  };

  return (
    <div id="ti_asset_inventory_view_root" className="space-y-6">
      
      {/* Top Banner explaining ISO 27001 A.5.9 and Ley 21.719 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-emerald-500/20 shadow-lg text-white space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                ISO 27001:2022 Cláusula A.5.9
              </span>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                Ley 21.719 Chile (Datos Personales)
              </span>
              <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-black uppercase tracking-widest border border-sky-500/30">
                AWS API Gateway & CloudTrail
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              <span>Inventario Integral de Activos TI & Datos Personales</span>
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Consolidación oficial de los microservicios y rutas de <strong>AWS API Gateway</strong> (<code className="text-emerald-300">ApiGw-resument</code>) y las bases de datos transaccionales, bóvedas criptográficas y almacenes de datos personales de Global66 conforme a la <strong>Ley 21.719</strong> y el estándar <strong>ISO 27001</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow-sm"
              title="Descargar inventario en formato CSV estructurado"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Activo TI</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Activos</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Catalogados en GRC</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Microservicios API Gw</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.apiGwCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Endpoints securizados</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Con Datos Personales</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.personalDataCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Bajo Ley 21.719</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Datos Sensibles Art. 2</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{stats.sensitiveDataCount}</h3>
          <p className="text-[10px] text-purple-700 font-bold mt-1">Biometría / Bóvedas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Criticidad Crítica</p>
          <h3 className="text-2xl font-black text-red-600 mt-1">{stats.criticalCount}</h3>
          <p className="text-[10px] text-red-700 font-bold mt-1">SLA 99.99% Core</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Promedio Tríada CIA</p>
          <div className="text-xs font-black text-slate-900 mt-1.5 flex items-center gap-1.5">
            <span className="text-blue-600 font-mono">C:{stats.avgC}</span>
            <span className="text-amber-600 font-mono">I:{stats.avgI}</span>
            <span className="text-indigo-600 font-mono">A:{stats.avgA}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Escala ISO 27005 (1-5)</p>
        </div>
      </div>

      {/* Search and Multi-Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre, endpoint (/v1/...), dueño técnico, RUT o biometría..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
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

          <div className="flex items-center gap-2 self-end md:self-auto">
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
                Tabla ISO
              </button>
            </div>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Categoría Arquitectura</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas las categorías</option>
              <option value="API Gateway / Microservicio">API Gateway / Microservicio</option>
              <option value="Base de Datos">Base de Datos</option>
              <option value="Almacenamiento S3 / Bóvedas">Almacenamiento S3 / Bóvedas</option>
              <option value="Criptografía & Identidad">Criptografía & Identidad</option>
              <option value="Infraestructura Cloud & EKS">Infraestructura Cloud & EKS</option>
              <option value="Repositorio & CI/CD">Repositorio & CI/CD</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Clasificación ISO 27001</label>
            <select
              value={classificationFilter}
              onChange={e => setClassificationFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas las clasificaciones</option>
              <option value="Altamente Confidencial">Altamente Confidencial</option>
              <option value="Confidencial">Confidencial</option>
              <option value="Restringido">Restringido</option>
              <option value="Uso Interno">Uso Interno</option>
              <option value="Público">Público</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Datos Personales Ley 21.719</label>
            <select
              value={personalDataFilter}
              onChange={e => setPersonalDataFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos los activos</option>
              <option value="CON_DATOS">Con Datos Personales (Ley 21.719)</option>
              <option value="SENSIBLES">Solo Datos Sensibles Art. 2 (Biometría / PEP)</option>
              <option value="SIN_DATOS">Sin Datos Personales (Sistemas Técnicos)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Criticidad Operacional</label>
            <select
              value={criticalityFilter}
              onChange={e => setCriticalityFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas las criticidades</option>
              <option value="Crítica">Crítica (SLA 99.99%)</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {(searchQuery || categoryFilter !== 'TODOS' || classificationFilter !== 'TODOS' || criticalityFilter !== 'TODOS' || personalDataFilter !== 'TODOS') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Resultados: <strong>{filteredAssets.length}</strong> de {assets.length} activos</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('TODOS');
                setClassificationFilter('TODOS');
                setCriticalityFilter('TODOS');
                setPersonalDataFilter('TODOS');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* RENDER VIEW: CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => {
            const linkedRisks = itRisks.filter(r => r.assetId === asset.id);
            return (
              <div 
                key={asset.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 group"
              >
                <div className="space-y-3">
                  {/* Header badges */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-black">
                        {asset.id}
                      </span>
                      <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100" title={asset.category}>
                        {getCategoryIcon(asset.category)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {asset.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {getClassificationBadge(asset.classification)}
                    </div>
                  </div>

                  {/* Asset Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      {asset.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {asset.description}
                    </p>
                  </div>

                  {/* Technical details: API endpoint or Cloud host */}
                  {asset.apiEndpoint && (
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-700 font-bold truncate max-w-[200px]" title={asset.apiEndpoint}>
                        {asset.apiEndpoint}
                      </span>
                      <div className="flex gap-1">
                        {(asset.httpMethods || ['GET']).map(m => (
                          <span key={m} className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[9px] font-black">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ley 21.719 Personal Data Highlights */}
                  {asset.containsPersonalData ? (
                    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-900">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Datos Personales (Ley 21.719)
                        </span>
                        {asset.isSensitivePersonalData && (
                          <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded font-black text-[9px]">
                            Sensible Art. 2
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {asset.personalDataTypes.slice(0, 3).map((type, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200 text-[10px] font-medium">
                            {type}
                          </span>
                        ))}
                        {asset.personalDataTypes.length > 3 && (
                          <span className="text-[10px] text-indigo-600 font-bold self-center">
                            +{asset.personalDataTypes.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-400 font-medium italic">
                      Activo puramente técnico (Sin datos de titulares personales)
                    </div>
                  )}

                  {/* CIA Evaluation Bar */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50/70 p-1.5 rounded-lg border border-blue-100">
                      <div className="text-[9px] font-black uppercase text-blue-800">Confidencialidad</div>
                      <div className="text-sm font-black text-blue-900 mt-0.5">{asset.cValue} <span className="text-[10px] text-blue-500">/ 5</span></div>
                    </div>
                    <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-100">
                      <div className="text-[9px] font-black uppercase text-amber-800">Integridad</div>
                      <div className="text-sm font-black text-amber-900 mt-0.5">{asset.iValue} <span className="text-[10px] text-amber-500">/ 5</span></div>
                    </div>
                    <div className="bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-100">
                      <div className="text-[9px] font-black uppercase text-indigo-800">Disponibilidad</div>
                      <div className="text-sm font-black text-indigo-900 mt-0.5">{asset.aValue} <span className="text-[10px] text-indigo-500">/ 5</span></div>
                    </div>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={asset.technicalOwner || asset.owner}>
                    Dueño: <strong className="text-slate-800">{asset.owner}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(asset)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar especificación del activo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
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
                  <th className="px-5 py-3.5">Activo de Información / Microservicio</th>
                  <th className="px-5 py-3.5">Arquitectura & Autenticación</th>
                  <th className="px-5 py-3.5">Dueño Técnico (CloudTrail)</th>
                  <th className="px-5 py-3.5">Clasificación ISO 27001</th>
                  <th className="px-5 py-3.5 text-center">Tríada CIA</th>
                  <th className="px-5 py-3.5">Ley 21.719 (Datos Personales)</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-black text-slate-800 whitespace-nowrap">
                      {asset.id}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        {getCategoryIcon(asset.category)}
                        <span>{asset.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{asset.description}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {asset.apiEndpoint ? (
                        <div className="space-y-0.5">
                          <code className="text-emerald-700 font-bold font-mono text-[10px] block">{asset.apiEndpoint}</code>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-bold">
                            {asset.authMethod}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">{asset.cloudInfrastructure.split('(')[0]}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-[150px]">
                      <div className="font-bold text-slate-800 text-[11px] truncate">{asset.owner}</div>
                      <div className="text-[10px] text-slate-400 truncate">{asset.technicalOwner || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getClassificationBadge(asset.classification)}
                      <div className="text-[9px] font-bold text-slate-400 mt-1">Criticidad: {asset.criticality}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span className="px-2 py-1 rounded bg-slate-100 font-mono text-[10px] font-black text-slate-800">
                        C:{asset.cValue} I:{asset.iValue} A:{asset.aValue}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px]">
                      {asset.containsPersonalData ? (
                        <div className="space-y-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            asset.isSensitivePersonalData ? 'bg-purple-100 text-purple-900' : 'bg-indigo-100 text-indigo-900'
                          }`}>
                            {asset.isSensitivePersonalData ? 'Sensible Art. 2' : 'Datos Personales'}
                          </span>
                          <p className="text-[10px] text-slate-500 truncate">{asset.personalDataTypes.join(', ')}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No aplica</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(asset)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedAsset(asset)}
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

      {/* MODAL: FICHA TÉCNICA DETALLADA DEL ACTIVO */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-slate-950 text-white font-mono text-xs font-black">
                    {selectedAsset.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">
                    {selectedAsset.category}
                  </span>
                  {getClassificationBadge(selectedAsset.classification)}
                  <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                    selectedAsset.criticality === 'Crítica' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    Criticidad: {selectedAsset.criticality}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-950 mt-1">
                  {selectedAsset.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedAsset.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid with 3 major sections */}
            <div className="space-y-6 text-xs text-slate-600">
              
              {/* 1. Arquitectura API Gateway & Cloud */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Especificación Técnica de API Gateway & Cloud (ApiGw-resument)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Ruta / Endpoint API</span>
                    <code className="text-emerald-700 font-bold font-mono bg-white px-2 py-1 rounded border border-slate-200 block mt-0.5">
                      {selectedAsset.apiEndpoint || 'Endpoint interno de microservicio privado'}
                    </code>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Mecanismo de Autenticación</span>
                    <div className="font-bold text-slate-800 mt-0.5">{selectedAsset.authMethod}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Infraestructura AWS</span>
                    <div className="font-medium text-slate-700 mt-0.5">{selectedAsset.cloudInfrastructure}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Dueño Técnico (CloudTrail / CodeCommit)</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedAsset.technicalOwner || selectedAsset.owner}</div>
                  </div>
                </div>
              </div>

              {/* 2. Expediente Ley 21.719 (Protección de Datos Personales) */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-indigo-950 uppercase tracking-wider text-xs flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Ficha de Privacidad & Cumplimiento Ley 21.719 (Chile)</span>
                  </h4>
                  {selectedAsset.isSensitivePersonalData && (
                    <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-black text-[10px] uppercase">
                      🚨 Contiene Datos Sensibles Art. 2
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-900/60 block">Tipos de Datos Personales Tratados</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAsset.personalDataTypes.map((type, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white rounded border border-indigo-200 text-indigo-900 font-bold text-[10px]">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-900/60 block">Base Legal de Tratamiento (Art. 13)</span>
                    <div className="font-bold text-indigo-950 mt-1">{selectedAsset.legalBasisLey21719}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-900/60 block">Titulares de Datos Afectados</span>
                    <div className="font-medium text-slate-700 mt-1">
                      {(selectedAsset.dataSubjects || []).join(', ')}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-900/60 block">Plazo de Conservación / Retención</span>
                    <div className="font-bold text-slate-900 mt-1">{selectedAsset.retentionPeriod}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-100/60 flex items-center justify-between text-[11px]">
                  <span>Transferencia Internacional de Datos:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAsset.internationalTransfer ? 'SÍ (AWS us-east-1 con Cláusulas Contractuales Tipo)' : 'NO (Almacenamiento Local)'}
                  </span>
                </div>
              </div>

              {/* 3. Tríada CIA (ISO 27005) & Medidas de Seguridad ISO 27001 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Tríada de Seguridad CIA (ISO 27005) & Controles Anexo A</span>
                </h4>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black text-blue-700 uppercase block">Confidencialidad (C)</span>
                    <span className="text-xl font-black text-blue-900 mt-1 block">{selectedAsset.cValue} / 5</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Protección anti-fugas</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black text-amber-700 uppercase block">Integridad (I)</span>
                    <span className="text-xl font-black text-amber-900 mt-1 block">{selectedAsset.iValue} / 5</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Sin alteraciones</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black text-indigo-700 uppercase block">Disponibilidad (A)</span>
                    <span className="text-xl font-black text-indigo-900 mt-1 block">{selectedAsset.aValue} / 5</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Uptime y resiliencia</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Medidas de Seguridad ISO 27001 Activas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAsset.securityMeasures.map((measure, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{measure}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linked Risks section */}
              {itRisks.filter(r => r.assetId === selectedAsset.id).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">Amenazas Evaluadas en la Matriz:</h4>
                  <div className="space-y-1.5">
                    {itRisks.filter(r => r.assetId === selectedAsset.id).map(r => (
                      <div key={r.id} className="p-2.5 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-red-900">{r.id}:</strong> {r.name}
                        </div>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black">
                          Score: {r.probability * Math.max(r.cImpact, r.iImpact, r.aImpact)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedAsset(null);
                  handleOpenEditModal(selectedAsset);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Editar Activo
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR ACTIVO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>{editingAsset ? `Editar Activo: ${editingAsset.id}` : 'Registrar Nuevo Activo de Información TI'}</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Identificador Único (ID)</label>
                  <input
                    required
                    type="text"
                    value={assetFormData.id}
                    onChange={e => setAssetFormData({ ...assetFormData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                    placeholder="AST-GW-01 o DAT-DB-01"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Categoría Arquitectónica</label>
                  <select
                    value={assetFormData.category}
                    onChange={e => setAssetFormData({ ...assetFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="API Gateway / Microservicio">API Gateway / Microservicio</option>
                    <option value="Base de Datos">Base de Datos</option>
                    <option value="Almacenamiento S3 / Bóvedas">Almacenamiento S3 / Bóvedas</option>
                    <option value="Criptografía & Identidad">Criptografía & Identidad</option>
                    <option value="Infraestructura Cloud & EKS">Infraestructura Cloud & EKS</option>
                    <option value="Repositorio & CI/CD">Repositorio & CI/CD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Nombre Oficial del Activo / Servicio</label>
                <input
                  required
                  type="text"
                  value={assetFormData.name}
                  onChange={e => setAssetFormData({ ...assetFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  placeholder="Ej: Core Wallet & Ledger Service API"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Descripción Funcional y Operativa</label>
                <textarea
                  rows={3}
                  required
                  value={assetFormData.description}
                  onChange={e => setAssetFormData({ ...assetFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700"
                  placeholder="Describa el rol que cumple el componente dentro del flujo financiero de Global66..."
                />
              </div>

              {/* API Gateway & Cloud Section */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                <h5 className="font-black text-slate-800 text-xs">Especificación de API Gateway & Cloud (ApiGw-resument)</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Ruta / Endpoint API</label>
                    <input
                      type="text"
                      value={assetFormData.apiEndpoint || ''}
                      onChange={e => setAssetFormData({ ...assetFormData, apiEndpoint: e.target.value })}
                      placeholder="/v1/wallets/*"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Mecanismo de Autenticación</label>
                    <select
                      value={assetFormData.authMethod}
                      onChange={e => setAssetFormData({ ...assetFormData, authMethod: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="Cognito JWT / OAuth2">Cognito JWT / OAuth2</option>
                      <option value="mTLS Perimetral">mTLS Perimetral</option>
                      <option value="AWS IAM / SigV4">AWS IAM / SigV4</option>
                      <option value="API Key + WAF">API Key + WAF</option>
                      <option value="Público (WAF Protegido)">Público (WAF Protegido)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Dueño de Negocio (Owner)</label>
                    <input
                      type="text"
                      value={assetFormData.owner}
                      onChange={e => setAssetFormData({ ...assetFormData, owner: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white"
                      placeholder="Líder de Arquitectura Core TI"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Dueño Técnico (CloudTrail / CodeCommit)</label>
                    <input
                      type="text"
                      value={assetFormData.technicalOwner || ''}
                      onChange={e => setAssetFormData({ ...assetFormData, technicalOwner: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white"
                      placeholder="Tech Lead (CodeCommit: wallet-service)"
                    />
                  </div>
                </div>
              </div>

              {/* Ley 21.719 Section */}
              <div className="p-4 bg-indigo-50/50 rounded-xl space-y-3 border border-indigo-100">
                <h5 className="font-black text-indigo-950 text-xs">Cumplimiento Ley 21.719 (Protección de Datos Personales Chile)</h5>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={assetFormData.containsPersonalData}
                      onChange={e => setAssetFormData({ ...assetFormData, containsPersonalData: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Trata Datos Personales</span>
                  </label>

                  {assetFormData.containsPersonalData && (
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
                      <input
                        type="checkbox"
                        checked={assetFormData.isSensitivePersonalData || false}
                        onChange={e => setAssetFormData({ ...assetFormData, isSensitivePersonalData: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span>¿Datos Sensibles Art. 2 (Biometría / Salud / PEP)?</span>
                    </label>
                  )}
                </div>

                {assetFormData.containsPersonalData && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-indigo-900/60 block">Tipos de Datos Personales Almacenados</label>
                    <div className="flex flex-wrap gap-1">
                      {assetFormData.personalDataTypes.map((type, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-900 text-[10px] font-bold flex items-center gap-1">
                          <span>{type}</span>
                          <button
                            type="button"
                            onClick={() => setAssetFormData({
                              ...assetFormData,
                              personalDataTypes: assetFormData.personalDataTypes.filter((_, i) => i !== idx)
                            })}
                            className="text-red-500 hover:text-red-700 font-mono text-[9px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={personalDataInput}
                        onChange={e => setPersonalDataInput(e.target.value)}
                        placeholder="Ej: RUT, Cédula, Biometría Facial, Saldos..."
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (personalDataInput.trim()) {
                            setAssetFormData({
                              ...assetFormData,
                              personalDataTypes: [...assetFormData.personalDataTypes, personalDataInput.trim()]
                            });
                            setPersonalDataInput('');
                          }
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                      >
                        Añadir
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-indigo-900/60">Base Legal Ley 21.719</label>
                        <select
                          value={assetFormData.legalBasisLey21719}
                          onChange={e => setAssetFormData({ ...assetFormData, legalBasisLey21719: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-bold"
                        >
                          <option value="Ejecución contractual">Ejecución contractual</option>
                          <option value="Obligación legal (CMF / UAF)">Obligación legal (CMF / UAF)</option>
                          <option value="Consentimiento expreso e informado">Consentimiento expreso e informado</option>
                          <option value="Interés legítimo">Interés legítimo</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-indigo-900/60">Plazo de Conservación</label>
                        <input
                          type="text"
                          value={assetFormData.retentionPeriod}
                          onChange={e => setAssetFormData({ ...assetFormData, retentionPeriod: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                          placeholder="5 años conforme a NCG 464 CMF"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tríada CIA & Clasificación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Clasificación ISO 27001 (A.5.12)</label>
                  <select
                    value={assetFormData.classification}
                    onChange={e => setAssetFormData({ ...assetFormData, classification: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Altamente Confidencial">Altamente Confidencial</option>
                    <option value="Confidencial">Confidencial</option>
                    <option value="Restringido">Restringido</option>
                    <option value="Uso Interno">Uso Interno</option>
                    <option value="Público">Público</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Criticidad del Negocio</label>
                  <select
                    value={assetFormData.criticality}
                    onChange={e => setAssetFormData({ ...assetFormData, criticality: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              {/* Tríada CIA Values */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Valoración Tríada CIA (ISO 27005 escala 1 a 5)</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-blue-700 block">Confidencialidad (C)</label>
                    <select
                      value={assetFormData.cValue}
                      onChange={e => setAssetFormData({ ...assetFormData, cValue: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white font-bold"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-700 block">Integridad (I)</label>
                    <select
                      value={assetFormData.iValue}
                      onChange={e => setAssetFormData({ ...assetFormData, iValue: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white font-bold"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-indigo-700 block">Disponibilidad (A)</label>
                    <select
                      value={assetFormData.aValue}
                      onChange={e => setAssetFormData({ ...assetFormData, aValue: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white font-bold"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm"
                >
                  {editingAsset ? 'Actualizar Activo' : 'Guardar Activo en Inventario'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
