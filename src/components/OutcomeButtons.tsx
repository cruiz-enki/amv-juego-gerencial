import { resolutionFor } from '../engine/selectors'
import type { Challenge, OutcomeLevel, TeamState } from '../engine/types'
import { outcomeMeta } from '../lib/labels'
import { useGame } from '../state/useGame'
import { EffectList } from './EffectList'

const LEVELS: OutcomeLevel[] = ['success', 'partial', 'fail']

/** Calificación del facilitador (éxito / parcial / fallo) para un equipo. */
export function OutcomeButtons({ challenge, team, compact = false }: { challenge: Challenge; team: TeamState; compact?: boolean }) {
  const { state, dispatch } = useGame()
  const resolution = resolutionFor(state, team.id)
  const entry = state.history.find((h) => h.id === resolution?.historyId)
  const levels = LEVELS.filter((l) => challenge.outcomes?.[l])

  if (resolution?.outcome) {
    const meta = outcomeMeta[resolution.outcome]
    const outcome = challenge.outcomes?.[resolution.outcome]
    return (
      <div className="animate-rise">
        <p className="font-display text-xl font-bold" style={{ color: meta.color }}>
          {meta.icon} {outcome?.label ?? meta.label}
        </p>
        {!compact && state.revealed && <p className="mt-1 mb-3 text-lg text-text/85">{outcome?.feedback}</p>}
        <div className={compact ? 'mt-1' : ''}>
          <EffectList entry={entry} size={compact ? 'sm' : 'md'} />
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'sm:grid-cols-3'}`}>
      {levels.map((level) => {
        const meta = outcomeMeta[level]
        return (
          <button
            key={level}
            onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, outcome: level })}
            className={`rounded-xl border border-line-strong bg-panel/70 font-semibold transition hover:bg-panel-2 ${compact ? 'px-2 py-2 text-sm' : 'px-4 py-4 text-lg'}`}
            style={{ color: meta.color }}
          >
            {meta.icon} {compact ? meta.label : challenge.outcomes?.[level]?.label ?? meta.label}
          </button>
        )
      })}
    </div>
  )
}
