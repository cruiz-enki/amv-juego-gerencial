import { evaluate } from './conditions'
import { globalIndex, imbalance } from './selectors'
import type { AwardDef, GameContent, GameState, ManagerProfile, TeamState } from './types'

export interface TeamSummary {
  team: TeamState
  globalIndex: number
  profile: ManagerProfile | undefined
  strongest: string
  weakest: string
  decisions: number
  events: number
}

export function summarizeTeam(team: TeamState, state: GameState, content: GameContent): TeamSummary {
  const sorted = [...content.indicators].sort(
    (a, b) => (team.indicators[b.id] ?? 0) - (team.indicators[a.id] ?? 0),
  )
  const history = state.history.filter((h) => h.teamId === team.id)
  return {
    team,
    globalIndex: globalIndex(team, content.indicators),
    profile: content.profiles.find((p) => evaluate(p.match, team, state)),
    strongest: sorted[0]?.id ?? '',
    weakest: sorted[sorted.length - 1]?.id ?? '',
    decisions: history.filter((h) => h.kind === 'challenge').length,
    events: history.filter((h) => h.kind === 'event').length,
  }
}

export interface AwardResult {
  award: AwardDef
  winners: TeamState[]
  value: number
}

function metricValue(award: AwardDef, team: TeamState, state: GameState, content: GameContent): number {
  const m = award.metric
  switch (m.kind) {
    case 'highest':
      return team.indicators[m.indicator] ?? 0
    case 'globalIndex':
      return globalIndex(team, content.indicators)
    case 'balance':
      return -imbalance(team, content.indicators)
    case 'mostDecisions':
      return state.history.filter((h) => h.teamId === team.id && h.kind === 'challenge').length
  }
}

/** Reconocimientos: gana quien tenga el valor más alto (empates comparten). */
export function computeAwards(state: GameState, content: GameContent): AwardResult[] {
  if (state.teams.length === 0) return []
  return content.awards.map((award) => {
    const scored = state.teams.map((t) => ({ t, v: metricValue(award, t, state, content) }))
    const best = Math.max(...scored.map((s) => s.v))
    return {
      award,
      winners: scored.filter((s) => Math.abs(s.v - best) < 0.001).map((s) => s.t),
      value: Math.round(Math.abs(best)),
    }
  })
}

export function ranking(state: GameState, content: GameContent): TeamSummary[] {
  return state.teams
    .map((t) => summarizeTeam(t, state, content))
    .sort((a, b) => b.globalIndex - a.globalIndex)
}
