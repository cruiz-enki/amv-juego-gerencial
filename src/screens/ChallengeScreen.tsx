import { ChallengeCard } from '../components/ChallengeCard'
import { DecisionOptions } from '../components/DecisionOptions'
import { EffectList } from '../components/EffectList'
import { OutcomeButtons } from '../components/OutcomeButtons'
import { TeamBadge } from '../components/TeamBadge'
import { Timer } from '../components/Timer'
import { Button } from '../components/ui/Button'
import { Eyebrow, Panel } from '../components/ui/Panel'
import { currentChallenge, currentStep, isSharedMode, resolutionFor, resolvers } from '../engine/selectors'
import type { Challenge, TeamState } from '../engine/types'
import { OPTION_LETTERS, turnModeLabel } from '../lib/labels'
import { useGame } from '../state/useGame'

export function ChallengeScreen() {
  const { state, content, dispatch } = useGame()
  const step = currentStep(state)
  const challenge = currentChallenge(state, content)
  if (!step || !challenge) return null
  const teams = resolvers(state, content)
  const shared = isSharedMode(step.turnMode)
  const allResolved = teams.length > 0 && teams.every((t) => resolutionFor(state, t.id))

  return (
    <main key={step.uid} className="grid gap-8 px-10 py-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <section className="min-w-0">
        <ChallengeCard challenge={challenge} injected={step.injected} />
        <div className="mt-8">
          {shared ? (
            <SharedResolution challenge={challenge} teams={teams} />
          ) : (
            teams[0] &&
            (challenge.options ? (
              <DecisionOptions challenge={challenge} team={teams[0]} />
            ) : (
              <OutcomeButtons challenge={challenge} team={teams[0]} />
            ))
          )}
        </div>
      </section>

      <aside className="flex flex-col gap-6">
        {challenge.durationSec ? (
          <Panel className="grid place-items-center p-6">
            <Timer />
          </Panel>
        ) : null}
        <Panel className="p-6">
          <Eyebrow>{turnModeLabel[step.turnMode]}</Eyebrow>
          <ul className="mt-3 grid gap-3">
            {teams.map((t) => {
              const done = !!resolutionFor(state, t.id)
              return (
                <li key={t.id} className="flex items-center gap-3">
                  <TeamBadge team={t} size={shared ? 'sm' : 'md'} />
                  <span className={`font-display font-bold ${shared ? 'text-lg' : 'text-2xl'}`}>{t.name}</span>
                  <span className={`ml-auto text-sm ${done ? 'text-success' : 'text-faint'}`}>{done ? '✓ Resuelto' : 'Pendiente'}</span>
                </li>
              )
            })}
          </ul>
        </Panel>
        <div className="mt-auto flex gap-3">
          <Button variant="ghost" onClick={() => dispatch({ type: 'GO', screen: 'dashboard' })}>
            ← Tablero
          </Button>
          <Button size="lg" variant={allResolved ? 'primary' : 'secondary'} className="flex-1" onClick={() => dispatch({ type: 'COMPLETE_STEP' })}>
            {allResolved ? 'Continuar ▶' : 'Cerrar reto ▶'}
          </Button>
        </div>
      </aside>
    </main>
  )
}

/** Varios equipos resuelven el mismo reto: una fila por equipo. */
function SharedResolution({ challenge, teams }: { challenge: Challenge; teams: TeamState[] }) {
  const { state, dispatch } = useGame()
  return (
    <div className="grid gap-4">
      {challenge.options && (
        <ol className="grid gap-2">
          {challenge.options.map((o, i) => (
            <li key={o.id} className="flex gap-3 text-xl">
              <span className="font-display font-bold text-accent">{OPTION_LETTERS[i]}</span> {o.label}
            </li>
          ))}
        </ol>
      )}
      <div className="grid gap-2">
        {teams.map((team) => {
          const res = resolutionFor(state, team.id)
          const entry = state.history.find((h) => h.id === res?.historyId)
          return (
            <Panel key={team.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <span className="flex w-56 items-center gap-3 font-display text-lg font-bold">
                <TeamBadge team={team} size="sm" /> {team.name}
              </span>
              <div className="min-w-0 flex-1">
                {challenge.options ? (
                  res ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-accent font-display font-bold text-ink">
                        {OPTION_LETTERS[challenge.options.findIndex((o) => o.id === res.optionId)]}
                      </span>
                      <EffectList entry={entry} size="sm" />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {challenge.options.map((o, i) => (
                        <Button key={o.id} onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, optionId: o.id })}>
                          {OPTION_LETTERS[i]}
                        </Button>
                      ))}
                    </div>
                  )
                ) : (
                  <OutcomeButtons challenge={challenge} team={team} compact />
                )}
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
