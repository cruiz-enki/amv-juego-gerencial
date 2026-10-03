import { currentChallenge, currentStep, resolutionFor, resolvers } from '../../engine/selectors'
import { challengeTypeMeta, OPTION_LETTERS, turnModeLabel } from '../../lib/labels'
import { useGame } from '../../state/useGame'
import { OutcomeButtons } from '../OutcomeButtons'
import { TeamBadge } from '../TeamBadge'
import { Timer } from '../Timer'
import { Button } from '../ui/Button'
import { Section } from './Section'

/** Información privada del reto + resolución por equipo. */
export function CurrentChallenge() {
  const { state, content, dispatch } = useGame()
  const challenge = currentChallenge(state, content)
  const step = currentStep(state)
  if (!challenge || !step) {
    return (
      <Section title="Reto actual">
        <p className="text-muted">No hay retos pendientes.</p>
      </Section>
    )
  }
  const teams = resolvers(state, content)
  const type = challengeTypeMeta[challenge.type]
  return (
    <>
      <Section
        title="Reto actual"
        aside={
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'REVEAL', value: !state.revealed })}>
            {state.revealed ? '🙈 Ocultar feedback' : '👁 Mostrar feedback'}
          </Button>
        }
      >
        <p className="font-display text-xl font-bold">
          {type.icon} {challenge.title}
        </p>
        <p className="mb-3 text-sm text-muted">
          {type.label} · {turnModeLabel[step.turnMode]}
          {step.injected && ' · inyectado'}
        </p>
        <div className="mb-3 rounded-xl border border-accent-2/30 bg-accent-2/5 p-3 text-sm leading-relaxed">
          <p className="mb-1 font-bold text-accent-2">Notas del facilitador (no se proyectan)</p>
          <p>{challenge.facilitator.notes}</p>
          {challenge.facilitator.debrief && (
            <ul className="mt-2 list-disc pl-5 text-muted">
              {challenge.facilitator.debrief.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid gap-3">
          {teams.map((team) => {
            const res = resolutionFor(state, team.id)
            return (
              <div key={team.id} className="rounded-xl border border-line bg-deep/50 p-3">
                <p className="mb-2 flex items-center gap-2 font-semibold">
                  <TeamBadge team={team} size="sm" /> {team.name}
                </p>
                {challenge.options ? (
                  <div className="flex flex-wrap gap-2">
                    {challenge.options.map((o, i) => (
                      <Button
                        key={o.id}
                        size="sm"
                        variant={res?.optionId === o.id ? 'primary' : 'secondary'}
                        disabled={!!res}
                        title={o.label}
                        onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, optionId: o.id })}
                      >
                        {OPTION_LETTERS[i]} · {o.label.slice(0, 28)}
                        {o.label.length > 28 ? '…' : ''}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <OutcomeButtons challenge={challenge} team={team} compact />
                )}
              </div>
            )
          })}
        </div>
      </Section>
      {challenge.durationSec ? (
        <Section title="Temporizador">
          <Timer size="md" />
        </Section>
      ) : null}
    </>
  )
}
