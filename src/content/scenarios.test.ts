import { describe, expect, it } from 'vitest'
import { content } from '.'
import { createReducer, emptyState, type ActionInput } from '../engine/reducer'
import { summarizeTeam } from '../engine/results'
import { resolvers } from '../engine/selectors'
import type { GameState } from '../engine/types'

const reduce = createReducer(content)
let clock = 0
const run = (s: GameState, ...actions: ActionInput[]) => actions.reduce((st, a) => reduce(st, { now: ++clock, ...a } as never), s)

function start(n = 4) {
  return run(emptyState(0), {
    type: 'START_GAME',
    teams: Array.from({ length: n }, (_, i) => ({ name: `E${i + 1}`, color: '', icon: '' })),
  })
}
const dismissAll = (s: GameState) => run(s, ...s.eventQueue.map((q) => ({ type: 'DISMISS_EVENT' as const, uid: q.uid })))
/** Avanza (saltando) hasta que el paso actual sea `challenge`. */
function goTo(s: GameState, challenge: string) {
  for (let i = 0; i < 40 && s.agenda[s.stepIndex]?.challenge !== challenge; i++) s = dismissAll(run(s, { type: 'SKIP_STEP' }))
  expect(s.agenda[s.stepIndex]?.challenge).toBe(challenge)
  return s
}
const ids = (s: GameState) => resolvers(s, content).map((t) => t.id)

describe('retos multi-equipo', () => {
  it.each(['talento-dificil', 'el-rumor', 'quiere-pero-no-puede', 'cliente-quiere-todo', 'decidir-sin-certeza'])(
    '%s lo responden todos los equipos',
    (id) => {
      const s = goTo(start(4), id)
      expect(ids(s)).toEqual(['t1', 't2', 't3', 't4'])
    },
  )

  it('sólo el reto 07 conserva equipo protagonista', () => {
    const single = content.config.agenda
      .map((a) => content.challenges.find((c) => c.id === a.challenge)!)
      .filter((c) => (c.turnMode ?? 'active-team') === 'active-team')
    expect(single.map((c) => c.code)).toEqual(['07'])
  })

  it('cada equipo registra su propia decisión con efectos distintos', () => {
    let s = goTo(start(3), 'talento-dificil')
    s = run(s, { type: 'RESOLVE', teamId: 't1', optionId: 'a' }, { type: 'RESOLVE', teamId: 't2', optionId: 'b' }, { type: 'RESOLVE', teamId: 't3', optionId: 'c' })
    expect(s.resolutions.map((r) => r.optionId)).toEqual(['a', 'b', 'c'])
    expect(s.teams[0].indicators.equipo).toBe(42)
    expect(s.teams[1].indicators.equipo).toBe(56)
    expect(s.teams[2].indicators.equipo).toBe(52)
    expect(s.teams[0].flags).toContain('talento_sin_limites')
  })
})

describe('reto 14 · decidir sin certeza', () => {
  it('cada camino tiene efecto y bandera propios; el argumento se califica aparte', () => {
    let s = goTo(start(3), 'decidir-sin-certeza')
    s = run(s, { type: 'RESOLVE', teamId: 't1', optionId: 'a' }, { type: 'RESOLVE', teamId: 't2', optionId: 'b' }, { type: 'RESOLVE', teamId: 't3', optionId: 'c' })
    const [a, b, c] = s.teams
    expect(a.indicators).toMatchObject({ resultados: 54, reputacion: 46, liderazgo: 51 })
    expect(b.indicators).toMatchObject({ resultados: 53, reputacion: 51, recursos: 47 })
    expect(c.indicators).toMatchObject({ resultados: 54, liderazgo: 54, recursos: 48 })
    expect([a.flags, b.flags, c.flags]).toEqual([['lanzamiento_anticipado'], ['oportunidad_perdida'], ['piloto_controlado']])
    s = run(s, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'riesgo-claro' }, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'creemos-que-saldra-bien' })
    expect(s.teams[0].indicators.liderazgo).toBe(56) // sólo un argumento por equipo
  })
})

describe('consecuencias', () => {
  it('promesa_sin_informacion → "La promesa regresa" después del reto 10, una sola vez', () => {
    let s = goTo(start(2), 'el-rumor')
    s = run(s, { type: 'RESOLVE', teamId: 't1', optionId: 'a' }, { type: 'RESOLVE', teamId: 't2', optionId: 'c' }, { type: 'COMPLETE_STEP' })
    expect(s.eventQueue.some((q) => q.event === 'la-promesa-regresa')).toBe(false)
    s = dismissAll(s)
    s = goTo(s, 'punto-critico')
    expect(s.eventQueue.some((q) => q.event === 'la-promesa-regresa')).toBe(false)
    s = run(s, { type: 'COMPLETE_STEP' }) // termina el reto 10
    const promise = s.eventQueue.filter((q) => q.event === 'la-promesa-regresa')
    expect(promise.map((q) => q.teamId)).toEqual(['t1'])
    const before = s.teams[0].indicators
    s = run(s, { type: 'APPLY_EVENT', uid: promise[0].uid })
    expect(s.teams[0].indicators.liderazgo).toBe(before.liderazgo - 6)
    expect(s.teams[0].indicators.equipo).toBe(before.equipo - 5)
    expect(s.teams[0].indicators.reputacion).toBe(before.reputacion - 4)
    s = dismissAll(s)
    for (let i = 0; i < 4; i++) s = dismissAll(run(s, { type: 'SKIP_STEP' }))
    expect(s.history.filter((h) => h.event === 'la-promesa-regresa')).toHaveLength(1)
  })

  it('riesgo_proveedor cuesta Resultados −3 al primer problema de proveedor, sin duplicarse', () => {
    let s = run(start(2), { type: 'TOGGLE_FLAG', teamId: 't1', flag: 'riesgo_proveedor' })
    s = goTo(s, 'tres-proveedores')
    s = run(s, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'eligio-a' }, { type: 'APPLY_BONUS', teamId: 't2', bonusId: 'eligio-a' }, { type: 'COMPLETE_STEP' })
    // Primero llega el retraso del proveedor A a ambos equipos…
    expect(s.eventQueue.map((q) => q.event)).toEqual(['proveedor-a-retraso', 'proveedor-a-retraso'])
    s = run(s, ...s.eventQueue.map((q) => ({ type: 'APPLY_EVENT' as const, uid: q.uid })))
    s = run(s, { type: 'COMPLETE_STEP' })
    // …y al siguiente paso, sólo el equipo que ignoró el riesgo recibe la señal.
    const signal = s.eventQueue.filter((q) => q.event === 'la-senal-del-proveedor')
    expect(signal.map((q) => q.teamId)).toEqual(['t1'])
    const before = s.teams[0].indicators.resultados
    s = run(s, { type: 'APPLY_EVENT', uid: signal[0].uid })
    expect(s.teams[0].indicators.resultados).toBe(before - 3)
    // El reto 10 vuelve a marcar problema_proveedor, pero la señal no se repite.
    s = dismissAll(s)
    s = goTo(s, 'punto-critico')
    s = run(s, { type: 'RESOLVE', teamId: 't1', outcome: 'fail' }, { type: 'COMPLETE_STEP' })
    expect(s.eventQueue.some((q) => q.event === 'la-senal-del-proveedor')).toBe(false)
  })
})

describe('perfiles y umbrales', () => {
  const profileFor = (indicators: Record<string, number>) => {
    const s = start(1 + 1)
    const team = { ...s.teams[0], indicators }
    return summarizeTeam(team, s, content).profile?.id
  }
  it.each([
    [{ resultados: 70, equipo: 65, liderazgo: 75, recursos: 62, reputacion: 66 }, 'equilibrado'],
    [{ resultados: 90, equipo: 50, liderazgo: 90, recursos: 60, reputacion: 68 }, 'negociador'],
    [{ resultados: 90, equipo: 50, liderazgo: 90, recursos: 59, reputacion: 68 }, 'ejecutor'],
    [{ resultados: 60, equipo: 68, liderazgo: 65, recursos: 50, reputacion: 50 }, 'constructor'],
    [{ resultados: 60, equipo: 67, liderazgo: 65, recursos: 50, reputacion: 50 }, 'en-construccion'],
    [{ resultados: 70, equipo: 50, liderazgo: 50, recursos: 65, reputacion: 50 }, 'estratega'],
    [{ resultados: 75, equipo: 50, liderazgo: 50, recursos: 50, reputacion: 50 }, 'ejecutor'],
    [{ resultados: 74, equipo: 50, liderazgo: 50, recursos: 50, reputacion: 50 }, 'en-construccion'],
    [{ resultados: 60, equipo: 50, liderazgo: 50, recursos: 45, reputacion: 50 }, 'bombero'],
  ])('%o → %s', (indicators, expected) => {
    expect(profileFor(indicators)).toBe(expected)
  })

  it('"La reputación habla" se activa con Reputación ≥ 65 después del reto 14', () => {
    const ev = content.events.find((e) => e.id === 'la-reputacion-habla')!
    expect(ev.trigger).toEqual({ indicator: 'reputacion', op: '>=', value: 65 })
    let s = run(start(2), { type: 'ADJUST', teamId: 't1', indicator: 'reputacion', delta: 15 })
    s = goTo(s, 'decidir-sin-certeza')
    s = run(s, { type: 'COMPLETE_STEP' })
    expect(s.eventQueue.filter((q) => q.event === 'la-reputacion-habla').map((q) => q.teamId)).toEqual(['t1'])
  })
})

describe('partida completa con contenido real', () => {
  it.each([2, 3, 4, 5, 6])('termina con %i equipos', (n) => {
    let s = start(n)
    for (let guard = 0; guard < 200 && s.status === 'playing'; guard++) {
      if (s.eventQueue.length) {
        s = run(s, { type: 'APPLY_EVENT', uid: s.eventQueue[0].uid })
        continue
      }
      const ch = content.challenges.find((c) => c.id === s.agenda[s.stepIndex].challenge)!
      for (const t of resolvers(s, content)) {
        if (ch.options) s = run(s, { type: 'RESOLVE', teamId: t.id, optionId: ch.options[0].id })
        else if (ch.outcomes) s = run(s, { type: 'RESOLVE', teamId: t.id, outcome: Object.keys(ch.outcomes)[0] })
      }
      s = run(s, { type: 'COMPLETE_STEP' })
    }
    expect(s.status).toBe('finished')
    expect(s.screen).toBe('final')
    expect(s.agenda.every((a) => a.status !== 'pending')).toBe(true)
  })
})
