import type {
  AgendaStep,
  Effect,
  GameContent,
  GameState,
  HistoryEntry,
  IndicatorSnapshot,
  TeamId,
  TeamState,
} from './types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function nextId(state: GameState, prefix: string): [string, GameState] {
  const seq = state.seq + 1
  return [`${prefix}${seq}`, { ...state, seq }]
}

function targetTeams(state: GameState, teamId: TeamId | 'all', effect: Effect): TeamState[] {
  if (teamId === 'all' || effect.target === 'all') return state.teams
  if (effect.target === 'others') return state.teams.filter((t) => t.id !== teamId)
  return state.teams.filter((t) => t.id === teamId)
}

function applyToTeam(team: TeamState, effect: Effect, content: GameContent): TeamState {
  const indicators = { ...team.indicators }
  for (const def of content.indicators) {
    const delta = effect.indicators?.[def.id]
    if (delta) indicators[def.id] = clamp((indicators[def.id] ?? def.initial) + delta, def.min, def.max)
  }
  const resources = { ...team.resources }
  for (const [id, delta] of Object.entries(effect.resources ?? {})) {
    if (delta) resources[id] = Math.max(0, (resources[id] ?? 0) + delta)
  }
  let flags = team.flags.filter((f) => !effect.clearFlags?.includes(f))
  for (const f of effect.setFlags ?? []) if (!flags.includes(f)) flags = [...flags, f]
  return { ...team, indicators, resources, flags }
}

export interface ApplyContext {
  kind: HistoryEntry['kind']
  at: number
  challenge?: string
  event?: string
  optionId?: string
  outcome?: HistoryEntry['outcome']
  bonusId?: string
  note?: string
  /** Dónde insertar un reto inyectado: antes del paso actual o después. */
  injectAt?: 'current' | 'next'
}

/**
 * Aplica un efecto y registra una entrada de historial por cada equipo afectado.
 * Devuelve el nuevo estado y el id de la entrada del equipo origen.
 */
export function applyEffect(
  state: GameState,
  teamId: TeamId | 'all',
  effect: Effect,
  content: GameContent,
  ctx: ApplyContext,
): { state: GameState; historyId: string } {
  let next = state
  const affected = new Set(targetTeams(state, teamId, effect).map((t) => t.id))
  // El equipo origen siempre queda registrado (aunque el efecto sea para "otros").
  if (teamId !== 'all') affected.add(teamId)

  const step = state.agenda[state.stepIndex]
  const chapter = ctx.challenge
    ? content.challenges.find((c) => c.id === ctx.challenge)?.chapter
    : step
      ? content.challenges.find((c) => c.id === step.challenge)?.chapter
      : undefined

  let originHistoryId = ''
  const entries: HistoryEntry[] = []
  const teams = next.teams.map((team) => {
    if (!affected.has(team.id)) return team
    const receives = teamId === 'all' || targetTeams(state, teamId, effect).some((t) => t.id === team.id)
    const updated = receives ? applyToTeam(team, effect, content) : team
    const [id, withSeq] = nextId(next, 'h')
    next = withSeq
    if (team.id === teamId || originHistoryId === '') originHistoryId = id
    entries.push({
      id,
      at: ctx.at,
      kind: ctx.kind,
      step: state.stepIndex,
      chapter,
      challenge: ctx.challenge,
      event: ctx.event,
      teamId: team.id,
      optionId: team.id === teamId ? ctx.optionId : undefined,
      outcome: team.id === teamId ? ctx.outcome : undefined,
      bonusId: team.id === teamId ? ctx.bonusId : undefined,
      before: snapshot(team),
      after: snapshot(updated),
      resourcesBefore: { ...team.resources },
      resourcesAfter: { ...updated.resources },
      flagsAdded: updated.flags.filter((f) => !team.flags.includes(f)),
      note: ctx.note,
    })
    return updated
  })

  // Consecuencias diferidas e inyección de retos (sólo para el equipo origen).
  let pending = next.pending
  let agenda = next.agenda
  if (teamId !== 'all') {
    for (const s of effect.schedule ?? []) {
      pending = [
        ...pending,
        { event: s.event, teamId, dueStep: state.stepIndex + s.afterSteps, sourceChallenge: ctx.challenge },
      ]
    }
  }
  if (effect.injectChallenge && content.challenges.find((c) => c.id === effect.injectChallenge)?.active !== false) {
    const [uid, withSeq] = nextId(next, 's')
    next = withSeq
    const injected: AgendaStep = {
      uid,
      challenge: effect.injectChallenge,
      turnMode: 'active-team',
      status: 'pending',
      teamId: teamId === 'all' ? undefined : teamId,
      injected: true,
    }
    const at = ctx.injectAt === 'current' ? state.stepIndex : state.stepIndex + 1
    agenda = [...agenda.slice(0, at), injected, ...agenda.slice(at)]
  }

  return {
    state: { ...next, teams, pending, agenda, history: [...next.history, ...entries] },
    historyId: originHistoryId,
  }
}

export function snapshot(team: TeamState): IndicatorSnapshot {
  return { ...team.indicators }
}
