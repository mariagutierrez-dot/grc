import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Check, 
  X, 
  RefreshCw,
  Building2, 
  FileCheck2, 
  AlertOctagon, 
  ChevronRight, 
  History, 
  Calendar, 
  UserCheck, 
  Award,
  Layers,
  SlidersHorizontal,
  Info,
  ExternalLink,
  Eye,
  BookOpen,
  ArrowRight,
  Hash,
  Wand2,
  Lock,
  GitBranch,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AuditedDocument, 
  DocTypology, 
  OfficialCountry, 
  OfficialSocietyCode,
  DocumentVersionHistoryEntry,
  GLOBAL66_PROCESS_TAXONOMY,
  RegionalProcessDefinition 
} from '../types';
import { INITIAL_CONSOLIDATED_INVENTORY, parseDocumentCoverAndVersionLog } from '../data/documentInventoryData';
import { DocumentVersionHistoryDrawer } from './DocumentVersionHistoryDrawer';
import { DocumentViewerModal } from './DocumentViewerModal';
import { ExcelMassImporterModal } from './ExcelMassImporterModal';

// DEFINICIÓN OFICIAL DE SOCIEDADES Y JURISDICCIONES CORPORATIVAS
export const OFFICIAL_SOCIETIES: { 
  code: OfficialSocietyCode; 
  name: string; 
  country: OfficialCountry; 
  flag: string; 
  legalEntity: string;
  regulator: string;
}[] = [
  { 
    code: 'GCCO', 
    name: 'Colombia (GCCO)', 
    country: 'Colombia', 
    flag: '🇨🇴', 
    legalEntity: 'Global66 Colombia S.A.S. SEDPE',
    regulator: 'Superintendencia Financiera de Colombia (SFC)'
  },
  { 
    code: 'G81', 
    name: 'Chile (G81 - Global Card)', 
    country: 'Chile', 
    flag: '🇨🇱', 
    legalEntity: 'Global Card S.A. Emisora de Tarjetas de Pago',
    regulator: 'Comisión para el Mercado Financiero (CMF)'
  },
  { 
    code: 'GCCL', 
    name: 'Chile (GCCL - Global66 SpA)', 
    country: 'Chile', 
    flag: '🇨🇱', 
    legalEntity: 'Global66 SpA (Matriz de Remesas y Servicios)',
    regulator: 'Banco Central de Chile & UAF'
  },
  { 
    code: 'GCAR', 
    name: 'Argentina (GCAR)', 
    country: 'Argentina', 
    flag: '🇦🇷', 
    legalEntity: 'Global66 Argentina S.A.U. PSP',
    regulator: 'Banco Central de la República Argentina (BCRA)'
  },
  { 
    code: 'GREG', 
    name: 'Regional / HoldCo (GREG)', 
    country: 'Regional', 
    flag: '🌎', 
    legalEntity: 'Global66 Regional / Holding Corporativa',
    regulator: 'Gobierno Corporativo Regional'
  }
];

// DEFINICIÓN OFICIAL DE TIPOLOGÍAS DOCUMENTALES
export const OFFICIAL_TYPOLOGIES: { 
  code: DocTypology; 
  name: string; 
  icon: string; 
  description: string;
}[] = [
  { code: 'PRO', name: 'Procedimiento (PRO)', icon: '📘', description: 'Flujo operativo secuencial paso a paso con matriz de riesgos y controles' },
  { code: 'POL', name: 'Política (POL)', icon: '📜', description: 'Directrices estratégicas de alto nivel, principios y mandatos de cumplimiento' },
  { code: 'MAN', name: 'Manual (MAN)', icon: '📕', description: 'Compendio integral de directrices técnicas, metodologías o arquitectura' },
  { code: 'PCS', name: 'Proceso / Macroproceso (PCS)', icon: '🔄', description: 'Mapa general del flujo de valor de extremo a extremo' }
];

// FUNCIÓN AUXILIAR: CALCULAR SIGUIENTE CORRELATIVO LIBRE
export const calculateNextCorrelative = (
  society: string,
  typology: string,
  docList: AuditedDocument[]
): {
  maxNumber: number;
  nextNumber: number;
  nextFormatted: string;
  suggestedCode: string;
  totalForCombination: number;
} => {
  const prefix = `${society}-${typology}-`;
  let maxNumber = 0;
  let totalForCombination = 0;

  docList.forEach(doc => {
    const code = (doc.code || '').trim().toUpperCase();
    if (code.startsWith(prefix)) {
      totalForCombination++;
      const rest = code.substring(prefix.length);
      const match = rest.match(/^(\d{1,4})/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  });

  const nextNumber = maxNumber + 1;
  const nextFormatted = String(nextNumber).padStart(3, '0');
  const suggestedCode = `${prefix}${nextFormatted}`;

  return {
    maxNumber,
    nextNumber,
    nextFormatted,
    suggestedCode,
    totalForCombination
  };
};

// FUNCIÓN AUXILIAR: CALCULAR SIGUIENTE NÚMERO DE VERSIÓN
export const calculateNextVersion = (currentVer: string = '1.0'): string => {
  const clean = currentVer.replace(/^[Vv]/, '').trim();
  const parts = clean.split('.');
  if (parts.length >= 2) {
    const major = parseInt(parts[0], 10);
    if (!isNaN(major)) {
      return `${major + 1}.0`;
    }
  } else if (parts.length === 1) {
    const major = parseInt(parts[0], 10);
    if (!isNaN(major)) {
      return `${major + 1}.0`;
    }
  }
  return '2.0';
};

export const DocumentInventoryModule: React.FC = () => {
  const [documents, setDocuments] = useState<AuditedDocument[]>(() => {
    const saved = localStorage.getItem('g66_grc_consolidated_inventory_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved consolidated inventory', e);
      }
    }
    return INITIAL_CONSOLIDATED_INVENTORY;
  });

  // Guardar en localStorage
  const saveDocuments = (docs: AuditedDocument[]) => {
    setDocuments(docs);
    localStorage.setItem('g66_grc_consolidated_inventory_v2', JSON.stringify(docs));
  };

  // Toast feedback interactivo
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Estados de navegación y filtros
  const [activeTab, setActiveTab] = useState<'matrix' | 'extractor' | 'coverage'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<'ALL' | 'Colombia' | 'Chile' | 'Argentina' | 'Regional' | 'Sin Clasificar'>('ALL');
  const [societyCodeFilter, setSocietyCodeFilter] = useState<OfficialSocietyCode | 'ALL'>('ALL');
  const [taxonomyFilter, setTaxonomyFilter] = useState<number | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | DocTypology>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [governanceStatusFilter, setGovernanceStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'DUPLICATES' | 'SYNTAX_ERRORS' | 'NO_ACTA'>('ALL');

  // Estado del Visor Interactivo de Documento
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<AuditedDocument | null>(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  // Estado del Importador Masivo de Excel
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  const handleOpenDocViewer = (doc: AuditedDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDocForViewer(doc);
    setIsViewerModalOpen(true);
  };

  // Estado del Drawer lateral de versiones
  const [selectedDocForHistory, setSelectedDocForHistory] = useState<AuditedDocument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estados de modal de creación / edición manual
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [isNewVersionMode, setIsNewVersionMode] = useState(false);

  // Estados del asistente interactivo de generación de códigos
  const [assistantSociety, setAssistantSociety] = useState<OfficialSocietyCode>('GCCO');
  const [assistantTypology, setAssistantTypology] = useState<DocTypology>('PRO');

  // Estados del formulario manual
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formArea, setFormArea] = useState('Operaciones');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formElaborated, setFormElaborated] = useState('');
  const [formReviewed, setFormReviewed] = useState('');
  const [formApproved, setFormApproved] = useState('');
  const [formApprovalDate, setFormApprovalDate] = useState(new Date().toISOString().split('T')[0]);
  const [formActNumber, setFormActNumber] = useState('');
  const [formChangeLog, setFormChangeLog] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Estados de la herramienta de extracción de portadas
  const [rawCoverInput, setRawCoverInput] = useState('');
  const [extractorFeedback, setExtractorFeedback] = useState<string | null>(null);

  // =========================================================================
  // MOTOR DE AUDITORÍA Y ANÁLISIS DE CONSISTENCIA DE LA MATRIZ
  // =========================================================================
  const auditedList = useMemo(() => {
    // 1. Contar frecuencias de códigos para detectar duplicados
    const codeCounts = new Map<string, number>();
    documents.forEach(doc => {
      const norm = (doc.code || '').trim().toUpperCase();
      if (norm) {
        codeCounts.set(norm, (codeCounts.get(norm) || 0) + 1);
      }
    });

    // 2. Evaluar reglas de negocio y sintaxis oficial
    return documents.map(doc => {
      const code = (doc.code || '').trim().toUpperCase();
      const count = codeCounts.get(code) || 0;
      const isDuplicate = count > 1;
      const auditIssues: string[] = [];

      // Detección de sociedad oficial
      let detectedCountry: OfficialCountry = 'Sin Clasificar';
      let detectedSociety: OfficialSocietyCode = 'DESCONOCIDO';

      if (code.startsWith('GCCO')) {
        detectedCountry = 'Colombia';
        detectedSociety = 'GCCO';
      } else if (code.startsWith('G81')) {
        detectedCountry = 'Chile';
        detectedSociety = 'G81';
      } else if (code.startsWith('GCCL')) {
        detectedCountry = 'Chile';
        detectedSociety = 'GCCL';
      } else if (code.startsWith('GCAR')) {
        detectedCountry = 'Argentina';
        detectedSociety = 'GCAR';
      } else if (code.startsWith('GREG')) {
        detectedCountry = 'Regional';
        detectedSociety = 'GREG';
      }

      // Detección de tipología oficial
      let detectedTypology: DocTypology | 'DESCONOCIDO' = 'DESCONOCIDO';
      if (code.includes('PRO') || code.includes('-PRO-') || code.includes('_PRO_')) detectedTypology = 'PRO';
      else if (code.includes('POL') || code.includes('-POL-') || code.includes('_POL_')) detectedTypology = 'POL';
      else if (code.includes('MAN') || code.includes('-MAN-') || code.includes('_MAN_')) detectedTypology = 'MAN';
      else if (code.includes('PCS') || code.includes('-PCS-') || code.includes('_PCS_')) detectedTypology = 'PCS';

      // Validación de formato estándar: [GCCO|G81|GCCL|GCAR|GREG]-[PRO|POL|MAN|PCS]-[0-9]{3}
      const standardRegex = /^(GCCO|G81|GCCL|GCAR|GREG)-(PRO|POL|MAN|PCS)-\d{3}$/;
      let hasSyntaxError = false;
      let detectedCorrelative: string | null = null;
      let suggestedFixCode: string | undefined = undefined;

      const correlativeMatch = code.match(/(\d{1,4})$/);
      if (correlativeMatch) {
        detectedCorrelative = correlativeMatch[1].padStart(3, '0');
      }

      if (!standardRegex.test(code)) {
        hasSyntaxError = true;
        if (detectedSociety === 'DESCONOCIDO') {
          auditIssues.push('Prefijo de entidad desconocido: Debe ser GCCO, G81, GCCL, GCAR o GREG.');
        }
        if (detectedTypology === 'DESCONOCIDO') {
          auditIssues.push('Tipología no reconocida: Debe ser PRO, POL, MAN o PCS.');
        }
        if (code.includes('_') || code.includes('/') || code.includes(' ')) {
          auditIssues.push('Separador no permitido (debe usar guión medio "-").');
        }
        if (!detectedCorrelative || detectedCorrelative.length !== 3) {
          auditIssues.push('El correlativo debe contener exactamente 3 dígitos (ej: 001, 031).');
        }

        // Sugerencia de normalización automática
        const soc = detectedSociety !== 'DESCONOCIDO' ? detectedSociety : 'GCCO';
        const typ = detectedTypology !== 'DESCONOCIDO' ? detectedTypology : 'PRO';
        const num = detectedCorrelative || '001';
        suggestedFixCode = `${soc}-${typ}-${num}`;
      }

      if (isDuplicate) {
        auditIssues.push(`Código Duplicado: Existen ${count} documentos con la misma nomenclatura.`);
      }

      const isCompliant = !isDuplicate && !hasSyntaxError && detectedSociety !== 'DESCONOCIDO' && detectedTypology !== 'DESCONOCIDO';

      return {
        ...doc,
        detectedCountry,
        detectedSociety,
        detectedTypology,
        detectedCorrelative,
        isDuplicate,
        hasSyntaxError,
        isCompliant,
        auditIssues,
        suggestedFixCode: suggestedFixCode !== code ? suggestedFixCode : undefined
      };
    });
  }, [documents]);

  // =========================================================================
  // CÁLCULOS DINÁMICOS DEL ASISTENTE DE CÓDIGOS (EN TIEMPO REAL)
  // =========================================================================
  const assistantCodeSuggestion = useMemo(() => {
    return calculateNextCorrelative(assistantSociety, assistantTypology, documents);
  }, [assistantSociety, assistantTypology, documents]);

  // VALIDACIÓN REACTIVA DEL CAMPO formCode EN EL FORMULARIO (BLOQUEO DE DUPLICADOS)
  const formCodeValidation = useMemo(() => {
    const raw = formCode.trim().toUpperCase();
    if (!raw) {
      return {
        isEmpty: true,
        isDuplicate: false,
        duplicateDoc: null,
        hasSyntaxError: false,
        isCompliant: false,
        suggestedFix: undefined,
        suggestedFreeCode: undefined,
        nextSuggestedVersion: '2.0'
      };
    }

    // Comprobar si existe duplicidad con otro documento de la base
    const duplicateDoc = documents.find(d => 
      d.code.trim().toUpperCase() === raw && d.id !== editingDocId
    );

    const standardRegex = /^(GCCO|G81|GCCL|GCAR|GREG)-(PRO|POL|MAN|PCS)-\d{3}$/;
    const hasSyntaxError = !standardRegex.test(raw);

    // Extraer prefijos para auto-resolución
    let soc: OfficialSocietyCode = 'GCCO';
    if (raw.startsWith('G81')) soc = 'G81';
    else if (raw.startsWith('GCCL')) soc = 'GCCL';
    else if (raw.startsWith('GCAR')) soc = 'GCAR';
    else if (raw.startsWith('GREG')) soc = 'GREG';

    let typ: DocTypology = 'PRO';
    if (raw.includes('POL')) typ = 'POL';
    else if (raw.includes('MAN')) typ = 'MAN';
    else if (raw.includes('PCS')) typ = 'PCS';

    let num = '001';
    const numMatch = raw.match(/(\d{1,4})$/);
    if (numMatch) {
      num = numMatch[1].padStart(3, '0');
    }

    const suggestedFix = `${soc}-${typ}-${num}`;
    const freeCodeCalc = calculateNextCorrelative(soc, typ, documents);
    const nextSuggestedVersion = duplicateDoc ? calculateNextVersion(duplicateDoc.version) : '2.0';

    return {
      isEmpty: false,
      isDuplicate: !!duplicateDoc,
      duplicateDoc: duplicateDoc || null,
      hasSyntaxError,
      isCompliant: !duplicateDoc && !hasSyntaxError,
      suggestedFix: suggestedFix !== raw ? suggestedFix : undefined,
      suggestedFreeCode: freeCodeCalc.suggestedCode,
      nextSuggestedVersion,
      detectedSociety: soc,
      detectedTypology: typ
    };
  }, [formCode, editingDocId, documents]);

  // Lista única de áreas propietarias
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    auditedList.forEach(d => {
      if (d.ownerArea) set.add(d.ownerArea);
    });
    return Array.from(set).sort();
  }, [auditedList]);

  // Función auxiliar de emparejamiento entre documento y los 14 macroprocesos regionales
  const matchDocWithTaxonomy = (doc: AuditedDocument, taxonomyId: number): boolean => {
    const proc = GLOBAL66_PROCESS_TAXONOMY.find(p => p.id === taxonomyId);
    if (!proc) return false;

    const hay = `${doc.code} ${doc.title} ${doc.ownerArea} ${doc.macroprocess || ''} ${doc.subprocess || ''} ${doc.description || ''}`.toLowerCase();

    // 1. Coincidencia por área mapeada oficial
    if (proc.mappedProcessArea && (doc.ownerArea.toLowerCase().includes(proc.mappedProcessArea.toLowerCase()) || hay.includes(proc.mappedProcessArea.toLowerCase()))) {
      return true;
    }

    // 2. Coincidencia por áreas relevantes
    if (proc.relevantAreas && proc.relevantAreas.some(a => doc.ownerArea.toLowerCase().includes(a.toLowerCase()) || hay.includes(a.toLowerCase()))) {
      return true;
    }

    // 3. Coincidencia por términos clave del nivel 1
    const keywords = proc.categoryLevel1
      .toLowerCase()
      .split(/[\s,()/-]+/)
      .filter(w => w.length > 3 && !['para', 'sobre', 'gestión', 'global66'].includes(w));
    
    return keywords.some(k => hay.includes(k));
  };

  // Filtrado reactivo de la matriz
  const filteredList = useMemo(() => {
    return auditedList.filter(doc => {
      // 1. Búsqueda libre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = (doc.code || '').toLowerCase().includes(q);
        const matchesTitle = (doc.title || '').toLowerCase().includes(q);
        const matchesArea = (doc.ownerArea || '').toLowerCase().includes(q);
        const matchesElaborated = (doc.elaboratedBy || '').toLowerCase().includes(q);
        const matchesReviewed = (doc.reviewedBy || '').toLowerCase().includes(q);
        const matchesApproved = (doc.approvedBy || '').toLowerCase().includes(q);
        const matchesAct = (doc.actNumber || '').toLowerCase().includes(q);
        const matchesLog = (doc.changeLog || '').toLowerCase().includes(q);
        const matchesMacro = (doc.macroprocess || '').toLowerCase().includes(q);
        const matchesSub = (doc.subprocess || '').toLowerCase().includes(q);
        const matchesCrit = (doc.criticality || '').toLowerCase().includes(q);
        const matchesRole = (doc.responsibleRole || '').toLowerCase().includes(q);
        const matchesDesc = (doc.description || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesArea && !matchesElaborated && !matchesReviewed && !matchesApproved && !matchesAct && !matchesLog && !matchesMacro && !matchesSub && !matchesCrit && !matchesRole && !matchesDesc) {
          return false;
        }
      }

      // 2. Filtro País / Entidad
      if (countryFilter !== 'ALL') {
        if (doc.detectedCountry !== countryFilter) return false;
      }

      // 3. Filtro Sociedad Específica
      if (societyCodeFilter !== 'ALL') {
        if (doc.detectedSociety !== societyCodeFilter) return false;
      }

      // 4. Filtro Tipo
      if (typeFilter !== 'ALL') {
        if (doc.detectedTypology !== typeFilter) return false;
      }

      // 5. Filtro Área
      if (areaFilter !== 'ALL') {
        if (doc.ownerArea !== areaFilter) return false;
      }

      // 6. Filtro por Proceso Regional (14 Procesos)
      if (taxonomyFilter !== 'ALL') {
        if (!matchDocWithTaxonomy(doc, taxonomyFilter)) return false;
      }

      // 7. Filtro Estado de Gobierno
      if (governanceStatusFilter === 'COMPLIANT' && !doc.isCompliant) return false;
      if (governanceStatusFilter === 'DUPLICATES' && !doc.isDuplicate) return false;
      if (governanceStatusFilter === 'SYNTAX_ERRORS' && !doc.hasSyntaxError) return false;
      if (governanceStatusFilter === 'NO_ACTA' && (doc.actNumber && doc.actNumber.trim().length > 0)) return false;

      return true;
    });
  }, [auditedList, searchQuery, countryFilter, societyCodeFilter, typeFilter, areaFilter, taxonomyFilter, governanceStatusFilter]);

  // Contadores estadísticos
  const stats = useMemo(() => {
    const total = auditedList.length;
    const gccoCount = auditedList.filter(d => d.detectedSociety === 'GCCO').length;
    const chileCount = auditedList.filter(d => d.detectedCountry === 'Chile').length;
    const duplicates = auditedList.filter(d => d.isDuplicate).length;
    const syntaxErrors = auditedList.filter(d => d.hasSyntaxError).length;
    const compliant = auditedList.filter(d => d.isCompliant).length;
    const noActaCount = auditedList.filter(d => !d.actNumber || d.actNumber.trim().length === 0).length;
    const compliantRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

    return { total, gccoCount, chileCount, duplicates, syntaxErrors, compliant, compliantRate, noActaCount };
  }, [auditedList]);

  // ABRIR DRAWER DE VERSIONES
  const handleOpenHistoryDrawer = (doc: AuditedDocument) => {
    setSelectedDocForHistory(doc);
    setIsDrawerOpen(true);
  };

  // ACTUALIZAR DOCUMENTO DESDE DRAWER
  const handleUpdateDocument = (updatedDoc: AuditedDocument) => {
    const updated = documents.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    saveDocuments(updated);
    setSelectedDocForHistory(updatedDoc);
    showToast(`Historial de versiones de ${updatedDoc.code} actualizado.`, 'success');
  };

  // ELIMINAR DOCUMENTO
  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docToDelete = documents.find(d => d.id === id);
    if (confirm(`¿Estás seguro de eliminar el documento ${docToDelete?.code || ''} del inventario consolidado?`)) {
      const updated = documents.filter(d => d.id !== id);
      saveDocuments(updated);
      if (selectedDocForHistory?.id === id) {
        setIsDrawerOpen(false);
      }
      showToast(`Documento eliminado del repositorio.`, 'info');
    }
  };

  // EDITAR EN MODAL MANUAL
  const handleOpenEditModal = (doc: AuditedDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setIsNewVersionMode(false);
    setFormCode(doc.code);
    setFormTitle(doc.title);
    setFormArea(doc.ownerArea);
    setFormVersion(doc.version);
    setFormElaborated(doc.elaboratedBy || '');
    setFormReviewed(doc.reviewedBy || '');
    setFormApproved(doc.approvedBy || '');
    setFormApprovalDate(doc.approvalDate || doc.lastUpdated);
    setFormActNumber(doc.actNumber || '');
    setFormChangeLog(doc.changeLog || '');
    setFormNotes(doc.notes || '');

    // Sincronizar selectores del asistente con el código actual
    if (doc.code.startsWith('G81')) setAssistantSociety('G81');
    else if (doc.code.startsWith('GCCL')) setAssistantSociety('GCCL');
    else if (doc.code.startsWith('GCAR')) setAssistantSociety('GCAR');
    else if (doc.code.startsWith('GREG')) setAssistantSociety('GREG');
    else setAssistantSociety('GCCO');

    if (doc.code.includes('POL')) setAssistantTypology('POL');
    else if (doc.code.includes('MAN')) setAssistantTypology('MAN');
    else if (doc.code.includes('PCS')) setAssistantTypology('PCS');
    else setAssistantTypology('PRO');

    setModalOpen(true);
  };

  // NUEVO REGISTRO MANUAL CON SUGERENCIA OFICIAL AUTOMÁTICA
  const handleOpenCreateModal = () => {
    setEditingDocId(null);
    setIsNewVersionMode(false);

    const initialSociety: OfficialSocietyCode = 'GCCO';
    const initialType: DocTypology = 'PRO';
    const calc = calculateNextCorrelative(initialSociety, initialType, documents);

    setAssistantSociety(initialSociety);
    setAssistantTypology(initialType);
    setFormCode(calc.suggestedCode);
    setFormTitle('');
    setFormArea('Operaciones');
    setFormVersion('1.0');
    setFormElaborated('');
    setFormReviewed('');
    setFormApproved('Comité de Operaciones y Gobernanza');
    setFormApprovalDate(new Date().toISOString().split('T')[0]);
    setFormActNumber('');
    setFormChangeLog('Emisión y formalización inicial del documento oficial.');
    setFormNotes('');
    setModalOpen(true);
  };

  // APLICAR CÓDIGO SUGERIDO DESDE EL ASISTENTE
  const handleApplyAssistantCode = () => {
    setFormCode(assistantCodeSuggestion.suggestedCode);
    showToast(`Código asignado: ${assistantCodeSuggestion.suggestedCode}`, 'success');
  };

  // RESOLUCIÓN DUPLICIDAD A): CONVERTIR EN NUEVA VERSIÓN DEL DOCUMENTO EXISTENTE
  const handleResolveDuplicateAsNewVersion = () => {
    const targetDoc = formCodeValidation.duplicateDoc;
    if (!targetDoc) return;

    const nextVer = calculateNextVersion(targetDoc.version);
    setEditingDocId(targetDoc.id);
    setIsNewVersionMode(true);
    setFormCode(targetDoc.code);
    setFormTitle(targetDoc.title);
    setFormArea(targetDoc.ownerArea);
    setFormVersion(nextVer);
    setFormElaborated(targetDoc.elaboratedBy || '');
    setFormReviewed(targetDoc.reviewedBy || '');
    setFormApproved(targetDoc.approvedBy || 'Comité de Gobernanza');
    setFormApprovalDate(new Date().toISOString().split('T')[0]);
    setFormActNumber('');
    setFormChangeLog(`Actualización de versión a v${nextVer}. Inclusión de mejoras operativas.`);
    showToast(`Modo Nueva Versión activado para ${targetDoc.code} (v${nextVer}). Se preservará el histórico.`, 'info');
  };

  // RESOLUCIÓN DUPLICIDAD B): REASIGNAR AUTOMÁTICAMENTE EL SIGUIENTE CONSECUTIVO LIBRE
  const handleResolveDuplicateAsReassign = () => {
    if (formCodeValidation.suggestedFreeCode) {
      setFormCode(formCodeValidation.suggestedFreeCode);
      showToast(`Código reasignado al siguiente consecutivo libre: ${formCodeValidation.suggestedFreeCode}`, 'success');
    }
  };

  // NORMALIZACIÓN AUTOMÁTICA DE FORMATO
  const handleNormalizeSyntax = () => {
    if (formCodeValidation.suggestedFix) {
      setFormCode(formCodeValidation.suggestedFix);
      showToast(`Código normalizado a la norma ISO: ${formCodeValidation.suggestedFix}`, 'success');
    }
  };

  // ACCIÓN RÁPIDA DESDE LA MATRIZ: REASIGNAR CONSECUTIVO EN 1 CLIC PARA DOCUMENTOS DUPLICADOS
  const handleQuickReassignInMatrix = (doc: AuditedDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    const soc = doc.detectedSociety !== 'DESCONOCIDO' ? doc.detectedSociety : 'GCCO';
    const typ = doc.detectedTypology !== 'DESCONOCIDO' ? doc.detectedTypology : 'PRO';
    const nextFree = calculateNextCorrelative(soc, typ, documents);

    const updated = documents.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          code: nextFree.suggestedCode,
          changeLog: `${d.changeLog} [Reasignación automática de código por gobierno]`
        };
      }
      return d;
    });

    saveDocuments(updated);
    showToast(`Código de "${doc.title}" reasignado a ${nextFree.suggestedCode}`, 'success');
  };

  // ACCIÓN RÁPIDA DESDE LA MATRIZ: NORMALIZAR FORMATO EN 1 CLIC
  const handleQuickNormalizeSyntaxInMatrix = (doc: AuditedDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!doc.suggestedFixCode) return;

    const updated = documents.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          code: doc.suggestedFixCode!
        };
      }
      return d;
    });

    saveDocuments(updated);
    showToast(`Código corregido a: ${doc.suggestedFixCode}`, 'success');
  };

  // GUARDAR FORMULARIO MANUAL
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim()) return;

    const normalizedCode = formCode.trim().toUpperCase();

    // Bloqueo estricto de duplicidad
    const dupCheck = documents.find(d => d.code.trim().toUpperCase() === normalizedCode && d.id !== editingDocId);
    if (dupCheck) {
      alert(`⛔ Operación Bloqueada: El código ${normalizedCode} ya existe en el documento "${dupCheck.title}". Debes crear una nueva versión o reasignar el consecutivo.`);
      return;
    }

    if (editingDocId) {
      const updated = documents.map(doc => {
        if (doc.id === editingDocId) {
          const isCurrentVersionNew = doc.version !== formVersion.trim().replace(/^[Vv]/, '');
          
          let updatedVersionHistory: DocumentVersionHistoryEntry[] = doc.versionHistory ? [...doc.versionHistory] : [];

          if (isNewVersionMode || isCurrentVersionNew) {
            // Marcar las versiones anteriores como no vigentes
            updatedVersionHistory = updatedVersionHistory.map(v => ({ ...v, isCurrent: false }));
            // Agregar nueva versión
            updatedVersionHistory.push({
              version: formVersion.trim().replace(/^[Vv]/, ''),
              date: formApprovalDate,
              elaboratedBy: formElaborated.trim() || 'Equipo de Procesos',
              reviewedBy: formReviewed.trim() || 'Líder de GRC',
              approvedBy: formApproved.trim() || 'Comité de Gobernanza',
              actNumber: formActNumber.trim(),
              changeLog: formChangeLog.trim() || 'Actualización de versión.',
              isCurrent: true
            });
          } else {
            // Actualizar versión existente en el historial
            updatedVersionHistory = updatedVersionHistory.map(vh => vh.version === formVersion.trim().replace(/^[Vv]/, '') ? {
              ...vh,
              elaboratedBy: formElaborated.trim(),
              reviewedBy: formReviewed.trim(),
              approvedBy: formApproved.trim(),
              actNumber: formActNumber.trim(),
              changeLog: formChangeLog.trim(),
              date: formApprovalDate
            } : vh);
          }

          return {
            ...doc,
            code: normalizedCode,
            title: formTitle.trim(),
            ownerArea: formArea,
            version: formVersion.trim().replace(/^[Vv]/, ''),
            lastUpdated: formApprovalDate,
            approvalDate: formApprovalDate,
            elaboratedBy: formElaborated.trim(),
            reviewedBy: formReviewed.trim(),
            approvedBy: formApproved.trim(),
            actNumber: formActNumber.trim(),
            changeLog: formChangeLog.trim(),
            notes: formNotes.trim(),
            versionHistory: updatedVersionHistory
          };
        }
        return doc;
      });
      saveDocuments(updated);
      showToast(isNewVersionMode ? `🚀 ¡Nueva versión v${formVersion} registrada para ${normalizedCode}!` : `Documento ${normalizedCode} actualizado.`, 'success');
    } else {
      // Creación de nuevo documento
      const newDoc: AuditedDocument = {
        id: `doc-inv-${Date.now()}`,
        code: normalizedCode,
        title: formTitle.trim(),
        ownerArea: formArea,
        version: formVersion.trim().replace(/^[Vv]/, ''),
        lastUpdated: formApprovalDate,
        approvalDate: formApprovalDate,
        elaboratedBy: formElaborated.trim() || 'Equipo de Procesos',
        reviewedBy: formReviewed.trim() || 'Líder de GRC',
        approvedBy: formApproved.trim() || 'Comité de Gobernanza',
        actNumber: formActNumber.trim(),
        changeLog: formChangeLog.trim() || 'Emisión y formalización inicial del documento.',
        status: 'Vigente',
        notes: formNotes.trim(),
        detectedCountry: normalizedCode.startsWith('GCCO') ? 'Colombia' : normalizedCode.startsWith('G81') || normalizedCode.startsWith('GCCL') ? 'Chile' : normalizedCode.startsWith('GCAR') ? 'Argentina' : normalizedCode.startsWith('GREG') ? 'Regional' : 'Sin Clasificar',
        detectedSociety: normalizedCode.startsWith('GCCO') ? 'GCCO' : normalizedCode.startsWith('G81') ? 'G81' : normalizedCode.startsWith('GCCL') ? 'GCCL' : normalizedCode.startsWith('GCAR') ? 'GCAR' : normalizedCode.startsWith('GREG') ? 'GREG' : 'DESCONOCIDO',
        detectedTypology: normalizedCode.includes('PRO') ? 'PRO' : normalizedCode.includes('POL') ? 'POL' : normalizedCode.includes('MAN') ? 'MAN' : 'PCS',
        detectedCorrelative: normalizedCode.match(/\d{3}$/)?.[0] || '001',
        isDuplicate: false,
        hasSyntaxError: false,
        isCompliant: true,
        auditIssues: [],
        versionHistory: [
          {
            version: formVersion.trim().replace(/^[Vv]/, ''),
            date: formApprovalDate,
            elaboratedBy: formElaborated.trim() || 'Equipo de Procesos',
            reviewedBy: formReviewed.trim() || 'Líder de GRC',
            approvedBy: formApproved.trim() || 'Comité de Gobernanza',
            actNumber: formActNumber.trim(),
            changeLog: formChangeLog.trim() || 'Emisión y formalización inicial del documento.',
            isCurrent: true
          }
        ]
      };
      saveDocuments([newDoc, ...documents]);
      showToast(`✅ Documento ${normalizedCode} incorporado al Repositorio Máster con código oficial.`, 'success');
    }

    setModalOpen(false);
  };

  // EJECUTAR EXTRACCIÓN AUTOMÁTICA DE PORTADA
  const handleExtractCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawCoverInput.trim()) return;

    const extracted = parseDocumentCoverAndVersionLog(rawCoverInput);
    if (!extracted.code && !extracted.title) {
      setExtractorFeedback('⚠️ No se detectó un código o título claro en el texto. Revisa la estructura ingresada.');
      return;
    }

    const code = (extracted.code || `GCCO-PRO-${String(documents.length + 1).padStart(3, '0')}`).toUpperCase();
    const title = extracted.title || 'Documento Importado desde Portada';
    const version = (extracted.version || '1.0').replace(/^[Vv]/, '');
    const date = extracted.approvalDate || new Date().toISOString().split('T')[0];
    const elaborated = extracted.elaboratedBy || 'Autor detectado en portada';
    const reviewed = extracted.reviewedBy || 'Revisor detectado';
    const approved = extracted.approvedBy || 'Comité / Directorio';
    const actNumber = extracted.actNumber || '';
    const changeLog = extracted.changeLog || 'Metadatos extraídos de la portada y tabla de versiones.';

    // Verificar si el código extraído ya existe para resolver duplicidad automáticamente
    const duplicateDoc = documents.find(d => d.code.trim().toUpperCase() === code);

    if (duplicateDoc) {
      if (confirm(`El código ${code} ya existe en el repositorio ("${duplicateDoc.title}"). ¿Deseas agregar esta portada como una NUEVA VERSIÓN del documento existente en lugar de crear un duplicado?`)) {
        const nextVer = calculateNextVersion(duplicateDoc.version);
        const updatedVersionHistory: DocumentVersionHistoryEntry[] = duplicateDoc.versionHistory 
          ? duplicateDoc.versionHistory.map(v => ({ ...v, isCurrent: false }))
          : [];
        
        updatedVersionHistory.push({
          version: nextVer,
          date,
          elaboratedBy: elaborated,
          reviewedBy: reviewed,
          approvedBy: approved,
          actNumber,
          changeLog,
          isCurrent: true
        });

        const updated = documents.map(d => d.id === duplicateDoc.id ? {
          ...d,
          version: nextVer,
          lastUpdated: date,
          approvalDate: date,
          elaboratedBy: elaborated,
          reviewedBy: reviewed,
          approvedBy: approved,
          actNumber,
          changeLog,
          versionHistory: updatedVersionHistory
        } : d);

        saveDocuments(updated);
        setRawCoverInput('');
        setExtractorFeedback(`🚀 ¡Código ${code} actualizado a versión v${nextVer} en el documento existente!`);
        setTimeout(() => {
          setActiveTab('matrix');
          setExtractorFeedback(null);
        }, 1500);
        return;
      }
    }

    const newDoc: AuditedDocument = {
      id: `doc-ext-${Date.now()}`,
      code,
      title,
      ownerArea: extracted.ownerArea || 'Operaciones',
      version,
      lastUpdated: date,
      approvalDate: date,
      elaboratedBy: elaborated,
      reviewedBy: reviewed,
      approvedBy: approved,
      actNumber,
      changeLog,
      status: 'Vigente',
      rawInput: rawCoverInput,
      detectedCountry: code.startsWith('GCCO') ? 'Colombia' : code.startsWith('G81') || code.startsWith('GCCL') ? 'Chile' : code.startsWith('GCAR') ? 'Argentina' : code.startsWith('GREG') ? 'Regional' : 'Sin Clasificar',
      detectedSociety: code.startsWith('GCCO') ? 'GCCO' : code.startsWith('G81') ? 'G81' : code.startsWith('GCCL') ? 'GCCL' : code.startsWith('GCAR') ? 'GCAR' : code.startsWith('GREG') ? 'GREG' : 'DESCONOCIDO',
      detectedTypology: code.includes('PRO') ? 'PRO' : code.includes('POL') ? 'POL' : code.includes('MAN') ? 'MAN' : 'PCS',
      detectedCorrelative: code.match(/\d{3}$/)?.[0] || '001',
      isDuplicate: false,
      hasSyntaxError: false,
      isCompliant: true,
      auditIssues: [],
      versionHistory: extracted.versionHistory && extracted.versionHistory.length > 0 
        ? extracted.versionHistory 
        : [
            {
              version,
              date,
              elaboratedBy: elaborated,
              reviewedBy: reviewed,
              approvedBy: approved,
              actNumber,
              changeLog,
              isCurrent: true
            }
          ]
    };

    saveDocuments([newDoc, ...documents]);
    setRawCoverInput('');
    setExtractorFeedback(`✅ ¡Documento ${code} importado exitosamente con ${newDoc.versionHistory.length} versiones registradas!`);
    setTimeout(() => {
      setActiveTab('matrix');
      setExtractorFeedback(null);
    }, 1500);
  };

  // EXPORTACIÓN A EXCEL / CSV CON TODAS LAS COLUMNAS DE TRAZABILIDAD
  const handleExportConsolidatedMatrix = () => {
    const headers = [
      'Código Normalizado',
      'Título Oficial del Documento',
      'Proceso / Área Propietaria',
      'Versión Activa',
      'Elaborado por',
      'Revisado por',
      'Fecha de Aprobación',
      'Aprobado por',
      'N° de Acta Comité / Junta',
      'Log de Cambios (Versión Actual)',
      'Estado de Gobierno',
      'Sociedad / Entidad',
      'País',
      'Total Versiones Históricas',
      'Hallazgos de Auditoría'
    ];

    const rows = filteredList.map(doc => [
      `"${doc.code.replace(/"/g, '""')}"`,
      `"${doc.title.replace(/"/g, '""')}"`,
      `"${doc.ownerArea.replace(/"/g, '""')}"`,
      `"${doc.version}"`,
      `"${(doc.elaboratedBy || '').replace(/"/g, '""')}"`,
      `"${(doc.reviewedBy || '').replace(/"/g, '""')}"`,
      `"${doc.approvalDate || doc.lastUpdated}"`,
      `"${(doc.approvedBy || '').replace(/"/g, '""')}"`,
      `"${(doc.actNumber || 'Sin Acta').replace(/"/g, '""')}"`,
      `"${(doc.changeLog || '').replace(/"/g, '""')}"`,
      `"${doc.isDuplicate ? 'DUPLICADO' : doc.hasSyntaxError ? 'ERROR FORMATO' : 'VIGENTE'}"`,
      `"${doc.detectedSociety}"`,
      `"${doc.detectedCountry}"`,
      `"${doc.versionHistory?.length || 1}"`,
      `"${(doc.auditIssues.join(' | ') || 'Conforme').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Matriz_Consolidada_Inventario_Trazabilidad_Global66_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // RESTAURAR DATASET POR DEFECTO
  const handleResetDefaultData = () => {
    if (confirm('¿Restablecer el inventario consolidado con los documentos oficiales de prueba?')) {
      saveDocuments(INITIAL_CONSOLIDATED_INVENTORY);
      showToast('Inventario restaurado al dataset oficial.', 'info');
    }
  };

  // COMPLETAR IMPORTACIÓN MASIVA DESDE EXCEL
  const handleExcelImportComplete = (newDocs: AuditedDocument[], _mode: 'append' | 'replace') => {
    saveDocuments(newDocs);
    showToast(`¡Importación masiva completada! ${newDocs.length} documentos consolidados en la Matriz Máster.`, 'success');
    setActiveTab('matrix');
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* TOAST FEEDBACK FLOTANTE */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-900 text-emerald-100 border-emerald-500 shadow-emerald-950/30' 
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-500 shadow-amber-950/30'
                : 'bg-[#102A97] text-white border-blue-400 shadow-blue-950/30'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Info size={16} className="text-blue-300" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER PRINCIPAL - DESIGN SYSTEM GLOBAL66 */}
      <div className="bg-[#102A97] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#3F5EDF]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#00B582]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#00B582] text-white flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={14} />
                  <span>📚 Repositorio & Control Máster</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-100 border border-white/15">
                  Motor de Gobierno & Asignación Automática de Códigos
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Repositorio & Control Máster de Procesos
              </h1>
              <p className="text-sm text-blue-100 max-w-3xl leading-relaxed">
                Control estricto de nomenclaturas institucionales <code className="bg-white/15 px-1.5 py-0.5 rounded text-white font-mono">[Sociedad]-[Tipo]-[Correlativo]</code>, bloqueo automático de duplicados y trazabilidad histórica de versiones para <strong className="text-white">GCCO</strong>, <strong className="text-white">G81</strong> y <strong className="text-white">GCCL</strong>.
              </p>
            </div>

            {/* BOTONES DE ACCIÓN PRINCIPALES */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={() => setIsExcelImporterOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#00B582] hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/20"
                id="import_excel_matrix_btn"
              >
                <UploadCloud size={16} />
                <span>📤 Importar Inventario Excel</span>
              </button>

              <button
                onClick={handleExportConsolidatedMatrix}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer border border-white/20"
                id="export_matrix_btn"
              >
                <Download size={16} />
                <span>Exportar Matriz a CSV</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-white text-[#102A97] hover:bg-blue-50 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                id="add_doc_matrix_btn"
              >
                <Wand2 size={16} className="text-[#3F5EDF]" />
                <span>Registrar / Asignar Código</span>
              </button>
            </div>
          </div>

          {/* TARJETAS DE MÉTRICA RÁPIDA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-white/15">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-blue-200 block">Total Matriz:</span>
              <span className="text-2xl font-black text-white">{stats.total}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-blue-200 block">🇨🇴 GCCO Colombia:</span>
              <span className="text-2xl font-black text-emerald-300">{stats.gccoCount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-blue-200 block">🇨🇱 G81 / GCCL Chile:</span>
              <span className="text-2xl font-black text-sky-300">{stats.chileCount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-blue-200 block">Índice Conformidad:</span>
              <span className="text-2xl font-black text-emerald-400">{stats.compliantRate}%</span>
            </div>

            <div className={`p-3 rounded-2xl border ${stats.duplicates > 0 ? 'bg-[#FF647C]/20 border-[#FF647C]/50 text-rose-200' : 'bg-white/10 border-white/10'}`}>
              <span className="text-[11px] font-bold block">Duplicados:</span>
              <span className="text-2xl font-black text-white">{stats.duplicates}</span>
            </div>

            <div className={`p-3 rounded-2xl border ${stats.noActaCount > 0 ? 'bg-amber-400/20 border-amber-400/40 text-amber-200' : 'bg-white/10 border-white/10'}`}>
              <span className="text-[11px] font-bold block">Sin N° de Acta:</span>
              <span className="text-2xl font-black text-white">{stats.noActaCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE VISTA */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-[#102A97] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Matriz Consolidada de Trazabilidad</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {filteredList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('extractor')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'extractor'
                ? 'bg-[#102A97] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>Extractor de Portadas & Tablas de Versiones</span>
          </button>

          <button
            onClick={() => setActiveTab('coverage')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'coverage'
                ? 'bg-[#102A97] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            id="tab_process_coverage_btn"
          >
            <Layers size={16} className="text-[#00B582]" />
            <span>🗺️ Cobertura por Proceso & Empresa (14)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaultData}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Restablecer dataset oficial"
          >
            <RefreshCw size={14} />
            <span>Restablecer Datos</span>
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <div className="space-y-4">
          {/* BARRA DE FILTROS AVANZADOS */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* BUSCADOR */}
              <div className="md:col-span-4 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por código, nombre, elaborador, aprobador, n° de acta..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* FILTRO SOCIEDAD OFICIAL */}
              <div className="md:col-span-2">
                <select
                  value={societyCodeFilter}
                  onChange={e => setSocietyCodeFilter(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                >
                  <option value="ALL">🏢 Todas Sociedades</option>
                  <option value="GCCO">🇨🇴 GCCO (SEDPE)</option>
                  <option value="G81">💳 G81 (Global Card)</option>
                  <option value="GCCL">🏢 GCCL (SpA Hub)</option>
                  <option value="GCAR">🇦🇷 GCAR (Argentina)</option>
                  <option value="GREG">🌎 GREG (Regional)</option>
                </select>
              </div>

              {/* FILTRO TIPO */}
              <div className="md:col-span-2">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                >
                  <option value="ALL">📁 Todos los Tipos</option>
                  <option value="PRO">PRO - Procedimientos</option>
                  <option value="POL">POL - Políticas</option>
                  <option value="MAN">MAN - Manuales</option>
                  <option value="PCS">PCS - Macroprocesos</option>
                </select>
              </div>

              {/* FILTRO PROCESO REGIONAL (14 PROCESOS) */}
              <div className="md:col-span-4">
                <select
                  value={taxonomyFilter}
                  onChange={e => setTaxonomyFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                >
                  <option value="ALL">🗺️ Todos los Procesos Regionales (14)</option>
                  {GLOBAL66_PROCESS_TAXONOMY.map(proc => (
                    <option key={proc.id} value={proc.id}>
                      #{proc.id} - {proc.categoryLevel1}
                    </option>
                  ))}
                </select>
              </div>

              {/* FILTRO ÁREA PROPIETARIA */}
              <div className="md:col-span-3">
                <select
                  value={areaFilter}
                  onChange={e => setAreaFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                >
                  <option value="ALL">🏢 Todas las Áreas Propietarias</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* BOTONES DE FILTRADO RÁPIDO DE ESTADO DE GOBIERNO */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter size={12} />
                <span>Filtro de Estado:</span>
              </span>

              {/* BOTÓN 1: TODOS */}
              <button
                onClick={() => setGovernanceStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  governanceStatusFilter === 'ALL'
                    ? 'bg-[#102A97] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                id="filter_all_btn"
              >
                <span>Todos</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${governanceStatusFilter === 'ALL' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                  {auditedList.length}
                </span>
              </button>

              {/* BOTÓN 2: 🟢 CONFORMES */}
              <button
                onClick={() => setGovernanceStatusFilter('COMPLIANT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  governanceStatusFilter === 'COMPLIANT'
                    ? 'bg-[#00B582] text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
                }`}
                id="filter_compliant_btn"
              >
                <span>🟢 Conformes (Norma Oficial)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${governanceStatusFilter === 'COMPLIANT' ? 'bg-white/25' : 'bg-emerald-200 text-emerald-900'}`}>
                  {stats.compliant}
                </span>
              </button>

              {/* BOTÓN 3: 🔴 DUPLICADOS */}
              <button
                onClick={() => setGovernanceStatusFilter('DUPLICATES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  governanceStatusFilter === 'DUPLICATES'
                    ? 'bg-[#FF647C] text-white shadow-xs animate-pulse'
                    : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-300'
                }`}
                id="filter_duplicates_btn"
              >
                <span>🔴 Duplicados</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${governanceStatusFilter === 'DUPLICATES' ? 'bg-white/25' : 'bg-rose-200 text-rose-900'}`}>
                  {stats.duplicates}
                </span>
              </button>

              {/* BOTÓN 4: 🟡 FORMATO INVÁLIDO */}
              <button
                onClick={() => setGovernanceStatusFilter('SYNTAX_ERRORS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  governanceStatusFilter === 'SYNTAX_ERRORS'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
                id="filter_syntax_errors_btn"
              >
                <span>🟡 Formato Inválido (Sintaxis)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${governanceStatusFilter === 'SYNTAX_ERRORS' ? 'bg-white/25' : 'bg-amber-200 text-amber-900'}`}>
                  {stats.syntaxErrors}
                </span>
              </button>

              {/* BOTÓN 5: 📋 SIN N° DE ACTA */}
              <button
                onClick={() => setGovernanceStatusFilter('NO_ACTA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  governanceStatusFilter === 'NO_ACTA'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                }`}
                id="filter_no_acta_btn"
              >
                <span>📋 Sin N° de Acta</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${governanceStatusFilter === 'NO_ACTA' ? 'bg-white/25' : 'bg-purple-200 text-purple-900'}`}>
                  {stats.noActaCount}
                </span>
              </button>
            </div>
          </div>

          {/* TABLA PRINCIPAL DE LA MATRIZ CONSOLIDADA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#102A97] text-white font-black uppercase text-[10px] tracking-wider border-b border-blue-900">
                    <th className="py-3.5 px-4 whitespace-nowrap">Código Normalizado</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Nombre Oficial del Documento</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Proceso / Área</th>
                    <th className="py-3.5 px-2.5 text-center whitespace-nowrap">Versión</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Elaborado por</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Revisado por</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Fecha Aprobación</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Aprobado por & N° Acta</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Log de Cambios (Motivo)</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">Estado / Control</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <FileText size={32} className="mx-auto text-slate-300" />
                          <p className="font-bold text-slate-600">No se encontraron documentos con los filtros seleccionados.</p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setCountryFilter('ALL');
                              setTypeFilter('ALL');
                              setAreaFilter('ALL');
                              setGovernanceStatusFilter('ALL');
                            }}
                            className="text-xs text-[#3F5EDF] font-bold hover:underline"
                          >
                            Limpiar todos los filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((doc, idx) => {
                      const isDup = doc.isDuplicate;
                      const hasErr = doc.hasSyntaxError;
                      const noActa = !doc.actNumber || doc.actNumber.trim().length === 0;

                      return (
                        <tr
                          key={doc.id}
                          onClick={() => handleOpenDocViewer(doc)}
                          className={`hover:bg-[#F4F6FE] transition-colors cursor-pointer group ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          } ${isDup ? 'bg-rose-50/60' : hasErr ? 'bg-amber-50/40' : ''}`}
                        >
                          {/* 1. CÓDIGO NORMALIZADO */}
                          <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                isDup
                                  ? 'bg-[#FF647C] text-white shadow-xs'
                                  : hasErr
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-[#3F5EDF]/10 text-[#102A97] border border-[#3F5EDF]/30'
                              }`}>
                                {doc.code}
                              </span>
                              {doc.suggestedFixCode && (
                                <button
                                  onClick={(e) => handleQuickNormalizeSyntaxInMatrix(doc, e)}
                                  className="text-[10px] text-amber-800 font-black bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-0.5 cursor-pointer"
                                  title="Haz clic para normalizar código automáticamente"
                                >
                                  <span>➜ Corregir: {doc.suggestedFixCode}</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 2. NOMBRE OFICIAL */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 leading-tight group-hover:text-[#102A97] transition-colors">
                              {doc.title}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>Sociedad: <strong>{doc.detectedSociety}</strong> ({doc.detectedCountry})</span>
                              {doc.macroprocess && (
                                <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${
                                  doc.macroprocess.toLowerCase().includes('estrateg') ? 'bg-purple-100 text-purple-800' :
                                  doc.macroprocess.toLowerCase().includes('apoyo') ? 'bg-slate-100 text-slate-700' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {doc.macroprocess}
                                </span>
                              )}
                              {doc.subprocess && (
                                <span className="text-slate-600 font-medium">
                                  • {doc.subprocess}
                                </span>
                              )}
                              {doc.criticality && (
                                <span className={`px-1 py-0.2 rounded font-black text-[9px] ${
                                  doc.criticality === 'ALTA' ? 'bg-rose-100 text-rose-800' :
                                  doc.criticality === 'MEDIA' ? 'bg-amber-100 text-amber-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {doc.criticality}
                                </span>
                              )}
                              {doc.driveOrLoomUrl && (
                                <a
                                  href={doc.driveOrLoomUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-[#3F5EDF] hover:underline flex items-center gap-0.5 font-bold"
                                >
                                  <ExternalLink size={10} />
                                  <span>Drive/Loom</span>
                                </a>
                              )}
                              {doc.versionHistory && doc.versionHistory.length > 1 && (
                                <span className="text-[#3F5EDF] font-bold flex items-center gap-0.5">
                                  <History size={10} />
                                  <span>{doc.versionHistory.length} versiones</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. PROCESO / ÁREA */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {doc.ownerArea}
                            </span>
                          </td>

                          {/* 4. VERSIÓN */}
                          <td className="py-3 px-2.5 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                              v{doc.version}
                            </span>
                          </td>

                          {/* 5. ELABORADO POR */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <UserCheck size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[130px]" title={doc.elaboratedBy}>
                                {doc.elaboratedBy || 'No especificado'}
                              </span>
                            </div>
                          </td>

                          {/* 6. REVISADO POR */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                            <span className="truncate max-w-[130px] block" title={doc.reviewedBy}>
                              {doc.reviewedBy || 'N/A'}
                            </span>
                          </td>

                          {/* 7. FECHA DE APROBACIÓN */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium text-[11px]">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400" />
                              <span>{doc.approvalDate || doc.lastUpdated}</span>
                            </div>
                          </td>

                          {/* 8. APROBADO POR & N° DE ACTA */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 text-[11px] leading-tight">
                              {doc.approvedBy || 'Comité de Gobernanza'}
                            </div>
                            <div className="mt-1">
                              {doc.actNumber ? (
                                <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-[#102A97] border border-blue-200">
                                  📋 {doc.actNumber}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  ⚠️ Sin Acta
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 9. LOG DE CAMBIOS */}
                          <td className="py-3 px-4">
                            <p className="text-slate-600 text-[11px] font-normal leading-tight line-clamp-2" title={doc.changeLog}>
                              {doc.changeLog || 'Sin descripción de cambios.'}
                            </p>
                          </td>

                          {/* 10. ESTADO / GOBIERNO */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {isDup ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="px-2 py-1 rounded-md text-[10px] font-black bg-[#FF647C] text-white inline-flex items-center gap-1 shadow-xs">
                                  <AlertOctagon size={11} />
                                  <span>DUPLICADO</span>
                                </span>
                                <button
                                  onClick={(e) => handleQuickReassignInMatrix(doc, e)}
                                  className="text-[9px] font-black text-rose-800 bg-rose-100 hover:bg-rose-200 px-1.5 py-0.5 rounded border border-rose-300 cursor-pointer"
                                  title="Reasignar al siguiente correlativo libre"
                                >
                                  ⚡ Reasignar Libre
                                </button>
                              </div>
                            ) : hasErr ? (
                              <span className="px-2 py-1 rounded-md text-[10px] font-black bg-amber-400 text-amber-950 inline-flex items-center gap-1">
                                <AlertTriangle size={11} />
                                <span>FORMATO</span>
                              </span>
                            ) : noActa ? (
                              <span className="px-2 py-1 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300 inline-flex items-center gap-1">
                                <span>SIN ACTA</span>
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-[#00B582]" />
                                <span>CONFORME</span>
                              </span>
                            )}
                          </td>

                          {/* 11. ACCIONES */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                              {/* BOTÓN DIRECTO VER DOCUMENTO */}
                              <button
                                onClick={e => handleOpenDocViewer(doc, e)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#102A97] hover:bg-[#3F5EDF] text-white font-black text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Abrir Visor Oficial con exportación a PDF/Word"
                                id={`view_doc_btn_${doc.code}`}
                              >
                                <Eye size={13} />
                                <span>Ver</span>
                              </button>

                              <button
                                onClick={() => handleOpenHistoryDrawer(doc)}
                                className="p-1.5 rounded-lg bg-blue-50 text-[#102A97] hover:bg-[#102A97] hover:text-white transition-all cursor-pointer"
                                title="Ver Histórico Completo de Versiones"
                              >
                                <History size={14} />
                              </button>

                              <button
                                onClick={e => handleOpenEditModal(doc, e)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                                title="Editar / Asignar Código"
                              >
                                <Edit3 size={14} />
                              </button>

                              <button
                                onClick={e => handleDeleteDoc(doc.id, e)}
                                className="p-1.5 rounded-lg bg-rose-50 text-[#FF647C] hover:bg-[#FF647C] hover:text-white transition-all cursor-pointer"
                                title="Eliminar Documento"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER DE LA TABLA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span>Mostrando <strong>{filteredList.length}</strong> de <strong>{auditedList.length}</strong> documentos registrados.</span>
                <span className="text-slate-300">|</span>
                <span className="text-[#3F5EDF] font-bold">💡 Haz clic en cualquier fila para inspeccionar o agregar versiones en el panel lateral.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportConsolidatedMatrix}
                  className="font-bold text-[#102A97] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Descargar Matriz CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'extractor' ? (
        /* PESTAÑA: EXTRACTOR INTELIGENTE DE PORTADAS & TABLAS DE VERSIONES */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  <h2 className="text-lg font-black text-[#102A97]">
                    Extractor Automático de Metadatos de Portadas y Control de Versiones
                  </h2>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">
                  Pega el encabezado, portada o la tabla de control de cambios de cualquier documento (Word, PDF o Google Docs). El motor extraerá automáticamente el código, nombre, área, versión, elaborador, revisor, aprobador, n° de acta y log de cambios para incorporarlo directamente a la Matriz Consolidada.
                </p>
              </div>
            </div>

            {extractorFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                extractorFeedback.startsWith('✅') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                <span>{extractorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleExtractCover} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Texto de Portada / Encabezado / Tabla de Control de Versiones:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRawCoverInput(`CÓDIGO: GCCO-PRO-035\nTÍTULO: Procedimiento de Reembolsos y Devoluciones a Cuentas Destino\nÁREA: Tesorería y Finanzas\nVERSIÓN: 2.1\nFECHA DE APROBACIÓN: 2026-08-15\nELABORADO POR: Sofía Valenzuela (Analista Financiero)\nREVISADO POR: Rodrigo Castro (Head of Treasury)\nAPROBADO POR: Comité de Riesgos y Finanzas\nN° DE ACTA: Acta Comité Finanzas N° 33-2026\nLOG DE CAMBIOS: Reducción del SLA de reembolso de 48h a 12h mediante dispersión inmediata vía ACH.\n\nCONTROL DE VERSIONES:\nv1.0 | 2025-04-10 | Sofía Valenzuela | Rodrigo Castro | Comité Finanzas | Acta N° 12-2025 | Creación del procedimiento de reembolsos manuales.\nv2.1 | 2026-08-15 | Sofía Valenzuela | Rodrigo Castro | Comité Finanzas | Acta Comité Finanzas N° 33-2026 | Automatización de dispersión vía ACH y reducción de SLA.`)}
                      className="text-[11px] font-bold text-[#3F5EDF] hover:underline cursor-pointer"
                    >
                      Cargar Ejemplo 1 (Colombia)
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setRawCoverInput(`CÓDIGO: G81-MAN-002\nTÍTULO: Manual de Gestión de Incidentes de Ciberseguridad y Notificación CMF\nÁREA: Ciberseguridad\nVERSIÓN: 1.0\nFECHA: 2026-07-20\nELABORADO POR: Javier Morales (SecOps Lead)\nREVISADA POR: Constanza Vega (CISO)\nAPROBADA POR: Directorio Global 81 SpA\nACTA: Acta Directorio G81 N° 08-2026\nMOTIVO: Protocolo de activación del CSIRT y reporte mandatorio en menos de 4 horas.`)}
                      className="text-[11px] font-bold text-[#3F5EDF] hover:underline cursor-pointer"
                    >
                      Cargar Ejemplo 2 (Chile)
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  required
                  value={rawCoverInput}
                  onChange={e => setRawCoverInput(e.target.value)}
                  placeholder="Pega aquí el texto de la portada institucional o la tabla de versiones..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-medium">
                  El motor analiza automáticamente etiquetas como Elaborado por, Revisado por, Aprobado por, N° de Acta, Versión, Fecha y Tabla de Control.
                </span>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#102A97] hover:bg-[#0d2170] text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Procesar e Incorporar a la Matriz</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* PESTAÑA: MATRIZ DE COBERTURA POR PROCESO & EMPRESA (14 PROCESOS) */
        <div className="space-y-6">
          {/* HEADER INFORMATIVO DE COBERTURA */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                  Matriz Cruzada de Cobertura
                </span>
                <span className="text-xs font-bold text-slate-300">
                  14 Macroprocesos vs. 4 Entidades Corporativas
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Cobertura Documental por Empresa (G81 • GCCO • GCCL • GREG)
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Verifica en tiempo real qué procedimientos, políticas y manuales existen formalizados para cada proceso según el rol de cada filial. Identifica brechas documentales antes de auditorías de la CMF o SFC.
              </p>
            </div>

            {/* BOTONES DE ACCIÓN RÁPIDA DE COBERTURA */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const headers = [
                    'ID Proceso',
                    'Macrocategoría',
                    'Categoría Nivel 1',
                    'Grupos Nivel 2',
                    'Rol Global Card (G81)',
                    'Docs Global Card (G81)',
                    'Rol SEDPE Colombia (GCCO)',
                    'Docs SEDPE Colombia (GCCO)',
                    'Rol SpA Hub (GCCL)',
                    'Docs SpA Hub (GCCL)',
                    'Rol Regional (GREG)',
                    'Docs Regional (GREG)'
                  ];

                  const rows = GLOBAL66_PROCESS_TAXONOMY.map(proc => {
                    const g81Docs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'G81').map(d => `${d.code} (${d.version})`).join('; ') || 'Sin docs formalizados';
                    const gccoDocs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'GCCO').map(d => `${d.code} (${d.version})`).join('; ') || 'Sin docs formalizados';
                    const gcclDocs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'GCCL').map(d => `${d.code} (${d.version})`).join('; ') || 'Sin docs formalizados';
                    const gregDocs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'GREG').map(d => `${d.code} (${d.version})`).join('; ') || 'Sin docs formalizados';

                    return [
                      proc.id,
                      proc.macrocategory,
                      `"${proc.categoryLevel1.replace(/"/g, '""')}"`,
                      `"${proc.processGroupLevel2.replace(/"/g, '""')}"`,
                      `"${proc.globalCardChile.replace(/"/g, '""')}"`,
                      `"${g81Docs}"`,
                      `"${proc.sedpeColombia.replace(/"/g, '""')}"`,
                      `"${gccoDocs}"`,
                      `"${proc.global81Hub.replace(/"/g, '""')}"`,
                      `"${gcclDocs}"`,
                      `"Marco Corporativo"`,
                      `"${gregDocs}"`
                    ];
                  });

                  const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Matriz_Cobertura_Procesos_Empresas_Global66_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                id="btn_export_coverage_matrix"
              >
                <Download size={14} />
                <span>Exportar Cobertura (CSV)</span>
              </button>
            </div>
          </div>

          {/* LISTADO DE LOS 14 PROCESOS CON DESGLOSE POR EMPRESA */}
          <div className="space-y-4">
            {GLOBAL66_PROCESS_TAXONOMY.map(proc => {
              // Obtener documentos por empresa para este proceso
              const g81Docs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'G81');
              const gccoDocs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'GCCO');
              const gcclDocs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'GCCL');
              const gregDocs = auditedList.filter(d => matchDocWithTaxonomy(d, proc.id) && d.detectedSociety === 'GREG');

              const totalDocs = g81Docs.length + gccoDocs.length + gcclDocs.length + gregDocs.length;

              return (
                <div 
                  key={proc.id} 
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  id={`process_coverage_row_${proc.id}`}
                >
                  {/* CABECERA DEL PROCESO */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#102A97] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        #{proc.id}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            proc.macrocategory === 'Estratégicos' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            proc.macrocategory === 'Misionales' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            proc.macrocategory === 'De Apoyo' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {proc.macrocategory}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Área GRC: <strong className="text-slate-800">{proc.mappedProcessArea || 'General'}</strong>
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {proc.categoryLevel1}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          <span className="font-bold text-slate-600">Subprocesos: </span>
                          {proc.processGroupLevel2}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                        totalDocs > 0 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {totalDocs > 0 ? `${totalDocs} documentos formalizados` : '⚠️ 0 documentos (Brecha)'}
                      </span>
                    </div>
                  </div>

                  {/* MATRIZ DE 4 COLUMNAS (CARD, SEDPE, SPA, REGIONAL) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-4 gap-4">
                    {/* COLUMNA 1: GLOBAL CARD (CHILE - G81) */}
                    <div className="space-y-2.5 flex flex-col justify-between pt-2 md:pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">💳</span>
                            <span className="text-xs font-black text-slate-900">Global Card (G81)</span>
                          </div>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                            CMF Chile
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2" title={proc.globalCardChile}>
                          {proc.globalCardChile}
                        </p>

                        {/* LISTADO DE DOCS G81 */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Docs Registrados ({g81Docs.length}):
                          </span>
                          {g81Docs.length > 0 ? (
                            <div className="space-y-1">
                              {g81Docs.map(d => (
                                <div 
                                  key={d.id}
                                  onClick={() => handleOpenDocViewer(d)}
                                  className="p-1.5 rounded-lg bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between gap-1 group"
                                  title={`Ver documento ${d.code}: ${d.title}`}
                                >
                                  <div className="truncate">
                                    <span className="font-black text-[#102A97]">{d.code}</span>: <span className="font-semibold">{d.title}</span>
                                  </div>
                                  <Eye size={12} className="text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-amber-50/60 border border-dashed border-amber-200 text-[11px] text-amber-800 font-semibold text-center">
                              Sin documentos G81
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BOTÓN CREAR DOC G81 */}
                      <button
                        onClick={() => {
                          setAssistantSociety('G81');
                          setAssistantTypology('PRO');
                          setFormArea(proc.mappedProcessArea || 'Operaciones');
                          setFormTitle(`Procedimiento de ${proc.categoryLevel1}`);
                          const calc = calculateNextCorrelative('G81', 'PRO', auditedList);
                          setFormCode(calc.suggestedCode);
                          setEditingDocId(null);
                          setModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={13} className="text-emerald-600" />
                        <span>Formalizar para Global Card</span>
                      </button>
                    </div>

                    {/* COLUMNA 2: SEDPE COLOMBIA (GCCO) */}
                    <div className="space-y-2.5 flex flex-col justify-between pt-3 md:pt-0 md:pl-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🇨🇴</span>
                            <span className="text-xs font-black text-slate-900">SEDPE (GCCO)</span>
                          </div>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            SFC Colombia
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2" title={proc.sedpeColombia}>
                          {proc.sedpeColombia}
                        </p>

                        {/* LISTADO DE DOCS GCCO */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Docs Registrados ({gccoDocs.length}):
                          </span>
                          {gccoDocs.length > 0 ? (
                            <div className="space-y-1">
                              {gccoDocs.map(d => (
                                <div 
                                  key={d.id}
                                  onClick={() => handleOpenDocViewer(d)}
                                  className="p-1.5 rounded-lg bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200 text-blue-950 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between gap-1 group"
                                  title={`Ver documento ${d.code}: ${d.title}`}
                                >
                                  <div className="truncate">
                                    <span className="font-black text-[#102A97]">{d.code}</span>: <span className="font-semibold">{d.title}</span>
                                  </div>
                                  <Eye size={12} className="text-[#102A97] shrink-0 group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-amber-50/60 border border-dashed border-amber-200 text-[11px] text-amber-800 font-semibold text-center">
                              Sin documentos GCCO
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BOTÓN CREAR DOC GCCO */}
                      <button
                        onClick={() => {
                          setAssistantSociety('GCCO');
                          setAssistantTypology('PRO');
                          setFormArea(proc.mappedProcessArea || 'Operaciones');
                          setFormTitle(`Procedimiento de ${proc.categoryLevel1}`);
                          const calc = calculateNextCorrelative('GCCO', 'PRO', auditedList);
                          setFormCode(calc.suggestedCode);
                          setEditingDocId(null);
                          setModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={13} className="text-blue-600" />
                        <span>Formalizar para SEDPE</span>
                      </button>
                    </div>

                    {/* COLUMNA 3: GLOBAL 81 SPA HUB (GCCL) */}
                    <div className="space-y-2.5 flex flex-col justify-between pt-3 md:pt-0 md:pl-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🏢</span>
                            <span className="text-xs font-black text-slate-900">SpA Hub (GCCL)</span>
                          </div>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                            Casa Matriz
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2" title={proc.global81Hub}>
                          {proc.global81Hub}
                        </p>

                        {/* LISTADO DE DOCS GCCL */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Docs Registrados ({gcclDocs.length}):
                          </span>
                          {gcclDocs.length > 0 ? (
                            <div className="space-y-1">
                              {gcclDocs.map(d => (
                                <div 
                                  key={d.id}
                                  onClick={() => handleOpenDocViewer(d)}
                                  className="p-1.5 rounded-lg bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-950 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between gap-1 group"
                                  title={`Ver documento ${d.code}: ${d.title}`}
                                >
                                  <div className="truncate">
                                    <span className="font-black text-[#102A97]">{d.code}</span>: <span className="font-semibold">{d.title}</span>
                                  </div>
                                  <Eye size={12} className="text-indigo-700 shrink-0 group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-amber-50/60 border border-dashed border-amber-200 text-[11px] text-amber-800 font-semibold text-center">
                              Sin documentos GCCL
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BOTÓN CREAR DOC GCCL */}
                      <button
                        onClick={() => {
                          setAssistantSociety('GCCL');
                          setAssistantTypology('POL');
                          setFormArea(proc.mappedProcessArea || 'Operaciones');
                          setFormTitle(`Política de ${proc.categoryLevel1}`);
                          const calc = calculateNextCorrelative('GCCL', 'POL', auditedList);
                          setFormCode(calc.suggestedCode);
                          setEditingDocId(null);
                          setModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={13} className="text-indigo-600" />
                        <span>Formalizar para SpA Hub</span>
                      </button>
                    </div>

                    {/* COLUMNA 4: REGIONAL HOLDING (GREG) */}
                    <div className="space-y-2.5 flex flex-col justify-between pt-3 md:pt-0 md:pl-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🌎</span>
                            <span className="text-xs font-black text-slate-900">Regional (GREG)</span>
                          </div>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-50 text-purple-900 border border-purple-200">
                            Holding Latam
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                          Políticas marco y estándares globales aplicables en toda América Latina.
                        </p>

                        {/* LISTADO DE DOCS GREG */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Docs Registrados ({gregDocs.length}):
                          </span>
                          {gregDocs.length > 0 ? (
                            <div className="space-y-1">
                              {gregDocs.map(d => (
                                <div 
                                  key={d.id}
                                  onClick={() => handleOpenDocViewer(d)}
                                  className="p-1.5 rounded-lg bg-purple-50/60 hover:bg-purple-100/80 border border-purple-200 text-purple-950 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between gap-1 group"
                                  title={`Ver documento ${d.code}: ${d.title}`}
                                >
                                  <div className="truncate">
                                    <span className="font-black text-[#102A97]">{d.code}</span>: <span className="font-semibold">{d.title}</span>
                                  </div>
                                  <Eye size={12} className="text-purple-700 shrink-0 group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-slate-100 border border-dashed border-slate-200 text-[11px] text-slate-500 font-semibold text-center">
                              0 políticas marco GREG
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BOTÓN CREAR DOC GREG */}
                      <button
                        onClick={() => {
                          setAssistantSociety('GREG');
                          setAssistantTypology('POL');
                          setFormArea(proc.mappedProcessArea || 'Operaciones');
                          setFormTitle(`Política Regional de ${proc.categoryLevel1}`);
                          const calc = calculateNextCorrelative('GREG', 'POL', auditedList);
                          setFormCode(calc.suggestedCode);
                          setEditingDocId(null);
                          setModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={13} className="text-purple-600" />
                        <span>Crear Política Marco</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISOR OFICIAL INTERACTIVO DE DOCUMENTO */}
      <DocumentViewerModal
        document={selectedDocForViewer}
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        onOpenHistoryDrawer={(doc) => handleOpenHistoryDrawer(doc)}
      />

      {/* DRAWER LATERAL DE HISTORIAL DE VERSIONES */}
      <DocumentVersionHistoryDrawer
        document={selectedDocForHistory}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateDocument={handleUpdateDocument}
      />

      {/* MODAL DE CREACIÓN / EDICIÓN MANUAL CON MOTOR DE ASIGNACIÓN Y BLOQUEO DE DUPLICADOS */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 font-sans max-h-[92vh] overflow-y-auto"
            >
              {/* ENCABEZADO DEL MODAL */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#102A97]/10 text-[#102A97]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#102A97]">
                      {isNewVersionMode 
                        ? `🚀 Registrar Nueva Versión para ${formCode}` 
                        : editingDocId 
                        ? 'Editar Metadatos de Documento' 
                        : 'Generador y Validador de Códigos Corporativos'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Estándar de Nomenclatura ISO 31000 & ISO 9001: <code className="text-[#102A97] font-bold">[Sociedad]-[Tipo]-[Correlativo 3 dígitos]</code>
                    </p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* ASISTENTE INTERACTIVO DE ASIGNACIÓN AUTOMÁTICA DE CÓDIGO (SOLO EN MODO CREACIÓN / EDICIÓN LIBRE) */}
              {!isNewVersionMode && (
                <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#102A97]">
                      <Wand2 size={15} className="text-[#3F5EDF]" />
                      <span>Asistente de Codificación Oficial Automática:</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      Base de datos: {documents.length} docs registrados
                    </span>
                  </div>

                  {/* SELECTOR 1: SOCIEDAD CORPORATIVA */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      1. Selecciona la Sociedad / Entidad Legal:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {OFFICIAL_SOCIETIES.map(soc => (
                        <button
                          key={soc.code}
                          type="button"
                          onClick={() => setAssistantSociety(soc.code)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            assistantSociety === soc.code
                              ? 'bg-[#102A97] text-white border-[#102A97] shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-black">
                            <span>{soc.flag}</span>
                            <span>{soc.code}</span>
                          </div>
                          <p className={`text-[9px] leading-tight mt-0.5 truncate font-medium ${assistantSociety === soc.code ? 'text-blue-100' : 'text-slate-400'}`}>
                            {soc.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SELECTOR 2: TIPOLOGÍA DOCUMENTAL */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      2. Selecciona el Tipo de Documento:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OFFICIAL_TYPOLOGIES.map(typ => (
                        <button
                          key={typ.code}
                          type="button"
                          onClick={() => setAssistantTypology(typ.code)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            assistantTypology === typ.code
                              ? 'bg-[#00B582] text-white border-[#00B582] shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-xs font-black">
                            <span>{typ.icon}</span>
                            <span>{typ.code}</span>
                          </div>
                          <p className={`text-[9px] leading-tight mt-0.5 truncate font-medium ${assistantTypology === typ.code ? 'text-emerald-50' : 'text-slate-400'}`}>
                            {typ.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RESULTADO Y SUGERENCIA CON AUTO-INCREMENTO */}
                  <div className="p-3 bg-white rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <span>Correlativo calculado:</span>
                        <span className="font-mono font-black text-slate-900">
                          {assistantCodeSuggestion.totalForCombination > 0 
                            ? `Último existente ${String(assistantCodeSuggestion.maxNumber).padStart(3, '0')} (${assistantCodeSuggestion.totalForCombination} docs)` 
                            : 'Sin registros previos (inicia en 001)'}
                        </span>
                      </div>
                      <div className="text-xs font-black text-[#102A97] flex items-center gap-1.5">
                        <span>Siguiente Código Oficial:</span>
                        <span className="font-mono bg-blue-100 text-[#102A97] px-2 py-0.5 rounded-lg border border-blue-300">
                          {assistantCodeSuggestion.suggestedCode}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyAssistantCode}
                      className="px-3.5 py-2 rounded-xl bg-[#102A97] hover:bg-[#3F5EDF] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Aplicar este Código</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MOTOR DE BLOQUEO DE DUPLICADOS E INCONSISTENCIAS */}
              {formCodeValidation.isDuplicate && (
                <div className="p-4 bg-rose-50 border-2 border-[#FF647C] rounded-2xl space-y-3 animate-shake">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#FF647C] text-white shrink-0 mt-0.5">
                      <AlertOctagon size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                        ⛔ BLOQUEO DE DUPLICIDAD: El código '{formCode}' ya se encuentra asignado
                      </h4>
                      <p className="text-xs text-rose-900 leading-relaxed font-medium">
                        El documento <strong className="text-rose-950">"{formCodeValidation.duplicateDoc?.title}"</strong> (Versión actual: <span className="font-mono font-bold">v{formCodeValidation.duplicateDoc?.version}</span>, Área: <strong>{formCodeValidation.duplicateDoc?.ownerArea}</strong>) ya tiene asignada esta nomenclatura.
                      </p>
                      <p className="text-[11px] text-rose-800 font-semibold">
                        Por norma de gobernanza, no se permite registrar un documento independiente con el mismo código. Elige una de las siguientes opciones de gobierno:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* OPCIÓN A: CREAR NUEVA VERSIÓN */}
                    <button
                      type="button"
                      onClick={handleResolveDuplicateAsNewVersion}
                      className="p-3 rounded-xl bg-white hover:bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-left transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                        <span>a) Crear Nueva Versión</span>
                        <GitBranch size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[10px] text-emerald-950 mt-1 leading-tight font-semibold">
                        Actualiza el historial a <strong className="text-emerald-900 font-black">v{formCodeValidation.nextSuggestedVersion}</strong> preservando el registro histórico anterior.
                      </p>
                    </button>

                    {/* OPCIÓN B: REASIGNAR CÓDIGO CONSECUTIVO */}
                    <button
                      type="button"
                      onClick={handleResolveDuplicateAsReassign}
                      className="p-3 rounded-xl bg-[#102A97] hover:bg-[#3F5EDF] text-white text-left transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>b) Reasignar Código Libre</span>
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[10px] text-blue-100 mt-1 leading-tight font-medium">
                        Asignar automáticamente el siguiente consecutivo libre: <strong className="text-amber-300 font-mono font-black">{formCodeValidation.suggestedFreeCode}</strong>
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* ALERTA DE ERROR DE FORMATO / SINTAXIS */}
              {!formCodeValidation.isDuplicate && formCodeValidation.hasSyntaxError && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-amber-950 block">
                        🟡 Formato Inválido: La nomenclatura no cumple la norma corporativa
                      </span>
                      <span className="text-[11px] text-amber-800">
                        Debe seguir el patrón: <code>[GCCO|G81|GCCL|GCAR|GREG]-[PRO|POL|MAN|PCS]-[000]</code> (3 dígitos correlativos).
                      </span>
                    </div>
                  </div>

                  {formCodeValidation.suggestedFix && (
                    <button
                      type="button"
                      onClick={handleNormalizeSyntax}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Wand2 size={13} />
                      <span>Normalizar a: {formCodeValidation.suggestedFix}</span>
                    </button>
                  )}
                </div>
              )}

              {/* CONFIRMACIÓN DE CÓDIGO CONFORME */}
              {formCodeValidation.isCompliant && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 size={16} className="text-[#00B582]" />
                  <span>🟢 Código Conforme: Nomenclatura válida y disponibilidad verificada en el repositorio institucional.</span>
                </div>
              )}

              {/* FORMULARIO DE METADATOS */}
              <form onSubmit={handleSaveForm} className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Código Normalizado Oficial:
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={e => setFormCode(e.target.value.toUpperCase())}
                      placeholder="Ej: GCCO-PRO-031"
                      className={`w-full p-2.5 text-xs font-mono font-bold bg-slate-50 border rounded-xl outline-none focus:ring-2 ${
                        formCodeValidation.isDuplicate 
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500 text-rose-900' 
                          : formCodeValidation.hasSyntaxError
                          ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500 text-amber-900'
                          : 'border-slate-200 focus:ring-[#3F5EDF] text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Versión Activa:
                    </label>
                    <input
                      type="text"
                      required
                      value={formVersion}
                      onChange={e => setFormVersion(e.target.value)}
                      placeholder="Ej: 1.0"
                      className="w-full p-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Título Oficial del Documento:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Ej: Procedimiento de Conciliación Tripartita y Cuentas de Salvaguarda..."
                    className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Proceso / Área Propietaria:
                    </label>
                    <input
                      type="text"
                      required
                      value={formArea}
                      onChange={e => setFormArea(e.target.value)}
                      placeholder="Ej: Operaciones / Tesorería"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Fecha de Aprobación:
                    </label>
                    <input
                      type="date"
                      required
                      value={formApprovalDate}
                      onChange={e => setFormApprovalDate(e.target.value)}
                      className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Elaborado por (Autor):
                    </label>
                    <input
                      type="text"
                      value={formElaborated}
                      onChange={e => setFormElaborated(e.target.value)}
                      placeholder="Nombre y cargo autor"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Revisado por (Revisor / QA):
                    </label>
                    <input
                      type="text"
                      value={formReviewed}
                      onChange={e => setFormReviewed(e.target.value)}
                      placeholder="Nombre y cargo revisor"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Aprobado por (Comité / Junta):
                    </label>
                    <input
                      type="text"
                      value={formApproved}
                      onChange={e => setFormApproved(e.target.value)}
                      placeholder="Comité de Operaciones / Junta Directiva"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      N° de Acta de Comité / Junta:
                    </label>
                    <input
                      type="text"
                      value={formActNumber}
                      onChange={e => setFormActNumber(e.target.value)}
                      placeholder="Ej: Acta Junta Directiva N° 05-2026"
                      className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Log de Cambios (Motivo de emisión / versión):
                  </label>
                  <textarea
                    rows={2}
                    value={formChangeLog}
                    onChange={e => setFormChangeLog(e.target.value)}
                    placeholder="Descripción sintética de cambios introducidos en esta versión..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formCodeValidation.isDuplicate}
                    className={`px-5 py-2 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                      formCodeValidation.isDuplicate
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-[#102A97] text-white hover:bg-[#0d2170] cursor-pointer'
                    }`}
                  >
                    <Check size={16} />
                    <span>
                      {isNewVersionMode 
                        ? 'Publicar Nueva Versión' 
                        : editingDocId 
                        ? 'Guardar Cambios' 
                        : 'Registrar en Matriz'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE IMPORTACIÓN MASIVA DESDE EXCEL */}
      <ExcelMassImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        existingDocuments={documents}
        onImportComplete={handleExcelImportComplete}
      />
    </div>
  );
};
