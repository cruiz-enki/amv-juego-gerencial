import { resolutionFor } from '../engine/selectors'
import type { Challenge, TeamState } from '../engine/types'
import { OPTION_LETTERS } from '../lib/labels'
import { useGame } from '../state/useGame'
import { PublicEffects } from './PublicEffects'

/** Alternativas de un reto de decisión para UN equipo que responde. */
export function DecisionOptions({ challenge, team }: { challenge: Challenge; team: TeamState }) {
  const { state, dispatch } = useGame()
  const resolution = resolutionFor(state, team.id)
  const chosen = resolution?.optionId
  const entry = state.history.find((h) => h.id === resolution?.historyId)
  const feedback = challenge.options?.find((o) => o.id === chosen)?.feedback

  return (
    <div className="grid gap-3">
      {challenge.options?.map((option, i) => {
        const isChosen = chosen === option.id
        const dimmed = chosen !== undefined && !isChosen
        return (
          <button
            key={option.id}
            disabled={chosen !== undefined}
            onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, optionId: option.id })}
            className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
              isChosen
                ? 'border-accent bg-accent/10'
                : dimmed
                  ? 'border-line opacity-35'
                  : 'border-line-strong bg-panel/70 hover:-translate-y-0.5 hover:border-accent hover:bg-panel-2'
            } disabled:cursor-default`}
          >
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-xl font-display text-2xl font-bold ${
                isChosen ? 'bg-accent text-ink' : 'bg-white/8 text-accent group-hover:bg-accent group-hover:text-ink'
              }`}
            >
              {OPTION_LETTERS[i]}
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-semibold">{option.label}</span>
              {option.detail && <span className="mt-1 block text-lg text-muted">{option.detail}</span>}
            </span>
          </button>
        )
      })}
      {chosen && state.revealed && (feedback || state.publicEffects !== 'hidden') && (
        <div className="animate-rise rounded-2xl border border-accent/40 bg-accent/5 p-5">
          {feedback && <p className="mb-3 text-xl leading-relaxed text-pretty">{feedback}</p>}
          <PublicEffects entry={entry} />
        </div>
      )}
    </div>
  )
}
