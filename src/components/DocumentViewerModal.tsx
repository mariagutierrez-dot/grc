import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  UserCheck, 
  Award, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  History,
  FileCheck2,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditedDocument, GovernanceDocument, GovernanceDocType } from '../types';

interface DocumentViewerModalProps {
  document: AuditedDocument | GovernanceDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenHistoryDrawer?: (doc: AuditedDocument) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onOpenHistoryDrawer
}) => {
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'document' | 'history'>('document');

  if (!isOpen || !doc) return null;

  // Normalizar datos entre GovernanceDocument y AuditedDocument
  const isGovDoc = 'type' in doc && 'objective' in doc;
  
  const code = doc.code || 'SIN-CODIGO';
  const title = doc.title || 'Documento Oficial de Procesos';
  const version = doc.version || '1.0';
  const status = ('status' in doc && doc.status) ? doc.status : 'Vigente';
  const area = ('ownerArea' in doc ? doc.ownerArea : (doc as GovernanceDocument).processArea) || 'Operaciones';
  const companyCode = ('companyCode' in doc ? doc.companyCode : (doc as AuditedDocument).detectedSociety) || 'GCCO';
  const elaboratedBy = ('elaboratedBy' in doc ? doc.elaboratedBy : (doc as GovernanceDocument).responsible) || 'Líder del Proceso';
  const reviewedBy = ('reviewedBy' in doc ? doc.reviewedBy : 'Oficialía de Cumplimiento / GRC') || 'GRC & Control Interno';
  const approvedBy = ('approvedBy' in doc ? doc.approvedBy : (doc as GovernanceDocument).approver) || 'Comité de Operaciones y Gobierno';
  const approvalDate = ('approvalDate' in doc ? doc.approvalDate : (doc as GovernanceDocument).issueDate) || new Date().toISOString().split('T')[0];
  const actNumber = ('actNumber' in doc ? doc.actNumber : undefined) || 'Acta Oficial N° ' + code.split('-').pop() + '-2026';
  const changeLog = ('changeLog' in doc ? doc.changeLog : undefined) || 'Emisión y formalización del documento oficial.';

  // Tipo de documento
  let docType: GovernanceDocType = 'PRO';
  if ('type' in doc) {
    docType = doc.type as GovernanceDocType;
  } else if (code.includes('POL')) {
    docType = 'POL';
  } else if (code.includes('MAN')) {
    docType = 'MAN';
  } else if (code.includes('PCS')) {
    docType = 'PCS';
  }

  // Secciones ricas (utilizar si existen, o construir plantilla institucional inteligente)
  const govDoc = isGovDoc ? (doc as GovernanceDocument) : null;
  const objective = govDoc?.objective || `Establecer los lineamientos formales, responsabilidades y controles operacionales para asegurar la ejecución correcta, trazable y oportuna de los procesos de ${area} en ${companyCode}, mitigando riesgos operacionales, financieros y de cumplimiento bajo los estándares ISO 31000 y normativas regulatorias de Global66.`;
  const scope = govDoc?.scope || `Aplica de manera obligatoria a todo el personal, colaboradores directos, sistemas tecnológicos y terceros involucrados en las actividades de ${area} de la entidad ${companyCode} a nivel local y en su integración con la infraestructura regional.`;
  
  const definitions = govDoc?.definitions || [
    { term: 'RCSA', definition: 'Risk and Control Self-Assessment (Autoevaluación de Riesgos y Controles).' },
    { term: 'SLA', definition: 'Service Level Agreement (Acuerdo de Nivel de Servicio operativo acordado entre áreas).' },
    { term: 'Descalce Operativo', definition: 'Diferencia no conciliada entre los registros contables internos y los saldos bancarios/adquirentes.' },
    { term: 'ROAM', definition: 'Marco de gobernanza para tratamiento de riesgos: Resolved, Owned, Accepted, Mitigated.' },
    { term: 'Trazabilidad', definition: 'Capacidad de reconstruir el historial cronológico y auditoría inmutable de cada transacción.' }
  ];

  const steps = govDoc?.steps || (docType === 'PRO' ? [
    {
      stepNumber: 1,
      role: elaboratedBy || 'Analista de Operaciones / Responsable',
      activity: 'Extracción, descarga y validación preliminar de insumos transaccionales y extractos bancarios desde las fuentes oficiales.',
      input: 'Archivos bancarios MT940/CSV, APIs de pasarelas y reportes transaccionales del backend.',
      output: 'Insumos consolidados y validados en el repositorio seguro.',
      controls: 'Verificación de integridad de hash y marcas de tiempo de recepción.'
    },
    {
      stepNumber: 2,
      role: 'Motor de Procesamiento / Analista',
      activity: 'Ejecución del cruce y conciliación automatizada mediante identificadores únicos de transacción (UUID).',
      input: 'Archivos cargados en el motor de reconciliación.',
      output: 'Reporte preliminar de calce y matriz de inconsistencias/descalces.',
      controls: 'Regla de validación automática con tolerancia $0.00.'
    },
    {
      stepNumber: 3,
      role: 'Líder del Proceso / Especialista',
      activity: 'Investigación técnica de inconsistencias, tipificación de causa raíz y formulación de ajustes contables.',
      input: 'Matriz de inconsistencias y logs de sistemas involucrados.',
      output: 'Ticket de gestión de descalce con causa raíz documentada y evidencia adjunta.',
      controls: 'Control dual para cualquier autorización de ajuste superior a $100 USD.'
    },
    {
      stepNumber: 4,
      role: approvedBy || 'Head de Área / Aprobador',
      activity: 'Revisión final, firma del acta de cierre de jornada y reporte a las partes interesadas.',
      input: 'Reporte consolidado de cierre diario con firmas de los operadores.',
      output: 'Acta digital de cierre distribuida a Finanzas, Riesgos y Auditoría Interna.',
      controls: 'Firma electrónica y custodia inmutable en repositorio corporativo.'
    }
  ] : undefined);

  const guidelines = govDoc?.guidelines || (docType === 'POL' ? [
    {
      topic: 'Custodia e Intangibilidad Patrimonial',
      principle: 'Segregación absoluta de los fondos de clientes respecto del patrimonio propio.',
      mandatoryRule: 'Los fondos deben mantenerse exclusivamente en cuentas de salvaguarda en bancos calificados Grado de Inversión.'
    },
    {
      topic: 'Prohibición de Apalancamiento',
      principle: 'Cero tolerancia a la especulación financiera con fondos de usuarios.',
      mandatoryRule: 'Queda estrictamente prohibido utilizar cuentas de provisión para préstamos intercompany o inversiones de riesgo.'
    },
    {
      topic: 'Monitoreo de Calce Horario',
      principle: 'Supervisión continua en tiempo real de la liquidez transaccional.',
      mandatoryRule: 'El ratio de cobertura líquida debe ser exactamente del 100.00% al cierre de cada ventana operativa.'
    }
  ] : undefined);

  const patterns = govDoc?.patterns || (docType === 'MAN' ? [
    {
      module: 'Arquitectura y Configuración del Entorno',
      operationalRule: 'Configuración estandarizada basada en el principio de mínimo privilegio y resiliencia activa.',
      architectureGuide: 'Todos los componentes deben contar con redundancia activa-activa y aislamiento por VPCs seguras.'
    },
    {
      module: 'Pautas de Operación Diaria y Mantenimiento',
      operationalRule: 'Ejecución rigurosa de checklists operativos y ventanas de mantenimiento programadas.',
      architectureGuide: 'Los cambios a producción requieren validación en staging y aprobación por el Change Advisory Board (CAB).'
    },
    {
      module: 'Gestión de Contingencias y Recuperación (DRP)',
      operationalRule: 'Respuesta inmediata ante fallas con tiempos de recuperación RTO < 1 hora y RPO < 15 minutos.',
      architectureGuide: 'Ejecución automática de failover y replicación cruzada multi-región.'
    }
  ] : undefined);

  const versionHistoryList = ('versionHistory' in doc && doc.versionHistory && doc.versionHistory.length > 0)
    ? doc.versionHistory
    : (govDoc?.versionControl || [
        {
          version: version,
          date: approvalDate,
          elaboratedBy: elaboratedBy,
          author: elaboratedBy,
          reviewedBy: reviewedBy,
          approvedBy: approvedBy,
          actNumber: actNumber,
          changeLog: changeLog,
          description: changeLog
        }
      ]);

  // Exportar a Word (.doc)
  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${code} - ${title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
          .header-box { border: 2px solid #102A97; padding: 15px; margin-bottom: 20px; background: #F4F6FE; }
          h1 { color: #102A97; font-size: 18pt; margin: 0 0 10px 0; border-bottom: 2px solid #3F5EDF; padding-bottom: 6px; }
          h2 { color: #3F5EDF; font-size: 13pt; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; }
          th { background: #102A97; color: white; border: 1px solid #0d2170; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <table style="border:none; margin:0;">
            <tr>
              <td style="border:none; width:70%;">
                <h1 style="color:#102A97;">GLOBAL66 - ${companyCode}</h1>
                <p><strong>${docType === 'PRO' ? 'PROCEDIMIENTO OFICIAL' : docType === 'POL' ? 'POLÍTICA CORPORATIVA' : 'MANUAL OPERATIVO'}</strong></p>
                <p><strong>Código:</strong> ${code} | <strong>Versión:</strong> ${version} | <strong>Estado:</strong> ${status}</p>
                <p><strong>N° de Acta:</strong> ${actNumber || 'Sin Acta Registrada'}</p>
              </td>
              <td style="border:none; text-align:right;">
                <p><strong>Área:</strong> ${area}</p>
                <p><strong>Fecha de Aprobación:</strong> ${approvalDate}</p>
              </td>
            </tr>
          </table>
        </div>

        <h2>Control de Versiones & Actas</h2>
        <table>
          <tr><th>Versión</th><th>Fecha</th><th>Elaborado por</th><th>Revisado por</th><th>Aprobado por</th><th>N° Acta</th><th>Descripción del Cambio</th></tr>
          ${versionHistoryList.map((v: any) => `
            <tr>
              <td>${v.version}</td>
              <td>${v.date}</td>
              <td>${v.elaboratedBy || v.author || ''}</td>
              <td>${v.reviewedBy || 'GRC'}</td>
              <td>${v.approvedBy || ''}</td>
              <td>${v.actNumber || 'N/A'}</td>
              <td>${v.changeLog || v.description || ''}</td>
            </tr>
          `).join('')}
        </table>

        <h2>1. Objetivo</h2>
        <p>${objective}</p>

        <h2>2. Alcance</h2>
        <p>${scope}</p>

        <h2>3. Definiciones Operativas</h2>
        <table>
          <tr><th>Término</th><th>Definición</th></tr>
          ${definitions.map(d => `<tr><td><strong>${d.term}</strong></td><td>${d.definition}</td></tr>`).join('')}
        </table>

        <h2>4. Descripción del Proceso / Lineamientos</h2>
        ${steps ? `
          <table>
            <tr><th>Paso</th><th>Rol / Responsable</th><th>Actividad</th><th>Entradas</th><th>Salidas</th><th>Control Asociado</th></tr>
            ${steps.map(s => `<tr><td>#${s.stepNumber}</td><td><strong>${s.role}</strong></td><td>${s.activity}</td><td>${s.input}</td><td>${s.output}</td><td>${s.controls || 'N/A'}</td></tr>`).join('')}
          </table>
        ` : ''}

        ${guidelines ? `
          <table>
            <tr><th>Tema / Tópico</th><th>Principio Rector</th><th>Lineamiento Mandatorio</th></tr>
            ${guidelines.map(g => `<tr><td><strong>${g.topic}</strong></td><td>${g.principle}</td><td>${g.mandatoryRule}</td></tr>`).join('')}
          </table>
        ` : ''}

        ${patterns ? `
          <table>
            <tr><th>Módulo / Componente</th><th>Regla Operativa</th><th>Guía de Arquitectura</th></tr>
            ${patterns.map(p => `<tr><td><strong>${p.module}</strong></td><td>${p.operationalRule}</td><td>${p.architectureGuide}</td></tr>`).join('')}
          </table>
        ` : ''}

        <h2>5. Control y Seguimiento</h2>
        <p>Monitoreo continuo mediante KPIs operativos, revisiones periódicas de control interno y auditorías semestrales.</p>

        <h2>6. Distribución</h2>
        <p>Equipo de ${area}, Oficialía de Cumplimiento, Control Interno y Comité de Gobernanza Global66.</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${code}_${title.replace(/[^a-zA-Z0-9]/g, '_')}_v${version}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar / Imprimir PDF
  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`${code} - ${title} (v${version})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* BARRA SUPERIOR DE HERRAMIENTAS */}
        <div className="bg-[#102A97] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3F5EDF] text-white rounded-xl shadow-xs">
              <FileCheck2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                  Visor Interactivo de Documento Oficial
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00B582] text-white">
                  {status}
                </span>
              </div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{code}</span>
                <span className="text-blue-300 font-normal">|</span>
                <span className="text-sm font-semibold text-blue-100 truncate max-w-md">{title}</span>
              </h2>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
              title="Copiar código y título oficial"
            >
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado' : 'Citar Código'}</span>
            </button>

            <button
              onClick={handleExportWord}
              className="px-3.5 py-1.5 rounded-xl bg-[#3F5EDF] hover:bg-blue-600 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Descargar en Microsoft Word (.doc)"
            >
              <Download size={14} />
              <span>Exportar Word (.doc)</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#102A97] hover:bg-blue-50 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Imprimir o guardar como PDF"
            >
              <Printer size={14} />
              <span>Exportar PDF / Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer ml-1"
              title="Cerrar visor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CUERPO DEL DOCUMENTO CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-50 print:bg-white print:p-0">
          
          {/* HOJA OFICIAL CON BRANDING GLOBAL66 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
            
            {/* 1. ENCABEZADO INSTITUCIONAL */}
            <div className="border-2 border-[#102A97] rounded-2xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#102A97] bg-[#F4F6FE]">
                
                {/* Logotipo y Sociedad */}
                <div className="md:col-span-3 p-4 flex flex-col justify-center items-center text-center bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#102A97] flex items-center justify-center text-white font-black text-base shadow-sm">
                      G
                    </div>
                    <span className="text-lg font-black tracking-tight text-[#102A97]">GLOBAL66</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase mt-1">
                    {companyCode} • GRC System
                  </span>
                </div>

                {/* Título Oficial */}
                <div className="md:col-span-6 p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#3F5EDF]">
                    {docType === 'PRO' ? 'PROCEDIMIENTO OPERATIVO ESTÁNDAR' :
                     docType === 'POL' ? 'POLÍTICA CORPORATIVA DE GOBIERNO' :
                     'MANUAL DE ARQUITECTURA Y OPERACIÓN'}
                  </span>
                  <h1 className="text-base sm:text-lg font-black text-[#102A97] mt-1 leading-tight">
                    {title}
                  </h1>
                </div>

                {/* Metadatos de Cabecera */}
                <div className="md:col-span-3 p-4 flex flex-col justify-center text-xs space-y-1 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Código:</span>
                    <span className="font-mono font-black text-[#102A97]">{code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Versión:</span>
                    <span className="font-mono font-black text-slate-800">v{version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Estado:</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-black bg-emerald-50 text-[#00B582] border border-emerald-200">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Aprobación:</span>
                    <span className="font-medium text-slate-600">{approvalDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TABLA DE METADATOS DE GOBIERNO, RESPONSABLES Y N° DE ACTA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F6FE] p-4 rounded-xl border border-[#DCE3FA] text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Área Propietaria:</span>
                <span className="font-black text-[#102A97]">{area}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Elaborado por:</span>
                <span className="font-bold text-slate-800">{elaboratedBy}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Revisado por:</span>
                <span className="font-bold text-slate-800">{reviewedBy}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Aprobado por:</span>
                <span className="font-bold text-slate-800">{approvedBy}</span>
              </div>

              {/* CAMPOS ADICIONALES DEL ROADMAP / EXCEL */}
              {(('macroprocess' in doc && doc.macroprocess) || ('criticality' in doc && doc.criticality) || ('driveOrLoomUrl' in doc && doc.driveOrLoomUrl)) && (
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-[#DCE3FA] grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {'macroprocess' in doc && doc.macroprocess && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Macroproceso:</span>
                      <span className="font-black text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                        {doc.macroprocess}
                      </span>
                    </div>
                  )}
                  {'subprocess' in doc && doc.subprocess && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Subproceso:</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{doc.subprocess}</span>
                    </div>
                  )}
                  {'criticality' in doc && doc.criticality && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Criticidad Operacional:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block mt-0.5 ${
                        doc.criticality === 'ALTA' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        doc.criticality === 'MEDIA' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {doc.criticality}
                      </span>
                    </div>
                  )}
                  {'dueDate' in doc && doc.dueDate && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Vigencia / Plazo:</span>
                      <span className="font-bold text-slate-800 block mt-0.5">{doc.dueDate}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ENLACE DE DRIVE O LOOM SI EXISTE */}
              {'driveOrLoomUrl' in doc && doc.driveOrLoomUrl && (
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-[#DCE3FA]/70 flex items-center justify-between bg-blue-100/50 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#102A97] uppercase">Repositorio Externo / Video Loom:</span>
                    <a
                      href={doc.driveOrLoomUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#3F5EDF] font-bold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span className="truncate max-w-md">{doc.driveOrLoomUrl}</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-[#DCE3FA]/70 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase">N° Acta Comité / Junta:</span>
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-white text-[#102A97] border border-blue-200">
                    📋 {actNumber || 'Sin Acta Registrada'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>Log de Versión: </span>
                  <strong className="text-slate-700">{changeLog}</strong>
                </div>
              </div>
            </div>

            {/* 3. CONTROL DE VERSIONES Y TRAZABILIDAD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-black text-[#102A97] uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-[#3F5EDF]" />
                  <span>Control de Versiones & Registro de Aprobaciones</span>
                </h3>
                {onOpenHistoryDrawer && 'versionHistory' in doc && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenHistoryDrawer(doc as AuditedDocument);
                    }}
                    className="text-xs font-bold text-[#3F5EDF] hover:text-[#102A97] flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    <History size={13} />
                    <span>Gestionar Versiones en Panel Lateral</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-[#F4F6FE] text-[#102A97] font-black text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Versión</th>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Elaborado por</th>
                      <th className="p-2.5">Revisado por</th>
                      <th className="p-2.5">Aprobado por</th>
                      <th className="p-2.5">N° Acta</th>
                      <th className="p-2.5 min-w-[180px]">Descripción / Log de Cambios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {versionHistoryList.map((vc: any, idx: number) => (
                      <tr key={idx} className={vc.isCurrent ? 'bg-emerald-50/40 font-semibold' : 'hover:bg-slate-50'}>
                        <td className="p-2.5 font-mono font-black text-[#102A97]">v{vc.version}</td>
                        <td className="p-2.5 text-slate-600">{vc.date}</td>
                        <td className="p-2.5 text-slate-800">{vc.elaboratedBy || vc.author}</td>
                        <td className="p-2.5 text-slate-800">{vc.reviewedBy || 'GRC & QA'}</td>
                        <td className="p-2.5 text-slate-800">{vc.approvedBy}</td>
                        <td className="p-2.5 font-mono text-[11px] text-blue-700">{vc.actNumber || 'N/A'}</td>
                        <td className="p-2.5 text-slate-600">{vc.changeLog || vc.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TABLA DE CONTENIDO OFICIAL */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-black text-[#102A97] uppercase tracking-wider block">
                Estructura de Secciones Oficiales
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-bold text-slate-600">
                <span>1. Objetivo</span>
                <span>2. Alcance</span>
                <span>3. Definiciones Operativas</span>
                <span>4. Descripción {docType === 'PRO' ? '(Paso a Paso)' : docType === 'POL' ? '(Lineamientos)' : '(Pautas)'}</span>
                <span>5. Control y Monitoreo</span>
                <span>6. Distribución</span>
                <span>7. Referencias Normativas</span>
              </div>
            </div>

            {/* 5. SECCIÓN 1: OBJETIVO */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#102A97] flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>1.</span>
                <span>Objetivo</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {objective}
              </p>
            </div>

            {/* 6. SECCIÓN 2: ALCANCE */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#102A97] flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>2.</span>
                <span>Alcance</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {scope}
              </p>
            </div>

            {/* 7. SECCIÓN 3: DEFINICIONES */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-[#102A97] flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>3.</span>
                <span>Definiciones Operativas</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-[#F4F6FE] text-[#102A97] font-black text-[11px]">
                    <tr>
                      <th className="p-2.5 w-1/4">Término / Sigla</th>
                      <th className="p-2.5">Definición Operativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {definitions.map((def, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">{def.term}</td>
                        <td className="p-2.5 text-slate-700">{def.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 8. SECCIÓN 4: DESCRIPCIÓN DETALLADA (PASO A PASO / LINEAMIENTOS / PAUTAS) */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-[#102A97] flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>4.</span>
                <span>
                  {docType === 'PRO' ? 'Descripción del Proceso (Secuencia Paso a Paso)' :
                   docType === 'POL' ? 'Lineamientos Mandatorios y Principios de la Política' :
                   'Pautas de Arquitectura y Operación Técnica'}
                </span>
              </h3>

              {steps && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#102A97] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-2.5 text-center w-12">Paso</th>
                        <th className="p-2.5 w-44">Rol / Responsable</th>
                        <th className="p-2.5 min-w-[200px]">Actividad Operativa</th>
                        <th className="p-2.5 w-36">Entradas</th>
                        <th className="p-2.5 w-36">Salidas</th>
                        <th className="p-2.5 min-w-[150px]">Control Asociado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {steps.map(step => (
                        <tr key={step.stepNumber} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-black font-mono text-[#102A97] bg-blue-50/30">
                            #{step.stepNumber}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800">{step.role}</td>
                          <td className="p-2.5 text-slate-700 leading-relaxed">{step.activity}</td>
                          <td className="p-2.5 text-slate-600">{step.input}</td>
                          <td className="p-2.5 text-slate-600">{step.output}</td>
                          <td className="p-2.5 font-medium text-emerald-800 bg-emerald-50/40">
                            {step.controls || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {guidelines && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#102A97] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-2.5 w-1/4">Tópico / Ámbito</th>
                        <th className="p-2.5 w-1/3">Principio Rector</th>
                        <th className="p-2.5">Lineamiento Mandatorio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {guidelines.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-black text-[#102A97] bg-blue-50/30">{g.topic}</td>
                          <td className="p-2.5 font-medium text-slate-800">{g.principle}</td>
                          <td className="p-2.5 font-bold text-slate-900">{g.mandatoryRule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {patterns && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#102A97] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-2.5 w-1/4">Módulo / Sistema</th>
                        <th className="p-2.5 w-1/3">Regla de Operación</th>
                        <th className="p-2.5">Guía de Arquitectura & Hardening</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patterns.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-black text-[#102A97] bg-blue-50/30">{p.module}</td>
                          <td className="p-2.5 text-slate-700">{p.operationalRule}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-800">{p.architectureGuide}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 9. SECCIÓN 5: CONTROL Y MONITOREO */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#102A97] flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>5.</span>
                <span>Control y Seguimiento</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                El monitoreo del cumplimiento de este documento se ejecuta mediante la revisión continua de indicadores de efectividad (KPIs/KRIs), auditorías semestrales por parte de Control Interno y evaluaciones anuales de vigencia por el Oficial de Cumplimiento y el Comité de Gobernanza.
              </p>
            </div>

            {/* 10. SECCIÓN 6: DISTRIBUCIÓN */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#102A97] flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>6.</span>
                <span>Distribución y Destinatarios</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Equipo Operativo ' + companyCode, 'Oficialía de Cumplimiento (AML/GRC)', 'Gerencia de Auditoría Interna', 'Comité de Riesgos y Directorio'].map((d, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F4F6FE] text-[#102A97] border border-[#DCE3FA]">
                    ✓ {d}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER DEL MODAL */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#00B582]" />
            <span>Documento Oficial Registrado en el Repositorio Máster Global66</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
            >
              Cerrar Visor
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
