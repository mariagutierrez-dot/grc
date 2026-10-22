import { Risk, LossEvent } from '../types';

export const INITIAL_ARGENTINA_RISKS: Risk[] = [
  // 1. Fraude Interno
  {
    id: 'R-ARG-FI-001',
    process: 'Gestión de Cuentas Virtuales (CVU) y Mesa de Ayuda',
    processArea: 'Operaciones',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Fraude Interno',
    origin: 'Interno',
    riskDescription: 'Alteración no autorizada de parámetros o vinculaciones de cuentas CVU por parte de operadores de mesa de ayuda internos para desvío de acreditaciones en ARS a cuentas personales apócrifas.',
    cause: 'Falta de segregación estricta de funciones y ausencia de doble factor de aprobación (MofN / Maker-Checker) para modificaciones sensibles de CVU.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Implementación del principio Maker-Checker obligatorio y logs inmutables auditables en tiempo real para todas las modificaciones de CVU.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones Argentina',
    associatedControls: [
      {
        id: 'C-ARG-FI-001-1',
        description: 'Doble factor de autenticación y flujo Maker-Checker para cambios de CBU/CVU destino.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'R-ARG-FI-002',
    process: 'Operatoria Cambiaria MEP/CCL y Spreads Divisas',
    processArea: 'Mesa de Dinero',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Fraude Interno',
    origin: 'Interno',
    riskDescription: 'Manipulación discrecional de spreads o cotizaciones del Dólar MEP / CCL por operadores con acceso privilegiado para beneficio propio o de terceros fuera de los parámetros del BCRA.',
    cause: 'Ausencia de límites de tolerancia automatizados y validación manual de órdenes FX fuera de horario bursátil.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Módulo de cotización algorítmica con bloqueo automático ante desviaciones superiores al 0.5% del valor de mercado.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de Mesa de Dinero Argentina'
  },

  // 2. Fraude Externo
  {
    id: 'R-ARG-FE-001',
    process: 'Onboarding Digital y Autenticación Móvil',
    processArea: 'Fraude',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Fraude Externo',
    origin: 'Externo',
    riskDescription: 'Sustracción de identidades y ataques de SIM Swapping masivo para toma de control de cuentas (Account Takeover) y extracción inmediata de saldos vía transferencias CBU/CVU.',
    cause: 'Vulnerabilidades en el flujo de recuperación de contraseña de la App móvil y falta de validación de estado de SIM card con operadores de telefonía locales (Telecom, Movistar, Claro).',
    impact: 5,
    probability: 4,
    suggestedControl: 'Prueba de vida biométrica Liveness 3D avanzada e integración con servicio de detección de SIM Swap en tiempo real.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    associatedControls: [
      {
        id: 'C-ARG-FE-001-1',
        description: 'Validación biométrica facial 3D obligatoria ante cambios de dispositivo o recupero de credenciales.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'R-ARG-FE-002',
    process: 'Procesamiento de Débitos Inmediatos (DEBIN / MOP)',
    processArea: 'Operaciones',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Fraude Externo',
    origin: 'Externo',
    riskDescription: 'Generación de reclamos y contracargos fraudulentos mediante la utilización de cuentas mulas en solicitudes de DEBIN apócrifos y transferencias con comprobantes falsificados.',
    cause: 'Sistemas de prevención de fraude legacy sin puntuación de riesgo scoring en tiempo real para DEBIN entrante.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Motor de reglas de scoring comportamental transaccional previo al procesamiento de débitos inmediatos.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Oficial de Fraude Argentina'
  },

  // 3. Relaciones Laborales y Seguridad en el Puesto de Trabajo
  {
    id: 'R-ARG-RL-001',
    process: 'Atención al Usuario Financiero (AUF) y Centro Operativo CABA',
    processArea: 'Operaciones',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Relaciones Laborales y Seguridad en el Puesto de Trabajo',
    origin: 'Interno',
    riskDescription: 'Riesgo de sanciones por contingencias laborales o rotación imprevista de personal operativo asignado al régimen de reclamos AUF ante el BCRA por jornadas extendidas.',
    cause: 'Falta de automatización en la clasificación y escalamiento de reclamos en la mesa de entrada oficial del BCRA.',
    impact: 3,
    probability: 2,
    suggestedControl: 'Módulo de autogestión de reclamos AUF con categorización inteligente por IA para balancear la carga de trabajo.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Accepted',
    roamOwner: 'HR & Ops Lead'
  },

  // 4. Clientes, Productos y Prácticas Empresariales
  {
    id: 'R-ARG-CP-001',
    process: 'Transparencia y Régimen Comisiones (Com. BCRA A 7783 / A 7319)',
    processArea: 'Cumplimiento',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Clientes, Productos y Prácticas Empresariales',
    origin: 'Interno',
    riskDescription: 'Sanciones o sumarios administrativos del BCRA por falta de divulgación clara de cuadros tarifarios, comisiones por transferencia o variaciones de tipo de cambio en la App.',
    cause: 'Inconsistencias entre los términos y condiciones de la web pública y las parametrizaciones en producción de la pasarela.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Matriz parametrizada centralizada de comisiones sincronizada automáticamente con la pantalla de confirmación pre-transaccional.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer Argentina',
    associatedControls: [
      {
        id: 'C-ARG-CP-001-1',
        description: 'Verificación automatizada pre-despliegue de concordancia entre tarifas del T&C y motor financiero.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-ARG-CP-002',
    process: 'Régimen Informativo Informativo Mercado Único Libre de Cambio (MULC)',
    processArea: 'Cumplimiento',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Clientes, Productos y Prácticas Empresariales',
    origin: 'Interno',
    riskDescription: 'Erogaciones y multas por inconsistencias o demoras en la rendición de boletos de cambio y regímenes informativos diarios del BCRA para transferencias internacionales.',
    cause: 'Extracción manual de datos transaccionales desde el core sin validación de sintaxis para los formatos XML/TXT requeridos por el BCRA.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Pipeline automatizado con motor de reglas sintácticas del BCRA que valida y genera el archivo plano antes de las 18:00hs.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Líder de Regímenes Informativos'
  },

  // 5. Daños a Activos Físicos
  {
    id: 'R-ARG-DA-001',
    process: 'Infraestructura de Datos e Instalaciones Locales CABA',
    processArea: 'TI',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Daños a Activos Físicos',
    origin: 'Externo',
    riskDescription: 'Interrupción de las operaciones por contingencias energéticas o fallas de climatización en el Data Center físico local que alberga los enlaces dedicados a Coelsa / BCRA.',
    cause: 'Cortes prolongados en la red eléctrica metropolitana sin redundancia de UPS de grado industrial con grupos electrógenos alternativos.',
    impact: 4,
    probability: 2,
    suggestedControl: 'MIGRACIÓN total a redundancia Multi-Cloud y enlace en fibra óptica de respaldo con doble acometida física.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Infraestructura'
  },

  // 6. Incidencias en el Negocio y Fallos en los Sistemas
  {
    id: 'R-ARG-IS-001',
    process: 'Interconexión con Red Coelsa y Cámara Compensadora Inmediata',
    processArea: 'TI',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Incidencias en el Negocio y Fallos en los Sistemas',
    origin: 'Externo',
    riskDescription: 'Caída o time-out en la comunicación sincrónica con la red Coelsa durante picos de demanda diaria de acreditaciones, acumulando cola de transacciones pendientes.',
    cause: 'Saturación del canal MQ/VPN sin escalamiento automático de hilos de conexión.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Balanceador de carga dinámico con failover automático a canal secundario y cola de contingencia asíncrona.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI Argentina',
    associatedControls: [
      {
        id: 'C-ARG-IS-001-1',
        description: 'Auto-scaling de microservicios de conexión Coelsa y alerta de latencia por encima de 1500ms.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'R-ARG-IS-002',
    process: 'Notificación de Ciberincidentes al BCRA (Com. A 7260)',
    processArea: 'Ciberseguridad',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Incidencias en el Negocio y Fallos en los Sistemas',
    origin: 'Interno',
    riskDescription: 'Falla o tardanza en la activación de la alerta temprana ante el BCRA dentro del plazo máximo normativo de 2 horas ante incidentes cibernéticos significativos.',
    cause: 'Falta de integración entre el SIEM del SOC y el protocolo de notificación a las autoridades reguladoras.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Playbook automatizado de incidentes cibernéticos con plantilla pre-aprobada para reporte inmediato al BCRA/CSIRT.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'CISO / Head de Ciberseguridad'
  },

  // 7. Ejecución, Entrega y Gestión de Procesos
  {
    id: 'R-ARG-EP-001',
    process: 'Consolidación de la Matriz de Riesgo Operacional (BCRA A 7783)',
    processArea: 'Cumplimiento',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Ejecución, Entrega y Gestión de Procesos',
    origin: 'Interno',
    riskDescription: 'Presentación con inconsistencias o desactualizada del mapa de riesgos operacionales y base de datos de eventos de pérdida ante las inspecciones de la Gerencia de Supervisión del BCRA.',
    cause: 'Uso de planillas dispersas y falta de un repositorio unificado GRC con auditoría de cambios y aprobación formal de Comités.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Sistema GRC unificado con módulo BCRA Com A7783 de solo lectura auditable y exportación en formato regulatorio oficial.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Oficial de Riesgos Operativos',
    associatedControls: [
      {
        id: 'C-ARG-EP-001-1',
        description: 'Plataforma GRC centralizada con trazabilidad completa de aprobación de riesgos y cálculo de perfil de riesgo.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'R-ARG-EP-002',
    process: 'Gestión de Compensación echeq y Depósitos Virtuales',
    processArea: 'Operaciones',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Ejecución, Entrega y Gestión de Procesos',
    origin: 'Interno',
    riskDescription: 'Retraso en la compensación de ECHEQs depositados en cuentas corporativas, generando falta de liquidez transitoria para el payout de remesas.',
    cause: 'Falta de seguimiento en tiempo real de los rechazos técnicos o por falta de fondos de bancos libradores.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Dashboard de estado de ECHEQs en tiempo real con alertas preventivas ante rechazos formales.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones Argentina'
  },
  {
    id: 'R-ARG-EP-003',
    process: 'Registro y Mantenimiento de la Base de Eventos de Pérdida (LED)',
    processArea: 'Cumplimiento',
    jurisdiction: 'Argentina',
    categoriaBCRA: 'Ejecución, Entrega y Gestión de Procesos',
    origin: 'Interno',
    riskDescription: 'Sub-registro u omisión de pérdidas operacionales reales en el sistema LED requerido por la Com. A 7783, afectando el cálculo del requerimiento de capital mínimo por riesgo operacional.',
    cause: 'Falta de comunicación obligatoria entre el área contable y el equipo de riesgos operativos sobre notas de débito por pérdidas.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Flujo de conciliación mensual automática entre cuentas contables de pérdidas operacionales y el módulo LED GRC.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Oficial de Riesgos Operativos'
  }
];

export const INITIAL_ARGENTINA_LOSS_EVENTS: LossEvent[] = [
  {
    id: 'EV-ARG-001',
    code: 'EV-BCRA-2026-001',
    dateOccurred: '2026-02-10',
    dateDiscovered: '2026-02-10',
    dateAccounted: '2026-02-12',
    bcraCategory: 'Fraude Externo',
    processArea: 'Fraude',
    description: 'Extracción no autorizada de fondos mediante ataque de SIM Swapping sobre cuenta CVU activa.',
    grossAmountARS: 2850000,
    recoveryAmountARS: 1200000,
    netAmountARS: 1650000,
    status: 'Cerrado',
    associatedRiskId: 'R-ARG-FE-001',
    responsibleArea: 'Prevención de Fraude'
  },
  {
    id: 'EV-ARG-002',
    code: 'EV-BCRA-2026-002',
    dateOccurred: '2026-03-04',
    dateDiscovered: '2026-03-05',
    dateAccounted: '2026-03-06',
    bcraCategory: 'Incidencias en el Negocio y Fallos en los Sistemas',
    processArea: 'TI',
    description: 'Time-out en compensación Coelsa que generó penalización bancaria por procesamiento diferido fuera de horario compensatorio.',
    grossAmountARS: 4200000,
    recoveryAmountARS: 3800000,
    netAmountARS: 400000,
    status: 'Recuperado',
    associatedRiskId: 'R-ARG-IS-001',
    responsibleArea: 'Infraestructura & TI'
  },
  {
    id: 'EV-ARG-003',
    code: 'EV-BCRA-2026-003',
    dateOccurred: '2026-04-18',
    dateDiscovered: '2026-04-18',
    dateAccounted: '2026-04-20',
    bcraCategory: 'Clientes, Productos y Prácticas Empresariales',
    processArea: 'Cumplimiento',
    description: 'Ajuste de glosa regulatoria por inconsistencia menor en rectificativa de régimen informativo ante BCRA.',
    grossAmountARS: 1150000,
    recoveryAmountARS: 0,
    netAmountARS: 1150000,
    status: 'Confirmado',
    associatedRiskId: 'R-ARG-CP-002',
    responsibleArea: 'Regímenes Informativos'
  },
  {
    id: 'EV-ARG-004',
    code: 'EV-BCRA-2026-004',
    dateOccurred: '2026-05-22',
    dateDiscovered: '2026-05-23',
    dateAccounted: '2026-05-25',
    bcraCategory: 'Fraude Interno',
    processArea: 'Operaciones',
    description: 'Modificación errónea de parámetros en lote de dispersión ARS detectada por conciliación nocturna.',
    grossAmountARS: 1980000,
    recoveryAmountARS: 1980000,
    netAmountARS: 0,
    status: 'Recuperado',
    associatedRiskId: 'R-ARG-FI-001',
    responsibleArea: 'Operaciones Argentina'
  }
];
