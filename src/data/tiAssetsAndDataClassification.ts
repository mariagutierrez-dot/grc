import { InformationAsset } from '../types';

export interface ComprehensiveITAsset extends InformationAsset {
  // Tríada CIA (ISO 27001 / ISO 27005)
  cValue: number; // 1-5 Confidencialidad
  iValue: number; // 1-5 Integridad
  aValue: number; // 1-5 Disponibilidad
  // Datos Técnicos y Arquitectura de API Gateway (Informe ApiGw-resument)
  category: 
    | 'API Gateway / Microservicio' 
    | 'Base de Datos' 
    | 'Infraestructura Cloud & EKS' 
    | 'Almacenamiento S3 / Bóvedas' 
    | 'Criptografía & Identidad' 
    | 'Repositorio & CI/CD';
  apiEndpoint?: string;
  httpMethods?: string[];
  authMethod: 'Cognito JWT / OAuth2' | 'mTLS Perimetral' | 'AWS IAM / SigV4' | 'API Key + WAF' | 'Público (WAF Protegido)';
  cloudInfrastructure: string; // ej: AWS us-east-1 (EKS, Aurora, Lambda, KMS, S3)
  technicalOwner: string; // Extraído de CloudTrail / CodeCommit
  // Cumplimiento Ley 21.719 (Protección de Datos Personales Chile)
  containsPersonalData: boolean;
  isSensitivePersonalData?: boolean; // Art. 2 Ley 21.719 (Biometría, salud, origen, etc.)
  personalDataTypes: string[]; // RUT, Nombres, Biometría, Saldos, etc.
  legalBasisLey21719: 'Ejecución contractual' | 'Obligación legal (CMF / UAF)' | 'Consentimiento expreso e informado' | 'Interés legítimo';
  dataSubjects: ('Clientes Persona Natural B2C' | 'Clientes Empresa B2B' | 'Colaboradores Global66' | 'Terceros Proveedores')[];
  securityMeasures: string[]; // ISO 27001 controles técnicos activos
  retentionPeriod: string; // ej: 5 años (CMF NCG 464), 10 años (Ley 19.913)
  internationalTransfer: boolean; // Si viaja a AWS us-east-1 con salvaguardas
}

export interface DataClassificationItem {
  id: string;
  dataElementName: string;
  category: 
    | 'Identificatorio' 
    | 'Financiero y Transaccional' 
    | 'Biométrico / Sensible' 
    | 'Credenciales y Criptografía' 
    | 'Cumplimiento / AML / PEP' 
    | 'Telemático y Conexión';
  isoClassification: 'Altamente Confidencial' | 'Confidencial' | 'Restringido' | 'Uso Interno' | 'Público';
  isSensitiveLey21719: boolean;
  legalBasis: string;
  primaryPurpose: string;
  associatedAssetIds: string[]; // Enlaces a IDs de ComprehensiveITAsset
  storageLocation: string;
  retentionPolicy: string;
  protectionControls: string[];
  arcopRightsApplicable: ('Acceso' | 'Rectificación' | 'Supresión' | 'Oposición' | 'Portabilidad')[];
  dataMaskingRule: string;
}

export interface ISOClassificationGuide {
  level: 'Altamente Confidencial' | 'Confidencial' | 'Restringido' | 'Uso Interno' | 'Público';
  badgeColor: string;
  description: string;
  handlingRules: string[];
  storageRules: string[];
  transmissionRules: string[];
  disposalRules: string[];
}

export const ISO_CLASSIFICATION_GUIDELINES: Record<string, ISOClassificationGuide> = {
  'Altamente Confidencial': {
    level: 'Altamente Confidencial',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    description: 'Información extremadamente crítica cuyo acceso no autorizado ocasionaría un impacto catastrófico regulatorio, legal (Ley 21.719 / CMF) o daño financiero irreparable.',
    handlingRules: [
      'Acceso exclusivo bajo principio de mínimo privilegio y autorización expresa del CISO/DPO.',
      'Prohibida su descarga o exportación a dispositivos locales o medios extraíbles.',
      'Autenticación obligatoria con MFA biométrico o tokens FIDO2 físicos.'
    ],
    storageRules: [
      'Cifrado en reposo obligatorio con llaves AWS KMS dedicadas (Envelope Encryption AES-256-GCM).',
      'Módulos de seguridad de hardware (HSM Cloud) para custodia de llaves maestras.'
    ],
    transmissionRules: [
      'Cifrado en tránsito obligatorio mediante TLS 1.3 con mTLS y validación cruzada de certificados.',
      'Prohibida transmisión por canales no securizados (WhatsApp, correos externos no cifrados).'
    ],
    disposalRules: [
      'Destrucción criptográfica (crypto-shredding) eliminando llaves de desencriptación.',
      'Borrado seguro certificado conforme a NIST SP 800-88 Rev. 1.'
    ]
  },
  'Confidencial': {
    level: 'Confidencial',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    description: 'Datos personales y transaccionales del negocio financiero de Global66 protegidos por la Ley 21.719, normas CMF y secreto bancario/billetera.',
    handlingRules: [
      'Acceso restringido a colaboradores autorizados según su rol formal (RBAC).',
      'Monitoreo y registro de accesos en bitácoras inmutables (CloudTrail / Datadog).',
      'Enmascaramiento de datos (data masking) en interfaces operativas y ambientes de staging.'
    ],
    storageRules: [
      'Cifrado en reposo estándar AWS RDS / Aurora / S3 KMS.',
      'Bases de datos en subredes privadas aisladas sin IP pública directa.'
    ],
    transmissionRules: [
      'Tráfico cifrado de extremo a extremo mediante TLS 1.2 o superior.',
      'Bloqueo preventivo de fuga de datos (DLP) en gateways y terminales.'
    ],
    disposalRules: [
      'Sobreescritura segura de sectores y purga automatizada tras el periodo legal de 5 años.'
    ]
  },
  'Restringido': {
    level: 'Restringido',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    description: 'Información operativa interna, arquitectura de software, endpoints privados de microservicios y reportes técnicos de uso interno.',
    handlingRules: [
      'Uso exclusivo por el equipo técnico y operacional de Global66.',
      'Acuerdos de confidencialidad (NDA) vigentes para colaboradores y contratistas.'
    ],
    storageRules: [
      'Almacenamiento en repositorios privados con autenticación corporativa (SSO / Okta / Google Workspace).'
    ],
    transmissionRules: [
      'Canales de red corporativa privada o túneles VPN WireGuard / IPsec.'
    ],
    disposalRules: [
      'Eliminación estándar en herramientas corporativas con confirmación de borrado lógico.'
    ]
  },
  'Uso Interno': {
    level: 'Uso Interno',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    description: 'Documentación organizativa, manuales de proceso internos, comunicados de equipo e instrucciones de trabajo generales.',
    handlingRules: [
      'Disponible para todo el personal interno de Global66, no destinada a difusión pública externa.'
    ],
    storageRules: [
      'Intranet corporativa, Notion institucional o repositorios compartidos de equipo.'
    ],
    transmissionRules: [
      'Comunicaciones internas mediante correo corporativo y mensajería Slack autorizada.'
    ],
    disposalRules: [
      'Papelera de reciclaje y ciclo de vida de almacenamiento estándar de Google Workspace.'
    ]
  },
  'Público': {
    level: 'Público',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Información autorizada expresamente para difusión abierta a clientes, usuarios y público general (cotizaciones FX spot, términos de servicio, blog).',
    handlingRules: [
      'Sin restricciones de acceso o distribución.',
      'Requiere revisión previa de marketing o legal antes de su publicación oficial.'
    ],
    storageRules: [
      'Servidores CDN Cloudflare / AWS CloudFront con caché público.'
    ],
    transmissionRules: [
      'Protocolo HTTPS abierto con certificados SSL válidos.'
    ],
    disposalRules: [
      'Deprecación o actualización de contenido en CMS público.'
    ]
  }
};

// Inventario Consolidado de Activos de Información: API Gateway + Ley 21.719
export const COMPREHENSIVE_TI_ASSETS: ComprehensiveITAsset[] = [
  // --- MICROSERVICIOS Y APIS (Informe ApiGw-resument) ---
  {
    id: 'AST-GW-AUTH',
    name: 'Auth & Identity Service (OAuth2 / Cognito)',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Microservicio en AWS API Gateway que gestiona el login, emisión de tokens JWT, refresco de sesión, verificación multifactor (MFA por TOTP/SMS) y autenticación federada.',
    owner: 'Líder de Seguridad e Identidad Digital',
    technicalOwner: 'Tech Lead Identity (CodeCommit: auth-service, CloudTrail: cognito-admin)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['TI', 'Ciberseguridad', 'Cumplimiento'],
    originDoc: 'ApiGw-resument / AWS API Gateway Specification',
    lastReviewDate: '2026-06-15',
    cValue: 5,
    iValue: 5,
    aValue: 5,
    apiEndpoint: '/v1/auth/*',
    httpMethods: ['POST', 'GET'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway REST, Cognito User Pool, Lambda, Redis ElastiCache)',
    containsPersonalData: true,
    isSensitivePersonalData: true,
    personalDataTypes: ['E-mail', 'Hash de Contraseña (Argon2)', 'Teléfono Móvil', 'Tokens JWT', 'IP de Conexión', 'Historial MFA'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B', 'Colaboradores Global66'],
    securityMeasures: ['A.5.15 Control de accesos', 'A.8.12 Cifrado KMS', 'A.8.2 Registro CloudTrail', 'Rate Limiting 10 req/s', 'WAF Geo-blocking'],
    retentionPeriod: '5 años conforme a NCG 464 CMF',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-WALLET',
    name: 'Core Wallet & Ledger Service API',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Motor central de saldos en múltiples divisas (CLP, USD, COP, EUR, ARS). Procesa acreditaciones, débitos, balance contable en doble partida y reservas de fondos transfronterizos.',
    owner: 'Líder de Arquitectura Core Financiero',
    technicalOwner: 'Tech Lead Core Wallet (CodeCommit: wallet-ledger-service, CloudTrail: aurora-admin)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['TI', 'Operaciones', 'Mesa de Dinero'],
    originDoc: 'ApiGw-resument / Core Transaccional Wallet',
    lastReviewDate: '2026-06-10',
    cValue: 5,
    iValue: 5,
    aValue: 5,
    apiEndpoint: '/v1/wallets/*',
    httpMethods: ['GET', 'POST', 'PUT'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway, EKS Kubernetes, Amazon Aurora PostgreSQL Multi-AZ)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['RUT/Cédula', 'Saldos en Wallet', 'Historial de Transacciones', 'Números de Cuenta Virtual', 'Moneda'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Cifrado AES-256 KMS', 'A.8.20 WAF & mTLS', 'A.8.2 Registro transaccional inmutable', 'Double Ledger Validation'],
    retentionPeriod: '5 años (CMF NCG 464)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-REMIT',
    name: 'Remittance & Cross-Border Dispatcher API',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Orquestador de transferencias internacionales hacia más de 65 países. Coordina cotización spot, validación de beneficiarios, reservas cambiarias y despacho a corresponsales bancarios.',
    owner: 'Gerente de Remesas y Corredores Globales',
    technicalOwner: 'Tech Lead CrossBorder Engine (CodeCommit: remittance-api, CloudTrail: sqs-remit-producer)',
    criticality: 'Crítica',
    classification: 'Confidencial',
    associatedProcesses: ['Operaciones', 'Mesa de Dinero', 'Cumplimiento'],
    originDoc: 'ApiGw-resument / Motor de Dispersión Internacional',
    lastReviewDate: '2026-06-12',
    cValue: 4,
    iValue: 5,
    aValue: 5,
    apiEndpoint: '/v1/remittances/*',
    httpMethods: ['POST', 'GET'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway, EKS Go/Node microservice, SQS FIFO, DynamoDB)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['Nombre del Remitente', 'RUT/DNI', 'Nombre del Beneficiario', 'Cuentas Bancarias Destino (IBAN/CBU/CLABE)', 'Monto y Divisa'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Cifrado en tránsito TLS 1.3', 'A.8.24 Pruebas SAST en CI/CD', 'A.8.14 Redundancia Multi-AZ'],
    retentionPeriod: '5 años (CMF NCG 464) y 10 años (Ley 19.913 UAF)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-CARD',
    name: 'Global Card Management API (CMF Chile)',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Plataforma de emisión, tokenización y gestión de ciclo de vida de la tarjeta prepago Global Card S.P.A. (Mastercard). Controla bloqueo temporal, CVV dinámico, límites y autorizaciones POS.',
    owner: 'Líder Técnico de Medios de Pago y Tarjetas',
    technicalOwner: 'Tech Lead Cards Processing (CodeCommit: card-processor-service, CloudTrail: pci-vault-iam)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['TI', 'Operaciones', 'Ciberseguridad'],
    originDoc: 'ApiGw-resument / Especificación Global Card CMF',
    lastReviewDate: '2026-06-18',
    cValue: 5,
    iValue: 5,
    aValue: 5,
    apiEndpoint: '/v1/cards/*',
    httpMethods: ['GET', 'POST', 'PATCH'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway, PCI-DSS Isolated VPC, CloudHSM, Aurora)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['PAN Tokenizado', 'Fecha de Vencimiento', 'CVV Dinámico Hash', 'RUT Titular', 'Límites de Compra', 'Transacciones POS'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C'],
    securityMeasures: ['A.8.12 Cifrado PCI-DSS CloudHSM', 'A.5.18 Accesos restringidos', 'A.8.11 Tokenización de PAN', 'mTLS con Mastercard'],
    retentionPeriod: '5 años (CMF NCG 464)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-KYC',
    name: 'KYC & Biometric Liveness Verification API',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Microservicio de onboarding digital que captura documentos de identidad oficiales, ejecuta prueba de vida facial 3D (liveness check) y consulta bases registrales gubernamentales.',
    owner: 'Gerente de Prevención de Fraude y Onboarding',
    technicalOwner: 'Tech Lead Onboarding Biometrics (CodeCommit: kyc-liveness-api, CloudTrail: rekognition-kyc)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['Fraude', 'Cumplimiento', 'TI'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / Protocolo Onboarding',
    lastReviewDate: '2026-06-14',
    cValue: 5,
    iValue: 5,
    aValue: 4,
    apiEndpoint: '/v1/kyc/*',
    httpMethods: ['POST', 'GET'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway, AWS Rekognition, Lambda Serverless, S3 KMS Cifrado)',
    containsPersonalData: true,
    isSensitivePersonalData: true, // Biometría facial es sensible bajo Ley 21.719
    personalDataTypes: ['Vectores Biométricos Faciales', 'Fotografía de Cédula de Identidad/Pasaporte', 'RUT/DNI', 'Nombres y Apellidos', 'Fecha de Nacimiento'],
    legalBasisLey21719: 'Consentimiento expreso e informado',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Cifrado AES-256 KMS', 'A.8.11 Enmascaramiento biométrico', 'A.7.4 Concienciación contra deepfakes', 'Zero Raw Biometric Storage'],
    retentionPeriod: '5 años (CMF NCG 464)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-AML',
    name: 'Compliance Screening & KYT Real-Time API',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Motor analítico que evalúa cada transacción contra listas internacionales de sanciones (OFAC, ONU, UE), listas PEP y modelos de detección de pitufeo (smurfing) y lavado de activos.',
    owner: 'Oficial de Cumplimiento Regional Global66',
    technicalOwner: 'Tech Lead AML & RegTech (CodeCommit: aml-screening-api, CloudTrail: aml-evaluator)',
    criticality: 'Crítica',
    classification: 'Confidencial',
    associatedProcesses: ['Cumplimiento', 'Fraude'],
    originDoc: 'ApiGw-resument / Sistema de Prevención LA/FT',
    lastReviewDate: '2026-06-08',
    cValue: 5,
    iValue: 5,
    aValue: 4,
    apiEndpoint: '/v1/compliance/*',
    httpMethods: ['POST'],
    authMethod: 'mTLS Perimetral',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway privada, EKS microservice, OpenSearch, PostgreSQL)',
    containsPersonalData: true,
    isSensitivePersonalData: true, // Datos penales / listas de sanciones
    personalDataTypes: ['RUT/Cédula', 'Nombres Completos', 'Condición PEP', 'Score de Riesgo AML', 'Reportes de Operaciones Sospechosas (ROS)', 'País de Origen'],
    legalBasisLey21719: 'Obligación legal (CMF / UAF)',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.5.15 RBAC estricto', 'A.8.2 Auditoría inmutable de dictámenes', 'A.8.12 Cifrado en reposo KMS'],
    retentionPeriod: '10 años (Ley 19.913 UAF Chile)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-BANK',
    name: 'Banking Clearing & TEF Ingestion Gateway',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Canal de integración directa con la banca local (TEF Banco de Chile, Santander, BCI, ACH Colombia, SINPE Costa Rica). Ingesta cartolas y procesa abonos automáticos.',
    owner: 'Líder de Integraciones Bancarias y Clearing',
    technicalOwner: 'Tech Lead Banking Connectors (CodeCommit: banking-clearing-gateway, CloudTrail: vpc-peering-bank)',
    criticality: 'Crítica',
    classification: 'Confidencial',
    associatedProcesses: ['Operaciones', 'TI', 'Mesa de Dinero'],
    originDoc: 'ApiGw-resument / Pasarela de Clearing Bancario',
    lastReviewDate: '2026-06-11',
    cValue: 4,
    iValue: 5,
    aValue: 5,
    apiEndpoint: '/v1/clearing/*',
    httpMethods: ['POST', 'GET'],
    authMethod: 'mTLS Perimetral',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway privada, VPC Peering con Bancos, Direct Connect, SQS)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['Número de Cuenta Bancaria', 'RUT Emisor', 'Folio TEF', 'Monto Transferido', 'Detalle de Cartola Bancaria'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.20 VPN IPSec y mTLS bancario', 'A.8.14 Failover secundario', 'A.8.2 Log transaccional'],
    retentionPeriod: '5 años (CMF NCG 464)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-FX',
    name: 'FX Market Rates & Spot Quoting Engine API',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Motor de cálculo y publicación de tasas de cambio de divisas en tiempo real. Aplica márgenes de intermediación (spread), cotiza pares de divisas y congela tasas por 15 minutos.',
    owner: 'Jefe de Mesa de Dinero y Tesorería',
    technicalOwner: 'Tech Lead FX Treasury (CodeCommit: fx-quoting-engine, CloudTrail: redis-fx-admin)',
    criticality: 'Alta',
    classification: 'Público',
    associatedProcesses: ['Mesa de Dinero', 'Operaciones'],
    originDoc: 'ApiGw-resument / Cotizador FX Global66',
    lastReviewDate: '2026-06-05',
    cValue: 1,
    iValue: 5,
    aValue: 5,
    apiEndpoint: '/v1/fx/spot-rates',
    httpMethods: ['GET'],
    authMethod: 'Público (WAF Protegido)',
    cloudInfrastructure: 'AWS us-east-1 (CloudFront CDN, API Gateway, Redis ElastiCache Multi-AZ)',
    containsPersonalData: false,
    personalDataTypes: ['Tasas de Cambio Spot', 'Pares de Divisas (USD/CLP, EUR/COP, etc.)', 'Horario de Cotización'],
    legalBasisLey21719: 'Interés legítimo',
    dataSubjects: [],
    securityMeasures: ['A.8.20 Cloudflare DDoS Protection', 'A.8.2 WAF Rate Limiting 100 req/s', 'A.8.14 Caché en borde CloudFront'],
    retentionPeriod: '1 año para analítica de mercado',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-NOTIF',
    name: 'Transactional Notifications & OTP SMS Gateway',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'Servicio de mensajería síncrona para envío de códigos OTP de doble factor, alertas push de compras con tarjeta y comprobantes de remesa completada.',
    owner: 'Líder de Plataforma y Comunicaciones',
    technicalOwner: 'Tech Lead Messaging (CodeCommit: notification-service, CloudTrail: sns-otp-sender)',
    criticality: 'Alta',
    classification: 'Confidencial',
    associatedProcesses: ['TI', 'Operaciones'],
    originDoc: 'ApiGw-resument / Plataforma de Notificaciones',
    lastReviewDate: '2026-05-30',
    cValue: 4,
    iValue: 4,
    aValue: 5,
    apiEndpoint: '/v1/notifications/*',
    httpMethods: ['POST'],
    authMethod: 'AWS IAM / SigV4',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway interna, AWS SNS, AWS SES, Twilio Integración)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['Teléfono Móvil', 'E-mail', 'Código OTP Temporal', 'Nombre del Destinatario', 'Monto Transacción'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Códigos OTP hasheados con expiración de 3 minutos', 'A.8.20 TLS 1.3', 'A.5.15 IAM Roles'],
    retentionPeriod: '6 meses (Logs de despacho de SMS)',
    internationalTransfer: true
  },
  {
    id: 'AST-GW-OPS',
    name: 'Backoffice Operations & Exceptions Management API',
    type: 'Sistema de Información',
    category: 'API Gateway / Microservicio',
    description: 'API privada para la mesa de operaciones y soporte de segundo nivel. Permite conciliar reprocesos manuales, desbloquear cuentas tras debida diligencia y emitir reembolsos.',
    owner: 'Supervisor de Operaciones de Pago Regional',
    technicalOwner: 'Tech Lead Ops Tools (CodeCommit: ops-admin-backend, CloudTrail: okta-sso-admin)',
    criticality: 'Alta',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['Operaciones', 'Cumplimiento', 'TI'],
    originDoc: 'ApiGw-resument / Consola Backoffice Ops',
    lastReviewDate: '2026-06-02',
    cValue: 5,
    iValue: 5,
    aValue: 4,
    apiEndpoint: '/v1/admin/*',
    httpMethods: ['GET', 'POST', 'PATCH'],
    authMethod: 'Cognito JWT / OAuth2',
    cloudInfrastructure: 'AWS us-east-1 (API Gateway privada VPC, Okta SSO con MFA FIDO2, Aurora)',
    containsPersonalData: true,
    isSensitivePersonalData: true,
    personalDataTypes: ['RUT/Cédula', 'Historial Completo de Usuario', 'Saldos', 'Comprobantes de Reclamo', 'Bitácora de Acciones Administrativas'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B', 'Colaboradores Global66'],
    securityMeasures: ['A.5.18 Principio Maker-Checker obligatorio', 'A.8.2 Registro inmutable de auditoría', 'A.5.15 VPN corporativa'],
    retentionPeriod: '5 años (CMF NCG 464)',
    internationalTransfer: true
  },

  // --- BASES DE DATOS Y ALMACENAMIENTO (Informe Inventario_Activos_Global66_Ley21719) ---
  {
    id: 'DAT-DB-WALLET',
    name: 'BBDD Producción Core Wallet (Aurora PostgreSQL)',
    type: 'Base de Datos',
    category: 'Base de Datos',
    description: 'Instancia primaria de base de datos relacional de Global66. Almacena las tablas de usuarios, cuentas virtuales, balances multidivisa, estados de cuenta e identificadores gubernamentales.',
    owner: 'Administrador Principal de Bases de Datos (Lead DBA)',
    technicalOwner: 'Database Operations Lead (CloudTrail: rds-wallet-cluster, CodeCommit: db-migrations)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['TI', 'Ciberseguridad', 'Operaciones'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / Arquitectura de Datos',
    lastReviewDate: '2026-06-18',
    cValue: 5,
    iValue: 5,
    aValue: 5,
    authMethod: 'AWS IAM / SigV4',
    cloudInfrastructure: 'AWS us-east-1 (Amazon Aurora PostgreSQL Serverless v2, Multi-AZ con réplicas de lectura)',
    containsPersonalData: true,
    isSensitivePersonalData: true,
    personalDataTypes: ['RUT/DNI', 'Cédula de Identidad', 'Nombres y Apellidos', 'Saldos Contables', 'Dirección Domiciliaria', 'Historial Transaccional'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Cifrado en reposo AWS KMS AES-256', 'A.8.11 Enmascaramiento dinámico pgCrypto', 'A.5.18 Sin acceso root directo', 'Snapshots diarios'],
    retentionPeriod: '5 años tras cierre de cuenta (CMF NCG 464)',
    internationalTransfer: true
  },
  {
    id: 'DAT-DB-KYC',
    name: 'Bóveda Criptográfica Biometría & Identidad KYC (S3 + DynamoDB)',
    type: 'Base de Datos',
    category: 'Almacenamiento S3 / Bóvedas',
    description: 'Bóveda securizada que almacena las imágenes cifradas de anverso y reverso de cédulas de identidad, pasaportes y los vectores matemáticos de la prueba de vida facial 3D.',
    owner: 'Oficial de Protección de Datos (DPO) & CISO',
    technicalOwner: 'Security Engineering Lead (CloudTrail: s3-kyc-vault, CodeCommit: kyc-vault-terraform)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['Ciberseguridad', 'Cumplimiento', 'Fraude'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / Bóveda Biométrica',
    lastReviewDate: '2026-06-16',
    cValue: 5,
    iValue: 5,
    aValue: 4,
    authMethod: 'AWS IAM / SigV4',
    cloudInfrastructure: 'AWS us-east-1 (S3 Bucket con Bucket Policy restrictiva, KMS CMK Customer-Managed Key, Object Lock)',
    containsPersonalData: true,
    isSensitivePersonalData: true, // Datos Biométricos Sensibles Ley 21.719
    personalDataTypes: ['Vectores Biométricos Faciales 3D', 'Foto de Documento Oficial', 'Selfie de Prueba de Vida', 'Certificado de Validez Registral'],
    legalBasisLey21719: 'Consentimiento expreso e informado',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Cifrado KMS con rotación anual de llaves', 'A.8.11 Tokenización biométrica', 'A.8.10 S3 Object Lock Write-Once', 'A.5.15 RBAC de auditoría'],
    retentionPeriod: '5 años conforme a NCG 464 CMF',
    internationalTransfer: true
  },
  {
    id: 'DAT-DB-CARD-TOK',
    name: 'Bóveda de Tokenización PCI-DSS (Global Card)',
    type: 'Base de Datos',
    category: 'Criptografía & Identidad',
    description: 'Enclave aislado conforme a PCI-DSS Nivel 1 para tokenización irreversible de los números de tarjeta primaria (PAN de 16 dígitos) de Global Card Mastercard.',
    owner: 'CISO Corporativo & Gerente de Medios de Pago',
    technicalOwner: 'PCI Compliance Officer (CloudTrail: cloudhsm-pci, CodeCommit: card-tokenizer)',
    criticality: 'Crítica',
    classification: 'Altamente Confidencial',
    associatedProcesses: ['Ciberseguridad', 'Operaciones'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / Certificación PCI-DSS',
    lastReviewDate: '2026-06-17',
    cValue: 5,
    iValue: 5,
    aValue: 5,
    authMethod: 'mTLS Perimetral',
    cloudInfrastructure: 'AWS us-east-1 (AWS CloudHSM FIPS 140-2 Nivel 3, VPC Aislada con subredes privadas)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['PAN Tokenizado (Primeros 6 y últimos 4 dígitos visibles)', 'Token Criptográfico', 'Cardholder Name'],
    legalBasisLey21719: 'Ejecución contractual',
    dataSubjects: ['Clientes Persona Natural B2C'],
    securityMeasures: ['A.8.12 Cifrado de hardware HSM AES-256', 'A.5.18 Doble custodia de llaves criptográficas', 'A.8.20 Aislamiento total de red'],
    retentionPeriod: 'Durante la vigencia de la tarjeta + 5 años',
    internationalTransfer: true
  },
  {
    id: 'DAT-S3-CARTOLAS',
    name: 'Repositorio Cifrado de Cartolas y Conciliaciones (S3 Glacier/Standard)',
    type: 'Documento Digital',
    category: 'Almacenamiento S3 / Bóvedas',
    description: 'Almacén documental de reportes bancarios interbancarios, archivos XML/CSV de clearing y comprobantes contables de la Mesa de Dinero y Tesorería.',
    owner: 'Coordinador de Tesorería Regional',
    technicalOwner: 'Cloud Infrastructure Engineer (CloudTrail: s3-treasury-reports, CodeCommit: concilia-scripts)',
    criticality: 'Alta',
    classification: 'Confidencial',
    associatedProcesses: ['Mesa de Dinero', 'Operaciones'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / Manual de Conciliaciones',
    lastReviewDate: '2026-06-11',
    cValue: 4,
    iValue: 4,
    aValue: 4,
    authMethod: 'AWS IAM / SigV4',
    cloudInfrastructure: 'AWS us-east-1 (S3 Standard con transición automática a Glacier a los 90 días, Cifrado SSE-KMS)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['Cuentas Bancarias de Corredores', 'RUT de Clientes Transferentes', 'Montos en Moneda Local', 'Folios TEF'],
    legalBasisLey21719: 'Obligación legal (CMF / UAF)',
    dataSubjects: ['Clientes Persona Natural B2C', 'Clientes Empresa B2B'],
    securityMeasures: ['A.8.12 Cifrado SSE-KMS', 'A.8.10 Prevención de fuga DLP', 'A.8.2 Auditoría de descargas'],
    retentionPeriod: '5 años (CMF NCG 464)',
    internationalTransfer: true
  },
  {
    id: 'DAT-LOGS-TRAIL',
    name: 'Bóveda de Trazabilidad y Auditoría Inmutable (CloudTrail & Datadog)',
    type: 'Repositorio',
    category: 'Infraestructura Cloud & EKS',
    description: 'Sistema centralizado de registro de eventos de infraestructura AWS, despliegues de código, consultas administrativas y llamados a API Gateway.',
    owner: 'Líder de DevSecOps & Ciberseguridad',
    technicalOwner: 'SecOps Team Lead (CloudTrail: org-trail-logs, CodeCommit: datadog-forwarders)',
    criticality: 'Crítica',
    classification: 'Restringido',
    associatedProcesses: ['Ciberseguridad', 'TI', 'Cumplimiento'],
    originDoc: 'Inventario_Activos_Global66_Ley21719 / Plan de Auditoría',
    lastReviewDate: '2026-06-15',
    cValue: 4,
    iValue: 5,
    aValue: 5,
    authMethod: 'AWS IAM / SigV4',
    cloudInfrastructure: 'AWS us-east-1 (AWS CloudTrail con validación de integridad SHA-256, S3 WORM, Datadog SIEM)',
    containsPersonalData: true,
    isSensitivePersonalData: false,
    personalDataTypes: ['Direcciones IP de Administradores', 'User-Agent', 'ID de Usuario autenticado', 'Marca de Tiempo (Timestamp)', 'Recurso Consultado'],
    legalBasisLey21719: 'Interés legítimo',
    dataSubjects: ['Colaboradores Global66', 'Clientes Persona Natural B2C'],
    securityMeasures: ['A.8.2 Registro inmutable de eventos', 'A.8.12 Cifrado KMS', 'Alerta en tiempo real ante anomalías de root'],
    retentionPeriod: '3 años para ciberseguridad / 5 años para CMF',
    internationalTransfer: true
  },
  {
    id: 'DAT-REPO-CODE',
    name: 'Repositorios de Código Fuente y Tuberías CI/CD (AWS CodeCommit / GitLab)',
    type: 'Repositorio',
    category: 'Repositorio & CI/CD',
    description: 'Repositorio corporativo de control de versiones con el código fuente de los microservicios, infraestructura como código (Terraform) y tuberías automatizadas de despliegue.',
    owner: 'Gerente de Ingeniería de Software (VP of Engineering)',
    technicalOwner: 'DevOps Architect (CodeCommit: admin-group, CloudTrail: codecommit-git)',
    criticality: 'Crítica',
    classification: 'Restringido',
    associatedProcesses: ['TI', 'Ciberseguridad'],
    originDoc: 'ApiGw-resument / Catálogo de Servicios de Ingeniería',
    lastReviewDate: '2026-06-01',
    cValue: 4,
    iValue: 5,
    aValue: 4,
    authMethod: 'AWS IAM / SigV4',
    cloudInfrastructure: 'AWS us-east-1 (AWS CodeCommit, CodePipeline, CodeBuild, SonarQube SAST)',
    containsPersonalData: false,
    personalDataTypes: ['E-mail institucional de desarrolladores', 'Commits de código', 'Configuraciones de entorno'],
    legalBasisLey21719: 'Interés legítimo',
    dataSubjects: ['Colaboradores Global66'],
    securityMeasures: ['A.8.24 Desarrollo seguro de software', 'A.5.15 Aprobación de Pull Requests (Maker-Checker)', 'A.8.12 AWS Secrets Manager'],
    retentionPeriod: 'Permanente durante el ciclo de vida del producto',
    internationalTransfer: true
  }
];

// Catálogo Oficial de Clasificación de Datos Personales (Ley 21.719 Chile & ISO 27001)
export const DATA_CLASSIFICATION_CATALOG: DataClassificationItem[] = [
  {
    id: 'DATO-01',
    dataElementName: 'RUT / Cédula Nacional de Identidad / DNI',
    category: 'Identificatorio',
    isoClassification: 'Confidencial',
    isSensitiveLey21719: false,
    legalBasis: 'Ejecución contractual y Obligación legal (CMF NCG 464 / Ley 19.913)',
    primaryPurpose: 'Identificación univoca del cliente, apertura de cuenta de billetera y cumplimiento de debida diligencia.',
    associatedAssetIds: ['AST-GW-AUTH', 'AST-GW-WALLET', 'AST-GW-KYC', 'DAT-DB-WALLET'],
    storageLocation: 'AWS Aurora PostgreSQL us-east-1 (Cifrado KMS AES-256)',
    retentionPolicy: '5 años tras finalizar la relación contractual (exigencia CMF).',
    protectionControls: ['A.8.12 Cifrado en reposo', 'A.5.15 RBAC estricto', 'A.8.11 Enmascaramiento en Backoffice'],
    arcopRightsApplicable: ['Acceso', 'Rectificación', 'Portabilidad'],
    dataMaskingRule: 'Visualizar como XX.XXX.123-K en terminales operativas de soporte.'
  },
  {
    id: 'DATO-02',
    dataElementName: 'Vectores Biométricos Faciales & Prueba de Vida 3D',
    category: 'Biométrico / Sensible',
    isoClassification: 'Altamente Confidencial',
    isSensitiveLey21719: true, // Artículo 2 Ley 21.719 (Dato Sensible)
    legalBasis: 'Consentimiento expreso, informado e inequívoco del titular.',
    primaryPurpose: 'Verificación biométrica en tiempo real para prevenir suplantación de identidad y fraude de onboarding.',
    associatedAssetIds: ['AST-GW-KYC', 'DAT-DB-KYC'],
    storageLocation: 'Bóveda Criptográfica KYC AWS S3 + AWS Rekognition (KMS CMK Dedicado)',
    retentionPolicy: 'Conservación durante el vínculo activo + 5 años para peritaje de fraude regulatorio.',
    protectionControls: ['A.8.12 Encriptación con llaves HSM dedicadas', 'A.8.11 No persistencia de imágenes en crudo', 'A.5.18 Acceso zero-trust'],
    arcopRightsApplicable: ['Acceso', 'Supresión', 'Oposición'],
    dataMaskingRule: 'Representación matemática no reversible (hash criptográfico irreversible).'
  },
  {
    id: 'DATO-03',
    dataElementName: 'Fotografía de Documento de Identidad Oficial (Cédula/Pasaporte)',
    category: 'Biométrico / Sensible',
    isoClassification: 'Altamente Confidencial',
    isSensitiveLey21719: true,
    legalBasis: 'Consentimiento informado y Obligación regulatoria de verificación CMF.',
    primaryPurpose: 'Cotejo contra Registro Civil y validación de autenticidad documental.',
    associatedAssetIds: ['AST-GW-KYC', 'DAT-DB-KYC'],
    storageLocation: 'AWS S3 Bucket privado con Object Lock y SSE-KMS',
    retentionPolicy: '5 años (CMF NCG 464).',
    protectionControls: ['A.8.10 DLP contra descarga', 'A.8.12 Cifrado AES-256', 'A.8.2 Logs de acceso de auditoría'],
    arcopRightsApplicable: ['Acceso', 'Rectificación', 'Supresión'],
    dataMaskingRule: 'Marcas de agua dinámicas con fecha, usuario visualizador y RUT al visualizar.'
  },
  {
    id: 'DATO-04',
    dataElementName: 'Saldos de Billetera Multidivisa y Movimientos Contables',
    category: 'Financiero y Transaccional',
    isoClassification: 'Confidencial',
    isSensitiveLey21719: false,
    legalBasis: 'Ejecución del contrato de cuenta de pago con provisión de fondos.',
    primaryPurpose: 'Registro y custodia de fondos del cliente, procesamiento de cobros y dispersiones.',
    associatedAssetIds: ['AST-GW-WALLET', 'DAT-DB-WALLET', 'AST-GW-REMIT'],
    storageLocation: 'Amazon Aurora PostgreSQL Multi-AZ (Particionado transaccional)',
    retentionPolicy: '5 años (CMF NCG 464).',
    protectionControls: ['A.8.12 Cifrado en reposo', 'A.8.2 Auditoría inmutable de doble partida contable', 'A.5.15 RBAC'],
    arcopRightsApplicable: ['Acceso', 'Rectificación', 'Portabilidad'],
    dataMaskingRule: 'Sin enmascaramiento para el titular; visualización cifrada para operadores con rol sin privilegios.'
  },
  {
    id: 'DATO-05',
    dataElementName: 'PAN Tokenizado de Tarjeta Prepago (16 dígitos) & Fechas',
    category: 'Financiero y Transaccional',
    isoClassification: 'Altamente Confidencial',
    isSensitiveLey21719: false,
    legalBasis: 'Ejecución del contrato de tarjeta Global Card S.P.A. (Mastercard).',
    primaryPurpose: 'Autorización y compensación de transacciones en comercios físicos y de e-commerce.',
    associatedAssetIds: ['AST-GW-CARD', 'DAT-DB-CARD-TOK'],
    storageLocation: 'Bóveda de Tokenización PCI-DSS AWS CloudHSM Nivel 1',
    retentionPolicy: 'Durante la vigencia de la tarjeta + 5 años por prescripción legal.',
    protectionControls: ['A.8.12 Enclave HSM FIPS 140-2', 'A.8.11 Tokenización PCI-DSS', 'A.8.20 Aislamiento total'],
    arcopRightsApplicable: ['Acceso', 'Rectificación', 'Supresión'],
    dataMaskingRule: 'Estricto enmascaramiento PCI: únicamente visible como **** **** **** 1234.'
  },
  {
    id: 'DATO-06',
    dataElementName: 'Credenciales de Acceso, Hashes de Contraseña y Llaves API',
    category: 'Credenciales y Criptografía',
    isoClassification: 'Altamente Confidencial',
    isSensitiveLey21719: false,
    legalBasis: 'Seguridad de la información y ejecución contractual.',
    primaryPurpose: 'Autenticación criptográfica segura del titular y prevención de ataques de fuerza bruta.',
    associatedAssetIds: ['AST-GW-AUTH', 'DAT-REPO-CODE'],
    storageLocation: 'AWS Cognito User Pools + AWS Secrets Manager',
    retentionPolicy: 'Vigente hasta actualización por el usuario o revocación inmediata tras inactividad.',
    protectionControls: ['A.8.12 Algoritmo Argon2id con salt aleatorio', 'A.5.18 Sin acceso de texto plano jamás'],
    arcopRightsApplicable: ['Rectificación'],
    dataMaskingRule: 'Nunca revelado; solo verificación síncrona de hash criptográfico.'
  },
  {
    id: 'DATO-07',
    dataElementName: 'Cuentas Bancarias de Destino e Interbancarias (TEF / CBU / IBAN)',
    category: 'Financiero y Transaccional',
    isoClassification: 'Confidencial',
    isSensitiveLey21719: false,
    legalBasis: 'Ejecución del contrato de remesas y transferencias.',
    primaryPurpose: 'Despacho de remesas a bancos corresponsales y devolución de fondos.',
    associatedAssetIds: ['AST-GW-REMIT', 'AST-GW-BANK', 'DAT-DB-WALLET'],
    storageLocation: 'AWS Aurora PostgreSQL us-east-1',
    retentionPolicy: '5 años tras la última transacción asociada.',
    protectionControls: ['A.8.12 TLS 1.3 mTLS bancario', 'A.5.15 Validación de titularidad contra banco'],
    arcopRightsApplicable: ['Acceso', 'Rectificación', 'Supresión', 'Portabilidad'],
    dataMaskingRule: 'Enmascaramiento parcial en notificaciones: Banco XXX - Cta ****5678.'
  },
  {
    id: 'DATO-08',
    dataElementName: 'Condición PEP (Persona Expuesta Políticamente) y Scoring AML',
    category: 'Cumplimiento / AML / PEP',
    isoClassification: 'Altamente Confidencial',
    isSensitiveLey21719: true,
    legalBasis: 'Obligación legal imperativa (Ley 19.913 UAF Chile / NCG 464 CMF).',
    primaryPurpose: 'Monitoreo reforzado de operaciones financieras y prevención de financiamiento del terrorismo.',
    associatedAssetIds: ['AST-GW-AML', 'AST-GW-OPS'],
    storageLocation: 'Instancia aislada AWS OpenSearch & PostgreSQL Compliance',
    retentionPolicy: '10 años (exigencia legal Ley 19.913 de la UAF).',
    protectionControls: ['A.5.15 Acceso exclusivo del Oficial de Cumplimiento', 'A.8.2 Logs no borrables'],
    arcopRightsApplicable: ['Acceso', 'Rectificación'],
    dataMaskingRule: 'Reserva legal estricta; prohibida su divulgación al cliente (regla de no-tipping-off).'
  },
  {
    id: 'DATO-09',
    dataElementName: 'Teléfono Móvil y Correo Electrónico Personal',
    category: 'Identificatorio',
    isoClassification: 'Restringido',
    isSensitiveLey21719: false,
    legalBasis: 'Ejecución contractual y Consentimiento para comunicaciones informativas.',
    primaryPurpose: 'Canal seguro para envío de códigos OTP, comprobantes de remesa y soporte.',
    associatedAssetIds: ['AST-GW-AUTH', 'AST-GW-NOTIF', 'DAT-DB-WALLET'],
    storageLocation: 'Amazon Aurora PostgreSQL + Amazon SNS',
    retentionPolicy: 'Vínculo activo + 5 años.',
    protectionControls: ['A.8.12 Cifrado KMS', 'A.8.10 Control de envíos masivos'],
    arcopRightsApplicable: ['Acceso', 'Rectificación', 'Supresión', 'Oposición'],
    dataMaskingRule: 'Ocultar dígitos centrales en SMS: +56 9 **** 1234.'
  },
  {
    id: 'DATO-10',
    dataElementName: 'Direcciones IP, Huella de Dispositivo (Device Fingerprint) y Logs',
    category: 'Telemático y Conexión',
    isoClassification: 'Restringido',
    isSensitiveLey21719: false,
    legalBasis: 'Interés legítimo y Seguridad de la infraestructura (Prevención de ciberataques).',
    primaryPurpose: 'Detección de accesos concurrentes anómalos, secuestro de sesión y ataques de credential stuffing.',
    associatedAssetIds: ['AST-GW-AUTH', 'DAT-LOGS-TRAIL'],
    storageLocation: 'AWS CloudTrail & Datadog SIEM',
    retentionPolicy: '3 años para análisis forense de seguridad.',
    protectionControls: ['A.8.2 Auditoría continua', 'A.8.20 WAF Security Rules', 'A.8.12 Cifrado'],
    arcopRightsApplicable: ['Acceso'],
    dataMaskingRule: 'Anonimización del último octeto de IP tras 180 días (192.168.1.0/24).'
  },
  {
    id: 'DATO-11',
    dataElementName: 'Cartolas Bancarias y Comprobantes de Conciliación Interbancaria',
    category: 'Financiero y Transaccional',
    isoClassification: 'Confidencial',
    isSensitiveLey21719: false,
    legalBasis: 'Obligación legal contable y tributaria.',
    primaryPurpose: 'Cuadre diario de posiciones de liquidez con adquirentes y bancos corresponsales.',
    associatedAssetIds: ['AST-GW-BANK', 'DAT-S3-CARTOLAS'],
    storageLocation: 'AWS S3 Standard/Glacier con cifrado SSE-KMS',
    retentionPolicy: '5 años conforme a normativa tributaria y CMF.',
    protectionControls: ['A.8.10 DLP de bloqueo de descargas locales', 'A.8.12 Cifrado KMS'],
    arcopRightsApplicable: ['Acceso'],
    dataMaskingRule: 'Nombres y cuentas de terceros no involucrados anonimizados en exhibiciones.'
  },
  {
    id: 'DATO-12',
    dataElementName: 'Tasas de Cambio Spot, Spreads y Cotizaciones de Mercado FX',
    category: 'Financiero y Transaccional',
    isoClassification: 'Público',
    isSensitiveLey21719: false,
    legalBasis: 'Interés legítimo (Transparencia de precios al consumidor).',
    primaryPurpose: 'Exhibición pública de cotizaciones de transferencia en web y app móvil.',
    associatedAssetIds: ['AST-GW-FX'],
    storageLocation: 'AWS CloudFront Edge Cache + Redis',
    retentionPolicy: 'Caché en tiempo real (15 minutos de vigencia por cotización).',
    protectionControls: ['A.8.20 Cloudflare CDN WAF', 'A.8.14 Alta disponibilidad'],
    arcopRightsApplicable: [],
    dataMaskingRule: 'Público sin restricciones.'
  }
];
