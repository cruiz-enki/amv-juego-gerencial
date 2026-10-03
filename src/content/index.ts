import type { Condition, Effect, GameContent } from '../engine/types'
import { categories } from './categories'
import { challenges } from './challenges'
import { chapters } from './chapters'
import { gameConfig } from './config'
import { events } from './events'
import { indicators } from './indicators'
import { resources } from './resources'
import { awards, profiles } from './results'
import { teamPresets } from './teamPresets'

export const content: GameContent = {
  config: gameConfig,
  indicators,
  categories,
  chapters,
  resources,
  challenges,
  events,
  profiles,
  awards,
  teamPresets,
}

/**
 * Revisa referencias rotas en el contenido (ids inexistentes, duplicados…).
 * Corre en las pruebas y en desarrollo; devuelve una lista de problemas.
 */
export function validateContent(c: GameContent): string[] {
  const errors: string[] = []
  const ids = {
    indicator: new Set(c.indicators.map((x) => x.id)),
    category: new Set(c.categories.map((x) => x.id)),
    chapter: new Set(c.chapters.map((x) => x.id)),
    resource: new Set(c.resources.map((x) => x.id)),
    challenge: new Set(c.challenges.map((x) => x.id)),
    event: new Set(c.events.map((x) => x.id)),
  }
  const dupes = (list: { id: string }[], kind: string) => {
    const seen = new Set<string>()
    for (const { id } of list) {
      if (seen.has(id)) errors.push(`${kind} duplicado: ${id}`)
      seen.add(id)
    }
  }
  dupes(c.challenges, 'Reto')
  dupes(c.events, 'Evento')
  dupes(c.indicators, 'Indicador')

  const checkEffect = (e: Effect, where: string) => {
    for (const k of Object.keys(e.indicators ?? {}))
      if (!ids.indicator.has(k)) errors.push(`${where}: indicador desconocido "${k}"`)
    for (const k of Object.keys(e.resources ?? {}))
      if (!ids.resource.has(k)) errors.push(`${where}: recurso desconocido "${k}"`)
    for (const s of e.schedule ?? [])
      if (!ids.event.has(s.event)) errors.push(`${where}: evento programado desconocido "${s.event}"`)
    if (e.injectChallenge && !ids.challenge.has(e.injectChallenge))
      errors.push(`${where}: reto inyectado desconocido "${e.injectChallenge}"`)
  }
  const checkCondition = (cond: Condition | undefined, where: string) => {
    if (!cond) return
    if ('all' in cond) cond.all.forEach((x) => checkCondition(x, where))
    else if ('any' in cond) cond.any.forEach((x) => checkCondition(x, where))
    else if ('not' in cond) checkCondition(cond.not, where)
    else if ('indicator' in cond && !ids.indicator.has(cond.indicator))
      errors.push(`${where}: indicador desconocido "${cond.indicator}"`)
    else if ('resource' in cond && !ids.resource.has(cond.resource))
      errors.push(`${where}: recurso desconocido "${cond.resource}"`)
    else if ('chose' in cond && !ids.challenge.has(cond.chose.challenge))
      errors.push(`${where}: reto desconocido "${cond.chose.challenge}"`)
  }

  for (const ch of c.challenges) {
    const where = `Reto "${ch.id}"`
    if (!ids.chapter.has(ch.chapter)) errors.push(`${where}: capítulo desconocido "${ch.chapter}"`)
    for (const cat of ch.categories) if (!ids.category.has(cat)) errors.push(`${where}: categoría desconocida "${cat}"`)
    if (!ch.options?.length && !ch.outcomes) errors.push(`${where}: necesita "options" u "outcomes"`)
    ch.options?.forEach((o) => checkEffect(o.effect, `${where} opción ${o.id}`))
    Object.entries(ch.outcomes ?? {}).forEach(([k, o]) => o && checkEffect(o.effect, `${where} resultado ${k}`))
    checkCondition(ch.conditions, where)
  }
  for (const ev of c.events) {
    checkEffect(ev.effect, `Evento "${ev.id}"`)
    checkCondition(ev.trigger, `Evento "${ev.id}"`)
  }
  for (const p of c.profiles) checkCondition(p.match, `Perfil "${p.id}"`)
  for (const a of c.config.agenda)
    if (!ids.challenge.has(a.challenge)) errors.push(`Agenda: reto desconocido "${a.challenge}"`)
  if (c.config.teams.min < 1 || c.config.teams.max < c.config.teams.min) errors.push('Config: rango de equipos inválido')
  return errors
}
