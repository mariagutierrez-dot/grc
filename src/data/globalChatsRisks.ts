import { Risk, ProcessArea } from '../types';

export interface GlobalChatsActionPlan {
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

export const GLOBAL_CHATS_MATRIX_RISKS: Risk[] = [
  // 1. FRAUDE POR INGENIERÍA SOCIAL, PHISHING Y COBROS COERCITIVOS EN EL CHAT
  {
    id: 'R-GCH-01',
    processArea: 'Fraude',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Externo',
    product: 'Global chats',
    process: 'Prevención de Fraude P2P y Seguridad de Canales Conversacionales',
    riskDescription: 'Pérdida económica por transferencias no reversibles, estafas masivas a usuarios y deterioro crítico de la confianza en la marca Global66 derivado de ataques de ingeniería social, phishing conversacional y solicitudes extorsivas de cobro ("Request Money") ejecutadas por actores maliciosos dentro de los hilos de chat 1:1, suplantando identidades de soporte o familiares.',
    cause: 'Cercanía psicológica y reducción de fricción en la interfaz conversacional móvil (Figma Node 3591-2794); capacidad de iniciar chat conociendo únicamente el username o teléfono del usuario; ausencia de fricción preventiva o banderas de advertencia en transferencias ejecutadas directamente desde la burbuja de conversación.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Implementación de insignia visual de seguridad y banner de advertencia ("Primer contacto / Usuario no en agenda") con recordatorio explícito de que Global66 jamás solicita fondos por chat; deshabilitación de hipervínculos externos activos en el chat; y reglas de monitoreo de velocidad para solicitudes de cobro repetitivas.',
    documentControl: 'Documento de Alcance: Parte I (Mensajería Base) y Parte II (Transacciones P2P desde el Chat). Modelado de amenazas Cyber [b][c].',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude & CISO (Aliro Correa)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 4,
    associatedControls: [
      {
        id: 'C-GCH-01-1',
        description: 'Banner de seguridad contextual en el cliente Flutter al abrir un chat con un contacto no guardado en la libreta del teléfono, con confirmación reforzada ("¿Conoces a este usuario?") previa a procesar cualquier envío de dinero.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-GCH-01-2',
        description: 'Motor anti-fraude con reglas de velocidad que bloquea temporalmente el envío de solicitudes de cobro (requests) si una cuenta emite más de 5 peticiones a usuarios distintos en menos de 10 minutos.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 2. VULNERABILIDAD EN ARQUITECTURA WEBSOCKET Y SATURACIÓN EN AWS
  {
    id: 'R-GCH-02',
    processArea: 'TI',
    secondaryProcessArea: 'Continuidad',
    origin: 'Interno',
    product: 'Global chats',
    process: 'Gestión de Infraestructura Cloud, WebSockets y Conectividad en Tiempo Real',
    riskDescription: 'Degradación severa del servicio móvil, caída generalizada de la mensajería y retrasos en la visualización de pagos P2P en el chat, ocasionado por la saturación de conexiones concurrentes en AWS API Gateway WebSocket, cuellos de botella en la tabla de estados de DynamoDB o tormentas de reconexión ("reconnection storms") ante fluctuaciones de red móvil en Latinoamérica.',
    cause: 'Primera implementación de WebSockets en la historia de Global66 (cambio arquitectural relevante desde modelos REST asíncronos); complejidad en la persistencia de sockets en DynamoDB con Lambdas; falta de pruebas de carga de estrés para millones de conexiones concurrentes en la app móvil.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Arquitectura escalable en AWS con API Gateway WebSocket Throttling, DynamoDB On-Demand con auto-scaling, algoritmo de reconexión con backoff exponencial con jitter en la app Flutter y fallback automático a polling HTTP si el socket no responde en 5 segundos.',
    documentControl: 'Documento de Alcance: Parte IV (Infraestructura y Seguridad - WebSockets vs. Chat Asincrónico). Stack AWS.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Tech Lead Backend (Lucas Cornero / Esteban Campos) & Lead DevOps',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 3,
    procesos: 5,
    reputacional: 4,
    legal: 2,
    associatedControls: [
      {
        id: 'C-GCH-02-1',
        description: 'Mecanismo resiliente de reconexión en el cliente Flutter con backoff exponencial aleatorizado (jitter) y circuito de contingencia ("Circuit Breaker") que conmuta a API REST si el socket falla tras 3 intentos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-GCH-02-2',
        description: 'Alarmas en AWS CloudWatch y telemetría en tiempo real sobre límites de conexiones WebSocket y latencia de MS-Chat, activando aprovisionamiento elástico inmediato ante picos de uso.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 3. FALLA EN ENCRIPTACIÓN EXTREMO A EXTREMO (E2E) Y FUGA DE MENSAJES CONFIDENCIALES
  {
    id: 'R-GCH-03',
    processArea: 'Seguridad de la Información',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    product: 'Global chats',
    process: 'Criptografía, Privacidad de Comunicaciones y Protección de Datos E2E',
    riskDescription: 'Compromiso de la confidencialidad de las conversaciones financieras, exposición de metadatos sensibles de transferencias y sanciones severas por violación de leyes de protección de datos personales (GDPR / Ley 19.628 / Habeas Data), derivado de fallas criptográficas en la implementación de la encriptación E2E, almacenamiento inseguro de llaves privadas en dispositivos móviles o fuga de texto plano en logs de servidores AWS.',
    cause: 'Complejidad matemática en la gestión de intercambio de llaves asimétricas (Signal Protocol / libsodium) entre dispositivos; riesgo de almacenamiento inadecuado en el Secure Storage de Android/iOS; omisión de sanitización de payloads en microservicios backend de AWS.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Adopción de librerías criptográficas de estándar militar auditadas (Signal Protocol / libsodium) con custodia de llaves privadas exclusivamente en el Hardware Security Module (iOS Keychain / Android Keystore Secure Enclave), arquitectura "Zero-Knowledge" en servidores de Global66 y auditoría externa de código criptográfico previa al lanzamiento.',
    documentControl: 'Documento de Alcance: Parte IV (Encriptación End-to-End E2E) y Modelado de Amenazas de Ciberseguridad [b].',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO (Aliro Correa) & Lead Security Engineer',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-GCH-03-1',
        description: 'Arquitectura Zero-Knowledge: los servidores de Global66 solo retransmiten blobs cifrados sin acceso a las claves de descifrado, custodiadas exclusivamente en el Secure Enclave del hardware móvil.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GCH-03-2',
        description: 'Auditoría criptográfica y pentesting formal de código por una firma de ciberseguridad independiente especializada en protocolos de mensajería E2E antes de la salida a producción.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 4. EXPOSICIÓN NO AUTORIZADA DE PII Y CONTINGENCIA LEGAL EN TÉRMINOS & CONDICIONES
  {
    id: 'R-GCH-04',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Legal',
    origin: 'Interno',
    product: 'Global chats',
    process: 'Protección de Datos Personales (PII), Términos & Condiciones y Derechos ARCO',
    riskDescription: 'Demandas por invasión a la privacidad, requerimientos regulatorios de autoridades de datos y litigios por acoso o spam entre usuarios, ocasionado por la exposición de nombres completos y actividad financiera al buscar usuarios por número de teléfono o username, sumado a vacíos legales en los Términos y Condiciones vigentes que no contemplan interacciones sociales dentro de la billetera.',
    cause: 'Comentario [e] de Compliance advirtiendo que los T&C actuales no explicitan que terceros pueden contactar al usuario ni eximen a Global66 de responsabilidad sobre contenidos de chat; falta de configuraciones de privacidad para ocultar el número telefónico o restringir quién puede iniciar un chat.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Actualización y firma obligatoria de Términos y Condiciones específicos de Global Chat con cláusula de exención de responsabilidad sobre mensajes entre particulares; controles de privacidad en la app ("Permitir solo contactos de mi agenda", "Ocultar número de teléfono"); y mecanismo nativo con un clic para Bloquear y Reportar usuarios.',
    documentControl: 'Documento de Alcance: Comentario [e] de Compliance y Detalle de Alcance Parte I (Búsqueda por teléfono/username).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Cumplimiento (María Gutiérrez) & Head of Legal',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 3,
    procesos: 3,
    reputacional: 4,
    legal: 5,
    associatedControls: [
      {
        id: 'C-GCH-04-1',
        description: 'Pantalla de Términos y Condiciones y consentimiento informado previo a la activación del chat en el onboarding, con cláusula de no responsabilidad de Global66 por mensajes de terceros.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-GCH-04-2',
        description: 'Módulo de privacidad en ajustes de usuario que permite bloquear contactos no deseados y restringir la visibilidad del perfil únicamente a números guardados en la libreta de contactos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 5. INFILTRACIÓN DE CUENTAS NO VERIFICADAS (KYC 0) Y RIESGO DE LAVADO DE ACTIVOS
  {
    id: 'R-GCH-05',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'Global chats',
    process: 'Debida Diligencia de Clientes (KYC/AML), Control de Identidad y Acceso al Canal',
    riskDescription: 'Utilización de Global Chat como canal de coordinación clandestina para delitos financieros, lavado de activos (SARLAFT/UAF) o grooming/estafas mediante cuentas creadas con datos falsos o incompletos, derivando en sanciones de supervisores financieros (CMF / SFC / UIF) y requerimientos judiciales por facilitación de comunicaciones ilícitas.',
    cause: 'Inconsistencia identificada en el Documento de Alcance (Parte I mencionaba "KYC 0 aprobado" mientras que la sección "No es parte del alcance" punto #6 y el comentario [a] de Pedro Pico exigen tajantemente exclusión de KYC 0 y requisito mandatorio de cliente con KYC 100% aprobado).',
    impact: 5,
    probability: 3,
    suggestedControl: 'Restricción dura y validación en API Gateway / MS-Chat que bloquea el registro en el WebSocket y la creación de cualquier hilo de conversación a usuarios que no tengan su verificación de identidad (KYC biométrico y listas restrictivas) completada y aprobada.',
    documentControl: 'Documento de Alcance: Comentario [a] de Pedro Pico y Sección "No es parte del alcance" (Punto 6).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Head of Compliance (Valeria Rojas) & Head Vertical B2C (Pedro Pico)',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-GCH-05-1',
        description: 'Filtro a nivel de microservicio (MS-Chat) que valida el atributo kyc_status === APPROVED en el token JWT antes de permitir la conexión al socket o la búsqueda de usuarios.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      }
    ]
  },

  // 6. DISTRIBUCIÓN DE MALWARE Y CONTENIDO ILÍCITO EN ARCHIVOS MULTIMEDIA ADJUNTOS
  {
    id: 'R-GCH-06',
    processArea: 'Seguridad de la Información',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Global chats',
    process: 'Gestión Segura de Archivos Multimedia, Almacenamiento S3 y Cifrado KMS',
    riskDescription: 'Infección de dispositivos de clientes, robo de credenciales de la app o distribución de contenido ilegal/ofensivo mediante el envío de fotos, comprobantes falsos o stickers contaminados a través del chat, derivando en brechas de ciberseguridad y daño reputacional a la plataforma.',
    cause: 'Habilitación de carga de imágenes, fotos y comprobantes PDF en el chat; almacenamiento de archivos en AWS S3 si no se aplican filtros de tipos MIME, sanitización de metadatos EXIF o políticas de retención con expiración.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Sanitización y re-compresión forzada de imágenes en el cliente móvil antes de su encriptación, validación estricta de extensiones permitidas (solo JPG/PNG/PDF), almacenamiento en buckets privados de AWS S3 con cifrado KMS de llave rotada, y pre-signed URLs con expiración máxima de 5 minutos.',
    documentControl: 'Documento de Alcance: Parte IV (Almacenamiento S3 + KMS en AWS) y Fase 1 (Alcance de Fotos/Stickers).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO & Tech Lead Mobile Frontend (Jhojhan Sifuentes)',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 2,
    procesos: 4,
    reputacional: 4,
    legal: 4,
    associatedControls: [
      {
        id: 'C-GCH-06-1',
        description: 'Módulo de sanitización en el cliente Flutter que elimina metadatos EXIF (geolocalización, cámara) y re-codifica las imágenes como PNG/JPEG limpios antes de transmitirlas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GCH-06-2',
        description: 'Configuración estricta en AWS S3 con bucket policy sin acceso público, cifrado SSE-KMS y entrega de adjuntos cifrados mediante pre-signed URLs con tiempo de vida máximo de 5 minutos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 7. DESINCRONIZACIÓN DE ESTADOS ENTRE BURBUJAS DE CHAT Y CORE TRANSACCIONAL P2P
  {
    id: 'R-GCH-07',
    processArea: 'Operaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Global chats',
    process: 'Orquestación de Pagos P2P, Idempotencia y Notificaciones Transaccionales',
    riskDescription: 'Doble débito o retiros no reflejados causados por desincronización entre el estado visual de la burbuja en el chat (WebSocket) y el estado real del movimiento en el Core Ledger (Mambu/REST), induciendo al usuario a presionar múltiples veces el botón "Enviar Dinero" ante demoras en el refresco.',
    cause: 'Concurrencia entre el canal en tiempo real (WebSocket) y el motor transaccional REST P2P; falta de token de idempotencia compartido entre la interfaz de chat y la pasarela de pagos interna; retrasos en eventos de notificación push de Iterable/FCM.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Mecanismo de idempotencia estricto (Idempotency-Key UUIDv4) generado al pulsar la acción de pago en el chat, lock pesimista de UI que desactiva el botón mientras la transacción está en curso, y actualización reactiva de la burbuja guiada por webhooks del Core Ledger con bottomsheet oficial de comprobante en tiempo real.',
    documentControl: 'Documento de Alcance: Parte II (Transacciones P2P desde el Chat y Bottomsheet de Detalle).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Tech Lead Backend (Lucas Cornero) & Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-GCH-07-1',
        description: 'Generación de clave de idempotencia transaccional única por cada intento de pago en la burbuja de chat con bloqueo de interfaz en Flutter para evitar dobles clics.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GCH-07-2',
        description: 'Sincronización síncrona del estado del pago (Pendiente / Completada / Rechazada) vinculando el ID de transacción del Core con el ID de mensaje en DynamoDB para garantizar consistencia absoluta.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 8. SATURACIÓN DE CX Y RECLAMOS POR SOLICITUDES ERRÓNEAS O ACOSO SIN SOPORTE CLARA
  {
    id: 'R-GCH-08',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Estratégico',
    origin: 'Interno',
    product: 'Global chats',
    process: 'Atención al Cliente (CX), Gestión de Reclamos y Soporte Contextual con Clara',
    riskDescription: 'Sobrecarga del equipo de soporte humano (CX), incremento en tiempos de espera de tickets y frustración de usuarios por solicitudes de cobro enviadas por error, spam o mensajes no deseados, derivado de la falta de preparación de la base de conocimiento (KB) del bot Clara y la ausencia de herramientas para cancelar solicitudes pendientes.',
    cause: 'Lanzamiento de una funcionalidad social sin capacitación exhaustiva del equipo de soporte; bot Clara sin conocimiento semántico del flujo de chat; falta de botón para cancelar una solicitud de dinero emitida por error antes de ser aprobada por el receptor.',
    impact: 3,
    probability: 4,
    suggestedControl: 'Actualización integral de la Base de Conocimiento (KB) de Clara con flujos automatizados de ayuda sobre Global Chat, botón nativo en el chat para "Cancelar Solicitud de Cobro Pendiente" en cualquier momento, y protocolo de escalamiento prioritario hacia CX para reportes de acoso o fraude.',
    documentControl: 'Documento de Alcance: Requerimientos no funcionales a CX (Centro de Ayuda / KB Clara) y Parte II (Cobros Request).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de CX (Customer Experience) & Product Owner B2C (Pedro Pico)',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 2,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-GCH-08-1',
        description: 'Entrenamiento del bot conversacional Clara con guías interactivas sobre privacidad, cancelación de solicitudes de pago y bloqueo de contactos para resolver dudas en T+0 sin requerir agentes.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-GCH-08-2',
        description: 'Funcionalidad en el chat que permite al emisor revocar o cancelar inmediatamente cualquier solicitud de dinero (Request) que aún no haya sido aceptada por la contraparte.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  }
];

export const GLOBAL_CHATS_ACTION_PLANS: GlobalChatsActionPlan[] = [
  {
    id: 'ACT-GCH-01',
    riskId: 'R-GCH-03',
    riskTitle: 'Arquitectura Criptográfica E2E y Modelo de Amenazas WebSocket en AWS',
    processArea: 'Seguridad de la Información',
    strategy: 'Mitigated',
    responsible: 'Aliro Correa (CISO) & Jhojhan Sifuentes (TL FE)',
    targetDate: '2026-11-15',
    progress: 30,
    tasks: 'Definir protocolo E2E (Signal Protocol vs libsodium), almacenamiento seguro en Keychain/Keystore móvil, revisión del modelo de amenazas de AWS API Gateway WebSocket y auditoría de zero-knowledge en backend.',
    status: 'En proceso',
    budget: '12,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'ACT-GCH-02',
    riskId: 'R-GCH-01',
    riskTitle: 'Escudos Anti-Phishing, Banners Preventivos y Reglas Anti-Fraude P2P',
    processArea: 'Fraude',
    strategy: 'Mitigated',
    responsible: 'Gerente de Prevención de Fraude & Pedro Pico (Head B2C)',
    targetDate: '2026-11-10',
    progress: 40,
    tasks: 'Diseñar e instrumentar banners de primer contacto en Flutter, deshabilitar links externos en chat, y configurar límites de velocidad para solicitudes masivas de cobro en el motor anti-fraude.',
    status: 'En proceso',
    budget: '6,500 USD',
    framework: 'Fraude',
    evidences: []
  },
  {
    id: 'ACT-GCH-03',
    riskId: 'R-GCH-04',
    riskTitle: 'Actualización de Términos & Condiciones, Consentimiento P2P y Privacidad',
    processArea: 'Cumplimiento',
    strategy: 'Mitigated',
    responsible: 'María Gutiérrez (Compliance) & Valeria Rojas (Head GRC)',
    targetDate: '2026-10-30',
    progress: 55,
    tasks: 'Redactar adenda de T&C para interacciones de chat entre clientes, cláusula de exención por contenido privado, configuración de visibilidad de número de teléfono y flujo de bloqueo/denuncia en 1 clic.',
    status: 'En proceso',
    budget: '0 USD (Recursos internos)',
    framework: 'SICB',
    evidences: []
  },
  {
    id: 'ACT-GCH-04',
    riskId: 'R-GCH-07',
    riskTitle: 'Idempotencia Transaccional en Chat y Capacitación de Soporte CX / Clara',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Lucas Cornero (Lead BE) & Head de CX',
    targetDate: '2026-11-05',
    progress: 35,
    tasks: 'Implementar Idempotency-Key en llamadas de pago desde el chat, botón de revocación de cobros pendientes y actualización de la Base de Conocimiento (KB) de Clara con artículos contextuales.',
    status: 'En proceso',
    budget: '3,500 USD',
    framework: 'Continuidad',
    evidences: []
  }
];
