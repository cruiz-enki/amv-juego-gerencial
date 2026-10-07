import { beforeEach, describe, expect, it } from 'vitest'
import { emptyState } from '../engine/reducer'
import type { GameAction } from '../engine/reducer'
import { localGameStorage, type PersistedGame } from './persistence'
import { rootReducer } from './rootReducer'

// Navegador mínimo: localStorage + eventos "storage" entre ventanas.
type Listener = (e: { key: string | null; newValue: string | null }) => void
function installWindow() {
  const data = new Map<string, string>()
  const listeners: Listener[] = []
  const win = {
    localStorage: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    },
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => listeners.splice(listeners.indexOf(l), 1),
  }
  ;(globalThis as unknown as { window: unknown }).window = win
  /** Simula que OTRA ventana escribió en localStorage. */
  const otherWindowWrites = (key: string, value: string | null) => {
    if (value === null) data.delete(key)
    else data.set(key, value)
    listeners.forEach((l) => l({ key, newValue: value }))
  }
  return { data, otherWindowWrites, listeners }
}

let t = 0
const act = (g: PersistedGame, a: Omit<GameAction, 'now'> | { type: '@UNDO' }) =>
  rootReducer(g, (a.type === '@UNDO' ? a : { ...a, now: ++t }) as never)
const fresh = (): PersistedGame => ({ state: emptyState(0), past: [] })
const started = () =>
  act(fresh(), { type: 'START_GAME', teams: [{ name: 'A', color: '', icon: '' }, { name: 'B', color: '', icon: '' }] } as never)

describe('deshacer (Regresar)', () => {
  it('revierte decisiones y avances en orden', () => {
    let g = started()
    g = act(g, { type: 'OPEN_STEP' } as never)
    g = act(g, { type: 'RESOLVE', teamId: 't1', outcome: 'success' } as never)
    const afterResolve = g.state
    g = act(g, { type: 'COMPLETE_STEP' } as never)
    expect(g.state.stepIndex).toBe(1)
    g = act(g, { type: '@UNDO' })
    expect(g.state).toEqual(afterResolve)
    g = act(g, { type: '@UNDO' })
    expect(g.state.resolutions).toHaveLength(0)
    expect(g.state.teams[0].indicators.liderazgo).toBe(50)
  })

  it('los bonos del facilitador también se pueden deshacer', () => {
    let g = started()
    g = act(g, { type: 'COMPLETE_STEP' } as never) // reto 02
    for (let i = 0; i < 10 && g.state.agenda[g.state.stepIndex].challenge !== 'nadie-tiene-todo'; i++) g = act(g, { type: 'SKIP_STEP' } as never) // hasta el reto 06
    g = { state: { ...g.state, eventQueue: [] }, past: g.past }
    expect(g.state.agenda[g.state.stepIndex].challenge).toBe('nadie-tiene-todo')
    const before = g.state
    g = act(g, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'acuerdo-explicado' } as never)
    expect(g.state.teams[0].indicators.reputacion).toBe(before.teams[0].indicators.reputacion + 4)
    g = act(g, { type: '@UNDO' })
    expect(g.state).toEqual(before)
  })

  it('no guarda en la pila acciones no deshacibles (temporizador, sonido)', () => {
    let g = started()
    const depth = g.past.length
    g = act(g, { type: 'TIMER_START' } as never)
    g = act(g, { type: 'TOGGLE_SOUND' } as never)
    expect(g.past.length).toBe(depth)
  })
})

describe('persistencia (localStorage)', () => {
  let env: ReturnType<typeof installWindow>
  beforeEach(() => {
    env = installWindow()
  })

  it('guarda y restaura la partida tras recargar (incluida la pila de deshacer)', () => {
    let g = started()
    g = act(g, { type: 'OPEN_STEP' } as never)
    g = act(g, { type: 'RESOLVE', teamId: 't2', outcome: 'fail' } as never)
    expect(localGameStorage.save(g)).toBe(true)
    const restored = localGameStorage.load()
    expect(restored?.state).toEqual(g.state)
    expect(restored?.state.screen).toBe('challenge')
    expect(restored?.past).toHaveLength(g.past.length)
  })

  it('ignora datos corruptos o de una versión anterior', () => {
    env.data.set('punto-critico:partida:v2', '{no es json')
    expect(localGameStorage.load()).toBeNull()
    env.data.set('punto-critico:partida:v2', JSON.stringify({ state: { ...emptyState(0), version: 1 }, past: [] }))
    expect(localGameStorage.load()).toBeNull()
  })

  it('reiniciar borra la partida guardada', () => {
    localGameStorage.save(started())
    localGameStorage.clear()
    expect(localGameStorage.load()).toBeNull()
  })
})

describe('sincronización entre ventanas', () => {
  it('avisa a la otra ventana (facilitador ↔ proyector) cuando cambia la partida', () => {
    const env = installWindow()
    const received: (PersistedGame | null)[] = []
    const unsubscribe = localGameStorage.subscribe((g) => received.push(g))
    const g = act(started(), { type: 'OPEN_STEP' } as never)
    env.otherWindowWrites('punto-critico:partida:v2', JSON.stringify(g))
    env.otherWindowWrites('otra-llave', 'x') // se ignora
    env.otherWindowWrites('punto-critico:partida:v2', null) // la otra ventana reinició
    expect(received).toHaveLength(2)
    expect(received[0]?.state.screen).toBe('challenge')
    expect(received[1]).toBeNull()
    unsubscribe()
    expect(env.listeners).toHaveLength(0)
  })
})
