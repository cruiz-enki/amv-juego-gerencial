import type { AwardMetric } from '../../engine/types'
import { useAdmin } from '../AdminContext'
import { describeCondition } from '../describe'
import { itemStatus } from '../diff'
import { moveById, restoreItem, uniqueId } from '../operations'
import { ConditionEditor } from './ConditionEditor'
import { Badge, Card, ChipSelect, Field, Select, SmallButton, TextArea, TextInput, Toggle } from './fields'

export function ProfilesSection() {
  const { draft, base, edit, replace } = useAdmin()
  const firstFallback = draft.profiles.findIndex((p) => p.active !== false && !p.match)
  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-accent-2/50 bg-accent-2/10 p-4 text-sm">
        <p className="font-display text-lg font-bold text-accent-2">⚠️ El orden importa</p>
        <p>
          Al final de la partida, cada equipo recibe el <b>primer</b> perfil activo (de arriba hacia abajo) cuya condición cumple. Pon los perfiles más
          exigentes arriba y el de respaldo (sin condición) al final.
        </p>
      </div>
      <div className="flex justify-end">
        <SmallButton
          onClick={() =>
            edit((d) => {
              const id = uniqueId('perfil-nuevo', d.profiles.map((p) => p.id))
              const at = firstFallback >= 0 ? firstFallback : d.profiles.length
              d.profiles.splice(at, 0, { id, title: 'Nuevo perfil', icon: '🎯', description: '', match: { indicator: d.indicators[0]?.id ?? '', op: '>=', value: 70 } })
            })
          }
        >
          + Nuevo perfil
        </SmallButton>
      </div>
      {draft.profiles.map((p, i) => {
        const status = itemStatus(base, draft, 'profiles', p.id)
        const up = (fn: (x: typeof p) => void) => edit((d) => fn(d.profiles[i]))
        const unreachable = firstFallback >= 0 && i > firstFallback && p.active !== false
        return (
          <Card
            key={p.id}
            className={p.active === false ? 'opacity-60' : ''}
            title={
              <span className="flex flex-wrap items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-sm">{i + 1}</span>
                {p.icon} {p.title}
                {!p.match && <Badge tone="accent">Respaldo</Badge>}
                {status === 'modified' && <Badge tone="warning">Modificado</Badge>}
                {status === 'new' && <Badge tone="accent">Nuevo</Badge>}
                {unreachable && <Badge tone="danger">Nunca se asignará (está debajo del respaldo)</Badge>}
              </span>
            }
            actions={
              <>
                <Toggle checked={p.active !== false} onChange={(v) => up((x) => void (x.active = v))} label="Activo" />
                <SmallButton variant="ghost" title="Subir prioridad" onClick={() => edit((d) => void (d.profiles = moveById(d.profiles, p.id, -1)))}>↑</SmallButton>
                <SmallButton variant="ghost" title="Bajar prioridad" onClick={() => edit((d) => void (d.profiles = moveById(d.profiles, p.id, 1)))}>↓</SmallButton>
                {status !== 'same' && (
                  <SmallButton variant="danger" onClick={() => window.confirm('¿Restaurar este perfil?') && replace(restoreItem(draft, base, 'profiles', p.id))}>
                    {status === 'new' ? '🗑 Eliminar' : '↺ Restaurar'}
                  </SmallButton>
                )}
              </>
            }
          >
            <p className="text-sm">
              <span className="text-muted">Se asigna si: </span>
              {p.match ? describeCondition(p.match, draft) : 'no cumple ningún perfil anterior (respaldo)'}
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-semibold text-accent">Editar perfil</summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="Nombre">
                <TextInput value={p.title} onChange={(v) => up((x) => void (x.title = v))} />
              </Field>
              <Field label="Ícono">
                <TextInput value={p.icon} onChange={(v) => up((x) => void (x.icon = v))} />
              </Field>
              <Field label="Texto descriptivo (se muestra al final)" className="md:col-span-2">
                <TextArea rows={2} value={p.description} onChange={(v) => up((x) => void (x.description = v))} />
              </Field>
              <Field label="Fortalezas (opcional)">
                <TextArea rows={2} value={p.strengths} onChange={(v) => up((x) => void (x.strengths = v || undefined))} />
              </Field>
              <Field label="Riesgo (opcional)">
                <TextArea rows={2} value={p.risk} onChange={(v) => up((x) => void (x.risk = v || undefined))} />
              </Field>
              </div>
            <div className="mt-3 flex flex-wrap gap-6">
              <Toggle
                checked={!p.match}
                onChange={(v) => up((x) => void (x.match = v ? undefined : { indicator: draft.indicators[0]?.id ?? '', op: '>=', value: 70 }))}
                label="Perfil de respaldo (sin condición)"
              />
            </div>
            {p.match && (
              <div className="mt-3">
                <p className="mb-1 text-sm font-semibold text-muted">Condiciones</p>
                <ConditionEditor value={p.match} content={draft} onChange={(v) => up((x) => void (x.match = v))} />
              </div>
            )}
            </details>
          </Card>
        )
      })}
    </div>
  )
}

const METRIC_LABEL: Record<AwardMetric['kind'], string> = {
  highest: 'Mayor valor de un indicador',
  challengeGain: 'Mejor resultado en ciertos retos',
  globalIndex: 'Mayor índice global',
  balance: 'Indicadores más equilibrados',
  mostDecisions: 'Más retos resueltos',
}

export function AwardsSection() {
  const { draft, base, edit, replace } = useAdmin()
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <SmallButton
          onClick={() =>
            edit((d) => void d.awards.push({ id: uniqueId('reconocimiento', d.awards.map((a) => a.id)), title: 'Nuevo reconocimiento', icon: '🏅', description: '', metric: { kind: 'highest', indicator: d.indicators[0]?.id ?? '' } }))
          }
        >
          + Nuevo reconocimiento
        </SmallButton>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {draft.awards.map((a, i) => {
          const status = itemStatus(base, draft, 'awards', a.id)
          const up = (fn: (x: typeof a) => void) => edit((d) => fn(d.awards[i]))
          const m = a.metric
          return (
            <Card
              key={a.id}
              className={a.active === false ? 'opacity-60' : ''}
              title={
                <span className="flex items-center gap-2">
                  {a.icon} {a.title}
                  {status === 'modified' && <Badge tone="warning">Modificado</Badge>}
                  {status === 'new' && <Badge tone="accent">Nuevo</Badge>}
                </span>
              }
              actions={
                status !== 'same' ? (
                  <SmallButton variant="danger" onClick={() => window.confirm('¿Restaurar este reconocimiento?') && replace(restoreItem(draft, base, 'awards', a.id))}>
                    {status === 'new' ? '🗑 Eliminar' : '↺ Restaurar'}
                  </SmallButton>
                ) : undefined
              }
            >
              <div className="grid gap-3 md:grid-cols-[1fr_6rem]">
                <Field label="Nombre">
                  <TextInput value={a.title} onChange={(v) => up((x) => void (x.title = v))} />
                </Field>
                <Field label="Ícono">
                  <TextInput value={a.icon} onChange={(v) => up((x) => void (x.icon = v))} />
                </Field>
                <Field label="Descripción" className="md:col-span-2">
                  <TextInput value={a.description} onChange={(v) => up((x) => void (x.description = v))} />
                </Field>
                <Field label="Criterio" className="md:col-span-2">
                  <Select<AwardMetric['kind']>
                    value={m.kind}
                    onChange={(kind) =>
                      up((x) => {
                        x.metric =
                          kind === 'highest'
                            ? { kind, indicator: draft.indicators[0]?.id ?? '' }
                            : kind === 'challengeGain'
                              ? { kind, challenges: [] }
                              : { kind }
                      })
                    }
                    options={(Object.keys(METRIC_LABEL) as AwardMetric['kind'][]).map((k) => ({ value: k, label: METRIC_LABEL[k] }))}
                  />
                </Field>
                {m.kind === 'highest' && (
                  <Field label="Indicador" className="md:col-span-2">
                    <Select value={m.indicator} onChange={(v) => up((x) => void (x.metric = { kind: 'highest', indicator: v }))} options={draft.indicators.map((d) => ({ value: d.id, label: `${d.icon} ${d.label}` }))} />
                  </Field>
                )}
                {m.kind === 'challengeGain' && (
                  <Field label="Retos relacionados" className="md:col-span-2">
                    <ChipSelect
                      value={m.challenges}
                      options={draft.challenges.map((c) => ({ value: c.id, label: `${c.code ?? '—'} · ${c.title}` }))}
                      onChange={(v) => up((x) => void (x.metric = { kind: 'challengeGain', challenges: v }))}
                      placeholder="+ reto"
                    />
                  </Field>
                )}
              </div>
              <div className="mt-3">
                <Toggle checked={a.active !== false} onChange={(v) => up((x) => void (x.active = v))} label="Activo" />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
