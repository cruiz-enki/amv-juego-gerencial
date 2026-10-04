import { useState } from 'react'
import type { Challenge, ChallengeType, TurnMode } from '../../engine/types'
import { challengeTypeMeta, turnModeLabel } from '../../lib/labels'
import { useAdmin } from '../AdminContext'
import { duplicateChallenge, renameId } from '../operations'
import { useChallenge } from './useChallenge'
import { ConsequencesTab, EffectsTab, EvaluationTab, OptionsTab } from './ChallengeTabs'
import { ConditionEditor } from './ConditionEditor'
import { DiffView, ItemHeader, Tabs } from './EditorParts'
import { Card, ChipSelect, Field, LinesInput, NumberInput, Select, SmallButton, TextArea, TextInput, Toggle } from './fields'

type Tab = 'general' | 'content' | 'options' | 'evaluation' | 'effects' | 'consequences' | 'changes'

export function ChallengeEditor({ id }: { id: string }) {
  const { draft, replace, select, setPreview } = useAdmin()
  const { challenge } = useChallenge(id)
  const [tab, setTab] = useState<Tab>('general')
  if (!challenge) return <p className="text-muted">El reto no existe (¿se restauró o eliminó?).</p>

  return (
    <div>
      <ItemHeader
        section="challenges"
        id={id}
        title={`${challenge.code ? `${challenge.code} · ` : ''}${challenge.title}`}
        subtitle={<span>{challengeTypeMeta[challenge.type]?.label} · {turnModeLabel[challenge.turnMode ?? draft.config.defaultTurnMode]}</span>}
        onPreview={(mode) => setPreview({ kind: 'challenge', id, mode })}
        onDuplicate={() => {
          const { content, newId } = duplicateChallenge(draft, id)
          replace(content)
          select({ view: 'challenges', id: newId })
        }}
      />
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'general', label: 'General' },
          { id: 'content', label: 'Contenido público' },
          { id: 'options', label: 'Opciones' },
          { id: 'evaluation', label: 'Evaluación' },
          { id: 'effects', label: 'Efectos' },
          { id: 'consequences', label: 'Banderas y consecuencias' },
          { id: 'changes', label: 'Ver cambios' },
        ]}
      />
      <div className="mt-4">
        {tab === 'general' && <GeneralTab challenge={challenge} />}
        {tab === 'content' && <ContentTab challenge={challenge} />}
        {tab === 'options' && <OptionsTab challenge={challenge} />}
        {tab === 'evaluation' && <EvaluationTab challenge={challenge} />}
        {tab === 'effects' && <EffectsTab challenge={challenge} />}
        {tab === 'consequences' && <ConsequencesTab challenge={challenge} />}
        {tab === 'changes' && <DiffView section="challenges" id={id} />}
      </div>
    </div>
  )
}

function GeneralTab({ challenge }: { challenge: Challenge }) {
  const { draft, edit, select } = useAdmin()
  const { up } = useChallenge(challenge.id)
  const [newId, setNewId] = useState(challenge.id)
  const inAgenda = draft.config.agenda.some((a) => a.challenge === challenge.id)
  const idTaken = newId !== challenge.id && draft.challenges.some((c) => c.id === newId)

  return (
    <div className="grid gap-4">
      <Card title="Identidad">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Título" className="md:col-span-3">
            <TextInput value={challenge.title} onChange={(v) => up((c) => void (c.title = v))} />
          </Field>
          <Field label="Número">
            <TextInput value={challenge.code} onChange={(v) => up((c) => void (c.code = v || undefined))} placeholder="01" />
          </Field>
          <Field label="ID interno" hint="Cambiarlo actualiza todas las referencias (agenda, condiciones, consecuencias)." className="md:col-span-2">
            <div className="flex gap-1.5">
              <TextInput mono value={newId} onChange={(v) => setNewId(v.trim().toLowerCase().replace(/\s+/g, '-'))} />
              <SmallButton
                disabled={!newId || newId === challenge.id || idTaken}
                onClick={() => {
                  edit((d) => Object.assign(d, renameId(d, challenge.id, newId)))
                  select({ view: 'challenges', id: newId })
                }}
              >
                Renombrar
              </SmallButton>
            </div>
            {idTaken && <span className="text-xs text-danger">Ese id ya existe.</span>}
          </Field>
          <Field label="Hora en pantalla">
            <TextInput value={challenge.clock} onChange={(v) => up((c) => void (c.clock = v || undefined))} placeholder="09:20" />
          </Field>
          <Field label="Capítulo (bloque del día)">
            <Select value={challenge.chapter} onChange={(v) => up((c) => void (c.chapter = v))} options={draft.chapters.map((ch) => ({ value: ch.id, label: `${ch.marker} · ${ch.label}` }))} />
          </Field>
          <Field label="Tipo">
            <Select<ChallengeType> value={challenge.type} onChange={(v) => up((c) => void (c.type = v))} options={Object.entries(challengeTypeMeta).map(([k, m]) => ({ value: k as ChallengeType, label: `${m.icon} ${m.label}` }))} />
          </Field>
          <Field label="Modo de juego">
            <Select<TurnMode> value={challenge.turnMode ?? draft.config.defaultTurnMode} onChange={(v) => up((c) => void (c.turnMode = v))} options={Object.entries(turnModeLabel).map(([k, l]) => ({ value: k as TurnMode, label: l }))} />
          </Field>
          <Field label="Duración planeada (min)">
            <NumberInput value={challenge.minutes} onChange={(v) => up((c) => void (c.minutes = v))} />
          </Field>
          <Field label="Temporizador en pantalla (s)" hint="Vacío = sin temporizador">
            <NumberInput value={challenge.durationSec} step={30} onChange={(v) => up((c) => void (c.durationSec = v || undefined))} />
          </Field>
        </div>
      </Card>
      <Card title="Estado y formato">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Toggle checked={challenge.active !== false} onChange={(v) => up((c) => void (c.active = v))} label="Activo (entra en nuevas partidas)" />
          <Toggle
            checked={inAgenda}
            onChange={(v) =>
              edit((d) => {
                d.config.agenda = v ? [...d.config.agenda, { challenge: challenge.id }] : d.config.agenda.filter((a) => a.challenge !== challenge.id)
              })
            }
            label="En la agenda (si no, sólo aparece si un evento lo inserta)"
          />
          <Toggle checked={!!challenge.inPerson} onChange={(v) => up((c) => void (c.inPerson = v || undefined))} label="Presencial" />
          <Toggle checked={challenge.ambience === 'crisis'} onChange={(v) => up((c) => void (c.ambience = v ? 'crisis' : undefined))} label="Pantalla de alerta (crisis)" />
          <Toggle checked={!!challenge.showDossier} onChange={(v) => up((c) => void (c.showDossier = v || undefined))} label="Mostrar expediente de cada equipo" />
        </div>
      </Card>
      <Card title="Competencias (módulos del diplomado)">
        <ChipSelect value={challenge.categories} options={draft.categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.label}` }))} onChange={(v) => up((c) => void (c.categories = v))} placeholder="+ competencia" />
      </Card>
      <Card title="Sólo aparece si…">
        <p className="mb-2 text-xs text-muted">Opcional. Si el equipo no cumple la condición al llegar al reto, se salta.</p>
        <ConditionEditor value={challenge.conditions} content={draft} onChange={(v) => up((c) => void (c.conditions = v))} emptyLabel="Sin condición: aparece siempre." />
      </Card>
    </div>
  )
}

function ContentTab({ challenge }: { challenge: Challenge }) {
  const { draft } = useAdmin()
  const { up } = useChallenge(challenge.id)
  const tableText = challenge.table ? [challenge.table.columns.join(' | '), ...challenge.table.rows.map((r) => [r.label, ...r.cells].join(' | '))].join('\n') : ''
  return (
    <div className="grid gap-4">
      <p className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">👁 Todo lo de esta pestaña SE PROYECTA a los participantes.</p>
      <Card title="Situación">
        <div className="grid gap-3">
          <Field label="Narrativa">
            <TextArea rows={4} value={challenge.narrative} onChange={(v) => up((c) => void (c.narrative = v))} />
          </Field>
          <Field label="Pregunta destacada (opcional)">
            <TextInput value={challenge.question} onChange={(v) => up((c) => void (c.question = v || undefined))} />
          </Field>
          <div className="grid gap-3 md:grid-cols-[1fr_12rem]">
            <Field label="Lista de elementos (una línea por elemento)">
              <LinesInput rows={5} value={challenge.items} onChange={(v) => up((c) => void (c.items = v))} />
            </Field>
            <Field label="Estilo de la lista">
              <Select value={challenge.itemStyle ?? 'number'} onChange={(v) => up((c) => void (c.itemStyle = v === 'number' ? undefined : v))} options={[{ value: 'number', label: '1, 2, 3' }, { value: 'letter', label: 'A, B, C' }, { value: 'bullet', label: '• viñetas' }]} />
            </Field>
          </div>
          <Field label="Instrucciones (una línea por instrucción)">
            <LinesInput rows={3} value={challenge.instructions} onChange={(v) => up((c) => void (c.instructions = v))} />
          </Field>
          <Field label="Tabla (opcional)" hint="Primera línea: columnas separadas por |. Siguientes: nombre de fila | celda | celda…">
            <TextArea
              rows={4}
              value={tableText}
              onChange={(v) =>
                up((c) => {
                  const lines = v.split('\n').filter((l) => l.trim())
                  if (lines.length < 2) return void (c.table = undefined)
                  const split = (l: string) => l.split('|').map((x) => x.trim())
                  c.table = { columns: split(lines[0]), rows: lines.slice(1).map((l) => { const [label, ...cells] = split(l); return { label, cells } }) }
                })
              }
            />
          </Field>
        </div>
      </Card>
      <Card title="Preguntas de seguimiento (las revela el facilitador)">
        <div className="grid gap-3 md:grid-cols-[16rem_1fr]">
          <Field label="Título">
            <TextInput value={challenge.followUp?.title} onChange={(v) => up((c) => void (c.followUp = v || c.followUp?.items.length ? { title: v, items: c.followUp?.items ?? [] } : undefined))} placeholder="Antes de decidir" />
          </Field>
          <Field label="Preguntas (una por línea)">
            <LinesInput value={challenge.followUp?.items} onChange={(v) => up((c) => void (c.followUp = v?.length || c.followUp?.title ? { title: c.followUp?.title ?? 'Preguntas', items: v ?? [] } : undefined))} />
          </Field>
        </div>
      </Card>
      <Card title="Cierre">
        <Field label="Mensaje de cierre (takeaway) — aparece al resolver">
          <TextArea rows={2} value={challenge.takeaway} onChange={(v) => up((c) => void (c.takeaway = v || undefined))} />
        </Field>
      </Card>
      <Card
        title="Textos condicionados (callbacks)"
        actions={<SmallButton onClick={() => up((c) => void (c.callbacks = [...(c.callbacks ?? []), { when: { flag: draft.flags[0]?.id ?? '' }, title: 'Un momento…', text: '' }]))}>+ Texto condicionado</SmallButton>}
      >
        <p className="mb-2 text-xs text-muted">Se muestran sólo a los equipos que cumplen la condición (p. ej. “eliminaron capacitación”).</p>
        <div className="grid gap-3">
          {(challenge.callbacks ?? []).map((cb, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-line p-3">
              <ConditionEditor value={cb.when} content={draft} onChange={(v) => up((c) => void (c.callbacks![i].when = v ?? { flag: draft.flags[0]?.id ?? '' }))} />
              <div className="grid gap-2 md:grid-cols-[14rem_1fr_auto]">
                <TextInput value={cb.title} onChange={(v) => up((c) => void (c.callbacks![i].title = v || undefined))} placeholder="Título" />
                <TextInput value={cb.text} onChange={(v) => up((c) => void (c.callbacks![i].text = v))} placeholder="Texto que verán" />
                <SmallButton variant="danger" onClick={() => up((c) => void (c.callbacks = c.callbacks!.filter((_, j) => j !== i)))}>Quitar</SmallButton>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
