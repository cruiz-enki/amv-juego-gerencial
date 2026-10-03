import { useEffect, useRef, useState } from 'react'
import type { IndicatorDef } from '../engine/types'
import { arrows } from '../lib/labels'
import { useGame } from '../state/useGame'

interface Props {
  def: IndicatorDef
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

/** Barra de un indicador. Cuando el valor cambia, muestra el delta flotando. */
export function IndicatorBar({ def, value, size = 'md', showLabel = true }: Props) {
  const { state } = useGame()
  const prev = useRef(value)
  const [flash, setFlash] = useState<{ delta: number; key: number } | null>(null)

  useEffect(() => {
    const delta = value - prev.current
    prev.current = value
    if (delta !== 0) setFlash({ delta, key: Date.now() })
  }, [value])

  const pct = ((value - def.min) / (def.max - def.min || 1)) * 100
  const danger = value < def.danger
  const height = size === 'lg' ? 'h-4' : size === 'sm' ? 'h-2' : 'h-3'

  return (
    <div className="relative">
      {showLabel && (
        <div className={`mb-1 flex items-baseline justify-between gap-2 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          <span className="flex items-center gap-1.5 truncate text-muted">
            <span aria-hidden>{def.icon}</span>
            <span className="truncate">{def.label}</span>
          </span>
          <span className={`font-display font-bold tabular-nums ${danger ? 'text-danger' : 'text-text'}`}>
            {Math.round(value)}
          </span>
        </div>
      )}
      <div className={`${height} overflow-hidden rounded-full bg-white/8`} role="meter" aria-label={def.label} aria-valuenow={value} aria-valuemin={def.min} aria-valuemax={def.max}>
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${danger ? 'animate-pulse' : ''}`}
          style={{
            width: `${Math.max(2, pct)}%`,
            background: danger ? 'var(--color-danger)' : `linear-gradient(90deg, color-mix(in oklab, ${def.color} 55%, transparent), ${def.color})`,
          }}
        />
      </div>
      {flash && (
        <span
          key={flash.key}
          className={`pointer-events-none absolute -top-1 right-8 animate-flash font-display text-lg font-bold ${flash.delta > 0 ? 'text-success' : 'text-danger'}`}
        >
          {state.publicEffects === 'numeric' ? `${flash.delta > 0 ? '+' : ''}${flash.delta}` : arrows(flash.delta)}
        </span>
      )}
    </div>
  )
}
