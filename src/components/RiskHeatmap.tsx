import React, { useState } from 'react';
import { Risk, getRiskLevel } from '../types';
import { motion } from 'motion/react';
import { 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Scale, 
  LayoutGrid, 
  ListFilter, 
  Search,
  User
} from 'lucide-react';

interface RiskHeatmapProps {
  risks: Risk[];
  mode?: 'inherent' | 'residual' | 'dual';
  onCellClick?: (impact: number, prob: number, matrixType?: 'inherent' | 'residual') => void;
  onColorClick?: (color: 'BAJO' | 'MODERADO' | 'ALTO' | 'EXTREMO') => void;
  selectedCoordinate?: { impact: number; probability: number; mode?: 'inherent' | 'residual' } | null;
  selectedColorFilter?: 'BAJO' | 'MODERADO' | 'ALTO' | 'EXTREMO' | null;
  onResetFilters?: () => void;
  onModeChange?: (mode: 'inherent' | 'residual' | 'dual') => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  risks,
  mode = 'inherent',
  onCellClick,
  onColorClick,
  selectedCoordinate,
  selectedColorFilter,
  onResetFilters,
  onModeChange
}) => {
  // Toggle between Totalized Clean Grid vs Color-grouped Detailed Breakdown
  const [heatmapVisualType, setHeatmapVisualType] = useState<'totalized' | 'color_detail'>('totalized');
  const [colorDetailSearch, setColorDetailSearch] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'ALL' | 'EXTREMO' | 'ALTO' | 'MODERADO' | 'BAJO'>('ALL');

  const grid = [5, 4, 3, 2, 1]; // Y-axis: Impact
  const cols = [1, 2, 3, 4, 5]; // X-axis: Probability

  const getCellColor = (impact: number, prob: number) => {
    const score = impact * prob;
    if (score > 20) return 'bg-rose-100/90 text-rose-950 border-rose-300 hover:bg-rose-200'; // EXTREMO
    if (score > 12) return 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200'; // ALTO
    if (score > 7) return 'bg-yellow-100/90 text-yellow-950 border-yellow-300 hover:bg-yellow-200'; // MODERADO
    return 'bg-emerald-100/90 text-emerald-950 border-emerald-300 hover:bg-emerald-200'; // BAJO
  };

  const isCellSelected = (impact: number, prob: number, matrixType: 'inherent' | 'residual') => {
    if (!selectedCoordinate) return false;
    const matchesCoord = selectedCoordinate.impact === impact && selectedCoordinate.probability === prob;
    if (!selectedCoordinate.mode) return matchesCoord;
    return matchesCoord && selectedCoordinate.mode === matrixType;
  };

  const getScoreColorName = (score: number): 'EXTREMO' | 'ALTO' | 'MODERADO' | 'BAJO' => {
    if (score > 20) return 'EXTREMO';
    if (score > 12) return 'ALTO';
    if (score > 7) return 'MODERADO';
    return 'BAJO';
  };

  // Group risks by evaluated color (inherent or residual)
  const evaluatedRisksWithLevel = React.useMemo(() => {
    return risks.map(r => {
      const evalImpact = mode === 'residual'
        ? (r.residualImpact ?? Math.max(1, r.impact - 1))
        : r.impact;
      const evalProb = mode === 'residual'
        ? (r.residualProbability ?? Math.max(1, r.probability - 1))
        : r.probability;
      const clampedImp = Math.min(5, Math.max(1, evalImpact));
      const clampedPr = Math.min(5, Math.max(1, evalProb));
      const score = clampedImp * clampedPr;
      const colorCategory = getScoreColorName(score);
      return {
        ...r,
        evalImpact: clampedImp,
        evalProb: clampedPr,
        evalScore: score,
        colorCategory
      };
    });
  }, [risks, mode]);

  // Compute Migration KPIs for Inherent vs Residual
  const statsInherent = React.useMemo(() => {
    let extreme = 0, high = 0, moderate = 0, low = 0;
    risks.forEach(r => {
      const s = r.impact * r.probability;
      if (s > 20) extreme++;
      else if (s > 12) high++;
      else if (s > 7) moderate++;
      else low++;
    });
    return { extreme, high, moderate, low, critical: extreme + high, acceptable: moderate + low };
  }, [risks]);

  const statsResidual = React.useMemo(() => {
    let extreme = 0, high = 0, moderate = 0, low = 0;
    risks.forEach(r => {
      const resImp = r.residualImpact ?? Math.max(1, r.impact - 1);
      const resProb = r.residualProbability ?? Math.max(1, r.probability - 1);
      const s = resImp * resProb;
      if (s > 20) extreme++;
      else if (s > 12) high++;
      else if (s > 7) moderate++;
      else low++;
    });
    return { extreme, high, moderate, low, critical: extreme + high, acceptable: moderate + low };
  }, [risks]);

  const mitigationRate = statsInherent.critical > 0
    ? Math.round(((statsInherent.critical - statsResidual.critical) / statsInherent.critical) * 100)
    : 100;

  const acceptablePct = risks.length > 0
    ? Math.round((statsResidual.acceptable / risks.length) * 100)
    : 100;

  // Single Totalized Matrix Render (Clean, Executive, Montserrat typography, Zero Overlapping)
  const renderTotalizedMatrix = (
    matrixType: 'inherent' | 'residual', 
    title: string, 
    subtitle: string, 
    badgeIcon: React.ReactNode, 
    badgeColor: string
  ) => {
    return (
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Matrix Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${badgeColor}`}>
              {badgeIcon}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {risks.length} Riesgos Totales
          </span>
        </div>

        {/* 5x5 Matrix Board with Dedicated Non-Overlapping Layout */}
        <div className="flex w-full items-stretch pt-1">
          {/* Dedicated Y-Axis Vertical Label Column */}
          <div className="w-7 sm:w-8 shrink-0 flex items-center justify-center select-none mr-1.5">
            <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
              <span>▲ IMPACTO (SEVERIDAD)</span>
            </div>
          </div>

          {/* Grid + X-Axis Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 5 Rows Grid */}
            <div className="grid grid-cols-1 divide-y divide-slate-200 border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
              {grid.map((impact) => {
                const impactShort = impact === 5 ? 'Extremo' : impact === 4 ? 'Alto' : impact === 3 ? 'Moderado' : impact === 2 ? 'Bajo' : 'Insignif.';

                return (
                  <div key={impact} className="flex min-h-[64px] sm:min-h-[72px] items-stretch">
                    {/* Y-Axis Label Cell */}
                    <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center bg-slate-50 border-r border-slate-300 px-1 py-1 select-none">
                      <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">{impact}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-tight mt-0.5 text-center">
                        {impactShort}
                      </span>
                    </div>

                    {/* 5 Probability Columns */}
                    <div className="flex flex-1 divide-x divide-slate-200/90 min-w-0">
                      {cols.map((prob) => {
                        const cellRisks = risks.filter(r => {
                          const currentImpact = matrixType === 'residual' 
                            ? (r.residualImpact ?? Math.max(1, r.impact - 1)) 
                            : r.impact;
                          const currentProb = matrixType === 'residual' 
                            ? (r.residualProbability ?? Math.max(1, r.probability - 1)) 
                            : r.probability;
                          
                          const clampedImpact = Math.min(5, Math.max(1, currentImpact));
                          const clampedProb = Math.min(5, Math.max(1, currentProb));
                          return clampedImpact === impact && clampedProb === prob;
                        });

                        const isSelected = isCellSelected(impact, prob, matrixType);
                        const cellColorClass = getCellColor(impact, prob);
                        const isFocusedByColor = selectedColorFilter ? getScoreColorName(impact * prob) === selectedColorFilter : true;
                        const totalRisksCount = cellRisks.length;
                        const pctOfTotal = risks.length > 0 ? Math.round((totalRisksCount / risks.length) * 100) : 0;

                        return (
                          <div
                            key={`${impact}-${prob}`}
                            onClick={() => onCellClick?.(impact, prob, matrixType)}
                            className={`flex-1 p-1.5 sm:p-2 transition-all cursor-pointer flex flex-col items-center justify-center relative min-w-0 ${cellColorClass} ${
                              isSelected ? 'ring-3 ring-slate-900 z-20 scale-[1.02] shadow-md font-bold' : ''
                            } ${!isFocusedByColor ? 'opacity-25 hover:opacity-60' : 'hover:brightness-95'}`}
                          >
                            {/* Coordinate label */}
                            <div className="absolute right-1 top-0.5 text-[8px] sm:text-[9px] font-medium text-slate-500/70 select-none">
                              {impact}×{prob}
                            </div>

                            {/* Cell Content */}
                            {totalRisksCount > 0 ? (
                              <div className="flex flex-col items-center justify-center text-center">
                                <motion.span 
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-none tracking-tight"
                                >
                                  {totalRisksCount}
                                </motion.span>
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 uppercase tracking-tight mt-0.5">
                                  {totalRisksCount === 1 ? 'Riesgo' : 'Riesgos'}
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-semibold text-slate-600 bg-white/80 px-1.5 py-0.2 rounded-full mt-0.5 border border-black/5">
                                  {pctOfTotal}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400/50 select-none">
                                -
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Numbers & Labels */}
            <div className="flex pl-16 sm:pl-20 mt-2">
              {cols.map((prob) => {
                const probShort = prob === 5 ? 'Casi Seguro' : prob === 4 ? 'Probable' : prob === 3 ? 'Posible' : prob === 2 ? 'Poco Prob.' : 'Remoto';
                return (
                  <div key={prob} className="flex-1 flex flex-col items-center justify-center text-center px-0.5 min-w-0">
                    <span className="text-base sm:text-lg font-bold text-slate-800 leading-none">{prob}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-0.5 truncate max-w-full">
                      {probShort}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Master Label */}
            <div className="text-center text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
              <span>PROBABILIDAD (OCURRENCIA) ►</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Detailed Risks Breakdown View Grouped by Color Zones
  const renderColorDetailView = () => {
    const colorGroups: Array<{
      level: 'EXTREMO' | 'ALTO' | 'MODERADO' | 'BAJO';
      title: string;
      subtitle: string;
      bgClass: string;
      headerBg: string;
      tagColor: string;
      indicatorColor: string;
      risksList: typeof evaluatedRisksWithLevel;
    }> = [
      {
        level: 'EXTREMO',
        title: 'Zona Extrema (Rojo)',
        subtitle: 'Riesgos críticos inaceptables que requieren mitigación inmediata.',
        bgClass: 'bg-rose-50/60 border-rose-200',
        headerBg: 'bg-rose-600 text-white',
        tagColor: 'bg-rose-600 text-white',
        indicatorColor: 'bg-rose-500',
        risksList: evaluatedRisksWithLevel.filter(r => r.colorCategory === 'EXTREMO')
      },
      {
        level: 'ALTO',
        title: 'Zona Alta (Naranja)',
        subtitle: 'Riesgos de severidad elevada que exigen controles mitigantes y plan SARO.',
        bgClass: 'bg-amber-50/60 border-amber-200',
        headerBg: 'bg-amber-600 text-white',
        tagColor: 'bg-amber-600 text-white',
        indicatorColor: 'bg-amber-500',
        risksList: evaluatedRisksWithLevel.filter(r => r.colorCategory === 'ALTO')
      },
      {
        level: 'MODERADO',
        title: 'Zona Moderada (Amarillo)',
        subtitle: 'Riesgos en zona de tolerancia bajo supervisión periódica.',
        bgClass: 'bg-yellow-50/60 border-yellow-200',
        headerBg: 'bg-yellow-500 text-slate-900',
        tagColor: 'bg-yellow-500 text-slate-900',
        indicatorColor: 'bg-yellow-500',
        risksList: evaluatedRisksWithLevel.filter(r => r.colorCategory === 'MODERADO')
      },
      {
        level: 'BAJO',
        title: 'Zona Baja (Verde)',
        subtitle: 'Riesgos en perfil aceptable dentro del apetito corporativo.',
        bgClass: 'bg-emerald-50/60 border-emerald-200',
        headerBg: 'bg-emerald-600 text-white',
        tagColor: 'bg-emerald-600 text-white',
        indicatorColor: 'bg-emerald-500',
        risksList: evaluatedRisksWithLevel.filter(r => r.colorCategory === 'BAJO')
      }
    ];

    const filteredGroups = activeDetailTab === 'ALL'
      ? colorGroups
      : colorGroups.filter(g => g.level === activeDetailTab);

    return (
      <div className="space-y-5">
        {/* Controls Toolbar for Detail View */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Color Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveDetailTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDetailTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los Colores ({evaluatedRisksWithLevel.length})
            </button>
            {colorGroups.map(g => (
              <button
                key={g.level}
                onClick={() => setActiveDetailTab(g.level)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDetailTab === g.level
                    ? `${g.headerBg} shadow-xs font-extrabold ring-2 ring-slate-900`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${g.indicatorColor}`} />
                <span>{g.level}</span>
                <span className="px-1.5 py-0.2 bg-black/10 rounded-full font-bold text-[10px]">
                  {g.risksList.length}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar riesgo, ID o control..."
              value={colorDetailSearch}
              onChange={(e) => setColorDetailSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Color Zone Panels */}
        <div className="grid grid-cols-1 gap-5">
          {filteredGroups.map(group => {
            const searchedRisks = group.risksList.filter(r => {
              if (!colorDetailSearch.trim()) return true;
              const term = colorDetailSearch.toLowerCase();
              return (
                r.id.toLowerCase().includes(term) ||
                r.riskDescription.toLowerCase().includes(term) ||
                r.process.toLowerCase().includes(term) ||
                (r.suggestedControl && r.suggestedControl.toLowerCase().includes(term)) ||
                (r.owner && r.owner.toLowerCase().includes(term))
              );
            });

            return (
              <div
                key={group.level}
                className={`rounded-2xl border ${group.bgClass} shadow-2xs overflow-hidden`}
              >
                {/* Section Header */}
                <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 ${group.headerBg}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-white/90 shadow-2xs" />
                    <div>
                      <h4 className="text-sm font-bold tracking-tight flex items-center gap-2">
                        {group.title}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-white font-bold">
                          {group.risksList.length} {group.risksList.length === 1 ? 'Riesgo' : 'Riesgos'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-white/90 font-medium">{group.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Cards List */}
                <div className="p-4">
                  {searchedRisks.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs font-medium">
                      No hay riesgos registrados en esta zona con los filtros actuales.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {searchedRisks.map(risk => (
                        <div
                          key={risk.id}
                          className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-2.5"
                        >
                          {/* Card Top */}
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${group.tagColor}`}>
                                {risk.id}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                Imp: {risk.evalImpact} × Prob: {risk.evalProb} = {risk.evalScore}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {risk.process}
                              </span>
                              <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 mt-0.5">
                                {risk.riskDescription}
                              </p>
                            </div>
                          </div>

                          {/* Controls & Treatment */}
                          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                            {risk.suggestedControl && (
                              <div className="text-slate-600 line-clamp-2 flex items-start gap-1">
                                <ShieldCheck size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong className="text-slate-800">Control:</strong> {risk.suggestedControl}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 pt-0.5">
                              <span className="flex items-center gap-1">
                                <User size={11} className="text-slate-400" />
                                <strong>ROAM:</strong> {risk.roamTreatment || 'Mitigado'} ({risk.owner || 'Risk Owner'})
                              </span>
                              <span className="font-bold text-slate-700">
                                {risk.productLine || 'Global'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      {/* MASTER TOP CONTROLS: Visual Selector (Totalized vs Color Details) + Risk Mode (Inherente / Residual / Dual) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        
        {/* Visual Mode Switcher (Option 1: Totalized Grid vs Option 2: Color Breakdown) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5">
            <LayoutGrid size={14} className="text-slate-500" />
            Visualización:
          </span>
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl border border-slate-300">
            <button
              onClick={() => setHeatmapVisualType('totalized')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                heatmapVisualType === 'totalized'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <LayoutGrid size={13} className={heatmapVisualType === 'totalized' ? 'text-amber-400' : ''} />
              <span>1. Matriz Totalizada (Números Grandes)</span>
            </button>
            <button
              onClick={() => setHeatmapVisualType('color_detail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                heatmapVisualType === 'color_detail'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <ListFilter size={13} className={heatmapVisualType === 'color_detail' ? 'text-amber-400' : ''} />
              <span>2. Detalle de Riesgos por Color</span>
            </button>
          </div>
        </div>

        {/* Evaluation Switcher (Inherente, Residual, Dual) + Filter Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {onModeChange && (
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl border border-slate-300">
              <button
                onClick={() => onModeChange('inherent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'inherent'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame size={13} />
                <span>Inherente</span>
              </button>
              <button
                onClick={() => onModeChange('residual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'residual'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Residual</span>
              </button>
              <button
                onClick={() => onModeChange('dual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'dual'
                    ? 'bg-slate-900 text-amber-300 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                <Scale size={13} className={mode === 'dual' ? 'text-amber-400' : ''} />
                <span>Vista Dual</span>
              </button>
            </div>
          )}

          {(selectedCoordinate || selectedColorFilter) && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300 shadow-2xs cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* ISO 31000 Color Legend (Clickable quick filters) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
          <Layers size={13} className="text-slate-500" />
          Zonas ISO 31000:
        </span>
        {[
          { level: 'BAJO', label: 'Bajo (Verde)', class: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300', count: mode === 'residual' ? statsResidual.low : statsInherent.low },
          { level: 'MODERADO', label: 'Moderado (Amarillo)', class: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-950 border-yellow-300', count: mode === 'residual' ? statsResidual.moderate : statsInherent.moderate },
          { level: 'ALTO', label: 'Alto (Naranja)', class: 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300', count: mode === 'residual' ? statsResidual.high : statsInherent.high },
          { level: 'EXTREMO', label: 'Extremo (Rojo)', class: 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300', count: mode === 'residual' ? statsResidual.extreme : statsInherent.extreme }
        ].map((zone) => {
          const isSelected = selectedColorFilter === zone.level;
          return (
            <button
              key={zone.level}
              onClick={() => onColorClick?.(zone.level as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${zone.class} ${
                isSelected ? 'ring-2 ring-slate-900 scale-105 shadow-xs font-extrabold' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                zone.level === 'EXTREMO' ? 'bg-rose-600' :
                zone.level === 'ALTO' ? 'bg-amber-500' :
                zone.level === 'MODERADO' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`} />
              <span>{zone.label}</span>
              <span className="px-1.5 py-0.2 bg-black/10 rounded-full text-[10px] font-bold">
                {zone.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* DUAL MODE EXECUTIVE COMPARISON BANNER */}
      {mode === 'dual' && (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Scale className="text-amber-400" size={18} />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Panel Comparativo de Mitigación de Riesgos (ISO 31000 & ROAM)
                </h4>
                <p className="text-[11px] text-slate-300">
                  Transición del perfil de riesgo antes y después de controles mitigantes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span>Efectividad:</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold">
                {mitigationRate}% Tasa de Contención
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase text-rose-400">Riesgos Extremos (Rojo)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-white">{statsInherent.extreme}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className={`text-xl font-bold ${statsResidual.extreme === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {statsResidual.extreme}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-medium">
                {statsInherent.extreme > statsResidual.extreme ? `Reducción de -${statsInherent.extreme - statsResidual.extreme}` : 'Sin variación'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase text-amber-400">Riesgos Altos (Naranja)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-white">{statsInherent.high}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="text-xl font-bold text-amber-300">{statsResidual.high}</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-medium">
                {statsInherent.high > statsResidual.high ? `Reducción de -${statsInherent.high - statsResidual.high}` : 'Sin variación'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase text-yellow-400">Riesgos Moderados (Amarillo)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-white">{statsInherent.moderate}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="text-xl font-bold text-yellow-300">{statsResidual.moderate}</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-medium">Zona de Tolerancia</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase text-emerald-400">Riesgos Bajos (Verde)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-white">{statsInherent.low}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="text-xl font-bold text-emerald-400">{statsResidual.low}</span>
              </div>
              <span className="text-[9px] text-emerald-300 mt-1 font-medium">
                {acceptablePct}% Perfil Aceptable
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW BASED ON HEATMAP VISUAL TYPE */}
      {heatmapVisualType === 'totalized' ? (
        mode === 'dual' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
            {renderTotalizedMatrix(
              'inherent',
              '🔥 Matriz Totalizada de Riesgo Inherente',
              'Conteo consolidado de riesgos sin considerar mitigación.',
              <Flame size={18} className="text-red-600" />,
              'bg-red-50 text-red-600 border border-red-200'
            )}
            {renderTotalizedMatrix(
              'residual',
              '🛡️ Matriz Totalizada de Riesgo Residual',
              'Conteo consolidado de riesgos remanentes tras controles.',
              <ShieldCheck size={18} className="text-emerald-600" />,
              'bg-emerald-50 text-emerald-600 border border-emerald-200'
            )}
          </div>
        ) : mode === 'residual' ? (
          renderTotalizedMatrix(
            'residual',
            '🛡️ Matriz Totalizada de Riesgo Residual',
            'Conteo consolidado de riesgos post-controles mitigantes.',
            <ShieldCheck size={18} className="text-emerald-600" />,
            'bg-emerald-50 text-emerald-600 border border-emerald-200'
          )
        ) : (
          renderTotalizedMatrix(
            'inherent',
            '🔥 Matriz Totalizada de Riesgo Inherente',
            'Conteo consolidado de riesgos preliminares sin controles.',
            <Flame size={18} className="text-red-600" />,
            'bg-red-50 text-red-600 border border-red-200'
          )
        )
      ) : (
        renderColorDetailView()
      )}
    </div>
  );
};
