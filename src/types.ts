export type RiskLevel = 'BAJO' | 'MODERADO' | 'ALTO' | 'EXTREMO';
export type ProcessArea = 'Cumplimiento' | 'Fraude' | 'Ciberseguridad' | 'Operaciones' | 'Mesa de Dinero' | 'Tesorería' | 'TI' | 'Nuevos Productos' | 'Riesgos Nube' | 'Conciliaciones' | 'Legal' | 'Finanzas' | 'Continuidad' | 'Estratégico' | 'Seguridad de la Información' | 'CX';

export type Jurisdiction = 'Regional' | 'Chile' | 'Colombia' | 'Argentina';

export interface EntityInfo {
  id: Jurisdiction;
  name: string;
  shortName: string;
  code: string;
  regulator: string;
  standard: string;
  flag: string;
  currency: string;
  description: string;
}

export const ENTITY_PROFILES: Record<Jurisdiction, EntityInfo> = {
  Regional: {
    id: 'Regional',
    name: 'Global66 Regional (Consolidado Multi-entidad)',
    shortName: 'Regional',
    code: 'REG',
    regulator: 'Gobierno Corporativo Global66',
    standard: 'ISO 31000:2018 & ROAM Framework',
    flag: '🌎',
    currency: 'USD',
    description: 'Consolidación integral de todos los procesos corporativos y riesgos operacionales transversales en Latinoamérica.'
  },
  Chile: {
    id: 'Chile',
    name: 'CH - Global Card S.P.A.',
    shortName: 'Chile (CMF)',
    code: 'CH-GC',
    regulator: 'CMF (Comisión para el Mercado Financiero)',
    standard: 'NCG 464, RAN 20-10 & Ley FinTech 21.521',
    flag: '🇨🇱',
    currency: 'CLP / UF',
    description: 'Emisora y Operadora de Tarjetas con Provisión de Fondos supervisada por la CMF bajo NCG 464 y RAN 20-10.'
  },
  Colombia: {
    id: 'Colombia',
    name: 'CO - Global66 Colombia (SFC)',
    shortName: 'Colombia (SFC)',
    code: 'CO-SFC',
    regulator: 'SFC (Superintendencia Financiera de Colombia)',
    standard: 'Circular Externa 029/2014 - SARO & ISO 31000',
    flag: '🇨🇴',
    currency: 'COP',
    description: 'Operación y servicios de pago en Colombia supervisados bajo el Sistema de Administración de Riesgo Operativo (SARO).'
  },
  Argentina: {
    id: 'Argentina',
    name: 'AR - Global66 Argentina S.A.U. (BCRA A7783)',
    shortName: 'Argentina (BCRA)',
    code: 'AR-BCRA',
    regulator: 'BCRA (Banco Central de la República Argentina)',
    standard: 'Comunicación "A" 7783, "A" 7784 & Basilea III',
    flag: '🇦🇷',
    currency: 'ARS',
    description: 'Proveedor de Servicios de Pago (PSP) y operatoria cambiaria regulada por el BCRA bajo Com. A 7783 con Base LED.'
  }
};

export type BCRACategory =
  | 'Fraude Interno'
  | 'Fraude Externo'
  | 'Relaciones Laborales y Seguridad en el Puesto de Trabajo'
  | 'Clientes, Productos y Prácticas Empresariales'
  | 'Daños a Activos Físicos'
  | 'Incidencias en el Negocio y Fallos en los Sistemas'
  | 'Ejecución, Entrega y Gestión de Procesos';

export const BCRA_CATEGORIES: BCRACategory[] = [
  'Fraude Interno',
  'Fraude Externo',
  'Relaciones Laborales y Seguridad en el Puesto de Trabajo',
  'Clientes, Productos y Prácticas Empresariales',
  'Daños a Activos Físicos',
  'Incidencias en el Negocio y Fallos en los Sistemas',
  'Ejecución, Entrega y Gestión de Procesos'
];

export interface LossEvent {
  id: string;
  code: string;
  dateOccurred: string;
  dateDiscovered: string;
  dateAccounted: string;
  bcraCategory: BCRACategory;
  processArea: ProcessArea;
  description: string;
  grossAmountARS: number;
  recoveryAmountARS: number;
  netAmountARS: number;
  status: 'En Investigación' | 'Confirmado' | 'Cerrado' | 'Recuperado';
  associatedRiskId?: string;
  responsibleArea: string;
}

export type Acceptability = 'ACEPTABLE' | 'NO ACEPTABLE (Requiere tratamiento urgente)';

export type ControlType = 'Preventivo' | 'Detectivo' | 'Correctivo';
export type ControlNature = 'Automático' | 'Combinado' | 'Manual';
export type ControlResponsibility = 'Asignado y Monitoreado' | 'Solo Asignado' | 'No Asignado';
export type ControlFormality = 'Divulgado y Evidenciable' | 'Solo Documentado' | 'Informal';
export type ControlFrequency = 'Continuo y Total 100%' | 'Muestreo Frecuente' | 'Inadecuado o Esporádico';

export interface ControlProposal {
  id: string;
  riskId: string;
  type: ControlType;
  description: string;
  status: 'Pendiente' | 'Aplicado' | 'Rechazado';
  evaluation?: ControlEvaluation;
  controlIndex?: number;
}

export interface ControlEvaluation {
  type: ControlType;
  nature: ControlNature;
  responsibility: ControlResponsibility;
  formality: ControlFormality;
  frequency: ControlFrequency;
}

export type RiskStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';
export type RoamStatus = 'Resolved' | 'Owned' | 'Accepted' | 'Mitigated';

export interface AssociatedControl {
  id: string;
  description: string;
  type: ControlType;
  efficiency: 'Excelente' | 'Bueno' | 'Débil';
  impactReduction: number;
  probabilityReduction: number;
  nature?: ControlNature;
  responsibility?: ControlResponsibility;
  formality?: ControlFormality;
  frequency?: ControlFrequency;
  controlIndex?: number; // IC en % (0 a 100%)
  evaluation?: ControlEvaluation;
  owner?: string;
  mechanism?: 'Automático' | 'Semiautomático' | 'Manual';
}

export const CONTROL_METHODOLOGY_SCORES = {
  type: { 'Preventivo': 100, 'Detectivo': 50, 'Correctivo': 20 },
  nature: { 'Automático': 100, 'Combinado': 50, 'Manual': 20 },
  responsibility: { 'Asignado y Monitoreado': 100, 'Solo Asignado': 50, 'No Asignado': 0 },
  formality: { 'Divulgado y Evidenciable': 100, 'Solo Documentado': 50, 'Informal': 0 },
  frequency: { 'Continuo y Total 100%': 100, 'Muestreo Frecuente': 50, 'Inadecuado o Esporádico': 10 }
};

export const calculateControlIndex = (evalData: ControlEvaluation): number => {
  return (
    CONTROL_METHODOLOGY_SCORES.type[evalData.type] * 0.40 +
    CONTROL_METHODOLOGY_SCORES.nature[evalData.nature] * 0.20 +
    CONTROL_METHODOLOGY_SCORES.responsibility[evalData.responsibility] * 0.20 +
    CONTROL_METHODOLOGY_SCORES.formality[evalData.formality] * 0.10 +
    CONTROL_METHODOLOGY_SCORES.frequency[evalData.frequency] * 0.10
  );
};

export const getControlEfficiencyFromIC = (ic: number): 'Excelente' | 'Bueno' | 'Débil' => {
  if (ic >= 85) return 'Excelente';
  if (ic >= 60) return 'Bueno';
  return 'Débil';
};

export const getSuggestedMitigation = (type: ControlType, ic: number): { impactReduction: number; probabilityReduction: number } => {
  if (ic >= 85) {
    if (type === 'Preventivo') return { impactReduction: 1, probabilityReduction: 2 };
    return { impactReduction: 2, probabilityReduction: 1 };
  } else if (ic >= 60) {
    if (type === 'Preventivo') return { impactReduction: 1, probabilityReduction: 1 };
    return { impactReduction: 1, probabilityReduction: 1 };
  } else if (ic >= 40) {
    return { impactReduction: 0, probabilityReduction: 1 };
  }
  return { impactReduction: 0, probabilityReduction: 0 };
};

export interface Risk {
  id: string;
  process: string;
  processArea: ProcessArea;
  secondaryProcessArea?: ProcessArea; // Para vincularlo con otra área (ej: Fraude con Operaciones)
  category?: string; // Categoría de riesgo específica (ej: 'Fraude / Ciberseguridad', 'Riesgo Operativo / Continuidad')
  product?: string; // Línea de producto Fintech (ej: 'Bre-B', 'Stablecoins', 'Integración SII Chile', 'Adquirencia Global', etc.)
  jurisdiction?: Jurisdiction;
  categoriaBCRA?: BCRACategory;
  origin?: 'Interno' | 'Externo'; // Clasificación del origen del riesgo
  macrocategory?: ProcessMacroCategory; // Macrocategoría unificada (Estratégicos, Misionales, De Apoyo, Evaluación Independiente)
  taxonomyProcessId?: number; // ID del proceso oficial (1 a 14) según GLOBAL66_PROCESS_TAXONOMY
  taxonomyProcessName?: string; // Nombre oficial del proceso (ej: 'Gestión de Operaciones y Tesorería')
  subproceso?: string; // Subproceso específico nivel 2 (ej: 'Tesorería', 'Mesa de dinero', 'Conciliación y compensación')
  riskDescription: string;
  timestamp?: string;
  cause: string;
  impact: number; // 1-5
  probability: number; // 1-5
  suggestedControl: string;
  documentControl?: string; // Control real identificado o mencionado en el documento
  controlDuration?: 'Temporal' | 'Permanente';
  acceptability: Acceptability;
  residualImpact?: number;
  residualProbability?: number;
  appliedControlId?: string;
  controlIndex?: number;
  status: RiskStatus;
  roamStatus?: RoamStatus;
  roamOwner?: string;
  associatedControls?: AssociatedControl[];
  financiero?: number;
  procesos?: number;
  reputacional?: number;
  legal?: number;
}

export interface FintechProductOption {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  colorTheme: string;
}

export const FINTECH_PRODUCTS: FintechProductOption[] = [
  { id: 'TODOS', name: 'Todos los Productos', shortName: 'Consolidado', icon: '🌐', colorTheme: 'slate' },
  { id: 'Stablecoins', name: 'Stablecoins (On/Off Ramp USDC/USDT, Custodia Institucional & Travel Rule)', shortName: 'Stablecoins', icon: '🪙', colorTheme: 'emerald' },
  { id: 'Integración SII Chile', name: 'Integración SII Chile (Onboarding B2B & Verificación Tributaria Automática)', shortName: 'Integración SII Chile', icon: '🇨🇱', colorTheme: 'rose' },
  { id: 'APIB2B(MCP)', name: 'APIB2B(MCP) — Servidor Model Context Protocol & Pagos para Agentes IA', shortName: 'APIB2B(MCP)', icon: '🤖', colorTheme: 'indigo' },
  { id: 'Integración CCE - Perú', name: 'Integración CCE - Perú (Interoperabilidad Inmediata B2C, CCI, QR & Alias)', shortName: 'Integración CCE Perú', icon: '🇵🇪', colorTheme: 'rose' },
  { id: 'Global chats', name: 'Global chats (Kit P2P Wow - Mensajería & Pagos Conversacionales)', shortName: 'Global chats', icon: '💬', colorTheme: 'violet' },
  { id: 'Adquirencia Global', name: 'Adquirencia Global (B2B Deposit Money All & Pasarela Multipaís)', shortName: 'Adquirencia Global', icon: '💳', colorTheme: 'emerald' },
  { id: 'Payout Swift JPMorgan', name: 'Payout Swift por JPMorgan (SWIFT H2H ISO 20022 & Fedwire)', shortName: 'Payout Swift JPMorgan', icon: '🏛️', colorTheme: 'blue' },
  { id: 'Tarjetas Temporales', name: 'Tarjetas Temporales (Tarjetas Virtuales de Un Solo Uso & Efímeras)', shortName: 'Tarjetas Temporales', icon: '⏱️', colorTheme: 'cyan' },
  { id: 'Flujo de Bloqueos', name: 'Flujo de Bloqueos (Congelamiento Preventivo, Judicial & Anti-Fraude)', shortName: 'Flujo de Bloqueos', icon: '🔒', colorTheme: 'amber' },
  { id: 'Multitarjeta', name: 'Multitarjeta (Gestión de Múltiples Tarjetas Físicas/Virtuales & Reglas Dinámicas)', shortName: 'Multitarjeta', icon: '💳', colorTheme: 'violet' },
  { id: 'Bre-B', name: 'Bre-B (Pagos Inmediatos Colombia)', shortName: 'Bre-B', icon: '⚡', colorTheme: 'amber' },
  { id: 'Cuentas Virtuales', name: 'Cuentas Virtuales (Virtual IBAN / Local Collections)', shortName: 'Cuentas Virtuales', icon: '🏦', colorTheme: 'teal' },
  { id: 'GlobalID', name: 'GlobalID (Identidad Digital & Verificación)', shortName: 'GlobalID', icon: '🪪', colorTheme: 'indigo' },
];

export const PATRIMONIO_BASE = 22000000;

export const getRiskLevel = (score: number): RiskLevel => {
  // Score = Impact (1-5) * Probability (1-5)
  // Max Score = 25
  // Appetite (Green) <= 30% of Exposure Thresholds?
  // User Prompt context map:
  // Bajo: 1-7 (Hasta 30% del patrimonio base en terminos de score mapeado)
  // Moderado: 8-12 (Zona de Tolerancia, >30% y <= 50%)
  // Alto: 13-20 (Riesgo Alto, >50% y <= 80%)
  // Extremo: 21-25 (Fuera de Apetito, > 80%)
  if (score > 20) return 'EXTREMO';
  if (score > 12) return 'ALTO';
  if (score > 7) return 'MODERADO';
  return 'BAJO';
};

export const getExposureUSD = (impact: number, probability: number): number => {
  // Impact mapping based on policy thresholds
  const impactMap: Record<number, number> = {
    1: 660000,
    2: 880000,
    3: 1100000,
    4: 1760000,
    5: 22000000 // Until 100% of Patrimonio Base
  };
  
  // Probability mapping
  const probMap: Record<number, number> = {
    1: 0.20,
    2: 0.40,
    3: 0.60,
    4: 0.80,
    5: 1.00
  };

  const impactVal = impactMap[impact] || (impact * 440000); // fallback
  const probVal = probMap[probability] || (probability * 0.2);
  
  return impactVal * probVal;
};

export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'EXTREMO': return 'bg-red-600 text-white'; // Fuera de Apetito (>80%)
    case 'ALTO': return 'bg-orange-500 text-white'; // Riesgo Alto (>50%)
    case 'MODERADO': return 'bg-yellow-400 text-black'; // Tolerancia (>30%)
    case 'BAJO': return 'bg-green-500 text-white'; // Dentro del Apetito (≤30%)
    default: return 'bg-gray-200 text-black';
  }
};

export const getRiskEmoji = (level: RiskLevel): string => {
  switch (level) {
    case 'EXTREMO': return '🔴';
    case 'ALTO': return '🟠';
    case 'MODERADO': return '🟡';
    case 'BAJO': return '🟢';
    default: return '⚪';
  }
};

export const getAcceptability = (score: number): Acceptability => {
  // Según nueva política: Exposición > 50% (Score > 12) requiere tratamiento obligatorio
  if (score > 12) return 'NO ACEPTABLE (Requiere tratamiento urgente)';
  return 'ACEPTABLE';
};

export interface InformationAsset {
  id: string;
  name: string;
  type: 'Sistema de Información' | 'Base de Datos' | 'Documento Digital' | 'Repositorio' | 'Infraestructura Cloud' | 'Otro';
  description: string;
  owner: string;
  criticality: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  classification: 'Público' | 'Uso Interno' | 'Restringido' | 'Confidencial' | 'Altamente Confidencial';
  associatedProcesses: string[]; // e.g., ["Compliance", "TI"]
  originDoc?: string; // Source link or context tag
  lastReviewDate?: string;
}

export function cleanRiskDescriptionAndExtractCause(description: string, existingCause: string): { cleanedDescription: string; extractedCause: string } {
  let cleanedDescription = (description || '').trim();
  let extractedCause = (existingCause || '').trim();

  const patterns = [
    /,?\s*originado\s+por\s+un\s+conjunto\s+de\s+factores:\s*/i,
    /,?\s*originado\s+por\s+/i,
    /,?\s*originada\s+por\s+/i,
    /,?\s*debido\s+a\s+/i,
    /,?\s*causado\s+por\s+/i,
    /,?\s*causada\s+por\s+/i,
  ];

  for (const pattern of patterns) {
    const match = cleanedDescription.match(pattern);
    if (match && match.index !== undefined) {
      const splitIdx = match.index;
      const matchedPhrase = match[0];
      const beforeStr = cleanedDescription.slice(0, splitIdx).trim();
      let afterStr = cleanedDescription.slice(splitIdx + matchedPhrase.length).trim();

      let finalDesc = beforeStr;
      if (finalDesc.endsWith(',')) {
        finalDesc = finalDesc.slice(0, -1).trim();
      }
      if (!finalDesc.endsWith('.')) {
        finalDesc += '.';
      }

      if (afterStr) {
        afterStr = afterStr.charAt(0).toUpperCase() + afterStr.slice(1);
        if (!afterStr.endsWith('.')) {
          afterStr += '.';
        }
      }

      cleanedDescription = finalDesc;

      if (afterStr) {
        if (!extractedCause) {
          extractedCause = afterStr;
        } else if (!extractedCause.toLowerCase().includes(afterStr.toLowerCase().slice(0, 15))) {
          extractedCause = `${afterStr}\n${extractedCause}`;
        }
      }
      break;
    }
  }

  return { cleanedDescription, extractedCause };
}

export type GovernanceDocType = 'PRO' | 'POL' | 'MAN' | 'PCS';
export type GovernanceCompanyCode = 'GCCO' | 'GCH' | 'GCAR' | 'GREG' | 'G81' | 'GCCL';
export type GovernanceDocStatus = 'Borrador' | 'En Revisión' | 'Aprobado';

export type DocTypology = 'MAN' | 'POL' | 'PRO' | 'PCS' | 'ESP' | 'CAS' | 'ALC' | 'ONE' | 'OPS';
export type OfficialCountry = 'Colombia' | 'Chile' | 'Argentina' | 'Regional' | 'Perú' | 'Sin Clasificar';
export type OfficialSocietyCode = 'GCCO' | 'G81' | 'GCCL' | 'GCAR' | 'GREG' | 'GCPE' | 'DESCONOCIDO';

export type AuditFlag = 'VALID' | 'DUPLICATE' | 'SYNTAX_ERROR' | 'UNKNOWN_PREFIX' | 'INVALID_CORRELATIVE';

export interface DocumentVersionHistoryEntry {
  version: string;
  date: string;
  elaboratedBy: string;
  reviewedBy?: string;
  approvedBy: string;
  actNumber?: string;
  changeLog: string;
  isCurrent?: boolean;
}

export interface AuditedDocument {
  id: string;
  code: string;
  title: string;
  ownerArea: string;
  version: string;
  lastUpdated: string;
  elaboratedBy: string;
  reviewedBy: string;
  approvedBy: string;
  approvalDate: string;
  actNumber?: string;
  changeLog: string;
  status: 'Vigente' | 'En Revisión' | 'Obsoleto';
  versionHistory: DocumentVersionHistoryEntry[];
  rawInput?: string;
  // Campos calculados por el motor de auditoría:
  detectedCountry: OfficialCountry;
  detectedSociety: OfficialSocietyCode;
  detectedTypology: DocTypology | 'DESCONOCIDO';
  detectedCorrelative: string | null;
  isDuplicate: boolean;
  hasSyntaxError: boolean;
  isCompliant: boolean;
  auditIssues: string[];
  suggestedFixCode?: string;
  notes?: string;
  // Campos del Roadmap e Inventario de Procesos:
  macroprocess?: 'Estratégico' | 'Misional' | 'Apoyo' | string;
  subprocess?: string;
  criticality?: 'ALTA' | 'MEDIA' | 'BAJA' | string;
  responsibleRole?: string;
  dueDate?: string;
  driveOrLoomUrl?: string;
  description?: string;
}

// ==========================================
// MÓDULO: RIESGOS DE NUEVOS PRODUCTOS & SERVICIOS
// ==========================================

export type ProductLifecycleStage = 
  | 'Ideación & Diseño'
  | 'Desarrollo & Sandbox'
  | 'Piloto Controlado'
  | 'Lanzamiento (Go-Live)'
  | 'Post-Lanzamiento & Operación';

export type ProductRiskCategory = 
  | 'Operativo & Procesos'
  | 'Tecnológico & Ciberseguridad'
  | 'Fraude, AML & Suplantación'
  | 'Regulatorio & Licenciamiento'
  | 'Financiero & Liquidez / FX'
  | 'Dependencia de Terceros / Partners'
  | 'Legal & Protección al Consumidor';

export interface FintechProduct {
  id: string; // e.g. 'bre-b', 'tarjeta-global-card', 'cuenta-global', 'payins-payouts', 'qr-interoperable', 'crypto-ramp'
  code: string; // e.g. 'BREB', 'TCARD', 'GWAL', 'CHKT', 'QR', 'CRYP'
  name: string; // e.g. 'Bre-B (Pagos Inmediatos Colombia)'
  shortName: string; // e.g. 'Bre-B'
  icon: string; // emoji or identifier
  jurisdiction: Jurisdiction | 'Regional';
  stage: ProductLifecycleStage;
  leadOwner: string; // e.g. 'Head of Product Payments - Colombia'
  riskOwner: string; // e.g. 'Oficial de Riesgo Operativo'
  description: string;
  targetLaunchDate: string;
  regulatorApprovalRequired: boolean;
  regulatoryEntities: string[]; // ['SFC (Colombia)', 'Banco de la República']
  goLiveReadinessScore: number; // 0 - 100%
  colorTheme: string; // e.g. 'indigo', 'emerald', 'blue', 'amber', 'purple'
}

export interface ProductRiskChecklistItem {
  id: string;
  title: string;
  category: 'Regulatorio' | 'Seguridad' | 'Operaciones' | 'Fraude' | 'Financiero';
  completed: boolean;
  verifiedBy?: string;
  dateCompleted?: string;
}

export interface ProductRisk extends Risk {
  productId: string; // Vinculación obligatoria con el producto (ej. 'bre-b')
  productCode: string; // e.g. 'BREB'
  productName: string; // e.g. 'Bre-B Colombia'
  stage: ProductLifecycleStage;
  productCategory: ProductRiskCategory;
  slaImpactSeconds?: number; // Para productos en tiempo real como Bre-B
  transactionalImpactEstimatedUSD?: number;
  readinessChecklist?: ProductRiskChecklistItem[];
  regulatoryImpactDetails?: string;
}

export interface VersionControlEntry {
  version: string;
  date: string;
  author: string;
  description: string;
  approvedBy: string;
}

export interface GovernanceStep {
  stepNumber: number;
  role: string;
  activity: string;
  input: string;
  output: string;
  controls?: string;
}

// ==========================================
// ARQUITECTURA REGIONAL DE PROCESOS GLOBAL66 (14 MACROPROCESOS)
// ==========================================

export type ProcessMacroCategory = 
  | 'Estratégicos'
  | 'Misionales'
  | 'De Apoyo'
  | 'Evaluación Independiente';

export type CompanyScopeId = 'REGIONAL' | 'CARD' | 'SEDPE' | 'SPA';

export type CompanyProcessRoleType = 
  | 'DUENO' 
  | 'EJECUTA_LOCAL' 
  | 'CONSUME_SERVICIO' 
  | 'APLICA_PROPIO' 
  | 'NO_FORMALIZADO';

export interface EntityProcessRoleInfo {
  roleType: CompanyProcessRoleType;
  roleLabel: string;
  scopeDescription: string;
  regulatorScope?: string;
  isGap?: boolean;
}

export interface RegionalProcessDefinition {
  id: number;
  macrocategory: ProcessMacroCategory;
  categoryLevel1: string;
  processGroupLevel2: string;
  global81Hub: string;
  globalCardChile: string;
  sedpeColombia: string;
  notes?: string;
  mappedProcessArea?: ProcessArea;
  relevantAreas?: ProcessArea[];
  companyRoles?: {
    CARD: EntityProcessRoleInfo;
    SEDPE: EntityProcessRoleInfo;
    SPA: EntityProcessRoleInfo;
  };
}

export const GLOBAL66_PROCESS_TAXONOMY: RegionalProcessDefinition[] = [
  {
    id: 1,
    macrocategory: 'Estratégicos',
    categoryLevel1: 'Direccionamiento Estratégico y Gobierno Corporativo',
    processGroupLevel2: 'Planeación estratégica; Gobierno corporativo; RR.PP. y comunicaciones',
    global81Hub: 'Dueño - fija estrategia y comunicación de grupo',
    globalCardChile: 'Ejecuta localmente',
    sedpeColombia: 'Ejecuta localmente (Country Manager)',
    notes: '-',
    mappedProcessArea: 'Cumplimiento',
    relevantAreas: ['Cumplimiento', 'Operaciones'],
    companyRoles: {
      CARD: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecuta Localmente',
        scopeDescription: 'Implementación local de la estrategia y gobierno corporativo ante el Directorio local y CMF.',
        regulatorScope: 'CMF (NCG 464)'
      },
      SEDPE: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecuta Localmente (Country Manager)',
        scopeDescription: 'Despliegue de directrices corporativas bajo el liderazgo del Country Manager y Junta Directiva Colombia.',
        regulatorScope: 'SFC (Circular Básica Jurídica)'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Dueño Corporativo',
        scopeDescription: 'Fija el rumbo estratégico, políticas marco y comunicación institucional para todas las entidades del grupo.',
        regulatorScope: 'Gobierno Corporativo Regional'
      }
    }
  },
  {
    id: 2,
    macrocategory: 'Estratégicos',
    categoryLevel1: 'Gestión Integral de Riesgo, Cumplimiento y Resiliencia',
    processGroupLevel2: 'SARO; SARL; AML/LAFT; Fraude; Compliance; PCN; Ciberseguridad',
    global81Hub: 'Aplica SARO/SARL/AML propios',
    globalCardChile: 'Aplica SARO/SARL/AML propios',
    sedpeColombia: 'Aplica SARO/SARL/AML propios (mayor detalle documental)',
    notes: 'SARL no aplica a Global 81 (no es entidad regulada de liquidez)',
    mappedProcessArea: 'Cumplimiento',
    relevantAreas: ['Cumplimiento', 'Fraude', 'Ciberseguridad', 'Riesgos Nube'],
    companyRoles: {
      CARD: {
        roleType: 'APLICA_PROPIO',
        roleLabel: 'Aplica Marco Propio CMF',
        scopeDescription: 'Gestión de riesgos operacionales (NCG 464), prevención LA/FT ante UAF Chile, y ciberseguridad RAN 20-10.',
        regulatorScope: 'CMF & UAF Chile'
      },
      SEDPE: {
        roleType: 'APLICA_PROPIO',
        roleLabel: 'Aplica Marco Propio SFC (Mayor Detalle)',
        scopeDescription: 'Implementación integral de SARO (Riesgo Operativo CE 029/2014), SARLAFT 4.0, SARL (Liquidez), PCN y SAGRILAFT.',
        regulatorScope: 'SFC (SuperFinanciera)'
      },
      SPA: {
        roleType: 'APLICA_PROPIO',
        roleLabel: 'Aplica Marco Propio Matriz',
        scopeDescription: 'Marco de gestión de riesgos matriz y prevención de delitos corporativos (SARL no aplica al no ser entidad captadora).',
        regulatorScope: 'UAF Chile & Estándar ISO 31000'
      }
    }
  },
  {
    id: 3,
    macrocategory: 'Estratégicos',
    categoryLevel1: 'Gestión Regulatoria y Relaciones Externas',
    processGroupLevel2: 'Reportes normativos; relación con reguladores',
    global81Hub: 'Apoyo en relaciones públicas',
    globalCardChile: 'Dueño (categoría propia)',
    sedpeColombia: 'A elevar a categoría propia (hoy subproceso de Operaciones)',
    notes: 'Relación con CMF, SFC, UAF, SuperFinanciera',
    mappedProcessArea: 'Cumplimiento',
    relevantAreas: ['Cumplimiento'],
    companyRoles: {
      CARD: {
        roleType: 'DUENO',
        roleLabel: 'Dueño de Categoría Propia',
        scopeDescription: 'Canal oficial y gobierno directo de requerimientos, auditorías e inspecciones con la CMF en Chile.',
        regulatorScope: 'CMF'
      },
      SEDPE: {
        roleType: 'APLICA_PROPIO',
        roleLabel: 'A Elevar a Categoría Propia',
        scopeDescription: 'Régimen de reportes normativos SFC (actualmente dependiente de Operaciones, en proceso de independización formal).',
        regulatorScope: 'SFC Colombia'
      },
      SPA: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Apoyo Institucional',
        scopeDescription: 'Soporte y coordinación en relaciones públicas y posicionamiento de marca regional.',
        regulatorScope: 'Relaciones Públicas Regionales'
      }
    }
  },
  {
    id: 4,
    macrocategory: 'Misionales',
    categoryLevel1: 'Gestión de Producto',
    processGroupLevel2: 'Diseño B2B/B2C/UX/Product Experience; producto de tarjeta / depósito electrónico',
    global81Hub: 'Dueño - diseña el producto para todo el grupo',
    globalCardChile: 'Adaptación local según regulación chilena; consume el servicio',
    sedpeColombia: 'Adaptación local según regulación colombiana; consume el servicio',
    notes: '-',
    mappedProcessArea: 'Nuevos Productos',
    relevantAreas: ['Nuevos Productos', 'Operaciones'],
    companyRoles: {
      CARD: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Adaptación Local & Consumo',
        scopeDescription: 'Consume el diseño global y adapta los términos y condiciones del producto de Tarjeta Prepago bajo reglas CMF.',
        regulatorScope: 'CMF (Capítulo III.J.1)'
      },
      SEDPE: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Adaptación Local & Consumo',
        scopeDescription: 'Consume el producto base y parametriza el Depósito de Bajo Monto y Ordinario conforme a la Ley 1735 de Colombia.',
        regulatorScope: 'SFC (Decreto 1491)'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Dueño de Diseño Corporativo',
        scopeDescription: 'Equipo central de Producto responsable del roadmap, UX/UI, specs funcionales y arquitectura transversal.',
        regulatorScope: 'Dirección de Producto Global'
      }
    }
  },
  {
    id: 5,
    macrocategory: 'Misionales',
    categoryLevel1: 'Gestión Comercial',
    processGroupLevel2: 'Growth; Performance; Comercial B2B/B2C; Data Business',
    global81Hub: 'Dueño único - Growth/Performance/Data de grupo',
    globalCardChile: 'Líder comercial local - propone y ejecuta local',
    sedpeColombia: 'Líder comercial local - propone y ejecuta local',
    notes: '-',
    mappedProcessArea: 'Nuevos Productos',
    relevantAreas: ['Nuevos Productos', 'Operaciones'],
    companyRoles: {
      CARD: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Líder Comercial Local',
        scopeDescription: 'Ejecución de campañas locales de captación de tarjetahabientes y convenios comerciales en Chile.',
        regulatorScope: 'SERNAC Financiero & CMF'
      },
      SEDPE: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Líder Comercial Local',
        scopeDescription: 'Prospección B2B y captación B2C de depósitos electrónicos en el mercado colombiano.',
        regulatorScope: 'SIC & SFC'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Dueño Único de Growth & Data',
        scopeDescription: 'Centraliza la analítica de datos, inversión en pauta digital (performance) y modelos predictivos comerciales.',
        regulatorScope: 'Estrategia Comercial de Grupo'
      }
    }
  },
  {
    id: 6,
    macrocategory: 'Misionales',
    categoryLevel1: 'Gestión Tecnológica',
    processGroupLevel2: 'Core; QA; Infraestructura; Soporte',
    global81Hub: 'Dueño - core, QA, infraestructura',
    globalCardChile: 'Consume el servicio',
    sedpeColombia: 'Consume el servicio',
    notes: 'Infraestructura GCP / AWS, Mambu, Integraciones',
    mappedProcessArea: 'TI',
    relevantAreas: ['TI', 'Ciberseguridad', 'Riesgos Nube'],
    companyRoles: {
      CARD: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Consumidor del Servicio Central',
        scopeDescription: 'Utiliza el Core bancario y procesadores de pago administrados centralmente, monitoreando SLA locales.',
        regulatorScope: 'CMF (Circular 209)'
      },
      SEDPE: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Consumidor del Servicio Central',
        scopeDescription: 'Consume la infraestructura Cloud (AWS/GCP) y Core transaccional para la liquidación y procesamiento local.',
        regulatorScope: 'SFC (Circular 007 / Ciberseguridad)'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Dueño de Tecnología e Infraestructura',
        scopeDescription: 'Arquitectura cloud, DevSecOps, pipelines de CI/CD, Mambu, administración de microservicios y soporte L2/L3.',
        regulatorScope: 'Infraestructura Tecnológica Matriz'
      }
    }
  },
  {
    id: 7,
    macrocategory: 'Misionales',
    categoryLevel1: 'Gestión de Operaciones y Tesorería',
    processGroupLevel2: 'Administración de cuentas; Tesorería; Mesa de dinero; Conciliación y compensación; Liquidaciones',
    global81Hub: 'Conciliación/tesorería de grupo',
    globalCardChile: 'Administración de cuentas y tesorería local',
    sedpeColombia: 'El más profundo - reportes regulatorios, conciliación bancaria, tesorería y mesa de dinero',
    notes: 'Contiene los subprocesos críticos de Conciliaciones, FASCOM, DAPs y Liquidación diaria',
    mappedProcessArea: 'Conciliaciones',
    relevantAreas: ['Conciliaciones', 'Operaciones', 'Mesa de Dinero', 'Tesorería'],
    companyRoles: {
      CARD: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Administración & Tesorería Local',
        scopeDescription: 'Gestión de saldos de provisión de fondos en bancos autorizados, custodia y liquidación con marcas (Mastercard).',
        regulatorScope: 'CMF & Banco Central de Chile'
      },
      SEDPE: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Núcleo de Mayor Profundidad Documental',
        scopeDescription: 'Proceso neurálgico: Conciliación bancaria diaria, compensación ACH/PSE/Bre-B, administración de mesa de dinero y calce de liquidez.',
        regulatorScope: 'SFC & Banco de la República'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Conciliación & Tesorería de Grupo',
        scopeDescription: 'Consolidación de tesorería regional, manejo de divisas en corresponsales globales y posiciones FX de la compañía.',
        regulatorScope: 'Tesorería Corporativa Holding'
      }
    }
  },
  {
    id: 8,
    macrocategory: 'Misionales',
    categoryLevel1: 'Experiencia de Cliente',
    processGroupLevel2: 'Atención al cliente/SAC; Defensor del consumidor financiero',
    global81Hub: 'Dueño de estándar',
    globalCardChile: 'Ejecuta localmente',
    sedpeColombia: 'Ejecuta localmente (SAC, defensor del consumidor)',
    notes: '-',
    mappedProcessArea: 'Operaciones',
    relevantAreas: ['Operaciones'],
    companyRoles: {
      CARD: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecución Local de Atención',
        scopeDescription: 'Atención a titulares de tarjeta, gestión de fraudes impugnados, reclamos SERNAC y mesa de ayuda telefónica/digital.',
        regulatorScope: 'CMF & SERNAC'
      },
      SEDPE: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecuta Localmente con Defensoría',
        scopeDescription: 'Operación del SAC bajo requerimientos SFC, atención de PQRs, y articulación con la figura obligatoria del Defensor del Consumidor Financiero.',
        regulatorScope: 'SFC (SAC y Defensor del Consumidor)'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Dueño de Estándar Regional',
        scopeDescription: 'Define métricas de calidad de servicio (NPS/CSAT), herramientas Omnicanal (Zendesk) y guías maestras de tono de atención.',
        regulatorScope: 'Estándar CX Regional'
      }
    }
  },
  {
    id: 9,
    macrocategory: 'De Apoyo',
    categoryLevel1: 'Gestión del Talento Humano',
    processGroupLevel2: 'Selección; Compensación; Capacitación; Onboarding/Offboarding',
    global81Hub: 'Marco de política de grupo',
    globalCardChile: 'Ejecuta localmente',
    sedpeColombia: 'Ejecuta localmente',
    notes: '-',
    mappedProcessArea: 'Operaciones',
    relevantAreas: ['Operaciones'],
    companyRoles: {
      CARD: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecución Local de RR.HH.',
        scopeDescription: 'Contratación y nómina bajo Código del Trabajo de Chile, capacitaciones obligatorias UAF y salud ocupacional.',
        regulatorScope: 'Dirección del Trabajo de Chile'
      },
      SEDPE: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecución Local de RR.HH.',
        scopeDescription: 'Gestión laboral conforme al Código Sustantivo del Trabajo de Colombia, inducciones SARO/SARLAFT y SG-SST.',
        regulatorScope: 'Ministerio de Trabajo Colombia'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Marco de Política de Grupo',
        scopeDescription: 'Políticas corporativas de compensación, bandas salariales, cultura y programas regionales de formación continua.',
        regulatorScope: 'People & Culture Regional'
      }
    }
  },
  {
    id: 10,
    macrocategory: 'De Apoyo',
    categoryLevel1: 'Gestión Financiera, Contable y Administrativa',
    processGroupLevel2: 'Finanzas; Contabilidad; Compras y proveedores; Gestión administrativa',
    global81Hub: 'Ejecuta localmente',
    globalCardChile: 'Ejecuta localmente',
    sedpeColombia: 'Ejecuta localmente (mayor tercerización, ACW)',
    notes: '-',
    mappedProcessArea: 'Operaciones',
    relevantAreas: ['Operaciones'],
    companyRoles: {
      CARD: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecución Financiera Local',
        scopeDescription: 'Estados financieros bajo normas contables CMF, facturación electrónica SII y auditorías externas locales.',
        regulatorScope: 'CMF & SII Chile'
      },
      SEDPE: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Ejecución con Tercerización Contable',
        scopeDescription: 'Contabilidad bajo Catálogo Único de Cuentas SFC, tercerización con BPO contable (ACW), declaraciones DIAN.',
        regulatorScope: 'SFC & DIAN Colombia'
      },
      SPA: {
        roleType: 'EJECUTA_LOCAL',
        roleLabel: 'Contabilidad & Consolidación Matriz',
        scopeDescription: 'Consolidación contable IFRS de todas las subsidiarias y control presupuestario de las operaciones de grupo.',
        regulatorScope: 'Auditoría Corporativa & SII'
      }
    }
  },
  {
    id: 11,
    macrocategory: 'De Apoyo',
    categoryLevel1: 'Gestión de Activos',
    processGroupLevel2: '(nueva) Gestión de activos físicos, licencias y custodias',
    global81Hub: 'No formalizado',
    globalCardChile: 'No formalizado',
    sedpeColombia: 'No formalizado',
    notes: 'Brecha frente a APQC 10.0',
    mappedProcessArea: 'TI',
    relevantAreas: ['TI'],
    companyRoles: {
      CARD: {
        roleType: 'NO_FORMALIZADO',
        roleLabel: 'Brecha / Por Formalizar',
        scopeDescription: 'Inventario de activos tecnológicos y equipos no formalizado en procedimiento oficial.',
        regulatorScope: 'Brecha APQC 10.0',
        isGap: true
      },
      SEDPE: {
        roleType: 'NO_FORMALIZADO',
        roleLabel: 'Brecha / Por Formalizar',
        scopeDescription: 'Control de hardware y custodias no estandarizado en manual de gobierno.',
        regulatorScope: 'Brecha APQC 10.0',
        isGap: true
      },
      SPA: {
        roleType: 'NO_FORMALIZADO',
        roleLabel: 'Brecha / Por Formalizar',
        scopeDescription: 'Falta un procedimiento corporativo consolidado para la gestión de ciclo de vida de activos de TI y licencias Cloud.',
        regulatorScope: 'Brecha APQC 10.0',
        isGap: true
      }
    }
  },
  {
    id: 12,
    macrocategory: 'De Apoyo',
    categoryLevel1: 'Gestión Legal',
    processGroupLevel2: 'Procesos legales; gestión de contratos',
    global81Hub: 'Dueño - define lineamientos generales para el grupo',
    globalCardChile: 'Adaptación local según regulación chilena',
    sedpeColombia: 'Adaptación local según regulación colombiana (a formalizar en el mapa maestro)',
    notes: '-',
    mappedProcessArea: 'Cumplimiento',
    relevantAreas: ['Cumplimiento'],
    companyRoles: {
      CARD: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Adaptación Legal Local',
        scopeDescription: 'Revisión y firma de contratos locales, patrocinio de litigios y cumplimiento contractual en Chile.',
        regulatorScope: 'Normativa Legal Chile'
      },
      SEDPE: {
        roleType: 'CONSUME_SERVICIO',
        roleLabel: 'Adaptación Legal Local',
        scopeDescription: 'Gestión contractual mercantil colombiana, poderes y representación legal ante juzgados y SFC.',
        regulatorScope: 'Marco Legal Colombiano'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Dueño Legal Corporativo',
        scopeDescription: 'Lineamientos maestros de contratación internacional, pactos de accionistas, propiedad intelectual y estructura societaria.',
        regulatorScope: 'Asesoría Jurídica Corporativa'
      }
    }
  },
  {
    id: 13,
    macrocategory: 'De Apoyo',
    categoryLevel1: 'Desarrollo de Capacidades de Negocio',
    processGroupLevel2: '(nueva) - gestión de cambio, expansión a nuevos países',
    global81Hub: 'Candidato natural a ser dueño (expansión regional)',
    globalCardChile: 'No formalizado',
    sedpeColombia: 'No formalizado',
    notes: 'Brecha frente a APQC 13.0',
    mappedProcessArea: 'Nuevos Productos',
    relevantAreas: ['Nuevos Productos'],
    companyRoles: {
      CARD: {
        roleType: 'NO_FORMALIZADO',
        roleLabel: 'No Formalizado',
        scopeDescription: 'Proceso de innovación y gestión del cambio no establecido formalmente a nivel local.',
        regulatorScope: 'Brecha APQC 13.0',
        isGap: true
      },
      SEDPE: {
        roleType: 'NO_FORMALIZADO',
        roleLabel: 'No Formalizado',
        scopeDescription: 'Gestión de nuevas capacidades institucionales pendiente de incorporación al catálogo de procesos.',
        regulatorScope: 'Brecha APQC 13.0',
        isGap: true
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Candidato Natural a Dueño',
        scopeDescription: 'Dirección de proyectos de expansión a nuevos mercados en Latinoamérica y absorción de nuevas capacidades de negocio.',
        regulatorScope: 'Estrategia de Expansión Corporativa',
        isGap: true
      }
    }
  },
  {
    id: 14,
    macrocategory: 'Evaluación Independiente',
    categoryLevel1: 'Auditoría Interna',
    processGroupLevel2: 'Planeación y ejecución de auditoría; seguimiento a planes de acción',
    global81Hub: 'Categoría propia (Evaluación)',
    globalCardChile: 'Categoría propia (Evaluación)',
    sedpeColombia: 'Categoría propia (Evaluación)',
    notes: 'Aseguramiento de tercera línea de defensa',
    mappedProcessArea: 'Cumplimiento',
    relevantAreas: ['Cumplimiento'],
    companyRoles: {
      CARD: {
        roleType: 'APLICA_PROPIO',
        roleLabel: 'Categoría Propia (Tercera Línea)',
        scopeDescription: 'Auditoría interna obligatoria reportando directamente al Comité de Auditoría y Directorio de Global Card.',
        regulatorScope: 'CMF (NCG 464 Cap. IV)'
      },
      SEDPE: {
        roleType: 'APLICA_PROPIO',
        roleLabel: 'Categoría Propia (Tercera Línea)',
        scopeDescription: 'Auditoría interna con examen anual de los sistemas SARO, SARLAFT y de Control Interno exigidos por la SFC.',
        regulatorScope: 'SFC (Circular Básica Jurídica)'
      },
      SPA: {
        roleType: 'DUENO',
        roleLabel: 'Auditoría Interna Corporativa',
        scopeDescription: 'Consolidación del plan anual de auditoría regional y seguimiento de hallazgos críticos de todas las filiales.',
        regulatorScope: 'Comité de Auditoría de Grupo'
      }
    }
  }
];

export interface GovernanceDocument {
  id: string;
  code: string;
  title: string;
  type: GovernanceDocType;
  companyCode: GovernanceCompanyCode;
  processArea: ProcessArea;
  ownerDepartment: string;
  ownerRole: string;
  responsible: string;
  approver: string;
  version: string;
  issueDate: string;
  reviewDate: string;
  status: GovernanceDocStatus;
  rawSourceNotes: string;
  versionControl: VersionControlEntry[];
  objective: string;
  scope: string;
  definitions: { term: string; definition: string }[];
  descriptionContent: string; // Steps or guidelines or instructions
  steps?: GovernanceStep[]; // For procedures
  guidelines?: { topic: string; principle: string; mandatoryRule: string }[]; // For policies
  patterns?: { module: string; operationalRule: string; architectureGuide: string }[]; // For manuals
  controlAndMonitoring: string;
  criteriaRules?: string; // For procedures
  references: string[];
  annexes: string[];
  distribution: string[];
  linkedRiskIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MÓDULO: EVENTOS DE RIESGO OPERACIONAL & REGULATORIO (CMF & SFC)
// ==========================================

export type EventSeverity = 'Crítica' | 'Alta' | 'Media' | 'Baja';
export type EventStatus = 'En Investigación' | 'Confirmado' | 'En Mitigación' | 'Cerrado' | 'Reportado a Regulador';
export type CMFReportStatus = 'Por diligenciar' | 'En preparación' | 'Notificado a CMF' | 'Exento de reporte';
export type SFCReportStatus = 'Por diligenciar' | 'En preparación' | 'Notificado a SFC' | 'Exento de reporte';

export interface EventActionPlanItem {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  immediateAction: string;
  longTermPreventativeAction: string;
  responsible: string;
  responsibleRole?: string;
  targetDate: string;
  status: 'Por iniciar' | 'En proceso' | 'Completado' | 'Vencido';
  progress: number; // 0-100
  budgetUSD?: string;
  framework: 'CMF' | 'SFC' | 'ISO 31000' | 'SARO' | 'Fraude' | 'Continuidad';
  createdAt: string;
  notes?: string;
}

export interface RegulatoryRiskEvent {
  id: string; // e.g. 'EVT-2026-001'
  code: string; // e.g. 'EVT-ADQ-001'
  title: string;
  status: EventStatus;
  severity: EventSeverity;
  product: string; // e.g. 'Adquirencia Global'
  subproduct?: string; // e.g. 'PayIn con Tarjeta / Link de Cobro B2B'
  processArea: ProcessArea; // e.g. 'Fraude'
  secondaryProcessArea?: ProcessArea; // e.g. 'Operaciones'
  partnerInvolved: string; // e.g. 'Inswitch / Movantis'
  gatewayOrSwitch?: string; // e.g. 'CredibanCo (CO) / Kushki (CL)'

  // Entidades Afectadas
  affectedEntities: Jurisdiction[]; // ['Colombia', 'Chile', 'Regional']
  primaryEntity: Jurisdiction;
  legalEntities: string[]; // ['Global66 Colombia S.A.S.', 'Global Card S.P.A.', 'Global66 SpA']

  // Cronología
  dateOccurred: string;
  timeOccurred: string;
  dateDiscovered: string;
  timeDiscovered: string;
  dateReportedInternal: string;
  dateSuspensionProduct?: string;
  reportedBy: string;

  // Cuantificación Financiera
  grossAmountUSD: number; // e.g. 128598
  grossAmountLocalCurrency: string; // e.g. 'COP 540.111.600 / CLP Por diligenciar'
  heldAmountUSD: number; // e.g. 128598
  contractualReserveRate: string; // e.g. '5% contractual'
  contractualReserveUSD: number;
  recoveredAmountUSD: number;
  netLossUSD: number;
  affectedTransactionsCount: number; // e.g. 78
  affectedUsersCount: string; // 'Por diligenciar'
  affectedCardsCount: string; // 'Por diligenciar'

  // Descripción y Causa Raíz
  description: string;
  technicalDetails: string;
  rootCause: string;
  impactSummary: string;
  immediateActionsTaken: string;

  // Campos Regulador CMF (Chile - NCG 464, RAN 20-10)
  cmfEventType: string;
  cmfReportRequired: boolean | string;
  cmfReportDeadline: string;
  cmfReportStatus: CMFReportStatus;
  cmfOfficialFormNumber: string; // 'Por diligenciar'
  cmfAffectedClientsChile: string; // 'Por diligenciar'
  cmfContinuityImpactChile: string;
  cmfMitigationPlanSummary: string;
  cmfResponsibleOfficer: string;

  // Campos Regulador SFC (Colombia - Circular Externa 029/2014 SARO)
  sfcEventClass: string; // 'Clase A (Con impacto o contingencia financiera directa)'
  sfcRiskFactor: string; // 'Tecnología / Proveedores / Procesos'
  sfcBilateralCategory: string; // 'Fraude Externo en Medios de Pago'
  sfcConsumerImpact: string; // 'Por diligenciar'
  sfcReportStatus: SFCReportStatus;
  sfcFormatTransmission: string; // 'Por diligenciar'
  sfcAccountingAccount: string; // 'Por diligenciar'
  sfcResponsibleOfficer: string;

  // Vinculación a Riesgos y Planes de Acción
  associatedRiskIds?: string[];
  actionPlans: EventActionPlanItem[];

  // Transaccionalidad Fraudulenta & Cuentas Bloqueadas
  fraudulentClients?: FraudulentClientRecord[];
  fraudulentTransactions?: FraudulentTransactionRecord[];
  frozenWalletBalanceCOP?: number; // 13850654.61 COP
  frozenWalletBalanceUSD?: number; // 4285.73 USD

  createdAt: string;
  updatedAt: string;
}

export interface FraudulentClientRecord {
  id: string;
  clientEmail: string;
  registrationDate: string;
  hadInswitchIn: string; // 'Si' | 'No' | 'Pendiente'
  transactionCount?: number | string;
  transactionValue?: number | string;
  transactionValueUSD?: number;
  transactionValueCOP?: number;
  status: 'BLOCKED' | 'FULLY_BLOCKED';
  blockDate: string;
  currentBalanceCOP: number;
  currentBalanceFormatted: string;
  associatedCardBins?: string[];
  fraudPattern?: string;
  ipOrigin?: string;
}

export interface FraudulentTransactionRecord {
  transactionId: string;
  externalReference: string;
  clientEmail: string;
  clientId: string;
  timestamp: string;
  amountUSD: number;
  amountCOP: number;
  paymentRail: string;
  cardBin: string;
  cardLast4: string;
  cardBrand: 'Visa' | 'Mastercard' | 'American Express' | 'Diners Club';
  cardCountry: string;
  issuingBank: string;
  threeDSStatus: 'FALLIDO' | 'NO_ENROLADO' | 'RECHAZADO' | 'BYPASS_INTENT' | 'APROBADO_SIN_FRICCIÓN';
  authCode?: string;
  gatewayResponseCode: string;
  velocityAttemptsInHour: number;
  fraudPattern: 'Card Testing Masivo' | 'Smurfing / Fraccionamiento' | 'Multi-BIN Testing' | 'Extracción Rápida de Fondos' | 'Account Takeover / Cuentas Sintéticas';
  inswitchStatus: 'HOLD_RETENIDO' | 'DISPUTA_CHARGEBACK' | 'REVERTIDO_GATEWAY' | 'EN_INVESTIGACION';
  ipAddress: string;
  deviceFingerprint: string;
}




