import { describe, expect, it } from 'vitest'
import { evaluate } from './conditions'
import { createReducer, emptyState, remainingSeconds, type ActionInput, type GameAction } from './reducer'
import { computeAwards, summarizeTeam } from './results'
import { resolvers } from './selectors'
import type { GameContent, GameState } from './types'

const content: GameContent = {
  config: {
    title: 'Test',
    subtitle: '',
    premise: '',
    teams: { min: 2, max: 6, default: 2 },
    agenda: [{ challenge: 'c1' }, { challenge: 'c2', turnMode: 'all-teams' }, { challenge: 'c3' }, { challenge: 'c4' }],
    defaultTurnMode: 'active-team',
    targetMinutes: 90,
    publicEffects: 'qualitative',
    closing: { title: '', lines: [], finale: { title: '', lines: [], signoff: '' } },
  },
  flags: [{ id: 'presion', label: 'Presión' }],
  indicators: [
    { id: 'res', label: 'Resultados', icon: '', description: '', color: '', min: 0, max: 100, initial: 50, danger: 30 },
    { id: 'eq', label: 'Equipo', icon: '', description: '', color: '', min: 0, max: 100, initial: 50, danger: 30 },
  ],
  categories: [],
  chapters: [{ id: 'ch', label: 'Mañana', marker: '08:00' }],
  resources: [{ id: 'joker', label: 'Comodín', icon: '', initial: 1 }],
  challenges: [
    {
      id: 'c1',
      title: 'Decisión',
      type: 'decision',
      categories: [],
      chapter: 'ch',
      narrative: '',
      options: [
        {
          id: 'a',
          label: 'A',
          feedback: '',
          effect: { indicators: { res: 30, eq: -25 }, setFlags: ['presion'], schedule: [{ event: 'late', afterSteps: 2 }] },
        },
        { id: 'b', label: 'B', feedback: '', effect: { indicators: { eq: 80 } } },
      ],
      facilitator: { notes: '' },
    },
    {
      id: 'c2',
      title: 'Abierto',
      type: 'open',
      categories: [],
      chapter: 'ch',
      narrative: '',
      durationSec: 60,
      outcomes: {
        success: { effect: { indicators: { res: 5 } }, feedback: '' },
        fail: { effect: { indicators: { res: -5 } }, feedback: '' },
        rigid: { tone: 'fail', effect: { indicators: { eq: -7 } } },
      },
      bonuses: [
        { id: 'deal', label: 'Acuerdo', effect: { indicators: { eq: 4 } } },
        { id: 'pa', group: 'prov', label: 'A', effect: { schedule: [{ event: 'late', afterSteps: 0 }] } },
        { id: 'pb', group: 'prov', label: 'B', effect: { indicators: { res: -5 } } },
      ],
      facilitator: { notes: '' },
    },
    {
      id: 'c3',
      title: 'Sólo con flag',
      type: 'decision',
      categories: [],
      chapter: 'ch',
      narrative: '',
      conditions: { flag: 'nunca' },
      options: [{ id: 'a', label: 'A', feedback: '', effect: {} }],
      facilitator: { notes: '' },
    },
    {
      id: 'c4',
      title: 'Final',
      type: 'decision',
      categories: [],
      chapter: 'ch',
      narrative: '',
      options: [{ id: 'a', label: 'A', feedback: '', effect: { injectChallenge: 'c2' } }],
      facilitator: { notes: '' },
    },
  ],
  events: [
    { id: 'low-team', kind: 'conditional', title: 'Equipo bajo', tone: 'negative', narrative: '', trigger: { indicator: 'eq', op: '<', value: 40 }, effect: { indicators: { res: -10 } } },
    { id: 'late', kind: 'consequence', title: 'Consecuencia', tone: 'crisis', narrative: '', effect: { indicators: { eq: -5 } } },
    { id: 'storm', kind: 'surprise', title: 'Tormenta', tone: 'crisis', narrative: '', effect: { target: 'all', resources: { joker: -1 } } },
    {
      id: 'choice',
      kind: 'surprise',
      title: 'Con respuesta',
      tone: 'negative',
      narrative: '',
      effect: { indicators: { eq: -7 } },
      options: [{ id: 'fix', label: 'Recuperar', effect: { indicators: { res: -2, eq: 3 } } }],
    },
    { id: 'windowed', kind: 'conditional', title: 'Ventana', tone: 'neutral', narrative: '', trigger: { indicator: 'res', op: '>', value: 0 }, minStep: 2, maxStep: 2, effect: {} },
  ],
  profiles: [
    { id: 'people', title: 'Personas', description: '', icon: '', match: { indicator: 'eq', op: '>=', value: 90 } },
    { id: 'default', title: 'Respaldo', description: '', icon: '' },
  ],
  awards: [{ id: 'best-eq', title: 'Equipo', icon: '', description: '', metric: { kind: 'highest', indicator: 'eq' } }],
  teamPresets: [],
}

const reduce = createReducer(content)
let clock = 1000
const run = (state: GameState, ...actions: ActionInput[]) =>
  actions.reduce((s, a) => reduce(s, { now: (clock += 1000), ...a } as GameAction), state)

function start() {
  return run(emptyState(0), {
    type: 'START_GAME',
    teams: [
      { name: 'Alfa', color: 'red', icon: 'A' },
      { name: 'Beta', color: 'blue', icon: 'B' },
    ],
  })
}

describe('motor de juego', () => {
  it('crea equipos con valores iniciales y agenda', () => {
    const s = start()
    expect(s.teams).toHaveLength(2)
    expect(s.teams[0].indicators).toEqual({ res: 50, eq: 50 })
    expect(s.teams[0].resources).toEqual({ joker: 1 })
    expect(s.agenda.map((a) => a.turnMode)).toEqual(['active-team', 'all-teams', 'active-team', 'active-team'])
    expect(s.screen).toBe('dashboard')
  })

  it('aplica efectos con límites, flags e historial', () => {
    const s = run(start(), { type: 'OPEN_STEP' }, { type: 'RESOLVE', teamId: 't1', optionId: 'a' })
    const alfa = s.teams[0]
    expect(alfa.indicators).toEqual({ res: 80, eq: 25 })
    expect(alfa.flags).toContain('presion')
    expect(s.history.at(-1)).toMatchObject({ teamId: 't1', challenge: 'c1', optionId: 'a', before: { res: 50, eq: 50 } })
    // No se puede responder dos veces el mismo paso.
    expect(run(s, { type: 'RESOLVE', teamId: 't1', optionId: 'b' }).teams[0]).toEqual(alfa)
    // Sólo el equipo activo responde en modo active-team.
    expect(run(s, { type: 'RESOLVE', teamId: 't2', optionId: 'b' }).teams[1].indicators.eq).toBe(50)
  })

  it('limita indicadores al máximo', () => {
    const s = run(start(), { type: 'RESOLVE', teamId: 't1', optionId: 'b' })
    expect(s.teams[0].indicators.eq).toBe(100)
  })

  it('rota equipo activo y dispara eventos condicionales', () => {
    const s = run(start(), { type: 'RESOLVE', teamId: 't1', optionId: 'a' }, { type: 'COMPLETE_STEP' })
    expect(s.stepIndex).toBe(1)
    expect(s.activeTeamIndex).toBe(1)
    expect(s.eventQueue.map((q) => [q.event, q.teamId])).toEqual([['low-team', 't1']])
    const applied = run(s, { type: 'APPLY_EVENT', uid: s.eventQueue[0].uid })
    expect(applied.teams[0].indicators.res).toBe(70)
    expect(applied.firedEvents).toContain('low-team:t1')
  })

  it('modo all-teams: cada equipo resuelve y se usa temporizador', () => {
    let s = run(start(), { type: 'RESOLVE', teamId: 't1', optionId: 'b' }, { type: 'COMPLETE_STEP' })
    expect(resolvers(s, content).map((t) => t.id)).toEqual(['t1', 't2'])
    expect(s.timer.durationSec).toBe(60)
    s = run(s, { type: 'TIMER_START', now: 10_000 })
    expect(remainingSeconds(s, 25_000)).toBe(45)
    s = run(s, { type: 'TIMER_PAUSE', now: 25_000 })
    expect(s.timer.remainingSec).toBe(45)
    s = run(s, { type: 'RESOLVE', teamId: 't1', outcome: 'success' }, { type: 'RESOLVE', teamId: 't2', outcome: 'fail' })
    expect(s.teams.map((t) => t.indicators.res)).toEqual([55, 45])
  })

  it('salta retos cuya condición no se cumple y programa consecuencias', () => {
    let s = run(start(), { type: 'RESOLVE', teamId: 't1', optionId: 'a' }, { type: 'COMPLETE_STEP' })
    s = run(s, ...s.eventQueue.map((q) => ({ type: 'DISMISS_EVENT' as const, uid: q.uid })))
    s = run(s, { type: 'COMPLETE_STEP' })
    // c3 requiere un flag que nadie tiene → se salta y se llega a c4.
    expect(s.agenda[2].status).toBe('skipped')
    expect(s.stepIndex).toBe(3)
    expect(s.eventQueue.some((q) => q.event === 'late' && q.reason === 'scheduled')).toBe(true)
  })

  it('inyecta retos y termina la partida', () => {
    let s = start()
    s = run(s, { type: 'SKIP_STEP' }, { type: 'SKIP_STEP' })
    expect(s.stepIndex).toBe(3)
    const team = resolvers(s, content)[0]
    s = run(s, { type: 'RESOLVE', teamId: team.id, optionId: 'a' })
    expect(s.agenda).toHaveLength(5)
    expect(s.agenda[4]).toMatchObject({ challenge: 'c2', injected: true, teamId: team.id })
    s = run(s, { type: 'COMPLETE_STEP' })
    expect(resolvers(s, content).map((t) => t.id)).toEqual([team.id])
    s = run(s, { type: 'SKIP_STEP' })
    s = run(s, ...s.eventQueue.map((q) => ({ type: 'DISMISS_EVENT' as const, uid: q.uid })))
    expect(s.status).toBe('finished')
    expect(s.screen).toBe('final')
  })

  it('eventos manuales a todos los equipos y ajustes manuales', () => {
    let s = run(start(), { type: 'FIRE_EVENT', event: 'storm', teamId: 'all' })
    s = run(s, { type: 'APPLY_EVENT', uid: s.eventQueue[0].uid })
    expect(s.teams.map((t) => t.resources.joker)).toEqual([0, 0])
    s = run(s, { type: 'ADJUST', teamId: 't2', indicator: 'eq', delta: 45 })
    expect(s.teams[1].indicators.eq).toBe(95)
    expect(s.history.at(-1)?.kind).toBe('manual')
  })

  it('perfiles y reconocimientos', () => {
    const s = run(start(), { type: 'ADJUST', teamId: 't2', indicator: 'eq', delta: 45 })
    expect(summarizeTeam(s.teams[1], s, content).profile?.id).toBe('people')
    expect(summarizeTeam(s.teams[0], s, content).profile?.id).toBe('default')
    expect(computeAwards(s, content)[0].winners.map((t) => t.id)).toEqual(['t2'])
  })

  it('evalúa condiciones compuestas', () => {
    const s = run(start(), { type: 'RESOLVE', teamId: 't1', optionId: 'a' })
    const t = s.teams[0]
    expect(evaluate({ all: [{ flag: 'presion' }, { indicator: 'res', op: '>', value: 75 }] }, t, s)).toBe(true)
    expect(evaluate({ chose: { challenge: 'c1', option: 'a' } }, t, s)).toBe(true)
    expect(evaluate({ not: { completed: 'c1' } }, t, s)).toBe(false)
    expect(evaluate({ any: [{ flag: 'x' }, { resource: 'joker', op: '==', value: 1 }] }, t, s)).toBe(true)
  })

  it('eventos con respuesta: suman efecto automático + opción', () => {
    let s = run(start(), { type: 'FIRE_EVENT', event: 'choice', teamId: 't1' })
    s = run(s, { type: 'APPLY_EVENT', uid: s.eventQueue[0].uid, optionId: 'fix' })
    expect(s.teams[0].indicators).toEqual({ res: 48, eq: 46 })
  })

  it('bonos: una vez por equipo, excluyentes por grupo y programan mini eventos', () => {
    let s = run(start(), { type: 'COMPLETE_STEP' })
    s = run(s, ...s.eventQueue.map((q) => ({ type: 'DISMISS_EVENT' as const, uid: q.uid })))
    s = run(s, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'deal' }, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'deal' })
    expect(s.teams[0].indicators.eq).toBe(54)
    s = run(s, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'pa' }, { type: 'APPLY_BONUS', teamId: 't1', bonusId: 'pb' })
    expect(s.teams[0].indicators.res).toBe(50)
    s = run(s, { type: 'RESOLVE', teamId: 't2', outcome: 'rigid' })
    expect(s.teams[1].indicators.eq).toBe(43)
    s = run(s, { type: 'COMPLETE_STEP' })
    expect(s.eventQueue.map((q) => [q.event, q.teamId])).toContainEqual(['late', 't1'])
  })

  it('maxStep acota eventos condicionales y spread mide el equilibrio', () => {
    let s = run(start(), { type: 'SKIP_STEP' })
    expect(s.eventQueue.some((q) => q.event === 'windowed')).toBe(false)
    s = run(s, { type: 'SKIP_STEP' })
    expect(s.eventQueue.filter((q) => q.event === 'windowed')).toHaveLength(2)
    const t = run(start(), { type: 'ADJUST', teamId: 't1', indicator: 'res', delta: 15 })
    expect(evaluate({ spread: '<=', value: 15 }, t.teams[0], t)).toBe(true)
    expect(evaluate({ spread: '<', value: 15 }, t.teams[0], t)).toBe(false)
  })

  it('reconocimientos por retos específicos sólo cuentan a quien los jugó', () => {
    const c = { ...content, awards: [{ id: 'x', title: '', icon: '', description: '', metric: { kind: 'challengeGain' as const, challenges: ['c1'] } }] }
    const r = createReducer(c)
    let s = r(emptyState(0), { now: 1, type: 'START_GAME', teams: [{ name: 'A', color: '', icon: '' }, { name: 'B', color: '', icon: '' }] })
    expect(computeAwards(s, c)[0].winners).toEqual([])
    s = r(s, { now: 2, type: 'RESOLVE', teamId: 't1', optionId: 'b' })
    expect(computeAwards(s, c)[0].winners.map((t) => t.id)).toEqual(['t1'])
  })
})
