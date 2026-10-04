import { useRef, useState } from 'react'
import { useGame } from '../../state/useGame'
import { useAdmin } from '../AdminContext'
import { buildExport, downloadJson, parseImport } from '../storage'
import { validateConfig, type Issue } from '../validate'
import { Badge, Card, SmallButton } from './fields'

const fmtDate = (t: number | undefined) =>
  t ? new Date(t).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export function IssueList({ issues, max = 200 }: { issues: Issue[]; max?: number }) {
  const { select } = useAdmin()
  if (!issues.length) return <p className="text-sm text-success">✅ Sin problemas.</p>
  return (
    <ul className="grid gap-1 text-sm">
      {issues.slice(0, max).map((i, k) => (
        <li key={k}>
          <button
            className={`text-left hover:underline ${i.level === 'error' ? 'text-danger' : 'text-accent-2'}`}
            onClick={() => i.target && select({ view: i.target.section, id: i.target.id })}
            disabled={!i.target}
          >
            {i.level === 'error' ? '⛔' : '⚠️'} {i.message}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function ValidationSection() {
  const { issues } = useAdmin()
  const errors = issues.filter((i) => i.level === 'error')
  const warnings = issues.filter((i) => i.level === 'warning')
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={<span>ERRORES <Badge tone={errors.length ? 'danger' : 'success'}>{errors.length}</Badge></span>}>
        <p className="mb-2 text-xs text-muted">Bloquean “Usar esta configuración en la próxima partida”.</p>
        <IssueList issues={errors} />
      </Card>
      <Card title={<span>ADVERTENCIAS <Badge tone={warnings.length ? 'warning' : 'success'}>{warnings.length}</Badge></span>}>
        <p className="mb-2 text-xs text-muted">No bloquean; conviene revisarlas.</p>
        <IssueList issues={warnings} />
      </Card>
    </div>
  )
}

export function ConfigSection() {
  const { base, draft, record, snapshot, changes, restoreAll, replace, discardSnapshot } = useAdmin()
  const { state, contentSource } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<{ ok: boolean; messages: string[] } | null>(null)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const { content, errors } = parseImport(await file.text())
    if (!content) return setImportResult({ ok: false, messages: errors })
    const issues = validateConfig(content)
    const errs = issues.filter((i) => i.level === 'error').map((i) => i.message)
    if (!window.confirm(`¿Reemplazar el borrador actual con "${file.name}"?${errs.length ? `\n\nOjo: tiene ${errs.length} error(es) que tendrás que corregir antes de usarla.` : ''}`)) return
    replace(content)
    setImportResult({ ok: true, messages: errs.length ? [`Importado con ${errs.length} error(es) por corregir:`, ...errs] : ['Importado correctamente.'] })
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="1 · Configuración base (código)">
          <p className="text-sm text-muted">El contenido original del repositorio. Nunca se modifica desde aquí.</p>
          <p className="mt-2 text-sm">{base.challenges.length} retos · {base.events.length} eventos · {base.profiles.length} perfiles</p>
        </Card>
        <Card title="2 · Borrador (lo que editas)">
          <ul className="grid gap-1 text-sm">
            <li>Versión local: <b>v{record?.version ?? 0}</b></li>
            <li>Última modificación: {fmtDate(record?.updatedAt)}</li>
            <li>Cambios respecto al original: <b>{changes}</b> campo(s)</li>
          </ul>
          <p className="mt-2 text-xs text-muted">Se guarda solo en este navegador (autoguardado).</p>
        </Card>
        <Card title="3 · Snapshot para la próxima partida">
          {snapshot ? (
            <ul className="grid gap-1 text-sm">
              <li>Creado: <b>{fmtDate(snapshot.createdAt)}</b></li>
              <li>Basado en el borrador v{snapshot.version}</li>
              <li className="text-success">La próxima partida usará esta configuración.</li>
            </ul>
          ) : (
            <p className="text-sm text-muted">No hay snapshot: la próxima partida usará la configuración base.</p>
          )}
          {snapshot && (
            <div className="mt-2">
              <SmallButton variant="danger" onClick={() => window.confirm('¿Quitar el snapshot? La próxima partida usará la configuración base.') && discardSnapshot()}>
                Quitar snapshot
              </SmallButton>
            </div>
          )}
        </Card>
      </div>

      {state.status !== 'setup' && (
        <p className="rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm">
          🎮 Hay una partida en curso ({contentSource === 'game' ? 'con su propia copia congelada de la configuración' : 'con la configuración base'}). Lo que cambies aquí
          <b> no la altera</b>; se aplicará hasta la siguiente partida, después de crear un snapshot.
        </p>
      )}

      <Card title="Exportar / importar">
        <div className="flex flex-wrap gap-2">
          <SmallButton variant="primary" onClick={() => downloadJson(`punto-critico-config-v${record?.version ?? 0}-${new Date().toISOString().slice(0, 10)}.json`, buildExport(draft))}>
            ⬇ Exportar configuración (JSON)
          </SmallButton>
          <SmallButton onClick={() => fileRef.current?.click()}>⬆ Importar configuración</SmallButton>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
        </div>
        <p className="mt-2 text-xs text-muted">El archivo incluye retos, eventos, perfiles, reconocimientos, indicadores, banderas y configuración general. Al importar se valida el esquema; si falla, no se aplica nada.</p>
        {importResult && (
          <div className={`mt-3 rounded-lg border p-3 text-sm ${importResult.ok ? 'border-success/40 text-success' : 'border-danger/40 text-danger'}`}>
            {!importResult.ok && <p className="mb-1 font-bold">No se importó. Problemas encontrados:</p>}
            <ul className="grid gap-0.5">
              {importResult.messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title="Restaurar">
        <p className="mb-2 text-sm text-muted">Descarta TODO el borrador y vuelve al contenido original del código. El snapshot (si existe) no se toca.</p>
        <SmallButton
          variant="danger"
          onClick={() => window.confirm('¿Restaurar TODA la configuración original? Se perderán todos los cambios del borrador.') && restoreAll()}
        >
          ↺ Restaurar toda la configuración original
        </SmallButton>
      </Card>
    </div>
  )
}
