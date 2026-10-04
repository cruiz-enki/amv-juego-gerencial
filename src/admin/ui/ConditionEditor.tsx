import { useState } from 'react'
import type { Comparator, Condition, GameContent } from '../../engine/types'
import { describeCondition } from '../describe'
import { conditionShapeErrors } from '../validate'
import { NumberInput, Select, SmallButton, TextArea } from './fields'

type ClauseKind = 'indicator' | 'flag' | 'noflag' | 'chose' | 'outcome' | 'completed' | 'step' | 'spread'

const KIND_LABEL: Record<ClauseKind, string> = {
  indicator: 'Indicador',
  flag: 'Tiene bandera',
  noflag: 'NO tiene bandera',
  chose: 'Eligió opción en reto',
  outcome: 'Obtuvo resultado en reto',
  completed: 'Completó reto',
  step: 'Paso de la partida ≥',
  spread: 'Diferencia entre indicadores',
}
const OPS: { value: Comparator; label: string }[] = ['>=', '>', '<=', '<', '=='].map((v) => ({ value: v as Comparator, label: v === '==' ? '=' : v.replace('>=', '≥').replace('<=', '≤') }))

function kindOf(c: Condition): ClauseKind | null {
  if ('indicator' in c) return 'indicator'
  if ('flag' in c) return 'flag'
  if ('not' in c && 'flag' in c.not) return 'noflag'
  if ('chose' in c) return 'chose'
  if ('outcome' in c) return 'outcome'
  if ('completed' in c) return 'completed'
  if ('stepAtLeast' in c) return 'step'
  if ('spread' in c) return 'spread'
  return null
}

function defaultClause(kind: ClauseKind, content: GameContent): Condition {
  const ch = content.challenges[0]?.id ?? ''
  const flag = content.flags[0]?.id ?? ''
  switch (kind) {
    case 'indicator':
      return { indicator: content.indicators[0]?.id ?? '', op: '>=', value: 60 }
    case 'flag':
      return { flag }
    case 'noflag':
      return { not: { flag } }
    case 'chose':
      return { chose: { challenge: ch, option: 'a' } }
    case 'outcome':
      return { outcome: { challenge: ch, is: 'success' } }
    case 'completed':
      return { completed: ch }
    case 'step':
      return { stepAtLeast: 0 }
    case 'spread':
      return { spread: '<=', value: 20 }
  }
}

/** Divide la condición en cláusulas simples (si se puede editar con formulario). */
function toClauses(c: Condition | undefined): { combinator: 'all' | 'any'; clauses: Condition[] } | null {
  if (!c) return { combinator: 'all', clauses: [] }
  if ('all' in c || 'any' in c) {
    const list = 'all' in c ? c.all : c.any
    return list.every((x) => kindOf(x)) ? { combinator: 'all' in c ? 'all' : 'any', clauses: list } : null
  }
  return kindOf(c) ? { combinator: 'all', clauses: [c] } : null
}

function fromClauses(combinator: 'all' | 'any', clauses: Condition[]): Condition | undefined {
  if (clauses.length === 0) return undefined
  if (clauses.length === 1) return clauses[0]
  return combinator === 'all' ? { all: clauses } : { any: clauses }
}

export function ConditionEditor({ value, onChange, content, emptyLabel = 'Sin condición: siempre se cumple.' }: { value: Condition | undefined; onChange: (c: Condition | undefined) => void; content: GameContent; emptyLabel?: string }) {
  const parsed = toClauses(value)
  const [json, setJson] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState('')

  if (json !== null || !parsed) {
    const text = json ?? JSON.stringify(value, null, 2)
    return (
      <div className="grid gap-2">
        <p className="text-xs text-muted">Condición avanzada (JSON). {parsed ? '' : 'Es demasiado compleja para el formulario.'}</p>
        <TextArea rows={6} value={text} onChange={(t) => setJson(t)} />
        {jsonError && <p className="text-xs text-danger">{jsonError}</p>}
        <div className="flex gap-1.5">
          <SmallButton
            variant="primary"
            onClick={() => {
              try {
                const next = text.trim() ? (JSON.parse(text) as Condition) : undefined
                const errs = conditionShapeErrors(next)
                if (errs.length) return setJsonError(errs.join('; '))
                onChange(next)
                setJson(null)
                setJsonError('')
              } catch {
                setJsonError('JSON inválido')
              }
            }}
          >
            Aplicar
          </SmallButton>
          {parsed && <SmallButton onClick={() => setJson(null)}>Volver al formulario</SmallButton>}
        </div>
      </div>
    )
  }

  const { combinator, clauses } = parsed
  const set = (list: Condition[], comb = combinator) => onChange(fromClauses(comb, list))
  const update = (i: number, c: Condition) => set(clauses.map((x, j) => (j === i ? c : x)))
  const challenges = content.challenges.map((c) => ({ value: c.id, label: `${c.code ?? '—'} · ${c.title}` }))
  const flags = content.flags.map((f) => ({ value: f.id, label: `${f.id} — ${f.label}` }))

  return (
    <div className="grid gap-2">
      <p className="rounded-lg bg-deep/70 px-3 py-2 text-sm">
        <span className="text-muted">Se cumple cuando: </span>
        {clauses.length ? describeCondition(value, content) : emptyLabel}
      </p>
      {clauses.length > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Deben cumplirse</span>
          <Select value={combinator} onChange={(v) => set(clauses, v)} options={[{ value: 'all', label: 'todas' }, { value: 'any', label: 'al menos una' }]} />
        </div>
      )}
      {clauses.map((c, i) => {
        const kind = kindOf(c)!
        return (
          <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-deep/40 p-2">
            <div className="w-56">
              <Select value={kind} onChange={(k) => update(i, defaultClause(k, content))} options={(Object.keys(KIND_LABEL) as ClauseKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
            </div>
            {'indicator' in c && (
              <>
                <div className="w-40"><Select value={c.indicator} onChange={(v) => update(i, { ...c, indicator: v })} options={content.indicators.map((d) => ({ value: d.id, label: d.label }))} /></div>
                <div className="w-20"><Select value={c.op} onChange={(v) => update(i, { ...c, op: v })} options={OPS} /></div>
                <NumberInput className="!w-24" value={c.value} onChange={(v) => update(i, { ...c, value: v ?? 0 })} />
              </>
            )}
            {'flag' in c && <div className="min-w-64 flex-1"><Select value={c.flag} onChange={(v) => update(i, { flag: v })} options={flags} /></div>}
            {'not' in c && 'flag' in c.not && <div className="min-w-64 flex-1"><Select value={c.not.flag} onChange={(v) => update(i, { not: { flag: v } })} options={flags} /></div>}
            {'chose' in c && (
              <>
                <div className="min-w-56 flex-1"><Select value={c.chose.challenge} onChange={(v) => update(i, { chose: { ...c.chose, challenge: v } })} options={challenges} /></div>
                <div className="w-28"><Select value={c.chose.option} onChange={(v) => update(i, { chose: { ...c.chose, option: v } })} options={(content.challenges.find((x) => x.id === c.chose.challenge)?.options ?? []).map((o) => ({ value: o.id, label: `Opción ${o.id.toUpperCase()}` }))} /></div>
              </>
            )}
            {'outcome' in c && (
              <>
                <div className="min-w-56 flex-1"><Select value={c.outcome.challenge} onChange={(v) => update(i, { outcome: { ...c.outcome, challenge: v } })} options={challenges} /></div>
                <div className="w-40"><Select value={c.outcome.is} onChange={(v) => update(i, { outcome: { ...c.outcome, is: v } })} options={Object.entries(content.challenges.find((x) => x.id === c.outcome.challenge)?.outcomes ?? {}).map(([k, o]) => ({ value: k, label: o?.label ?? k }))} /></div>
              </>
            )}
            {'completed' in c && <div className="min-w-56 flex-1"><Select value={c.completed} onChange={(v) => update(i, { completed: v })} options={challenges} /></div>}
            {'stepAtLeast' in c && (
              <>
                <NumberInput className="!w-24" value={c.stepAtLeast + 1} onChange={(v) => update(i, { stepAtLeast: Math.max(0, (v ?? 1) - 1) })} />
                <span className="text-xs text-muted">(número de reto en la partida)</span>
              </>
            )}
            {'spread' in c && (
              <>
                <div className="w-20"><Select value={c.spread} onChange={(v) => update(i, { ...c, spread: v })} options={OPS} /></div>
                <NumberInput className="!w-24" value={c.value} onChange={(v) => update(i, { ...c, value: v ?? 0 })} />
              </>
            )}
            <SmallButton variant="ghost" onClick={() => set(clauses.filter((_, j) => j !== i))} title="Quitar">✕</SmallButton>
          </div>
        )
      })}
      <div className="flex gap-1.5">
        <SmallButton onClick={() => set([...clauses, defaultClause('indicator', content)])}>+ Agregar condición</SmallButton>
        <SmallButton variant="ghost" onClick={() => setJson(JSON.stringify(value ?? {}, null, 2))}>Editar como JSON</SmallButton>
      </div>
    </div>
  )
}
