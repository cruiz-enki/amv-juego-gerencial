import { FacilitatorPanel } from '../components/facilitator/FacilitatorPanel'
import { GameProgress } from '../components/GameProgress'
import { useGame } from '../state/useGame'

/** Vista para una segunda ventana/pantalla (laptop del facilitador). */
export function FacilitatorWindow() {
  const { state } = useGame()
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-deep/80">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-deep/95 px-5 py-3 backdrop-blur">
        <p className="font-display text-lg font-bold">🎛️ Facilitador</p>
        {state.status === 'playing' ? <GameProgress /> : <p className="text-sm text-muted">Sin partida en curso</p>}
      </header>
      {state.status === 'setup' ? (
        <p className="p-6 text-muted">Inicia una partida en la ventana principal (proyector). Este panel se sincroniza solo.</p>
      ) : (
        <FacilitatorPanel />
      )}
    </div>
  )
}
