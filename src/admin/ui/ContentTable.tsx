import { useMemo, useState } from 'react'
import { challengeTypeMeta, eventKindLabel, turnModeLabel } from '../../lib/labels'
import { useAdmin } from '../AdminContext'
import { moveInAgenda, setActive } from '../operations'
import { applyFilters, buildRows, EMPTY_FILTERS as EMPTY, type Filters, type Kind } from '../rows'
import { Badge, Select, SmallButton, TextInput, Toggle } from './fields'


const check = (b: boolean) => (b ? <span className="text-success">✓</span> : <span className="text-faint">·</span>)

export function ContentTable({ fixedKind }: { fixedKind?: Kind }) {
  const { draft, base, edit, select, replace } = useAdmin()
  const [f, setF] = useState<Filters>({ ...EMPTY, kind: fixedKind ?? '' })
  const rows = useMemo(() => buildRows(draft, base), [draft, base])
  const visible = applyFilters(rows, { ...f, kind: fixedKind ?? f.kind })
  const set = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }))
  const yesNo = (label: string) => [
    { value: '', label },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ]
  const kind = fixedKind ?? f.kind

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 rounded-xl border border-line bg-panel/60 p-3 md:grid-cols-4 xl:grid-cols-6">
        <div className="md:col-span-2">
          <TextInput value={f.q} onChange={(q) => set({ q })} placeholder="🔎 Buscar en títulos, narrativas, opciones, notas…" />
        </div>
        {!fixedKind && <Select value={f.kind} onChange={(v) => set({ kind: v, type: '' })} options={[{ value: '', label: 'Retos y eventos' }, { value: 'challenge', label: 'Sólo retos' }, { value: 'event', label: 'Sólo eventos' }]} />}
        <Select
          value={f.type}
          onChange={(type) => set({ type })}
          options={[
            { value: '', label: 'Todos los tipos' },
            ...(kind !== 'event' ? Object.entries(challengeTypeMeta).map(([k, m]) => ({ value: k, label: m.label })) : []),
            ...(kind !== 'challenge' ? Object.entries(eventKindLabel).map(([k, l]) => ({ value: k, label: `Evento ${l.toLowerCase()}` })) : []),
          ]}
        />
        {kind !== 'event' && <Select value={f.category} onChange={(category) => set({ category })} options={[{ value: '', label: 'Todas las competencias' }, ...draft.categories.map((c) => ({ value: c.id, label: c.label }))]} />}
        {kind !== 'event' && <Select value={f.mode} onChange={(mode) => set({ mode })} options={[{ value: '', label: 'Todos los modos' }, ...Object.entries(turnModeLabel).map(([k, l]) => ({ value: k, label: l }))]} />}
        <Select value={f.scope} onChange={(scope) => set({ scope })} options={[{ value: '', label: 'Global / multi / equipo' }, { value: 'global', label: 'Global' }, { value: 'multi', label: 'Multi-equipo' }, { value: 'team', label: 'Equipo activo / un equipo' }]} />
        <Select value={f.active} onChange={(active) => set({ active })} options={[{ value: '', label: 'Activos e inactivos' }, { value: 'si', label: 'Sólo activos' }, { value: 'no', label: 'Sólo inactivos' }]} />
        {kind !== 'event' && <Select value={f.format} onChange={(format) => set({ format })} options={[{ value: '', label: 'Presencial y digital' }, { value: 'presencial', label: 'Presencial' }, { value: 'digital', label: 'Digital' }]} />}
        <Select value={f.consequences} onChange={(consequences) => set({ consequences })} options={yesNo('Con/sin consecuencias')} />
        <Select value={f.flags} onChange={(flags) => set({ flags })} options={yesNo('Con/sin banderas')} />
        <Select value={f.status} onChange={(status) => set({ status })} options={[{ value: '', label: 'Original y modificado' }, { value: 'cambiado', label: 'Modificados / nuevos' }, { value: 'original', label: 'Sin cambios' }]} />
        <SmallButton variant="ghost" onClick={() => setF({ ...EMPTY, kind: fixedKind ?? '' })}>Limpiar filtros</SmallButton>
      </div>

      <p className="text-sm text-muted">
        {visible.length} de {rows.filter((r) => !fixedKind || r.kind === fixedKind).length} elementos
      </p>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead className="bg-deep text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Título</th>
              <th className="px-2 py-2">Hora / momento</th>
              <th className="px-2 py-2">Tipo</th>
              <th className="px-2 py-2">Min</th>
              <th className="px-2 py-2">Competencias</th>
              <th className="px-2 py-2">Modo</th>
              <th className="px-2 py-2">Activo</th>
              <th className="px-2 py-2" title="Opciones o resultados">Opc.</th>
              <th className="px-2 py-2">Feedback</th>
              <th className="px-2 py-2">Banderas</th>
              <th className="px-2 py-2" title="Consecuencias diferidas o retos insertados">Consec.</th>
              <th className="px-2 py-2">Notas</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={`${r.kind}-${r.id}`}
                className={`cursor-pointer border-t border-line hover:bg-white/5 ${r.active ? '' : 'opacity-50'}`}
                onClick={() => select({ view: r.kind === 'challenge' ? 'challenges' : 'events', id: r.id })}
              >
                <td className="px-2 py-2 font-display font-bold text-accent">{r.code}</td>
                <td className="px-2 py-2">
                  <p className="font-semibold">{r.title}</p>
                  <p className="font-mono text-xs text-faint">{r.id}</p>
                </td>
                <td className="max-w-56 px-2 py-2 text-muted">{r.when}</td>
                <td className="px-2 py-2">
                  {r.type}
                  {r.inPerson && <span title="Presencial"> 🏃</span>}
                </td>
                <td className="px-2 py-2 tabular-nums">{r.minutes ?? ''}</td>
                <td className="px-2 py-2" title={r.categories.map((c) => draft.categories.find((x) => x.id === c)?.label).join(', ')}>
                  {r.categories.map((c) => draft.categories.find((x) => x.id === c)?.icon ?? '?').join(' ')}
                </td>
                <td className="px-2 py-2 text-muted">{r.mode}</td>
                <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                  <Toggle checked={r.active} onChange={(v) => replace(setActive(draft, r.kind === 'challenge' ? 'challenges' : 'events', r.id, v))} label="" />
                </td>
                <td className="px-2 py-2 tabular-nums">{r.options}</td>
                <td className="px-2 py-2">{check(r.feedback)}</td>
                <td className="px-2 py-2">{check(r.flags)}</td>
                <td className="px-2 py-2">{check(r.consequences)}</td>
                <td className="px-2 py-2">{check(r.notes)}</td>
                <td className="px-2 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {r.status === 'modified' && <Badge tone="warning">Modificado</Badge>}
                  {r.status === 'new' && <Badge tone="accent">Nuevo</Badge>}
                  {r.kind === 'challenge' && r.inAgenda && !f.q && (
                    <span className="ml-1 inline-flex">
                      <SmallButton variant="ghost" title="Subir en la agenda" onClick={() => edit((d) => Object.assign(d, moveInAgenda(d, r.id, -1)))}>↑</SmallButton>
                      <SmallButton variant="ghost" title="Bajar en la agenda" onClick={() => edit((d) => Object.assign(d, moveInAgenda(d, r.id, 1)))}>↓</SmallButton>
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-6 text-center text-muted">
                  Nada coincide con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
