import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { SoundDirector } from './audio/SoundDirector'
import { EventModal } from './components/EventModal'
import { FacilitatorDrawer } from './components/facilitator/FacilitatorDrawer'
import { PauseOverlay } from './components/PauseOverlay'
import { TopBar } from './components/TopBar'
import { ChallengeScreen } from './screens/ChallengeScreen'
import { ClosingScreen } from './screens/ClosingScreen'
import { CreditsScreen } from './screens/CreditsScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { FacilitatorWindow } from './screens/FacilitatorWindow'
import { FinalScreen } from './screens/FinalScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PrivateView } from './screens/PrivateView'
import { ScoreboardScreen } from './screens/ScoreboardScreen'
import { SetupScreen } from './screens/SetupScreen'
import { useGame } from './state/useGame'

type Route = 'projector' | 'facilitator' | 'private' | 'admin'

/** Rutas: /facilitador y /privado (también aceptan #/facilitador y #/privado). */
// /admin se carga aparte: el proyector no descarga el código del editor.
const AdminApp = lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })))

function readRoute(): Route {
  const path = `${window.location.pathname}${window.location.hash}`.toLowerCase()
  if (window.location.pathname.toLowerCase().startsWith('/admin')) return 'admin'
  if (path.includes('facilitador')) return 'facilitator'
  if (path.includes('privado')) return 'private'
  return 'projector'
}

function useRoute(): Route {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  if (route === 'facilitator') return <FacilitatorWindow />
  if (route === 'private') return <PrivateView />
  if (route === 'admin')
    return (
      <Suspense fallback={<p className="p-8 text-muted">Cargando administración…</p>}>
        <AdminApp />
      </Suspense>
    )
  return <ProjectorApp />
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
    closing: <ClosingScreen />,
    credits: <CreditsScreen />,
  }[state.screen]

  // La pantalla final se proyecta limpia, sin barra superior.
  if (state.screen === 'credits') {
    return (
      <>
        <CreditsScreen />
        <FacilitatorDrawer open={drawer} onClose={close} />
      </>
    )
  }

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
