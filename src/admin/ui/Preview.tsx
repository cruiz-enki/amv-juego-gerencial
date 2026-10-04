import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { CurrentChallenge } from '../../components/facilitator/CurrentChallenge'
import { NumericEffects } from '../../components/facilitator/NumericEffects'
import { EventModal } from '../../components/EventModal'
import { TopBar } from '../../components/TopBar'
import { createReducer, type ActionInput } from '../../engine/reducer'
import type { GameContent } from '../../engine/types'
import { eventKindLabel, OPTION_LETTERS, toneMeta } from '../../lib/labels'
import { ChallengeScreen } from '../../screens/ChallengeScreen'
import { DashboardScreen } from '../../screens/DashboardScreen'
import { GameContext, type GameContextValue } from '../../state/context'
import { useAdmin, type PreviewRequest } from '../AdminContext'
import { describeCondition } from '../describe'
import { findItem } from '../diff'
import { previewState } from '../preview'
import { Tabs } from './EditorParts'
import { Badge, Card, SmallButton } from './fields'

/** Contexto de juego aislado: usa el borrador y no toca la partida real. */
export function PreviewGame({ content, kind, id, teams = 4, children }: { content: GameContent; kind: 'challenge' | 'event'; id: string; teams?: number; children: ReactNode }) {
  const reduce = useMemo(() => createReducer(content), [content])
  const [state, setState] = useReducer(
    (_: ReturnType<typeof previewState>, next: ReturnType<typeof previewState>) => next,
    undefined,
    () => previewState(content, kind, id, teams),
  )
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  const value: GameContextValue = {
    state,
    content,
    contentSource: 'base',
    snapshot: null,
    startGame: () => {},
    dispatch: (a: ActionInput) => setState(reduce(stateRef.current, { now: Date.now(), ...a } as never)),
    undo: () => {},
    canUndo: false,
    reset: () => setState(previewState(content, kind, id, teams)),
    load: () => {},
    saveFailed: false,
    hasSavedGame: true,
  }
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

/** Escala una pantalla de 1920×1080 al ancho disponible (como el proyector). */
function ProjectorFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / 1920)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="w-full overflow-hidden rounded-xl border border-line-strong" style={{ height: 1080 * scale }}>
      <div className="relative bg-ink" style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

function ProjectorView({ kind }: { kind: 'challenge' | 'event' }) {
  return (
    <ProjectorFrame>
      <TopBar onOpenFacilitator={() => {}} />
      {kind === 'challenge' ? <ChallengeScreen /> : <DashboardScreen />}
      <EventModal />
    </ProjectorFrame>
  )
}

function EventFacilitatorView({ id }: { id: string }) {
  const { draft } = useAdmin()
  const ev = draft.events.find((e) => e.id === id)
  if (!ev) return null
  return (
    <Card title={`${toneMeta[ev.tone].icon} ${ev.title}`}>
      <ul className="grid gap-2 text-sm">
        <li><b>Tipo:</b> {eventKindLabel[ev.kind]} · {ev.effect.target === 'all' ? 'afecta a todos' : 'afecta a un equipo'} · {ev.repeatable ? 'repetible' : 'una vez por equipo'}</li>
        <li><b>Condición:</b> {ev.trigger ? describeCondition(ev.trigger, draft) : '—'}</li>
        <li><b>Momento:</b> {ev.minStep !== undefined ? `desde el reto ${ev.minStep + 1}` : 'cualquiera'}{ev.maxStep !== undefined ? ` hasta el reto ${ev.maxStep + 1}` : ''}</li>
        <li><b>Efecto automático:</b> <NumericEffects effect={ev.effect} /></li>
        {ev.options?.map((o, i) => (
          <li key={o.id}><b>Respuesta {OPTION_LETTERS[i]}:</b> {o.label} <NumericEffects effect={o.effect} /></li>
        ))}
        <li><b>🔒 Notas:</b> {ev.facilitatorNotes || '—'}</li>
      </ul>
    </Card>
  )
}

function AdminView({ req }: { req: PreviewRequest }) {
  const { draft, issues } = useAdmin()
  const item = findItem(draft, req.kind === 'challenge' ? 'challenges' : 'events', req.id)
  const own = issues.filter((i) => i.target?.id === req.id)
  return (
    <div className="grid gap-3">
      <Card title="Validación">
        {own.length ? (
          <ul className="grid gap-1 text-sm">{own.map((i, k) => <li key={k} className={i.level === 'error' ? 'text-danger' : 'text-accent-2'}>{i.level === 'error' ? '⛔' : '⚠️'} {i.message}</li>)}</ul>
        ) : (
          <p className="text-sm text-success">✅ Sin problemas.</p>
        )}
      </Card>
      <Card title="Datos completos (JSON)">
        <pre className="max-h-[60vh] overflow-auto rounded-lg bg-deep p-3 text-xs leading-relaxed">{JSON.stringify(item, null, 2)}</pre>
      </Card>
    </div>
  )
}

export function PreviewModal() {
  const { preview, setPreview, draft } = useAdmin()
  const [teams, setTeams] = useState(4)
  useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview, setPreview])
  if (!preview) return null
  const exists = !!findItem(draft, preview.kind === 'challenge' ? 'challenges' : 'events', preview.id)
  const key = `${preview.kind}-${preview.id}-${teams}-${JSON.stringify(findItem(draft, preview.kind === 'challenge' ? 'challenges' : 'events', preview.id)).length}`

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/70 backdrop-blur-sm" onClick={() => setPreview(null)}>
      <aside className="flex h-full w-[min(78rem,100vw)] flex-col border-l border-line-strong bg-deep shadow-2xl" onClick={(e) => e.stopPropagation()} aria-label="Vista previa">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
          <p className="font-display text-lg font-bold">Vista previa</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Equipos:</span>
            {[2, 4, 6].map((n) => (
              <SmallButton key={n} variant={teams === n ? 'primary' : 'default'} onClick={() => setTeams(n)}>{n}</SmallButton>
            ))}
            <SmallButton variant="ghost" onClick={() => setPreview(null)}>✕ Cerrar</SmallButton>
          </div>
        </header>
        <div className="px-5 pt-3">
          <Tabs
            value={preview.mode}
            onChange={(mode) => setPreview({ ...preview, mode })}
            tabs={[
              { id: 'participant', label: '👁 Como participante (proyector)' },
              { id: 'facilitator', label: '🎛️ Como facilitador' },
              { id: 'admin', label: '🗂️ Como admin' },
            ]}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {!exists ? (
            <p className="text-muted">El elemento ya no existe.</p>
          ) : preview.mode === 'admin' ? (
            <AdminView req={preview} />
          ) : (
            <PreviewGame key={key} content={draft} kind={preview.kind} id={preview.id} teams={teams}>
              {preview.mode === 'participant' ? (
                <>
                  <p className="mb-2 text-xs text-muted">Exactamente lo que verá el proyector (escalado de 1920×1080). Puedes hacer clic para probar respuestas; no afecta ninguna partida.</p>
                  <ProjectorView kind={preview.kind} />
                </>
              ) : preview.kind === 'challenge' ? (
                <div className="mx-auto max-w-2xl rounded-xl border border-line bg-ink">
                  <p className="px-5 pt-3 text-xs text-muted"><Badge tone="warning">Privado</Badge> Lo que ve el facilitador en su panel para este reto.</p>
                  <CurrentChallenge />
                </div>
              ) : (
                <EventFacilitatorView id={preview.id} />
              )}
            </PreviewGame>
          )}
        </div>
      </aside>
    </div>
  )
}
