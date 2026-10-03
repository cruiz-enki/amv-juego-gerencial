import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { content } from '../content'
import { emptyState, type ActionInput, type GameAction } from '../engine/reducer'
import { rootReducer } from './rootReducer'
import { GameContext, type GameContextValue } from './context'
import { localGameStorage, type GameStorage } from './persistence'

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
