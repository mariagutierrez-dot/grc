import { Risk, ProcessArea } from '../types';

export interface FlujoBloqueosActionPlan {
  id: string;
  riskId: string;
  riskTitle: string;
  processArea: ProcessArea;
  strategy: 'Resolved' | 'Owned' | 'Accepted' | 'Mitigated';
  responsible: string;
  targetDate: string;
  progress: number;
  tasks: string;
  status: 'Por iniciar' | 'En proceso' | 'Completado' | 'Vencido';
  budget: string;
  framework: 'SARO' | 'Continuidad' | 'SICB' | 'Fraude';
  evidences: any[];
}

export const FLUJO_BLOQUEOS_MATRIX_RISKS: Risk[] = [
  {
    id: 'R-BLQ-01',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'Flujo de Bloqueos',
    process: 'Desbloqueo Fraudulento Interno o Bypass de Restricciones sin Aprobación Dual (Maker-Checker Bypass)',
    riskDescription: 'Afectación económica, legal y reputacional ocasionada por la vulneración de credenciales administrativas o colusión interna en la mesa de ayuda para levantar bloqueos preventivos de cuentas de alto riesgo sin autorización de un segundo aprobador, que puede generar el retiro intempestivo de fondos procedentes de fraude o lavado de activos, derivando en pérdidas directas no recuperables, sanciones de la Unidad de Inteligencia Financiera y procesos judiciales contra la entidad.',
    cause: 'Carencia de segregación de funciones estricta (SoD) y falta de flujo Maker-Checker criptográfico con doble factor de autenticación (MFA) para agentes de Backoffice y Soporte en el portal administrativo.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Flujo obligatorio Maker-Checker en el Backoffice con firma electrónica y autenticación FIDO2 obligatoria para cualquier solicitud de desbloqueo de cuenta o fondos, acompañado de pista de auditoría inmutable en almacenamiento WORM.',
    documentControl: 'Política de Control de Accesos, Segregación de Funciones y Procedimiento Maker-Checker para Bloqueos/Desbloqueos Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-01-1',
        description: 'Flujo obligatorio Maker-Checker en el Backoffice con firma electrónica y autenticación FIDO2 obligatoria para cualquier solicitud de desbloqueo de cuenta o fondos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-01-2',
        description: 'Pista de auditoría inmutable en almacenamiento WORM (Write Once Read Many) con alertas automáticas al CISO y Oficial de Cumplimiento ante intentos de modificación de estado sin doble aprobación.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-BLQ-02',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Flujo de Bloqueos',
    process: 'Fuga Transaccional y Condición de Carrera en la Propagación de Bloqueos hacia Switches y Redes Adquirentes',
    riskDescription: 'Afectación económica y operativa ocasionada por la ventana de latencia (delay) en la replicación distribuida del estado de bloqueo entre el Core bancario y los procesadores adquirentes externos, que puede generar la aprobación accidental de débitos o retiros en cajeros automáticos (ATM) en transacciones concurrentes ejecutadas inmediatamente después de emitido el bloqueo, derivando en fuga de capital corporativo y descalces de liquidación.',
    cause: 'Latencia en la propagación asíncrona de eventos de bloqueo entre el microservicio central de cuentas y el switch autorizador de tarjetas (ISO 8583 / Mastercard / Visa) o la red de pagos en tiempo real.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Protocolo de propagación de bloqueo síncrono ultra-rápido mediante Webhooks prioritarios y actualización instantánea de memoria en caché distribuida Redis con TTL cero para el Switch emisor con doble verificación de bandera.',
    documentControl: 'Manual de Arquitectura Transaccional y Protocolo de Propagación de Eventos Críticos de Bloqueo Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-02-1',
        description: 'Protocolo de propagación de bloqueo síncrono ultra-rápido mediante Webhooks prioritarios y actualización instantánea de memoria en caché distribuida Redis con TTL cero para el Switch emisor.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-02-2',
        description: 'Validación de pre-autorización con doble verificación de bandera de bloqueo en el microservicio de autorización antes de confirmar la trama 0110 a la red.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-BLQ-03',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Flujo de Bloqueos',
    process: 'Gestión de Bloqueos Judiciales, Medidas Cautelares y Embargos Tributarios/Regulatorios',
    riskDescription: 'Afectación legal y regulatoria ocasionada por la tramitación deficiente o tardía de resoluciones judiciales y requerimientos de embargo preventivo de cuentas bancarias, que puede generar que el titular demandado liquide o transfiera los activos embargables antes de la ejecución de la medida cautelar, derivando en multas por desacato judicial, responsabilidad solidaria de Global66 ante acreedores y apercibimientos de la Superintendencia.',
    cause: 'Procesamiento manual de oficios judiciales y demoras en la inmovilización de fondos decretada por tribunales, fiscalías o entes recaudadores (SII, DIAN, SUNAT, AFIP).',
    impact: 5,
    probability: 2,
    suggestedControl: 'Módulo automatizado de ingesta y congelamiento cautelar con cálculo exacto de prelación de embargos y reserva atómica de fondos inmovilizados sin afectar el remanente inembargable de subsistencia.',
    documentControl: 'Procedimiento Corporativo para la Atención de Oficios Judiciales, Embargos y Medidas Cautelares Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-03-1',
        description: 'Módulo automatizado de ingesta y congelamiento cautelar con cálculo exacto de prelación de embargos y reserva atómica de fondos inmovilizados sin afectar el remanente inembargable de subsistencia.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-03-2',
        description: 'Protocolo de confirmación y respuesta judicial protocolizada en menos de 24 horas con certificación pericial de saldo inmovilizado.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-BLQ-04',
    processArea: 'Fraude',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Flujo de Bloqueos',
    process: 'Falsos Positivos Masivos en Reglas Automatizadas de Bloqueo y Parálisis de Operaciones Legítimas',
    riskDescription: 'Afectación económica, reputacional y de experiencia de usuario ocasionada por la sobre-activación de umbrales de fraude automatizados durante periodos de alta demanda transaccional (Black Friday, CyberDays, cierre de mes), que puede generar el bloqueo masivo e injustificado de cuentas y tarjetas de clientes legítimos corporativos y de retail, derivando en quiebres de SLAs, desborde del canal de soporte al cliente, pérdida de facturación y daño a la imagen corporativa.',
    cause: 'Calibración inadecuada o reglas heurísticas hiper-sensibles en el motor de prevención de fraude que disparan bloqueos preventivos globales sin granularidad transaccional.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Motor de reglas de prevención de fraude con segmentación contextual por perfil y mecanismo de challenge step-up interactivo (autenticación biométrica o Passkey en la app) con circuito de autoservicio de desbloqueo express mediante liveness PAD ISO/IEC 30107-3.',
    documentControl: 'Manual Metodológico de Calibración de Reglas de Fraude, Tratamiento de Falsos Positivos y Desbloqueo Express.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-04-1',
        description: 'Motor de reglas de prevención de fraude con segmentación contextual por perfil y mecanismo de challenge step-up interactivo (autenticación biométrica o Passkey en la app) antes de bloquear preventivamente la cuenta completa.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-04-2',
        description: 'Circuito de autoservicio de desbloqueo express en la aplicación móvil mediante validación biométrica facial liveness PAD ISO/IEC 30107-3 para falsos positivos verificados en menos de 60 segundos.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-BLQ-05',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Flujo de Bloqueos',
    process: 'Ataques de Denegación de Servicio (DoS) y Forzado Malicioso de Bloqueo por Fuerza Bruta contra Clientes Específicos',
    riskDescription: 'Afectación operativa y reputacional ocasionada por la explotación deliberada de las políticas de bloqueo por intentos fallidos de autenticación (Account Lockout DoS) mediante scripts automatizados dirigidos a cuentas VIP o empresas, que puede generar la indisponibilidad continua de acceso y paralización de pagos críticos de nómina y tesorería de los clientes afectados, derivando en quiebres de confianza y pérdida de cuentas corporativas.',
    cause: 'Ausencia de rate-limiting adaptativo por IP/dispositivo que permite a atacantes ingresar intencionalmente contraseñas o PINs erróneos para bloquear cuentas de usuarios clave.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Protección perimetral WAF Cloudflare con rate-limiting adaptativo y CAPTCHA invisible por fingerprint de dispositivo y desacoplamiento de canales de acceso para que el bloqueo web no inhabilite tarjetas ni APIs B2B.',
    documentControl: 'Estándar Corporativo de Hardening Perimetral WAF y Gestión de Políticas Anti-Account Lockout DoS.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-05-1',
        description: 'Protección perimetral WAF Cloudflare con rate-limiting adaptativo y CAPTCHA invisible por fingerprint de dispositivo que mitiga ataques antes de activar el contador de fallos de cuenta.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-05-2',
        description: 'Desacoplamiento de bloqueos: el bloqueo temporal por fuerza bruta solo inhabilita el canal web/móvil específico atacado, manteniendo activas las autorizaciones de tarjetas y APIs B2B con credenciales independientes (mTLS / API Keys).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-BLQ-06',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    product: 'Flujo de Bloqueos',
    process: 'Falta de Notificación Transparente y Oportuna al Usuario sobre Causa y Alcance del Bloqueo (Derecho del Consumidor)',
    riskDescription: 'Afectación legal y reputacional ocasionada por la omisión o ambigüedad en la notificación obligatoria a los clientes al momento de ejecutar un bloqueo preventivo o administrativo, que puede generar incertidumbre, sensación de confiscación arbitraria de fondos y denuncias colectivas ante el SERNAC / SIC / INDECOPI / Defensa del Consumidor, derivando en demandas civiles por daños y perjuicios morales y multas administrativas.',
    cause: 'Carencia de plantillas dinámicas y eventos automatizados de comunicación multicanal (Push, Email, SMS) integrados al workflow de bloqueos.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Disparador automático de notificaciones omnicanal (Push in-app + Email transaccional firmado) en milisegundos con detalle del motivo legalmente permitido, alcance del bloqueo e instrucciones claras de resolución, con SLA de atención prioritaria de 15 minutos.',
    documentControl: 'Protocolo de Comunicación Transparente y Cumplimiento Normativo de Derechos del Consumidor en Bloqueos Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-06-1',
        description: 'Disparador automático de notificaciones omnicanal (Push in-app + Email transaccional firmado) en milisegundos con detalle del motivo legalmente permitido, alcance del bloqueo (parcial o total) e instrucciones claras de resolución.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-06-2',
        description: 'Protocolo de atención prioritaria en mesa de ayuda para usuarios con bloqueos activos, con SLA máximo de primera respuesta de 15 minutos.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-BLQ-07',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Flujo de Bloqueos',
    process: 'Bloqueo Cautelar y Congelamiento Inmediato de Activos por Coincidencia en Listas Restrictivas Internacionales (OFAC / ONU)',
    riskDescription: 'Afectación legal, regulatoria y de corresponsalía bancaria ocasionada por la omisión de congelamiento inmediato de fondos al detectarse un match confirmado en listas de terrorismo o sanciones de la OFAC/ONU, que puede generar la continuidad operativa de clientes sancionados a través de transferencias transfronterizas, derivando en el cierre fulminante de cuentas corresponsales bancarias internacionales, multas millonarias del Departamento del Tesoro de EE.UU. y veto del sistema financiero global.',
    cause: 'Falla en la sincronización o retraso en las listas negras de sanciones y falta de bloqueo automático preventivo a nivel de core transaccional.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Bloqueo algorítmico instantáneo síncrono (Zero-Tolerance Automated Freeze) en el core de pagos ante confirmación de coincidencia con listas OFAC, ONU, PEPs de alto riesgo y terrorismo internacional con reporte ROS/STR inmediato.',
    documentControl: 'Manual SARLAFT / AML para Detección, Bloqueo Inmediato y Reporte de Operaciones en Listas Vinculantes Internacionales.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Compliance Officer',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-07-1',
        description: 'Bloqueo algorítmico instantáneo síncrono (Zero-Tolerance Automated Freeze) en el core de pagos ante confirmación de coincidencia con listas OFAC, ONU, PEPs de alto riesgo y terrorismo internacional.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-07-2',
        description: 'Generación y transmisión inmediata de reporte de operación sospechosa (ROS/STR) al Oficial de Cumplimiento y a la Unidad de Análisis Financiero en menos de 12 horas.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-BLQ-08',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'Flujo de Bloqueos',
    process: 'Inconsistencia de Estado entre Congelamiento Temporal (Self-Service) y Cancelación Definitiva por Robo o Extravío',
    riskDescription: 'Afectación económica y operativa ocasionada por la confusión o reactivación indebida de tarjetas marcadas por clientes como extraviadas o robadas en lugar de ser bloqueadas de manera permanente, que puede generar que terceros malintencionados que sustrajeron el plástico físico realicen cargos presenciales posteriores por contactless o banda, derivando en pérdidas financieras asumidas íntegramente por Global66 bajo responsabilidad de emisor y quejas formales ante las franquicias de tarjetas.',
    cause: 'Modelo de datos ambiguo en la API de gestión de tarjetas que no distingue técnicamente un "pausado transitorio" de un "bloqueo definitivo irrecuperable" (Lost/Stolen Status 41/43).',
    impact: 5,
    probability: 2,
    suggestedControl: 'Segregación técnica estricta en el switch emisor entre códigos de suspensión temporal (Status 01) y códigos de baja irreversible (Status 41/43) con destrucción criptográfica de tokens asociados y reemisión automática inmediata.',
    documentControl: 'Procedimiento Operativo de Gestión de Ciclo de Vida de Tarjetas, Bloqueos Temporales y Denuncias de Extravío/Robo.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-BLQ-08-1',
        description: 'Segregación técnica estricta en el switch emisor entre códigos de suspensión temporal (Status 01 - Cardholder Suspended) y códigos de baja irreversible (Status 41/43 - Lost/Stolen) con destrucción criptográfica de tokens asociados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-BLQ-08-2',
        description: 'Reemisión automática y gratuita de una nueva tarjeta virtual instantánea con nuevo PAN y CVV al confirmar bloqueo definitivo por robo o extravío, mitigando el impacto en el cliente.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 0
      }
    ]
  }
];

export const FLUJO_BLOQUEOS_ACTION_PLANS: FlujoBloqueosActionPlan[] = [
  {
    id: 'PLN-TR-BLQ-001',
    riskId: 'R-BLQ-01',
    riskTitle: 'Implementación de Flujo Maker-Checker con Firma Criptográfica FIDO2 en Backoffice',
    processArea: 'Ciberseguridad',
    strategy: 'Mitigated',
    responsible: 'CISO / Head de Ciberseguridad',
    targetDate: '2026-10-31',
    progress: 40,
    tasks: 'Desplegar aprobación dual obligatoria para desbloqueo de fondos y cuentas con firma electrónica FIDO2 y logs inmutables en WORM.',
    status: 'En proceso',
    budget: '$10,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-002',
    riskId: 'R-BLQ-02',
    riskTitle: 'Optimización de Replicación Síncrona de Bloqueos en Redis con TTL Cero para Switch ISO 8583',
    processArea: 'TI',
    strategy: 'Mitigated',
    responsible: 'Head de TI',
    targetDate: '2026-09-30',
    progress: 55,
    tasks: 'Configurar Webhooks prioritarios de bloqueo en tiempo real hacia autorizadores y caché distribuida con latencia < 10ms.',
    status: 'En proceso',
    budget: '$8,200 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-003',
    riskId: 'R-BLQ-03',
    riskTitle: 'Módulo Automatizado de Congelamiento Cautelar y Gestión de Oficios de Embargo Judicial',
    processArea: 'Cumplimiento',
    strategy: 'Mitigated',
    responsible: 'Compliance Officer',
    targetDate: '2026-10-15',
    progress: 45,
    tasks: 'Desarrollar motor de prelación de embargos judiciales y reserva atómica de saldo con certificación automática para tribunales.',
    status: 'En proceso',
    budget: '$7,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-004',
    riskId: 'R-BLQ-04',
    riskTitle: 'Calibración de Reglas Heurísticas y Desbloqueo Express Biométrico PAD ISO 30107-3',
    processArea: 'Fraude',
    strategy: 'Mitigated',
    responsible: 'Head de Prevención de Fraude',
    targetDate: '2026-11-15',
    progress: 50,
    tasks: 'Ajustar umbrales dinámicos de fraude y desplegar flujo de autoservicio biométrico en la app para falsos positivos en < 60 seg.',
    status: 'En proceso',
    budget: '$9,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-005',
    riskId: 'R-BLQ-05',
    riskTitle: 'Desacoplamiento de Canales de Acceso y Blindaje WAF Rate-Limiting Anti Account-Lockout DoS',
    processArea: 'Ciberseguridad',
    strategy: 'Mitigated',
    responsible: 'CISO / Head de Ciberseguridad',
    targetDate: '2026-10-31',
    progress: 60,
    tasks: 'Integrar Cloudflare WAF adaptativo por device fingerprint y aislar credenciales de acceso web de tokens de tarjetas y APIs B2B.',
    status: 'En proceso',
    budget: '$6,800 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-006',
    riskId: 'R-BLQ-06',
    riskTitle: 'Orquestador de Notificaciones Omnicanal en Milisegundos y SLA Prioritario de Mesa de Ayuda',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-09-30',
    progress: 65,
    tasks: 'Desplegar notificaciones Push/Email automáticas con causa y pasos de desbloqueo, con cola prioritaria en Zendesk/Hubspot SLA < 15 min.',
    status: 'En proceso',
    budget: '$5,400 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-007',
    riskId: 'R-BLQ-07',
    riskTitle: 'Protocolo de Congelamiento Automatizado Zero-Tolerance para Sanciones OFAC/ONU y Reporte ROS',
    processArea: 'Cumplimiento',
    strategy: 'Resolved',
    responsible: 'Compliance Officer',
    targetDate: '2026-08-31',
    progress: 100,
    tasks: 'Implementar congelamiento síncrono automático en core transaccional ante coincidencias confirmadas en listas OFAC/ONU con reporte a la UAF.',
    status: 'Completado',
    budget: '$11,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-BLQ-008',
    riskId: 'R-BLQ-08',
    riskTitle: 'Segregación Técnica de Estados de Tarjeta (Pausa vs Lost/Stolen 41/43) y Reemisión Automática',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-10-31',
    progress: 70,
    tasks: 'Refactorizar API de tarjetas para diferenciar Status 01 de Status 41/43 con reemisión virtual automática e inmediata al cliente.',
    status: 'En proceso',
    budget: '$6,500 USD',
    framework: 'SARO',
    evidences: []
  }
];
