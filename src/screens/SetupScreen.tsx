import { useState } from 'react'
import { TeamBadge } from '../components/TeamBadge'
import { Button } from '../components/ui/Button'
import { Eyebrow, Panel } from '../components/ui/Panel'
import type { NewTeam } from '../engine/reducer'
import { useGame } from '../state/useGame'

export function SetupScreen() {
  const { content, dispatch } = useGame()
  const { min, max, default: initialCount } = content.config.teams
  const presets = content.teamPresets
  const preset = (i: number): NewTeam => {
    const p = presets[i % presets.length]
    return { name: `Equipo ${p.name}`, icon: p.icon, color: p.color }
  }
  const [teams, setTeams] = useState<NewTeam[]>(() => Array.from({ length: initialCount }, (_, i) => preset(i)))

  const setCount = (n: number) => {
    const count = Math.min(max, Math.max(min, n))
    setTeams((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? preset(i)))
  }
  const update = (i: number, patch: Partial<NewTeam>) =>
    setTeams((prev) => prev.map((t, j) => (j === i ? { ...t, ...patch } : t)))

  const valid = teams.every((t) => t.name.trim().length > 0)

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <button onClick={() => dispatch({ type: 'GO', screen: 'home' })} className="mb-6 text-muted hover:text-text">
        ← Volver
      </button>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Configurar partida</Eyebrow>
          <h1 className="font-display text-5xl font-bold">¿Quiénes toman el mando?</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg text-muted">Equipos</span>
          <Button onClick={() => setCount(teams.length - 1)} disabled={teams.length <= min} aria-label="Menos equipos">−</Button>
          <span className="w-10 text-center font-display text-4xl font-bold tabular-nums">{teams.length}</span>
          <Button onClick={() => setCount(teams.length + 1)} disabled={teams.length >= max} aria-label="Más equipos">+</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team, i) => (
          <Panel key={i} className="animate-rise p-5" style={{ borderColor: `color-mix(in oklab, ${team.color} 45%, transparent)` }}>
            <div className="mb-4 flex items-center gap-3">
              <TeamBadge team={team} size="lg" />
              <input
                value={team.name}
                onChange={(e) => update(i, { name: e.target.value })}
                maxLength={28}
                aria-label={`Nombre del equipo ${i + 1}`}
                className="min-w-0 flex-1 rounded-xl border border-line-strong bg-deep px-3 py-2.5 font-display text-xl font-bold outline-none focus:border-accent"
              />
            </div>
            <p className="mb-1.5 text-sm text-muted">Ícono</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.icon}
                  onClick={() => update(i, { icon: p.icon })}
                  className={`grid size-10 place-items-center rounded-lg border text-xl ${team.icon === p.icon ? 'border-accent bg-accent/10' : 'border-line hover:border-line-strong'}`}
                  aria-label={`Ícono ${p.name}`}
                >
                  {p.icon}
                </button>
              ))}
            </div>
            <p className="mb-1.5 text-sm text-muted">Color</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.color}
                  onClick={() => update(i, { color: p.color })}
                  className={`size-8 rounded-full border-2 ${team.color === p.color ? 'border-text' : 'border-transparent'}`}
                  style={{ background: p.color }}
                  aria-label={`Color ${p.name}`}
                />
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Button size="lg" variant="primary" disabled={!valid} onClick={() => dispatch({ type: 'START_GAME', teams })}>
          Comenzar el día ▶
        </Button>
      </div>
    </main>
  )
}
