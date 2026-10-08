export type UserRole = 'ADMINISTRADOR' | 'ASESOR_TECNICO' | 'ADMINISTRATIVO';

export type VisitStatus =
  | 'Solicitud recibida'
  | 'Programada'
  | 'En preparación'
  | 'En visita'
  | 'Borrador'
  | 'Pendiente de información'
  | 'Visita completada'
  | 'En elaboración de cotización'
  | 'Cotización enviada'
  | 'Seguimiento'
  | 'Ganada'
  | 'Perdida'
  | 'Cancelada';

export type PropertyType =
  | 'Apartamento'
  | 'Casa'
  | 'Oficina'
  | 'Local comercial'
  | 'Consultorio'
  | 'Bodega / Otro';

export type ServiceType =
  | 'Remodelación integral'
  | 'Baño'
  | 'Cocina'
  | 'Habitación'
  | 'Sala / comedor'
  | 'Pintura'
  | 'Pisos'
  | 'Enchapes'
  | 'Techo / cielo raso'
  | 'Drywall'
  | 'Plomería'
  | 'Impermeabilización'
  | 'Redes eléctricas'
  | 'Fachada'
  | 'Carpintería'
  | 'Oficina'
  | 'Local comercial'
  | 'Otro';

export type ConditionGeneralState =
  | 'Excelente'
  | 'Bueno'
  | 'Regular'
  | 'Malo'
  | 'Crítico';

export type PathologyCheck =
  | 'Humedad'
  | 'Filtración'
  | 'Fisura'
  | 'Desprendimiento'
  | 'Oxidación'
  | 'Desnivel'
  | 'Instalación deteriorada'
  | 'Instalación insuficiente'
  | 'Daño estructural aparente'
  | 'Otro';

export type MeasureUnit =
  | 'm'
  | 'm²'
  | 'm³'
  | 'ml'
  | 'unidad'
  | 'punto'
  | 'jornada'
  | 'global';

export type PhotoCategory =
  | 'Estado actual'
  | 'Daño'
  | 'Humedad'
  | 'Instalación'
  | 'Medida'
  | 'Detalle constructivo'
  | 'Referencia del cliente'
  | 'Antes'
  | 'Otra';

export type QualityLevel = 'Estándar' | 'Superior' | 'Premium';

export type ActivityCategory =
  | 'Demolición'
  | 'Retiro'
  | 'Reparación'
  | 'Suministro'
  | 'Instalación'
  | 'Pintura'
  | 'Acabado'
  | 'Prueba'
  | 'Limpieza'
  | 'Entrega';

export type RiskCategory =
  | 'Humedad no diagnosticada'
  | 'Posible filtración'
  | 'Instalación deteriorada'
  | 'Acceso complejo'
  | 'Restricción de horarios'
  | 'Trabajo nocturno'
  | 'Riesgo de daño a zonas existentes'
  | 'Posibles trabajos ocultos'
  | 'Material no definido'
  | 'Medidas pendientes'
  | 'Permiso pendiente'
  | 'Otro';

export type RiskSeverity = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export type BudgetRange =
  | 'Menos de $5.000.000'
  | '$5.000.000 – $10.000.000'
  | '$10.000.000 – $20.000.000'
  | '$20.000.000 – $30.000.000'
  | '$30.000.000 – $50.000.000'
  | 'Más de $50.000.000'
  | 'Por definir';

export type BudgetIncludes = 'Sí' | 'No' | 'No definido';

export type UrgencyLevel =
  | 'Inmediata'
  | 'Alta'
  | 'Media'
  | 'Baja'
  | 'Exploratoria';

export type CommercialPriority =
  | 'ALTA PRIORIDAD'
  | 'MEDIA PRIORIDAD'
  | 'SEGUIMIENTO'
  | 'BAJA PRIORIDAD';

export type DecisionFactor =
  | 'Precio'
  | 'Calidad'
  | 'Cumplimiento'
  | 'Tiempo'
  | 'Garantía'
  | 'Materiales'
  | 'Experiencia'
  | 'Formalidad'
  | 'Diseño';

export interface DiscoveryData {
  q1_queDeseaRemodelar: string;
  q2_problemaActual: string;
  q3_queMasIncomoda: string;
  q4_porQueDecidio: string;
  q5_queEsperaLograr: string;
  q6_comoGustariaQueQuedara: string;
  q7_queEsIndispensable: string;
  q8_elementosConservar: string;
  q9_elementosEliminar: string;
  q10_materialesColoresEstilos: string;
  q11_tieneReferencias: string;
  q12_queEsperaDeEmpresa: string;
  puntoDeDolorCliente: string;
  suenoResultadoEsperado: string;
}

export interface AudioTestimonialRecord {
  id: string;
  recordedAt: string;
  durationSeconds: number;
  audioDataUrl?: string;
  fileName?: string;
  fraseTextualCliente: string; // INTACTO - NUNCA MODIFICADO AUTOMÁTICAMENTE
  transcripcion: string;
  resumenTestimonio: string;
  aiSuggestedNeeds?: string[];
  aiApprovedByUser?: boolean;
}

export interface SketchItem {
  id: string;
  type: 'wall' | 'door' | 'window' | 'electric' | 'hydraulic' | 'sanitary' | 'dimension';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  label?: string;
}

export interface AreaMeasurements {
  largo: number;
  ancho: number;
  altura: number;
  areaPiso: number;
  areaPisoManualOverride: boolean;
  areaMuros: number;
  areaMurosManualOverride: boolean;
  areaTecho: number;
  areaTechoManualOverride: boolean;
  perimetro: number;
  cantidad: number;
  unidadPrincipal: MeasureUnit;
  notasMedidas: string;
  sketchItems: SketchItem[];
}

export interface AreaInstallations {
  electrica: {
    tomasExistentes: number;
    tomasNuevas: number;
    interruptores: number;
    luminarias: number;
    puntosEspeciales: number;
    requiereIntervenirTablero: boolean;
    observaciones: string;
  };
  hidraulica: {
    aguaFria: boolean;
    aguaCaliente: boolean;
    puntosExistentes: number;
    puntosNuevos: number;
    observaciones: string;
  };
  sanitaria: {
    desagues: number;
    sanitarios: number;
    lavamanos: number;
    duchas: number;
    sifones: number;
    observaciones: string;
  };
  otras: {
    gas: boolean;
    internet: boolean;
    tv: boolean;
    ventilacion: boolean;
    aireAcondicionado: boolean;
    observaciones: string;
  };
}

export interface DesiredConditionItem {
  id: string;
  areaId: string;
  areaNombre: string;
  elemento: string; // e.g. Piso, Muros, Techo, Mesón, Grifería
  condicionActual: string;
  necesidadCliente: string;
  condicionDeseada: string;
  trabajoRequerido: string; // Solución propuesta
  material: string;
  marca: string;
  referencia: string;
  color: string;
  formato: string;
  acabado: string;
  calidad: QualityLevel;
  cantidad: number;
  unidad: MeasureUnit;
  observaciones: string;
}

export interface VisitArea {
  id: string;
  nombre: string;
  descripcion: string;
  // Regla de Negocio Crítica (Sección 42): Solicitud vs Diagnóstico vs Recomendación
  solicitudClienteArea: string;
  diagnosticoTecnicoArea: string;
  recomendacionTecnicaArea: string;
  // Estado actual (Sección 9)
  estadoGeneral: ConditionGeneralState;
  patologias: PathologyCheck[];
  problemasEncontrados: string;
  danos: string;
  humedades: string;
  fisuras: string;
  desprendimientos: string;
  desniveles: string;
  estadoInstalaciones: string;
  observacionesEstadoActual: string;
  // Medidas (Sección 11 & 12)
  medidas: AreaMeasurements;
  // Instalaciones (Sección 19)
  instalaciones: AreaInstallations;
}

export interface PhotoRecord {
  id: string;
  areaId: string;
  areaNombre: string;
  categoria: PhotoCategory;
  descripcion: string;
  fecha: string;
  url: string;
}

export interface VideoRecord {
  id: string;
  areaId: string;
  areaNombre: string;
  tipo: string;
  descripcion: string;
  duracion: string;
  fecha: string;
  url?: string;
}

export interface ActivityItem {
  id: string;
  areaId: string;
  areaNombre: string;
  tipoActividad: ActivityCategory;
  descripcion: string;
  cantidad: number;
  unidad: MeasureUnit;
  costoUnitarioManoObraEstimado: number;
  costoUnitarioMaterialEstimado: number;
  observacion: string;
}

export interface MaterialCatalogItem {
  id: string;
  categoria: string;
  material: string;
  marca: string;
  referencia: string;
  unidad: MeasureUnit;
  calidad: QualityLevel;
  proveedor: string;
  precioReferencia: number;
  observacion: string;
}

export interface VisitMaterialAssignment {
  id: string;
  areaId: string;
  areaNombre: string;
  catalogItemId?: string;
  esTemporal: boolean;
  categoria: string;
  material: string;
  marca: string;
  referencia: string;
  referenciaCliente: string;
  unidad: MeasureUnit;
  cantidadEstimada: number;
  calidad: QualityLevel;
  proveedor: string;
  fotoReferenciaUrl?: string;
  observacion: string;
}

export interface SiteLogistics {
  pisoInmueble: string;
  tieneAscensor: boolean;
  usoAscensorCargaPermitido: boolean;
  escalerasAmplias: boolean;
  parqueaderoVisitantesCarga: string;
  accesoMateriales: string;
  horarioPermitido: string;
  restriccionesRuido: string;
  contactoAdministracion: string;
  permisosRequeridos: string;
  lugarAlmacenarMateriales: string;
  manejoEscombros: string;
  distanciaTransporteMetros: number;
  estaHabitado: boolean;
  sePuedeTrabajarNormalmente: boolean;
  requiereProteccionZonasComunes: boolean;
  requierePermisoAdministracion: boolean;
}

export interface RiskAlertItem {
  id: string;
  tipo: RiskCategory;
  descripcion: string;
  nivel: RiskSeverity;
  mitigacionCotizacion: string;
  fotoId?: string;
  fotoUrl?: string;
}

export interface CommercialEvaluation {
  necesidadReal: number; // 1-5
  urgencia: number; // 1-5
  presupuesto: number; // 1-5
  claridadProyecto: number; // 1-5
  poderDecision: number; // 1-5
  viabilidadTecnica: number; // 1-5
  potencialEconomico: number; // 1-5
  probabilidadContratacion: number; // 1-5
  puntajeTotal: number; // out of 40
  clasificacion: CommercialPriority;
}

export interface HiringDecisionData {
  quienTomaDecision: string;
  quienPagaObra: string;
  participanOtrasPersonas: string;
  cotizandoConOtrasEmpresas: string;
  factoresImportantes: DecisionFactor[];
}

export interface FinalChecklistData {
  datosClienteCompletos: boolean;
  direccionCompleta: boolean;
  areaVisitadaRegistrada: boolean;
  medidasTomadas: boolean;
  fotosGenerales: boolean;
  fotosDetalles: boolean;
  estadoActualRegistrado: boolean;
  condicionDeseadaRegistrada: boolean;
  materialesDefinidosOPendientes: boolean;
  presupuestoRegistrado: boolean;
  fechaEstimadaRegistrada: boolean;
  riesgosRegistrados: boolean;
  observacionesTecnicas: boolean;
  proximoPasoDefinido: boolean;
}

export interface IsazaTechnicalRecommendation {
  queRecomiendaHacer: string;
  queNoRecomiendaHacer: string;
  trabajosAdicionalesNecesarios: string;
  queVerificarAntesDeIniciar: string;
  materialesConsideradosAdecuados: string;
  riesgosIncluirEnCotizacion: string;
  proximoPasoComercial: string;
  responsableCierreFirma: string;
}

export interface QuotationLineItem {
  id: string;
  areaNombre: string;
  descripcion: string;
  cantidad: number;
  unidad: MeasureUnit;
  materialesDescripcion: string;
  calidad: QualityLevel;
  costoMaterialesUnitario: number;
  costoManoObraUnitario: number;
  precioUnitario: number;
  subtotal: number;
  observacion: string;
}

export interface GeneratedQuotation {
  codigoCotizacion: string;
  fechaGeneracion: string;
  partidas: QuotationLineItem[];
  subtotalDirecto: number;
  aiuPorcentaje: number;
  totalEstimado: number;
  estadoCotizacion: 'Borrador' | 'Enviada' | 'Aprobada';
}

export interface GeneratedWorkOrder {
  codigoObra: string;
  fechaConversion: string;
  presupuestoAprobado: number;
  fechaInicioProgramada: string;
  duracionSemanas: string;
  directorObraAsignado: string;
  estadoObra: 'En alistamiento' | 'En ejecución' | 'Finalizada';
}

export interface VisitHistoryLog {
  id: string;
  fechaHora: string;
  usuario: string;
  rol: UserRole;
  tipoEvento:
    | 'Creación'
    | 'Modificación'
    | 'Asignación'
    | 'Cambio de estado'
    | 'Cierre'
    | 'Conversión a cotización'
    | 'Conversión a obra';
  detalle: string;
}

export interface TechnicalVisit {
  id: string;
  codigo: string; // e.g., VT-2026-00125
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  asesorTecnico: string;
  responsableComercial: string;
  cliente: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  direccion: string;
  localidadMunicipio: string; // Bogotá / Chía / Cajicá / etc.
  tipoInmueble: PropertyType;
  estado: VisitStatus;
  origenCliente: string;
  fechaCreacion: string;
  ultimaActualizacion: string;

  // 6. Previsita
  serviciosSolicitados: ServiceType[];
  descripcionInicialCliente: string;
  personaQueAtendera: string;
  observacionesPrevisita: string;

  // 7. Etapa 1 - Descubrimiento
  descubrimiento: DiscoveryData;

  // 8. Testimonio / Voz del cliente
  testimoniosAudio: AudioTestimonialRecord[];

  // 9, 10, 11, 12, 19. Áreas del proyecto + Estado actual + Medidas + Croquis + Instalaciones
  areas: VisitArea[];

  // 13 & 14. Fotos y Videos
  fotos: PhotoRecord[];
  videos: VideoRecord[];

  // 15 & 16. Condición deseada y Matriz HOY -> PROPUESTA
  condicionesDeseadas: DesiredConditionItem[];

  // 17 & 18. Actividades y Materiales
  actividades: ActivityItem[];
  materialesAsignados: VisitMaterialAssignment[];

  // 20. Logística de obra
  logistica: SiteLogistics;

  // 21. Riesgos y Alertas
  riesgos: RiskAlertItem[];

  // 22. Presupuesto del cliente
  rangoPresupuestoCliente: BudgetRange;
  incluyeMaterialesYManoObra: BudgetIncludes;
  presupuestoIdealClienteCOP: number;
  presupuestoEstimadoTecnicoCOP: number;

  // 23. Plazos
  fechaDeseadaInicio: string;
  fechaLimite: string;
  tiempoEsperadoCliente: string;
  nivelUrgencia: UrgencyLevel;

  // 24. Calificación Comercial
  calificacionComercial: CommercialEvaluation;

  // 25. Decisión de contratación
  decisionContratacion: HiringDecisionData;

  // 26. Checklist Final
  checklistFinal: FinalChecklistData;

  // 28. Recomendación Técnica Isaza
  recomendacionIsaza: IsazaTechnicalRecommendation;

  // 29 & 30. Cotización y Obra vinculadas
  cotizacionGenerada?: GeneratedQuotation;
  obraGenerada?: GeneratedWorkOrder;

  // 34. Historial
  historial: VisitHistoryLog[];
}
