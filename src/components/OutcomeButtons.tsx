import { resolutionFor } from '../engine/selectors'
import type { Challenge, TeamState } from '../engine/types'
import { outcomeMeta, outcomeTone } from '../lib/labels'
import { useGame } from '../state/useGame'
import { PublicEffects } from './PublicEffects'

/** Calificación del facilitador para un equipo (éxito / parcial / fallo u otras). */
export function OutcomeButtons({ challenge, team, compact = false }: { challenge: Challenge; team: TeamState; compact?: boolean }) {
  const { state, dispatch } = useGame()
  const resolution = resolutionFor(state, team.id)
  const entry = state.history.find((h) => h.id === resolution?.historyId)
  const outcomes = Object.entries(challenge.outcomes ?? {}).filter(([, o]) => o)

  if (resolution?.outcome) {
    const outcome = challenge.outcomes?.[resolution.outcome]
    const meta = outcomeMeta[outcomeTone(resolution.outcome, outcome)]
    return (
      <div className="animate-rise">
        <p className="font-display text-xl font-bold" style={{ color: meta.color }}>
          {meta.icon} {outcome?.label ?? meta.label}
        </p>
        {!compact && state.revealed && outcome?.feedback && <p className="mt-1 mb-3 text-lg text-text/85">{outcome.feedback}</p>}
        <div className={compact ? 'mt-1' : ''}>
          <PublicEffects entry={entry} size={compact ? 'sm' : 'md'} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]'}`}
      style={{ '--n': outcomes.length, gridTemplateColumns: compact ? `repeat(${outcomes.length}, minmax(0, 1fr))` : undefined } as React.CSSProperties}
    >
      {outcomes.map(([key, outcome]) => {
        const meta = outcomeMeta[outcomeTone(key, outcome)]
        return (
          <button
            key={key}
            onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, outcome: key })}
            className={`rounded-xl border border-line-strong bg-panel/70 font-semibold transition hover:bg-panel-2 ${compact ? 'px-2 py-2 text-sm' : 'px-4 py-4 text-lg'}`}
            style={{ color: meta.color }}
            title={outcome?.label}
          >
            {meta.icon} {outcome?.label ?? meta.label}
          </button>
        )
      })}
    </div>
  )
}
