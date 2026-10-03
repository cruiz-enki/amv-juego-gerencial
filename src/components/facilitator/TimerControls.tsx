import { useGame } from '../../state/useGame'
import { Timer } from '../Timer'
import { Button } from '../ui/Button'
import { Section } from './Section'

const PRESETS = [60, 120, 180, 300]

/** Temporizador del reto + presets para cualquier momento (p. ej. presentaciones). */
export function TimerControls() {
  const { state, dispatch } = useGame()
  return (
    <Section title="Temporizador">
      {state.timer.durationSec > 0 && <Timer size="md" />}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {PRESETS.map((s) => (
          <Button key={s} size="sm" variant="ghost" onClick={() => dispatch({ type: 'TIMER_RESET', durationSec: s })}>
            {s / 60} min
          </Button>
        ))}
        {state.timer.durationSec > 0 && (
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'TIMER_RESET', durationSec: 0 })}>
            Quitar
          </Button>
        )}
      </div>
    </Section>
  )
}
