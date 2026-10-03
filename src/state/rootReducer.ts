import { content } from '../content'
import { createReducer, emptyState, type GameAction } from '../engine/reducer'
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

const gameReducer = createReducer(content)

export function rootReducer(full: PersistedGame, action: Meta): PersistedGame {
  switch (action.type) {
    case '@UNDO': {
      const prev = full.past.at(-1)
      return prev ? { state: prev, past: full.past.slice(0, -1) } : full
    }
    case '@LOAD':
      return action.game
    case '@RESET':
      return { state: { ...emptyState(action.now), soundOn: full.state.soundOn }, past: [] }
    default: {
      const next = gameReducer(full.state, action)
      if (next === full.state) return full
      const past = UNDOABLE.has(action.type) ? [...full.past, full.state].slice(-UNDO_LIMIT) : full.past
      return { state: next, past }
    }
  }
}


