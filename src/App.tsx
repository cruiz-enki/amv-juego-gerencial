import { useCallback, useEffect, useState } from 'react'
import { SoundDirector } from './audio/SoundDirector'
import { EventModal } from './components/EventModal'
import { FacilitatorDrawer } from './components/facilitator/FacilitatorDrawer'
import { PauseOverlay } from './components/PauseOverlay'
import { TopBar } from './components/TopBar'
import { ChallengeScreen } from './screens/ChallengeScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { FacilitatorWindow } from './screens/FacilitatorWindow'
import { FinalScreen } from './screens/FinalScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ScoreboardScreen } from './screens/ScoreboardScreen'
import { SetupScreen } from './screens/SetupScreen'
import { useGame } from './state/useGame'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  return hash === '#/facilitador' ? <FacilitatorWindow /> : <ProjectorApp />
}

function ProjectorApp() {
  const { state } = useGame()
  const [drawer, setDrawer] = useState(false)
  const close = useCallback(() => setDrawer(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement
      if (!typing && e.key.toLowerCase() === 'f' && state.status !== 'setup') setDrawer((d) => !d)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.status])

  if (state.status === 'setup') {
    return state.screen === 'setup' ? <SetupScreen /> : <HomeScreen />
  }

  const screen = {
    home: <DashboardScreen />,
    setup: <DashboardScreen />,
    dashboard: <DashboardScreen />,
    challenge: <ChallengeScreen />,
    scoreboard: <ScoreboardScreen />,
    final: <FinalScreen />,
  }[state.screen]

  return (
    <div className="min-h-screen">
      <SoundDirector />
      <TopBar onOpenFacilitator={() => setDrawer(true)} />
      {screen}
      <EventModal />
      <PauseOverlay />
      <FacilitatorDrawer open={drawer} onClose={close} />
    </div>
  )
}
