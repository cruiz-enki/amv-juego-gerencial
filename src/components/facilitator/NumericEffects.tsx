import { diff } from '../../engine/selectors'
import type { Effect, HistoryEntry } from '../../engine/types'
import { useGame } from '../../state/useGame'

/** Efectos con números, sólo para el facilitador. */
export function NumericEffects({ effect, entry }: { effect?: Effect; entry?: HistoryEntry }) {
  const { content } = useGame()
  const changes = entry
    ? diff(entry.before, entry.after)
    : Object.entries(effect?.indicators ?? {}).map(([id, delta]) => ({ id, delta: delta ?? 0 }))
  const label = (id: string) => content.indicators.find((d) => d.id === id)?.label.slice(0, 4) ?? id
  const extras = [
    ...(effect?.setFlags ?? []).map((f) => `⚑ ${f}`),
    ...(effect?.schedule ?? []).map((s) => `⏳ ${content.events.find((e) => e.id === s.event)?.title ?? s.event} (+${s.afterSteps})`),
    ...(effect?.injectChallenge ? [`⚡ ${effect.injectChallenge}`] : []),
  ]
  if (changes.length === 0 && extras.length === 0) return <span className="text-xs text-faint">sin efecto</span>
  return (
    <span className="text-xs">
      {changes.map((c) => (
        <span key={c.id} className={`mr-1.5 font-semibold ${c.delta > 0 ? 'text-success' : 'text-danger'}`}>
          {label(c.id)} {c.delta > 0 ? '+' : ''}
          {c.delta}
        </span>
      ))}
      {extras.map((x) => (
        <span key={x} className="mr-1.5 text-accent-2">
          {x}
        </span>
      ))}
    </span>
  )
}
