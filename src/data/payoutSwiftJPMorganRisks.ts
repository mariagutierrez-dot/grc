import { Risk, ProcessArea } from '../types';

export interface PayoutSwiftJPMorganActionPlan {
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
  framework: 'ISO 31000' | 'SARO' | 'Continuidad' | 'SICB' | 'Fraude';
  evidences: any[];
}

export const PAYOUT_SWIFT_JPMORGAN_MATRIX_RISKS: Risk[] = [
  // 1. RIESGO SISTÉMICO DE PÉRDIDA DE CORRESPONSALÍA JPMORGAN (COMPLIANCE RELIANT)
  {
    id: 'R-JPM-01',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Legal',
    origin: 'Externo',
    product: 'Payout Swift JPMorgan',
    process: 'Debida Diligencia de Clientes y Enrutamiento de Payouts SWIFT Internacionales',
    riskDescription: 'Pérdida irreversible de la corresponsalía bancaria en EE.UU., cierre unilateral de cuentas nostro/vostro y parálisis de la tesorería corporativa de Global66 ocasionada por el procesamiento inadvertido de remesas SWIFT de clientes institucionales de alto riesgo ("High Risk") o entidades con sanciones internacionales en el canal de JPMorgan, derivando en congelamiento de fondos globales, rescisión de licencias operativas y contingencias sancionatorias de reguladores estadounidenses (OFAC / FinCEN).',
    cause: 'Incapacidad del motor de ruteo actual para discriminar el canal de payout según el perfil de riesgo del cliente ("Refactor de Rutas" no implementado), sumado al modelo "compliance reliant" impuesto por JPMorgan donde el banco delega el 100% del screening en Global66 sin aplicar filtros preventivos previos al procesamiento.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Implementación de filtro de bloqueo duro en el servicio de creación de transferencias que impida seleccionar el partner SWIFT_JPM para clientes institucionales o cuentas catalogadas como High Risk, complementado con screening dual obligatorio de Customer (DNI, Nombre, Dirección, Nacionalidad) y Beneficiario contra listas OFAC/Regcheq/Inspektor antes de autorizar el débito.',
    documentControl: 'Documento de Alcance: Parte VII (Validación de listas negras) y Business Case: Sección Políticas de Compliance.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Cumplimiento Regional & Head of Compliance',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 5,
    procesos: 5,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-JPM-01-1',
        description: 'Regla de negocio en backend que bloquea la ruta SWIFT_JPM para cualquier cliente categorizado como institucional o High Risk, forzando su desvío hacia canales alternativos con intermediación previa.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-JPM-01-2',
        description: 'Motor de screening síncrono en creación de pago que valida campos de Customer (DNI, Nombre/Razón Social, Dirección, Nacionalidad) contra listas OFAC, PEP, GAFI y listas restrictivas vinculantes de Regcheq e Inspektor.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 2. VULNERABILIDAD DE ARCHIVOS BATCH EN TRÁNSITO H2H (SFTP / PGP)
  {
    id: 'R-JPM-02',
    processArea: 'Seguridad de la Información',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Payout Swift JPMorgan',
    process: 'Construcción, Cifrado PGP y Transmisión de Archivos de Pago Batch (MFT/SFTP)',
    riskDescription: 'Intercepción maliciosa, inyección de pagos no autorizados, alteración de cuentas de abono o robo de datos bancarios de clientes en los archivos batch XML ISO 20022 (pain.001.001.03) durante el ciclo de intercambio Host-to-Host (H2H), ocasionando desvío fraudulento de fondos en la Reserva Federal (Fedwire/CHIPS), transferencias erróneas irreversibles y multas por brechas de datos financieros confidenciales.',
    cause: 'Arquitectura de integración asíncrona basada en generación de archivos en directorios locales mediante cron jobs periódicos; riesgo de compromiso de llaves privadas PGP o credenciales SSH si se almacenan sin protección criptográfica en servidores de aplicación; falta de firma digital de integridad por lote.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Doble capa de seguridad criptográfica obligatoria: cifrado PGP de datos con llaves asimétricas administradas en AWS KMS / HSM y transporte seguro sobre SFTP con mTLS; generación de hash SHA-256 por archivo para verificación de integridad antes del envío y automatización 100% sin acceso interactivo humano.',
    documentControl: 'Documento de Alcance: Parte II (Conexión y Encriptación PGP) y Business Case: Flujo A.3 (Construcción del Archivo Seguro).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Chief Information Security Officer (CISO) & Tech Lead Infraestructura',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 5,
    procesos: 4,
    reputacional: 5,
    legal: 4,
    associatedControls: [
      {
        id: 'C-JPM-02-1',
        description: 'Cifrado de extremo a extremo con Symantec PGP / OpenPGP v9.9 utilizando llaves de 4096 bits custodiadas en módulo de seguridad de hardware (HSM/KMS) con rotación semestral de certificados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-JPM-02-2',
        description: 'Validación de integridad HMAC/SHA-256 generada previo al depósito en el servidor MFT de JPMorgan y conciliación síncrona de lotes mediante endpoints REST de consulta de archivos.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 3. FILTRACIÓN DE FONDOS A PAÍSES PROHIBIDOS O SANCIONADOS VÍA GLOSA LIBRE
  {
    id: 'R-JPM-03',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Operaciones',
    origin: 'Externo',
    product: 'Payout Swift JPMorgan',
    process: 'Ingesta de Glosa de Pago (Remittance Information) y Validación de Países Prohibidos',
    riskDescription: 'Envío inadvertido de pagos a jurisdicciones bajo régimen de embargo internacional (Cuba, Irán, Corea del Norte, Siria, Myanmar, Crimea, Donetsk, Lugansk) o a personas sancionadas camufladas en el campo de texto libre de la glosa ("Remittance Information"), ocasionando el bloqueo y confiscación de fondos por bancos corresponsales estadounidenses, sanciones civiles de OFAC y apertura de sumarios regulatorios internacionales.',
    cause: 'Habilitación de campo comentario libre para invoices o fondeo de brokers sin filtrado semántico exhaustivo; listado de países prohibidos mantenido en código fuente (hardcoded) en lugar de una base de datos centralizada con administración en tiempo real; dependencia de servicios externos (Iban.com) sujetos a posibles desfases de actualización.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Sanitización y análisis lingüístico/semántico automático del campo glosa mediante motor Regcheq/NLP contra palabras clave de alto riesgo antes de permitir el batching; migración del listado de países prohibidos a tabla centralizada en base de datos con control de versiones y auditoría continua.',
    documentControl: 'Documento de Alcance: Parte IV (Glosa) y Parte VII (Países Prohibidos: Cuba, Irán, Corea del Norte, Siria, etc.).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of Compliance & Lead Product Manager Payouts',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-JPM-03-1',
        description: 'Screening automatizado de la glosa de remesa contra el diccionario de listas negras y palabras clave de riesgo (OFAC/Regcheq) con detención inmediata del flujo ante cualquier coincidencia.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-JPM-03-2',
        description: 'Módulo de administración centralizado en base de datos para la gestión en tiempo real de países prohibidos y listas vinculantes con validación en dos pasos (Maker-Checker).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 4. DESCALCE FINANCIERO Y PÉRDIDA DE RENTABILIDAD POR FX E IVA LOCAL
  {
    id: 'R-JPM-04',
    processArea: 'Finanzas',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Payout Swift JPMorgan',
    process: 'Fondeo de Cuentas Nostro, Cobertura Cambiaria USD y Liquidación de Payouts',
    riskDescription: 'Erosión del margen comercial y pérdida financiera recurrente estimada en más de $2.500 USD mensuales (~$30.000 USD anuales) al procesar pagos SWIFT con JPMorgan, derivado de absorber un sobrecosto de 0,35 centavos por dólar al comprar divisas con JPM en lugar de Banco BICE, sumado al impacto fiscal del 19% de IVA facturado a la sociedad local Global81 SpA en Chile sin capacidad de cobro neto en EE.UU.',
    cause: 'Diferencial de precios cambiarios entre bancos de plaza local (BICE a 5 centavos/USD) y la mesa de dinero de JPMorgan; facturación del fee transaccional ($13 USD + IVA = $15.47 USD) radicada en Chile en lugar de facturarse desde la matriz en NY; falta de protocolo de fondeo anticipado de la cuenta de SWIFT.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Establecimiento de procedimiento operativo formal de tesorería para realizar la compra de dólares (FX) con Banco BICE a tarifa preferencial y fondear la cuenta SWIFT de JPM antes del horario de corte diario; renegociación comercial con JPMorgan para migrar la facturación a la entidad estadounidense exenta de IVA.',
    documentControl: 'Business Case: Tabla 5 (Aumento de costos por FX), Tabla 6 (Neteo costos) y Nota [ab]-[af] (Definición de fondeo BICE).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Chief Financial Officer (CFO) & Head of Treasury',
    residualImpact: 2,
    residualProbability: 2,
    financiero: 4,
    procesos: 3,
    reputacional: 2,
    legal: 2,
    associatedControls: [
      {
        id: 'C-JPM-04-1',
        description: 'Protocolo de tesorería para ejecución de FX con Banco BICE a costo de 5 centavos por dólar y transferencia inmediata hacia la cuenta nostro de JPM para garantizar saldo suficiente.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-JPM-04-2',
        description: 'Gestión con la oficina de JPMorgan New York para evaluar esquema de facturación internacional sin IVA para Global66.',
        type: 'Correctivo',
        efficiency: 'Bueno',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 5. ASINCRONÍA Y PÉRDIDA DE TRAZABILIDAD EN CICLO DE VIDA DE REMESAS Y CASHCALLS
  {
    id: 'R-JPM-05',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Payout Swift JPMorgan',
    process: 'Gestión de Estados de Remesas, Cashcalls y Conciliación Automatizada con Mambu',
    riskDescription: 'Descuadre en saldos contables, demoras no justificadas en la devolución de fondos al wallet ante pagos rechazados en bancos de destino y discrepancias en auditoría de cashcalls, ocasionado por fallas en la sincronización asíncrona de reportes MFT con el core bancario (Mambu), generando reclamos de clientes B2B/B2C y descalce en la conciliación diaria.',
    cause: 'Cambio de paradigma técnico desde un modelo síncrono por API en tiempo real (NIUM) a un flujo asíncrono batch cada 5 minutos; falta de vinculación del ID de transacción de JPM con el identificador de remesa (End to End Identification) en la cartola descargable.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Mapeo estricto del ciclo de estados (DATOS_VERIFICADOS -> TRANSFERENCIA_ENVIADA -> TRANSFERENCIA_EXITOSA / DEVUELTO con cashcall PENDING -> RELEASED -> PAID / REJECTED); persistencia mandatoria del End to End Identification en Mambu y cashcalls según el estándar corporativo de conciliaciones.',
    documentControl: 'Documento de Alcance: Parte V (Manejo de estados) y Parte VIII (Conciliación con Mambu y Cartola).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Conciliaciones & Tech Lead Core Bancario',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-JPM-05-1',
        description: 'Conciliación automatizada tripartita que vincula el End to End ID generado en pain.001 con el movimiento en Mambu, el Cashcall y la cartola bancaria descargada de JPM.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-JPM-05-2',
        description: 'Servicio de polling y parser de reportes de estatus MFT con actualización automática de estados de remesa y restitución síncrona de fondos al wallet ante pagos devueltos.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 6. INCUMPLIMIENTO DE SLA T+0 POR CAÍDAS MFT O HORARIOS DE CORTE FEDWIRE (16:00 EST)
  {
    id: 'R-JPM-06',
    processArea: 'Continuidad',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Payout Swift JPMorgan',
    process: 'Procesamiento de Lotes y Cumplimiento de Horarios de Corte de la Reserva Federal',
    riskDescription: 'Incumplimiento de los tiempos de pago ofrecidos en T+0, acumulación de transferencias encoladas durante la noche y reclamos masivos por fondos retenidos, ocasionado por la caída de los servidores SFTP/HTTPS de JPMorgan, demoras en la ejecución de crons o ingreso de órdenes posterior a la hora de corte de Fedwire/CHIPS (16:00 EST).',
    cause: 'Complejidad técnica de la infraestructura MFT de JPM ("documentación deficiente"); dependencia de ventanas operativas estrictas de la Reserva Federal; ausencia de mecanismo de conmutación por error (failover) automático que desvíe pagos críticos a NIUM.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Monitoreo activo de disponibilidad del servidor MFT con telemetría en tiempo real; optimización del cron de lotes a intervalos de 5 minutos asegurando corte preventivo a las 15:30 EST; protocolo de contingencia operativo que active a NIUM como partner de respaldo ante degradaciones superiores a 15 minutos.',
    documentControl: 'Documento de Alcance: Parte III (Tiempos T+0 y Cut-off 16:00 EST) y Business Case: Nota [d]-[f] (Mantener activo a Nium).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of Operations Success & Tech Lead Integraciones',
    residualImpact: 2,
    residualProbability: 2,
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-JPM-06-1',
        description: 'Monitor sintético de conectividad y latencia hacia los servidores MFT (Producción y CAT) con alertas tempranas y suspensión preventiva de la ruta previo al corte de las 16:00 EST.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-JPM-06-2',
        description: 'Circuito de contingencia ("Circuit Breaker") que conmuta automáticamente las órdenes pendientes hacia NIUM si la pasarela JPM no responde en un plazo de 15 minutos.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },

  // 7. RECHAZOS Y DEVOLUCIONES POR DISCREPANCIAS EN FORMATO ISO 20022 PACS.008 Y ULTIMATE DEBTOR
  {
    id: 'R-JPM-07',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Payout Swift JPMorgan',
    process: 'Formateo de Archivos XML pain.001 y Emisión de Comprobantes pacs.008',
    riskDescription: 'Rechazo de transferencias en bancos corresponsales o bancos receptores en destino (ej. Hong Kong, Europa, China) debido a inconsistencias en la estructura XML bajo la norma ISO 20022 o por omisión de datos obligatorios del ordenante real ("Ultimate Debtor"), generando cobros de comisiones de devolución por parte de terceros y pérdida del comprobante oficial.',
    cause: 'Curva de aprendizaje en la transición de estándares legacy MT103 hacia ISO 20022 (pain.001/pacs.008); validaciones incompletas de caracteres especiales en nombres/direcciones de clientes; falta de estandarización en la guía técnica del partner.',
    impact: 3,
    probability: 3,
    suggestedControl: 'Ejecución rigurosa de un set especial de pruebas en ambiente CAT con los equipos de Operaciones y QA; validador de esquemas XML (XSD) integrado en backend que impida despachar archivos con errores de sintaxis o campos faltantes del Ultimate Debtor.',
    documentControl: 'Documento de Alcance: Parte III (Estructura XML) y Parte IX (Set especial de pruebas con Diego Castro y Juan Esteban Deossa).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Tech Lead Backend & QA Lead Regional',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 2,
    procesos: 3,
    reputacional: 2,
    legal: 2,
    associatedControls: [
      {
        id: 'C-JPM-07-1',
        description: 'Validador estricto de sintaxis y esquemas XSD ISO 20022 previo a la firma PGP, verificando integridad de Initiating Party, Debtor, Ultimate Debtor, Creditor y Remittance Info.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-JPM-07-2',
        description: 'Matriz de pruebas funcionales en ambiente CAT de JPMorgan validando entrega de comprobante pacs.008 con nombre legítimo del cliente ordenante antes del paso a producción.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 8. MANIPULACIÓN DIRECTA DE DATOS DE PAGO EN BASE DE DATOS PREVIA AL ENVÍO
  {
    id: 'R-JPM-08',
    processArea: 'Seguridad de la Información',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    product: 'Payout Swift JPMorgan',
    process: 'Control de Integridad en Liberación de Pagos y Acceso a Base de Datos de Producción',
    riskDescription: 'Evasión maliciosa de los filtros de listas negras o desvío de remesas mediante la edición directa no autorizada por base de datos de campos críticos de pago (código BIC/Swift, banco o país de destino) una vez superado el screening inicial, permitiendo la salida de pagos ilícitos a través de la cuenta de JPMorgan.',
    cause: 'Ausencia de verificación criptográfica de integridad entre la etapa de screening y la etapa de liberación final del batch; existencia de privilegios de escritura en tablas operativas de producción sin control Maker-Checker.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Implementación del nuevo control mandatorio en la fase de liberación de pagos que re-valide el BIC, banco y país de destino; generación de firma hash del registro en creación para alertar sobre cualquier discrepancia previa al depósito en el SFTP.',
    documentControl: 'Documento de Alcance: Parte VII.4 (Nuevo control en liberación de pagos).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO & Lead Database Administrator',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 4,
    legal: 4,
    associatedControls: [
      {
        id: 'C-JPM-08-1',
        description: 'Control de integridad en liberación de pagos que re-screenea el código BIC/Swift, banco y país de destino inmediatamente antes de generar el archivo XML batch pain.001.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-JPM-08-2',
        description: 'Auditoría de logs inmutables con alertas de ciberseguridad ante cualquier sentencia UPDATE o modificación manual directa sobre las tablas de remesas y providers.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 9. DEPENDENCIA DE PROVEEDOR Y DESCONFIGURACIÓN DEL SWITCH STP
  {
    id: 'R-JPM-09',
    processArea: 'Estratégico',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Payout Swift JPMorgan',
    process: 'Configuración del Proveedor en Modelo de Datos y Control de Enrutamiento STP',
    riskDescription: 'Liberación descontrolada de remesas sin supervisión operativa hacia JPMorgan debido a la activación accidental del procesamiento directo (STP encendido) en la tabla provider, derivando en fallos masivos de procesamiento, desajustes en el fondeo y colapso de la operación durante la fase de lanzamiento.',
    cause: 'Parámetros de configuración del nuevo partner (código SWIFT_JPM) alterados sin procedimiento de gestión de cambios formal; falta de verificación en el despliegue del flag STP.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Configuración estricta en base de datos con STP apagado por defecto para el provider SWIFT_JPM; validación automatizada en CI/CD que bloquee la activación de STP sin autorización explícita del Comité de Operaciones y Riesgo.',
    documentControl: 'Documento de Alcance: Parte I (Dar de alta el nuevo partner con STP apagado).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of Operations & Lead Backend Engineer',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 3,
    reputacional: 2,
    legal: 2,
    associatedControls: [
      {
        id: 'C-JPM-09-1',
        description: 'Bloqueo a nivel de esquema en base de datos que fuerza el flag is_stp_enabled = false para el registro SWIFT_JPM durante toda la marcha blanca.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  }
];

export const PAYOUT_SWIFT_JPMORGAN_ACTION_PLANS: PayoutSwiftJPMorganActionPlan[] = [
  {
    id: 'ACT-JPM-01',
    riskId: 'R-JPM-01',
    riskTitle: 'Riesgo Sistémico de Pérdida de Corresponsalía JPMorgan por Clientes High Risk',
    processArea: 'Cumplimiento',
    strategy: 'Mitigated',
    responsible: 'María Gutiérrez (Oficial de Cumplimiento) / Valeria Rojas',
    targetDate: '2026-10-25',
    progress: 40,
    tasks: 'Desplegar regla de exclusión estricta para clientes institucionales High Risk en el cotizador e integrar screening de Customer (DNI, Nombre, Dirección, Nacionalidad) con Regcheq/Inspektor.',
    status: 'En proceso',
    budget: '5,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'ACT-JPM-02',
    riskId: 'R-JPM-02',
    riskTitle: 'Vulnerabilidad de Archivos Batch XML en Canal Host-to-Host (SFTP / PGP)',
    processArea: 'Seguridad de la Información',
    strategy: 'Mitigated',
    responsible: 'Aliro Correa (CISO) / Alejandro Delgadillo',
    targetDate: '2026-10-30',
    progress: 35,
    tasks: 'Implementar cifrado PGP de doble capa con almacenamiento de llaves privadas en AWS KMS y automatización completa de scripts de transferencia sin acceso interactivo humano.',
    status: 'En proceso',
    budget: '8,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'ACT-JPM-03',
    riskId: 'R-JPM-04',
    riskTitle: 'Descalce Financiero por Sobrecosto FX con JPM e Impacto de IVA Local en Global81',
    processArea: 'Finanzas',
    strategy: 'Owned',
    responsible: 'Juan Garnham / Tomás Lira / Diego García Lira',
    targetDate: '2026-10-20',
    progress: 50,
    tasks: 'Establecer procedimiento operativo diario para comprar dólares con Banco BICE a 5 centavos/USD y fondear cuenta SWIFT de JPM antes de las 15:30 EST; negociar facturación NY exenta de IVA.',
    status: 'En proceso',
    budget: '0 USD (Recursos internos)',
    framework: 'Continuidad',
    evidences: []
  },
  {
    id: 'ACT-JPM-04',
    riskId: 'R-JPM-07',
    riskTitle: 'Validación en Ambiente CAT y Emisión de Comprobantes Oficiales pacs.008',
    processArea: 'Operaciones',
    strategy: 'Resolved',
    responsible: 'Diego Castro / Juan Esteban Deossa / Francisco Garri',
    targetDate: '2026-11-05',
    progress: 25,
    tasks: 'Ejecutar set especial de pruebas en ambiente CAT con JPM para validar esquema ISO 20022 pain.001, comprobante pacs.008 con nombre legítimo del cliente y control de países prohibidos.',
    status: 'En proceso',
    budget: '3,000 USD',
    framework: 'SICB',
    evidences: []
  }
];
