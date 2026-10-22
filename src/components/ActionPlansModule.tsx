import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  BookOpen, 
  CheckSquare, 
  UploadCloud, 
  FileText, 
  Calendar, 
  User, 
  TrendingUp, 
  Plus, 
  Clock, 
  Trash2, 
  Award, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Download,
  Search,
  Filter,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Risk, ProcessArea, getRiskLevel, getRiskColor } from '../types';
import { MULTITARJETA_ACTION_PLANS } from '../data/multitarjetaRisks';
import { FLUJO_BLOQUEOS_ACTION_PLANS } from '../data/flujoBloqueosRisks';
import { TARJETAS_TEMPORALES_ACTION_PLANS } from '../data/tarjetasTemporalesRisks';
import { CONCILIACIONES_ACTION_PLANS } from '../data/conciliacionesRisks';
import { PAYOUT_SWIFT_JPMORGAN_ACTION_PLANS } from '../data/payoutSwiftJPMorganRisks';
import { GLOBAL_CHATS_ACTION_PLANS } from '../data/globalChatsRisks';
import { CCE_PERU_ACTION_PLANS } from '../data/ccePeruRisks';
import { API_B2B_MCP_ACTION_PLANS } from '../data/apiB2bMcpRisks';
import { STABLECOINS_ACTION_PLANS } from '../data/stablecoinsRisks';

interface ActionPlansModuleProps {
  risks: Risk[];
  onUpdateRisk?: (riskId: string, updates: Partial<Risk>) => void;
}

// Interfaces for our independent compliance module
interface TreatmentPlan {
  id: string;
  riskId?: string; // Optional link to a Matrix Risk
  riskTitle: string;
  processArea: ProcessArea;
  strategy: 'Resolved' | 'Owned' | 'Accepted' | 'Mitigated';
  responsible: string;
  targetDate: string;
  progress: number; // 0 - 100
  tasks: string;
  status: 'Por iniciar' | 'En proceso' | 'Completado' | 'Vencido';
  budget?: string;
  framework: 'Continuidad' | 'SARO' | 'SICB' | 'Fraude' | 'ISO 31000';
  evidences: Array<{ name: string; size: string; date: string; url: string }>;
}

interface RiskEventPlan {
  id: string;
  eventTitle: string;
  eventDate: string;
  impactUSD: number;
  processArea: ProcessArea;
  description: string;
  immediateCorrectiveAction: string;
  longTermPreventativeAction: string;
  responsible: string;
  status: 'Abierto' | 'Planificado' | 'En Mitigación' | 'Cerrado';
  framework: 'Continuidad' | 'SARO' | 'SICB' | 'Fraude' | 'ISO 31000';
  evidences: Array<{ name: string; size: string; date: string; url: string }>;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  area: string;
  questions: Question[];
}

const KNOWLEDGE_QUIZZES: Quiz[] = [
  {
    id: 'quiz-iso31000',
    title: 'Metodología ISO 31000 & Marco ROAM',
    description: 'Valida tu entendimiento sobre la gestión de riesgos corporativos, la matriz de calor, los criterios de aceptabilidad y las respuestas ROAM en Global66.',
    area: 'Riesgo Corporativo',
    questions: [
      {
        id: 1,
        text: '¿Qué significan las siglas de la metodología ROAM utilizada para clasificar la respuesta a los riesgos?',
        options: [
          'Resolved (Resuelto), Owned (Asignado), Accepted (Aceptado), Mitigated (Mitigado)',
          'Risk (Riesgo), Operation (Operación), Audit (Auditoría), Mitigation (Mitigación)',
          'Review (Revisión), Ownership (Propiedad), Action (Acción), Monitoring (Monitoreo)',
          'Real-time (Tiempo Real), Output (Salida), Asset (Activo), Measurement (Medible)'
        ],
        correctIndex: 0,
        explanation: 'ROAM es un framework ágil: Resolved (riesgo eliminado), Owned (asignado con responsable pero sin solución final), Accepted (tolerado por costo-beneficio bajo límites de apetito), Mitigated (disminuido en impacto/probabilidad mediante salvaguardas).'
      },
      {
        id: 2,
        text: 'Bajo los criterios aprobados de Global66 conforme a ISO 31000, ¿cuándo se considera un riesgo como "No Aceptable"?',
        options: [
          'Únicamente si causa pérdidas financieras superiores a 1 millón de USD.',
          'Si su Nivel de Riesgo (NR) resulta "Alto" o "Extremo" (Score superior a 12), requiriendo tratamiento urgente.',
          'Cuando el Oficial de Cumplimiento decide de forma subjetiva sin usar la matriz.',
          'Si la probabilidad de ocurrencia es de nivel 1 (Muy rara).'
        ],
        correctIndex: 1,
        explanation: 'Según la directriz de aceptabilidad basada en el nivel de riesgo: Verde (Bajo) y Amarillo (Moderado) son Aceptables, mientras que Naranja (Alto) y Rojo (Extremo) son obligatoriamente No Aceptables y requieren mitigación inmediata.'
      },
      {
        id: 3,
        text: '¿Qué acción de tratamiento es la más recomendada si un riesgo tiene impacto Extremo pero su eliminación paralizaría la operación comercial?',
        options: [
          'Ignorar el riesgo para no afectar el negocio.',
          'Mitigated (Mitigado): Aplicar controles combinados o automáticos para reducir su probabilidad o impacto residual a niveles de apetito tolerables.',
          'Resolved (Resuelto): Cancelar permanentemente todo el servicio sin importar las pérdidas.',
          'Accepted (Aceptado): Dejarlo sin ningún cambio ni supervisión.'
        ],
        correctIndex: 1,
        explanation: 'En estos escenarios, la estrategia Mitigated permite operar implementando controles preventivos, detectivos y de respuesta automática que controlen la vulnerabilidad técnica u operativa.'
      }
    ]
  },
  {
    id: 'quiz-iso27001',
    title: 'ISO 27001:2022 y Tríada de Seguridad (CIA)',
    description: 'Comprueba el dominio sobre los controles de seguridad TI, activos de información y variables del Anexo A.',
    area: 'Ciberseguridad & TI',
    questions: [
      {
        id: 1,
        text: 'En la gestión de activos TI basados en ISO 27001, ¿qué representa la Tríada CIA?',
        options: [
          'Centralized Identity, Authentication & Rights',
          'Confidencialidad, Integridad y Disponibilidad (Availability) de la información',
          'Compliance, Incident Response & Auditing',
          'Cloud Infrastructure, Assets & Security Controls'
        ],
        correctIndex: 1,
        explanation: 'La Tríada de Seguridad de la Información se compone de Confidencialidad (evitar divulgación no autorizada), Integridad (evitar alteraciones fraudulentas) y Disponibilidad (asegurar el acceso oportuno).'
      },
      {
        id: 2,
        text: 'El control de Anexo A "A.8.24 Desarrollo Seguro de Software" busca principalmente:',
        options: [
          'Acelerar las entregas de producción sin filtros técnicos.',
          'Establecer reglas y directrices de programación y análisis de vulnerabilidades integradas en el ciclo del software.',
          'Comprar software de terceros exclusivamente sin validaciones internas.',
          'Bloquear el acceso a internet para todos los desarrolladores.'
        ],
        correctIndex: 1,
        explanation: 'El control A.8.24 exige el aseguramiento técnico de las APIs y plataformas a través de pipelines automatizados (CI/CD) con escaneo estático y dinámico de código para mitigar inyecciones o fallas lógicas.'
      },
      {
        id: 3,
        text: 'Si descubrimos que una base de datos PostgreSQL almacena claves de paso o tokens en texto plano, ¿qué control ISO 27001 se está incumpliendo gravemente?',
        options: [
          'A.8.14 Redundancia operacional',
          'A.7.4 Concienciación en seguridad de la información',
          'A.8.12 Cifrado (Criptografía)',
          'A.5.15 Control de accesos'
        ],
        correctIndex: 2,
        explanation: 'Se falta gravemente al control A.8.12 (Criptografía), el cual prescribe el encriptado asimétrico o de hashes irreversibles para salvaguardar claves e información de identificación confidencial en reposo.'
      }
    ]
  }
];

// Seed list of Certified users
const INITIAL_CERTIFICATIONS = [
  { name: 'María Gutiérrez', testName: 'Metodología ISO 31000 & Marco ROAM', score: '3 / 3', date: '2026-06-12', result: 'APROBADO' },
  { name: 'Andrés López (SRE Lead)', testName: 'ISO 27001:2022 y Tríada de Seguridad', score: '3 / 3', date: '2026-06-14', result: 'APROBADO' },
  { name: 'Diana Cáceres (Analista Ops)', testName: 'Metodología ISO 31000 & Marco ROAM', score: '2 / 3', date: '2026-06-15', result: 'APROBADO' }
];

export const ActionPlansModule: React.FC<ActionPlansModuleProps> = ({ risks, onUpdateRisk }) => {
  const [activeSubTab, setActiveSubTab] = useState<'treatment' | 'events' | 'quiz'>('treatment');
  const [frameworkFilter, setFrameworkFilter] = useState<'TODOS' | 'Continuidad' | 'SARO' | 'SICB' | 'Fraude' | 'ISO 31000'>('TODOS');

  // Treatment Plans State loaded from localStorage
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>(() => {
    const saved = localStorage.getItem('g66_treatment_plans');
    let plansList: TreatmentPlan[] = [];
    if (saved) {
      try { 
        plansList = JSON.parse(saved); 
        if (Array.isArray(plansList)) {
          plansList = plansList.filter(p => !p.id?.startsWith('PLN-STC-') && !p.riskId?.startsWith('R-STC-'));
        }
      } catch (e) { 
        console.error(e); 
      }
    }
    
    // Default initial list
    const defaults: TreatmentPlan[] = [
      {
        id: 'PLN-TR-01',
        riskId: 'R-OPS-011',
        riskTitle: 'Vulnerabilidad de fraude interno o acreditación errónea de fondos en Portal Admin',
        processArea: 'Operaciones',
        strategy: 'Mitigated',
        responsible: 'Supervisor de Operaciones de Pago',
        targetDate: '2026-07-15',
        progress: 60,
        tasks: 'Desplegar flujo integrado Maker-Checker en consola administrativa, limitando dobles abonos de saldo y requiriendo un token dinámico OTP.',
        status: 'En proceso',
        budget: '$8,500 USD',
        framework: 'SARO',
        evidences: [{ name: 'flujo_maker_checker_mockup.jpeg', size: '245 KB', date: '2026-06-14', url: '#' }]
      },
      {
        id: 'PLN-TR-02',
        riskId: 'R-CIB-002',
        riskTitle: 'Seguridad en Webhooks e Integraciones perimetrales',
        processArea: 'Ciberseguridad',
        strategy: 'Mitigated',
        responsible: 'Coordinador de Ciberseguridad',
        targetDate: '2026-06-30',
        progress: 100,
        tasks: 'Activar escudo de mitigación selectivo en Cloudflare Enterprise con WAF restrictivo para la subida de parámetros y firmas criptográficas RSA.',
        status: 'Completado',
        budget: '$12,000 USD',
        framework: 'SARO',
        evidences: [
          { name: 'reporte_WAF_activacion_firmado.pdf', size: '1.2 MB', date: '2026-06-10', url: '#' },
          { name: 'tests_estres_volumetrico_cloudflare.xlsx', size: '320 KB', date: '2026-06-11', url: '#' }
        ]
      },
      {
        id: 'PLN-TR-03',
        riskId: 'R-COM-003',
        riskTitle: 'Sanción regulatoria o multas por fallas de alertas en Prevención de Lavado (AML/KYT)',
        processArea: 'Cumplimiento',
        strategy: 'Owned',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-08-01',
        progress: 20,
        tasks: 'Automatizar el flujo unificado de alertas transaccionales cruzadas entre pasarelas de pago y portales contables en tiempo real, estableciendo topes máximos diarios acumulativos en Split Bill y gatillando alarmas de velocidad directas al Oficial de Cumplimiento.',
        status: 'En proceso',
        budget: '$5,000 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-01',
        riskId: 'R-COM-001',
        riskTitle: 'Onboarding Digital de Clientes y Verificación Biométrica',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-07-25',
        progress: 35,
        tasks: 'Integrar un motor de vitalidad activa (Liveness Check dinámico) en el flujo de registro móvil con cruce de información en tiempo real contra las bases de datos de identificación del Registro Civil de cada país.',
        status: 'En proceso',
        budget: '$9,000 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-02',
        riskId: 'R-COM-002',
        riskTitle: 'Programa Anual Obligatorio de Capacitación de Primera Línea en AML/FT',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento',
        targetDate: '2026-08-15',
        progress: 50,
        tasks: 'Diseñar y dictar el programa de capacitación obligatorio y anual sobre señales de alerta de lavado de activos y financiamiento del terrorismo, aplicando evaluaciones de suficiencia con reporte directo al directorio.',
        status: 'En proceso',
        budget: '$2,500 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-04',
        riskId: 'R-COM-004',
        riskTitle: 'Unificación de Cruces Multiactivo de Debida Diligencia',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-09-10',
        progress: 10,
        tasks: 'Desarrollar un panel de control consolidado de debida diligencia dentro del Portal Admin que enlace automáticamente datos transaccionales, alertas de Inspektor e historial de cuentas, sustituyendo los cruces de información manuales en planillas Excel.',
        status: 'En proceso',
        budget: '$7,200 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-05',
        riskId: 'R-COM-005',
        riskTitle: 'Adquisición e Integración de Herramienta GRC Corporativa',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-10-01',
        progress: 15,
        tasks: 'Evaluar, adquirir e integrar un software GRC homologado para el registro inmutable de riesgos corporativos, documentación de controles y auditoría de propietarios de tratamiento ROAM con alertas automáticas de vencimiento.',
        status: 'En proceso',
        budget: '$15,000 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-CHILE',
        riskId: 'R-COM-CHILE-01',
        riskTitle: 'Prevención de Fraccionamiento de Depósitos Mensuales (Pitufeo - Chile)',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Chile',
        targetDate: '2026-08-30',
        progress: 40,
        tasks: 'Desplegar un script de agregación transaccional parametrizado sobre las cuentas en pesos chilenos (CLP) que agrupe mensualmente montos por RUT emisor, disparando alertas de fraccionamiento sospechoso antes de la emisión mensual de reportes a la UAF.',
        status: 'En proceso',
        budget: '$6,000 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-SPLIT',
        riskId: 'R-COM-SPLIT-01',
        riskTitle: 'Límites Acumulativos y Monitoreo de Transacciones Recíprocas en Split Bill',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-07-20',
        progress: 70,
        tasks: 'Implementar controles sistémicos que limiten montos acumulados diarios y mensuales en la opción de cobros Split Bill, bloqueando transacciones recíprocas rápidas entre cuentas vinculadas para prevenir lavado de activos.',
        status: 'En proceso',
        budget: '$4,000 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-31000',
        riskId: 'R-G66-31000-01',
        riskTitle: 'Análisis Transaccional Síncrono de Depósitos No Homónimos',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-08-20',
        progress: 30,
        tasks: 'Migrar el monitoreo preventivo de depósitos de terceros no homónimos de lotes nocturnos diferidos a un pipeline de análisis síncrono en tiempo real, bloqueando automáticamente transferencias sospechosas antes de su abono en la wallet.',
        status: 'En proceso',
        budget: '$11,000 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-EC',
        riskId: 'R-G66-EC-01',
        riskTitle: 'Monitoreo de Volumen y Velocidad en Cuentas USD (Ecuador)',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Ecuador',
        targetDate: '2026-08-25',
        progress: 25,
        tasks: 'Configurar parámetros automáticos de velocidad y volumen para transacciones en dólares en Ecuador, generando bitácoras de alertas e interrumpiendo retiros si se superan los umbrales de riesgo permitidos.',
        status: 'En proceso',
        budget: '$4,500 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-COM-INT',
        riskId: 'R-G66-INT-01',
        riskTitle: 'Módulo de Control Continuo Síncrono para Bloqueo Transfronterizo',
        processArea: 'Cumplimiento',
        strategy: 'Mitigated',
        responsible: 'Oficial de Cumplimiento Regional',
        targetDate: '2026-09-05',
        progress: 10,
        tasks: 'Diseñar y habilitar un microservicio de control continuo síncrono en la API central de dispersión de remesas que realice un bloqueo preventivo automático de giros internacionales cuando se detecten patrones de volumen inusuales.',
        status: 'En proceso',
        budget: '$13,500 USD',
        framework: 'SARO',
        evidences: []
      },
      {
        id: 'PLN-TR-04',
        riskId: 'R-FRA-001',
        riskTitle: 'Vulnerabilidad y fraude por suplantación en retiros transaccionales de clientes',
        processArea: 'Fraude',
        strategy: 'Mitigated',
        responsible: 'Gerente de Prevención de Fraudes',
        targetDate: '2026-07-30',
        progress: 45,
        tasks: 'Migrar de verificación SMS a TOTP obligatorio (App Authenticator) o biometría facial en retiros con montos acumulados altos.',
        status: 'En proceso',
        budget: '$6,200 USD',
        framework: 'SARO',
        evidences: []
      },
      ...MULTITARJETA_ACTION_PLANS,
      ...FLUJO_BLOQUEOS_ACTION_PLANS,
      ...TARJETAS_TEMPORALES_ACTION_PLANS,
      ...CONCILIACIONES_ACTION_PLANS,
      ...PAYOUT_SWIFT_JPMORGAN_ACTION_PLANS,
      ...GLOBAL_CHATS_ACTION_PLANS,
      ...CCE_PERU_ACTION_PLANS,
      ...API_B2B_MCP_ACTION_PLANS,
      ...STABLECOINS_ACTION_PLANS
    ];

    // Ensure all default plans are included in the loaded list if not already present
    const merged = [...plansList];
    defaults.forEach(def => {
      const idx = merged.findIndex(m => m.id === def.id);
      if (idx === -1) {
        merged.push(def);
      } else {
        // Update default values to match latest schema & active risk links
        merged[idx] = {
          ...def,
          // keep user's progress & status & evidences if they had custom edits
          progress: merged[idx].progress !== undefined ? merged[idx].progress : def.progress,
          status: merged[idx].status || def.status,
          evidences: merged[idx].evidences || def.evidences
        };
      }
    });

    return merged.map(p => {
      // Migrate legacy risk IDs from previous database schema to current active risk IDs
      if (p.riskId === 'RSK-OP-01') {
        p.riskId = 'R-OPS-011';
        p.riskTitle = 'Vulnerabilidad de fraude interno o acreditación errónea de fondos en Portal Admin';
      } else if (p.riskId === 'RSK-CY-01') {
        p.riskId = 'R-CIB-002';
        p.riskTitle = 'Seguridad en Webhooks e Integraciones perimetrales';
      } else if (p.riskId === 'RSK-CP-01') {
        p.riskId = 'R-COM-003';
        p.riskTitle = 'Sanción regulatoria o multas por fallas de alertas en Prevención de Lavado (AML/KYT)';
      }

      // Force framework 'SARO' for matrix-related action plans
      p.framework = 'SARO';
      
      return p;
    });
  });

  // Risk Event Plans (Incident logs) state loaded from localStorage
  const [eventPlans, setEventPlans] = useState<RiskEventPlan[]>(() => {
    const saved = localStorage.getItem('g66_event_plans');
    let eventsList: RiskEventPlan[] = [];
    if (saved) {
      try { 
        eventsList = JSON.parse(saved); 
      } catch (e) { 
        console.error(e); 
      }
    }
    
    // Default initial list
    const defaults: RiskEventPlan[] = [
      {
        id: 'EVNT-2026-01',
        eventTitle: 'Intento de SIM Swapping y Suplantación en Ecuador',
        eventDate: '2026-05-10',
        impactUSD: 18500,
        processArea: 'Fraude',
        description: 'Se detectó el registro de 14 cuentas utilizando fotos estáticas alteradas en el flujo biométrico para el cobro ilícito de cupones interbancarios.',
        immediateCorrectiveAction: 'Bloqueo inmediato de las cuentas implicadas y del rango IP agresor. Reporte formal remitido a la Fiscalía ecuatoriana.',
        longTermPreventativeAction: 'Habilitar Liveness check dinámico en 3D interactivo con validación de metadatos de cámara en el frontend móvil.',
        responsible: 'Gerente de Prevención de Fraudes',
        status: 'En Mitigación',
        framework: 'Fraude',
        evidences: [{ name: 'informe_identidades_ficticias.pdf', size: '480 KB', date: '2026-05-15', url: '#' }]
      },
      {
        id: 'EVNT-2026-02',
        eventTitle: 'Fuga de Cartola de Mesa de Dinero por Correo Electrónico',
        eventDate: '2026-06-02',
        impactUSD: 0,
        processArea: 'Ciberseguridad',
        description: 'Exfiltración accidental de hoja Excel con reporte cambiario consolidado hacia dominio no registrado externa al corredor autorizado.',
        immediateCorrectiveAction: 'Solicitud de purga remota a través de herramientas G Suite Admin y revocación temporal del correo de egreso.',
        longTermPreventativeAction: 'Imponer suites obligatorias de Endpoint DLP que prohíban la salida de hojas con el tag "Privacidad Financiera".',
        responsible: 'Coordinador de Ciberseguridad',
        status: 'Cerrado',
        framework: 'SARO',
        evidences: [{ name: 'auditoria_correo_saliente_comprobada.pdf', size: '210 KB', date: '2026-06-04', url: '#' }]
      },
      {
        id: 'EVNT-2026-03',
        eventTitle: 'Caída de Enlace Host-to-Host Banco Guayaquil con afectación transaccional',
        eventDate: '2026-05-24',
        impactUSD: 12000,
        processArea: 'Operaciones',
        description: 'Se perdió enlace con el nodo del partner bancario ecuatoriano por cambio imprevisto de tokens SSL, paralizando acreditaciones automáticas de wallets por 4 horas.',
        immediateCorrectiveAction: 'Acreditación manual compensada basada en queries de contingencia en portal secundario.',
        longTermPreventativeAction: 'Establecer mTLS con rotación automatizada e implementar webhook de alerta de latencia.',
        responsible: 'SRE Team Lead',
        status: 'Cerrado',
        framework: 'Continuidad',
        evidences: []
      },
      {
        id: 'EVNT-2026-04',
        eventTitle: 'Demora en envío de reporte mensual de fraccionamiento a la UAF',
        eventDate: '2026-06-01',
        impactUSD: 0,
        processArea: 'Cumplimiento',
        description: 'Se identificó desfase en el envío obligatorio por error de agregación manual de planillas Excel de descripciones bancarias sospechosas.',
        immediateCorrectiveAction: 'Elaboración express del reporte manual y remisión de justificaciones preliminares al ente de supervisión.',
        longTermPreventativeAction: 'Implementar agregación automática por RUT/DNI directo en el sistema de Business Intelligence.',
        responsible: 'Oficial de Cumplimiento',
        status: 'En Mitigación',
        framework: 'SICB',
        evidences: []
      },
      {
        id: 'EVNT-2026-ADQ-01',
        eventTitle: 'Bloqueo y Retención de $128,598 USD en Adquirencia Global por Fraude vía Inswitch',
        eventDate: '2026-09-30',
        impactUSD: 128598,
        processArea: 'Fraude',
        description: 'Bloqueo de cuenta recaudadora y congelamiento de $128,598 USD correspondientes a 78 transacciones fraudulentas detectadas desde el 30 de septiembre en Colombia (múltiples tarjetas, rechazos y mismos usuarios).',
        immediateCorrectiveAction: 'Apagado preventivo inmediato del producto de Adquirencia Global (PayIn y Link de Cobro) y convocatoria a mesa de trabajo de crisis con Inswitch.',
        longTermPreventativeAction: 'Auditoría forense tripartita, renegociación contractual de SLA T+0 y despliegue de motor de IA propio para reglas de velocidad y device fingerprinting.',
        responsible: 'Leopoldo Soto (Head of Fraud) / José Pedro Margozzini (Ops)',
        status: 'En Mitigación',
        framework: 'Fraude',
        evidences: [
          { name: 'Alerta_Inswitch_78_txs_128k_USD.pdf', size: '1.2 MB', date: '2026-10-02', url: '#' },
          { name: 'Minuta_Comite_Crisis_Adquirencia_Global.pdf', size: '420 KB', date: '2026-10-02', url: '#' }
        ]
      }
    ];

    if (eventsList.length === 0) {
      return defaults;
    }

    // Ensure adquirencia event plan is present in eventsList
    const hasAdq = eventsList.some(ev => ev.id === 'EVNT-2026-ADQ-01');
    const fullList = hasAdq ? eventsList : [defaults[defaults.length - 1], ...eventsList];

    // Ensure all events have a framework property
    return fullList.map(ev => {
      if (!ev.framework) {
        if (ev.id === 'EVNT-2026-01') ev.framework = 'Fraude';
        else if (ev.id === 'EVNT-2026-02') ev.framework = 'SARO';
        else if (ev.id === 'EVNT-2026-03') ev.framework = 'Continuidad';
        else if (ev.id === 'EVNT-2026-04') ev.framework = 'SICB';
        else if (ev.id === 'EVNT-2026-ADQ-01') ev.framework = 'Fraude';
        else ev.framework = 'SARO'; // Safe default
      }
      return ev;
    });
  });

  // Certifications list state
  const [certifications, setCertifications] = useState(() => {
    const saved = localStorage.getItem('g66_certifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CERTIFICATIONS;
  });

  // Persists states in localStorage
  useEffect(() => {
    localStorage.setItem('g66_treatment_plans', JSON.stringify(treatmentPlans));
  }, [treatmentPlans]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem('g66_treatment_plans');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTreatmentPlans(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('g66_plans_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('g66_plans_updated', handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('g66_event_plans', JSON.stringify(eventPlans));
  }, [eventPlans]);

  useEffect(() => {
    localStorage.setItem('g66_certifications', JSON.stringify(certifications));
  }, [certifications]);

  // Form states
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [planFormData, setPlanFormData] = useState<Omit<TreatmentPlan, 'id' | 'evidences'>>({
    riskId: '',
    riskTitle: '',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: '',
    targetDate: '',
    progress: 0,
    tasks: '',
    status: 'Por iniciar',
    budget: '',
    framework: 'SARO'
  });

  // Event Plan form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RiskEventPlan | null>(null);
  const [eventFormData, setEventFormData] = useState<Omit<RiskEventPlan, 'id' | 'evidences'>>({
    eventTitle: '',
    eventDate: '',
    impactUSD: 0,
    processArea: 'Fraude',
    description: '',
    immediateCorrectiveAction: '',
    longTermPreventativeAction: '',
    responsible: '',
    status: 'Abierto',
    framework: 'Fraude'
  });

  // File Upload State Simulations
  const [draggingPlanId, setDraggingPlanId] = useState<string | null>(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<'TODOS' | ProcessArea>('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Count counts of elements in each framework to show as badges in tabs
  const frameworkStats = useMemo(() => {
    return {
      TODOS: treatmentPlans.length + eventPlans.length,
      Continuidad: treatmentPlans.filter(p => p.framework === 'Continuidad').length + eventPlans.filter(e => e.framework === 'Continuidad').length,
      SARO: treatmentPlans.filter(p => p.framework === 'SARO').length + eventPlans.filter(e => e.framework === 'SARO').length,
      SICB: treatmentPlans.filter(p => p.framework === 'SICB').length + eventPlans.filter(e => e.framework === 'SICB').length,
      Fraude: treatmentPlans.filter(p => p.framework === 'Fraude').length + eventPlans.filter(e => e.framework === 'Fraude').length,
      'ISO 31000': treatmentPlans.filter(p => p.framework === 'ISO 31000').length + eventPlans.filter(e => (e as any).framework === 'ISO 31000').length,
    };
  }, [treatmentPlans, eventPlans]);

  // Quiz simulation states
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserNameModal, setShowUserNameModal] = useState(false);

  // Add Treatment Plan
  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData.riskTitle) {
      alert('Debe indicar un título de riesgo o riesgo vinculado.');
      return;
    }

    if (editingPlan) {
      // update
      const updated = treatmentPlans.map(p => 
        p.id === editingPlan.id 
          ? { ...p, ...planFormData } 
          : p
      );
      setTreatmentPlans(updated);
      setEditingPlan(null);
    } else {
      // create
      const newId = `PLN-TR-${String(treatmentPlans.length + 1).padStart(2, '0')}`;
      const newPlan: TreatmentPlan = {
        id: newId,
        ...planFormData,
        evidences: []
      };
      setTreatmentPlans([newPlan, ...treatmentPlans]);
    }
    setShowPlanForm(false);
    resetPlanForm();
  };

  const resetPlanForm = () => {
    setPlanFormData({
      riskId: '',
      riskTitle: '',
      processArea: 'Operaciones',
      strategy: 'Mitigated',
      responsible: '',
      targetDate: '',
      progress: 0,
      tasks: '',
      status: 'Por iniciar',
      budget: '',
      framework: 'SARO'
    });
  };

  const handleLinkRiskSelect = (riskId: string) => {
    const foundRisk = risks.find(r => r.id === riskId);
    if (foundRisk) {
      setPlanFormData({
        ...planFormData,
        riskId: foundRisk.id,
        riskTitle: foundRisk.riskDescription,
        processArea: foundRisk.processArea,
        strategy: foundRisk.roamStatus || 'Mitigated',
        responsible: foundRisk.roamOwner || ''
      });
    }
  };

  // Delete Treatment Plan
  const handleDeletePlan = (planId: string) => {
    if (window.confirm(`¿Seguro que desea remover el plan de tratamiento ${planId}?`)) {
      setTreatmentPlans(treatmentPlans.filter(p => p.id !== planId));
    }
  };

  // Add Event Plan
  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      // update
      const updated = eventPlans.map(ev => 
        ev.id === editingEvent.id 
          ? { ...ev, ...eventFormData } 
          : ev
      );
      setEventPlans(updated);
      setEditingEvent(null);
    } else {
      // create
      const newId = `EVNT-2026-${String(eventPlans.length + 1).padStart(2, '0')}`;
      const newEvent: RiskEventPlan = {
        id: newId,
        ...eventFormData,
        evidences: []
      };
      setEventPlans([newEvent, ...eventPlans]);
    }
    setShowEventForm(false);
    resetEventForm();
  };

  const resetEventForm = () => {
    setEventFormData({
      eventTitle: '',
      eventDate: '',
      impactUSD: 0,
      processArea: 'Fraude',
      description: '',
      immediateCorrectiveAction: '',
      longTermPreventativeAction: '',
      responsible: '',
      status: 'Abierto',
      framework: 'Fraude'
    });
  };

  // Delete Event Plan
  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm(`¿Seguro que desea eliminar el registro de evento ${eventId}?`)) {
      setEventPlans(eventPlans.filter(ev => ev.id !== eventId));
    }
  };

  // Drag and Drop simulation for Treatment plans
  const handlePlanDragOver = (e: React.DragEvent, planId: string) => {
    e.preventDefault();
    setDraggingPlanId(planId);
  };

  const handlePlanDrop = (e: React.DragEvent, planId: string) => {
    e.preventDefault();
    setDraggingPlanId(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newEvidence = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        date: new Date().toISOString().split('T')[0],
        url: '#'
      };
      // Add to plan
      setTreatmentPlans(prev => prev.map(p => {
        if (p.id === planId) {
          return {
            ...p,
            status: p.progress === 100 ? 'Completado' : 'En proceso',
            evidences: [...p.evidences, newEvidence]
          };
        }
        return p;
      }));
    }
  };

  // Simulation of click file upload
  const simulatePlanFileUpload = (planId: string) => {
    const fileNames = ['evidencia_pruebas_carga.docx', 'reporte_conciliacion_final.xlsx', 'acta_reunion_comite.pdf', 'captura_seguridad_WAF.png'];
    const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
    const size = `${(Math.random() * 800 + 100).toFixed(0)} KB`;
    
    const newEvidence = {
      name: randomName,
      size: size,
      date: new Date().toISOString().split('T')[0],
      url: '#'
    };

    setTreatmentPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          evidences: [...p.evidences, newEvidence]
        };
      }
      return p;
    }));
  };

  // Drag and Drop simulation for Incident Event plans
  const handleEventDragOver = (e: React.DragEvent, eventId: string) => {
    e.preventDefault();
    setDraggingEventId(eventId);
  };

  const handleEventDrop = (e: React.DragEvent, eventId: string) => {
    e.preventDefault();
    setDraggingEventId(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newEvidence = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        date: new Date().toISOString().split('T')[0],
        url: '#'
      };
      setEventPlans(prev => prev.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            evidences: [...ev.evidences, newEvidence]
          };
        }
        return ev;
      }));
    }
  };

  const simulateEventFileUpload = (eventId: string) => {
    const fileNames = ['bitacora_logs_auditoria.txt', 'captura_bloqueo_ip.png', 'informe_daños_estimado.xlsx', 'declaraciones_soporte_ops.pdf'];
    const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
    const size = `${(Math.random() * 900 + 50).toFixed(0)} KB`;
    
    const newEvidence = {
      name: randomName,
      size: size,
      date: new Date().toISOString().split('T')[0],
      url: '#'
    };

    setEventPlans(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          evidences: [...ev.evidences, newEvidence]
        };
      }
      return ev;
    }));
  };

  // Quiz helper functions
  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleAnswerChange = (qId: number, optionIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitQuiz = () => {
    // Check if answered all
    const qCount = selectedQuiz?.questions.length || 0;
    if (Object.keys(quizAnswers).length < qCount) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }
    setQuizSubmitted(true);
    setShowUserNameModal(true);
  };

  const handleSaveResult = () => {
    if (!userName.trim()) {
      alert('Debe ingresar su nombre del evaluado.');
      return;
    }

    let score = 0;
    selectedQuiz?.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) score++;
    });

    const isPassed = score / (selectedQuiz?.questions.length || 1) >= 0.6;

    const newCert = {
      name: userName,
      testName: selectedQuiz?.title || 'Evaluación',
      score: `${score} / ${selectedQuiz?.questions.length}`,
      date: new Date().toISOString().split('T')[0],
      result: isPassed ? 'APROBADO' : 'FALLIDO'
    };

    setCertifications([newCert, ...certifications]);
    setShowUserNameModal(false);
  };

  // Calculated matrices filters
  const filteredPlans = treatmentPlans.filter(p => {
    const matchesSearch = p.riskTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === 'TODOS' || p.processArea === areaFilter;
    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;
    const matchesFramework = frameworkFilter === 'TODOS' || p.framework === frameworkFilter;
    return matchesSearch && matchesArea && matchesStatus && matchesFramework;
  });

  const filteredEvents = eventPlans.filter(ev => {
    const matchesSearch = ev.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ev.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === 'TODOS' || ev.processArea === areaFilter;
    const matchesStatus = statusFilter === 'TODOS' || ev.status === statusFilter;
    const matchesFramework = frameworkFilter === 'TODOS' || ev.framework === frameworkFilter;
    return matchesSearch && matchesArea && matchesStatus && matchesFramework;
  });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Module Header */}
      <div className="bg-slate-900 border border-slate-200/20 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                Planes & Cumplimiento GRC
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                ISO 31000 & 27001
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-400" />
              <span>Planes de Acción, Tratamiento y Pruebas</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Módulo unificado para orquestar la resolución de riesgos identificados en la matriz (ROAM), registrar y mitigar eventos e incidentes, y realizar simulacros de conocimiento regulatorio para auditores.
            </p>
          </div>

          <div className="flex gap-2">
            {activeSubTab === 'treatment' && (
              <button
                onClick={() => {
                  resetPlanForm();
                  setEditingPlan(null);
                  setShowPlanForm(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Plan de Tratamiento</span>
              </button>
            )}
            {activeSubTab === 'events' && (
              <button
                onClick={() => {
                  resetEventForm();
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Evento de Riesgo</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex gap-2 border-t border-slate-800 mt-6 pt-4">
          {[
            { id: 'treatment', label: 'Planes de Tratamiento (Matriz)', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'events', label: 'Incidentes y Eventos de Riesgo', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'quiz', label: 'Pruebas de Conocimiento & Staff', icon: <BookOpen className="w-4 h-4" /> }
          ].map(sb => (
            <button
              key={sb.id}
              onClick={() => {
                setActiveSubTab(sb.id as any);
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === sb.id 
                  ? 'bg-blue-500 text-slate-950 font-black shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {sb.icon}
              <span>{sb.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSubTab !== 'quiz' && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          {[
            { id: 'TODOS', label: 'Consolidado Global', caption: 'Todos los marcos', count: frameworkStats.TODOS, color: 'border-slate-200 text-slate-800 bg-slate-50/50 hover:bg-slate-50', activeColor: 'ring-2 ring-slate-800 bg-slate-100 border-slate-300 font-extrabold' },
            { id: 'ISO 31000', label: '🌐 ISO 31000', caption: 'Gestión Integral / JPM', count: (frameworkStats as any)['ISO 31000'] || 0, color: 'border-blue-100 text-blue-900 bg-blue-50/20 hover:bg-blue-50/40', activeColor: 'ring-2 ring-blue-600 bg-blue-50 border-blue-200 font-extrabold' },
            { id: 'Continuidad', label: '🔄 Continuidad', caption: 'Resiliencia BCP/DRP', count: frameworkStats.Continuidad, color: 'border-amber-100 text-amber-900 bg-amber-50/20 hover:bg-amber-50/40', activeColor: 'ring-2 ring-amber-500 bg-amber-50 border-amber-200 font-extrabold' },
            { id: 'SARO', label: '⚙️ SARO', caption: 'Riesgo Operativo', count: frameworkStats.SARO, color: 'border-indigo-100 text-indigo-900 bg-indigo-50/20 hover:bg-indigo-50/40', activeColor: 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200 font-extrabold' },
            { id: 'SICB', label: '🛡️ SICB', caption: 'Sist. Control/AML', count: frameworkStats.SICB, color: 'border-emerald-100 text-emerald-900 bg-emerald-50/20 hover:bg-emerald-50/40', activeColor: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200 font-extrabold' },
            { id: 'Fraude', label: '🕵️ Fraude', caption: 'Prevención canje/retiros', count: frameworkStats.Fraude, color: 'border-rose-100 text-rose-900 bg-rose-50/20 hover:bg-rose-50/40', activeColor: 'ring-2 ring-rose-500 bg-rose-50 border-rose-200 font-extrabold' }
          ].map(item => {
            const isActive = frameworkFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFrameworkFilter(item.id as any)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${isActive ? item.activeColor : item.color}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black tracking-tight block truncate pr-1">{item.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/10 text-slate-800 font-extrabold shrink-0">{item.count}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none font-medium truncate">{item.caption}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Filter and Search Bar for Treatment AND Events */}
      {activeSubTab !== 'quiz' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2.5 items-center flex-1">
            <div className="min-w-[200px] relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por título, responsable, tareas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            {/* Process area filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 border-none outline-none focus:ring-0 cursor-pointer"
              >
                <option value="TODOS">Todas las Áreas</option>
                <option value="Cumplimiento">Cumplimiento</option>
                <option value="Fraude">Fraude</option>
                <option value="Ciberseguridad">Ciberseguridad</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Mesa de Dinero">Mesa de Dinero</option>
                <option value="TI">TI</option>
                <option value="Nuevos Productos">Nuevos Productos</option>
                <option value="Riesgos Nube">Riesgos Nube</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Estado</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 border-none outline-none focus:ring-0 cursor-pointer"
              >
                <option value="TODOS">Todos</option>
                {activeSubTab === 'treatment' ? (
                  <>
                    <option value="Por iniciar">Por iniciar</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Vencido">Vencido</option>
                  </>
                ) : (
                  <>
                    <option value="Abierto">Abierto</option>
                    <option value="Planificado">Planificado</option>
                    <option value="En Mitigación">En Mitigación</option>
                    <option value="Cerrado">Cerrado</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-extrabold px-1 text-right">
            Mostrando {activeSubTab === 'treatment' ? filteredPlans.length : filteredEvents.length} registros
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 1. VIEW: PLANES DE TRATAMIENTO DE LA MATRIZ */}
      {activeSubTab === 'treatment' && (
        <div className="space-y-6">
          
          {/* Plan Form Modal/Collapse Toggle */}
          {showPlanForm && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>{editingPlan ? `Editar Plan de Tratamiento ${editingPlan.id}` : 'Crear Nuevo Plan de Tratamiento de Matriz'}</span>
                </h3>
                <button 
                  onClick={() => { setShowPlanForm(false); setEditingPlan(null); resetPlanForm(); }}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">¿Vincular a un Riesgo Existente?</p>
                  <select
                    onChange={e => handleLinkRiskSelect(e.target.value)}
                    value={planFormData.riskId || ''}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 outline-none"
                  >
                    <option value="">-- No vincular o seleccionar manualmente --</option>
                    {risks.filter(r => r.status === 'Aprobado').map(r => (
                      <option key={r.id} value={r.id}>{r.id} ({getRiskLevel(r.impact * r.probability)}) - {r.riskDescription.substring(0, 80)}...</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título del Riesgo / Objetivo de Tratamiento</label>
                    <input
                      required
                      type="text"
                      value={planFormData.riskTitle}
                      onChange={e => setPlanFormData({ ...planFormData, riskTitle: e.target.value })}
                      placeholder="Ej: Mitigar el descalce en la conciliación bancaria manual..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsable del Control (Owner)</label>
                    <input
                      required
                      type="text"
                      value={planFormData.responsible}
                      onChange={e => setPlanFormData({ ...planFormData, responsible: e.target.value })}
                      placeholder="Ej: María Gutiérrez, Analista Senior..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marco Regulador / GRC</label>
                    <select
                      value={planFormData.framework}
                      onChange={e => setPlanFormData({ ...planFormData, framework: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="ISO 31000">🌐 ISO 31000 (Riesgo Internacional / JPM)</option>
                      <option value="Continuidad">🔄 Continuidad (BCP/DRP)</option>
                      <option value="SARO">⚙️ SARO (Riesgo Operativo)</option>
                      <option value="SICB">🛡️ SICB (Cumplimiento/AML)</option>
                      <option value="Fraude">🕵️ Fraude (Prevención)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área de Proceso</label>
                    <select
                      value={planFormData.processArea}
                      onChange={e => setPlanFormData({ ...planFormData, processArea: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Operaciones">Operaciones</option>
                      <option value="Fraude">Fraude</option>
                      <option value="Cumplimiento">Cumplimiento</option>
                      <option value="Ciberseguridad font-sans">Ciberseguridad</option>
                      <option value="Mesa de Dinero">Mesa de Dinero</option>
                      <option value="TI">TI</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estrategia ROAM</label>
                    <select
                      value={planFormData.strategy}
                      onChange={e => setPlanFormData({ ...planFormData, strategy: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="Mitigated">Mitigated (Mitigar e implementar controles)</option>
                      <option value="Resolved">Resolved (Resolver / Eliminar riesgo por completo)</option>
                      <option value="Owned">Owned (Tomar propiedad / Ejecución pendiente)</option>
                      <option value="Accepted">Accepted (Aceptar bajo monitoreo)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Límite (Target Date)</label>
                    <input
                      required
                      type="date"
                      value={planFormData.targetDate}
                      onChange={e => setPlanFormData({ ...planFormData, targetDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presupuesto / Recursos</label>
                    <input
                      type="text"
                      value={planFormData.budget || ''}
                      placeholder="Ej: $10,000 USD"
                      onChange={e => setPlanFormData({ ...planFormData, budget: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tareas del Tratamiento / Acciones Clave</label>
                    <textarea
                      required
                      rows={3}
                      value={planFormData.tasks}
                      onChange={e => setPlanFormData({ ...planFormData, tasks: e.target.value })}
                      placeholder="Detalle de los entregables prácticos..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado de Avance</label>
                      <select
                        value={planFormData.status}
                        onChange={e => setPlanFormData({ ...planFormData, status: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      >
                        <option value="Por iniciar">🔴 Por iniciar</option>
                        <option value="En proceso">🟡 En proceso</option>
                        <option value="Completado">🟢 Completado</option>
                        <option value="Vencido flex">⚠️ Vencido</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Progreso Porcentual ({planFormData.progress}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={planFormData.progress}
                        onChange={e => setPlanFormData({ ...planFormData, progress: Number(e.target.value) })}
                        className="w-full accent-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowPlanForm(false); setEditingPlan(null); resetPlanForm(); }}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer"
                  >
                    {editingPlan ? 'Guardar Cambios' : 'Generar Plan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Progress Table view */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPlans.map(plan => {
              const linkedRisk = risks.find(r => r.id === plan.riskId);
              
              return (
                <div 
                  key={plan.id}
                  onDragOver={(e) => handlePlanDragOver(e, plan.id)}
                  onDrop={(e) => handlePlanDrop(e, plan.id)}
                  className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                    draggingPlanId === plan.id 
                      ? 'border-dashed border-2 border-blue-500 bg-blue-50/50 scale-[1.01]' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase font-mono">{plan.id}</span>
                        {plan.riskId && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold font-mono">
                            Vinculado: {plan.riskId}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          plan.framework === 'ISO 31000' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          plan.framework === 'Continuidad' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          plan.framework === 'SARO' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          plan.framework === 'SICB' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          Marco: {plan.framework}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase">
                          {plan.processArea}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono border ${
                          plan.strategy === 'Mitigated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          plan.strategy === 'Resolved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          plan.strategy === 'Owned' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          ROAM: {plan.strategy}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-900 mt-1 max-w-3xl">
                        {plan.riskTitle}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                        plan.status === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' :
                        plan.status === 'En proceso' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        plan.status === 'Por iniciar' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {plan.status}
                      </span>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanFormData({
                              riskId: plan.riskId || '',
                              riskTitle: plan.riskTitle,
                              processArea: plan.processArea,
                              strategy: plan.strategy,
                              responsible: plan.responsible,
                              targetDate: plan.targetDate,
                              progress: plan.progress,
                              tasks: plan.tasks,
                              status: plan.status,
                              budget: plan.budget || ''
                            });
                            setShowPlanForm(true);
                          }}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Eliminar Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progressive Bar and dates */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Plan de Trabajo & Acciones:</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">{plan.tasks}</p>
                    </div>

                    <div className="md:col-span-4 border-l border-slate-200/60 pl-0 md:pl-4 space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                          <span>Estado de Ejecución</span>
                          <span>{plan.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${plan.progress}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 flex-wrap gap-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Owner: {plan.responsible}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Vence: <strong className="text-slate-700 font-extrabold">{plan.targetDate}</strong></span>
                        </span>
                      </div>

                      {plan.budget && (
                        <div className="text-[10px] font-black text-slate-500 uppercase flex items-center justify-between">
                          <span>Presupuesto Consumido:</span>
                          <span className="text-slate-800 font-extrabold">{plan.budget}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidence Attachment Section */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Sustentos y Evidencias de Control ({plan.evidences.length})</span>
                      </p>
                      <button
                        onClick={() => simulatePlanFileUpload(plan.id)}
                        className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Subir Evidencia Local (Demo)</span>
                      </button>
                    </div>

                    {/* Drag and Drop notice if non-empty */}
                    <div className="flex flex-col gap-1.5">
                      {plan.evidences.length === 0 ? (
                        <div className="text-center p-3 border border-dashed border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-400">
                          Suelta tus archivos de sustento aquí (firmas PDF, matrices de pruebas, logs) o usa el botón para simular una carga.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {plan.evidences.map((ev, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-50/75 border border-slate-200/60 p-2 rounded-lg text-xs">
                              <div className="flex items-center gap-2 overflow-hidden mr-2">
                                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="truncate">
                                  <p className="font-extrabold text-slate-800 truncate" title={ev.name}>{ev.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono font-bold leading-none">{ev.size} • {ev.date}</p>
                                </div>
                              </div>
                              <span className="p-1 rounded bg-white hover:bg-slate-100 text-slate-500 border border-slate-100 cursor-pointer" title="Descargar de forma simulada">
                                <Download className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPlans.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-400">
                Aún no has registrado planes de acción que correspondan con los filtros seleccionados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. VIEW: PLANNIFICACTION DE INCIDENTES / EVENTOS */}
      {activeSubTab === 'events' && (
        <div className="space-y-6">
          
          {/* Event plan form */}
          {showEventForm && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mt-0">
                  <AlertTriangle className="w-4 h-4 text-indigo-500" />
                  <span>{editingEvent ? `Editar Registro de Evento ${editingEvent.id}` : 'Registrar Evento de Pérdida / Incidente de Riesgo'}</span>
                </h3>
                <button 
                  onClick={() => { setShowEventForm(false); setEditingEvent(null); resetEventForm(); }}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Título del Incidente / Evento Registrado</label>
                    <input
                      required
                      type="text"
                      value={eventFormData.eventTitle}
                      onChange={e => setEventFormData({ ...eventFormData, eventTitle: e.target.value })}
                      placeholder="Ej: Interrupción de API de dispersión de saldos de remesas..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marco de Clasificación</label>
                    <select
                      value={eventFormData.framework}
                      onChange={e => setEventFormData({ ...eventFormData, framework: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="ISO 31000">🌐 ISO 31000 (Riesgo Integral)</option>
                      <option value="Continuidad">🔄 Continuidad (BCP/DRP)</option>
                      <option value="SARO">⚙️ SARO (Riesgo Operativo)</option>
                      <option value="SICB">🛡️ SICB (Cumplimiento/AML)</option>
                      <option value="Fraude">🕵️ Fraude (Prevención)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área de Operación Principal</label>
                    <select
                      value={eventFormData.processArea}
                      onChange={e => setEventFormData({ ...eventFormData, processArea: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    >
                      <option value="Fraude">Fraude</option>
                      <option value="Operaciones">Operaciones</option>
                      <option value="Cumplimiento font-mono">Cumplimiento</option>
                      <option value="Ciberseguridad">Ciberseguridad</option>
                      <option value="Mesa de Dinero">Mesa de Dinero</option>
                      <option value="TI">TI</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha del Ocurrencia</label>
                    <input
                      required
                      type="date"
                      value={eventFormData.eventDate}
                      onChange={e => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impacto Económico Estimado (USD)</label>
                    <input
                      required
                      type="number"
                      value={eventFormData.impactUSD}
                      onChange={e => setEventFormData({ ...eventFormData, impactUSD: Number(e.target.value) })}
                      placeholder="0 para cuasi-pérdidas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsable del Evento</label>
                    <input
                      required
                      type="text"
                      value={eventFormData.responsible}
                      onChange={e => setEventFormData({ ...eventFormData, responsible: e.target.value })}
                      placeholder="Ej: Diana Cáceres..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-medium">Estado del Incidente</label>
                    <select
                      value={eventFormData.status}
                      onChange={e => setEventFormData({ ...eventFormData, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    >
                      <option value="Abierto">🔴 Abierto (En investigación)</option>
                      <option value="Planificado">🟡 Planificado (Sin ejecutar)</option>
                      <option value="En Mitigación">🔵 En Mitigación</option>
                      <option value="Cerrado">🟢 Cerrado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descripción Detallada del Evento y Causa Raíz</label>
                  <textarea
                    required
                    rows={2}
                    value={eventFormData.description}
                    onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })}
                    placeholder="Describe los hechos y fallas operacionales..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Acción de Contención Inmediata (Correctiva)</label>
                    <textarea
                      required
                      rows={2}
                      value={eventFormData.immediateCorrectiveAction}
                      onChange={e => setEventFormData({ ...eventFormData, immediateCorrectiveAction: e.target.value })}
                      placeholder="Ej: Bloqueo de cuentas de egresos y saneamiento de saldos..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Medidas de Prevención a Largo Plazo (Tratamiento estructural)</label>
                    <textarea
                      required
                      rows={2}
                      value={eventFormData.longTermPreventativeAction}
                      onChange={e => setEventFormData({ ...eventFormData, longTermPreventativeAction: e.target.value })}
                      placeholder="Ej: Auditorías automáticas, mTLS obligatorio para terminales API..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowEventForm(false); setEditingEvent(null); resetEventForm(); }}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-5050 rounded-lg cursor-pointer"
                  >
                    {editingEvent ? 'Guardar Cambios' : 'Registrar Evento'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of event logs */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map(ev => (
              <div 
                key={ev.id}
                onDragOver={(e) => handleEventDragOver(e, ev.id)}
                onDrop={(e) => handleEventDrop(e, ev.id)}
                className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                  draggingEventId === ev.id 
                    ? 'border-dashed border-2 border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono text-[10px] font-black text-slate-400">{ev.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold uppercase text-[10px]">
                        {ev.processArea}
                      </span>
                      {ev.framework && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          ev.framework === 'ISO 31000' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          ev.framework === 'Continuidad' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          ev.framework === 'SARO' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          ev.framework === 'SICB' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          Marco: {ev.framework}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Ocurrió: {ev.eventDate}
                      </span>
                      {ev.impactUSD > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-extrabold text-[10px] border border-red-100">
                          Pérdida: ${ev.impactUSD.toLocaleString()} USD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-100">
                          Cuasi-pérdida ($0 USD)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-800 mt-1">
                      {ev.eventTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                      ev.status === 'Cerrado' ? 'bg-green-50 text-green-700 border-green-200' :
                      ev.status === 'En Mitigación' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      ev.status === 'Planificado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {ev.status}
                    </span>

                    <button
                      onClick={() => {
                        setEditingEvent(ev);
                        setEventFormData({
                          eventTitle: ev.eventTitle,
                          eventDate: ev.eventDate,
                          impactUSD: ev.impactUSD,
                          processArea: ev.processArea,
                          description: ev.description,
                          immediateCorrectiveAction: ev.immediateCorrectiveAction,
                          longTermPreventativeAction: ev.longTermPreventativeAction,
                          responsible: ev.responsible,
                          status: ev.status
                        });
                        setShowEventForm(true);
                      }}
                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1 text-red-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="font-extrabold text-slate-500 uppercase text-[9px] mb-1">Cisterna / Causa Raíz:</p>
                  <p>{ev.description}</p>
                </div>

                {/* Immediate vs structural split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-indigo-100 bg-indigo-50/15 p-4 rounded-xl space-y-1">
                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                      <span>⚡ Contención Inmediata</span>
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">{ev.immediateCorrectiveAction}</p>
                  </div>

                  <div className="border border-emerald-100 bg-emerald-50/15 p-4 rounded-xl space-y-1">
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">🛡️ Preventiva a Largo Plazo</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-line">{ev.longTermPreventativeAction}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Analista Reportante: {ev.responsible}</span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => simulateEventFileUpload(ev.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Anexar Sustento / Log (Demo)</span>
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Archivos cargados ({ev.evidences.length})
                    </span>
                  </div>
                </div>

                {/* Evidence items */}
                {ev.evidences.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {ev.evidences.map((e, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-lg text-xs">
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-bold text-slate-700">{e.name}</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{e.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-400">
                No hay eventos o incidentes cargados con los filtros correspondientes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. VIEW: PRUEBAS DE CONOCIMIENTOS & STAFF CERTIFICACIONES */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quiz simulator area */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              
              {!selectedQuiz ? (
                <>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Capacitaciones Activas e Inducción</h3>
                    <p className="text-slate-400 text-xs">Simuladores interactivos de evaluaciones basados en los estándares ISO 31000 y 27001 para certificar analistas operativos.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {KNOWLEDGE_QUIZZES.map(quiz => (
                      <div key={quiz.id} className="border border-slate-200 p-5 rounded-xl hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-extrabold text-[9px] uppercase">{quiz.area}</span>
                            <span className="text-slate-400 font-medium font-mono">{quiz.questions.length} preguntas</span>
                          </div>
                          
                          <h4 className="text-xs font-black text-slate-800 leading-snug">{quiz.title}</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">{quiz.description}</p>
                        </div>

                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer mt-2"
                        >
                          Iniciar Prueba Interactiva
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedQuiz.area}</span>
                      <h4 className="text-sm font-black text-slate-900">{selectedQuiz.title}</h4>
                    </div>
                    
                    <button
                      onClick={() => setSelectedQuiz(null)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                    >
                      Volver a evaluaciones
                    </button>
                  </div>

                  {/* Questions flow */}
                  <div className="space-y-6">
                    {selectedQuiz.questions.map((q, idx) => {
                      const isAnswered = quizAnswers[q.id] !== undefined;
                      const selectedOpt = quizAnswers[q.id];
                      const isCorrect = selectedOpt === q.correctIndex;
                      
                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-55 bg-indigo-50/10 space-y-3">
                          <p className="text-xs font-black text-slate-800 leading-relaxed">
                            <span className="text-blue-500">P{idx + 1}.</span> {q.text}
                          </p>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isThisSelected = selectedOpt === oIdx;
                              let btnClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                              
                              if (isThisSelected) {
                                btnClass = 'bg-blue-600 border-blue-600 text-white font-extrabold';
                              }
                              
                              // Colors after submission
                              if (quizSubmitted) {
                                if (oIdx === q.correctIndex) {
                                  btnClass = 'bg-green-100 border-green-500 text-green-800 font-extrabold';
                                } else if (isThisSelected && !isCorrect) {
                                  btnClass = 'bg-red-100 border-red-500 text-red-800';
                                } else {
                                  btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => handleAnswerChange(q.id, oIdx)}
                                  className={`w-full text-left p-3.5 border rounded-lg text-xs transition-all flex items-center gap-2.5 cursor-pointer ${btnClass}`}
                                >
                                  <span className="font-mono text-[10px] border px-1 rounded bg-slate-100 text-slate-500">{String.fromCharCode(65 + oIdx)}</span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="mt-3 p-3 bg-slate-100 rounded-lg text-xs border border-slate-200">
                              <span className={`font-black uppercase tracking-wider text-[10px] ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                {isCorrect ? '✓ Respuesta Correcta' : '✗ Respuesta Incorrecta'}
                              </span>
                              <p className="text-slate-500 font-medium mt-1 leading-relaxed italic">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <div className="flex justify-end pt-3">
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg cursor-pointer"
                      >
                        Enviar Respuestas
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 flex-wrap gap-3">
                      <div className="text-xs">
                        <strong className="text-slate-700">Resultado:</strong> {selectedQuiz.questions.filter(q => quizAnswers[q.id] === q.correctIndex).length} de {selectedQuiz.questions.length} respuestas correctas
                      </div>
                      <button
                        onClick={() => { setSelectedQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }}
                        className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-lg cursor-pointer"
                      >
                        Cerrar Evaluación
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* List of certifications & certified staff */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Bitácora de Certificación GRC</span>
                </h3>
                <p className="text-slate-400 text-xs">Registro histórico de auditores y oficiales certificados.</p>
              </div>

              <div className="space-y-3 pt-1">
                {certifications.map((cert, index) => (
                  <div key={index} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">{cert.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{cert.testName}</p>
                      <p className="text-[9px] text-slate-400 font-bold font-mono">{cert.date}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${cert.result === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cert.result}
                      </span>
                      <p className="text-xs font-extrabold text-slate-800 mt-1">{cert.score}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 text-center">
                <p className="text-[10px] font-bold text-emerald-800">¿Re-someter o planificar capacitación?</p>
                <p className="text-slate-500 text-xs text-left leading-relaxed">Este log sirve de evidencia robusta durante las auditorías formales y revisiones de entes reguladores de Global66.</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* User Name input modal for certificate generation */}
      {showUserNameModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-black text-slate-900 mt-0">Guardar Resultado de Auditoría</h4>
            <p className="text-slate-400 text-xs leading-relaxed">Por favor ingresa tu nombre completo para archivar tu certificación en la base reguladora.</p>
            
            <input
              required
              type="text"
              placeholder="Ej: María Gutiérrez"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold outline-none focus:border-blue-500"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowUserNameModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Omitir registro
              </button>
              <button
                onClick={handleSaveResult}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg cursor-pointer animate-pulse"
              >
                Certificar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
