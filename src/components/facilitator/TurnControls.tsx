import { useGame } from '../../state/useGame'
import { TeamBadge } from '../TeamBadge'
import { Section } from './Section'

export function TurnControls() {
  const { state, dispatch } = useGame()
  return (
    <Section title="Equipo en turno">
      <div className="flex flex-wrap gap-2">
        {state.teams.map((team, i) => (
          <button
            key={team.id}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TEAM', index: i })}
            className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-sm font-semibold ${
              i === state.activeTeamIndex ? 'border-accent bg-accent/10' : 'border-line hover:border-line-strong'
            }`}
          >
            <TeamBadge team={team} size="sm" /> {team.name}
          </button>
        ))}
      </div>
    </Section>
  )
}
