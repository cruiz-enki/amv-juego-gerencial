import { challengeById } from '../engine/selectors'
import type { AgendaStep } from '../engine/types'
import { challengeTypeMeta } from '../lib/labels'
import { useGame } from '../state/useGame'

/**
 * Mapa de misión: las etapas del día (capítulos) como estaciones y cada paso
 * de la agenda como un nodo. Todo se deriva de la configuración.
 */
export function GameBoard() {
  const { state, content } = useGame()
  const stepsByChapter = new Map<string, { step: AgendaStep; index: number }[]>()
  state.agenda.forEach((step, index) => {
    const chapter = challengeById(content, step.challenge)?.chapter ?? ''
    stepsByChapter.set(chapter, [...(stepsByChapter.get(chapter) ?? []), { step, index }])
  })
  const currentChapter = challengeById(content, state.agenda[state.stepIndex]?.challenge)?.chapter
  const currentChapterIdx = content.chapters.findIndex((c) => c.id === currentChapter)

  return (
    <div className="relative">
      <div className="absolute top-[1.35rem] right-[4%] left-[4%] h-0.5 bg-line-strong" aria-hidden />
      <div
        className="absolute top-[1.35rem] left-[4%] h-0.5 bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-700"
        style={{
          width: `${(Math.max(0, currentChapterIdx === -1 ? content.chapters.length - 1 : currentChapterIdx) / Math.max(1, content.chapters.length - 1)) * 92}%`,
        }}
        aria-hidden
      />
      <ol className="relative grid gap-2" style={{ gridTemplateColumns: `repeat(${content.chapters.length}, minmax(0, 1fr))` }}>
        {content.chapters.map((chapter, ci) => {
          const steps = stepsByChapter.get(chapter.id) ?? []
          const isCurrent = chapter.id === currentChapter
          const isPast = currentChapterIdx === -1 || ci < currentChapterIdx
          return (
            <li key={chapter.id} className="flex flex-col items-center text-center">
              <span
                className={`grid size-11 place-items-center rounded-full border-2 font-display text-sm font-bold ${
                  isCurrent
                    ? 'animate-pulse-ring border-accent bg-accent text-ink'
                    : isPast
                      ? 'border-accent-2 bg-accent-2/20 text-accent-2'
                      : 'border-line-strong bg-deep text-faint'
                }`}
              >
                {isPast && !isCurrent ? '✓' : ci + 1}
              </span>
              <p className={`mt-2 font-display text-lg font-bold ${isCurrent ? 'text-accent' : isPast ? 'text-text' : 'text-faint'}`}>
                {chapter.marker}
              </p>
              <p className={`text-sm leading-tight ${isCurrent ? 'text-text' : 'text-muted'}`}>{chapter.label}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {steps.map(({ step, index }) => (
                  <StepNode key={step.uid} step={step} current={index === state.stepIndex} />
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function StepNode({ step, current }: { step: AgendaStep; current: boolean }) {
  const { state, content } = useGame()
  const challenge = challengeById(content, step.challenge)
  const meta = challenge ? challengeTypeMeta[challenge.type] : undefined
  const team = state.teams.find((t) => t.id === step.teamId)
  const title = `${challenge?.title ?? step.challenge}${step.injected ? ' (inyectado)' : ''}`
  const base = 'relative grid size-9 place-items-center rounded-xl border text-base transition'
  const style =
    step.status === 'done'
      ? 'border-transparent bg-white/10'
      : step.status === 'skipped'
        ? 'border-dashed border-line-strong opacity-40'
        : current
          ? 'border-accent bg-accent/15 scale-110 shadow-[0_0_18px_rgb(56_225_255/0.5)]'
          : 'border-line bg-deep/60 opacity-60'
  return (
    <span className={`${base} ${style}`} title={title}>
      <span aria-hidden>{step.status === 'skipped' ? '–' : meta?.icon}</span>
      <span className="sr-only">{title}</span>
      {step.status === 'done' && (
        <span
          className="absolute -right-1 -bottom-1 size-3.5 rounded-full border-2 border-ink"
          style={{ background: team?.color ?? 'var(--color-accent-2)' }}
          aria-hidden
        />
      )}
      {step.injected && <span className="absolute -top-1.5 -right-1.5 text-xs" aria-hidden>⚡</span>}
    </span>
  )
}
