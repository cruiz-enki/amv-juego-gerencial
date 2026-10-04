import type { Condition, Effect, GameContent } from '../engine/types'

const OPS: Record<string, string> = { '<': '<', '<=': '≤', '>': '>', '>=': '≥', '==': '=' }

/** Condición en lenguaje natural (para listados y el facilitador). */
export function describeCondition(cond: Condition | undefined, c: GameContent): string {
  if (!cond) return 'Siempre'
  const ind = (id: string) => c.indicators.find((d) => d.id === id)?.label ?? id
  const flag = (id: string) => c.flags.find((f) => f.id === id)?.label ?? id
  const ch = (id: string) => {
    const x = c.challenges.find((y) => y.id === id)
    return x ? `reto ${x.code ?? ''} "${x.title}"` : id
  }
  if ('all' in cond) return cond.all.map((x) => describeCondition(x, c)).join(' y ')
  if ('any' in cond) return `(${cond.any.map((x) => describeCondition(x, c)).join(' o ')})`
  if ('not' in cond) return `NO (${describeCondition(cond.not, c)})`
  if ('indicator' in cond) return `${ind(cond.indicator)} ${OPS[cond.op]} ${cond.value}`
  if ('resource' in cond) return `${cond.resource} ${OPS[cond.op]} ${cond.value}`
  if ('flag' in cond) return `bandera "${flag(cond.flag)}"`
  if ('chose' in cond) return `eligió ${cond.chose.option.toUpperCase()} en ${ch(cond.chose.challenge)}`
  if ('outcome' in cond) return `obtuvo "${cond.outcome.is}" en ${ch(cond.outcome.challenge)}`
  if ('completed' in cond) return `completó ${ch(cond.completed)}`
  if ('stepAtLeast' in cond) return `paso ≥ ${cond.stepAtLeast + 1}`
  if ('spread' in cond) return `diferencia entre indicadores ${OPS[cond.spread]} ${cond.value}`
  return 'condición desconocida'
}

export function hasConsequences(effects: (Effect | undefined)[]): boolean {
  return effects.some((e) => !!e && ((e.schedule?.length ?? 0) > 0 || !!e.injectChallenge))
}

export function hasFlags(effects: (Effect | undefined)[]): boolean {
  return effects.some((e) => !!e && ((e.setFlags?.length ?? 0) > 0 || (e.clearFlags?.length ?? 0) > 0))
}
