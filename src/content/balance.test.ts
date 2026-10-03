import { describe, expect, it } from 'vitest'
import { content } from '.'
import { createReducer, emptyState, type ActionInput } from '../engine/reducer'
import { summarizeTeam } from '../engine/results'
import { resolvers } from '../engine/selectors'
import type { GameState } from '../engine/types'

/**
 * Simulación de balance: juega muchas partidas con decisiones al azar y reporta
 * cómo se distribuyen perfiles, eventos e indicadores finales.
 * Ver el reporte:  BALANCE=1 npm test -- balance
 */
const reduce = createReducer(content)
const showReport = !!(globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.BALANCE

function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)
}

function playGame(seed: number, teams = 4, strategy: 'random' | 'best' = 'random') {
  const rand = rng(seed)
  let now = 0
  const run = (s: GameState, a: ActionInput) => reduce(s, { ...a, now: ++now } as never)
  let s = run(emptyState(0), {
    type: 'START_GAME',
    teams: Array.from({ length: teams }, (_, i) => ({ name: `E${i + 1}`, color: '', icon: '' })),
  })
  const fired: string[] = []
  for (let guard = 0; guard < 200 && s.status === 'playing'; guard++) {
    if (s.eventQueue.length) {
      const q = s.eventQueue[0]
      fired.push(q.event)
      const ev = content.events.find((e) => e.id === q.event)
      const opt = ev?.options?.[Math.floor(rand() * ev.options.length)]
      s = run(s, { type: 'APPLY_EVENT', uid: q.uid, optionId: opt?.id })
      continue
    }
    const ch = content.challenges.find((c) => c.id === s.agenda[s.stepIndex]?.challenge)
    if (!ch) break
    for (const team of resolvers(s, content)) {
      for (const f of ch.facilitatorFlags ?? []) if (rand() < 0.25) s = run(s, { type: 'TOGGLE_FLAG', teamId: team.id, flag: f.flag })
      const bonuses = ch.bonuses ?? []
      if (bonuses.length && rand() < 0.5) s = run(s, { type: 'APPLY_BONUS', teamId: team.id, bonusId: bonuses[Math.floor(rand() * bonuses.length)].id })
      const options = ch.options ?? []
      const outcomes = Object.keys(ch.outcomes ?? {})
      const net = (e?: { indicators?: Record<string, number | undefined> }) => Object.values(e?.indicators ?? {}).reduce<number>((a, b) => a + (b ?? 0), 0)
      const best = [...options].sort((a, b) => net(b.effect) - net(a.effect))[0]
      if (options.length)
        s = run(s, { type: 'RESOLVE', teamId: team.id, optionId: strategy === 'best' ? best.id : options[Math.floor(rand() * options.length)].id })
      else if (outcomes.length)
        s = run(s, { type: 'RESOLVE', teamId: team.id, outcome: strategy === 'best' ? outcomes[0] : outcomes[Math.floor(rand() * outcomes.length)] })
    }
    s = run(s, { type: 'COMPLETE_STEP' })
  }
  return { s, fired }
}

describe('balance (simulación)', () => {
  it('juega 300 partidas completas sin atorarse', () => {
    const profiles: Record<string, number> = {}
    const events: Record<string, number> = {}
    const finals: Record<string, number[]> = {}
    let teamsTotal = 0
    for (let g = 0; g < 300; g++) {
      const { s, fired } = playGame(g + 1)
      expect(s.status).toBe('finished')
      fired.forEach((e) => (events[e] = (events[e] ?? 0) + 1))
      for (const t of s.teams) {
        teamsTotal++
        const p = summarizeTeam(t, s, content).profile?.title ?? '?'
        profiles[p] = (profiles[p] ?? 0) + 1
        for (const [k, v] of Object.entries(t.indicators)) (finals[k] ??= []).push(v)
      }
    }
    if (showReport) {
      const { s: top } = playGame(7, 4, 'best')
      console.log('\nEQUIPO QUE SIEMPRE ELIGE LO MEJOR (techo):', JSON.stringify(top.teams[0].indicators), '→', summarizeTeam(top.teams[0], top, content).profile?.title)
      const pct = (n: number) => `${((n / teamsTotal) * 100).toFixed(1)}%`
      console.log('\nPERFILES (por equipo)')
      for (const [k, v] of Object.entries(profiles).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(28)} ${pct(v)}`)
      console.log('\nEVENTOS (veces por equipo)')
      for (const [k, v] of Object.entries(events).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(32)} ${pct(v)}`)
      console.log('\nINDICADORES FINALES  min / p25 / mediana / p75 / max')
      for (const [k, arr] of Object.entries(finals)) {
        const a = [...arr].sort((x, y) => x - y)
        const q = (p: number) => a[Math.floor(p * (a.length - 1))]
        console.log(`  ${k.padEnd(12)} ${[q(0), q(0.25), q(0.5), q(0.75), q(1)].join(' / ')}`)
      }
    }
  })
})
