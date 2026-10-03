import { remainingSeconds } from '../engine/reducer'
import { useGame } from '../state/useGame'
import { useNow } from './useNow'

export function useTimer() {
  const { state } = useGame()
  const running = state.timer.startedAt !== null
  const now = useNow(running)
  const remaining = remainingSeconds(state, now)
  return {
    running,
    remaining,
    duration: state.timer.durationSec,
    hasTimer: state.timer.durationSec > 0,
    done: state.timer.durationSec > 0 && remaining <= 0,
  }
}

export function formatClock(seconds: number): string {
  const s = Math.ceil(Math.max(0, seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
