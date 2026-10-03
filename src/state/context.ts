import { createContext } from 'react'
import type { ActionInput } from '../engine/reducer'
import type { GameContent, GameState } from '../engine/types'

export interface GameContextValue {
  state: GameState
  content: GameContent
  dispatch: (action: ActionInput) => void
  undo: () => void
  canUndo: boolean
  reset: () => void
  load: (state: GameState) => void
  saveFailed: boolean
  hasSavedGame: boolean
}

export const GameContext = createContext<GameContextValue | null>(null)
