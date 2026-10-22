import React, { useState } from 'react';
import { 
  X, 
  History, 
  Calendar, 
  UserCheck, 
  FileText, 
  Award, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Building2, 
  FileCode, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditedDocument, DocumentVersionHistoryEntry } from '../types';

interface DocumentVersionHistoryDrawerProps {
  document: AuditedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDocument: (updated: AuditedDocument) => void;
}

export const DocumentVersionHistoryDrawer: React.FC<DocumentVersionHistoryDrawerProps> = ({
  document,
  isOpen,
  onClose,
  onUpdateDocument
}) => {
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false);
  const [editingActNumber, setEditingActNumber] = useState(false);
  const [actNumberInput, setActNumberInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Campos para nueva versión
  const [newVerNumber, setNewVerNumber] = useState('');
  const [newVerDate, setNewVerDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVerElaborated, setNewVerElaborated] = useState('');
  const [newVerReviewed, setNewVerReviewed] = useState('');
  const [newVerApproved, setNewVerApproved] = useState('');
  const [newVerAct, setNewVerAct] = useState('');
  const [newVerLog, setNewVerLog] = useState('');

  if (!document || !isOpen) return null;

  const handleSaveActNumber = () => {
    const updated: AuditedDocument = {
      ...document,
      actNumber: actNumberInput.trim(),
      // Actualizar también en la versión actual del historial
      versionHistory: document.versionHistory.map(vh => 
        vh.version === document.version ? { ...vh, actNumber: actNumberInput.trim() } : vh
      )
    };
    onUpdateDocument(updated);
    setEditingActNumber(false);
  };

  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerNumber.trim()) return;

    const newEntry: DocumentVersionHistoryEntry = {
      version: newVerNumber.trim().replace(/^[Vv]/, ''),
      date: newVerDate,
      elaboratedBy: newVerElaborated.trim() || document.elaboratedBy,
      reviewedBy: newVerReviewed.trim() || document.reviewedBy,
      approvedBy: newVerApproved.trim() || document.approvedBy,
      actNumber: newVerAct.trim() || document.actNumber || '',
      changeLog: newVerLog.trim() || 'Actualización de versión y control de cambios.',
      isCurrent: true
    };

    // Marcar las anteriores como no corrientes
    const updatedHistory: DocumentVersionHistoryEntry[] = [
      newEntry,
      ...document.versionHistory.map(vh => ({ ...vh, isCurrent: false }))
    ];

    const updatedDoc: AuditedDocument = {
      ...document,
      version: newEntry.version,
      lastUpdated: newEntry.date,
      approvalDate: newEntry.date,
      elaboratedBy: newEntry.elaboratedBy,
      reviewedBy: newEntry.reviewedBy || document.reviewedBy,
      approvedBy: newEntry.approvedBy,
      actNumber: newEntry.actNumber,
      changeLog: newEntry.changeLog,
      versionHistory: updatedHistory
    };

    onUpdateDocument(updatedDoc);
    setNewVersionModalOpen(false);
    // Reset
    setNewVerNumber('');
    setNewVerLog('');
  };

  const handleCopyHistorySummary = () => {
    const lines = [
      `HISTÓRICO DE VERSIONES - ${document.code}`,
      `Documento: ${document.title}`,
      `Área: ${document.ownerArea}`,
      `Sociedad: ${document.detectedSociety} (${document.detectedCountry})`,
      '--------------------------------------------------',
      ...document.versionHistory.map(vh => 
        `[v${vh.version} - ${vh.date}] Acta: ${vh.actNumber || 'Sin Acta'} | Aprobado por: ${vh.approvedBy}\nMotivo: ${vh.changeLog}\nElaborado: ${vh.elaboratedBy} | Revisado: ${vh.reviewedBy || 'N/A'}`
      )
    ].join('\n\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs">
        {/* BACKDROP CLICK */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* DRAWER PANEL */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-hidden font-sans"
        >
          {/* HEADER DEL DRAWER */}
          <div className="p-6 bg-[#102A97] text-white space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-[#3F5EDF] text-white border border-blue-400/40">
                    {document.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 uppercase">
                    v{document.version} Vigente
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-blue-100">
                    {document.detectedSociety} ({document.detectedCountry})
                  </span>
                </div>
                <h2 className="text-lg font-black text-white leading-snug pt-1">
                  {document.title}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* BARRA DE ACCIONES RÁPIDAS */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-blue-900/60 flex-wrap">
              <div className="text-xs text-blue-200 font-medium">
                Área Propietaria: <strong className="text-white">{document.ownerArea}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHistorySummary}
                  className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Resumen'}</span>
                </button>

                <button
                  onClick={() => {
                    setNewVerNumber(`v${(parseFloat(document.version) + 1.0).toFixed(1)}`);
                    setNewVerElaborated(document.elaboratedBy);
                    setNewVerReviewed(document.reviewedBy);
                    setNewVerApproved(document.approvedBy);
                    setNewVerAct(document.actNumber || '');
                    setNewVersionModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#00B582] hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus size={14} />
                  <span>Nueva Versión</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTENIDO DEL DRAWER CON SCROLL */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {/* TARJETA DE GOBERNANZA ACTIVA (METADATOS EXTRAÍDOS) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#3F5EDF]" />
                  <h3 className="text-xs font-black text-[#102A97] uppercase tracking-wider">
                    Metadatos de Portada y Vigencia Oficial
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  document.isCompliant ? 'bg-emerald-50 text-[#00B582] border border-emerald-200' : 'bg-rose-50 text-[#FF647C] border border-rose-200'
                }`}>
                  {document.isCompliant ? '🟢 CÓDIGO NORMALIZADO' : '⚠️ REVISIÓN REQUERIDA'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Elaborado por */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Elaborado por:</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-[#3F5EDF] shrink-0" />
                    <span>{document.elaboratedBy || 'No especificado'}</span>
                  </div>
                </div>

                {/* Revisado por */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Revisado por:</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-purple-600 shrink-0" />
                    <span>{document.reviewedBy || 'No especificado'}</span>
                  </div>
                </div>

                {/* Aprobado por */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aprobado por:</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Award size={14} className="text-[#00B582] shrink-0" />
                    <span>{document.approvedBy || 'No especificado'}</span>
                  </div>
                </div>

                {/* Fecha de Aprobación */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fecha de Aprobación:</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-500 shrink-0" />
                    <span>{document.approvalDate || document.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* NÚMERO DE ACTA DE COMITÉ / JUNTA DIRECTIVA (EDITABLE) */}
              <div className="p-3.5 rounded-xl bg-[#F4F6FE] border border-[#DCE3FA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#102A97] uppercase tracking-wider">
                    📋 N° de Acta de Comité / Junta Directiva:
                  </span>
                  {!editingActNumber ? (
                    <button
                      onClick={() => {
                        setActNumberInput(document.actNumber || '');
                        setEditingActNumber(true);
                      }}
                      className="text-[11px] font-bold text-[#3F5EDF] hover:text-[#102A97] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>{document.actNumber ? 'Modificar Acta' : 'Asignar Acta'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSaveActNumber}
                        className="px-2.5 py-1 rounded bg-[#00B582] text-white text-[10px] font-black hover:bg-emerald-600 cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingActNumber(false)}
                        className="px-2.5 py-1 rounded bg-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {!editingActNumber ? (
                  <div className="font-mono text-xs font-black text-[#102A97] bg-white px-3 py-2 rounded-lg border border-[#DCE3FA] flex items-center justify-between">
                    <span>{document.actNumber || '⚠️ Sin Acta de Comité registrada'}</span>
                    {!document.actNumber && (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pendiente
                      </span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={actNumberInput}
                    onChange={e => setActNumberInput(e.target.value)}
                    placeholder="Ej: Acta Junta Directiva N° 04-2026 / Acta Comité Ops N° 28-2026"
                    className="w-full p-2.5 text-xs font-mono font-bold bg-white border border-[#3F5EDF] rounded-lg outline-none focus:ring-2 focus:ring-[#3F5EDF]"
                    autoFocus
                  />
                )}
              </div>

              {/* LOG DE CAMBIOS ACTUAL */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Log de Cambios (Versión Vigente):</span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {document.changeLog || 'Sin descripción detallada de cambios.'}
                </p>
              </div>
            </div>

            {/* TIMELINE HISTÓRICO DE VERSIONES ANTERIORES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-[#102A97]" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Trazabilidad e Historial de Versiones ({document.versionHistory.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Orden cronológico descendente</span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {document.versionHistory.map((ver, idx) => {
                  const isCurrent = ver.version === document.version || ver.isCurrent;
                  return (
                    <div 
                      key={idx} 
                      className={`relative pl-9 transition-all ${isCurrent ? 'scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}
                    >
                      {/* Círculo indicador del timeline */}
                      <div className={`absolute left-2.5 top-3.5 w-3.5 h-3.5 -translate-x-1/2 rounded-full border-2 bg-white ${
                        isCurrent ? 'border-[#00B582] ring-4 ring-emerald-100 bg-[#00B582]' : 'border-slate-400 bg-slate-100'
                      }`} />

                      <div className={`p-4 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'bg-white border-[#00B582]/40 shadow-sm ring-1 ring-[#00B582]/20' 
                          : 'bg-white/80 border-slate-200 hover:bg-white'
                      }`}>
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded ${
                              isCurrent ? 'bg-[#102A97] text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              v{ver.version}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                Vigente
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{ver.date}</span>
                            </span>
                          </div>

                          {ver.actNumber && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#102A97] border border-blue-100">
                              {ver.actNumber}
                            </span>
                          )}
                        </div>

                        {/* Descripción de Cambio */}
                        <div className="text-xs font-semibold text-slate-800 leading-relaxed mb-3">
                          {ver.changeLog}
                        </div>

                        {/* Participantes de la versión */}
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Elaborado:</span>
                            <span className="font-bold text-slate-700 line-clamp-1">{ver.elaboratedBy}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Revisado:</span>
                            <span className="font-bold text-slate-700 line-clamp-1">{ver.reviewedBy || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Aprobado:</span>
                            <span className="font-bold text-slate-700 line-clamp-1">{ver.approvedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FOOTER DEL DRAWER */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              ID Registro: <code className="font-mono text-[10px]">{document.id}</code>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cerrar Panel
            </button>
          </div>
        </motion.div>

        {/* MODAL PARA AGREGAR NUEVA VERSIÓN */}
        <AnimatePresence>
          {newVersionModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Plus size={18} className="text-[#00B582]" />
                    <h3 className="text-sm font-black text-[#102A97]">Registrar Nueva Versión ({document.code})</h3>
                  </div>
                  <button onClick={() => setNewVersionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddVersion} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">N° de Versión:</label>
                      <input
                        type="text"
                        required
                        value={newVerNumber}
                        onChange={e => setNewVerNumber(e.target.value)}
                        placeholder="Ej: 3.0"
                        className="w-full p-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">Fecha de Aprobación:</label>
                      <input
                        type="date"
                        required
                        value={newVerDate}
                        onChange={e => setNewVerDate(e.target.value)}
                        className="w-full p-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Elaborado por:</label>
                    <input
                      type="text"
                      required
                      value={newVerElaborated}
                      onChange={e => setNewVerElaborated(e.target.value)}
                      placeholder="Nombre y cargo del autor"
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">Revisado por:</label>
                      <input
                        type="text"
                        value={newVerReviewed}
                        onChange={e => setNewVerReviewed(e.target.value)}
                        placeholder="Nombre / cargo revisor"
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">Aprobado por:</label>
                      <input
                        type="text"
                        required
                        value={newVerApproved}
                        onChange={e => setNewVerApproved(e.target.value)}
                        placeholder="Comité / Directorio / Junta"
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">N° de Acta de Comité / Junta:</label>
                    <input
                      type="text"
                      value={newVerAct}
                      onChange={e => setNewVerAct(e.target.value)}
                      placeholder="Ej: Acta Junta Directiva N° 09-2026"
                      className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Log de Cambios (Motivo de la versión):</label>
                    <textarea
                      rows={3}
                      required
                      value={newVerLog}
                      onChange={e => setNewVerLog(e.target.value)}
                      placeholder="Describe sintéticamente las modificaciones introducidas en esta versión..."
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#3F5EDF]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setNewVersionModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-black bg-[#00B582] text-white hover:bg-emerald-600 rounded-lg cursor-pointer shadow-md"
                    >
                      Guardar y Publicar v{newVerNumber}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
