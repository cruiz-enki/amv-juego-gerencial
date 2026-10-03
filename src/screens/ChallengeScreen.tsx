import { useState } from 'react'
import { ChallengeCard } from '../components/ChallengeCard'
import { DecisionOptions } from '../components/DecisionOptions'
import { OutcomeButtons } from '../components/OutcomeButtons'
import { PublicEffects } from '../components/PublicEffects'
import { TeamBadge } from '../components/TeamBadge'
import { TeamDossier } from '../components/TeamDossier'
import { Timer } from '../components/Timer'
import { Button } from '../components/ui/Button'
import { Eyebrow, Panel } from '../components/ui/Panel'
import { currentChallenge, currentStep, isSharedMode, resolutionFor, resolvers } from '../engine/selectors'
import type { Challenge, TeamState } from '../engine/types'
import { OPTION_LETTERS, outcomeMeta, outcomeTone, turnModeLabel } from '../lib/labels'
import { useGame } from '../state/useGame'

export function ChallengeScreen() {
  const { state, content, dispatch } = useGame()
  const step = currentStep(state)
  const challenge = currentChallenge(state, content)
  if (!step || !challenge) return null
  const teams = resolvers(state, content)
  const shared = isSharedMode(step.turnMode)
  const resolvable = !!challenge.options?.length || Object.keys(challenge.outcomes ?? {}).length > 0
  const allResolved = resolvable && teams.length > 0 && teams.every((t) => resolutionFor(state, t.id))
  const crisis = challenge.ambience === 'crisis'
  // Cuando aparecen las consecuencias por opción, el temporizador se reduce para dejarles espacio.
  const compactAside = shared && allResolved && state.revealed && !!challenge.options?.some((o) => o.feedback)

  return (
    <div>
      {crisis && (
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80rem_40rem_at_50%_-10%,rgb(255_84_112/0.22),transparent_70%)]" aria-hidden />
      )}
      <main key={step.uid} className="grid gap-8 px-4 py-6 md:px-10 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="min-w-0">
          <ChallengeCard challenge={challenge} injected={step.injected} dense={shared} team={shared ? undefined : teams[0]} teams={teams} />
          {resolvable && (
            <div className={shared ? 'mt-5' : 'mt-8'}>
              {shared ? (
                <SharedResolution challenge={challenge} teams={teams} />
              ) : (
                teams[0] &&
                (challenge.options?.length ? (
                  <DecisionOptions challenge={challenge} team={teams[0]} />
                ) : (
                  <OutcomeButtons challenge={challenge} team={teams[0]} />
                ))
              )}
            </div>
          )}
          {!shared && challenge.takeaway && allResolved && state.revealed && (
            <p className="mt-6 animate-rise border-l-4 border-accent pl-5 font-display text-2xl leading-snug font-semibold text-balance">
              {challenge.takeaway}
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-y-auto">
          {state.timer.durationSec > 0 && (
            <Panel className={`grid place-items-center ${compactAside ? 'p-3' : 'p-6'}`}>
              <Timer size={compactAside ? 'md' : 'lg'} />
            </Panel>
          )}
          {shared && allResolved && state.revealed && (
            <>
              <SharedFeedback challenge={challenge} teams={teams} />
              {challenge.takeaway && (
                <p className="animate-rise border-l-4 border-accent pl-4 font-display text-xl leading-snug font-semibold text-balance">
                  {challenge.takeaway}
                </p>
              )}
            </>
          )}
          {resolvable && shared && (
            <p className="text-center text-muted">
              {teams.filter((t) => resolutionFor(state, t.id)).length} de {teams.length} equipos resueltos
            </p>
          )}
          {resolvable && !shared && (
            <Panel className="p-6">
              <Eyebrow>{turnModeLabel[step.turnMode]}</Eyebrow>
              <ul className="mt-3 grid gap-3">
                {teams.map((t) => {
                  const done = !!resolutionFor(state, t.id)
                  return (
                    <li key={t.id} className="flex items-center gap-3">
                      <TeamBadge team={t} />
                      <span className="font-display text-2xl font-bold">{t.name}</span>
                      <span className={`ml-auto text-sm ${done ? 'text-success' : 'text-faint'}`}>{done ? '✓ Resuelto' : 'Pendiente'}</span>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => dispatch({ type: 'GO', screen: 'dashboard' })}>
              ← Tablero
            </Button>
            <Button size="lg" variant={allResolved || !resolvable ? 'primary' : 'secondary'} className="flex-1" onClick={() => dispatch({ type: 'COMPLETE_STEP' })}>
              {allResolved || !resolvable ? 'Continuar ▶' : 'Cerrar reto ▶'}
            </Button>
          </div>
        </aside>
      </main>
      {challenge.showDossier && (
        <div className="px-4 pb-8 md:px-10">
          <Dossiers teams={state.teams} />
        </div>
      )}
    </div>
  )
}

function Dossiers({ teams }: { teams: TeamState[] }) {
  const [selected, setSelected] = useState(teams[0]?.id)
  const team = teams.find((t) => t.id === selected) ?? teams[0]
  if (!team) return null
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Expediente por equipo">
        {teams.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === team.id}
            onClick={() => setSelected(t.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-semibold ${t.id === team.id ? 'border-accent bg-accent/10' : 'border-line hover:border-line-strong'}`}
          >
            <TeamBadge team={t} size="sm" /> {t.name}
          </button>
        ))}
      </div>
      <TeamDossier key={team.id} team={team} />
    </div>
  )
}

/** Varios equipos resuelven el mismo reto: tarjetas compactas en rejilla. */
function SharedResolution({ challenge, teams }: { challenge: Challenge; teams: TeamState[] }) {
  const { state, dispatch } = useGame()
  const options = challenge.options ?? []
  const outcomes = Object.entries(challenge.outcomes ?? {}).filter(([, o]) => o)
  const cols = teams.length <= 3 ? teams.length : teams.length === 4 ? 2 : 3
  return (
    <div className="grid gap-3">
      {options.length > 0 && (
        <ol className="grid gap-1">
          {options.map((o, i) => (
            <li key={o.id} className="flex gap-3 text-xl leading-snug">
              <span className="font-display font-bold text-accent">{OPTION_LETTERS[i]}</span>
              <span>
                {o.label}
                {o.detail && <span className="text-muted"> — {o.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="grid gap-2 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]" style={{ '--cols': Math.max(1, cols) } as React.CSSProperties}>
        {teams.map((team) => {
          const res = resolutionFor(state, team.id)
          const entry = state.history.find((h) => h.id === res?.historyId)
          const outcome = res?.outcome ? challenge.outcomes?.[res.outcome] : undefined
          const tone = res?.outcome ? outcomeMeta[outcomeTone(res.outcome, outcome)] : undefined
          return (
            <Panel key={team.id} className={`px-3 py-2 ${res ? 'border-accent/40' : ''}`}>
              <p className="mb-1.5 flex items-center gap-2 font-display text-base font-bold">
                <TeamBadge team={team} size="sm" /> <span className="truncate">{team.name}</span>
              </p>
              {res ? (
                <div className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1">
                  {res.optionId ? (
                    <span className="grid size-8 place-items-center rounded-lg bg-accent font-display font-bold text-ink">
                      {OPTION_LETTERS[options.findIndex((o) => o.id === res.optionId)]}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: tone?.color }}>
                      {tone?.icon} {outcome?.label ?? tone?.label}
                    </span>
                  )}
                  <PublicEffects entry={entry} iconsOnly />
                </div>
              ) : options.length ? (
                <div className="flex gap-1.5">
                  {options.map((o, i) => (
                    <Button key={o.id} size="sm" className="min-w-10 flex-1 text-base" onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, optionId: o.id })}>
                      {OPTION_LETTERS[i]}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${outcomes.length}, minmax(0, 1fr))` }}>
                  {outcomes.map(([key, o]) => {
                    const meta = outcomeMeta[outcomeTone(key, o)]
                    return (
                      <button
                        key={key}
                        onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, outcome: key })}
                        className="min-h-9 rounded-lg border border-line-strong bg-panel/70 px-1.5 py-1 text-sm leading-tight font-semibold transition hover:bg-panel-2"
                        style={{ color: meta.color }}
                        title={o?.criteria ?? o?.label}
                      >
                        {meta.icon} {o?.label ?? meta.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

/** Consecuencias agrupadas por opción (multi-equipo), para el panel lateral. */
function SharedFeedback({ challenge, teams }: { challenge: Challenge; teams: TeamState[] }) {
  const { state } = useGame()
  const options = challenge.options ?? []
  const chosen = options.filter((o) => o.feedback && teams.some((t) => resolutionFor(state, t.id)?.optionId === o.id))
  if (chosen.length === 0) return null
  return (
    <ul className="grid animate-rise gap-2">
      {chosen.map((o) => (
        <li key={o.id} className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5">
          <p className="mb-1 flex items-center gap-2">
            <span className="font-display text-lg font-bold text-accent">{OPTION_LETTERS[options.indexOf(o)]}</span>
            <span className="flex -space-x-1">
              {teams
                .filter((t) => resolutionFor(state, t.id)?.optionId === o.id)
                .map((t) => (
                  <TeamBadge key={t.id} team={t} size="sm" />
                ))}
            </span>
          </p>
          <p className="text-base leading-snug">{o.feedback}</p>
        </li>
      ))}
    </ul>
  )
}
