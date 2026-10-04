import type { Challenge, ChallengeOption, GameContent, GameEvent } from '../engine/types'
import { clone } from './storage'
import { findItem, type ItemSection } from './diff'

/** Id libre a partir de otro: "talento-dificil-copia", "-copia-2"… */
export function uniqueId(base: string, taken: Iterable<string>): string {
  const used = new Set(taken)
  let candidate = `${base}-copia`
  for (let i = 2; used.has(candidate); i++) candidate = `${base}-copia-${i}`
  return candidate
}

/** Las copias nacen INACTIVAS para no alterar la partida hasta que se activen. */
export function duplicateChallenge(c: GameContent, id: string): { content: GameContent; newId: string } {
  const next = clone(c)
  const index = next.challenges.findIndex((x) => x.id === id)
  if (index < 0) return { content: c, newId: id }
  const copy: Challenge = clone(next.challenges[index])
  copy.id = uniqueId(id, next.challenges.map((x) => x.id))
  copy.title = `${copy.title} (copia)`
  copy.active = false
  next.challenges.splice(index + 1, 0, copy)
  const agendaIndex = next.config.agenda.findIndex((a) => a.challenge === id)
  if (agendaIndex >= 0) next.config.agenda.splice(agendaIndex + 1, 0, { challenge: copy.id })
  return { content: next, newId: copy.id }
}

export function duplicateEvent(c: GameContent, id: string): { content: GameContent; newId: string } {
  const next = clone(c)
  const index = next.events.findIndex((x) => x.id === id)
  if (index < 0) return { content: c, newId: id }
  const copy: GameEvent = clone(next.events[index])
  copy.id = uniqueId(id, next.events.map((x) => x.id))
  copy.title = `${copy.title} (copia)`
  copy.active = false
  next.events.splice(index + 1, 0, copy)
  return { content: next, newId: copy.id }
}

export function setActive(c: GameContent, section: 'challenges' | 'events' | 'profiles' | 'awards', id: string, active: boolean): GameContent {
  const next = clone(c)
  const item = findItem(next, section, id) as { active?: boolean } | undefined
  if (item) item.active = active
  return next
}

/** Restaura un elemento al original. Si no existía en la base, se elimina. */
export function restoreItem(c: GameContent, base: GameContent, section: ItemSection, id: string): GameContent {
  const next = clone(c)
  const list = next[section] as { id: string }[]
  const index = list.findIndex((x) => x.id === id)
  const original = findItem(base, section, id)
  if (!original) {
    if (index >= 0) list.splice(index, 1)
    if (section === 'challenges') next.config.agenda = next.config.agenda.filter((a) => a.challenge !== id)
    return next
  }
  if (index >= 0) list[index] = clone(original)
  else list.push(clone(original))
  if (section === 'challenges' && base.config.agenda.some((a) => a.challenge === id) && !next.config.agenda.some((a) => a.challenge === id)) {
    next.config.agenda.push(clone(base.config.agenda.find((a) => a.challenge === id)!))
  }
  return next
}

/** Sólo se pueden borrar elementos creados en /admin (los del código se desactivan). */
export function deleteItem(c: GameContent, base: GameContent, section: ItemSection, id: string): GameContent {
  if (findItem(base, section, id)) return c
  return restoreItem(c, base, section, id)
}

/** Mueve un reto en la agenda (orden de juego). */
export function moveInAgenda(c: GameContent, id: string, delta: -1 | 1): GameContent {
  const next = clone(c)
  const a = next.config.agenda
  const i = a.findIndex((x) => x.challenge === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= a.length) return c
  ;[a[i], a[j]] = [a[j], a[i]]
  return next
}

/** Reordena una lista por id (perfiles, opciones…). */
export function moveById<T extends { id: string }>(list: T[], id: string, delta: -1 | 1): T[] {
  const next = [...list]
  const i = next.findIndex((x) => x.id === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= next.length) return list
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export function nextOptionId(options: ChallengeOption[]): string {
  const used = new Set(options.map((o) => o.id))
  for (const l of 'abcdefghijklmnopqrstuvwxyz') if (!used.has(l)) return l
  return uniqueId('opcion', used)
}

/** Cuántos elementos usan una bandera (para el catálogo). */
export function flagUsage(c: GameContent, flag: string): number {
  return JSON.stringify([c.challenges, c.events, c.profiles]).split(`"${flag}"`).length - 1
}

/** Cambia un id y actualiza todas sus referencias (agenda, condiciones, efectos…). */
export function renameId<T>(content: T, oldId: string, newId: string): T {
  return JSON.parse(JSON.stringify(content).split(`"${oldId}"`).join(`"${newId}"`)) as T
}
