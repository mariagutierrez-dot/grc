import ExcelJS from 'exceljs';
import { Risk, ProcessArea, ControlType, AssociatedControl, Acceptability, getAcceptability } from '../types';
import { rewriteRiskDescriptionToGrcFormula } from './riskRewriter';

export interface ImportedMatrixResult {
  mappedRisks: Risk[];
  importedPlans: any[];
  totalRowsRead: number;
  ownersFoundCount: number;
  plansFoundCount: number;
  sheetsProcessed: string[];
  filesProcessedCount: number;
}

// Cleans up control descriptions, removing AI prefixes and polishing formatting
export const cleanAndFormatControl = (rawControl: string): { description: string; type: ControlType } => {
  if (!rawControl) return { description: '', type: 'Preventivo' };

  let clean = rawControl
    .replace(/^[-•*–\s]+/, '') // Remove leading bullets
    .replace(/^(Control propuesto por (la )?IA|Sugerencia de IA|Generado por IA|IA proposal|AI control):\s*/i, '') // Remove AI tags
    .trim();

  if (/IA|inteligencia artificial|AI proposal/i.test(clean) && clean.length < 35) {
    // Pure AI placeholder, discard
    return { description: '', type: 'Preventivo' };
  }

  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Infer Control Type
  const lower = clean.toLowerCase();
  let type: ControlType = 'Preventivo';
  if (lower.includes('detectiv') || lower.includes('monitoreo') || lower.includes('alerta') || lower.includes('bitácora') || lower.includes('log') || lower.includes('revisión')) {
    type = 'Detectivo';
  } else if (lower.includes('correctiv') || lower.includes('recuperaci') || lower.includes('reembolso') || lower.includes('contingencia') || lower.includes('plan de acción')) {
    type = 'Correctivo';
  }

  return { description: clean, type };
};

// Parses a single Excel file
export const parseExcelMatrixFile = async (file: File): Promise<ImportedMatrixResult> => {
  return parseExcelMatrixFiles([file]);
};

// Parses multiple Excel files in a single batch
export const parseExcelMatrixFiles = async (files: File[]): Promise<ImportedMatrixResult> => {
  const mappedRisks: Risk[] = [];
  const importedPlans: any[] = [];
  const sheetsProcessed: string[] = [];
  let totalRowsRead = 0;
  let ownersFoundCount = 0;
  let plansFoundCount = 0;
  let filesProcessedCount = 0;

  for (const file of files) {
    try {
      filesProcessedCount++;
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();

      try {
        await workbook.xlsx.load(arrayBuffer);
      } catch (err) {
        console.warn(`Could not parse ${file.name} as standard XLSX:`, err);
      }

      workbook.eachSheet((worksheet) => {
        sheetsProcessed.push(`${file.name} -> ${worksheet.name}`);

        let headers: string[] = [];
        let headerRowIndex = -1;

        // Scan the first 20 rows to locate the header
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (headerRowIndex !== -1 && rowNumber <= headerRowIndex) return;

          const cellTexts: string[] = [];
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            let val = cell.value;
            if (val && typeof val === 'object') {
              if ('result' in val) val = (val as any).result;
              else if ('text' in val) val = (val as any).text;
              else if ('richText' in val) val = (val as any).richText.map((r: any) => r.text).join('');
            }
            cellTexts[colNumber - 1] = val !== undefined && val !== null ? String(val).trim() : '';
          });

          const joinedRow = cellTexts.join(' ').toLowerCase();

          // Check for key header keywords
          const isHeaderCandidate = 
            joinedRow.includes('riesgo') || 
            joinedRow.includes('proceso') || 
            joinedRow.includes('dueño') || 
            joinedRow.includes('dueno') || 
            joinedRow.includes('causa') || 
            joinedRow.includes('impacto') || 
            joinedRow.includes('id') || 
            joinedRow.includes('código') ||
            joinedRow.includes('codigo') ||
            joinedRow.includes('owner') ||
            joinedRow.includes('responsable');

          if (headerRowIndex === -1 && isHeaderCandidate) {
            headerRowIndex = rowNumber;
            headers = cellTexts.map(t => t.toLowerCase().trim());
            return;
          }

          if (headerRowIndex !== -1 && rowNumber > headerRowIndex) {
            // Data row check
            if (cellTexts.length === 0 || !cellTexts.some(t => t !== '')) return;

            // Filter out summary/total/footer rows
            const rowStr = joinedRow;
            if (
              rowStr.includes('total') || 
              rowStr.includes('subtotal') || 
              rowStr.includes('promedio') || 
              rowStr.includes('resumen') || 
              rowStr.includes('firmas') || 
              rowStr.includes('elaborado por') || 
              rowStr.includes('aprobado por') || 
              rowStr.includes('revisado por') ||
              rowStr.startsWith('nota')
            ) {
              return;
            }

            // Helper to match column by keywords
            const getColVal = (keywords: string[]): string => {
              for (const kw of keywords) {
                const idx = headers.findIndex(h => h.includes(kw));
                if (idx !== -1 && cellTexts[idx]) {
                  return cellTexts[idx].trim();
                }
              }
              return '';
            };

            // Extract Risk Description
            let riskDescription = getColVal([
              'riesgo', 'descripción', 'descripcion', 'evento', 'nombre del riesgo', 
              'detalle del riesgo', 'evento de riesgo', 'descripción del riesgo', 'descripcion del riesgo'
            ]);

            if (!riskDescription) {
              // Try finding cell with text that looks like a description
              const candidate = cellTexts.find(t => t.length > 15 && !t.toLowerCase().includes('proceso') && !t.toLowerCase().includes('matriz'));
              if (candidate) {
                riskDescription = candidate;
              }
            }

            // If there's no valid risk description or if it's just a section title, skip
            if (!riskDescription || riskDescription.trim().length < 5) {
              return;
            }

            totalRowsRead++;

            // Extract ID
            let riskId = getColVal(['id', 'código', 'codigo', 'ref', 'item']);
            if (!riskId && cellTexts[0] && cellTexts[0].toUpperCase().startsWith('R-')) {
              riskId = cellTexts[0];
            }
            if (!riskId) {
              riskId = `R-EXCEL-${100 + totalRowsRead}`;
            }

            // Extract Area / Process Area
            let rawArea = getColVal(['área', 'area', 'unidad', 'macroproceso', 'categoria', 'gerencia']);
            if (!rawArea && cellTexts[1]) {
              rawArea = cellTexts[1];
            }

            let processArea: ProcessArea = 'Cumplimiento';
            const cleanAreaUpper = (rawArea || '').toUpperCase();
            if (cleanAreaUpper.includes('CONCILIA')) processArea = 'Conciliaciones';
            else if (cleanAreaUpper.includes('FRAUD')) processArea = 'Fraude';
            else if (cleanAreaUpper.includes('CIBER') || cleanAreaUpper.includes('SEGURIDAD DE INFORM')) processArea = 'Ciberseguridad';
            else if (cleanAreaUpper.includes('OPERAC') || cleanAreaUpper.includes('OPS')) processArea = 'Operaciones';
            else if (cleanAreaUpper.includes('MESA')) processArea = 'Mesa de Dinero';
            else if (cleanAreaUpper.includes('TESORER')) processArea = 'Tesorería';
            else if (cleanAreaUpper.includes('TI') || cleanAreaUpper.includes('SISTEMA') || cleanAreaUpper.includes('DEVOPS')) processArea = 'TI';
            else if (cleanAreaUpper.includes('PRODUCT')) processArea = 'Nuevos Productos';
            else if (cleanAreaUpper.includes('NUBE') || cleanAreaUpper.includes('CLOUD')) processArea = 'Riesgos Nube';
            else if (cleanAreaUpper.includes('CUMPLI') || cleanAreaUpper.includes('COMPLIANCE') || cleanAreaUpper.includes('SARO') || cleanAreaUpper.includes('REGULA')) processArea = 'Cumplimiento';

            // Extract Process Owner / Dueño de Proceso / ROAM Owner
            let roamOwner = getColVal([
              'dueño de proceso', 'dueño del proceso', 'dueno de proceso', 'dueno del proceso',
              'dueño', 'dueno', 'propietario', 'roam owner', 'owner', 'responsable de proceso',
              'responsable del proceso', 'líder de proceso', 'lider de proceso', 'lider', 'líder'
            ]);

            if (!roamOwner && cellTexts[2]) {
              if (!/^[0-9]+$/.test(cellTexts[2]) && cellTexts[2].length < 60) {
                roamOwner = cellTexts[2];
              }
            }

            if (roamOwner) {
              ownersFoundCount++;
            } else {
              roamOwner = processArea === 'Conciliaciones' ? 'Head de Operaciones / Conciliaciones' :
                processArea === 'Operaciones' ? 'Head de Operaciones' :
                processArea === 'Mesa de Dinero' ? 'Head de Mesa de Dinero' :
                processArea === 'Tesorería' ? 'Head de Tesorería' :
                processArea === 'TI' ? 'Head de TI' :
                processArea === 'Cumplimiento' ? 'Compliance Officer' :
                processArea === 'Fraude' ? 'Head de Prevención de Fraude' :
                processArea === 'Ciberseguridad' ? 'CISO / Head de Ciberseguridad' :
                processArea === 'Nuevos Productos' ? 'Head de Producto' :
                'Líder del Proceso Global66';
            }

            // Extract Product / Línea de Producto
            let rawProduct = getColVal(['producto', 'línea', 'linea', 'línea de producto', 'linea de producto', 'product', 'servicio']);
            let product = 'Cuentas Virtuales';
            const contextStr = `${rawProduct} ${worksheet.name} ${file.name} ${joinedRow}`.toLowerCase();
            if (contextStr.includes('concilia') || contextStr.includes('fascom') || contextStr.includes('precierre') || contextStr.includes('pre-cierre')) {
              product = undefined as any;
              processArea = 'Conciliaciones';
            } else if (contextStr.includes('sii') || contextStr.includes('carpeta tributaria') || contextStr.includes('tributari') || contextStr.includes('clave tributaria')) {
              product = 'Integración SII Chile';
            } else if (contextStr.includes('stablecoin') || contextStr.includes('usdt') || contextStr.includes('usdc') || contextStr.includes('utila')) {
              product = 'Stablecoins';
            } else if (contextStr.includes('temporal') || contextStr.includes('temporales') || contextStr.includes('desechable') || contextStr.includes('desechables') || contextStr.includes('burner') || contextStr.includes('single use') || contextStr.includes('single-use') || contextStr.includes('un solo uso') || contextStr.includes('efimera') || contextStr.includes('efímera')) {
              product = 'Tarjetas Temporales';
            } else if (contextStr.includes('bloqueo') || contextStr.includes('bloqueos') || contextStr.includes('congelamiento') || contextStr.includes('freeze') || contextStr.includes('lockout') || contextStr.includes('embargo') || contextStr.includes('flujo de bloqueo')) {
              product = 'Flujo de Bloqueos';
            } else if (contextStr.includes('multitarjeta') || contextStr.includes('multi tarjeta') || contextStr.includes('multi-tarjeta') || contextStr.includes('multicard') || contextStr.includes('multi card') || contextStr.includes('multi_tarjeta')) {
              product = 'Multitarjeta';
            } else if (contextStr.includes('globalid') || contextStr.includes('global id') || contextStr.includes('identidad') || contextStr.includes('biometr') || contextStr.includes('passkey')) {
              product = 'GlobalID';
            } else if (contextStr.includes('bre-b') || contextStr.includes('breb')) {
              product = 'Bre-B';
            } else if (contextStr.includes('virtual') || contextStr.includes('iban') || contextStr.includes('cvu') || contextStr.includes('subcuenta')) {
              product = 'Cuentas Virtuales';
            } else if (contextStr.includes('adquirencia') || contextStr.includes('deposit money')) {
              product = 'Adquirencia Global';
            } else if (contextStr.includes('jpmorgan') || contextStr.includes('payout swift')) {
              product = 'Payout Swift JPMorgan';
            } else if (contextStr.includes('cce') || contextStr.includes('peru') || contextStr.includes('perú') || contextStr.includes('gmoney')) {
              product = 'Integración CCE - Perú';
            } else if (contextStr.includes('mcp') || contextStr.includes('apib2b')) {
              product = 'APIB2B(MCP)';
            } else if (contextStr.includes('global chat') || contextStr.includes('kit p2p')) {
              product = 'Global chats';
            } else if (rawProduct) {
              product = rawProduct;
            }

            // Extract Process / Step
            let process = getColVal(['proceso', 'paso', 'macroproceso/proceso', 'subproceso']);
            if (!process) process = rawArea || 'Gestión de Procesos Global66';

            // Extract Cause
            let cause = getColVal(['causa', 'causas', 'causa raíz', 'causa raiz', 'causal', 'origen']);
            if (!cause) cause = 'Causa evaluada en la matriz.';

            // Format Risk Description strictly to Global66 ISO 31000 methodology
            const cleanRawDesc = riskDescription.trim();
            const formattedRiskDesc = rewriteRiskDescriptionToGrcFormula({
              id: riskId,
              processArea,
              process,
              riskDescription: cleanRawDesc,
              cause: cause.trim()
            });

            // Extract Inherent Impact & Probability
            const rawImpact = getColVal(['impacto inherente', 'inherent_impact', 'impacto', 'i inherente', 'severidad']);
            const rawProb = getColVal(['probabilidad inherente', 'inherent_probability', 'probabilidad', 'p inherente', 'frecuencia']);

            const impact = Math.min(5, Math.max(1, parseInt(rawImpact || '4', 10) || 4));
            const probability = Math.min(5, Math.max(1, parseInt(rawProb || '2', 10) || 2));

            // Controls (Strictly preserve user controls from Excel, omit AI placeholders)
            const rawControlDesc = getColVal(['control', 'controles', 'control sugerido', 'control existente', 'controles existentes', 'evaluación de control', 'evaluacion de control', 'mitigación', 'mitigacion']);
            const { description: controlDesc, type: controlType } = cleanAndFormatControl(rawControlDesc);

            const assControls: AssociatedControl[] = [];
            if (controlDesc && controlDesc.trim() !== '') {
              assControls.push({
                id: `C-EXCEL-${riskId}-1`,
                description: controlDesc,
                type: controlType,
                efficiency: 'Excelente',
                impactReduction: 1,
                probabilityReduction: 1
              });
            }

            // Extract Residual Impact & Probability if explicitly present in Excel
            const rawResidualImpact = getColVal(['impacto residual', 'residual_impact', 'i residual', 'impacto final', 'severidad residual']);
            const rawResidualProb = getColVal(['probabilidad residual', 'residual_probability', 'p residual', 'probabilidad final', 'frecuencia residual']);
            const rawAcceptability = getColVal(['aceptabilidad', 'apetito', 'nivel de riesgo', 'evaluación de riesgo', 'evaluacion de riesgo', 'veredicto']);

            let residualImpact = rawResidualImpact ? parseInt(rawResidualImpact, 10) : NaN;
            let residualProbability = rawResidualProb ? parseInt(rawResidualProb, 10) : NaN;

            if (isNaN(residualImpact)) {
              residualImpact = Math.max(1, impact - (assControls.length > 0 ? 1 : 0));
            } else {
              residualImpact = Math.min(5, Math.max(1, residualImpact));
            }

            if (isNaN(residualProbability)) {
              residualProbability = Math.max(1, probability - (assControls.length > 0 ? 1 : 0));
            } else {
              residualProbability = Math.min(5, Math.max(1, residualProbability));
            }

            const residualScore = residualImpact * residualProbability;

            // Determine Acceptability ("Fuera del Apetito" vs "Aceptable")
            let acceptability: Acceptability = 'ACEPTABLE';
            if (rawAcceptability) {
              const upperAcc = rawAcceptability.toUpperCase();
              if (upperAcc.includes('NO ACEPTABLE') || upperAcc.includes('FUERA') || upperAcc.includes('NO TOLERABLE') || upperAcc.includes('EXTREMO') || upperAcc.includes('ALTO')) {
                acceptability = 'NO ACEPTABLE (Requiere tratamiento urgente)';
              } else if (upperAcc.includes('ACEPTABLE') || upperAcc.includes('BAJO') || upperAcc.includes('MODERADO') || upperAcc.includes('DENTRO')) {
                acceptability = 'ACEPTABLE';
              } else {
                acceptability = getAcceptability(residualScore);
              }
            } else {
              // Score > 12 -> NO ACEPTABLE (Exposición > 50%)
              acceptability = getAcceptability(residualScore);
            }

            // Action Plan / Treatment Plan (Columna T or similar)
            let actionPlanText = getColVal(['plan de acción', 'plan de accion', 'planes', 'tratamiento', 'columna t', 'pruebas', 'acciones', 'mitigación', 'mitigacion']);
            if (!actionPlanText && cellTexts[19]) {
              actionPlanText = cellTexts[19];
            }

            mappedRisks.push({
              id: riskId,
              processArea,
              product,
              process,
              riskDescription: formattedRiskDesc || riskDescription.trim(),
              cause: cause.trim(),
              impact,
              probability,
              suggestedControl: controlDesc || 'Pendiente por definir control por el dueño del proceso.',
              documentControl: controlDesc || 'Matriz de riesgos evaluada.',
              acceptability,
              status: 'Aprobado',
              roamStatus: 'Mitigated',
              roamOwner,
              associatedControls: assControls,
              residualImpact,
              residualProbability
            });

            if (actionPlanText && actionPlanText.trim().length > 3) {
              const isAiControl = /IA|AI|inteligencia artificial/i.test(actionPlanText) && actionPlanText.length < 35;
              if (!isAiControl) {
                plansFoundCount++;
                importedPlans.push({
                  id: `PLN-SARO-${riskId}`,
                  riskId,
                  riskTitle: `${riskId}: ${process || riskDescription.substring(0, 50)}`,
                  processArea: (processArea === 'Riesgos Nube' ? 'Cumplimiento' : processArea) as any,
                  strategy: 'Mitigated',
                  responsible: roamOwner,
                  targetDate: '2026-10-31',
                  progress: 25,
                  tasks: actionPlanText.trim(),
                  status: 'En proceso',
                  budget: '$5,000 USD',
                  framework: 'SARO',
                  evidences: []
                });
              }
            }
          }
        });
      });
    } catch (e) {
      console.error(`Error al procesar archivo ${file.name}:`, e);
    }
  }

  return {
    mappedRisks,
    importedPlans,
    totalRowsRead,
    ownersFoundCount,
    plansFoundCount,
    sheetsProcessed,
    filesProcessedCount
  };
};
