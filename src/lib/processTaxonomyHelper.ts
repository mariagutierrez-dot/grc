import { 
  GLOBAL66_PROCESS_TAXONOMY, 
  ProcessMacroCategory, 
  ProcessArea, 
  Risk 
} from '../types';

/**
 * Subprocesos oficiales Nivel 2 asociados a los 14 Macroprocesos Regionales de Global66
 */
export const OFFICIAL_SUBPROCESSES: Record<number, string[]> = {
  1: [
    'Planeación estratégica regional',
    'Gobierno corporativo y comités',
    'Definición y seguimiento de OKRs y KPIs',
    'Estructura societaria y filiales'
  ],
  2: [
    'SARO (Riesgo Operativo)',
    'SARLAFT / SAGRILAFT / AML',
    'Ciberseguridad y Riesgo Tecnológico',
    'Continuidad de Negocio (BCP / DRP)',
    'Gestión y prevención de fraude',
    'Matriz de riesgos y apetito al riesgo'
  ],
  3: [
    'Relacionamiento con CMF / SFC / BCRA / UAF',
    'Licencias financieras y permisos de operación',
    'Reportes regulatorios obligatorios',
    'Cumplimiento normativo y ley FinTech'
  ],
  4: [
    'Ciclo de vida de producto fintech',
    'Pricing y estructura de comisiones',
    'Onboarding y enrolamiento de producto',
    'Stablecoins (USDT & USDC)',
    'Integración SII Chile (B2B Onboarding)',
    'Bre-B (Pagos Inmediatos Colombia)',
    'Adquirencia Global (B2B Deposit Money All)',
    'APIB2B(MCP) Servidor Model Context Protocol',
    'Integración CCE - Perú (Interoperabilidad B2C)',
    'Payout Swift por JPMorgan',
    'Global chats (Kit P2P Wow)',
    'Cuentas Virtuales (Virtual IBAN)'
  ],
  5: [
    'Adquisición de clientes (B2C y B2B)',
    'Retención y fidelización de usuarios',
    'Alianzas comerciales estratégicas',
    'Growth marketing y campañas'
  ],
  6: [
    'Core transaccional bancario (Mambu / ledger)',
    'APIs y microservicios transfronterizos',
    'Arquitectura Cloud (AWS / GCP)',
    'Soporte tecnológico L2/L3 y DevOps',
    'Pipelines de CI/CD y despliegue continuo'
  ],
  7: [
    'Tesorería (Custodia, cuentas de salvaguarda, DAP)',
    'Mesa de dinero (FX, spreads, cotizaciones, trading OTC)',
    'Conciliación y compensación bancaria',
    'Liquidaciones y transferencias LBTR',
    'Cierre diario de caja y cuadre 16:00',
    'FASCOM y pre-cierre operativo'
  ],
  8: [
    'Atención al cliente / SAC multicanal',
    'Defensor del consumidor financiero',
    'Gestión de PQRs y reclamos regulatorios',
    'Experiencia y calidad de servicio (NPS/CSAT)'
  ],
  9: [
    'Atracción y selección de talento',
    'Nómina y compensaciones regionales',
    'Desarrollo organizacional y capacitación',
    'Cultura, clima laboral y seguridad en el trabajo'
  ],
  10: [
    'Control y aprovisionamiento de hardware / laptops',
    'Custodias de activos físicos y tokens bancarios',
    'Seguridad física de sedes e instalaciones'
  ],
  11: [
    'Ciberseguridad operativa y monitoreo SOC',
    'Gestión de vulnerabilidades y pentesting',
    'Control de accesos privilegiados (PAM/IAM)',
    'Cifrado, secretos y protección de datos (RAN 20-10 / ISO 27001)'
  ],
  12: [
    'Procesos legales corporativos y litigios',
    'Gestión, negociación y custodia de contratos',
    'Poderes, personerías y mandatos judiciales',
    'Propiedad intelectual y marcas'
  ],
  13: [
    'Gestión del cambio organizacional',
    'Expansión a nuevos países de América Latina',
    'Absorción de nuevas capacidades de negocio'
  ],
  14: [
    'Planeación anual de auditoría interna',
    'Ejecución de auditorías de procesos y tecnología',
    'Seguimiento a planes de acción (Tercera Línea de Defensa)',
    'Informes a Comité de Auditoría y Directorio'
  ]
};

/**
 * Obtiene los subprocesos oficiales para un proceso dado
 */
export const getSubprocessesForTaxonomyProcess = (processId: number): string[] => {
  return OFFICIAL_SUBPROCESSES[processId] || [
    'Operación general del proceso',
    'Control y aseguramiento interno'
  ];
};

/**
 * Resuelve la jerarquía completa de la taxonomía para cualquier riesgo,
 * garantizando que no se inventen procesos arbitrarios y todo esté vinculado
 * a los 14 macroprocesos oficiales.
 */
export const resolveTaxonomyForRisk = (risk: Partial<Risk>): {
  macrocategory: ProcessMacroCategory;
  taxonomyProcessId: number;
  taxonomyProcessName: string;
  subproceso: string;
  processArea: ProcessArea;
} => {
  // Si ya tiene ID válido entre 1 y 14, sincronizar
  if (risk.taxonomyProcessId && risk.taxonomyProcessId >= 1 && risk.taxonomyProcessId <= 14) {
    const procDef = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === risk.taxonomyProcessId)!;
    const subps = getSubprocessesForTaxonomyProcess(procDef.id);
    const subproceso = risk.subproceso && subps.includes(risk.subproceso) 
      ? risk.subproceso 
      : subps[0];

    let area: ProcessArea = (risk.processArea || procDef.mappedProcessArea || 'Operaciones') as ProcessArea;
    // Afinamiento para proceso 7
    if (procDef.id === 7) {
      if (subproceso.toLowerCase().includes('tesorería')) area = 'Tesorería';
      else if (subproceso.toLowerCase().includes('mesa')) area = 'Mesa de Dinero';
      else if (subproceso.toLowerCase().includes('conciliación')) area = 'Conciliaciones';
      else area = 'Operaciones';
    }

    return {
      macrocategory: procDef.macrocategory,
      taxonomyProcessId: procDef.id,
      taxonomyProcessName: procDef.categoryLevel1,
      subproceso,
      processArea: area
    };
  }

  // Deducción automática por área de proceso o producto
  const area = risk.processArea;
  const desc = ((risk.riskDescription || '') + ' ' + (risk.process || '') + ' ' + (risk.cause || '')).toLowerCase();

  // 1. Tesorería
  if (area === 'Tesorería') {
    const proc7 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 7)!;
    return {
      macrocategory: 'Misionales',
      taxonomyProcessId: 7,
      taxonomyProcessName: proc7.categoryLevel1,
      subproceso: 'Tesorería (Custodia, cuentas de salvaguarda, DAP)',
      processArea: 'Tesorería'
    };
  }

  // 2. Mesa de Dinero
  if (area === 'Mesa de Dinero') {
    const proc7 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 7)!;
    return {
      macrocategory: 'Misionales',
      taxonomyProcessId: 7,
      taxonomyProcessName: proc7.categoryLevel1,
      subproceso: 'Mesa de dinero (FX, spreads, cotizaciones, trading OTC)',
      processArea: 'Mesa de Dinero'
    };
  }

  // 3. Conciliaciones
  if (area === 'Conciliaciones') {
    const proc7 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 7)!;
    return {
      macrocategory: 'Misionales',
      taxonomyProcessId: 7,
      taxonomyProcessName: proc7.categoryLevel1,
      subproceso: 'Conciliación y compensación bancaria',
      processArea: 'Conciliaciones'
    };
  }

  // 4. Ciberseguridad
  if (area === 'Ciberseguridad') {
    const proc11 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 11)!;
    return {
      macrocategory: 'De Apoyo',
      taxonomyProcessId: 11,
      taxonomyProcessName: proc11.categoryLevel1,
      subproceso: 'Ciberseguridad operativa y monitoreo SOC',
      processArea: 'Ciberseguridad'
    };
  }

  // 5. Fraude
  if (area === 'Fraude') {
    const proc2 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 2)!;
    return {
      macrocategory: 'Estratégicos',
      taxonomyProcessId: 2,
      taxonomyProcessName: proc2.categoryLevel1,
      subproceso: 'Gestión y prevención de fraude',
      processArea: 'Fraude'
    };
  }

  // 6. Cumplimiento
  if (area === 'Cumplimiento') {
    if (desc.includes('licencia') || desc.includes('cmf') || desc.includes('sfc') || desc.includes('regulatori')) {
      const proc3 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 3)!;
      return {
        macrocategory: 'Estratégicos',
        taxonomyProcessId: 3,
        taxonomyProcessName: proc3.categoryLevel1,
        subproceso: 'Reportes regulatorios obligatorios',
        processArea: 'Cumplimiento'
      };
    }
    const proc2 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 2)!;
    return {
      macrocategory: 'Estratégicos',
      taxonomyProcessId: 2,
      taxonomyProcessName: proc2.categoryLevel1,
      subproceso: desc.includes('aml') || desc.includes('la/ft') || desc.includes('sarlaft') 
        ? 'SARLAFT / SAGRILAFT / AML' 
        : 'SARO (Riesgo Operativo)',
      processArea: 'Cumplimiento'
    };
  }

  // 7. TI / Riesgos Nube
  if (area === 'TI' || area === 'Riesgos Nube') {
    const proc6 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 6)!;
    return {
      macrocategory: 'Misionales',
      taxonomyProcessId: 6,
      taxonomyProcessName: proc6.categoryLevel1,
      subproceso: 'Arquitectura Cloud (AWS / GCP)',
      processArea: area
    };
  }

  // 8. Nuevos Productos
  if (area === 'Nuevos Productos') {
    const proc4 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 4)!;
    let sub = 'Ciclo de vida de producto fintech';
    if (risk.product === 'Bre-B') sub = 'Bre-B (Pagos Inmediatos Colombia)';
    else if (risk.product === 'Stablecoins') sub = 'Stablecoins (USDT & USDC)';
    else if (risk.product === 'Integración SII Chile') sub = 'Integración SII Chile (B2B Onboarding)';
    else if (risk.product === 'Adquirencia Global') sub = 'Adquirencia Global (B2B Deposit Money All)';
    else if (risk.product === 'APIB2B(MCP)') sub = 'APIB2B(MCP) Servidor Model Context Protocol';
    else if (risk.product === 'Integración CCE - Perú') sub = 'Integración CCE - Perú (Interoperabilidad B2C)';
    else if (risk.product === 'Payout Swift JPMorgan') sub = 'Payout Swift por JPMorgan';
    else if (risk.product === 'Global chats') sub = 'Global chats (Kit P2P Wow)';
    else if (risk.product === 'Cuentas Virtuales') sub = 'Cuentas Virtuales (Virtual IBAN)';
    
    return {
      macrocategory: 'Misionales',
      taxonomyProcessId: 4,
      taxonomyProcessName: proc4.categoryLevel1,
      subproceso: sub,
      processArea: 'Nuevos Productos'
    };
  }

  // Fallback: Proceso 7 Operaciones
  const proc7 = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === 7)!;
  return {
    macrocategory: 'Misionales',
    taxonomyProcessId: 7,
    taxonomyProcessName: proc7.categoryLevel1,
    subproceso: 'Liquidaciones y transferencias LBTR',
    processArea: 'Operaciones'
  };
};
