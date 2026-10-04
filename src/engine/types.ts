/**
 * Tipos del motor de juego.
 *
 * Regla de oro: aquí sólo hay FORMAS de datos. El contenido (retos, eventos,
 * indicadores, capítulos…) vive en `src/content/` y la lógica en `src/engine/`.
 */

// ─── Identificadores ──────────────────────────────────────────────────────
// Son strings para que agregar un indicador o categoría sea sólo agregar datos.
export type IndicatorId = string
export type CategoryId = string
export type ChapterId = string
export type ChallengeId = string
export type EventId = string
export type ResourceId = string
export type FlagId = string
export type TeamId = string

// ─── Definiciones de contenido ────────────────────────────────────────────
export interface IndicatorDef {
  id: IndicatorId
  label: string
  icon: string
  description: string
  /** Color CSS (hex/oklch) para barras y gráficas. */
  color: string
  min: number
  max: number
  initial: number
  /** Por debajo de este valor se muestra en estado de alerta. */
  danger: number
  /** Peso en el índice global (opcional, 1 por defecto). */
  weight?: number
}

export interface CategoryDef {
  id: CategoryId
  label: string
  icon: string
  description?: string
}

export interface ChapterDef {
  id: ChapterId
  label: string
  /** Etiqueta libre: una hora ("10:00"), una fase ("Fase 2")… */
  marker: string
  description?: string
}

export interface ResourceDef {
  id: ResourceId
  label: string
  icon: string
  initial: number
  description?: string
}

/** Catálogo de banderas: da nombre legible a las marcas ocultas. */
export interface FlagDef {
  id: FlagId
  label: string
  /** Si aparece en el expediente que se muestra en el cierre (Consejo). */
  showInDossier?: boolean
}

export interface TeamPreset {
  color: string
  icon: string
  name: string
}

// ─── Condiciones ──────────────────────────────────────────────────────────
// Árbol pequeño y serializable. Se evalúa siempre contra UN equipo.
export type Comparator = '<' | '<=' | '>' | '>=' | '=='

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { indicator: IndicatorId; op: Comparator; value: number }
  | { resource: ResourceId; op: Comparator; value: number }
  | { flag: FlagId }
  | { chose: { challenge: ChallengeId; option: string } }
  | { outcome: { challenge: ChallengeId; is: OutcomeLevel } }
  | { completed: ChallengeId }
  | { stepAtLeast: number }
  /** Diferencia entre el indicador más alto y el más bajo del equipo. */
  | { spread: Comparator; value: number }

// ─── Efectos ──────────────────────────────────────────────────────────────
export type EffectTarget = 'self' | 'all' | 'others'

export interface ScheduledConsequence {
  event: EventId
  /** Cuántos pasos de la agenda deben pasar antes de dispararse. */
  afterSteps: number
}

export interface Effect {
  /** A quién afecta; `self` = el equipo que resolvió. */
  target?: EffectTarget
  indicators?: Partial<Record<IndicatorId, number>>
  resources?: Partial<Record<ResourceId, number>>
  setFlags?: FlagId[]
  clearFlags?: FlagId[]
  /** Consecuencias diferidas: eventos que aparecerán N pasos después. */
  schedule?: ScheduledConsequence[]
  /** Inserta un reto en la agenda justo después del paso actual. */
  injectChallenge?: ChallengeId
}

// ─── Retos ────────────────────────────────────────────────────────────────
export type ChallengeType =
  | 'decision' // alternativas con efectos
  | 'open' // el equipo responde verbalmente; el facilitador califica
  | 'timed' // contrarreloj
  | 'negotiation' // interacción física entre equipos
  | 'tool' // aplicar una herramienta (FODA, Eisenhower…)
  | 'crisis' // evento inesperado jugable
  | 'event' // situación narrativa con efecto
  | 'physical' // actividad presencial fuera de pantalla

/**
 * Quién resuelve el paso.
 * - active-team: un equipo activo (rota cada paso).
 * - all-teams:   todos resuelven el mismo reto; se registra por equipo.
 * - per-team:    (reservado) cada equipo recibe un reto distinto.
 * - interaction: todos negocian/interactúan; el facilitador asigna resultados.
 */
export type TurnMode = 'active-team' | 'all-teams' | 'per-team' | 'interaction'

/**
 * Clave de un resultado calificado por el facilitador. Las comunes son
 * `success`, `partial` y `fail`, pero se permiten otras (p. ej. `accept-all`).
 */
export type OutcomeLevel = string
/** Cómo se pinta un resultado (color/ícono). */
export type OutcomeTone = 'success' | 'partial' | 'fail'

/** Respuesta deseada (privada): cómo valora el diseño pedagógico cada opción. */
export type OptionRecommendation = 'recommended' | 'acceptable' | 'discouraged'

export interface ChallengeOption {
  id: string
  label: string
  detail?: string
  effect: Effect
  /** Texto público tras elegirla (opcional). */
  feedback?: string
  /** Privado: opción recomendada / aceptable / desaconsejada. */
  recommendation?: OptionRecommendation
  /** Privado: tono visual para el facilitador. */
  tone?: OutcomeTone
  /** Privado: notas internas. */
  notes?: string
}

export interface Outcome {
  label?: string
  /** Por defecto se deduce de la clave (success/partial/fail). */
  tone?: OutcomeTone
  /** Criterio para el facilitador (privado). */
  criteria?: string
  effect: Effect
  feedback?: string
}

/** Ajuste extra que el facilitador otorga a un equipo (bonificación, mini-evento…). */
export interface Bonus {
  id: string
  label: string
  /** Agrupa bonos excluyentes (p. ej. "Proveedor elegido"); sólo uno por grupo y equipo. */
  group?: string
  effect: Effect
}

/** Bandera que el facilitador marca a mano para un equipo durante el reto. */
export interface FacilitatorFlag {
  flag: FlagId
  label: string
}

/** Texto público que sólo aparece si el equipo que resuelve cumple una condición. */
export interface Callback {
  when: Condition
  title?: string
  text: string
}

/** Tabla pública (p. ej. comparativo de proveedores). */
export interface ExhibitTable {
  columns: string[]
  rows: { label: string; cells: string[] }[]
}

/** Información privada: sólo se ve en el panel del facilitador o en la vista privada. */
export interface SecretInfo {
  title: string
  body?: string
  /** Ruta de una imagen en /public (p. ej. "/figuras/mensaje-01.svg"). */
  image?: string
  rules?: string[]
  /** Tarjetas (una por equipo, en orden) — p. ej. objetivos secretos. */
  cards?: { title: string; lines: string[] }[]
}

export interface Challenge {
  id: ChallengeId
  /** Inactivo = existe en admin pero no entra en nuevas partidas (por defecto activo). */
  active?: boolean
  /** Número visible en la guía del facilitador ("RETO 03"). */
  code?: string
  title: string
  /** Hora del día que se muestra en pantalla ("09:20"). */
  clock?: string
  type: ChallengeType
  /** Duración planeada en minutos (planeación del facilitador; no es el temporizador). */
  minutes?: number
  /** La actividad ocurre fuera de pantalla (presencial). */
  inPerson?: boolean
  /** Ambiente visual especial al proyectar. */
  ambience?: 'crisis'
  /** Un reto puede pertenecer a varias categorías. */
  categories: CategoryId[]
  chapter: ChapterId
  narrative: string
  /** Pregunta pública destacada. */
  question?: string
  /** Elementos de la situación (lista pública numerada / con letras). */
  items?: string[]
  itemStyle?: 'number' | 'letter' | 'bullet'
  table?: ExhibitTable
  /** Instrucciones visibles para los participantes. */
  instructions?: string[]
  /** Preguntas públicas que el facilitador revela cuando decide (botón "Mostrar preguntas"). */
  followUp?: { title: string; items: string[] }
  /** Mensaje público que cierra el reto después de resolverlo. */
  takeaway?: string
  /** Textos públicos condicionados a lo que hizo el equipo antes. */
  callbacks?: Callback[]
  /** Muestra el expediente de cada equipo (decisiones, eventos, indicadores). */
  showDossier?: boolean
  secret?: SecretInfo
  facilitatorFlags?: FacilitatorFlag[]
  bonuses?: Bonus[]
  /** Si existe, se muestra temporizador (segundos). */
  durationSec?: number
  turnMode?: TurnMode
  /** Retos tipo decisión. */
  options?: ChallengeOption[]
  /** Retos calificados por el facilitador (abierto, herramienta, físico…). */
  outcomes?: Partial<Record<OutcomeLevel, Outcome>>
  /** Si el equipo no cumple la condición al llegar al paso, el reto se salta. */
  conditions?: Condition
  facilitator: {
    notes: string
    /** Respuesta o solución de referencia (privada). */
    reference?: string[]
    debrief?: string[]
  }
}

// ─── Eventos ──────────────────────────────────────────────────────────────
export type EventTone = 'positive' | 'negative' | 'neutral' | 'crisis'

/**
 * - conditional: se dispara solo cuando se cumple `trigger`.
 * - consequence: lo programa una decisión previa (`schedule`).
 * - surprise:    sólo lo activa el facilitador.
 */
export type EventKind = 'conditional' | 'consequence' | 'surprise'

export interface GameEvent {
  id: EventId
  active?: boolean
  title: string
  kind: EventKind
  tone: EventTone
  narrative: string
  /** Pregunta rápida para el equipo. */
  question?: string
  /** Mensaje final del evento. */
  takeaway?: string
  /** Efecto automático al aplicar el evento. */
  effect: Effect
  /** Respuestas posibles (se suman al efecto automático). */
  options?: ChallengeOption[]
  /** Si existe, el motor lo revisa al cerrar cada paso para cada equipo. */
  trigger?: Condition
  /** Por defecto un evento se dispara una sola vez por equipo. */
  repeatable?: boolean
  /** No se dispara antes de este paso (índice base 0). */
  minStep?: number
  /** No se dispara después de este paso. */
  maxStep?: number
  facilitatorNotes?: string
}

// ─── Final ────────────────────────────────────────────────────────────────
export interface ManagerProfile {
  id: string
  active?: boolean
  /** Fortalezas y riesgo (opcionales, se muestran en el final). */
  strengths?: string
  risk?: string
  title: string
  description: string
  icon: string
  /** Se elige el primer perfil cuya condición se cumpla. Sin condición = respaldo. */
  match?: Condition
}

export type AwardMetric =
  | { kind: 'highest'; indicator: IndicatorId }
  | { kind: 'globalIndex' }
  | { kind: 'balance' }
  | { kind: 'mostDecisions' }
  /** Suma neta de cambios en indicadores obtenidos en ciertos retos (incluye bonos). */
  | { kind: 'challengeGain'; challenges: ChallengeId[] }

export interface AwardDef {
  id: string
  active?: boolean
  title: string
  icon: string
  description: string
  metric: AwardMetric
}

// ─── Configuración de partida ─────────────────────────────────────────────
export interface AgendaEntry {
  challenge: ChallengeId
  /** Sobrescribe el modo de turno del reto. */
  turnMode?: TurnMode
}

export interface GameConfig {
  title: string
  subtitle: string
  premise: string
  teams: { min: number; max: number; default: number }
  /** Orden de los retos principales. */
  agenda: AgendaEntry[]
  defaultTurnMode: TurnMode
  /** Duración objetivo en minutos (sólo informativo). */
  targetMinutes: number
  /** Cómo ve el público los efectos: sin números, con flechas o con números. */
  publicEffects: PublicEffects
  closing: {
    title: string
    lines: string[]
    finale: { title: string; lines: string[]; signoff: string }
  }
}

export type PublicEffects = 'hidden' | 'qualitative' | 'numeric'

/** Todo el contenido que el motor necesita, inyectado (facilita pruebas). */
export interface GameContent {
  config: GameConfig
  indicators: IndicatorDef[]
  categories: CategoryDef[]
  chapters: ChapterDef[]
  flags: FlagDef[]
  resources: ResourceDef[]
  challenges: Challenge[]
  events: GameEvent[]
  profiles: ManagerProfile[]
  awards: AwardDef[]
  teamPresets: TeamPreset[]
}

// ─── Estado de partida (serializable) ─────────────────────────────────────
export interface TeamState {
  id: TeamId
  name: string
  color: string
  icon: string
  indicators: Record<IndicatorId, number>
  resources: Record<ResourceId, number>
  flags: FlagId[]
}

export type StepStatus = 'pending' | 'done' | 'skipped'

export interface AgendaStep {
  uid: string
  challenge: ChallengeId
  turnMode: TurnMode
  status: StepStatus
  /** Equipo que resolvió / asignado (modo active-team o reto inyectado). */
  teamId?: TeamId
  injected?: boolean
}

/** Respuesta de un equipo dentro del paso actual. */
export interface Resolution {
  teamId: TeamId
  optionId?: string
  outcome?: OutcomeLevel
  historyId: string
}

export interface PendingConsequence {
  event: EventId
  teamId: TeamId
  dueStep: number
  sourceChallenge?: ChallengeId
}

export interface QueuedEvent {
  uid: string
  event: EventId
  teamId: TeamId | 'all'
  reason: 'trigger' | 'scheduled' | 'manual'
}

export type IndicatorSnapshot = Record<IndicatorId, number>

export interface HistoryEntry {
  id: string
  at: number
  kind: 'challenge' | 'event' | 'manual' | 'skip'
  step: number
  chapter?: ChapterId
  challenge?: ChallengeId
  event?: EventId
  teamId: TeamId
  optionId?: string
  outcome?: OutcomeLevel
  bonusId?: string
  before: IndicatorSnapshot
  after: IndicatorSnapshot
  resourcesBefore?: Record<ResourceId, number>
  resourcesAfter?: Record<ResourceId, number>
  flagsAdded: FlagId[]
  note?: string
}

export interface TimerState {
  durationSec: number
  /** epoch ms cuando arrancó; null si está en pausa o detenido. */
  startedAt: number | null
  /** Segundos restantes al pausar. */
  remainingSec: number
}

export type Screen =
  | 'home'
  | 'setup'
  | 'dashboard'
  | 'challenge'
  | 'scoreboard'
  | 'final'
  | 'closing'
  | 'credits'

export interface GameState {
  version: 2
  id: string
  createdAt: number
  updatedAt: number
  screen: Screen
  status: 'setup' | 'playing' | 'finished'
  teams: TeamState[]
  agenda: AgendaStep[]
  stepIndex: number
  activeTeamIndex: number
  /** Respuestas registradas en el paso actual (se limpian al avanzar). */
  resolutions: Resolution[]
  /** Si el resultado se revela en pantalla (feedback visible). */
  revealed: boolean
  pending: PendingConsequence[]
  eventQueue: QueuedEvent[]
  /** `eventId:teamId` ya disparados (para no repetir). */
  firedEvents: string[]
  history: HistoryEntry[]
  /** Contador para generar ids deterministas. */
  seq: number
  timer: TimerState
  paused: boolean
  soundOn: boolean
  publicEffects: PublicEffects
  /** Preguntas de seguimiento del reto actual visibles en pantalla. */
  showFollowUp: boolean
}

/** Un elemento está activo salvo que se marque `active: false`. */
export function isActive(item: { active?: boolean } | undefined): boolean {
  return !!item && item.active !== false
}
