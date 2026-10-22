import React, { useState, useEffect, useMemo } from 'react';
import { Risk, ProcessArea, Jurisdiction, BCRACategory, LossEvent, getAcceptability, ControlProposal, RiskStatus, getExposureUSD, getRiskLevel, getRiskColor, cleanRiskDescriptionAndExtractCause, ENTITY_PROFILES } from './types';
import { INITIAL_ARGENTINA_RISKS, INITIAL_ARGENTINA_LOSS_EVENTS } from './data/argentinaData';
import { BcraLossEventDatabase } from './components/BcraLossEventDatabase';
import { rewriteRiskDescriptionToGrcFormula } from './lib/riskRewriter';
import { RiskTable } from './components/RiskTable';
import { RiskHeatmap } from './components/RiskHeatmap';
import { RiskForm } from './components/RiskForm';
import { ControlProposalModule } from './components/ControlProposalModule';
import RiskCatalog from './components/RiskCatalog';
import { MethodologyView } from './components/MethodologyView';
import { ActionPlansModule } from './components/ActionPlansModule';
import { Shield, FileText, BarChart3, LayoutDashboard, Filter, Sparkles, ArrowRight, Inbox, FileSpreadsheet, BookOpen, ShieldAlert, CheckCircle, Video, Database, ClipboardList, Menu, X, Laptop, ChevronRight, Layers, ShieldCheck, Globe2, Landmark, Zap, ExternalLink, Flame, Lock, MessageSquare, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { exportToExcel } from './lib/excelExport';
import { VideoEvidenceSimulator } from './components/VideoEvidenceSimulator';
import { InformationAssetsModule } from './components/InformationAssetsModule';
import { TIRiskApp } from './components/TIRiskApp';
import { CloudRiskSheetsIntegrator } from './components/CloudRiskSheetsIntegrator';
import { ReportsModule } from './components/ReportsModule';
import { StrategicRisksModule } from './components/StrategicRisksModule';
import { CompanyControlsModule } from './components/CompanyControlsModule';
import { ProcessGovernanceModule } from './components/ProcessGovernanceModule';
import { DocumentInventoryModule } from './components/DocumentInventoryModule';
import { RegionalProcessArchitectureView } from './components/RegionalProcessArchitectureView';
import { RiskEventsModule } from './components/RiskEventsModule';
import { FINTECH_PRODUCTS, GLOBAL66_PROCESS_TAXONOMY, ProcessMacroCategory } from './types';
import { resolveTaxonomyForRisk, OFFICIAL_SUBPROCESSES } from './lib/processTaxonomyHelper';
import { MULTITARJETA_MATRIX_RISKS } from './data/multitarjetaRisks';
import { FLUJO_BLOQUEOS_MATRIX_RISKS } from './data/flujoBloqueosRisks';
import { TARJETAS_TEMPORALES_MATRIX_RISKS } from './data/tarjetasTemporalesRisks';
import { CONCILIACIONES_MATRIX_RISKS } from './data/conciliacionesRisks';
import { ADQUIRENCIA_GLOBAL_MATRIX_RISKS } from './data/adquirenciaGlobalRisks';
import { PAYOUT_SWIFT_JPMORGAN_MATRIX_RISKS } from './data/payoutSwiftJPMorganRisks';
import { GLOBAL_CHATS_MATRIX_RISKS } from './data/globalChatsRisks';
import { CCE_PERU_MATRIX_RISKS } from './data/ccePeruRisks';
import { API_B2B_MCP_MATRIX_RISKS } from './data/apiB2bMcpRisks';
import { STABLECOINS_MATRIX_RISKS } from './data/stablecoinsRisks';
import { SII_CHILE_MATRIX_RISKS } from './data/siiChileRisks';

const INITIAL_RISKS: Risk[] = [
  // OPERACIONES
  {
    id: 'R-OPS-001',
    processArea: 'Operaciones',
    process: 'Movimiento de Fondos y Gestión de Partners',
    riskDescription: 'Una deficiencia operativa en el movimiento de fondos que derivaría en el bloqueo o retraso severo en la dispersión, originado por la dependencia de procesos, correos manuales y falta de redundancia en la matriz de poderes de firmas, con impacto directo en partners y la solvencia regional.',
    cause: '- [R-OPS-001]: Dependencia de correos manuales y restricción de la Entidad a solo 4 apoderados autorizados.\n- [R-OPS-002]: Dependencia de procesos manuales para la carga y validación de transacciones en partners específicos como dLocal.\n- [R-OPS-004]: Falta de estandarización y documentación de los firmantes habilitados según el calendario de firmas asociado a cada cuenta/partner.\n- [R-OPS-015]: Falta de redundancia en la matriz de poderes para firmas en portales de partners específicos como Nium o Payoneer.',
    impact: 7,
    probability: 4,
    suggestedControl: 'Automatizar la integración vía API con dLocal y otros partners, ampliar la matriz de apoderados y establecer un SLA rígido de respuesta interna con una base de firmas digitalizada y centralizada.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    roamOwner: 'Head de Operaciones',
    status: 'Aprobado'
  },
  {
    id: 'R-OPS-009',
    processArea: 'Operaciones',
    process: 'Conciliación y Mapeo de Procedimientos de Cartolas',
    riskDescription: 'Afectación económica y reputacional ocasionada por el procesamiento manual de transacciones y falta de integraciones API en algunos partners, que puede generar abonos erróneos, duplicados, acreditaciones con saldos incorrectos o falta total de trazabilidad en las wallets, derivando en pérdidas de patrimonio corporativo y de la confianza del cliente.',
    cause: '- [R-OPS-009]: Falta de integración de API directa con entidades financieras locales ecuatorianas (Austro, Guayaquil) para extraer cartolas y uso de queries SQL manuales de analistas.\n- [R-G66-EC-04]: Ausencia de integraciones API automatizadas Host-To-Host con entidades adquirentes de Ecuador como Banco Pichincha o Guayaquil.\n- [R-OPS-021]: Debilidades metodológicas en la gobernanza y mantenimiento de diagramas transaccionales y manuales de integración.\n- [R-OPS-022]: Carencia de diseño atómico y resiliente en el mapeo técnico de comunicaciones H2H o VPN con corresponsales locales (Efecty, Servipag).',
    impact: 9,
    probability: 5,
    suggestedControl: 'Priorizar e implementar el desarrollo de APIs Host-to-Host (H2H) con el sector financiero ecuatoriano e integraciones directas con corresponsales, estableciendo una gobernanza unificada de diagramas de secuencia.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado'
  },
  {
    id: 'R-OPS-013',
    processArea: 'Operaciones',
    process: 'Gestión de Devoluciones y Reversiones',
    riskDescription: 'Una falla de integridad en la ejecución de reembolsos que derivaría en pagos duplicados o retrasos de SLAs de soporte, originado por el cruce manual de cartolas contra planillas Excel y la falta de flujos parametrizados en Backoffice para cobros grupales o individuales.',
    cause: '- [R-OPS-013]: Alta manualidad en el filtrado de estados y dependencia de la precisión del analista para validar montos duplicados en Excel.\n- [R-OPS-019]: Ausencia de un flujo parametrizado en el portal de Backoffice para reembolsos parciales o unitarios en cobros grupales (Split).',
    impact: 4,
    probability: 3,
    suggestedControl: 'Módulo parametrizado de devoluciones y reversiones en Backoffice con validación de montos y flujo granular para cobros grupales.',
    documentControl: 'Manual de procedimientos de devoluciones y política de reversiones de fondos.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-OPS-013-1',
        description: 'Módulo de devoluciones en Backoffice con validación automática contra transacciones originales para evitar duplicados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-OPS-013-2',
        description: 'Reporte diario de conciliación de reembolsos y reversiones procesadas en Backoffice.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-OPS-010',
    processArea: 'Operaciones',
    process: 'Resiliencia Tecnológica (Bots Scrapers)',
    riskDescription: 'Un retraso operativo masivo en el procesamiento de abonos automáticos que derivaría en quiebres severos de SLAs y reclamos de clientes, originado por la inestabilidad de los bots scraper de cartolas ante actualizaciones imprevistas de los portales de las entidades.',
    cause: '- [R-OPS-010]: Cambios estructurales en portales de entidades financieras o interrupciones de infraestructura que inhabilitan la ejecución de scripts de bots.\n- [R-OPS-018]: Inestabilidad de los bots scraping de Banco Estado y Santander Chile ante cambios repentinos en sus portales y falta de integración Host-to-Host.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Dashboard de Health Check para bots scrapers con alertas en tiempo real e integración de canales Host-to-Host (H2H) directos con las entidades financieras.',
    documentControl: 'Plan de contingencia técnica para bots de lectura de cartolas y protocolo H2H con entidades financieras.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-OPS-010-1',
        description: 'Monitoreo en tiempo real (Health Check) de la tasa de éxito y tiempos de respuesta de bots scrapers.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-OPS-010-2',
        description: 'Conexión Host-to-Host (H2H) con entidades financieras prioritarias para sustitución progresiva del scraping.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-OPS-011',
    processArea: 'Operaciones',
    process: 'Control y Segregación en Portal Admin',
    riskDescription: 'Una vulnerabilidad de fraude interno o acreditación errónea de fondos que derivaría en la apropiación indebida de pasivos, salidas no autorizadas y descalces de balance, originado por permisos laxos, digitación libre sin validación y ausencia de aprobación dual Maker-Checker.',
    cause: '- [R-OPS-008]: Asociación manual basada únicamente en monto y moneda para abonos antiguos (>30 días) sin visualización en portal estándar.\n- [R-OPS-011]: Falta de segregación de funciones (SoD) y flujos Maker-Checker en el módulo administrativo de Global66.\n- [R-OPS-020]: Interfaz operativa de backoffice que permite digitación libre de montos sin precarga inmutable y sobrecarga del analista.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Aprobación dual Maker-Checker obligatoria en portal Admin para liberaciones manuales con precarga inmutable de montos de solo lectura.',
    documentControl: 'Política de segregación de funciones (SoD) en Portal Admin y matriz de autorizaciones Maker-Checker.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-OPS-011-1',
        description: 'Módulo de aprobación dual (Maker-Checker) para toda acreditación o modificación manual superior a los umbrales definidos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-OPS-011-2',
        description: 'Campos de monto e ID transaccional de solo lectura (inmutables) en la interfaz operativa de Backoffice.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // MESA DE DINERO (FX, Coberturas, Arbitraje, Spreads y Quoting RFQ)
  {
    id: 'R-MD-001',
    processArea: 'Mesa de Dinero',
    process: 'Ejecución de FX, Arbitraje y Coberturas Cambiarias',
    riskDescription: 'Una exposición y pérdida financiera directa por errores de digitación o descalces de divisas de alto valor que derivaría en la erosión de los márgenes reales, originado por la toma y negociación manual de cotizaciones vía WhatsApp o llamadas y el ingreso posterior manual eludiendo la conciliación automática.',
    cause: '- [R-MD-001]: Digitación manual directa en la plataforma de partners sin validación sistémica previa.\n- [R-MD-003]: Negociación manual telefónica o por canales informales (WhatsApp/Llamadas) sin cotización digital estandarizada.\n- [R-MD-016]: Negociación de montos elevados en canales informales en lugar del panel RFQ oficial.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Prohibición formal de negociación por WhatsApp/llamadas, uso obligatorio de flujos RFQ sistémicos y terminales de trading integrados.',
    documentControl: 'Política de operación de Mesa de Dinero y protocolo de negociación FX vía RFQ.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Mesa de Dinero',
    associatedControls: [
      {
        id: 'C-MD-001-1',
        description: 'Restricción de cotización y cierre de operaciones FX exclusivamente a través del módulo RFQ integrado en la plataforma.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-MD-001-2',
        description: 'Auditoría periódica de operaciones de compra/venta de divisas y registro de logs de negociación en firme.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MD-003',
    processArea: 'Mesa de Dinero',
    process: 'Fijación de Spreads, Pricing de Cotización y Slippage',
    riskDescription: 'Afectación económica ocasionada por la fijación discrecional de tipos de cambio y cotizaciones automáticas con curvas de precios desactualizadas, que puede generar pérdidas de spread operativo y descalce frente a cotizaciones de mercado, derivando en mermas directas en el margen neto de la mesa.',
    cause: '- [R-MD-019]: Dependencia de algoritmos automáticos de cotización por defecto ante ausencia del operador.\n- [R-MD-020]: Cargos ocultos y fees de contrapartes FX no transparentados en la interfaz de pricing.\n- [R-MD-SPLIT-01]: Desfases temporales entre congelamiento de tasa referencial y ejecución de copagos.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Algoritmo dinámico de spreads con circuit breaker ante volatilidad y actualización de curvas FX en sub-segundos vía FIX protocol.',
    documentControl: 'Manual de Pricing y Spreads de Mesa de Dinero.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Mesa de Dinero',
    associatedControls: [
      {
        id: 'C-MD-003-1',
        description: 'Circuit breaker automático que suspende cotizaciones cuando la volatilidad excede umbrales parametrizados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MD-015',
    processArea: 'Mesa de Dinero',
    process: 'Gestión de Límites de Posición Cambiaria en Monedas Volátiles',
    riskDescription: 'Afectación económica ocasionada por exceder los límites de posición neta abierta en divisas altamente volátiles (ARS, COP, BRL), que puede generar una exposición cambiaria no cubierta ante devaluaciones abruptas, derivando en pérdidas patrimoniales severas para Global66.',
    cause: '- [R-MD-015]: Falta de alertas tempranas en tiempo real al superar el 80% del límite de exposición diaria por moneda.\n- [R-MD-CHILE-01]: Ejecución tardía de coberturas spot/forward en pares de alta volatilidad regional.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Límites duros intradía de posición cambiaria con liquidación automática o cobertura obligatoria al alcanzar el 90% del límite de riesgo de mercado.',
    documentControl: 'Política de Gestión de Riesgo de Mercado y Límites de Posición Cambiaria.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Mesa de Dinero',
    associatedControls: [
      {
        id: 'C-MD-015-1',
        description: 'Bloqueo automático de nuevas cotizaciones de compra cuando la posición neta de la divisa excede el VaR máximo autorizado por el Comité de Riesgos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // TESORERÍA (Liquidez, Custodia de Salvaguarda, Transferencias LBTR, Cuentas Madre y DAPs)
  {
    id: 'R-MD-002',
    processArea: 'Tesorería',
    process: 'Gestión de Liquidez Intradiaria y Posición en Cuentas de Salvaguarda',
    riskDescription: 'Una crisis o descalce financiero severo en la posición agregada de divisas que derivaría en retrasos de payouts, pérdidas cambiarias e incumplimiento de SLAs, originado por baches de caja intradía por ciclos de compensación diferidos y la consolidación manual de caja vía Excel.',
    cause: '- [R-MD-002]: Descalce entre pasivos de wallets y activos en cuentas de salvaguarda.\n- [R-MD-007]: Operación intradía en tiempo real frente a ciclos de compensación diferidos.\n- [R-OPS-023]: Descarga y lectura manual de cartolas locales sin pasarela H2H y demora en consolidar posiciones de caja.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Motor de conciliación automática en tiempo real conectado vía APIs H2H con entidades custodias y pool centralizado de liquidez.',
    documentControl: 'Manual de gestión de liquidez intradía y política de colchón de caja corporativo.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-MD-002-1',
        description: 'Motor de conciliación automatizada en tiempo real entre pasivos de wallets y saldos en cuentas de recaudo.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-MD-002-2',
        description: 'Establecimiento de líneas de crédito stand-by y pool de liquidez transfronterizo para cobertura de desfases intradía.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-MD-008',
    processArea: 'Tesorería',
    process: 'Inversiones, Depósitos a Plazo (DAP) y Transferencias de Alto Valor LBTR',
    riskDescription: 'Un daño al patrimonio o merma de rentabilidad por variaciones abruptas de tasas o errores en transferencias millonarias que derivaría en descalces transfronterizos, originado por ventanas cortas de operaciones DAP/LBTR y desfases temporales en el cobro de Split inter-divisas.',
    cause: '- [R-MD-008]: Procesos manuales de firmas de apoderados y ventanas operativas extremadamente cortas en LBTR.\n- [R-MD-009]: Concentración de liquidez en DAP sin escalera de vencimientos diaria.\n- [R-MD-SPLIT-01]: Desfases temporales entre congelamiento de tasa referencial para Split y el momento de pago.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Digitalización de firmas de apoderados con tokens biométricos móviles, política de vencimientos diarios en DAP y ajuste dinámico de tasa Split.',
    documentControl: 'Política de inversiones y tesorería, y procedimiento de firmas digitales LBTR.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-MD-008-1',
        description: 'Firma digital remota con token biométrico para operaciones de alto valor en LBTR y portales bancarios.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-MD-008-2',
        description: 'Ajuste dinámico de tasa de cambio y ventana de expiración corta (15 min) en cotizaciones de Split Bill.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TES-001',
    processArea: 'Tesorería',
    process: 'Gestión de Liquidez Intradiaria y Cuentas de Salvaguarda Bancaria',
    riskDescription: 'Afectación económica ocasionada por descalces entre los pasivos de las wallets y los activos bancarios de salvaguarda, que puede generar una crisis de liquidez y posición de caja negativa en moneda local, derivando en la inmovilización de fondos y parálisis de la operación diaria.',
    cause: '- [R-TES-001 / R-MD-002]: Descalce entre pasivos de wallets y activos en cuentas de salvaguarda bancaria.\n- [R-MD-007]: Operación intradía en tiempo real frente a ciclos de compensación diferidos de cámaras locales (CCA/ACH).\n- [R-OPS-023]: Demora en consolidar posiciones de caja multi-moneda.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Motor de conciliación automática en tiempo real conectado vía APIs H2H con entidades custodias y pool centralizado de liquidez con buffers de seguridad.',
    documentControl: 'Manual de gestión de liquidez intradía y política de colchón de caja corporativo.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-TES-001-1',
        description: 'Motor de conciliación automatizada en tiempo real entre pasivos de wallets y saldos en cuentas de recaudo y salvaguarda.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-TES-001-2',
        description: 'Establecimiento de líneas de crédito stand-by y pool de liquidez transfronterizo para cobertura de desfases intradía.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TES-002',
    processArea: 'Tesorería',
    process: 'Transferencias de Alto Valor LBTR, Cut-Offs Bancarios y Matriz de Firmas',
    riskDescription: 'Afectación económica y reputacional ocasionada por la recolección manual de firmas y ventanas cortas de tiempo previas al límite de corte del sistema LBTR local, que puede generar demoras operativas o errores de digitación en transferencias millonarias, derivando en un daño masivo al patrimonio corporativo por incumplimiento.',
    cause: '- [R-TES-002 / R-MD-008]: Procesos manuales de firmas de apoderados y ventanas operativas extremadamente cortas en LBTR.\n- [R-MD-006]: Dependencia de confirmaciones verbales para liberación de ciclos de pago sin validación formal de fondos en tránsito.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Digitalización integral de poderes bancarios con esquemas multi-firma biométrica móvil y monitoreo automático de cut-offs con alarmas T-60min.',
    documentControl: 'Política de transferencias de alto valor LBTR y matriz corporativa de poderes bancarios.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-TES-002-1',
        description: 'Firma digital remota con token biométrico dual para transferencias de tesorería superiores al umbral crítico.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TES-003',
    processArea: 'Tesorería',
    process: 'Inversiones de Caja, Depósitos a Plazo (DAP) y Escalera de Vencimientos',
    riskDescription: 'Afectación económica ocasionada por la concentración de liquidez en instrumentos de plazo fijo (DAP) sin diversificación diaria, que puede generar la cancelación anticipada de depósitos a plazo, derivando en una merma o pérdida de rentabilidad en los ingresos financieros proyectados.',
    cause: '- [R-TES-003 / R-MD-009]: Concentración de excedentes en depósitos a plazo fijo con plazos rígidos sin escalonamiento de liquidez intradiaria.\n- [R-CON-05]: Registro manual de colocaciones financieras en planillas aisladas sin visado dual de Tesorería.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Política de diversificación de inversiones de tesorería con exigencia de al menos 30% en instrumentos de disponibilidad T+0 y escalonamiento semanal de DAPs.',
    documentControl: 'Política Corporativa de Inversiones y Gestión de Excedentes de Caja.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-TES-003-1',
        description: 'Regla de inversión que limita la colocación a plazos > 30 días a un máximo de 40% del portafolio de excedentes y prohíbe invertir fondos de reserva regulatoria.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TES-004',
    processArea: 'Tesorería',
    process: 'Administración de Credenciales Bancarias, Tokens Físicos y Continuidad de Cuentas',
    riskDescription: 'Afectación tecnológica y operativa ocasionada por la falta de gestión centralizada de credenciales bancarias y tokens físicos, que puede generar la imposibilidad temporal de operar los portales de tesorería, derivando en retrasos y pérdida de continuidad de los flujos de fondos.',
    cause: '- [R-TES-004 / R-MD-005]: Dispersión de tokens físicos bancarios en múltiples custodias individuales sin redundancia documentada.\n- [R-MD-004]: Concentración operativa de claves bancarias en solo dos operadores habilitados.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Bóveda digital de contraseñas de tesorería (PAM), custodia segura de tokens físicos con protocolo formal de relevo y asignación de apoderados suplentes.',
    documentControl: 'Protocolo de Seguridad y Custodia de Credenciales y Dispositivos de Tesorería.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-TES-004-1',
        description: 'Bóveda de gestión de accesos privilegiados (PAM) con rotación programada de claves bancarias y registro de auditoría.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-TES-005',
    processArea: 'Tesorería',
    process: 'Cierre de Posición de Caja Diaria y Cuadre de Fondos a las 16:00',
    riskDescription: 'Afectación económica y tecnológica ocasionada por registros manuales y transacciones en tránsito no sincronizadas a las 16:00, que puede generar descuadres recurrentes en la conciliación y posición de caja diaria, derivando en reportes de tesorería inconsistentes para la alta gerencia.',
    cause: '- [R-TES-005 / R-MD-013]: Desfase horario en la recepción de cartolas bancarias y conciliación tardía de remesas en tránsito al horario de corte.\n- [R-MD-012]: Restricciones técnicas de partners bancarios que impiden retiros o movimientos parciales de fondos al final del día.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Pipeline automatizado de pre-cierre a las 15:30 con conciliación síncrona H2H de cartolas bancarias y alerta de descuadre mayor a $1,000 USD.',
    documentControl: 'Procedimiento de Cuadre y Reporte de Posición Diaria de Tesorería.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-TES-005-1',
        description: 'Módulo automatizado de pre-cierre que compara cartolas bancarias en línea contra transacciones del core antes del corte oficial.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // CUMPLIMIENTO
  {
    id: 'R-COM-001',
    processArea: 'Cumplimiento',
    process: 'Screening de Onboarding',
    riskDescription: 'Afectación legal y reputacional ocasionada por fallas o falsos positivos mal gestionados en el motor de screening automático, que puede generar la apertura de cuentas a personas en listas restrictivas de onboarding, derivando en severas sanciones regulatorias y pérdida de confianza.',
    cause: '- Fallas o falsos positivos mal gestionados en el motor de screening automático.\n- Omisión en comprobación cruzada contra el ente público del país emisor y vulnerabilidades en la verificación estática de imágenes del documento.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Implementar proveedor de listas en contingencia como respaldo del motor de screening y validación contra entes de control por país (con indicación NA en países sin integración disponible).',
    documentControl: 'Procedimiento de calibración de motor de screening, proveedor de listas en contingencia y lista de verificación con entes de control.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-COM-001-1',
        description: 'Contingencia con proveedor secundario de listas restrictivas (PEP/OFAC) para respaldo del motor de screening.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-COM-001-2',
        description: 'Validación automatizada contra entes de control públicos del país emisor (configurado por país o NA donde no exista integración).',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-COM-002',
    processArea: 'Cumplimiento',
    process: 'Monitoreo Transaccional (KYT)',
    riskDescription: 'Afectación legal y de cumplimiento ocasionada por la suspensión del monitoreo preventivo de alertas transaccionales, que puede generar la omisión de detección de lavado de activos en transacciones B2B/B2C, derivando en la pérdida de licencias financieras regionales.',
    cause: 'Suspensión del monitoreo preventivo de alertas transaccionales.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Sistema de monitoreo preventivo de alertas transaccionales KYT en tiempo real con asignación de personal operativo para continuidad.',
    documentControl: 'Manual de operación KYT y protocolo de escalamiento de operaciones sospechosas.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-COM-002-1',
        description: 'Monitoreo preventivo y continuo de alertas transaccionales (KYT) para operaciones B2B/B2C.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-COM-002-2',
        description: 'Plan de continuidad operativa y asignación de personal para la gestión ininterrumpida de alertas KYT.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-COM-003',
    processArea: 'Cumplimiento',
    process: 'Gestión de Debida Diligencia',
    riskDescription: 'Afectación legal y reputacional ocasionada por falta de evidencias o documentación errada en la gestión realizada a la debida diligencia, derivando en el abono o procesamiento de transacciones ilícitas.',
    cause: 'Falta de evidencias o documentación errada en la gestión realizada a la debida diligencia.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Checklist obligatorio de evidencias documentales de debida diligencia e integración de expediente digital previo a la liberación de transacciones.',
    documentControl: 'Política de debida diligencia y archivo digital de expedientes de clientes.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-COM-003-1',
        description: 'Lista de chequeo (checklist) obligatoria de evidencias documentales para expedientes de debida diligencia (DD/EDD).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-COM-003-2',
        description: 'Validación y archivo digital de soporte documental antes del abono o procesamiento de transacciones.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-COM-004',
    processArea: 'Cumplimiento',
    process: 'Sistemas de Prevención AML',
    riskDescription: 'Afectación legal y regulatoria ocasionada por fallas en los sistemas de prevención a nivel de AML',
    cause: 'Fallas en los sistemas de prevención a nivel de AML.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Monitoreo técnico de disponibilidad y auditoría periódica de reglas parametrizadas en sistemas de prevención AML.',
    documentControl: 'Bitácora de mantenimiento de sistemas y reportes de auditoría de herramientas AML.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-COM-004-1',
        description: 'Sistemas informáticos de prevención de lavado de activos (AML) con monitoreo continuo de disponibilidad técnica.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-COM-004-2',
        description: 'Auditoría periódica y validación de reglas de negocio en los sistemas de prevención de lavado de activos.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // FRAUDE
  {
    id: 'R-FRA-SHEET-01',
    processArea: 'Fraude',
    process: 'Pay-in con Tarjetas y Conciliaciones CCA/ACH',
    riskDescription: 'Una pérdida financiera directa por contracargos repetitivos y fraudes de tarjetas que derivaría en saldos negativos en billeteras, originado por la omisión de validaciones transaccionales y reglas de velocidad.',
    cause: 'Falta de aplicación de reglas antifraude en rieles locales CCA/ACH; ausencia de reglas de velocidad transaccional y protocolo 3DS.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Filtros antifraude, protocolo 3D Secure 2.0 y reglas de velocidad transaccional en pasarela de pagos de tarjetas.',
    documentControl: 'Manual de reglas antifraude en adquirencia y política de gestión de contracargos.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-FRA-001-1',
        description: 'Implementación obligatoria de 3D Secure 2.0 y scoring de riesgo en la pasarela de procesamiento de tarjetas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-FRA-001-2',
        description: 'Reglas de velocidad y monitoreo de frecuencia de transacciones por tarjeta y dispositivo.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-FRA-003',
    processArea: 'Fraude',
    process: 'Prevención de Triangulación y Cuentas Mula',
    riskDescription: 'Una retención preventiva o embargo de cuentas bancarias de recaudo por parte de fiscalías que derivaría en descalce financiero masivo, originado por depósitos de terceros no homónimos, smurfing transaccional de remesas y falta de filtros automáticos de velocidad.',
    cause: '- [R-OPS-006]: Detección manual de depósitos de terceros en cartolas cargadas.\n- [R-FRA-CHILE-01]: Aceptación de transferencias TEF cuyo RUT emisor difiere del onboarding.\n- [R-FRA-003]: Carencia de comparación automatizada entre el NIT/Cédula originador del depósito y los datos de onboarding.',
    impact: 5,
    probability: 4,
    suggestedControl: 'Bloqueo automático en backend de depósitos de terceros no homónimos y calibración de reglas KYT para prevención de cuentas mula.',
    documentControl: 'Política de depósitos de terceros no homónimos y manual de prevención de triangulación.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-FRA-003-1',
        description: 'Validación automatizada del identificador fiscal (RUT/Cédula/NIT) del emisor contra la cuenta de onboarding antes de la acreditación.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-FRA-003-2',
        description: 'Alertas de velocidad por volumen acumulado abonado a beneficiarios no homónimos en motor KYT.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-FRA-001',
    processArea: 'Fraude',
    process: 'Protección de Cuentas (Account Takeover)',
    riskDescription: 'Un vaciamiento de billeteras de clientes y extracción de saldos hacia cuentas mula que derivaría en pérdidas patrimoniales y reclamos ante entes del consumidor, originado por el uso de códigos OTP enviados por SMS vulnerables a Sim-Swapping o Phishing y falta de validaciones biométricas para cambios de datos críticos.',
    cause: '- [R-FRA-001]: Debilidad en el segundo factor de autenticación (SMS interceptable).\n- [R-FRA-SHEET-02]: Empleo de SMS tradicionales propensos a redirecciones y falta de biometría facial ante reconfiguraciones de correo o teléfono.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Autenticación TOTP / Push firmada en App y prueba de vida biométrica facial (Liveness Check) para cambios de credenciales de seguridad.',
    documentControl: 'Política de autenticación multifactor (MFA) y estándar de seguridad de la cuenta de cliente.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-FRA-001-A',
        description: 'Sustitución de SMS OTP por notificaciones Push autenticadas o tokens TOTP en aplicación móvil.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-FRA-001-B',
        description: 'Requisito de verificación biométrica facial en tiempo real para cambios de correo, teléfono o contraseña.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-LIB-FRA-01',
    processArea: 'Fraude',
    process: 'Prevención de Fraude Interno',
    riskDescription: 'Una fuga masiva de activos financieros o alteración voluntaria de abonos que derivaría en descuadres de pasivos e insolvencia corporativa, originado por permisos excesivos en base de datos de producción, falta de segregación de roles (SoD) y manualidad de reintentos de reembolso sin aprobación dual.',
    cause: '- [R-LIB-FRA-01]: Permisos técnicos omnipotentes que facultan la liberación unilateral sin segregación de roles en producción.\n- [R-FRD-INT-01]: Inexistencia de flujo Maker-Checker para acreditaciones manuales en portal Admin.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Eliminación de accesos directos de escritura en BD de producción y flujo Maker-Checker inalterable para dispersión y acreditación manual.',
    documentControl: 'Política de segregación de funciones (SoD) técnica y matriz de perfiles de acceso a producción.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-LIB-FRA-1',
        description: 'Acceso a base de datos de producción restringido a roles de solo lectura (Read-Only) para personal técnico.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-LIB-FRA-2',
        description: 'Aprobación Maker-Checker obligatoria para cualquier reintento o abono manual procesado desde Backoffice.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // CIBERSEGURIDAD
  {
    id: 'R-CIB-001',
    processArea: 'Ciberseguridad',
    process: 'Gestión de Accesos Privilegiados y CI/CD',
    riskDescription: 'Una intrusión en bases de datos o secuestro de la consola cloud de producción que derivaría en inyecciones masivas de saldo, pérdidas de capital de trabajo y demandas colectivas, originado por exposición de llaves de API, falta de MFA en backoffice y carencia de escaneos de secrets previos a despliegues.',
    cause: '- [R-CIB-001]: Credenciales de desarrolladores expuestas en repositorios de código.\n- [R-PROC-004]: Falta de herramientas de escaneo de secretos en pipelines de CI/CD.\n- [R-CLD-001]: Roles de acceso excesivamente permisivos en consolas Cloud (GCP/AWS).',
    impact: 5,
    probability: 3,
    suggestedControl: 'Gestión de accesos Just-In-Time (JIT), escaneo automático de secretos en CI/CD con git-secrets y rotación dinámica con GCP Secret Manager.',
    documentControl: 'Política de gestión de secretos y credenciales, y estándar de seguridad en CI/CD.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-CIB-001-1',
        description: 'Escaneo automatizado de código (SAST y git-secrets) en pipelines de despliegue CI/CD.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-CIB-001-2',
        description: 'Centralización y rotación automática de llaves API y contraseñas de infraestructura mediante GCP Secret Manager.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CIB-003',
    processArea: 'Ciberseguridad',
    process: 'Seguridad y Privacidad de Datos (PII)',
    riskDescription: 'Una filtración masiva o secuestro de datos personales y sensibles de clientes que derivaría en multas por ley Habeas Data y descrédito mercantil, originado por almacenamiento en texto claro, configuraciones por defecto en backups/staging y buckets de almacenamiento configurados públicos.',
    cause: '- [R-TI-002]: Falta de cifrado en reposo en bases de datos por configuración por defecto en staging/backup.\n- [R-ONB-003]: Almacenamiento de documentos de identidad en texto claro en buckets Cloud.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Cifrado AES-256 a nivel de columna para PII, políticas de organización en GCP para bloquear acceso público en buckets y uso de gestor de contraseñas corporativo.',
    documentControl: 'Política de protección de datos personales (PII) y clasificación de información corporativa.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-CIB-003-1',
        description: 'Cifrado AES-256 a nivel de base de datos y columna para información de identificación personal (PII).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-CIB-003-2',
        description: 'Políticas de organización en Cloud que impiden la exposición pública de buckets de almacenamiento.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-CIB-002',
    processArea: 'Ciberseguridad',
    process: 'Seguridad en Webhooks e Integraciones perimetrales',
    riskDescription: 'Una inyección de saldos virtuales falsos, alteración de payloads de cobros o denegación de servicio transaccional que derivaría en drenado de caja corporativa y saturación de la infraestructura, originado por falta de validación de firma en webhooks, autorizaciones deficientes de APIs y carencia de WAF activo.',
    cause: '- [R-CIB-CHILE-01]: Falta de validación de firma criptográfica en endpoints de webhooks de pago.\n- [R-CLD-004]: Ausencia de WAF activo en el borde e inspección de tráfico perimetral.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Firmas digitales criptográficas asimétricas (mTLS/HMAC-SHA256) en webhooks, validación server-side de sesiones y Cloud Armor / WAF perimetral.',
    documentControl: 'Estándar de seguridad para integraciones con terceros y arquitectura perimetral WAF.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-CIB-002-1',
        description: 'Validación obligatoria de firma criptográfica (HMAC/mTLS) para la recepción y procesamiento de Webhooks.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-CIB-002-2',
        description: 'Web Application Firewall (Google Cloud Armor / Cloudflare) activado con reglas de mitigación de ataques y rate limiting.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // TI
  {
    id: 'R-TI-001',
    processArea: 'TI',
    process: 'Continuidad y Tolerancia a Fallos de Core Bancario',
    riskDescription: 'Una caída o degradación prolongada del microservicio de dispersión y orquestación que derivaría en ineficiencias, parálisis transaccional y quiebres de SLAs, originado por dependencia de un único proveedor de nube, deadlocks en base de datos bajo picos de recaudación y carencia de failover automático.',
    cause: '- [R-TI-001]: Dependencia de un único proveedor de nube sin esquema de redundancia.\n- [R-TI-SPLIT-01]: Bloqueos cruzados (Deadlocks) en base de datos por consultas SQL síncronas masivas.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Arquitectura activo-activo multi-región, optimización de bloqueos de BD con locks optimistas y colas asíncronas para desacoplar picos de recaudación.',
    documentControl: 'Plan de continuidad del negocio (BCP) de TI y estrategia de recuperación ante desastres (DRP).',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-TI-001-1',
        description: 'Despliegue multi-zona/multi-región activo-activo con enrutamiento dinámico de tráfico.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-TI-001-2',
        description: 'Procesamiento asíncrono basado en colas de eventos (Pub/Sub) para absorber picos transaccionales.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-PROC-002',
    processArea: 'TI',
    process: 'Integridad e Idempotencia Transaccional',
    riskDescription: 'Una duplicación de cobros o giros accidentales de remesas que derivaría en reclamos de clientes, pérdidas de EBITDA directas y auditorías contables reprobadas, originado por falta de claves de idempotencia síncronas, reintentos masivos por latencia y registros en BD desprovistos de integridad referencial.',
    cause: '- [R-TI-CHILE-01]: Ausencia de claves de idempotencia síncronas en pasarela local.\n- [R-PROC-002]: Falta de validadores de transacción única (Idempotency Key) en la API del motor de desembolsos.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Uso obligatorio de claves de idempotencia UUID server-side implementadas con bloqueos de concurrencia en Redis y restricciones de integridad SQL.',
    documentControl: 'Estándar de desarrollo de APIs transaccionales e idempotencia de pagos.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    associatedControls: [
      {
        id: 'C-PROC-002-1',
        description: 'Exigencia de cabecera obligatoria de clave de idempotencia (Idempotency-Key UUID) en todos los endpoints de cobro y Payout.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-PROC-002-2',
        description: 'Bloqueos de concurrencia temporal en Redis y restricciones UNIQUE en base de datos para evitar doble procesamiento.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },

  // MATRIZ DE RIESGOS OPERATIVOS Y CONTROL - BRE-B COLOMBIA (MVP1)
  {
    id: 'RO-01',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Ciberseguridad',
    product: 'Bre-B',
    category: 'Fraude / Ciberseguridad',
    process: 'Seguridad y Canales Bre-B (Phishing / Smishing)',
    riskDescription: 'Phishing y smishing suplantando notificaciones de Bre-B para robar credenciales y OTP.',
    cause: 'Bajo conocimiento del usuario; uso masivo de SMS/enlaces; sofisticación de campañas con geolocalización.',
    impact: 4,
    probability: 4,
    suggestedControl: "Educación masiva ('Bre-B nunca pide click para recibir'); bloqueo de dominios fraudulentos; monitoreo continuo de marca; MFA y biometría para transacciones; alertas de actividad.",
    documentControl: 'Plan Director de Ciberseguridad y Prevención de Phishing Bre-B.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Ciberseguridad & Prevención de Fraude CO',
    associatedControls: [
      {
        id: 'C-RO-01-1',
        description: 'Bloqueo automatizado de dominios fraudulentos y monitoreo continuo de marca.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-01-2',
        description: 'MFA y biometría para transacciones y alertas de actividad en tiempo real.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 0,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-02',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Fraude',
    product: 'Bre-B',
    category: 'Fraude / ATO',
    process: 'Registro y Administración de Llaves Bre-B',
    riskDescription: 'Account Takeover (ATO) y registro malintencionado de llaves nuevas en cuentas vulneradas.',
    cause: 'Credenciales robadas, SIM swap o malware en dispositivo del cliente; debilidades en autenticación al registrar.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Restricción de registro libre de llaves: no se permite que un cliente pueda registrar libremente cualquier dato; el sistema sugiere y valida únicamente llaves basadas en información que el cliente ya tiene registrada y verificada con Global66 (como teléfono celular verificado o cédula/RUT validado). Device fingerprinting obligatorio y validación biométrica con Jumio.',
    documentControl: 'Política de Enrolamiento Seguro de Llaves Bre-B y Control de Identidad Pre-Registrada.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude CO',
    associatedControls: [
      {
        id: 'C-RO-02-1',
        description: 'Restricción de registro libre: el sistema sugiere y asocia exclusivamente llaves preexistentes y validadas del cliente (móvil verificado o documento de identidad registrado en Global66).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-02-2',
        description: 'Device fingerprinting obligatorio y validación de identidad biométrica con Jumio.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 0,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-03',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Fraude',
    product: 'Bre-B',
    category: 'Fraude / Ingeniería Social',
    process: 'Prevención de Suplantación en Canales de Atención (Centro de Ayuda, WhatsApp y Correo)',
    riskDescription: 'Suplantación de canales oficiales de la Entidad o de funcionarios de BanRep para inducir transferencias fraudulentas o captura de credenciales.',
    cause: 'Confianza de usuarios en marcas oficiales; perfiles o dominios falsos en canales de atención; falta de verificación del interlocutor.',
    impact: 4,
    probability: 4,
    suggestedControl: 'Validación previa de identidad por WhatsApp antes de brindar cualquier atención en canales de soporte; modificación de datos de contacto (correo o número) condicionada a validación por PIN o Biometría; cambio de datos sensibles (DNI o Alias) gestionado exclusivamente mediante ticket a CX con confirmación estricta de identidad; política de cero solicitud de contraseñas, PIN u OTP por canales de atención.',
    documentControl: 'Protocolo de Verificación de Identidad en Canales de Atención y Modificación Segura de Datos (CX / Bre-B).',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Oficial de Seguridad de la Información CO',
    associatedControls: [
      {
        id: 'C-RO-03-1',
        description: 'Validación obligatoria de identidad por WhatsApp previa a cualquier atención de soporte y prohibición estricta de solicitud de PIN/OTP.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-03-2',
        description: 'Autenticación reforzada con PIN o Biometría como requisito previo obligatorio para modificación de correo electrónico o número telefónico.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-03-3',
        description: 'Canalización exclusiva mediante ticket a CX con confirmación documental/biométrica de identidad para cambio de datos sensibles (DNI o Alias).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-04',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Operaciones',
    product: 'Bre-B',
    category: 'Fraude / QRishing',
    process: 'Seguridad en Códigos QR y Pagos Físicos P2M',
    riskDescription: 'Manipulación de códigos QR físicos para desviar pagos a llaves de atacantes en puntos de venta.',
    cause: 'Sustitución de stickers QR estáticos de comercios; falta de validación del titular antes de transferir.',
    impact: 3,
    probability: 3,
    suggestedControl: 'Promover el uso de QR dinámico (firmado y único por trx); visualización obligatoria de la información del beneficiario debidamente enmascarada en pantalla para confirmación previa del ordenante; notificaciones push instantáneas al receptor.',
    documentControl: 'Estándar Técnico de Seguridad en Códigos QR y Visualización Enmascarada de Beneficiarios Bre-B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Product Lead - QR & Merchant Acquiring CO',
    associatedControls: [
      {
        id: 'C-RO-04-1',
        description: 'Uso de QR dinámico firmado por transacción y visualización obligatoria de la información del beneficiario de forma enmascarada para verificación antes de autorizar la transferencia.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'RO-05',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Operaciones',
    product: 'Bre-B',
    category: 'Fraude / Comercial',
    process: 'Acreditación Merchant y Verificación de Comprobantes',
    riskDescription: 'Comerciantes estafados mediante la presentación de falsos comprobantes de pago digitales.',
    cause: 'Inmediatez del sistema que genera pánico de espera; cultura de aceptar pantallazos como prueba.',
    impact: 3,
    probability: 3,
    suggestedControl: 'Uso obligatorio de notificaciones push en tiempo real al ingresar dinero para protección del merchant y verificación en la visualización de movimientos de la wallet; pedagogía a comercios para validar siempre abonos en la app oficial.',
    documentControl: 'Guía de Buenas Prácticas Comerciales, Notificaciones Push y Verificación de Movimientos Merchant Bre-B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head of B2B & Merchant Solutions CO',
    associatedControls: [
      {
        id: 'C-RO-05-1',
        description: 'Envío de notificaciones push automáticas e instantáneas al merchant al momento del ingreso efectivo de fondos en la wallet.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-05-2',
        description: 'Visualización y validación inmediata del histórico de movimientos y estado de transacción directamente en el feed de la wallet.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-05-3',
        description: 'Programa de pedagogía a comercios para la validación obligatoria de abonos en app oficial descartando comprobantes estáticos o pantallazos.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-06',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'TI',
    product: 'Bre-B',
    category: 'Riesgo Operativo / Continuidad',
    process: 'Conectividad Switch SPBVI (Transfiya) y Directorio DICE',
    riskDescription: 'Indisponibilidad del switch SPBVI (Transfiya), del directorio DICE o de un participante clave.',
    cause: 'Operación 24/7 exigente; alta concentración en pocos switches (ACH Colombia); fallas de infraestructura o red.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Manejo y tipificación estandarizada de errores según las especificaciones técnicas de certificación del switch; protocolo formal de notificación y escalamiento inmediato ante incidentes de indisponibilidad hacia la SFC y participantes; arquitectura redundante de alta disponibilidad y pruebas periódicas de BCP/DRP.',
    documentControl: 'Protocolo de Manejo de Errores según Certificación SPBVI y Procedimiento de Notificación ante Incidentes Bre-B.',
    acceptability: 'NO ACEPTABLE (Requiere tratamiento urgente)',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Infraestructura & Continuidad de Negocio CO',
    associatedControls: [
      {
        id: 'C-RO-06-1',
        description: 'Mapeo y tratamiento estandarizado de códigos y flujos de error según especificaciones de certificación técnica del switch.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-06-2',
        description: 'Protocolo formal y canal expedito de notificación y escalamiento de incidentes técnicos ante la SFC y participantes del ecosistema.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-06-3',
        description: 'Arquitectura redundante de alta disponibilidad con SLA/SLO robustos y simulacros periódicos de BCP/DRP.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-07',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'TI',
    product: 'Bre-B',
    category: 'Riesgo Operativo / Red',
    process: 'Manejo de Timeouts y Resiliencia de Mensajería Transfiya',
    riskDescription: 'Transacciones estancadas en timeout de red (>45 segundos) sin respuesta de Transfiya.',
    cause: 'Latencia excesiva en red; procesamiento lento de la entidad receptora; saturación puntual del switch.',
    impact: 4,
    probability: 3,
    suggestedControl: 'En escenarios de saturación o colapso de red con transacciones en timeout, congelamiento preventivo del estado y espera obligatoria de la confirmación/instrucción formal de rechazo por parte de Transfiya tras la estabilización antes de reversar o devolver fondos al cliente; conciliación operativa diaria con reporte y resolución de diferencias (positivas o negativas) a través de canal formal con Transfiya.',
    documentControl: 'Protocolo de Gestión de Timeouts, Confirmación Asíncrona de Rechazos y Conciliación de Discrepancias Transfiya / Bre-B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Tech Lead Core Banking & Integraciones CO',
    associatedControls: [
      {
        id: 'C-RO-07-1',
        description: 'Suspensión de reversos inmediatos ante timeout por saturación de red, condicionando la devolución de fondos a la confirmación e instrucción formal de rechazo emitida por Transfiya al estabilizarse la red.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-07-2',
        description: 'Conciliación operativa diaria con reporte sistemático de discrepancias transaccionales (positivas o negativas) mediante canal dedicado con Transfiya.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-07-3',
        description: 'Alertas en tiempo real a Operaciones sobre eventos de timeout masivo y visualización clara de estado en procesamiento para el usuario en la app.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-08',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Operaciones',
    product: 'Bre-B',
    category: 'Riesgo Operativo / Conciliación',
    process: 'Conciliación Diaria y Archivos Planos BREB100 / BREB201',
    riskDescription: 'Duplicidades, errores de enrutamiento o descuadres financieros en la conciliación diaria.',
    cause: 'Volumen transaccional masivo; implementaciones de nuevos rieles; cambios de esquema ISO 20022.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Revisión y conciliación semiautomática diaria por el equipo de Operaciones cruzando lo reportado en el archivo BREB100, las comunicaciones de Transfiya y los registros en el core bancario (Mambu); reporte formal de cualquier discrepancia a Transfiya para evaluación técnica del nodo y posterior emisión del archivo correctivo BREB201.',
    documentControl: 'Manual Operativo de Conciliación Diaria BREB100, Gestión de Discrepancias con Transfiya y Ajustes BREB201.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones Financieras & Conciliaciones CO',
    associatedControls: [
      {
        id: 'C-RO-08-1',
        description: 'Revisión y conciliación semiautomática diaria realizada por Operaciones cruzando el archivo plano BREB100, las comunicaciones de Transfiya y los registros del core bancario (Mambu).',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-RO-08-2',
        description: 'Reporte sistemático de diferencias a Transfiya para evaluación técnica del nodo y posterior aplicación de ajustes mediante archivo correctivo BREB201.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RO-09',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Mesa de Dinero',
    product: 'Bre-B',
    category: 'Riesgo de Liquidez Intradía',
    process: 'Cuenta de Depósito MOL (BanRep) y Parámetros CUD',
    riskDescription: 'Insuficiencia de liquidez en la cuenta de depósito MOL del Banco de la República.',
    cause: 'Proyección deficiente de fondos en días pico (quincenas, festivos); concentración atípica de débitos.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Definición y doble aprobación (captura/aprueba) de parámetros PAL, PNR y PAC en el CUD; alertas de consumo automatizadas; líneas de fondeo automáticas con la entidad compensadora.',
    documentControl: 'Política de Administración de Liquidez Intradía Bre-B / MOL.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Tesorería & Mesa de Dinero CO',
    associatedControls: [
      {
        id: 'C-RO-09-1',
        description: 'Doble aprobación de parámetros PAL, PNR y PAC en el CUD y líneas de fondeo automáticas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'RO-10',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Operaciones',
    product: 'Bre-B',
    category: 'Riesgo Operativo / UX',
    process: 'Experiencia de Usuario, Validación de Alias y DICE',
    riskDescription: 'Reclamos y pérdidas financieras por transferencias irrevocables dirigidas a destinatarios erróneos.',
    cause: 'Error humano al digitar alias (llave NRIC, teléfono, etc.); diseño de flujo rápido sin confirmación visual.',
    impact: 3,
    probability: 3,
    suggestedControl: 'Validación previa obligatoria del nombre completo y enmascarado del receptor (DICE) y confirmación visual requerida antes de PIN/OTP.',
    documentControl: 'Estándar UX y Validación Previa de Llaves Bre-B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Product Manager Pagos Inmediatos & UX CO',
    associatedControls: [
      {
        id: 'C-RO-10-1',
        description: 'Validación previa obligatoria del nombre receptor (DICE) y confirmación visual antes de PIN/OTP.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      }
    ]
  },
  {
    id: 'RO-11',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Cumplimiento',
    product: 'Bre-B',
    category: 'Riesgo Regulador / Legal',
    process: 'Cumplimiento Normativo SFC, SIC y Banco de la República',
    riskDescription: 'Sanciones de SFC, SIC o Banco de la República por fallas de cumplimiento normativo o de seguridad.',
    cause: 'Complejidad de las circulares regulatorias (CE 007 de Ciberseguridad, Ley 1581 Habeas Data, normativa Bre-B).',
    impact: 4,
    probability: 2,
    suggestedControl: 'Estatuto de Comité de Productos activo; almacenamiento mínimo de logs por 30 días; cumplimiento estricto del Manual de Uso del Sello Bre-B.',
    documentControl: 'Matriz de Cumplimiento Normativo y Manual de Uso del Sello Bre-B.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer & Legal Lead CO',
    associatedControls: [
      {
        id: 'C-RO-11-1',
        description: 'Comité de Productos activo, almacenamiento de logs por 30 días y cumplimiento del Manual de Uso del Sello Bre-B.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  // ==========================================
  // PRODUCTO: CUENTAS VIRTUALES (VIRTUAL IBAN & LOCAL COLLECTIONS)
  // ==========================================
  {
    id: 'RCV-01',
    processArea: 'Operaciones',
    product: 'Cuentas Virtuales',
    process: 'Conciliación y Liquidación Diaria de Cuentas Virtuales (Virtual IBAN / CVU)',
    riskDescription: 'Afectación económica y operativa ocasionada por la complejidad de enrutar miles de subcuentas virtuales locales bajo una sola cuenta corporativa madre (Pooled Account), que puede generar descuadres financieros persistentes en la conciliación multicapa (banco partner vs ledger de Global66), derivando en sobrecarga de conciliación y desfases en saldos de clientes.',
    cause: 'Carencia de un identificador criptográfico único inmutable (UUID) en el payload bancario de origen y latencia en el retorno de cartolas bancarias síncronas de los bancos aliados emisores del riel.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Asignación de identificadores de subcuenta virtual únicos con validación de dígito verificador y metadatos estructurados en cada orden de cobro.',
    documentControl: 'Manual de Procedimiento de Conciliación Multicapa de Cuentas Virtuales y Subcuentas.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    associatedControls: [
      {
        id: 'C-CV-01-1',
        description: 'Asignación de identificadores de subcuenta virtual únicos con validación de dígito verificador y metadatos estructurados en cada orden de cobro.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-CV-01-2',
        description: 'Conciliación tripartita automatizada y continua (Core Bancario vs Extracto de Partner vs Ledger Transaccional) con alertas automáticas de descuadres antes de las 18:00.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-02',
    processArea: 'Cumplimiento',
    product: 'Cuentas Virtuales',
    process: 'Prevención de LA/FT, Monitoreo de Transacciones y Travel Rule en Cuentas Virtuales',
    riskDescription: 'Afectación legal y regulatoria ocasionada por la utilización indebida de cuentas virtuales nominadas por terceros no validados o triangulación de fondos, que puede generar la omisión del reporte de operaciones sospechosas (ROS/UAF) o incumplimiento del estándar Travel Rule, derivando en multas sancionatorias de la Superintendencia y revocación de habilitación operativa.',
    cause: 'Falta de validación del ordenante real en transferencias interbancarias entrantes y ausencia de reglas de scoring dinámico por acumulación de saldos en cuentas transitorias.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Validación estricta de titularidad 1-to-1 (KYC/KYB verificado) impidiendo la recepción de fondos de terceros no identificados o jurisdicciones sancionadas.',
    documentControl: 'Política de Debida Diligencia (CDD/EDD) y Prevención de LA/FT en Rieles de Cuentas Virtuales.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer',
    associatedControls: [
      {
        id: 'C-CV-02-1',
        description: 'Validación estricta de titularidad 1-to-1 (KYC/KYB verificado) impidiendo la recepción de fondos de terceros no identificados o jurisdicciones sancionadas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-CV-02-2',
        description: 'Monitoreo transaccional automatizado en tiempo real con bloqueo preventivo ante patrones de pitufeo (smurfing) y montos que superen los umbrales de apetito.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 0,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-03',
    processArea: 'TI',
    product: 'Cuentas Virtuales',
    process: 'Ciclo de Vida, Aprovisionamiento y Expiración de Cuentas Virtuales Inactivas',
    riskDescription: 'Afectación tecnológica y de disponibilidad ocasionada por la ausencia de políticas automáticas de expiración y depuración de subcuentas virtuales transitorias no utilizadas, que puede generar el crecimiento exponencial de registros huérfanos en los clústeres de base de datos, derivando en degradación de latencia en consultas y tiempos de respuesta en el checkout.',
    cause: 'Aprovisionamiento bajo demanda sin TTL (Time To Live) parametrizado y falta de particionamiento dinámico de índices en las tablas de enrutamiento transaccional.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Implementación de ciclo de vida con política TTL automática: liberación y archivo de cuentas virtuales inactivas tras 90 días sin saldo ni movimiento.',
    documentControl: 'Arquitectura y Estándar de Gestión de Datos para Cuentas Virtuales Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Head de TI',
    associatedControls: [
      {
        id: 'C-CV-03-1',
        description: 'Implementación de ciclo de vida con política TTL automática: liberación y archivo de cuentas virtuales inactivas tras 90 días sin saldo ni movimiento.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-04',
    processArea: 'Ciberseguridad',
    product: 'Cuentas Virtuales',
    process: 'Seguridad de Integraciones API y Webhooks de Notificación de Pagos',
    riskDescription: 'Afectación económica y reputacional ocasionada por la interceptación, repetición (replay attack) o inyección de falsas notificaciones de depósito en los webhooks de cuentas virtuales, que puede generar la acreditación ilegítima de saldos a favor de atacantes, derivando en el drenado de fondos de la cuenta madre corporativa.',
    cause: 'Carencia de validación obligatoria de firmas criptográficas HMAC SHA-256 en endpoints receptores de webhooks y omisión de tokens de idempotencia.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Validación criptográfica mandatoria con firmas HMAC SHA-256 y secretos rotativos, junto con verificación estricta de llaves de idempotencia UUID.',
    documentControl: 'Estándar de Seguridad de APIs, Webhooks y Criptografía Aplicada Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    associatedControls: [
      {
        id: 'C-CV-04-1',
        description: 'Validación criptográfica mandatoria con firmas HMAC SHA-256 y secretos rotativos, junto con verificación estricta de llaves de idempotencia UUID.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 2
      },
      {
        id: 'C-CV-04-2',
        description: 'Verificación cruzada bidireccional inmediata mediante consulta inversa síncrona (Reverse Polling) a la API del banco emisor antes de la liberación contable.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-05',
    processArea: 'Fraude',
    product: 'Cuentas Virtuales',
    process: 'Prevención de Suplantación de Identidad y Cuentas Mula en Cuentas Virtuales',
    riskDescription: 'Afectación económica y reputacional ocasionada por la apertura de cuentas virtuales con credenciales sintéticas o suplantadas para actuar como recolectoras transitorias de estafas digitales (cuentas mula), que puede generar el retiro expedito de fondos ilícitos antes del bloqueo, derivando en pérdidas por contracargos y demandas civiles.',
    cause: 'Verificaciones biométricas débiles en el onboarding específico de clientes comerciales y falta de enfriamiento (cooling-off period) en los primeros depósitos de cuentas recién creadas.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Biometría facial activa con prueba de vida certificada iBeta Nivel 2 y scoring de dispositivo (Device Fingerprinting) en la creación de subcuentas.',
    documentControl: 'Manual de Prevención de Fraude, Suplantación de Identidad y Cuentas Mula.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    associatedControls: [
      {
        id: 'C-CV-05-1',
        description: 'Biometría facial activa con prueba de vida certificada iBeta Nivel 2 y scoring de dispositivo (Device Fingerprinting) en la creación de subcuentas.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 2
      },
      {
        id: 'C-CV-05-2',
        description: 'Período de enfriamiento (hold preventivo de 12 horas) para retiros o transferencias salientes tras el primer fondeo de una cuenta virtual nueva.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-06',
    processArea: 'Tesorería',
    product: 'Cuentas Virtuales',
    process: 'Gestión de Liquidez Intradiaria, Cut-Offs Bancarios y Límites Operativos',
    riskDescription: 'Afectación económica ocasionada por descalces en los saldos líquidos intradiarios de las cuentas madre locales por transferencias concentradas cerca del horario de corte (Cut-Off Time), que puede generar la imposibilidad de procesar payouts o dispersiones comprometidas, derivando en sobregiros no autorizados y cobros de intereses por el partner bancario.',
    cause: 'Falta de dashboards predictivos de demanda de fondos por riel bancario y ausencia de colchones mínimos automáticos de liquidez garantizados.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Establecimiento de buffer de liquidez operativa intradiaria automatizado y alarmas tempranas de consumo al alcanzar el 75% del límite de la cuenta madre.',
    documentControl: 'Política de Gestión de Liquidez Intradiaria y Posición de Tesorería Global66.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Owned',
    roamOwner: 'Head de Tesorería',
    associatedControls: [
      {
        id: 'C-CV-06-1',
        description: 'Establecimiento de buffer de liquidez operativa intradiaria automatizado y alarmas tempranas de consumo al alcanzar el 75% del límite de la cuenta madre.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-07',
    processArea: 'Operaciones',
    product: 'Cuentas Virtuales',
    process: 'Gestión de Rechazos, Devoluciones y Fondos en Tránsito Sin Identificar (Unmatched Funds)',
    riskDescription: 'Afectación legal y de servicio al cliente ocasionada por depósitos entrantes dirigidos a números de cuenta virtual errados, inexistentes o cerrados, que puede generar la inmovilización prolongada de fondos del ordenante sin retorno expedito, derivando en quejas formales ante el regulador y sanciones administrativas.',
    cause: 'Ausencia de un flujo estandarizado y automatizado de respuesta y devolución al banco emisor (similar a las directivas de compensación R07/R08) dentro de las 24 horas hábiles.',
    impact: 4,
    probability: 2,
    suggestedControl: 'Procedimiento estandarizado de devolución automática dentro de 24h hábiles para fondos sin coincidencia de subcuenta, con registro inmutable y notificación al banco aliado.',
    documentControl: 'Protocolo Operativo de Devoluciones y Aclaraciones de Depósitos No Identificados.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    associatedControls: [
      {
        id: 'C-CV-07-1',
        description: 'Procedimiento estandarizado de devolución automática dentro de 24h hábiles para fondos sin coincidencia de subcuenta, con registro inmutable y notificación al banco aliado.',
        type: 'Correctivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'RCV-08',
    processArea: 'Nuevos Productos',
    product: 'Cuentas Virtuales',
    process: 'Viabilidad Regulatoria y Validación Jurídica de la Figura de Cuentas Virtuales Transfronterizas',
    riskDescription: 'Afectación legal y reputacional ocasionada por discrepancias o cambios de criterio de los reguladores financieros locales sobre la provisión de cuentas de cobro virtual a usuarios no residentes, que puede generar la suspensión cautelar del servicio o requerimientos extraordinarios de licenciamiento bancario, derivando en interrupción de operaciones y daño a la imagen corporativa.',
    cause: 'Evolución regulatoria asimétrica entre jurisdicciones y falta de dictámenes jurídicos vinculantes actualizados semestralmente con estudios locales especializados.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Dictamen jurídico regulatorio formal validado con firmas de abogados especializadas en cada país donde opera Global66, con revisión semestral obligatoria de contratos de mandato y términos de uso.',
    documentControl: 'Concepto Jurídico Vinculante de Cumplimiento Regulatorio para Cuentas Virtuales.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Accepted',
    roamOwner: 'Head de Producto',
    associatedControls: [
      {
        id: 'C-CV-08-1',
        description: 'Dictamen jurídico regulatorio formal validado con firmas de abogados especializadas en cada país donde opera Global66, con revisión semestral obligatoria de contratos de mandato y términos de uso.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      }
    ]
  },
  // NUEVO PRODUCTO: GLOBALID (IDENTIDAD DIGITAL & VERIFICACIÓN)
  {
    id: 'R-GID-01',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'GlobalID',
    process: 'Validación Biométrica Facial y Detección de Ataques de Presentación (PAD / Deepfakes)',
    riskDescription: 'Afectación económica y reputacional ocasionada por la evasión de los motores de prueba de vida biométrica mediante inyección de deepfakes, máscaras 3D o emuladores de cámara virtual en el enrolamiento de GlobalID, que puede generar la creación masiva de identidades sintéticas y usurpación de identidad, derivando en fraudes transaccionales sistemáticos y sanciones regulatorias.',
    cause: 'Uso de librerías de prueba de vida pasiva no certificadas bajo ISO/IEC 30107-3 (iBeta Nivel 2) y omisión de comprobaciones de integridad de hardware de captura en el SDK móvil.',
    impact: 5,
    probability: 3,
    suggestedControl: 'Implementación de motor biométrico con certificación ISO/IEC 30107-3 iBeta Nivel 2 con detección activa de deepfakes y validación estricta de firma de hardware en el SDK móvil.',
    documentControl: 'Estándar Corporativo de Seguridad Biométrica y Verificación de Identidad Digital GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-01-1',
        description: 'Motor biométrico certificado iBeta Nivel 2 con análisis de textura microdérmica, desafío óptico dinámico e inspección de reflejo corneal para neutralización de deepfakes e inyecciones de emuladores.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-01-2',
        description: 'SDK con attestations criptográficas nativas de dispositivo (Apple DeviceCheck / Google Play Integrity) que bloquea la inyección de video virtual en tiempo de ejecución.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-GID-02',
    processArea: 'Cumplimiento',
    secondaryProcessArea: 'Operaciones',
    origin: 'Externo',
    product: 'GlobalID',
    process: 'Cotejo Automatizado con Bases Gubernamentales y Listas Restrictivas en Tiempo Real',
    riskDescription: 'Afectación legal y regulatoria ocasionada por la indisponibilidad, latencia o fallos en las APIs de consulta contra registros civiles oficiales (Registraduría en Colombia, Registro Civil en Chile, Renaper en Argentina), que puede generar la aprobación desasistida de perfiles sin cotejo de defunción o interdicción judicial, derivando en multas por omisión de debida diligencia de la Superintendencia Financiera / CMF.',
    cause: 'Intermitencias y caídas frecuentes en los servicios de validación gubernamental de terceros y carencia de un circuito de fallback con enrutamiento redundante hacia proveedores alternativos acreditados.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Diseño de arquitectura de validación multi-proveedor con failover automatizado y colas de retención (Quarantine Hold) que impiden la activación del GlobalID sin cotejo exitoso confirmado.',
    documentControl: 'Manual de Debida Diligencia (CDD/EDD) y Validación de Fuentes Oficiales GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Compliance Officer',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-02-1',
        description: 'Mecanismo de circuito cerrado: bloqueo automático de activación de GlobalID ante fallas de conectividad oficial hasta confirmación asíncrona exitosa (cero tolerancia a bypass de cumplimiento).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-02-2',
        description: 'Conmutación por error (failover) multicanal automática entre proveedores homologados de verificación registral gubernamental con SLA garantizado del 99.9%.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-GID-03',
    processArea: 'TI',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Interno',
    product: 'GlobalID',
    process: 'Arquitectura de Sesiones Distribuidas, Single Sign-On (SSO) y Tokens OIDC/OAuth 2.0',
    riskDescription: 'Afectación tecnológica y operativa ocasionada por la falta de invalidación síncrona de tokens JWT de sesión (GlobalID Access Tokens) ante eventos de revocación forzada o detección de compromiso, que puede generar la persistencia de accesos no autorizados en múltiples microservicios federados, derivando en transacciones fraudulentas durante ventanas de exposición de tokens activos.',
    cause: 'Uso de tokens JWT sin estado (stateless) con tiempos de expiración prolongados (TTL > 1 hora) sin un mecanismo de Back-Channel Logout o lista negra distribuida en caché Redis de baja latencia.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Implementación de tokens efímeros de corta duración (TTL de 5 minutos), soporte de Back-Channel Logout RFC 8693 y capa de revocación distribuida Redis Cluster con invalidación en menos de 100ms.',
    documentControl: 'Arquitectura de Seguridad OIDC, Gestión de Sesiones y Federated Identity GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Resolved',
    roamOwner: 'Head de TI',
    residualImpact: 1,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-03-1',
        description: 'Tokens JWT de acceso efímeros (TTL 5 min) renovados mediante Refresh Tokens rotativos con detección criptográfica de reutilización maliciosa y fingerprinting de sesión.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-03-2',
        description: 'Mecanismo síncrono de revocación global distribuida vía Redis Cluster con notificación pub/sub a todos los microservicios ante cambio de clave o alerta de riesgo.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-GID-04',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    product: 'GlobalID',
    process: 'Custodia y Cifrado de Datos Biométricos Sensibles y Plantillas Criptográficas (Templates)',
    riskDescription: 'Afectación legal, de privacidad y reputacional ocasionada por la exfiltración o compromiso de bases de datos que albergan vectores y plantillas biométricas faciales de los usuarios de Global66, que puede generar la exposición irrevocable de identificadores biométricos universales de clientes, derivando en demandas millonarias por vulneración de leyes de protección de datos personales y revocación de licencia.',
    cause: 'Almacenamiento de vectores biométricos en bases de datos relacionales sin cifrado a nivel de campo (Field-Level Encryption) y falta de segregación estricta de llaves maestras en módulos HSM dedicados.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Tokenización irreversible de plantillas biométricas mediante algoritmos unidireccionales salteados y cifrado en reposo con llaves administradas en Google Cloud KMS / HSM FIPS 140-2 Nivel 3.',
    documentControl: 'Política de Protección de Datos Biométricos Sensibles y Criptografía de Identidad GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-04-1',
        description: 'Cifrado a nivel de campo (Envelope Encryption) con Google Cloud KMS HSM FIPS 140-2 Nivel 3 y segregación total de bases de datos biométricas de las tablas de negocio.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-04-2',
        description: 'Eliminación automática de imágenes originales de rostros (raw capture) inmediatamente después de la generación del vector tokenizado cifrado irreversible.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-GID-05',
    processArea: 'Fraude',
    secondaryProcessArea: 'Ciberseguridad',
    origin: 'Externo',
    product: 'GlobalID',
    process: 'Vinculación de Dispositivo Seguro (Device Binding) y Prevención de SIM Swapping / Hijacking',
    riskDescription: 'Afectación económica y reputacional ocasionada por la clonación de SIM cards (SIM Swapping) o intercepción de códigos SMS OTP para apoderarse de credenciales de GlobalID, que puede generar el acceso no autorizado a billeteras y ejecución de transferencias no consentidas, derivando en indemnizaciones y reclamos masivos ante autoridades de defensa del consumidor.',
    cause: 'Uso exclusivo de SMS como segundo factor de autenticación y ausencia de comprobación criptográfica del enlace del dispositivo (Device Binding) mediante Secure Enclave / Android KeyStore.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Migración mandatoria a autenticación fuerte FIDO2 / WebAuthn (Passkeys) vinculada al chip criptográfico del dispositivo móvil, suprimiendo gradualmente el uso de SMS para transacciones críticas.',
    documentControl: 'Manual de Mitigación de Fraude por SIM Swapping y Autenticación Passwordless GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Prevención de Fraude',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-05-1',
        description: 'Device Binding criptográfico mediante pares de claves asimétricas generadas y resguardadas en Secure Enclave / StrongBox con validación de biometría local.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-05-2',
        description: 'Consulta en tiempo real a APIs de operadores móviles (GSMA Open Gateway SIM Swap API) para congelar recuperaciones de cuenta con cambio de SIM reciente (< 48h).',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-GID-06',
    processArea: 'Operaciones',
    secondaryProcessArea: 'Fraude',
    origin: 'Interno',
    product: 'GlobalID',
    process: 'Gestión y Recuperación Segura de Acceso para Cuentas Bloqueadas (Account Recovery Helpdesk)',
    riskDescription: 'Afectación económica y operativa ocasionada por la vulneración de los flujos de mesa de ayuda (Service Desk) para el desbloqueo o restablecimiento manual de credenciales GlobalID mediante ingeniería social contra agentes de soporte, que puede generar el traspaso indebido del control de cuentas corporativas o VIP a atacantes, derivando en fraude financiero y sanciones por negligencia operacional.',
    cause: 'Procedimientos de verificación de identidad basados en preguntas de conocimiento de seguridad estáticas y falta de aprobación dual obligatoria para reseteos de GlobalID en el Backoffice.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Exigencia de re-enrolamiento biométrico 100% automatizado con prueba de vida en video asistido por IA para recuperación de credenciales y autorización de cuatro ojos (Maker-Checker) para excepciones manuales.',
    documentControl: 'Procedimiento Operativo Estandarizado de Mesa de Ayuda para Recuperación de GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'Head de Operaciones',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-06-1',
        description: 'Protocolo automatizado de validación de identidad con biometría activa obligatoria previa a cualquier reseteo de factores de acceso o cambio de número telefónico registrado.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-06-2',
        description: 'Segregación de funciones con aprobación de cuatro ojos (Maker-Checker) registrada en pistas de auditoría inmutables para cualquier desbloqueo asistido por soporte.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  {
    id: 'R-GID-07',
    processArea: 'Nuevos Productos',
    secondaryProcessArea: 'Cumplimiento',
    origin: 'Interno',
    product: 'GlobalID',
    process: 'Consentimiento Informado Transfronterizo y Cumplimiento de Normativa de Privacidad de Datos',
    riskDescription: 'Afectación legal y regulatoria ocasionada por la discrepancia entre normativas locales de soberanía de datos (CMF/Ley 19.628 en Chile, SIC/Ley 1581 en Colombia, AAIP en Argentina) al compartir perfiles verificados de GlobalID entre subsidiarias del grupo, que puede generar cargos por transferencia internacional no autorizada de datos biométricos y personales, derivando en sanciones económicas y suspensión del uso regional del identificador.',
    cause: 'Redacción ambigua en las cláusulas de consentimiento de términos y condiciones de la billetera y carencia de cláusulas contractuales tipo (SCC) auditadas entre entidades del grupo Global66.',
    impact: 5,
    probability: 2,
    suggestedControl: 'Implementación de gestor de consentimiento granular y explícito (Consent Management Platform) en GlobalID con firma digital y contratos intercompany de transferencia de datos con homologación transfronteriza.',
    documentControl: 'Política Corporativa de Transferencia Internacional y Tratamiento de Datos Personales GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Accepted',
    roamOwner: 'Head de Producto',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-07-1',
        description: 'Módulo de consentimiento granular en el onboarding con aceptación explícita de tratamiento transfronterizo y registro inmutable del timestamp y hash de términos aceptados.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 2,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-07-2',
        description: 'Auditoría jurídica anual de contratos de transferencia internacional de datos (Data Transfer Agreements) visada por firmas legales locales en cada jurisdicción.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 0
      }
    ]
  },
  {
    id: 'R-GID-08',
    processArea: 'Ciberseguridad',
    secondaryProcessArea: 'Fraude',
    origin: 'Externo',
    product: 'GlobalID',
    process: 'Protección Contra Ataques de Fuerza Bruta y Credential Stuffing en el Portal de Autenticación',
    riskDescription: 'Afectación tecnológica y reputacional ocasionada por campañas masivas y automatizadas de Credential Stuffing dirigidas contra los endpoints de autenticación de GlobalID, que puede generar la saturación de los microservicios de login (DDoS aplicativo) y el secuestro de cuentas con contraseñas reutilizadas en otras filtraciones, derivando en caída del servicio y reclamos de clientes.',
    cause: 'Ausencia de protección WAF de capa 7 con análisis de reputación de IP y falta de reglas adaptativas de rate-limiting basadas en comportamiento anómalo.',
    impact: 4,
    probability: 3,
    suggestedControl: 'Despliegue de Cloudflare / Google Cloud Armor Bot Defense con análisis comportamental y CAPTCHA adaptativo silencioso (reCAPTCHA Enterprise) en endpoints de autenticación.',
    documentControl: 'Estándar de Mitigación de Ataques Automatizados y Credential Stuffing GlobalID.',
    acceptability: 'ACEPTABLE',
    status: 'Aprobado',
    roamStatus: 'Mitigated',
    roamOwner: 'CISO / Head de Ciberseguridad',
    residualImpact: 2,
    residualProbability: 1,
    associatedControls: [
      {
        id: 'C-GID-08-1',
        description: 'Reglas de rate limiting dinámico y Cloud Armor Bot Management que mitiga el 99.8% del tráfico de bots maliciosos antes de alcanzar el cluster de autenticación.',
        type: 'Preventivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      },
      {
        id: 'C-GID-08-2',
        description: 'Detección proactiva de contraseñas expuestas en filtraciones públicas (Breached Password Detection) forzando el cambio inmediato de credenciales.',
        type: 'Detectivo',
        efficiency: 'Excelente',
        impactReduction: 1,
        probabilityReduction: 1
      }
    ]
  },
  ...MULTITARJETA_MATRIX_RISKS,
  ...FLUJO_BLOQUEOS_MATRIX_RISKS,
  ...TARJETAS_TEMPORALES_MATRIX_RISKS,
  ...CONCILIACIONES_MATRIX_RISKS,
  ...ADQUIRENCIA_GLOBAL_MATRIX_RISKS,
  ...PAYOUT_SWIFT_JPMORGAN_MATRIX_RISKS,
  ...GLOBAL_CHATS_MATRIX_RISKS,
  ...CCE_PERU_MATRIX_RISKS,
  ...API_B2B_MCP_MATRIX_RISKS,
  ...STABLECOINS_MATRIX_RISKS,
  ...SII_CHILE_MATRIX_RISKS
];

export default function App() {
  const [appMode, setAppMode] = useState<'grc' | 'ti_risks' | 'risk_events' | 'action_plans' | 'process_governance' | 'document_inventory' | 'process_taxonomy'>('grc');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(() => {
    const saved = localStorage.getItem('g66_grc_jurisdiction') as Jurisdiction | null;
    return (saved === 'Regional' || saved === 'Chile' || saved === 'Colombia' || saved === 'Argentina') ? saved : 'Regional';
  });

  const buildFreshRisksForEntity = (entity: Jurisdiction) => {
    return INITIAL_RISKS.map((r, idx) => {
      const rewrittenDesc = r.riskDescription;
      const roamStatus = r.roamStatus || (idx % 4 === 0 ? 'Resolved' : idx % 4 === 1 ? 'Owned' : idx % 4 === 2 ? 'Accepted' : 'Mitigated');
      const roamOwner = r.roamOwner || (
        r.id === 'R-OPS-001' ? 'Head de Operaciones' :
        r.processArea === 'Operaciones' ? 'Head de Operaciones' :
        r.processArea === 'Mesa de Dinero' ? 'Head de Mesa de Dinero' :
        r.processArea === 'Tesorería' ? 'Head de Tesorería' :
        r.processArea === 'TI' ? 'Head de TI' :
        r.processArea === 'Cumplimiento' ? 'Compliance Officer' :
        r.processArea === 'Fraude' ? 'Head de Prevención de Fraude' :
        r.processArea === 'Ciberseguridad' ? 'CISO / Head de Ciberseguridad' :
        r.processArea === 'Nuevos Productos' ? 'Head de Producto' :
        'Líder del Proceso'
      );

      let resImpact = r.residualImpact !== undefined ? r.residualImpact : r.impact;
      let resProb = r.residualProbability !== undefined ? r.residualProbability : r.probability;

      if (r.residualImpact === undefined) {
        if (roamStatus === 'Resolved') {
          resImpact = 1;
          resProb = 1;
        } else if (roamStatus === 'Mitigated') {
          resImpact = Math.max(1, r.impact - 1);
          resProb = Math.max(1, r.probability - 2);
        } else {
          const controlsList = r.associatedControls || [];
          const sumImpactRed = controlsList.reduce((sum, c) => sum + c.impactReduction, 0);
          const sumProbRed = controlsList.reduce((sum, c) => sum + c.probabilityReduction, 0);
          resImpact = Math.max(1, r.impact - sumImpactRed);
          resProb = Math.max(1, r.probability - sumProbRed);
        }
      }

      return {
        ...r,
        jurisdiction: entity,
        riskDescription: rewrittenDesc,
        roamStatus,
        roamOwner,
        residualImpact: resImpact,
        residualProbability: resProb,
        acceptability: getAcceptability(resImpact * resProb)
      };
    });
  };

  const isPurgedRisk = (r: Risk) => {
    return (
      r.id === 'R-NPR-001' ||
      r.id === 'R-NPR-002' ||
      r.id === 'R-NPR-003' ||
      r.id === 'R-NPR-004' ||
      r.id === 'R-NPR-005' ||
      r.id === 'R-NPR-006' ||
      r.id === 'R-NPR-007' ||
      r.id === 'R-NPR-008' ||
      r.product === 'Cripto Ramp' ||
      (r.product === 'Tarjeta Global Card' && r.id.startsWith('R-NPR-'))
    );
  };

  const mergeFreshWithSaved = (fresh: Risk[], parsed: Risk[]) => {
    const mergedMap = new Map<string, Risk>();
    fresh.filter(fr => !isPurgedRisk(fr)).forEach(fr => mergedMap.set(fr.id, fr));
    parsed.filter((pr: Risk) => !isPurgedRisk(pr)).forEach((pr: Risk) => {
      const cleaned = { ...pr };
      if (cleaned.product === 'Tarjeta Global Card' || cleaned.product === 'Cripto Ramp') {
        cleaned.product = undefined;
      }
      mergedMap.set(cleaned.id, cleaned);
    });
    return Array.from(mergedMap.values()).filter(r => !isPurgedRisk(r));
  };

  const [regionalRisks, setRegionalRisks] = useState<Risk[]>(() => {
    const fresh = buildFreshRisksForEntity('Regional').filter(r => !isPurgedRisk(r));
    const saved = localStorage.getItem('g66_grc_risks_regional');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedList = mergeFreshWithSaved(fresh, parsed);
          localStorage.setItem('g66_grc_risks_regional', JSON.stringify(mergedList));
          return mergedList;
        }
      } catch (e) {
        console.error('Error parsing saved Regional risks:', e);
      }
    }
    localStorage.setItem('g66_grc_risks_regional', JSON.stringify(fresh));
    return fresh;
  });

  const [chileRisks, setChileRisks] = useState<Risk[]>(() => {
    const fresh = buildFreshRisksForEntity('Chile').filter(r => !isPurgedRisk(r));
    const saved = localStorage.getItem('g66_grc_risks_chile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedList = mergeFreshWithSaved(fresh, parsed);
          localStorage.setItem('g66_grc_risks_chile', JSON.stringify(mergedList));
          return mergedList;
        }
      } catch (e) {
        console.error('Error parsing saved Chile risks:', e);
      }
    }
    localStorage.setItem('g66_grc_risks_chile', JSON.stringify(fresh));
    return fresh;
  });

  const [colombiaRisks, setColombiaRisks] = useState<Risk[]>(() => {
    const fresh = buildFreshRisksForEntity('Colombia').filter(r => !isPurgedRisk(r));
    const saved = localStorage.getItem('g66_grc_risks_colombia') || localStorage.getItem('g66_grc_risks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedList = mergeFreshWithSaved(fresh, parsed);
          localStorage.setItem('g66_grc_risks_colombia', JSON.stringify(mergedList));
          return mergedList;
        }
      } catch (e) {
        console.error('Error parsing saved Colombia risks:', e);
      }
    }
    localStorage.setItem('g66_grc_risks_colombia', JSON.stringify(fresh));
    return fresh;
  });

  const [argentinaRisks, setArgentinaRisks] = useState<Risk[]>(() => {
    const saved = localStorage.getItem('g66_grc_risks_argentina');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((r: Risk) => !isPurgedRisk(r));
        }
      } catch (e) {
        console.error('Error parsing saved Argentina risks:', e);
      }
    }
    const cleanArg = INITIAL_ARGENTINA_RISKS.filter(r => !isPurgedRisk(r));
    localStorage.setItem('g66_grc_risks_argentina', JSON.stringify(cleanArg));
    return cleanArg;
  });

  // Purge deprecated risk IDs, renumber Bre-B consecutively (RO-01 to RO-11) and refresh updated controls on mount
  useEffect(() => {
    const updatedRO02Control = 'Restricción de registro libre de llaves: no se permite que un cliente pueda registrar libremente cualquier dato; el sistema sugiere y valida únicamente llaves basadas en información que el cliente ya tiene registrada y verificada con Global66 (como teléfono celular verificado o cédula/RUT validado). Device fingerprinting obligatorio y validación biométrica con Jumio.';
    const updatedRO02Doc = 'Política de Enrolamiento Seguro de Llaves Bre-B y Control de Identidad Pre-Registrada.';

    const updatedRO03Process = 'Prevención de Suplantación en Canales de Atención (Centro de Ayuda, WhatsApp y Correo)';
    const updatedRO03Risk = 'Suplantación de canales oficiales de la Entidad o de funcionarios de BanRep para inducir transferencias fraudulentas o captura de credenciales.';
    const updatedRO03Cause = 'Confianza de usuarios en marcas oficiales; perfiles o dominios falsos en canales de atención; falta de verificación del interlocutor.';
    const updatedRO03Control = 'Validación previa de identidad por WhatsApp antes de brindar cualquier atención en canales de soporte; modificación de datos de contacto (correo o número) condicionada a validación por PIN o Biometría; cambio de datos sensibles (DNI o Alias) gestionado exclusivamente mediante ticket a CX con confirmación estricta de identidad; política de cero solicitud de contraseñas, PIN u OTP por canales de atención.';
    const updatedRO03Doc = 'Protocolo de Verificación de Identidad en Canales de Atención y Modificación Segura de Datos (CX / Bre-B).';

    const compareNatural = (aId: string, bId: string) => {
      return aId.localeCompare(bId, undefined, { numeric: true, sensitivity: 'base' });
    };

    const sanitizeAndRefresh = (list: Risk[]) => {
      const sanitized = list
        .filter(r => !isPurgedRisk(r))
        .map(r => {
          let cleanedProduct = r.product;
          if (cleanedProduct === 'Tarjeta Global Card' || cleanedProduct === 'Cripto Ramp') {
            cleanedProduct = undefined;
          }
          const tax = resolveTaxonomyForRisk({ ...r, product: cleanedProduct });
          const withTax: Risk = {
            ...r,
            product: cleanedProduct,
            macrocategory: r.macrocategory || tax.macrocategory,
            taxonomyProcessId: r.taxonomyProcessId || tax.taxonomyProcessId,
            taxonomyProcessName: r.taxonomyProcessName || tax.taxonomyProcessName,
            subproceso: r.subproceso || tax.subproceso
          };
          if (r.id === 'R-MD-002' || r.id === 'R-MD-008' || r.id === 'RCV-06' || r.id.startsWith('R-TES-')) {
            return {
              ...withTax,
              processArea: 'Tesorería' as const,
              roamOwner: 'Head de Tesorería'
            };
          }
          if (r.id === 'R-MD-001' || r.id === 'R-MD-003' || r.id === 'R-MD-015') {
            return {
              ...withTax,
              processArea: 'Mesa de Dinero' as const,
              roamOwner: 'Head de Mesa de Dinero'
            };
          }
          if (r.id === 'RO-02') {
            return {
              ...r,
              suggestedControl: updatedRO02Control,
              documentControl: updatedRO02Doc,
              associatedControls: [
                {
                  id: 'C-RO-02-1',
                  description: 'Restricción de registro libre: el sistema sugiere y asocia exclusivamente llaves preexistentes y validadas del cliente (móvil verificado o documento de identidad registrado en Global66).',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-02-2',
                  description: 'Device fingerprinting obligatorio y validación de identidad biométrica con Jumio.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 0,
                  probabilityReduction: 1
                }
              ]
            };
          }
          if (r.id === 'RO-03') {
            return {
              ...r,
              process: updatedRO03Process,
              riskDescription: updatedRO03Risk,
              cause: updatedRO03Cause,
              suggestedControl: updatedRO03Control,
              documentControl: updatedRO03Doc,
              associatedControls: [
                {
                  id: 'C-RO-03-1',
                  description: 'Validación obligatoria de identidad por WhatsApp previa a cualquier atención de soporte y prohibición estricta de solicitud de PIN/OTP.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-03-2',
                  description: 'Autenticación reforzada con PIN o Biometría como requisito previo obligatorio para modificación de correo electrónico o número telefónico.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-03-3',
                  description: 'Canalización exclusiva mediante ticket a CX con confirmación documental/biométrica de identidad para cambio de datos sensibles (DNI o Alias).',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                }
              ]
            };
          }
          if (r.id === 'RO-04') {
            return {
              ...r,
              suggestedControl: 'Promover el uso de QR dinámico (firmado y único por trx); visualización obligatoria de la información del beneficiario debidamente enmascarada en pantalla para confirmación previa del ordenante; notificaciones push instantáneas al receptor.',
              documentControl: 'Estándar Técnico de Seguridad en Códigos QR y Visualización Enmascarada de Beneficiarios Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-04-1',
                  description: 'Uso de QR dinámico firmado por transacción y visualización obligatoria de la información del beneficiario de forma enmascarada para verificación antes de autorizar la transferencia.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 2
                }
              ]
            };
          }
          if (r.id === 'RO-05') {
            return {
              ...r,
              suggestedControl: 'Uso obligatorio de notificaciones push en tiempo real al ingresar dinero para protección del merchant y verificación en la visualización de movimientos de la wallet; pedagogía a comercios para validar siempre abonos en la app oficial.',
              documentControl: 'Guía de Buenas Prácticas Comerciales, Notificaciones Push y Verificación de Movimientos Merchant Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-05-1',
                  description: 'Envío de notificaciones push automáticas e instantáneas al merchant al momento del ingreso efectivo de fondos en la wallet.',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-05-2',
                  description: 'Visualización y validación inmediata del histórico de movimientos y estado de transacción directamente en el feed de la wallet.',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-05-3',
                  description: 'Programa de pedagogía a comercios para la validación obligatoria de abonos en app oficial descartando comprobantes estáticos o pantallazos.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                }
              ]
            };
          }
          if (r.id === 'RO-06') {
            return {
              ...r,
              suggestedControl: 'Manejo y tipificación estandarizada de errores según las especificaciones técnicas de certificación del switch; protocolo formal de notificación y escalamiento inmediato ante incidentes de indisponibilidad hacia la SFC y participantes; arquitectura redundante de alta disponibilidad y pruebas periódicas de BCP/DRP.',
              documentControl: 'Protocolo de Manejo de Errores según Certificación SPBVI y Procedimiento de Notificación ante Incidentes Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-06-1',
                  description: 'Mapeo y tratamiento estandarizado de códigos y flujos de error según especificaciones de certificación técnica del switch.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-06-2',
                  description: 'Protocolo formal y canal expedito de notificación y escalamiento de incidentes técnicos ante la SFC y participantes del ecosistema.',
                  type: 'Correctivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-06-3',
                  description: 'Arquitectura redundante de alta disponibilidad con SLA/SLO robustos y simulacros periódicos de BCP/DRP.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                }
              ]
            };
          }
          if (r.id === 'RO-07') {
            return {
              ...r,
              suggestedControl: 'En escenarios de saturación o colapso de red con transacciones en timeout, congelamiento preventivo del estado y espera obligatoria de la confirmación/instrucción formal de rechazo por parte de Transfiya tras la estabilización antes de reversar o devolver fondos al cliente; conciliación operativa diaria con reporte y resolución de diferencias (positivas o negativas) a través de canal formal con Transfiya.',
              documentControl: 'Protocolo de Gestión de Timeouts, Confirmación Asíncrona de Rechazos y Conciliación de Discrepancias Transfiya / Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-07-1',
                  description: 'Suspensión de reversos inmediatos ante timeout por saturación de red, condicionando la devolución de fondos a la confirmación e instrucción formal de rechazo emitida por Transfiya al estabilizarse la red.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-07-2',
                  description: 'Conciliación operativa diaria con reporte sistemático de discrepancias transaccionales (positivas o negativas) mediante canal dedicado con Transfiya.',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-07-3',
                  description: 'Alertas en tiempo real a Operaciones sobre eventos de timeout masivo y visualización clara de estado en procesamiento para el usuario en la app.',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                }
              ]
            };
          }
          if (r.id === 'RO-08') {
            return {
              ...r,
              process: 'Conciliación Diaria y Archivos Planos BREB100 / BREB201',
              suggestedControl: 'Revisión y conciliación semiautomática diaria por el equipo de Operaciones cruzando lo reportado en el archivo BREB100, las comunicaciones de Transfiya y los registros en el core bancario (Mambu); reporte formal de cualquier discrepancia a Transfiya para evaluación técnica del nodo y posterior emisión del archivo correctivo BREB201.',
              documentControl: 'Manual Operativo de Conciliación Diaria BREB100, Gestión de Discrepancias con Transfiya y Ajustes BREB201.',
              associatedControls: [
                {
                  id: 'C-RO-08-1',
                  description: 'Revisión y conciliación semiautomática diaria realizada por Operaciones cruzando el archivo plano BREB100, las comunicaciones de Transfiya y los registros del core bancario (Mambu).',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                },
                {
                  id: 'C-RO-08-2',
                  description: 'Reporte sistemático de diferencias a Transfiya para evaluación técnica del nodo y posterior aplicación de ajustes mediante archivo correctivo BREB201.',
                  type: 'Correctivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 1
                }
              ]
            };
          }
          if (r.id === 'RO-09') {
            return {
              ...r,
              suggestedControl: 'Definición y doble aprobación (captura/aprueba) de parámetros PAL, PNR y PAC en el CUD; alertas de consumo automatizadas; líneas de fondeo automáticas con la entidad compensadora.'
            };
          }
          if (r.id === 'RO-10') {
            return {
              ...r,
              suggestedControl: 'Validación previa obligatoria del nombre completo y enmascarado del receptor (DICE) y confirmación visual requerida antes de PIN/OTP.',
              documentControl: 'Estándar UX y Validación Previa de Llaves Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-10-1',
                  description: 'Validación previa obligatoria del nombre receptor (DICE) y confirmación visual antes de PIN/OTP.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 2
                }
              ]
            };
          }
          if (r.id === 'RO-11' && (r.secondaryProcessArea === 'Cumplimiento' || r.category?.toLowerCase().includes('regulador') || r.category?.toLowerCase().includes('legal') || r.process?.toLowerCase().includes('sfc'))) {
            return {
              ...r,
              suggestedControl: 'Estatuto de Comité de Productos activo; almacenamiento mínimo de logs por 30 días; cumplimiento estricto del Manual de Uso del Sello Bre-B.',
              documentControl: 'Matriz de Cumplimiento Normativo y Manual de Uso del Sello Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-11-1',
                  description: 'Comité de Productos activo, almacenamiento de logs por 30 días y cumplimiento del Manual de Uso del Sello Bre-B.',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 2,
                  probabilityReduction: 1
                }
              ]
            };
          }
          // Renumber RO-11 (UX) -> RO-10 and RO-12 (Compliance) -> RO-11 for Bre-B 11-risk sequential order
          if (r.id === 'RO-11' && (r.process?.toLowerCase().includes('experiencia') || r.category?.toLowerCase().includes('ux') || r.process?.toLowerCase().includes('dice'))) {
            return {
              ...r,
              id: 'RO-10',
              suggestedControl: 'Validación previa obligatoria del nombre completo y enmascarado del receptor (DICE) y confirmación visual requerida antes de PIN/OTP.',
              documentControl: 'Estándar UX y Validación Previa de Llaves Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-10-1',
                  description: 'Validación previa obligatoria del nombre receptor (DICE) y confirmación visual antes de PIN/OTP.',
                  type: 'Preventivo',
                  efficiency: 'Excelente',
                  impactReduction: 1,
                  probabilityReduction: 2
                }
              ]
            };
          }
          if (r.id === 'RO-12') {
            return {
              ...r,
              id: 'RO-11',
              suggestedControl: 'Estatuto de Comité de Productos activo; almacenamiento mínimo de logs por 30 días; cumplimiento estricto del Manual de Uso del Sello Bre-B.',
              documentControl: 'Matriz de Cumplimiento Normativo y Manual de Uso del Sello Bre-B.',
              associatedControls: [
                {
                  id: 'C-RO-11-1',
                  description: 'Comité de Productos activo, almacenamiento de logs por 30 días y cumplimiento del Manual de Uso del Sello Bre-B.',
                  type: 'Detectivo',
                  efficiency: 'Excelente',
                  impactReduction: 2,
                  probabilityReduction: 1
                }
              ]
            };
          }
          return withTax;
        });

      return sanitized.sort((a, b) => compareNatural(a.id, b.id));
    };

    ['g66_grc_risks_regional', 'g66_grc_risks_chile', 'g66_grc_risks_colombia', 'g66_grc_risks_argentina', 'g66_grc_risks'].forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const sanitized = sanitizeAndRefresh(parsed);
            localStorage.setItem(key, JSON.stringify(sanitized));
          }
        } catch (err) {
          // ignore
        }
      }
    });
    setRegionalRisks(prev => sanitizeAndRefresh(prev));
    setColombiaRisks(prev => sanitizeAndRefresh(prev));
    setChileRisks(prev => sanitizeAndRefresh(prev));
    setArgentinaRisks(prev => sanitizeAndRefresh(prev));
  }, []);

  const [argentinaLossEvents, setArgentinaLossEvents] = useState<LossEvent[]>(() => {
    const saved = localStorage.getItem('g66_grc_loss_events_argentina');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved Argentina loss events:', e);
      }
    }
    localStorage.setItem('g66_grc_loss_events_argentina', JSON.stringify(INITIAL_ARGENTINA_LOSS_EVENTS));
    return INITIAL_ARGENTINA_LOSS_EVENTS;
  });

  const risks = useMemo(() => {
    if (jurisdiction === 'Argentina') return argentinaRisks;
    if (jurisdiction === 'Chile') return chileRisks;
    if (jurisdiction === 'Colombia') return colombiaRisks;
    return regionalRisks;
  }, [jurisdiction, argentinaRisks, chileRisks, colombiaRisks, regionalRisks]);

  const setRisks = (updater: Risk[] | ((prev: Risk[]) => Risk[])) => {
    if (jurisdiction === 'Argentina') {
      setArgentinaRisks(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem('g66_grc_risks_argentina', JSON.stringify(next));
        return next;
      });
    } else if (jurisdiction === 'Chile') {
      setChileRisks(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem('g66_grc_risks_chile', JSON.stringify(next));
        return next;
      });
    } else if (jurisdiction === 'Colombia') {
      setColombiaRisks(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem('g66_grc_risks_colombia', JSON.stringify(next));
        return next;
      });
    } else {
      setRegionalRisks(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem('g66_grc_risks_regional', JSON.stringify(next));
        return next;
      });
    }
  };

  useEffect(() => {
    localStorage.setItem('g66_grc_jurisdiction', jurisdiction);
  }, [jurisdiction]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'proposals' | 'catalog' | 'methodology' | 'docs' | 'evidence' | 'assets' | 'action_plans' | 'reports' | 'strategic_risks' | 'integrator' | 'bcra_led'>('dashboard');
  const [selectedArea, setSelectedArea] = useState<string>('TODOS');
  const [selectedProduct, setSelectedProduct] = useState<string>('TODOS');
  const [selectedTaxonomyMacro, setSelectedTaxonomyMacro] = useState<string>('TODOS');
  const [selectedTaxonomyProcessId, setSelectedTaxonomyProcessId] = useState<number | 'TODOS'>('TODOS');
  const [heatmapMode, setHeatmapMode] = useState<'inherent' | 'residual' | 'dual'>('dual');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [expandedStatCard, setExpandedStatCard] = useState<'critical' | 'acceptable' | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const [selectedCoordinate, setSelectedCoordinate] = useState<{ impact: number; probability: number; mode?: 'inherent' | 'residual' } | null>(null);
  const [selectedColorFilter, setSelectedColorFilter] = useState<'BAJO' | 'MODERADO' | 'ALTO' | 'EXTREMO' | null>(null);
  const [showJPMorganDocsModal, setShowJPMorganDocsModal] = useState(false);
  const [jpmDocsActiveTab, setJpmDocsActiveTab] = useState<'alcance' | 'business_case' | 'iso31000'>('alcance');
  const [showGlobalChatsDocsModal, setShowGlobalChatsDocsModal] = useState(false);
  const [globalChatsActiveTab, setGlobalChatsActiveTab] = useState<'alcance' | 'amenazas' | 'iso31000'>('alcance');
  const [showCcePeruDocsModal, setShowCcePeruDocsModal] = useState(false);
  const [cceDocsActiveTab, setCceDocsActiveTab] = useState<'onepager' | 'operaciones' | 'iso31000'>('onepager');
  const [showMcpDocsModal, setShowMcpDocsModal] = useState(false);
  const [mcpDocsActiveTab, setMcpDocsActiveTab] = useState<'alcance' | 'seguridad_agentes' | 'iso31000'>('alcance');
  const [showStablecoinsDocsModal, setShowStablecoinsDocsModal] = useState(false);
  const [stablecoinsDocsActiveTab, setStablecoinsDocsActiveTab] = useState<'alcance1' | 'alcance2' | 'iso31000'>('alcance1');

  const areas = jurisdiction === 'Argentina' ? [
    { id: 'TODOS', label: 'TODOS' },
    { id: 'Fraude Interno', label: '1. Fraude Interno' },
    { id: 'Fraude Externo', label: '2. Fraude Externo' },
    { id: 'Relaciones Laborales y Seguridad en el Puesto de Trabajo', label: '3. Rel. Laborales' },
    { id: 'Clientes, Productos y Prácticas Empresariales', label: '4. Clientes/Productos' },
    { id: 'Daños a Activos Físicos', label: '5. Daños Activos' },
    { id: 'Incidencias en el Negocio y Fallos en los Sistemas', label: '6. Fallos Sistemas' },
    { id: 'Ejecución, Entrega y Gestión de Procesos', label: '7. Gestión Procesos' },
    { id: 'Conciliaciones', label: 'Conciliaciones' },
    { id: 'Cumplimiento', label: 'Compliance' },
    { id: 'Operaciones', label: 'OPs' },
    { id: 'Mesa de Dinero', label: 'Mesa de Dinero' },
    { id: 'Tesorería', label: 'Tesorería' },
    { id: 'TI', label: 'TI' }
  ] : [
    { id: 'TODOS', label: 'TODOS' },
    { id: 'Conciliaciones', label: 'Conciliaciones' },
    { id: 'Cumplimiento', label: 'Compliance' },
    { id: 'Fraude', label: 'Fraude' },
    { id: 'Ciberseguridad', label: 'Ciberseguridad' },
    { id: 'Operaciones', label: 'OPs' },
    { id: 'Mesa de Dinero', label: 'Mesa de Dinero' },
    { id: 'Tesorería', label: 'Tesorería' },
    { id: 'TI', label: 'TI' },
    { id: 'Nuevos Productos', label: 'Nuevos Prod.' },
    { id: 'Riesgos Nube', label: 'Riesgos Nube' }
  ];

  const baseFilteredRisks = useMemo(() => {
    let activeRisks = risks.filter(r => r.status !== 'Rechazado' && r.id !== 'R-NPR-002' && r.id !== 'R-NPR-004');
    
    if (selectedArea !== 'TODOS') {
      activeRisks = activeRisks.filter(r => 
        r.processArea === selectedArea || 
        r.secondaryProcessArea === selectedArea ||
        r.categoriaBCRA === selectedArea
      );
    }

    if (selectedProduct !== 'TODOS') {
      activeRisks = activeRisks.filter(r => r.product === selectedProduct);
    }

    if (selectedTaxonomyMacro !== 'TODOS') {
      activeRisks = activeRisks.filter(r => {
        const tax = resolveTaxonomyForRisk(r);
        return tax.macrocategory === selectedTaxonomyMacro;
      });
    }

    if (selectedTaxonomyProcessId !== 'TODOS') {
      activeRisks = activeRisks.filter(r => {
        const tax = resolveTaxonomyForRisk(r);
        return tax.taxonomyProcessId === Number(selectedTaxonomyProcessId);
      });
    }

    if (showCriticalOnly) {
      activeRisks = activeRisks.filter(r => (r.impact * r.probability) > 7);
    }

    return activeRisks;
  }, [risks, selectedArea, selectedProduct, selectedTaxonomyMacro, selectedTaxonomyProcessId, showCriticalOnly]);

  const filteredRisks = useMemo(() => {
    let activeRisks = baseFilteredRisks;

    if (selectedCoordinate) {
      activeRisks = activeRisks.filter(r => {
        const evalMode = selectedCoordinate.mode || (heatmapMode === 'residual' ? 'residual' : 'inherent');
        const currentImpact = evalMode === 'residual' 
          ? (r.residualImpact ?? Math.max(1, r.impact - 1)) 
          : r.impact;
        const currentProb = evalMode === 'residual' 
          ? (r.residualProbability ?? Math.max(1, r.probability - 1)) 
          : r.probability;
        return currentImpact === selectedCoordinate.impact && currentProb === selectedCoordinate.probability;
      });
    }

    if (selectedColorFilter) {
      activeRisks = activeRisks.filter(r => {
        const evalMode = heatmapMode === 'residual' ? 'residual' : 'inherent';
        const currentImpact = evalMode === 'residual' 
          ? (r.residualImpact ?? Math.max(1, r.impact - 1)) 
          : r.impact;
        const currentProb = evalMode === 'residual' 
          ? (r.residualProbability ?? Math.max(1, r.probability - 1)) 
          : r.probability;
        const score = currentImpact * currentProb;
        if (selectedColorFilter === 'EXTREMO') return score > 20;
        if (selectedColorFilter === 'ALTO') return score > 12 && score <= 20;
        if (selectedColorFilter === 'MODERADO') return score > 7 && score <= 12;
        return score <= 7;
      });
    }

    return activeRisks;
  }, [baseFilteredRisks, selectedCoordinate, selectedColorFilter, heatmapMode]);

  const handleAddRisk = (newRiskData: Omit<Risk, 'id' | 'status'>, preventRedirect = false) => {
    const resolved = resolveTaxonomyForRisk(newRiskData);
    const targetArea = (newRiskData.processArea || resolved.processArea);

    const prefixMap: Record<string, string> = {
      'Conciliaciones': 'CON',
      'Cumplimiento': 'COM',
      'Fraude': 'FRA',
      'Ciberseguridad': 'CIB',
      'Operaciones': 'OPS',
      'Mesa de Dinero': 'MD',
      'Tesorería': 'TES',
      'TI': 'TI',
      'Nuevos Productos': 'NPR',
      'Riesgos Nube': 'CLD'
    };
    const prefix = prefixMap[targetArea] || targetArea.substring(0, 3).toUpperCase();
    const areaRisks = risks.filter(r => r.processArea === targetArea);
    // Strict numeric sequence [R]-[SIGLA]-[###]
    const nextNum = areaRisks.length + 1;
    const id = `R-${prefix}-${nextNum.toString().padStart(3, '0')}`;
    
    // Clean description and extract cause
    const cleaned = cleanRiskDescriptionAndExtractCause(newRiskData.riskDescription, newRiskData.cause);

    const newRisk: Risk = {
      ...newRiskData,
      macrocategory: newRiskData.macrocategory || resolved.macrocategory,
      taxonomyProcessId: newRiskData.taxonomyProcessId || resolved.taxonomyProcessId,
      taxonomyProcessName: newRiskData.taxonomyProcessName || resolved.taxonomyProcessName,
      subproceso: newRiskData.subproceso || resolved.subproceso,
      processArea: targetArea,
      process: newRiskData.process || `${resolved.taxonomyProcessName} - ${resolved.subproceso}`,
      riskDescription: cleaned.cleanedDescription,
      cause: cleaned.extractedCause,
      id,
      status: 'Aprobado', // New risks are approved by default as requested
      acceptability: getAcceptability(newRiskData.impact * newRiskData.probability)
    };
    setRisks([newRisk, ...risks]);
    setSelectedArea('TODOS');
    setSelectedTaxonomyMacro('TODOS');
    setSelectedTaxonomyProcessId('TODOS');
    setSelectedCoordinate(null);
    setSelectedColorFilter(null);
    setShowCriticalOnly(false);
    if (!preventRedirect) {
      setActiveTab('dashboard'); // Show in dashboard immediately
    }
  };

  const handleAcceptRisk = (riskId: string) => {
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, status: 'Aprobado' } : r));
  };

  const handleUpdateRisk = (riskId: string, updates: Partial<Risk>) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        const merged = { ...r, ...updates };

        // Determine residual values based on ROAM or Associated Controls
        let resImpact = merged.impact;
        let resProb = merged.probability;

        if (merged.roamStatus === 'Resolved') {
          resImpact = 1;
          resProb = 1;
        } else if (merged.roamStatus === 'Mitigated') {
          resImpact = Math.max(1, merged.impact - 1);
          resProb = Math.max(1, merged.probability - 2);
        } else {
          // fallback to manual controls if any
          const controlsList = merged.associatedControls || [];
          const sumImpactRed = controlsList.reduce((sum, c) => sum + c.impactReduction, 0);
          const sumProbRed = controlsList.reduce((sum, c) => sum + c.probabilityReduction, 0);
          resImpact = Math.max(1, merged.impact - sumImpactRed);
          resProb = Math.max(1, merged.probability - sumProbRed);
        }

        merged.residualImpact = resImpact;
        merged.residualProbability = resProb;

        // Recalculate acceptability using the active score (residual if mitigated/resolved)
        const activeScore = resImpact * resProb;
        merged.acceptability = getAcceptability(activeScore);

        return merged;
      }
      return r;
    }));
  };

  const handleDeleteRisk = (riskId: string) => {
    // Move to "Trash" (Rechazado status)
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, status: 'Rechazado' } : r));
  };

  const handleApplyControl = (riskId: string, proposal: ControlProposal) => {
    setRisks(prevRisks => prevRisks.map(risk => {
      if (risk.id === riskId) {
        const ic = proposal.controlIndex || 0;
        let probReduction = 0;
        let impactReduction = 0;

        if (ic >= 85) {
          probReduction = 2;
          impactReduction = 1;
        } else if (ic >= 60) {
          probReduction = 1;
          impactReduction = 1;
        } else if (ic >= 40) {
          probReduction = 1;
          impactReduction = 0;
        }

        const residualImpact = Math.max(1, risk.impact - impactReduction);
        const residualProbability = Math.max(1, risk.probability - probReduction);
        const residualScore = residualImpact * residualProbability;

        return {
          ...risk,
          residualImpact,
          residualProbability,
          appliedControlId: proposal.id,
          suggestedControl: proposal.description,
          controlIndex: ic,
          acceptability: getAcceptability(residualScore)
        };
      }
      return risk;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* SIDEBAR PERSISTENTE (Desktop) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-40 p-6 justify-between select-none">
        <div className="space-y-6">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <Shield size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-none text-slate-900">GRC Fintech</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-0.5">Control Intelligence</p>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4" />

          {/* MÓDULOS EN VERTICAL */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Módulos Activos
            </span>
            
            <div className="flex flex-col gap-2">
              {/* Módulo GRC Core */}
              <button
                onClick={() => setAppMode('grc')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'grc'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-100'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'grc' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Shield size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>GRC Core</span>
                    {appMode === 'grc' && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'grc' ? 'text-slate-400' : 'text-slate-400'}`}>
                    ISO 31000 & Metodología ROAM
                  </p>
                </div>
              </button>

              {/* Módulo Riesgos TI */}
              <button
                onClick={() => setAppMode('ti_risks')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'ti_risks'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-105'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200'
                }`}
                id="ti_risk_app_switch_btn"
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'ti_risks' ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Laptop size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>Riesgos TI</span>
                    {appMode === 'ti_risks' && <div className="w-1.5 h-1.5 bg-sky-450 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'ti_risks' ? 'text-slate-400' : 'text-slate-400'}`}>
                    ISO 27001 Seguridad de Info.
                  </p>
                </div>
              </button>

              {/* Módulo Planes y Pruebas */}
              <button
                onClick={() => setAppMode('action_plans')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'action_plans'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-100'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200'
                }`}
                id="action_plans_switch_btn"
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'action_plans' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-500'}`}>
                  <ClipboardList size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>Planes y Pruebas</span>
                    {appMode === 'action_plans' && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'action_plans' ? 'text-slate-400' : 'text-slate-400'}`}>
                    Continuidad, SARO, SICB, Fraude
                  </p>
                </div>
              </button>

              {/* Módulo Eventos de Riesgo (CMF & SFC) */}
              <button
                onClick={() => setAppMode('risk_events')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'risk_events'
                    ? 'bg-red-950 text-white border-red-700 shadow-lg shadow-red-950/30 ring-2 ring-red-500/50'
                    : 'bg-white text-slate-600 hover:bg-red-50/50 hover:text-slate-900 border-slate-200'
                }`}
                id="risk_events_switch_btn"
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'risk_events' ? 'bg-red-900 text-amber-300' : 'bg-red-50 text-red-600'}`}>
                  <Flame size={18} className={appMode === 'risk_events' ? 'animate-pulse' : ''} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>Eventos de Riesgo</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-600 text-white animate-pulse">
                      1 Crítico
                    </span>
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'risk_events' ? 'text-red-200' : 'text-slate-400'}`}>
                    Reporte CMF & SFC • Adquirencia
                  </p>
                </div>
              </button>

              {/* Módulo 1: Generador de Documentos (IA) */}
              <button
                onClick={() => setAppMode('process_governance')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'process_governance'
                    ? 'bg-[#102A97] text-white border-[#102A97] shadow-md shadow-blue-900/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200'
                }`}
                id="process_governance_switch_btn"
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'process_governance' ? 'bg-[#3F5EDF] text-white' : 'bg-[#F4F6FE] text-[#102A97]'}`}>
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>📝 Generador de Documentos (IA)</span>
                    {appMode === 'process_governance' && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'process_governance' ? 'text-blue-200' : 'text-slate-400'}`}>
                    Creación desde Videos & Transcripciones
                  </p>
                </div>
              </button>

              {/* Módulo 2: Repositorio & Control Máster */}
              <button
                onClick={() => setAppMode('document_inventory')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'document_inventory'
                    ? 'bg-[#102A97] text-white border-[#102A97] shadow-md shadow-blue-900/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200'
                }`}
                id="document_inventory_switch_btn"
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'document_inventory' ? 'bg-[#00B582] text-white' : 'bg-emerald-50 text-[#00B582]'}`}>
                  <FileSpreadsheet size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>📚 Repositorio & Control Máster</span>
                    {appMode === 'document_inventory' && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'document_inventory' ? 'text-blue-200' : 'text-slate-400'}`}>
                    Matriz Consolidada & Control de Versiones
                  </p>
                </div>
              </button>

              {/* Módulo 3: Mapa Maestro Regional de Procesos */}
              <button
                onClick={() => setAppMode('process_taxonomy')}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  appMode === 'process_taxonomy'
                    ? 'bg-[#102A97] text-white border-[#102A97] shadow-md shadow-blue-900/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200'
                }`}
                id="process_taxonomy_switch_btn"
              >
                <div className={`p-2 rounded-lg shrink-0 ${appMode === 'process_taxonomy' ? 'bg-[#F49A24] text-slate-950' : 'bg-amber-50 text-[#F49A24]'}`}>
                  <Layers size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black leading-tight flex items-center justify-between">
                    <span>🗺️ Mapa Maestro Regional</span>
                    {appMode === 'process_taxonomy' && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${appMode === 'process_taxonomy' ? 'text-blue-200' : 'text-slate-400'}`}>
                    14 Procesos & Roles Multi-Entidad
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR DEL SIDEBAR (Botón de Acción Rápida GRC Core) */}
        {appMode === 'grc' && (
          <div className="p-1 bg-slate-50 rounded-2xl border border-slate-150 shadow-inner">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-1">Acción Rápida GRC</span>
            <RiskForm onAddRisk={handleAddRisk} />
          </div>
        )}
      </aside>

      {/* HEADER DE MÓVIL (Compacto) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <Shield size={16} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-none text-slate-900">GRC Fintech</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Control Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {appMode === 'grc' && (
            <div className="scale-90">
              <RiskForm onAddRisk={handleAddRisk} />
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* DRAWER DE MENÚ EN MÓVIL */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40" onClick={() => setMobileMenuOpen(false)}>
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-6 space-y-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Seleccionar del Módulo GRC (Vertical)
            </span>

            <div className="flex flex-col gap-2">
              {[
                { 
                  id: 'grc' as const, 
                  label: '🛡️ GRC Core (ISO 31000)', 
                  desc: 'Riesgos Corporativos y ROAM',
                  activeBg: 'bg-slate-900 text-white' 
                },
                { 
                  id: 'ti_risks' as const, 
                  label: '💻 Riesgos TI (ISO 27001)', 
                  desc: 'Seguridad de la Info. & Activos',
                  activeBg: 'bg-slate-900 text-white' 
                },
                { 
                  id: 'action_plans' as const, 
                  label: '📋 Planes y Pruebas', 
                  desc: 'BCP/DRP, SARO, SICB, Fraude',
                  activeBg: 'bg-slate-900 text-white' 
                },
                { 
                  id: 'risk_events' as const, 
                  label: '🚨 Eventos de Riesgo (CMF & SFC)', 
                  desc: 'Reporte Regulatorio • Hold Inswitch $128k',
                  activeBg: 'bg-red-950 text-white' 
                },
                { 
                  id: 'process_governance' as const, 
                  label: '📝 Generador de Documentos (IA)', 
                  desc: 'Creación desde Videos & Transcripciones',
                  activeBg: 'bg-[#102A97] text-white' 
                },
                { 
                  id: 'document_inventory' as const, 
                  label: '📚 Repositorio & Control Máster', 
                  desc: 'Matriz Consolidada & Control de Versiones',
                  activeBg: 'bg-[#102A97] text-white' 
                },
                { 
                  id: 'process_taxonomy' as const, 
                  label: '🗺️ Mapa Maestro Regional (14 Procesos)', 
                  desc: 'Taxonomía Regional & Multi-Entidad',
                  activeBg: 'bg-[#102A97] text-white' 
                }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAppMode(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex flex-col p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    appMode === item.id
                      ? `${item.activeBg} border-transparent font-extrabold shadow-sm`
                      : 'bg-white text-slate-600 border-slate-250 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-black">{item.label}</span>
                  <span className={`text-[9px] font-bold ${appMode === item.id ? 'text-slate-400' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 pt-20 lg:pt-8 pb-12 px-6 w-full">
        {appMode === 'ti_risks' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <TIRiskApp />
          </motion.div>
        ) : appMode === 'action_plans' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ActionPlansModule risks={risks} onUpdateRisk={handleUpdateRisk} />
          </motion.div>
        ) : appMode === 'risk_events' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <RiskEventsModule 
              onNavigateToPlans={() => setAppMode('action_plans')}
              onNavigateToRisk={(riskId) => {
                setSelectedArea('Fraude');
                setActiveTab('table');
                setAppMode('grc');
              }}
            />
          </motion.div>
        ) : appMode === 'process_governance' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ProcessGovernanceModule 
              risks={risks} 
              jurisdiction={jurisdiction} 
              onUpdateRisk={(updated) => handleUpdateRisk(updated.id, updated)} 
              onNavigateToRepository={() => setAppMode('document_inventory')}
            />
          </motion.div>
        ) : appMode === 'document_inventory' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DocumentInventoryModule />
          </motion.div>
        ) : appMode === 'process_taxonomy' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <RegionalProcessArchitectureView 
              risks={risks}
              onSelectProcessToDocument={(procDef) => {
                setAppMode('process_governance');
              }}
              onFilterRisksByProcess={(area) => {
                setSelectedArea(area);
                setActiveTab('table');
                setAppMode('grc');
              }}
            />
          </motion.div>
        ) : (
          <>
            <header className="mb-8 space-y-6 font-sans border-b border-slate-200 pb-6">
              {/* CONMUTADOR PRINCIPAL DE JURISDICCIÓN (Modo Multi-entidad) */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-800 rounded-xl text-amber-400 border border-slate-700/60 shrink-0">
                    <Layers size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidad & Jurisdicción</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {ENTITY_PROFILES[jurisdiction].standard}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {ENTITY_PROFILES[jurisdiction].currency}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                      <span>{ENTITY_PROFILES[jurisdiction].flag}</span>
                      <span>{ENTITY_PROFILES[jurisdiction].name}</span>
                      <span className="text-xs font-semibold text-slate-400">({ENTITY_PROFILES[jurisdiction].regulator})</span>
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setJurisdiction('Regional');
                      setSelectedArea('TODOS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      jurisdiction === 'Regional'
                        ? 'bg-blue-600 text-white shadow-md font-black scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🌎</span>
                    <span>Regional</span>
                  </button>

                  <button
                    onClick={() => {
                      setJurisdiction('Chile');
                      setSelectedArea('TODOS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      jurisdiction === 'Chile'
                        ? 'bg-rose-600 text-white shadow-md font-black scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🇨🇱</span>
                    <span>CH - Global Card (CMF)</span>
                  </button>

                  <button
                    onClick={() => {
                      setJurisdiction('Colombia');
                      setSelectedArea('TODOS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      jurisdiction === 'Colombia'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🇨🇴</span>
                    <span>CO - Colombia (SFC)</span>
                  </button>

                  <button
                    onClick={() => {
                      setJurisdiction('Argentina');
                      setSelectedArea('TODOS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      jurisdiction === 'Argentina'
                        ? 'bg-sky-400 text-slate-950 shadow-md font-black scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🇦🇷</span>
                    <span>AR - Argentina (BCRA)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sistema de Gestión de Riesgos Corporativos</h2>
                <p className="text-slate-500 font-medium">
                  {jurisdiction === 'Regional' 
                    ? 'Consolidado Regional de Riesgos Corporativos - Todos los Procesos (ISO 31000 & ROAM)'
                    : jurisdiction === 'Chile'
                    ? 'CH - Global Card S.P.A. - Riesgo Operacional & Ciberseguridad (CMF NCG 464 / RAN 20-10)'
                    : jurisdiction === 'Colombia'
                    ? 'CO - Global66 Colombia - Sistema de Administración de Riesgo Operativo (SFC SARO / ISO 31000)'
                    : 'AR - Global66 Argentina S.A.U. - Riesgo Operacional & Base LED (BCRA Com. A 7783 / Basilea III)'}
                </p>
              </div>
              
              <div className="flex flex-wrap p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-max gap-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm animate-fade-in' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
                {jurisdiction === 'Argentina' && (
                  <button
                    onClick={() => setActiveTab('bcra_led')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'bcra_led'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <Database size={18} className={activeTab === 'bcra_led' ? 'text-white' : 'text-blue-600'} />
                    <span>Base Pérdidas (LED)</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-900/30 text-blue-200 uppercase">
                      BCRA
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('strategic_risks')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'strategic_risks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <ShieldAlert size={18} className="text-red-500" />
                  Riesgos Estratégicos
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <FileText size={18} />
                  Matriz Detallada
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <BarChart3 size={18} className="text-blue-500" />
                  Informes GRC
                </button>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <Inbox size={18} />
                  Catálogo de Riesgos
                  {risks.filter(r => r.status === 'Pendiente').length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-extrabold ml-1">
                      {risks.filter(r => r.status === 'Pendiente').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('action_plans')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'action_plans' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <ClipboardList size={18} className="text-blue-500" />
                  Planes de Acción (SARO)
                </button>
                <button
                  onClick={() => setActiveTab('integrator')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'integrator' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60'}`}
                >
                  <FileSpreadsheet size={18} className={activeTab === 'integrator' ? 'text-white' : 'text-emerald-600'} />
                  Cargar Excel de Matrices
                </button>
                <button
                  onClick={() => setActiveTab('company_controls')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'company_controls' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'}`}
                >
                  <ShieldCheck size={18} className={activeTab === 'company_controls' ? 'text-white' : 'text-emerald-600'} />
                  <span>Controles Compañía</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-900/20 text-emerald-800 uppercase">
                    Oficiales
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('proposals')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'proposals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <Sparkles size={18} className="text-amber-500" />
                  Sugerencias IA
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'evidence' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <Video size={18} className="text-indigo-500" />
                  Evidencia de Video
                </button>

                <button
                  onClick={() => setAppMode('process_governance')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer bg-[#F4F6FE] text-[#102A97] hover:bg-[#3F5EDF] hover:text-white border border-[#DCE3FA]"
                >
                  <FileText size={18} className="text-[#3F5EDF]" />
                  <span>Gobierno de Procesos</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#102A97] text-white uppercase">
                    PRO/POL
                  </span>
                </button>

                <button
                  onClick={() => setAppMode('document_inventory')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer bg-emerald-50 text-emerald-900 hover:bg-[#00B582] hover:text-white border border-emerald-200"
                >
                  <FileSpreadsheet size={18} className="text-emerald-600" />
                  <span>Auditoría de Códigos</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#00B582] text-white uppercase">
                    GCCO/G81/GCCL
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('methodology')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'methodology' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <BookOpen size={18} className="text-blue-500" />
                  Metodología
                </button>
              </div>

          {/* FILTROS INTEGRADOS (UNIDAD Y LÍNEA DE PRODUCTO) */}
          <div className="flex flex-col gap-3">
            {/* Fila 1: Filtro por Unidad / Macroproceso */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-0 p-1 bg-slate-100/50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 px-4 text-slate-400 border-r border-slate-200 mr-2">
                  <Filter size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Unidad</span>
                </div>
                {areas.map((area) => {
                  const count = area.id === 'TODOS' 
                    ? risks.filter(r => r.status !== 'Rechazado').length
                    : risks.filter(r => (r.processArea === area.id || r.secondaryProcessArea === area.id) && r.status !== 'Rechazado').length;

                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedArea(area.id);
                        setSelectedCoordinate(null);
                        setSelectedColorFilter(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                        selectedArea === area.id 
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {area.id === 'TODOS' ? 'Consolidado' : area.label}
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                        selectedArea === area.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Executive Filter Toggle */}
                <button
                  onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    showCriticalOnly 
                      ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-4.5 rounded-full p-1 transition-colors relative flex items-center ${showCriticalOnly ? 'bg-amber-500' : 'bg-slate-200'}`}>
                    <div className={`w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all transform ${showCriticalOnly ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                  <span>Mostrar solo Riesgos Críticos</span>
                  <ShieldAlert size={14} className={showCriticalOnly ? 'text-amber-600' : 'text-slate-400'} />
                </button>
              </div>
            </div>

            {/* Fila 2: Filtro por Línea de Producto Fintech (Nuevos Productos) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gradient-to-r from-amber-50/70 to-slate-100/50 rounded-2xl border border-amber-200/70 shadow-2xs">
              <div className="flex items-center gap-1.5 px-3 py-1 text-amber-900 border-r border-amber-200 mr-1 shrink-0">
                <Zap size={13} className="text-amber-600 fill-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Línea de Producto</span>
              </div>
              
              {FINTECH_PRODUCTS.map((prod) => {
                const prodCount = prod.id === 'TODOS'
                  ? risks.filter(r => r.status !== 'Rechazado').length
                  : risks.filter(r => r.product === prod.id && r.status !== 'Rechazado').length;
                const isSelected = selectedProduct === prod.id;

                return (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod.id);
                      setSelectedCoordinate(null);
                      setSelectedColorFilter(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-sm font-black ring-1 ring-amber-500/50'
                        : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    <span>{prod.icon}</span>
                    <span>{prod.shortName}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                      isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {prodCount}
                    </span>
                  </button>
                );
              })}

              {selectedProduct !== 'TODOS' && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => exportToExcel(
                      risks.filter(r => r.product === selectedProduct && r.status !== 'Rechazado'),
                      `Matriz_Riesgos_${selectedProduct}`,
                      `Matriz ${selectedProduct}`
                    )}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer shadow-2xs"
                    title={`Descargar todos los riesgos de ${selectedProduct} en Excel`}
                  >
                    <FileSpreadsheet size={12} />
                    <span>Descargar {selectedProduct} en Excel</span>
                  </button>
                  <button
                    onClick={() => setSelectedProduct('TODOS')}
                    className="text-[10px] font-bold text-slate-500 hover:text-rose-600 underline px-1 cursor-pointer"
                  >
                    Restablecer a Todos
                  </button>
                </div>
              )}
            </div>

            {/* Fila 3: Filtro por Taxonomía Regional Oficial (14 Procesos & 4 Macroprocesos) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1 text-[#102A97] border-r border-blue-200 mr-1 shrink-0">
                  <Layers size={13} className="text-[#102A97]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Taxonomía Regional</span>
                </div>

                {/* Macroprocesos Pills */}
                <div className="flex flex-wrap items-center gap-1">
                  {(['TODOS', 'Estratégicos', 'Misionales', 'De Apoyo', 'Evaluación Independiente'] as const).map(macro => {
                    const count = macro === 'TODOS'
                      ? risks.filter(r => r.status !== 'Rechazado').length
                      : risks.filter(r => {
                          const tax = resolveTaxonomyForRisk(r);
                          return tax.macrocategory === macro && r.status !== 'Rechazado';
                        }).length;
                    const isSelected = selectedTaxonomyMacro === macro;

                    return (
                      <button
                        key={macro}
                        onClick={() => {
                          setSelectedTaxonomyMacro(macro);
                          setSelectedTaxonomyProcessId('TODOS');
                          setSelectedCoordinate(null);
                          setSelectedColorFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#102A97] text-white shadow-sm font-black'
                            : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
                        }`}
                      >
                        <span>{macro === 'TODOS' ? 'Todos los Macroprocesos' : macro}</span>
                        <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                          isSelected ? 'bg-white text-[#102A97]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dropdown de los 14 Procesos Oficiales */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Proceso Oficial:</span>
                <select
                  value={selectedTaxonomyProcessId}
                  onChange={e => {
                    const val = e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value);
                    setSelectedTaxonomyProcessId(val);
                    setSelectedCoordinate(null);
                    setSelectedColorFilter(null);
                  }}
                  className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#102A97] outline-none shadow-2xs max-w-xs truncate cursor-pointer"
                >
                  <option value="TODOS">Todos los 14 Procesos</option>
                  {GLOBAL66_PROCESS_TAXONOMY
                    .filter(p => selectedTaxonomyMacro === 'TODOS' || p.macrocategory === selectedTaxonomyMacro)
                    .map(p => {
                      const pCount = risks.filter(r => {
                        const tax = resolveTaxonomyForRisk(r);
                        return tax.taxonomyProcessId === p.id && r.status !== 'Rechazado';
                      }).length;
                      return (
                        <option key={p.id} value={p.id}>
                          #{p.id} {p.categoryLevel1} ({pCount} riesgos)
                        </option>
                      );
                    })}
                </select>

                {(selectedTaxonomyMacro !== 'TODOS' || selectedTaxonomyProcessId !== 'TODOS') && (
                  <button
                    onClick={() => {
                      setSelectedTaxonomyMacro('TODOS');
                      setSelectedTaxonomyProcessId('TODOS');
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-rose-600 underline px-1 cursor-pointer whitespace-nowrap"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Executive Header Summary */}
          {(activeTab === 'catalog' || activeTab === 'table') && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium">
                  Visualizando <span className="font-bold text-amber-400">{filteredRisks.length}</span> de <span className="font-bold">{risks.filter(r => r.status !== 'Rechazado').length}</span> riesgos totales 
                  {selectedProduct !== 'TODOS' && (
                    <span className="text-amber-300 font-bold ml-1">• Filtrado por {selectedProduct}</span>
                  )}
                  <span className="text-slate-400 ml-1">(Filtrados por impacto patrimonial)</span>
                </span>
              </div>

              {selectedProduct === 'Bre-B' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Bre-B' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Bre-B', 
                    'Matriz Bre-B'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 11 riesgos de Bre-B en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-amber-300" />
                  <span>Descargar Matriz Bre-B (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Tarjetas Temporales' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Tarjetas Temporales' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Tarjetas_Temporales_ISO31000', 
                    'Matriz Tarjetas Temporales'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 8 riesgos de Tarjetas Temporales en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-cyan-200" />
                  <span>Descargar Matriz Tarjetas Temporales (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Flujo de Bloqueos' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Flujo de Bloqueos' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Flujo_de_Bloqueos_ISO31000', 
                    'Matriz Flujo de Bloqueos'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 8 riesgos de Flujo de Bloqueos en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-amber-200" />
                  <span>Descargar Matriz Flujo de Bloqueos (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Multitarjeta' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Multitarjeta' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Multitarjeta_ISO31000', 
                    'Matriz Multitarjeta'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 8 riesgos de Multitarjeta en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-violet-200" />
                  <span>Descargar Matriz Multitarjeta (Excel)</span>
                </button>
              )}

              {selectedProduct === 'GlobalID' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'GlobalID' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_GlobalID_ISO31000', 
                    'Matriz GlobalID'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 8 riesgos de GlobalID en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-indigo-200" />
                  <span>Descargar Matriz GlobalID (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Cuentas Virtuales' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Cuentas Virtuales' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Cuentas_Virtuales', 
                    'Matriz Cuentas Virtuales'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 8 riesgos de Cuentas Virtuales en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-teal-200" />
                  <span>Descargar Matriz Cuentas Virtuales (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Adquirencia Global' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Adquirencia Global' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Adquirencia_Global_ISO31000', 
                    'Matriz Adquirencia Global'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 10 riesgos de Adquirencia Global bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-emerald-200" />
                  <span>Descargar Matriz Adquirencia Global (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Payout Swift JPMorgan' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Payout Swift JPMorgan' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Payout_Swift_JPMorgan_ISO31000', 
                    'Matriz Payout Swift JPMorgan'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 9 riesgos de Payout Swift por JPMorgan bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-blue-200" />
                  <span>Descargar Matriz Payout Swift JPMorgan (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Global chats' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Global chats' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Global_Chats_ISO31000', 
                    'Matriz Global chats'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 8 riesgos de Global chats bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-violet-200" />
                  <span>Descargar Matriz Global chats (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Integración CCE - Perú' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Integración CCE - Perú' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Integracion_CCE_Peru_ISO31000', 
                    'Matriz CCE Perú'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 9 riesgos de Integración CCE - Perú bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-rose-200" />
                  <span>Descargar Matriz CCE Perú (Excel)</span>
                </button>
              )}

              {selectedProduct === 'APIB2B(MCP)' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'APIB2B(MCP)' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_APIB2B_MCP_ISO31000', 
                    'Matriz APIB2B (MCP)'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar inmediatamente los 9 riesgos de APIB2B(MCP) bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-indigo-200" />
                  <span>Descargar Matriz APIB2B(MCP) (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Stablecoins' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Stablecoins' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Stablecoins_ISO31000', 
                    'Matriz Stablecoins'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar matriz de riesgos de Stablecoins bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-emerald-200" />
                  <span>Descargar Matriz Stablecoins (Excel)</span>
                </button>
              )}

              {selectedProduct === 'Integración SII Chile' && (
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Integración SII Chile' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Integracion_SII_Chile_ISO31000', 
                    'Matriz SII Chile'
                  )}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all hover:scale-102"
                  title="Descargar matriz de riesgos de Integración SII Chile bajo ISO 31000 en formato Excel"
                >
                  <FileSpreadsheet size={14} className="text-rose-200" />
                  <span>Descargar Matriz SII Chile (Excel)</span>
                </button>
              )}
            </div>
          )}
        </header>

        {/* Banner de Análisis de Riesgos: Adquirencia Global (Figma B2B Deposit Money All & ISO 31000) */}
        {selectedProduct === 'Adquirencia Global' && (
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Globe2 size={13} />
                    Línea de Producto: Adquirencia Global
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Metodología ISO 31000:2018 & ROAM
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider">
                    Figma Node: 2163-11093
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Adquirencia Global — Depósito de Fondos B2B (B2B Deposit Money All)
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Evaluación de riesgos operacionales, tecnológicos, cambiarios y de cumplimiento para el flujo multipaís de recaudación y fondeo corporativo de Global66 según las especificaciones y prototipos UX/UI analizados en Figma.
                </p>

                {/* Subprocesos Clave Analizados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {[
                    { title: '1. Ingesta & Idempotencia', desc: 'Prevención de doble abono en webhooks bancarios (R-ADQ-01)' },
                    { title: '2. Titularidad & UBO', desc: 'Validación anti Third-Party Pay-In y debida diligencia (R-ADQ-02)' },
                    { title: '3. Voucher OCR Forense', desc: 'Detección de comprobantes duplicados o editados (R-ADQ-03)' },
                    { title: '4. Mesa FX & Slippage', desc: 'Ventana de cotización spot y auto-hedging (R-ADQ-04)' },
                    { title: '5. Maker-Checker B2B', desc: 'Doble control corporativo y MFA con FIDO2 (R-ADQ-05)' },
                    { title: '6. Resiliencia & Conciliación', desc: 'Smart routing multipasarela y clearing T+0 (R-ADQ-06 / 07)' }
                  ].map((pill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                      <div className="text-xs font-bold text-emerald-400">{pill.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pill.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setAppMode('risk_events')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-950/40 transition-all hover:scale-102 cursor-pointer border border-red-400/30"
                >
                  <Flame size={15} className="text-amber-300 animate-pulse" />
                  <span>🚨 Ver Evento de Riesgo Asociado ($128,598 USD)</span>
                </button>

                <a
                  href="https://www.figma.com/design/Dimx0duTVEucvGpD3RrpVj/branch/DCNGw2zaxCxWCAIYiWmnAl/B2B_Deposit_Money_All?node-id=2163-11093&p=f&t=Oiqs4Lg1ZB7jVGrw-0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102"
                >
                  <ExternalLink size={15} />
                  <span>Abrir Figma (Node 2163-11093)</span>
                </a>

                <button
                  onClick={() => setAppMode('document_inventory')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <BookOpen size={15} className="text-emerald-400" />
                  <span>Ver Ficha Documental G81-PRO-002</span>
                </button>

                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Adquirencia Global' && r.status !== 'Rechazado'),
                    'Matriz_Riesgos_Adquirencia_Global_ISO31000',
                    'Matriz Adquirencia Global'
                  )}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar Matriz ISO 31000</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Análisis de Riesgos: Global chats (Kit P2P Wow - Mensajería & Pagos Conversacionales) */}
        {selectedProduct === 'Global chats' && (
          <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-sm">💬</span>
                    Línea de Producto: Global chats (Kit P2P Wow)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Metodología ISO 31000:2018 & ROAM
                  </span>
                  <a 
                    href="https://www.figma.com/design/xbODVji6lRwe1Jdc5lIBeH/Global-Chat?node-id=3591-2794&p=f&t=gC20wY61xJ6UoXGk-0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-pink-500/30 transition"
                  >
                    <ExternalLink size={12} />
                    Figma Node: 3591-2794
                  </a>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider">
                    ⚡ WebSockets AWS API Gateway
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                    🔒 Cifrado E2E Signal / libsodium
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Global chats — Nueva Experiencia de Pagos Conversacionales (Kit P2P Wow)
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Evaluación forense de riesgos según la norma internacional <strong className="text-white">ISO 31000</strong> sobre el <strong className="text-purple-300">Documento de Alcance (Escrito por Pedro Pico, Sponsor Tomas Bercovich)</strong>, los prototipos UI/UX en <strong className="text-pink-300">Figma (Node 3591-2794)</strong> y el <strong className="text-amber-300">Modelado de Amenazas de Ciberseguridad & Fraude</strong>.
                </p>

                {/* Pilares Clave Analizados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {[
                    { title: '1. Anti-Phishing & Social Eng.', desc: 'Banners de advertencia en primer contacto y rate-limiting de cobros (R-GCH-01)' },
                    { title: '2. Arquitectura WebSocket AWS', desc: 'Resiliencia ante connection storms, jitter en Flutter y failover REST (R-GCH-02)' },
                    { title: '3. Encriptación E2E Zero-Knowledge', desc: 'Llaves en Secure Enclave (Keychain/Keystore) y auditoría de código (R-GCH-03)' },
                    { title: '4. Privacidad PII & Reforma T&C', desc: 'Adenda legal de exención, consentimiento informado y bloqueo en 1 clic (R-GCH-04)' },
                    { title: '5. Exclusión Estricta KYC 0', desc: 'Cierre de la contradicción del doc: solo clientes 100% verificados (R-GCH-05)' },
                    { title: '6. Idempotencia P2P & CX Clara', desc: 'Idempotency-Key en burbujas, expiración S3 5 min y training de Clara (R-GCH-06 / 07 / 08)' }
                  ].map((pill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                      <div className="text-xs font-bold text-purple-300">{pill.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pill.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setShowGlobalChatsDocsModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-950/40 transition-all hover:scale-102 cursor-pointer border border-purple-400/30"
                >
                  <FileText size={15} className="text-amber-300" />
                  <span>📑 Ver Análisis de Alcance & Amenazas</span>
                </button>

                <a
                  href="https://www.figma.com/design/xbODVji6lRwe1Jdc5lIBeH/Global-Chat?node-id=3591-2794&p=f&t=gC20wY61xJ6UoXGk-0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102"
                >
                  <ExternalLink size={15} />
                  <span>Abrir Figma (Node 3591-2794)</span>
                </a>

                <button
                  onClick={() => setAppMode('action_plans')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102 cursor-pointer"
                >
                  <ClipboardList size={15} />
                  <span>Ver 4 Planes de Acción (ISO 31000)</span>
                </button>

                <button
                  onClick={() => setAppMode('document_inventory')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <BookOpen size={15} className="text-purple-300" />
                  <span>Ver Ficha Documental G81-ALC-004</span>
                </button>

                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Global chats' && r.status !== 'Rechazado'),
                    'Matriz_Riesgos_Global_Chats_ISO31000',
                    'Matriz Global chats'
                  )}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar Matriz ISO 31000 (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Análisis de Riesgos: Payout Swift por JPMorgan */}
        {selectedProduct === 'Payout Swift JPMorgan' && (
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark size={13} />
                    Línea de Producto: Payout Swift por JPMorgan
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Metodología ISO 31000:2018 & ROAM
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider">
                    SWIFT H2H ISO 20022 pain.001 / pacs.008
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                    Fedwire / CHIPS Cut-off 16:00 EST
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Payout Swift por JPMorgan — Arquitectura Host-to-Host (ISO 20022 & Fedwire)
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Evaluación integral de riesgos según la norma internacional <strong className="text-white">ISO 31000</strong> a partir del análisis forense de los dos documentos oficiales del producto: el <strong className="text-blue-300">Documento de Alcance Técnico (Partes I a IX)</strong> y el <strong className="text-amber-300">Business Case (Sección Compliance, FX e IVA local)</strong>.
                </p>

                {/* Pilares Clave Analizados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {[
                    { title: '1. Debida Diligencia & Screening', desc: 'Riesgo sistémico de corresponsalía; bloqueo mandatorio de clientes High Risk (R-JPM-01)' },
                    { title: '2. Criptografía PGP & Canal H2H', desc: 'SFTP seguro, llaves 4096-bit en KMS y control en liberación de pagos (R-JPM-02 / 08)' },
                    { title: '3. Glosa Libre & Países Prohibidos', desc: 'Sanitización NLP de remittance info y bloqueo de países bajo embargo (R-JPM-03)' },
                    { title: '4. Mesa FX & Ahorro Fiscal IVA', desc: 'Fondeo con Banco BICE a 5¢/USD (ahorro ~$30k/año) y exención de IVA (R-JPM-04)' },
                    { title: '5. MFT Asíncrono & Mambu', desc: 'Trazabilidad End-to-End ID, cashcalls tripartitos y devolución al wallet (R-JPM-05)' },
                    { title: '6. Cut-Off 16:00 & Failover NIUM', desc: 'Corte preventivo 15:30 EST, pruebas CAT pacs.008 y flag STP apagado (R-JPM-06 / 07 / 09)' }
                  ].map((pill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                      <div className="text-xs font-bold text-blue-300">{pill.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pill.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setShowJPMorganDocsModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-950/40 transition-all hover:scale-102 cursor-pointer border border-blue-400/30"
                >
                  <FileText size={15} className="text-amber-300" />
                  <span>📑 Explorar Hallazgos de los 2 Documentos</span>
                </button>

                <button
                  onClick={() => setAppMode('action_plans')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102 cursor-pointer"
                >
                  <ClipboardList size={15} />
                  <span>Ver 4 Planes de Acción (ISO 31000)</span>
                </button>

                <button
                  onClick={() => setAppMode('document_inventory')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <BookOpen size={15} className="text-blue-300" />
                  <span>Ver Fichas G81-ESP-003 & G81-CAS-001</span>
                </button>

                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Payout Swift JPMorgan' && r.status !== 'Rechazado'),
                    'Matriz_Riesgos_Payout_Swift_JPMorgan_ISO31000',
                    'Matriz Payout Swift JPMorgan'
                  )}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar Matriz ISO 31000 (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Análisis de Riesgos: Integración CCE - Perú */}
        {selectedProduct === 'Integración CCE - Perú' && (
          <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-sm">🇵🇪</span>
                    Línea de Producto: Integración CCE - Perú
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Metodología ISO 31000:2018 & ROAM
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                    ⚡ BCRP Target Balance 1.7x / 2.4x
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider">
                    🔄 Gmoney Partner Intermediario
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Integración CCE - Perú — Interoperabilidad Inmediata B2C (CCI, Alias, QR & Gmoney BCRP)
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Evaluación forense de riesgos según la norma internacional <strong className="text-white">ISO 31000</strong> a partir del análisis de los dos documentos oficiales: el <strong className="text-rose-300">One Pager de Producto (Interoperabilidad Perú CCE, límites, CX y F&F)</strong> y la <strong className="text-amber-300">Mecánica Operativa de Fondeo CCE (Target Balance, Prefondeo 1.7x/2.4x en BCRP y partner Gmoney)</strong>.
                </p>

                {/* Subprocesos Clave Analizados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {[
                    { title: '1. Saldo Objetivo & BCRP', desc: 'Agotamiento de Target Balance, prefondeo 1.7x/2.4x y ventana 08:15–15:45 (R-CCE-01)' },
                    { title: '2. Dependencia de Gmoney', desc: 'Riesgo de partner intermediario único, sin SLA ni manual operativo formal (R-CCE-02)' },
                    { title: '3. Gate F&F & Teléfono', desc: 'Bug B4-27 en cambio de celular, riesgo de desvío de Alias y biometría activa (R-CCE-03)' },
                    { title: '4. Fee Oculto & Rentabilidad', desc: 'Comisión Panda de S/ 0.80 por dispersión, erosión en bajo ticket y mínimo S/ 5 (R-CCE-04)' },
                    { title: '5. Splitting > S/ 10,000', desc: 'Descalce de topes (S/ 10k PayIn vs S/ 30k red) y rechazos AM02 guiados por Clara (R-CCE-05)' },
                    { title: '6. PLAFT, Mambu & Resiliencia', desc: 'PayIn de terceros, multicapa contable de 4 asientos y Circuit Breaker Dlocal (R-CCE-06 / 07 / 08 / 09)' }
                  ].map((pill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                      <div className="text-xs font-bold text-rose-300">{pill.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pill.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setShowCcePeruDocsModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/40 transition-all hover:scale-102 cursor-pointer border border-rose-400/30"
                >
                  <FileText size={15} className="text-amber-300" />
                  <span>📑 Explorar Documentos (One-Pager & Gmoney)</span>
                </button>

                <button
                  onClick={() => setAppMode('action_plans')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102 cursor-pointer"
                >
                  <ClipboardList size={15} />
                  <span>Ver 4 Planes de Acción (ISO 31000)</span>
                </button>

                <button
                  onClick={() => setAppMode('document_inventory')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <BookOpen size={15} className="text-rose-300" />
                  <span>Ver Fichas GCPE-ONE-001 & GCPE-OPS-002</span>
                </button>

                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Integración CCE - Perú' && r.status !== 'Rechazado'),
                    'Matriz_Riesgos_Integracion_CCE_Peru_ISO31000',
                    'Matriz CCE Perú'
                  )}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar Matriz ISO 31000 (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Análisis de Riesgos: APIB2B(MCP) */}
        {selectedProduct === 'APIB2B(MCP)' && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-sm">🤖</span>
                    Línea de Producto: APIB2B(MCP)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Metodología ISO 31000:2018 & ROAM
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider">
                    ⚡ Model Context Protocol (Anthropic & Agentes)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                    🔒 OAuth 2.0 & Prepare/Confirm (No Sandbox)
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  APIB2B(MCP) — Servidor Model Context Protocol & Infraestructura de Pagos para Agentes de IA
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Evaluación forense de riesgos según la norma internacional <strong className="text-white">ISO 31000</strong> a partir del análisis del <strong className="text-indigo-300">Documento de Alcance (Escrito por Emiliano Cabrales, con revisión de Mauricio Oneto, Seba y Gustavo Lobos)</strong>: modelos de adopción conversacional humano ↔ LLM (Modelo A) y agentes autónomos de clientes B2B (Modelo B: lending, nómina internacional, AP automation, insurtech), mitigación de débitos reales sin sandbox y controles OAuth 2.0.
                </p>

                {/* Subprocesos Clave Analizados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {[
                    { title: '1. Débito Accidental & Test Mode', desc: 'Riesgo de omisión de test_mode sin sandbox y logs periciales (R-MCP-01)' },
                    { title: '2. ApiGw Aislado & Hardening', desc: 'Restricción a API de Payouts y bloqueo de microservicios internos (R-MCP-02)' },
                    { title: '3. Ilusión de IP Anthropic', desc: 'Rango IP público compartido; mitigación con DPoP / mTLS y MFA (R-MCP-03)' },
                    { title: '4. Alucinación de Agentes IA', desc: 'Flujo Prepare/Confirm (TTL 90s), Human-in-the-Loop y Circuit Breaker (R-MCP-04)' },
                    { title: '5. Marketplace & Adenda Legal', desc: 'Modelo A en Claude Directory, Modelo B directo y delimitación T&C (R-MCP-05)' },
                    { title: '6. Cierres Limpios & Soporte L2', desc: 'Aislamiento 100% de test en Mambu/Data Lake y training técnico CX (R-MCP-06 / 07 / 08 / 09)' }
                  ].map((pill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                      <div className="text-xs font-bold text-indigo-300">{pill.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pill.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setShowMcpDocsModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-950/40 transition-all hover:scale-102 cursor-pointer border border-indigo-400/30"
                >
                  <FileText size={15} className="text-amber-300" />
                  <span>📑 Explorar Alcance, Notas & Modelo B</span>
                </button>

                <button
                  onClick={() => setAppMode('action_plans')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102 cursor-pointer"
                >
                  <ClipboardList size={15} />
                  <span>Ver 4 Planes de Acción (ISO 31000)</span>
                </button>

                <button
                  onClick={() => setAppMode('document_inventory')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <BookOpen size={15} className="text-indigo-300" />
                  <span>Ver Ficha G81-ALC-005</span>
                </button>

                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'APIB2B(MCP)' && r.status !== 'Rechazado'),
                    'Matriz_Riesgos_APIB2B_MCP_ISO31000',
                    'Matriz APIB2B (MCP)'
                  )}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar Matriz ISO 31000 (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Análisis de Riesgos: Stablecoins (Auditoría DA 1.0 & DA 2.0 Completada) */}
        {selectedProduct === 'Stablecoins' && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-sm">🪙</span>
                    Línea de Producto: Stablecoins (USDC & USDT)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Auditoría Forense ISO 31000:2018
                  </span>
                  <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    Marco ROAM (9 Riesgos Activos)
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Billeteras Stablecoins (1.0 & 2.0) — Custodia MPC Utila, Yield Pasivo & AML On-Chain
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Análisis exhaustivo de riesgos operacionales, financieros y de ciberseguridad fundamentado en el <strong className="text-white">Documento de Alcance — Billeteras Stablecoins 1.0</strong> (M. Oneto / C. Valle) y el <strong className="text-white">Documento de Alcance — Stablecoins 2.0</strong> (C. Valle). Cubre arquitectura de 4 capas (C1-C4), custodia MPC, integración de Disaster Recovery con Station 70, screening preventivo con Chainalysis KYT, cotizador con kill-switch de de-pegging (50 bps) y exclusión obligatoria de Argentina/Chile.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Custodia & Infra</span>
                    <strong className="text-emerald-300 font-bold">Utila MPC + Station 70</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Yield Pasivo (2.0)</span>
                    <strong className="text-blue-300 font-bold">Omnibus (Buffer C2 2d)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Screening AML</span>
                    <strong className="text-amber-300 font-bold">Chainalysis (C4 Cuarentena)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Red Principal</span>
                    <strong className="text-purple-300 font-bold">Tron (TRX Burning Gas)</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setShowStablecoinsDocsModal(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102 cursor-pointer border border-emerald-400/30"
                >
                  <FileText size={15} />
                  <span>Ver Expediente Técnico (DA 1.0 & 2.0)</span>
                </button>
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Stablecoins' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Stablecoins_ISO31000', 
                    'Matriz Stablecoins'
                  )}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer border border-slate-700"
                >
                  <FileSpreadsheet size={15} />
                  <span>Exportar Matriz a Excel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Análisis de Riesgos: Integración SII Chile (Figma B2B Onboarding All & ISO 31000) */}
        {selectedProduct === 'Integración SII Chile' && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950 text-white rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-sm">🇨🇱</span>
                    Línea de Producto: Integración SII Chile (Onboarding B2B)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Auditoría Forense ISO 31000:2018
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    Marco ROAM (8 Riesgos Específicos)
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Integración SII Chile — Verificación Automatizada B2B, Extracción Tributaria & KYB
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Evaluación de riesgos operacionales, regulatorios y de ciberseguridad fundamentada en el flujo <strong className="text-white">Figma: B2B Onboarding All (node-id: 6168-27582)</strong> para personas jurídicas en Chile (G81 SpA). Cubre captura segura de Clave Secreta del SII con arquitectura Zero-Persistence en KMS, extracción de Carpeta Tributaria F29/F22, validación de personería y poderes de representantes legales frente al RES, screening de giros económicos restringidos y fallback de contingencia documental ante caídas del portal del SII.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Credenciales SII</span>
                    <strong className="text-rose-300 font-bold">Zero-Persistence KMS</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Validación KYB</span>
                    <strong className="text-emerald-300 font-bold">Cruce RES + SII</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Giros Económicos</span>
                    <strong className="text-amber-300 font-bold">100% Reglas Exclusión</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block font-medium">Fallback Operativo</span>
                    <strong className="text-blue-300 font-bold">OCR Carpeta PDF</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => exportToExcel(
                    risks.filter(r => r.product === 'Integración SII Chile' && r.status !== 'Rechazado'), 
                    'Matriz_Riesgos_Integracion_SII_Chile_ISO31000', 
                    'Matriz SII Chile'
                  )}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-102 cursor-pointer border border-rose-400/30"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar Matriz SII Chile (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <div className="w-full flex flex-col gap-8">
            {/* Resumen section occupying full width */}
            <section className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-slate-400" />
                  <span>Resumen: {selectedArea === 'TODOS' ? 'Consolidado General' : selectedArea}</span>
                  {selectedProduct !== 'TODOS' && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black">
                      ⚡ Producto: {selectedProduct}
                    </span>
                  )}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    id: 'total',
                    label: 'Total Riesgos', 
                    value: filteredRisks.length, 
                    color: 'bg-white',
                    risks: filteredRisks
                  },
                  { 
                    id: 'critical',
                    label: 'No Aceptables', 
                    value: filteredRisks.filter(r => r.acceptability.includes('NO ACEPTABLE')).length, 
                    color: 'bg-red-50 text-red-600 border-red-100',
                    risks: filteredRisks.filter(r => r.acceptability.includes('NO ACEPTABLE'))
                  },
                  { 
                    id: 'acceptable',
                    label: 'Aceptables', 
                    value: filteredRisks.filter(r => r.acceptability === 'ACEPTABLE').length, 
                    color: 'bg-green-50 text-green-600 border-green-100',
                    risks: filteredRisks.filter(r => r.acceptability === 'ACEPTABLE')
                  },
                ].map((stat) => (
                  <div key={stat.id + selectedArea} className="flex flex-col gap-2">
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => {
                        if (stat.id === 'total') return;
                        setExpandedStatCard(expandedStatCard === stat.id ? null : stat.id as any);
                      }}
                      className={`p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer transition-all hover:shadow-md ${stat.color} ${expandedStatCard === stat.id ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60">{stat.label}</p>
                        {stat.id !== 'total' && (
                          <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center">
                            <ArrowRight size={12} className={`transition-transform ${expandedStatCard === stat.id ? 'rotate-90' : ''}`} />
                          </div>
                        )}
                      </div>
                      <p className="text-3xl font-black">{stat.value}</p>
                      {stat.id !== 'total' && (
                        <p className="text-[10px] mt-1 opacity-70">
                          {expandedStatCard === stat.id ? 'Cliquear para contraer' : 'Cliquear para ver detalle'}
                        </p>
                      )}
                    </motion.div>

                    {expandedStatCard === stat.id && stat.id === 'critical' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-10 font-sans"
                      >
                        <div className="max-h-[400px] overflow-y-auto w-full">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-20">
                              <tr>
                                <th className="px-3 py-2 font-bold text-slate-500">ID</th>
                                <th className="px-3 py-2 font-bold text-slate-500">Proceso</th>
                                <th className="px-3 py-2 font-bold text-slate-500">Exposición (USD)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {stat.risks.map(r => {
                                const exposure = getExposureUSD(r.impact, r.probability);
                                const level = getRiskLevel(r.impact * r.probability);
                                const severityColor = level === 'EXTREMO' ? 'bg-red-50' : 'bg-orange-50';
                                
                                return (
                                  <tr key={r.id} className={`${severityColor} hover:brightness-95 transition-all`}>
                                    <td className="px-3 py-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setHighlightId(r.id);
                                          setActiveTab('catalog');
                                        }}
                                        className="font-bold text-slate-900 underline decoration-slate-300 hover:decoration-slate-900 transition-all font-mono"
                                      >
                                        {r.id}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-700">
                                      <p className="truncate w-32" title={r.process}>{r.process}</p>
                                    </td>
                                    <td className="px-3 py-2 font-bold text-slate-900 text-right">
                                      ${exposure.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}

                    {expandedStatCard === stat.id && stat.id === 'acceptable' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden z-10"
                      >
                        <div className="max-h-[300px] overflow-y-auto p-3 space-y-2 no-scrollbar w-full">
                          {stat.risks.map(r => (
                            <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50/50 border border-green-100 hover:bg-green-100 transition-colors w-full">
                              <div className="flex flex-col">
                                <button 
                                  onClick={() => {
                                    setHighlightId(r.id);
                                    setActiveTab('catalog');
                                  }}
                                  className="text-[10px] font-bold text-slate-900 underline decoration-slate-300 hover:decoration-slate-900 transition-all text-left font-mono"
                                >
                                  {r.id}
                                </button>
                                <p className="text-[10px] text-slate-500 truncate w-40" title={r.process}>{r.process}</p>
                              </div>
                              <CheckCircle size={12} className="text-green-500" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Heatmap Section - occupying whole width (w-full) */}
            <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 size={20} className="text-slate-400" />
                    <span>Matriz de Riesgos</span>
                    <span className="text-sm font-semibold text-slate-500">
                      ({heatmapMode === 'dual' ? '✨ Vista Dual: Inherente vs Residual' : heatmapMode === 'inherent' ? 'Inherente (Sin Controles)' : 'Residual (Post-Controles)'})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {heatmapMode === 'dual'
                      ? 'Comparativa ejecutiva simultánea de riesgos antes y después de controles para presentación a reguladores y auditoría.'
                      : 'Mapa de calor interactivo 5x5 con escala ISO 31000 y tipografía regulatoria.'}
                  </p>
                </div>
                <div className="flex p-1 bg-slate-100 rounded-xl font-sans border border-slate-200">
                  <button
                    onClick={() => {
                      setHeatmapMode('inherent');
                      setSelectedCoordinate(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${heatmapMode === 'inherent' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🔥 Inherente
                  </button>
                  <button
                    onClick={() => {
                      setHeatmapMode('residual');
                      setSelectedCoordinate(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${heatmapMode === 'residual' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🛡️ Residual
                  </button>
                  <button
                    onClick={() => {
                      setHeatmapMode('dual');
                      setSelectedCoordinate(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${heatmapMode === 'dual' ? 'bg-slate-900 text-amber-300 shadow-sm ring-1 ring-amber-400/50' : 'text-slate-700 hover:text-slate-900 font-extrabold'}`}
                  >
                    ✨ Vista Dual
                  </button>
                </div>
              </div>

              {/* SELECTOR DE PROCESOS MANDATORIOS ARRIBA DE LA MATRIZ DE CALOR */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 w-full">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Selector de Procesos (Matriz y Catálogo):</span>
                <div className="flex flex-wrap gap-1.5 w-full">
                  {areas.map((area) => {
                    const count = area.id === 'TODOS'
                      ? risks.filter(r => r.status !== 'Rechazado').length
                      : risks.filter(r => (r.processArea === area.id || r.secondaryProcessArea === area.id) && r.status !== 'Rechazado').length;

                    return (
                      <button
                        key={area.id}
                        onClick={() => {
                          setSelectedArea(area.id);
                          setSelectedCoordinate(null);
                          setSelectedColorFilter(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                          selectedArea === area.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{area.id === 'TODOS' ? '🚀 TODOS' : area.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                          selectedArea === area.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 w-full">
                <RiskHeatmap 
                  risks={baseFilteredRisks} 
                  mode={heatmapMode} 
                  selectedCoordinate={selectedCoordinate}
                  selectedColorFilter={selectedColorFilter}
                  onModeChange={(m) => {
                    setHeatmapMode(m);
                    setSelectedCoordinate(null);
                  }}
                  onCellClick={(impact, prob, matrixType) => {
                    const activeType = matrixType || (heatmapMode === 'residual' ? 'residual' : 'inherent');
                    if (selectedCoordinate?.impact === impact && selectedCoordinate?.probability === prob && selectedCoordinate?.mode === activeType) {
                      setSelectedCoordinate(null);
                    } else {
                      setSelectedCoordinate({ impact, probability: prob, mode: activeType });
                      setSelectedColorFilter(null);
                    }
                  }}
                  onColorClick={(lvl) => {
                    if (selectedColorFilter === lvl) {
                      setSelectedColorFilter(null);
                    } else {
                      setSelectedColorFilter(lvl);
                      setSelectedCoordinate(null);
                    }
                  }}
                  onResetFilters={() => {
                    setSelectedCoordinate(null);
                    setSelectedColorFilter(null);
                  }}
                />
              </div>
            </section>

            {/* Catálogo de Riesgos - Full Width sequential style */}
            <section className="w-full">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Inbox size={20} className="text-slate-400" />
                  Catálogo de Riesgos en {selectedArea === 'TODOS' ? 'Consolidado Global' : selectedArea} ({filteredRisks.length} Identificados)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
                {filteredRisks.length > 0 ? (
                  filteredRisks
                    .sort((a, b) => (b.impact * b.probability) - (a.impact * a.probability))
                    .map((risk, i) => (
                      <motion.div
                        key={risk.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 1) }}
                        className="w-full bg-white rounded-3xl shadow-sm p-6 border border-slate-200 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group select-none"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3 w-full">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-mono font-bold text-slate-400">{risk.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest w-fit ${
                                risk.processArea === 'Cumplimiento' ? 'bg-blue-50 text-blue-600' :
                                risk.processArea === 'Fraude' ? 'bg-purple-50 text-purple-600' :
                                risk.processArea === 'Ciberseguridad' ? 'bg-cyan-50 text-cyan-600' :
                                risk.processArea === 'Mesa de Dinero' ? 'bg-amber-50 text-amber-600' :
                                risk.processArea === 'Tesorería' ? 'bg-emerald-50 text-emerald-700' :
                                risk.processArea === 'Operaciones' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-slate-50 text-slate-600'
                              }`}>
                                {risk.processArea}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${risk.impact * risk.probability >= 12 ? 'bg-red-100 text-red-600' : 'bg-yellow-105 text-yellow-700'}`}>
                                NR: {risk.impact * risk.probability}
                              </span>
                              {risk.residualImpact && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                                  Res: {risk.residualImpact * risk.residualProbability!}
                                </span>
                              )}
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors leading-tight text-sm">
                            {risk.riskDescription}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{risk.process}</p>
                          
                          {risk.cause && (
                            <div className="mt-2 space-y-1">
                              {risk.cause.split('\n').slice(0, 2).map((c, idx) => (
                                <span key={idx} className="block text-[9px] text-slate-400 font-semibold truncate">
                                  • {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                          <div className="flex gap-2">
                            <div className="text-[9px] font-bold text-slate-400">I: {risk.residualImpact || risk.impact}</div>
                            <div className="text-[9px] font-bold text-slate-400">P: {risk.residualProbability || risk.probability}</div>
                          </div>
                          <button 
                            onClick={() => setActiveTab('proposals')}
                            className="text-[10px] font-bold text-slate-900 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                          >
                            Tratamiento <ArrowRight size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 col-span-full">
                    No hay riesgos registrados en esta área.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : activeTab === 'bcra_led' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <BcraLossEventDatabase 
              events={argentinaLossEvents}
              onAddEvent={(newEvent) => {
                setArgentinaLossEvents(prev => {
                  const updated = [newEvent, ...prev];
                  localStorage.setItem('g66_grc_loss_events_argentina', JSON.stringify(updated));
                  return updated;
                });
              }}
              onUpdateEvent={(id, updates) => {
                setArgentinaLossEvents(prev => {
                  const updated = prev.map(evt => evt.id === id ? { ...evt, ...updates } : evt);
                  localStorage.setItem('g66_grc_loss_events_argentina', JSON.stringify(updated));
                  return updated;
                });
              }}
              onDeleteEvent={(id) => {
                setArgentinaLossEvents(prev => {
                  const updated = prev.filter(evt => evt.id !== id);
                  localStorage.setItem('g66_grc_loss_events_argentina', JSON.stringify(updated));
                  return updated;
                });
              }}
            />
          </motion.div>
        ) : activeTab === 'table' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Matriz de Riesgos Detallada: {selectedProduct !== 'TODOS' ? `${selectedProduct}` : (selectedArea === 'TODOS' ? 'Consolidado General' : selectedArea)}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {filteredRisks.length} registros principales encontrados
                {selectedProduct !== 'TODOS' && ` • Filtro de Producto: ${selectedProduct}`}
                {selectedArea !== 'TODOS' && ` • Área: ${selectedArea}`}
              </p>
            </div>
            <RiskTable 
              risks={filteredRisks} 
              onDownloadGlobalExcel={() => exportToExcel(risks.filter(r => r.status !== 'Rechazado'), 'Matriz_Riesgos_Consolidada_Global66', 'Matriz Consolidada')}
              onDownloadSegmentExcel={() => {
                const prefix = selectedProduct !== 'TODOS' 
                  ? `Matriz_Riesgos_${selectedProduct}` 
                  : `Matriz_Riesgos_${selectedArea === 'TODOS' ? 'Consolidada' : selectedArea}`;
                const title = selectedProduct !== 'TODOS' ? `Matriz ${selectedProduct}` : 'Matriz de Riesgos';
                exportToExcel(filteredRisks, prefix, title);
              }}
              selectedAreaLabel={selectedProduct !== 'TODOS' ? selectedProduct : (areas.find(a => a.id === selectedArea)?.label || 'Consolidado')}
              onUpdateRisk={handleUpdateRisk}
              onDeleteRisk={handleDeleteRisk}
              onNavigateToIntegrator={() => setActiveTab('integrator')}
            />
          </motion.div>
        ) : activeTab === 'evidence' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Carga y Vinculación de Videograbaciones de Operativa</h2>
              <p className="text-slate-500 text-sm font-medium">Extraiga marcas de tiempo de las transcripciones y vincúlelas directamente como evidencia técnica en la Matriz Corporativa.</p>
            </div>
            <VideoEvidenceSimulator 
              risks={risks}
              onNavigateToRisk={(id) => {
                setHighlightId(id);
                setActiveTab('catalog');
              }}
              onAddEvidence={(id, evidenceText) => {
                setRisks(prev => prev.map(r => {
                  if (r.id === id) {
                    return {
                      ...r,
                      cause: `${r.cause}\n📍 Evidencia de Video: ${evidenceText}`
                    };
                  }
                  return r;
                }));
              }}
            />
          </motion.div>
        ) : activeTab === 'catalog' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <RiskCatalog 
              risks={filteredRisks} 
              onAccept={handleAcceptRisk}
              onModify={handleUpdateRisk}
              onReject={handleDeleteRisk}
              highlightId={highlightId}
            />
          </motion.div>
        ) : activeTab === 'company_controls' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <CompanyControlsModule risks={risks} onUpdateRisk={handleUpdateRisk} />
          </motion.div>
        ) : activeTab === 'proposals' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ControlProposalModule risks={risks.filter(r => r.status === 'Aprobado')} onApplyControl={handleApplyControl} />
          </motion.div>
        ) : activeTab === 'strategic_risks' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <StrategicRisksModule 
              risks={risks} 
              onNavigateToRisk={(id) => {
                setHighlightId(id);
                setActiveTab('catalog');
              }}
              onUpdateRisk={handleUpdateRisk}
            />
          </motion.div>
        ) : activeTab === 'action_plans' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ActionPlansModule risks={risks} onUpdateRisk={handleUpdateRisk} />
          </motion.div>
        ) : activeTab === 'reports' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ReportsModule existingRisks={risks} onUpdateRisk={handleUpdateRisk} />
          </motion.div>
        ) : activeTab === 'integrator' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <CloudRiskSheetsIntegrator 
              risks={risks}
              onReplaceRisks={(newRisks) => {
                setRisks(prevRisks => {
                  // Build fresh initial catalog as baseline
                  const fresh = INITIAL_RISKS.map((r, idx) => {
                    const rewrittenDesc = r.riskDescription;
                    const roamStatus = r.roamStatus || (idx % 4 === 0 ? 'Resolved' : idx % 4 === 1 ? 'Owned' : idx % 4 === 2 ? 'Accepted' : 'Mitigated');
                    const roamOwner = r.roamOwner || (
                      r.id === 'R-OPS-001' ? 'Head de Operaciones' :
                      r.processArea === 'Operaciones' ? 'Head de Operaciones' :
                      r.processArea === 'Mesa de Dinero' ? 'Head de Mesa de Dinero' :
                      r.processArea === 'TI' ? 'Head de TI' :
                      r.processArea === 'Cumplimiento' ? 'Compliance Officer' :
                      r.processArea === 'Fraude' ? 'Head de Prevención de Fraude' :
                      r.processArea === 'Ciberseguridad' ? 'CISO / Head de Ciberseguridad' :
                      r.processArea === 'Nuevos Productos' ? 'Head de Producto' :
                      'Líder del Proceso'
                    );

                    let resImpact = r.impact;
                    let resProb = r.probability;

                    if (roamStatus === 'Resolved') {
                      resImpact = 1;
                      resProb = 1;
                    } else if (roamStatus === 'Mitigated') {
                      resImpact = Math.max(1, r.impact - 1);
                      resProb = Math.max(1, r.probability - 2);
                    } else {
                      const controlsList = r.associatedControls || [];
                      const sumImpactRed = controlsList.reduce((sum, c) => sum + c.impactReduction, 0);
                      const sumProbRed = controlsList.reduce((sum, c) => sum + c.probabilityReduction, 0);
                      resImpact = Math.max(1, r.impact - sumImpactRed);
                      resProb = Math.max(1, r.probability - sumProbRed);
                    }

                    return {
                      ...r,
                      riskDescription: rewrittenDesc,
                      roamStatus,
                      roamOwner,
                      residualImpact: resImpact,
                      residualProbability: resProb,
                      acceptability: getAcceptability(resImpact * resProb)
                    };
                  });

                  const mergedMap = new Map<string, Risk>();
                  // 1. Load baseline
                  fresh.forEach(r => mergedMap.set(r.id, r));
                  // 2. Load previous state
                  prevRisks.forEach(r => mergedMap.set(r.id, r));

                  // Merge imported risks safely while protecting approved baseline records
                  newRisks.forEach(nr => {
                    const existing = mergedMap.get(nr.id);
                    if (existing && existing.status === 'Aprobado') {
                      // Preserve core approved fields, update product or controls if enriched
                      mergedMap.set(nr.id, {
                        ...existing,
                        product: nr.product || existing.product,
                        associatedControls: existing.associatedControls?.length ? existing.associatedControls : nr.associatedControls
                      });
                    } else {
                      mergedMap.set(nr.id, nr);
                    }
                  });
                  return Array.from(mergedMap.values());
                });
              }}
              onAddRisk={(newRisk) => {
                const parsedRisk: Risk = {
                  ...newRisk,
                  riskDescription: newRisk.riskDescription,
                  status: 'Aprobado',
                  acceptability: getAcceptability(newRisk.impact * newRisk.probability)
                };
                setRisks(prev => [parsedRisk, ...prev]);
              }}
              onModifyRisk={handleUpdateRisk}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <MethodologyView jurisdiction={jurisdiction} />
          </motion.div>
        )}
          </>
        )}

        {/* Modal Interactivo: Dossier Global chats (Kit P2P Wow - Alcance, Figma & Amenazas) */}
        {showGlobalChatsDocsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              {/* Header Modal */}
              <div className="p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/20 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                      💬 G81-ALC-004 • Documento de Alcance Oficial
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-wider">
                      Figma Node: 3591-2794
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      ISO 31000:2018
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Dossier Forense: Global chats (Kit P2P Wow)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Líder: <strong>Pedro Pico (Head B2C)</strong> • Sponsor: <strong>Tomas Bercovich (CEO)</strong> • Plataforma: <strong>App Mobile B2C (Flutter)</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowGlobalChatsDocsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs Modal */}
              <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
                {[
                  { id: 'alcance', label: '📄 Alcance & Arquitectura', count: 'Partes I - IV' },
                  { id: 'amenazas', label: '🛡️ Modelado Cyber & Comentarios', count: 'Notas [a] - [e]' },
                  { id: 'iso31000', label: '🌐 Matriz ISO 31000 & ROAM', count: '8 Riesgos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setGlobalChatsActiveTab(tab.id as any)}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                      globalChatsActiveTab === tab.id
                        ? 'border-purple-400 text-purple-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Contenido Modal */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed max-h-[60vh]">
                {globalChatsActiveTab === 'alcance' && (
                  <div className="space-y-5">
                    <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-4">
                      <h4 className="text-purple-300 font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Resumen Ejecutivo & Benchmark
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Funcionalidad nativa dentro de la app móvil de Global66 que combina comunicación social con acciones financieras en tiempo real. Inspirada en <strong>Revolut Chat</strong> (67.5% de usuarios sienten incomodidad al hablar de dinero) y <strong>Spotify Messages</strong> (adopción orgánica de 40M usuarios). Permite chatear, enviar stickers/GIFs y ejecutar transferencias o cobros P2P instantáneos sin salir de la conversación.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="text-purple-400">01.</span> Mensajería Base (Parte I)
                        </div>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                          <li>Chat 1:1 entre usuarios por teléfono o username.</li>
                          <li>Texto con emojis unicode, stickers y GIFs (Giphy/Tenor).</li>
                          <li>Estados de mensaje: Enviado, Entregado, Leído.</li>
                          <li>Notificaciones push con Iterable / FCM existente.</li>
                          <li>Nueva sección en la app: Listado de conversaciones activas.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="text-emerald-400">02.</span> Pagos P2P desde el Chat (Parte II)
                        </div>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                          <li>Botón dentro del chat para <strong>Enviar dinero</strong> directamente.</li>
                          <li>Botón para <strong>Cobrar dinero (Request)</strong> al contacto.</li>
                          <li>Soporte multimoneda reutilizando la capa P2P de Global66.</li>
                          <li>P2P registrado como burbuja interactiva con bottomsheet de detalle.</li>
                          <li>Marca específica para transferencias de Global Splits.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="text-blue-400">03.</span> Acciones sobre Transacciones (Parte III)
                        </div>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                          <li>Acceso inmediato al comprobante desde la burbuja.</li>
                          <li>Compartir comprobante como imagen/PDF dentro del chat o hacia fuera.</li>
                          <li>Historial unificado de pagos dentro del hilo de conversación.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="text-amber-400">04.</span> Infraestructura & Seguridad (Parte IV)
                        </div>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                          <li><strong>WebSockets en AWS</strong>: API Gateway WS + MS-Chat + DynamoDB.</li>
                          <li><strong>Encriptación E2E</strong>: Signal Protocol o libsodium. Servidores zero-knowledge.</li>
                          <li>Fotos y archivos encriptados con S3 + KMS.</li>
                          <li>Gestión de reconexión persistente en el cliente Flutter.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3.5 space-y-1.5">
                      <div className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        Fuera del Alcance (Fase 1)
                      </div>
                      <p className="text-xs text-slate-400">
                        No incluye: Chats grupales (&gt;2 personas), mensajes de voz o videollamadas, versión web B2B, búsqueda en historial, sincronización multidispositivo, <strong>soporte para usuarios KYC 0 (sin verificación)</strong>, cambios a la lógica P2P interna ni splits grupales.
                      </p>
                    </div>
                  </div>
                )}

                {globalChatsActiveTab === 'amenazas' && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert size={14} />
                          Comentario [b][c]: Modelado de Amenazas de Ciberseguridad & Fraude
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">Doc de Ciberseguridad</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Ciberseguridad impulsó un modelado formal de amenazas para todo el proyecto apoyado en IA (referenciado en el documento oficial: <a href="https://docs.google.com/document/d/1qCJ_AwLYrB0EvWL3dUT2DwJrRfVvC02w39PuV8MqG3U/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline font-mono">docs.google.com/.../1qCJ_AwLYrB0EvWL3dUT2DwJrRfVvC02w39PuV8MqG3U</a>). El vector de ataque más crítico identificado es el <strong>Phishing e Ingeniería Social en el chat</strong>: actores maliciosos aprovechando la confianza del canal para solicitar dinero falsamente o suplantar soporte técnico.
                      </p>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 text-xs text-slate-400 space-y-1">
                        <div className="font-bold text-white">Salvaguardas Mandatorias Implementadas:</div>
                        <div>• Banners de advertencia contextuados en primer contacto con usuarios desconocidos.</div>
                        <div>• Deshabilitación total de hipervínculos externos en los mensajes para mitigar phishing.</div>
                        <div>• Rate limiting y detección de anomalías en solicitudes masivas de cobro P2P.</div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} />
                        Comentario [e]: Requerimientos de Compliance & Legal (Términos y Condiciones)
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Compliance advirtió la necesidad obligatoria de actualizar los Términos y Condiciones vigentes antes del lanzamiento para explicitar: 1) que otro usuario podrá escribirte y ver tu nombre a partir de tu teléfono/username, 2) que Global66 no se responsabiliza por los mensajes privados intercambiados entre usuarios, y 3) la existencia de controles de bloqueo y reporte de acoso.
                      </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={14} />
                        Comentario [a]: Resolución de la Contradicción de KYC 0 (Pedro Pico)
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        El borrador inicial mencionaba permitir chat a usuarios con "KYC 0 aprobado". Pedro Pico (Líder del proyecto) resolvió la contradicción señalando: <em>"Yo no le habilitaría el chat a alguien que realmente no es cliente nuestro"</em>. Se ratificó que el acceso a Global Chat está restringido exclusivamente a usuarios con KYC 100% verificado, mitigando riesgos de cuentas fantasma y lavado de activos (R-GCH-05).
                      </p>
                    </div>
                  </div>
                )}

                {globalChatsActiveTab === 'iso31000' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-400">
                      Resumen de los <strong>8 riesgos operacionales, tecnológicos y de cumplimiento</strong> identificados para Global chats según la metodología <strong className="text-white">ISO 31000:2018</strong> y clasificados bajo el marco <strong className="text-white">ROAM</strong>:
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { id: 'R-GCH-01', title: 'Fraude por Ingeniería Social, Phishing y Cobros Coercitivos', area: 'Fraude', inh: '5 x 4 = 20 (ALTO)', res: '2 x 1 = 2 (BAJO)', roam: 'Mitigated', owner: 'Head Prevención Fraude & CISO' },
                        { id: 'R-GCH-02', title: 'Vulnerabilidad en Arquitectura WebSocket y Saturación en AWS', area: 'TI', inh: '4 x 4 = 16 (ALTO)', res: '2 x 1 = 2 (BAJO)', roam: 'Mitigated', owner: 'Tech Lead Backend & DevOps' },
                        { id: 'R-GCH-03', title: 'Falla en Encriptación E2E y Fuga de Mensajes Confidenciales', area: 'Ciberseguridad', inh: '5 x 3 = 15 (ALTO)', res: '2 x 1 = 2 (BAJO)', roam: 'Mitigated', owner: 'CISO (Aliro Correa)' },
                        { id: 'R-GCH-04', title: 'Exposición No Autorizada de PII y Contingencia Legal en T&C', area: 'Cumplimiento', inh: '4 x 4 = 16 (ALTO)', res: '2 x 1 = 2 (BAJO)', roam: 'Mitigated', owner: 'Oficial de Cumplimiento & Legal' },
                        { id: 'R-GCH-05', title: 'Infiltración de Cuentas No Verificadas (KYC 0) y Riesgo AML', area: 'Cumplimiento', inh: '5 x 3 = 15 (ALTO)', res: '1 x 1 = 1 (BAJO)', roam: 'Resolved', owner: 'Head Compliance & Pedro Pico' },
                        { id: 'R-GCH-06', title: 'Distribución de Malware en Archivos Multimedia y Adjuntos S3', area: 'Ciberseguridad', inh: '4 x 3 = 12 (MODERADO)', res: '1 x 1 = 1 (BAJO)', roam: 'Mitigated', owner: 'CISO & TL Mobile FE' },
                        { id: 'R-GCH-07', title: 'Desincronización de Estados entre Burbujas y Core P2P', area: 'Operaciones', inh: '4 x 3 = 12 (MODERADO)', res: '1 x 1 = 1 (BAJO)', roam: 'Mitigated', owner: 'Tech Lead Backend & Head Ops' },
                        { id: 'R-GCH-08', title: 'Saturación de CX por Solicitudes Erróneas y Falta de Clara KB', area: 'Operaciones', inh: '3 x 4 = 12 (MODERADO)', res: '1 x 1 = 1 (BAJO)', roam: 'Owned', owner: 'Head CX & Product Owner B2C' }
                      ].map(r => (
                        <div key={r.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-purple-400 font-bold text-xs">{r.id}</span>
                              <span className="text-xs font-semibold text-white">{r.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">{r.area}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Líder ROAM: <span className="text-slate-300 font-medium">{r.owner}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Inh: {r.inh}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Res: {r.res}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">{r.roam}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <a
                  href="https://www.figma.com/design/xbODVji6lRwe1Jdc5lIBeH/Global-Chat?node-id=3591-2794&p=f&t=gC20wY61xJ6UoXGk-0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 transition"
                >
                  <ExternalLink size={13} />
                  <span>Abrir Prototipo en Figma (Node 3591-2794)</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowGlobalChatsDocsModal(false);
                      setAppMode('action_plans');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                  >
                    Ver Planes de Acción (ISO 31000)
                  </button>
                  <button
                    onClick={() => setShowGlobalChatsDocsModal(false)}
                    className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Interactivo: Dossier Payout Swift por JPMorgan */}
        {showJPMorganDocsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-blue-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-500/20 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                      🏛️ G81-ESP-003 & G81-CAS-001
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      ISO 31000:2018
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Dossier Forense: Payout Swift por JPMorgan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Host-to-Host (H2H), ISO 20022 XML (pain.001 / pacs.008), MFT SFTP & PGP Encryption
                  </p>
                </div>
                <button
                  onClick={() => setShowJPMorganDocsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
                {[
                  { id: 'alcance', label: '📄 Documento de Alcance (Partes I - IX)' },
                  { id: 'business_case', label: '💼 Business Case (FX, IVA & Compliance)' },
                  { id: 'iso31000', label: '🌐 Matriz ISO 31000 (9 Riesgos)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setJpmDocsActiveTab(tab.id as any)}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                      jpmDocsActiveTab === tab.id
                        ? 'border-blue-400 text-blue-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh]">
                {jpmDocsActiveTab === 'alcance' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Parte I: Alta de Partner con STP Apagado</strong>
                      Registro en DB de SWIFT_JPM con is_stp_enabled = false para forzar revisión manual en fase piloto (R-JPM-09).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Parte II: Cifrado PGP & Host-to-Host SFTP</strong>
                      Llaves asimétricas 4096-bit en AWS KMS/HSM y hash SHA-256 por archivo para garantizar integridad (R-JPM-02).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Parte III: Estructura XML ISO 20022 & Cut-off 16:00 EST</strong>
                      Lotes pain.001 cada 5 min y comprobantes oficiales pacs.008. Corte preventivo a las 15:30 EST (R-JPM-06, R-JPM-07).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Parte IV & VII: Glosa Libre & Países Prohibidos</strong>
                      Sanitización NLP de remittance info y bloqueo automático de jurisdicciones sancionadas (OFAC) (R-JPM-03).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Parte VII.4: Control en Liberación de Pagos</strong>
                      Re-screening mandatorio de BIC y país en DB antes de generar el XML batch para impedir adulteraciones (R-JPM-08).
                    </div>
                  </div>
                )}

                {jpmDocsActiveTab === 'business_case' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Modelo Compliance Reliant</strong>
                      JPMorgan delega el 100% del screening en Global66 sin filtros preventivos. Se bloquea la ruta a clientes High Risk (R-JPM-01).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Descalce Cambiario FX (Ahorro ~$30,000 USD/año)</strong>
                      Compra de divisas con Banco BICE a 5¢/USD en lugar de 0,35¢ con JPM y fondeo anticipado antes de las 15:30 EST (R-JPM-04).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Optimización Tributaria IVA</strong>
                      Fee de $13 USD facturado con 19% IVA a Global81 SpA. Negociación con JPM NY para facturación sin IVA (R-JPM-04).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">Contingencia Operativa NIUM</strong>
                      Circuit Breaker automático conmutando pagos a NIUM ante caídas de MFT superiores a 15 min (R-JPM-06).
                    </div>
                  </div>
                )}

                {jpmDocsActiveTab === 'iso31000' && (
                  <div className="space-y-2">
                    <div className="text-slate-400 mb-2">9 riesgos aprobados bajo ISO 31000 y marco ROAM.</div>
                    {['R-JPM-01', 'R-JPM-02', 'R-JPM-03', 'R-JPM-04', 'R-JPM-05', 'R-JPM-06', 'R-JPM-07', 'R-JPM-08', 'R-JPM-09'].map(id => (
                      <div key={id} className="p-2.5 bg-slate-800/40 rounded-lg flex items-center justify-between">
                        <span className="font-mono text-blue-400 font-bold">{id}</span>
                        <span className="text-emerald-400 font-bold">ACEPTABLE (Residual Bajo)</span>
                        <span className="text-slate-400">Aprobado</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowJPMorganDocsModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Interactivo: Dossier Integración CCE - Perú */}
        {showCcePeruDocsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 border-b border-rose-500/20 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                      🇵🇪 GCPE-ONE-001 & GCPE-OPS-002
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      ISO 31000:2018 & ROAM
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                      BCRP Target Balance 1.7x / 2.4x
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Dossier Forense: Integración CCE - Perú
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interoperabilidad Inmediata B2C (CCI & Alias), Saldo Objetivo BCRP, Partner Gmoney & Conciliación Mambu
                  </p>
                </div>
                <button
                  onClick={() => setShowCcePeruDocsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
                {[
                  { id: 'onepager', label: '📄 One-Pager de Producto (Límites, Alias & CX)' },
                  { id: 'operaciones', label: '⚙️ Mecánica Operativa (Gmoney & BCRP)' },
                  { id: 'iso31000', label: '🌐 Matriz ISO 31000 (9 Riesgos)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCceDocsActiveTab(tab.id as any)}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                      cceDocsActiveTab === tab.id
                        ? 'border-rose-400 text-rose-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh]">
                {cceDocsActiveTab === 'onepager' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">1. Enrutamiento e Identidad (CCI de 20 dígitos & Alias Móvil)</strong>
                      Generación automática de Código de Cuenta Interbancario (CCI) y Alias vinculado al número telefónico móvil verificado. Soporte interoperable de pagos entrantes (PayIn) y salientes (PayOut) hacia cualquier banco o billetera del ecosistema peruano (BCP, BBVA, Interbank, Scotiabank, Yape, Plin) de forma inmediata 24/7.
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">2. Asimetría de Límites Transaccionales & Splitting Forzado</strong>
                      Límite PayIn por CCI de S/ 10,000 por transacción (con tope de 40 transferencias al día), y límites de Alias/QR de S/ 500 por tx. Se detectó descalce crítico (nota [a]): la red CCE soporta hasta S/ 30,000 (mismo tope otorgado a cuentas no peruanas en PayOut), pero la regla interna trunca PayIn a S/ 10,000, forzando al usuario a realizar splitting y causando rechazos AM02 (R-CCE-05).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">3. Política de Cargas de Terceros & Riesgo de Mulas Financieras</strong>
                      El FAQ de CX estipula explícitamente que se admiten transferencias de terceros no coincidentes con el titular. Esto expone las cuentas virtuales a riesgos PLAFT (lavado de activos, triangulación de estafas). Se establece mitigación obligatoria con scoring que bloquea dispersiones transfronterizas ante múltiples terceros y screening en listas restrictivas (R-CCE-06).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">4. Ciclo de Desafiliación, Bug B4-27 & Secuestro de Línea</strong>
                      Restricción de máximo 2 cambios de número al año. Cada cambio desafilia automáticamente el Alias en CCE. El plan de pruebas F&F identificó como gate de salida bloqueante el bug B4-27 (error de interfaz en app móvil al cambiar teléfono). Además, la nota [c] constató que clientes con cuentas bloqueadas o saldo ínfimo no pueden desafiliar su teléfono, secuestrando su Alias (R-CCE-03, R-CCE-09).
                    </div>
                  </div>
                )}

                {cceDocsActiveTab === 'operaciones' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">1. Mecánica de Target Balance & Prefondeo 1.7x / 2.4x en BCRP</strong>
                      Saldo Objetivo Día calculado por Tesorería. Prefondeo estricto obligatorio de 1.7x en días hábiles y 2.4x antes de fines de semana y feriados. Fondos transferidos a la cuenta corriente BCP de Gmoney (193-1893518-0-42) antes de las 11:30 am para su acreditación en el BCRP antes del mediodía. Ventana rígida de ajuste: 08:15 a 15:45 días hábiles; sin posibilidad de ampliación fuera de horario (R-CCE-01).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">2. Dependencia Crítica de Gmoney & Carencia de Contrato/SLA</strong>
                      Gmoney es el partner técnico intermediario obligado ante la CCE y el BCRP. El One-Pager de Ops constata formalmente la ausencia de manual operativo y SLA contractual firmado por escrito (acuerdos verbales), generando indefensión ante caídas de servicio, disputas por fondos en tránsito o cambios en comisiones (R-CCE-02).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">3. Fee Oculto de Panda (S/ 0.80 PEN) & Destrucción de Margen Unitario</strong>
                      Fee cobrado al cliente de USD 1.00 por PayOut. Las pruebas de dispersión (notas [g][h]) revelaron que Gmoney debita automáticamente una tarifa de S/ 0.80 PEN directamente del saldo en Panda por cada transferencia. En operaciones de bajo ticket (S/ 1 a S/ 5 Soles), esto genera margen negativo. Se mitiga implementando monto mínimo de envío de S/ 5 Soles (R-CCE-04).
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">4. Asientos Mambu (4 Movimientos), CashCalls & Circuit Breaker Dlocal</strong>
                      Cada dispersión genera 4 movimientos contables en Mambu (origen, espejo 81 IN, espejo 81 OUT GMONEY_CCE, fees) con identificadores desvinculados. Las órdenes en PENDING_RESPONSE se limpian automáticamente cada 15 min (R-CCE-07). Ante caídas o degradación del canal CCE superior a 30s, el Circuit Breaker conmuta de forma transparente hacia Dlocal (R-CCE-08).
                    </div>
                  </div>
                )}

                {cceDocsActiveTab === 'iso31000' && (
                  <div className="space-y-2">
                    <div className="text-slate-400 mb-2 font-medium">9 riesgos identificados, mitigados y aprobados según ISO 31000:2018 y metodología ROAM:</div>
                    {[
                      { id: 'R-CCE-01', area: 'Tesorería', title: 'Iliquidez Operativa y Agotamiento de Target Balance en BCRP (Prefondeo 1.7x/2.4x)', roam: 'Mitigated', owner: 'Carlos Mendoza' },
                      { id: 'R-CCE-02', area: 'Estratégico / Legal', title: 'Dependencia Crítica de Gmoney y Ausencia de SLA/Manual Contractual Formal', roam: 'Mitigated', owner: 'Benjamín Herrera' },
                      { id: 'R-CCE-03', area: 'TI / Ciberseguridad', title: 'Falla en Desafiliación, Bug B4-27 de Cambio de Teléfono y Secuestro de Alias', roam: 'Mitigated', owner: 'Jonathan Castañeda' },
                      { id: 'R-CCE-04', area: 'Finanzas', title: 'Fuga de Margen y Descalce por Comisión Oculta de Panda Gmoney (S/ 0.80 PEN)', roam: 'Owned', owner: 'Diego García Lira' },
                      { id: 'R-CCE-05', area: 'Operaciones / CX', title: 'Asimetría en Umbrales Transaccionales, Rechazos y Splitting de Pagos (> S/ 10k)', roam: 'Mitigated', owner: 'Benjamín Herrera' },
                      { id: 'R-CCE-06', area: 'Cumplimiento / Fraude', title: 'Lavado de Activos y Triangulación por Depósitos de Terceros en Cuentas Virtuales', roam: 'Mitigated', owner: 'María Gutiérrez' },
                      { id: 'R-CCE-07', area: 'Conciliaciones', title: 'Desincronización Multicapa en Mambu (4 Asientos), Cuentas Espejo 81 y Panda', roam: 'Mitigated', owner: 'Head de Conciliaciones' },
                      { id: 'R-CCE-08', area: 'Continuidad / SRE', title: 'Caída de Red Inmediata 24/7 y Falla de Conmutación Automática (Failover) a Dlocal', roam: 'Mitigated', owner: 'Alejandro Delgadillo' },
                      { id: 'R-CCE-09', area: 'Cumplimiento / CX', title: 'Imposibilidad de Desafiliación en Cuentas Bloqueadas o Cierre Voluntario (Nota [c])', roam: 'Mitigated', owner: 'Francisca Solar' }
                    ].map(r => (
                      <div key={r.id} className="p-2.5 bg-slate-800/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-700/40">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-rose-400 font-bold">{r.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-bold">{r.area}</span>
                          <span className="text-white text-xs font-medium">{r.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">ACEPTABLE</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-bold">ROAM: {r.roam} ({r.owner})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setShowCcePeruDocsModal(false);
                    setAppMode('action_plans');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardList size={14} />
                  <span>Ver 4 Planes de Acción (ISO 31000)</span>
                </button>
                <button
                  onClick={() => setShowCcePeruDocsModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Interactivo: Dossier APIB2B(MCP) */}
        {showMcpDocsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/20 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                      🤖 G81-ALC-005 & API Payouts
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      ISO 31000:2018 & ROAM
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                      Model Context Protocol (Anthropic)
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Dossier Forense: APIB2B(MCP) — Servidor MCP & Pagos Autónomos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Model Context Protocol, OAuth 2.0, Flujo Prepare/Confirm (2 Pasos), Test Mode en Producción y Gobernanza de Agentes IA
                  </p>
                </div>
                <button
                  onClick={() => setShowMcpDocsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
                {[
                  { id: 'alcance', label: '📄 Alcance Técnico (Modelos A & B, Test Mode)' },
                  { id: 'seguridad_agentes', label: '🔒 Seguridad & Gobernanza de Agentes' },
                  { id: 'iso31000', label: '🌐 Matriz ISO 31000 (9 Riesgos)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMcpDocsActiveTab(tab.id as any)}
                    className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                      mcpDocsActiveTab === tab.id
                        ? 'border-indigo-400 text-indigo-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh]">
                {mcpDocsActiveTab === 'alcance' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">1. Concepto MCP & Doble Modelo de Adopción (Modelos A y B)</strong>
                      Fachada conversacional sobre la API Transaccional de Payouts que no construye lógica de negocio nueva, sino que expone endpoints a clientes LLM. 
                      <ul className="mt-1 list-disc list-inside space-y-1 text-slate-400">
                        <li><strong>Modelo A (Humano ↔ LLM)</strong>: Operadores conversan con Claude Desktop / claude.ai bajo OAuth 3-legged con pantalla interactiva de consentimiento (reportería para CFO, conciliación de CSV de SAP/Workday, carga masiva de nómina).</li>
                        <li><strong>Modelo B (Agentes Propios del Cliente)</strong>: Conexión M2M directa sin humano en el loop vía Client Credentials (Claude SDK, LangChain, n8n, OpenAI) para 8 verticales de alta escala: lending, nómina contractors, AP automation, marketplace payouts, cripto off-ramp, creators, claims insurtech y tesorería cross-border.</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">2. Decisión Estratégica: No Construir Sandbox (Test Mode en Prod)</strong>
                      Se descarta el sandbox separado para evitar mantener entornos duplicados y bases de datos paralelas. En su lugar, el endpoint de producción acepta <code className="bg-slate-700 px-1 py-0.5 rounded text-amber-300">test_mode: true</code>: ejecuta validaciones reales (schema, KYC, quote en <code className="text-slate-300">ms.quote</code>), pero NO debita fondos de la wallet, NO envía órdenes al partner de payout, devuelve un <code className="text-slate-300">transaction_id</code> ficticio con prefijo <code className="text-emerald-300">TEST-</code> y simula webhooks.
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">3. Flujo Forzoso en Dos Fases: Prepare & Confirm</strong>
                      Separación obligatoria de la transacción en dos endpoints:
                      <ul className="mt-1 list-disc list-inside space-y-1 text-slate-400">
                        <li><code className="text-indigo-300">POST /companies/&#123;id&#125;/pretransactions</code>: calcula fee, FX rate, valida saldo y emite un pretransaction_id con TTL de 60–120 segundos sin debitar.</li>
                        <li><code className="text-indigo-300">POST /companies/&#123;id&#125;/transactions/confirm</code>: ejecuta el débito real y la orden a SQS.</li>
                        <li><code className="text-indigo-300">POST /companies/&#123;id&#125;/pretransactions/&#123;id&#125;/cancel</code>: cancelación explícita para evitar registros huérfanos.</li>
                      </ul>
                      Esta separación es mandatoria debido al carácter no determinista de los LLMs y el riesgo de race conditions en agentes autónomos.
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">4. Exclusiones Explícitas del Alcance</strong>
                      Quedan estrictamente excluidas del MCP las acciones administrativas sensibles (crear wallets, rotar Secret Keys, configurar listas blancas de IP, gestión de usuarios B2B y límites de operación), así como el onboarding KYC/KYB inicial, las cuales siguen viviendo exclusivamente en la Webapp B2B.
                    </div>
                  </div>
                )}

                {mcpDocsActiveTab === 'seguridad_agentes' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">1. Hardening Perimetral: ApiGw Exclusivo & Bloqueo de Microservicios Internos</strong>
                      En respuesta a las observaciones críticas de Mauricio Oneto (notas [b][c][e]), se prohíbe terminantemente la exposición directa de microservicios internos concebidos solo para la Webapp. El MCP corre detrás de su propio ApiGw (<code className="text-indigo-300">mcp-api.global66.com</code>) consumiendo exclusivamente el contrato público de la API de Payouts con WAF y rate limiting específico.
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">2. Vulnerabilidad en Whitelist de Anthropic (Nota [h])</strong>
                      Los rangos IP de Anthropic son compartidos por millones de usuarios a nivel mundial y no garantizan aislamiento de inquilino. Se refuerza la seguridad con DPoP (RFC 9449) que vincula tokens a claves criptográficas locales, MFA interactivo en Modelo A e IP fija de servidor dedicada para el Modelo B.
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">3. Prevención de Débitos Accidentales en Test Mode (Notas Seba [i][j][k])</strong>
                      Para impedir pérdidas si un cliente u operador omite el flag <code className="text-amber-300">test_mode: true</code>, se implementan llaves con prefijo de pruebas que fuerzan la simulación en backend, y se generan registros periciales inmutables de auditoría en S3 con hash de cada payload para respaldo legal y de CX.
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <strong className="text-white block mb-1">4. Delimitación Contractual & Marketplace de Claude (Notas [f][g])</strong>
                      El Connectors Directory de Anthropic solo acepta Modelo A (interactivo). El Modelo B (Client Credentials) se distribuye como integración directa. Se formaliza una Adenda Legal en los T&C B2B que establece la responsabilidad íntegra del cliente sobre las acciones de sus agentes y prompts.
                    </div>
                  </div>
                )}

                {mcpDocsActiveTab === 'iso31000' && (
                  <div className="space-y-2">
                    <div className="text-slate-400 mb-2 font-medium">9 riesgos operacionales, tecnológicos y legales identificados y aprobados según ISO 31000:2018 y marco ROAM:</div>
                    {[
                      { id: 'R-MCP-01', area: 'Operaciones / Finanzas', title: 'Débito Accidental de Fondos Reales por Omisión de test_mode y Falta de Sandbox Separado', roam: 'Mitigated', owner: 'Diego García Lira' },
                      { id: 'R-MCP-02', area: 'Ciberseguridad / TI', title: 'Exposición Insegura de Microservicios Internos sin Hardening (Notas Mau)', roam: 'Mitigated', owner: 'Aliro Correa / Mauricio Oneto' },
                      { id: 'R-MCP-03', area: 'Ciberseguridad / Fraude', title: 'Falsa Seguridad en Lista Blanca de IPs Compartidas de Anthropic (Nota [h])', roam: 'Mitigated', owner: 'Aliro Correa' },
                      { id: 'R-MCP-04', area: 'Fraude / Operaciones', title: 'Ejecución Descontrolada o Alucinación en Agentes Autónomos de IA (Modelo B)', roam: 'Mitigated', owner: 'Emiliano Cabrales' },
                      { id: 'R-MCP-05', area: 'Legal / Cumplimiento', title: 'Rechazo en Marketplaces de LLMs y Vacíos Contractuales de Responsabilidad (Nota [g])', roam: 'Owned', owner: 'Head of Legal Regional' },
                      { id: 'R-MCP-06', area: 'Finanzas / Conciliaciones', title: 'Contaminación de Reportes Financieros y Cierres Contables por Transacciones de Test', roam: 'Mitigated', owner: 'Diego García Lira' },
                      { id: 'R-MCP-07', area: 'Continuidad / TI', title: 'Denegación de Servicio y Saturación por Ráfagas Conversacionales o Bucles de Agentes', roam: 'Mitigated', owner: 'Lead SRE / DevOps' },
                      { id: 'R-MCP-08', area: 'CX / Operaciones', title: 'Saturación y Desalineación del Equipo CX B2B ante Tickets de Prompt Engineering (Notas [l][m])', roam: 'Mitigated', owner: 'Gustavo Lobos' },
                      { id: 'R-MCP-09', area: 'Cumplimiento / Fraude', title: 'Riesgo PLAFT por Fragmentación y Pitufeo en Agentes de Alta Velocidad (create_beneficiary)', roam: 'Mitigated', owner: 'María Gutiérrez' }
                    ].map(r => (
                      <div key={r.id} className="p-2.5 bg-slate-800/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-700/40">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-400 font-bold">{r.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-bold">{r.area}</span>
                          <span className="text-white text-xs font-medium">{r.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">ACEPTABLE</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">ROAM: {r.roam} ({r.owner})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setShowMcpDocsModal(false);
                    setAppMode('action_plans');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardList size={14} />
                  <span>Ver 4 Planes de Acción (ISO 31000)</span>
                </button>
                <button
                  onClick={() => setShowMcpDocsModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Interactivo: Guía de Documentación y Expediente Stablecoins (DA 1.0 & DA 2.0) */}
        {showStablecoinsDocsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-500/20 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      🪙 Stablecoins (USDC & USDT)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                      G81-ALC-001 & G81-ALC-002
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black uppercase tracking-wider">
                      ISO 31000:2018
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Expediente Técnico Auditado: Billeteras Stablecoins (1.0 & 2.0)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Documentos de alcance provistos por el usuario • Autores: Maurizio Oneto & Cristóbal Valle
                  </p>
                </div>
                <button
                  onClick={() => setShowStablecoinsDocsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-navegación por tabs */}
              <div className="px-6 pt-3 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2">
                {[
                  { id: 'alcance1', label: 'DA 1.0 (Custodia & Infra)', icon: '🏛️' },
                  { id: 'alcance2', label: 'DA 2.0 (Yield & AML On-Chain)', icon: '⚡' },
                  { id: 'iso31000', label: 'Matriz ISO 31000 (9 Riesgos)', icon: '🛡️' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStablecoinsDocsActiveTab(tab.id as any)}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      stablecoinsDocsActiveTab === tab.id
                        ? 'bg-slate-800 text-emerald-300 border-t-2 border-emerald-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh]">
                {stablecoinsDocsActiveTab === 'alcance1' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 text-sm">Resumen Ejecutivo — Billeteras Stablecoins 1.0</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">G81-ALC-001</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Despliegue de infraestructura propia de custodia de stablecoins (USDT y USDC) mediante integración con el partner <strong className="text-white">Utila</strong> (MPC). Global66 asume la custodia directa de los fondos y llaves criptográficas. Habilitado para pay-in, pay-out, exchange y billetera (holdear activos).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1.5">
                        <strong className="text-emerald-300 block font-bold text-xs">Arquitectura de Wallets en 4 Capas</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>C1 (Deposit Addresses):</strong> Direcciones estáticas únicas por cliente y red (EVM/TRX/SOL). Fondos solo permanecen hasta el swept automático.</li>
                          <li><strong>C2 (Omnibus In/Out):</strong> Billetera operativa central que despacha payouts. Saldo mínimo pre-fondeado de 2 días de out.</li>
                          <li><strong>C3 (Treasury Vault):</strong> Concentra reservas corporativas. Whitelisting estricto y gobernanza de máxima seguridad.</li>
                          <li><strong>C4 (Revisión Transitoria):</strong> Aislamiento de fondos problemáticos de C1 sin tocar C2 para evitar contagio del pool.</li>
                        </ul>
                      </div>

                      <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1.5">
                        <strong className="text-purple-300 block font-bold text-xs">Quórums de Aprobación & Disaster Recovery</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>&lt; 250,000 USD:</strong> Despacho automático vía co-signer MPC RTP.</li>
                          <li><strong>250,000 – 750,000 USD:</strong> 1 aprobación requerida (Head of Ops).</li>
                          <li><strong>&gt; 750,000 USD:</strong> Quórum multi-firma 2 de 3 (Head of Ops + CFO).</li>
                          <li><strong>Disaster Recovery:</strong> Integración de shards MPC con Station 70 para mitigar pérdida de fragmentos de clave privada.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1.5">
                      <strong className="text-amber-300 block font-bold text-xs">Gestión de Gas Station & Red Tron</strong>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Tron representa el 50% de las transacciones y 66% del volumen de pay-in. Se adopta un modelo de Gas Station (G66 paga los gas fees abstrayendo la complejidad para el usuario) con pre-fondeo de TRX, ETH, SOL y POL con buffer mínimo de 15 días: <em>Volumen de movimientos × gas fee estimado × 15 días</em>. Lógica de reintentos en minutos 0, 15, 30 y 45 ante picos de congestión.
                      </p>
                    </div>
                  </div>
                )}

                {stablecoinsDocsActiveTab === 'alcance2' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-300 text-sm">Resumen Ejecutivo — Stablecoins 2.0</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">G81-ALC-002</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Consolidación operacional de v1.0 e incorporación del núcleo de 5 módulos must-have: M3 Pricing (costo diferenciado por red), M5 Yield (rendimiento pasivo omnibus), M8 AML Blockchain (Chainalysis KYT), M9 Tron Sponsored Transfers (quema directa de TRX) y M11 Mercados Regulados (sucursales dedicadas para Chile y Argentina).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1.5">
                        <strong className="text-blue-300 block font-bold text-xs">M5 Yield Pasivo (Omnibus Staking)</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>Segmento B2C:</strong> Start 2.5%, Pro 3.5%, Ultra 4.5% anual. Balance mínimo de 100 USDC/USDT y tope mensual de 2,000 USD.</li>
                          <li><strong>Segmento B2B:</strong> 3.0% anual sobre mínimo saldo de últimos 7 días.</li>
                          <li><strong>Liquidez Comprometida:</strong> Tesorería administra las colocaciones; los fondos del cliente deben estar 100% disponibles a la vista con buffer C2 de 2 días.</li>
                        </ul>
                      </div>

                      <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1.5">
                        <strong className="text-amber-300 block font-bold text-xs">M8 AML Blockchain (Chainalysis KYT)</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                          <li><strong>Incoming Screening:</strong> Evaluación en el webhook de pay-in antes de acreditar en Mambu. Semáforo: Allow / Alert / Deny.</li>
                          <li><strong>Outgoing Screening:</strong> Evaluación en endpoint de direcciones antes de instruir transferencias a Utila.</li>
                          <li><strong>Detección On-Chain:</strong> Sanciones OFAC, mixers (Tornado Cash), hackeos, darknet y patrones sospechosos. Desvío a C4.</li>
                          <li><strong>Blacklist Interno:</strong> Sincronización automática de direcciones de riesgo severo.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1.5">
                      <strong className="text-emerald-300 block font-bold text-xs">M3 Pricing por Red & Kill-Switch de De-Pegging</strong>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Cobro fijo diferenciado: Tron $5 USDT, Ethereum $3, Base $3, Polygon $3, Solana $3. Se parametriza la regla de <strong>threshold_percent con decimales</strong>: rango de máximo 50 bps de diferencia vs paridad 1:1; si la diferencia supera 0.995 se suspende la cotización y se advierte al usuario con link a CoinGecko.
                      </p>
                    </div>
                  </div>
                )}

                {stablecoinsDocsActiveTab === 'iso31000' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 text-sm">Matriz Consolidada ISO 31000:2018 (9 Riesgos Auditados)</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">9 / 9 Aprobados</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Cada riesgo cuenta con causalidad, eventos de materialización, consecuencias e impacto operacional/financiero/legal extraídos textualmente de los documentos DA 1.0 y DA 2.0 provistos.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: 'R-STC-001', title: 'Pérdida/Compromiso de Shards MPC (Custodia)', area: 'Ciberseguridad', roam: 'Mitigated', owner: 'CISO / Head Ciberseguridad' },
                        { id: 'R-STC-002', title: 'Screening AML On-Chain & Cuarentena C4 (Chainalysis)', area: 'Cumplimiento', roam: 'Mitigated', owner: 'Compliance Officer & Fraude' },
                        { id: 'R-STC-003', title: 'Descalce de Liquidez en Staking de Yield Pasivo', area: 'Tesorería', roam: 'Owned', owner: 'Head de Tesorería' },
                        { id: 'R-STC-004', title: 'Agotamiento de Gas Fee / TRX en Red Tron', area: 'Operaciones', roam: 'Mitigated', owner: 'Head de Operaciones' },
                        { id: 'R-STC-005', title: 'Desanclaje de Paridad FX & Kill-Switch 50 bps (CoinGecko)', area: 'Mesa de Dinero', roam: 'Resolved', owner: 'Head Mesa de Dinero' },
                        { id: 'R-STC-006', title: 'Gobernanza de Quórums en Payouts C2/C3 (>750k 2 de 3)', area: 'Operaciones', roam: 'Mitigated', owner: 'Head Ops & CFO' },
                        { id: 'R-STC-007', title: 'Exclusión Regulatoria Territorial (Argentina & Chile)', area: 'Legal', roam: 'Owned', owner: 'Compliance & Legal Director' },
                        { id: 'R-STC-008', title: 'Atomicidad en Creación de Cuentas Mambu G81 / Utila', area: 'TI', roam: 'Mitigated', owner: 'Head TI / Arquitectura' },
                        { id: 'R-STC-009', title: 'Coexistencia y Apagado Definitivo de Bridge (30 días)', area: 'Operaciones', roam: 'Resolved', owner: 'Head Ops & Conciliaciones' }
                      ].map((item, idx) => (
                        <div key={item.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400 font-bold">{item.id}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-medium">{item.area}</span>
                              </div>
                              <span className="text-xs font-bold text-white block">{item.title}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.roam === 'Resolved' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30' :
                              item.roam === 'Owned' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
                              'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                            }`}>
                              ROAM: {item.roam}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.owner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setShowStablecoinsDocsModal(false);
                    setAppMode('action_plans');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardList size={14} />
                  <span>Ver 6 Planes de Acción (ROAM)</span>
                </button>
                <button
                  onClick={() => setShowStablecoinsDocsModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-400 font-medium">
          {appMode === 'ti_risks' 
            ? '© 2026 ISO 27001 Auditoría de Riesgos de TI & Ciberseguridad • Global66 Regional' 
            : '© 2026 ISO 31000 Risk Auditor Tool • Auditoría de Operaciones y Mesa de Dinero'}
        </p>
      </footer>
    </div>
  );
}
