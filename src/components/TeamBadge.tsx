import type { TeamState } from '../engine/types'

export function TeamBadge({ team, size = 'md' }: { team: Pick<TeamState, 'icon' | 'color' | 'name'>; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dims = { sm: 'size-8 text-base', md: 'size-11 text-2xl', lg: 'size-16 text-4xl', xl: 'size-24 text-6xl' }[size]
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-2xl ${dims}`}
      style={{
        background: `color-mix(in oklab, ${team.color} 18%, transparent)`,
        boxShadow: `inset 0 0 0 2px color-mix(in oklab, ${team.color} 65%, transparent)`,
      }}
      aria-label={team.name}
    >
      <span aria-hidden>{team.icon}</span>
    </span>
  )
}
