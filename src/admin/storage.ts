import { content as baseContent } from '../content'
import type { GameContent } from '../engine/types'
import { checkSchema } from './validate'

/**
 * Tres niveles de configuración:
 * - BASE: el contenido del código (src/content). Nunca se modifica desde la app.
 * - BORRADOR (adminDraft): copia editable en /admin, con autoguardado.
 * - SNAPSHOT (activeGameConfigSnapshot): copia congelada que usará la PRÓXIMA partida.
 * Una partida, al iniciar, copia el snapshot dentro de su propio guardado; por eso
 * los cambios posteriores en /admin no la afectan.
 */
export const DRAFT_KEY = 'punto-critico:admin:draft:v1'
export const SNAPSHOT_KEY = 'punto-critico:admin:snapshot:v1'

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface DraftRecord {
  content: GameContent
  /** Versión local: aumenta con cada guardado. */
  version: number
  createdAt: number
  updatedAt: number
}

export interface SnapshotRecord {
  content: GameContent
  /** Versión del borrador con la que se creó. */
  version: number
  createdAt: number
}

export interface ExportFile {
  kind: 'punto-critico-config'
  formatVersion: 1
  exportedAt: string
  content: GameContent
}

function browserStore(): KeyValueStore | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function readJson<T>(store: KeyValueStore | null, key: string): T | null {
  if (!store) return null
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export const clone = <T,>(value: T): T => structuredClone(value)

export function baseConfig(): GameContent {
  return clone(baseContent)
}

export function loadDraft(store = browserStore()): DraftRecord | null {
  const draft = readJson<DraftRecord>(store, DRAFT_KEY)
  return draft && checkSchema(draft.content).length === 0 ? draft : null
}

export function saveDraft(content: GameContent, previous: DraftRecord | null, store = browserStore(), now = Date.now()): DraftRecord {
  const record: DraftRecord = {
    content,
    version: (previous?.version ?? 0) + 1,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
  store?.setItem(DRAFT_KEY, JSON.stringify(record))
  return record
}

export function clearDraft(store = browserStore()) {
  store?.removeItem(DRAFT_KEY)
}

export function loadSnapshot(store = browserStore()): SnapshotRecord | null {
  const snap = readJson<SnapshotRecord>(store, SNAPSHOT_KEY)
  return snap && checkSchema(snap.content).length === 0 ? snap : null
}

export function saveSnapshot(content: GameContent, version: number, store = browserStore(), now = Date.now()): SnapshotRecord {
  const record: SnapshotRecord = { content: clone(content), version, createdAt: now }
  store?.setItem(SNAPSHOT_KEY, JSON.stringify(record))
  return record
}

export function clearSnapshot(store = browserStore()) {
  store?.removeItem(SNAPSHOT_KEY)
}

/** Contenido con el que arrancará la próxima partida. */
export function nextGameContent(store = browserStore()): { content: GameContent; source: 'snapshot' | 'base'; snapshot: SnapshotRecord | null } {
  const snapshot = loadSnapshot(store)
  return snapshot ? { content: snapshot.content, source: 'snapshot', snapshot } : { content: baseContent, source: 'base', snapshot: null }
}

export function buildExport(content: GameContent, now = new Date()): ExportFile {
  return { kind: 'punto-critico-config', formatVersion: 1, exportedAt: now.toISOString(), content: clone(content) }
}

/** Lee un archivo exportado (o un contenido "crudo") y valida su esquema. */
export function parseImport(text: string): { content: GameContent | null; errors: string[] } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { content: null, errors: ['El archivo no es JSON válido.'] }
  }
  const candidate =
    data && typeof data === 'object' && 'content' in data ? (data as { content: unknown }).content : data
  if (data && typeof data === 'object' && 'kind' in data && (data as { kind: unknown }).kind !== 'punto-critico-config')
    return { content: null, errors: ['El archivo no es una configuración de Punto Crítico.'] }
  const errors = checkSchema(candidate)
  return errors.length ? { content: null, errors } : { content: candidate as GameContent, errors: [] }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
