import { useState } from 'react'
import { useGame } from '../../state/useGame'
import { Section } from './Section'

const STEPS = [-5, -1, 1, 5]

export function ManualAdjust() {
  const { state, content, dispatch } = useGame()
  const [teamId, setTeamId] = useState(state.teams[0]?.id ?? '')
  const team = state.teams.find((t) => t.id === teamId) ?? state.teams[0]
  if (!team) return null

  const row = (key: string, icon: string, label: string, value: number, onDelta: (d: number) => void) => (
    <div key={key} className="flex items-center gap-2 text-sm">
      <span className="w-32 truncate">
        {icon} {label}
      </span>
      <span className="w-8 text-right font-display font-bold tabular-nums">{value}</span>
      <span className="ml-auto flex gap-1">
        {STEPS.map((d) => (
          <button
            key={d}
            onClick={() => onDelta(d)}
            className={`w-10 rounded-md border border-line py-1 font-semibold tabular-nums hover:border-line-strong ${d > 0 ? 'text-success' : 'text-danger'}`}
          >
            {d > 0 ? '+' : ''}
            {d}
          </button>
        ))}
      </span>
    </div>
  )

  return (
    <Section title="Ajuste manual">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {state.teams.map((t) => (
          <button
            key={t.id}
            onClick={() => setTeamId(t.id)}
            className={`rounded-lg border px-2 py-1 text-sm ${t.id === team.id ? 'border-accent bg-accent/10' : 'border-line'}`}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>
      <div className="grid gap-1.5">
        {content.indicators.map((d) =>
          row(d.id, d.icon, d.label, team.indicators[d.id] ?? 0, (delta) =>
            dispatch({ type: 'ADJUST', teamId: team.id, indicator: d.id, delta }),
          ),
        )}
        {content.resources.map((r) =>
          row(`r-${r.id}`, r.icon, r.label, team.resources[r.id] ?? 0, (delta) =>
            dispatch({ type: 'ADJUST', teamId: team.id, resource: r.id, delta: Math.sign(delta) }),
          ),
        )}
      </div>
      <div className="mt-3 text-sm">
        <p className="mb-1 text-muted">Banderas ocultas (afectan eventos futuros):</p>
        {team.flags.length === 0 ? (
          <p className="text-faint">Ninguna</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {team.flags.map((f) => (
              <button
                key={f}
                title="Quitar bandera"
                onClick={() => dispatch({ type: 'TOGGLE_FLAG', teamId: team.id, flag: f })}
                className="rounded-full border border-accent-2/40 px-2 py-0.5 text-accent-2"
              >
                {f} ✕
              </button>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
