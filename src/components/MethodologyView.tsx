import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  Shield, 
  BarChart3, 
  Activity, 
  FileText, 
  Users, 
  Info, 
  ShieldAlert, 
  CheckCircle, 
  User, 
  ClipboardList, 
  Sparkles, 
  Download, 
  Printer, 
  FileType, 
  Check, 
  Database, 
  Landmark, 
  Building2, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  CreditCard, 
  Globe2, 
  Lock, 
  Cpu, 
  TrendingUp, 
  HelpCircle,
  FileCheck2,
  Search,
  Sliders,
  Bell,
  Eye,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Jurisdiction, ENTITY_PROFILES } from '../types';

interface MethodologyViewProps {
  jurisdiction?: Jurisdiction;
}

type StageKey = 'identificacion' | 'medicion' | 'control' | 'monitoreo' | 'matriz';

export const MethodologyView: React.FC<MethodologyViewProps> = ({ jurisdiction: initialJurisdiction = 'Regional' }) => {
  const [activeJurisdiction, setActiveJurisdiction] = useState<Jurisdiction>(initialJurisdiction);
  const [selectedStage, setSelectedStage] = useState<StageKey>('identificacion');
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  useEffect(() => {
    setActiveJurisdiction(initialJurisdiction);
  }, [initialJurisdiction]);

  const triggerSuccess = (fmt: string) => {
    setDownloadedFormat(fmt);
    setTimeout(() => setDownloadedFormat(null), 3500);
  };

  // GENERADOR WORD COMPLETO (.DOC) CON LAS 4 FASES (IDENTIFICAR, MEDIR, CONTROLAR, MONITOREAR CON EVENTOS)
  const handleDownloadWord = () => {
    let docTitle = `Metodologia_Gestion_Riesgos_Global66_${activeJurisdiction}.doc`;
    let htmlContent = '';

    if (activeJurisdiction === 'Chile') {
      docTitle = 'Metodologia_Gestion_Riesgo_Operacional_CMF_NCG464_GlobalCardSpA.doc';
      htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Metodología de Gestión del Riesgo Operacional - CMF Chile (Global Card SpA)</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.6; }
            h1 { color: #b91c1c; border-bottom: 3px solid #dc2626; padding-bottom: 8px; font-size: 20pt; }
            h2 { color: #991b1b; margin-top: 24px; font-size: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            h3 { color: #334155; font-size: 11pt; margin-top: 16px; font-weight: bold; }
            p, li { font-size: 10pt; color: #334155; }
            .badge { background: #fef2f2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 9pt; }
            th { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 8px; text-align: left; font-weight: bold; }
            td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
            .box { background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px; margin: 14px 0; }
            .footer { margin-top: 40px; font-size: 8.5pt; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>GLOBAL CARD S.P.A. (CHILE) - MARCO INTEGRAL DE GESTIÓN DE RIESGO OPERACIONAL Y CIBERSEGURIDAD</h1>
          <p><strong>Cumplimiento Regulatorio: Comisión para el Mercado Financiero (CMF) - NCG N° 464, RAN Cap. 20-10 & Ley FinTech 21.521</strong></p>
          <p><em>Manual Técnico y Metodológico de Identificación, Medición, Control y Monitoreo Basado en Eventos de Riesgo.</em></p>

          <h2>1. Objetivo y Alcance Regulatorio CMF</h2>
          <p>Establecer el marco institucional de gestión integral de riesgos operacionales y tecnológicos para Global Card S.P.A. como Entidad Emisora y Operadora de Tarjetas de Pago con Provisión de Fondos regulada por la CMF. Este marco garantiza la continuidad operacional, la salvaguarda obligatoria de fondos de los tarjetahabientes y la solidez ante incidentes cibernéticos.</p>

          <h2>2. Ciclo Integral de Gestión del Riesgo (4 Etapas CMF)</h2>

          <h3>FASE 1: IDENTIFICACIÓN DE RIESGOS</h3>
          <p>La identificación en Global Card SpA se realiza de manera continua mediante metodologías RCSA (Risk and Control Self-Assessment), análisis de flujos operativos de procesamiento de tarjetas y revisión técnica de lanzamientos bajo la Ley FinTech 21.521.</p>
          <ul>
            <li><strong>Factores Evaluados:</strong> Procesos de emisión/autorización, personas/usuarios autorizados, sistemas tecnológicos/conexiones con procesadores (Transbank, Klap, Getnet), proveedores críticos y eventos externos.</li>
            <li><strong>Formulación Estándar GRC:</strong> Cada riesgo se redacta bajo la fórmula: [Evento Operacional] debido a [Causa Raíz / Falla de Control] ocasionando [Impacto Financiero en UF, Operacional o Sanción CMF].</li>
            <li><strong>Ámbitos Clave CMF:</strong> Segregación patrimonial de fondos de provisión en cuentas corrientes separadas (NCG 464), gestión de accesos y cifrado (RAN 20-10), y prevención de lavado de activos (UAF).</li>
          </ul>

          <h3>FASE 2: MEDICIÓN Y EVALUACIÓN DE RIESGOS</h3>
          <p>Se evalúa la probabilidad y el impacto en una matriz de doble entrada 5×5 (Nivel 1 a 5). La severidad inherente resulta del producto de ambos factores (1 a 25).</p>
          <ul>
            <li><strong>Probabilidad (1 a 5):</strong> Calificada desde Frecuencia Remota (&lt; 1 vez cada 3 años) hasta Muy Frecuente / Casi Seguro (&gt; 1 vez al mes o continua).</li>
            <li><strong>Impacto Patrimonial y Operativo en Chile (UF / USD):</strong>
              <ul>
                <li><strong>Nivel 1 (Leve):</strong> &lt; 500 UF (&lt; $20,000 USD) | Corte &lt; 1 hora.</li>
                <li><strong>Nivel 2 (Menor):</strong> 500 a 2,500 UF ($20k - $100k USD) | Corte 1 a 4 horas.</li>
                <li><strong>Nivel 3 (Moderado):</strong> 2,500 a 10,000 UF ($100k - $400k USD) | Corte 4 a 12 horas | Requerimiento CMF.</li>
                <li><strong>Nivel 4 (Grave):</strong> 10,000 a 30,000 UF ($400k - $1.2M USD) | Corte 12 a 24 horas | Formulación de cargos.</li>
                <li><strong>Nivel 5 (Crítico):</strong> &gt; 30,000 UF (&gt; $1,200,000 USD) | Corte &gt; 24 horas | Afectación patrimonial severa o revocación de licencia CMF.</li>
              </ul>
            </li>
            <li><strong>Aceptabilidad:</strong> Bajo (Aceptable), Moderado (Tolerable con seguimiento), Alto/Extremo (Inaceptable - Plan de Mitigación Inmediato).</li>
          </ul>

          <h3>FASE 3: CONTROL Y MITIGACIÓN (INVENTARIO OFICIAL & ROAM)</h3>
          <p>Global Card S.P.A. aplica el Inventario de Controles Establecidos de la Compañía (Oficiales) para mitigar el riesgo inherente:</p>
          <ul>
            <li><strong>Tipología:</strong> Preventivos (bloqueo ante descalces), Detectivos (conciliación diaria de cartolas bancarias y liquidación adquirente) y Correctivos (reversión de transacciones no autorizadas).</li>
            <li><strong>Automatización:</strong> Automáticos (APIs y reglas WAF), Semiautomáticos y Manuales.</li>
            <li><strong>Eficacia:</strong> Excelente (100%), Buena (80%), Suficiente (60%), Deficiente (0%).</li>
            <li><strong>Gobernanza ROAM:</strong> Resolved (Resuelto), Owned (Asignado a ROAM Owner), Accepted (Aceptado por Comité de Riesgos), Mitigated (Mitigado por control oficial vigente).</li>
          </ul>

          <h3>FASE 4: MONITOREO CONTINUO BASADO EN EVENTOS DE RIESGO E INCIDENTES</h3>
          <div class="box">
            <strong>Principio Fundamental de Monitoreo CMF:</strong> El monitoreo del riesgo operacional no es teórico; se fundamenta en la captura, registro y análisis sistemático de <strong>Eventos de Riesgo Reales, Incidentes Materializados, Fallos de Red y Cuasi-accidentes (Near Misses)</strong>.
          </div>
          <ul>
            <li><strong>Registro Obligatorio de Incidentes:</strong> Todo corte de servicio de adquirencia, descalce en la conciliación diaria de fondos de provisión, evento de fraude en tarjetas o intrusión cibernética debe documentarse con fecha de ocurrencia, fecha de detección, causa raíz técnica, pérdida económica bruta (CLP/UF), montos recuperados y pérdida neta final.</li>
            <li><strong>Contraste Dinámico (Matriz vs. Realidad):</strong> Se compara mensualmente la tasa de ocurrencia fáctica de eventos de riesgo contra el nivel de riesgo residual proyectado en la matriz.</li>
            <li><strong>Indicadores Clave de Riesgo (KRIs) Derivados de Eventos:</strong>
              <ul>
                <li>Disponibilidad de autorización de tarjetas (SLA &gt; 99.95%).</li>
                <li>Tasa de contracargos por fraude (Ratio &lt; 0.10% del volumen procesado).</li>
                <li>Tiempo medio de detección (MTTD) y recuperación (MTTR) ante cortes de procesador.</li>
                <li>Descalce neto en cuentas de salvaguarda NCG 464 (tolerancia cero).</li>
              </ul>
            </li>
            <li><strong>Triggers de Recalibración y Escalación:</strong> La ocurrencia de un evento de pérdida grave o la acumulación reiterada de incidentes dispara la reevaluación obligatoria de los controles y el reporte urgente al Comité de Riesgos y a la CMF.</li>
          </ul>

          <div class="footer">
            <p>CH - Global Card S.P.A. - CMF NCG 464 & RAN 20-10 Compliant - Global66 GRC</p>
          </div>
        </body>
        </html>
      `;
    } else if (activeJurisdiction === 'Argentina') {
      docTitle = 'Metodologia_Gestion_Riesgo_Operacional_BCRA_A7783_Global66.doc';
      htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Metodología de Gestión del Riesgo Operacional - BCRA Com. A 7783</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0369a1; border-bottom: 3px solid #0284c7; padding-bottom: 8px; font-size: 20pt; }
            h2 { color: #0c4a6e; margin-top: 24px; font-size: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            h3 { color: #334155; font-size: 11pt; margin-top: 16px; font-weight: bold; }
            p, li { font-size: 10pt; color: #334155; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 9pt; }
            th { background-color: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; padding: 8px; text-align: left; font-weight: bold; }
            td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
            .box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin: 14px 0; }
            .footer { margin-top: 40px; font-size: 8.5pt; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>GLOBAL66 ARGENTINA S.A.U. - MARCO DE GESTIÓN DEL RIESGO OPERACIONAL</h1>
          <p><strong>Cumplimiento Regulatorio: BCRA Comunicación "A" 7783, "A" 7784 & Basilea III</strong></p>
          <p><em>Marco Metodológico de Identificación, Medición, Control y Monitoreo Cuantitativo mediante Base LED.</em></p>

          <h2>1. Objetivo y Alcance Regulatorio BCRA</h2>
          <p>Definir los procesos obligatorios de identificación, medición, control y monitoreo de riesgos operacionales para Global66 Argentina S.A.U. como Proveedor de Servicios de Pago (PSP) y operador cambiario, bajo la Comunicación "A" 7783 del BCRA y estándares de Basilea III.</p>

          <h2>2. Ciclo Integral de Gestión del Riesgo (4 Fases BCRA)</h2>

          <h3>FASE 1: IDENTIFICACIÓN DE RIESGOS (7 CATEGORÍAS BASILEA III)</h3>
          <p>Los riesgos operacionales se identifican y clasifican rigurosamente en las 7 categorías normativas del BCRA:</p>
          <ol>
            <li><strong>Fraude Interno:</strong> Malversación de fondos o vulneración de límites por personal interno.</li>
            <li><strong>Fraude Externo:</strong> Phishing, suplantación en onboarding, SIM swapping, contracargos DEBIN apócrifos y fraudes con QR.</li>
            <li><strong>Relaciones Laborales y Seguridad en el Trabajo:</strong> Contingencias laborales o de higiene laboral.</li>
            <li><strong>Clientes, Productos y Prácticas Empresariales:</strong> Transparencia en comisiones (Com. A 7319) y reclamos AUF.</li>
            <li><strong>Daños a Activos Físicos:</strong> Siniestros en oficinas o centros de cómputo locales.</li>
            <li><strong>Incidencias en el Negocio y Fallos en Sistemas (Com. A 7260):</strong> Caídas de enlaces VPN Coelsa, indisponibilidad de API interbancaria o ciberataques.</li>
            <li><strong>Ejecución, Entrega y Gestión de Procesos:</strong> Fallas en liquidación echeq, rechazos masivos de transferencias o demoras en regímenes informativos BCRA.</li>
          </ol>

          <h3>FASE 2: MEDICIÓN Y EVALUACIÓN DE RIESGOS</h3>
          <p>Evaluación combinada de Probabilidad (1 a 5) e Impacto (1 a 5) expresada en $ARS y USD:</p>
          <ul>
            <li><strong>Cálculo Inherente:</strong> Severidad = Probabilidad × Impacto (Escala 1 a 25).</li>
            <li><strong>Umbrales de Severidad Financiera en Argentina:</strong>
              <ul>
                <li><strong>Nivel 1 (Leve):</strong> &lt; $5,000,000 ARS (&lt; $5,000 USD).</li>
                <li><strong>Nivel 2 (Menor):</strong> $5,000,000 a $25,000,000 ARS ($5k - $25k USD).</li>
                <li><strong>Nivel 3 (Moderado):</strong> $25,000,000 a $100,000,000 ARS ($25k - $100k USD) | Sumario informativo BCRA.</li>
                <li><strong>Nivel 4 (Grave):</strong> $100,000,000 a $300,000,000 ARS ($100k - $300k USD) | Plan de regularización y sanción.</li>
                <li><strong>Nivel 5 (Crítico):</strong> &gt; $300,000,000 ARS (&gt; $300,000 USD) | Suspensión de cuenta compensadora o licencia PSP.</li>
              </ul>
            </li>
          </ul>

          <h3>FASE 3: CONTROL Y MITIGACIÓN DEL RIESGO</h3>
          <p>Implementación de controles oficiales por proceso (Prevención de Fraude, Mesa de Dinero, TI/Ciberseguridad y Cumplimiento):</p>
          <ul>
            <li><strong>Controles Oficiales:</strong> Salvaguardas con diseño formal y ejecución verificada que disminuyen la severidad inherente.</li>
            <li><strong>Ponderación:</strong> Eficacia Excelente (100%), Buena (80%), Suficiente (60%), Deficiente (0%).</li>
            <li><strong>Tratamiento ROAM:</strong> Resolved, Owned, Accepted, Mitigated.</li>
          </ul>

          <h3>FASE 4: MONITOREO CUANTITATIVO BASADO EN EVENTOS DE PÉRDIDA (BASE LED)</h3>
          <div class="box">
            <strong>Monitoreo Basado en Eventos (BCRA Com. A 7783 Cap. 3.2):</strong> El monitoreo se efectúa a través de la <strong>Base de Datos de Eventos de Pérdida (LED - Loss Event Database)</strong>, registrando de forma inalterable cada evento materializado en la operación.
          </div>
          <ul>
            <li><strong>Variables Cuantitativas Obligatorias:</strong>
              <ul>
                <li><strong>Pérdida Bruta ($ARS):</strong> Monto total del quebranto originado por el evento.</li>
                <li><strong>Recuperos Directos ($ARS):</strong> Recuperaciones logradas vía seguros, contracargos bancarios exitosos o devoluciones voluntarias.</li>
                <li><strong>Pérdida Neta ($ARS):</strong> Pérdida Neta = Pérdida Bruta - Recuperos (imputación contable definitiva).</li>
              </ul>
            </li>
            <li><strong>KRIs de Pérdidas y Alertas:</strong> Frecuencia mensual de incidentes por categoría Basilea III, Pérdida neta acumulada trimestral vs. capital regulatorio, y tiempo de resolución de eventos.</li>
            <li><strong>Retroalimentación de la Matriz:</strong> Todo evento que supere los $5,000,000 ARS genera una revisión automática del control asociado y ajuste de la probabilidad residual en la matriz de riesgos.</li>
          </ul>

          <div class="footer">
            <p>AR - Global66 Argentina S.A.U. - BCRA Com. A 7783 Compliant - Global66 GRC</p>
          </div>
        </body>
        </html>
      `;
    } else if (activeJurisdiction === 'Colombia') {
      docTitle = 'Metodologia_Gestion_Riesgos_SFC_SARO_Global66Colombia.doc';
      htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Metodología de Gestión de Riesgos - SFC Colombia (SARO)</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 8px; font-size: 20pt; }
            h2 { color: #78350f; margin-top: 24px; font-size: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            h3 { color: #334155; font-size: 11pt; margin-top: 16px; font-weight: bold; }
            p, li { font-size: 10pt; color: #334155; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 9pt; }
            th { background-color: #fffbeb; color: #78350f; border: 1px solid #fde68a; padding: 8px; text-align: left; font-weight: bold; }
            td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
            .box { background: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px; margin: 14px 0; }
            .footer { margin-top: 40px; font-size: 8.5pt; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>GLOBAL66 COLOMBIA - MARCO DE GESTIÓN DE RIESGO OPERATIVO (SARO)</h1>
          <p><strong>Superintendencia Financiera de Colombia (SFC) - Circular Externa 029/2014 & ISO 31000</strong></p>
          <p><em>Manual Técnico de las 4 Etapas: Identificación, Medición, Control y Monitoreo con Eventos de Riesgo.</em></p>

          <h2>1. Objetivo del SARO</h2>
          <p>Establecer las políticas, metodologías y mecanismos para gestionar de forma proactiva el Riesgo Operativo en Global66 Colombia, garantizando la continuidad operativa de los servicios de transferencias internacionales, cuentas y pagos digitales.</p>

          <h2>2. Las 4 Etapas del SARO (SFC)</h2>

          <h3>FASE 1: IDENTIFICACIÓN DE RIESGOS OPERATIVOS</h3>
          <p>Levantamiento continuo de riesgos en los procesos misionales, estratégicos y de apoyo (Cumplimiento/SARLAFT, Mesa de Dinero, Operaciones, Fraude, Ciberseguridad y TI):</p>
          <ul>
            <li><strong>Factores de Riesgo SARO:</strong> Recurso Humano, Procesos, Tecnología, Infraestructura y Acontecimientos Externos.</li>
            <li><strong>Metodología de Mapeo:</strong> Talleres RCSA, diagramas de flujo de transferencias ACH/PSE, matriz de dependencias tecnológicas y árboles de causas de falla.</li>
          </ul>

          <h3>FASE 2: MEDICIÓN Y EVALUACIÓN DE RIESGOS</h3>
          <p>Valoración de la probabilidad (1 a 5) y del impacto multicriterio (1 a 5) sobre el Patrimonio Base de <strong>$22,000,000 USD / COP</strong>:</p>
          <ul>
            <li><strong>Ponderación del Impacto:</strong> Financiero (50%), Proceso / Continuidad (20%), Reputacional (15%) y Legal/Contractual (15%).</li>
            <li><strong>Escala de Severidad:</strong>
              <ul>
                <li><strong>Nivel 1 (Leve):</strong> &lt; $660,000 USD (&le; 30% patrimonio) | Corte &lt; 1 día | Glosa interna.</li>
                <li><strong>Nivel 2 (Menor):</strong> $660,001 - $880,000 USD (40%) | Corte 2-3 días.</li>
                <li><strong>Nivel 3 (Moderado):</strong> $880,001 - $1,100,000 USD (50%) | Corte 4-5 días | Glosa legal.</li>
                <li><strong>Nivel 4 (Mayor):</strong> $1,100,001 - $1,760,000 USD (80%) | Corte 5-7 días | Sanción SFC.</li>
                <li><strong>Nivel 5 (Crítico):</strong> &gt; $1,760,001 USD (&gt; 80%) | Corte &gt; 7 días | Intervención o revocación.</li>
              </ul>
            </li>
          </ul>

          <h3>FASE 3: CONTROL Y MITIGACIÓN (SARO)</h3>
          <p>Diseño y ejecución de controles oficiales de alta eficacia:</p>
          <ul>
            <li><strong>Clasificación:</strong> Preventivos (validaciones automatizadas SARLAFT, control de cupos FX), Detectivos (conciliaciones bancarias automatizadas, alertas transaccionales) y Correctivos (planes de contingencia DRP).</li>
            <li><strong>Evaluación de Eficacia:</strong> Diseño formalizado + Ejecución periódica demostrable.</li>
          </ul>

          <h3>FASE 4: MONITOREO CONTINUO BASADO EN REGISTRO DE EVENTOS DE RIESGO</h3>
          <div class="box">
            <strong>Monitoreo Activo SARO:</strong> La vigilancia del riesgo operacional se apoya en el <strong>Registro Centralizado de Eventos de Riesgo Operativo</strong> (fallas de conciliación, fraudes materializados, caídas de canales PSE/ACH y requerimientos legales).
          </div>
          <ul>
            <li><strong>Captura de Eventos:</strong> Cada evento registrado documenta fecha, producto afectado, canal, tipo de falla, pérdida bruta en COP, cuantía recuperada y pérdida neta real.</li>
            <li><strong>Indicadores Clave de Riesgo (KRIs):</strong> Tasa de eventos por proceso, índice de pérdidas netas vs ingresos operacionales, disponibilidad de pasarelas de pago y porcentaje de efectividad de controles.</li>
            <li><strong>Recalibración del SARO:</strong> La ocurrencia reiterada de eventos activa la reevaluación de los controles del proceso y la actualización del mapa de calor ante el Comité de Riesgos.</li>
          </ul>

          <div class="footer">
            <p>CO - Global66 Colombia - SFC SARO & ISO 31000 Compliant - Global66 GRC</p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Regional
      docTitle = 'Metodologia_Regional_Consolidada_Global66_ISO31000.doc';
      htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Metodología Regional Consolidada - Global66</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 3px solid #2563eb; padding-bottom: 8px; font-size: 20pt; }
            h2 { color: #1e3a8a; margin-top: 24px; font-size: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            h3 { color: #334155; font-size: 11pt; margin-top: 16px; font-weight: bold; }
            p, li { font-size: 10pt; color: #334155; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 9pt; }
            th { background-color: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; padding: 8px; text-align: left; font-weight: bold; }
            td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
            .box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px; margin: 14px 0; }
            .footer { margin-top: 40px; font-size: 8.5pt; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>GLOBAL66 REGIONAL - MARCO CONSOLIDADO DE GESTIÓN DE RIESGOS CORPORATIVOS (GRC)</h1>
          <p><strong>Estándar Internacional ISO 31000:2018, ROAM Framework y Consolidación Multipaís</strong></p>
          <p><em>Marco Unificado de Identificación, Medición, Control y Monitoreo Basado en Eventos para todos los Procesos Corporativos.</em></p>

          <h2>1. Alcance Transversal de Procesos</h2>
          <p>El Marco Regional homologa la gestión de riesgos para las 8 áreas estratégicas (Operaciones, Mesa de Dinero, Cumplimiento, Fraude, Ciberseguridad, TI, Nuevos Productos y Riesgos Nube) en Chile (CMF), Colombia (SFC) y Argentina (BCRA), asegurando coherencia e inmutabilidad de los riesgos aprobados.</p>

          <h2>2. Las 4 Etapas del Ciclo de Riesgos (ISO 31000)</h2>

          <h3>FASE 1: IDENTIFICACIÓN DE RIESGOS</h3>
          <p>Identificación exhaustiva de fuentes de riesgo, causas subyacentes y eventos potenciales mediante RCSA y mapeo de procesos end-to-end transfronterizos.</p>

          <h3>FASE 2: MEDICIÓN Y EVALUACIÓN DEL RIESGO</h3>
          <p>Cuantificación en matriz 5×5 de Probabilidad e Impacto multidimensional (Financiero, Continuidad de Negocio, Regulatorio y Reputacional), calculando el Riesgo Inherente y estableciendo el Apetito de Riesgo.</p>

          <h3>FASE 3: CONTROL Y MITIGACIÓN (INVENTARIO OFICIAL)</h3>
          <p>Despliegue del inventario corporativo de controles oficiales (Preventivos, Detectivos, Correctivos / Automáticos, Semiautomáticos, Manuales) evaluados en diseño y eficacia para determinar el Riesgo Residual.</p>

          <h3>FASE 4: MONITOREO CONTINUO MEDIANTE EVENTOS DE RIESGO</h3>
          <div class="box">
            <strong>Monitoreo Basado en Eventos de Riesgo:</strong> La supervisión regional opera mediante la captura continua y agregación de <strong>Eventos de Pérdida, Incidentes Operacionales y Ciberincidentes</strong> ocurridos en todas las filiales, retroalimentando la matriz de riesgos y los planes de acción ante desviaciones de tolerancia.
          </div>
          <ul>
            <li><strong>Seguimiento de KRIs Regionales:</strong> Disponibilidad global de pasarelas, pérdida neta acumulada por país, tiempos de remediación y tasa de efectividad de controles.</li>
          </ul>

          <div class="footer">
            <p>Global66 Regional GRC - ISO 31000 & Multi-jurisdiction Framework</p>
          </div>
        </body>
        </html>
      `;
    }

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docTitle;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerSuccess('Word (.doc)');
  };

  const handlePrintPdf = () => {
    window.print();
    triggerSuccess('Imprimir / PDF');
  };

  const handleDownloadMarkdown = () => {
    let filename = `Metodologia_Global66_${activeJurisdiction}.md`;
    let mdContent = '';

    if (activeJurisdiction === 'Chile') {
      filename = 'Metodologia_CMF_NCG464_Chile_GlobalCardSpA.md';
      mdContent = `# CH - GLOBAL CARD S.P.A. (CHILE) - MARCO DE GESTIÓN DE RIESGO OPERACIONAL Y CIBERSEGURIDAD
**Cumplimiento Regulatorio: Comisión para el Mercado Financiero (CMF) - NCG 464, RAN 20-10 & Ley FinTech 21.521**

## 1. Identificación de Riesgos (CMF)
- **Metodología**: RCSA, mapeo de procesos de emisión/autorización de tarjetas, análisis de dependencias de adquirentes (Transbank, Klap, Getnet) y conexiones bancarias.
- **Taxonomía de Factores**: Procesos, Personas, Tecnología, Proveedores y Eventos Externos.
- **Ejes Críticos**: Salvaguarda de fondos en cuentas corrientes segregadas (NCG 464), gestión de accesos y ciberseguridad (RAN 20-10) y compliance AML/UAF.

## 2. Medición y Evaluación de Riesgos
- **Escala 5×5**: Probabilidad (1 a 5) × Impacto (1 a 5) = Severidad Inherente (1 a 25).
- **Escala de Impacto Patrimonial (UF / USD)**:
  - **Nivel 1 (Leve)**: < 500 UF (< $20,000 USD) | Corte < 1 hora
  - **Nivel 2 (Menor)**: 500 - 2,500 UF ($20k - $100k USD) | Corte 1 a 4 horas
  - **Nivel 3 (Moderado)**: 2,500 - 10,000 UF ($100k - $400k USD) | Corte 4 a 12 horas | Requerimiento CMF
  - **Nivel 4 (Grave)**: 10,000 - 30,000 UF ($400k - $1.2M USD) | Corte 12 a 24 horas | Formulación de cargos CMF
  - **Nivel 5 (Crítico)**: > 30,000 UF (> $1,200,000 USD) | Corte > 24 horas | Revocación o intervención CMF

## 3. Control y Mitigación (Inventario Oficial & ROAM)
- **Controles Oficiales**: Preventivos, Detectivos y Correctivos con evaluación de diseño y eficacia operativa (Excelente 100%, Buena 80%, Suficiente 60%, Deficiente 0%).
- **Marco ROAM**: Resolved, Owned, Accepted, Mitigated con responsables formales.

## 4. Monitoreo Continuo Basado en Eventos de Riesgo e Incidentes
- **Principio Rector**: El monitoreo activo se ejecuta mediante el levantamiento, captura y análisis de **Eventos de Riesgo Reales, Incidentes Materializados y Fallos de Red**.
- **Registro Cuantitativo**: Fecha de ocurrencia, fecha de detección, causa raíz técnica, pérdida económica bruta (CLP/UF), recuperos y pérdida neta final.
- **KRIs Basados en Eventos**: Disponibilidad del servicio de tarjetas (SLA > 99.95%), ratio de contracargos por fraude (< 0.10%), tiempo de respuesta ante caídas de procesador y balance cero en descalces de provisión.
- **Retroalimentación y Recalibración**: Todo evento de alta severidad o recurrencia anómala dispara la reevaluación obligatoria de controles y el reporte urgente al Comité de Riesgos y a la CMF.
`;
    } else if (activeJurisdiction === 'Argentina') {
      filename = 'Metodologia_BCRA_A7783_Argentina_Global66.md';
      mdContent = `# AR - GLOBAL66 ARGENTINA S.A.U. - MARCO DE GESTIÓN DEL RIESGO OPERACIONAL
**Cumplimiento Regulatorio: BCRA Comunicación "A" 7783, "A" 7784 & Basilea III**

## 1. Identificación de Riesgos (7 Categorías Basilea III / BCRA)
1. Fraude Interno
2. Fraude Externo (Phishing, SIM swapping, DEBIN apócrifo, estafas QR)
3. Relaciones Laborales y Seguridad en el Trabajo
4. Clientes, Productos y Prácticas Empresariales (AUF / Com. A 7319)
5. Daños a Activos Físicos
6. Incidencias en el Negocio y Fallos en Sistemas (Com. A 7260 - Coelsa, VPN, APIs)
7. Ejecución, Entrega y Gestión de Procesos (Echeqs, transferencias, regímenes informativos)

## 2. Medición y Evaluación de Riesgos
- **Matriz 5×5**: Probabilidad (1 a 5) × Impacto (1 a 5) = Severidad (1 a 25).
- **Umbrales Financieros ($ARS / USD)**:
  - **Nivel 1**: < $5M ARS (< $5,000 USD)
  - **Nivel 2**: $5M - $25M ARS ($5k - $25k USD)
  - **Nivel 3**: $25M - $100M ARS ($25k - $100k USD)
  - **Nivel 4**: $100M - $300M ARS ($100k - $300k USD)
  - **Nivel 5**: > $300M ARS (> $300,000 USD)

## 3. Control y Mitigación
- **Controles Oficiales**: Evaluación de diseño y eficacia operativa.
- **Ponderación**: Excelente (100%), Buena (80%), Suficiente (60%), Deficiente (0%).

## 4. Monitoreo Cuantitativo Basado en Base de Datos de Eventos de Pérdida (LED)
- **Monitoreo con Eventos (Com. A 7783)**: Registro inalterable de cada evento de riesgo materializado en la Base LED.
- **Variables de Evento**: Pérdida Bruta ($ARS), Recuperos ($ARS) y Pérdida Neta ($ARS).
- **KRIs y Recalibración**: Frecuencia mensual por categoría Basilea III, pérdida neta acumulada trimestral vs. capital, y retroalimentación automática de la matriz ante eventos > $5M ARS.
`;
    } else if (activeJurisdiction === 'Colombia') {
      filename = 'Metodologia_SFC_SARO_Colombia_Global66.md';
      mdContent = `# CO - GLOBAL66 COLOMBIA - MARCO DE GESTIÓN DE RIESGO OPERATIVO (SARO)
**Superintendencia Financiera de Colombia (SFC) - Circular Externa 029/2014 & ISO 31000**

## 1. Identificación de Riesgos Operativos (SARO)
- Mapeo en procesos de Cumplimiento (SARLAFT), Mesa de Dinero, Operaciones, Fraude, Ciberseguridad y TI.
- Factores: Personas, Procesos, Tecnología, Infraestructura y Eventos Externos.

## 2. Medición y Evaluación de Riesgos
- Patrimonio Base: $22,000,000 USD / COP.
- Criterios Ponderados: Financiero (50%), Proceso (20%), Reputacional (15%) y Legal (15%).
- Escala 1 a 5 de severidad con umbrales porcentuales de afectación patrimonial.

## 3. Control y Mitigación (SARO)
- Controles Oficiales Preventivos, Detectivos y Correctivos con evaluación de eficacia formal.
- Asignación de responsables de proceso y planes de acción.

## 4. Monitoreo Continuo Basado en Registro de Eventos de Riesgo
- **Monitoreo con Eventos**: Captura estandarizada de todo incidente operacional materializado (fallas de conciliación, fraudes, caídas de PSE/ACH).
- **Detalle de Evento**: Fecha de ocurrencia, fecha de detección, pérdida bruta COP, cuantía recuperada y pérdida neta real.
- **KRIs de Eventos**: Tasa de eventos por proceso, índice de pérdidas netas vs ingresos, disponibilidad de canales y recalibración de la matriz de riesgos.
`;
    } else {
      filename = 'Metodologia_Regional_Consolidada_Global66.md';
      mdContent = `# GLOBAL66 REGIONAL - MARCO CONSOLIDADO DE GESTIÓN DE RIESGOS (GRC)
**Estándar Internacional ISO 31000:2018 & ROAM Framework**

## 1. Identificación de Riesgos
Homologación transversal de los 8 macroprocesos corporativos en Chile, Colombia y Argentina.

## 2. Medición de Riesgos
Matriz 5×5 de Probabilidad e Impacto multicriterio (Financiero, Operacional, Legal y Reputacional).

## 3. Control y Mitigación
Inventario centralizado de controles oficiales clasificados por naturaleza, automatización y eficacia.

## 4. Monitoreo Continuo Basado en Eventos de Riesgo
- Consolidación agregada de eventos de pérdida e incidentes operacionales ocurridos en todas las filiales.
- Seguimiento de KRIs corporativos y recalibración dinámica de la matriz de riesgos ante desviaciones de tolerancia.
`;
    }

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerSuccess('Markdown (.md)');
  };

  const profile = ENTITY_PROFILES[activeJurisdiction] || ENTITY_PROFILES['Regional'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER BANNER & SELECTOR DE ENTIDADES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 print:shadow-none print:border-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                activeJurisdiction === 'Chile'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : activeJurisdiction === 'Argentina'
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : activeJurisdiction === 'Colombia'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                <Landmark size={14} />
                <span>{profile.flag} {profile.regulator}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 uppercase tracking-wider">
                {profile.standard}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Metodología de Gestión de Riesgos - {profile.name}
            </h2>
            <p className="text-slate-500 text-sm font-medium max-w-2xl">
              {profile.description}
            </p>
          </div>

          {/* BOTONES DE DESCARGA */}
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 shrink-0 print:hidden">
            <button
              onClick={handleDownloadWord}
              title="Descargar documento completo para Microsoft Word"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {downloadedFormat === 'Word (.doc)' ? <Check size={16} className="text-green-300" /> : <FileType size={16} />}
              <span>Word (.doc)</span>
            </button>

            <button
              onClick={handlePrintPdf}
              title="Imprimir o guardar como PDF oficial"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {downloadedFormat === 'Imprimir / PDF' ? <Check size={16} className="text-green-300" /> : <Printer size={16} />}
              <span>PDF / Imprimir</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              title="Descargar en formato Markdown"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              {downloadedFormat === 'Markdown (.md)' ? <Check size={16} className="text-emerald-600" /> : <Download size={16} />}
              <span>Markdown (.md)</span>
            </button>
          </div>
        </div>

        {/* CONMUTADOR DE EMPRESAS / JURISDICCIONES */}
        <div className="p-3 bg-slate-900 text-white rounded-xl space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers size={15} className="text-amber-400" />
              Seleccionar Marco Metodológico por Empresa / Jurisdicción:
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Alineación internacional ISO 31000 & Regulación Local
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveJurisdiction('Regional')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeJurisdiction === 'Regional'
                  ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🌎</span>
              <span>Regional (Consolidado)</span>
            </button>

            <button
              onClick={() => setActiveJurisdiction('Chile')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeJurisdiction === 'Chile'
                  ? 'bg-rose-600 text-white shadow-md scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🇨🇱</span>
              <span>CH - Global Card (CMF)</span>
            </button>

            <button
              onClick={() => setActiveJurisdiction('Colombia')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeJurisdiction === 'Colombia'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🇨🇴</span>
              <span>CO - Colombia (SFC)</span>
            </button>

            <button
              onClick={() => setActiveJurisdiction('Argentina')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeJurisdiction === 'Argentina'
                  ? 'bg-sky-400 text-slate-950 shadow-md scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🇦🇷</span>
              <span>AR - Argentina (BCRA)</span>
            </button>
          </div>
        </div>

        {/* NAVEGADOR DE LAS 4 FASES DEL CICLO DE RIESGO */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity size={15} className="text-blue-600" />
              Ciclo Integral de Gestión del Riesgo en {profile.shortName}:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => setSelectedStage('identificacion')}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all text-left cursor-pointer border ${
                selectedStage === 'identificacion'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedStage === 'identificacion' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Search size={14} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-black">FASE 1</span>
                <span>1. Identificación</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedStage('medicion')}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all text-left cursor-pointer border ${
                selectedStage === 'medicion'
                  ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm ring-1 ring-purple-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedStage === 'medicion' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <BarChart3 size={14} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-black">FASE 2</span>
                <span>2. Medición</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedStage('control')}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all text-left cursor-pointer border ${
                selectedStage === 'control'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm ring-1 ring-emerald-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedStage === 'control' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <ShieldCheck size={14} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-black">FASE 3</span>
                <span>3. Control</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedStage('monitoreo')}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all text-left cursor-pointer border ${
                selectedStage === 'monitoreo'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedStage === 'monitoreo' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Bell size={14} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-black">FASE 4</span>
                <span className="font-black">4. Monitoreo (Eventos)</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedStage('matriz')}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all text-left cursor-pointer border ${
                selectedStage === 'matriz'
                  ? 'bg-slate-900 border-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedStage === 'matriz' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Sliders size={14} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-black">REFERENCIA</span>
                <span>Matriz 5×5 & Escalas</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {downloadedFormat && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            ¡Documento normativo de Metodología ({profile.shortName}) generado y descargado con éxito ({downloadedFormat})!
          </span>
          <span className="text-[10px] text-emerald-600 font-mono">Global66 GRC System</span>
        </motion.div>
      )}

      {/* CONTENIDO DETALLADO DE LAS 4 FASES SEGÚN LA EMPRESA / JURISDICCIÓN ACTIVA */}

      {/* ========================================================================= */}
      {/* FASE 1: CÓMO SE IDENTIFICAN LOS RIESGOS                                   */}
      {/* ========================================================================= */}
      {selectedStage === 'identificacion' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                <Search size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Fase 1 del Ciclo de Riesgos</span>
                <h3 className="text-xl font-black text-slate-900">
                  ¿Cómo se Identifican los Riesgos en {profile.name}?
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              La identificación es el proceso estructurado y proactivo mediante el cual se reconocen, formulan y registran todas las fuentes de riesgo, causas subyacentes y eventos potenciales que puedan obstaculizar los objetivos de negocio y el cumplimiento normativo en <strong className="text-slate-900">{profile.name}</strong>.
            </p>

            {/* Mecanismos de Identificación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-600" /> 1. Talleres RCSA Periódicos
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Autoevaluación de Riesgos y Controles (Risk & Control Self-Assessment) con los dueños de cada proceso operativo, mesa de dinero, cumplimiento y TI para detectar vulnerabilidades en el flujo de trabajo diario.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={16} className="text-emerald-600" /> 2. Análisis de Cambios y Productos
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluación previa obligatoria ante lanzamientos de nuevas funcionalidades (tarjetas, cuentas, integraciones API, nuevos corredores de divisas) y cambios mayores en la arquitectura en la nube.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-purple-600" /> 3. Taxonomía de Factores de Riesgo
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clasificación en 5 factores esenciales: <strong>Procesos Internos</strong>, <strong>Personas / Factor Humano</strong>, <strong>Tecnología e Información</strong>, <strong>Infraestructura / Proveedores</strong> y <strong>Eventos Externos</strong>.
                </p>
              </div>
            </div>

            {/* Formulación Estándar GRC */}
            <div className="bg-blue-50/60 border border-blue-200 p-5 rounded-xl space-y-3">
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Formulación Estándar de Riesgos en Global66 (Fórmula GRC)
              </h4>
              <p className="text-xs text-blue-950 leading-relaxed">
                Para garantizar la coherencia y eliminar descripciones ambiguas, todo riesgo identificado debe redactarse bajo la estructura canónica:
              </p>
              <div className="p-3 bg-white rounded-lg border border-blue-300 font-mono text-xs text-slate-800 font-semibold shadow-xs">
                [Evento de Riesgo Operativo] + "debido a" + [Causa Raíz / Falla de Control] + "generando" + [Impacto en el Negocio / Sanción Regulatoria]
              </div>
            </div>

            {/* Particularidades Regulatorias de Identificación por Empresa */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Ejes Específicos de Identificación en {profile.shortName} ({profile.standard})
              </h4>
              {activeJurisdiction === 'Chile' && (
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-2 text-rose-950">
                  <p className="font-bold flex items-center gap-1.5 text-rose-900">
                    <Landmark size={15} /> Foco CMF Chile (NCG 464 & RAN 20-10):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-rose-900/80 leading-relaxed pl-2">
                    <li><strong>Provisión de Fondos:</strong> Identificación de descalces entre saldos de tarjetahabientes y cuentas bancarias segregadas.</li>
                    <li><strong>Procesamiento Adquirente:</strong> Puntos de falla en la conexión con redes de adquirencia (Transbank, Getnet, Klap).</li>
                    <li><strong>Ciberseguridad RAN 20-10:</strong> Vectores de ataque a APIs de tarjetas, credenciales y protocolos 3DS.</li>
                  </ul>
                </div>
              )}

              {activeJurisdiction === 'Argentina' && (
                <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl text-xs space-y-2 text-sky-950">
                  <p className="font-bold flex items-center gap-1.5 text-sky-900">
                    <Landmark size={15} /> Foco BCRA Argentina (Comunicación "A" 7783 & Basilea III):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sky-900/80 leading-relaxed pl-2">
                    <li><strong>7 Categorías Normativas:</strong> Clasificación mandatoria en Fraude Interno, Fraude Externo, Laboral, Prácticas Comerciales (AUF), Activos Físicos, Fallos en Sistemas (Coelsa/VPN) y Procesos/Echeqs.</li>
                    <li><strong>Cuentas de Pago (CVU):</strong> Puntos de riesgo en la compensación inmediata interbancaria.</li>
                  </ul>
                </div>
              )}

              {activeJurisdiction === 'Colombia' && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-950">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Landmark size={15} /> Foco SFC Colombia (Circular Externa 029/2014 - SARO):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-900/80 leading-relaxed pl-2">
                    <li><strong>Procesos SARO:</strong> Identificación en pasarelas ACH/PSE, corresponsales y liquidación transfronteriza.</li>
                    <li><strong>Riesgo de Lavado de Activos (SARLAFT):</strong> Puntos de fuga en listas restrictivas y segmentación transaccional.</li>
                  </ul>
                </div>
              )}

              {activeJurisdiction === 'Regional' && (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-2 text-blue-950">
                  <p className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Globe2 size={15} /> Foco Regional Consolidado (ISO 31000:2018):
                  </p>
                  <p className="text-blue-900/80 leading-relaxed">
                    Identificación de riesgos operacionales transversales en los 8 macroprocesos corporativos, asegurando que un riesgo identificado en una filial sea analizado y protegido en todas las demás.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* FASE 2: CÓMO SE MIDEN Y EVALÚAN LOS RIESGOS                               */}
      {/* ========================================================================= */}
      {selectedStage === 'medicion' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                <BarChart3 size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Fase 2 del Ciclo de Riesgos</span>
                <h3 className="text-xl font-black text-slate-900">
                  ¿Cómo se Miden y Evalúan los Riesgos en {profile.name}?
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              La medición es la cuantificación y ponderación objetiva de la probabilidad de ocurrencia y la severidad del impacto potencial, permitiendo calcular el <strong className="text-slate-900">Riesgo Inherente</strong> (antes de controles) y contrastarlo con el apetito de riesgo de la compañía.
            </p>

            {/* Las 2 Dimensiones de Medición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-600" /> 1. Probabilidad de Ocurrencia (1 a 5)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Frecuencia histórica o recurrencia estimada con la que el evento de riesgo puede materializarse en la operación:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 font-medium pl-1">
                  <li><strong className="text-slate-900">1 - Rara vez:</strong> Menos de 1 vez cada 3 años.</li>
                  <li><strong className="text-slate-900">2 - Improbable:</strong> 1 vez cada 1 a 3 años.</li>
                  <li><strong className="text-slate-900">3 - Posible:</strong> 1 vez al año o semestral.</li>
                  <li><strong className="text-slate-900">4 - Probable:</strong> 1 vez cada 1 a 3 meses.</li>
                  <li><strong className="text-slate-900">5 - Casi Seguro:</strong> Más de 1 vez al mes o recurrencia continua.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600" /> 2. Impacto Multicriterio (1 a 5)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluación multidimensional de la consecuencia máxima estimada ponderando 4 pilares:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-slate-900 block font-black">Financiero (50%)</strong>
                    <span className="text-slate-500">Pérdida patrimonial ({profile.currency})</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-slate-900 block font-black">Operacional (20%)</strong>
                    <span className="text-slate-500">Tiempos de interrupción (RTO)</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-slate-900 block font-black">Regulatorio (15%)</strong>
                    <span className="text-slate-500">Glosas, multas o revocación</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-slate-900 block font-black">Reputacional (15%)</strong>
                    <span className="text-slate-500">Afectación de marca/confianza</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cálculo de Severidad y Veredictos */}
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
              <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider">
                Fórmula de Severidad Inherente y Veredictos de Aceptabilidad
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-purple-300 font-mono text-xs font-bold text-purple-900">
                  Severidad = Probabilidad (1-5) × Impacto (1-5) &nbsp; [Escala 1 a 25]
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900">
                  <span className="font-black block">BAJO (1 a 5)</span>
                  <span className="text-[11px]">Aceptable dentro del apetito ordinario.</span>
                </div>
                <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-900">
                  <span className="font-black block">MODERADO (6 a 11)</span>
                  <span className="text-[11px]">Tolerable con controles de seguimiento.</span>
                </div>
                <div className="p-2.5 bg-orange-100/70 border border-orange-300 rounded-lg text-orange-900">
                  <span className="font-black block">ALTO (12 a 16)</span>
                  <span className="text-[11px]">Inaceptable. Exige plan de mitigación formal.</span>
                </div>
                <div className="p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg text-rose-900">
                  <span className="font-black block">EXTREMO (17 a 25)</span>
                  <span className="text-[11px]">Crítico. Tratamiento urgente e inmediato.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* FASE 3: CÓMO SE CONTROLAN Y MITIGAN LOS RIESGOS                            */}
      {/* ========================================================================= */}
      {selectedStage === 'control' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Fase 3 del Ciclo de Riesgos</span>
                <h3 className="text-xl font-black text-slate-900">
                  ¿Cómo se Controlan y Mitigan los Riesgos en {profile.name}?
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              El control y la mitigación consisten en el diseño, implementación y verificación operativa de las salvaguardas que reducen la probabilidad y/o el impacto del riesgo inherente, calculando el <strong className="text-slate-900">Riesgo Residual</strong> y asignando responsabilidades bajo el marco <strong className="text-emerald-700 font-bold">ROAM</strong>.
            </p>

            {/* Inventario Oficial vs IA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" /> Inventario de Controles Oficiales (Compañía)
                </h4>
                <p className="text-xs text-emerald-950/80 leading-relaxed">
                  Controles formalmente implementados y auditados por los Dueños de Proceso. Tienen código oficial (<code className="font-mono bg-emerald-200/60 px-1 rounded">CTRL-G66-*</code>), evidencia demostrable y reducen matemáticamente la severidad residual.
                </p>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" /> Propuestas Desacopladas de IA
                </h4>
                <p className="text-xs text-amber-950/80 leading-relaxed">
                  Recomendaciones generativas para enriquecer el apetito y sugerir nuevas salvaguardas. No alteran el riesgo residual oficial hasta ser aprobadas e implementadas por el equipo de GRC.
                </p>
              </div>
            </div>

            {/* Dimensiones de Clasificación de Controles */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black text-left">
                    <th className="p-3 border border-slate-200">Criterio de Control</th>
                    <th className="p-3 border border-slate-200">Clasificación</th>
                    <th className="p-3 border border-slate-200">Efecto Mitigante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50">Por su Naturaleza</td>
                    <td className="p-3 border border-slate-200">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px] mr-1">Preventivo</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] mr-1">Detectivo</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Correctivo</span>
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-600">
                      Los preventivos reducen probabilidad; los detectivos y correctivos reducen el impacto y tiempo de exposición.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50">Por su Automatización</td>
                    <td className="p-3 border border-slate-200">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px] mr-1">Automático</span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px] mr-1">Semiautomático</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px]">Manual</span>
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-600">
                      Los automáticos (código, APIs, WAF) tienen mayor fiabilidad y menor tasa de falla humana.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50">Eficacia Operativa</td>
                    <td className="p-3 border border-slate-200">
                      Excelente (100%), Buena (80%), Suficiente (60%), Deficiente (0%)
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-600">
                      Factor multiplicador aplicado a la reducción de probabilidad e impacto residual.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Gobernanza ROAM */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-slate-700" /> Gobernanza de Tratamiento ROAM
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-blue-700 font-black block">Resolved (Resuelto)</strong>
                  <p className="text-[11px] text-slate-600 mt-1">Causa mitigada al 100% o proceso rediseñado. Residual 1×1 (Bajo).</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-amber-700 font-black block">Owned (Asignado)</strong>
                  <p className="text-[11px] text-slate-600 mt-1">En proceso activo de implementación de controles por el ROAM Owner.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-purple-700 font-black block">Accepted (Aceptado)</strong>
                  <p className="text-[11px] text-slate-600 mt-1">Riesgo residual dentro de los límites de tolerancia formalmente asumidos.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-emerald-700 font-black block">Mitigated (Mitigado)</strong>
                  <p className="text-[11px] text-slate-600 mt-1">Controlado permanentemente por salvaguardas oficiales eficaces.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* FASE 4: CÓMO SE MONITOREAN LOS RIESGOS (CON EVENTOS DE RIESGO)            */}
      {/* ========================================================================= */}
      {selectedStage === 'monitoreo' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                <Bell size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Fase 4 del Ciclo de Riesgos</span>
                <h3 className="text-xl font-black text-slate-900">
                  ¿Cómo se Monitorean los Riesgos con Eventos de Riesgo en {profile.name}?
                </h3>
              </div>
            </div>

            {/* CALLOUT CRUCIAL DE MONITOREO CON EVENTOS */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-5 rounded-r-xl space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-600" />
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Principio Rector: El Monitoreo es Dinámico y se Basa en Eventos de Riesgo
                </h4>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed">
                En <strong>Global66</strong>, el monitoreo del riesgo operacional <strong className="text-slate-900">no es un ejercicio teórico ni estático</strong>. Se fundamenta activamente en la detección, captura, registro cuantitativo y análisis continuo de <strong className="text-amber-800 font-bold">Eventos de Riesgo Reales, Incidentes Materializados, Pérdidas Operativas y Cuasi-accidentes (Near Misses)</strong>.
              </p>
            </div>

            {/* Los 4 Pilares del Monitoreo con Eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Database size={16} className="text-blue-600" /> 1. Registro Obligatorio de Eventos de Riesgo
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Todo incidente operacional que genere impacto o riesgo inminente debe registrarse con sus variables canónicas:
                </p>
                <ul className="text-xs text-slate-700 space-y-1 font-medium pl-2 list-disc list-inside">
                  <li>Fecha de Ocurrencia y Fecha de Detección (MTTD).</li>
                  <li>Proceso, Canal o Producto afectado.</li>
                  <li>Causa raíz demostrada y fallo de control asociado.</li>
                  <li><strong>Pérdida Bruta:</strong> Monto total del quebranto originado.</li>
                  <li><strong>Recuperos:</strong> Recuperaciones vía seguros, contracargos o reintegros.</li>
                  <li><strong>Pérdida Neta:</strong> Pérdida Bruta - Recuperos (imputación final).</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw size={16} className="text-emerald-600" /> 2. Contraste Matriz vs. Realidad Fáctica
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comparación mensual obligatoria entre el nivel de riesgo residual proyectado en la matriz contra la frecuencia y severidad real de los eventos ocurridos en producción.
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                  <strong className="text-slate-900 block font-bold">Verificación de Desviaciones:</strong>
                  <span>Si un riesgo calificado como 'Bajo' genera eventos recurrentes o con pérdidas inesperadas, se activa una alerta inmediata de recalibración de la matriz.</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-purple-600" /> 3. Indicadores Clave de Riesgo (KRIs)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Métricas de alerta temprana calculadas directamente a partir del historial de eventos de riesgo:
                </p>
                <ul className="text-xs text-slate-700 space-y-1 font-medium pl-2 list-disc list-inside">
                  <li><strong>KRI Frecuencia:</strong> Número de eventos de riesgo por mes/área.</li>
                  <li><strong>KRI Severidad:</strong> Pérdida neta acumulada vs. tolerancia patrimonial.</li>
                  <li><strong>KRI Disponibilidad:</strong> Tiempo de inactividad de APIs / Pasarelas.</li>
                  <li><strong>KRI Eficacia:</strong> Porcentaje de eventos detectados antes de generar pérdida.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600" /> 4. Triggers de Alerta y Retroalimentación
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Disparadores automáticos que obligan a revisar los controles y actualizar la matriz:
                </p>
                <ul className="text-xs text-slate-700 space-y-1 font-medium pl-2 list-disc list-inside">
                  <li>Ocurrencia de cualquier evento de impacto &gt; Nivel 3.</li>
                  <li>Falla total o vulneración de un control calificado como 'Excelente'.</li>
                  <li>Apertura automática de Plan de Acción correctivo en el módulo de Planes.</li>
                  <li>Escalamiento obligatorio al Comité de Riesgos y al Directorio.</li>
                </ul>
              </div>
            </div>

            {/* Módulos de Monitoreo por Jurisdicción */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Instrumentos de Monitoreo de Eventos en {profile.shortName}
              </h4>

              {activeJurisdiction === 'Argentina' && (
                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 text-xs text-sky-950">
                  <div className="flex items-center gap-2 font-bold text-sky-900">
                    <Database size={16} className="text-sky-700" />
                    <span>Módulo Oficial: Base de Datos de Eventos de Pérdida (LED - BCRA Com. A 7783)</span>
                  </div>
                  <p className="leading-relaxed text-sky-900/80">
                    Global66 Argentina cuenta con la vista integrada de la <strong>Base LED</strong> para registrar y reportar eventos en las 7 categorías de Basilea III, calculando de forma continua la Pérdida Bruta, Recuperos y Pérdida Neta para la calibración del capital regulatorio.
                  </p>
                </div>
              )}

              {activeJurisdiction === 'Chile' && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-950">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <CreditCard size={16} className="text-rose-700" />
                    <span>Monitoreo CMF de Incidentes Operacionales y Ciberseguridad (NCG 464 / RAN 20-10)</span>
                  </div>
                  <p className="leading-relaxed text-rose-900/80">
                    Monitoreo continuo de cortes de adquirencia, descalces diarios en cuentas de salvaguarda de provisión de fondos y eventos de fraude en tarjetas, con reporte inmediato de incidentes graves a la CMF.
                  </p>
                </div>
              )}

              {activeJurisdiction === 'Colombia' && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <BookOpen size={16} className="text-amber-700" />
                    <span>Monitoreo SARO mediante Registro Centralizado de Eventos (SFC Circ. 029/2014)</span>
                  </div>
                  <p className="leading-relaxed text-amber-900/80">
                    Captura y reporte periódico de eventos operativos y fallas en canales PSE/ACH ante el Oficial de Cumplimiento y el Comité de Riesgos, midiendo la pérdida neta frente al patrimonio base de $22M USD.
                  </p>
                </div>
              )}

              {activeJurisdiction === 'Regional' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <Globe2 size={16} className="text-blue-700" />
                    <span>Consolidación Corporativa Regional de Eventos de Riesgo</span>
                  </div>
                  <p className="leading-relaxed text-blue-900/80">
                    Agregación centralizada de todos los incidentes ocurridos en Chile, Colombia, Argentina, Perú y Ecuador para identificar patrones sistémicos y fortalecer los controles transversales de la corporación.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN REFERENCIAL: MATRIZ 5x5 Y ESCALAS DE IMPACTO                     */}
      {/* ========================================================================= */}
      {selectedStage === 'matriz' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <Sliders size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Parámetros de Severidad</span>
                <h3 className="text-xl font-black text-slate-900">
                  Escalas de Probabilidad, Impacto y Matriz 5×5 en {profile.shortName}
                </h3>
              </div>
            </div>

            {/* TABLA DE IMPACTO ESPECÍFICA DE LA JURISDICCIÓN */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Escala de Impacto Patrimonial y Operativo ({profile.currency})
              </h4>

              {activeJurisdiction === 'Chile' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black text-left">
                        <th className="p-2.5 border border-slate-200 text-center">Nivel</th>
                        <th className="p-2.5 border border-slate-200">Impacto Financiero (UF / USD)</th>
                        <th className="p-2.5 border border-slate-200">Interrupción Operacional en Tarjetas</th>
                        <th className="p-2.5 border border-slate-200">Impacto Regulatorio CMF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-2.5 border border-slate-200 text-center font-black">1</td>
                        <td className="p-2.5 border border-slate-200 font-bold">&lt; 500 UF (&lt; $20,000 USD)</td>
                        <td className="p-2.5 border border-slate-200">Interrupción &lt; 1 hora sin afectación</td>
                        <td className="p-2.5 border border-slate-200">Sin afectación formal</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 border border-slate-200 text-center font-black">2</td>
                        <td className="p-2.5 border border-slate-200 font-bold">500 - 2,500 UF ($20k - $100k USD)</td>
                        <td className="p-2.5 border border-slate-200">Corte de 1 a 4 horas en canales auxiliares</td>
                        <td className="p-2.5 border border-slate-200">Revisión interna en Comité de Riesgo</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border border-slate-200 text-center font-black">3</td>
                        <td className="p-2.5 border border-slate-200 font-bold text-amber-700">2,500 - 10,000 UF ($100k - $400k USD)</td>
                        <td className="p-2.5 border border-slate-200">Corte de 4 a 12 horas en procesamiento</td>
                        <td className="p-2.5 border border-slate-200">Oficio informativo o requerimiento CMF</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 border border-slate-200 text-center font-black">4</td>
                        <td className="p-2.5 border border-slate-200 font-bold text-orange-700">10,000 - 30,000 UF ($400k - $1.2M USD)</td>
                        <td className="p-2.5 border border-slate-200">Corte de 12 a 24 horas con retrasos</td>
                        <td className="p-2.5 border border-slate-200">Formulación de cargos o plan de regularización</td>
                      </tr>
                      <tr className="bg-red-50 text-red-950 font-bold">
                        <td className="p-2.5 border border-slate-200 text-center text-red-700 font-black">5</td>
                        <td className="p-2.5 border border-slate-200 text-red-700">&gt; 30,000 UF (&gt; $1,200,000 USD)</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Corte &gt; 24 horas o descalce provisión</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Suspensión de autorización o revocación CMF</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeJurisdiction === 'Argentina' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black text-left">
                        <th className="p-2.5 border border-slate-200 text-center">Nivel</th>
                        <th className="p-2.5 border border-slate-200">Pérdida Financiera Bruta/Neta ($ARS / USD)</th>
                        <th className="p-2.5 border border-slate-200">Afectación Operacional / Coelsa</th>
                        <th className="p-2.5 border border-slate-200">Impacto Regulatorio BCRA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-2.5 border border-slate-200 text-center font-black">1</td>
                        <td className="p-2.5 border border-slate-200 font-bold">&lt; $5,000,000 ARS (&lt; $5,000 USD)</td>
                        <td className="p-2.5 border border-slate-200">Interrupción menor &lt; 30 min</td>
                        <td className="p-2.5 border border-slate-200">Sin notificación formal</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 border border-slate-200 text-center font-black">2</td>
                        <td className="p-2.5 border border-slate-200 font-bold">$5,000,000 - $25,000,000 ARS</td>
                        <td className="p-2.5 border border-slate-200">Corte de 30 min a 2 horas</td>
                        <td className="p-2.5 border border-slate-200">Registro en Base LED interna</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border border-slate-200 text-center font-black">3</td>
                        <td className="p-2.5 border border-slate-200 font-bold text-amber-700">$25,000,000 - $100,000,000 ARS</td>
                        <td className="p-2.5 border border-slate-200">Corte de 2 a 6 horas en transferencias</td>
                        <td className="p-2.5 border border-slate-200">Requerimiento o sumario informativo BCRA</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 border border-slate-200 text-center font-black">4</td>
                        <td className="p-2.5 border border-slate-200 font-bold text-orange-700">$100,000,000 - $300,000,000 ARS</td>
                        <td className="p-2.5 border border-slate-200">Corte de 6 a 24 horas</td>
                        <td className="p-2.5 border border-slate-200">Plan de regularización y multa BCRA</td>
                      </tr>
                      <tr className="bg-red-50 text-red-950 font-bold">
                        <td className="p-2.5 border border-slate-200 text-center text-red-700 font-black">5</td>
                        <td className="p-2.5 border border-slate-200 text-red-700">&gt; $300,000,000 ARS (&gt; $300k USD)</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Corte &gt; 24 horas con quiebre de compensación</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Suspensión de cuenta de compensación o licencia PSP</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {(activeJurisdiction === 'Colombia' || activeJurisdiction === 'Regional') && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black text-left">
                        <th className="p-2.5 border border-slate-200 text-center">Nivel</th>
                        <th className="p-2.5 border border-slate-200">Financiero (50%)</th>
                        <th className="p-2.5 border border-slate-200">Proceso (20%)</th>
                        <th className="p-2.5 border border-slate-200">Reputacional (15%)</th>
                        <th className="p-2.5 border border-slate-200">Legal / Contractual (15%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-2.5 border border-slate-200 text-center font-black">1</td>
                        <td className="p-2.5 border border-slate-200 font-bold">&lt; $660,000 USD (&le; 30% patr.)</td>
                        <td className="p-2.5 border border-slate-200">Interrupción &lt; 1 día</td>
                        <td className="p-2.5 border border-slate-200">Afectación interna</td>
                        <td className="p-2.5 border border-slate-200">Recomendación ente de control</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 border border-slate-200 text-center font-black">2</td>
                        <td className="p-2.5 border border-slate-200 font-bold">$660,001 - $880,000 USD (40%)</td>
                        <td className="p-2.5 border border-slate-200">Interrupción de 2 a 3 días</td>
                        <td className="p-2.5 border border-slate-200">Afectación a la entidad</td>
                        <td className="p-2.5 border border-slate-200">Glosa por órganos de vigilancia</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border border-slate-200 text-center font-black">3</td>
                        <td className="p-2.5 border border-slate-200 font-bold text-amber-700">$880,001 - $1,100,000 USD (50%)</td>
                        <td className="p-2.5 border border-slate-200">Interrupción de 4 a 5 días</td>
                        <td className="p-2.5 border border-slate-200">Afectación sectorial</td>
                        <td className="p-2.5 border border-slate-200">Glosa para efectos jurídicos</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 border border-slate-200 text-center font-black">4</td>
                        <td className="p-2.5 border border-slate-200 font-bold text-orange-700">$1,100,001 - $1,760,000 USD (80%)</td>
                        <td className="p-2.5 border border-slate-200">Interrupción de 5 a 7 días</td>
                        <td className="p-2.5 border border-slate-200">Afectación nacional</td>
                        <td className="p-2.5 border border-slate-200">Multa o sanción regulatoria</td>
                      </tr>
                      <tr className="bg-red-50 text-red-950 font-bold">
                        <td className="p-2.5 border border-slate-200 text-center text-red-700 font-black">5</td>
                        <td className="p-2.5 border border-slate-200 text-red-700">&gt; $1,760,001 USD (&gt; 80%)</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Interrupción &gt; 7 días</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Afectación internacional</td>
                        <td className="p-2.5 border border-slate-200 text-red-800">Intervención o cierre de producto</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* FOOTER DECLARACIÓN DE INMUTABILIDAD */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-amber-400" size={24} />
          <h3 className="text-xl font-black">Declaración de Inmutabilidad de Riesgos Aprobados & Estándar ROAM</h3>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Conforme a las directrices de Global66 y las regulaciones de la CMF (Chile), SFC (Colombia) y BCRA (Argentina), todo riesgo clasificado formalmente como <strong className="text-emerald-400 font-bold">'Aprobado'</strong> mantendrá inmutabilidad histórica sobre sus datos causa-raíz y controles, prohibiendo su reversión a estado pendiente.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-xs font-bold border border-rose-400/30">
            🇨🇱 CMF NCG 464 & RAN 20-10
          </span>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold border border-amber-400/30">
            🇨🇴 SFC SARO & ISO 31000
          </span>
          <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-lg text-xs font-bold border border-sky-400/30">
            🇦🇷 BCRA Com. A 7783 & Base LED
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold border border-blue-400/30">
            🌎 Consolidado Regional ISO 31000
          </span>
        </div>
      </div>
    </div>
  );
};
