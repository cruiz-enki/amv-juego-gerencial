import { toneMeta } from '../lib/labels'
import { useGame } from '../state/useGame'
import { EffectPreview } from './EffectPreview'
import { TeamBadge } from './TeamBadge'
import { Button } from './ui/Button'

/** Muestra el primer evento en cola sobre cualquier pantalla del proyector. */
export function EventModal() {
  const { state, content, dispatch } = useGame()
  const queued = state.eventQueue[0]
  if (!queued) return null
  const ev = content.events.find((e) => e.id === queued.event)
  if (!ev) return null
  const tone = toneMeta[ev.tone]
  const team = queued.teamId === 'all' ? undefined : state.teams.find((t) => t.id === queued.teamId)
  const affectsAll = queued.teamId === 'all' || ev.effect.target === 'all'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/80 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="event-title">
      <div
        className="w-full max-w-4xl animate-pop rounded-3xl border-2 bg-deep p-10 text-center shadow-2xl"
        style={{ borderColor: tone.color, boxShadow: `0 0 80px color-mix(in oklab, ${tone.color} 35%, transparent)` }}
      >
        <p className="mb-4 font-display text-lg font-bold tracking-[0.3em] uppercase" style={{ color: tone.color }}>
          {tone.icon} {tone.label}
          {state.eventQueue.length > 1 && <span className="ml-3 text-muted">+{state.eventQueue.length - 1} en cola</span>}
        </p>
        <h2 id="event-title" className="font-display text-5xl font-bold text-balance">
          {ev.title}
        </h2>
        <div className="my-6 flex items-center justify-center gap-3 text-xl text-muted">
          {affectsAll ? (
            <span>Afecta a todos los equipos</span>
          ) : (
            team && (
              <>
                <TeamBadge team={team} size="sm" /> <span className="font-semibold text-text">{team.name}</span>
              </>
            )
          )}
        </div>
        <p className="mx-auto max-w-[55ch] text-2xl leading-relaxed text-pretty">{ev.narrative}</p>
        <div className="my-8">
          <EffectPreview effect={ev.effect} />
          {ev.effect.injectChallenge && (
            <p className="mt-4 text-lg text-accent-2">⚡ Esto abre un nuevo reto para el equipo.</p>
          )}
        </div>
        <div className="flex justify-center gap-3">
          <Button size="lg" variant="primary" onClick={() => dispatch({ type: 'APPLY_EVENT', uid: queued.uid })}>
            Aplicar y continuar
          </Button>
          <Button size="lg" variant="ghost" onClick={() => dispatch({ type: 'DISMISS_EVENT', uid: queued.uid })}>
            Descartar
          </Button>
        </div>
      </div>
    </div>
  )
}
