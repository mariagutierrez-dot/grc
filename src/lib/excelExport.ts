import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Risk, getRiskLevel, FraudulentTransactionRecord } from '../types';
import { resolveTaxonomyForRisk } from './processTaxonomyHelper';

export const exportToExcel = async (
  risks: Risk[], 
  filenamePrefix: string = 'Matriz_Riesgos_Regional',
  worksheetTitle: string = 'Matriz de Riesgos'
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetTitle.slice(0, 31));

  // Define columns based on ISO 31000 GRC requirements with Regional Taxonomy
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 12 },
    { header: 'Macroproceso', key: 'macrocategory', width: 22 },
    { header: 'Proceso Oficial (#ID)', key: 'taxonomyProcess', width: 28 },
    { header: 'Subproceso N2', key: 'subproceso', width: 28 },
    { header: 'Área Operativa', key: 'area', width: 18 },
    { header: 'Línea de Producto', key: 'product', width: 18 },
    { header: 'Actividad / Paso', key: 'process', width: 30 },
    { header: 'Riesgo Identificado', key: 'riskDescription', width: 45 },
    { header: 'Causa (Individual)', key: 'cause', width: 40 },
    { header: 'Control Asociado (Sugerido por Causa)', key: 'associatedControl', width: 45 },
    { header: 'Impacto / Probabilidad', key: 'impactProb', width: 18 },
    { header: 'Valoración (Inh)', key: 'valuation', width: 18 },
    { header: 'Gestión ROAM', key: 'roam', width: 22 },
    { header: 'Índice de Control (IC)', key: 'controlIndex', width: 18 },
    { header: 'Riesgo Residual (I/P)', key: 'residualRisk', width: 20 },
    { header: 'Aceptabilidad', key: 'acceptability', width: 28 },
    { header: 'Acciones de Tratamiento', key: 'actions', width: 45 },
    { header: 'Control Mitigante / Implementado', key: 'documentControl', width: 45 },
  ];

  // Colors for styling based on risk appetite rules (pastel fillings + text)
  const getStyleForLevel = (text: string) => {
    const cleanText = text.toUpperCase();
    if (cleanText.includes('EXTREMO')) {
      return { bg: 'FFfee2e2', fg: 'FF991b1b' }; // Soft red background, deep red text
    }
    if (cleanText.includes('ALTO')) {
      return { bg: 'FFffedd5', fg: 'FFc2410c' }; // Soft orange background, deep orange text
    }
    if (cleanText.includes('MODERADO')) {
      return { bg: 'FFfef9c3', fg: 'FF854d0e' }; // Soft yellow background, deep dark yellow text
    }
    if (cleanText.includes('BAJO')) {
      return { bg: 'FFdcfce7', fg: 'FF166534' }; // Soft green background, deep green text
    }
    return null;
  };

  const getStyleForAcceptability = (text: string) => {
    if (text.includes('NO ACEPTABLE')) {
      return { bg: 'FFfee2e2', fg: 'FF991b1b' }; // Soft red matching
    }
    if (text.includes('ACEPTABLE')) {
      return { bg: 'FFdcfce7', fg: 'FF166534' }; // Soft green matching
    }
    return null;
  };

  // Add rows breaking down each risk's causes dynamically
  risks.forEach((risk) => {
    // Split causes by newline, bullet points, or list formatting
    const rawCauses = (risk.cause || '').split('\n').map(c => c.trim()).filter(Boolean);
    const rawControls = (risk.suggestedControl || '').split('\n').map(c => c.trim()).filter(Boolean);

    // Standardize cause list
    const causes = rawCauses.length > 0 
      ? rawCauses.map(c => c.replace(/^[-•\d.\s]+/, '')) 
      : ['Sin causa registrada en el módulo'];

    // Standardize control list
    const controls = rawControls.length > 0 
      ? rawControls.map(c => c.replace(/^[-•\d.\s]+/, '')) 
      : [];

    const rowCount = causes.length;

    // Get matching treatment plans from Browser localStorage
    let actionsText = '';
    if (typeof window !== 'undefined') {
      try {
        const savedPlans = localStorage.getItem('g66_treatment_plans');
        if (savedPlans) {
          const plansList = JSON.parse(savedPlans);
          const matchedPlans = plansList.filter((p: any) => p.riskId === risk.id);
          if (matchedPlans.length > 0) {
            actionsText = matchedPlans.map((p: any) => 
              `[${p.status}] ${p.tasks} (Responsable: ${p.responsible}, Fecha: ${p.targetDate}, Avance: ${p.progress}%)`
            ).join(' | ');
          }
        }
      } catch (e) {
        console.error('Error fetching treatment plans for excel export:', e);
      }
    }

    if (!actionsText) {
      if (risk.acceptability.includes('NO ACEPTABLE')) {
        actionsText = 'Requiere registrar Plan de Acción urgente en el Módulo de Tratamiento (Metodología ROAM)';
      } else {
        actionsText = 'Monitoreo continuo según directrices estándar de GRC';
      }
    }

    // Populate rows
    for (let i = 0; i < rowCount; i++) {
      const causeText = causes[i];
      let controlText = controls[i] || '';

      // Suggest specific control based on the cause's content or associated controls
      if (!controlText) {
        if (risk.associatedControls && risk.associatedControls[i]) {
          controlText = `[${risk.associatedControls[i].id} - ${risk.associatedControls[i].type}] ${risk.associatedControls[i].description}`;
        } else if (risk.suggestedControl) {
          controlText = risk.suggestedControl;
        } else {
          const lowerCause = causeText.toLowerCase();
          if (lowerCause.includes('manual') || lowerCause.includes('excel') || lowerCause.includes('pdf') || lowerCause.includes('digitación') || lowerCause.includes('cartol') || lowerCause.includes('coordinación manual')) {
            controlText = 'Establecer automatización mediante integración directa de APIs o pasarela Host-to-Host (H2H) eliminando carga manual de archivos.';
          } else if (lowerCause.includes('acceso') || lowerCause.includes('seguridad') || lowerCause.includes('token') || lowerCause.includes('credencial') || lowerCause.includes('privilegio') || lowerCause.includes('admin')) {
            controlText = 'Implementar control riguroso de menor privilegio (RBAC), bóvedas de contraseñas de uso personal y tokens dinámicos con aprobación multifactor (MFA/mTLS).';
          } else if (lowerCause.includes('lavado') || lowerCause.includes('fraude') || lowerCause.includes('monitoreo') || lowerCause.includes('alertas') || lowerCause.includes('kyt') || lowerCause.includes('pitufeo')) {
            controlText = 'Calibrar reglas automatizadas de velocidad y comportamiento en tiempo real con disparadores de suspensión preventiva inmediata en el motor KYT.';
          } else if (lowerCause.includes('capacitaci') || lowerCause.includes('personal') || lowerCause.includes('error humano') || lowerCause.includes('ineficiencia')) {
            controlText = 'Diseñar capacitaciones mandatorias de Compliance y concientización técnica de riesgo operacional con exámenes periódicos de idoneidad.';
          } else if (lowerCause.includes('banco') || lowerCause.includes('Austro') || lowerCause.includes('Guayaquil') || lowerCause.includes('plataformas web')) {
            controlText = 'Estandarizar acuerdos de nivel de servicio (SLAs) con corresponsales bancarios clave e integrar visualizadores de liquidez unificados.';
          } else {
            // Use overall suggested control if available, otherwise general recommendation
            controlText = 'Ejecutar plan de control preventivo y conciliación periódica semanal.';
          }
        }
      }

      const score = risk.impact * risk.probability;
      const level = getRiskLevel(score);

      const resScore = risk.residualImpact && risk.residualProbability ? risk.residualImpact * risk.residualProbability : null;
      const resLevel = resScore ? getRiskLevel(resScore) : null;

      // Use suggestedControl or documentControl
      const finalControlText = controlText;
      const tax = resolveTaxonomyForRisk(risk);

      worksheet.addRow({
        id: risk.id,
        macrocategory: tax.macrocategory,
        taxonomyProcess: `#${tax.taxonomyProcessId} ${tax.taxonomyProcessName}`,
        subproceso: tax.subproceso,
        area: `${risk.processArea}${risk.secondaryProcessArea ? ' / ' + risk.secondaryProcessArea : ''}`,
        product: risk.product || 'General / Regional',
        process: risk.process,
        riskDescription: risk.riskDescription,
        cause: causeText,
        associatedControl: finalControlText,
        impactProb: `${risk.impact} (I) / ${risk.probability} (P)`,
        valuation: `${score} - ${level}`,
        roam: `${risk.roamStatus || 'Mitigated'} (${risk.roamOwner || 'Sin dueño'})`,
        controlIndex: risk.controlIndex ? `${risk.controlIndex.toFixed(1)}%` : 'N/A',
        residualRisk: resScore && resLevel 
          ? `${resScore} - ${resLevel} (${risk.residualImpact} I / ${risk.residualProbability} P)`
          : 'Sin tratamiento / Mitigación directa',
        acceptability: risk.acceptability,
        actions: actionsText,
        documentControl: risk.documentControl || 'No registrado',
      });
    }
  });

  // Style header row beautifully
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Segoe UI', size: 10 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1e293b' }, // Dark slate-800
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Styling and formatting data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.height = 35; // Generous height for readability

    // Apply thin grey borders to make a grid
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFe2e8f0' } },
        left: { style: 'thin', color: { argb: 'FFe2e8f0' } },
        bottom: { style: 'thin', color: { argb: 'FFe2e8f0' } },
        right: { style: 'thin', color: { argb: 'FFe2e8f0' } }
      };
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });

    // ID align center
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(1).font = { bold: true, name: 'Segoe UI', size: 9, color: { argb: 'FF475569' } };

    // Product align center
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

    // Impact / Prob align center (Col 8)
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    // IC align center (Col 11)
    row.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };

    // Color Valoración (Column 9)
    const valuationCell = row.getCell(9);
    valuationCell.alignment = { horizontal: 'center', vertical: 'middle' };
    const valuationStyle = getStyleForLevel(valuationCell.value as string);
    if (valuationStyle) {
      valuationCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: valuationStyle.bg }
      };
      valuationCell.font = { bold: true, color: { argb: valuationStyle.fg }, name: 'Segoe UI', size: 9 };
    }

    // Color Residual (Column 12)
    const residualCell = row.getCell(12);
    residualCell.alignment = { horizontal: 'center', vertical: 'middle' };
    const residualStyle = getStyleForLevel(residualCell.value as string);
    if (residualStyle) {
      residualCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: residualStyle.bg }
      };
      residualCell.font = { bold: true, color: { argb: residualStyle.fg }, name: 'Segoe UI', size: 9 };
    }

    // Color Aceptabilidad (Column 13)
    const acceptabilityCell = row.getCell(13);
    acceptabilityCell.alignment = { horizontal: 'center', vertical: 'middle' };
    const acceptabilityStyle = getStyleForAcceptability(acceptabilityCell.value as string);
    if (acceptabilityStyle) {
      acceptabilityCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: acceptabilityStyle.bg }
      };
      acceptabilityCell.font = { bold: true, color: { argb: acceptabilityStyle.fg }, name: 'Segoe UI', size: 9 };
    }
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().split('T')[0];
  const safeFilename = filenamePrefix.replace(/[^a-zA-Z0-9_\-]/g, '_');
  saveAs(new Blob([buffer]), `${safeFilename}_${date}.xlsx`);
};

export const exportControlsToExcel = async (risks: Risk[]) => {
  const workbook = new ExcelJS.Workbook();
  
  // ==========================================
  // SHEET 1: CONTROLES REALES EXISTENTES
  // ==========================================
  const wsExisting = workbook.addWorksheet('Controles Reales Existentes');
  wsExisting.columns = [
    { header: 'ID Control', key: 'controlId', width: 15 },
    { header: 'Tipo de Control', key: 'controlType', width: 22 },
    { header: 'Descripción del Control Real (Manual G66)', key: 'documentControl', width: 55 },
    { header: 'Estado Actual', key: 'currentStatus', width: 24 },
    { header: 'Riesgo Asociado', key: 'riskId', width: 15 },
    { header: 'Descripción del Riesgo', key: 'riskDescription', width: 45 },
    { header: 'Área / Proceso', key: 'processArea', width: 20 },
    { header: 'Índice de Madurez (IC)', key: 'controlIndex', width: 18 },
    { header: 'Estrategia ROAM', key: 'roamStatus', width: 18 },
    { header: 'Propietario (Owner)', key: 'roamOwner', width: 22 },
    { header: 'Aceptabilidad', key: 'acceptability', width: 18 },
  ];

  // ==========================================
  // SHEET 2: PLANES DE ACCIÓN PROPUESTOS
  // ==========================================
  const wsProposed = workbook.addWorksheet('Planes de Acción Propuestos');
  wsProposed.columns = [
    { header: 'ID Plan Acción', key: 'planId', width: 15 },
    { header: 'Tipo de Medida', key: 'measureType', width: 22 },
    { header: 'Plan de Acción / Control Propuesto (No Existe Aún)', key: 'suggestedControl', width: 55 },
    { header: 'Estado Actual', key: 'currentStatus', width: 26 },
    { header: 'Riesgo Asociado', key: 'riskId', width: 15 },
    { header: 'Descripción del Riesgo', key: 'riskDescription', width: 45 },
    { header: 'Área / Proceso', key: 'processArea', width: 20 },
    { header: 'Estrategia ROAM', key: 'roamStatus', width: 18 },
    { header: 'Propietario (Owner)', key: 'roamOwner', width: 22 },
    { header: 'Aceptabilidad', key: 'acceptability', width: 18 },
  ];

  // Populate both sheets
  risks.forEach((risk) => {
    const riskNum = risk.id.replace('R-', '');
    
    // 1. Existing Control Data
    const realControl = risk.documentControl || 'No especificado explícitamente (se infiere operacionalmente)';
    let controlType = 'Preventivo / Operacional';
    const descLower = realControl.toLowerCase();
    if (descLower.includes('reconciliación') || descLower.includes('revisión posterior') || descLower.includes('monitoreo manual') || descLower.includes('auditoría') || descLower.includes('logs') || descLower.includes('offline')) {
      controlType = 'Detectivo / Posterior';
    } else if (descLower.includes('baja de portales') || descLower.includes('restricción') || descLower.includes('ajuste de límites') || descLower.includes('cláusulas') || descLower.includes('contratos')) {
      controlType = 'Correctivo / Reactivo';
    }

    wsExisting.addRow({
      controlId: `CTL-${riskNum}`,
      controlType: controlType,
      documentControl: realControl,
      currentStatus: 'EXISTENTE / OPERATIVO',
      riskId: risk.id,
      riskDescription: risk.riskDescription,
      processArea: risk.processArea,
      controlIndex: risk.controlIndex ? `${risk.controlIndex.toFixed(1)}%` : '75.0%',
      roamStatus: risk.roamStatus || 'Mitigated',
      roamOwner: risk.roamOwner || 'Líder de Proceso',
      acceptability: risk.acceptability || 'ACEPTABLE',
    });

    // 2. Proposed Action Plan (Doesn't exist yet but suggested to minimize risk)
    const actionPlan = risk.suggestedControl || 'Planificar revisión e implementación de control compensatorio.';
    let measureType = 'Control Propuesto (Futuro)';
    const actionLower = actionPlan.toLowerCase();
    if (actionLower.includes('automatiz') || actionLower.includes('desarroll') || actionLower.includes('api') || actionLower.includes('sistema')) {
      measureType = 'Automatización Tecnológica';
    } else if (actionLower.includes('política') || actionLower.includes('manual') || actionLower.includes('procedimiento') || actionLower.includes('document')) {
      measureType = 'Procedimiento Documental';
    } else if (actionLower.includes('auditor') || actionLower.includes('concili') || actionLower.includes('reconcili')) {
      measureType = 'Control Detectivo Propuesto';
    }

    wsProposed.addRow({
      planId: `PLA-${riskNum}`,
      measureType: measureType,
      suggestedControl: actionPlan,
      currentStatus: 'NO EXISTE (Pendiente Implementar)',
      riskId: risk.id,
      riskDescription: risk.riskDescription,
      processArea: risk.processArea,
      roamStatus: risk.roamStatus || 'Mitigated',
      roamOwner: risk.roamOwner || 'Líder de Proceso',
      acceptability: risk.acceptability || 'ACEPTABLE',
    });
  });

  // Style Header Row for Existing controls (Dark Teal/Slate theme)
  const headerExisting = wsExisting.getRow(1);
  headerExisting.height = 28;
  headerExisting.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Segoe UI', size: 10 };
  headerExisting.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0f172a' }, // Slate-900
  };
  headerExisting.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Style Header Row for Action Plans (Deep Purple theme to distinguish)
  const headerProposed = wsProposed.getRow(1);
  headerProposed.height = 28;
  headerProposed.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Segoe UI', size: 10 };
  headerProposed.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF312e81' }, // Indigo-950
  };
  headerProposed.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Helper to format rows
  const formatSheetRows = (sheet: ExcelJS.Worksheet, isExisting: boolean) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      row.height = 32;

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFe2e8f0' } },
          left: { style: 'thin', color: { argb: 'FFe2e8f0' } },
          bottom: { style: 'thin', color: { argb: 'FFe2e8f0' } },
          right: { style: 'thin', color: { argb: 'FFe2e8f0' } }
        };
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });

      // Align ID cell
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(1).font = { bold: true, name: 'Segoe UI', size: 9, color: { argb: isExisting ? 'FF0f766e' : 'FF6366f1' } };

      // Type cell styling
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

      // Status cell styling
      const statusCell = row.getCell(4);
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      statusCell.font = { bold: true, name: 'Segoe UI', size: 8 };
      if (isExisting) {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFdcfce7' } }; // Light green
        statusCell.font = { bold: true, color: { argb: 'FF15803d' }, name: 'Segoe UI', size: 8 };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFfef3c7' } }; // Light amber
        statusCell.font = { bold: true, color: { argb: 'FFb45309' }, name: 'Segoe UI', size: 8 };
      }

      // Risk ID align
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(5).font = { bold: true, name: 'Segoe UI', size: 9, color: { argb: 'FF475569' } };

      // Acceptability
      const accColIdx = isExisting ? 11 : 10;
      const acceptabilityCell = row.getCell(accColIdx);
      acceptabilityCell.alignment = { horizontal: 'center', vertical: 'middle' };
      const val = (acceptabilityCell.value as string) || '';
      if (val.includes('NO ACEPTABLE')) {
        acceptabilityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFfee2e2' } };
        acceptabilityCell.font = { bold: true, color: { argb: 'FF991b1b' }, name: 'Segoe UI', size: 9 };
      } else {
        acceptabilityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFdcfce7' } };
        acceptabilityCell.font = { bold: true, color: { argb: 'FF166534' }, name: 'Segoe UI', size: 9 };
      }
    });
  };

  formatSheetRows(wsExisting, true);
  formatSheetRows(wsProposed, false);

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().split('T')[0];
  saveAs(new Blob([buffer]), `Seguridad_Controles_y_Planes_Global66_${date}.xlsx`);
};

export const exportFraudTransactionsToExcel = async (
  transactions: FraudulentTransactionRecord[],
  filenamePrefix: string = 'Inswitch_Log_Forense_78_Transacciones_Fraudulentas'
) => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Transacciones Fraudulentas', {
    views: [{ state: 'frozen', ySplit: 5 }]
  });

  // Título e Información Forense
  ws.mergeCells('A1:O1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'GLOBAL66 — LOG FORENSE AUDITADO: 78 TRANSACCIONES FRAUDULENTAS (ADQUIRENCIA GLOBAL - INSWITCH / CREDIBANCO)';
  titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  ws.mergeCells('A2:O2');
  const metaCell = ws.getCell('A2');
  metaCell.value = 'Evento Regulatorio: EVT-ADQ-001 | Afectación: CMF (NCG 464 Chile) y SFC (Circular 029 SARO Colombia) | Monto Total: $128,598.00 USD ($540,111,600.00 COP) | Cuentas Afectadas: 43';
  metaCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF451A03' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  ws.mergeCells('A3:O3');
  const dateCell = ws.getCell('A3');
  dateCell.value = `Fecha de Generación: ${new Date().toLocaleString()} | Periodo Ataque: 30-Sep-2026 14:41 a 02-Oct-2026 14:35 | Estado Fondos: HOLD 100% INSWITCH`;
  dateCell.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: 'FF475569' } };
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 18;

  // Encabezados de Columnas
  const headers = [
    'ID Transacción',
    'Ref Externa Pasarela',
    'ID Cliente',
    'Email Usuario Bloqueado',
    'Fecha / Hora',
    'Monto (USD)',
    'Monto (COP)',
    'Canal de Pago',
    'BIN Tarjeta',
    'Últimos 4',
    'Marca',
    'Banco Emisor',
    'Resultado 3DS',
    'Código Gateway / Motivo Rechazo',
    'Patrón Forense',
    'Estado Inswitch',
    'IP Origen / Geolocalización',
    'Fingerprint Dispositivo'
  ];

  ws.getRow(5).values = headers;
  ws.getRow(5).height = 26;
  ws.getRow(5).eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } }
    };
  });

  // Datos
  transactions.forEach((tx) => {
    const row = ws.addRow([
      tx.transactionId,
      tx.externalReference,
      tx.clientId,
      tx.clientEmail,
      tx.timestamp,
      tx.amountUSD,
      tx.amountCOP,
      tx.paymentRail,
      tx.cardBin,
      tx.cardLast4,
      tx.cardBrand,
      tx.issuingBank,
      tx.threeDSStatus,
      tx.gatewayResponseCode,
      tx.fraudPattern,
      tx.inswitchStatus,
      tx.ipAddress,
      tx.deviceFingerprint
    ]);

    row.height = 22;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 8.5 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Formato numérico para USD y COP
      if (colNum === 6) {
        cell.numFmt = '"$"#,##0.00';
        cell.font = { bold: true, color: { argb: 'FF991B1B' }, name: 'Segoe UI', size: 8.5 };
      }
      if (colNum === 7) {
        cell.numFmt = '"$"#,##0';
        cell.font = { bold: true, color: { argb: 'FF065F46' }, name: 'Segoe UI', size: 8.5 };
      }
      if (colNum === 13) {
        // Estilo 3DS
        if (cell.value === 'APROBADO_SIN_FRICCIÓN') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          cell.font = { bold: true, color: { argb: 'FF991B1B' }, name: 'Segoe UI', size: 8 };
        } else if (cell.value === 'NO_ENROLADO') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.font = { bold: true, color: { argb: 'FF92400E' }, name: 'Segoe UI', size: 8 };
        }
      }
      if (colNum === 16) {
        cell.font = { bold: true, color: { argb: 'FF9A3412' }, name: 'Segoe UI', size: 8 };
      }
    });
  });

  // Fila de Totales
  const totalUSD = transactions.reduce((s, t) => s + t.amountUSD, 0);
  const totalCOP = transactions.reduce((s, t) => s + t.amountCOP, 0);
  const totalRow = ws.addRow([
    'TOTAL AUDITADO',
    `${transactions.length} Transacciones`,
    '43 Cuentas',
    'Consolidado Evento EVT-ADQ-001',
    '',
    totalUSD,
    totalCOP,
    '', '', '', '', '', '', '', '', 'HOLD 100%', '', ''
  ]);
  totalRow.height = 26;
  totalRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle' };
    if (colNum === 6) {
      cell.numFmt = '"$"#,##0.00';
    }
    if (colNum === 7) {
      cell.numFmt = '"$"#,##0';
    }
  });

  // Ajuste de Ancho de Columnas
  ws.columns = [
    { width: 24 }, // txId
    { width: 22 }, // extRef
    { width: 12 }, // clientId
    { width: 34 }, // email
    { width: 20 }, // timestamp
    { width: 16 }, // amountUSD
    { width: 18 }, // amountCOP
    { width: 25 }, // paymentRail
    { width: 12 }, // bin
    { width: 12 }, // last4
    { width: 14 }, // brand
    { width: 20 }, // bank
    { width: 24 }, // 3ds
    { width: 38 }, // gatewayResponse
    { width: 28 }, // fraudPattern
    { width: 18 }, // status
    { width: 32 }, // ip
    { width: 30 }  // fingerprint
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().split('T')[0];
  saveAs(new Blob([buffer]), `${filenamePrefix}_${date}.xlsx`);
};
