import { Risk, ProcessArea } from '../types';

export interface AdquirenciaGlobalActionPlan {
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

export const ADQUIRENCIA_GLOBAL_MATRIX_RISKS: Risk[] = [
  {
    id: 'R-ADQ-01',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Ingesta y Notificación de Depósitos B2B (Webhooks & Callbacks Bancarios)',
    riskDescription: 'Afectación económica y operativa ocasionada por la desincronización o entrega duplicada de webhooks y callbacks bancarios en pasarelas adquirentes (Falla de Idempotencia en Pay-In), que puede generar doble acreditación de fondos en billeteras corporativas o depósitos huérfanos sin abonar, derivando en pérdidas directas por retiros no fondeados, reclamos masivos de clientes B2B y descalce en el balance corporativo de Global66.',
    cause: 'Ausencia de clave de idempotencia transaccional única obligatoria (Idempotency-Key UUIDv4) entre la pasarela adquirente y los switches bancarios locales (ej. PSE, SPEI, TEF), sumado a reintentos asíncronos concurrentes de red tras timeouts HTTP en el checkout B2B.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Verificación síncrona de clave de idempotencia única con hash de payload en Redis Enterprise de baja latencia y mecanismo de reconciliación asíncrona de callbacks con lock distribuido por ID de depósito antes de liberar saldo.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Pantalla de Confirmación y Notificación de Depósito.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones & Tech Lead Adquirencia',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 5,
    procesos: 4,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-ADQ-01-1',
        description: 'Validación síncrona de clave de idempotencia obligatoria en cabecera HTTP con TTL de 24 horas en Redis para descartar solicitudes duplicadas de abono.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-01-2',
        description: 'Bloqueo pesimista por ID de orden de depósito en el Core Ledger con confirmación de doble vía antes de cambiar el estado de la transacción a Acreditado.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ADQ-02',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Nuevos Productos',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Verificación de Titularidad y Prevención de Third-Party Pay-In (AML/SARLAFT)',
    riskDescription: 'Afectación legal, regulatoria y reputacional ocasionada por la recepción de depósitos corporativos desde cuentas bancarias de terceros no registradas ni asociadas a la empresa cliente (Third-Party Pay-In Fraud), que puede generar la ingesta de fondos ilícitos o triangulación financiera eludiendo la trazabilidad del beneficiario final (UBO), derivando en sanciones de reguladores (CMF, SFC, BCRA), congelamiento de cuentas recolectoras y rescisión de contratos por corresponsales bancarios.',
    cause: 'Falta de validación algorítmica obligatoria en tiempo real entre el RUT/NIT/CUIT del ordenante bancario contra la razón social y estructura societaria verificada de la empresa cliente en Global66 durante el flujo de depósito de dinero B2B.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Módulo de matching algorítmico estricto de titularidad tributaria que bloquee depósitos de terceros no habilitados y canalice automáticamente los fondos a una cuenta de custodia temporal para devolución obligatoria.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Modal de Selección de Cuenta Bancaria y Validación de Razón Social.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Cumplimiento / Head de AML',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-ADQ-02-1',
        description: 'Validación automatizada del ID fiscal del emisor de la transferencia bancaria contra el padrón UBO verificado de la empresa previa a la acreditación.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-02-2',
        description: 'Flujo de rechazo automático y reversión obligatoria a cuenta de origen para transferencias que no provengan de cuentas bancarias corporativas autorizadas.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ADQ-03',
    processArea: 'Fraude',
    secondaryProcessArea: 'Operaciones',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Carga y Procesamiento de Comprobantes de Transferencia Bancaria (Voucher Upload & OCR)',
    riskDescription: 'Afectación económica y de confianza corporativa ocasionada por la carga de comprobantes de transferencia bancaria adulterados o reutilizados en el flujo de depósito B2B (Voucher Forgery & Replay Attack), que puede generar la acreditación ficticia de fondos sin respaldo real en las cuentas bancarias recolectoras, derivando en fraudes por apropiación indebida de saldos y quiebre en la conciliación diaria.',
    cause: 'Manipulación gráfica de comprobantes en PDF/imagen (Photoshop, edición de campos de monto, alteración del número de referencia bancaria) subidos en la sección "Upload Proof" sin cotejo forense algorítmico contra la cartola bancaria en tiempo real.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Motor OCR con análisis forense de imágenes (detección de fuentes y niveles de compresión ELA) integrado con consulta síncrona de la referencia en el extracto bancario oficial previo a la acreditación.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Pantalla de Carga de Comprobante / Voucher de Transferencia.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 3,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-ADQ-03-1',
        description: 'Motor de visión artificial y OCR con análisis de metadatos EXIF y detección de alteraciones en fuentes tipográficas de los comprobantes adjuntos.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-03-2',
        description: 'Regla de negocio de comprobante único: hash criptográfico SHA-256 de la imagen y número de transacción bancaria indexados para impedir comprobantes reutilizados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ADQ-04',
    processArea: 'Mesa de Dinero',
    secondaryProcessArea: 'Tesorería',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Mesa de Dinero y Fijación de Cotización Spot en Depósitos Multidivisa B2B (FX Slippage)',
    riskDescription: 'Afectación financiera en el margen de rentabilidad corporativa ocasionada por la fijación de tasas de cambio spot garantizadas con ventanas de validez prolongadas en depósitos B2B multidivisa (FX Slippage en Fondeo Asíncrono), que puede generar descalces cambiarios ante fluctuaciones bruscas de mercado antes de que se liquide la transferencia bancaria local, derivando en pérdidas absorbidas íntegramente por Global66.',
    cause: 'Ventana de congelamiento de tipo de cambio superior a 15 minutos en el checkout de depósito sin micro-cobertura automática en tesorería, expuesta a la demora típica de compensación bancaria ACH o interbancaria de alto valor.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Ventana dinámica de cotización garantizada limitada a 15 minutos con recálculo automático de tasa spot si el depósito bancario ingresa fuera de plazo, complementado con cobertura cambiaria automática (Auto-Hedging) en Mesa de Dinero.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Pantalla de Cotización de Divisas y Comisiones FX.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de Mesa de Dinero & Tesorería',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 2,
    reputacional: 2,
    legal: 1,
    associatedControls: [
      {
        id: 'C-ADQ-04-1',
        description: 'Temporizador estricto de 15 minutos para la tasa congelada con aviso visual al usuario corporativo y ajuste a precio de mercado si la transferencia supera la ventana.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-04-2',
        description: 'Auto-hedging síncrono con proveedores de liquidez mayorista (LPs) al confirmarse la intención de depósito multidivisa para neutralizar la exposición cambial.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ADQ-05',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'Adquirencia Global',
    process: 'Gobernanza de Aprobaciones Corporativas B2B (Flujo Maker-Checker / Dual Control)',
    riskDescription: 'Afectación económica y de seguridad de la información ocasionada por la ejecución desatendida de depósitos masivos o débitos corporativos por credenciales comprometidas de un único operador (Account Takeover B2B), que puede generar desvío de capital empresarial o abonos hacia cuentas puente no autorizadas, derivando en disputas comerciales severas, litigios judiciales y daño reputacional de la plataforma adquirente.',
    cause: 'Falta de obligatoriedad del esquema de doble aprobación (Maker-Checker / Principio de 4 Ojos) en cuentas corporativas para la asociación de nuevas cuentas bancarias de recaudo o para órdenes de fondeo de alto importe.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Implementación del flujo de aprobación dual (Maker-Checker) en el portal corporativo para depósitos o cobros superiores a USD 5,000, requiriendo firma criptográfica y MFA por hardware/FIDO2 del Representante Legal.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Pantalla de Aprobación Pendiente y Permisos Corporativos.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-ADQ-05-1',
        description: 'Flujo de aprobación dual (Maker-Checker) mandatorio en el Backoffice y Front B2B para órdenes de depósito o fondeo superiores al umbral institucional.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-05-2',
        description: 'Paso obligatorio por autenticación multifactor biométrica o token WebAuthn/FIDO2 para autorizar la liberación de fondos o modificación de cuentas bancarias.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-ADQ-06',
    processArea: 'TI',
    secondaryProcessArea: 'Operaciones',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Resiliencia y Disponibilidad de Pasarelas Adquirentes Locales (Pay-In Failover & Circuit Breaker)',
    riskDescription: 'Afectación operativa y quiebre de acuerdos de nivel de servicio (SLAs) ocasionada por la interrupción imprevista de switches o pasarelas de pago bancarias locales durante horas pico de recaudación empresarial (Downtime de Rails de Pago), que puede generar imposibilidad de que las empresas clientes completen sus transferencias de capital operativo, derivando en pérdidas de volumen procesado (TPV) y migración de clientes a la competencia.',
    cause: 'Monocanalidad o dependencia exclusiva de un único proveedor adquirente por jurisdicción (ej. Transbank/Khipu en Chile, PSE en Colombia, SPEI en México) sin mecanismo de conmutación automática de contingencia (Circuit Breaker Failover).',
    impact: 4,
    probability: 3,
    suggestedControl: 'Arquitectura de enrutamiento inteligente multi-pasarela (Smart Routing Engine) que evalúe latencias y tasas de error en tiempo real, redirigiendo automáticamente el tráfico transaccional hacia el canal alternativo ante degradación del proveedor principal.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Selección de Red Bancaria y Estado de Conectividad.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'VP de Infraestructura & Cloud Reliability',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 4,
    legal: 2,
    associatedControls: [
      {
        id: 'C-ADQ-06-1',
        description: 'Enrutador inteligente multi-pasarela con circuit breaker que conmuta automáticamente al proveedor secundario si la tasa de error 5xx supera el 3% en 60 segundos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-06-2',
        description: 'Monitoreo sintético 24/7 de disponibilidad de canales bancarios con alertas automatizadas a guardia de ingeniería SRE y mitigación desatendida.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ADQ-07',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Adquirencia Global',
    process: 'Conciliación Tripartita de Cuentas Recolectoras y Clearing Bancario (Reconciliation & Settlement)',
    riskDescription: 'Afectación contable y de integridad patrimonial ocasionada por la discrepancia no resuelta entre los montos notificados por la pasarela adquirente, los extractos bancarios de las cuentas recolectoras y los saldos acreditados en el Core Ledger (Descalce en Cuentas Puente de Recaudación), que puede generar partidas conciliatorias flotantes de larga antigüedad, derivando en observaciones graves en auditorías financieras externas y descalces de balance contable.',
    cause: 'Diferencias temporales en el corte de liquidación bancaria (T+0 vs T+1), comisiones bancarias descontadas en origen no identificadas en el payload y procesamiento manual de archivos de liquidación sin motor de cruce automático tripartito.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Motor de conciliación tripartita automatizada en tiempo real que concilie automáticamente extractos bancarios SFTP (MT940/CAMT.053), respuestas de pasarela y transacciones del Ledger con escalamiento automático si una partida supera 24 horas sin cuadre.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Pantalla de Historial de Depósitos y Estados de Conciliación.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Lead de Conciliaciones & Operaciones Settlement',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 3,
    legal: 3,
    associatedControls: [
      {
        id: 'C-ADQ-07-1',
        description: 'Motor de conciliación bancaria tripartita automatizada con cruce por código de referencia único bancario y monto exacto en frecuencia horaria.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-07-2',
        description: 'Dashboard de partidas pendientes de conciliación con semaforización de antigüedad y bloqueo preventivo de retiros sobre fondos con inconsistencias de conciliación.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ADQ-08',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Adquirencia Global',
    process: 'Cálculo y Retención Fiscal Automática en Cobros y Depósitos B2B (Tax Engine & Regulatory Compliance)',
    riskDescription: 'Afectación tributaria, financiera y legal ocasionada por errores o desactualización en el cálculo de retenciones de impuestos en la fuente (IVA, ReteFuente, Ingresos Brutos) sobre transacciones de adquirencia B2B y depósitos corporativos, que puede generar contingencias impositivas ante autoridades fiscales locales (SII Chile, DIAN Colombia, ARCA Argentina, SAT México), derivando en multas monetarias sustanciales y cobros retroactivos.',
    cause: 'Falta de parametrización dinámica y centralizada de las tablas impositivas y reglas de territorialidad tributaria en el checkout de depósito B2B, sin integración síncrona con el padrón fiscal de cada contribuyente.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Módulo tributario automatizado (Tax Engine) parametrizable por país y tipo de empresa que aplique las alícuotas exactas de retención antes de liquidar el depósito y emita comprobantes de retención fiscales certificados en línea.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Desglose de Tarifas, Retenciones de Impuestos y Comprobante Fiscal.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de Tax & Compliance Legal',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 3,
    reputacional: 3,
    legal: 4,
    associatedControls: [
      {
        id: 'C-ADQ-08-1',
        description: 'Motor de cálculo fiscal parametrizado por país que aplica las reglas de retención tributaria según la condición impositiva registrada de la empresa cliente.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-08-2',
        description: 'Auditoría mensual y conciliación cruzada de libros de retención contra declaraciones juradas fiscales previa a la presentación formal a entes recaudadores.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-ADQ-09',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Ciberseguridad en Endpoints de API Gateway de Depósito (Security Architecture & Input Sanitization)',
    riskDescription: 'Afectación tecnológica y patrimonial ocasionada por la manipulación maliciosa de parámetros en las solicitudes HTTP de depósito hacia el API Gateway (Parameter Tampering / Broken Object Level Authorization BOLA), que puede generar alteración del monto de depósito, inyección de códigos de divisa erróneos o abonos a billeteras corporativas de terceros no autenticados, derivando en pérdidas financieras severas y brechas de seguridad notificables.',
    cause: 'Falta de firma criptográfica HMAC en el payload de las solicitudes de depósito entre el front-end web corporativo y el API Gateway de Global66, sumado a validación insuficiente de integridad de datos y propiedad de objetos en servidor.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Firma criptográfica de payloads mediante tokens JWT RS256 con hash HMAC obligatorio, validación estricta de esquemas JSON en AWS API Gateway y control estricto de propiedad de entidad en cada endpoint transaccional.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Integración de API de Checkout y Seguridad de Conexión.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Security Architecture Lead',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 5,
    procesos: 4,
    reputacional: 5,
    legal: 4,
    associatedControls: [
      {
        id: 'C-ADQ-09-1',
        description: 'Firma digital de payloads con claves asimétricas y verificación de integridad criptográfica en el API Gateway previo al procesamiento del depósito.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-09-2',
        description: 'Reglas de inspección profunda de tráfico en AWS WAF con rate limiting por IP/cuenta empresarial y detección de inyecciones y anomalías de parámetros.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-ADQ-10',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Adquirencia Global',
    process: 'Control de Límites Operativos y Prevención de Estructuración Masiva (Smurfing B2B)',
    riskDescription: 'Afectación regulatoria y legal ocasionada por el fraccionamiento deliberado de depósitos corporativos por debajo de los umbrales de reporte normativo (Smurfing B2B / Lavado de Activos Estructurado), que puede generar omisión de reportes de operaciones sospechosas (ROS / STR) a las Unidades de Inteligencia Financiera locales (UAF Chile, UIAF Colombia, UIF Argentina), derivando en investigaciones penales, multas regulatorias y daño reputacional irreversible.',
    cause: 'Ausencia de reglas de agregación transaccional dinámica que consoliden los depósitos de una misma empresa o grupo económico en ventanas rodantes de 24 horas y 30 días, evaluando sólo transacciones individuales de forma aislada.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Motor de monitoreo transaccional en tiempo real con ventanas rodantes de agregación y scoring de comportamiento anómalo que bloquee depósitos fraccionados y alerte al oficial de cumplimiento para investigación inmediata.',
    documentControl: 'Figma B2B_Deposit_Money_All (Node 2163-11093) - Pantalla de Alerta de Límites y Capacidad Operativa B2B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Cumplimiento / Head de AML',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 3,
    reputacional: 4,
    legal: 5,
    associatedControls: [
      {
        id: 'C-ADQ-10-1',
        description: 'Reglas de monitoreo de agregación rodante en tiempo real que disparan alertas automáticas de estructuración al superar el 70% del límite operativo en depósitos fraccionados.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-ADQ-10-2',
        description: 'Bloqueo preventivo de nuevas órdenes de depósito y solicitud inmediata de soportes contables y estados financieros cuando se detecte un patrón de fraccionamiento.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  }
];
