import React, { useState, useMemo } from 'react';
import { Risk, getRiskLevel, getRiskColor, getRiskEmoji, GLOBAL66_PROCESS_TAXONOMY, ProcessMacroCategory } from '../types';
import { resolveTaxonomyForRisk, OFFICIAL_SUBPROCESSES } from '../lib/processTaxonomyHelper';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Inbox, 
  FileSpreadsheet, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Presentation, 
  Table as TableIcon, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Layers, 
  User, 
  Eye, 
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface RiskTableProps {
  risks: Risk[];
  onDownloadGlobalExcel: () => void;
  onDownloadSegmentExcel: () => void;
  selectedAreaLabel: string;
  onUpdateRisk?: (riskId: string, updates: Partial<Risk>) => void;
  onDeleteRisk?: (riskId: string) => void;
  onNavigateToIntegrator?: () => void;
}

export const RiskTable: React.FC<RiskTableProps> = ({ 
  risks, 
  onDownloadGlobalExcel, 
  onDownloadSegmentExcel, 
  selectedAreaLabel,
  onUpdateRisk,
  onDeleteRisk,
  onNavigateToIntegrator
}) => {
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  
  // View Modes: 'presentation_table' (executive table for slides), 'slide_cards' (PPT Cards), 'full_audit' (all 14 technical columns)
  const [viewLayout, setViewLayout] = useState<'presentation_table' | 'slide_cards' | 'full_audit'>('presentation_table');
  
  // Spacing Density
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Sorting State
  type SortField = 'id' | 'processArea' | 'process' | 'score' | 'roamStatus';
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRisks = useMemo(() => {
    const list = [...risks];
    return list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'id') {
        cmp = a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortField === 'processArea') {
        cmp = (a.processArea || '').localeCompare(b.processArea || '');
      } else if (sortField === 'process') {
        cmp = (a.process || '').localeCompare(b.process || '');
      } else if (sortField === 'score') {
        const scoreA = (a.impact || 1) * (a.probability || 1);
        const scoreB = (b.impact || 1) * (b.probability || 1);
        cmp = scoreA - scoreB;
      } else if (sortField === 'roamStatus') {
        cmp = (a.roamStatus || 'Mitigated').localeCompare(b.roamStatus || 'Mitigated');
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [risks, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      {/* Top Toolbar: PPT / Executive View Mode Switchers & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        
        {/* Visual Mode Selector (Perfect for PowerPoint / Meetings) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5">
            <Presentation size={14} className="text-indigo-600" />
            Modo Visual:
          </span>
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewLayout('presentation_table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'presentation_table'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="Vista tabular amplia optimizada para diapositivas ejecutivas"
            >
              <TableIcon size={13} className={viewLayout === 'presentation_table' ? 'text-amber-400' : ''} />
              <span>Tabla Ejecutiva (PPT)</span>
            </button>
            <button
              onClick={() => setViewLayout('slide_cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'slide_cards'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="Tarjetas ejecutivas ideales para recortar o presentar en láminas de PowerPoint"
            >
              <Sparkles size={13} className={viewLayout === 'slide_cards' ? 'text-amber-400' : ''} />
              <span>Tarjetas de Presentación</span>
            </button>
            <button
              onClick={() => setViewLayout('full_audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'full_audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="Vista técnica extendida con las 14 columnas de auditoría"
            >
              <SlidersHorizontal size={13} />
              <span>Auditoría Completa (14 cols)</span>
            </button>
          </div>
        </div>

        {/* Spacing Density & Excel Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {viewLayout !== 'slide_cards' && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setDensity('comfortable')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                  density === 'comfortable' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Espaciado PPT
              </button>
              <button
                onClick={() => setDensity('compact')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                  density === 'compact' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Compacto
              </button>
            </div>
          )}

          {onNavigateToIntegrator && (
            <button
              onClick={onNavigateToIntegrator}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              <span>Subir Matriz</span>
            </button>
          )}

          <button
            onClick={onDownloadGlobalExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
            title="Descargar matriz con todos los riesgos consolidados de la compañía"
          >
            <Inbox size={13} />
            <span>Excel Global</span>
          </button>
          
          <button
            onClick={onDownloadSegmentExcel}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              selectedAreaLabel.toLowerCase().includes('bre-b')
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white ring-2 ring-emerald-500/40 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title={`Descargar matriz en Excel filtrada por ${selectedAreaLabel}`}
          >
            <FileSpreadsheet size={13} className={selectedAreaLabel.toLowerCase().includes('bre-b') ? 'text-amber-300' : ''} />
            <span>Descargar {selectedAreaLabel} (Excel)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PRESENTATION TABLE (Executive, Airy, No Cramping, High-Legibility) */}
      {viewLayout === 'presentation_table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-sm border-collapse min-w-[1100px]">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-800 select-none">
              <tr>
                <th 
                  onClick={() => handleSort('id')} 
                  className="px-4 py-3.5 w-24 text-center cursor-pointer hover:bg-slate-800 transition-colors"
                  title="Clic para ordenar por ID"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ID</span>
                    {sortField === 'id' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-amber-400" /> : <ArrowDown size={12} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('processArea')} 
                  className="px-4 py-3.5 w-36 cursor-pointer hover:bg-slate-800 transition-colors"
                  title="Clic para ordenar por Área"
                >
                  <div className="flex items-center gap-1">
                    <span>Área / Negocio</span>
                    {sortField === 'processArea' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-amber-400" /> : <ArrowDown size={12} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('process')} 
                  className="px-5 py-3.5 w-52 cursor-pointer hover:bg-slate-800 transition-colors"
                  title="Clic para ordenar por Proceso"
                >
                  <div className="flex items-center gap-1">
                    <span>Proceso / Paso</span>
                    {sortField === 'process' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-amber-400" /> : <ArrowDown size={12} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 min-w-[280px]">Riesgo Identificado (ISO 31000)</th>
                <th className="px-5 py-3.5 min-w-[260px]">Causas Raíz</th>
                <th className="px-5 py-3.5 min-w-[280px]">Controles Mitigantes Definidos</th>
                <th 
                  onClick={() => handleSort('score')} 
                  className="px-4 py-3.5 w-36 text-center cursor-pointer hover:bg-slate-800 transition-colors"
                  title="Clic para ordenar por Nivel de Riesgo"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Nivel Riesgo</span>
                    {sortField === 'score' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-amber-400" /> : <ArrowDown size={12} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('roamStatus')} 
                  className="px-4 py-3.5 w-40 cursor-pointer hover:bg-slate-800 transition-colors"
                  title="Clic para ordenar por ROAM"
                >
                  <div className="flex items-center gap-1">
                    <span>Gestión ROAM</span>
                    {sortField === 'roamStatus' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-amber-400" /> : <ArrowDown size={12} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3.5 w-16 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRisks.map((risk) => {
                const score = risk.impact * risk.probability;
                const level = getRiskLevel(score);
                const colorClass = getRiskColor(level);
                const emoji = getRiskEmoji(level);
                
                const residualScore = risk.residualImpact && risk.residualProbability ? risk.residualImpact * risk.residualProbability : null;
                const residualLevel = residualScore ? getRiskLevel(residualScore) : null;
                const residualColor = residualLevel ? getRiskColor(residualLevel) : '';

                const causes = (risk.cause || '').split('\n').map(c => c.trim()).filter(Boolean);
                const controls = (risk.suggestedControl || risk.documentControl || '').split('\n').map(c => c.trim()).filter(Boolean);

                const padClass = density === 'comfortable' ? 'py-4 px-4' : 'py-2.5 px-3';

                return (
                  <tr key={risk.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* ID */}
                    <td className={`${padClass} text-center align-top`}>
                      <span className="inline-block font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {risk.id}
                      </span>
                      {risk.product && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {risk.product === 'Bre-B' ? '⚡' : risk.product === 'Stablecoins' ? '🪙' : risk.product === 'Integración SII Chile' ? '🇨🇱' : risk.product === 'APIB2B(MCP)' ? '🤖' : risk.product === 'Integración CCE - Perú' ? '🇵🇪' : risk.product === 'Adquirencia Global' ? '💳' : risk.product === 'Payout Swift JPMorgan' ? '🏛️' : risk.product === 'Global chats' ? '💬' : risk.product === 'Cuentas Virtuales' ? '🏦' : risk.product === 'GlobalID' ? '🪪' : '✨'} {risk.product}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Área */}
                    <td className={`${padClass} align-top`}>
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight ${
                          risk.processArea === 'Cumplimiento' ? 'bg-blue-100 text-blue-800' :
                          risk.processArea === 'Fraude' ? 'bg-purple-100 text-purple-800' :
                          risk.processArea === 'Ciberseguridad' ? 'bg-cyan-100 text-cyan-800' :
                          risk.processArea === 'Mesa de Dinero' ? 'bg-amber-100 text-amber-800' :
                          risk.processArea === 'Operaciones' ? 'bg-indigo-100 text-indigo-800' :
                          risk.processArea === 'Nuevos Productos' ? 'bg-amber-100 text-amber-900 font-extrabold' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {risk.processArea}
                        </span>
                        {risk.secondaryProcessArea && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            + {risk.secondaryProcessArea}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Proceso / Paso con Taxonomía Regional Oficial */}
                    <td className={`${padClass} align-top`}>
                      {(() => {
                        const tax = resolveTaxonomyForRisk(risk);
                        return (
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-[#102A97] border border-blue-200">
                                {tax.macrocategory}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                #{tax.taxonomyProcessId} {tax.taxonomyProcessName}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                              <span className="text-blue-600">🎯</span>
                              <span>{tax.subproceso}</span>
                            </div>
                            <div className="text-xs text-slate-600 font-medium">
                              {risk.process}
                            </div>
                            {risk.origin && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase text-slate-400">
                                Origen: {risk.origin}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Riesgo Identificado */}
                    <td className={`${padClass} align-top`}>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {risk.riskDescription}
                      </p>
                    </td>

                    {/* Causas Raíz (Clean bullet list with no cramped cards) */}
                    <td className={`${padClass} align-top`}>
                      {causes.length === 0 ? (
                        <span className="text-slate-400 italic text-xs">Sin causa especificada</span>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {causes.map((cause, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                              <span>{cause}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>

                    {/* Controles Mitigantes (Clean high-contrast points) */}
                    <td className={`${padClass} align-top`}>
                      {controls.length === 0 ? (
                        <span className="text-slate-400 italic text-xs">Sin control asignado</span>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                          {controls.map((control, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{control}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>

                    {/* Nivel Riesgo (Inherente vs Residual) */}
                    <td className={`${padClass} text-center align-top`}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${colorClass}`}>
                          {emoji} {level} ({score})
                        </div>
                        {residualScore && (
                          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${residualColor}`}>
                            Residual: {residualLevel} ({residualScore})
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Gestión ROAM */}
                    <td className={`${padClass} align-top`}>
                      <div className="flex flex-col gap-1">
                        <select
                          value={risk.roamStatus || 'Mitigated'}
                          onChange={(e) => onUpdateRisk?.(risk.id, { roamStatus: e.target.value as any })}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                            (risk.roamStatus || 'Mitigated') === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            (risk.roamStatus || 'Mitigated') === 'Owned' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            (risk.roamStatus || 'Mitigated') === 'Accepted' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-cyan-50 text-cyan-800 border-cyan-200'
                          }`}
                        >
                          <option value="Resolved">🟢 Resolved</option>
                          <option value="Owned">🔵 Owned</option>
                          <option value="Accepted">🟡 Accepted</option>
                          <option value="Mitigated">🟣 Mitigated</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Risk Owner..."
                          value={risk.roamOwner || ''}
                          onChange={(e) => onUpdateRisk?.(risk.id, { roamOwner: e.target.value })}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-700 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className={`${padClass} text-center align-top`}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingRisk(risk)}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Editar riesgo"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          disabled={risk.status === 'Aprobado'}
                          onClick={() => onDeleteRisk?.(risk.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            risk.status === 'Aprobado'
                              ? 'text-slate-200 cursor-not-allowed opacity-40 bg-transparent'
                              : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer'
                          }`}
                          title={risk.status === 'Aprobado' ? "Los riesgos aprobados son definitivos e inmutables" : "Eliminar riesgo"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: SLIDE CARDS (Perfect for PPT screen captures & slide insertions) */}
      {viewLayout === 'slide_cards' && (
        <div className="grid grid-cols-1 gap-4">
          {sortedRisks.map((risk) => {
            const score = risk.impact * risk.probability;
            const level = getRiskLevel(score);
            const colorClass = getRiskColor(level);
            const emoji = getRiskEmoji(level);

            const residualScore = risk.residualImpact && risk.residualProbability ? risk.residualImpact * risk.residualProbability : null;
            const residualLevel = residualScore ? getRiskLevel(residualScore) : null;
            const residualColor = residualLevel ? getRiskColor(residualLevel) : '';

            const causes = (risk.cause || '').split('\n').map(c => c.trim()).filter(Boolean);
            const controls = (risk.suggestedControl || risk.documentControl || '').split('\n').map(c => c.trim()).filter(Boolean);

            return (
              <div 
                key={risk.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 space-y-4"
              >
                {/* Top Header Line */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-black px-2.5 py-1 bg-slate-900 text-white rounded-lg">
                      {risk.id}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      risk.processArea === 'Cumplimiento' ? 'bg-blue-100 text-blue-800' :
                      risk.processArea === 'Fraude' ? 'bg-purple-100 text-purple-800' :
                      risk.processArea === 'Ciberseguridad' ? 'bg-cyan-100 text-cyan-800' :
                      risk.processArea === 'Mesa de Dinero' ? 'bg-amber-100 text-amber-800' :
                      risk.processArea === 'Operaciones' ? 'bg-indigo-100 text-indigo-800' :
                      risk.processArea === 'Nuevos Productos' ? 'bg-amber-100 text-amber-900 font-black' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {risk.processArea}
                    </span>
                    {risk.product && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        ⚡ {risk.product}
                      </span>
                    )}
                    {(() => {
                      const tax = resolveTaxonomyForRisk(risk);
                      return (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                          <span className="font-bold text-[#102A97]">[{tax.macrocategory} › #{tax.taxonomyProcessId}]</span>
                          <span className="font-semibold text-slate-800">🎯 {tax.subproceso}</span>
                          <span className="text-slate-500">• {risk.process}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Badges of Risk & Residual */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${colorClass}`}>
                      {emoji} Inherente: {level} ({score})
                    </span>
                    {residualScore && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${residualColor}`}>
                        Residual: {residualLevel} ({residualScore})
                      </span>
                    )}
                    <button
                      onClick={() => setEditingRisk(risk)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>

                {/* 3 Columns Slide Body: Risk Statement, Causes, Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Col 1: Riesgo Identificado */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                      <Target size={12} className="text-rose-500" />
                      1. Riesgo Identificado
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {risk.riskDescription}
                    </p>
                  </div>

                  {/* Col 2: Causas Raíz */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                      <Layers size={12} className="text-amber-500" />
                      2. Causas Raíz
                    </span>
                    {causes.length === 0 ? (
                      <span className="text-slate-400 italic text-xs">Sin causa registrada</span>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {causes.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Col 3: Controles Mitigantes */}
                  <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/60 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block flex items-center gap-1">
                      <ShieldCheck size={13} className="text-indigo-600" />
                      3. Control Mitigante
                    </span>
                    {controls.length === 0 ? (
                      <span className="text-slate-400 italic text-xs">Sin control asignado</span>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                        {controls.map((ctl, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <span>{ctl}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Footer Info: ROAM & Owner */}
                <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Tratamiento ROAM:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                      {risk.roamStatus || 'Mitigated'}
                    </span>
                  </div>
                  {risk.roamOwner && (
                    <div className="flex items-center gap-1 text-slate-700">
                      <User size={13} className="text-slate-400" />
                      <strong>Dueño / Owner:</strong> {risk.roamOwner}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: FULL AUDIT TABLE (14 Columns, Exact Technical Breakdown) */}
      {viewLayout === 'full_audit' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-sm border-collapse min-w-[1400px]">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-xs select-none">
              <tr>
                <th onClick={() => handleSort('id')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    {sortField === 'id' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-slate-900" /> : <ArrowDown size={11} className="text-slate-900" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-400" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('processArea')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Área</span>
                    {sortField === 'processArea' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-slate-900" /> : <ArrowDown size={11} className="text-slate-900" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-400" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('process')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Proceso / Paso</span>
                    {sortField === 'process' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-slate-900" /> : <ArrowDown size={11} className="text-slate-900" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3">Riesgo Identificado</th>
                <th className="px-5 py-3">Causa</th>
                <th className="px-5 py-3">Control Definido</th>
                <th className="px-3 py-3 text-center">Impacto</th>
                <th className="px-3 py-3 text-center">Probab.</th>
                <th onClick={() => handleSort('score')} className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>Valoración</span>
                    {sortField === 'score' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-slate-900" /> : <ArrowDown size={11} className="text-slate-900" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-center">IC</th>
                <th className="px-4 py-3 text-center">Residual (I/P)</th>
                <th className="px-4 py-3">Aceptabilidad</th>
                <th onClick={() => handleSort('roamStatus')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Gestión ROAM</span>
                    {sortField === 'roamStatus' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-slate-900" /> : <ArrowDown size={11} className="text-slate-900" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRisks.map((risk) => {
                const score = risk.impact * risk.probability;
                const level = getRiskLevel(score);
                const colorClass = getRiskColor(level);
                const emoji = getRiskEmoji(level);
                
                const residualScore = risk.residualImpact && risk.residualProbability ? risk.residualImpact * risk.residualProbability : null;
                const residualLevel = residualScore ? getRiskLevel(residualScore) : null;
                const residualColor = residualLevel ? getRiskColor(residualLevel) : '';

                const causes = (risk.cause || '').split('\n').map(c => c.trim()).filter(Boolean);
                const controls = (risk.suggestedControl || risk.documentControl || '').split('\n').map(c => c.trim()).filter(Boolean);

                return (
                  <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700 align-top">
                      <div>{risk.id}</div>
                      {risk.product && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {risk.product}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {risk.processArea}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-semibold text-slate-900 text-xs">
                      {risk.process}
                    </td>
                    <td className="px-5 py-3 align-top text-xs text-slate-700 max-w-xs leading-relaxed">
                      {risk.riskDescription}
                    </td>
                    <td className="px-5 py-3 align-top text-xs text-slate-600 max-w-xs leading-relaxed">
                      <ul className="space-y-1">
                        {causes.map((c, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3 align-top text-xs text-slate-800 font-medium max-w-xs leading-relaxed">
                      <ul className="space-y-1">
                        {controls.map((ctl, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <ShieldCheck size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span>{ctl}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-3 text-center align-top font-bold text-slate-700 text-xs">
                      {risk.impact}
                    </td>
                    <td className="px-3 py-3 text-center align-top font-bold text-slate-700 text-xs">
                      {risk.probability}
                    </td>
                    <td className="px-4 py-3 text-center align-top">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
                        {emoji} {level} ({score})
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center align-top text-xs font-bold text-slate-600">
                      {risk.controlIndex ? `${risk.controlIndex.toFixed(0)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center align-top">
                      {residualScore ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${residualColor}`}>
                          I:{risk.residualImpact} P:{risk.residualProbability} ({residualScore})
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs font-semibold">
                      {(() => {
                        const currentScore = residualScore || score;
                        const isAcceptable = currentScore <= 12;
                        return (
                          <span className={isAcceptable ? 'text-green-600' : 'text-red-600'}>
                            {isAcceptable ? 'ACEPTABLE' : 'NO ACEPTABLE'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-xs font-bold text-slate-700">
                        {risk.roamStatus || 'Mitigated'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center align-top">
                      <button
                        onClick={() => setEditingRisk(risk)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editing Modal */}
      {editingRisk && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Edit2 size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Editar Registro: {editingRisk.id}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Modificación de Parámetros ISO 31000</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingRisk(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* CASACADA DE TAXONOMÍA OFICIAL REGIONAL */}
              {(() => {
                const currentTax = resolveTaxonomyForRisk(editingRisk);
                const macro = editingRisk.macrocategory || currentTax.macrocategory;
                const procId = editingRisk.taxonomyProcessId || currentTax.taxonomyProcessId;
                const availableProcs = GLOBAL66_PROCESS_TAXONOMY.filter(p => p.macrocategory === macro);
                const availableSubps = OFFICIAL_SUBPROCESSES[procId] || ['Operación general del proceso'];
                const subp = editingRisk.subproceso && availableSubps.includes(editingRisk.subproceso)
                  ? editingRisk.subproceso
                  : (availableSubps[0] || currentTax.subproceso);

                return (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#102A97] block">
                      Alineación con Taxonomía Regional (14 Procesos Oficiales)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">1. Macroproceso</label>
                        <select
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          value={macro}
                          onChange={e => {
                            const newMacro = e.target.value as ProcessMacroCategory;
                            const firstProc = GLOBAL66_PROCESS_TAXONOMY.find(p => p.macrocategory === newMacro) || GLOBAL66_PROCESS_TAXONOMY[0];
                            const firstSubp = (OFFICIAL_SUBPROCESSES[firstProc.id] || [])[0] || 'Operación general';
                            const res = resolveTaxonomyForRisk({
                              macrocategory: newMacro,
                              taxonomyProcessId: firstProc.id,
                              subproceso: firstSubp
                            });
                            setEditingRisk({
                              ...editingRisk,
                              macrocategory: newMacro,
                              taxonomyProcessId: firstProc.id,
                              taxonomyProcessName: firstProc.categoryLevel1,
                              subproceso: firstSubp,
                              processArea: res.processArea
                            });
                          }}
                        >
                          {(['Estratégicos', 'Misionales', 'De Apoyo', 'Evaluación Independiente'] as ProcessMacroCategory[]).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">2. Proceso N1</label>
                        <select
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          value={procId}
                          onChange={e => {
                            const newId = Number(e.target.value);
                            const pDef = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === newId);
                            if (!pDef) return;
                            const firstSubp = (OFFICIAL_SUBPROCESSES[newId] || [])[0] || 'Operación general';
                            const res = resolveTaxonomyForRisk({
                              macrocategory: pDef.macrocategory,
                              taxonomyProcessId: newId,
                              subproceso: firstSubp
                            });
                            setEditingRisk({
                              ...editingRisk,
                              macrocategory: pDef.macrocategory,
                              taxonomyProcessId: newId,
                              taxonomyProcessName: pDef.categoryLevel1,
                              subproceso: firstSubp,
                              processArea: res.processArea
                            });
                          }}
                        >
                          {availableProcs.map(p => (
                            <option key={p.id} value={p.id}>#{p.id} {p.categoryLevel1}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">3. Subproceso N2</label>
                        <select
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold truncate"
                          value={subp}
                          onChange={e => {
                            const newSubp = e.target.value;
                            const res = resolveTaxonomyForRisk({
                              macrocategory: macro,
                              taxonomyProcessId: procId,
                              subproceso: newSubp
                            });
                            setEditingRisk({
                              ...editingRisk,
                              subproceso: newSubp,
                              processArea: res.processArea
                            });
                          }}
                        >
                          {availableSubps.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Actividad / Paso Específico</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 font-medium"
                    value={editingRisk.process}
                    onChange={e => setEditingRisk({ ...editingRisk, process: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Área Primaria</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 bg-white font-medium"
                    value={editingRisk.processArea}
                    onChange={e => setEditingRisk({ ...editingRisk, processArea: e.target.value as any })}
                  >
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
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Descripción del Riesgo</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 font-medium"
                  value={editingRisk.riskDescription}
                  onChange={e => setEditingRisk({ ...editingRisk, riskDescription: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Causa / Factor</span>
                  <span className="text-[9px] text-indigo-500 font-bold lowercase normal-case">Presiona Enter para agregar múltiples causas</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 font-medium"
                  value={editingRisk.cause}
                  onChange={e => setEditingRisk({ ...editingRisk, cause: e.target.value })}
                  placeholder="Ej:&#10;Causa 1&#10;Causa 2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Control General Sugerido / Mitigante</span>
                  <span className="text-[9px] text-indigo-500 font-bold lowercase normal-case">Presiona Enter para agregar múltiples controles</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-slate-700 font-medium"
                  value={editingRisk.suggestedControl || editingRisk.documentControl || ''}
                  onChange={e => setEditingRisk({ ...editingRisk, suggestedControl: e.target.value })}
                  placeholder="Ej:&#10;Control 1&#10;Control 2"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingRisk(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold transition text-slate-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateRisk) {
                    const submittedControl = (editingRisk.suggestedControl || '').trim();
                    const hasControl = submittedControl.length > 0 || (editingRisk.documentControl || '').trim().length > 0;
                    
                    const updatedRisk = {
                      ...editingRisk,
                      suggestedControl: hasControl 
                        ? submittedControl 
                        : 'Soporte y Mitigación de Auditoría Interna Permanente - ISO 31000',
                      controlDuration: hasControl 
                        ? (editingRisk.controlDuration || 'Permanente') 
                        : 'Permanente'
                    };
                    onUpdateRisk(editingRisk.id, updatedRisk);
                  }
                  setEditingRisk(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Save size={14} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
