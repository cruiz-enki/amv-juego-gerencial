import { describe, expect, it } from 'vitest'
import { content } from '.'
import { applyFilters, buildRows, EMPTY_FILTERS } from '../admin/rows'
import { moveInAgenda } from '../admin/operations'
import { clone } from '../admin/storage'
import { validateConfig } from '../admin/validate'
import { createReducer, emptyState, type ActionInput } from '../engine/reducer'
import type { GameContent, GameState } from '../engine/types'

function game(c: GameContent = content, teams = 3) {
  const reduce = createReducer(c)
  let now = 0
  const run = (s: GameState, ...a: ActionInput[]) => a.reduce((st, x) => reduce(st, { now: ++now, ...x } as never), s)
  const s = run(emptyState(0), { type: 'START_GAME', teams: Array.from({ length: teams }, (_, i) => ({ name: `E${i + 1}`, color: '', icon: '' })) })
  const goTo = (st: GameState, id: string) => {
    for (let i = 0; i < 30 && st.agenda[st.stepIndex]?.challenge !== id; i++) {
      st = run(st, { type: 'SKIP_STEP' })
      st = run(st, ...st.eventQueue.map((q) => ({ type: 'DISMISS_EVENT' as const, uid: q.uid })))
    }
    return st
  }
  return { s, run, goTo }
}

describe('inteligencia emocional', () => {
  it('es una competencia con 5 subcompetencias y la usan 7 retos (2 nuevos + 5 etiquetados)', () => {
    const subs = content.categories.filter((c) => c.parent === 'inteligencia-emocional').map((c) => c.label)
    expect(subs).toEqual(['Autoconciencia', 'Autorregulación', 'Empatía', 'Manejo emocional', 'Conciencia social'])
    const ie = content.challenges.filter((c) => c.categories.some((id) => id.startsWith('ie-'))).map((c) => c.code)
    expect(ie.sort()).toEqual(['03', '07', '09', '11', '12', 'IE1', 'IE2'].sort())
  })

  it('el filtro "Inteligencia emocional" en /admin incluye las subcompetencias', () => {
    const rows = applyFilters(buildRows(content, content), { ...EMPTY_FILTERS, category: 'inteligencia-emocional' })
    expect(rows.map((r) => r.code).sort()).toEqual(['03', '07', '09', '11', '12', 'IE1', 'IE2'].sort())
  })

  it('IE1 opción A: bandera y "La factura emocional" 3 retos después, sólo para ese equipo', () => {
    const { s: start, run, goTo } = game()
    let s = goTo(start, 'no-eres-tu-pero-te-pega')
    s = run(s, { type: 'RESOLVE', teamId: 't1', optionId: 'a' }, { type: 'RESOLVE', teamId: 't2', optionId: 'b' }, { type: 'RESOLVE', teamId: 't3', optionId: 'c' })
    expect(s.teams[0].flags).toContain('descarga_emocional')
    expect(s.teams.map((t) => t.indicators.equipo)).toEqual([45, 54, 52])
    const seen: string[] = []
    for (let i = 0; i < 4; i++) {
      s = run(s, { type: 'COMPLETE_STEP' })
      if (s.eventQueue.some((q) => q.event === 'la-factura-emocional')) seen.push(s.agenda[s.stepIndex].challenge)
      s = run(s, ...s.eventQueue.map((q) => ({ type: 'DISMISS_EVENT' as const, uid: q.uid })))
    }
    // IE1 → 04 → 05 → (aparece al iniciar el 06)
    expect(seen).toEqual(['nadie-tiene-todo'])
  })

  it('IE2 se califica por equipo con éxito / parcial / fallo', () => {
    const { s: start, run, goTo } = game()
    let s = goTo(start, 'la-persona-dificil')
    s = run(s, { type: 'RESOLVE', teamId: 't1', outcome: 'success' }, { type: 'RESOLVE', teamId: 't2', outcome: 'partial' }, { type: 'RESOLVE', teamId: 't3', outcome: 'fail' })
    expect(s.teams.map((t) => [t.indicators.equipo, t.indicators.liderazgo])).toEqual([[57, 55], [53, 52], [44, 46]])
  })
})

describe('eventos anclados a retos', () => {
  it('"Todo urge" sigue apareciendo justo después del reto 04 aunque haya un reto nuevo antes', () => {
    const { s: start, run, goTo } = game()
    let s = run(start, { type: 'ADJUST', teamId: 't1', indicator: 'recursos', delta: -10 })
    s = goTo(s, 'cinco-pendientes')
    s = run(s, { type: 'COMPLETE_STEP' })
    expect(s.agenda[s.stepIndex].challenge).toBe('el-recorte')
    expect(s.eventQueue.map((q) => q.event)).toContain('todo-urge')
  })

  it('reordenar la agenda no descuadra los eventos', () => {
    let c = clone(content)
    // Movemos el reto 04 dos lugares antes: "Todo urge" lo sigue.
    c = moveInAgenda(c, 'cinco-pendientes', -1)
    c = moveInAgenda(c, 'cinco-pendientes', -1)
    expect(validateConfig(c).filter((i) => i.level === 'error')).toEqual([])
    const { s: start, run, goTo } = game(c)
    let s = run(start, { type: 'ADJUST', teamId: 't1', indicator: 'recursos', delta: -10 })
    s = goTo(s, 'cinco-pendientes')
    s = run(s, { type: 'COMPLETE_STEP' })
    expect(s.eventQueue.map((q) => q.event)).toContain('todo-urge')
  })

  it('valida anclas a retos inexistentes', () => {
    const c = clone(content)
    c.events.find((e) => e.id === 'todo-urge')!.afterChallenge = 'no-existe'
    expect(validateConfig(c).some((i) => i.level === 'error' && /reto desconocido "no-existe"/.test(i.message))).toBe(true)
  })
})
