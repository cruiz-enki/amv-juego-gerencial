import { useGame } from '../state/useGame'
import { GameProgress } from './GameProgress'

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen().catch(() => {})
}

export function TopBar({ onOpenFacilitator }: { onOpenFacilitator: () => void }) {
  const { state, content, dispatch } = useGame()
  const iconBtn = 'grid size-11 place-items-center rounded-xl border border-line bg-panel/70 text-xl hover:border-line-strong'
  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-ink/60 px-4 py-3 md:gap-6 md:px-8 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <img src="/favicon.svg" alt="" className="size-10" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate font-display text-xl font-bold tracking-tight">{content.config.title}</p>
          <p className="truncate text-xs tracking-widest text-muted uppercase">Centro de mando</p>
        </div>
      </div>
      {state.status === 'playing' && (
        <div className="hidden md:block">
          <GameProgress />
        </div>
      )}
      <nav className="flex items-center gap-2">
        {state.status !== 'setup' && (
          <button
            className={`${iconBtn} ${state.screen === 'scoreboard' ? 'border-accent' : ''}`}
            onClick={() => dispatch({ type: 'GO', screen: state.screen === 'scoreboard' ? 'dashboard' : 'scoreboard' })}
            title="Marcador"
            aria-label="Marcador"
          >
            📊
          </button>
        )}
        <button className={iconBtn} onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} title={state.soundOn ? 'Silenciar' : 'Activar sonido'} aria-label="Sonido">
          {state.soundOn ? '🔊' : '🔇'}
        </button>
        <button className={iconBtn} onClick={toggleFullscreen} title="Pantalla completa" aria-label="Pantalla completa">
          ⛶
        </button>
        {state.status !== 'setup' && (
          <button
            className="flex h-11 items-center gap-2 rounded-xl border border-accent-2/50 bg-accent-2/10 px-4 font-semibold text-accent-2 hover:bg-accent-2/20"
            onClick={onOpenFacilitator}
            title="Panel del facilitador (tecla F)"
          >
            🎛️ <span className="hidden sm:inline">Facilitador</span>
          </button>
        )}
      </nav>
    </header>
  )
}
