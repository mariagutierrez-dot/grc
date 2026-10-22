import React, { useState, useEffect, useRef } from 'react';
import { Risk } from '../types';
import { Play, Pause, RotateCcw, Clock, CheckCircle, FileText, ArrowRight, Video, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TranscriptItem {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
  linkedRiskId: string;
  context: string;
}

interface VideoSimulation {
  id: string;
  title: string;
  duration: string;
  totalSeconds: number;
  area: string;
  transcript: TranscriptItem[];
}

const VIDEOS: VideoSimulation[] = [
  {
    id: 'V-001',
    title: 'Auditoría de Procesos - Mesa de Dinero & Mesa FX',
    duration: '02:30',
    totalSeconds: 150,
    area: 'Mesa de Dinero',
    transcript: [
      {
        timestamp: '00:15',
        seconds: 15,
        speaker: 'Vocal de Auditoría',
        text: 'Iniciamos revisión de los controles de Spreads y cotizaciones de divisas.',
        linkedRiskId: 'R-MD-006',
        context: 'Revisión técnica de cotizaciones manuales en Mesa de Dinero.'
      },
      {
        timestamp: '00:50',
        seconds: 50,
        speaker: 'Operador Senior FX',
        text: 'Acá cotizamos a veces por chat de WhatsApp con los partners de Mesa de Dinero, y luego cargamos saldos manualmente en el portal Admin regulando el spread de manera manual.',
        linkedRiskId: 'R-MD-005',
        context: 'Uso informal de WhatsApp y saldos manuales desalineando el control de Spreads.'
      },
      {
        timestamp: '01:35',
        seconds: 95,
        speaker: 'Vocal de Auditoría',
        text: 'Eso expone a la mesa a diferenciales de cambio abruptos si la cotización no tiene flujo Maker/Checker directo.',
        linkedRiskId: 'R-MD-001',
        context: 'Diseño contraintuitivo de signos negativos en divisas y falta de validación dual (Maker/Checker).'
      },
      {
        timestamp: '02:10',
        seconds: 130,
        speaker: 'Líder de TI',
        text: 'Estamos recomendando bloquear técnicamente los saldos directos y auditar semanalmente los spreads del robot.',
        linkedRiskId: 'R-MD-006',
        context: 'Recomendación de control de spreads aplicados vs mercado real.'
      }
    ]
  },
  {
    id: 'V-002',
    title: 'Sesión de Entrevistas Operativas - Carga y Partners',
    duration: '03:00',
    totalSeconds: 180,
    area: 'Operaciones',
    transcript: [
      {
        timestamp: '00:10',
        seconds: 10,
        speaker: 'Operador de Fondeo',
        text: 'Para la recaudación en Perú, dependemos de un procesador y cuando la plataforma de dLocal tiene cortes, nos genera reclamos masivos.',
        linkedRiskId: 'R-OPS-002',
        context: 'Fallas operativas por plataforma manual o partners externos específicos.'
      },
      {
        timestamp: '01:12',
        seconds: 72,
        speaker: 'Team Lead Operaciones',
        text: 'Claro, la carga de planillas de dLocal se hace de forma manual porque la integración por API tiene retrasos heredados de TI.',
        linkedRiskId: 'R-OPS-003',
        context: 'Falta de automatización para validaciones y dependencia de conciliación manual.'
      },
      {
        timestamp: '02:05',
        seconds: 125,
        speaker: 'Vocal de Finanzas',
        text: 'La conciliación de Ecuador también nos cuesta porque se hace descargando cartolas manualmente de bancos sin Host-To-Host.',
        linkedRiskId: 'R-OPS-004',
        context: 'Uso de sistemas legacy o cartolas manuales en bancos de Ecuador.'
      }
    ]
  },
  {
    id: 'V-003',
    title: 'Análisis de Incidencias TI & Ciberseguridad',
    duration: '02:45',
    totalSeconds: 165,
    area: 'Ciberseguridad',
    transcript: [
      {
        timestamp: '00:25',
        seconds: 25,
        speaker: 'Auditor de Seguridad',
        text: 'La principal fuga de llaves públicas y privadas se detectó por escaneo de secretos inactivo en las ramas de pre-producción.',
        linkedRiskId: 'R-CIB-001',
        context: 'Riesgos de filtración de claves e integración insegura de secretos.'
      },
      {
        timestamp: '01:10',
        seconds: 70,
        speaker: 'DevOps Principal',
        text: 'Implementamos bloqueo preventivo pero el auto-scaling no está configurado frente a un ataque DDoS, tirando el portal de administración.',
        linkedRiskId: 'R-CIB-002',
        context: 'Ausencia de escalabilidad frente a solicitudes masivas (DDoS).'
      },
      {
        timestamp: '02:00',
        seconds: 120,
        speaker: 'Auditor TI',
        text: 'La base de datos expone datos directos de la API de Risk Inspektor sin hash intermedio en los logs del servidor.',
        linkedRiskId: 'R-CIB-003',
        context: 'Vulnerabilidades de fuga de registros sensibles de transacciones en logs.'
      }
    ]
  }
];

interface VideoEvidenceSimulatorProps {
  onAddEvidence: (riskId: string, timestamp: string) => void;
  onNavigateToRisk: (riskId: string) => void;
  risks: Risk[];
}

export const VideoEvidenceSimulator: React.FC<VideoEvidenceSimulatorProps> = ({
  onAddEvidence,
  onNavigateToRisk,
  risks
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoSimulation>(VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeItem, setActiveItem] = useState<TranscriptItem | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedVideo.totalSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedVideo]);

  // Synchronize transcript active item based on time
  useEffect(() => {
    // Find item closest but preceding current time
    const matches = [...selectedVideo.transcript]
      .sort((a, b) => b.seconds - a.seconds)
      .find((item) => currentTime >= item.seconds);

    setActiveItem(matches || null);
  }, [currentTime, selectedVideo]);

  // Handle clicking a transcript timestamp
  const handleSeek = (item: TranscriptItem) => {
    setCurrentTime(item.seconds);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const getFormatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const linkedRiskData = activeItem
    ? risks.find((r) => r.id === activeItem.linkedRiskId)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Left side: Simulated Video Player */}
      <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col justify-between text-white border-r border-slate-900 min-h-[350px]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase font-black text-slate-400">
              AUDIT VIDEO EVIDENCE SIMULATOR
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-100 line-clamp-1">{selectedVideo.title}</h4>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">{selectedVideo.area}</p>
          </div>
        </div>

        {/* Video Canvas Graphic Screen */}
        <div className="my-6 aspect-video bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950/90 to-slate-950" />
          
          {/* Simulated Audio Spectrum Waves when playing */}
          {isPlaying ? (
            <div className="flex items-end gap-1 h-12 relative z-10">
              {[...Array(14)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [
                      10 + Math.random() * 40,
                      5 + Math.random() * 20,
                      15 + Math.random() * 45,
                      8 + Math.random() * 30
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + i * 0.05,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 bg-indigo-500 rounded-full"
                />
              ))}
            </div>
          ) : (
            <Video size={48} className="text-slate-700 relative z-10" />
          )}

          {/* Time floating badge */}
          <div className="absolute bottom-3 right-3 bg-black/75 px-2 bg-slate-900 border border-slate-800 py-1 rounded text-[10px] font-mono font-bold tracking-tight text-white z-10">
            {getFormatTime(currentTime)} / {selectedVideo.duration}
          </div>

          {/* Prompt quote preview */}
          {activeItem && (
            <div className="absolute inset-x-3 bottom-12 bg-black/80 p-2.5 rounded-lg border border-slate-800 backdrop-blur-sm z-10 text-[10px] font-mono leading-relaxed italic text-green-400 text-center">
              "{activeItem.speaker}: {activeItem.text.slice(0, 75)}..."
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="space-y-3">
          {/* Timeline slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono opacity-80">{getFormatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={selectedVideo.totalSeconds}
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="flex-1 accent-indigo-500 h-1 rounded-full cursor-pointer bg-slate-800"
            />
            <span className="text-[10px] font-mono opacity-80">{selectedVideo.duration}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
              </button>
              <button
                onClick={handleReset}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center justify-center hover:bg-slate-800"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase">
              <Volume2 size={12} className="text-slate-400" />
              <span>Simulated Audio Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: AI Transcription Timeline / Linking Box */}
      <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText size={16} className="text-slate-400" />
                Transcripción Dinámica por IA
              </h4>
              <p className="text-[11px] text-slate-400 font-semibold">MINUTO POR MINUTO</p>
            </div>

            {/* Video Selector Dropdown */}
            <select
              value={selectedVideo.id}
              onChange={(e) => {
                const doc = VIDEOS.find((v) => v.id === e.target.value);
                if (doc) {
                  setSelectedVideo(doc);
                  setCurrentTime(0);
                  setIsPlaying(false);
                  setActiveItem(null);
                }
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-bold hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {VIDEOS.map((v) => (
                <option key={v.id} value={v.id}>
                  🎞️ {v.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {/* Transcript clickable lists */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {selectedVideo.transcript.map((item) => {
              const isActive = activeItem?.seconds === item.seconds;
              return (
                <div
                  key={item.seconds}
                  onClick={() => handleSeek(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                    isActive
                      ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      <Clock size={12} />
                      Min {item.timestamp}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                      {item.speaker}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">
                    "{item.text}"
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                    <span>Vínculo GRC:</span>
                    <span className="font-mono text-indigo-500 font-extrabold bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.linkedRiskId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extraction Panel linking click-by-click */}
        <AnimatePresence mode="wait">
          {activeItem && linkedRiskData ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle size={14} />
                  Evidencia Vinculada Exitosamente
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  Ref: {activeItem.linkedRiskId}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="text-xs font-black text-slate-800">
                  {linkedRiskData.process}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {linkedRiskData.riskDescription}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToRisk(activeItem.linkedRiskId)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <span>Ir al Catálogo de Riesgos</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => {
                    onAddEvidence(activeItem.linkedRiskId, `Evidencia de Transcript Min ${activeItem.timestamp}: "${activeItem.text}"`);
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors shadow-sm"
                >
                  Guardar Marca de Tiempo
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-400 italic text-xs leading-normal">
              Seleccione una marca de tiempo en la transcripción para reproducir el segmento, extraer el riesgo operacional y vincularlo en tiempo real en la matriz.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
