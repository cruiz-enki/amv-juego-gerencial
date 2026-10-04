import type { ReactNode } from 'react'
import { useAdmin } from '../AdminContext'
import { diffItem, findItem, itemStatus, type ItemSection } from '../diff'
import { deleteItem, restoreItem } from '../operations'
import { Badge, SmallButton } from './fields'

export type PreviewMode = 'participant' | 'facilitator' | 'admin'

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; badge?: ReactNode }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${value === t.id ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text'}`}
        >
          {t.label} {t.badge}
        </button>
      ))}
    </div>
  )
}

/** Encabezado común de retos y eventos: estado, preview, duplicar, restaurar. */
export function ItemHeader({
  section,
  id,
  title,
  subtitle,
  onPreview,
  onDuplicate,
  extra,
}: {
  section: ItemSection
  id: string
  title: string
  subtitle?: ReactNode
  onPreview: (mode: PreviewMode) => void
  onDuplicate?: () => void
  extra?: ReactNode
}) {
  const { base, draft, replace, select, issues } = useAdmin()
  const status = itemStatus(base, draft, section, id)
  const own = issues.filter((i) => i.target?.id === id)
  const errors = own.filter((i) => i.level === 'error').length
  const warnings = own.length - errors
  return (
    <header className="sticky top-0 z-10 -mx-5 mb-4 border-b border-line bg-ink/95 px-5 pt-1 pb-3 backdrop-blur">
      <button className="mb-1 text-sm text-muted hover:text-text" onClick={() => select({ view: section })}>
        ← Volver al listado
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl font-bold">{title || '(sin título)'}</h2>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-mono">{id}</span>
            {subtitle}
            {status === 'modified' && <Badge tone="warning">Modificado</Badge>}
            {status === 'new' && <Badge tone="accent">Nuevo</Badge>}
            {errors > 0 && <Badge tone="danger">{errors} error(es)</Badge>}
            {warnings > 0 && <Badge tone="warning">{warnings} advertencia(s)</Badge>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <SmallButton onClick={() => onPreview('participant')}>👁 Ver como participante</SmallButton>
          <SmallButton onClick={() => onPreview('facilitator')}>🎛️ Ver como facilitador</SmallButton>
          <SmallButton onClick={() => onPreview('admin')}>🗂️ Ver como admin</SmallButton>
          {onDuplicate && <SmallButton onClick={onDuplicate}>⧉ Duplicar</SmallButton>}
          {status === 'modified' && (
            <SmallButton variant="danger" onClick={() => window.confirm('¿Restaurar este elemento a su versión original?') && replace(restoreItem(draft, base, section, id))}>
              ↺ Restaurar este elemento
            </SmallButton>
          )}
          {status === 'new' && (
            <SmallButton
              variant="danger"
              onClick={() => {
                if (!window.confirm('¿Eliminar este elemento creado en admin?')) return
                replace(deleteItem(draft, base, section, id))
                select({ view: section })
              }}
            >
              🗑 Eliminar
            </SmallButton>
          )}
          {extra}
        </div>
      </div>
      {own.length > 0 && (
        <ul className="mt-2 grid gap-0.5 text-xs">
          {own.slice(0, 4).map((i, k) => (
            <li key={k} className={i.level === 'error' ? 'text-danger' : 'text-accent-2'}>
              {i.level === 'error' ? '⛔' : '⚠️'} {i.message}
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

/** Diferencias de un elemento contra el contenido original del código. */
export function DiffView({ section, id }: { section: ItemSection; id: string }) {
  const { base, draft } = useAdmin()
  const original = findItem(base, section, id)
  if (!original) return <p className="text-sm text-muted">Este elemento no existe en el contenido original: se creó en /admin.</p>
  const changes = diffItem(original, findItem(draft, section, id))
  if (!changes.length) return <p className="text-sm text-muted">Sin cambios respecto al original.</p>
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-deep text-xs text-muted uppercase">
          <tr>
            <th className="px-3 py-2">Campo</th>
            <th className="px-3 py-2">Original</th>
            <th className="px-3 py-2">Ahora</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.path} className="border-t border-line align-top">
              <td className="px-3 py-2 font-semibold">{c.label}</td>
              <td className="px-3 py-2 text-danger/90 line-through decoration-danger/40">{c.before}</td>
              <td className="px-3 py-2 text-success">{c.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
