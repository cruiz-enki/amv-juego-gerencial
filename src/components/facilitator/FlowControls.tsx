import { currentStep } from '../../engine/selectors'
import { useGame } from '../../state/useGame'
import { Button } from '../ui/Button'
import { Section } from './Section'

export function FlowControls() {
  const { state, dispatch, undo, canUndo } = useGame()
  const step = currentStep(state)
  const finished = state.status === 'finished'
  return (
    <Section title="Control de partida">
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={undo} disabled={!canUndo} title="Deshace la última acción (decisión, avance, evento, ajuste…)">
          ↶ Regresar
        </Button>
        {state.screen === 'challenge' ? (
          <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'COMPLETE_STEP' })} disabled={!step}>
            Continuar ▶
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'OPEN_STEP' })} disabled={!step || finished}>
            Abrir reto ▶
          </Button>
        )}
        <Button size="sm" onClick={() => dispatch({ type: 'SKIP_STEP' })} disabled={!step || finished}>
          ⏭ Saltar reto
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}>
          {state.paused ? '▶ Reanudar' : '⏸ Pausar juego'}
        </Button>
        <Button size="sm" variant={state.screen === 'dashboard' ? 'primary' : 'secondary'} onClick={() => dispatch({ type: 'GO', screen: 'dashboard' })}>
          🗺️ Tablero
        </Button>
        <Button size="sm" variant={state.screen === 'scoreboard' ? 'primary' : 'secondary'} onClick={() => dispatch({ type: 'GO', screen: 'scoreboard' })}>
          📊 Marcador
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}>
          {state.soundOn ? '🔊 Sonido' : '🔇 Silencio'}
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: 'GO', screen: state.status === 'finished' ? 'final' : 'challenge' })} disabled={!step && !finished}>
          {finished ? '🏁 Resultados' : '🎬 Ver reto'}
        </Button>
      </div>
    </Section>
  )
}
