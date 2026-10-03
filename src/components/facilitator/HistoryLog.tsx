import { challengeById, diff } from '../../engine/selectors'
import { useGame } from '../../state/useGame'
import { Section } from './Section'

export function HistoryLog() {
  const { state, content } = useGame()
  const recent = [...state.history].reverse().slice(0, 12)
  return (
    <Section title={`Historial (${state.history.length})`}>
      {recent.length === 0 ? (
        <p className="text-sm text-faint">Aún no hay movimientos.</p>
      ) : (
        <ol className="grid gap-1.5 text-sm">
          {recent.map((h) => {
            const team = state.teams.find((t) => t.id === h.teamId)
            const what =
              h.kind === 'event'
                ? `Evento: ${content.events.find((e) => e.id === h.event)?.title ?? h.event}`
                : h.kind === 'manual' || h.kind === 'skip'
                  ? h.note
                  : `${challengeById(content, h.challenge)?.title ?? h.challenge}${h.optionId ? ` → ${h.optionId.toUpperCase()}` : ''}${h.outcome ? ` → ${h.outcome}` : ''}`
            const changes = diff(h.before, h.after)
            return (
              <li key={h.id} className="rounded-lg bg-deep/60 px-2 py-1.5">
                <span className="text-faint">{new Date(h.at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>{' '}
                {team?.icon} <span className="text-text">{what}</span>
                {changes.length > 0 && (
                  <span className="ml-1 text-muted">
                    ({changes.map((c) => `${c.id.slice(0, 4)} ${c.delta > 0 ? '+' : ''}${c.delta}`).join(', ')})
                  </span>
                )}
                {h.flagsAdded.length > 0 && <span className="ml-1 text-accent-2">⚑ {h.flagsAdded.join(', ')}</span>}
              </li>
            )
          })}
        </ol>
      )}
    </Section>
  )
}
