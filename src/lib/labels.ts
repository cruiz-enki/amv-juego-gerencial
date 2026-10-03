import type { ChallengeType, EventKind, EventTone, Outcome, OutcomeTone, PublicEffects, TurnMode } from '../engine/types'

export const challengeTypeMeta: Record<ChallengeType, { label: string; icon: string; color: string }> = {
  decision: { label: 'Decisión', icon: '⚖️', color: '#38e1ff' },
  open: { label: 'Reto abierto', icon: '💬', color: '#a78bfa' },
  timed: { label: 'Contrarreloj', icon: '⏱️', color: '#ffb547' },
  negotiation: { label: 'Negociación', icon: '🤝', color: '#4ade80' },
  tool: { label: 'Herramienta', icon: '🛠️', color: '#60a5fa' },
  crisis: { label: 'Crisis', icon: '🚨', color: '#ff5470' },
  event: { label: 'Evento', icon: '📰', color: '#94a3b8' },
  physical: { label: 'Reto presencial', icon: '🏃', color: '#f472b6' },
}

export const turnModeLabel: Record<TurnMode, string> = {
  'active-team': 'Equipo en turno',
  'all-teams': 'Todos los equipos',
  'per-team': 'Un reto por equipo',
  interaction: 'Interacción entre equipos',
}

export const outcomeMeta: Record<OutcomeTone, { label: string; icon: string; color: string }> = {
  success: { label: 'Éxito', icon: '✅', color: 'var(--color-success)' },
  partial: { label: 'Éxito parcial', icon: '◐', color: 'var(--color-warning)' },
  fail: { label: 'Fallo', icon: '✖', color: 'var(--color-danger)' },
}

export const toneMeta: Record<EventTone, { label: string; color: string; icon: string }> = {
  positive: { label: 'Buenas noticias', color: 'var(--color-positive)', icon: '✨' },
  negative: { label: 'Complicación', color: 'var(--color-accent-2)', icon: '⚠️' },
  neutral: { label: 'Evento', color: 'var(--color-neutral)', icon: '📰' },
  crisis: { label: 'Crisis', color: 'var(--color-crisis)', icon: '🚨' },
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Tono visual de un resultado: explícito o deducido de la clave. */
export function outcomeTone(key: string, outcome?: Outcome): OutcomeTone {
  if (outcome?.tone) return outcome.tone
  return key === 'success' || key === 'fail' ? key : 'partial'
}

export const eventKindLabel: Record<EventKind, string> = {
  conditional: 'Condicional',
  consequence: 'Consecuencia',
  surprise: 'Sorpresa',
}

export const publicEffectsLabel: Record<PublicEffects, string> = {
  hidden: 'Ocultos',
  qualitative: 'Flechas',
  numeric: 'Números',
}

/** Flechas según la magnitud: ±1–3 una, ±4–7 dos, ±8 o más tres. */
export function arrows(delta: number): string {
  const n = Math.abs(delta) >= 8 ? 3 : Math.abs(delta) >= 4 ? 2 : 1
  return (delta > 0 ? '▲' : '▼').repeat(n)
}
