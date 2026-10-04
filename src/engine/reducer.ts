import { evaluate } from './conditions'
import { applyEffect, nextId } from './effects'
import { challengeById, currentStep, isSharedMode, resolvers } from './selectors'
import type {
  AgendaStep,
  GameContent,
  GameState,
  IndicatorId,
  OutcomeLevel,
  PublicEffects,
  QueuedEvent,
  ResourceId,
  Screen,
  TeamId,
  TeamState,
} from './types'
import { isActive } from './types'

export interface NewTeam {
  name: string
  color: string
  icon: string
}

/** Todas las acciones llevan `now` para que el reducer sea puro y testeable. */
export type GameAction = { now: number } & (
  | { type: 'START_GAME'; teams: NewTeam[] }
  | { type: 'GO'; screen: Screen }
  | { type: 'OPEN_STEP' }
  | { type: 'SET_ACTIVE_TEAM'; index: number }
  | { type: 'RESOLVE'; teamId: TeamId; optionId?: string; outcome?: OutcomeLevel }
  | { type: 'REVEAL'; value: boolean }
  | { type: 'COMPLETE_STEP' }
  | { type: 'SKIP_STEP' }
  | { type: 'FIRE_EVENT'; event: string; teamId: TeamId | 'all' }
  | { type: 'APPLY_EVENT'; uid: string; optionId?: string }
  | { type: 'APPLY_BONUS'; teamId: TeamId; bonusId: string }
  | { type: 'TOGGLE_FOLLOW_UP' }
  | { type: 'SET_PUBLIC_EFFECTS'; value: PublicEffects }
  | { type: 'DISMISS_EVENT'; uid: string }
  | { type: 'ADJUST'; teamId: TeamId; indicator?: IndicatorId; resource?: ResourceId; delta: number }
  | { type: 'TOGGLE_FLAG'; teamId: TeamId; flag: string }
  | { type: 'TIMER_START' }
  | { type: 'TIMER_PAUSE' }
  | { type: 'TIMER_RESET'; durationSec?: number }
  | { type: 'TIMER_ADD'; seconds: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'FINISH' }
)

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
/** Acción sin `now`: la forma que usa la UI (el proveedor agrega la hora). */
export type ActionInput = DistributiveOmit<GameAction, 'now'> & { now?: number }

export function emptyState(now: number): GameState {
  return {
    version: 2,
    id: `g${now.toString(36)}`,
    createdAt: now,
    updatedAt: now,
    screen: 'home',
    status: 'setup',
    teams: [],
    agenda: [],
    stepIndex: 0,
    activeTeamIndex: 0,
    resolutions: [],
    revealed: false,
    pending: [],
    eventQueue: [],
    firedEvents: [],
    history: [],
    seq: 0,
    timer: { durationSec: 0, startedAt: null, remainingSec: 0 },
    paused: false,
    soundOn: true,
    publicEffects: 'qualitative',
    showFollowUp: false,
  }
}

/** Bonos ya otorgados a un equipo en el paso actual. */
export function bonusesUsed(state: GameState, teamId: TeamId): string[] {
  return state.history
    .filter((h) => h.step === state.stepIndex && h.teamId === teamId && h.bonusId)
    .map((h) => h.bonusId as string)
}

export function remainingSeconds(state: GameState, now: number): number {
  const { timer } = state
  if (timer.startedAt === null) return timer.remainingSec
  return Math.max(0, timer.remainingSec - (now - timer.startedAt) / 1000)
}

function createTeams(teams: NewTeam[], content: GameContent): TeamState[] {
  return teams.map((t, i) => ({
    id: `t${i + 1}`,
    name: t.name.trim() || `Equipo ${i + 1}`,
    color: t.color,
    icon: t.icon,
    indicators: Object.fromEntries(content.indicators.map((d) => [d.id, d.initial])),
    resources: Object.fromEntries(content.resources.map((r) => [r.id, r.initial])),
    flags: [],
  }))
}

function setTimerFor(state: GameState, content: GameContent): GameState {
  const duration = challengeById(content, currentStep(state)?.challenge)?.durationSec ?? 0
  return { ...state, timer: { durationSec: duration, startedAt: null, remainingSec: duration } }
}

/** Salta automáticamente pasos cuyo reto no aplica a nadie (condiciones). */
function settleStep(state: GameState, content: GameContent, now: number): GameState {
  let next = state
  while (next.stepIndex < next.agenda.length) {
    const step = next.agenda[next.stepIndex]
    const challenge = challengeById(content, step.challenge)
    if (challenge && resolvers(next, content).length > 0) break
    const agenda = next.agenda.map((s, i) => (i === next.stepIndex ? { ...s, status: 'skipped' as const } : s))
    const [id, withSeq] = nextId(next, 'h')
    const teamId = step.teamId ?? next.teams[next.activeTeamIndex]?.id ?? ''
    const team = next.teams.find((t) => t.id === teamId)
    next = {
      ...withSeq,
      agenda,
      stepIndex: next.stepIndex + 1,
      history: [
        ...withSeq.history,
        {
          id,
          at: now,
          kind: 'skip',
          step: next.stepIndex,
          challenge: step.challenge,
          teamId,
          before: team ? { ...team.indicators } : {},
          after: team ? { ...team.indicators } : {},
          flagsAdded: [],
          note: challenge ? 'Condición no cumplida: el reto no aplica' : 'Reto no encontrado en el contenido',
        },
      ],
    }
  }
  return next
}

/** Revisa consecuencias diferidas y eventos condicionales al iniciar un paso. */
function queueEvents(state: GameState, content: GameContent): GameState {
  let next = state
  const queue: QueuedEvent[] = [...next.eventQueue]
  const pending = []
  for (const p of next.pending) {
    if (p.dueStep <= next.stepIndex && !isActive(content.events.find((e) => e.id === p.event))) continue
    if (p.dueStep <= next.stepIndex) {
      const [uid, s] = nextId(next, 'e')
      next = s
      queue.push({ uid, event: p.event, teamId: p.teamId, reason: 'scheduled' })
    } else pending.push(p)
  }
  let fired = next.firedEvents
  for (const team of next.teams) {
    // Máximo un evento condicional por equipo por paso, para no saturar.
    const ev = content.events.find((e) => {
      if (!e.trigger || !isActive(e)) return false
      if ((e.minStep ?? 0) > next.stepIndex) return false
      if (e.maxStep !== undefined && e.maxStep < next.stepIndex) return false
      if (!e.repeatable && fired.includes(`${e.id}:${team.id}`)) return false
      if (queue.some((q) => q.event === e.id && q.teamId === team.id)) return false
      return evaluate(e.trigger, team, next)
    })
    if (!ev) continue
    const [uid, s] = nextId(next, 'e')
    next = s
    queue.push({ uid, event: ev.id, teamId: team.id, reason: 'trigger' })
    fired = [...fired, `${ev.id}:${team.id}`]
  }
  return { ...next, eventQueue: queue, pending, firedEvents: fired }
}

function advance(state: GameState, content: GameContent, status: AgendaStep['status'], now: number): GameState {
  const step = currentStep(state)
  if (!step) return state
  const resolverId = resolvers(state, content)[0]?.id
  const agenda = state.agenda.map((s, i) =>
    i === state.stepIndex
      ? { ...s, status, teamId: s.teamId ?? (isSharedMode(s.turnMode) ? undefined : resolverId) }
      : s,
  )
  const rotates = !isSharedMode(step.turnMode) && !step.injected && state.teams.length > 0
  let next: GameState = {
    ...state,
    agenda,
    stepIndex: state.stepIndex + 1,
    activeTeamIndex: rotates ? (state.activeTeamIndex + 1) % state.teams.length : state.activeTeamIndex,
    resolutions: [],
    revealed: false,
    showFollowUp: false,
    screen: 'dashboard',
  }
  next = queueEvents(next, content)
  next = settleStep(next, content, now)
  if (next.stepIndex >= next.agenda.length && next.eventQueue.length === 0) {
    next = { ...next, status: 'finished', screen: 'final' }
  }
  return setTimerFor(next, content)
}

export function createReducer(content: GameContent) {
  return function reducer(state: GameState, action: GameAction): GameState {
    const next = transition(state, action, content)
    return next === state ? state : { ...next, updatedAt: action.now }
  }
}

function transition(state: GameState, action: GameAction, content: GameContent): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const base = emptyState(action.now)
      let next: GameState = {
        ...base,
        soundOn: state.soundOn,
        status: 'playing',
        screen: 'dashboard',
        publicEffects: content.config.publicEffects,
        teams: createTeams(action.teams, content),
      }
      // Los retos inactivos no entran en nuevas partidas.
      next.agenda = content.config.agenda
        .filter((a) => isActive(challengeById(content, a.challenge)))
        .map((a, i) => ({
        uid: `s0-${i}`,
        challenge: a.challenge,
        turnMode: a.turnMode ?? challengeById(content, a.challenge)?.turnMode ?? content.config.defaultTurnMode,
        status: 'pending',
      }))
      next = settleStep(next, content, action.now)
      return setTimerFor(next, content)
    }

    case 'GO':
      return { ...state, screen: action.screen }

    case 'OPEN_STEP':
      if (!currentStep(state)) return state
      return { ...state, screen: 'challenge' }

    case 'SET_ACTIVE_TEAM':
      if (action.index < 0 || action.index >= state.teams.length) return state
      return { ...state, activeTeamIndex: action.index }

    case 'RESOLVE': {
      const challenge = challengeById(content, currentStep(state)?.challenge)
      if (!challenge) return state
      if (state.resolutions.some((r) => r.teamId === action.teamId)) return state
      if (!resolvers(state, content).some((t) => t.id === action.teamId)) return state
      const option = action.optionId ? challenge.options?.find((o) => o.id === action.optionId) : undefined
      const outcome = action.outcome ? challenge.outcomes?.[action.outcome] : undefined
      const effect = option?.effect ?? outcome?.effect
      if (!effect) return state
      const { state: applied, historyId } = applyEffect(state, action.teamId, effect, content, {
        kind: 'challenge',
        at: action.now,
        challenge: challenge.id,
        optionId: option?.id,
        outcome: action.outcome,
        injectAt: 'next',
      })
      return {
        ...applied,
        resolutions: [
          ...applied.resolutions,
          { teamId: action.teamId, optionId: option?.id, outcome: action.outcome, historyId },
        ],
        revealed: true,
      }
    }

    case 'REVEAL':
      return { ...state, revealed: action.value }

    case 'COMPLETE_STEP':
      return advance(state, content, 'done', action.now)

    case 'SKIP_STEP': {
      const step = currentStep(state)
      if (!step) return state
      const [id, s] = nextId(state, 'h')
      const team = state.teams[state.activeTeamIndex]
      const withLog: GameState = {
        ...s,
        history: [
          ...s.history,
          {
            id,
            at: action.now,
            kind: 'skip',
            step: state.stepIndex,
            challenge: step.challenge,
            teamId: step.teamId ?? team?.id ?? '',
            before: team ? { ...team.indicators } : {},
            after: team ? { ...team.indicators } : {},
            flagsAdded: [],
            note: 'Saltado por el facilitador',
          },
        ],
      }
      return advance(withLog, content, state.resolutions.length ? 'done' : 'skipped', action.now)
    }

    case 'FIRE_EVENT': {
      if (!content.events.some((e) => e.id === action.event)) return state
      const [uid, s] = nextId(state, 'e')
      return {
        ...s,
        eventQueue: [...s.eventQueue, { uid, event: action.event, teamId: action.teamId, reason: 'manual' }],
      }
    }

    case 'APPLY_EVENT':
    case 'DISMISS_EVENT': {
      const queued = state.eventQueue.find((q) => q.uid === action.uid)
      if (!queued) return state
      let next: GameState = { ...state, eventQueue: state.eventQueue.filter((q) => q.uid !== action.uid) }
      const ev = content.events.find((e) => e.id === queued.event)
      if (action.type === 'APPLY_EVENT' && ev) {
        const ctx = {
          kind: 'event' as const,
          at: action.now,
          event: ev.id,
          injectAt: state.screen === 'challenge' ? ('next' as const) : ('current' as const),
        }
        next = applyEffect(next, queued.teamId, ev.effect, content, ctx).state
        // La respuesta elegida se suma al efecto automático del evento.
        const option = action.optionId ? ev.options?.find((o) => o.id === action.optionId) : undefined
        if (option) next = applyEffect(next, queued.teamId, option.effect, content, { ...ctx, optionId: option.id }).state
      }
      // Si el último evento cerraba la partida, terminarla ahora.
      if (next.stepIndex >= next.agenda.length && next.eventQueue.length === 0 && next.status === 'playing') {
        next = { ...next, status: 'finished', screen: 'final' }
      }
      return next
    }

    case 'APPLY_BONUS': {
      const challenge = challengeById(content, currentStep(state)?.challenge)
      const bonus = challenge?.bonuses?.find((b) => b.id === action.bonusId)
      if (!challenge || !bonus) return state
      if (!state.teams.some((t) => t.id === action.teamId)) return state
      const used = bonusesUsed(state, action.teamId)
      const blocked = used.some(
        (id) => id === bonus.id || (bonus.group && challenge.bonuses?.find((b) => b.id === id)?.group === bonus.group),
      )
      if (blocked) return state
      return applyEffect(state, action.teamId, bonus.effect, content, {
        kind: 'challenge',
        at: action.now,
        challenge: challenge.id,
        bonusId: bonus.id,
        injectAt: 'next',
        note: `Bono: ${bonus.label}`,
      }).state
    }

    case 'TOGGLE_FOLLOW_UP':
      return { ...state, showFollowUp: !state.showFollowUp }

    case 'SET_PUBLIC_EFFECTS':
      return { ...state, publicEffects: action.value }

    case 'ADJUST': {
      const team = state.teams.find((t) => t.id === action.teamId)
      if (!team || action.delta === 0) return state
      const label = action.indicator
        ? content.indicators.find((d) => d.id === action.indicator)?.label
        : content.resources.find((r) => r.id === action.resource)?.label
      return applyEffect(
        state,
        action.teamId,
        {
          indicators: action.indicator ? { [action.indicator]: action.delta } : undefined,
          resources: action.resource ? { [action.resource]: action.delta } : undefined,
        },
        content,
        { kind: 'manual', at: action.now, note: `Ajuste manual: ${label ?? '?'} ${action.delta > 0 ? '+' : ''}${action.delta}` },
      ).state
    }

    case 'TOGGLE_FLAG':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id !== action.teamId
            ? t
            : {
                ...t,
                flags: t.flags.includes(action.flag)
                  ? t.flags.filter((f) => f !== action.flag)
                  : [...t.flags, action.flag],
              },
        ),
      }

    case 'TIMER_START':
      if (state.timer.startedAt !== null || state.timer.remainingSec <= 0) return state
      return { ...state, timer: { ...state.timer, startedAt: action.now } }

    case 'TIMER_PAUSE':
      if (state.timer.startedAt === null) return state
      return {
        ...state,
        timer: { ...state.timer, startedAt: null, remainingSec: remainingSeconds(state, action.now) },
      }

    case 'TIMER_RESET': {
      const duration = action.durationSec ?? state.timer.durationSec
      return { ...state, timer: { durationSec: duration, startedAt: null, remainingSec: duration } }
    }

    case 'TIMER_ADD': {
      const remaining = Math.max(0, remainingSeconds(state, action.now) + action.seconds)
      return {
        ...state,
        timer: {
          durationSec: Math.max(state.timer.durationSec, remaining),
          startedAt: state.timer.startedAt === null ? null : action.now,
          remainingSec: remaining,
        },
      }
    }

    case 'TOGGLE_PAUSE': {
      const paused = !state.paused
      // Pausar el juego también congela el temporizador.
      const timer =
        paused && state.timer.startedAt !== null
          ? { ...state.timer, startedAt: null, remainingSec: remainingSeconds(state, action.now) }
          : state.timer
      return { ...state, paused, timer }
    }

    case 'TOGGLE_SOUND':
      return { ...state, soundOn: !state.soundOn }

    case 'FINISH':
      return { ...state, status: 'finished', screen: 'final', eventQueue: [] }
  }
}
