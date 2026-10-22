import { Risk, ProcessArea } from '../types';

export interface StablecoinsActionPlan {
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

/**
 * Matriz Oficial de Riesgos ISO 31000:2018 para la línea de producto Stablecoins (USDT & USDC).
 * Fundamentada estrictamente en la evidencia documental provista:
 * 1. Documento de Alcance: Billeteras Stablecoins (1.0) — Maurizio Oneto & Cristóbal Valle.
 * 2. Documento de Alcance: Stablecoins 2.0 (Consolidación operacional y features must-have) — Cristóbal Valle.
 */
export const STABLECOINS_MATRIX_RISKS: Risk[] = [
  {
    id: 'R-STC-001',
    process: 'Custodia de Activos Digitales y Gestión de Claves Criptográficas (C1-C3)',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'TI',
    category: 'Ciberseguridad / Pérdida de Fondos por Compromiso de Shards MPC',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Interno',
    macrocategory: 'Misionales',
    taxonomyProcessId: 6,
    taxonomyProcessName: 'Gestión de Tecnología de la Información y Ciberseguridad',
    subproceso: 'Custodia MPC, Gestión de Llaves Criptográficas y Disaster Recovery',
    riskDescription: 'Pérdida irreversible de acceso o sustracción no autorizada de saldos custodiados de USDT/USDC por extravío, corrupción o compromiso de los shards (fragmentos de clave privada) en el modelo MPC de Utila.',
    cause: 'Falta de formalización o retraso en la integración del plan de Disaster Recovery (DR) con Station 70 para contingencia de shards, o filtración de credenciales API/Admin de Utila sin autenticación multifactor estricta.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Arquitectura MPC multi-parte distribuida (sin clave privada completa en ningún punto), integración técnica con Station 70 para backup y recuperación de shards ante contingencias, y segregación estricta de credenciales de API.',
    documentControl: 'Modelo de custodia MPC de Utila, integración de Disaster Recovery con Station 70 y política de segregación de accesos al Admin de Utila (DA 1.0 Parte IX).',
    controlDuration: 'Permanente',
    acceptability: 'ACEPTABLE',
    residualImpact: 2,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    financiero: 5,
    procesos: 4,
    reputacional: 5,
    legal: 4,
    associatedControls: [
      {
        id: 'C-STC-01-1',
        description: 'Modelo MPC distribuido provisto por Utila eliminando puntos únicos de falla en la custodia de claves privadas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-01-2',
        description: 'Plan de contingencia y recuperación de shards de respaldo integrado con Station 70 con simulacros semestrales.',
        type: 'Correctivo',
        efficiency: 'Bueno',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-STC-003',
    process: 'Gestión de Rendimiento Pasivo (Yield Pasivo 2.0) y Calce de Liquidez',
    processArea: 'Tesorería',
    secondaryProcessArea: 'Operaciones',
    category: 'Riesgo Financiero / Iliquidez y Descalce de Plazos en Staking',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Interno',
    macrocategory: 'Misionales',
    taxonomyProcessId: 4,
    taxonomyProcessName: 'Gestión de Operaciones y Tesorería',
    subproceso: 'Gestión de Liquidez en Cascada y Remuneración de Saldos',
    riskDescription: 'Incapacidad de atender retiros masivos o pay-outs inmediatos en USDT/USDC debido a que los fondos se encuentran inmovilizados en staking o colocaciones de Yield fuera de la wallet operativa C2.',
    cause: 'Modelo omnibus de remuneración pasiva (hasta 4.5% B2C y 3% B2B) donde Tesorería invierte saldos on-demand sin respetar los períodos de redención (unbonding) frente a la disponibilidad a la vista garantizada al cliente.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Mantenimiento obligatorio de un buffer de liquidez operativa pre-fondeada en C2 equivalente a un mínimo de 2 días de out; modelo de liquidez en cascada (C1 -> Minting Circle/Tether -> CEX Bitso -> Orquestador Bridge); y topes máximos de remuneración mensual por cuenta (2.000 USD).',
    documentControl: 'Modelo de Liquidez en Cascada de Global66 (DA 1.0 Parte X) y Reglas de saldo mínimo C2 / balance elegible 7 días (DA 2.0 Parte III).',
    controlDuration: 'Permanente',
    acceptability: 'ACEPTABLE',
    residualImpact: 2,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de Tesorería',
    financiero: 4,
    procesos: 3,
    reputacional: 4,
    legal: 3,
    associatedControls: [
      {
        id: 'C-STC-03-1',
        description: 'Buffer operativo permanente en C2 cubriendo mínimo 2 días promedio de pay-outs diarios antes de autorizar colocaciones de yield.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-03-2',
        description: 'Modelo de liquidez en cascada de 4 niveles (Tesorería C1 -> Minting directo Circle/Tether -> CEX Bitso -> Orquestador Bridge).',
        type: 'Correctivo',
        efficiency: 'Bueno',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-STC-005',
    process: 'Cotización, Paridad Cambiaria y Feed de Precios (CoinGecko)',
    processArea: 'Mesa de Dinero',
    secondaryProcessArea: 'Operaciones',
    category: 'Riesgo de Mercado / Desalineación de Tipo de Cambio (De-Pegging)',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Externo',
    macrocategory: 'Misionales',
    taxonomyProcessId: 4,
    taxonomyProcessName: 'Gestión de Operaciones y Tesorería',
    subproceso: 'Mesa de Dinero, Cotizador FX y Spread en Horarios No Hábiles',
    riskDescription: 'Pérdida financiera o arbitraje perjudicial en contra de Global66 debido a desfase en las cotizaciones crypto-fiat o eventos de desanclaje (de-pegging) de USDT o USDC frente al dólar.',
    cause: 'Falla o interrupción en el feed de precios de CoinGecko, volatilidad extrema de mercado o falta de actualización del markup dinámico en horarios no bancarios.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Regla kill-switch de desconexión automática del cotizador ante desvíos mayores a 50 bps vs la paridad 1:1 (si el ratio cae por debajo de 0.995 se suspende la ruta y se despliega advertencia al usuario); refresh de tasa cada 15 segundos y actualización automática de markups en horarios no hábiles.',
    documentControl: 'Lógica de Threshold_percent con decimales (máx 50 bps vs 1:1), integración CoinGecko y motor de markup nocturno (DA 1.0 Parte VI y DA 2.0 Sección 1).',
    controlDuration: 'Permanente',
    acceptability: 'ACEPTABLE',
    residualImpact: 1,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Head de Mesa de Dinero',
    financiero: 4,
    procesos: 2,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-STC-05-1',
        description: 'Kill-switch automatizado que desactiva cotizaciones si el desvío de paridad excede 50 bps (< 0.995 vs USD).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-05-2',
        description: 'Actualización automática del markup de USDT/USDC durante horarios no hábiles bancarios y refresco de feed cada 15 segundos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-STC-006',
    process: 'Gobernanza de Payouts de Gran Monto y Políticas de Quórum en Wallets Operativas (C2/C3)',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Finanzas',
    category: 'Fraude Interno / Compromiso de Aprobación en Retiros',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Interno',
    macrocategory: 'Misionales',
    taxonomyProcessId: 4,
    taxonomyProcessName: 'Gestión de Operaciones y Tesorería',
    subproceso: 'Aprobación y Despacho de Pay-Outs Institucionales',
    riskDescription: 'Extracción o desvío no autorizado de grandes volúmenes de fondos desde las wallets operativas (C2) o de tesorería (C3) mediante la alteración o vulneración de firmas operativas individuales.',
    cause: 'Falta de segregación de funciones o co-firmas en transferencias de alta cuantía que superen los umbrales de procesamiento directo.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Matriz estricta de co-firmas por montos en C2/C3: transacciones menores a 250.000 USD automáticas vía RTP; entre 250.000 y 750.000 USD requieren aprobación individual de Head of Ops; y mayores a 750.000 USD requieren quórum mancomunado 2 de 3 (Head of Ops + CFO); whitelisting obligatorio en C3.',
    documentControl: 'Política Operaciones Utila v2 (Tabla de Quórums por Monto USD equivalente) y whitelisting estricto de destinos en C3 (DA 1.0 Parte VIII).',
    controlDuration: 'Permanente',
    acceptability: 'ACEPTABLE',
    residualImpact: 2,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones & CFO',
    financiero: 5,
    procesos: 3,
    reputacional: 5,
    legal: 4,
    associatedControls: [
      {
        id: 'C-STC-06-1',
        description: 'Matriz de quórums escalonados en Utila: <250k automático RTP, 250k-750k 1 admin Head of Ops, >750k multi-firma 2 de 3 (Head of Ops + CFO).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-06-2',
        description: 'Whitelisting criptográfico cerrado de direcciones de destino autorizadas para la bóveda de tesorería Capa 3 (C3).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-STC-007',
    process: 'Cumplimiento Normativo y Restricción Geográfica (Exclusión Argentina y Chile)',
    processArea: 'Legal',
    secondaryProcessArea: 'Cumplimiento',
    category: 'Riesgo Regulatorio / Operación No Autorizada en Mercados Regulados',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Externo',
    macrocategory: 'Misionales',
    taxonomyProcessId: 10,
    taxonomyProcessName: 'Cumplimiento Normativo y Prevención de Delitos',
    subproceso: 'Elegibilidad de Clientes, Onboarding y Licenciamiento Jurisdiccional',
    riskDescription: 'Sanciones regulatorias, apercibimientos o clausura de licencias por habilitar servicios de stablecoins a clientes residentes en Argentina (excluido por falta de registro VASP/PSAV) o Chile (pendiente de sucursal regulada).',
    cause: 'Vulneración o bypass de los filtros de elegibilidad en flujos B2C (KYC_1) y B2B, o habilitación inadvertida en el cotizador para usuarios con país de origen excluido.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Bloqueo por país de origen en capa de backend y frontend para clientes de Argentina; apagado de Bridge en Argentina previo a la salida; y arquitectura segregada para Chile/Argentina mediante sucursal (branch) Utila separada con Vault y Signer dedicados.',
    documentControl: 'Matriz de Elegibilidad por País de Global66 (DA 1.0 Parte I) y Arquitectura de Branch Segregada Utila (DA 2.0 M11).',
    controlDuration: 'Permanente',
    acceptability: 'ACEPTABLE',
    residualImpact: 2,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Compliance Officer & Legal Director',
    financiero: 4,
    procesos: 3,
    reputacional: 5,
    legal: 5,
    associatedControls: [
      {
        id: 'C-STC-07-1',
        description: 'Restricción sistemática de elegibilidad por país de origen en KYC_1 personas y KYC empresa, bloqueando creación de wallets a usuarios de Argentina.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-07-2',
        description: 'Configuración de branch separada en Utila con Vault y Signer exclusivos para operaciones en mercados regulados (Chile y Argentina).',
        type: 'Preventivo',
        efficiency: 'Bueno',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-STC-008',
    process: 'Atomicidad en Creación de Cuentas y Desincronización Mambu / Utila',
    processArea: 'TI',
    secondaryProcessArea: 'Operaciones',
    category: 'Riesgo Tecnológico / Desincronización y Falla de Integración API',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Interno',
    macrocategory: 'Misionales',
    taxonomyProcessId: 6,
    taxonomyProcessName: 'Gestión de Tecnología de la Información y Ciberseguridad',
    subproceso: 'Alta de Cuentas Mambu G81 y Emisión de Direcciones Blockchain',
    riskDescription: 'Inconsistencia en los registros de clientes donde se crea la billetera contable en Mambu G81 pero falla la asignación de direcciones de depósito en Utila, o viceversa, dejando fondos en el limbo.',
    cause: 'Falla de conectividad asíncrona, timeouts de red blockchain o desestimación de la regla de atomicidad transaccional durante el opt-in del usuario.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Operación atómica transaccional: si falla la emisión de direcciones en la API de Utila se revierte la creación en Mambu y viceversa; pantalla de espera con timeout de 15 segundos y fallback asíncrono con notificación push/mail ("Te avisaremos en cuanto esté todo listo").',
    documentControl: 'Especificación de Atomicidad y Flujo de Manejo de Errores en Emisión de Wallets (DA 1.0 Parte I y III).',
    controlDuration: 'Permanente',
    acceptability: 'ACEPTABLE',
    residualImpact: 2,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de TI / Arquitectura',
    financiero: 3,
    procesos: 4,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-STC-08-1',
        description: 'Patrón de transacción atómica: reversión simétrica si la creación del wallet en Mambu o la emisión en Utila no se completan al 100%.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-08-2',
        description: 'Mecanismo de fallback asíncrono con pantalla de espera de 15 segundos y notificación por push/mail tras reintento en background.',
        type: 'Correctivo',
        efficiency: 'Bueno',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-STC-009',
    process: 'Migración, Convivencia y Apagado Definitivo del Partner Bridge',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Conciliaciones',
    category: 'Riesgo Operacional / Falla de Migración y Descalce en Transición',
    product: 'Stablecoins',
    jurisdiction: 'Regional',
    origin: 'Interno',
    macrocategory: 'Misionales',
    taxonomyProcessId: 4,
    taxonomyProcessName: 'Gestión de Operaciones y Tesorería',
    subproceso: 'Convivencia Operativa Bridge-Utila y Conciliación Transitoria',
    riskDescription: 'Descalces en la conciliación, depósitos rechazados o doble procesamiento durante el período de coexistencia de 30 días entre el partner saliente (Bridge) y la nueva infraestructura (Utila).',
    cause: 'Falta de control en la migración voluntaria de clientes antiguos, fondos enviados a direcciones deprecadas de Bridge tras el apagado o discrepancias en los registros de cashflow.',
    impact: 3,
    probability: 3,
    suggestedControl: 'Ventana de convivencia acotada a máximo 30 días con advertencia visible en la app; capacidad operativa en consola Admin para dirigir payouts por Utila o Bridge; y trazabilidad de conciliación a nivel de transacción individual con external ID reference en Mambu.',
    documentControl: 'One Pager Convivencia Bridge-Utila y Procedimiento de Cierre de F&F (DA 1.0 Parte VII y DA 2.0 Parte I).',
    controlDuration: 'Temporal',
    acceptability: 'ACEPTABLE',
    residualImpact: 1,
    residualProbability: 1,
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Head de Operaciones & Líder de Conciliaciones',
    financiero: 2,
    procesos: 3,
    reputacional: 3,
    legal: 2,
    associatedControls: [
      {
        id: 'C-STC-09-1',
        description: 'Selector de partner de salida (Utila vs Bridge) en el panel administrativo de Operaciones para contingencias de enrutamiento.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-STC-09-2',
        description: 'Conciliación diaria transaccional con external ID reference único mapeando depósitos y payouts entre Bridge, Utila y Mambu.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  }
];

export const STABLECOINS_ACTION_PLANS: StablecoinsActionPlan[] = [
  {
    id: 'PLN-STC-01',
    riskId: 'R-STC-001',
    riskTitle: 'Integración y Certificación de Disaster Recovery de Shards MPC con Station 70',
    processArea: 'Ciberseguridad',
    strategy: 'Mitigated',
    responsible: 'CISO / Head de Ciberseguridad',
    targetDate: '2026-09-15',
    progress: 45,
    tasks: 'Formalizar el contrato de contingencia con Station 70, integrar los flujos de backup de shards MPC de Utila y realizar simulacro de recuperación ante pérdida de shards.',
    status: 'En proceso',
    budget: '$18,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'PLN-STC-02',
    riskId: 'R-STC-002',
    riskTitle: 'Pipeline de Cuarentena en Capa 4 y Configuración de Semáforo Chainalysis KYT',
    processArea: 'Cumplimiento',
    strategy: 'Mitigated',
    responsible: 'Compliance Officer & Head de Prevención de Fraude',
    targetDate: '2026-08-30',
    progress: 60,
    tasks: 'Configurar umbrales de riesgo en Chainalysis KYT (Allow/Alert/Deny), habilitar el ruteo automático a C4 para fondos sospechosos y sincronizar la lista negra interna.',
    status: 'En proceso',
    budget: '$22,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'PLN-STC-03',
    riskId: 'R-STC-003',
    riskTitle: 'Política de Buffer Operativo C2 y Monitoreo de Cascadas de Liquidez para Yield',
    processArea: 'Tesorería',
    strategy: 'Owned',
    responsible: 'Head de Tesorería',
    targetDate: '2026-09-01',
    progress: 50,
    tasks: 'Definir el umbral mínimo intradiario de C2 (2 días de payout) y parametrizar en el cotizador el límite de remuneración mensual de 2.000 USD por cuenta.',
    status: 'En proceso',
    budget: '$5,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'PLN-STC-04',
    riskId: 'R-STC-004',
    riskTitle: 'Despliegue del Módulo Gas Station y Monitoreo de Quema de TRX para Tron',
    processArea: 'Operaciones',
    strategy: 'Mitigated',
    responsible: 'Head de Operaciones',
    targetDate: '2026-08-15',
    progress: 75,
    tasks: 'Implementar la transferencia de TRX para activación y gas fee de sweep C1->C2, configurar los reintentos en minutos 0, 15, 30 y 45 con alertas en Admin.',
    status: 'En proceso',
    budget: '$12,500 USD',
    framework: 'Continuidad',
    evidences: []
  },
  {
    id: 'PLN-STC-05',
    riskId: 'R-STC-005',
    riskTitle: 'Kill-Switch de Paridad (50 bps) y Refresco de 15s en Cotizador CoinGecko',
    processArea: 'Mesa de Dinero',
    strategy: 'Resolved',
    responsible: 'Head de Mesa de Dinero',
    targetDate: '2026-08-10',
    progress: 100,
    tasks: 'Integrar endpoint de CoinGecko, programar la desconexión si ratio < 0.995 y activar el ajuste dinámico de markup para horarios no hábiles.',
    status: 'Completado',
    budget: '$8,000 USD',
    framework: 'ISO 31000',
    evidences: []
  },
  {
    id: 'PLN-STC-06',
    riskId: 'R-STC-007',
    riskTitle: 'Hard-Fence de Elegibilidad por País y Segregación de Sucursal Utila',
    processArea: 'Legal',
    strategy: 'Owned',
    responsible: 'Compliance Officer & Legal Director',
    targetDate: '2026-09-30',
    progress: 40,
    tasks: 'Implementar validación estricta de exclusión de Argentina en el frontend/backend y diseñar el esquema de Branch separada en Utila para la futura operación regulada.',
    status: 'En proceso',
    budget: '$10,000 USD',
    framework: 'SICB',
    evidences: []
  }
];
