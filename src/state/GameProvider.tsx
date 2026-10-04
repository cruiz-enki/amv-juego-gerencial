import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { nextGameContent, SNAPSHOT_KEY } from '../admin/storage'
import { emptyState, type ActionInput, type GameAction, type NewTeam } from '../engine/reducer'
import { gameContent, rootReducer } from './rootReducer'
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
  // Configuración para la PRÓXIMA partida (snapshot de /admin o base). Se relee si /admin la cambia.
  const [next, setNext] = useState(() => nextGameContent())
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === SNAPSHOT_KEY && setNext(nextGameContent())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
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

  const startGame = useCallback(
    (teams: NewTeam[]) => {
      // Se relee al iniciar: así siempre se usa el snapshot más reciente.
      const fresh = nextGameContent()
      setNext(fresh)
      rawDispatch({ type: '@START', now: Date.now(), teams, content: fresh.content })
    },
    [],
  )

  const inGame = full.state.status !== 'setup' && !!full.content
  const value = useMemo<GameContextValue>(
    () => ({
      state: full.state,
      content: full.state.status !== 'setup' ? gameContent(full) : next.content,
      contentSource: inGame ? 'game' : next.source,
      snapshot: next.snapshot,
      startGame,
      dispatch,
      undo: () => rawDispatch({ type: '@UNDO' }),
      canUndo: full.past.length > 0,
      reset: () => {
        storage.clear()
        rawDispatch({ type: '@RESET', now: Date.now() })
      },
      load: (state, content) => rawDispatch({ type: '@LOAD', game: { state, past: [], content: content ?? full.content } }),
      saveFailed,
      hasSavedGame: full.state.status !== 'setup',
    }),
    [full, dispatch, saveFailed, storage, next, startGame, inGame],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
