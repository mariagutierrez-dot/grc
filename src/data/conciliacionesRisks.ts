import { Risk } from '../types';

export const CONCILIACIONES_MATRIX_RISKS: Risk[] = [
  {
    id: 'R-CON-01',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    process: 'Estimación y Alteración Arbitraria de Saldos por Falta de Cartola Bancaria (Saldos Aproximados)',
    riskDescription: 'Afectación financiera, operativa y de confiabilidad del balance ocasionada por la falta de recepción oportuna de cartolas oficiales de bancos y partners durante el pre-cierre, que genera el registro de saldos aproximados o estimados manualmente en las planillas de conciliación para mostrar la caja preliminar, derivando en distorsión de la posición real de liquidez neta, toma de decisiones erróneas de tesorería y eventuales sobregiros contables.',
    cause: 'Falta de canales automatizados de ingesta de extractos bancarios (APIs/SWIFT) y tolerancia operativa a la estimación empírica de balances en planillas de cálculo.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Bloqueo sistemático de cierre sin cartola bancaria oficial. En casos de fuerza mayor, aprobación formal de Tesorería marcando el balance como Saldo Provisorio Auditado con reversión obligatoria en T+1.',
    documentControl: 'Política de Cierre Operativo de Caja, Protocolo de Contingencia de Saldos No Confirmados y Gobierno de Extractos Bancarios Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones / Tesorería',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-01-1',
        description: 'Bloqueo preventivo en sistema de cierre: prohibición absoluta de asentar saldos aproximados sin extracto digital verificado con hash bancario.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-01-2',
        description: 'Protocolo de contingencia formal con autorización de segundo nivel (Maker-Checker Tesorería) y reversión obligatoria a primera hora de T+1.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-02',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    process: 'Integridad Comprometida por Carga y Manipulación Manual de Datos (Copy-Paste Google Sheets - FASCOM)',
    riskDescription: 'Afectación operativa, contable y regulatoria ocasionada por la extracción manual de archivos Excel desde FASCOM, copiado a Google Sheets compartidos y reingreso manual de llaves de conciliación y cadenas de texto en bloque, que genera errores de tipeo, pegado de formatos truncados y alteración accidental de fórmulas, derivando en inconsistencias materiales de saldos entre sistemas transaccionales y contables, con carencia de pistas de auditoría inmutables.',
    cause: 'Inexistencia de un pipeline ETL automatizado bidireccional entre el Core transaccional, FASCOM y los libros contables.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Pipeline automatizado API-First con validación criptográfica de esquemas para sincronización síncrona entre FASCOM y el Core de conciliaciones, erradicando la manipulación de planillas intermedias.',
    documentControl: 'Estándar de Automatización de Datos Financieros, Integración Segura de Sistemas y Gestión de Herramientas de Usuario Final (EUC).',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI / Arquitectura',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-02-1',
        description: 'Pipeline ETL automatizado sin intervención humana con ingesta directa vía API REST segura y validación de sumas de comprobación (Checksum MD5/SHA256).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-02-2',
        description: 'Logs inmutables de auditoría transaccional bajo estándar WORM (Write Once, Read Many) sobre todas las cargas de snapshot en FASCOM.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-03',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    process: 'Descalce Temporal y Falta de Conciliación Atómica de Movimientos y Activos en Tránsito',
    riskDescription: 'Afectación económica y de liquidez inter-entidad ocasionada por la confirmación y cambio de estado manual de fondos en tránsito entre billeteras o custodios (ej. Bitso a Utila en USDT) con modificación manual de fechas de acreditación, que genera registro tardío o duplicado de transferencias en tránsito y desfases con los cortes bancarios locales, derivando en discrepancias entre la disponibilidad de caja real y la reportada en los pre-cierres de tesorería.',
    cause: 'Dependencia de confirmación humana para el cambio de estado de acreditación sin polling automatizado ni listeners de eventos transaccionales.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Reconciliador síncrono de tránsitos con listeners de webhooks y confirmación de blockchain/red bancaria que actualice de forma atómica la fecha valor y el estado de acreditación sin intervención de operadores.',
    documentControl: 'Manual Operativo de Conciliación de Cuentas Puente, Tránsitos Inter-Custodios y Cierre Diario de Posición de Caja.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-03-1',
        description: 'Webhook Engine transaccional con polling continuo y confirmación atómica automática de transferencias entre billeteras y bancos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-03-2',
        description: 'Alerta automática de desfase temporal: notificación inmediata si un movimiento en tránsito supera las 24 horas sin confirmación de contraparte.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-04',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    process: 'Valoración Inexacta de Saldos Multidivisa por Distribución Informal de Tipos de Cambio',
    riskDescription: 'Afectación económica, contable y de reporte corporativo ocasionada por la difusión de tipos de cambio de cierre mediante correos electrónicos no estructurados y su transcripción manual en fórmulas de conversión a USD, que genera la aplicación de tasas desfasadas o erróneas por parte de distintos analistas, derivando en distorsión del balance consolidado en moneda extranjera y fluctuaciones contables artificiales por diferencia de cambio.',
    cause: 'Ausencia de un servicio oficial y centralizado de tipos de cambio de cierre (FX Master / Oracle) consumido programáticamente por los sistemas de conciliación.',
    impact: 3,
    probability: 3,
    suggestedControl: 'Servicio corporativo centralizado FX Rate Master con API REST bloqueada para tipos de cambio de cierre homologados, con inyección directa en FASCOM y libros de cálculo.',
    documentControl: 'Política de Gestión de Riesgo Cambiario, Fijación Oficial de Tasas de Cierre y Procedimiento de Conversión Multidivisa.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Controller / Contabilidad',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-04-1',
        description: 'Módulo Centralizado FX Rate Master con ingesta automática de tasas oficiales de Bancos Centrales (Banco Central de Chile, BanRep Colombia, BCRA) y cotización oficial de cierre.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'R-CON-05',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Mesa de Dinero',
    origin: 'Interno',
    process: 'Concentración Operativa y Vulnerabilidad en el Registro Manual de Inversiones (SPOF)',
    riskDescription: 'Afectación patrimonial y operativa ocasionada por la concentración de la captura manual de colocaciones financieras (monto, tasa, vencimiento y enlaces a Google Drive) en un único analista sin validación cruzada inmediata, que genera omisiones o demoras involuntarias en el devengo y reconocimiento de rescates de cuotapartes, derivando en descalces entre la posición reportada por Tesorería y Contabilidad y exposición ante ausencias no planificadas.',
    cause: 'Carencia de un módulo integrado de gestión de inversiones con integración bancaria directa y segregación de funciones (Maker-Checker).',
    impact: 4,
    probability: 3,
    suggestedControl: 'Flujo institucional de colocaciones e inversiones con carga originada en Tesorería, validación dual Maker-Checker, acople de comprobante PDF oficial y sincronización contable automática.',
    documentControl: 'Manual de Políticas de Inversión de Liquidez Corporativa, Control Dual en Colocaciones y Conciliación de Fondos Mutuos.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de Finanzas / Tesorería',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-05-1',
        description: 'Workflow institucional de Inversiones en FASCOM con flujo Maker-Checker obligatorio (Creación por Tesorería y Aprobación/Visado por Mesa de Dinero/Contabilidad).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CON-05-2',
        description: 'Repositorio documental centralizado vinculado por ID único de inversión con almacenamiento inmutable en Google Cloud Storage / S3 para extractos y cuotapartes.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-06',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Interno',
    process: 'Asimetría de Accesos a Portales Bancarios y Dependencia de Solicitudes Descoordinadas',
    riskDescription: 'Afectación operativa y de gobierno de accesos ocasionada por la falta de credenciales de consulta del equipo de Conciliaciones a plataformas de partners y custodios clave (ej. Lynx, Aciapp, Coinag), dependiendo de capturas y comprobantes enviados informalmente por Contabilidad, que genera demoras en la identificación de diferencias y pérdida de independencia en la función de conciliación, derivando en cuellos de botella para el cierre contable mensual.',
    cause: 'Políticas desarticuladas de aprovisionamiento de accesos de consulta y falta de perfiles estandarizados de auditoría/conciliación.',
    impact: 3,
    probability: 4,
    suggestedControl: 'Matriz formal de accesos de solo lectura (Read-Only) para el equipo de Conciliaciones en todos los portales de adquirencia, bancos y corresponsales.',
    documentControl: 'Estándar Corporativo de Gestión de Identidades y Accesos (IAM), Perfiles de Consulta Bancaria y Matriz de Segregación de Funciones.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-06-1',
        description: 'Aprovisionamiento formal de perfiles de consulta bancaria (Read-Only / Auditor) para analistas de conciliaciones con autenticación multifactor (MFA/SSO).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'R-CON-07',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    process: 'Ausencia de Bloqueo Criptográfico Post-Cierre y Falta de Workflow Maker-Checker Formal',
    riskDescription: 'Afectación legal, de cumplimiento y de control interno ocasionada por la revisión y cuadratura de pre-cierre mediante intercambios de correos electrónicos con permisos de edición libre sobre planillas compartidas, que genera el riesgo de modificaciones retrospectivas de saldos ya conciliados sin trazabilidad de aprobaciones, derivando en reparos de auditoría interna/externa y vulnerabilidad en la veracidad de los estados financieros presentados.',
    cause: 'Inexistencia de un módulo formal con estado de congelamiento (Freeze / Lockout) y firma digital dual para dar por cerrado el periodo.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Protocolo de congelamiento transaccional (Freeze Post-Cierre) con firma de aprobación dual y cambio a modo solo lectura (WORM) de la data de conciliación.',
    documentControl: 'Política Corporativa de Cierre Contable, Inmutabilidad de Registros Financieros y Certificación de Saldos de Auditoría.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Controller / Auditoría Interna',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-07-1',
        description: 'Funcionalidad de "Lockout / Freeze Contable" en FASCOM: congelamiento de saldos del periodo con firma dual (Jefe de Conciliaciones + Controller Financiero).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CON-07-2',
        description: 'Certificado criptográfico de cierre mensual emitido y guardado con hash inalterable para auditorías de CMF, SFC y auditores externos Big Four.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-08',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    process: 'Extracción Manual de Datos Transaccionales de Mambu vía SQL Directo en Producción (DBeaver)',
    riskDescription: 'Afectación operativa, de ciberseguridad y de continuidad del negocio ocasionada por la ejecución diaria de consultas SQL manuales no parametrizadas en clientes de escritorio (DBeaver) directamente contra la base de datos de producción (db-prod-gt.global66.com), que genera el riesgo de degradación severa de performance o bloqueo de tablas por locks concurrentes, errores humanos en cláusulas de filtro y exposición no cifrada de datos transaccionales de clientes (PII / saldos), derivando en caídas de servicio, reportes diarios desfasados y riesgos de fuga de información financiera.',
    cause: 'Falta de un pipeline de datos institucional (Data Warehouse / Read Replica / Datamart) y ausencia de vistas materializadas o endpoints de reportería para el equipo de conciliaciones.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Migrar las consultas manuales de DBeaver a una réplica de lectura analítica (Read Replica) desacoplada y automatizar la ingesta mediante un pipeline dbt / Airflow hacia BigQuery/Snowflake con permisos basados en roles.',
    documentControl: 'Política de Acceso Seguro a Bases de Datos de Producción, Guía de Uso de Herramientas de Reportería y Gestión de Cargas Masivas.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI / Data Engineering',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-08-1',
        description: 'Replicación asíncrona a Read-Replica Analítica con usuario de solo lectura restringido y timeout forzado de consultas (30s) para aislar la base transaccional principal.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-08-2',
        description: 'Automatización de extracción vía Job programado en Airflow/dbt con exportación a almacenamiento seguro (GCS) y trazabilidad completa de consultas ejecutadas.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-09',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    process: 'Descalce de Respaldo de Pasivo de Clientes sin Alerta Automatizada de Solvencia (NCG 464 CMF)',
    riskDescription: 'Afectación legal, regulatoria y patrimonial ocasionada por la ausencia de monitoreo en tiempo real y alertas tempranas automatizadas que comparen el pasivo consolidado de clientes en cuentas de custodia y provisión frente a los activos líquidos en custodia bancaria y DAPs, que genera que eventuales descalces por sobregiros, rechazos bancarios o quiebres transaccionales solo se detecten de forma reactiva en revisiones manuales al día siguiente, derivando en incumplimiento de la exigencia de provisión del 100% de fondos ante la Comisión para el Mercado Financiero (CMF NCG 464 / RAN 20-10), con multas monetarias, apercibimientos y riesgo de revocación de la licencia emisora de prepago.',
    cause: 'Falta de un motor automatizado de conciliación continua de solvencia que ejecute alertas de brecha negativa (Pasivo Clientes > Activo Custodia).',
    impact: 5,
    probability: 3,
    suggestedControl: 'Implementación de un motor de solvencia continua y alertas automáticas vía PagerDuty/Slack cuando el ratio de respaldo caiga bajo el 102%, con provisión obligatoria de buffer patrimonial.',
    documentControl: 'Manual de Cumplimiento Normativo NCG 464 CMF, Política de Resguardo de Fondos de Clientes de Prepago y Procedimiento de Contingencia de Liquidez.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones / Compliance Officer',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-09-1',
        description: 'Motor de Alerta Temprana de Cobertura Regulatoria CMF con disparador automático si el ratio Activo Custodia / Pasivo Clientes desciende por debajo del 102% de margen de seguridad.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CON-09-2',
        description: 'Colchón de liquidez preventiva (Buffer Escrow Corporativo) intransferible para absorción instantánea de fluctuaciones operativas de prepago.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-10',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Mesa de Dinero',
    origin: 'Interno',
    process: 'Liquidación y Cuadre Empírico de Vencimientos de Depósitos a Plazo (DAPs) con Respaldo en Correos',
    riskDescription: 'Afectación económica, financiera y de liquidez ocasionada por el control manual de plazos, días restantes y liquidaciones de DAPs en hojas de cálculo no integradas, validando abonos en cuentas corrientes bancarias (ej. Banco BICE cuenta 22) a través de comprobantes PDF enviados por correo electrónico no estructurado, que genera el riesgo de no identificar retenciones bancarias indebidas, atrasos en abonos de capital más intereses o reinversiones no instruidas a tiempo, derivando en pérdida de rentabilidad por dineros ociosos, descalces de caja y errores materiales en los informes de pre-cierre.',
    cause: 'Desarticulación entre el equipo de Tesorería ejecutora y Conciliaciones validadora, con ausencia de un Treasury Management System (TMS) conectado vía API a los bancos custodios.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Implementación de un módulo de gestión de DAPs en TMS con calendario algorítmico de vencimientos, matching automático de cartolas provisorias contra órdenes de tesorería y validación automática de intereses.',
    documentControl: 'Procedimiento Operativo de Inversiones y DAPs, Protocolo de Rescate de Capital e Intereses y Conciliación Bancaria Diaria.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería / Mesa de Dinero',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-10-1',
        description: 'Sistema Automatizado de Gestión de Inversiones (TMS) con calendario algorítmico de vencimientos y matching automático de abonos bancarios contra órdenes de Tesorería.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-10-2',
        description: 'Alerta de vencimiento T-24h y validación obligatoria a las 09:30 AM con escalamiento inmediato a Mesa de Dinero si no se acredita el rescate bancario.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-11',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Tesorería',
    origin: 'Interno',
    process: 'Desfase y Bloqueo Operativo de Tesorería por Retraso en Carga Manual de Mambu a Redshift (Ventana 16:00-17:00)',
    riskDescription: 'Afectación económica, de liquidez y operativa ocasionada por la dependencia de la extracción manual diaria de transacciones desde Mambu y su subida manual a FASCOM, que al no completarse antes de la ventana crítica de las 17:00 hrs impide que Tesorería ejecute su script de "Health Check" para calzar posiciones, derivando en imposibilidad de cerrar la posición cambiaria diaria, toma de decisiones desinformadas de compra/venta de divisas (FX) y potenciales descalces patrimoniales intradía.',
    cause: 'Inexistencia de un pipeline ETL automatizado en tiempo real entre Mambu y Amazon Redshift, y concentración de la ejecución manual en un solo analista ("somos muy celosos con la subida").',
    impact: 4,
    probability: 4,
    suggestedControl: 'Pipeline de replicación automatizada (CDC/Airflow) directa de Mambu hacia Amazon Redshift sin intervención manual, con alertas de monitoreo en Slack (#driver_mambu_conciliacion) y protocolo de contingencia automática si la carga no se completa a las 15:30 hrs.',
    documentControl: 'Manual Carga de Base de Datos Mambu a FASCOM / Redshift, Procedimiento de Health Check de Tesorería y SLA de Cierre Operativo.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones / Tesorería',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-11-1',
        description: 'Alerta temprana de monitoreo de SLA en Slack (#driver_mambu_conciliacion) a las 15:30 hrs si el job de carga de Mambu no ha sido iniciado, con escalamiento a respaldo operativo.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-11-2',
        description: 'Script de contingencia automatizado en Python/SQL con extracción directa por API de Mambu para poblar la tabla mambu_transaction en Redshift ante fallas del operador humano.',
        type: 'Correctivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 90,
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-12',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    process: 'Inconsistencia de Balances y Quiebre de Auditoría por Imposibilidad de Carga Retrospectiva en FASCOM',
    riskDescription: 'Afectación contable, operativa y de trazabilidad ocasionada por la arquitectura del validador de FASCOM que solo procesa registros de "último día / hoy" sin capacidad de carga retrospectiva (imposibilidad de cargar días omitidos hacia atrás), que genera huecos en la serie histórica de la base de datos Redshift si una jornada no se procesa, derivando en descuadres de conciliación acumulados y dificultad para reconstruir pistas de auditoría ante requerimientos regulatorios.',
    cause: 'Lógica del script de carga en FASCOM que no contempla jobs de backfill parametrizables por rango de fechas histórico con desduplicación acumulativa.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Módulo de reprocesamiento histórico (Backfilling Job) con rango de fechas parametrizable en FASCOM, validación de idempotencia por transactionid y hash de fila para evitar duplicidades.',
    documentControl: 'Manual Operativo de Carga de Base de Datos Mambu y Estándar de Reprocesamiento Transaccional.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI / Arquitectura',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-12-1',
        description: 'Módulo de carga histórica (Backfill) en FASCOM con selección de rango de fechas y validación de unicidad de transaction_id antes de insertar en MySQL/Redshift.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-13',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Interno',
    process: 'Fragilidad y Puntos Únicos de Falla en Pipeline Multi-Salto (Mambu XLSX -> S3 -> MySQL -> Redshift COPY)',
    riskDescription: 'Afectación tecnológica, de ciberseguridad y continuidad operativa ocasionada por la cadena de ingesta híbrida de 4 etapas (descarga manual desde portal web Mambu, subida a AWS S3, procesamiento en MySQL y comando COPY a Amazon Redshift) bajo credenciales personales y OpenVPN, que genera riesgo de fallas silenciosas en la sincronización, corrupción de formatos en archivos intermedios o interrupción por expiración de VPN, derivando en transacciones no reflejadas en la tabla mambu_transaction y desfases en los reportes de conciliación.',
    cause: 'Pipeline artesanal híbrido con múltiples capas intermedias sin orquestación institucional de colas (SQS/Kafka) ni CDC directo.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Migración a arquitectura de ingesta streaming de eventos con AWS EventBridge/Kafka o CDC directo desde el transactional datastore de Mambu hacia el Data Warehouse Redshift, eliminando la manipulación de archivos Excel intermedios.',
    documentControl: 'Estándar Corporativo de Integración Segura de Datos Financieros y Arquitectura Cloud de Conciliaciones.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de TI',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-13-1',
        description: 'Orquestación de carga con Step Functions y validación automática de integridad (row count matching entre S3, MySQL y Redshift) con reversión automática ante inconsistencias.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CON-13-2',
        description: 'Dead-Letter Queue (DLQ) con notificación y volcado automático de registros fallidos en logs de FASCOM y Slack para diagnóstico inmediato sin pérdida de datos.',
        type: 'Detectivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 90,
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-14',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Operaciones',
    origin: 'Interno',
    process: 'Distorsión Material de Pasivos de Clientes por Fallas Algorítmicas de Cálculo y Ajustes Forzados Manuales en FASCOM (Caso Pasivo 3: Desfase de $6M a $1.8M)',
    riskDescription: 'Afectación financiera, contable y regulatoria ocasionada por errores en las queries o fórmulas de cálculo automático del Pasivo 3 (pasivo de billeteras de clientes) en FASCOM —que generó un descalce que inflaba el saldo a ~6M USD frente al valor real esperado de ~1.8M USD—, induciendo a los analistas a sobreescribir manualmente los montos en planillas individuales para forzar el cuadre sin una remediación de código raíz ni bitácora de auditoría formal, derivando en distorsión del cálculo de provisión de fondos exigida por los reguladores (CMF / SFC) y exposición a sanciones.',
    cause: 'Fallas algorítmicas en las queries de consolidación del pasivo de clientes en FASCOM, combinada con la tolerancia operativa a la alteración manual discrecional de saldos por parte de los analistas sin aprobación de un segundo nivel (Maker-Checker).',
    impact: 5,
    probability: 4,
    suggestedControl: 'Auditoría y refactorización urgente del algoritmo de cálculo de Pasivo 1, 2 y 3 en FASCOM con validación contra el core Mambu, e implementación de bloqueo estricto de edición manual: cualquier ajuste a saldos de pasivo debe requerir aprobación explícita de Contabilidad/Auditoría con ticket de soporte trazable.',
    documentControl: 'Procedimiento de Cálculo y Cuadratura de Pasivos Exigibles, Protocolo de Integridad de Fórmulas FASCOM y Política de Aprobación de Ajustes Manuales.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Controller Financiero / Head de Operaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-14-1',
        description: 'Refactorización y validación automatizada de queries de agregación de Pasivo 1, 2 y 3 en FASCOM con pruebas de estrés y conciliación algorítmica contra Mambu.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-14-2',
        description: 'Bloqueo de sobreescritura manual en FASCOM: prohibición de modificar valores calculados de pasivo sin flujo de visado dual (Maker-Checker) y registro de justificación.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-15',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    process: 'Emisión y Cierre Operativo con Saldos No Verificados / Pendientes (Criterio Empírico "Más o Menos Cuadrado" y Registros en Amarillo)',
    riskDescription: 'Afectación operativa y de veracidad financiera ocasionada por la emisión y distribución del informe de cierre diario de caja manteniendo saldos pendientes sin conciliar (visibles en color amarillo en FASCOM) bajo un juicio cualitativo subjetivo ("mientras el número esté más o menos cuadrado, lo enviamos"), que genera el riesgo de ocultar descalces materiales o partidas no identificadas entre bancos y el ledger, derivando en acumulaciones de diferencias que impactan negativamente el cierre contable mensual y auditorías externas.',
    cause: 'Ausencia de una compuerta de control duro (Hard Gate / Quality Gate) en FASCOM que impida la generación del cierre si existen saldos sin confirmación bancaria o marcados en estado pendiente.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Compuerta de cierre condicional en FASCOM que bloquee la emisión de reportes finales si existen saldos no reconciliados, permitiendo únicamente emitir estados con marca explícita de "Cierre Provisorio con Excepciones" bajo autorización expresa de Tesorería.',
    documentControl: 'Política de Certificación de Cierre Diario de Caja, Criterios de Aceptabilidad de Diferencias y Manual de Calidad de Datos Financieros.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones / Jefe de Conciliaciones',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-15-1',
        description: 'Compuerta de calidad en FASCOM (Quality Gate) que impide emitir el cierre si existen cuentas marcadas en amarillo (no conciliadas) sin excepción autorizada.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-15-2',
        description: 'Tablero de semaforización de saldos pendientes con escalamiento automático si una cuenta en amarillo permanece más de 24 horas sin conciliación efectiva.',
        type: 'Detectivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 90,
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-16',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'TI',
    origin: 'Interno',
    process: 'Vulnerabilidad y Quiebre de Trazabilidad por Notificación Informal del Cierre Vía Capturas de Pantalla en Gmail y Respuestas Desarticuladas (Hilos Rotos)',
    riskDescription: 'Afectación de gobierno de datos y control interno ocasionada por la formalización del cierre financiero mediante capturas de pantalla pegadas en correos de Gmail sin firma digital ni estructura estandarizada, donde las observaciones de contrapartes (ej. aperturas de cuentas bancarias no notificadas o traspasos omitidos) se gestionan por hilos de correo parciales sin copiar a todos los involucrados, derivando en pérdida de pistas de auditoría inmutables, asimetría de información entre Conciliaciones y Tesorería, y riesgo de omisión de cuentas en la conciliación.',
    cause: 'Inexistencia de un módulo institucional de certificación y workflow de aprobaciones en FASCOM, dependiendo del correo electrónico como canal transaccional no estructurado.',
    impact: 3,
    probability: 4,
    suggestedControl: 'Módulo de publicación oficial de Cierres en FASCOM con generación de PDF sellado criptográficamente (Hash SHA-256) y canal centralizado de incidentes/novedades (Service Desk / Jira) para reportar y trackear aperturas de cuentas o traspasos no informados, erradicando los intercambios de correos aislados.',
    documentControl: 'Estándar Corporativo de Difusión y Certificación de Reportes Financieros, Procedimiento de Gestión de Incidencias de Conciliación y Gobierno de Comunicaciones.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI / Controller',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-16-1',
        description: 'Módulo de publicación oficial en FASCOM con descarga de reporte formal firmado con hash inmutable SHA-256 distribuido vía webhook seguro.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CON-16-2',
        description: 'Protocolo de gestión de novedades de cuentas bancarias vía Jira Service Management con obligatoriedad de notificación a Tesorería y Conciliaciones simultáneamente.',
        type: 'Correctivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 90,
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CON-17',
    processArea: 'Conciliaciones',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    process: 'Falta de Reconocimiento y Registro Pasivo de Fondos Bloqueados en Prescripción (Pasivo 1 a Resultados)',
    riskDescription: 'Afectación legal, contable y tributaria ocasionada por la gestión manual del "Pasivo 1" (fondos retenidos en cuentas bloqueadas que tras 1 año pasarían a resultados de Global66), sin un mecanismo automatizado de envejecimiento (aging), notificación preceptiva al titular y verificación de normativa de fondos no reclamados / abandono legal en cada jurisdicción (Chile, Colombia, Argentina), derivando en riesgo de apropiación indebida de fondos de clientes o contingencias con entes reguladores (CMF / SFC) y autoridades de protección al consumidor.',
    cause: 'Control empírico y ad-hoc del pasivo bloqueado sin motor de prescripción con validación de requisitos legales por país.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Módulo de envejecimiento automático del Pasivo 1 con alertas T-90 y T-30 días previo al cumplimiento del plazo de prescripción, protocolo de debida diligencia de contacto con el cliente antes de cualquier reclasificación contable y opinión jurídica formal por jurisdicción.',
    documentControl: 'Manual de Tratamiento de Cuentas Bloqueadas, Procedimiento de Fondos No Reclamados y Política Contable de Pasivos Exigibles.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer / Legal Lead',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-CON-17-1',
        description: 'Motor automatizado de aging para Pasivo 1 en FASCOM con alertas automáticas de vencimiento y registro de gestiones de notificación previa al cliente.',
        type: 'Preventivo',
        nature: 'Automático',
        responsibility: 'Asignado y Monitoreado',
        formality: 'Divulgado y Evidenciable',
        frequency: 'Continuo y Total 100%',
        efficiency: 'Excelente',
        controlIndex: 95,
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  }
];

export interface ConciliacionesActionPlan {
  id: string;
  riskId: string;
  riskTitle: string;
  processArea: 'Conciliaciones' | 'Operaciones' | 'TI' | 'Cumplimiento' | 'Fraude' | 'Ciberseguridad' | 'Mesa de Dinero';
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

export const CONCILIACIONES_ACTION_PLANS: ConciliacionesActionPlan[] = [
  {
    id: 'PLN-TR-CON-001',
    riskId: 'R-CON-01',
    riskTitle: 'Bloqueo Sistemático de Saldos Estimados y Protocolo Formal de Contingencia con Reversa T+1',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones / Tesorería',
    targetDate: '2026-08-30',
    progress: 70,
    tasks: 'Implementar regla en sistema que impida asentar saldos no verificados y diseñar el procedimiento formal de excepción con visado de Tesorería.',
    status: 'En proceso',
    budget: '$6,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-002',
    riskId: 'R-CON-02',
    riskTitle: 'Pipeline ETL API-First para Ingesta Directa sin Hojas de Cálculo Intermedias en FASCOM',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de TI / Arquitectura',
    targetDate: '2026-09-30',
    progress: 50,
    tasks: 'Desarrollar microservicio de ingesta que sincronice cartolas bancarias y balances directamente hacia FASCOM mediante endpoints protegidos.',
    status: 'En proceso',
    budget: '$14,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-003',
    riskId: 'R-CON-03',
    riskTitle: 'Reconciliador Síncrono de Fondos en Tránsito con Webhook Listeners y Reglas de Alerta 24h',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-08-25',
    progress: 60,
    tasks: 'Automatizar el cambio de estado de acreditación de transferencias inter-custodios mediante confirmaciones síncronas de red y monitoreo de demoras.',
    status: 'En proceso',
    budget: '$9,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-004',
    riskId: 'R-CON-04',
    riskTitle: 'Servicio Corporativo FX Rate Master para Distribución Homologada de Tipos de Cambio',
    processArea: 'Conciliaciones',
    strategy: 'Resolved',
    responsible: 'Controller / Contabilidad',
    targetDate: '2026-07-31',
    progress: 85,
    tasks: 'Centralizar el feed de tipos de cambio de cierre en un endpoint REST consumido por FASCOM y el ERP contable sin envío de correos manuales.',
    status: 'En proceso',
    budget: '$5,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-005',
    riskId: 'R-CON-05',
    riskTitle: 'Workflow Dual Maker-Checker de Inversiones y Repositorio Cloud Inmutable de Respaldo',
    processArea: 'Conciliaciones',
    strategy: 'Owned',
    responsible: 'Head de Finanzas / Tesorería',
    targetDate: '2026-08-15',
    progress: 75,
    tasks: 'Habilitar perfil de carga de colocaciones en Tesorería con aprobación obligatoria en Mesa de Dinero y carga de comprobantes certificados.',
    status: 'En proceso',
    budget: '$8,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-006',
    riskId: 'R-CON-06',
    riskTitle: 'Matriz Estandarizada de Accesos Read-Only a Portales Bancarios para Conciliaciones',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'CISO / Ciberseguridad',
    targetDate: '2026-07-20',
    progress: 100,
    tasks: 'Aprovisionar credenciales de consulta con MFA a analistas de conciliaciones para Lynx, Aciapp, Coinag y bancos regionales.',
    status: 'Completado',
    budget: '$3,500 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-007',
    riskId: 'R-CON-07',
    riskTitle: 'Protocolo de Congelamiento Transaccional (Freeze Post-Cierre) con Firma Dual en FASCOM',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Controller / Auditoría Interna',
    targetDate: '2026-09-15',
    progress: 55,
    tasks: 'Implementar bloqueo de edición WORM sobre pre-cierres firmados y generación de certificado criptográfico de cierre para reguladores.',
    status: 'En proceso',
    budget: '$10,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-011',
    riskId: 'R-CON-11',
    riskTitle: 'Pipeline Automatizado Mambu-Redshift y Monitoreo de SLA para Health Check de Tesorería',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones / Tesorería',
    targetDate: '2026-09-30',
    progress: 40,
    tasks: 'Desarrollar replicación automatizada Mambu-Redshift antes de las 16:00 hrs y alertas tempranas en canal #driver_mambu_conciliacion.',
    status: 'En proceso',
    budget: '$18,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-012',
    riskId: 'R-CON-12',
    riskTitle: 'Módulo de Reprocesamiento Histórico e Idempotencia en FASCOM',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de TI / Arquitectura',
    targetDate: '2026-10-15',
    progress: 30,
    tasks: 'Construir job de backfill en FASCOM que permita cargar días omitidos con deduplicación y hash único por transacción.',
    status: 'En proceso',
    budget: '$12,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-013',
    riskId: 'R-CON-13',
    riskTitle: 'Modernización de Ingesta Cloud Event-Driven para Datos Financieros',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'CISO / Head de TI',
    targetDate: '2026-11-15',
    progress: 25,
    tasks: 'Migrar el pipeline de 4 saltos a EventBridge/Kafka con Dead-Letter Queue y validación atómica entre Mambu y Redshift.',
    status: 'En proceso',
    budget: '$22,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-014',
    riskId: 'R-CON-14',
    riskTitle: 'Refactorización de Fórmulas de Pasivo en FASCOM y Bloqueo de Alteración Manual',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Controller Financiero / Head de Operaciones',
    targetDate: '2026-09-15',
    progress: 20,
    tasks: 'Auditar y corregir la query de agregación de Pasivo 3 en FASCOM eliminando el sobreprecio a 6M y bloqueando ediciones manuales sin ticket.',
    status: 'En proceso',
    budget: '$15,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-015',
    riskId: 'R-CON-15',
    riskTitle: 'Compuerta de Control de Calidad en Cierre Diario (Quality Gate Anti-Amarillos)',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones / Jefe de Conciliaciones',
    targetDate: '2026-10-01',
    progress: 35,
    tasks: 'Desarrollar regla de bloqueo en FASCOM que impida emitir el cierre si existen cuentas en amarillo sin confirmación bancaria.',
    status: 'En proceso',
    budget: '$9,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-016',
    riskId: 'R-CON-16',
    riskTitle: 'Plataforma Institucional de Certificación de Cierre y Workflow Centralizado de Novedades',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Head de TI / Controller',
    targetDate: '2026-10-30',
    progress: 25,
    tasks: 'Eliminar el envío de pantallazos por Gmail y canalizar la distribución de informes con hash inmutable y gestión de novedades en Jira.',
    status: 'En proceso',
    budget: '$14,000 USD',
    framework: 'SARO',
    evidences: []
  },
  {
    id: 'PLN-TR-CON-017',
    riskId: 'R-CON-17',
    riskTitle: 'Módulo de Aging Legal y Protocolo de Prescripción de Fondos Bloqueados (Pasivo 1)',
    processArea: 'Conciliaciones',
    strategy: 'Mitigated',
    responsible: 'Compliance Officer / Legal Lead',
    targetDate: '2026-11-30',
    progress: 15,
    tasks: 'Implementar cálculo automatizado de antigüedad de fondos retenidos con alertas previas a 1 año y validación legal por jurisdicción.',
    status: 'Por iniciar',
    budget: '$11,000 USD',
    framework: 'SARO',
    evidences: []
  }
];
