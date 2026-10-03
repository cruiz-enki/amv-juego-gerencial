import { FinalResults } from '../components/FinalResults'
import { Button } from '../components/ui/Button'
import { Eyebrow } from '../components/ui/Panel'
import { useGame } from '../state/useGame'

export function FinalScreen() {
  const { content, dispatch } = useGame()
  return (
    <main className="px-4 py-6 md:px-10 md:py-8">
      <div className="mb-8 animate-rise text-center">
        <Eyebrow className="text-accent">17:00 · Fin de la jornada</Eyebrow>
        <h1 className="mt-2 font-display text-6xl font-bold tracking-tight">Así dirigió cada equipo</h1>
        <p className="mt-3 text-xl text-muted">{content.config.title} · resultados finales</p>
      </div>
      <FinalResults />
      <div className="mt-10 flex justify-center">
        <Button size="lg" variant="primary" onClick={() => dispatch({ type: 'GO', screen: 'closing' })}>
          Cierre ▶
        </Button>
      </div>
    </main>
  )
}
