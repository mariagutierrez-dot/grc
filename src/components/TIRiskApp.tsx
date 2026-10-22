import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Layers, 
  Lock, 
  Eye, 
  CheckSquare, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sliders, 
  RefreshCw, 
  HelpCircle, 
  ListFilter,
  FileCode,
  Activity,
  Maximize2,
  Calendar,
  Layers2,
  Building,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  BookOpen,
  Tag,
  Server
} from 'lucide-react';
import { InformationAsset } from '../types';
import { 
  ComprehensiveITAsset, 
  COMPREHENSIVE_TI_ASSETS 
} from '../data/tiAssetsAndDataClassification';
import { TIAssetInventoryView } from './TIAssetInventoryView';
import { TIDataClassificationView } from './TIDataClassificationView';
import { TISystemsInventoryModule } from './TISystemsInventoryModule';

// Let's model a robust IT Threat/Risk specific to ISO 27001
export interface ITThreatRisk {
  id: string;
  assetId: string; // Linked InformationAsset
  name: string; // Brief name
  threat: string; // Threat description
  vulnerability: string; // Vulnerability description
  cImpact: number; // Confidentiality Impact (1-5)
  iImpact: number; // Integrity Impact (1-5)
  aImpact: number; // Availability Impact (1-5)
  probability: number; // Probability (1-5)
  iso27001Controls: string[]; // E.g., ["A.8.12", "A.8.24"]
  mitigationStatus: 'No Mitigado' | 'Mitigación Parcial' | 'Mitigado';
  actionPlan: string;
  residualC?: number;
  residualI?: number;
  residualA?: number;
  residualProb?: number;
}

// Default ISO 27001 Controls catalogue (ISO 27001:2022 Version)
export interface ISO27001Control {
  code: string;
  domain: 'Organizacionales' | 'Personales' | 'Físicos' | 'Tecnológicos';
  name: string;
  description: string;
  implementationState: 'Implementado' | 'Parcial' | 'No Implementado';
  evidenceDetails: string;
}

const DEFAULT_ISO_CONTROLS: ISO27001Control[] = [
  {
    code: 'A.5.15',
    domain: 'Organizacionales',
    name: 'Control de accesos',
    description: 'Políticas y derechos de acceso físico y lógico administrados sobre la base de requerimientos de negocio y necesidades de seguridad.',
    implementationState: 'Parcial',
    evidenceDetails: 'Control basado en roles (RBAC) parcial en consolas administrativas de backend. Se prevé exigir MFA obligatorio para analistas.'
  },
  {
    code: 'A.5.18',
    domain: 'Organizacionales',
    name: 'Derechos de acceso especiales',
    description: 'La asignación e implementación de derechos de acceso privilegiados (ej: superusuario, DBA) debe ser estrictamente controlada.',
    implementationState: 'Parcial',
    evidenceDetails: 'Acceso a BBDD PostgreSQL restringido por VPN, pero se documentó uso del usuario root por parte de infraestructura sin triggers automáticos.'
  },
  {
    code: 'A.7.4',
    domain: 'Personales',
    name: 'Concienciación en seguridad de la información',
    description: 'Los empleados de la organización deben recibir formación y concienciación apropiada para evitar incidentes de suplantación o ingeniería social.',
    implementationState: 'Implementado',
    evidenceDetails: 'Capacitación anual aprobada por la C-Suite de Global66 enfocada en fraude por SIM swapping, suplantación y phishing.'
  },
  {
    code: 'A.8.2',
    domain: 'Tecnológicos',
    name: 'Registro de eventos (Auditoría)',
    description: 'Los registros de eventos de sistemas y operaciones deben generarse, conservarse y revisarse regularmente.',
    implementationState: 'Parcial',
    evidenceDetails: 'Nube AWS CloudTrail activo para infraestructura pero faltan logs de auditoría lógica detallados en la consola local de re-procesamientos de saldo.'
  },
  {
    code: 'A.8.10',
    domain: 'Tecnológicos',
    name: 'Prevención de pérdida de datos (DLP)',
    description: 'Se deben aplicar medidas sobre los sistemas para evitar la fuga de información confidencial en tránsito o reposo.',
    implementationState: 'No Implementado',
    evidenceDetails: 'Las planillas Excel de conciliación bancaria y cartolas no poseen firmas criptográficas ni herramientas de bloqueo DLP local.'
  },
  {
    code: 'A.8.12',
    domain: 'Tecnológicos',
    name: 'Cifrado (Criptografía)',
    description: 'Uso correcto de la criptografía para proteger la confidencialidad e integridad de la información sensible.',
    implementationState: 'Implementado',
    evidenceDetails: 'Cifrado de datos en reposo AWS KMS activo en disco RDS PostgreSQL, datos biométricos hashes en tránsito protegidos con TLS 1.3.'
  },
  {
    code: 'A.8.14',
    domain: 'Tecnológicos',
    name: 'Redundancia operacional',
    description: 'Los sistemas de procesamiento de información deben contar con redundancia para cumplir con los objetivos de continuidad del negocio.',
    implementationState: 'Parcial',
    evidenceDetails: 'Redundancia automática de zonas de disponibilidad en AWS, pero falta failover activo-activo ante desastres bancarios locales de red.'
  },
  {
    code: 'A.8.20',
    domain: 'Tecnológicos',
    name: 'Seguridad de redes',
    description: 'Las redes corporativas y canales de APIs deben estar protegidos y controlados para evitar filtraciones.',
    implementationState: 'Implementado',
    evidenceDetails: 'Estructura mTLS perimetral con reglas WAF robustas para el tráfico entrante al Core de Dispersión.'
  },
  {
    code: 'A.8.24',
    domain: 'Tecnológicos',
    name: 'Desarrollo seguro de software',
    description: 'Reglas y directrices de desarrollo seguro de software y APIs aplicadas en todo el ciclo de vida del producto.',
    implementationState: 'Parcial',
    evidenceDetails: 'Revisión técnica de Pull Requests por mánagers, pero sin análisis de vulnerabilidades SAST/DAST automatizado en la tubería CI/CD.'
  }
];

const INITIAL_IT_RISKS: ITThreatRisk[] = [
  {
    id: 'R-ISO-01',
    assetId: 'AST-04',
    name: 'Inyección SQL y Fuga de Cartolas gubernamentales',
    threat: 'Acceso malintencionado directo a las bases de datos transaccionales de Wallet.',
    vulnerability: 'Falta de sanitización / validadores SAST o control estricto de inputs de consulta.',
    cImpact: 5,
    iImpact: 4,
    aImpact: 3,
    probability: 2,
    iso27001Controls: ['A.8.12', 'A.8.24', 'A.5.18'],
    mitigationStatus: 'Mitigación Parcial',
    actionPlan: 'Desplegar escáneres automáticos de seguridad en CI/CD y encriptar columnas sensibles en base de datos PostgreSQL.',
    residualC: 3,
    residualI: 2,
    residualA: 2,
    residualProb: 1
  },
  {
    id: 'R-ISO-02',
    assetId: 'AST-02',
    name: 'Ataque DDoS de Extorsión de Red en Gateway',
    threat: 'Indisponibilidad prolongada por saturación volumétrica del túnel de enlace bancario.',
    vulnerability: 'Umbral de velocidad laxo e insuficiente redundancia global de balanceadores.',
    cImpact: 1,
    iImpact: 2,
    aImpact: 5,
    probability: 3,
    iso27001Controls: ['A.8.20', 'A.8.14'],
    mitigationStatus: 'Mitigado',
    actionPlan: 'Habilitar reglas de mitigación DDoS dinámicas bajo Cloudflare Enterprise y WAF activo.',
    residualC: 1,
    residualI: 1,
    residualA: 2,
    residualProb: 1
  },
  {
    id: 'R-ISO-03',
    assetId: 'AST-05',
    name: 'Bypass y Suplantación del Liveness Check',
    threat: 'Aprobación fraudulenta de onboarding mediante videos pregrabados e inteligencia artificial generativa.',
    vulnerability: 'Versión desactualizada del SDK biométrico y falta de pruebas activas aleatorias cruzadas.',
    cImpact: 4,
    iImpact: 5,
    aImpact: 3,
    probability: 3,
    iso27001Controls: ['A.5.15', 'A.7.4'],
    mitigationStatus: 'Mitigación Parcial',
    actionPlan: 'Actualizar SDK del proveedor biométrico a versión con prueba de vida pasiva y 3D liveness check síncrono.',
    residualC: 2,
    residualI: 2,
    residualA: 2,
    residualProb: 2
  },
  {
    id: 'R-ISO-04',
    assetId: 'AST-07',
    name: 'Modificación Maliciosa de Saldos e Insider Threat',
    threat: 'Alteración fraudulenta directa de montos de cartola manual sin bitácoras operativas rigurosas.',
    vulnerability: 'Doble autenticación inactiva y falta de log inmutable de operaciones administrativas.',
    cImpact: 3,
    iImpact: 5,
    aImpact: 4,
    probability: 2,
    iso27001Controls: ['A.5.15', 'A.8.2', 'A.5.18'],
    mitigationStatus: 'No Mitigado',
    actionPlan: 'Implementar aprobación dual (Maker-Checker) bajo mTLS y doble factor en todas las modificaciones de saldo.',
    residualC: 3,
    residualI: 5,
    residualA: 4,
    residualProb: 2
  },
  {
    id: 'R-ISO-05',
    assetId: 'AST-08',
    name: 'Exfiltración de Cartolas por Correo Externo',
    threat: 'Fuga involuntaria o maliciosa de reportes interbancarios en hojas Excel no encriptadas.',
    vulnerability: 'Inexistencia de DLP y políticas de descargas no controladas en terminales de tesorería.',
    cImpact: 5,
    iImpact: 3,
    aImpact: 2,
    probability: 4,
    iso27001Controls: ['A.8.10', 'A.8.12'],
    mitigationStatus: 'No Mitigado',
    actionPlan: 'Implementar suite Endpoint DLP corporativa y firma criptográfica obligatoria para adjuntos financieros.',
    residualC: 2,
    residualI: 2,
    residualA: 1,
    residualProb: 2
  },
  {
    id: 'R-ISO-06',
    assetId: 'AST-GW-AUTH',
    name: 'Fuga de Credenciales y Ataque Credential Stuffing en Auth API',
    threat: 'Compromiso masivo de cuentas por reutilización de contraseñas filtradas en otros sitios.',
    vulnerability: 'Ausencia de detección de IP rotativas y falta de Rate Limiting granular en /v1/auth/login.',
    cImpact: 5,
    iImpact: 4,
    aImpact: 3,
    probability: 3,
    iso27001Controls: ['A.5.15', 'A.8.20'],
    mitigationStatus: 'Mitigación Parcial',
    actionPlan: 'Imponer MFA obligatorio por TOTP/SMS y activar AWS WAF Bot Control para la ruta /v1/auth/*.',
    residualC: 2,
    residualI: 2,
    residualA: 1,
    residualProb: 1
  },
  {
    id: 'R-ISO-07',
    assetId: 'AST-GW-WALLET',
    name: 'Vulnerabilidad BOLA (Broken Object Level Auth) en API de Billetera',
    threat: 'Acceso no autorizado al balance o transacciones de otros usuarios manipulando el wallet_id en peticiones HTTP.',
    vulnerability: 'Validación insuficiente de pertenencia de objeto contra el token JWT en el gateway.',
    cImpact: 5,
    iImpact: 5,
    aImpact: 3,
    probability: 2,
    iso27001Controls: ['A.8.24', 'A.5.15'],
    mitigationStatus: 'Mitigado',
    actionPlan: 'Implementar validación contextual en Lambda Authorizer cruzando el sub del token JWT con el account_id.',
    residualC: 1,
    residualI: 1,
    residualA: 1,
    residualProb: 1
  },
  {
    id: 'R-ISO-08',
    assetId: 'DAT-DB-CARD-TOK',
    name: 'Compromiso de Enclave de Tokenización PCI-DSS',
    threat: 'Exposición del PAN de tarjetas prepago por mala configuración de permisos en CloudHSM.',
    vulnerability: 'Falta de auditoría periódica de roles IAM asociados a la VPC de tokenización.',
    cImpact: 5,
    iImpact: 4,
    aImpact: 2,
    probability: 1,
    iso27001Controls: ['A.8.12', 'A.5.18'],
    mitigationStatus: 'Mitigado',
    actionPlan: 'Auditoría trimestral QSA PCI-DSS y rotación automatizada de llaves de cifrado en CloudHSM.',
    residualC: 1,
    residualI: 1,
    residualA: 1,
    residualProb: 1
  }
];

const INITIAL_ASSETS_FALLBACK: InformationAsset[] = [
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

export const TIRiskApp: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'systems' | 'assets' | 'classification' | 'risks' | 'controls' | 'soa'>('dashboard');
  
  // Loaded comprehensive information assets (incorporating API Gateway and Ley 21.719)
  const [assets, setAssets] = useState<ComprehensiveITAsset[]>(() => {
    const saved = localStorage.getItem('g66_ti_comprehensive_assets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return COMPREHENSIVE_TI_ASSETS;
  });

  // IT Risks state
  const [itRisks, setItRisks] = useState<ITThreatRisk[]>(() => {
    const saved = localStorage.getItem('g66_it_risks_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_IT_RISKS;
  });

  // ISO Controls state
  const [isoControls, setIsoControls] = useState<ISO27001Control[]>(() => {
    const saved = localStorage.getItem('g66_iso_controls');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_ISO_CONTROLS;
  });

  // Persist alterations
  useEffect(() => {
    localStorage.setItem('g66_ti_comprehensive_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('g66_it_risks_v2', JSON.stringify(itRisks));
  }, [itRisks]);

  useEffect(() => {
    localStorage.setItem('g66_iso_controls', JSON.stringify(isoControls));
  }, [isoControls]);

  // Form State for Risks
  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ITThreatRisk | null>(null);
  const [riskFormData, setRiskFormData] = useState<Omit<ITThreatRisk, 'id'>>({
    assetId: '',
    name: '',
    threat: '',
    vulnerability: '',
    cImpact: 3,
    iImpact: 3,
    aImpact: 3,
    probability: 3,
    iso27001Controls: [],
    mitigationStatus: 'No Mitigado',
    actionPlan: '',
    residualC: 2,
    residualI: 2,
    residualA: 2,
    residualProb: 2
  });

  // Form State for Controls
  const [editingControl, setEditingControl] = useState<ISO27001Control | null>(null);
  const [controlFormData, setControlFormData] = useState({
    implementationState: 'No Implementado' as any,
    evidenceDetails: ''
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('TODOS');
  const [selectedMitigationFilter, setSelectedMitigationFilter] = useState('TODOS');
  const [selectedRiskScale, setSelectedRiskScale] = useState<'TODOS' | 'EXTREMO' | 'ALTO' | 'MODERADO' | 'BAJO'>('TODOS');

  // Compute maximum threat level matrix calculations
  const getCombinedImpact = (c: number, i: number, a: number) => {
    // Standard ISO 27005: Combined impact is usually the maximum value across CIA to reflect the worst-case scenario
    return Math.max(c, i, a);
  };

  const getITRiskScore = (risk: ITThreatRisk, mode: 'inherent' | 'residual' = 'inherent') => {
    const prob = mode === 'residual' ? (risk.residualProb ?? risk.probability) : risk.probability;
    const c = mode === 'residual' ? (risk.residualC ?? risk.cImpact) : risk.cImpact;
    const i = mode === 'residual' ? (risk.residualI ?? risk.iImpact) : risk.iImpact;
    const a = mode === 'residual' ? (risk.residualA ?? risk.aImpact) : risk.aImpact;
    
    const maxImpact = getCombinedImpact(c, i, a);
    return prob * maxImpact;
  };

  const getITRiskLevelLabel = (score: number) => {
    if (score > 16) return 'EXTREMO';
    if (score > 11) return 'ALTO';
    if (score > 6) return 'MODERADO';
    return 'BAJO';
  };

  const getITRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'EXTREMO': return 'bg-red-600 text-white border border-red-700';
      case 'ALTO': return 'bg-orange-500 text-white border border-orange-600';
      case 'MODERADO': return 'bg-yellow-400 text-slate-950 border border-yellow-500';
      default: return 'bg-green-500 text-white border border-green-600';
    }
  };

  const getAcceptabilityStatus = (score: number) => {
    return score <= 12 ? 'ACEPTABLE' : 'NO ACEPTABLE (Requiere tratamiento urgente)';
  };

  // Math metrics for CIA
  const statistics = useMemo(() => {
    const totalRisks = itRisks.length;
    const scoreSum = itRisks.reduce((sum, r) => sum + getITRiskScore(r), 0);
    const residualScoreSum = itRisks.reduce((sum, r) => sum + getITRiskScore(r, 'residual'), 0);
    
    // Average CIA impacts
    const avgC = (itRisks.reduce((sum, r) => sum + r.cImpact, 0) / (totalRisks || 1)).toFixed(1);
    const avgI = (itRisks.reduce((sum, r) => sum + r.iImpact, 0) / (totalRisks || 1)).toFixed(1);
    const avgA = (itRisks.reduce((sum, r) => sum + r.aImpact, 0) / (totalRisks || 1)).toFixed(1);

    const nonAcceptableCountInherent = itRisks.filter(r => getITRiskScore(r) > 12).length;
    const nonAcceptableCountResidual = itRisks.filter(r => getITRiskScore(r, 'residual') > 12).length;

    // Control statistics
    const totalControls = isoControls.length;
    const implementedCount = isoControls.filter(c => c.implementationState === 'Implementado').length;
    const partialCount = isoControls.filter(c => c.implementationState === 'Parcial').length;
    const complianceRate = Math.round(((implementedCount + partialCount * 0.5) / totalControls) * 100);

    return {
      totalRisks,
      avgC,
      avgI,
      avgA,
      nonAcceptableCountInherent,
      nonAcceptableCountResidual,
      avgInherentScore: (scoreSum / (totalRisks || 1)).toFixed(1),
      avgResidualScore: (residualScoreSum / (totalRisks || 1)).toFixed(1),
      complianceRate,
      implementedCount
    };
  }, [itRisks, isoControls]);

  // Assets mapped for select dropdowns
  const assetsMap = useMemo(() => {
    const map = new Map<string, string>();
    INITIAL_ASSETS_FALLBACK.forEach(a => map.set(a.id, a.name));
    assets.forEach(a => map.set(a.id, a.name));
    return map;
  }, [assets]);

  // Filtered risks
  const filteredITRisks = useMemo(() => {
    return itRisks.filter(risk => {
      const assetName = assetsMap.get(risk.assetId) || '';
      
      const matchesSearch = 
        risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.threat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.vulnerability.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assetName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAsset = selectedAssetFilter === 'TODOS' || risk.assetId === selectedAssetFilter;
      const matchesMitigation = selectedMitigationFilter === 'TODOS' || risk.mitigationStatus === selectedMitigationFilter;
      
      const score = getITRiskScore(risk);
      const level = getITRiskLevelLabel(score);
      const matchesScale = selectedRiskScale === 'TODOS' || level === selectedRiskScale;

      return matchesSearch && matchesAsset && matchesMitigation && matchesScale;
    });
  }, [itRisks, searchQuery, selectedAssetFilter, selectedMitigationFilter, selectedRiskScale, assetsMap]);

  // Submits form
  const handleRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskFormData.assetId) {
      alert('Debe vincular un sistema de información o activo.');
      return;
    }

    if (editingRisk) {
      // Edit
      const updated = itRisks.map(r => r.id === editingRisk.id ? { ...riskFormData, id: editingRisk.id } : r);
      setItRisks(updated);
      setEditingRisk(null);
    } else {
      // Create
      const newId = `R-ISO-${String(itRisks.length + 1).padStart(3, '0')}`;
      const newRisk: ITThreatRisk = {
        ...riskFormData,
        id: newId
      };
      setItRisks([newRisk, ...itRisks]);
    }

    setShowForm(false);
    resetRiskForm();
  };

  const resetRiskForm = () => {
    setRiskFormData({
      assetId: assets[0]?.id || '',
      name: '',
      threat: '',
      vulnerability: '',
      cImpact: 3,
      iImpact: 3,
      aImpact: 3,
      probability: 3,
      iso27001Controls: [],
      mitigationStatus: 'No Mitigado',
      actionPlan: '',
      residualC: 2,
      residualI: 2,
      residualA: 2,
      residualProb: 2
    });
  };

  const startEditRisk = (risk: ITThreatRisk) => {
    setEditingRisk(risk);
    setRiskFormData({
      assetId: risk.assetId,
      name: risk.name,
      threat: risk.threat,
      vulnerability: risk.vulnerability,
      cImpact: risk.cImpact,
      iImpact: risk.iImpact,
      aImpact: risk.aImpact,
      probability: risk.probability,
      iso27001Controls: [...risk.iso27001Controls],
      mitigationStatus: risk.mitigationStatus,
      actionPlan: risk.actionPlan,
      residualC: risk.residualC ?? 2,
      residualI: risk.residualI ?? 2,
      residualA: risk.residualA ?? 2,
      residualProb: risk.residualProb ?? 2
    });
    setShowForm(true);
  };

  const handleDeleteRisk = (riskId: string) => {
    if (window.confirm(`¿Seguro que desea remover la evaluación de riesgo ${riskId}?`)) {
      setItRisks(itRisks.filter(r => r.id !== riskId));
    }
  };

  const handleUpdateControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingControl) return;

    const modified = isoControls.map(c => 
      c.code === editingControl.code 
        ? { ...c, implementationState: controlFormData.implementationState, evidenceDetails: controlFormData.evidenceDetails }
        : c
    );
    setIsoControls(modified);
    setEditingControl(null);
  };

  const toggleControlInRiskForm = (code: string) => {
    const current = riskFormData.iso27001Controls;
    if (current.includes(code)) {
      setRiskFormData({
        ...riskFormData,
        iso27001Controls: current.filter(c => c !== code)
      });
    } else {
      setRiskFormData({
        ...riskFormData,
        iso27001Controls: [...current, code]
      });
    }
  };

  return (
    <div id="ti_risk_app_root" className="space-y-6">
      
      {/* Dynamic Header - Standalone Application Interface */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/30">
                Sistema ISO 27001 & ISO 27005
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-500/30">
                C-Suite Global66
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Evaluación de Riesgos TI
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-3xl leading-relaxed">
              Módulo de seguridad de la información y cumplimiento regulatorio que audita amenazas lógicas, salvaguardas y resiliencia tecnológica basada en la Declaración de Aplicabilidad (SoA).
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                resetRiskForm();
                setEditingRisk(null);
                setShowForm(true);
              }}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Evaluar Amenaza TI</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation for IT App */}
        <div className="flex flex-wrap gap-2 border-t border-slate-800/80 mt-8 pt-4">
          {[
            { id: 'dashboard', label: 'Dashboard ISO 27001', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'systems', label: 'Inventario de Sistemas (Sistemas, Plataformas e Infraestructura)', icon: <Server className="w-4 h-4" /> },
            { id: 'assets', label: 'Inventario de Activos (ISO & API Gw)', icon: <Database className="w-4 h-4" /> },
            { id: 'classification', label: 'Clasificación de Activos y Datos (Ley 21.719)', icon: <Layers2 className="w-4 h-4" /> },
            { id: 'risks', label: 'Matriz de Riesgo CIA', icon: <Sliders className="w-4 h-4" /> },
            { id: 'controls', label: 'Controles Anexo A', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'soa', label: 'Declaración de Aplicabilidad (SoA)', icon: <CheckSquare className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setShowForm(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div id="add_it_risk_form" className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{editingRisk ? `Editar Evaluación de Riesgo TI: ${editingRisk.id}` : 'Registrar Evaluación de Riesgo TI / ISO 27005'}</span>
            </h3>
            <button 
              onClick={() => {
                setShowForm(false);
                setEditingRisk(null);
                resetRiskForm();
              }}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Cerrar Formulario
            </button>
          </div>

          <form onSubmit={handleRiskSubmit} className="space-y-4 text-slate-300">
            
            {/* Activo vinculado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Activo de Información / Sistema Afectado</label>
                <select
                  required
                  value={riskFormData.assetId}
                  onChange={e => setRiskFormData({ ...riskFormData, assetId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-white"
                >
                  <option value="">-- Seleccionar Activo Digital o API --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.id} - {a.name} ({a.category || a.type})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nombre Corto de la Amenaza</label>
                <input
                  required
                  type="text"
                  value={riskFormData.name}
                  onChange={e => setRiskFormData({ ...riskFormData, name: e.target.value })}
                  placeholder="Ej: Sql Injection, Spear Phishing a Tesorería..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-white"
                />
              </div>
            </div>

            {/* Amenaza y Vulnerabilidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Descripción de la Amenaza (Threat)</label>
                <textarea
                  required
                  rows={2}
                  value={riskFormData.threat}
                  onChange={e => setRiskFormData({ ...riskFormData, threat: e.target.value })}
                  placeholder="Ej: Intercepción del tráfico de bases de datos por malware con persistencia remota..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Descripción de la Vulnerabilidad (Vulnerability)</label>
                <textarea
                  required
                  rows={2}
                  value={riskFormData.vulnerability}
                  onChange={e => setRiskFormData({ ...riskFormData, vulnerability: e.target.value })}
                  placeholder="Ej: Ausencia de políticas de seguridad locales de puertos, y falta de logs lógicos..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-white"
                />
              </div>
            </div>

            {/* Triada CID + Probabilidad Inherente */}
            <div className="p-4 bg-slate-800/50 rounded-xl space-y-3 border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400">Dimensión de Riesgo Inherente (Tríada CIA)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">Confidencialidad (C)</label>
                  <select
                    value={riskFormData.cImpact}
                    onChange={e => setRiskFormData({ ...riskFormData, cImpact: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-white"
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} - {v===5?'Severo':v===1?'Mínimo':v===3?'Moderado':v===2?'Menor':'Mayor'}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">Integridad (I)</label>
                  <select
                    value={riskFormData.iImpact}
                    onChange={e => setRiskFormData({ ...riskFormData, iImpact: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-white"
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} - {v===5?'Severo':v===1?'Mínimo':v===3?'Moderado':v===2?'Menor':'Mayor'}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">Disponibilidad (A)</label>
                  <select
                    value={riskFormData.aImpact}
                    onChange={e => setRiskFormData({ ...riskFormData, aImpact: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-white"
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} - {v===5?'Severo':v===1?'Mínimo':v===3?'Moderado':v===2?'Menor':'Mayor'}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase block">Probabilidad (P)</label>
                  <select
                    value={riskFormData.probability}
                    onChange={e => setRiskFormData({ ...riskFormData, probability: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-white"
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} - {v===5?'Frecuente':v===1?'Raro':v===3?'Posible':v===2?'Improbable':'Muy Posible'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Mapeo de Controles ISO 27001 Anexo A */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Vinculación de Controles Anexo A (ISO 27001:2022)</label>
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-800/35 rounded-xl border border-slate-800">
                {isoControls.map(ctrl => {
                  const isChecked = riskFormData.iso27001Controls.includes(ctrl.code);
                  return (
                    <button
                      key={ctrl.code}
                      type="button"
                      onClick={() => toggleControlInRiskForm(ctrl.code)}
                      className={`px-2.5 py-1.5 text-[10px] rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isChecked 
                          ? 'bg-emerald-600 text-white border-emerald-500 font-extrabold' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>{ctrl.code} {ctrl.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mitigación y Plan de Acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Estado de Mitigación</label>
                <select
                  value={riskFormData.mitigationStatus}
                  onChange={e => setRiskFormData({ ...riskFormData, mitigationStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-white"
                >
                  <option value="No Mitigado">🔴 No Mitigado</option>
                  <option value="Mitigación Parcial">🟡 Mitigación Parcial</option>
                  <option value="Mitigado">🟢 Mitigado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Plan de Acción / Control de Mitigación</label>
                <input
                  required
                  type="text"
                  value={riskFormData.actionPlan}
                  onChange={e => setRiskFormData({ ...riskFormData, actionPlan: e.target.value })}
                  placeholder="Ej: Forzar mTLS, reevaluar accesos de forma semanal en base de datos..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-white"
                />
              </div>
            </div>

            {/* Tríada Residual (Se habilita si es parcial o mitigado) */}
            {riskFormData.mitigationStatus !== 'No Mitigado' && (
              <div className="p-4 bg-emerald-950/20 rounded-xl space-y-3 border border-emerald-900/30">
                <h4 className="text-xs font-bold text-emerald-300">Reducción de Riesgo Residual (Estimación de Eficacia)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-200 uppercase block">Res. Confidencialidad</label>
                    <select
                      value={riskFormData.residualC}
                      onChange={e => setRiskFormData({ ...riskFormData, residualC: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-200 uppercase block">Res. Integridad</label>
                    <select
                      value={riskFormData.residualI}
                      onChange={e => setRiskFormData({ ...riskFormData, residualI: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-200 uppercase block">Res. Disponibilidad</label>
                    <select
                      value={riskFormData.residualA}
                      onChange={e => setRiskFormData({ ...riskFormData, residualA: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-200 uppercase block">Res. Probabilidad</label>
                    <select
                      value={riskFormData.residualProb}
                      onChange={e => setRiskFormData({ ...riskFormData, residualProb: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRisk(null);
                  resetRiskForm();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {editingRisk ? 'Guardar Cambios TI' : 'Archivar Evaluación TI'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {activeSubTab === 'dashboard' && (
        <div id="ti_risk_dashboard_view" className="space-y-6">
          
          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Cumplimiento ISO 27001</p>
                  <h3 className="text-3xl font-black text-slate-950 mt-1">{statistics.complianceRate}%</h3>
                </div>
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  Anexo A
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${statistics.complianceRate}%` }} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Amenazas Criticas Lógicas</p>
                  <h3 className="text-3xl font-black text-red-600 mt-1">
                    {itRisks.filter(r => getITRiskScore(r) > 12).length}
                  </h3>
                </div>
                <span className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                  Score &gt; 12
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3">
                No aceptables sin tratamiento
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Confidencialidad Max Promedio</p>
                  <h3 className="text-3xl font-black text-slate-950 mt-1">{statistics.avgC} <span className="text-xs text-slate-400">/ 5</span></h3>
                </div>
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                  Tríada C
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3">
                Exposición global de datos sensibles
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Riesgo Residual Global</p>
                  <h3 className="text-3xl font-black text-emerald-700 mt-1">{statistics.avgResidualScore} <span className="text-xs text-slate-400">/ 25</span></h3>
                </div>
                <span className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold">
                  Mitigado
                </span>
              </div>
              <div className="text-[10px] mt-3 font-semibold text-slate-500">
                Inco: <span className="text-slate-800 font-extrabold">{statistics.avgInherentScore}</span> &rarr; Res: <span className="text-emerald-700 font-black">{statistics.avgResidualScore}</span>
              </div>
            </div>
          </div>

          {/* Visual Grid: Dynamic Matrix + CIA bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. CIA Triad Status Visualizer */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Estado de la Tríada de Seguridad</h4>
                <p className="text-slate-400 text-xs mt-0.5">Severidad promedio de las brechas identificadas en los sistemas</p>
              </div>

              <div className="space-y-4">
                {/* Confidentiality */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-500" />
                      Confidencialidad (Leaks / Privacidad)
                    </span>
                    <span>{statistics.avgC} / 5</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${(Number(statistics.avgC) / 5) * 100}%` }} />
                  </div>
                </div>

                {/* Integrity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      Integridad (Alteraciones / Transacciones)
                    </span>
                    <span>{statistics.avgI} / 5</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(Number(statistics.avgI) / 5) * 100}%` }} />
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      Disponibilidad (Uptime / Timeouts)
                    </span>
                    <span>{statistics.avgA} / 5</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(Number(statistics.avgA) / 5) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Informative advice */}
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 italic border border-slate-100 leading-relaxed">
                🚀 según la cartola de mitigación y biometría, el descalce de <strong>Integridada</strong> de saldos manuales y la <strong>Confidencialidad</strong> de las base de datos PostgreSQL representan la mayor amenaza para Global66.
              </div>
            </div>

            {/* 2. ISO 27001 Heatmap Matrix for Assets */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Matriz de Probabilidad e Impacto TI</h4>
                  <p className="text-slate-400 text-xs">Mapeo dinámico de amenazas lógicas basada en ISO 27005</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                  Impacto = Máximo (C,I,A)
                </span>
              </div>

              {/* Matrix Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                <div className="md:col-span-8">
                  <div className="flex flex-col gap-1">
                    {[5, 4, 3, 2, 1].map((impact) => (
                      <div key={impact} className="flex gap-1 items-center">
                        {/* Vertical Axis Label */}
                        <div className="w-8 text-right pr-2 text-xs font-black text-slate-400">{impact}</div>
                        
                        {/* Blocks */}
                        {[1, 2, 3, 4, 5].map((prob) => {
                          const cellScore = impact * prob;
                          let bg = 'bg-green-100 text-green-800'; 
                          if (cellScore > 16) bg = 'bg-red-500 text-white';
                          else if (cellScore > 11) bg = 'bg-orange-400 text-white';
                          else if (cellScore > 6) bg = 'bg-yellow-200 text-yellow-900';

                          // Count matching risks
                          const matchingRisks = itRisks.filter(r => {
                            const maxCIA = getCombinedImpact(r.cImpact, r.iImpact, r.aImpact);
                            return r.probability === prob && maxCIA === impact;
                          });

                          return (
                            <div 
                              key={prob} 
                              className={`flex-1 aspect-[2/1.3] rounded flex flex-col items-center justify-center relative cursor-pointer group hover:opacity-90 font-mono text-center shadow-inner ${bg}`}
                              title={`Impacto ${impact}, Probabilidad ${prob}. Puntaje: ${cellScore}`}
                            >
                              <span className="text-sm font-extrabold">{matchingRisks.length || ''}</span>
                              {matchingRisks.length > 0 && (
                                <div className="absolute hidden group-hover:block bottom-full mb-1 z-30 bg-slate-950 text-white p-2 rounded text-[10px] max-w-sm font-sans text-left shadow-xl border border-slate-700">
                                  {matchingRisks.map(r => (
                                    <div key={r.id} className="border-b border-slate-800 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                                      <strong className="text-emerald-400">{r.id}:</strong> {r.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Horizontal Axis Axis */}
                    <div className="flex gap-1 items-center mt-1">
                      <div className="w-8" />
                      {[1, 2, 3, 4, 5].map((prob) => (
                        <div key={prob} className="flex-1 text-center text-xs font-black text-slate-400">
                          {prob}
                        </div>
                      ))}
                    </div>

                    {/* Axis Labels */}
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1.5 mt-2">
                      <span className="italic">&larr; Probabilidad Rara a Frecuente &rarr;</span>
                      <span className="italic">Impacto Mínimo a Severo (Vertical)</span>
                    </div>
                  </div>
                </div>

                {/* Legend panel */}
                <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
                  <h5 className="font-bold text-slate-800">Distribución por Criticidad:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 bg-red-500 rounded border border-red-600 block" />
                      <span>Riesgo Extremo (&gt;16) ({itRisks.filter(r => getITRiskScore(r) > 16).length} activos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 bg-orange-400 rounded border border-orange-500 block" />
                      <span>Riesgo Alto (12 a 16) ({itRisks.filter(r => { const sc = getITRiskScore(r); return sc >= 12 && sc <= 16; }).length} activos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 bg-yellow-200 rounded border border-yellow-300 block" />
                      <span>Riesgo Moderado (7 a 11) ({itRisks.filter(r => { const sc = getITRiskScore(r); return sc >= 7 && sc < 12; }).length} activos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 bg-green-100 rounded border border-green-200 block" />
                      <span>Riesgo Bajo (&lt;7) ({itRisks.filter(r => getITRiskScore(r) < 7).length} activos)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick threat review list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider block">Amenazas Críticas Pendientes de Atención Obligatoria</h4>
            
            <div className="space-y-3">
              {itRisks.filter(r => getITRiskScore(r) > 12).map(r => {
                const assetName = assetsMap.get(r.assetId) || 'Activo General';
                return (
                  <div key={r.id} className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-red-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-black font-mono">
                          {r.id}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold">
                          {r.assetId}
                        </span>
                        <h5 className="font-extrabold text-slate-900 text-sm">{r.name}</h5>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Afecta a: <span className="text-slate-800 font-bold">{assetName}</span> &middot; Vulnerabilidad: <span className="italic">{r.vulnerability}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-stretch md:self-auto justify-between border-t border-red-100/30 pt-2.5 md:pt-0 md:border-0">
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${getITRiskBadgeColor('EXTREMO')}`}>
                          Riesgo: {getITRiskScore(r)}
                        </span>
                        <div className="text-[10px] text-red-700 font-bold mt-1">NO ACEPTABLE</div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSubTab('risks');
                          startEditRisk(r);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Aplicar Controles Anexo A
                      </button>
                    </div>
                  </div>
                );
              })}

              {itRisks.filter(r => getITRiskScore(r) > 12).length === 0 && (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">¡Ningún riesgo tecnológico supera el umbral crítico de mitigación obligatoria!</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Todos los sistemas de información están debidamente resguardados.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'systems' && (
        <TISystemsInventoryModule
          onLinkToRisk={(systemName) => {
            resetRiskForm();
            setRiskFormData(prev => ({
              ...prev,
              name: `Riesgo de Disponibilidad o Acceso en ${systemName}`,
              threat: `Riesgo de acceso no autorizado, falta de revocación de permisos o falla de continuidad en ${systemName}.`
            }));
            setActiveSubTab('risks');
            setShowForm(true);
          }}
        />
      )}

      {activeSubTab === 'assets' && (
        <TIAssetInventoryView
          assets={assets}
          onUpdateAssets={setAssets}
          itRisks={itRisks}
          onSelectAssetForRiskEvaluation={(assetId) => {
            resetRiskForm();
            setRiskFormData(prev => ({ ...prev, assetId }));
            setActiveSubTab('risks');
            setShowForm(true);
          }}
        />
      )}

      {activeSubTab === 'classification' && (
        <TIDataClassificationView
          assets={assets}
          onSelectAsset={() => {
            setActiveSubTab('assets');
          }}
        />
      )}

      {activeSubTab === 'risks' && (
        <div id="ti_risk_matrix_detailed_view" className="space-y-4">
          
          {/* Filtering bar inside the Matrix tab */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Filtrar por amenaza, vulnerabilidad o sistema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedAssetFilter}
                onChange={e => setSelectedAssetFilter(e.target.value)}
                className="border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 outline-none"
              >
                <option value="TODOS">Todos los sistemas</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.name.length > 32 ? a.name.substring(0, 32) + '...' : a.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRiskScale}
                onChange={e => setSelectedRiskScale(e.target.value as any)}
                className="border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 outline-none"
              >
                <option value="TODOS">Todas las severidades</option>
                <option value="EXTREMO">🔴 Extremo</option>
                <option value="ALTO">🟠 Alto</option>
                <option value="MODERADO">🟡 Moderado</option>
                <option value="BAJO">🟢 Bajo</option>
              </select>

              <select
                value={selectedMitigationFilter}
                onChange={e => setSelectedMitigationFilter(e.target.value as any)}
                className="border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 outline-none"
              >
                <option value="TODOS">Todos los estados de mitigación</option>
                <option value="No Mitigado">No Mitigado</option>
                <option value="Mitigación Parcial">Mitigación Parcial</option>
                <option value="Mitigado">Mitigado</option>
              </select>
            </div>
          </div>

          {/* TABLE OF IT RISKS AND ENTIRE THREAT METRIC MAP OVER CIA */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Sistema & Amenaza</th>
                    <th className="px-6 py-3.5">Análisis CIA</th>
                    <th className="px-6 py-3.5">Severidad Inherente</th>
                    <th className="px-6 py-3.5">Controles Anexo A</th>
                    <th className="px-6 py-3.5">Riesgo Residual</th>
                    <th className="px-6 py-3.5">Efectividad / Plan de Acción</th>
                    <th className="px-6 py-3.5 text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredITRisks.map(risk => {
                    const assName = assetsMap.get(risk.assetId) || 'Activo General';
                    
                    const inherentScore = getITRiskScore(risk);
                    const inherentLevel = getITRiskLevelLabel(inherentScore);

                    const residualScore = getITRiskScore(risk, 'residual');
                    const residualLevel = getITRiskLevelLabel(residualScore);

                    const acceptability = getAcceptabilityStatus(residualScore);

                    return (
                      <tr key={risk.id} className="hover:bg-slate-50/40 transition-colors text-xs text-slate-600">
                        
                        {/* ID */}
                        <td className="px-6 py-4.5 font-mono font-bold text-slate-400 whitespace-nowrap">
                          {risk.id}
                        </td>

                        {/* System and Threat name */}
                        <td className="px-6 py-4.5 max-w-xs">
                          <div className="space-y-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold">
                              {risk.assetId}
                            </span>
                            <h5 className="font-extrabold text-slate-900 text-sm mt-0.5">{risk.name}</h5>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              <strong>Amenaza:</strong> {risk.threat}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              <strong>Vulnerabilidad:</strong> {risk.vulnerability}
                            </p>
                          </div>
                        </td>

                        {/* Analysis CIA details (triad layout) */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="space-y-1 text-[11px] font-semibold text-slate-700">
                            <div className="flex items-center gap-1">
                              <span className="w-3 text-blue-500">C:</span>
                              <div className="bg-blue-100 text-blue-800 text-[10px] px-1.5 rounded font-black">
                                {risk.cImpact}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-3 text-amber-500">I:</span>
                              <div className="bg-amber-100 text-amber-800 text-[10px] px-1.5 rounded font-black">
                                {risk.iImpact}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-3 text-indigo-500">A:</span>
                              <div className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 rounded font-black">
                                {risk.aImpact}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Inherent Score and level */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-black text-slate-900">
                              Score: {inherentScore}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getITRiskBadgeColor(inherentLevel)}`}>
                              {inherentLevel}
                            </span>
                            <div className="text-[10px] text-slate-400 font-bold">
                              P = {risk.probability} | Max(CIA) = {getCombinedImpact(risk.cImpact, risk.iImpact, risk.aImpact)}
                            </div>
                          </div>
                        </td>

                        {/* ISO Controls code links */}
                        <td className="px-6 py-4.5 max-w-[120px]">
                          <div className="flex flex-wrap gap-1">
                            {risk.iso27001Controls.map(code => (
                              <span 
                                key={code} 
                                className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200"
                                title={code}
                              >
                                {code}
                              </span>
                            ))}
                            {risk.iso27001Controls.length === 0 && (
                              <span className="text-[10px] text-red-500 font-bold italic">Sin asignar</span>
                            )}
                          </div>
                        </td>

                        {/* Residual Score and level */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-black text-slate-900">
                              Score Res: {residualScore}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getITRiskBadgeColor(residualLevel)}`}>
                              {residualLevel}
                            </span>
                          </div>
                        </td>

                        {/* Plan of action details and acceptability */}
                        <td className="px-6 py-4.5 max-w-xs">
                          <div className="space-y-1.5">
                            <p className="text-[11px] text-slate-600 font-bold italic leading-snug">
                              &ldquo;{risk.actionPlan}&rdquo;
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                acceptability === 'ACEPTABLE' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {acceptability}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                                risk.mitigationStatus === 'Mitigado' ? 'bg-emerald-50 text-emerald-700' :
                                risk.mitigationStatus === 'Mitigación Parcial' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {risk.mitigationStatus}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEditRisk(risk)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Editar evaluación"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRisk(risk.id)}
                              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Eliminar evaluación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'controls' && (
        <div id="ti_iso_controls_view" className="space-y-4">
          <div className="bg-emerald-950/20 text-slate-300 p-5 rounded-2xl border border-emerald-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-black text-white">Salvaguardas Tecnológicas y Organizativas (Anexo A ISO 27001:2022)</h4>
              <p className="text-xs text-slate-400">Controladores aplicados a la protección de datos, desarrollo seguro, VPNs e inmutabilidad de cartolas.</p>
            </div>
            <div className="text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-center">
              <div>Controles Vigentes: <strong className="text-emerald-400">{isoControls.length}</strong></div>
              <div className="text-[10px] text-slate-500 mt-1">Eficacias validadas regionalmente</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isoControls.map(ctrl => (
              <div key={ctrl.code} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-200 transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-black border border-emerald-200">
                      {ctrl.code}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${
                      ctrl.implementationState === 'Implementado' ? 'bg-emerald-100 text-emerald-800' :
                      ctrl.implementationState === 'Parcial' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {ctrl.implementationState}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-slate-900 text-sm">{ctrl.name}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{ctrl.description}</p>
                </div>

                <div className="border-t border-slate-50 pt-3 mt-1 space-y-2">
                  <div className="text-xs">
                    <strong className="text-slate-700">Evidencia del Control / G66 Implementation:</strong>
                    <p className="text-slate-500 font-medium mt-0.5 leading-snug italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      &ldquo;{ctrl.evidenceDetails || 'Sin evidencia cargada.'}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingControl(ctrl);
                      setControlFormData({
                        implementationState: ctrl.implementationState,
                        evidenceDetails: ctrl.evidenceDetails
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-black block text-right pt-1 cursor-pointer"
                  >
                    Actualizar Evidencia Técnica &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingControl && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="font-extrabold text-white text-sm">
                    Modificar Evidencia: {editingControl.code}
                  </h4>
                  <button 
                    onClick={() => setEditingControl(null)}
                    className="text-slate-400 hover:text-white font-mono text-xs"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleUpdateControl} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Estado de Implementación</label>
                    <select
                      value={controlFormData.implementationState}
                      onChange={e => setControlFormData({ ...controlFormData, implementationState: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="Implementado">🟢 Implementado</option>
                      <option value="Parcial">🟡 Parcial</option>
                      <option value="No Implementado">🔴 No Implementado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Detalles de Evidencia / Auditoría</label>
                    <textarea
                      required
                      rows={4}
                      value={controlFormData.evidenceDetails}
                      onChange={e => setControlFormData({ ...controlFormData, evidenceDetails: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      placeholder="Ingrese los tokens, mTLS, VPN o logs correspondientes como evidencia física..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setEditingControl(null)}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-300 cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-extrabold rounded cursor-pointer"
                    >
                      Guardar Evidencia
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {activeSubTab === 'soa' && (
        <div id="ti_soa_applicability_statement" className="space-y-4">
          
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-white space-y-4">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <span>Statement of Applicability (SoA) - Declaración de Aplicabilidad Global66</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              El SoA es el documento fundamental requerido por los auditores de certificación ISO 27001. Contiene la justificación de la inclusión o exclusión de cada control del Anexo A y detalla el nivel de cumplimiento actual para todo el canal financiero multilateral de Global66.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-800/80 rounded-xl text-center border border-slate-800">
                <span className="text-[10px] uppercase font-black text-slate-400">Controles Aplicables</span>
                <h5 className="text-2xl font-black text-emerald-400 mt-1">9 de 9</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Identificados del material</p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl text-center border border-slate-800">
                <span className="text-[10px] uppercase font-black text-slate-400">Implementados Totalmente</span>
                <h5 className="text-2xl font-black text-sky-450 mt-1">
                  {isoControls.filter(c => c.implementationState === 'Implementado').length}
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Seguridad robusta activa</p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl text-center border border-slate-800">
                <span className="text-[10px] uppercase font-black text-slate-400">Justificados Excluidos</span>
                <h5 className="text-2xl font-black text-slate-400 mt-1">0</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Sin exclusiones aplicadas</p>
              </div>
            </div>
          </div>

          {/* Table representing the generated Statement of Applicability with justifications */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Control</th>
                    <th className="px-6 py-3.5">Dominio</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">Justificación de Inclusión</th>
                    <th className="px-6 py-3.5">Activo de Información Vinculado Directamente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                  {isoControls.map(c => {
                    // Find assets linked to this control by checking which risks link to this code
                    const matchingRisks = itRisks.filter(r => r.iso27001Controls.includes(c.code));
                    const linkedAssetNames = Array.from(new Set(matchingRisks.map(r => r.assetId)));

                    return (
                      <tr key={c.code} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-extrabold text-slate-900">
                          {c.code} - {c.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {c.domain}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            c.implementationState === 'Implementado' ? 'bg-emerald-100 text-emerald-800' :
                            c.implementationState === 'Parcial' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {c.implementationState}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-sm leading-relaxed text-[11px]">
                          {c.code === 'A.8.12' ? 'Requisito mandatorio de cifrado liveness y hashes RUT para evitar el secuestro y decrypt de datos confidenciales.' :
                           c.code === 'A.8.20' ? 'Crítico para proteger la entrada de transacciones contra manipulaciones de DNS y solicitudes duplicadas.' :
                           c.code === 'A.8.24' ? 'Exigible para la dispersión automática de remesas mundiales sin APIs vulnerables en producción.' :
                           c.code === 'A.8.14' ? 'Garantizar el failover inmediato hacia bancos corresponsales de respaldo ante cortes de enlace de adquirencia local.' :
                           c.code === 'A.8.10' ? 'Prevenir que personal operativo descargue cartolas bancarias legadas desprotegidas en terminales particulares.' :
                           'Mandatario para salvaguardar la integridad de las bases de datos de saldos transfronterizos y control de transacciones inusuales.'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {linkedAssetNames.map(id => (
                              <span 
                                key={id} 
                                className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100"
                              >
                                {id}
                              </span>
                            ))}
                            {linkedAssetNames.length === 0 && (
                              <span className="text-slate-400 italic">Genérico a todos</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER GENERAL METODOLOGICO TI */}
      <div className="bg-slate-900 text-slate-400 p-6 rounded-2xl text-xs space-y-2 border border-slate-800">
        <h5 className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Políticas de Continuidad Tecnológica & Gestión de Incidentes G66</span>
        </h5>
        <p className="leading-relaxed">
          Toda información almacenada en este repositorio conforma la base para la auditoría técnica interna del SOC Global66. La metodología CIA modela el impacto directo sobre los clientes finales. Ante la visualización de riesgos extremos o desacceptables, las alertas son redirigidas de manera prioritaria al CISO y al Gerente de TI Corporativo.
        </p>
      </div>

    </div>
  );
};
