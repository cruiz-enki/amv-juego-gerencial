import { useGame } from '../state/useGame'
import { Button } from './ui/Button'

export function PauseOverlay() {
  const { state, dispatch } = useGame()
  if (!state.paused) return null
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink/85 backdrop-blur-md">
      <div className="animate-pop text-center">
        <p className="font-display text-8xl font-bold tracking-tight">Pausa</p>
        <p className="mt-2 text-2xl text-muted">El comité respira. El reloj se detiene.</p>
        <Button size="lg" variant="primary" className="mt-8" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}>
          ▶ Reanudar
        </Button>
      </div>
    </div>
  )
}
