import { AuditedDocument, DocumentVersionHistoryEntry, DocTypology, OfficialCountry, OfficialSocietyCode } from '../types';

export const INITIAL_CONSOLIDATED_INVENTORY: AuditedDocument[] = [
  // 1. GCCO-PRO-001 (Colombia)
  {
    id: 'doc-inv-001',
    code: 'GCCO-PRO-001',
    title: 'Procedimiento de Conciliación Bancaria y Cuentas de Recaudo PSE',
    ownerArea: 'Operaciones',
    version: '2.0',
    lastUpdated: '2026-05-12',
    elaboratedBy: 'Carlos Mendoza (Lead Ops Settlement)',
    reviewedBy: 'Valeria Rojas (Head of GRC)',
    approvedBy: 'Comité de Operaciones y Tesorería',
    approvalDate: '2026-05-12',
    actNumber: 'Acta Comité Ops N° 28-2026',
    changeLog: 'Automatización de cruce tripartito PSE y reducción de descuadre temporal T+1.',
    status: 'Vigente',
    detectedCountry: 'Colombia',
    detectedSociety: 'GCCO',
    detectedTypology: 'PRO',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-06-10',
        elaboratedBy: 'Carlos Mendoza (Lead Ops)',
        reviewedBy: 'Marcela Duarte (QA)',
        approvedBy: 'Gerencia de Operaciones',
        actNumber: 'Acta Gerencial N° 12-2025',
        changeLog: 'Creación y formalización inicial del procedimiento de recaudo.',
        isCurrent: false
      },
      {
        version: '2.0',
        date: '2026-05-12',
        elaboratedBy: 'Carlos Mendoza (Lead Ops Settlement)',
        reviewedBy: 'Valeria Rojas (Head of GRC)',
        approvedBy: 'Comité de Operaciones y Tesorería',
        actNumber: 'Acta Comité Ops N° 28-2026',
        changeLog: 'Automatización de cruce tripartito PSE y reducción de descuadre temporal T+1.',
        isCurrent: true
      }
    ]
  },

  // 2. GCCO-POL-001 (Colombia)
  {
    id: 'doc-inv-002',
    code: 'GCCO-POL-001',
    title: 'Política de Prevención del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT)',
    ownerArea: 'Cumplimiento',
    version: '3.1',
    lastUpdated: '2026-06-20',
    elaboratedBy: 'Oficial de Cumplimiento Adjunto (AML)',
    reviewedBy: 'Comité de Riesgos y Cumplimiento',
    approvedBy: 'Junta Directiva Global Colombia S.A.',
    approvalDate: '2026-06-20',
    actNumber: 'Acta JD-GCCO N° 04-2026',
    changeLog: 'Alineación estricta con la Circular Básica Jurídica de la SFC y umbrales de monitoreo transaccional en tiempo real.',
    status: 'Vigente',
    detectedCountry: 'Colombia',
    detectedSociety: 'GCCO',
    detectedTypology: 'POL',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2024-03-15',
        elaboratedBy: 'Equipo Legal & Compliance',
        reviewedBy: 'Oficial de Cumplimiento',
        approvedBy: 'Junta Directiva',
        actNumber: 'Acta JD N° 02-2024',
        changeLog: 'Aprobación inicial del manual SARLAFT.',
        isCurrent: false
      },
      {
        version: '2.0',
        date: '2025-04-10',
        elaboratedBy: 'Oficial de Cumplimiento Adjunto',
        reviewedBy: 'Comité de Riesgos',
        approvedBy: 'Junta Directiva',
        actNumber: 'Acta JD N° 08-2025',
        changeLog: 'Inclusión de reglas para beneficiarios finales y PEPs regionales.',
        isCurrent: false
      },
      {
        version: '3.1',
        date: '2026-06-20',
        elaboratedBy: 'Oficial de Cumplimiento Adjunto (AML)',
        reviewedBy: 'Comité de Riesgos y Cumplimiento',
        approvedBy: 'Junta Directiva Global Colombia S.A.',
        actNumber: 'Acta JD-GCCO N° 04-2026',
        changeLog: 'Alineación estricta con la Circular Básica Jurídica de la SFC y umbrales de monitoreo transaccional en tiempo real.',
        isCurrent: true
      }
    ]
  },

  // 3. GCCO-MAN-001 (Colombia)
  {
    id: 'doc-inv-003',
    code: 'GCCO-MAN-001',
    title: 'Manual Operativo de Mesa de Dinero y Posición Cambiaria USD/COP',
    ownerArea: 'Finanzas',
    version: '1.4',
    lastUpdated: '2026-04-18',
    elaboratedBy: 'Trader Senior FX & Liquidez',
    reviewedBy: 'Gerente Financiero Regional',
    approvedBy: 'Comité de ALCO (Activos y Pasivos)',
    approvalDate: '2026-04-18',
    actNumber: 'Acta ALCO N° 15-2026',
    changeLog: 'Incorporación de límites de stop-loss intradiarios y contrapartes bancarias autorizadas.',
    status: 'Vigente',
    detectedCountry: 'Colombia',
    detectedSociety: 'GCCO',
    detectedTypology: 'MAN',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-01-20',
        elaboratedBy: 'Trader Senior FX',
        reviewedBy: 'Gerente Financiero',
        approvedBy: 'Comité ALCO',
        actNumber: 'Acta ALCO N° 02-2025',
        changeLog: 'Emisión inicial del manual de tesorería y FX.',
        isCurrent: false
      },
      {
        version: '1.4',
        date: '2026-04-18',
        elaboratedBy: 'Trader Senior FX & Liquidez',
        reviewedBy: 'Gerente Financiero Regional',
        approvedBy: 'Comité de ALCO (Activos y Pasivos)',
        actNumber: 'Acta ALCO N° 15-2026',
        changeLog: 'Incorporación de límites de stop-loss intradiarios y contrapartes bancarias autorizadas.',
        isCurrent: true
      }
    ]
  },

  // 4. GCCO-PRO-030 (Colombia)
  {
    id: 'doc-inv-004',
    code: 'GCCO-PRO-030',
    title: 'Procedimiento de Gestión de Fraude y Bloqueo Cautelar de Cuentas Billetera',
    ownerArea: 'Fraude',
    version: '2.0',
    lastUpdated: '2026-07-05',
    elaboratedBy: 'Líder de Prevención de Fraude',
    reviewedBy: 'Head de Riesgos y Ciberseguridad',
    approvedBy: 'Comité de Seguridad y Riesgos',
    approvalDate: '2026-07-05',
    actNumber: 'Acta Comité Riesgo N° 19-2026',
    changeLog: 'Protocolo de congelamiento en 3 minutos ante alertas de suplantación de identidad por biometría.',
    status: 'Vigente',
    detectedCountry: 'Colombia',
    detectedSociety: 'GCCO',
    detectedTypology: 'PRO',
    detectedCorrelative: '030',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-08-14',
        elaboratedBy: 'Analista de Fraude Senior',
        reviewedBy: 'Líder de Fraude',
        approvedBy: 'Gerente de Riesgo',
        actNumber: 'Acta N° 09-2025',
        changeLog: 'Formalización de reglas heurísticas iniciales de bloqueo.',
        isCurrent: false
      },
      {
        version: '2.0',
        date: '2026-07-05',
        elaboratedBy: 'Líder de Prevención de Fraude',
        reviewedBy: 'Head de Riesgos y Ciberseguridad',
        approvedBy: 'Comité de Seguridad y Riesgos',
        actNumber: 'Acta Comité Riesgo N° 19-2026',
        changeLog: 'Protocolo de congelamiento en 3 minutos ante alertas de suplantación de identidad por biometría.',
        isCurrent: true
      }
    ]
  },

  // 5. G81-POL-001 (Chile)
  {
    id: 'doc-inv-005',
    code: 'G81-POL-001',
    title: 'Política Corporativa de Gobernanza de Datos y Confidencialidad de la Información',
    ownerArea: 'Tecnología',
    version: '1.0',
    lastUpdated: '2026-02-10',
    elaboratedBy: 'Data Protection Officer (DPO)',
    reviewedBy: 'Chief Technology Officer (CTO)',
    approvedBy: 'Directorio Global 81 SpA',
    approvalDate: '2026-02-10',
    actNumber: 'Acta Directorio G81 N° 02-2026',
    changeLog: 'Alineación con la Ley de Protección de Datos Personales y clasificación de activos Tier-1.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'POL',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2026-02-10',
        elaboratedBy: 'Data Protection Officer (DPO)',
        reviewedBy: 'Chief Technology Officer (CTO)',
        approvedBy: 'Directorio Global 81 SpA',
        actNumber: 'Acta Directorio G81 N° 02-2026',
        changeLog: 'Alineación con la Ley de Protección de Datos Personales y clasificación de activos Tier-1.',
        isCurrent: true
      }
    ]
  },

  // 6. G81-PRO-001 (Chile)
  {
    id: 'doc-inv-006',
    code: 'G81-PRO-001',
    title: 'Procedimiento de Despliegue Continuo CI/CD y Control de Cambios en Producción',
    ownerArea: 'Tecnología',
    version: '2.0',
    lastUpdated: '2026-06-11',
    elaboratedBy: 'Lead DevOps Engineer',
    reviewedBy: 'Head de Ciberseguridad & QA',
    approvedBy: 'Comité de Arquitectura y Cambios (CAB)',
    approvalDate: '2026-06-11',
    actNumber: 'Acta CAB N° 23-2026',
    changeLog: 'Requisito mandatorio de aprobación dual y escaneo estático de vulnerabilidades SAST antes de merge a main.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'PRO',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-09-01',
        elaboratedBy: 'Ingeniero DevOps',
        reviewedBy: 'Líder Técnico',
        approvedBy: 'Gerencia TI',
        actNumber: 'Acta TI N° 11-2025',
        changeLog: 'Publicación de flujos iniciales de GitHub Actions.',
        isCurrent: false
      },
      {
        version: '2.0',
        date: '2026-06-11',
        elaboratedBy: 'Lead DevOps Engineer',
        reviewedBy: 'Head de Ciberseguridad & QA',
        approvedBy: 'Comité de Arquitectura y Cambios (CAB)',
        actNumber: 'Acta CAB N° 23-2026',
        changeLog: 'Requisito mandatorio de aprobación dual y escaneo estático de vulnerabilidades SAST antes de merge a main.',
        isCurrent: true
      }
    ]
  },

  // 7. G81-MAN-001 (Chile)
  {
    id: 'doc-inv-007',
    code: 'G81-MAN-001',
    title: 'Manual de Arquitectura Segura Cloud y Recuperación de Desastres (DRP)',
    ownerArea: 'Ciberseguridad',
    version: '1.3',
    lastUpdated: '2026-01-25',
    elaboratedBy: 'Chief Information Security Officer (CISO)',
    reviewedBy: 'Comité de Ciberseguridad',
    approvedBy: 'Directorio Global 81 SpA',
    approvalDate: '2026-01-25',
    actNumber: 'Acta CISO N° 01-2026',
    changeLog: 'Ajuste de RPO a 15 minutos y RTO a 2 horas con conmutación multi-zona.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'MAN',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-05-18',
        elaboratedBy: 'Arquitecto Cloud',
        reviewedBy: 'CISO',
        approvedBy: 'Directorio',
        actNumber: 'Acta DRP N° 03-2025',
        changeLog: 'Arquitectura base en Google Cloud Platform.',
        isCurrent: false
      },
      {
        version: '1.3',
        date: '2026-01-25',
        elaboratedBy: 'Chief Information Security Officer (CISO)',
        reviewedBy: 'Comité de Ciberseguridad',
        approvedBy: 'Directorio Global 81 SpA',
        actNumber: 'Acta CISO N° 01-2026',
        changeLog: 'Ajuste de RPO a 15 minutos y RTO a 2 horas con conmutación multi-zona.',
        isCurrent: true
      }
    ]
  },

  // 8. GCCL-POL-001 (Chile - Global Card S.A.)
  {
    id: 'doc-inv-008',
    code: 'GCCL-POL-001',
    title: 'Política de Salvaguarda y Segregación de Cuentas de Provisión de Fondos',
    ownerArea: 'Tesorería',
    version: '2.0',
    lastUpdated: '2026-04-30',
    elaboratedBy: 'Jefe de Tesorería Emisor',
    reviewedBy: 'Gerente General Global Card S.A.',
    approvedBy: 'Directorio Global Card S.A.',
    approvalDate: '2026-04-30',
    actNumber: 'Acta Directorio GCCL N° 07-2026',
    changeLog: 'Cumplimiento de la Circular N° 2.345 de la CMF sobre cuentas de resguardo exclusivas.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'GCCL',
    detectedTypology: 'POL',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-07-20',
        elaboratedBy: 'Analista de Tesorería',
        reviewedBy: 'Jefe de Finanzas',
        approvedBy: 'Directorio',
        actNumber: 'Acta GCCL N° 02-2025',
        changeLog: 'Apertura y marco de cuentas de salvaguarda.',
        isCurrent: false
      },
      {
        version: '2.0',
        date: '2026-04-30',
        elaboratedBy: 'Jefe de Tesorería Emisor',
        reviewedBy: 'Gerente General Global Card S.A.',
        approvedBy: 'Directorio Global Card S.A.',
        actNumber: 'Acta Directorio GCCL N° 07-2026',
        changeLog: 'Cumplimiento de la Circular N° 2.345 de la CMF sobre cuentas de resguardo exclusivas.',
        isCurrent: true
      }
    ]
  },

  // 9. GCCL-PRO-001 (Chile - Global Card S.A.)
  {
    id: 'doc-inv-009',
    code: 'GCCL-PRO-001',
    title: 'Procedimiento de Emisión y Activación de Tarjetas Mastercard Prepago',
    ownerArea: 'Operaciones',
    version: '1.5',
    lastUpdated: '2026-05-05',
    elaboratedBy: 'Especialista en Medios de Pago',
    reviewedBy: 'Head de Emisión de Tarjetas',
    approvedBy: 'Comité de Producto y Operaciones',
    approvalDate: '2026-05-05',
    actNumber: 'Acta Producto N° 11-2026',
    changeLog: 'Inclusión de validación de PIN dinámico y tokenización Apple Pay / Google Wallet.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'GCCL',
    detectedTypology: 'PRO',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    versionHistory: [
      {
        version: '1.0',
        date: '2025-10-12',
        elaboratedBy: 'Especialista en Medios de Pago',
        reviewedBy: 'Head de Emisión',
        approvedBy: 'Comité de Producto',
        actNumber: 'Acta N° 05-2025',
        changeLog: 'Lanzamiento de tarjeta física prepago Mastercard.',
        isCurrent: false
      },
      {
        version: '1.5',
        date: '2026-05-05',
        elaboratedBy: 'Especialista en Medios de Pago',
        reviewedBy: 'Head de Emisión de Tarjetas',
        approvedBy: 'Comité de Producto y Operaciones',
        actNumber: 'Acta Producto N° 11-2026',
        changeLog: 'Inclusión de validación de PIN dinámico y tokenización Apple Pay / Google Wallet.',
        isCurrent: true
      }
    ]
  },

  // 10. CASO DUPLICADO 1 (ROJO #FF647C) - Conflicto con GCCO-PRO-001
  {
    id: 'doc-inv-010',
    code: 'GCCO-PRO-001',
    title: 'Procedimiento de Conciliación Diaria de Pasarelas de Pago (Versión Redundante)',
    ownerArea: 'Finanzas',
    version: '1.0',
    lastUpdated: '2026-01-10',
    elaboratedBy: 'Analista Contable Junior',
    reviewedBy: 'Supervisor de Finanzas',
    approvedBy: 'Jefatura de Contabilidad',
    approvalDate: '2026-01-10',
    actNumber: '', // Sin Acta
    changeLog: 'Versión antigua subida con código repetido asignado a Operaciones.',
    status: 'En Revisión',
    detectedCountry: 'Colombia',
    detectedSociety: 'GCCO',
    detectedTypology: 'PRO',
    detectedCorrelative: '001',
    isDuplicate: true,
    hasSyntaxError: false,
    isCompliant: false,
    auditIssues: ['Código duplicado: Colisiona con el procedimiento oficial de Operaciones.'],
    suggestedFixCode: 'GCCO-PRO-031',
    notes: 'Código duplicado con GCCO-PRO-001. Requiere reasignar correlativo a 031.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-01-10',
        elaboratedBy: 'Analista Contable Junior',
        reviewedBy: 'Supervisor de Finanzas',
        approvedBy: 'Jefatura de Contabilidad',
        actNumber: '',
        changeLog: 'Versión antigua subida con código repetido asignado a Operaciones.',
        isCurrent: true
      }
    ]
  },

  // 11. CASO ERROR DE SINTAXIS (AMARILLO #FFD153) - GCCO_PRO_1
  {
    id: 'doc-inv-011',
    code: 'GCCO_PRO_1',
    title: 'Procedimiento de Cierre Contable Mensual y Declaración de Retenciones',
    ownerArea: 'Finanzas',
    version: '1.0',
    lastUpdated: '2026-02-28',
    elaboratedBy: 'Contador General Colombia',
    reviewedBy: 'Auditor Interno',
    approvedBy: 'Gerencia de Finanzas',
    approvalDate: '2026-02-28',
    actNumber: 'Acta Gerencial N° 06-2026',
    changeLog: 'Cierre mensual de libros y provisiones de impuestos.',
    status: 'Vigente',
    detectedCountry: 'Colombia',
    detectedSociety: 'GCCO',
    detectedTypology: 'PRO',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: true,
    isCompliant: false,
    auditIssues: [
      'Uso incorrecto de separador guion bajo "_" (debe ser guion medio "-").',
      'El número correlativo tiene 1 dígito (debe tener exactamente 3 dígitos: 001).'
    ],
    suggestedFixCode: 'GCCO-PRO-032',
    notes: 'Corregir sintaxis a GCCO-PRO-032 para evitar colisión.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-02-28',
        elaboratedBy: 'Contador General Colombia',
        reviewedBy: 'Auditor Interno',
        approvedBy: 'Gerencia de Finanzas',
        actNumber: 'Acta Gerencial N° 06-2026',
        changeLog: 'Cierre mensual de libros y provisiones de impuestos.',
        isCurrent: true
      }
    ]
  },

  // 12. CASO ERROR DE SINTAXIS 2 (AMARILLO #FFD153) - GCCL-POL-02
  {
    id: 'doc-inv-012',
    code: 'GCCL-POL-02',
    title: 'Política de Límite Máximo de Saldo en Billeteras y Tarjetas Prepago',
    ownerArea: 'Cumplimiento',
    version: '1.2',
    lastUpdated: '2026-05-19',
    elaboratedBy: 'Oficial de Riesgo Operacional',
    reviewedBy: 'Comité de Riesgos',
    approvedBy: 'Directorio Global Card S.A.',
    approvalDate: '2026-05-19',
    actNumber: 'Acta GCCL N° 09-2026',
    changeLog: 'Tope máximo de saldo fijado en 5.000.000 CLP conforme regulación CMF.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'GCCL',
    detectedTypology: 'POL',
    detectedCorrelative: '002',
    isDuplicate: false,
    hasSyntaxError: true,
    isCompliant: false,
    auditIssues: [
      'El número correlativo tiene 2 dígitos "02" en lugar de 3 dígitos "002".'
    ],
    suggestedFixCode: 'GCCL-POL-002',
    notes: 'Ajustar a 3 dígitos estándar.',
    versionHistory: [
      {
        version: '1.0',
        date: '2025-11-04',
        elaboratedBy: 'Oficial de Riesgo',
        approvedBy: 'Directorio',
        actNumber: 'Acta N° 04-2025',
        changeLog: 'Emisión original de límites.',
        isCurrent: false
      },
      {
        version: '1.2',
        date: '2026-05-19',
        elaboratedBy: 'Oficial de Riesgo Operacional',
        reviewedBy: 'Comité de Riesgos',
        approvedBy: 'Directorio Global Card S.A.',
        actNumber: 'Acta GCCL N° 09-2026',
        changeLog: 'Tope máximo de saldo fijado en 5.000.000 CLP conforme regulación CMF.',
        isCurrent: true
      }
    ]
  },

  // 13. CASO SIN CLASIFICAR / PREFIJO DESCONOCIDO
  {
    id: 'doc-inv-013',
    code: 'GREG-PRO-001',
    title: 'Procedimiento Corporativo de Compras y Licitación con Proveedores Cloud',
    ownerArea: 'Administración',
    version: '1.0',
    lastUpdated: '2026-04-10',
    elaboratedBy: 'Procurement Specialist',
    reviewedBy: 'Head of Legal & Finance',
    approvedBy: 'Gerencia General Regional',
    approvalDate: '2026-04-10',
    actNumber: '', // Sin Acta
    changeLog: 'Evaluación y contratación de vendors SaaS y licencias.',
    status: 'Vigente',
    detectedCountry: 'Sin Clasificar',
    detectedSociety: 'DESCONOCIDO',
    detectedTypology: 'PRO',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: true,
    isCompliant: false,
    auditIssues: ['Prefijo "GREG" no corresponde a las sociedades oficiales (GCCO, G81, GCCL).'],
    suggestedFixCode: 'G81-PRO-002',
    notes: 'Debe asignarse a la sociedad controladora en Chile (G81).',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-04-10',
        elaboratedBy: 'Procurement Specialist',
        reviewedBy: 'Head of Legal & Finance',
        approvedBy: 'Gerencia General Regional',
        actNumber: '',
        changeLog: 'Evaluación y contratación de vendors SaaS y licencias.',
        isCurrent: true
      }
    ]
  },

  // 14. Figma UX/UI: Adquirencia Global - B2B Deposit Money All
  {
    id: 'doc-inv-014',
    code: 'G81-PRO-002',
    title: 'Especificación Funcional y Prototipo UX/UI: Adquirencia Global - B2B Deposit Money All',
    ownerArea: 'Nuevos Productos',
    version: '1.0',
    lastUpdated: '2026-06-25',
    elaboratedBy: 'Product Designer Lead & Product Owner B2B Acquiring',
    reviewedBy: 'Head of Product & GRC Team',
    approvedBy: 'Comité de Nuevos Productos & Arquitectura Regional',
    approvalDate: '2026-06-25',
    actNumber: 'Acta Comité Producto N° 19-2026',
    changeLog: 'Diseño integral del flujo B2B Deposit Money All: selección de rails, titularidad, comprobante OCR, cotización FX y aprobaciones Maker-Checker.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'PRO',
    detectedCorrelative: '002',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    driveOrLoomUrl: 'https://www.figma.com/design/Dimx0duTVEucvGpD3RrpVj/branch/DCNGw2zaxCxWCAIYiWmnAl/B2B_Deposit_Money_All?node-id=2163-11093&p=f&t=Oiqs4Lg1ZB7jVGrw-0',
    macroprocess: 'Misional',
    subprocess: 'Adquirencia Global & Pay-ins B2B',
    criticality: 'ALTA',
    responsibleRole: 'Lead Product Manager - Adquirencia Global',
    description: 'Prototipo interactivo en Figma (node 2163-11093) para la experiencia multipaís de depósitos y cobros corporativos B2B en Global66.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-06-25',
        elaboratedBy: 'Product Designer Lead',
        reviewedBy: 'Head of Product & GRC',
        approvedBy: 'Comité de Nuevos Productos',
        actNumber: 'Acta Comité Producto N° 19-2026',
        changeLog: 'Aprobación del prototipo UX/UI y matriz de riesgos ISO 31000 para B2B Deposit Money All.',
        isCurrent: true
      }
    ]
  },

  // 15. G81-ESP-003: Documento de Alcance Técnico - Payout Swift por JPMorgan
  {
    id: 'doc-inv-015',
    code: 'G81-ESP-003',
    title: 'Documento de Alcance Técnico: Integración Payout Swift por JPMorgan (Host-to-Host SFTP & ISO 20022)',
    ownerArea: 'Nuevos Productos',
    version: '1.2',
    lastUpdated: '2026-07-02',
    elaboratedBy: 'Diego Castro (Lead Backend Integrations) & Juan Esteban Deossa',
    reviewedBy: 'Aliro Correa (CISO) & Valeria Rojas (Head of GRC)',
    approvedBy: 'Comité Regional de Nuevos Productos & Arquitectura',
    approvalDate: '2026-07-02',
    actNumber: 'Acta Comité Producto N° 22-2026',
    changeLog: 'Especificación técnica H2H SFTP, cifrado PGP 4096-bit, XML pain.001/pacs.008, control en liberación de pagos, sanitización de glosa libre, países prohibidos y entorno CAT.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'ESP',
    detectedCorrelative: '003',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Misional',
    subprocess: 'Payout Swift Internacional & Corresponsalía JPMorgan',
    criticality: 'CRÍTICA',
    responsibleRole: 'Tech Lead Integraciones Regionales',
    description: 'Documento técnico normativo que rige la conexión Host-to-Host (MFT) con JPMorgan, generación de archivos XML ISO 20022 cada 5 minutos, cut-off Fedwire a las 16:00 EST y controles anti-fraude previos a la transmisión.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-05-15',
        elaboratedBy: 'Diego Castro (Lead Integrations)',
        reviewedBy: 'Aliro Correa (CISO)',
        approvedBy: 'Comité de Arquitectura',
        actNumber: 'Acta Arq N° 09-2026',
        changeLog: 'Definición de arquitectura inicial SFTP y formato MT103/pain.001.',
        isCurrent: false
      },
      {
        version: '1.2',
        date: '2026-07-02',
        elaboratedBy: 'Diego Castro & Juan Esteban Deossa',
        reviewedBy: 'Aliro Correa & Valeria Rojas',
        approvedBy: 'Comité de Nuevos Productos',
        actNumber: 'Acta Comité Producto N° 22-2026',
        changeLog: 'Inclusión mandatoria del control en liberación de pagos (Parte VII.4), switch STP apagado (Parte I) y validación en ambiente CAT (Parte IX).',
        isCurrent: true
      }
    ]
  },

  // 16. G81-CAS-001: Business Case - Payout Swift por JPMorgan
  {
    id: 'doc-inv-016',
    code: 'G81-CAS-001',
    title: 'Business Case: Payout Swift por JPMorgan (Rutas de Payout, Fondeo Nostro FX, IVA Local y Planes de Contingencia)',
    ownerArea: 'Finanzas',
    version: '1.0',
    lastUpdated: '2026-07-05',
    elaboratedBy: 'Juan Garnham (Treasury Lead) & Tomás Lira',
    reviewedBy: 'Diego García Lira (Head of Finance) & María Gutiérrez (Compliance)',
    approvedBy: 'Comité de Inversiones, Tesorería & Finanzas',
    approvalDate: '2026-07-05',
    actNumber: 'Acta Comité Finanzas N° 14-2026',
    changeLog: 'Evaluación financiera del modelo Compliance Reliant de JPMorgan, mitigación de sobrecosto FX con Banco BICE (ahorro ~$30k USD/año), estructura fiscal de IVA en Chile y contingencia con NIUM.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'CAS',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Estratégico',
    subprocess: 'Tesorería Global, FX & Corresponsalía Bancaria',
    criticality: 'ALTA',
    responsibleRole: 'Head of Treasury & CFO',
    description: 'Estudio de viabilidad económica, fiscal y de cumplimiento para la corresponsalía de JPMorgan en EE.UU., documentando el neteo de costos, fondeo diario anticipado y planes de contingencia operativa.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-07-05',
        elaboratedBy: 'Juan Garnham & Tomás Lira',
        reviewedBy: 'Diego García Lira & María Gutiérrez',
        approvedBy: 'Comité de Finanzas',
        actNumber: 'Acta Comité Finanzas N° 14-2026',
        changeLog: 'Aprobación definitiva del Business Case y estrategia de fondeo BICE T+0.',
        isCurrent: true
      }
    ]
  },

  // 17. G81-ALC-004: Documento de Alcance - Global chats (Kit P2P Wow)
  {
    id: 'doc-inv-017',
    code: 'G81-ALC-004',
    title: 'Documento de Alcance: Nueva experiencia de pagos (Global chats) Anteriormente Kit P2P Wow',
    ownerArea: 'Nuevos Productos',
    version: '1.0',
    lastUpdated: '2026-08-11',
    elaboratedBy: 'Pedro Pico (Head Vertical B2C)',
    reviewedBy: 'Aliro Correa (CISO), María Gutiérrez (Compliance), Jhojhan Sifuentes (TL FE) & Lucas Cornero (DEV BE)',
    approvedBy: 'Tomas Bercovich (CEO & Sponsor) & Comité de Producto',
    approvalDate: '2026-08-11',
    actNumber: 'Acta Comité Producto N° 26-2026',
    changeLog: 'Definición de mensajería 1:1, pagos y cobros P2P desde el chat, arquitectura WebSocket en AWS, encriptación E2E y modelo de amenazas de ciberseguridad.',
    status: 'Vigente',
    detectedCountry: 'Chile',
    detectedSociety: 'G81',
    detectedTypology: 'ALC',
    detectedCorrelative: '004',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    driveOrLoomUrl: 'https://www.figma.com/design/xbODVji6lRwe1Jdc5lIBeH/Global-Chat?node-id=3591-2794&p=f&t=gC20wY61xJ6UoXGk-0',
    macroprocess: 'Misional',
    subprocess: 'Mensajería Nativa y Pagos P2P Conversacionales',
    criticality: 'CRÍTICA',
    responsibleRole: 'Head Vertical B2C (Pedro Pico)',
    description: 'Especificación de producto y arquitectura técnica para Global Chat (Figma node 3591-2794): chat 1:1, envío y cobro P2P multimoneda, WebSockets en AWS API Gateway + DynamoDB, encriptación E2E (Signal/libsodium) y modelo de amenazas contra phishing y suplantación.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-08-11',
        elaboratedBy: 'Pedro Pico (Head Vertical B2C)',
        reviewedBy: 'Aliro Correa & María Gutiérrez',
        approvedBy: 'Tomas Bercovich (CEO)',
        actNumber: 'Acta Comité Producto N° 26-2026',
        changeLog: 'Aprobación del alcance Fase 1: Chat 1:1, P2P in-chat, WebSockets y E2E.',
        isCurrent: true
      }
    ]
  },

  // 18. GPE-ONE-001: One Pager del Producto - Interoperabilidad Perú (CCE)
  {
    id: 'doc-inv-018',
    code: 'GCPE-ONE-001',
    title: 'One Pager del Producto: Interoperabilidad Perú (CCE) — Pagos Inmediatos, Estrategia PaP y FAQ CX',
    ownerArea: 'Nuevos Productos',
    version: '1.0',
    lastUpdated: '2026-08-18',
    elaboratedBy: 'Benjamín Herrera (Owner de Producto) & Francisca Solar (Brand/Comms)',
    reviewedBy: 'María Camila Segura (Program Management) & Aliro Correa (CISO)',
    approvedBy: 'Comité Regional de Nuevos Productos & Tribu Perú',
    approvalDate: '2026-08-18',
    actNumber: 'Acta Comité Producto N° 28-2026',
    changeLog: 'Especificación de producto, onboarding opt-in, generación de CCI/Alias, límites PayIn/PayOut, Friend & Family y lineamientos comunicacionales.',
    status: 'Vigente',
    detectedCountry: 'Perú',
    detectedSociety: 'GCPE',
    detectedTypology: 'ONE',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Misional',
    subprocess: 'Interoperabilidad Inmediata CCE, QR y Cuentas Virtuales Perú',
    criticality: 'CRÍTICA',
    responsibleRole: 'Owner de Producto CCE (Benjamín Herrera)',
    description: 'Documento normativo de producto y referencia para CX que define la interoperabilidad de pagos en Perú (CCE): generación automática de CCI y Alias, límites por canal (CCI S/ 10k, Alias/QR S/ 500), 40 txs/día y ruta complementaria Dlocal.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-08-18',
        elaboratedBy: 'Benjamín Herrera & Francisca Solar',
        reviewedBy: 'María Camila Segura & Aliro Correa',
        approvedBy: 'Comité de Producto',
        actNumber: 'Acta Comité Producto N° 28-2026',
        changeLog: 'Aprobación del One Pager CCE Perú y cronograma de Friend & Family (18 al 25 de agosto).',
        isCurrent: true
      }
    ]
  },

  // 19. GPE-OPS-002: Mecánica Operativa - Fondeo CCE con Gmoney & BCRP
  {
    id: 'doc-inv-019',
    code: 'GCPE-OPS-002',
    title: 'Mecánica Operativa: Fondeo CCE con Gmoney — Target Balance, Prefondeo 1.7x/2.4x y Liquidación BCRP',
    ownerArea: 'Tesorería',
    version: '1.0',
    lastUpdated: '2026-08-20',
    elaboratedBy: 'Benjamín Herrera (Ops/PM) & Carlos Mendoza (Lead Ops Settlement)',
    reviewedBy: 'Diego García Lira (Head Finance) & Mauricio Oneto',
    approvedBy: 'Comité de Tesorería, Liquidez & Finanzas',
    approvalDate: '2026-08-20',
    actNumber: 'Acta Comité Tesorería N° 17-2026',
    changeLog: 'Modelado operativo del Saldo Objetivo Día (Target Balance), prefondeo 1.7x día hábil / 2.4x fin de semana en BCRP, ventana de ajuste 08:15–15:45 y cuenta BCP de Gmoney.',
    status: 'Vigente',
    detectedCountry: 'Perú',
    detectedSociety: 'GCPE',
    detectedTypology: 'OPS',
    detectedCorrelative: '002',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Misional',
    subprocess: 'Tesorería, Prefondeo BCRP y Liquidación CCE',
    criticality: 'CRÍTICA',
    responsibleRole: 'Lead Ops Settlement & Head de Tesorería',
    description: 'Documento operativo que rige las transferencias de prefondeo hacia la cuenta corriente BCP de Gmoney (193-1893518-0-42) para su ingreso al BCRP antes de las 12:00 am, control de alertas al 25% del target y dispersión en Mambu.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-08-20',
        elaboratedBy: 'Benjamín Herrera & Carlos Mendoza',
        reviewedBy: 'Diego García Lira & Mauricio Oneto',
        approvedBy: 'Comité de Tesorería',
        actNumber: 'Acta Comité Tesorería N° 17-2026',
        changeLog: 'Aprobación formal del procedimiento de prefondeo 1.7x y protocolo de emergencia con Dlocal.',
        isCurrent: true
      }
    ]
  },

  // 20. G81-ALC-005: Documento de Alcance — MCP Global66 (APIB2B(MCP))
  {
    id: 'doc-inv-020',
    code: 'G81-ALC-005',
    title: 'Documento de Alcance: MCP Global66 — Servidor Model Context Protocol sobre API Transaccional B2B',
    ownerArea: 'Nuevos Productos',
    version: '1.0',
    lastUpdated: '2026-09-02',
    elaboratedBy: 'Emiliano Cabrales (Lead Product Manager B2B)',
    reviewedBy: 'Mauricio Oneto (Software Architect) & Sebastián (Engineering)',
    approvedBy: 'Comité Regional de Nuevos Productos & Arquitectura B2B',
    approvalDate: '2026-09-02',
    actNumber: 'Acta Comité Producto N° 31-2026',
    changeLog: 'Especificación de arquitectura MCP, modelos de adopción A (humano/LLM) y B (agentes autónomos), flujo prepare/confirm, test mode en producción y controles de seguridad OAuth 2.0.',
    status: 'Vigente',
    detectedCountry: 'Regional',
    detectedSociety: 'G81',
    detectedTypology: 'ALC',
    detectedCorrelative: '005',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Misional',
    subprocess: 'API Transaccional B2B, Pagos para Agentes de IA & MCP Server',
    criticality: 'CRÍTICA',
    responsibleRole: 'Lead Product Manager B2B & Arquitectura',
    description: 'Documento normativo y de alcance técnico que define el servidor MCP de Global66: fachada conversacional sobre la API de Payouts para interacción con Claude y agentes autónomos (LangChain, OpenAI, n8n), flujo de 2 pasos pretransactions/confirm, y mitigación de riesgos de débitos reales sin sandbox.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-09-02',
        elaboratedBy: 'Emiliano Cabrales',
        reviewedBy: 'Mauricio Oneto & Sebastián',
        approvedBy: 'Comité de Producto B2B',
        actNumber: 'Acta Comité Producto N° 31-2026',
        changeLog: 'Aprobación del alcance del proyecto MCP Global66 (Fases 2 y 3: OAuth 2.0, Prepare/Confirm y Test Mode).',
        isCurrent: true
      }
    ]
  },

  // 21. G81-ALC-001: Billeteras Stablecoins 1.0
  {
    id: 'doc-inv-021',
    code: 'G81-ALC-001',
    title: 'Documento de Alcance: Billeteras Stablecoins (1.0) — Infraestructura Base, Custodia MPC Utila y Convivencia Bridge',
    ownerArea: 'Nuevos Productos',
    version: '1.0',
    lastUpdated: '2026-07-09',
    elaboratedBy: 'Maurizio Oneto & Cristóbal Valle (Lead Product Managers)',
    reviewedBy: 'Cristóbal Forno, Equipo Tech & Operaciones',
    approvedBy: 'Comité de Nuevos Productos y Tesorería',
    approvalDate: '2026-07-09',
    actNumber: 'Acta Comité Producto N° 25-2026',
    changeLog: 'Aprobación del alcance v1.0: Custodia MPC propia con partner Utila, billeteras USDC y USDT en Mambu G81, arquitectura C1-C4, Gas Station y convivencia de 30 días con Bridge.',
    status: 'Vigente',
    detectedCountry: 'Regional',
    detectedSociety: 'G81',
    detectedTypology: 'MAN',
    detectedCorrelative: '001',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Misional',
    subprocess: 'Activos Digitales, Billeteras USDT/USDC, Custodia MPC & On/Off Ramp',
    criticality: 'CRÍTICA',
    responsibleRole: 'Lead Product Manager Stablecoins & Head de Operaciones',
    description: 'Documento de alcance base que define el despliegue de infraestructura propia de stablecoins (USDT y USDC) sobre Utila con custodia MPC, billeteras en capas C1-C4, feed de CoinGecko, integración con Station 70 para Disaster Recovery, Gas Station y migración desde Bridge.',
    versionHistory: [
      {
        version: '1.0',
        date: '2026-07-09',
        elaboratedBy: 'Maurizio Oneto & Cristóbal Valle',
        reviewedBy: 'Cristóbal Forno & Operaciones',
        approvedBy: 'Comité de Nuevos Productos',
        actNumber: 'Acta Comité Producto N° 25-2026',
        changeLog: 'Definición de arquitectura de wallets C1-C4, quórums de payouts, y flujos de pay-in y pay-out.',
        isCurrent: true
      }
    ]
  },

  // 22. G81-ALC-002: Stablecoins 2.0
  {
    id: 'doc-inv-022',
    code: 'G81-ALC-002',
    title: 'Documento de Alcance: Stablecoins 2.0 — Consolidación Operacional, Yield Pasivo, Screening AML On-Chain & Tron Sponsored Transfers',
    ownerArea: 'Nuevos Productos',
    version: '2.0',
    lastUpdated: '2026-07-27',
    elaboratedBy: 'Cristóbal Valle (Product Manager)',
    reviewedBy: 'Comité de Nuevos Productos, Compliance & Tesorería',
    approvedBy: 'Comité de Producto y Riesgos Global66',
    approvalDate: '2026-07-27',
    actNumber: 'Acta Comité Producto N° 29-2026',
    changeLog: 'Especificación de v2.0: Módulo M3 (Pricing por red), M5 (Yield pasivo 2.5%-4.5% omnibus), M8 (Screening on-chain Chainalysis KYT con reglas Allow/Alert/Deny), M9 (Tron direct TRX burning) y M11 (Sucursales dedicadas para mercados regulados).',
    status: 'Vigente',
    detectedCountry: 'Regional',
    detectedSociety: 'G81',
    detectedTypology: 'MAN',
    detectedCorrelative: '002',
    isDuplicate: false,
    hasSyntaxError: false,
    isCompliant: true,
    auditIssues: [],
    macroprocess: 'Misional',
    subprocess: 'Yield Pasivo USDC/USDT, AML Blockchain Chainalysis, Pricing por Red & Expansión Regulada',
    criticality: 'CRÍTICA',
    responsibleRole: 'Product Manager Stablecoins & Compliance Officer',
    description: 'Documento de alcance de consolidación y nuevas funcionalidades: re-factor del cotizador con cobros diferenciados por red blockchain, remuneración pasiva omnibus con buffer operativo C2, screening on-chain preventivo con Chainalysis para cuarentena en C4, y sucursales segregadas en Utila para regulación.',
    versionHistory: [
      {
        version: '2.0',
        date: '2026-07-27',
        elaboratedBy: 'Cristóbal Valle',
        reviewedBy: 'Compliance & Tesorería',
        approvedBy: 'Comité de Producto',
        actNumber: 'Acta Comité Producto N° 29-2026',
        changeLog: 'Incorporación de Yield pasivo, Chainalysis KYT on-chain, re-diseño de Tron Gas y threshold_percent con decimales.',
        isCurrent: true
      }
    ]
  }
];

// MOTOR DE EXTRACCIÓN AUTOMÁTICA DE METADATOS DE PORTADAS Y TABLAS DE VERSIONES
export function parseDocumentCoverAndVersionLog(rawText: string): Partial<AuditedDocument> {
  const text = rawText || '';
  const result: Partial<AuditedDocument> = {
    versionHistory: []
  };

  // 1. Extraer Código
  const codeMatch = text.match(/(?:C[óo]digo|Code|Ref|Nomenclatura)[\s:]*([A-Za-z0-9_\-\/]+)/i) ||
                    text.match(/([A-Z]{2,4}[-_][A-Z]{3}[-_][0-9]{1,3})/i);
  if (codeMatch && codeMatch[1]) {
    result.code = codeMatch[1].trim().toUpperCase();
  }

  // 2. Extraer Título / Nombre
  const titleMatch = text.match(/(?:T[íi]tulo|Nombre|Documento|Title)[\s:]*([^\n\r]+)/i) ||
                     text.match(/(?:Procedimiento|Pol[íi]tica|Manual|Proceso)\s+de\s+([^\n\r]+)/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  // 3. Extraer Área / Proceso
  const areaMatch = text.match(/(?:Área|Area|Proceso|Departamento|Owner Area)[\s:]*([^\n\r]+)/i);
  if (areaMatch) {
    result.ownerArea = areaMatch[1].trim();
  }

  // 4. Extraer Versión
  const versionMatch = text.match(/(?:Versi[óo]n|Version|Rev)[\s:]*([Vv]?\d+(\.\d+)?)/i);
  if (versionMatch) {
    result.version = versionMatch[1].replace(/^[Vv]/, '').trim();
  }

  // 5. Extraer Elaborado por
  const elabMatch = text.match(/(?:Elaborado\s+por|Autor|Created by|Preparado\s+por)[\s:]*([^\n\r]+)/i);
  if (elabMatch) {
    result.elaboratedBy = elabMatch[1].trim();
  }

  // 6. Extraer Revisado por
  const revMatch = text.match(/(?:Revisad[oa]\s+por|Revisor|Reviewed by)[\s:]*([^\n\r]+)/i);
  if (revMatch) {
    result.reviewedBy = revMatch[1].trim();
  }

  // 7. Extraer Aprobado por
  const appMatch = text.match(/(?:Aprobad[oa]\s+por|Aprobador|Approved by)[\s:]*([^\n\r]+)/i);
  if (appMatch) {
    result.approvedBy = appMatch[1].trim();
  }

  // 8. Extraer Fecha de Aprobación
  const dateMatch = text.match(/(?:Fecha\s+de\s+Aprobaci[óo]n|Fecha\s+Vigencia|Fecha|Date)[\s:]*(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/i);
  if (dateMatch) {
    result.approvalDate = dateMatch[1].trim();
    result.lastUpdated = dateMatch[1].trim();
  }

  // 9. Extraer Número de Acta
  const actMatch = text.match(/(?:N[°º]?\s*de\s*Acta|Acta\s*N[°º]?|Acta\s*Comit[ée]|Acta\s*JD)[\s:]*([^\n\r]+)/i);
  if (actMatch) {
    result.actNumber = actMatch[1].trim();
  }

  // 10. Extraer Log de Cambios / Motivo
  const logMatch = text.match(/(?:Log\s+de\s+Cambios|Descripci[óo]n\s+del\s+Cambio|Motivo|Cambios\s+Principales)[\s:]*([^\n\r]+)/i);
  if (logMatch) {
    result.changeLog = logMatch[1].trim();
  }

  // 11. Extraer Tabla de Histórico de Versiones si viene en formato tabla o lista
  const historyLines = text.split('\n');
  const extractedVersions: DocumentVersionHistoryEntry[] = [];

  historyLines.forEach(line => {
    // Buscar patrones de versión como "v1.0 | 2025-01-01 | Autor | Descripcion"
    if (/(?:v\d+|\d+\.\d+)/i.test(line) && (line.includes('|') || line.includes(';'))) {
      const parts = line.split(/[|;]/).map(p => p.trim());
      if (parts.length >= 3) {
        extractedVersions.push({
          version: parts[0].replace(/^[Vv]/, ''),
          date: parts[1] || new Date().toISOString().split('T')[0],
          elaboratedBy: parts[2] || result.elaboratedBy || 'Equipo Operativo',
          reviewedBy: parts[3] || result.reviewedBy || '',
          approvedBy: parts[4] || result.approvedBy || 'Comité de Gobernanza',
          actNumber: parts[5] || result.actNumber || '',
          changeLog: parts[6] || parts[parts.length - 1] || 'Registro de versión cargado.',
          isCurrent: extractedVersions.length === 0
        });
      }
    }
  });

  if (extractedVersions.length > 0) {
    result.versionHistory = extractedVersions;
  }

  return result;
}
