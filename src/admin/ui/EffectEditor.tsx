import { useState } from 'react'
import type { Effect, GameContent } from '../../engine/types'
import { useAdmin } from '../AdminContext'
import { ChipSelect, NumberInput, Select, SmallButton, TextInput } from './fields'

/** Fila de números por indicador (+ recursos si existen). */
export function IndicatorDeltas({ effect, onChange, content }: { effect: Effect | undefined; onChange: (e: Effect) => void; content: GameContent }) {
  const e = effect ?? {}
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${content.indicators.length + content.resources.length}, minmax(4.5rem, 1fr))` }}>
      {content.indicators.map((d) => (
        <NumberInput
          key={d.id}
          value={e.indicators?.[d.id]}
          placeholder="0"
          onChange={(v) => {
            const indicators = { ...(e.indicators ?? {}) }
            if (v === undefined || v === 0) delete indicators[d.id]
            else indicators[d.id] = v
            onChange({ ...e, indicators: Object.keys(indicators).length ? indicators : undefined })
          }}
        />
      ))}
      {content.resources.map((r) => (
        <NumberInput
          key={r.id}
          value={e.resources?.[r.id]}
          placeholder="0"
          onChange={(v) => {
            const resources = { ...(e.resources ?? {}) }
            if (v === undefined || v === 0) delete resources[r.id]
            else resources[r.id] = v
            onChange({ ...e, resources: Object.keys(resources).length ? resources : undefined })
          }}
        />
      ))}
    </div>
  )
}

export function IndicatorHeader({ content }: { content: GameContent }) {
  return (
    <div className="grid gap-1.5 text-center text-xs font-semibold text-muted" style={{ gridTemplateColumns: `repeat(${content.indicators.length + content.resources.length}, minmax(4.5rem, 1fr))` }}>
      {content.indicators.map((d) => (
        <span key={d.id} style={{ color: d.color }}>
          {d.icon} {d.label}
        </span>
      ))}
      {content.resources.map((r) => (
        <span key={r.id}>
          {r.icon} {r.label}
        </span>
      ))}
    </div>
  )
}

/** Selector de banderas del catálogo con alta rápida de una bandera nueva. */
export function FlagPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { draft, edit } = useAdmin()
  const [adding, setAdding] = useState(false)
  const [id, setId] = useState('')
  const options = draft.flags.map((f) => ({ value: f.id, label: f.id }))
  return (
    <div className="grid gap-1.5">
      <ChipSelect value={value} options={options} onChange={onChange} placeholder="+ bandera" />
      {adding ? (
        <div className="flex gap-1.5">
          <TextInput mono value={id} onChange={(v) => setId(v.replace(/\s+/g, '_').toLowerCase())} placeholder="nueva_bandera" />
          <SmallButton
            variant="primary"
            disabled={!id || draft.flags.some((f) => f.id === id)}
            onClick={() => {
              edit((d) => d.flags.push({ id, label: id.replace(/_/g, ' '), showInDossier: true }))
              onChange([...value, id])
              setId('')
              setAdding(false)
            }}
          >
            Crear
          </SmallButton>
          <SmallButton variant="ghost" onClick={() => setAdding(false)}>Cancelar</SmallButton>
        </div>
      ) : (
        <button type="button" className="w-fit text-xs text-accent hover:underline" onClick={() => setAdding(true)}>
          + crear bandera nueva
        </button>
      )}
    </div>
  )
}

/** Banderas y consecuencias de un efecto. */
export function ConsequenceEditor({ effect, onChange, content }: { effect: Effect | undefined; onChange: (e: Effect) => void; content: GameContent }) {
  const e = effect ?? {}
  const set = (patch: Partial<Effect>) => {
    const next: Effect = { ...e, ...patch }
    for (const k of Object.keys(next) as (keyof Effect)[]) {
      const v = next[k]
      if (v === undefined || (Array.isArray(v) && v.length === 0) || v === '') delete next[k]
    }
    onChange(next)
  }
  const events = content.events.map((ev) => ({ value: ev.id, label: `${ev.title}${ev.active === false ? ' (inactivo)' : ''}` }))
  return (
    <div className="grid gap-3 text-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 font-semibold text-muted">Activa banderas</p>
          <FlagPicker value={e.setFlags ?? []} onChange={(v) => set({ setFlags: v })} />
        </div>
        <div>
          <p className="mb-1 font-semibold text-muted">Elimina banderas</p>
          <FlagPicker value={e.clearFlags ?? []} onChange={(v) => set({ clearFlags: v })} />
        </div>
      </div>
      <div>
        <p className="mb-1 font-semibold text-muted">Consecuencias diferidas (evento que aparecerá después)</p>
        <div className="grid gap-1.5">
          {(e.schedule ?? []).map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-1.5">
              <div className="min-w-56 flex-1">
                <Select value={s.event} onChange={(v) => set({ schedule: e.schedule!.map((x, j) => (j === i ? { ...x, event: v } : x)) })} options={events} />
              </div>
              <span className="text-muted">después de</span>
              <NumberInput className="!w-20" value={s.afterSteps} onChange={(v) => set({ schedule: e.schedule!.map((x, j) => (j === i ? { ...x, afterSteps: Math.max(0, v ?? 0) } : x)) })} />
              <span className="text-muted">retos {s.afterSteps === 0 ? '(al continuar)' : ''}</span>
              <SmallButton variant="ghost" onClick={() => set({ schedule: e.schedule!.filter((_, j) => j !== i) })}>✕</SmallButton>
            </div>
          ))}
          <SmallButton onClick={() => set({ schedule: [...(e.schedule ?? []), { event: content.events[0]?.id ?? '', afterSteps: 2 }] })}>+ Consecuencia diferida</SmallButton>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 font-semibold text-muted">Inserta un reto después</p>
          <Select
            value={e.injectChallenge ?? ''}
            onChange={(v) => set({ injectChallenge: v || undefined })}
            options={[{ value: '', label: 'Ninguno' }, ...content.challenges.map((c) => ({ value: c.id, label: `${c.code ?? '—'} · ${c.title}` }))]}
          />
        </div>
        <div>
          <p className="mb-1 font-semibold text-muted">Afecta a</p>
          <Select
            value={e.target ?? 'self'}
            onChange={(v) => set({ target: v === 'self' ? undefined : v })}
            options={[
              { value: 'self', label: 'El equipo que resolvió' },
              { value: 'all', label: 'Todos los equipos' },
              { value: 'others', label: 'Los demás equipos' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
