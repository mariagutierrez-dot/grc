import { Risk, ProcessArea } from '../types';

export interface ApiB2bMcpActionPlan {
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

export const API_B2B_MCP_MATRIX_RISKS: Risk[] = [
  // 1. DÉBITO ACCIDENTAL DE FONDOS REALES POR OMISIÓN DE TEST_MODE Y FALTA DE SANDBOX SEPARADO
  {
    id: 'R-MCP-01',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Finanzas',
    origin: 'Interno',
    product: 'APIB2B(MCP)',
    process: 'Ejecución Transaccional, Test Mode y Desembolso de Fondos B2B',
    riskDescription: 'Pérdida financiera irreversible, dispersión accidental de fondos reales a cuentas bancarias de terceros y disputas legales con clientes corporativos B2B, ocasionado por la ejecución inadvertida de transacciones en modo real durante pruebas de integración, onboarding de desarrolladores o ejecuciones de agentes de IA autónomos.',
    cause: 'Decisión técnica deliberada de no construir un ambiente Sandbox aislado y ejecutar pruebas directamente sobre el endpoint de producción mediante el flag "test_mode: true"; riesgo de que un desarrollador o agente de IA autónomo (Modelo B) omita o envíe erróneamente el parámetro en el payload (alertado en comentarios [i][j][k] del documento de alcance).',
    impact: 5,
    probability: 4,
    suggestedControl: 'Implementación de llaves API diferenciadas para pruebas (tokens con prefijo "mcp_test_" o scope "mcp:test_only") que fuercen por diseño la ejecución simulada en el ApiGw aunque el payload omita el flag, registro inmutable de auditoría con hash del payload recibido para respaldo en disputas, y bloqueo preventivo de dispersión si el monto excede umbrales de testing sin confirmación explícita.',
    documentControl: 'Documento de Alcance: Parte II ("Desarrollo del test mode en el endpoint del API Transaccional") y Comentarios [i][j][k] (Seba y Emiliano Cabrales).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Tech Lead API B2B & Head of Finance (Diego García Lira)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 5,
    procesos: 4,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-MCP-01-1',
        description: 'Mecanismo en ApiGw que inspecciona credenciales y fuerza automáticamente test_mode=true si el token pertenece al ambiente de onboarding, impidiendo débitos reales en wallets por errores de payload.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-MCP-01-2',
        description: 'Almacenamiento inmutable en S3/CloudWatch de logs criptográficos de cada tool call con snapshot del payload exacto recibido para resolución pericial de disputas de soporte.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 2. EXPOSICIÓN INSEGURA DE ENDPOINTS INTERNOS DE MICROSERVICIOS SIN HARDENING
  {
    id: 'R-MCP-02',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'APIB2B(MCP)',
    process: 'Arquitectura de API Gateway, Exposición Pública y Seguridad de Microservicios',
    riskDescription: 'Brecha de seguridad perimetral, explotación de vulnerabilidades en microservicios core internos (ms.wallet, ms.quote, ms.transaction) y filtración de datos corporativos, derivado de la exposición directa de endpoints concebidos originalmente solo para la Webapp interna B2B hacia agentes de IA y clientes LLM en internet.',
    cause: 'Propuesta preliminar de migrar endpoints que usa la Webapp con tokens de sesión hacia OAuth sin pasar por la capa endurecida de la API Transaccional B2B (observado críticamente por Mauricio Oneto en notas [b][c][e]); riesgo de omitir sanitización de parámetros y reglas de seguridad específicas de canal.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Aislamiento estricto de la arquitectura: el MCP Server consume exclusivamente los endpoints públicos y auditados de la "API Transaccional B2B / API de Payouts", prohibiendo terminantemente la invocación directa a microservicios core; despliegue sobre un ApiGw dedicado (mcp-api.global66.com) con WAF corporativo y escaneo SAST/DAST continuo.',
    documentControl: 'Documento de Alcance: Sección 1, Parte I ("Migración de endpoints a OAuth 2.0") y Notas de Arquitectura [b][c][d][e] (Mauricio Oneto).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO (Aliro Correa) & Arquitecto de Software (Mauricio Oneto)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 4,
    associatedControls: [
      {
        id: 'C-MCP-02-1',
        description: 'Enrutamiento obligatorio a través del ApiGw dedicado mcp-api.global66.com con políticas de WAF avanzadas y bloqueo de llamadas que no provengan del contrato formal de la API de Payouts.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MCP-02-2',
        description: 'Pipeline de CI/CD con escaneo de seguridad estático y dinámico para verificar que ningún endpoint interno de microservicio sea alcanzable sin pasar por la fachada autenticada OAuth 2.0.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 3. FALSA SENSACIÓN DE SEGURIDAD EN LISTA BLANCA DE IPS COMPARTIDAS DE ANTHROPIC
  {
    id: 'R-MCP-03',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'APIB2B(MCP)',
    process: 'Control de Acceso Perimetral, Whitelisting de IPs y Autenticación de Herramientas',
    riskDescription: 'Suplantación de identidad corporativa, uso indebido de tokens OAuth filtrados y ejecución no autorizada de transferencias monetarias, facilitado por la confianza ciega en listas blancas de IP públicas que no proporcionan aislamiento real entre inquilinos.',
    cause: 'Los rangos de IP oficiales de Anthropic (usados por Claude en Modelo A) son compartidos globalmente por millones de usuarios y no diferencian clientes ni segmentos (advertencia explícita en comentario [h]); un atacante en posesión de credenciales legítimas podría ejecutar peticiones desde la misma infraestructura de Anthropic evadiendo el filtro de IP.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Mecanismo de seguridad en profundidad: token binding criptográfico (DPoP - RFC 9449 o mTLS), pantalla obligatoria de consentimiento interactivo con MFA para cada nueva sesión de Claude Desktop, y requerimiento de IP estática corporativa dedicada para integraciones desatendidas (Modelo B).',
    documentControl: 'Documento de Alcance: Parte I ("Restricción de IPs") y Comentario [h] (alerta sobre IPs compartidas de Anthropic).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO (Aliro Correa) & Lead Security Engineer',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 3,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-MCP-03-1',
        description: 'Implementación de tokens DPoP (Demonstrating Proof-of-Possession) vinculados a la llave privada del cliente en el Modelo A, neutralizando el reenvío de tokens robados aun desde IPs de Anthropic.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-MCP-03-2',
        description: 'Monitoreo de telemetría de comportamiento y huella de sesión (User-Agent, client fingerprint) que bloquea ráfagas anómalas aun cuando provengan de rangos IP válidos.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 4. EJECUCIÓN DESCONTROLADA O ALUCINACIÓN EN AGENTES AUTÓNOMOS DE IA (MODELO B)
  {
    id: 'R-MCP-04',
    processArea: 'Fraude',
    secondaryProcessArea: 'Operaciones',
    origin: 'Externo',
    product: 'APIB2B(MCP)',
    process: 'Gobernanza de Agentes Autónomos, Flujo Prepare/Confirm y Prevención de Fugas',
    riskDescription: 'Desembolsos masivos erróneos, pagos duplicados, selección incorrecta de beneficiarios o agotamiento intempestivo del saldo de la cuenta empresa, provocado por alucinaciones lógicas, bugs de prompts o bucles de reintento infinito en agentes de IA de clientes B2B operando sin supervisión humana.',
    cause: 'Automatización desatendida mediante Client Credentials en flujos de lending, nómina internacional, AP automation o claims insurtech; naturaleza no determinista de los modelos de lenguaje y posibles race conditions en sistemas de terceros.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Imposición técnica mandatoria del flujo en dos pasos (Prepare & Confirm): generación de pretransaction_id con TTL estricto (60-120s), límites de velocidad y monto acumulado por hora/día configurables en Webapp B2B, y requisito ineludible de Human-in-the-Loop para transacciones que superen el umbral configurado por la empresa.',
    documentControl: 'Documento de Alcance: Parte III ("Implementación del flujo pre-transaction / confirmación") y Casos de Uso Modelo B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude & PO API B2B (Emiliano Cabrales)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-MCP-04-1',
        description: 'Arquitectura mandatoria de 2 fases (POST /pretransactions -> POST /transactions/confirm) que valida coherencia económica y tiempo de expiración (TTL 90s) antes del débito final.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MCP-04-2',
        description: 'Circuit Breaker automático en ApiGw que suspende temporalmente las credenciales del agente si se detectan más de 3 pre-transacciones inconsistentes o una tasa de fallas superior al 15%.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 5. RECHAZO EN MARKETPLACES DE LLMS Y VACÍOS CONTRACTUALES DE RESPONSABILIDAD
  {
    id: 'R-MCP-05',
    processArea: 'Legal',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Externo',
    product: 'APIB2B(MCP)',
    process: 'Cumplimiento Legal, Términos y Condiciones B2B y Distribución en Marketplaces de IA',
    riskDescription: 'Rechazo de publicación en directorios oficiales de IA (ej. Anthropic Connectors Directory), demandas o reclamos de indemnización de clientes B2B que desconozcan pagos ejecutados por sus propios agentes de IA, y desprotección jurídica de Global66.',
    cause: 'Incompatibilidad de políticas de marketplace: el Connectors Directory de Anthropic solo acepta flujos interactivos 3-legged (Modelo A) y no flujos M2M Client Credentials (Modelo B, según nota [g]); sumado a la falta de términos contractuales claros que delimiten que el cliente asume el 100% de la responsabilidad sobre los prompts y agentes que conecta.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Estrategia dual de publicación (Modelo A listado en directorio de Claude, Modelo B distribuido exclusivamente como integración directa B2B), complementado con una Adenda Legal específica para el Canal MCP en el Contrato Marco B2B con cláusulas de descargo de responsabilidad sobre acciones de agentes autónomos y consentimientos OAuth.',
    documentControl: 'Documento de Alcance: Sección 2 ("Playbook Comercial"), Sección RNF Legal y Notas [f][g] (Marketplace de Claude).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head of Legal Regional & Lead Legal B2B',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 2,
    reputacional: 4,
    legal: 4,
    associatedControls: [
      {
        id: 'C-MCP-05-1',
        description: 'Adenda de Términos y Condiciones del Canal MCP que formaliza la asunción íntegra de riesgo y autorización por parte del cliente sobre cualquier instrucción emitida por sus tokens OAuth o Client Credentials.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MCP-05-2',
        description: 'Auditoría legal y técnica previa al registro en el Connectors Directory de Anthropic asegurando estricto apego a los lineamientos de consentimientos interactivos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 6. CONTAMINACIÓN DE REPORTES FINANCIEROS Y CIERRES CONTABLES POR TRANSACCIONES DE TEST
  {
    id: 'R-MCP-06',
    processArea: 'Finanzas',
    secondaryProcessArea: 'Conciliaciones',
    origin: 'Interno',
    product: 'APIB2B(MCP)',
    process: 'Reportes Financieros, Conciliación Bancaria, Data Lake y Cierres Contables',
    riskDescription: 'Distorsión en métricas clave de negocio (TPV, ingresos por fees), descuadres en conciliaciones bancarias o asientos contables anómalos en Mambu, provocado por la filtración accidental de transacciones simuladas (test mode) en los pipelines de reportería financiera y contable.',
    cause: 'Al no existir sandbox separado, las transacciones de test mode coexisten en la base de datos de producción; si algún dashboard de Tableau, reporte regulatorio o proceso ETL no filtra exhaustivamente el flag "is_test = true" o el prefijo "TEST-", se contamina la información contable.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Filtrado mandatorio en capa de ingesta del Data Lake: partición lógica estricta que excluye por defecto registros con is_test=true de todos los datasets financieros y contables; verificación de que Mambu nunca reciba eventos con flag test; y script de conciliación diaria que certifique cero saldo ficticio en libros.',
    documentControl: 'Documento de Alcance: Parte II ("Trabajo a nivel de desarrollo") y Sección RNF (Data, Finanzas, Conciliaciones).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of Finance (Diego García Lira) & Lead Data Engineer',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 2,
    legal: 2,
    associatedControls: [
      {
        id: 'C-MCP-06-1',
        description: 'Filtro por defecto en vistas analíticas y modelos dbt de Snowflake/Data Lake que aísla de forma mandatoria cualquier fila con is_test=true o canal MCP en modo prueba.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MCP-06-2',
        description: 'Alerta diaria de control interno de conciliaciones que audita discrepancias entre movimientos registrados en Mambu y transacciones originadas en el ApiGw de MCP.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 7. DENEGACIÓN DE SERVICIO Y SATURACIÓN POR RÁFAGAS CONVERSACIONALES O BUCLES
  {
    id: 'R-MCP-07',
    processArea: 'Continuidad',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'APIB2B(MCP)',
    process: 'Resiliencia Tecnológica, Rate Limiting y Disponibilidad de Infraestructura',
    riskDescription: 'Degradación severa del tiempo de respuesta o indisponibilidad total de la API Transaccional y cotizaciones (ms.quote) para clientes B2B críticos, derivado de ráfagas masivas de tool calls generadas por agentes de IA en bucles infinitos de reintento o prompts concurrentes.',
    cause: 'Patrón de tráfico conversacional y de agentes autónomos altamente errático y con picos extremos comparado con un ERP tradicional; riesgo de que la infraestructura compartida colapse si no se cuenta con limitación de tasa diferenciada.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Despliegue de ApiGw exclusivo para MCP con políticas de Rate Limiting independientes (token bucket) por cliente e IP, capacidad de degradación elegante (Throttling HTTP 429 con Retry-After), y desacoplamiento mediante colas asíncronas para consultas pesadas de reportería.',
    documentControl: 'Documento de Alcance: Parte I ("Cambio del ApiGw") y Sección "Otros componentes de nuestra arquitectura".',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Lead SRE / DevOps & Tech Lead Backend',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-MCP-07-1',
        description: 'Rate limiting estricto por company_id configurado en 30 peticiones por minuto en el ApiGw mcp-api.global66.com para prevenir saturación por loops de agentes.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MCP-07-2',
        description: 'Monitor en tiempo real en Datadog con alarmas automáticas al superar el 80% de capacidad del ApiGw y auto-scaling de réplicas en contenedores.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 8. SATURACIÓN Y DESALINEACIÓN DEL EQUIPO CX B2B ANTE TICKETS DE PROMPT ENGINEERING
  {
    id: 'R-MCP-08',
    processArea: 'CX',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'APIB2B(MCP)',
    process: 'Soporte al Cliente Corporativo B2B, Resolución de Incidentes y Escalado Técnico',
    riskDescription: 'Aumento crítico en tiempos de primera respuesta, fricción comercial con clientes enterprise y diagnósticos erróneos en mesas de ayuda, ocasionado por la incapacidad técnica de los operadores de soporte B2B estándar para resolver problemas complejos de integración con LLMs y agentes de IA.',
    cause: 'El soporte de integraciones MCP exige competencias en AI engineering, prompts, tool calling schemas y SDKs de IA, habilidades que no forman parte del entrenamiento habitual del equipo de 3 agentes CX B2B existente (alertado por Gustavo Lobos en notas [l][m]).',
    impact: 3,
    probability: 4,
    suggestedControl: 'Programa de capacitación intensivo para el equipo de CX B2B y Clara inhouse en fundamentos de MCP y tool calling, creación de una línea de escalado Level 2 hacia Solution Architects e Ingeniería (liderada por Emiliano Cabrales), y documentación exhaustiva con ejemplos de código en docs-b2b.global66.com.',
    documentControl: 'Documento de Alcance: Sección RNF ("CX y Clara inhouse") y Comentarios [l][m] (Gustavo Lobos y Emiliano Cabrales).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of CX (Gustavo Lobos) & Product Owner MCP (Emiliano Cabrales)',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 2,
    procesos: 4,
    reputacional: 3,
    legal: 1,
    associatedControls: [
      {
        id: 'C-MCP-08-1',
        description: 'Ruta de escalamiento directo en Zendesk para tickets etiquetados con canal MCP, direccionando automáticamente al equipo de Solution Engineering L2 con SLA de 30 min.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-MCP-08-2',
        description: 'Manual operativo de soporte interactivo para CX y prompts pre-armados para diagnosticar errores de schema MCP y códigos HTTP 422.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 9. RIESGO PLAFT POR FRAGMENTACIÓN Y PITUFEO EN AGENTES DE ALTA VELOCIDAD
  {
    id: 'R-MCP-09',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'APIB2B(MCP)',
    process: 'Prevención de Lavado de Activos y Financiamiento del Terrorismo (PLAFT/AML)',
    riskDescription: 'Filtración de transacciones ilícitas, estructuración de pagos (smurfing/pitufeo) y eventuales sanciones regulatorias de la UAF/SBS/CMF, derivado del uso de agentes de IA para fragmentar fondos en múltiples envíos de baja cuantía hacia beneficiarios creados dinámicamente.',
    cause: 'Capacidad del canal MCP de crear beneficiarios mediante tool "create_beneficiary" y dispersar pagos en milisegundos sin fricción humana; si el motor de monitoreo transaccional no consolida las transacciones a nivel de ventana móvil específica para el canal MCP, se evaden umbrales tradicionales.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Inclusión forzosa del tag "channel: MCP" en todas las evaluaciones de reglas de cumplimiento AML; screening síncrono ineludible en listas restrictivas (OFAC/PEP) al invocar el tool de creación de beneficiarios previo a autorizar pre-transacciones; y reglas de monitoreo acumulativo para patrones de dispersión de alta frecuencia.',
    documentControl: 'Documento de Alcance: Resumen Ejecutivo (Notas clasificatorias 1 y 2) y Sección RNF (Fraude y Compliance).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Cumplimiento (María Gutiérrez) & Gerente Anti-Fraude',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-MCP-09-1',
        description: 'Screening automático y síncrono de listas restrictivas al crear beneficiarios vía POST /companies/{id}/beneficiaries en MCP, bloqueando de raíz la generación de pretransactions.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-MCP-09-2',
        description: 'Regla de monitoreo transaccional que consolida y alerta si una empresa acumula más de 10 envíos MCP a beneficiarios distintos en un lapso inferior a 1 hora.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  }
];

export const API_B2B_MCP_ACTION_PLANS: ApiB2bMcpActionPlan[] = [
  {
    id: 'ACT-MCP-01',
    riskId: 'R-MCP-01',
    riskTitle: 'Aislamiento de Entornos: ApiGw Dedicado y Tokens con Prefijo Forzoso de Testing',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Diego García Lira (Head Finance) & Tech Lead API B2B',
    targetDate: '2026-09-15',
    progress: 50,
    tasks: 'Implementar tokens diferenciados para test mode que impidan débitos reales en backend, aislar reportes financieros en Data Lake y crear logs periciales de auditoría.',
    status: 'En proceso',
    budget: '5,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'ACT-MCP-02',
    riskId: 'R-MCP-02',
    riskTitle: 'Hardening Perimetral: Puerta de Enlace MCP Exclusiva sobre API de Payouts y WAF',
    processArea: 'Ciberseguridad',
    strategy: 'Mitigated',
    responsible: 'Aliro Correa (CISO) & Mauricio Oneto (Arquitectura)',
    targetDate: '2026-09-20',
    progress: 40,
    tasks: 'Configurar subdominio mcp-api.global66.com, prohibir consumo directo de microservicios internos, desplegar reglas de WAF y validaciones criptográficas DPoP para tokens OAuth.',
    status: 'En proceso',
    budget: '8,000 USD',
    framework: 'SICB',
    evidences: []
  },
  {
    id: 'ACT-MCP-03',
    riskId: 'R-MCP-04',
    riskTitle: 'Gobernanza de Agentes IA: Prepare/Confirm Mandatorio, Circuit Breaker y Human-in-the-Loop',
    processArea: 'Fraude',
    strategy: 'Mitigated',
    responsible: 'Emiliano Cabrales (PO MCP) & Gerente Prevención de Fraude',
    targetDate: '2026-09-25',
    progress: 45,
    tasks: 'Desarrollar endpoint prepare con TTL de 90s, implementar Circuit Breaker de congelamiento ante fallas consecutivas y configurar umbrales de aprobación humana en Webapp B2B.',
    status: 'En proceso',
    budget: '6,500 USD',
    framework: 'Fraude',
    evidences: []
  },
  {
    id: 'ACT-MCP-04',
    riskId: 'R-MCP-05',
    riskTitle: 'Marco Jurídico de IA & Especialización CX: Adenda de Responsabilidad y Soporte L2',
    processArea: 'Legal',
    strategy: 'Owned',
    responsible: 'Head of Legal Regional & Gustavo Lobos (Head CX)',
    targetDate: '2026-09-30',
    progress: 35,
    tasks: 'Redactar adenda contractual para canal MCP delimitando responsabilidad del cliente por prompts y agentes propios, y ejecutar programa de capacitación técnica para CX B2B con mesa de escalado L2.',
    status: 'En proceso',
    budget: '3,000 USD',
    framework: 'SARO',
    evidences: []
  }
];
