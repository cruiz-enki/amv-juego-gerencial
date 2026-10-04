import { createContext } from 'react'
import type { SnapshotRecord } from '../admin/storage'
import type { ActionInput, NewTeam } from '../engine/reducer'
import type { GameContent, GameState } from '../engine/types'

export interface GameContextValue {
  state: GameState
  /** Contenido de la partida en curso; sin partida, el que usará la próxima. */
  content: GameContent
  /** De dónde sale `content`: la partida en curso, el snapshot de /admin o el código base. */
  contentSource: 'game' | 'snapshot' | 'base'
  snapshot: SnapshotRecord | null
  startGame: (teams: NewTeam[]) => void
  dispatch: (action: ActionInput) => void
  undo: () => void
  canUndo: boolean
  reset: () => void
  load: (state: GameState, content?: GameContent) => void
  saveFailed: boolean
  hasSavedGame: boolean
}

export const GameContext = createContext<GameContextValue | null>(null)
