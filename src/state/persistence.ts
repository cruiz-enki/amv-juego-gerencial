import type { GameState } from '../engine/types'

export interface PersistedGame {
  state: GameState
  /** Pila de deshacer (también se guarda para que funcione entre ventanas). */
  past: GameState[]
}

/**
 * Contrato de almacenamiento. Hoy: localStorage. Mañana: un adaptador de
 * Supabase que implemente la misma interfaz, sin tocar el resto de la app.
 */
export interface GameStorage {
  load(): PersistedGame | null
  save(game: PersistedGame): boolean
  clear(): void
  /** Avisa cuando OTRA ventana guarda (p. ej. el panel del facilitador). */
  subscribe(listener: (game: PersistedGame | null) => void): () => void
}

// Cambiar la versión invalida partidas guardadas con un formato anterior.
const KEY = 'punto-critico:partida:v2'

function isValid(value: unknown): value is PersistedGame {
  if (!value || typeof value !== 'object') return false
  const { state, past } = value as Partial<PersistedGame>
  return (
    !!state &&
    state.version === 2 &&
    Array.isArray(state.teams) &&
    Array.isArray(state.agenda) &&
    Array.isArray(state.history) &&
    Array.isArray(past)
  )
}

function parse(raw: string | null): PersistedGame | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isValid(parsed)) return parsed
    console.warn('[partida] formato guardado no reconocido; se ignora')
  } catch (err) {
    console.warn('[partida] guardado corrupto; se ignora', err)
  }
  return null
}

export const localGameStorage: GameStorage = {
  load() {
    try {
      return parse(window.localStorage.getItem(KEY))
    } catch {
      return null
    }
  },
  save(game) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(game))
      return true
    } catch (err) {
      console.error('[partida] no se pudo guardar', err)
      return false
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* modo privado: nada que borrar */
    }
  },
  subscribe(listener) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) listener(parse(e.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },
}

/** Descarga la partida como JSON (respaldo manual del facilitador). */
export function downloadBackup(game: PersistedGame) {
  const blob = new Blob([JSON.stringify(game.state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `punto-critico-${new Date(game.state.updatedAt).toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(text: string): GameState | null {
  try {
    const state = JSON.parse(text) as GameState
    return isValid({ state, past: [] }) ? state : null
  } catch {
    return null
  }
}
