import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { GameContent } from '../engine/types'
import { countChanges, type ItemSection } from './diff'
import {
  baseConfig,
  clearDraft,
  clearSnapshot,
  clone,
  loadDraft,
  loadSnapshot,
  saveDraft,
  saveSnapshot,
  type DraftRecord,
  type SnapshotRecord,
} from './storage'
import { validateConfig, type Issue } from './validate'

export type SaveStatus = 'clean' | 'saving' | 'saved'
export type AdminView = 'summary' | ItemSection | 'general' | 'config' | 'validation'

export interface PreviewRequest {
  kind: 'challenge' | 'event'
  id: string
  mode: 'participant' | 'facilitator' | 'admin'
}

export interface Selection {
  view: AdminView
  id?: string
}

interface AdminValue {
  base: GameContent
  draft: GameContent
  record: DraftRecord | null
  snapshot: SnapshotRecord | null
  status: SaveStatus
  changes: number
  issues: Issue[]
  selection: Selection
  select: (s: Selection) => void
  /** Edita el borrador: `fn` recibe una copia que puede mutar. */
  edit: (fn: (draft: GameContent) => void) => void
  replace: (content: GameContent) => void
  restoreAll: () => void
  /** Congela el borrador para la próxima partida. Devuelve los errores si no se pudo. */
  applySnapshot: () => Issue[]
  discardSnapshot: () => void
  preview: PreviewRequest | null
  setPreview: (p: PreviewRequest | null) => void
}

const AdminCtx = createContext<AdminValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const base = useMemo(() => baseConfig(), [])
  const [record, setRecord] = useState<DraftRecord | null>(() => loadDraft())
  const [draft, setDraft] = useState<GameContent>(() => record?.content ?? baseConfig())
  const [snapshot, setSnapshot] = useState<SnapshotRecord | null>(() => loadSnapshot())
  const [status, setStatus] = useState<SaveStatus>('clean')
  const [selection, select] = useState<Selection>({ view: 'summary' })
  const [preview, setPreview] = useState<PreviewRequest | null>(null)
  const dirty = useRef(false)
  const recordRef = useRef(record)
  useEffect(() => {
    recordRef.current = record
  }, [record])

  // Autoguardado: medio segundo después del último cambio.
  useEffect(() => {
    if (!dirty.current) return
    const t = window.setTimeout(() => {
      dirty.current = false
      setRecord(saveDraft(draft, recordRef.current))
      setStatus('saved')
    }, 500)
    return () => window.clearTimeout(t)
  }, [draft])

  const edit = useCallback((fn: (d: GameContent) => void) => {
    setDraft((prev) => {
      const next = clone(prev)
      fn(next)
      return next
    })
    dirty.current = true
    setStatus('saving')
  }, [])

  const replace = useCallback((content: GameContent) => {
    setDraft(clone(content))
    dirty.current = true
    setStatus('saving')
  }, [])

  const restoreAll = useCallback(() => {
    clearDraft()
    dirty.current = false
    setRecord(null)
    setDraft(baseConfig())
    setStatus('clean')
  }, [])

  const issues = useMemo(() => validateConfig(draft), [draft])
  const changes = useMemo(() => countChanges(base, draft), [base, draft])

  const applySnapshot = useCallback(() => {
    const errors = validateConfig(draft).filter((i) => i.level === 'error')
    if (errors.length) return errors
    const saved = dirty.current ? saveDraft(draft, recordRef.current) : recordRef.current
    if (dirty.current) {
      dirty.current = false
      setRecord(saved)
      setStatus('saved')
    }
    setSnapshot(saveSnapshot(draft, saved?.version ?? 0))
    return []
  }, [draft])

  const discardSnapshot = useCallback(() => {
    clearSnapshot()
    setSnapshot(null)
  }, [])

  const value: AdminValue = {
    base,
    draft,
    record,
    snapshot,
    status,
    changes,
    issues,
    selection,
    select,
    edit,
    replace,
    restoreAll,
    applySnapshot,
    discardSnapshot,
    preview,
    setPreview,
  }
  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminCtx)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de <AdminProvider>')
  return ctx
}
