import { diff } from '../engine/selectors'
import type { Effect, HistoryEntry } from '../engine/types'
import { arrows } from '../lib/labels'
import { useGame } from '../state/useGame'

interface Change {
  key: string
  icon?: string
  label: string
  delta: number
}

/**
 * Cambios mostrados al PÚBLICO. Según la configuración se ocultan, se muestran
 * como flechas (▲▲ / ▼) o con números. El facilitador siempre ve números aparte.
 */
export function PublicEffects({
  entry,
  effect,
  size = 'md',
  center = false,
  iconsOnly = false,
}: {
  entry?: HistoryEntry
  effect?: Effect
  size?: 'sm' | 'md'
  center?: boolean
  /** Sólo ícono + flechas (para tarjetas compactas). */
  iconsOnly?: boolean
}) {
  const { state, content } = useGame()
  if (state.publicEffects === 'hidden') return null

  const changes: Change[] = []
  if (entry) {
    for (const { id, delta } of diff(entry.before, entry.after)) {
      const d = content.indicators.find((x) => x.id === id)
      changes.push({ key: id, icon: d?.icon, label: d?.label ?? id, delta })
    }
  }
  if (effect) {
    for (const [id, delta] of Object.entries(effect.indicators ?? {})) {
      const d = content.indicators.find((x) => x.id === id)
      if (delta) changes.push({ key: id, icon: d?.icon, label: d?.label ?? id, delta })
    }
    for (const [id, delta] of Object.entries(effect.resources ?? {})) {
      const r = content.resources.find((x) => x.id === id)
      if (delta) changes.push({ key: `r-${id}`, icon: r?.icon, label: r?.label ?? id, delta })
    }
  }
  if (changes.length === 0) return null
  const numeric = state.publicEffects === 'numeric'
  if (iconsOnly) {
    return (
      <span className="inline-flex flex-wrap gap-x-2 text-sm font-semibold">
        {changes.map((c) => (
          <span key={c.key} title={c.label} className={c.delta > 0 ? 'text-success' : 'text-danger'}>
            {c.icon}
            {numeric ? `${c.delta > 0 ? '+' : ''}${c.delta}` : arrows(c.delta)}
          </span>
        ))}
      </span>
    )
  }

  return (
    <ul className={`flex flex-wrap gap-2 ${center ? 'justify-center' : ''}`}>
      {changes.map((c) => (
        <li
          key={c.key}
          className={`inline-flex animate-pop items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${size === 'sm' ? 'text-sm' : 'text-lg'} ${
            c.delta > 0 ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger/10 text-danger'
          }`}
        >
          <span aria-hidden>{c.icon}</span>
          {c.label}{' '}
          {numeric ? `${c.delta > 0 ? '+' : ''}${c.delta}` : <span className="tracking-tighter">{arrows(c.delta)}</span>}
        </li>
      ))}
    </ul>
  )
}
