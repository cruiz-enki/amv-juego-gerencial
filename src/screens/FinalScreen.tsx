import { FinalResults } from '../components/FinalResults'
import { Eyebrow } from '../components/ui/Panel'
import { useGame } from '../state/useGame'

export function FinalScreen() {
  const { content } = useGame()
  return (
    <main className="px-4 py-6 md:px-10 md:py-8">
      <div className="mb-8 animate-rise text-center">
        <Eyebrow className="text-accent">17:00 · Fin del día</Eyebrow>
        <h1 className="mt-2 font-display text-6xl font-bold tracking-tight">Así dirigió cada comité</h1>
        <p className="mt-3 text-xl text-muted">{content.config.title} · resultados finales</p>
      </div>
      <FinalResults />
    </main>
  )
}
