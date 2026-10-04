import type { PublicEffects } from '../../engine/types'
import { publicEffectsLabel } from '../../lib/labels'
import { useAdmin } from '../AdminContext'
import { findItem, itemStatus } from '../diff'
import { flagUsage, restoreItem } from '../operations'
import { Badge, Card, Field, LinesInput, NumberInput, Select, SmallButton, TextArea, TextInput, Toggle } from './fields'

export function IndicatorsSection() {
  const { draft, base, edit, replace } = useAdmin()
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Valores y etiquetas de los indicadores. Los ids no se pueden cambiar aquí porque los usan todos los efectos y condiciones.
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[60rem] text-sm">
          <thead className="bg-deep text-left text-xs text-muted uppercase">
            <tr>
              {['id', 'Ícono', 'Etiqueta pública', 'Descripción', 'Inicial', 'Mín', 'Máx', 'Alerta <', 'Peso', 'Color', ''].map((h) => (
                <th key={h} className="px-2 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.indicators.map((d, i) => {
              const up = (fn: (x: typeof d) => void) => edit((c) => fn(c.indicators[i]))
              const status = itemStatus(base, draft, 'indicators', d.id)
              return (
                <tr key={d.id} className="border-t border-line align-top">
                  <td className="px-2 py-2 font-mono text-xs text-muted">{d.id}</td>
                  <td className="w-16 px-2 py-2"><TextInput value={d.icon} onChange={(v) => up((x) => void (x.icon = v))} /></td>
                  <td className="w-40 px-2 py-2"><TextInput value={d.label} onChange={(v) => up((x) => void (x.label = v))} /></td>
                  <td className="px-2 py-2"><TextArea rows={2} value={d.description} onChange={(v) => up((x) => void (x.description = v))} /></td>
                  <td className="w-20 px-2 py-2"><NumberInput value={d.initial} onChange={(v) => up((x) => void (x.initial = v ?? 0))} /></td>
                  <td className="w-20 px-2 py-2"><NumberInput value={d.min} onChange={(v) => up((x) => void (x.min = v ?? 0))} /></td>
                  <td className="w-20 px-2 py-2"><NumberInput value={d.max} onChange={(v) => up((x) => void (x.max = v ?? 100))} /></td>
                  <td className="w-20 px-2 py-2"><NumberInput value={d.danger} onChange={(v) => up((x) => void (x.danger = v ?? 0))} /></td>
                  <td className="w-20 px-2 py-2"><NumberInput value={d.weight} step={0.5} placeholder="1" onChange={(v) => up((x) => void (x.weight = v))} /></td>
                  <td className="w-16 px-2 py-2"><input type="color" value={d.color} onChange={(e) => up((x) => void (x.color = e.target.value))} className="h-8 w-12 rounded bg-transparent" /></td>
                  <td className="px-2 py-2">
                    {status === 'modified' && (
                      <SmallButton variant="ghost" title="Restaurar" onClick={() => replace(restoreItem(draft, base, 'indicators', d.id))}>↺</SmallButton>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FlagsSection() {
  const { draft, base, edit } = useAdmin()
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Banderas: marcas ocultas que deja una decisión y que condicionan eventos futuros. Toda bandera usada en retos, eventos o perfiles debe existir aquí.
      </p>
      <div className="flex justify-end">
        <SmallButton
          onClick={() => {
            const id = window.prompt('Id de la nueva bandera (ej. "cliente_molesto"):')?.trim().replace(/\s+/g, '_').toLowerCase()
            if (id && !draft.flags.some((f) => f.id === id)) edit((d) => void d.flags.push({ id, label: id.replace(/_/g, ' '), showInDossier: true }))
          }}
        >
          + Nueva bandera
        </SmallButton>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-deep text-left text-xs text-muted uppercase">
            <tr>
              <th className="px-3 py-2">id</th>
              <th className="px-3 py-2">Descripción legible</th>
              <th className="px-3 py-2">En el expediente</th>
              <th className="px-3 py-2">Usos</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {draft.flags.map((f, i) => {
              const uses = flagUsage(draft, f.id)
              const isNew = !findItem(base, 'flags', f.id)
              return (
                <tr key={f.id} className="border-t border-line">
                  <td className="px-3 py-2 font-mono text-xs">{f.id}</td>
                  <td className="px-3 py-2"><TextInput value={f.label} onChange={(v) => edit((d) => void (d.flags[i].label = v))} /></td>
                  <td className="px-3 py-2"><Toggle checked={!!f.showInDossier} onChange={(v) => edit((d) => void (d.flags[i].showInDossier = v || undefined))} label="" /></td>
                  <td className="px-3 py-2">{uses ? uses : <Badge tone="warning">sin uso</Badge>}</td>
                  <td className="px-3 py-2">
                    {isNew && uses === 0 && (
                      <SmallButton variant="danger" onClick={() => edit((d) => void d.flags.splice(i, 1))}>🗑</SmallButton>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function GeneralSection() {
  const { draft, edit } = useAdmin()
  const cfg = draft.config
  return (
    <div className="grid gap-4">
      <Card title="Partida">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Nombre del juego"><TextInput value={cfg.title} onChange={(v) => edit((d) => void (d.config.title = v))} /></Field>
          <Field label="Subtítulo" className="md:col-span-2"><TextInput value={cfg.subtitle} onChange={(v) => edit((d) => void (d.config.subtitle = v))} /></Field>
          <Field label="Premisa (portada)" className="md:col-span-3"><TextArea rows={2} value={cfg.premise} onChange={(v) => edit((d) => void (d.config.premise = v))} /></Field>
          <Field label="Equipos mínimo"><NumberInput value={cfg.teams.min} onChange={(v) => edit((d) => void (d.config.teams.min = v ?? 2))} /></Field>
          <Field label="Equipos máximo"><NumberInput value={cfg.teams.max} onChange={(v) => edit((d) => void (d.config.teams.max = v ?? 6))} /></Field>
          <Field label="Equipos por defecto"><NumberInput value={cfg.teams.default} onChange={(v) => edit((d) => void (d.config.teams.default = v ?? 4))} /></Field>
          <Field label="Duración objetivo (min)"><NumberInput value={cfg.targetMinutes} onChange={(v) => edit((d) => void (d.config.targetMinutes = v ?? 90))} /></Field>
          <Field label="Efectos en pantalla (por defecto)">
            <Select<PublicEffects> value={cfg.publicEffects} onChange={(v) => edit((d) => void (d.config.publicEffects = v))} options={(Object.keys(publicEffectsLabel) as PublicEffects[]).map((k) => ({ value: k, label: publicEffectsLabel[k] }))} />
          </Field>
        </div>
      </Card>
      <Card title="Cierre">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Título de “Misión completada”"><TextInput value={cfg.closing.title} onChange={(v) => edit((d) => void (d.config.closing.title = v))} /></Field>
          <Field label="Pantalla final: título"><TextInput value={cfg.closing.finale.title} onChange={(v) => edit((d) => void (d.config.closing.finale.title = v))} /></Field>
          <Field label="Líneas de cierre (una por línea)"><LinesInput rows={8} value={cfg.closing.lines} onChange={(v) => edit((d) => void (d.config.closing.lines = v ?? []))} /></Field>
          <div className="grid content-start gap-3">
            <Field label="Pantalla final: líneas"><LinesInput rows={3} value={cfg.closing.finale.lines} onChange={(v) => edit((d) => void (d.config.closing.finale.lines = v ?? []))} /></Field>
            <Field label="Pantalla final: despedida"><TextInput value={cfg.closing.finale.signoff} onChange={(v) => edit((d) => void (d.config.closing.finale.signoff = v))} /></Field>
          </div>
        </div>
      </Card>
      <Card title="Bloques del día (tablero)">
        <div className="grid gap-2">
          {draft.chapters.map((ch, i) => (
            <div key={ch.id} className="grid grid-cols-[8rem_7rem_1fr] items-center gap-2">
              <span className="font-mono text-xs text-muted">{ch.id}</span>
              <TextInput value={ch.marker} onChange={(v) => edit((d) => void (d.chapters[i].marker = v))} />
              <TextInput value={ch.label} onChange={(v) => edit((d) => void (d.chapters[i].label = v))} />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Competencias (módulos)">
        <div className="grid gap-2 md:grid-cols-2">
          {draft.categories.map((c, i) => (
            <div key={c.id} className="grid grid-cols-[4rem_1fr] items-center gap-2">
              <TextInput value={c.icon} onChange={(v) => edit((d) => void (d.categories[i].icon = v))} />
              <TextInput value={c.label} onChange={(v) => edit((d) => void (d.categories[i].label = v))} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
