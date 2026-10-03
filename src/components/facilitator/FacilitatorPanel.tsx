import { CurrentChallenge } from './CurrentChallenge'
import { EventControls } from './EventControls'
import { FlowControls } from './FlowControls'
import { GameAdmin } from './GameAdmin'
import { HistoryLog } from './HistoryLog'
import { ManualAdjust } from './ManualAdjust'
import { TimerControls } from './TimerControls'
import { TurnControls } from './TurnControls'

/** Todo lo que el facilitador necesita. Se usa como cajón o como ventana aparte. */
export function FacilitatorPanel() {
  return (
    <div className="text-base">
      <FlowControls />
      <CurrentChallenge />
      <TimerControls />
      <TurnControls />
      <EventControls />
      <ManualAdjust />
      <HistoryLog />
      <GameAdmin />
    </div>
  )
}
