import React, { useState } from 'react';
import {
  TechnicalVisit,
  VisitArea,
  PhotoRecord,
  PathologyCheck,
  ConditionGeneralState,
  PhotoCategory,
  QualityLevel,
  DesiredConditionItem,
  RiskAlertItem,
  RiskSeverity,
} from '../types/visit';
import {
  ALL_SERVICES,
  ALL_PATHOLOGIES,
  ALL_PHOTO_CATEGORIES,
  ALL_BUDGET_RANGES,
  ALL_RISK_CATEGORIES,
} from '../data/initialData';
import { AudioTestimonialModule } from './AudioTestimonialModule';
import { SketchCanvas } from './SketchCanvas';
import {
  Camera,
  Mic,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Smartphone,
  Ruler,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';

interface FieldModeWizardProps {
  visit: TechnicalVisit;
  onUpdateVisit: (updated: TechnicalVisit, logMessage?: string) => void;
  onExitFieldMode: () => void;
  onGenerateQuotation: () => void;
}

const FIELD_STEPS = [
  { id: 0, short: '1. Previsita', title: 'Cliente y Servicios' },
  { id: 1, short: '2. ¿Qué necesita?', title: 'Descubrimiento y Dolor' },
  { id: 2, short: '3. Voz Cliente', title: 'Audio y Testimonio' },
  { id: 3, short: '4. Diagnóstico', title: 'Áreas: Solicitud vs. Causa' },
  { id: 4, short: '5. Medidas', title: 'Levantamiento y Croquis' },
  { id: 5, short: '6. Fotos', title: 'Cámara y Evidencias' },
  { id: 6, short: '7. Solución', title: '¿Cómo quiere que quede?' },
  { id: 7, short: '8. Riesgos', title: 'Alertas y Logística' },
  { id: 8, short: '9. Inversión', title: 'Presupuesto y Plazo' },
  { id: 9, short: '10. Cierre', title: 'Checklist y Cierre' },
];

export const FieldModeWizard: React.FC<FieldModeWizardProps> = ({
  visit,
  onUpdateVisit,
  onExitFieldMode,
  onGenerateQuotation,
}) => {
  const [step, setStep] = useState(0);
  const [selectedAreaIdx, setSelectedAreaIdx] = useState(0);
  const [newAreaName, setNewAreaName] = useState('');
  const [quickPhotoCategory, setQuickPhotoCategory] = useState<PhotoCategory>('Estado actual');
  const [quickPhotoDesc, setQuickPhotoDesc] = useState('');
  const [offlineSimulated, setOfflineSimulated] = useState(false);

  const currentArea: VisitArea | undefined = visit.areas[selectedAreaIdx] || visit.areas[0];

  const handleToggleService = (srv: (typeof ALL_SERVICES)[number]) => {
    const exists = visit.serviciosSolicitados.includes(srv);
    const next = exists
      ? visit.serviciosSolicitados.filter((s) => s !== srv)
      : [...visit.serviciosSolicitados, srv];
    onUpdateVisit({ ...visit, serviciosSolicitados: next });
  };

  const handleAddArea = () => {
    const name = newAreaName.trim() || `Área ${visit.areas.length + 1}`;
    const newArea: VisitArea = {
      id: `area-${Date.now()}`,
      nombre: name,
      descripcion: '',
      solicitudClienteArea: '',
      diagnosticoTecnicoArea: '',
      recomendacionTecnicaArea: '',
      estadoGeneral: 'Regular',
      patologias: [],
      problemasEncontrados: '',
      danos: '',
      humedades: '',
      fisuras: '',
      desprendimientos: '',
      desniveles: '',
      estadoInstalaciones: '',
      observacionesEstadoActual: '',
      medidas: {
        largo: 3.0,
        ancho: 2.5,
        altura: 2.4,
        areaPiso: 7.5,
        areaPisoManualOverride: false,
        areaMuros: 26.4,
        areaMurosManualOverride: false,
        areaTecho: 7.5,
        areaTechoManualOverride: false,
        perimetro: 11.0,
        cantidad: 1,
        unidadPrincipal: 'm²',
        notasMedidas: '',
        sketchItems: [],
      },
      instalaciones: {
        electrica: {
          tomasExistentes: 2,
          tomasNuevas: 2,
          interruptores: 1,
          luminarias: 2,
          puntosEspeciales: 0,
          requiereIntervenirTablero: false,
          observaciones: '',
        },
        hidraulica: {
          aguaFria: false,
          aguaCaliente: false,
          puntosExistentes: 0,
          puntosNuevos: 0,
          observaciones: '',
        },
        sanitaria: {
          desagues: 0,
          sanitarios: 0,
          lavamanos: 0,
          duchas: 0,
          sifones: 0,
          observaciones: '',
        },
        otras: {
          gas: false,
          internet: false,
          tv: false,
          ventilacion: false,
          aireAcondicionado: false,
          observaciones: '',
        },
      },
    };
    const nextAreas = [...visit.areas, newArea];
    onUpdateVisit({ ...visit, areas: nextAreas }, `Nueva área agregada en campo: ${name}`);
    setSelectedAreaIdx(nextAreas.length - 1);
    setNewAreaName('');
  };

  const updateCurrentArea = (patch: Partial<VisitArea>) => {
    if (!currentArea) return;
    const nextAreas = visit.areas.map((a) =>
      a.id === currentArea.id ? { ...a, ...patch } : a
    );
    onUpdateVisit({ ...visit, areas: nextAreas });
  };

  const updateAreaDimensions = (field: 'largo' | 'ancho' | 'altura', value: number) => {
    if (!currentArea) return;
    const m = { ...currentArea.medidas, [field]: value };
    const calcPiso = Number((m.largo * m.ancho).toFixed(2));
    const calcPerimetro = Number((2 * (m.largo + m.ancho)).toFixed(2));
    const calcMuros = Number((calcPerimetro * m.altura).toFixed(2));

    m.perimetro = calcPerimetro;
    // Regla Sección 11: No sustituir una medida introducida manualmente sin autorización
    if (!m.areaPisoManualOverride) {
      m.areaPiso = calcPiso;
    }
    if (!m.areaTechoManualOverride) {
      m.areaTecho = calcPiso;
    }
    if (!m.areaMurosManualOverride) {
      m.areaMuros = calcMuros;
    }
    updateCurrentArea({ medidas: m });
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newPhotos: PhotoRecord[] = Array.from(files).map((file, idx) => ({
      id: `foto-campo-${Date.now()}-${idx}`,
      areaId: currentArea?.id || 'general',
      areaNombre: currentArea?.nombre || 'General',
      categoria: quickPhotoCategory,
      descripcion:
        quickPhotoDesc.trim() ||
        `Evidencia de ${quickPhotoCategory.toLowerCase()} en ${currentArea?.nombre || 'inmueble'}`,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
      url: URL.createObjectURL(file),
    }));
    onUpdateVisit(
      { ...visit, fotos: [...newPhotos, ...visit.fotos] },
      `Registradas ${newPhotos.length} fotografía(s) en Modo Campo`
    );
    setQuickPhotoDesc('');
  };

  const addQuickDesiredCondition = () => {
    const newItem: DesiredConditionItem = {
      id: `cd-${Date.now()}`,
      areaId: currentArea?.id || 'general',
      areaNombre: currentArea?.nombre || 'General',
      elemento: 'Piso / Enchape',
      condicionActual: currentArea?.problemasEncontrados || 'Acabado existente deteriorado',
      necesidadCliente: visit.descubrimiento.q5_queEsperaLograr || 'Renovación total',
      condicionDeseada: 'Porcelanato 60x120 cm rectificado',
      trabajoRequerido: 'Demolición + Nivelación + Instalación',
      material: 'Porcelanato',
      marca: 'Corona / Alfa',
      referencia: 'Gris Mate',
      color: 'Gris',
      formato: '60x120 cm',
      acabado: 'Mate',
      calidad: 'Superior',
      cantidad: currentArea?.medidas.areaPiso || 10,
      unidad: 'm²',
      observaciones: '',
    };
    onUpdateVisit({
      ...visit,
      condicionesDeseadas: [...visit.condicionesDeseadas, newItem],
    });
  };

  const addQuickRisk = (tipo: (typeof ALL_RISK_CATEGORIES)[number], nivel: RiskSeverity) => {
    const newRisk: RiskAlertItem = {
      id: `risk-${Date.now()}`,
      tipo,
      descripcion: `Detectado en campo (${currentArea?.nombre || 'Inmueble'}): ${tipo}`,
      nivel,
      mitigacionCotizacion: 'Incluir nota aclaratoria y partida preventiva en cotización.',
    };
    onUpdateVisit({ ...visit, riesgos: [...visit.riesgos, newRisk] });
  };

  const checklistValues = Object.values(visit.checklistFinal);
  const completedChecks = checklistValues.filter(Boolean).length;
  const totalChecks = checklistValues.length;

  return (
    <div className="max-w-2xl mx-auto pb-28">
      {/* Top Field Banner */}
      <div className="bg-[#2F3075] text-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            <div>
              <span className="text-xs font-mono opacity-80 block">
                MODO CAMPO GUIADO · {visit.codigo}
              </span>
              <h2 className="text-base font-bold leading-tight">{visit.cliente}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOfflineSimulated(!offlineSimulated)}
              className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                offlineSimulated
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              {offlineSimulated ? 'Offline (Guardado Local)' : 'Auto-Guardado Activo'}
            </button>
            <button
              type="button"
              onClick={onExitFieldMode}
              className="min-h-[38px] px-3 py-1 bg-white text-[#2F3075] rounded-lg text-xs font-semibold hover:bg-slate-100"
            >
              Vista Completa
            </button>
          </div>
        </div>

        {/* Horizontal Step Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {FIELD_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                step === s.id
                  ? 'bg-white text-[#2F3075] shadow-sm'
                  : 'bg-white/10 text-white/85 hover:bg-white/20'
              }`}
            >
              {s.short}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[#2F3075] font-semibold">
              PASO {step + 1} DE {FIELD_STEPS.length}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {FIELD_STEPS[step].title}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {visit.tipoInmueble} · {visit.localidadMunicipio}
          </span>
        </div>

        {/* STEP 0: PREVISITA & SERVICIOS */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={visit.cliente}
                  onChange={(e) => onUpdateVisit({ ...visit, cliente: e.target.value })}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={visit.telefono}
                  onChange={(e) => onUpdateVisit({ ...visit, telefono: e.target.value })}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección del Inmueble
                </label>
                <input
                  type="text"
                  value={visit.direccion}
                  onChange={(e) => onUpdateVisit({ ...visit, direccion: e.target.value })}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persona que atiende en sitio
                </label>
                <input
                  type="text"
                  value={visit.personaQueAtendera}
                  onChange={(e) =>
                    onUpdateVisit({ ...visit, personaQueAtendera: e.target.value })
                  }
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Servicios Solicitados (Toque para activar varios)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_SERVICES.map((srv) => {
                  const active = visit.serviciosSolicitados.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => handleToggleService(srv)}
                      className={`min-h-[46px] px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        active
                          ? 'bg-[#2F3075] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className="truncate">{srv}</span>
                      {active && <CheckCircle2 className="w-4 h-4 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: DESCUBRIMIENTO DEL CLIENTE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-[#2F3075] font-medium">
              “NO VENDEMOS UNA REMODELACIÓN HASTA ENTENDER QUÉ NECESITA REALMENTE EL CLIENTE.”
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-2">
              <label className="block text-xs font-bold text-amber-950">
                ★ PUNTO DE DOLOR DEL CLIENTE (¿Qué es lo que más le duele o preocupa?)
              </label>
              <textarea
                rows={3}
                value={visit.descubrimiento.puntoDeDolorCliente}
                onChange={(e) =>
                  onUpdateVisit({
                    ...visit,
                    descubrimiento: {
                      ...visit.descubrimiento,
                      puntoDeDolorCliente: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Temor a nuevas filtraciones hacia el piso inferior o incumplimiento de plazos..."
                className="w-full p-3 text-sm bg-white border border-amber-300 rounded-xl"
              />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 space-y-2">
              <label className="block text-xs font-bold text-emerald-950">
                ★ SUEÑO / RESULTADO ESPERADO (¿Cómo sueña ver su espacio terminado?)
              </label>
              <textarea
                rows={3}
                value={visit.descubrimiento.suenoResultadoEsperado}
                onChange={(e) =>
                  onUpdateVisit({
                    ...visit,
                    descubrimiento: {
                      ...visit.descubrimiento,
                      suenoResultadoEsperado: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Un baño contemporáneo tipo hotel, seco, iluminado y con garantía..."
                className="w-full p-3 text-sm bg-white border border-emerald-300 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  1. ¿Qué desea remodelar exactamente?
                </label>
                <textarea
                  rows={2}
                  value={visit.descubrimiento.q1_queDeseaRemodelar}
                  onChange={(e) =>
                    onUpdateVisit({
                      ...visit,
                      descubrimiento: {
                        ...visit.descubrimiento,
                        q1_queDeseaRemodelar: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  2. ¿Qué problema tiene actualmente?
                </label>
                <textarea
                  rows={2}
                  value={visit.descubrimiento.q2_problemaActual}
                  onChange={(e) =>
                    onUpdateVisit({
                      ...visit,
                      descubrimiento: {
                        ...visit.descubrimiento,
                        q2_problemaActual: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  7. ¿Qué es indispensable para usted en esta obra?
                </label>
                <textarea
                  rows={2}
                  value={visit.descubrimiento.q7_queEsIndispensable}
                  onChange={(e) =>
                    onUpdateVisit({
                      ...visit,
                      descubrimiento: {
                        ...visit.descubrimiento,
                        q7_queEsIndispensable: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VOZ DEL CLIENTE */}
        {step === 2 && (
          <AudioTestimonialModule
            records={visit.testimoniosAudio}
            onChange={(next) =>
              onUpdateVisit({ ...visit, testimoniosAudio: next }, 'Testimonio actualizado')
            }
          />
        )}

        {/* STEP 3: DIAGNÓSTICO POR ÁREA (REGLA SOLICITUD VS CAUSA TÉCNICA) */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Area Selector & Creator */}
            <div className="flex flex-wrap items-center gap-2">
              {visit.areas.map((a, idx) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAreaIdx(idx)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold ${
                    selectedAreaIdx === idx
                      ? 'bg-[#2F3075] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {a.nombre}
                </button>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="Nueva área (ej: Terraza)"
                  className="min-h-[44px] px-3 py-2 text-xs border border-slate-300 rounded-xl w-40"
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  className="min-h-[44px] px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Área
                </button>
              </div>
            </div>

            {currentArea ? (
              <div className="space-y-4">
                {/* Regla de Negocio Sección 42: Lo que pide vs lo que necesita */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-[#2F3075]">
                    REGLA TÉCNICA ISAZA: DIFERENCIAR SÍNTOMA DE CAUSA RAÍZ
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      1. LO QUE EL CLIENTE PIDE (Solicitud inicial)
                    </label>
                    <input
                      type="text"
                      value={currentArea.solicitudClienteArea}
                      onChange={(e) =>
                        updateCurrentArea({ solicitudClienteArea: e.target.value })
                      }
                      placeholder="Ej: Pintar el techo del baño..."
                      className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      2. DIAGNÓSTICO TÉCNICO DETECTADO (Causa real)
                    </label>
                    <textarea
                      rows={2}
                      value={currentArea.diagnosticoTecnicoArea}
                      onChange={(e) =>
                        updateCurrentArea({ diagnosticoTecnicoArea: e.target.value })
                      }
                      placeholder="Ej: Existe humedad activa del 28% y desprendimiento de pañete por filtración..."
                      className="w-full p-3 text-sm bg-white border border-amber-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">
                      3. RECOMENDACIÓN TÉCNICA ISAZA (Lo que se debe cotizar)
                    </label>
                    <textarea
                      rows={2}
                      value={currentArea.recomendacionTecnicaArea}
                      onChange={(e) =>
                        updateCurrentArea({ recomendacionTecnicaArea: e.target.value })
                      }
                      placeholder="Ej: Corregir origen de humedad, retirar material deteriorado, impermeabilizar y luego pintar..."
                      className="w-full p-3 text-sm bg-white border border-emerald-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Estado General Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Estado General de {currentArea.nombre}
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(
                      ['Excelente', 'Bueno', 'Regular', 'Malo', 'Crítico'] as ConditionGeneralState[]
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateCurrentArea({ estadoGeneral: st })}
                        className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-semibold text-center ${
                          currentArea.estadoGeneral === st
                            ? 'bg-[#2F3075] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patologías Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Patologías Detectadas (Toque para marcar)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PATHOLOGIES.map((pat: PathologyCheck) => {
                      const checked = currentArea.patologias.includes(pat);
                      return (
                        <button
                          key={pat}
                          type="button"
                          onClick={() => {
                            const next = checked
                              ? currentArea.patologias.filter((p) => p !== pat)
                              : [...currentArea.patologias, pat];
                            updateCurrentArea({ patologias: next });
                          }}
                          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between ${
                            checked
                              ? 'bg-red-600 text-white font-semibold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{pat}</span>
                          {checked && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Agregue una primera área para diagnosticar.</p>
            )}
          </div>
        )}

        {/* STEP 4: MEDIDAS Y CROQUIS */}
        {step === 4 && currentArea && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {visit.areas.map((a, idx) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAreaIdx(idx)}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                    selectedAreaIdx === idx
                      ? 'bg-[#2F3075] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5 inline mr-1" />
                  {a.nombre}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Largo (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={currentArea.medidas.largo}
                  onChange={(e) =>
                    updateAreaDimensions('largo', parseFloat(e.target.value) || 0)
                  }
                  className="w-full min-h-[48px] px-3 py-2 text-base font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ancho (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={currentArea.medidas.ancho}
                  onChange={(e) =>
                    updateAreaDimensions('ancho', parseFloat(e.target.value) || 0)
                  }
                  className="w-full min-h-[48px] px-3 py-2 text-base font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Altura (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={currentArea.medidas.altura}
                  onChange={(e) =>
                    updateAreaDimensions('altura', parseFloat(e.target.value) || 0)
                  }
                  className="w-full min-h-[48px] px-3 py-2 text-base font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Auto-calculated boxes with manual override lock */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600">Área Piso (m²)</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentArea({
                        medidas: {
                          ...currentArea.medidas,
                          areaPisoManualOverride: !currentArea.medidas.areaPisoManualOverride,
                        },
                      })
                    }
                    className="text-slate-500 hover:text-[#2F3075]"
                    title="Bloquear/Desbloquear medida manual"
                  >
                    {currentArea.medidas.areaPisoManualOverride ? (
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={currentArea.medidas.areaPiso}
                  onChange={(e) =>
                    updateCurrentArea({
                      medidas: {
                        ...currentArea.medidas,
                        areaPiso: parseFloat(e.target.value) || 0,
                        areaPisoManualOverride: true,
                      },
                    })
                  }
                  className="w-full min-h-[42px] px-2.5 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600">Área Muros (m²)</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentArea({
                        medidas: {
                          ...currentArea.medidas,
                          areaMurosManualOverride: !currentArea.medidas.areaMurosManualOverride,
                        },
                      })
                    }
                    className="text-slate-500 hover:text-[#2F3075]"
                  >
                    {currentArea.medidas.areaMurosManualOverride ? (
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={currentArea.medidas.areaMuros}
                  onChange={(e) =>
                    updateCurrentArea({
                      medidas: {
                        ...currentArea.medidas,
                        areaMuros: parseFloat(e.target.value) || 0,
                        areaMurosManualOverride: true,
                      },
                    })
                  }
                  className="w-full min-h-[42px] px-2.5 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Perímetro (ml)
                </span>
                <div className="min-h-[42px] px-2.5 py-2 text-sm font-mono font-bold bg-slate-100 rounded-lg text-slate-900">
                  {currentArea.medidas.perimetro} ml
                </div>
              </div>
            </div>

            <SketchCanvas
              areaName={currentArea.nombre}
              largo={currentArea.medidas.largo}
              ancho={currentArea.medidas.ancho}
              items={currentArea.medidas.sketchItems}
              onChange={(sketchItems) =>
                updateCurrentArea({
                  medidas: { ...currentArea.medidas, sketchItems },
                })
              }
            />
          </div>
        )}

        {/* STEP 5: CÁMARA Y EVIDENCIAS FOTOGRÁFICAS */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría de la Foto
                </label>
                <select
                  value={quickPhotoCategory}
                  onChange={(e) => setQuickPhotoCategory(e.target.value as PhotoCategory)}
                  className="w-full min-h-[46px] px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {ALL_PHOTO_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota rápida de la foto
                </label>
                <input
                  type="text"
                  value={quickPhotoDesc}
                  onChange={(e) => setQuickPhotoDesc(e.target.value)}
                  placeholder="Ej: Humedad esquina ducha..."
                  className="w-full min-h-[46px] px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <label className="w-full min-h-[56px] bg-[#2F3075] hover:bg-[#23245c] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-sm transition-colors">
              <Camera className="w-5 h-5" />
              <span>TOMAR FOTOGRAFÍA / SUBIR EVIDENCIA ({currentArea?.nombre || 'General'})</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              {visit.fotos.map((f) => (
                <div
                  key={f.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50"
                >
                  <div className="aspect-4/3 bg-slate-200 relative overflow-hidden">
                    <img
                      src={f.url}
                      alt={f.descripcion}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="text-[11px] font-mono text-[#2F3075] font-semibold">
                      {f.areaNombre} · {f.categoria}
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2 mt-0.5">
                      {f.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: ¿CÓMO QUIERE QUE QUEDE? */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                Defina el acabado deseado y calidad para armar la Matriz HOY → PROPUESTA.
              </p>
              <button
                type="button"
                onClick={addQuickDesiredCondition}
                className="min-h-[42px] px-3.5 py-2 bg-[#2F3075] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Agregar Elemento
              </button>
            </div>

            {visit.condicionesDeseadas.map((cd, idx) => (
              <div
                key={cd.id}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cd.elemento}
                    onChange={(e) => {
                      const next = [...visit.condicionesDeseadas];
                      next[idx] = { ...cd, elemento: e.target.value };
                      onUpdateVisit({ ...visit, condicionesDeseadas: next });
                    }}
                    placeholder="Elemento (ej: Piso)"
                    className="min-h-[42px] px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <select
                    value={cd.calidad}
                    onChange={(e) => {
                      const next = [...visit.condicionesDeseadas];
                      next[idx] = { ...cd, calidad: e.target.value as QualityLevel };
                      onUpdateVisit({ ...visit, condicionesDeseadas: next });
                    }}
                    className="min-h-[42px] px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Estándar">Calidad: Estándar</option>
                    <option value="Superior">Calidad: Superior</option>
                    <option value="Premium">Calidad: Premium</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={cd.condicionDeseada}
                  onChange={(e) => {
                    const next = [...visit.condicionesDeseadas];
                    next[idx] = { ...cd, condicionDeseada: e.target.value };
                    onUpdateVisit({ ...visit, condicionesDeseadas: next });
                  }}
                  placeholder="¿Cómo quiere que quede? (Ej: Porcelanato 60x120 gris mate)"
                  className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={cd.trabajoRequerido}
                  onChange={(e) => {
                    const next = [...visit.condicionesDeseadas];
                    next[idx] = { ...cd, trabajoRequerido: e.target.value };
                    onUpdateVisit({ ...visit, condicionesDeseadas: next });
                  }}
                  placeholder="Solución técnica (Ej: Demolición + Impermeabilización + Instalación)"
                  className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        {/* STEP 7: RIESGOS Y LOGÍSTICA RÁPIDA */}
        {step === 7 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateVisit({
                    ...visit,
                    logistica: {
                      ...visit.logistica,
                      estaHabitado: !visit.logistica.estaHabitado,
                    },
                  })
                }
                className={`min-h-[48px] p-3 rounded-xl text-xs font-semibold text-left ${
                  visit.logistica.estaHabitado
                    ? 'bg-[#2F3075] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                ¿Está habitado?: {visit.logistica.estaHabitado ? 'SÍ' : 'NO'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateVisit({
                    ...visit,
                    logistica: {
                      ...visit.logistica,
                      requiereProteccionZonasComunes:
                        !visit.logistica.requiereProteccionZonasComunes,
                    },
                  })
                }
                className={`min-h-[48px] p-3 rounded-xl text-xs font-semibold text-left ${
                  visit.logistica.requiereProteccionZonasComunes
                    ? 'bg-[#2F3075] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Protección Zonas Comunes:{' '}
                {visit.logistica.requiereProteccionZonasComunes ? 'SÍ' : 'NO'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Registrar Alerta / Riesgo con 1 Toque:
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'Humedad no diagnosticada',
                    'Posibles trabajos ocultos',
                    'Restricción de horarios',
                    'Riesgo de daño a zonas existentes',
                    'Permiso pendiente',
                  ] as const
                ).map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => addQuickRisk(rt, 'Alto')}
                    className="min-h-[42px] px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    + {rt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {visit.riesgos.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <span className="font-bold text-red-700">{r.nivel.toUpperCase()}</span> ·{' '}
                  <span className="font-semibold text-slate-900">{r.tipo}:</span>{' '}
                  <span className="text-slate-700">{r.descripcion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: INVERSIÓN Y PLAZO */}
        {step === 8 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Capacidad de Inversión del Cliente
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_BUDGET_RANGES.map((rng) => (
                  <button
                    key={rng}
                    type="button"
                    onClick={() =>
                      onUpdateVisit({ ...visit, rangoPresupuestoCliente: rng })
                    }
                    className={`min-h-[46px] px-3.5 py-2 rounded-xl text-xs font-semibold text-left ${
                      visit.rangoPresupuestoCliente === rng
                        ? 'bg-[#2F3075] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rng}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha deseada de inicio
                </label>
                <input
                  type="date"
                  value={visit.fechaDeseadaInicio}
                  onChange={(e) =>
                    onUpdateVisit({ ...visit, fechaDeseadaInicio: e.target.value })
                  }
                  className="w-full min-h-[46px] px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiempo esperado de ejecución
                </label>
                <input
                  type="text"
                  value={visit.tiempoEsperadoCliente}
                  onChange={(e) =>
                    onUpdateVisit({ ...visit, tiempoEsperadoCliente: e.target.value })
                  }
                  placeholder="Ej: 3 semanas"
                  className="w-full min-h-[46px] px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Recomendación Profesional Isaza (Para Cotización)
              </label>
              <textarea
                rows={3}
                value={visit.recomendacionIsaza.queRecomiendaHacer}
                onChange={(e) =>
                  onUpdateVisit({
                    ...visit,
                    recomendacionIsaza: {
                      ...visit.recomendacionIsaza,
                      queRecomiendaHacer: e.target.value,
                    },
                  })
                }
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* STEP 9: CHECKLIST Y CIERRE */}
        {step === 9 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Progreso del Checklist de Cierre:
              </span>
              <span className="text-sm font-mono font-bold text-[#2F3075]">
                {completedChecks} / {totalChecks} verificados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  ['datosClienteCompletos', 'Datos del cliente completos'],
                  ['direccionCompleta', 'Dirección completa'],
                  ['areaVisitadaRegistrada', 'Área visitada registrada'],
                  ['medidasTomadas', 'Medidas tomadas'],
                  ['fotosGenerales', 'Fotos generales'],
                  ['fotosDetalles', 'Fotos de detalles'],
                  ['estadoActualRegistrado', 'Estado actual registrado'],
                  ['condicionDeseadaRegistrada', 'Condición deseada registrada'],
                  ['materialesDefinidosOPendientes', 'Materiales definidos o pendientes'],
                  ['presupuestoRegistrado', 'Presupuesto registrado'],
                  ['fechaEstimadaRegistrada', 'Fecha estimada registrada'],
                  ['riesgosRegistrados', 'Riesgos registrados'],
                  ['observacionesTecnicas', 'Observaciones técnicas'],
                  ['proximoPasoDefinido', 'Próximo paso definido'],
                ] as const
              ).map(([key, label]) => {
                const checked = visit.checklistFinal[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      onUpdateVisit({
                        ...visit,
                        checklistFinal: {
                          ...visit.checklistFinal,
                          [key]: !checked,
                        },
                      })
                    }
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between ${
                      checked
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{label}</span>
                    {checked && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={completedChecks < totalChecks}
                onClick={() => {
                  onUpdateVisit(
                    { ...visit, estado: 'Visita completada' },
                    'Visita cerrada como COMPLETA desde Modo Campo'
                  );
                  onExitFieldMode();
                }}
                className={`flex-1 min-h-[50px] px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  completedChecks === totalChecks
                    ? 'bg-[#2F3075] text-white hover:bg-[#23245c]'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {completedChecks === totalChecks
                  ? 'CERRAR VISITA COMO COMPLETA'
                  : `Faltan ${totalChecks - completedChecks} ítems para Cierre Completo`}
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateVisit(
                    { ...visit, estado: 'Pendiente de información' },
                    'Visita guardada como PENDIENTE DE INFORMACIÓN'
                  );
                  onExitFieldMode();
                }}
                className="min-h-[50px] px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold"
              >
                Cerrar: Pendiente de Información
              </button>

              <button
                type="button"
                onClick={() => {
                  onGenerateQuotation();
                  onExitFieldMode();
                }}
                className="min-h-[50px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Crear Cotización
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Field Navigation Bar (Respects <15% viewport height cap) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="min-h-[46px] px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2F3075] text-xs font-semibold flex items-center gap-1.5"
              title="Ir a cámara rápida"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Foto</span> ({visit.fotos.length})
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2F3075] text-xs font-semibold flex items-center gap-1.5"
              title="Grabar voz del cliente"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span> ({visit.testimoniosAudio.length})
            </button>
          </div>

          {step < FIELD_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(FIELD_STEPS.length - 1, s + 1))}
              className="min-h-[46px] px-5 py-2 rounded-xl bg-[#2F3075] text-white text-xs font-semibold flex items-center gap-1"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onExitFieldMode}
              className="min-h-[46px] px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Ver Resumen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
