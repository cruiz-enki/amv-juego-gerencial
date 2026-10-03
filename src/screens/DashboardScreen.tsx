import { GameBoard } from '../components/GameBoard'
import { TeamCard } from '../components/TeamCard'
import { Button } from '../components/ui/Button'
import { Chip, Eyebrow, Panel } from '../components/ui/Panel'
import { TeamBadge } from '../components/TeamBadge'
import { activeTeam, currentChallenge, currentStep, isSharedMode, resolvers } from '../engine/selectors'
import { challengeTypeMeta, turnModeLabel } from '../lib/labels'
import { useGame } from '../state/useGame'

export function DashboardScreen() {
  const { state, content, dispatch } = useGame()
  const step = currentStep(state)
  const challenge = currentChallenge(state, content)
  const chapter = content.chapters.find((c) => c.id === challenge?.chapter)
  const responders = resolvers(state, content)
  const shared = step ? isSharedMode(step.turnMode) : false
  const highlighted = shared ? undefined : (responders[0] ?? activeTeam(state))
  const cols = state.teams.length <= 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'

  return (
    <main className="grid gap-5 px-4 py-5 md:px-8">
      <Panel className="px-8 pt-5 pb-4">
        <GameBoard />
      </Panel>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]">
        <Panel className="relative overflow-hidden p-7">
          <div className="absolute -top-20 -right-20 size-60 rounded-full bg-accent/10 blur-3xl" aria-hidden />
          <Eyebrow>Siguiente misión</Eyebrow>
          {challenge && step ? (
            <div className="relative mt-3 animate-rise">
              <p className="font-display text-xl font-semibold text-accent">
                {chapter?.marker} · {chapter?.label}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-tight font-bold text-balance">{challenge.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip color={challengeTypeMeta[challenge.type].color}>
                  {challengeTypeMeta[challenge.type].icon} {challengeTypeMeta[challenge.type].label}
                </Chip>
                {step.injected && <Chip color="var(--color-danger)">⚡ Consecuencia</Chip>}
              </div>
              <div className="mt-6 rounded-2xl border border-line bg-deep/60 p-4">
                <p className="text-sm tracking-widest text-muted uppercase">{turnModeLabel[step.turnMode]}</p>
                {shared ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {responders.map((t) => (
                      <TeamBadge key={t.id} team={t} size="sm" />
                    ))}
                  </div>
                ) : (
                  highlighted && (
                    <p className="mt-2 flex items-center gap-3 font-display text-2xl font-bold">
                      <TeamBadge team={highlighted} /> {highlighted.name}
                    </p>
                  )
                )}
              </div>
              <Button size="lg" variant="primary" className="mt-6 w-full" onClick={() => dispatch({ type: 'OPEN_STEP' })}>
                Abrir reto ▶
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-xl text-muted">No quedan retos. Resuelvan los eventos pendientes o terminen la partida.</p>
              <Button size="lg" variant="primary" className="mt-6 w-full" onClick={() => dispatch({ type: 'FINISH' })}>
                Ver resultados 🏁
              </Button>
            </div>
          )}
        </Panel>

        <section className={`grid gap-4 ${cols}`} aria-label="Equipos">
          {state.teams.map((team) => (
            <TeamCard key={team.id} team={team} active={team.id === highlighted?.id} compact={state.teams.length > 2} />
          ))}
        </section>
      </div>
    </main>
  )
}
