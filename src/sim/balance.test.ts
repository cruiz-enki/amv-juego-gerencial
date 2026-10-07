import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { content } from '../content'
import { runBalance } from './simulate'

/**
 * `npm test` corre una versión corta. `npm run balance` corre 1000 partidas por
 * estrategia y escribe docs/BALANCE_REPORT.md.
 */
const full = !!process.env.BALANCE
const games = full ? 1000 : 60

describe('balance', () => {
  it(`simula ${games} partidas por estrategia y cumple los objetivos`, () => {
    const report = runBalance(games)
    if (full) writeFileSync(new URL('../../docs/BALANCE_REPORT.md', import.meta.url), report.markdown)
    expect(report.unfinished).toBe(0)
    // Ningún perfil principal es imposible…
    // Con pocas partidas basta con que aparezca; la corrida completa exige > 0.5%.
    for (const p of content.profiles.slice(0, -1)) expect(report.profileShare.total[p.title], p.title).toBeGreaterThan(full ? 0.5 : 0)
    // …y ninguno es automático al jugar al azar.
    for (const p of content.profiles) expect(report.profileShare.aleatoria[p.title], p.title).toBeLessThan(60)
    // Todos los eventos ocurren alguna vez.
    for (const e of content.events) expect(report.eventShare[e.id], e.id).toBeGreaterThan(0)
  }, 120_000)
})
