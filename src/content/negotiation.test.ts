import { describe, expect, it } from 'vitest'
import { negotiationCards, negotiationSecret } from './negotiation'

describe('reto 06 · tarjetas de negociación', () => {
  it('hay seis tarjetas distintas', () => {
    expect(negotiationCards).toHaveLength(6)
    expect(negotiationSecret.cards).toHaveLength(6)
    const keys = negotiationCards.map((c) => `${[...c.has].sort()}|${[...c.needs].sort()}`)
    expect(new Set(keys).size).toBe(6)
  })

  it('ningún equipo puede cumplir su objetivo sin negociar', () => {
    for (const c of negotiationCards) for (const need of c.needs) expect(c.has).not.toContain(need)
  })

  it.each([2, 3, 4, 5, 6])('con %i equipos toda necesidad tiene al menos un proveedor', (n) => {
    const cards = negotiationCards.slice(0, n)
    cards.forEach((card, i) => {
      for (const need of card.needs) {
        const suppliers = cards.filter((other, j) => j !== i && other.has.includes(need))
        expect(suppliers.length, `tarjeta ${i + 1} necesita ${need}`).toBeGreaterThanOrEqual(1)
      }
    })
  })

  it('con 6 equipos no existe una única negociación obligatoria', () => {
    negotiationCards.forEach((card, i) => {
      for (const need of card.needs) {
        const suppliers = negotiationCards.filter((other, j) => j !== i && other.has.includes(need))
        expect(suppliers.length, `tarjeta ${i + 1} necesita ${need}`).toBeGreaterThanOrEqual(2)
      }
    })
  })
})
