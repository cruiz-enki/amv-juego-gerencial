import type { Challenge } from '../engine/types'
import { challengeTypeMeta } from '../lib/labels'
import { useGame } from '../state/useGame'
import { Chip } from './ui/Panel'

export function ChallengeCard({ challenge, injected = false }: { challenge: Challenge; injected?: boolean }) {
  const { content } = useGame()
  const type = challengeTypeMeta[challenge.type]
  return (
    <article className="animate-rise">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip color={type.color} className="bg-black/20 text-base font-bold">
          <span aria-hidden>{type.icon}</span> {type.label}
        </Chip>
        {injected && <Chip color="var(--color-danger)">⚡ Consecuencia</Chip>}
        {challenge.categories.map((id) => {
          const cat = content.categories.find((c) => c.id === id)
          return (
            <Chip key={id} className="border-line text-muted">
              <span aria-hidden>{cat?.icon}</span> {cat?.label ?? id}
            </Chip>
          )
        })}
      </div>
      <h1 className="font-display text-5xl leading-tight font-bold tracking-tight text-balance">{challenge.title}</h1>
      <p className="mt-5 max-w-[60ch] text-2xl leading-relaxed text-text/90 text-pretty">{challenge.narrative}</p>
      {challenge.instructions && challenge.instructions.length > 0 && (
        <ul className="mt-6 grid gap-2">
          {challenge.instructions.map((line, i) => (
            <li key={i} className="flex gap-3 text-xl text-muted">
              <span className="font-display font-bold text-accent">{i + 1}</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
