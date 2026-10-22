import { Risk, ProcessArea } from '../types';

export interface MultitarjetaActionPlan {
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

export const MULTITARJETA_MATRIX_RISKS: Risk[] = [
  {
    id: 'R-MTC-01',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Multitarjeta',
    process: 'Provisionamiento y Tokenización de Tarjetas en Billeteras Digitales (Apple Pay / Google Wallet)',
    riskDescription: 'Afectación económica y reputacional ocasionada por la interceptación o debilidades en la autenticación OTP/MFA durante el provisionamiento desatendido de tokens de tarjetas en Apple Pay o Google Wallet (Token Provisioning Fraud), que puede generar la tokenización ilegítima de tarjetas virtuales y físicas en dispositivos no autorizados, derivando en fraudes masivos por compras no presenciales e indemnizaciones forzosas.',
    cause: 'Falta de validación criptográfica de riesgo del dispositivo (Device Score / ID&V de Mastercard/Visa) y dependencia de SMS OTP sin verificación step-up biométrica obligatoria en provisionamiento de tokens.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Integración del protocolo Mastercard Digital Enablement Service (MDES) / Visa Token Service (VTS) con motor de decisión de riesgo de tokenización en tiempo real y paso obligatorio por validación biométrica in-app (Green Path / Red Path).',
    documentControl: 'Estándar Corporativo de Seguridad en Tokenización de Tarjetas y Billeteras Digitales Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-01-1',
        description: 'Integración con Mastercard MDES / Visa VTS con evaluación de Device Score y Token Requestor ID antes de la activación de tokens de pago.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-01-2',
        description: 'Paso obligatorio por autenticación biométrica in-app mediante llaves FIDO2 / Secure Enclave para autorizar el provisionamiento del token en dispositivos móviles.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MTC-02',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Multitarjeta',
    process: 'Bloqueo Concurrente de Saldos en Débito Multidivisa y Prevención de Doble Gasto (Ledger Lock)',
    riskDescription: 'Afectación económica y operativa ocasionada por la ausencia de transaccionalidad atómica distribuida o bloqueos pesimistas en el ledger contable ante autorizaciones simultáneas en múltiples tarjetas vinculadas a una misma billetera, que puede generar sobregiros accidentales, descalces de balance y saldos negativos no recuperables por consumos concurrentes en comercios offline, derivando en pérdidas directas en el patrimonio corporativo de Global66.',
    cause: 'Latencia en la sincronización de microservicios de autorización ISO 8583 frente al motor de balance central y falta de reserva de fondos instantánea por tarjeta con semáforos distribuidos.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Mecanismo de reserva atómica de saldo en milisegundos con locks distribuidos en Redis Enterprise y reconciliación síncrona en el core transaccional previo a emitir la respuesta 0110 a la red de adquirencia.',
    documentControl: 'Arquitectura de Concurrencia y Bloqueos de Saldo para Múltiples Tarjetas Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-02-1',
        description: 'Implementación de locks pesimistas distribuidos en Redis Enterprise con latencia inferior a 15ms y reserva atómica de saldo transitorio por tarjeta en el Ledger.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-02-2',
        description: 'Reconciliación síncrona en tiempo real con motor de compensación y reglas de bloqueo inmediato ante discrepancias de saldo multidivisa.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MTC-03',
    processArea: 'Fraude',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Externo',
    product: 'Multitarjeta',
    process: 'Ataques de Enumeración de BIN y Fuerza Bruta en CVV / Fecha de Expiración (Card Testing / BIN Attack)',
    riskDescription: 'Afectación económica y contractual ocasionada por campañas automatizadas de botnets ejecutando transacciones masivas de bajo monto contra rangos de tarjetas virtuales para adivinar fechas de vencimiento y CVVs (BIN Attack / Card Testing), que puede generar multas exorbitantes de las marcas de tarjetas (Mastercard/Visa), saturación del procesador emisor y degradación del servicio transaccional, derivando en sanciones por exceso de declinaciones y quiebre de servicio.',
    cause: 'Emisión de tarjetas virtuales con CVV estático y ausencia de reglas dinámicas de velocity rate-limiting por BIN y por comercio en la capa del Issuer Processor.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Despliegue de CVV dinámico efímero (dCVV con rotación algorítmica cada 5 minutos en app móvil) y bloqueos perimetrales automáticos basados en umbrales de declinación por comercio y subred en el switch emisor.',
    documentControl: 'Manual de Prevención de Ataques de Enumeración de BIN y Card Testing Multitarjeta.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-03-1',
        description: 'Generación algorítmica de CVV dinámico rotativo cada 5 minutos (dCVV) validado criptográficamente en el HSM del Issuer Processor.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-03-2',
        description: 'Motor de reglas de velocidad en tiempo real con bloqueo preventivo de tarjetas ante más de 3 intentos fallidos de CVV en comercios no 3DS.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MTC-04',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'Multitarjeta',
    process: 'Monitoreo de Tipologías de Pitufeo (Smurfing) y Evasión de Límites Transaccionales entre Múltiples Tarjetas',
    riskDescription: 'Afectación legal y regulatoria ocasionada por la falta de agregación transaccional consolidada a nivel de cliente/RUT para usuarios que operan múltiples tarjetas corporativas o personales, que puede generar la fragmentación de compras y retiros en cajeros (ATM) para eludir umbrales de reporte SARLAFT/UAF, derivando en sanciones por omisión de reporte de operaciones sospechosas y riesgo de revocación de licencia de emisor.',
    cause: 'Reglas de monitoreo AML parametrizadas de forma aislada por número de tarjeta (PAN) en lugar de consolidar el volumen global por titular y cuenta madre en tiempo real.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Motor de monitoreo transaccional transfronterizo con scoring acumulativo por titular (Customer-Level AML Scorer) que unifica el tráfico de todas las tarjetas activas y dispara alertas preventivas automáticas de estructuración.',
    documentControl: 'Manual de Prevención de Lavado de Activos y Financiamiento del Terrorismo (SARLAFT/UAF) para Medios de Pago Multitarjeta.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-04-1',
        description: 'Módulo de agregación transaccional en tiempo real que consolida débitos, retiros y transferencias de todas las tarjetas del cliente bajo un único perfil analítico.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-04-2',
        description: 'Alertas automáticas de tipologías de pitufeo y estructuración con escalamiento inmediato al Oficial de Cumplimiento para reporte ROS/STR.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-MTC-05',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Multitarjeta',
    process: 'Almacenamiento, Tokenización y Cumplimiento de Estándares PCI-DSS v4.0 en el Ciclo de Vida del PAN',
    riskDescription: 'Afectación legal, contractual y reputacional ocasionada por la fuga o exfiltración de números de tarjeta (PAN), fechas de vencimiento y datos de pista magnética resguardados en bases de datos o logs de diagnóstico de microservicios, que puede generar multas severas del Consejo PCI-SSC, revocación de licencias de procesamiento con Mastercard/Visa y demandas judiciales colectivas, derivando en pérdidas financieras millonarias y descrédito de marca irrecuperable.',
    cause: 'Falta de tokenización obligatoria de datos de tarjetahabiente (CHD) previa al procesamiento interno y omisión de escaneos periódicos de datos no encriptados en entornos de preproducción y logs.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Bóveda criptográfica certificada PCI-DSS v4.0 Nivel 1 con tokenización format-preserving (FPE) y enmascaramiento total en logs y microservicios, sin acceso directo al PAN en claro fuera del HSM.',
    documentControl: 'Política Corporativa de Cumplimiento PCI-DSS v4.0 y Gestión del Entorno de Datos de Tarjetahabientes (CDE).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-05-1',
        description: 'Bóveda de tokenización segura PCI-DSS v4.0 Nivel 1 con cifrado AES-256 FPE administrado en HSM Google Cloud KMS FIPS 140-2 Nivel 3.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-05-2',
        description: 'Filtro automático de inspección de paquetes (DLP) y Data Redaction en el pipeline de logs que bloquea cualquier persistencia accidental del PAN o CVV.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-MTC-06',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Multitarjeta',
    process: 'Gestión Operativa de Disputas, Contracargos Masivos (Chargebacks) y Fraude Amistoso en Subcuentas',
    riskDescription: 'Afectación económica y de relación con redes ocasionada por el desbordamiento en la mesa operativa de disputas ante el aumento exponencial de compras no reconocidas o fraude amistoso en tarjetas virtuales compartidas entre colaboradores empresariales, que puede generar la superación del límite de ratio de contracargos del 0.9% de Mastercard/Visa (Excessive Chargeback Program - ECP), derivando en penalizaciones mensuales recurrentes de $50,000+ USD y congelamiento del programa de emisión.',
    cause: 'Carencia de autenticación 3D Secure 2.2 obligatoria para compras web y falta de herramientas de autoservicio para congelar tarjetas instantáneamente o presentar pre-arbitrajes automatizados.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Implementación forzosa de 3DS 2.2 con cambio de responsabilidad (Liability Shift), bloqueo granular por categorías MCC desde la app y módulo automatizado de gestión de pre-disputas integrado a Ethoca y Verifi.',
    documentControl: 'Manual Operativo de Gestión de Disputas, Contracargos y Prevención de Fraude Amistoso Multitarjeta.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-06-1',
        description: 'Autenticación obligatoria EMV 3-D Secure 2.2 que transfiere la responsabilidad de fraude (Liability Shift) hacia el adquirente del comercio.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-06-2',
        description: 'Integración bidireccional con redes Ethoca Consumer Clarity y Visa Verifi para resolución de alertas tempranas de contracargo antes de formalizar la disputa.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MTC-07',
    processArea: 'Mesa de Dinero',
    secondaryProcessArea: 'Nuevos Productos',
    origin: 'Interno',
    product: 'Multitarjeta',
    process: 'Enrutamiento Dinámico de Monedas (FX Multi-Currency Auto-Routing) y Descalces por Variación Cambiaria',
    riskDescription: 'Afectación económica ocasionada por el descalce entre la divisa local del comercio extranjero en transacciones internacionales y las subcuentas activas del usuario, que puede generar la ejecución de conversiones forzosas a tasas de cambio desactualizadas o descalces en la compensación diferida T+2 con la red de pago, derivando en pérdidas de spread cambiario para la tesorería de Global66 y reclamos de tarjetahabientes por cargos imprevistos.',
    cause: 'Ausencia de un motor de pre-autorización con congelamiento de spread garantizado y falta de algoritmos inteligentes de cascada de divisas (Fallback Currency Routing) configurables por el usuario.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Motor de liquidación multidivisa inteligente con reserva de tasa en tiempo real (Rate-Lock de compensación) y jerarquía parametrizable de débito por billetera de divisa para evitar sobrecostos transfronterizos.',
    documentControl: 'Política de Gestión de Riesgo Cambiario y Compensación de Transacciones Multidivisa en Tarjetas.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Accepted',
    roamOwner: 'Head de Mesa de Dinero',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-07-1',
        description: 'Motor inteligente de enrutamiento FX que debita automáticamente de la billetera con la misma moneda de la compra (ej. USD, EUR, CLP, COP) eliminando comisiones FX dobles.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-07-2',
        description: 'Cobertura cambiaria automatizada en tiempo real mediante forward sintético con proveedores de liquidez institucionales al momento de la autorización.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-MTC-08',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Externo',
    product: 'Multitarjeta',
    process: 'Custodia, Fabricación y Distribución de Tarjetas Físicas con Chips EMV y Gestión Segura del PIN',
    riskDescription: 'Afectación económica y reputacional ocasionada por la interceptación física de plásticos durante el despacho postal o la asignación no segura de PIN en canales de autoservicio, que puede generar la activación ilegítima de plásticos clonados y retiros no autorizados en cajeros automáticos, derivando en quejas masivas ante reguladores de protección al consumidor y reposiciones con sobrecosto.',
    cause: 'Despacho de tarjetas en sobres no inviolables sin seguimiento satelital de entrega y procesos de activación que no exigen autenticación biométrica en la app móvil.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Protocolo de entrega segura con código de activación dinámico de un solo uso en la app móvil, generación de PIN cifrado en HSM bajo estándar ISO 9564 y embalaje de seguridad con precinto tamper-evident.',
    documentControl: 'Procedimiento Operativo de Custodia, Despacho y Activación Segura de Tarjetas Físicas Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-MTC-08-1',
        description: 'Activación de tarjeta física estrictamente mediante lectura de código QR único e inviolable y confirmación biométrica en la app del titular.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MTC-08-2',
        description: 'Generación y cambio de PIN cifrado directamente en HSM según estándar bancario ISO 9564 Formato 0 con bloques PIN Block encriptados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  }
];

export const MULTITARJETA_ACTION_PLANS: MultitarjetaActionPlan[] = [
  {
    id: 'PLN-TR-MTC-001',
    riskId: 'R-MTC-01',
    riskTitle: 'Integración MDES/VTS y Validación Biométrica de Tokenización en Apple Pay y Google Wallet',
    processArea: 'Ciberseguridad',
    strategy: 'Mitigated',
    responsible: 'CISO / Head de Ciberseguridad',
    targetDate: '2026-10-31',
    progress: 35,
    tasks: 'Desplegar integración de APIs MDES/VTS con evaluación de Device Score en tiempo real y paso obligatorio por autenticación biométrica in-app (Green Path).',
    status: 'En proceso',
    budget: '$9,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-002',
    riskId: 'R-MTC-02',
    riskTitle: 'Implementación de Locks Distribuidos en Redis Enterprise y Control Atómico de Saldo Multidivisa',
    processArea: 'TI',
    strategy: 'Mitigated',
    responsible: 'Head de TI',
    targetDate: '2026-09-30',
    progress: 50,
    tasks: 'Desplegar cluster de Redis Enterprise con semáforos distribuidos para reserva de saldo con latencia < 15ms previo a confirmación 0110.',
    status: 'En proceso',
    budget: '$8,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-003',
    riskId: 'R-MTC-03',
    riskTitle: 'Despliegue de Algoritmo de CVV Dinámico (dCVV) y Reglas de Velocidad Anti Card Testing',
    processArea: 'Fraude',
    strategy: 'Mitigated',
    responsible: 'Head de Prevención de Fraude',
    targetDate: '2026-10-15',
    progress: 40,
    tasks: 'Generación criptográfica de dCVV rotativo cada 5 minutos en app móvil y bloqueo perimetral de tarjetas ante 3 intentos fallidos de CVV.',
    status: 'En proceso',
    budget: '$7,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-004',
    riskId: 'R-MTC-04',
    riskTitle: 'Consolidación de Scoring Transaccional a Nivel de Cliente (Customer-Level AML Scorer) en SARLAFT',
    processArea: 'Cumplimiento',
    strategy: 'Mitigated',
    responsible: 'Compliance Officer',
    targetDate: '2026-11-15',
    progress: 30,
    tasks: 'Parametrizar el motor de monitoreo transaccional para consolidar todas las tarjetas bajo el RUT del cliente y disparar alertas de pitufeo.',
    status: 'En proceso',
    budget: '$6,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-005',
    riskId: 'R-MTC-05',
    riskTitle: 'Certificación de Bóveda Tokenizadora PCI-DSS v4.0 Nivel 1 con Cifrado FPE en Google Cloud KMS',
    processArea: 'Ciberseguridad',
    strategy: 'Resolved',
    responsible: 'CISO / Head de Ciberseguridad',
    targetDate: '2026-08-31',
    progress: 100,
    tasks: 'Implementar bóveda FPE con Google Cloud KMS HSM FIPS 140-2 Nivel 3 y purga automática de datos de autenticación sensible (SAD) en logs.',
    status: 'Completado',
    budget: '$12,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-006',
    riskId: 'R-MTC-06',
    riskTitle: 'Implementación Forzosa de EMV 3-D Secure 2.2 y Conexión a Redes de Alertas Ethoca & Verifi',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-10-31',
    progress: 45,
    tasks: 'Activar 3DS 2.2 con Liability Shift mandatario para compras online e integrar webhooks de resolución temprana con Ethoca y Verifi.',
    status: 'En proceso',
    budget: '$7,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-007',
    riskId: 'R-MTC-07',
    riskTitle: 'Motor Inteligente de Cascada de Divisas y Liquidación FX Garantizada con Rate-Lock',
    processArea: 'Mesa de Dinero',
    strategy: 'Accepted',
    responsible: 'Head de Mesa de Dinero',
    targetDate: '2026-11-30',
    progress: 55,
    tasks: 'Configurar enrutamiento automático de débitos por divisa coincidente y congelamiento de spread en autorizaciones internacionales.',
    status: 'En proceso',
    budget: '$5,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-MTC-008',
    riskId: 'R-MTC-08',
    riskTitle: 'Protocolo de Distribución Segura de Plásticos Tamper-Evident y Gestión de PIN Cifrado en HSM',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-09-30',
    progress: 70,
    tasks: 'Implementar precintos de seguridad tamper-evident con seguimiento satelital de envíos y generación de PIN en HSM bajo estándar ISO 9564.',
    status: 'En proceso',
    budget: '$4,800 USD',
    framework: 'SARO',
    evidences: []
  }
];
