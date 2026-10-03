import { evaluate } from './conditions'
import type {
  AgendaStep,
  Challenge,
  GameContent,
  GameState,
  IndicatorDef,
  TeamState,
  TurnMode,
} from './types'

export function currentStep(state: GameState): AgendaStep | undefined {
  return state.agenda[state.stepIndex]
}

export function challengeById(content: GameContent, id: string | undefined): Challenge | undefined {
  return id ? content.challenges.find((c) => c.id === id) : undefined
}

export function currentChallenge(state: GameState, content: GameContent): Challenge | undefined {
  return challengeById(content, currentStep(state)?.challenge)
}

export function activeTeam(state: GameState): TeamState | undefined {
  return state.teams[state.activeTeamIndex]
}

export function isSharedMode(mode: TurnMode): boolean {
  return mode !== 'active-team'
}

/** Equipos que deben resolver el paso actual. */
export function resolvers(state: GameState, content: GameContent): TeamState[] {
  const step = currentStep(state)
  if (!step) return []
  const challenge = challengeById(content, step.challenge)
  if (isSharedMode(step.turnMode)) {
    return state.teams.filter((t) => evaluate(challenge?.conditions, t, state))
  }
  const team = step.teamId ? state.teams.find((t) => t.id === step.teamId) : activeTeam(state)
  return team && evaluate(challenge?.conditions, team, state) ? [team] : []
}

export function resolutionFor(state: GameState, teamId: string) {
  return state.resolutions.find((r) => r.teamId === teamId)
}

export function globalIndex(team: TeamState, indicators: IndicatorDef[]): number {
  const totalWeight = indicators.reduce((s, d) => s + (d.weight ?? 1), 0) || 1
  const sum = indicators.reduce((s, d) => {
    const pct = ((team.indicators[d.id] ?? d.initial) - d.min) / (d.max - d.min || 1)
    return s + pct * 100 * (d.weight ?? 1)
  }, 0)
  return Math.round(sum / totalWeight)
}

/** Desviación estándar de los indicadores: menor = más equilibrado. */
export function imbalance(team: TeamState, indicators: IndicatorDef[]): number {
  const values = indicators.map((d) => team.indicators[d.id] ?? d.initial)
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1)
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length || 1)
  return Math.sqrt(variance)
}

export function teamHistory(state: GameState, teamId: string) {
  return state.history.filter((h) => h.teamId === teamId)
}

export function progress(state: GameState) {
  const total = state.agenda.length
  const done = state.agenda.filter((s) => s.status !== 'pending').length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

/** Deltas de indicadores entre dos snapshots (sólo los que cambiaron). */
export function diff(before: Record<string, number>, after: Record<string, number>) {
  return Object.keys(after)
    .map((id) => ({ id, delta: (after[id] ?? 0) - (before[id] ?? 0) }))
    .filter((d) => d.delta !== 0)
}
