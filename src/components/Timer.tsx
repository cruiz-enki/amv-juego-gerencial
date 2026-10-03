import { formatClock, useTimer } from '../hooks/useTimer'
import { useGame } from '../state/useGame'
import { Button } from './ui/Button'

/** Temporizador grande con anillo. Los controles se pueden ocultar (proyector). */
export function Timer({ controls = true, size = 'lg' }: { controls?: boolean; size?: 'md' | 'lg' }) {
  const { dispatch } = useGame()
  const { remaining, duration, running, done, hasTimer } = useTimer()
  if (!hasTimer) return null
  const pct = duration ? remaining / duration : 0
  const urgent = remaining <= 10
  const color = done ? 'var(--color-danger)' : urgent ? 'var(--color-accent-2)' : 'var(--color-accent)'
  const r = 54
  const circ = 2 * Math.PI * r
  const dim = size === 'lg' ? 'size-52' : 'size-36'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${dim} ${done ? 'animate-pulse' : ''}`}>
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(148 163 184 / 0.15)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className={`font-display font-bold tabular-nums ${size === 'lg' ? 'text-5xl' : 'text-3xl'}`} style={{ color }}>
              {formatClock(remaining)}
            </p>
            <p className="text-xs tracking-widest text-muted uppercase">{done ? 'Tiempo' : running ? 'Corriendo' : 'En pausa'}</p>
          </div>
        </div>
      </div>
      {controls && (
        <div className="flex flex-wrap justify-center gap-2">
          {running ? (
            <Button size="sm" onClick={() => dispatch({ type: 'TIMER_PAUSE' })}>⏸ Pausar</Button>
          ) : (
            <Button size="sm" variant="primary" disabled={done} onClick={() => dispatch({ type: 'TIMER_START' })}>
              ▶ Iniciar
            </Button>
          )}
          <Button size="sm" onClick={() => dispatch({ type: 'TIMER_RESET' })}>↺ Reiniciar</Button>
          <Button size="sm" onClick={() => dispatch({ type: 'TIMER_ADD', seconds: 30 })}>+30 s</Button>
        </div>
      )}
    </div>
  )
}
