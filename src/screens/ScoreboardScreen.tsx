import { Scoreboard } from '../components/Scoreboard'
import { Button } from '../components/ui/Button'
import { Eyebrow } from '../components/ui/Panel'
import { useGame } from '../state/useGame'

export function ScoreboardScreen() {
  const { state, dispatch } = useGame()
  return (
    <main className="px-4 py-6 md:px-10 md:py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Marcador</Eyebrow>
          <h1 className="font-display text-5xl font-bold">Estado de los comités</h1>
        </div>
        <Button onClick={() => dispatch({ type: 'GO', screen: state.status === 'finished' ? 'final' : 'dashboard' })}>
          ← Volver
        </Button>
      </div>
      <Scoreboard />
    </main>
  )
}
