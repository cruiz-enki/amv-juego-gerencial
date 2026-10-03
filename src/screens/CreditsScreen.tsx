import { useGame } from '../state/useGame'

/** Pantalla final para dejar proyectada. */
export function CreditsScreen() {
  const { content, dispatch } = useGame()
  const { finale } = content.config.closing
  return (
    <main
      className="relative grid min-h-screen cursor-default place-items-center overflow-hidden px-6"
      onDoubleClick={() => dispatch({ type: 'GO', screen: 'final' })}
      title="Doble clic para volver a resultados"
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[60rem] -translate-1/2 rounded-full border border-accent/10" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[40rem] -translate-1/2 animate-pulse rounded-full border border-accent/20" aria-hidden />
      <div className="relative animate-pop text-center">
        <h1 className="font-display text-[clamp(4rem,10vw,10rem)] leading-none font-bold tracking-tighter uppercase">{finale.title}</h1>
        {finale.lines.map((l) => (
          <p key={l} className="mt-4 text-3xl text-muted">
            {l}
          </p>
        ))}
        <p className="mt-12 font-display text-5xl font-bold text-accent">{finale.signoff}</p>
      </div>
    </main>
  )
}
