import { useState } from 'react'
import type { EventKind, EventTone, GameContent, GameEvent } from '../../engine/types'
import { eventKindLabel, OPTION_LETTERS, toneMeta } from '../../lib/labels'
import { useAdmin } from '../AdminContext'
import { describeCondition } from '../describe'
import { duplicateEvent, nextOptionId, renameId } from '../operations'
import { ConditionEditor } from './ConditionEditor'
import { ConsequenceEditor, IndicatorDeltas, IndicatorHeader } from './EffectEditor'
import { DiffView, ItemHeader, Tabs } from './EditorParts'
import { Card, Field, NumberInput, Select, SmallButton, TextArea, TextInput, Toggle } from './fields'

type Tab = 'general' | 'content' | 'condition' | 'effects' | 'options' | 'changes'

function useEvent(id: string) {
  const { draft, edit } = useAdmin()
  const event = draft.events.find((e) => e.id === id)
  const up = (fn: (e: GameEvent, d: GameContent) => void) =>
    edit((d) => {
      const e = d.events.find((x) => x.id === id)
      if (e) fn(e, d)
    })
  return { event, up }
}

/** Quién programa este evento (para entender de dónde viene una consecuencia). */
function scheduledBy(content: GameContent, id: string): string[] {
  const out: string[] = []
  for (const c of content.challenges) {
    const sources = [
      ...(c.options ?? []).map((o) => [`opción ${o.id.toUpperCase()}`, o.effect] as const),
      ...Object.entries(c.outcomes ?? {}).map(([k, o]) => [`resultado "${o?.label ?? k}"`, o?.effect] as const),
      ...(c.bonuses ?? []).map((b) => [`bono "${b.label}"`, b.effect] as const),
    ]
    for (const [label, e] of sources)
      for (const s of e?.schedule ?? []) if (s.event === id) out.push(`Reto ${c.code ?? ''} "${c.title}" · ${label} → ${s.afterSteps === 0 ? 'al continuar' : `después de ${s.afterSteps} retos`}`)
  }
  for (const e of content.events) for (const s of e.effect.schedule ?? []) if (s.event === id) out.push(`Evento "${e.title}" → después de ${s.afterSteps} retos`)
  return out
}

export function EventEditor({ id }: { id: string }) {
  const { draft, replace, select, edit, setPreview } = useAdmin()
  const { event, up } = useEvent(id)
  const [tab, setTab] = useState<Tab>('general')
  const [newId, setNewId] = useState(id)
  if (!event) return <p className="text-muted">El evento no existe.</p>
  const sources = scheduledBy(draft, id)

  return (
    <div>
      <ItemHeader
        section="events"
        id={id}
        title={event.title}
        subtitle={<span>{eventKindLabel[event.kind]} · {toneMeta[event.tone].label}</span>}
        onPreview={(mode) => setPreview({ kind: 'event', id, mode })}
        onDuplicate={() => {
          const { content, newId: copy } = duplicateEvent(draft, id)
          replace(content)
          select({ view: 'events', id: copy })
        }}
      />
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'general', label: 'General' },
          { id: 'content', label: 'Contenido público' },
          { id: 'condition', label: 'Condición y momento' },
          { id: 'effects', label: 'Efectos y consecuencias' },
          { id: 'options', label: `Respuestas (${event.options?.length ?? 0})` },
          { id: 'changes', label: 'Ver cambios' },
        ]}
      />
      <div className="mt-4 grid gap-4">
        {tab === 'general' && (
          <Card title="Identidad">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Título" className="md:col-span-2">
                <TextInput value={event.title} onChange={(v) => up((e) => void (e.title = v))} />
              </Field>
              <Field label="ID interno" hint="Cambiarlo actualiza sus referencias.">
                <div className="flex gap-1.5">
                  <TextInput mono value={newId} onChange={(v) => setNewId(v.trim().toLowerCase().replace(/\s+/g, '-'))} />
                  <SmallButton
                    disabled={!newId || newId === id || draft.events.some((e) => e.id === newId)}
                    onClick={() => {
                      edit((d) => Object.assign(d, renameId(d, id, newId)))
                      select({ view: 'events', id: newId })
                    }}
                  >
                    Renombrar
                  </SmallButton>
                </div>
              </Field>
              <Field label="Tipo">
                <Select<EventKind> value={event.kind} onChange={(v) => up((e) => void (e.kind = v))} options={(Object.keys(eventKindLabel) as EventKind[]).map((k) => ({ value: k, label: eventKindLabel[k] }))} />
              </Field>
              <Field label="Tono">
                <Select<EventTone> value={event.tone} onChange={(v) => up((e) => void (e.tone = v))} options={(Object.keys(toneMeta) as EventTone[]).map((k) => ({ value: k, label: `${toneMeta[k].icon} ${toneMeta[k].label}` }))} />
              </Field>
              <Field label="Alcance">
                <Select
                  value={event.effect.target === 'all' ? 'all' : 'team'}
                  onChange={(v) => up((e) => void (e.effect.target = v === 'all' ? 'all' : undefined))}
                  options={[{ value: 'team', label: 'Un equipo' }, { value: 'all', label: 'Todos los equipos (global)' }]}
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              <Toggle checked={event.active !== false} onChange={(v) => up((e) => void (e.active = v))} label="Activo" />
              <Toggle checked={!event.repeatable} onChange={(v) => up((e) => void (e.repeatable = v ? undefined : true))} label="Ocurre una sola vez por equipo" />
            </div>
          </Card>
        )}
        {tab === 'content' && (
          <Card title="Lo que se proyecta">
            <div className="grid gap-3">
              <Field label="Narrativa">
                <TextArea rows={4} value={event.narrative} onChange={(v) => up((e) => void (e.narrative = v))} />
              </Field>
              <Field label="Pregunta rápida (opcional)">
                <TextInput value={event.question} onChange={(v) => up((e) => void (e.question = v || undefined))} />
              </Field>
              <Field label="Mensaje final / feedback (opcional)">
                <TextArea rows={2} value={event.takeaway} onChange={(v) => up((e) => void (e.takeaway = v || undefined))} />
              </Field>
              <Field label="🔒 Notas privadas del facilitador">
                <TextArea rows={3} value={event.facilitatorNotes} onChange={(v) => up((e) => void (e.facilitatorNotes = v || undefined))} />
              </Field>
            </div>
          </Card>
        )}
        {tab === 'condition' && (
          <>
            <Card title="Condición">
              {event.kind === 'conditional' ? (
                <ConditionEditor value={event.trigger} content={draft} onChange={(v) => up((e) => void (e.trigger = v))} emptyLabel="Falta definir la condición." />
              ) : (
                <p className="text-sm text-muted">
                  {event.kind === 'consequence' ? 'Este evento lo programa una decisión previa (consecuencia diferida).' : 'Este evento sólo lo activa el facilitador.'} Cambia el tipo a
                  “Condicional” para que aparezca solo cuando se cumpla una condición.
                </p>
              )}
            </Card>
            <Card title="Momento de aparición">
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Desde el reto número">
                  <NumberInput value={event.minStep === undefined ? undefined : event.minStep + 1} onChange={(v) => up((e) => void (e.minStep = v === undefined ? undefined : Math.max(0, v - 1)))} placeholder="cualquiera" />
                </Field>
                <Field label="Hasta el reto número">
                  <NumberInput value={event.maxStep === undefined ? undefined : event.maxStep + 1} onChange={(v) => up((e) => void (e.maxStep = v === undefined ? undefined : Math.max(0, v - 1)))} placeholder="cualquiera" />
                </Field>
              </div>
              <p className="mt-2 text-xs text-muted">El motor revisa las condiciones al iniciar cada reto (máximo un evento condicional por equipo por reto). “Desde el reto 11” = aparece después de terminar el reto 10.</p>
              {event.trigger && <p className="mt-2 text-sm">Resumen: aparece cuando {describeCondition(event.trigger, draft)}{event.minStep !== undefined ? `, desde el reto ${event.minStep + 1}` : ''}{event.maxStep !== undefined ? ` hasta el reto ${event.maxStep + 1}` : ''}.</p>}
            </Card>
            <Card title="Lo programan">
              {sources.length ? (
                <ul className="grid gap-1 text-sm">
                  {sources.map((s) => (
                    <li key={s}>⏳ {s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Ninguna decisión programa este evento.</p>
              )}
            </Card>
          </>
        )}
        {tab === 'effects' && (
          <>
            <Card title="Efecto automático sobre indicadores">
              <div className="grid gap-2">
                <IndicatorHeader content={draft} />
                <IndicatorDeltas effect={event.effect} content={draft} onChange={(eff) => up((e) => void (e.effect = { ...eff, target: e.effect.target }))} />
              </div>
            </Card>
            <Card title="Banderas y consecuencias">
              <ConsequenceEditor effect={event.effect} content={draft} onChange={(eff) => up((e) => void (e.effect = eff))} />
            </Card>
          </>
        )}
        {tab === 'options' && (
          <Card
            title="Respuestas del equipo (se suman al efecto automático)"
            actions={<SmallButton onClick={() => up((e) => void (e.options = [...(e.options ?? []), { id: nextOptionId(e.options ?? []), label: 'Nueva respuesta', effect: {} }]))}>+ Respuesta</SmallButton>}
          >
            {!event.options?.length && <p className="text-sm text-faint">Sin respuestas: el evento sólo se aplica o se descarta.</p>}
            <div className="grid gap-3">
              {(event.options ?? []).map((o, i) => (
                <div key={o.id} className="grid gap-2 rounded-lg border border-line bg-deep/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-accent">{OPTION_LETTERS[i]}</span>
                    <div className="flex-1">
                      <TextInput value={o.label} onChange={(v) => up((e) => void (e.options![i].label = v))} />
                    </div>
                    <SmallButton variant="danger" onClick={() => up((e) => void e.options!.splice(i, 1))}>🗑</SmallButton>
                  </div>
                  <IndicatorHeader content={draft} />
                  <IndicatorDeltas effect={o.effect} content={draft} onChange={(eff) => up((e) => void (e.options![i].effect = eff))} />
                </div>
              ))}
            </div>
          </Card>
        )}
        {tab === 'changes' && <DiffView section="events" id={id} />}
      </div>
    </div>
  )
}
