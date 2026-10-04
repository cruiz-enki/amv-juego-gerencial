import { content as baseContent } from '../content'
import { createReducer, emptyState, type GameAction, type NewTeam } from '../engine/reducer'
import type { GameContent } from '../engine/types'
import type { PersistedGame } from './persistence'

const UNDO_LIMIT = 25
// Acciones que el facilitador puede deshacer con "Regresar".
const UNDOABLE = new Set<GameAction['type']>([
  'OPEN_STEP',
  'SET_ACTIVE_TEAM',
  'RESOLVE',
  'COMPLETE_STEP',
  'SKIP_STEP',
  'FIRE_EVENT',
  'APPLY_EVENT',
  'DISMISS_EVENT',
  'ADJUST',
  'TOGGLE_FLAG',
  'APPLY_BONUS',
  'FINISH',
])

export type Meta =
  | GameAction
  | { type: '@UNDO' }
  | { type: '@LOAD'; game: PersistedGame }
  | { type: '@RESET'; now: number }
  /** Inicia una partida congelando el contenido recibido (snapshot de /admin o base). */
  | { type: '@START'; now: number; teams: NewTeam[]; content: GameContent }

// Un reducer por contenido (la partida usa SIEMPRE el contenido con el que inició).
const reducers = new WeakMap<GameContent, ReturnType<typeof createReducer>>()
function reducerFor(content: GameContent) {
  let r = reducers.get(content)
  if (!r) reducers.set(content, (r = createReducer(content)))
  return r
}

export function gameContent(full: PersistedGame): GameContent {
  return full.content ?? baseContent
}

export function rootReducer(full: PersistedGame, action: Meta): PersistedGame {
  switch (action.type) {
    case '@UNDO': {
      const prev = full.past.at(-1)
      return prev ? { ...full, state: prev, past: full.past.slice(0, -1) } : full
    }
    case '@LOAD':
      return action.game
    case '@RESET':
      return { state: { ...emptyState(action.now), soundOn: full.state.soundOn }, past: [] }
    case '@START': {
      const content = structuredClone(action.content)
      const state = reducerFor(content)(
        { ...emptyState(action.now), soundOn: full.state.soundOn },
        { type: 'START_GAME', teams: action.teams, now: action.now },
      )
      return { state, past: [], content }
    }
    default: {
      const next = reducerFor(gameContent(full))(full.state, action)
      if (next === full.state) return full
      const past = UNDOABLE.has(action.type) ? [...full.past, full.state].slice(-UNDO_LIMIT) : full.past
      return { ...full, state: next, past }
    }
  }
}
