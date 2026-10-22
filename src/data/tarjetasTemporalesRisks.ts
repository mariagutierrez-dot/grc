import { Risk } from '../types';

export const TARJETAS_TEMPORALES_MATRIX_RISKS: Risk[] = [
  {
    id: 'R-TMP-01',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Tarjetas Temporales',
    process: 'Compensación Diferida de Cargos Forzados (Force-Post / Late Presentment) en Tarjetas Ya Expiradas o Destruidas',
    riskDescription: 'Afectación económica y operativa ocasionada por la discrepancia entre la regla de expiración local del emisor y las normativas de liquidación diferida (Clearing) de Mastercard/Visa cuando comercios offline, aerolíneas, hoteles o suscripciones envían cobros tardíos (Late Presentments) sobre tarjetas temporales destruidas, que puede generar sobregiros técnicos forzados y saldos negativos no recuperables, derivando en pérdidas directas asumidas por Global66 ante las redes de adquirencia.',
    cause: 'Inexistencia de un protocolo automatizado de disputa inmediata de First Presentments sin código de autorización válido y falta de reserva preventiva de balance para autorizaciones pendientes.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Motor de rechazo y disputa automatizada (Chargeback Reason Code 4837/4808) de liquidaciones diferidas recibidas con posterioridad a la destrucción del token sin pre-autorización previa válida, complementado con cuenta escrow de garantía de retención durante 14 días post-expiración.',
    documentControl: 'Manual Operativo de Tratamiento de Transacciones Diferidas, Force-Postings y Reglas de Compensación en Tarjetas Temporales Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-01-1',
        description: 'Motor de rechazo y disputa automatizada de compensaciones diferidas (Late Presentment) de tarjetas temporales que carezcan de pre-autorización previa válida.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-01-2',
        description: 'Mantenimiento de cuenta de garantía técnica en ledger contable con retención preventiva de saldo contingente hasta la confirmación de expiración definitiva de autorizaciones.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TMP-02',
    processArea: 'TI',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Interno',
    product: 'Tarjetas Temporales',
    process: 'Agotamiento Acelerado del Pool de Rangos de Tarjeta (BIN Range Exhaustion) por Generación Desmedida de PANs Efímeros',
    riskDescription: 'Afectación económica y de continuidad operativa ocasionada por la emisión indiscriminada o automatizada de miles de tarjetas virtuales efímeras por bots o usuarios de alta rotación, que puede generar el agotamiento anticipado del rango numérico BIN licenciado ante Mastercard/Visa, derivando en la parálisis de emisión para clientes legítimos, penalizaciones de la franquicia y sobrecostos por licenciamiento de nuevos rangos.',
    cause: 'Falta de cuotas de emisión dinámica basadas en KYC y carencia de un protocolo seguro de reciclaje de PANs con periodo de enfriamiento.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Políticas de cuotas dinámicas de emisión por usuario según scoring de riesgo y nivel de KYC, aunado a un sistema seguro de rotación y reutilización de PANs tras un periodo de cuarentena estricto de 180 días post-liquidación.',
    documentControl: 'Política de Capacidad de Infraestructura, Gobierno de Rangos BIN y Reciclaje Criptográfico de Tarjetas Efímeras.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-02-1',
        description: 'Rate limiting y cuotas dinámicas de emisión por usuario (máximo 5 tarjetas temporales activas simultáneas en KYC Básico y 15 en KYC Corporativo) con verificación de saldo mínimo.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-02-2',
        description: 'Módulo automatizado de rotación y cuarentena de 180 días en el pool de PANs para reutilización segura sin colisión de cobros tardíos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TMP-03',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Tarjetas Temporales',
    process: 'Falla en el Enrutamiento de Devoluciones y Reembolsos (Refund Routing Failures) Dirigidos a Tarjetas Temporales Destruidas',
    riskDescription: 'Afectación económica y de experiencia del usuario ocasionada por la destrucción y eliminación del identificador de la tarjeta temporal en la aplicación móvil antes de que el comercio procese notas de crédito, cancelaciones o reembolsos, que puede generar que los abonos entrantes queden extraviados en cuentas puente de conciliación bancaria, derivando en reclamos de tarjetahabientes, incremento en costos de soporte y quiebres de servicio.',
    cause: 'Falta de mapeo persistente e histórico entre el PAN efímero destruido y la cuenta global principal del cliente en el core bancario.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Módulo de enrutamiento inteligente de reembolsos (Smart Refund Router) que mantiene la relación criptográfica unidireccional permanente entre el PAN efímero y el UUID de la cuenta principal del cliente para acreditar automáticamente las devoluciones en la billetera.',
    documentControl: 'Procedimiento de Conciliación de Reembolsos y Tratamiento de Créditos Comerciales en Productos de Pago Efímeros.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-03-1',
        description: 'Enrutador inteligente de reembolsos (Smart Refund Router) con persistencia de tokens purgados en tabla hash indexada por UUID de usuario para acreditación automática inmediata.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-03-2',
        description: 'Conciliación diaria automatizada de abonos no conciliados con notificación push al usuario ante detección de crédito comercial en tarjeta inactiva.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TMP-04',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Tarjetas Temporales',
    process: 'Uso de Tarjetas Efímeras para Evasión de Umbrales SARLAFT/AML y Fraccionamiento Transaccional (Structuring / Smurfing)',
    riskDescription: 'Afectación legal, regulatoria y de corresponsalía ocasionada por la utilización de múltiples tarjetas efímeras de un solo uso por parte de usuarios malintencionados para fraccionar transacciones y eludir los umbrales de reporte SARLAFT/UAF, que puede generar la facilitación involuntaria de lavado de activos o compra de bienes restringidos, derivando en sanciones de superintendencias financieras y riesgo de pérdida de licencias bancarias.',
    cause: 'Evaluación de monitoreo antilavado basada en transacciones individuales de tarjeta sin agregación consolidada a nivel de cliente y RUT.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Monitoreo consolidado en tiempo real en el motor SARLAFT que unifica el volumen, frecuencia y geolocalización de compras de todas las tarjetas temporales vinculadas al titular, con alertas automáticas de fraccionamiento transaccional.',
    documentControl: 'Manual de Prevención de Lavado de Activos y Financiamiento del Terrorismo para Medios de Pago Digitales y Tarjetas Efímeras.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Compliance Officer',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-04-1',
        description: 'Agregación consolidada en tiempo real de compras efectuadas con todas las tarjetas temporales asociadas al documento de identidad (RUT/DNI) en el motor de monitoreo SARLAFT.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-04-2',
        description: 'Alertas automáticas de structuring transaccional y bloqueo cautelar instantáneo al superar umbrales acumulados de alerta en periodos de 24 horas.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-TMP-05',
    processArea: 'Fraude',
    secondaryProcessArea: 'Operaciones',
    origin: 'Externo',
    product: 'Tarjetas Temporales',
    process: 'Abuso Sistemático de Pruebas Gratuitas y Generación de Alto Ratio de Declinaciones (Card Testing / Subscription Churn)',
    riskDescription: 'Afectación económica y de relación con franquicias ocasionada por usuarios que emiten tarjetas temporales sin fondos o con límites de $0.01 USD para darse de alta en periodos de prueba gratuita (Free Trials) y evadir cobros recurrentes de comercios, que puede generar que el BIN de Global66 supere los umbrales de declinación tolerados por procesadores como Stripe, Adyen o PayPal, derivando en el bloqueo de todo el rango de tarjetas y penalizaciones de Mastercard/Visa.',
    cause: 'Falta de validación de saldo disponible mínimo y carencia de restricción de tarjetas efímeras a comercios de transacción única.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Obligatoriedad de saldo mínimo disponible para la emisión de tarjetas temporales, restricción tecnológica que vincula la tarjeta efímera al primer comercio de compra (Merchant Locking) y monitoreo algorítmico de tasa de declinación para mantenerla por debajo del 5%.',
    documentControl: 'Política de Prevención de Abuso de Tarjetas Virtuales, Merchant-Locking y Calidad Transaccional de Emisor.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-05-1',
        description: 'Mecanismo de Merchant-Locking automático: al autorizarse la primera transacción, el token queda anclado exclusivamente a ese comercio impidiendo su reutilización cruzada.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-05-2',
        description: 'Validación de saldo mínimo de fondeo en la cuenta global antes de permitir la generación de la tarjeta temporal.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TMP-06',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Tarjetas Temporales',
    process: 'Extracción No Autorizada de Datos Sensibles de la Tarjeta en Tránsito o Almacenamiento Local en Dispositivos Móviles Vulnerados',
    riskDescription: 'Afectación legal, contractual y de seguridad de la información ocasionada por la interceptación del PAN, CVV dinámico y fecha de expiración mediante ingeniería inversa, spyware o malware presente en dispositivos móviles rooteados o intervenidos de los usuarios, que puede generar la captura ilegítima de los datos de pago antes de su primer uso, derivando en fraudes por compras no presenciales, sanciones PCI-DSS y pérdida de confianza de los usuarios.',
    cause: 'Transmisión de datos de tarjeta sin cifrado de extremo a extremo a nivel de aplicación (Field-Level Encryption) y renderizado en vistas sin protección contra capturas de pantalla.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Cifrado a nivel de campo (Field-Level Encryption) utilizando claves efímeras derivadas del Secure Enclave / Android Keystore del dispositivo, bloqueo estricto de captura de pantalla (FLAG_SECURE) y borrado automático de los datos en memoria en menos de 60 segundos tras su visualización.',
    documentControl: 'Estándar Corporativo de Seguridad Móvil, Encriptación de Datos de Tarjetas y Cumplimiento PCI-DSS en Aplicaciones Nativas.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-06-1',
        description: 'Cifrado de extremo a extremo a nivel de campo (Field-Level Encryption) con Secure Enclave / Hardware Keystore para transmisión de PAN y CVV dinámico hacia el dispositivo.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-06-2',
        description: 'Activación obligatoria de FLAG_SECURE en la vista móvil y temporizador de purga forzada en memoria RAM a los 60 segundos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-TMP-07',
    processArea: 'TI',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Tarjetas Temporales',
    process: 'Condición de Carrera en la Destrucción del Token Post-Primer Uso (Double Tap Race Condition)',
    riskDescription: 'Afectación económica y operativa ocasionada por la ejecución casi simultánea de dos transacciones en comercios diferentes dentro de la misma ventana de milisegundos utilizando una tarjeta configurada para autodestruirse tras el primer uso, que puede generar la aprobación indebida de ambas operaciones por latencia en la sincronización de la base de datos distribuida, derivando en sobregiros no autorizados y pérdidas financieras asumidas por Global66.',
    cause: 'Falta de transaccionalidad atómica y bloqueos distribuidos (Distributed Locks) en el gateway de autorización del switch emisor.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Implementación de cerrojos distribuidos atómicos en memoria (Redis Redlock con TTL < 50ms) en el autorizador transaccional que cambia el estado de la tarjeta a "Consumida" de forma atómica antes de despachar la respuesta de aprobación.',
    documentControl: 'Arquitectura de Alta Disponibilidad y Concurrencia Transaccional en Servicios de Autorización de Pagos Digitales.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-07-1',
        description: 'Cerrojos distribuidos atómicos en Redis Cluster (Redlock) que marcan la tarjeta como consumida en menos de 10 milisegundos durante la fase de autorización.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-07-2',
        description: 'Mecanismo de rechazo inmediato (Código de Declinación 05 / Tarjeta No Válida) ante cualquier intento subsiguiente de autorización que ingrese al gateway.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TMP-08',
    processArea: 'Mesa de Dinero',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Tarjetas Temporales',
    process: 'Descalce en la Liberación de Retenciones y Fondos Bloqueados (Hold Funds Mismanagement)',
    riskDescription: 'Afectación económica y de relación con clientes ocasionada por pre-autorizaciones retenidas por comercios en tarjetas temporales que expiran antes de que el comercio confirme o anule la transacción, que puede generar que los fondos del cliente permanezcan retenidos indefinidamente o se liberen antes de que el comercio liquide la captura, derivando en reclamos masivos de usuarios o doble gasto asumido por Global66.',
    cause: 'Inexistencia de un servicio de expiración automática de pre-autorizaciones (Hold Release Engine) sincronizado con el ciclo de vida de las tarjetas efímeras.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Motor de desretención automática a las 72 horas para transacciones no capturadas y cuenta de escrow transitoria que garantiza la liquidez para compensaciones tardías sin descalzar al cliente.',
    documentControl: 'Manual de Tesorería, Gestión de Retenciones Transaccionales y Conciliación de Fondos en Tarjetas Temporales.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-TMP-08-1',
        description: 'Motor automatizado de liberación de retenciones (Hold Release Engine) con caducidad programada a las 72 horas para pre-autorizaciones no completadas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-TMP-08-2',
        description: 'Cuenta escrow de reserva de tesorería para respaldo de compensaciones posteriores sin afectación directa al saldo disponible del usuario.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  }
];

export interface TarjetasTemporalesActionPlan {
  id: string;
  riskId: string;
  riskTitle: string;
  processArea: 'Operaciones' | 'TI' | 'Cumplimiento' | 'Fraude' | 'Ciberseguridad' | 'Mesa de Dinero';
  strategy: 'Resolved' | 'Owned' | 'Accepted' | 'Mitigated';
  responsible: string;
  targetDate: string;
  progress: number;
  tasks: string;
  status: 'Por iniciar' | 'En proceso' | 'Completado' | 'Vencido';
  budget: string;
  framework: 'SARO';
  evidences: any[];
}

export const TARJETAS_TEMPORALES_ACTION_PLANS: TarjetasTemporalesActionPlan[] = [
  {
    id: 'PLN-TR-TMP-001',
    riskId: 'R-TMP-01',
    riskTitle: 'Implementación del Motor de Detección de Late Presentments y Disputa Automatizada de Clearing',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-08-15',
    progress: 60,
    tasks: 'Desarrollar integración en el procesador emisor para validación de pre-autorizaciones previas y generación automatizada de contracargos por Late Presentment bajo códigos Mastercard/Visa 4837/4808.',
    status: 'En proceso',
    budget: '$7,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-002',
    riskId: 'R-TMP-02',
    riskTitle: 'Sistema de Cuotas Dinámicas de Emisión y Cuarentena de Reciclaje de PANs (180 días)',
    processArea: 'TI',
    strategy: 'Mitigated',
    responsible: 'Head de TI',
    targetDate: '2026-09-01',
    progress: 45,
    tasks: 'Configurar en la capa de servicios de tarjetas el rate-limiting de emisión por tier de KYC y el motor de cuarentena segura de 180 días post-liquidación para rotación de PANs.',
    status: 'En proceso',
    budget: '$8,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-003',
    riskId: 'R-TMP-03',
    riskTitle: 'Smart Refund Router con Mapeo Criptográfico Unidireccional Persistente a Cuenta Global',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-08-30',
    progress: 55,
    tasks: 'Desplegar tabla hash indexada e inmutable que relacione los PANs de tarjetas destruidas con la cuenta global del cliente para el abono automático de devoluciones y reembolsos.',
    status: 'En proceso',
    budget: '$9,200 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-004',
    riskId: 'R-TMP-04',
    riskTitle: 'Agregación Centralizada de Transacciones Efímeras en Motor SARLAFT/UAF por RUT/DNI',
    processArea: 'Cumplimiento',
    strategy: 'Resolved',
    responsible: 'Compliance Officer',
    targetDate: '2026-07-31',
    progress: 50,
    tasks: 'Conectar el stream transaccional de tarjetas efímeras al motor de detección antilavado con alertas de agregación por cliente para identificar patrones de pitufeo y estructuración.',
    status: 'En proceso',
    budget: '$10,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-005',
    riskId: 'R-TMP-05',
    riskTitle: 'Restricción de Tokens Únicos por Comercio (Merchant-Locking) y Control de Declinaciones',
    processArea: 'Fraude',
    strategy: 'Mitigated',
    responsible: 'Head de Prevención de Fraude',
    targetDate: '2026-08-20',
    progress: 65,
    tasks: 'Implementar lógica de bloqueo de tarjeta al Merchant Identifier (MID) de la primera transacción autorizada y verificación de saldo mínimo antes de emitir la tarjeta.',
    status: 'En proceso',
    budget: '$6,800 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-006',
    riskId: 'R-TMP-06',
    riskTitle: 'Cifrado End-to-End con Secure Enclave, FLAG_SECURE y Purga de Payload en 60s',
    processArea: 'Ciberseguridad',
    strategy: 'Mitigated',
    responsible: 'CISO / Head de Ciberseguridad',
    targetDate: '2026-09-15',
    progress: 70,
    tasks: 'Actualizar la SDK móvil para implementar Field-Level Encryption con claves generadas en el Secure Enclave / Keystore y temporizador de purga de memoria RAM en la UI.',
    status: 'En proceso',
    budget: '$11,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-007',
    riskId: 'R-TMP-07',
    riskTitle: 'Bloqueo Atómico Distribuido Redis Redlock para Autodestrucción Post-Primer Uso',
    processArea: 'TI',
    strategy: 'Mitigated',
    responsible: 'Head de TI',
    targetDate: '2026-08-10',
    progress: 75,
    tasks: 'Integrar cerrojos atómicos en Redis Cluster que cambien el estado de la tarjeta en menos de 10ms previniendo condiciones de carrera por dobles transacciones concurrentes.',
    status: 'En proceso',
    budget: '$7,800 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-TMP-008',
    riskId: 'R-TMP-08',
    riskTitle: 'Motor de Desretención de Pre-autorizaciones (Hold Release Engine 72h) y Escrow de Tesorería',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-06-30',
    progress: 100,
    tasks: 'Desplegar servicio programado que libere retenciones bancarias huérfanas a las 72 horas y concilie las cuentas escrow de cobertura de compensaciones.',
    status: 'Completado',
    budget: '$6,200 USD',
    framework: 'SARO',
    evidences: []
  }
];
