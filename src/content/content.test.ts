import { describe, expect, it } from 'vitest'
import { content, validateContent } from '.'

describe('contenido', () => {
  it('no tiene referencias rotas', () => {
    expect(validateContent(content)).toEqual([])
  })

  it('cubre el mínimo de retos mock pedidos', () => {
    const count = (cat: string) => content.challenges.filter((c) => c.categories.includes(cat)).length
    expect(count('liderazgo')).toBeGreaterThanOrEqual(2)
    expect(count('decisiones')).toBeGreaterThanOrEqual(2)
    expect(count('equipos')).toBeGreaterThanOrEqual(1)
    expect(count('negociacion')).toBeGreaterThanOrEqual(1)
    expect(content.challenges.some((c) => c.type === 'timed')).toBe(true)
    expect(content.events.length).toBeGreaterThanOrEqual(1)
  })
})
