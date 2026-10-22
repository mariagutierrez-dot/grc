import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Lock, 
  ShieldCheck, 
  Database, 
  Search, 
  Filter, 
  BookOpen, 
  UserCheck, 
  AlertTriangle, 
  Eye, 
  Download, 
  ArrowRight, 
  Check, 
  X, 
  FileText, 
  Globe, 
  Layers2, 
  Server, 
  Key, 
  HardDrive, 
  ExternalLink,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  DataClassificationItem, 
  DATA_CLASSIFICATION_CATALOG, 
  ISO_CLASSIFICATION_GUIDELINES,
  ComprehensiveITAsset 
} from '../data/tiAssetsAndDataClassification';

interface TIDataClassificationViewProps {
  assets: ComprehensiveITAsset[];
  onSelectAsset?: (assetId: string) => void;
}

export const TIDataClassificationView: React.FC<TIDataClassificationViewProps> = ({
  assets,
  onSelectAsset
}) => {
  const [subView, setSubView] = useState<'matrix' | 'framework' | 'dataflow'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [classificationFilter, setClassificationFilter] = useState('TODOS');
  const [sensitivityFilter, setSensitivityFilter] = useState<'TODOS' | 'SENSIBLES' | 'ORDINARIOS'>('TODOS');

  // Modal detail for data classification item
  const [selectedDataElement, setSelectedDataElement] = useState<DataClassificationItem | null>(null);

  // Asset map for resolving IDs
  const assetNameMap = useMemo(() => {
    const map = new Map<string, string>();
    assets.forEach(a => map.set(a.id, a.name));
    return map;
  }, [assets]);

  // Statistics
  const stats = useMemo(() => {
    const total = DATA_CLASSIFICATION_CATALOG.length;
    const sensitiveCount = DATA_CLASSIFICATION_CATALOG.filter(d => d.isSensitiveLey21719).length;
    const highlyConfidentialCount = DATA_CLASSIFICATION_CATALOG.filter(d => d.isoClassification === 'Altamente Confidencial').length;
    const confidentialCount = DATA_CLASSIFICATION_CATALOG.filter(d => d.isoClassification === 'Confidencial').length;

    return {
      total,
      sensitiveCount,
      highlyConfidentialCount,
      confidentialCount
    };
  }, []);

  // Filtered data items
  const filteredDataItems = useMemo(() => {
    return DATA_CLASSIFICATION_CATALOG.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.dataElementName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.primaryPurpose.toLowerCase().includes(q) ||
        item.legalBasis.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q) ||
        item.dataMaskingRule.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'TODOS' || item.category === categoryFilter;
      const matchesClassification = classificationFilter === 'TODOS' || item.isoClassification === classificationFilter;
      
      let matchesSensitivity = true;
      if (sensitivityFilter === 'SENSIBLES') {
        matchesSensitivity = item.isSensitiveLey21719;
      } else if (sensitivityFilter === 'ORDINARIOS') {
        matchesSensitivity = !item.isSensitiveLey21719;
      }

      return matchesSearch && matchesCategory && matchesClassification && matchesSensitivity;
    });
  }, [searchQuery, categoryFilter, classificationFilter, sensitivityFilter]);

  const handleDownloadCSV = () => {
    let csv = '\uFEFF';
    csv += ['ID', 'Elemento de Dato', 'Categoría', 'Clasificación ISO 27001', 'Dato Sensible Ley 21.719', 'Base Legal', 'Finalidad Principal', 'Sistemas / Activos Asociados', 'Ubicación de Almacenamiento', 'Regla de Enmascaramiento', 'Política de Retención', 'Derechos ARCOP Aplicables'].join(';') + '\n';

    DATA_CLASSIFICATION_CATALOG.forEach(d => {
      const row = [
        `"${d.id}"`,
        `"${d.dataElementName.replace(/"/g, '""')}"`,
        `"${d.category}"`,
        `"${d.isoClassification}"`,
        d.isSensitiveLey21719 ? 'SÍ (Sensible Art. 2)' : 'NO',
        `"${d.legalBasis.replace(/"/g, '""')}"`,
        `"${d.primaryPurpose.replace(/"/g, '""')}"`,
        `"${d.associatedAssetIds.join(', ')}"`,
        `"${d.storageLocation.replace(/"/g, '""')}"`,
        `"${d.dataMaskingRule.replace(/"/g, '""')}"`,
        `"${d.retentionPolicy.replace(/"/g, '""')}"`,
        `"${d.arcopRightsApplicable.join(', ')}"`
      ];
      csv += row.join(';') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Clasificacion_Datos_ISO27001_Ley21719_Global66_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div id="ti_data_classification_root" className="space-y-6">
      
      {/* Top Banner explaining ISO 27001 and Ley 21.719 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-xl text-white space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                ISO 27001:2022 A.5.12 & A.5.13
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                Ley 21.719 Chile (Datos Personales)
              </span>
              <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-black uppercase tracking-widest border border-purple-500/30">
                Gobierno de Datos & Privacidad
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Tag className="w-7 h-7 text-indigo-400" />
              <span>Clasificación de Activos y de Datos Personales</span>
            </h2>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Esquema oficial de confidencialidad, etiquetado y tratamiento legítimo de la información conforme a la <strong>norma ISO 27001</strong> (controles A.5.12, A.5.13, A.8.11) y la <strong>Ley 21.719 sobre Protección de Datos Personales de Chile</strong>. Establece bases legales, finalidades de negocio, reglas de enmascaramiento y salvaguardas técnicas para toda la infraestructura de Global66.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Matriz CSV</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-slate-800/80 pt-4 mt-2">
          {[
            { id: 'matrix', label: 'Matriz de Clasificación de Datos (Ley 21.719)', icon: <Database className="w-4 h-4" /> },
            { id: 'framework', label: 'Marco de Niveles y Reglas ISO 27001', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'dataflow', label: 'Flujo de Datos & Transferencias Internacionales', icon: <Globe className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                subView === tab.id 
                  ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-900/40 border border-indigo-400/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Elementos de Dato</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Catalogados en el negocio</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Datos Sensibles Art. 2</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{stats.sensitiveCount}</h3>
          <p className="text-[10px] text-purple-700 font-bold mt-1">Biometría & Antecedentes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Altamente Confidencial</p>
          <h3 className="text-2xl font-black text-indigo-700 mt-1">{stats.highlyConfidentialCount}</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Cifrado HSM / KMS</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Enmascaramiento (A.8.11)</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">100%</h3>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">Políticas activas</p>
        </div>
      </div>

      {/* SUB-VIEW 1: MATRIZ DE CLASIFICACIÓN DE DATOS (LEY 21.719) */}
      {subView === 'matrix' && (
        <div className="space-y-4">
          
          {/* Filters and search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filtrar por elemento de dato (RUT, Biometría, Saldo, Token), base legal o regla..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
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

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TODOS">Todas las categorías de datos</option>
                  <option value="Identificatorio">Identificatorio</option>
                  <option value="Financiero y Transaccional">Financiero y Transaccional</option>
                  <option value="Biométrico / Sensible">Biométrico / Sensible</option>
                  <option value="Credenciales y Criptografía">Credenciales y Criptografía</option>
                  <option value="Cumplimiento / AML / PEP">Cumplimiento / AML / PEP</option>
                  <option value="Telemático y Conexión">Telemático y Conexión</option>
                </select>

                <select
                  value={classificationFilter}
                  onChange={e => setClassificationFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TODOS">Todas las clasificaciones ISO</option>
                  <option value="Altamente Confidencial">Altamente Confidencial</option>
                  <option value="Confidencial">Confidencial</option>
                  <option value="Restringido">Restringido</option>
                  <option value="Público">Público</option>
                </select>

                <select
                  value={sensitivityFilter}
                  onChange={e => setSensitivityFilter(e.target.value as any)}
                  className="border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TODOS">Todos (Sensibles y Ordinarios)</option>
                  <option value="SENSIBLES">🚨 Solo Sensibles Art. 2</option>
                  <option value="ORDINARIOS">Datos Personales Ordinarios</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Data Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Elemento de Dato & Categoría</th>
                    <th className="px-5 py-3.5">Clasificación ISO 27001</th>
                    <th className="px-5 py-3.5">Ley 21.719 (Sensibilidad)</th>
                    <th className="px-5 py-3.5">Base Legal & Finalidad</th>
                    <th className="px-5 py-3.5">Activos & Microservicios Donde Reside</th>
                    <th className="px-5 py-3.5">Regla Enmascaramiento (A.8.11)</th>
                    <th className="px-5 py-3.5 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDataItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-black text-slate-800 whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {item.dataElementName}
                        </div>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider mt-0.5 inline-block">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getClassificationBadge(item.isoClassification)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {item.isSensitiveLey21719 ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-black text-[10px] border border-purple-200 uppercase inline-flex items-center gap-1">
                            <span>🚨 Sensible Art. 2</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                            Dato Ordinario
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <p className="font-bold text-slate-800 text-[11px] line-clamp-1" title={item.legalBasis}>
                          {item.legalBasis}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5" title={item.primaryPurpose}>
                          {item.primaryPurpose}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {item.associatedAssetIds.map(assetId => {
                            const name = assetNameMap.get(assetId) || assetId;
                            return (
                              <button
                                key={assetId}
                                onClick={() => onSelectAsset && onSelectAsset(assetId)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[9px] font-mono font-bold transition-colors cursor-pointer"
                                title={name}
                              >
                                {assetId}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px]">
                        <code className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100 block line-clamp-2" title={item.dataMaskingRule}>
                          {item.dataMaskingRule}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDataElement(item)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                        >
                          Ver
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

      {/* SUB-VIEW 2: MARCO DE NIVELES Y REGLAS ISO 27001 */}
      {subView === 'framework' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Directrices Corporativas de Clasificación y Etiquetado ISO 27001:2022</h4>
              <p className="mt-0.5">
                Conforme a los controles <strong>A.5.12 (Clasificación de la información)</strong> y <strong>A.5.13 (Etiquetado de la información)</strong>, todos los colaboradores y sistemas automatizados de Global66 deben aplicar las siguientes directrices de seguridad física, lógica y criptográfica según el nivel asignado al activo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(ISO_CLASSIFICATION_GUIDELINES).map(guide => (
              <div 
                key={guide.level} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border uppercase inline-flex items-center gap-1.5 ${guide.badgeColor}`}>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{guide.level}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      ISO 27001 / ISO 27002
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {guide.description}
                  </p>

                  {/* Rules sections */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-slate-800 text-[11px] uppercase tracking-wider block">Reglas de Manejo & Acceso:</strong>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5 mt-1 text-[11px]">
                        {guide.handlingRules.map((rule, idx) => (
                          <li key={idx} className="leading-snug">{rule}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-slate-800 text-[11px] uppercase tracking-wider block">Almacenamiento & Cifrado:</strong>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5 mt-1 text-[11px]">
                        {guide.storageRules.map((rule, idx) => (
                          <li key={idx} className="leading-snug">{rule}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-slate-800 text-[11px] uppercase tracking-wider block">Transmisión & Canales:</strong>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5 mt-1 text-[11px]">
                        {guide.transmissionRules.map((rule, idx) => (
                          <li key={idx} className="leading-snug">{rule}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-slate-800 text-[11px] uppercase tracking-wider block">Eliminación / Destrucción Segura:</strong>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5 mt-1 text-[11px]">
                        {guide.disposalRules.map((rule, idx) => (
                          <li key={idx} className="leading-snug">{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tagged examples from the catalog */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Activos / Datos en este Nivel:</span>
                  <div className="flex flex-wrap gap-1">
                    {DATA_CLASSIFICATION_CATALOG
                      .filter(d => d.isoClassification === guide.level)
                      .slice(0, 3)
                      .map(d => (
                        <span key={d.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {d.dataElementName}
                        </span>
                      ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: FLUJO DE DATOS & TRANSFERENCIAS INTERNACIONALES */}
      {subView === 'dataflow' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Mapa de Ciclo de Vida del Dato & Arquitectura de Privacidad</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trazabilidad integral desde el ingreso del titular a través de la aplicación web o móvil, pasando por la validación biométrica en AWS API Gateway, el asentamiento en el Ledger de Aurora PostgreSQL, hasta la dispersión bancaria transfronteriza y la custodia de auditoría.
            </p>

            {/* Visual Process Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3">
              
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black uppercase">
                    Paso 1: Ingesta
                  </span>
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">AWS API Gateway</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Tráfico perimetral con CloudFront, TLS 1.3 y reglas WAF contra inyecciones SQL y ataques DDoS.
                </p>
                <div className="text-[10px] text-emerald-300 font-mono font-bold">
                  /v1/auth &middot; /v1/wallets
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-black uppercase">
                    Paso 2: Validación
                  </span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">KYC & Biometría 3D</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Prueba de vida facial y escaneo de cédula. Encriptación inmediata sin almacenamiento de imágenes crudas en memoria.
                </p>
                <div className="text-[10px] text-indigo-300 font-mono font-bold">
                  KMS CMK &middot; Rekognition
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-black uppercase">
                    Paso 3: Custodia
                  </span>
                  <Database className="w-4 h-4 text-sky-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Core Aurora & Vault</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Persistencia en base de datos PostgreSQL cifrada AES-256 en reposo y bóveda CloudHSM para tokenización PCI-DSS de tarjetas.
                </p>
                <div className="text-[10px] text-sky-300 font-mono font-bold">
                  Multi-AZ &middot; CloudHSM N1
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black uppercase">
                    Paso 4: Clearing
                  </span>
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Clearing TEF / ACH</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Túneles privados mTLS con bancos corresponsales (Chile, Colombia, Argentina) para la liquidación síncrona.
                </p>
                <div className="text-[10px] text-amber-300 font-mono font-bold">
                  mTLS &middot; Direct Connect
                </div>
              </div>

            </div>
          </div>

          {/* Garantías de Transferencia Internacional de Datos Personales (Ley 21.719) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Régimen de Transferencia Internacional de Datos (Ley 21.719 & CMF)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <strong className="text-slate-900 block font-bold">Destino Geográfico:</strong>
                <p className="text-slate-500 leading-relaxed">
                  Centros de datos de <strong>Amazon Web Services (AWS)</strong> ubicados en la región <code className="text-indigo-600 font-bold">us-east-1 (N. Virginia, Estados Unidos)</code> con certificaciones SOC 1/2/3, ISO 27001, ISO 27701 y PCI-DSS Nivel 1.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <strong className="text-slate-900 block font-bold">Instrumento Jurídico de Salvaguarda:</strong>
                <p className="text-slate-500 leading-relaxed">
                  Adhesión a <strong>Cláusulas Contractuales Tipo (Standard Contractual Clauses - SCC)</strong> con compromisos expresos de no divulgación y medidas de cifrado extremo a extremo sin acceso en texto plano por el proveedor Cloud.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <strong className="text-slate-900 block font-bold">Ejercicio de Derechos ARCOP:</strong>
                <p className="text-slate-500 leading-relaxed">
                  Los titulares chilenos pueden ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación, Oposición y Portabilidad</strong> mediante solicitud directa al canal formal de privacidad: <code className="text-indigo-600 font-bold">dpo@global66.com</code> con plazo de respuesta legal de 15 días hábiles.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: FICHA DE GOBIERNO DEL DATO PERSONAL */}
      {selectedDataElement && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-black">
                    {selectedDataElement.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">
                    {selectedDataElement.category}
                  </span>
                  {getClassificationBadge(selectedDataElement.isoClassification)}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-950 mt-1">
                  {selectedDataElement.dataElementName}
                </h3>
              </div>

              <button
                onClick={() => setSelectedDataElement(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              
              {/* Sensitivity banner */}
              {selectedDataElement.isSensitiveLey21719 ? (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Dato Personal Sensible (Artículo 2 Ley 21.719): Exige consentimiento expreso previo y medidas reforzadas de aislamiento.</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                  Dato personal ordinario tratado para el cumplimiento del contrato financiero y obligaciones normativas de la CMF.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Base Legal de Tratamiento</span>
                  <div className="font-bold text-slate-900 mt-1">{selectedDataElement.legalBasis}</div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Finalidad Primaria</span>
                  <div className="font-medium text-slate-700 mt-1">{selectedDataElement.primaryPurpose}</div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Ubicación de Almacenamiento</span>
                  <div className="font-mono text-slate-800 mt-1">{selectedDataElement.storageLocation}</div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Política de Retención Legal</span>
                  <div className="font-bold text-slate-900 mt-1">{selectedDataElement.retentionPolicy}</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-900 block">Regla de Enmascaramiento / Data Masking (ISO 27001 A.8.11):</span>
                <code className="text-emerald-950 font-bold font-mono text-xs block">{selectedDataElement.dataMaskingRule}</code>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Derechos ARCOP Aplicables al Titular (Ley 21.719):</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDataElement.arcopRightsApplicable.map((right, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold text-xs">
                      ✓ {right}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Salvaguardas de Seguridad Activas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDataElement.protectionControls.map((ctrl, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                      {ctrl}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDataElement(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
