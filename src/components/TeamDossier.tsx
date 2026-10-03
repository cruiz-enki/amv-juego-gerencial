import { challengeById } from '../engine/selectors'
import type { TeamState } from '../engine/types'
import { outcomeMeta, outcomeTone, toneMeta } from '../lib/labels'
import { useGame } from '../state/useGame'
import { IndicatorBar } from './IndicatorBar'
import { TeamBadge } from './TeamBadge'
import { Eyebrow, Panel } from './ui/Panel'

/** Expediente público de un equipo: decisiones, eventos, indicadores y banderas relevantes. */
export function TeamDossier({ team }: { team: TeamState }) {
  const { state, content } = useGame()
  const history = state.history.filter((h) => h.teamId === team.id)
  const decisions = history.filter((h) => h.kind === 'challenge' && !h.bonusId && (h.optionId || h.outcome))
  const events = history.filter((h) => h.kind === 'event' && !h.optionId)
  const flags = team.flags
    .map((f) => content.flags.find((d) => d.id === f))
    .filter((f) => f?.showInDossier)

  return (
    <Panel className="grid animate-rise gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="mb-4 flex items-center gap-3">
          <TeamBadge team={team} size="lg" />
          <h2 className="font-display text-3xl font-bold">{team.name}</h2>
        </div>
        <Eyebrow>Decisiones principales</Eyebrow>
        <ol className="mt-2 grid gap-1.5 text-lg">
          {decisions.length === 0 && <li className="text-muted">Sin decisiones registradas.</li>}
          {decisions.map((h) => {
            const ch = challengeById(content, h.challenge)
            const option = ch?.options?.find((o) => o.id === h.optionId)
            const outcome = h.outcome ? ch?.outcomes?.[h.outcome] : undefined
            const meta = h.outcome ? outcomeMeta[outcomeTone(h.outcome, outcome)] : undefined
            return (
              <li key={h.id} className="flex gap-3">
                <span className="w-10 shrink-0 font-display font-bold text-faint">{ch?.code}</span>
                <span>
                  <b>{ch?.title}</b>
                  <span className="text-muted"> — </span>
                  {option ? option.label : <span style={{ color: meta?.color }}>{outcome?.label ?? meta?.label}</span>}
                </span>
              </li>
            )
          })}
        </ol>
        {events.length > 0 && (
          <>
            <Eyebrow className="mt-5">Eventos que enfrentaron</Eyebrow>
            <ul className="mt-2 flex flex-wrap gap-2">
              {events.map((h) => {
                const ev = content.events.find((e) => e.id === h.event)
                return (
                  <li key={h.id} className="rounded-full border px-3 py-1" style={{ borderColor: ev ? toneMeta[ev.tone].color : undefined }}>
                    {ev ? toneMeta[ev.tone].icon : ''} {ev?.title ?? h.event}
                  </li>
                )
              })}
            </ul>
          </>
        )}
        {flags.length > 0 && (
          <>
            <Eyebrow className="mt-5">Huellas del día</Eyebrow>
            <ul className="mt-2 grid gap-1 text-lg text-text/85">
              {flags.map((f) => (
                <li key={f!.id}>⚑ {f!.label}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="grid content-start gap-3">
        <Eyebrow>Indicadores</Eyebrow>
        {content.indicators.map((d) => (
          <IndicatorBar key={d.id} def={d} value={team.indicators[d.id] ?? d.initial} />
        ))}
        {content.resources.length > 0 && (
          <p className="text-muted">
            {content.resources.map((r) => `${r.icon} ${r.label}: ${team.resources[r.id] ?? 0}`).join(' · ')}
          </p>
        )}
      </div>
    </Panel>
  )
}
