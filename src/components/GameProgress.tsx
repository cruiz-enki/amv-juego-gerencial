import { currentChallenge, progress } from '../engine/selectors'
import { useGame } from '../state/useGame'

export function GameProgress() {
  const { state, content } = useGame()
  const { done, total, pct } = progress(state)
  const challenge = currentChallenge(state, content)
  const chapter = content.chapters.find((c) => c.id === challenge?.chapter)
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-bold">
          {chapter ? (
            <>
              <span className="text-accent">{chapter.marker}</span> · {chapter.label}
            </>
          ) : (
            'Fin del día'
          )}
        </p>
        <p className="text-sm text-muted">
          Paso {Math.min(done + 1, total)} de {total}
        </p>
      </div>
      <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10" aria-label={`Progreso ${pct}%`}>
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
