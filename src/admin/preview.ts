import { createReducer, emptyState } from '../engine/reducer'
import type { GameContent, GameState } from '../engine/types'

/**
 * Partida de mentira para previsualizar un reto o evento con el contenido del
 * borrador. Usa el mismo motor y las mismas pantallas que el proyector.
 */
export function previewState(content: GameContent, kind: 'challenge' | 'event', id: string, teams = 4): GameState {
  const reduce = createReducer(content)
  const presets = content.teamPresets.length ? content.teamPresets : [{ name: 'Equipo', icon: '★', color: '#38e1ff' }]
  let s = reduce(emptyState(0), {
    type: 'START_GAME',
    now: 1,
    teams: Array.from({ length: teams }, (_, i) => {
      const p = presets[i % presets.length]
      return { name: `Equipo ${p.name}`, icon: p.icon, color: p.color }
    }),
  })
  if (kind === 'challenge') {
    const ch = content.challenges.find((c) => c.id === id)
    const duration = ch?.durationSec ?? 0
    s = {
      ...s,
      status: 'playing',
      agenda: [{ uid: 'preview', challenge: id, turnMode: ch?.turnMode ?? content.config.defaultTurnMode, status: 'pending' }],
      stepIndex: 0,
      activeTeamIndex: 0,
      screen: 'challenge',
      eventQueue: [],
      timer: { durationSec: duration, startedAt: null, remainingSec: duration },
    }
  } else {
    const ev = content.events.find((e) => e.id === id)
    s = { ...s, status: 'playing', screen: 'dashboard', eventQueue: [{ uid: 'preview', event: id, teamId: ev?.effect.target === 'all' ? 'all' : 't1', reason: 'manual' }] }
  }
  return s
}
