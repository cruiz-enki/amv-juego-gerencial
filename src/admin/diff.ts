import type { GameContent } from '../engine/types'

export interface FieldChange {
  path: string
  label: string
  before: string
  after: string
}

type Json = unknown

function flatten(value: Json, prefix: string, out: Map<string, string>) {
  if (value === undefined) return
  if (value === null || typeof value !== 'object') {
    out.set(prefix, JSON.stringify(value))
    return
  }
  if (Array.isArray(value) && value.every((v) => v === null || typeof v !== 'object')) {
    out.set(prefix, JSON.stringify(value))
    return
  }
  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value)
  if (entries.length === 0) out.set(prefix, Array.isArray(value) ? '[]' : '{}')
  for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, out)
}

const LABELS: Record<string, string> = {
  title: 'Título', narrative: 'Narrativa', question: 'Pregunta', instructions: 'Instrucciones', items: 'Lista',
  takeaway: 'Mensaje de cierre', feedback: 'Feedback', label: 'Texto', detail: 'Detalle', effect: 'Efecto',
  indicators: 'Indicadores', setFlags: 'Activa banderas', clearFlags: 'Quita banderas', schedule: 'Consecuencias',
  options: 'Opción', outcomes: 'Resultado', facilitator: 'Facilitador', notes: 'Notas', reference: 'Referencia',
  criteria: 'Criterio', recommendation: 'Respuesta deseada', active: 'Activo', durationSec: 'Duración (s)',
  minutes: 'Minutos', turnMode: 'Modo', type: 'Tipo', clock: 'Hora', chapter: 'Capítulo', code: 'Número',
  categories: 'Competencias', trigger: 'Condición', match: 'Condición', description: 'Descripción',
  bonuses: 'Bono', facilitatorFlags: 'Banderas del facilitador', callbacks: 'Texto condicionado', tone: 'Tono',
  minStep: 'Desde paso', maxStep: 'Hasta paso', repeatable: 'Repetible', kind: 'Tipo', metric: 'Criterio',
  initial: 'Valor inicial', min: 'Mínimo', max: 'Máximo', danger: 'Alerta', icon: 'Ícono', afterSteps: 'Retraso',
  event: 'Evento', strengths: 'Fortalezas', risk: 'Riesgo', followUp: 'Preguntas de seguimiento',
}

export function humanPath(path: string): string {
  return path
    .split('.')
    .map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : (LABELS[p] ?? p)))
    .join(' › ')
}

const short = (s: string | undefined) => {
  if (s === undefined) return '—'
  const plain = s.startsWith('"') ? (JSON.parse(s) as string) : s
  return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain
}

/** Campos que difieren entre dos versiones de un elemento. */
export function diffItem(base: Json, draft: Json): FieldChange[] {
  const a = new Map<string, string>()
  const b = new Map<string, string>()
  flatten(base, '', a)
  flatten(draft, '', b)
  const paths = new Set([...a.keys(), ...b.keys()])
  const changes: FieldChange[] = []
  for (const p of paths) {
    if (a.get(p) !== b.get(p)) changes.push({ path: p, label: humanPath(p) || '(todo)', before: short(a.get(p)), after: short(b.get(p)) })
  }
  return changes.sort((x, y) => x.path.localeCompare(y.path))
}

export type ItemSection = 'challenges' | 'events' | 'profiles' | 'awards' | 'indicators' | 'flags'
export type ItemStatus = 'same' | 'modified' | 'new'

export function findItem(c: GameContent, section: ItemSection, id: string) {
  return (c[section] as { id: string }[]).find((x) => x.id === id)
}

export function itemStatus(base: GameContent, draft: GameContent, section: ItemSection, id: string): ItemStatus {
  const b = findItem(base, section, id)
  if (!b) return 'new'
  return diffItem(b, findItem(draft, section, id)).length ? 'modified' : 'same'
}

/** Número total de campos distintos respecto al contenido base. */
export function countChanges(base: GameContent, draft: GameContent): number {
  return diffItem(base, draft).length
}
