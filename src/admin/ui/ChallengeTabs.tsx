import type { Challenge, Effect, OptionRecommendation, OutcomeTone } from '../../engine/types'
import { OPTION_LETTERS, outcomeMeta, outcomeTone, recommendationMeta as recommendationBadge } from '../../lib/labels'
import { useAdmin } from '../AdminContext'
import { moveById, nextOptionId } from '../operations'
import { clone } from '../storage'
import { useChallenge } from './useChallenge'
import { ConsequenceEditor, FlagPicker, IndicatorDeltas, IndicatorHeader } from './EffectEditor'
import { Badge, Card, Field, LinesInput, Select, SmallButton, TextArea, TextInput } from './fields'

const TONES: { value: OutcomeTone; label: string }[] = [
  { value: 'success', label: '✅ Éxito' },
  { value: 'partial', label: '◐ Parcial' },
  { value: 'fail', label: '✖ Fallo' },
]
const RECOMMENDATION: { value: OptionRecommendation | ''; label: string }[] = [
  { value: '', label: 'Sin definir' },
  { value: 'recommended', label: '⭐ Recomendada' },
  { value: 'acceptable', label: '👍 Aceptable' },
  { value: 'discouraged', label: '⚠️ Desaconsejada' },
]
/** Todo lo que puede tener efecto en un reto: opciones, resultados y bonos. */
function resolutions(ch: Challenge) {
  return [
    ...(ch.options ?? []).map((o, i) => ({ key: `o:${o.id}`, label: `Opción ${OPTION_LETTERS[i]} · ${o.label}`, effect: o.effect })),
    ...Object.entries(ch.outcomes ?? {}).map(([k, o]) => ({ key: `r:${k}`, label: `Resultado · ${o?.label ?? k}`, effect: o?.effect })),
    ...(ch.bonuses ?? []).map((b) => ({ key: `b:${b.id}`, label: `Bono · ${b.label}`, effect: b.effect })),
  ]
}

function setEffect(ch: Challenge, key: string, effect: Effect) {
  const [kind, id] = [key.slice(0, 1), key.slice(2)]
  if (kind === 'o') ch.options!.find((o) => o.id === id)!.effect = effect
  if (kind === 'r') ch.outcomes![id]!.effect = effect
  if (kind === 'b') ch.bonuses!.find((b) => b.id === id)!.effect = effect
}

export function OptionsTab({ challenge }: { challenge: Challenge }) {
  const { up } = useChallenge(challenge.id)
  const options = challenge.options ?? []
  const outcomes = Object.entries(challenge.outcomes ?? {})

  return (
    <div className="grid gap-4">
      <Card
        title={`Opciones de respuesta (${options.length})`}
        actions={
          <SmallButton onClick={() => up((c) => void (c.options = [...(c.options ?? []), { id: nextOptionId(c.options ?? []), label: 'Nueva opción', effect: {} }]))}>+ Agregar opción</SmallButton>
        }
      >
        <p className="mb-3 text-xs text-muted">El equipo elige una. El texto, detalle y feedback se proyectan; tono, respuesta deseada y notas son privados.</p>
        {options.length === 0 && <p className="text-sm text-faint">Este reto no tiene opciones (se califica con resultados).</p>}
        <div className="grid gap-3">
          {options.map((o, i) => (
            <div key={o.id} className="grid gap-2 rounded-lg border border-line bg-deep/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-accent font-display font-bold text-ink">{OPTION_LETTERS[i]}</span>
                <div className="w-24">
                  <TextInput mono value={o.id} onChange={(v) => up((c) => void (c.options![i].id = v.trim()))} placeholder="clave" />
                </div>
                {o.recommendation && <Badge tone={recommendationBadge[o.recommendation].tone}>{recommendationBadge[o.recommendation].label}</Badge>}
                <span className="ml-auto flex gap-1">
                  <SmallButton variant="ghost" title="Subir" onClick={() => up((c) => void (c.options = moveById(c.options!, o.id, -1)))}>↑</SmallButton>
                  <SmallButton variant="ghost" title="Bajar" onClick={() => up((c) => void (c.options = moveById(c.options!, o.id, 1)))}>↓</SmallButton>
                  <SmallButton
                    title="Duplicar opción"
                    onClick={() => up((c) => void c.options!.splice(i + 1, 0, { ...clone(o), id: nextOptionId(c.options!), label: `${o.label} (copia)` }))}
                  >
                    ⧉
                  </SmallButton>
                  <SmallButton variant="danger" title="Borrar opción" onClick={() => window.confirm(`¿Borrar la opción ${OPTION_LETTERS[i]}?`) && up((c) => void c.options!.splice(i, 1))}>
                    🗑
                  </SmallButton>
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Field label="Texto (público)">
                  <TextArea rows={2} value={o.label} onChange={(v) => up((c) => void (c.options![i].label = v))} />
                </Field>
                <Field label="Detalle (público, opcional)">
                  <TextArea rows={2} value={o.detail} onChange={(v) => up((c) => void (c.options![i].detail = v || undefined))} />
                </Field>
                <Field label="Feedback al elegirla (público)">
                  <TextArea rows={2} value={o.feedback} onChange={(v) => up((c) => void (c.options![i].feedback = v || undefined))} />
                </Field>
                <Field label="Notas internas (privado)">
                  <TextArea rows={2} value={o.notes} onChange={(v) => up((c) => void (c.options![i].notes = v || undefined))} />
                </Field>
                <Field label="Tono visual (privado)">
                  <Select value={o.tone ?? ''} onChange={(v) => up((c) => void (c.options![i].tone = (v || undefined) as OutcomeTone | undefined))} options={[{ value: '', label: 'Sin tono' }, ...TONES]} />
                </Field>
                <Field label="Respuesta deseada (privado)">
                  <Select value={o.recommendation ?? ''} onChange={(v) => up((c) => void (c.options![i].recommendation = (v || undefined) as OptionRecommendation | undefined))} options={RECOMMENDATION} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={`Resultados que califica el facilitador (${outcomes.length})`}
        actions={
          <>
            {(['success', 'partial', 'fail'] as const)
              .filter((k) => !challenge.outcomes?.[k])
              .map((k) => (
                <SmallButton key={k} onClick={() => up((c) => void (c.outcomes = { ...(c.outcomes ?? {}), [k]: { label: outcomeMeta[k].label, effect: {} } }))}>
                  + {outcomeMeta[k].label}
                </SmallButton>
              ))}
            <SmallButton
              onClick={() => {
                const key = window.prompt('Clave del nuevo resultado (ej. "rechazo-rigido"):')?.trim()
                if (key && !challenge.outcomes?.[key]) up((c) => void (c.outcomes = { ...(c.outcomes ?? {}), [key]: { label: key, tone: 'fail', effect: {} } }))
              }}
            >
              + Otro resultado
            </SmallButton>
          </>
        }
      >
        {outcomes.length === 0 && <p className="text-sm text-faint">Sin resultados calificados (el reto se resuelve con opciones).</p>}
        <div className="grid gap-3">
          {outcomes.map(([key, o]) =>
            o ? (
              <div key={key} className="grid gap-2 rounded-lg border border-line bg-deep/40 p-3 md:grid-cols-[1fr_10rem_auto]">
                <Field label={`Etiqueta · clave "${key}"`}>
                  <TextInput value={o.label} onChange={(v) => up((c) => void (c.outcomes![key]!.label = v))} />
                </Field>
                <Field label="Tono">
                  <Select value={outcomeTone(key, o)} onChange={(v) => up((c) => void (c.outcomes![key]!.tone = v))} options={TONES} />
                </Field>
                <div className="self-end">
                  <SmallButton variant="danger" onClick={() => window.confirm(`¿Borrar el resultado "${o.label ?? key}"?`) && up((c) => void delete c.outcomes![key])}>🗑</SmallButton>
                </div>
                <Field label="Feedback (público)" className="md:col-span-3">
                  <TextArea rows={2} value={o.feedback} onChange={(v) => up((c) => void (c.outcomes![key]!.feedback = v || undefined))} />
                </Field>
              </div>
            ) : null,
          )}
        </div>
      </Card>

      <Card
        title={`Bonos del facilitador (${challenge.bonuses?.length ?? 0})`}
        actions={<SmallButton onClick={() => up((c) => void (c.bonuses = [...(c.bonuses ?? []), { id: `bono-${(c.bonuses?.length ?? 0) + 1}`, label: 'Nuevo bono', effect: {} }]))}>+ Bono</SmallButton>}
      >
        <p className="mb-2 text-xs text-muted">Ajustes extra que el facilitador otorga por equipo (privados). Los de un mismo grupo son excluyentes.</p>
        <div className="grid gap-2">
          {(challenge.bonuses ?? []).map((b, i) => (
            <div key={b.id} className="grid gap-2 md:grid-cols-[10rem_1fr_10rem_auto]">
              <TextInput mono value={b.id} onChange={(v) => up((c) => void (c.bonuses![i].id = v.trim()))} />
              <TextInput value={b.label} onChange={(v) => up((c) => void (c.bonuses![i].label = v))} />
              <TextInput value={b.group} onChange={(v) => up((c) => void (c.bonuses![i].group = v || undefined))} placeholder="grupo (opcional)" />
              <SmallButton variant="danger" onClick={() => up((c) => void c.bonuses!.splice(i, 1))}>🗑</SmallButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function EvaluationTab({ challenge }: { challenge: Challenge }) {
  const { up } = useChallenge(challenge.id)
  const options = challenge.options ?? []
  const outcomes = Object.entries(challenge.outcomes ?? {})
  return (
    <div className="grid gap-4">
      <p className="rounded-lg border border-accent-2/40 bg-accent-2/10 px-3 py-2 text-sm text-accent-2">
        🔒 Privado: esta pestaña NUNCA se proyecta. Se ve aquí y en el panel del facilitador.
      </p>
      <Card title="Respuesta deseada / criterio de evaluación">
        {options.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-muted">A) Reto con respuesta estructurada</p>
            <div className="grid gap-2">
              {options.map((o, i) => (
                <div key={o.id} className="grid items-center gap-2 md:grid-cols-[2rem_1fr_14rem]">
                  <span className="font-display font-bold text-accent">{OPTION_LETTERS[i]}</span>
                  <span className="text-sm">{o.label}</span>
                  <Select value={o.recommendation ?? ''} onChange={(v) => up((c) => void (c.options![i].recommendation = (v || undefined) as OptionRecommendation | undefined))} options={RECOMMENDATION} />
                </div>
              ))}
            </div>
          </div>
        )}
        {outcomes.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">B) Reto abierto: criterios para calificar</p>
            <div className="grid gap-3">
              {outcomes.map(([key, o]) =>
                o ? (
                  <Field key={key} label={`${outcomeMeta[outcomeTone(key, o)].icon} Criterio de “${o.label ?? key}”`}>
                    <TextArea rows={2} value={o.criteria} onChange={(v) => up((c) => void (c.outcomes![key]!.criteria = v || undefined))} placeholder="¿Qué tiene que pasar para otorgar este resultado?" />
                  </Field>
                ) : null,
              )}
            </div>
          </div>
        )}
        {options.length === 0 && outcomes.length === 0 && <p className="text-sm text-faint">Agrega opciones o resultados en la pestaña Opciones.</p>}
      </Card>
      <Card title="Para el facilitador">
        <div className="grid gap-3">
          <Field label="Notas privadas del facilitador">
            <TextArea rows={4} value={challenge.facilitator.notes} onChange={(v) => up((c) => void (c.facilitator.notes = v))} />
          </Field>
          <Field label="Puntos a observar / respuesta de referencia (una línea por punto)">
            <LinesInput rows={4} value={challenge.facilitator.reference} onChange={(v) => up((c) => void (c.facilitator.reference = v))} />
          </Field>
          <Field label="Preguntas de cierre / debrief (una por línea)">
            <LinesInput rows={3} value={challenge.facilitator.debrief} onChange={(v) => up((c) => void (c.facilitator.debrief = v))} />
          </Field>
        </div>
      </Card>
    </div>
  )
}

export function EffectsTab({ challenge }: { challenge: Challenge }) {
  const { draft } = useAdmin()
  const { up } = useChallenge(challenge.id)
  const rows = resolutions(challenge)
  return (
    <Card title="Efectos sobre indicadores">
      <p className="mb-3 text-xs text-muted">Cuánto suma o resta cada respuesta. Vacío o 0 = sin efecto. Referencia: ±3 pequeño · ±5 relevante · ±8 fuerte · ±10 sólo eventos importantes.</p>
      {rows.length === 0 && <p className="text-sm text-faint">Este reto no tiene opciones, resultados ni bonos.</p>}
      {rows.length > 0 && (
        <div className="grid gap-2 overflow-x-auto">
          <div className="grid min-w-[52rem] grid-cols-[18rem_1fr] items-end gap-3">
            <span />
            <IndicatorHeader content={draft} />
          </div>
          {rows.map((r) => (
            <div key={r.key} className="grid min-w-[52rem] grid-cols-[18rem_1fr] items-center gap-3 border-t border-line pt-2">
              <span className="truncate text-sm" title={r.label}>
                {r.label}
              </span>
              <IndicatorDeltas effect={r.effect} content={draft} onChange={(e) => up((c) => setEffect(c, r.key, e))} />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function ConsequencesTab({ challenge }: { challenge: Challenge }) {
  const { draft } = useAdmin()
  const { up } = useChallenge(challenge.id)
  const rows = resolutions(challenge)
  return (
    <div className="grid gap-4">
      {rows.map((r) => (
        <details key={r.key} className="rounded-xl border border-line bg-panel/70 p-4" open={!!(r.effect?.setFlags?.length || r.effect?.schedule?.length || r.effect?.injectChallenge)}>
          <summary className="cursor-pointer font-display font-bold">
            {r.label}
            {(r.effect?.setFlags?.length || r.effect?.schedule?.length) ? <span className="ml-2 text-xs font-normal text-accent-2">⚑ {[...(r.effect?.setFlags ?? []), ...(r.effect?.schedule ?? []).map((s) => `⏳ ${s.event}`)].join(' · ')}</span> : null}
          </summary>
          <div className="mt-3">
            <ConsequenceEditor effect={r.effect} content={draft} onChange={(e) => up((c) => setEffect(c, r.key, e))} />
          </div>
        </details>
      ))}
      <Card
        title="Banderas que marca el facilitador a mano"
        actions={<SmallButton onClick={() => up((c) => void (c.facilitatorFlags = [...(c.facilitatorFlags ?? []), { flag: draft.flags[0]?.id ?? '', label: 'Nueva marca' }]))}>+ Bandera manual</SmallButton>}
      >
        <p className="mb-2 text-xs text-muted">Aparecen como botones por equipo en el panel del facilitador (ej. “ignoraron al cliente”).</p>
        <div className="grid gap-2">
          {(challenge.facilitatorFlags ?? []).map((f, i) => (
            <div key={i} className="grid items-start gap-2 md:grid-cols-[1fr_1fr_auto]">
              <FlagPicker value={f.flag ? [f.flag] : []} onChange={(v) => up((c) => void (c.facilitatorFlags![i].flag = v.at(-1) ?? ''))} />
              <TextInput value={f.label} onChange={(v) => up((c) => void (c.facilitatorFlags![i].label = v))} placeholder="Texto del botón" />
              <SmallButton variant="danger" onClick={() => up((c) => void c.facilitatorFlags!.splice(i, 1))}>🗑</SmallButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
