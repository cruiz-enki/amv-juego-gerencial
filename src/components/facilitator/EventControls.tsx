import { useState } from 'react'
import { eventKindLabel, toneMeta } from '../../lib/labels'
import { useGame } from '../../state/useGame'
import { Button } from '../ui/Button'
import { Section } from './Section'

export function EventControls() {
  const { state, content, dispatch } = useGame()
  const [eventId, setEventId] = useState(content.events[0]?.id ?? '')
  const [target, setTarget] = useState<string>(state.teams[state.activeTeamIndex]?.id ?? 'all')
  const teamName = (id: string) => (id === 'all' ? 'Todos' : state.teams.find((t) => t.id === id)?.name ?? id)

  return (
    <Section title="Eventos">
      {state.eventQueue.length > 0 && (
        <ul className="mb-3 grid gap-2">
          {state.eventQueue.map((q) => {
            const ev = content.events.find((e) => e.id === q.event)
            return (
              <li key={q.uid} className="flex items-center justify-between gap-2 rounded-xl border border-accent-2/40 bg-accent-2/5 p-2 text-sm">
                <span>
                  <b>{ev?.title}</b> → {teamName(q.teamId)}{' '}
                  <span className="text-muted">({q.reason === 'trigger' ? 'condicional' : q.reason === 'scheduled' ? 'consecuencia' : 'manual'})</span>
                </span>
                <span className="flex gap-1">
                  <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'APPLY_EVENT', uid: q.uid })}>Aplicar</Button>
                  <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'DISMISS_EVENT', uid: q.uid })}>✕</Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
      <div className="grid gap-2">
        <label className="grid gap-1 text-sm text-muted">
          Evento
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="rounded-lg border border-line-strong bg-deep px-2 py-2 text-text">
            {content.events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {toneMeta[ev.tone].icon} {ev.title} · {eventKindLabel[ev.kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-muted">
          Para
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-lg border border-line-strong bg-deep px-2 py-2 text-text">
            <option value="all">Todos los equipos</option>
            {state.teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted">{content.events.find((e) => e.id === eventId)?.facilitatorNotes}</p>
        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'FIRE_EVENT', event: eventId, teamId: target })}>
          ⚡ Activar evento
        </Button>
      </div>
    </Section>
  )
}
