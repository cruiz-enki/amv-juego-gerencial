import { useEffect, useRef } from 'react'
import { useTimer } from '../hooks/useTimer'
import { currentChallenge } from '../engine/selectors'
import { outcomeTone } from '../lib/labels'
import { useGame } from '../state/useGame'
import { setMuted, sfx } from './sfx'

/**
 * Traduce cambios de estado en sonidos. Sólo se monta en la ventana del
 * proyector para que el panel del facilitador no duplique el audio.
 */
export function SoundDirector() {
  const { state, content } = useGame()
  const prev = useRef(state)
  const { remaining, running, done } = useTimer()
  const lastTick = useRef<number | null>(null)

  useEffect(() => setMuted(!state.soundOn), [state.soundOn])

  useEffect(() => {
    const before = prev.current
    prev.current = state
    if (state.screen !== before.screen) {
      if (state.screen === 'challenge') {
        if (currentChallenge(state, content)?.ambience === 'crisis') sfx.crisis()
        else sfx.transition()
      }
      if (state.screen === 'final') sfx.fanfare()
    }
    if (state.resolutions.length > before.resolutions.length) {
      const r = state.resolutions.at(-1)
      const tone = r?.outcome ? outcomeTone(r.outcome, currentChallenge(state, content)?.outcomes?.[r.outcome]) : 'success'
      if (tone === 'fail') sfx.fail()
      else if (tone === 'partial') sfx.partial()
      else sfx.success()
    }
    if (state.eventQueue.length > before.eventQueue.length) {
      const ev = content.events.find((e) => e.id === state.eventQueue.at(-1)?.event)
      if (ev?.tone === 'crisis' || ev?.tone === 'negative') sfx.crisis()
      else if (ev?.tone === 'positive') sfx.positive()
      else sfx.alert()
    }
  }, [state, content])

  // Cuenta regresiva audible en los últimos 5 segundos.
  useEffect(() => {
    if (!running) return
    const whole = Math.ceil(remaining)
    if (whole <= 5 && whole > 0 && lastTick.current !== whole) sfx.tick()
    lastTick.current = whole
  }, [remaining, running])

  const announced = useRef(false)
  useEffect(() => {
    if (done && running && !announced.current) {
      announced.current = true
      sfx.timeUp()
    }
    if (!done) announced.current = false
  }, [done, running])

  return null
}
