import type { Challenge, GameContent, GameEvent } from '../engine/types'
import { challengeTypeMeta, eventKindLabel, turnModeLabel } from '../lib/labels'
import { describeCondition, hasConsequences, hasFlags } from './describe'
import { itemStatus, type ItemStatus } from './diff'

export type Kind = 'challenge' | 'event'

export interface Row {
  kind: Kind
  id: string
  code: string
  title: string
  when: string
  type: string
  typeKey: string
  minutes?: number
  categories: string[]
  /** Categorías + sus categorías padre (para filtrar). */
  categoryKeys: string[]
  mode: string
  modeKey: string
  scope: 'global' | 'multi' | 'team'
  active: boolean
  options: number
  feedback: boolean
  flags: boolean
  consequences: boolean
  notes: boolean
  inPerson: boolean
  inAgenda: boolean
  status: ItemStatus
  search: string
}

function challengeRow(c: Challenge, content: GameContent, base: GameContent): Row {
  const effects = [
    ...(c.options ?? []).map((o) => o.effect),
    ...Object.values(c.outcomes ?? {}).map((o) => o?.effect),
    ...(c.bonuses ?? []).map((b) => b.effect),
  ]
  const mode = c.turnMode ?? content.config.defaultTurnMode
  const chapter = content.chapters.find((ch) => ch.id === c.chapter)
  return {
    kind: 'challenge',
    id: c.id,
    code: c.code ?? '—',
    title: c.title,
    when: c.clock ?? chapter?.marker ?? '',
    type: challengeTypeMeta[c.type]?.label ?? c.type,
    typeKey: c.type,
    minutes: c.minutes,
    categories: c.categories,
    categoryKeys: [...new Set(c.categories.flatMap((id) => [id, content.categories.find((x) => x.id === id)?.parent ?? id]))],
    mode: turnModeLabel[mode],
    modeKey: mode,
    scope: mode === 'active-team' ? 'team' : mode === 'interaction' ? 'global' : 'multi',
    active: c.active !== false,
    options: (c.options?.length ?? 0) + Object.keys(c.outcomes ?? {}).length,
    feedback: !!c.takeaway || (c.options ?? []).some((o) => o.feedback) || Object.values(c.outcomes ?? {}).some((o) => o?.feedback),
    flags: hasFlags(effects) || (c.facilitatorFlags?.length ?? 0) > 0,
    consequences: hasConsequences(effects),
    notes: !!c.facilitator.notes?.trim(),
    inPerson: !!c.inPerson || c.type === 'physical',
    inAgenda: content.config.agenda.some((a) => a.challenge === c.id),
    status: itemStatus(base, content, 'challenges', c.id),
    search: JSON.stringify([c.id, c.title, c.narrative, c.instructions, c.items, c.options, c.facilitator, c.takeaway]).toLowerCase(),
  }
}

function eventRow(e: GameEvent, content: GameContent, base: GameContent): Row {
  const effects = [e.effect, ...(e.options ?? []).map((o) => o.effect)]
  return {
    kind: 'event',
    id: e.id,
    code: 'EV',
    title: e.title,
    when: e.trigger ? describeCondition(e.trigger, content) : e.kind === 'consequence' ? 'Programado por una decisión' : 'Lo activa el facilitador',
    type: eventKindLabel[e.kind],
    typeKey: e.kind,
    categories: [],
    categoryKeys: [],
    mode: e.effect.target === 'all' ? 'Todos los equipos' : 'Un equipo',
    modeKey: e.effect.target === 'all' ? 'all' : 'team',
    scope: e.effect.target === 'all' ? 'global' : 'team',
    active: e.active !== false,
    options: e.options?.length ?? 0,
    feedback: !!e.takeaway,
    flags: hasFlags(effects) || JSON.stringify(e.trigger ?? {}).includes('"flag"'),
    consequences: hasConsequences(effects),
    notes: !!e.facilitatorNotes?.trim(),
    inPerson: false,
    inAgenda: false,
    status: itemStatus(base, content, 'events', e.id),
    search: JSON.stringify([e.id, e.title, e.narrative, e.question, e.takeaway, e.facilitatorNotes]).toLowerCase(),
  }
}

export function buildRows(content: GameContent, base: GameContent): Row[] {
  const order = content.config.agenda.map((a) => a.challenge)
  const challenges = [...content.challenges].sort((a, b) => {
    const ia = order.indexOf(a.id)
    const ib = order.indexOf(b.id)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
  return [...challenges.map((c) => challengeRow(c, content, base)), ...content.events.map((e) => eventRow(e, content, base))]
}

export interface Filters {
  q: string
  kind: '' | Kind
  type: string
  category: string
  mode: string
  scope: string
  active: string
  format: string
  consequences: string
  flags: string
  status: string
}
export const EMPTY_FILTERS: Filters = { q: '', kind: '', type: '', category: '', mode: '', scope: '', active: '', format: '', consequences: '', flags: '', status: '' }

export function applyFilters(rows: Row[], f: Filters): Row[] {
  const q = f.q.trim().toLowerCase()
  const yes = (v: string, b: boolean) => !v || (v === 'si') === b
  return rows.filter(
    (r) =>
      (!q || r.search.includes(q)) &&
      (!f.kind || r.kind === f.kind) &&
      (!f.type || r.typeKey === f.type) &&
      (!f.category || r.categoryKeys.includes(f.category)) &&
      (!f.mode || r.modeKey === f.mode) &&
      (!f.scope || r.scope === f.scope) &&
      yes(f.active, r.active) &&
      (!f.format || (f.format === 'presencial') === r.inPerson) &&
      yes(f.consequences, r.consequences) &&
      yes(f.flags, r.flags) &&
      (!f.status || (f.status === 'cambiado' ? r.status !== 'same' : r.status === 'same')),
  )
}

