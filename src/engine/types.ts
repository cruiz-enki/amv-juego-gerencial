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

export type OutcomeLevel = 'success' | 'partial' | 'fail'

export interface ChallengeOption {
  id: string
  label: string
  detail?: string
  effect: Effect
  feedback: string
}

export interface Outcome {
  label?: string
  effect: Effect
  feedback: string
}

export interface Challenge {
  id: ChallengeId
  title: string
  type: ChallengeType
  /** Un reto puede pertenecer a varias categorías. */
  categories: CategoryId[]
  chapter: ChapterId
  narrative: string
  /** Instrucciones visibles para los participantes. */
  instructions?: string[]
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
    debrief?: string[]
  }
}

// ─── Eventos ──────────────────────────────────────────────────────────────
export type EventTone = 'positive' | 'negative' | 'neutral' | 'crisis'

export interface GameEvent {
  id: EventId
  title: string
  tone: EventTone
  narrative: string
  effect: Effect
  /** Si existe, el motor lo revisa al cerrar cada paso para cada equipo. */
  trigger?: Condition
  /** Por defecto un evento se dispara una sola vez por equipo. */
  repeatable?: boolean
  /** No se dispara antes de este paso (índice base 0). */
  minStep?: number
  facilitatorNotes?: string
}

// ─── Final ────────────────────────────────────────────────────────────────
export interface ManagerProfile {
  id: string
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

export interface AwardDef {
  id: string
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
}

/** Todo el contenido que el motor necesita, inyectado (facilita pruebas). */
export interface GameContent {
  config: GameConfig
  indicators: IndicatorDef[]
  categories: CategoryDef[]
  chapters: ChapterDef[]
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
  before: IndicatorSnapshot
  after: IndicatorSnapshot
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

export type Screen = 'home' | 'setup' | 'dashboard' | 'challenge' | 'scoreboard' | 'final'

export interface GameState {
  version: 1
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
}
