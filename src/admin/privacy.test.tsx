import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EventModal } from '../components/EventModal'
import { TopBar } from '../components/TopBar'
import { content as base } from '../content'
import { createReducer } from '../engine/reducer'
import type { GameContent, GameState } from '../engine/types'
import { ChallengeScreen } from '../screens/ChallengeScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { GameContext, type GameContextValue } from '../state/context'
import { previewState } from './preview'
import { clone } from './storage'

/** Textos privados "trampa": nunca deben llegar al proyector. */
const SECRETS = ['NOTA_SECRETA', 'REFERENCIA_SECRETA', 'NOTA_OPCION', 'CRITERIO_SECRETO', 'BONO_SECRETO', 'MARCA_SECRETA', 'SECRETO_FIGURA', 'bandera_secreta', 'NOTA_EVENTO', 'Recomendada', 'Desaconsejada']
/** Revisa el HTML completo (incluye atributos como title) y, para números, el texto visible. */
function expectNoSecrets(html: string) {
  for (const secret of SECRETS) expect(html, secret).not.toContain(secret)
  const text = html.replace(/<[^>]+>/g, ' ')
  expect(text, 'efecto numérico').not.toMatch(/[-−+]\s?7\b/)
}

function secretContent(): GameContent {
  const c = clone(base)
  c.flags.push({ id: 'bandera_secreta', label: 'bandera_secreta' })
  const ch = c.challenges.find((x) => x.id === 'talento-dificil')!
  ch.facilitator = { notes: 'NOTA_SECRETA', reference: ['REFERENCIA_SECRETA'], debrief: ['NOTA_SECRETA'] }
  ch.options![0] = { ...ch.options![0], notes: 'NOTA_OPCION', recommendation: 'discouraged', effect: { indicators: { equipo: -7 }, setFlags: ['bandera_secreta'] } }
  ch.options![1].recommendation = 'recommended'
  ch.bonuses = [{ id: 'b', label: 'BONO_SECRETO', effect: {} }]
  ch.facilitatorFlags = [{ flag: 'bandera_secreta', label: 'MARCA_SECRETA' }]
  ch.secret = { title: 'SECRETO_FIGURA', body: 'SECRETO_FIGURA' }
  const open = c.challenges.find((x) => x.id === 'ventas-vs-operaciones')!
  open.outcomes!.success!.criteria = 'CRITERIO_SECRETO'
  open.facilitator.notes = 'NOTA_SECRETA'
  const ev = c.events.find((e) => e.id === 'todo-urge')!
  ev.facilitatorNotes = 'NOTA_EVENTO'
  ev.trigger = { flag: 'bandera_secreta' }
  return c
}

function render(content: GameContent, state: GameState, kind: 'challenge' | 'event') {
  const value: GameContextValue = {
    state,
    content,
    contentSource: 'snapshot',
    snapshot: null,
    startGame: () => {},
    dispatch: () => {},
    undo: () => {},
    canUndo: false,
    reset: () => {},
    load: () => {},
    saveFailed: false,
    hasSavedGame: true,
  }
  return renderToStaticMarkup(
    <GameContext.Provider value={value}>
      <TopBar onOpenFacilitator={() => {}} />
      {kind === 'challenge' ? <ChallengeScreen /> : <DashboardScreen />}
      <EventModal />
    </GameContext.Provider>,
  )
}

describe('privacidad del proyector', () => {
  it('un reto resuelto no muestra respuesta deseada, notas, banderas ni números', () => {
    const c = secretContent()
    const reduce = createReducer(c)
    let s = previewState(c, 'challenge', 'talento-dificil', 2)
    s = reduce(s, { type: 'RESOLVE', teamId: 't1', optionId: 'a', now: 1 })
    s = reduce(s, { type: 'RESOLVE', teamId: 't2', optionId: 'b', now: 2 })
    const html = render(c, { ...s, revealed: true }, 'challenge')
    expect(html).toContain('El talento difícil')
    expect(html).toContain('No intervienes')
    expect(html).toContain('▼') // la dirección del cambio sí se ve
    expectNoSecrets(html)
  })

  it('un reto abierto no muestra criterios de evaluación', () => {
    const c = secretContent()
    const html = render(c, previewState(c, 'challenge', 'ventas-vs-operaciones', 4), 'challenge')
    expect(html).toContain('Ventas vs. Operaciones')
    expectNoSecrets(html)
  })

  it('un evento no muestra su condición ni notas privadas', () => {
    const c = secretContent()
    const html = render(c, previewState(c, 'event', 'todo-urge', 4), 'event')
    expect(html).toContain('Todo urge')
    expectNoSecrets(html)
  })
})
