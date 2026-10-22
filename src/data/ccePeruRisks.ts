import { Risk, ProcessArea } from '../types';

export interface CcePeruActionPlan {
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

export const CCE_PERU_MATRIX_RISKS: Risk[] = [
  // 1. ILIQUIDEZ OPERATIVA Y AGOTAMIENTO DEL TARGET BALANCE EN BCRP / GMONEY
  {
    id: 'R-CCE-01',
    processArea: 'Tesorería',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Integración CCE - Perú',
    process: 'Gestión de Saldo Objetivo (Target Balance), Prefondeo BCRP y Liquidación 24/7',
    riskDescription: 'Parálisis operativa total de transferencias salientes (PayOut) inmediatas en Perú, rechazos masivos de pagos nocturnos y quejas de usuarios por fondos retenidos, ocasionado por el agotamiento del Saldo Objetivo Día (Target Balance) en la Cámara de Compensación Electrónica (CCE) ante picos de demanda imprevistos o descalce en la regla de prefondeo estricto (1.7x en días hábiles y 2.4x en fines de semana/feriados).',
    cause: 'Ventana de ajuste de liquidez restringida exclusivamente de 08:15 a 15:45 en días hábiles (sin capacidad de ampliación nocturna ni en fines de semana); hora de corte estricta de Gmoney al mediodía para transferir fondos al BCRP; y regla de reconstitución acumulativa donde el target no vuelve a un monto plano base si hubo ampliaciones previas.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Módulo automatizado de tesorería predictiva en tiempo real con monitoreo del umbral de alerta (25% del target balance), buffer de liquidez precautorio del 30% adicional precargado en la cuenta corriente BCP de Gmoney (193-1893518-0-42) antes de las 11:30 am, y protocolo de failover automático a Dlocal si el saldo CCE cae a niveles críticos.',
    documentControl: 'One-Pager Ops CCE: Mecánica Operativa - Target Balance, Prefondeo 1.7x/2.4x y Liquidación BCRP.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería & Lead Ops Settlement (Carlos Mendoza)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 5,
    procesos: 5,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-CCE-01-1',
        description: 'Bot de telemetría financiera y alarmas en Slack que monitorea el saldo disponible en la CCE cada 3 minutos, alertando a Tesorería ante caídas inferiores al 35% del Target Balance.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CCE-01-2',
        description: 'Protocolo formal de prefondeo diario ejecutado antes de las 11:30 am con Banco BCP asegurando 1.7x en días hábiles y 2.4x antes de fines de semana y feriados largos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 2. DEPENDENCIA CRÍTICA DE GMONEY Y AUSENCIA DE DOCUMENTACIÓN FORMAL CONTRACTUAL
  {
    id: 'R-CCE-02',
    processArea: 'Estratégico',
    secondaryProcessArea: 'Legal',
    origin: 'Externo',
    product: 'Integración CCE - Perú',
    process: 'Gestión de Partners Tecnológicos, Corresponsalía CCE y Acuerdos de Nivel de Servicio (SLA)',
    riskDescription: 'Interrupción intempestiva del servicio de interoperabilidad, disputas contractuales sin marco probatorio o cambios unilaterales en condiciones comerciales y comisiones por parte de Gmoney (partner técnico intermediario ante la CCE), derivando en contingencias legales, desprotección operativa de Global66 y daño reputacional en Perú.',
    cause: 'Ausencia formal de manual técnico operativo y acuerdo de nivel de servicio (SLA) firmado por escrito entre Gmoney y Global66 (confirmado explícitamente en el One-Pager Ops CCE); intermediación obligada a través de cuentas corrientes de Gmoney para acceder al Banco Central de Reserva del Perú (BCRP) sin contrato de corresponsalía formalizado.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Formalización legal prioritaria del Contrato Maestro de Servicios y SLA vinculante con Gmoney con penalizaciones por caídas de servicio, entrega mandatoria del Manual Operativo CCE y auditoría legal de los flujos de fondos en tránsito.',
    documentControl: 'One-Pager Ops CCE: Sección "Documentación Operativa" (confirmación de acuerdos verbales sin soporte escrito).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of Legal Regional & Lead Program Manager (Benjamín Herrera)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-CCE-02-1',
        description: 'Adenda contractual y SLA con Gmoney estableciendo disponibilidad mínima del 99.9%, penalidades por retrasos en depósito BCRP y cláusula de entrega de auditorías operativas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CCE-02-2',
        description: 'Monitoreo diario de conciliación de saldos en tránsito en cuentas BCP de Gmoney con confirmación escrita de recepción de fondos previo al corte de mediodía.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 3. FALLA EN DESAFILIACIÓN, BUG DE CAMBIO DE TELÉFONO Y SECUESTRO DE ALIAS/CCI
  {
    id: 'R-CCE-03',
    processArea: 'TI',
    secondaryProcessArea: 'Seguridad de la Información',
    origin: 'Interno',
    product: 'Integración CCE - Perú',
    process: 'Gestión de Identidad Móvil, Afiliación de Alias y Ciclo de Desafiliación',
    riskDescription: 'Vulneración de la seguridad de las cuentas de usuarios, desvío indebido de transferencias entrantes por número celular hacia nuevos titulares de líneas telefónicas recicladas por operadoras móviles, o bloqueo permanente del usuario para reingresar al sistema tras superar los 2 cambios de teléfono anuales permitidos.',
    cause: 'Acoplamiento rígido entre cambio de número telefónico y desafiliación automática de CCE; existencia de un bug técnico conocido en el flujo de cambio de teléfono (reportado en Plan de Pruebas B4-27 donde la app arroja error pero ejecuta el cambio en backend); y reciclaje agresivo de líneas telefónicas por telcos peruanas (Bitel, Claro, Entel, Movistar).',
    impact: 4,
    probability: 4,
    suggestedControl: 'Corrección inmediata del bug B4-27 como gate de salida del Friend & Family (F&F), verificación OTP obligatoria en dos pasos ante cambios de número, validación periódica de titularidad de la línea mediante integración telco (Carrier API), y procedimiento en CX para desbloquear reingresos justificados.',
    documentControl: 'Plan de Pruebas F&F: Casos B4-25 a B4-28 (Gate de salida bug de teléfono) y One Pager Producto (Límite 2 cambios/año).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Tech Lead Backend (Jonathan Castañeda) & QA Lead (Carolina Maio)',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-CCE-03-1',
        description: 'Despliegue del parche correctivo para el bug de cambio de teléfono B4-27 validando respuesta HTTP 200 síncrona antes de alterar el estado del Alias en el directorio central de CCE.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CCE-03-2',
        description: 'Doble factor de autenticación (SMS OTP + Biometría facial) obligatorio para autorizar la desafiliación y cambio de número celular en la app.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 4. FUGA DE MARGEN Y DESCALCE POR COMISIÓN OCULTA DE GMONEY (S/ 0.80) Y SPREAD DLOCAL
  {
    id: 'R-CCE-04',
    processArea: 'Finanzas',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    product: 'Integración CCE - Perú',
    process: 'Pricing, Costeo Transaccional, Liquidación FX y Comisiones de Interconexión',
    riskDescription: 'Erosión inesperada del margen financiero unitario y pérdida neta recurrente en operaciones de bajo ticket (ej. envíos de S/ 1 a S/ 5 Soles en pruebas o producción), derivado de cobros no presupuestados de comisiones fijas de Gmoney (S/ 0.80 PEN por transacción) sumados al fee de dispersión de USD 1.00 cobrado al cliente.',
    cause: 'Comisión fija oculta de Gmoney de S/ 0.80 PEN por operación debitada directamente del saldo en Panda (descubierta y registrada en notas [g][h] de las pruebas de dispersión); y asimetría de costos cuando transferencias que exceden los límites se desvían hacia Dlocal con tarifas de pasarela superiores.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Incorporación formal de la tarifa unitaria de Gmoney (S/ 0.80 PEN) en el modelo de unit economics de Finanzas, establecimiento de un monto mínimo transaccional en PayOut (ej. S/ 5 PEN) para evitar rentabilidad negativa, y renegociación por volumen de la tarifa plana de Panda.',
    documentControl: 'Evidencias de Dispersión CCI: Notas [g][h] (Comisión de 0.8 soles descontada del saldo Panda) y FAQ CX (Costo de 1 USD).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head of Finance (Diego García Lira) & Head de Pricing',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 3,
    reputacional: 2,
    legal: 2,
    associatedControls: [
      {
        id: 'C-CCE-04-1',
        description: 'Regla de negocio en el cotizador de remesas que establece un monto mínimo de envío de S/ 5 Soles en PayOut para garantizar cobertura del fee operacional de S/ 0.80 PEN.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CCE-04-2',
        description: 'Auditoría y conciliación mensual automatizada del reporte de débitos de Panda Gmoney contra las transacciones reales liquidadas en Mambu.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 5. ASIMETRÍA EN UMBRALES TRANSACCIONALES, RECHAZOS Y FRAGMENTACIÓN DE PAGOS (> S/ 10,000)
  {
    id: 'R-CCE-05',
    processArea: 'Operaciones',
    secondaryProcessArea: 'CX',
    origin: 'Interno',
    product: 'Integración CCE - Perú',
    process: 'Gestión de Límites Transaccionales, Splitting de Pagos y Experiencia del Usuario',
    riskDescription: 'Rechazo inesperado de depósitos PayIn por montos legítimos superiores a S/ 10,000 Soles, fricción severa en usuarios que intentan abonar hasta el límite de la red (S/ 30,000) y quejas reiteradas en canales de atención, derivado de la discrepancia de límites entre canales y la obligación de fraccionar pagos.',
    cause: 'Regla rígida de negocio que rechaza automáticamente cualquier PayIn vía CCI superior a S/ 10,000 Soles obligando al usuario a realizar múltiples transferencias (splitting forzado), mientras que no peruanos en PayOut tienen tope de S/ 30,000 y transferencias por Alias/QR topadas en S/ 500.',
    impact: 3,
    probability: 4,
    suggestedControl: 'Mensajería preventiva clara e interactiva en la pantalla de recepción ("Para montos mayores a S/ 10,000 divide tu transferencia en 2 o más abonos"), actualización del bot Clara para guiar al usuario ante códigos de rechazo AM02/AM12, y evaluación técnica para elevar el umbral PayIn a S/ 30,000.',
    documentControl: 'One-Pager Producto: Tabla de Límites PayIn/PayOut y Nota [a] (Límite real 30.000 soles pero rechazo en 10.000).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Product Owner CCE (Benjamín Herrera) & Head CX',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 2,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-CCE-05-1',
        description: 'Banner y tooltip informativo en la sección "Quiero mi número de cuenta" explicitando el límite de S/ 10,000 por transacción antes de que el cliente ordene la transferencia desde su banco origen.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-CCE-05-2',
        description: 'Mapeo contextual en el microservicio de integración de códigos de rechazo CCE (AM02 umbral excedido) devolviendo una sugerencia amigable en la app móvil.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 6. LAVADO DE ACTIVOS Y SUPLANTACIÓN EN RECEPCIÓN DE FONDOS DE TERCEROS EN CUENTAS VIRTUALES
  {
    id: 'R-CCE-06',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'Integración CCE - Perú',
    process: 'Prevención de Lavado de Activos (PLAFT), Debida Diligencia y Monitoreo de Cuentas Virtuales',
    riskDescription: 'Uso de las cuentas virtuales CCI/Alias de Global66 como puente para el blanqueo de capitales, recepción de fondos de procedencia ilícita o triangulación de estafas digitales (mulas bancarias), acarreando sanciones de la Superintendencia de Banca, Seguros y AFP (SBS), multas de la UIF-Perú e investigaciones penales.',
    cause: 'Políticas del producto que permiten explícitamente recepcionar fondos (PayIn) de terceros no coincidentes con el titular de la cuenta Global66 (confirmado en FAQ CX); alta velocidad de la red inmediata 24/7 sin retención preventiva para screening; y dificultad para rastrear al originante real cuando proviene de billeteras externas.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Motor de monitoreo transaccional en tiempo real con reglas PLAFT específicas para CCE (acumulación inusual de PayIns de múltiples terceros en menos de 24 horas, abonos seguidos de retiros inmediatos cross-border), complementado con validación del documento del ordenante contra listas restrictivas vinculantes.',
    documentControl: 'FAQ CX: Sección Cargas/PayIn ("¿Se aceptan pagos desde cuentas de terceros? Sí").',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Cumplimiento (María Gutiérrez) & Head de Prevención de Fraude',
    residualImpact: 2,
    residualProbability: 1,
    financiero: 4,
    procesos: 4,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-CCE-06-1',
        description: 'Regla de scoring de riesgo PLAFT que bloquea automáticamente la dispersión hacia fuera del país si la cuenta virtual recibió más de 3 depósitos de terceros distintos en el mismo día sin KYC reforzado.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CCE-06-2',
        description: 'Screening automático del DNI/RUC del ordenante capturado en la trama CCE contra listas OFAC, PEP y antecedentes penales previo a liberar saldo en la billetera.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 7. DESINCRONIZACIÓN MULTICAPA EN CONCILIACIONES (PANDA GMONEY - MAMBU - CASHCALLS)
  {
    id: 'R-CCE-07',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    product: 'Integración CCE - Perú',
    process: 'Conciliación Automática Tripartita, Registro de Cuentas Espejo 81 y CashCalls',
    riskDescription: 'Descuadre en saldos contables, órdenes en estado "PENDING_RESPONSE" sin resolución y demoras en la devolución de fondos al wallet ante transferencias fallidas en la red interbancaria, derivando en diferencias de caja no conciliadas y auditorías desfavorables.',
    cause: 'Arquitectura contable de alta complejidad que genera 4 movimientos por cada transacción en Mambu (Movimiento origen -> Espejo 81 IN -> Espejo 81 OUT GMONEY_CCE -> Fees) con multiplicidad de identificadores desvinculados (Remittance ID, Mambu ID, CashCall ID y PaymentApi ID); sumado a la falta de comprobación en tiempo real del portal Panda Gmoney.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Pipeline de conciliación automatizada en tiempo real que ejecuta el cruce tripartito continuo entre Mambu (cuentas espejo 81), el webhook de CCE y el reporte diario de Panda Gmoney, con reversa automática de saldo al wallet si una orden permanece más de 10 minutos en PENDING_RESPONSE.',
    documentControl: 'Evidencias de Dispersión CCI: Análisis de movimientos Mambu (IDs 75697294 a 75697297, CashCall 28386961).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Conciliaciones & Tech Lead Core Bancario',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-CCE-07-1',
        description: 'Servicio de reconciliación asíncrono con crons cada 15 minutos que liquida o cancela automáticamente las órdenes huérfanas en estado PENDING_RESPONSE.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CCE-07-2',
        description: 'Validación estricta de coherencia contable entre cuentas espejo Global Card Chile / PSP Argentina y Global 81 SpA previo al cierre diario de las 16:00.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 8. CAÍDA DE LA RED INMEDIATA 24/7 Y FALLA DE CONMUTACIÓN AUTOMÁTICA (FAILOVER) A DLOCAL
  {
    id: 'R-CCE-08',
    processArea: 'Continuidad',
    secondaryProcessArea: 'TI',
    origin: 'Externo',
    product: 'Integración CCE - Perú',
    process: 'Alta Disponibilidad, Resiliencia Tecnológica y Circuit Breaker con Dlocal',
    riskDescription: 'Degradación de servicio, incumplimiento del SLA de inmediatez promocionado comercialmente ("Soles al toque 24/7") y quejas masivas en fines de semana o madrugadas ante caídas del switch de la CCE o del gateway de Gmoney, si el enrutamiento de respaldo hacia Dlocal no conmuta de forma transparente.',
    cause: 'Fallas de conectividad en el enlace SFTP/API de Gmoney con la CCE; falta de pruebas integrales de stress del switch de conmutación automática ("Circuit Breaker") entre CCE y Dlocal; y tiempos de procesamiento superiores en la ruta Dlocal en horarios no bancarios.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Monitor sintético de salud del canal CCE con latencia y tasa de éxito en tiempo real; conmutación automática por error (failover) transparente hacia la ruta Dlocal tras 2 fallos consecutivos o degradación superior a 30 segundos; y feature flags en frontend para advertir al usuario sobre tiempos estimados sin interrumpir el flujo.',
    documentControl: 'Estrategia PaP: Mecanismos de Rollback Front/Back (Dlocal como vía paralela activa) y FAQ CX.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO & Lead SRE / DevOps (Alejandro Delgadillo)',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-CCE-08-1',
        description: 'Circuito de contingencia automatizado (Circuit Breaker) que conmuta el 100% del tráfico de PayOut hacia Dlocal de forma transparente si la pasarela CCE devuelve errores 5xx por más de 60 segundos.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CCE-08-2',
        description: 'Feature flags granulares en LaunchDarkly controlados por operaciones para desactivar selectivamente PayIn o PayOut sin requerir despliegues de código.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // 9. IMPOSIBILIDAD DE DESAFILIACIÓN EN CUENTAS CON BLOQUEO O CIERRE VOLUNTARIO
  {
    id: 'R-CCE-09',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'CX',
    origin: 'Interno',
    product: 'Integración CCE - Perú',
    process: 'Gestión de Estados de Cuenta, Protocolos de Bloqueo y Reclamos ante SBS/Indecopi',
    riskDescription: 'Imposibilidad de procesar solicitudes de cierre de cuenta de usuarios peruanos, secuestro de números telefónicos en el directorio CCE que impide a ex-clientes afiliarse a otras entidades financieras, y multas impuestas por Indecopi o la SBS por vulneración al derecho del consumidor de cerrar servicios financieros libremente.',
    cause: 'Vacío operativo crítico documentado en la nota [c] del FAQ de CX: si una cuenta está en estado Blocked o Fully Blocked por riesgo o fraude, o si el cliente tiene saldo ínfimo, la app no permite la desafiliación autónoma ni existe herramienta operativa para que CX desafilie el Alias administrativamente.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Desarrollo en el Backoffice / Retool de una acción administrativa autorizada ("Desafiliar Alias CCE Forzoso") para agentes de CX de Nivel 2 y Cumplimiento, permitiendo liberar el número telefónico del directorio CCE ante cierres voluntarios o bloqueos irrevocables de cuenta.',
    documentControl: 'FAQ CX: Pregunta 1 ("¿Si el cliente solicita cerrar su Cuenta Global, se cierra la cuenta CCE?") y Nota [c] de CX.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de CX & Lead Legal Perú (Francisca Solar)',
    residualImpact: 1,
    residualProbability: 1,
    financiero: 2,
    procesos: 4,
    reputacional: 3,
    legal: 4,
    associatedControls: [
      {
        id: 'C-CCE-09-1',
        description: 'Herramienta en panel de Backoffice con autenticación Maker-Checker para que el equipo de soporte o compliance desafilie administrativamente el Alias/CCI a solicitud del titular.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CCE-09-2',
        description: 'Procedimiento operativo estándar (SOP) de cierre de cuenta peruana que valida automáticamente la desafiliación previa en el directorio central de CCE antes de archivar el registro en Mambu.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  }
];

export const CCE_PERU_ACTION_PLANS: CcePeruActionPlan[] = [
  {
    id: 'ACT-CCE-01',
    riskId: 'R-CCE-01',
    riskTitle: 'Automatización del Target Balance y Prefondeo 1.7x/2.4x en BCRP',
    processArea: 'Tesorería',
    strategy: 'Mitigated',
    responsible: 'Carlos Mendoza (Lead Ops Settlement) & Head de Tesorería',
    targetDate: '2026-08-25',
    progress: 45,
    tasks: 'Implementar bot de monitoreo en tiempo real del saldo disponible en CCE, fijar horario límite de fondeo a las 11:30 am con BCP y establecer buffer precautorio para fines de semana.',
    status: 'En proceso',
    budget: '4,500 USD',
    framework: 'Continuidad',
    evidences: []
  },
  {
    id: 'ACT-CCE-02',
    riskId: 'R-CCE-02',
    riskTitle: 'Formalización del Contrato Maestro, SLA y Manual Operativo con Gmoney',
    processArea: 'Estratégico',
    strategy: 'Mitigated',
    responsible: 'Benjamín Herrera (PO CCE) & Head of Legal Regional',
    targetDate: '2026-08-30',
    progress: 35,
    tasks: 'Exigir la entrega formal del manual operativo CCE a Alison (Gmoney), firmar SLA vinculante con penalizaciones por caídas y formalizar la cuenta BCP 193-1893518-0-42.',
    status: 'En proceso',
    budget: '0 USD (Recursos internos)',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'ACT-CCE-03',
    riskId: 'R-CCE-03',
    riskTitle: 'Subsanación del Bug de Cambio de Teléfono (Gate F&F B4-27) y Verificación OTP',
    processArea: 'TI',
    strategy: 'Mitigated',
    responsible: 'Jonathan Castañeda (Tech Lead BE) & Carolina Maio (QA)',
    targetDate: '2026-08-20',
    progress: 60,
    tasks: 'Resolver el error de interfaz en cambio de teléfono como gate de salida del Friend & Family, incorporar validación biométrica y restringir reingresos no autorizados.',
    status: 'En proceso',
    budget: '2,000 USD',
    framework: 'SICB',
    evidences: []
  },
  {
    id: 'ACT-CCE-04',
    riskId: 'R-CCE-06',
    riskTitle: 'Motor de Detección de Mulas Financieras y Reglas PLAFT para Cargas de Terceros',
    processArea: 'Cumplimiento',
    strategy: 'Mitigated',
    responsible: 'María Gutiérrez (Oficial de Cumplimiento) & Gerente Anti-Fraude',
    targetDate: '2026-08-28',
    progress: 40,
    tasks: 'Configurar reglas de detección temprana para depósitos de terceros no coincidentes, screening síncrono del originante contra listas restrictivas y alertas por retiros inmediatos cross-border.',
    status: 'En proceso',
    budget: '5,000 USD',
    framework: 'Fraude',
    evidences: []
  }
];
