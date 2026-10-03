import { Button } from '../components/ui/Button'
import { useGame } from '../state/useGame'

export function HomeScreen() {
  const { content, dispatch } = useGame()
  const { config } = content
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[60rem] -translate-1/2 rounded-full border border-accent/10" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[40rem] -translate-1/2 rounded-full border border-accent/15" aria-hidden />
      <div className="relative max-w-5xl animate-rise text-center">
        <p className="mb-6 font-display text-lg font-semibold tracking-[0.35em] text-accent uppercase">Simulador gerencial</p>
        <h1 className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.9] font-bold tracking-tighter">
          {config.title}
        </h1>
        <p className="mt-6 text-2xl text-muted">{config.subtitle}</p>
        <p className="mx-auto mt-8 max-w-[52ch] text-2xl leading-relaxed text-text/90 text-pretty">{config.premise}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {content.indicators.map((d) => (
            <span key={d.id} className="rounded-full border border-line-strong bg-panel/60 px-4 py-2 text-lg" style={{ color: d.color }}>
              {d.icon} {d.label}
            </span>
          ))}
        </div>
        <Button size="lg" variant="primary" className="mt-12" onClick={() => dispatch({ type: 'GO', screen: 'setup' })}>
          Nueva partida ▶
        </Button>
        <p className="mt-6 text-sm text-faint">
          {config.agenda.length} retos · {content.events.length} eventos posibles · ~{config.targetMinutes} min
        </p>
      </div>
    </main>
  )
}
