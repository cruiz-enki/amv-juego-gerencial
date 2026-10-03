import type { TeamState } from '../engine/types'
import { globalIndex } from '../engine/selectors'
import { useGame } from '../state/useGame'
import { IndicatorBar } from './IndicatorBar'
import { TeamBadge } from './TeamBadge'

interface Props {
  team: TeamState
  active?: boolean
  compact?: boolean
}

export function TeamCard({ team, active = false, compact = false }: Props) {
  const { content } = useGame()
  return (
    <article
      className={`relative rounded-2xl border bg-panel/85 transition ${compact ? 'px-4 py-3' : 'p-4'} ${active ? 'border-accent' : 'border-line'}`}
      style={active ? { boxShadow: `0 0 0 1px var(--color-accent), 0 0 32px color-mix(in oklab, ${team.color} 35%, transparent)` } : undefined}
    >
      {active && (
        <span className="absolute -top-3 left-4 rounded-full bg-accent px-3 py-0.5 text-xs font-bold tracking-widest text-ink uppercase">
          En turno
        </span>
      )}
      <header className={`flex items-center gap-3 ${compact ? 'mb-2' : 'mb-3'}`}>
        <TeamBadge team={team} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl font-bold">{team.name}</h3>
          <p className="flex flex-wrap gap-x-3 text-sm text-muted">
            <span>Índice {globalIndex(team, content.indicators)}</span>
            {content.resources.map((r) => (
              <span key={r.id} title={r.label}>
                {r.icon} {team.resources[r.id] ?? 0}
              </span>
            ))}
          </p>
        </div>
      </header>
      <div className={compact ? 'grid gap-1' : 'grid gap-2.5'}>
        {content.indicators.map((def) => (
          <IndicatorBar key={def.id} def={def} value={team.indicators[def.id] ?? def.initial} size={compact ? 'sm' : 'md'} />
        ))}
      </div>
    </article>
  )
}
