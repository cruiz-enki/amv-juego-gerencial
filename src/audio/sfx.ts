// Efectos de sonido sintetizados con WebAudio: sin archivos externos.
// Todo es "best effort": si el navegador bloquea el audio, el juego sigue.
let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean) {
  muted = value
}

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, duration = 0.15, type: OscillatorType = 'sine', volume = 0.12, delay = 0) {
  const c = audio()
  if (!c) return
  try {
    const start = c.currentTime + delay
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain).connect(c.destination)
    osc.start(start)
    osc.stop(start + duration)
  } catch {
    /* audio no disponible */
  }
}

export const sfx = {
  transition: () => [220, 330, 440].forEach((f, i) => tone(f, 0.18, 'triangle', 0.08, i * 0.06)),
  select: () => tone(660, 0.08, 'triangle', 0.1),
  success: () => [523, 659, 784].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, i * 0.09)),
  partial: () => [523, 587].forEach((f, i) => tone(f, 0.2, 'triangle', 0.1, i * 0.1)),
  fail: () => [311, 233].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.08, i * 0.15)),
  alert: () => [880, 660, 880].forEach((f, i) => tone(f, 0.14, 'square', 0.07, i * 0.16)),
  crisis: () => [196, 185, 175, 165].forEach((f, i) => tone(f, 0.28, 'sawtooth', 0.09, i * 0.18)),
  positive: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.22, 'sine', 0.1, i * 0.08)),
  tick: () => tone(1200, 0.05, 'square', 0.06),
  timeUp: () => [880, 660, 440].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.12, i * 0.15)),
  fanfare: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, i * 0.13)),
}
