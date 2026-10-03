import { bonusesUsed } from '../../engine/reducer'
import { currentChallenge, currentStep, resolutionFor, resolvers } from '../../engine/selectors'
import { challengeTypeMeta, OPTION_LETTERS, outcomeMeta, outcomeTone, turnModeLabel } from '../../lib/labels'
import { useGame } from '../../state/useGame'
import { TeamBadge } from '../TeamBadge'
import { Button } from '../ui/Button'
import { NumericEffects } from './NumericEffects'
import { Section } from './Section'

/** Información privada del reto + resolución, banderas y bonos por equipo. */
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
  const outcomes = Object.entries(challenge.outcomes ?? {}).filter(([, o]) => o)

  return (
    <Section
      title={`Reto ${challenge.code ?? ''} · ${challenge.clock ?? ''}`}
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
        {challenge.inPerson && ' · presencial'}
        {challenge.minutes && ` · ${challenge.minutes} min planeados`}
        {step.injected && ' · inyectado'}
      </p>

      <div className="mb-3 rounded-xl border border-accent-2/30 bg-accent-2/5 p-3 text-sm leading-relaxed">
        <p className="mb-1 font-bold text-accent-2">🔒 Notas del facilitador (no se proyectan)</p>
        <p>{challenge.facilitator.notes}</p>
        {challenge.facilitator.reference && (
          <>
            <p className="mt-2 font-semibold text-accent-2">Referencia</p>
            <ul className="list-disc pl-5">
              {challenge.facilitator.reference.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </>
        )}
        {challenge.facilitator.debrief && (
          <ul className="mt-2 list-disc pl-5 text-muted">
            {challenge.facilitator.debrief.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        )}
        <p className="mt-2 font-semibold text-accent-2">Efectos</p>
        <ul className="grid gap-0.5">
          {challenge.options?.map((o, i) => (
            <li key={o.id}>
              <b>{OPTION_LETTERS[i]}</b> <NumericEffects effect={o.effect} />
            </li>
          ))}
          {outcomes.map(([key, o]) => (
            <li key={key}>
              <b style={{ color: outcomeMeta[outcomeTone(key, o)].color }}>{o?.label ?? key}</b>{' '}
              {o?.criteria && <span className="text-muted">({o.criteria}) </span>}
              <NumericEffects effect={o?.effect} />
            </li>
          ))}
          {challenge.bonuses?.map((b) => (
            <li key={b.id}>
              <b>Bono:</b> {b.label} <NumericEffects effect={b.effect} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {challenge.followUp && (
          <Button size="sm" variant={state.showFollowUp ? 'primary' : 'secondary'} onClick={() => dispatch({ type: 'TOGGLE_FOLLOW_UP' })}>
            {state.showFollowUp ? '🙈 Ocultar preguntas' : `❓ Mostrar: ${challenge.followUp.title}`}
          </Button>
        )}
        {challenge.secret && (
          <Button size="sm" onClick={() => window.open('/privado', 'punto-critico-privado', 'width=900,height=900')}>
            🔒 Vista privada: {challenge.secret.title}
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {teams.map((team) => {
          const res = resolutionFor(state, team.id)
          const entry = state.history.find((h) => h.id === res?.historyId)
          const used = bonusesUsed(state, team.id)
          return (
            <div key={team.id} className="rounded-xl border border-line bg-deep/50 p-3">
              <p className="mb-2 flex items-center gap-2 font-semibold">
                <TeamBadge team={team} size="sm" /> {team.name}
                {entry && (
                  <span className="ml-auto">
                    <NumericEffects entry={entry} />
                  </span>
                )}
              </p>
              {challenge.options?.length ? (
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
                      {OPTION_LETTERS[i]} · {o.label.slice(0, 26)}
                      {o.label.length > 26 ? '…' : ''}
                    </Button>
                  ))}
                </div>
              ) : outcomes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {outcomes.map(([key, o]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={res?.outcome === key ? 'primary' : 'secondary'}
                      disabled={!!res}
                      onClick={() => dispatch({ type: 'RESOLVE', teamId: team.id, outcome: key })}
                    >
                      {outcomeMeta[outcomeTone(key, o)].icon} {o?.label ?? key}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-faint">Reto sin calificación.</p>
              )}
              {challenge.bonuses && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {challenge.bonuses.map((b) => {
                    const done = used.includes(b.id)
                    const groupTaken = !!b.group && used.some((u) => challenge.bonuses?.find((x) => x.id === u)?.group === b.group)
                    return (
                      <button
                        key={b.id}
                        disabled={done || groupTaken}
                        onClick={() => dispatch({ type: 'APPLY_BONUS', teamId: team.id, bonusId: b.id })}
                        className={`rounded-lg border px-2 py-1 text-xs font-semibold ${done ? 'border-success/50 bg-success/10 text-success' : 'border-line hover:border-line-strong disabled:opacity-40'}`}
                      >
                        {done ? '✓ ' : '+ '}
                        {b.label}
                      </button>
                    )
                  })}
                </div>
              )}
              {challenge.facilitatorFlags && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {challenge.facilitatorFlags.map((f) => {
                    const on = team.flags.includes(f.flag)
                    return (
                      <button
                        key={f.flag}
                        onClick={() => dispatch({ type: 'TOGGLE_FLAG', teamId: team.id, flag: f.flag })}
                        className={`rounded-lg border px-2 py-1 text-xs ${on ? 'border-accent-2 bg-accent-2/15 text-accent-2' : 'border-line text-muted hover:border-line-strong'}`}
                        aria-pressed={on}
                      >
                        ⚑ {f.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
