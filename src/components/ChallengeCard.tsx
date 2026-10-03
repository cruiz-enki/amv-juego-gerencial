import { evaluate } from '../engine/conditions'
import type { Challenge, TeamState } from '../engine/types'
import { challengeTypeMeta, OPTION_LETTERS } from '../lib/labels'
import { useGame } from '../state/useGame'
import { Chip } from './ui/Panel'

interface Props {
  challenge: Challenge
  injected?: boolean
  dense?: boolean
  /** Equipo que resuelve (para textos condicionados a su historial). */
  team?: TeamState
}

/** Todo lo PÚBLICO de un reto. Nada de lo privado del facilitador pasa por aquí. */
export function ChallengeCard({ challenge, injected = false, dense = false, team }: Props) {
  const { state, content } = useGame()
  const type = challengeTypeMeta[challenge.type]
  const callbacks = team ? (challenge.callbacks ?? []).filter((cb) => evaluate(cb.when, team, state)) : []
  const text = dense ? 'text-xl' : 'text-2xl'

  return (
    <article className="animate-rise">
      {challenge.ambience === 'crisis' && (
        <p className="mb-4 animate-pulse font-display text-3xl font-bold tracking-[0.25em] text-danger" role="alert">
          🚨 ALERTA · ALERTA · ALERTA
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {challenge.clock && <span className="font-display text-2xl font-bold text-accent">{challenge.clock}</span>}
        <Chip color={type.color} className="bg-black/20 text-base font-bold">
          <span aria-hidden>{type.icon}</span> {type.label}
        </Chip>
        {challenge.inPerson && <Chip color="var(--color-accent-2)">🏃 Presencial</Chip>}
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
      <h1 className={`font-display leading-tight font-bold tracking-tight text-balance ${dense ? 'text-4xl' : 'text-5xl'}`}>
        {challenge.title}
      </h1>
      <p className={`max-w-[62ch] leading-relaxed text-text/90 text-pretty ${dense ? 'mt-3' : 'mt-5'} ${text}`}>{challenge.narrative}</p>

      {challenge.items && challenge.items.length > 0 && (
        <ol className={`grid gap-x-8 gap-y-1.5 ${dense ? 'mt-3' : 'mt-5'} ${challenge.items.length > 5 ? 'lg:grid-cols-2' : ''}`}>
          {challenge.items.map((item, i) => (
            <li key={i} className={`flex gap-3 ${dense ? 'text-lg' : 'text-xl'}`}>
              <span className="w-6 shrink-0 font-display font-bold text-accent-2">
                {challenge.itemStyle === 'letter' ? OPTION_LETTERS[i] ?? '•' : challenge.itemStyle === 'bullet' ? '•' : i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )}

      {challenge.table && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-1.5 text-lg">
            <thead>
              <tr className="text-left text-sm tracking-widest text-muted uppercase">
                <th className="px-3" />
                {challenge.table.columns.map((c) => (
                  <th key={c} className="px-3 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {challenge.table.rows.map((row) => (
                <tr key={row.label} className="bg-panel/80">
                  <th className="rounded-l-xl px-3 py-2 text-left font-display font-bold">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className="px-3 py-2 last:rounded-r-xl">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {challenge.instructions && challenge.instructions.length > 0 && (
        <ul className={`grid ${dense ? 'mt-4 gap-1' : 'mt-6 gap-2'}`}>
          {challenge.instructions.map((line, i) => (
            <li key={i} className={`flex gap-3 text-muted ${dense ? 'text-lg' : 'text-xl'}`}>
              <span className="text-accent">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {callbacks.map((cb, i) => (
        <div key={i} className="mt-6 animate-pop rounded-2xl border-2 border-accent-2/60 bg-accent-2/10 p-5">
          {cb.title && <p className="mb-1 font-display text-lg font-bold text-accent-2">{cb.title}</p>}
          <p className="text-xl">{cb.text}</p>
        </div>
      ))}

      {challenge.followUp && state.showFollowUp && (
        <div className="mt-6 animate-pop rounded-2xl border border-accent/50 bg-accent/10 p-5">
          <p className="mb-2 font-display text-xl font-bold text-accent">{challenge.followUp.title}</p>
          <ol className="grid gap-1">
            {challenge.followUp.items.map((q, i) => (
              <li key={i} className="text-xl">
                {challenge.followUp!.items.length > 1 && <span className="mr-2 font-bold text-accent">{i + 1}.</span>}
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  )
}
