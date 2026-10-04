import { useState } from 'react'
import { useGame } from '../state/useGame'
import { AdminProvider, useAdmin, type AdminView } from './AdminContext'
import { buildRows } from './rows'
import { ChallengeEditor } from './ui/ChallengeEditor'
import { FlagsSection, GeneralSection, IndicatorsSection } from './ui/CatalogSections'
import { ConfigSection, IssueList, ValidationSection } from './ui/ConfigSection'
import { ContentTable } from './ui/ContentTable'
import { EventEditor } from './ui/EventEditor'
import { Badge, SmallButton } from './ui/fields'
import { PreviewModal } from './ui/Preview'
import { AwardsSection, ProfilesSection } from './ui/ProfilesAwards'

export function AdminApp() {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  )
}

const when = (t: number | undefined) => (t ? new Date(t).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '')

function StatusPill() {
  const { status, record, changes } = useAdmin()
  if (status === 'saving') return <Badge tone="warning">Guardando…</Badge>
  if (status === 'saved') return <Badge tone="success">Guardado ✓ {when(record?.updatedAt)}</Badge>
  return <Badge>{changes ? `Guardado ✓ ${when(record?.updatedAt)}` : 'Sin cambios'}</Badge>
}

function SnapshotButton() {
  const { applySnapshot, snapshot } = useAdmin()
  const { state } = useGame()
  const [result, setResult] = useState<null | { ok: boolean; errors: ReturnType<typeof applySnapshot> }>(null)
  return (
    <>
      <button
        className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-ink shadow-[0_0_24px_rgb(56_225_255/0.35)] hover:brightness-110"
        onClick={() => {
          const errors = applySnapshot()
          setResult({ ok: errors.length === 0, errors })
        }}
      >
        ▶ USAR ESTA CONFIGURACIÓN EN LA PRÓXIMA PARTIDA
      </button>
      {result && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6" onClick={() => setResult(null)}>
          <div className="w-full max-w-xl rounded-2xl border border-line-strong bg-deep p-6" onClick={(e) => e.stopPropagation()}>
            {result.ok ? (
              <>
                <p className="font-display text-2xl font-bold text-success">✅ Snapshot creado</p>
                <p className="mt-2">
                  La <b>próxima partida</b> usará esta configuración (versión congelada {snapshot ? new Date(snapshot.createdAt).toLocaleString('es-MX') : ''}).
                </p>
                {state.status !== 'setup' && <p className="mt-2 text-sm text-muted">La partida que está en curso no cambia: tiene su propia copia.</p>}
                <p className="mt-2 text-sm text-muted">Si sigues editando, tendrás que volver a pulsar este botón para que los cambios lleguen al juego.</p>
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-bold text-danger">⛔ No se puede usar todavía</p>
                <p className="mt-1 mb-3 text-sm text-muted">Corrige estos errores (las advertencias no bloquean):</p>
                <IssueList issues={result.errors} />
              </>
            )}
            <div className="mt-5 flex justify-end">
              <SmallButton variant="primary" onClick={() => setResult(null)}>Entendido</SmallButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Sidebar() {
  const { draft, selection, select, issues } = useAdmin()
  const errors = issues.filter((i) => i.level === 'error').length
  const warnings = issues.length - errors
  const items: { view: AdminView; label: string; count?: number }[] = [
    { view: 'summary', label: '📋 Resumen' },
    { view: 'challenges', label: '🎯 Retos', count: draft.challenges.length },
    { view: 'events', label: '⚡ Eventos', count: draft.events.length },
    { view: 'profiles', label: '🧭 Perfiles', count: draft.profiles.length },
    { view: 'awards', label: '🏆 Reconocimientos', count: draft.awards.length },
    { view: 'indicators', label: '📊 Indicadores', count: draft.indicators.length },
    { view: 'flags', label: '⚑ Banderas', count: draft.flags.length },
    { view: 'general', label: '⚙️ General' },
    { view: 'config', label: '💾 Versiones e importar' },
  ]
  return (
    <nav className="flex flex-col gap-1 border-r border-line bg-deep/70 p-3" aria-label="Secciones">
      {items.map((it) => (
        <button
          key={it.view}
          onClick={() => select({ view: it.view  })}
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${selection.view === it.view ? 'bg-accent/15 text-text' : 'text-muted hover:bg-white/5 hover:text-text'}`}
        >
          {it.label}
          {it.count !== undefined && <span className="text-xs text-faint">{it.count}</span>}
        </button>
      ))}
      <button
        onClick={() => select({ view: 'validation'  })}
        className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${selection.view === ('validation' ) ? 'bg-accent/15' : 'hover:bg-white/5'}`}
      >
        ✔️ Validación
        <span className="flex gap-1">
          {errors > 0 && <Badge tone="danger">{errors}</Badge>}
          {warnings > 0 && <Badge tone="warning">{warnings}</Badge>}
          {errors + warnings === 0 && <Badge tone="success">OK</Badge>}
        </span>
      </button>
      <div className="mt-auto pt-6 text-xs text-faint">
        <a href="/" className="text-accent hover:underline">← Ir al juego</a>
      </div>
    </nav>
  )
}

function Stat({ value, label, sub }: { value: number | string; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/70 p-4">
      <p className="font-display text-4xl font-bold">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}

function Summary() {
  const { draft, base, issues, changes } = useAdmin()
  const rows = buildRows(draft, base)
  const active = (list: { active?: boolean }[]) => list.filter((x) => x.active !== false).length
  const agendaActive = draft.config.agenda.filter((a) => draft.challenges.find((c) => c.id === a.challenge)?.active !== false)
  const minutes = agendaActive.reduce((s, a) => s + (draft.challenges.find((c) => c.id === a.challenge)?.minutes ?? 0), 0)
  const multi = agendaActive.filter((a) => (draft.challenges.find((c) => c.id === a.challenge)?.turnMode ?? draft.config.defaultTurnMode) !== 'active-team').length
  const modified = rows.filter((r) => r.status !== 'same').length
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Stat value={draft.challenges.length} label="Retos" sub={`${active(draft.challenges)} activos · ${agendaActive.length} en agenda`} />
        <Stat value={draft.events.length} label="Eventos" sub={`${active(draft.events)} activos`} />
        <Stat value={draft.profiles.length} label="Perfiles" sub={`${active(draft.profiles)} activos`} />
        <Stat value={draft.awards.length} label="Reconocimientos" sub={`${active(draft.awards)} activos`} />
        <Stat value={draft.indicators.length} label="Indicadores" />
        <Stat value={draft.flags.length} label="Banderas" />
        <Stat value={minutes} label="Minutos planeados" sub={`${multi} de ${agendaActive.length} retos multi-equipo`} />
        <Stat value={modified} label="Elementos modificados" sub={`${changes} campo(s) · ${issues.filter((i) => i.level === 'error').length} errores`} />
      </div>
      <ContentTable />
    </div>
  )
}

function Main() {
  const { selection } = useAdmin()
  const v = selection.view 
  const titles: Record<string, string> = {
    summary: 'Todo el contenido',
    challenges: 'Retos',
    events: 'Eventos',
    profiles: 'Perfiles finales',
    awards: 'Reconocimientos',
    indicators: 'Indicadores',
    flags: 'Banderas',
    general: 'Configuración general',
    config: 'Versiones, importar y exportar',
    validation: 'Validación',
  }
  const editing = (v === 'challenges' || v === 'events') && selection.id
  return (
    <main className="min-w-0 overflow-y-auto">
      {editing ? (
        <div className="grid xl:grid-cols-[20rem_minmax(0,1fr)]">
          <CompactList kind={v === 'challenges' ? 'challenge' : 'event'} />
          <div className="min-w-0 px-5 pb-10">
            {v === 'challenges' ? <ChallengeEditor key={selection.id} id={selection.id!} /> : <EventEditor key={selection.id} id={selection.id!} />}
          </div>
        </div>
      ) : (
        <div className="px-6 py-5">
          <h1 className="mb-4 font-display text-3xl font-bold">{titles[v]}</h1>
          {v === 'summary' && <Summary />}
          {v === 'challenges' && <ContentTable fixedKind="challenge" />}
          {v === 'events' && <ContentTable fixedKind="event" />}
          {v === 'profiles' && <ProfilesSection />}
          {v === 'awards' && <AwardsSection />}
          {v === 'indicators' && <IndicatorsSection />}
          {v === 'flags' && <FlagsSection />}
          {v === 'general' && <GeneralSection />}
          {v === 'config' && <ConfigSection />}
          {v === 'validation' && <ValidationSection />}
        </div>
      )}
    </main>
  )
}

/** Lista angosta para saltar entre elementos mientras se edita. */
function CompactList({ kind }: { kind: 'challenge' | 'event' }) {
  const { draft, base, selection, select } = useAdmin()
  const rows = buildRows(draft, base).filter((r) => r.kind === kind)
  return (
    <aside className="hidden max-h-[calc(100vh-4rem)] overflow-y-auto border-r border-line xl:sticky xl:top-0 xl:block">
      {rows.map((r) => (
        <button
          key={r.id}
          onClick={() => select({ view: kind === 'challenge' ? 'challenges' : 'events', id: r.id })}
          className={`flex w-full items-start gap-2 border-b border-line px-3 py-2 text-left text-sm ${selection.id === r.id ? 'bg-accent/15' : 'hover:bg-white/5'} ${r.active ? '' : 'opacity-50'}`}
        >
          <span className="w-7 shrink-0 font-display font-bold text-accent">{r.code}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{r.title}</span>
            <span className="block truncate text-xs text-muted">{r.when}</span>
          </span>
          {r.status !== 'same' && <span className="text-accent-2" title={r.status === 'new' ? 'Nuevo' : 'Modificado'}>●</span>}
        </button>
      ))}
    </aside>
  )
}

function AdminLayout() {
  const { record, snapshot, changes } = useAdmin()
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] text-base">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink/90 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-8" />
          <div>
            <p className="font-display text-lg leading-tight font-bold">Punto Crítico · Administración de contenido</p>
            <p className="text-xs text-muted">
              Borrador v{record?.version ?? 0} · {changes} cambio(s) vs. original ·{' '}
              {snapshot ? `Snapshot para la próxima partida: ${new Date(snapshot.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} (v${snapshot.version})` : 'Sin snapshot: la próxima partida usa el original'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill />
          <SnapshotButton />
        </div>
      </header>
      <div className="grid min-h-0 grid-cols-[13rem_minmax(0,1fr)]">
        <Sidebar />
        <Main />
      </div>
      <PreviewModal />
    </div>
  )
}
