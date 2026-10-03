import type { Effect } from '../engine/types'
import { useGame } from '../state/useGame'

/** Muestra los cambios que un efecto PROVOCARÁ (antes de aplicarse). */
export function EffectPreview({ effect }: { effect: Effect }) {
  const { content } = useGame()
  const items = [
    ...Object.entries(effect.indicators ?? {}).map(([id, delta]) => {
      const def = content.indicators.find((d) => d.id === id)
      return { key: id, icon: def?.icon, label: def?.label ?? id, delta: delta ?? 0 }
    }),
    ...Object.entries(effect.resources ?? {}).map(([id, delta]) => {
      const def = content.resources.find((r) => r.id === id)
      return { key: `r-${id}`, icon: def?.icon, label: def?.label ?? id, delta: delta ?? 0 }
    }),
  ].filter((i) => i.delta !== 0)
  if (items.length === 0) return null
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {items.map((i) => (
        <li
          key={i.key}
          className={`rounded-full border px-4 py-1.5 text-lg font-semibold ${
            i.delta > 0 ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger/10 text-danger'
          }`}
        >
          {i.icon} {i.label} {i.delta > 0 ? '+' : ''}
          {i.delta}
        </li>
      ))}
    </ul>
  )
}
