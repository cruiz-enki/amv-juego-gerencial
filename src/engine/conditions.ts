import type { Comparator, Condition, GameState, TeamState } from './types'

function compare(a: number, op: Comparator, b: number): boolean {
  switch (op) {
    case '<':
      return a < b
    case '<=':
      return a <= b
    case '>':
      return a > b
    case '>=':
      return a >= b
    case '==':
      return a === b
  }
}

/**
 * Evalúa una condición para un equipo. Las condiciones son datos puros, así
 * que agregar un tipo nuevo = agregar una rama aquí y en `Condition`.
 */
export function evaluate(cond: Condition | undefined, team: TeamState, state: GameState): boolean {
  if (!cond) return true
  if ('all' in cond) return cond.all.every((c) => evaluate(c, team, state))
  if ('any' in cond) return cond.any.some((c) => evaluate(c, team, state))
  if ('not' in cond) return !evaluate(cond.not, team, state)
  if ('indicator' in cond) return compare(team.indicators[cond.indicator] ?? 0, cond.op, cond.value)
  if ('resource' in cond) return compare(team.resources[cond.resource] ?? 0, cond.op, cond.value)
  if ('flag' in cond) return team.flags.includes(cond.flag)
  if ('chose' in cond)
    return state.history.some(
      (h) =>
        h.teamId === team.id &&
        h.kind === 'challenge' &&
        h.challenge === cond.chose.challenge &&
        h.optionId === cond.chose.option,
    )
  if ('outcome' in cond)
    return state.history.some(
      (h) =>
        h.teamId === team.id &&
        h.kind === 'challenge' &&
        h.challenge === cond.outcome.challenge &&
        h.outcome === cond.outcome.is,
    )
  if ('completed' in cond)
    return state.history.some(
      (h) => h.teamId === team.id && h.kind === 'challenge' && h.challenge === cond.completed,
    )
  if ('stepAtLeast' in cond) return state.stepIndex >= cond.stepAtLeast
  if ('spread' in cond) {
    const values = Object.values(team.indicators)
    const spread = values.length ? Math.max(...values) - Math.min(...values) : 0
    return compare(spread, cond.spread, cond.value)
  }
  return false
}
