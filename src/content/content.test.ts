import { describe, expect, it } from 'vitest'
import { content, validateContent } from '.'

describe('contenido', () => {
  it('no tiene referencias rotas', () => {
    expect(validateContent(content)).toEqual([])
  })

  it('la agenda tiene los 15 retos del documento + 2 de inteligencia emocional, en orden', () => {
    const codes = content.config.agenda.map((a) => content.challenges.find((c) => c.id === a.challenge)?.code)
    expect(codes).toEqual(['01', '02', '03', 'IE1', '04', '05', '06', '07', '08', '09', 'IE2', '10', '11', '12', '13', '14', '15'])
  })

  it('suma ~90 minutos planeados', () => {
    const minutes = content.challenges.reduce((s, c) => s + (c.minutes ?? 0), 0)
    expect(minutes).toBeGreaterThanOrEqual(80)
    expect(minutes).toBeLessThanOrEqual(95)
  })

  it('el último perfil es el respaldo sin condición', () => {
    expect(content.profiles.at(-1)?.match).toBeUndefined()
  })
})
