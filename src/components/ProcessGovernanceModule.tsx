import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Printer, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Check, 
  Copy, 
  Building2, 
  Landmark, 
  Users, 
  Clock, 
  Calendar, 
  ListOrdered, 
  Sliders, 
  ExternalLink, 
  FolderCheck, 
  Search, 
  X,
  FileCode,
  FileCheck,
  Video,
  Mic,
  RefreshCw,
  Award,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GovernanceDocument, 
  GovernanceDocType, 
  GovernanceCompanyCode, 
  GovernanceDocStatus, 
  ProcessArea, 
  Risk, 
  Jurisdiction, 
  AssociatedControl,
  AuditedDocument,
  GLOBAL66_PROCESS_TAXONOMY,
  RegionalProcessDefinition
} from '../types';
import { RegionalProcessArchitectureView } from './RegionalProcessArchitectureView';

interface ProcessGovernanceModuleProps {
  risks?: Risk[];
  jurisdiction?: Jurisdiction;
  onUpdateRisk?: (updatedRisk: Risk) => void;
  onAddControlToRisk?: (riskId: string, control: AssociatedControl, docName?: string) => void;
  onNavigateToRepository?: () => void;
}

// EJEMPLOS PRECARGADOS DE ENTRADA (Walkthroughs y Transcripciones de Video/Voz)
const TRANSCRIPTION_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Walkthrough: Conciliación Diaria Tripartita de Cuentas Virtuales y Tarjetas',
    companyCode: 'GCCO' as GovernanceCompanyCode,
    docType: 'PRO' as GovernanceDocType,
    processArea: 'Operaciones' as ProcessArea,
    ownerRole: 'Head de Operaciones & Liquidación',
    ownerDepartment: 'Dirección de Operaciones Financieras',
    responsible: 'Líder de Conciliaciones & Analista Senior de Operaciones',
    reviewedBy: 'Valeria Rojas (Head of GRC & QA)',
    approver: 'Director de Operaciones & Compliance Officer',
    actNumber: 'Acta Comité Ops N° 35-2026',
    text: `Transcripción de Grabación de Pantalla Loom - Walkthrough Operativo (Fecha: 24/08/2026)
Facilitador: Carlos Méndez (Líder de Conciliaciones)
Participantes: Analistas de Operaciones Global66 Colombia y Chile.

"Hola equipo, en este walkthrough vamos a documentar el paso a paso de la conciliación diaria tripartita entre las cuentas recaudadoras locales, el ledger central de Global66 y las transacciones de emisión y procesamiento de tarjetas.

Paso 1: Todos los días hábiles a las 08:30 AM el analista de conciliación debe descargar el extracto bancario MT940 / CSV de los bancos corresponsales y la cartola del procesador de tarjetas (Transbank/Klap en Chile, PSE/ACH en Colombia).
Paso 2: Subir los archivos al motor automatizado de conciliación 'Recon-Engine Global66' antes de las 09:15 AM.
Paso 3: El motor ejecuta el cruce automático con las órdenes del backend mediante el ID único de transacción (UUID).
Paso 4: Si se detecta un descalce superior a $50 USD o antigüedad mayor a 2 horas, se debe generar un ticket en Jira Service Management clasificado como 'Descalce Operativo Nivel 2'.
Paso 5: El analista tiene hasta las 13:00 PM para identificar la causa raíz (reverso bancario, timeout de API o duplicidad de cobro).
Paso 6: Se solicita la aprobación de ajuste al Head de Operaciones para compensación contable.
Paso 7: El cierre diario formal se consolida a las 18:00 PM con la firma digital del acta de conciliación y se envía por correo al equipo de Finanzas y Control Interno.

Reglas clave: Ningún descalce puede quedar sin justificación más de 24 horas. Si el descalce supera los $1,000 USD se notifica de inmediato al Comité de Riesgos."`
  },
  {
    id: 'tpl-2',
    title: 'Minuta de Video: Política Corporativa de Custodia y Segregación de Fondos CMF',
    companyCode: 'G81' as GovernanceCompanyCode,
    docType: 'POL' as GovernanceDocType,
    processArea: 'Mesa de Dinero' as ProcessArea,
    ownerRole: 'Head de Tesorería & Mesa de Dinero',
    ownerDepartment: 'Gerencia de Finanzas y Mercados',
    responsible: 'Operador de Mesa de Dinero & Oficial de Cumplimiento',
    reviewedBy: 'Comité de Riesgos y Control Interno',
    approver: 'Gerente General & Directorio Global66',
    actNumber: 'Acta Directorio N° 09-2026',
    text: `Minuta de Reunión Técnica y Revisión de Política - Grabación Teams
Tema: Cumplimiento de la NCG N° 464 de la CMF sobre Cuentas de Provisión de Fondos y Custodia Segregada de Tarjetas Global Card S.P.A.

"Establecemos los lineamientos mandatorios de custodia patrimonial para Global Card en Chile.
Lineamiento 1: Todos los fondos recibidos de clientes para la carga de tarjetas con provisión de fondos deben mantenerse en cuentas bancarias corrientes exclusivas de salvaguarda, totalmente segregadas del patrimonio propio de Global66.
Lineamiento 2: Queda estrictamente prohibido utilizar los fondos de provisión para operaciones de inversión de riesgo, apalancamiento o préstamos intercompany.
Lineamiento 3: Se debe realizar un calce horario entre el saldo global de las tarjetas activas y el saldo disponible en los bancos custodios.
Lineamiento 4: El ratio de cobertura líquida debe ser exactamente del 100.00% en todo momento. Cualquier desviación mayor al 0.01% debe activar una alerta crítica inmediata a la CMF y al Directorio.
Lineamiento 5: Auditorías externas trimestrales certificarán la intangibilidad de los fondos de clientes."`
  },
  {
    id: 'tpl-3',
    title: 'Transcripción: Manual de Arquitectura Segura de Microservicios y Gestión Cloud',
    companyCode: 'GCCL' as GovernanceCompanyCode,
    docType: 'MAN' as GovernanceDocType,
    processArea: 'Riesgos Nube' as ProcessArea,
    ownerRole: 'CISO / Head de Arquitectura Cloud',
    ownerDepartment: 'Tecnología, Infraestructura y Seguridad',
    responsible: 'Arquitecto Principal Cloud & Ingenieros DevSecOps',
    reviewedBy: 'Dirección de Seguridad de la Información',
    approver: 'Chief Technology Officer (CTO) & CISO',
    actNumber: 'Acta Comité Ciberseguridad N° 14-2026',
    text: `Grabación de Walkthrough de Arquitectura - Sesión de Ingeniería
Expositor: Andrés Silva (Lead Cloud Architect)

"Este manual define las pautas mandatorias de despliegue, hardening y observabilidad en Google Cloud Platform (GCP) y AWS para todos los microservicios de Global66 a nivel regional.

Pauta 1: Todo microservicio debe desplegarse en contenedores inmutables sin acceso root y con escaneo automático de vulnerabilidades en el pipeline CI/CD de GitHub Actions.
Pauta 2: Los secretos, llaves API y credenciales de base de datos deben gestionarse exclusivamente mediante HashiCorp Vault o Google Secret Manager con rotación automática cada 90 días. Prohibido hardcodear secretos en repositorios.
Pauta 3: Todo bucket de Cloud Storage debe tener configurado el cifrado en reposo con Customer-Managed Encryption Keys (CMEK) y bloqueo total de acceso público.
Pauta 4: El tráfico entre microservicios debe estar protegido mediante mTLS (Mutual TLS) y autenticación vía Service Mesh.
Pauta 5: Logs de auditoría inmutables deben enviarse a Cloud Logging y conservarse por un período mínimo de 5 años para requerimientos regulatorios SFC, CMF y BCRA."`
  }
];

// GENERADOR INTELIGENTE DE ESTRUCTURACIÓN FORMAL GRC
function parseAndGenerateDocument(
  rawText: string,
  docType: GovernanceDocType,
  companyCode: GovernanceCompanyCode,
  processArea: ProcessArea,
  customCode: string,
  ownerRole: string,
  ownerDept: string,
  responsible: string,
  approver: string,
  docTitle: string,
  actNumber?: string,
  targetVersion: string = '1.0'
): GovernanceDocument {
  const cleanTitle = docTitle.trim() || (
    docType === 'PRO' ? `Procedimiento de Gestión Operativa en ${processArea}` :
    docType === 'POL' ? `Política Corporativa de Cumplimiento en ${processArea}` :
    `Manual Operativo y Técnico de ${processArea}`
  );

  const issueDate = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const reviewDate = nextYear.toISOString().split('T')[0];

  const objective = `Establecer los lineamientos formales, responsabilidades y controles operacionales para asegurar la ejecución correcta, trazable y oportuna de los procesos de ${processArea} en ${companyCode}, mitigando riesgos operacionales, financieros y de cumplimiento normativo conforme a los estándares ISO 31000 de Global66.`;

  const scope = `Aplica de manera obligatoria a todo el personal, colaboradores directos, contratistas y sistemas tecnológicos involucrados en las operaciones de ${processArea} dentro de la entidad ${companyCode} a nivel local y en su interacción con la infraestructura regional.`;

  const definitions = [
    { term: 'RCSA', definition: 'Risk and Control Self-Assessment (Autoevaluación de Riesgos y Controles).' },
    { term: 'SLA', definition: 'Service Level Agreement (Acuerdo de Nivel de Servicio operativo acordado entre áreas).' },
    { term: 'Descalce Operativo', definition: 'Diferencia no conciliada entre los registros contables internos y los saldos bancarios/adquirentes.' },
    { term: 'ROAM', definition: 'Marco de gobernanza para tratamiento de riesgos: Resolved, Owned, Accepted, Mitigated.' },
    { term: 'Trazabilidad', definition: 'Capacidad de reconstruir el historial cronológico y auditoría inmutable de cada transacción.' }
  ];

  if (docType === 'PRO') {
    const steps = [
      {
        stepNumber: 1,
        role: responsible || 'Analista de Operaciones / Responsable',
        activity: 'Extracción, descarga y validación preliminar de insumos transaccionales y extractos bancarios desde las fuentes oficiales.',
        input: 'Archivos bancarios MT940/CSV, APIs de pasarelas y reportes transaccionales del backend.',
        output: 'Insumos consolidados y validados en el repositorio seguro.',
        controls: 'Verificación de integridad de hash y marcas de tiempo de recepción.'
      },
      {
        stepNumber: 2,
        role: 'Motor de Procesamiento / Analista',
        activity: 'Ejecución del cruce y conciliación automatizada mediante identificadores únicos de transacción (UUID).',
        input: 'Archivos cargados en el motor de reconciliación.',
        output: 'Reporte preliminar de calce y matriz de inconsistencias/descalces.',
        controls: 'Regla de validación automática con tolerancia $0.00.'
      },
      {
        stepNumber: 3,
        role: 'Líder del Proceso / Especialista',
        activity: 'Investigación técnica de inconsistencias, tipificación de causa raíz y formulación de ajustes contables.',
        input: 'Matriz de inconsistencias y logs de sistemas involucrados.',
        output: 'Ticket de gestión de descalce con causa raíz documentada y evidencia adjunta.',
        controls: 'Control dual para cualquier autorización de ajuste superior a $100 USD.'
      },
      {
        stepNumber: 4,
        role: approver || 'Head de Área / Aprobador',
        activity: 'Revisión final, firma del acta de cierre de jornada y reporte a las partes interesadas.',
        input: 'Reporte consolidado de cierre diario con firmas de los operadores.',
        output: 'Acta digital de cierre distribuida a Finanzas, Riesgos y Auditoría Interna.',
        controls: 'Firma electrónica y custodia inmutable en repositorio corporativo.'
      }
    ];

    return {
      id: `gov-doc-${Date.now()}`,
      code: customCode,
      title: cleanTitle,
      type: 'PRO',
      companyCode,
      processArea,
      ownerDepartment: ownerDept || 'Dirección de Operaciones y Procesos',
      ownerRole: ownerRole || 'Head de Operaciones',
      responsible: responsible || 'Líder de Proceso / Analista Senior',
      approver: approver || 'Director de Área / Compliance Officer',
      version: targetVersion.startsWith('v') || targetVersion.startsWith('V') ? targetVersion : `V${targetVersion}`,
      issueDate,
      reviewDate,
      status: 'Aprobado',
      rawSourceNotes: rawText,
      versionControl: [
        {
          version: targetVersion.startsWith('v') || targetVersion.startsWith('V') ? targetVersion : `V${targetVersion}`,
          date: issueDate,
          author: responsible || 'Equipo de Procesos y Calidad',
          description: `Emisión formalizada a partir del levantamiento operativo de walkthrough. ${actNumber ? `Aprobado según ${actNumber}.` : ''}`,
          approvedBy: approver || 'Comité de Gobierno y Control'
        }
      ],
      objective,
      scope,
      definitions,
      descriptionContent: 'El presente procedimiento detalla el flujo secuencial de actividades requeridas para la ejecución estructurada y controlada del proceso.',
      steps,
      controlAndMonitoring: 'El monitoreo del cumplimiento de este procedimiento se realiza mediante la revisión semanal de los KPIs de efectividad, seguimiento de incidentes y auditorías semestrales por parte de Control Interno.',
      criteriaRules: '1. Toda excepción operativa debe contar con aprobación expresa del Head de Área.\n2. Los registros deben conservarse por un plazo mínimo de 5 años.\n3. Ningún paso del procedimiento puede ser omitido sin justificación formal documentada.',
      references: [
        'Manual de Políticas Generales de Global66',
        'Estándar Internacional ISO 31000:2018 - Gestión del Riesgo',
        'Normativa de Control Interno y Continuidad del Negocio CMF / SFC / BCRA'
      ],
      annexes: [
        'Anexo 1: Formato de Acta de Cierre Diario de Operaciones',
        'Anexo 2: Matriz de Escalación y Contactos de Emergencia Operativa'
      ],
      distribution: [
        'Equipo Operativo de la filial ' + companyCode,
        'Oficialía de Cumplimiento y Control Interno',
        'Gerencia de Auditoría Interna',
        'Comité de Riesgos y Gobierno Corporativo'
      ],
      linkedRiskIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else if (docType === 'POL') {
    const guidelines = [
      {
        topic: 'Custodia e Intangibilidad Patrimonial',
        principle: 'Segregación absoluta de los fondos de clientes respecto del patrimonio propio.',
        mandatoryRule: 'Los fondos deben mantenerse exclusivamente en cuentas de salvaguarda en bancos calificados Grado de Inversión.'
      },
      {
        topic: 'Prohibición de Apalancamiento',
        principle: 'Cero tolerancia a la especulación financiera con fondos de usuarios.',
        mandatoryRule: 'Queda estrictamente prohibido utilizar cuentas de provisión para préstamos intercompany o inversiones de riesgo.'
      },
      {
        topic: 'Monitoreo de Calce Horario',
        principle: 'Supervisión continua en tiempo real de la liquidez transaccional.',
        mandatoryRule: 'El ratio de cobertura líquida debe ser exactamente del 100.00% al cierre de cada ventana operativa.'
      }
    ];

    return {
      id: `gov-doc-${Date.now()}`,
      code: customCode,
      title: cleanTitle,
      type: 'POL',
      companyCode,
      processArea,
      ownerDepartment: ownerDept || 'Gerencia de Cumplimiento y Riesgos',
      ownerRole: ownerRole || 'Chief Compliance Officer',
      responsible: responsible || 'Oficial de Cumplimiento Adjunto',
      approver: approver || 'Directorio y Comité de Auditoría',
      version: targetVersion.startsWith('v') || targetVersion.startsWith('V') ? targetVersion : `V${targetVersion}`,
      issueDate,
      reviewDate,
      status: 'Aprobado',
      rawSourceNotes: rawText,
      versionControl: [
        {
          version: targetVersion.startsWith('v') || targetVersion.startsWith('V') ? targetVersion : `V${targetVersion}`,
          date: issueDate,
          author: responsible || 'Área de Cumplimiento Normativo',
          description: `Promulgación oficial de la política corporativa. ${actNumber ? `Aprobado según ${actNumber}.` : ''}`,
          approvedBy: approver || 'Directorio Global66'
        }
      ],
      objective,
      scope,
      definitions,
      descriptionContent: 'La presente política establece los principios rectores, mandatos obligatorios y límites de actuación para salvaguardar la solidez corporativa.',
      guidelines,
      controlAndMonitoring: 'La Oficialía de Cumplimiento evaluará trimestralmente el grado de adherencia a esta política y presentará un informe consolidado de cumplimiento al Directorio.',
      distribution: [
        'Todos los colaboradores de la compañía',
        'Comité de Auditoría y Riesgos',
        'Proveedores y aliados estratégicos con acceso a sistemas'
      ],
      references: [
        'Código de Ética y Conducta Empresarial Global66',
        'Marco Regulatorio Financiero CMF NCG 464 / SFC SARO / BCRA Com. A 7783',
        'Estándar ISO 27001 e ISO 31000'
      ],
      annexes: [
        'Anexo A: Matriz de Sanciones y Régimen Disciplinario',
        'Anexo B: Declaración de Compromiso y Adherencia Ética'
      ],
      linkedRiskIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else {
    const patterns = [
      {
        module: 'Arquitectura y Configuración del Entorno',
        operationalRule: 'Configuración estandarizada basada en el principio de mínimo privilegio y resiliencia activa.',
        architectureGuide: 'Todos los componentes deben contar con redundancia activa-activa y aislamiento por VPCs seguras.'
      },
      {
        module: 'Pautas de Operación Diaria y Mantenimiento',
        operationalRule: 'Ejecución rigurosa de checklists operativos y ventanas de mantenimiento programadas.',
        architectureGuide: 'Los cambios a producción requieren validación en staging y aprobación por el Change Advisory Board (CAB).'
      },
      {
        module: 'Gestión de Contingencias y Recuperación',
        operationalRule: 'Respuesta inmediata ante fallas con tiempos de recuperación RTO < 1 hora y RPO < 15 minutos.',
        architectureGuide: 'Ejecución automática de failover y replicación cruzada multi-región.'
      }
    ];

    return {
      id: `gov-doc-${Date.now()}`,
      code: customCode,
      title: cleanTitle,
      type: 'MAN',
      companyCode,
      processArea,
      ownerDepartment: ownerDept || 'Gerencia de Tecnología y Operaciones',
      ownerRole: ownerRole || 'CTO / Head de Arquitectura',
      responsible: responsible || 'Arquitecto Líder & Ingeniero Principal',
      approver: approver || 'Comité de Arquitectura y Seguridad',
      version: targetVersion.startsWith('v') || targetVersion.startsWith('V') ? targetVersion : `V${targetVersion}`,
      issueDate,
      reviewDate,
      status: 'Aprobado',
      rawSourceNotes: rawText,
      versionControl: [
        {
          version: targetVersion.startsWith('v') || targetVersion.startsWith('V') ? targetVersion : `V${targetVersion}`,
          date: issueDate,
          author: responsible || 'Equipo de Arquitectura Técnica',
          description: `Documentación técnica de manual operativo y guía de arquitectura. ${actNumber ? `Aprobado según ${actNumber}.` : ''}`,
          approvedBy: approver || 'CTO & CISO'
        }
      ],
      objective,
      scope,
      definitions,
      descriptionContent: 'Este manual proporciona las pautas técnicas, directrices de arquitectura y procedimientos operativos estándar para el mantenimiento y soporte.',
      patterns,
      controlAndMonitoring: 'Supervisión continua mediante dashboards de observabilidad, alertas de telemetría en tiempo real y pruebas anuales de recuperación ante desastres (DRP).',
      distribution: [
        'Equipo de Ingeniería, DevOps y Arquitectura Cloud',
        'Mesa de Ayuda y Soporte Nivel 2/3',
        'Oficialía de Seguridad de la Información (CISO)'
      ],
      references: [
        'Guías de Arquitectura Cloud Well-Architected Framework',
        'Políticas de Seguridad de la Información ISO 27001',
        'Manual de Continuidad del Negocio (BCP)'
      ],
      annexes: [
        'Anexo I: Diagrama de Arquitectura de Alto Nivel y Flujo de Datos',
        'Anexo II: Guía de Troubleshooting y Códigos de Error'
      ],
      linkedRiskIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const ProcessGovernanceModule: React.FC<ProcessGovernanceModuleProps> = ({
  risks = [],
  jurisdiction,
  onUpdateRisk,
  onAddControlToRisk,
  onNavigateToRepository
}) => {
  // ESTADOS DEL GENERADOR
  const [activeStep, setActiveStep] = useState<'input' | 'editor' | 'taxonomy'>('input');
  const [selectedTaxonomyProcessId, setSelectedTaxonomyProcessId] = useState<number>(7); // Default a Operaciones y Tesorería
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'published' } | null>(null);
  const [publishedSuccessModal, setPublishedSuccessModal] = useState<GovernanceDocument | null>(null);

  const selectedTaxonomyProcess = useMemo(() => {
    return GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === selectedTaxonomyProcessId) || null;
  }, [selectedTaxonomyProcessId]);

  const handleSelectTaxonomyProcess = (id: number) => {
    setSelectedTaxonomyProcessId(id);
    const proc = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === id);
    if (!proc) return;

    if (proc.mappedProcessArea) {
      setProcessArea(proc.mappedProcessArea);
    }
    setDocTitle(`${proc.categoryLevel1}: ${proc.processGroupLevel2.split(';')[0].trim()}`);
    
    // Auto-completar según proceso
    if (proc.id === 7) {
      setOwnerDepartment('Gerencia de Operaciones y Tesorería');
      setOwnerRole('Head de Operaciones & Tesorería');
      setResponsible('Líder de Conciliaciones & Mesa de Dinero');
      setApprover('Director de Operaciones & Controller Financiero');
    } else if (proc.id === 2 || proc.id === 3) {
      setOwnerDepartment('Gerencia de Riesgo y Cumplimiento');
      setOwnerRole('Chief Compliance Officer / Oficial de Cumplimiento');
      setResponsible('Oficial de Cumplimiento Adjunto / Líder SARO');
      setApprover('Comité de Riesgos y Directorio');
    } else if (proc.id === 6 || proc.id === 11) {
      setOwnerDepartment('Gerencia de Tecnología e Infraestructura');
      setOwnerRole('Chief Technology Officer (CTO) / CISO');
      setResponsible('Arquitecto Principal / Líder DevSecOps');
      setApprover('CTO & CISO');
    } else if (proc.id === 4 || proc.id === 5 || proc.id === 13) {
      setOwnerDepartment('Gerencia de Producto & Negocio');
      setOwnerRole('Head of Product');
      setResponsible('Product Manager / Product Experience Lead');
      setApprover('Chief Product Officer (CPO)');
    } else if (proc.id === 14) {
      setOwnerDepartment('Auditoría Interna Corporativa');
      setOwnerRole('Head de Auditoría Interna');
      setResponsible('Auditor Senior de Procesos & Tecnología');
      setApprover('Comité de Auditoría');
    }
    showToast(`Proceso #${proc.id} "${proc.categoryLevel1}" cargado en el maquetador.`, 'info');
  };

  // CAMPOS DE ENTRADA
  const [videoUrl, setVideoUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [companyCode, setCompanyCode] = useState<GovernanceCompanyCode>(() => {
    if (jurisdiction === 'Colombia') return 'GCCO';
    if (jurisdiction === 'Chile') return 'G81';
    if (jurisdiction === 'Argentina') return 'GCAR';
    return 'GCCO';
  });
  const [docType, setDocType] = useState<GovernanceDocType>('PRO');
  const [processArea, setProcessArea] = useState<ProcessArea>('Operaciones');
  const [ownerRole, setOwnerRole] = useState('Head de Operaciones');
  const [ownerDepartment, setOwnerDepartment] = useState('Dirección de Operaciones Financieras');
  const [responsible, setResponsible] = useState('Líder de Proceso / Analista Senior');
  const [reviewedBy, setReviewedBy] = useState('Oficialía de Cumplimiento / GRC & QA');
  const [approver, setApprover] = useState('Director de Operaciones & Compliance Officer');
  const [actNumber, setActNumber] = useState('');
  const [targetVersion, setTargetVersion] = useState('1.0');
  const [customCorrelative, setCustomCorrelative] = useState('');

  // DOCUMENTO GENERADO ACTIVO EN EDICIÓN
  const [draftDoc, setDraftDoc] = useState<GovernanceDocument | null>(null);

  // CÓDIGO NORMALIZADO AUTOGENERADO
  const generatedCode = useMemo(() => {
    if (customCorrelative.trim()) {
      const padded = customCorrelative.padStart(3, '0');
      return `${companyCode}-${docType}-${padded}`;
    }
    return `${companyCode}-${docType}-035`;
  }, [companyCode, docType, customCorrelative]);

  const showToast = (text: string, type: 'success' | 'info' | 'published' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApplyTemplate = (tpl: typeof TRANSCRIPTION_TEMPLATES[0]) => {
    setDocTitle(tpl.title);
    setRawText(tpl.text);
    setCompanyCode(tpl.companyCode);
    setDocType(tpl.docType);
    setProcessArea(tpl.processArea);
    setOwnerRole(tpl.ownerRole);
    setOwnerDepartment(tpl.ownerDepartment);
    setResponsible(tpl.responsible);
    setReviewedBy(tpl.reviewedBy);
    setApprover(tpl.approver);
    setActNumber(tpl.actNumber || '');
    setTargetVersion('1.0');
    showToast(`Plantilla de insumo "${tpl.title.slice(0, 35)}..." cargada exitosamente`, 'info');
  };

  // PROCESAR Y MAQUETAR DOCUMENTO CON IA
  const handleGenerateDocument = () => {
    if (!rawText.trim() && !docTitle.trim() && !videoUrl.trim()) {
      showToast('Ingresa una transcripción, enlace de video o título para estructurar el documento.', 'info');
      return;
    }

    setIsProcessingAI(true);
    setTimeout(() => {
      const generated = parseAndGenerateDocument(
        rawText,
        docType,
        companyCode,
        processArea,
        generatedCode,
        ownerRole,
        ownerDepartment,
        responsible,
        approver,
        docTitle,
        actNumber,
        targetVersion
      );

      setDraftDoc(generated);
      setIsProcessingAI(false);
      setActiveStep('editor');
      showToast(`¡Borrador ${generated.code} estructurado y maquetado exitosamente!`, 'success');
    }, 700);
  };

  // GUARDAR Y PUBLICAR EN REPOSITORIO MÁSTER
  const handlePublishToMasterRepository = () => {
    if (!draftDoc) return;

    // 1. Guardar en repositorio de documentos estructurados
    const existingGovDocsRaw = localStorage.getItem('g66_governance_documents');
    let existingGovDocs: GovernanceDocument[] = [];
    if (existingGovDocsRaw) {
      try {
        existingGovDocs = JSON.parse(existingGovDocsRaw);
      } catch (e) {
        console.error(e);
      }
    }
    const filteredGov = existingGovDocs.filter(d => d.code !== draftDoc.code);
    const newGovList = [draftDoc, ...filteredGov];
    localStorage.setItem('g66_governance_documents', JSON.stringify(newGovList));

    // 2. Sincronizar en la Matriz Consolidada de Control e Inventario (g66_grc_consolidated_inventory_v2)
    const existingInvRaw = localStorage.getItem('g66_grc_consolidated_inventory_v2');
    let existingInv: AuditedDocument[] = [];
    if (existingInvRaw) {
      try {
        existingInv = JSON.parse(existingInvRaw);
      } catch (e) {
        console.error(e);
      }
    }

    const cleanVer = draftDoc.version.replace(/^[vV]/, '');
    const auditedEntry: AuditedDocument = {
      id: `doc-inv-${Date.now()}`,
      code: draftDoc.code,
      title: draftDoc.title,
      ownerArea: draftDoc.processArea,
      version: cleanVer,
      lastUpdated: draftDoc.issueDate,
      elaboratedBy: draftDoc.responsible,
      reviewedBy: reviewedBy || 'GRC & QA',
      approvedBy: draftDoc.approver,
      approvalDate: draftDoc.issueDate,
      actNumber: actNumber || `Acta Oficial N° ${draftDoc.code.split('-').pop()}-2026`,
      changeLog: `Emisión y publicación oficial desde el Generador IA de Documentos.`,
      status: 'Vigente',
      detectedCountry: draftDoc.companyCode.startsWith('GCCO') ? 'Colombia' : (draftDoc.companyCode.startsWith('G81') || draftDoc.companyCode.startsWith('GCCL')) ? 'Chile' : 'Sin Clasificar',
      detectedSociety: (draftDoc.companyCode as any) || 'GCCO',
      detectedTypology: draftDoc.type as any,
      detectedCorrelative: draftDoc.code.split('-')[2] || '001',
      isDuplicate: false,
      hasSyntaxError: false,
      isCompliant: true,
      auditIssues: [],
      versionHistory: [
        {
          version: cleanVer,
          date: draftDoc.issueDate,
          elaboratedBy: draftDoc.responsible,
          reviewedBy: reviewedBy || 'GRC & QA',
          approvedBy: draftDoc.approver,
          actNumber: actNumber || `Acta Oficial N° ${draftDoc.code.split('-').pop()}-2026`,
          changeLog: 'Emisión oficial maquetada y publicada en el repositorio máster.',
          isCurrent: true
        }
      ]
    };

    // Reemplazar o insertar en inventario consolidado
    const updatedInv = [auditedEntry, ...existingInv.filter(d => d.code.toUpperCase() !== draftDoc.code.toUpperCase())];
    localStorage.setItem('g66_grc_consolidated_inventory_v2', JSON.stringify(updatedInv));

    setPublishedSuccessModal(draftDoc);
    showToast(`✅ ¡Documento ${draftDoc.code} guardado y publicado en el Repositorio Máster!`, 'published');
  };

  // EXPORTACIONES
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = (doc: GovernanceDocument) => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${doc.code} - ${doc.title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
          .header-box { border: 2px solid #102A97; padding: 15px; margin-bottom: 20px; background: #F4F6FE; }
          h1 { color: #102A97; font-size: 18pt; margin: 0 0 10px 0; border-bottom: 2px solid #3F5EDF; padding-bottom: 6px; }
          h2 { color: #3F5EDF; font-size: 13pt; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; }
          th { background: #102A97; color: white; border: 1px solid #0d2170; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <table style="border:none; margin:0;">
            <tr>
              <td style="border:none; width:70%;">
                <h1 style="color:#102A97;">GLOBAL66 - ${doc.companyCode}</h1>
                <p><strong>${doc.type === 'PRO' ? 'PROCEDIMIENTO OFICIAL' : doc.type === 'POL' ? 'POLÍTICA CORPORATIVA' : 'MANUAL OPERATIVO'}</strong></p>
                <p><strong>Código:</strong> ${doc.code} | <strong>Versión:</strong> ${doc.version} | <strong>Estado:</strong> ${doc.status}</p>
                <p><strong>N° Acta:</strong> ${actNumber || 'Registrada en repositorio'}</p>
              </td>
              <td style="border:none; text-align:right;">
                <p><strong>Área:</strong> ${doc.processArea}</p>
                <p><strong>Emisión:</strong> ${doc.issueDate}</p>
              </td>
            </tr>
          </table>
        </div>

        <h2>1. Objetivo</h2>
        <p>${doc.objective}</p>

        <h2>2. Alcance</h2>
        <p>${doc.scope}</p>

        <h2>3. Definiciones Operativas</h2>
        <table>
          <tr><th>Término</th><th>Definición</th></tr>
          ${doc.definitions.map(d => `<tr><td><strong>${d.term}</strong></td><td>${d.definition}</td></tr>`).join('')}
        </table>

        <h2>4. Descripción del Proceso</h2>
        ${doc.steps ? `
          <table>
            <tr><th>Paso</th><th>Rol / Responsable</th><th>Actividad</th><th>Entradas</th><th>Salidas</th><th>Control Asociado</th></tr>
            ${doc.steps.map(s => `<tr><td>#${s.stepNumber}</td><td><strong>${s.role}</strong></td><td>${s.activity}</td><td>${s.input}</td><td>${s.output}</td><td>${s.controls || 'N/A'}</td></tr>`).join('')}
          </table>
        ` : ''}

        ${doc.guidelines ? `
          <table>
            <tr><th>Tópico</th><th>Principio Rector</th><th>Lineamiento Mandatorio</th></tr>
            ${doc.guidelines.map(g => `<tr><td><strong>${g.topic}</strong></td><td>${g.principle}</td><td>${g.mandatoryRule}</td></tr>`).join('')}
          </table>
        ` : ''}

        ${doc.patterns ? `
          <table>
            <tr><th>Módulo</th><th>Regla Operativa</th><th>Guía de Arquitectura</th></tr>
            ${doc.patterns.map(p => `<tr><td><strong>${p.module}</strong></td><td>${p.operationalRule}</td><td>${p.architectureGuide}</td></tr>`).join('')}
          </table>
        ` : ''}

        <h2>5. Control y Seguimiento</h2>
        <p>${doc.controlAndMonitoring}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* HEADER DEL GENERADOR (IA) */}
      <div className="bg-[#102A97] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#3F5EDF]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#00B582]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#3F5EDF] text-white flex items-center gap-1.5 shadow-sm">
                  <Sparkles size={14} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Generador de Documentos (IA)</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-100 border border-white/15">
                  Creación desde Videos & Transcripciones
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Maquetador Inteligente de Procesos y Políticas
              </h1>
              <p className="text-sm text-blue-100 max-w-3xl leading-relaxed">
                Transforma grabaciones de pantalla (Loom/Teams), transcripciones de audio o minutas operativas en <strong className="text-white">Procedimientos (PRO)</strong>, <strong className="text-white">Políticas (POL)</strong> y <strong className="text-white">Manuales (MAN)</strong> oficiales bajo el estándar ISO 31000 / ISO 9001.
              </p>
            </div>

            {/* BOTÓN RÁPIDO DE NAVEGACIÓN AL REPOSITORIO */}
            {onNavigateToRepository && (
              <button
                onClick={onNavigateToRepository}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer border border-white/20 shrink-0 self-start md:self-auto"
                title="Ver Matriz Consolidada de Repositorio"
              >
                <BookOpen size={16} className="text-emerald-300" />
                <span>Ir al Repositorio Máster</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* PASOS DE FLUJO (TABS) */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/15">
            <button
              onClick={() => setActiveStep('input')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeStep === 'input'
                  ? 'bg-white text-[#102A97] shadow-md'
                  : 'bg-white/10 text-blue-100 hover:bg-white/15'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#102A97] text-white flex items-center justify-center text-[10px] font-black">1</span>
              <span>1. Ingesta de Insumos & Parámetros</span>
            </button>

            <button
              onClick={() => {
                if (draftDoc) setActiveStep('editor');
                else handleGenerateDocument();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeStep === 'editor'
                  ? 'bg-white text-[#102A97] shadow-md'
                  : 'bg-white/10 text-blue-100 hover:bg-white/15'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#00B582] text-white flex items-center justify-center text-[10px] font-black">2</span>
              <span>2. Maquetación & Edición del Borrador Oficial</span>
              {draftDoc && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </button>

            <button
              onClick={() => setActiveStep('taxonomy')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeStep === 'taxonomy'
                  ? 'bg-white text-[#102A97] shadow-md'
                  : 'bg-white/10 text-blue-100 hover:bg-white/15'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">3</span>
              <span>3. Mapa Maestro Regional (14 Procesos)</span>
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICACIÓN TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold ${
              toastMessage.type === 'published'
                ? 'bg-emerald-900 text-emerald-100 border border-emerald-500'
                : toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'bg-blue-900 text-blue-100 border border-blue-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
            {onNavigateToRepository && toastMessage.type === 'published' && (
              <button
                onClick={onNavigateToRepository}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
              >
                Abrir en Repositorio
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PASO 1: INGESTA DE INSUMOS & PARÁMETROS                                    */}
      {/* ========================================================================= */}
      {activeStep === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* PLANTILLAS RÁPIDAS DE INSUMOS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#102A97] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#3F5EDF]" />
                <span>Insumos Predefinidos (Walkthroughs & Transcripciones Reales):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Haz clic para cargar en el maquetador</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TRANSCRIPTION_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#3F5EDF] hover:bg-[#F4F6FE] transition-all text-left group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-[#102A97]">
                        {tpl.companyCode} • {tpl.docType}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{tpl.processArea}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#102A97] line-clamp-2">
                      {tpl.title}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-[#3F5EDF] mt-2 flex items-center gap-1">
                    <span>Cargar en formulario</span>
                    <ArrowRight size={10} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FORMULARIO PRINCIPAL DE ENTRADA Y PARÁMETROS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-[#102A97] flex items-center gap-2">
                <FileText size={20} className="text-[#3F5EDF]" />
                <span>Configuración y Metadatos del Documento Oficial</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Especifica la tipología, sociedad, correlativo y responsables de control de la matriz.
              </p>
            </div>

            {/* SELECTOR DE PROCESO OFICIAL DE LA TAXONOMÍA REGIONAL (14 MACROPROCESOS) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-[#102A97] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#3F5EDF]" />
                    <span>Alineación con Arquitectura Regional de Procesos (14 Macroprocesos):</span>
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Selecciona el proceso oficial según la taxonomía corporativa de Global66 para auto-completar gobernanza y roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep('taxonomy')}
                  className="text-xs font-black text-[#3F5EDF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Mapa Maestro Completo</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <select
                value={selectedTaxonomyProcessId}
                onChange={e => handleSelectTaxonomyProcess(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3F5EDF] outline-none"
              >
                {GLOBAL66_PROCESS_TAXONOMY.map(proc => (
                  <option key={proc.id} value={proc.id}>
                    #{proc.id} [{proc.macrocategory}] {proc.categoryLevel1}
                  </option>
                ))}
              </select>

              {selectedTaxonomyProcess && (
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-[#102A97] shrink-0">Grupo Nivel 2:</span>
                    <span className="text-slate-700 font-semibold">{selectedTaxonomyProcess.processGroupLevel2}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                      <strong className="text-blue-900 block font-bold text-[10px] uppercase">Global 81 (Hub Chile)</strong>
                      <span className="text-slate-700 font-medium">{selectedTaxonomyProcess.global81Hub}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <strong className="text-emerald-900 block font-bold text-[10px] uppercase">Global Card (Chile)</strong>
                      <span className="text-slate-700 font-medium">{selectedTaxonomyProcess.globalCardChile}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                      <strong className="text-amber-900 block font-bold text-[10px] uppercase">SEDPE (Colombia)</strong>
                      <span className="text-slate-700 font-medium">{selectedTaxonomyProcess.sedpeColombia}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GRILLA DE METADATOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sociedad */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Sociedad / Entidad:
                </label>
                <select
                  value={companyCode}
                  onChange={e => setCompanyCode(e.target.value as GovernanceCompanyCode)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3F5EDF] outline-none"
                >
                  <option value="GCCO">🇨🇴 GCCO (Colombia - SEDPE)</option>
                  <option value="G81">🇨🇱 G81 (Global Card Chile / Prepago)</option>
                  <option value="GCCL">🇨🇱 GCCL (Global66 SpA Chile - Hub)</option>
                  <option value="GCH">🇨🇱 GCH (Global66 Chile)</option>
                  <option value="GCAR">🇦🇷 GCAR (Argentina)</option>
                  <option value="GREG">🌎 GREG (Regional LatAm)</option>
                </select>
              </div>

              {/* Tipología */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Tipo de Documento:
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as GovernanceDocType)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3F5EDF] outline-none"
                >
                  <option value="PRO">PRO - Procedimiento Operativo</option>
                  <option value="POL">POL - Política Corporativa</option>
                  <option value="MAN">MAN - Manual Operativo / Técnico</option>
                  <option value="PCS">PCS - Macroproceso</option>
                </select>
              </div>

              {/* Área Propietaria */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Proceso / Área:
                </label>
                <select
                  value={processArea}
                  onChange={e => setProcessArea(e.target.value as ProcessArea)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3F5EDF] outline-none"
                >
                  <option value="Conciliaciones">Conciliaciones (Ops & Tesorería)</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Tesorería">Tesorería</option>
                  <option value="Mesa de Dinero">Mesa de Dinero</option>
                  <option value="Fraude">Fraude</option>
                  <option value="Cumplimiento">Cumplimiento / AML</option>
                  <option value="Riesgos Nube">Riesgos Nube / Ciberseguridad</option>
                  <option value="TI">TI / Infraestructura</option>
                  <option value="Producto">Producto & UX</option>
                  <option value="Finanzas">Finanzas & Contabilidad</option>
                </select>
              </div>

              {/* Correlativo o Código Resultante */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Código Normalizado Oficial:
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-3 py-2 bg-blue-50 text-[#102A97] border border-blue-200 rounded-xl flex-1 text-center">
                    {generatedCode}
                  </span>
                  <input
                    type="text"
                    placeholder="Corr (ej: 035)"
                    value={customCorrelative}
                    onChange={e => setCustomCorrelative(e.target.value)}
                    className="w-24 text-xs font-mono font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl text-center"
                    title="Modificar número correlativo"
                  />
                </div>
              </div>
            </div>

            {/* ROLES Y ACTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Elaborado por:</label>
                <input
                  type="text"
                  value={responsible}
                  onChange={e => setResponsible(e.target.value)}
                  placeholder="Nombre y cargo del autor"
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Revisado por (GRC/QA):</label>
                <input
                  type="text"
                  value={reviewedBy}
                  onChange={e => setReviewedBy(e.target.value)}
                  placeholder="Oficialía / Control Interno"
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Aprobado por:</label>
                <input
                  type="text"
                  value={approver}
                  onChange={e => setApprover(e.target.value)}
                  placeholder="Comité / Directorio"
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">N° de Acta Comité / Junta:</label>
                <input
                  type="text"
                  value={actNumber}
                  onChange={e => setActNumber(e.target.value)}
                  placeholder="Ej: Acta Comité Ops N° 35-2026"
                  className="w-full text-xs font-mono font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* TÍTULO Y FUENTES DE ENTRADA (LOOM / VIDEO / TEXTO) */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  Título Formal del Documento Oficial:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Ej: Procedimiento de Conciliación Diaria Tripartita de Cuentas y Tarjetas"
                  className="w-full text-sm font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3F5EDF] outline-none"
                />
              </div>

              {/* Enlace de Video (Loom, Teams, Drive) */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Video size={14} className="text-[#3F5EDF]" />
                  <span>Enlace de Grabación / Walkthrough (Loom, Teams, Google Drive, YouTube):</span>
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://www.loom.com/share/abcdef... o enlace a Teams / Google Drive"
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              {/* Área de Transcripción */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Mic size={14} className="text-[#00B582]" />
                    <span>Pegar Transcripción de Video, Notas Operativas o Minuta de Trabajo:</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rawText.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Pega aquí la transcripción generada por Loom/Teams, el audio dictado por el operador o los pasos operativos paso a paso..."
                  className="w-full text-xs font-mono leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3F5EDF] outline-none resize-y"
                />
              </div>
            </div>

            {/* BOTÓN DE GENERACIÓN */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setRawText('');
                  setDocTitle('');
                  setVideoUrl('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Limpiar campos
              </button>

              <button
                type="button"
                disabled={isProcessingAI}
                onClick={handleGenerateDocument}
                className="flex items-center gap-2 px-6 py-3 bg-[#102A97] hover:bg-blue-950 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                id="generate_doc_btn"
              >
                {isProcessingAI ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Maquetando Secciones Oficiales con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-300" />
                    <span>Maquetar Documento Oficial ({generatedCode})</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* PASO 2: MAQUETACIÓN & EDICIÓN DEL BORRADOR OFICIAL                         */}
      {/* ========================================================================= */}
      {activeStep === 'editor' && draftDoc && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* BARRA SUPERIOR CON BOTÓN DESTACADO "GUARDAR Y PUBLICAR EN REPOSITORIO MÁSTER" */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-[#00B582] rounded-xl border border-emerald-200">
                <FileCheck size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Borrador Oficial Listo para Publicar
                </span>
                <h2 className="text-base font-black text-[#102A97] flex items-center gap-2">
                  <span>{draftDoc.code}</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-sm font-bold text-slate-700">{draftDoc.title}</span>
                </h2>
              </div>
            </div>

            {/* BOTÓN PROMINENTE DE PUBLICACIÓN EN REPOSITORIO MÁSTER */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <button
                onClick={() => setActiveStep('input')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Volver a Insumos
              </button>

              <button
                onClick={() => handleExportWord(draftDoc)}
                className="px-3.5 py-2.5 rounded-xl bg-blue-50 text-[#102A97] hover:bg-blue-100 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                title="Descargar en Microsoft Word"
              >
                <Download size={14} />
                <span>Word (.doc)</span>
              </button>

              <button
                onClick={handlePublishToMasterRepository}
                className="px-5 py-2.5 rounded-xl bg-[#00B582] hover:bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                id="publish_to_master_repo_btn"
              >
                <ShieldCheck size={16} />
                <span>Guardar y Publicar en Repositorio Máster</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* HOJA OFICIAL CON BRANDING Y ESTRUCTURA COMPLETA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8">
            
            {/* ENCABEZADO INSTITUCIONAL OFICIAL */}
            <div className="border-2 border-[#102A97] rounded-2xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#102A97] bg-[#F4F6FE]">
                
                {/* Logo & Sociedad */}
                <div className="md:col-span-3 p-4 flex flex-col justify-center items-center text-center bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#102A97] flex items-center justify-center text-white font-black text-base shadow-sm">
                      G
                    </div>
                    <span className="text-lg font-black tracking-tight text-[#102A97]">GLOBAL66</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase mt-1">
                    {draftDoc.companyCode} • GRC System
                  </span>
                </div>

                {/* Título Central */}
                <div className="md:col-span-6 p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#3F5EDF]">
                    {draftDoc.type === 'PRO' ? 'PROCEDIMIENTO OPERATIVO ESTÁNDAR' :
                     draftDoc.type === 'POL' ? 'POLÍTICA CORPORATIVA DE GOBIERNO' :
                     'MANUAL DE ARQUITECTURA Y OPERACIÓN'}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#102A97] mt-1 leading-tight">
                    {draftDoc.title}
                  </h2>
                </div>

                {/* Metadatos de Cabecera */}
                <div className="md:col-span-3 p-4 flex flex-col justify-center text-xs space-y-1 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Código:</span>
                    <span className="font-mono font-black text-[#102A97]">{draftDoc.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Versión:</span>
                    <span className="font-mono font-black text-slate-800">{draftDoc.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Estado:</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-black bg-emerald-50 text-[#00B582] border border-emerald-200">
                      {draftDoc.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Emisión:</span>
                    <span className="font-medium text-slate-600">{draftDoc.issueDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLA DE METADATOS DE GOBIERNO */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F6FE] p-4 rounded-xl border border-[#DCE3FA] text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Área Propietaria:</span>
                <span className="font-black text-[#102A97]">{draftDoc.ownerDepartment}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Cargo Propietario:</span>
                <span className="font-bold text-slate-800">{draftDoc.ownerRole}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Elaborado por:</span>
                <span className="font-bold text-slate-800">{draftDoc.responsible}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Aprobado por:</span>
                <span className="font-bold text-slate-800">{draftDoc.approver}</span>
              </div>
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-[#DCE3FA]/70 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase">N° Acta Comité / Junta:</span>
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-white text-[#102A97] border border-blue-200">
                    📋 {actNumber || 'Pendiente de Asignación en Acta'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>Revisión GRC: </span>
                  <strong className="text-slate-700">{reviewedBy || 'Comité de Control'}</strong>
                </div>
              </div>
            </div>

            {/* 1. OBJETIVO */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-[#102A97] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>1. Objetivo</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {draftDoc.objective}
              </p>
            </div>

            {/* 2. ALCANCE */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-[#102A97] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>2. Alcance</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {draftDoc.scope}
              </p>
            </div>

            {/* 3. DEFINICIONES */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-[#102A97] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>3. Definiciones Operativas</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-[#F4F6FE] text-[#102A97] font-black text-[11px]">
                    <tr>
                      <th className="p-2.5 w-1/4">Término</th>
                      <th className="p-2.5">Definición Operativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {draftDoc.definitions.map((def, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">{def.term}</td>
                        <td className="p-2.5 text-slate-700">{def.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. PASO A PASO / LINEAMIENTOS */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-[#102A97] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>4. {draftDoc.type === 'PRO' ? 'Flujo de Actividades (Paso a Paso)' : draftDoc.type === 'POL' ? 'Lineamientos Mandatorios' : 'Pautas de Arquitectura'}</span>
              </h3>

              {draftDoc.steps && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#102A97] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-2.5 text-center w-12">Paso</th>
                        <th className="p-2.5 w-44">Rol / Responsable</th>
                        <th className="p-2.5 min-w-[200px]">Actividad Operativa</th>
                        <th className="p-2.5 w-32">Entradas</th>
                        <th className="p-2.5 w-32">Salidas</th>
                        <th className="p-2.5 min-w-[140px]">Control Asociado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftDoc.steps.map(step => (
                        <tr key={step.stepNumber} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-black font-mono text-[#102A97] bg-blue-50/30">
                            #{step.stepNumber}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800">{step.role}</td>
                          <td className="p-2.5 text-slate-700">{step.activity}</td>
                          <td className="p-2.5 text-slate-600">{step.input}</td>
                          <td className="p-2.5 text-slate-600">{step.output}</td>
                          <td className="p-2.5 font-medium text-emerald-800 bg-emerald-50/40">
                            {step.controls || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {draftDoc.guidelines && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#102A97] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-2.5 w-1/4">Tópico</th>
                        <th className="p-2.5 w-1/3">Principio Rector</th>
                        <th className="p-2.5">Lineamiento Mandatorio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftDoc.guidelines.map((g, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-black text-[#102A97] bg-blue-50/30">{g.topic}</td>
                          <td className="p-2.5 font-medium text-slate-800">{g.principle}</td>
                          <td className="p-2.5 font-bold text-slate-900">{g.mandatoryRule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {draftDoc.patterns && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#102A97] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-2.5 w-1/4">Módulo</th>
                        <th className="p-2.5 w-1/3">Regla Operativa</th>
                        <th className="p-2.5">Guía de Arquitectura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftDoc.patterns.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-black text-[#102A97] bg-blue-50/30">{p.module}</td>
                          <td className="p-2.5 text-slate-700">{p.operationalRule}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-800">{p.architectureGuide}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 5. CONTROL Y MONITOREO */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-[#102A97] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>5. Control y Monitoreo</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {draftDoc.controlAndMonitoring}
              </p>
            </div>

            {/* BOTÓN FINAL DE PUBLICACIÓN */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handlePublishToMasterRepository}
                className="px-6 py-3.5 rounded-xl bg-[#00B582] hover:bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck size={18} />
                <span>Guardar y Publicar en Repositorio Máster</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* PASO 3: MAPA MAESTRO REGIONAL (14 MACROPROCESOS)                           */}
      {/* ========================================================================= */}
      {activeStep === 'taxonomy' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <RegionalProcessArchitectureView
            risks={risks}
            onSelectProcessToDocument={(procDef) => {
              handleSelectTaxonomyProcess(procDef.id);
              setActiveStep('input');
            }}
            onFilterRisksByProcess={(area) => {
              showToast(`Área ${area} seleccionada. Vinculada en taxonomía regional.`, 'info');
            }}
          />
        </motion.div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE PUBLICACIÓN EXITOSA */}
      <AnimatePresence>
        {publishedSuccessModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-100 text-[#00B582] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-[#102A97]">
                  ¡Documento Publicado con Éxito!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El documento <strong className="text-[#102A97]">{publishedSuccessModal.code}</strong> se ha registrado e incorporado en la <strong>Matriz Consolidada de Repositorio & Control Máster</strong> con todas sus versiones y metadatos de auditoría.
                </p>
              </div>

              <div className="p-4 bg-[#F4F6FE] rounded-2xl border border-[#DCE3FA] text-left text-xs space-y-1 font-medium text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Código:</span>
                  <span className="font-mono font-black text-[#102A97]">{publishedSuccessModal.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Título:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[240px]">{publishedSuccessModal.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Versión:</span>
                  <span className="font-mono font-black">{publishedSuccessModal.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">N° de Acta:</span>
                  <span className="font-mono text-blue-700">{actNumber || 'Registrada en matriz'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setPublishedSuccessModal(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Seguir Maquetando
                </button>

                {onNavigateToRepository && (
                  <button
                    onClick={() => {
                      setPublishedSuccessModal(null);
                      onNavigateToRepository();
                    }}
                    className="flex-1 py-3 bg-[#102A97] hover:bg-blue-950 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/20"
                  >
                    <BookOpen size={14} />
                    <span>Ver en Repositorio Máster</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
