import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { content } from '../content'
import { createReducer, emptyState, type ActionInput, type GameAction } from '../engine/reducer'
import { GameContext, type GameContextValue } from './context'
import { localGameStorage, type GameStorage, type PersistedGame } from './persistence'

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
  'FINISH',
])

type Meta =
  | GameAction
  | { type: '@UNDO' }
  | { type: '@LOAD'; game: PersistedGame }
  | { type: '@RESET'; now: number }

const gameReducer = createReducer(content)

function rootReducer(full: PersistedGame, action: Meta): PersistedGame {
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


export function GameProvider({ children, storage = localGameStorage }: { children: ReactNode; storage?: GameStorage }) {
  const [full, rawDispatch] = useReducer(rootReducer, undefined, () => {
    const saved = storage.load()
    // Una partida guardada nunca arranca en la portada: se retoma.
    if (saved && saved.state.status !== 'setup') return saved
    return { state: emptyState(Date.now()), past: [] }
  })
  const [saveFailed, setSaveFailed] = useState(false)
  const fromOtherWindow = useRef(false)

  useEffect(() => {
    if (fromOtherWindow.current) {
      fromOtherWindow.current = false
      return
    }
    if (full.state.status === 'setup' && full.state.teams.length === 0) return
    // El resultado viene de un sistema externo (localStorage): reflejarlo aquí es intencional.
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveFailed(!storage.save(full))
  }, [full, storage])

  useEffect(
    () =>
      storage.subscribe((game) => {
        fromOtherWindow.current = true
        rawDispatch(game ? { type: '@LOAD', game } : { type: '@RESET', now: Date.now() })
      }),
    [storage],
  )

  const dispatch = useCallback((action: ActionInput) => {
    rawDispatch({ now: Date.now(), ...action } as GameAction)
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      state: full.state,
      content,
      dispatch,
      undo: () => rawDispatch({ type: '@UNDO' }),
      canUndo: full.past.length > 0,
      reset: () => {
        storage.clear()
        rawDispatch({ type: '@RESET', now: Date.now() })
      },
      load: (state) => rawDispatch({ type: '@LOAD', game: { state, past: [] } }),
      saveFailed,
      hasSavedGame: full.state.status !== 'setup',
    }),
    [full, dispatch, saveFailed, storage],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
