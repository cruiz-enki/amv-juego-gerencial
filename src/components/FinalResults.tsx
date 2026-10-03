import { challengeById } from '../engine/selectors'
import { computeAwards, ranking } from '../engine/results'
import { useGame } from '../state/useGame'
import { IndicatorBar } from './IndicatorBar'
import { TeamBadge } from './TeamBadge'
import { Panel } from './ui/Panel'

export function FinalResults() {
  const { state, content } = useGame()
  const ranked = ranking(state, content)
  const awards = computeAwards(state, content)

  return (
    <div className="grid gap-8">
      <section className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(ranked.length, 3)}, minmax(0, 1fr))` }}>
        {ranked.map((s, i) => {
          const keyDecisions = state.history.filter((h) => h.teamId === s.team.id && h.kind === 'challenge' && h.optionId)
          return (
            <Panel key={s.team.id} className="animate-rise p-6" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="mb-4 flex items-center gap-4">
                <span className="font-display text-4xl font-bold text-faint">{i + 1}</span>
                <TeamBadge team={s.team} size="lg" />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-3xl font-bold">{s.team.name}</h3>
                  <p className="text-muted">
                    Índice global <b className="font-display text-xl text-accent">{s.globalIndex}</b>
                  </p>
                </div>
              </div>
              {s.profile && (
                <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/5 p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Perfil gerencial</p>
                  <p className="font-display text-2xl font-bold">
                    {s.profile.icon} {s.profile.title}
                  </p>
                  <p className="text-text/80">{s.profile.description}</p>
                </div>
              )}
              <div className="grid gap-2">
                {content.indicators.map((d) => (
                  <IndicatorBar key={d.id} def={d} value={s.team.indicators[d.id] ?? 0} size="sm" />
                ))}
              </div>
              <p className="mt-4 text-sm text-muted">
                {s.decisions} retos resueltos · {s.events} eventos vividos · fortaleza:{' '}
                {content.indicators.find((d) => d.id === s.strongest)?.label} · a cuidar:{' '}
                {content.indicators.find((d) => d.id === s.weakest)?.label}
              </p>
              {keyDecisions.length > 0 && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-muted hover:text-text">Decisiones tomadas ({keyDecisions.length})</summary>
                  <ul className="mt-2 grid gap-1">
                    {keyDecisions.map((h) => {
                      const ch = challengeById(content, h.challenge)
                      return (
                        <li key={h.id}>
                          <b>{ch?.title}</b>: {ch?.options?.find((o) => o.id === h.optionId)?.label}
                        </li>
                      )
                    })}
                  </ul>
                </details>
              )}
            </Panel>
          )
        })}
      </section>

      <section>
        <h2 className="mb-4 font-display text-3xl font-bold">Reconocimientos</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {awards.map(({ award, winners, value }, i) => (
            <Panel key={award.id} className="flex animate-pop items-center gap-4 p-5" style={{ animationDelay: `${300 + i * 90}ms` }}>
              <span className="text-5xl" aria-hidden>
                {award.icon}
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold">{award.title}</p>
                <p className="text-sm text-muted">{award.description}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 font-semibold">
                  {winners.map((w) => (
                    <span key={w.id} className="flex items-center gap-1.5">
                      <TeamBadge team={w} size="sm" /> {w.name}
                    </span>
                  ))}
                  {award.metric.kind !== 'balance' && <span className="text-muted">({value})</span>}
                </p>
              </div>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  )
}
