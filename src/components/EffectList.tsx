import { diff } from '../engine/selectors'
import type { HistoryEntry } from '../engine/types'
import { useGame } from '../state/useGame'

/** Chips con los cambios de indicadores de una entrada del historial. */
export function EffectList({ entry, size = 'md' }: { entry: HistoryEntry | undefined; size?: 'sm' | 'md' }) {
  const { content } = useGame()
  if (!entry) return null
  const changes = diff(entry.before, entry.after)
  if (changes.length === 0) return <p className="text-sm text-muted">Sin cambios en indicadores.</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {changes.map(({ id, delta }) => {
        const def = content.indicators.find((d) => d.id === id)
        return (
          <li
            key={id}
            className={`inline-flex animate-pop items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${size === 'sm' ? 'text-sm' : 'text-base'} ${
              delta > 0 ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger/10 text-danger'
            }`}
          >
            <span aria-hidden>{def?.icon}</span>
            {def?.label ?? id} {delta > 0 ? '+' : ''}
            {delta}
          </li>
        )
      })}
    </ul>
  )
}
