import { globalIndex } from '../engine/selectors'
import { useGame } from '../state/useGame'
import { IndicatorBar } from './IndicatorBar'
import { TeamBadge } from './TeamBadge'

/** Comparativo de equipos por indicador (no sólo "puntos"). */
export function Scoreboard() {
  const { state, content } = useGame()
  const teams = [...state.teams].sort(
    (a, b) => globalIndex(b, content.indicators) - globalIndex(a, content.indicators),
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-sm tracking-widest text-muted uppercase">
            <th className="px-3 font-semibold">Equipo</th>
            {content.indicators.map((d) => (
              <th key={d.id} className="px-3 font-semibold">
                <span aria-hidden>{d.icon}</span> {d.label}
              </th>
            ))}
            <th className="px-3 text-right font-semibold">Índice</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr key={team.id} className="animate-rise bg-panel/80" style={{ animationDelay: `${i * 60}ms` }}>
              <td className="rounded-l-2xl px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-display text-xl font-bold text-faint">{i + 1}</span>
                  <TeamBadge team={team} size="sm" />
                  <span className="font-display text-xl font-bold">{team.name}</span>
                </div>
              </td>
              {content.indicators.map((d) => (
                <td key={d.id} className="w-[14%] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <IndicatorBar def={d} value={team.indicators[d.id] ?? d.initial} showLabel={false} />
                    </div>
                    <span className="w-9 text-right font-display text-lg font-bold tabular-nums">{team.indicators[d.id]}</span>
                  </div>
                </td>
              ))}
              <td className="rounded-r-2xl px-3 py-3 text-right font-display text-3xl font-bold text-accent tabular-nums">
                {globalIndex(team, content.indicators)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
