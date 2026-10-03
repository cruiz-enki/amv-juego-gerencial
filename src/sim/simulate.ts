import { content } from '../content'
import { bonusesUsed, createReducer, emptyState, type ActionInput } from '../engine/reducer'
import { computeAwards, summarizeTeam } from '../engine/results'
import { resolvers } from '../engine/selectors'
import type { Bonus, Challenge, ChallengeOption, Effect, GameState, Outcome } from '../engine/types'
import { outcomeTone } from '../lib/labels'

/**
 * Simulador de partidas para revisar el balance. Cada "estrategia" imita un
 * estilo de juego; el facilitador se simula con una calidad de respuesta.
 */
export type Strategy = 'aleatoria' | 'optima' | 'conservadora' | 'resultados' | 'personas'
export const STRATEGIES: Strategy[] = ['aleatoria', 'optima', 'conservadora', 'resultados', 'personas']

const WEIGHTS: Record<Strategy, Record<string, number>> = {
  aleatoria: {},
  optima: { resultados: 1, equipo: 1, liderazgo: 1, recursos: 1, reputacion: 1 },
  conservadora: { resultados: 0.6, equipo: 1, liderazgo: 0.8, recursos: 1.6, reputacion: 1 },
  resultados: { resultados: 3, equipo: 0.4, liderazgo: 0.8, recursos: 1.2, reputacion: 0.6 },
  personas: { resultados: 0.5, equipo: 3, liderazgo: 2, recursos: 0.5, reputacion: 1.5 },
}

/** Probabilidad de que el facilitador califique éxito / parcial / fallo. */
const QUALITY: Record<Strategy, [number, number]> = {
  aleatoria: [1 / 3, 2 / 3],
  optima: [1, 1],
  conservadora: [0.35, 0.85],
  resultados: [0.45, 0.75],
  personas: [0.45, 0.75],
}

/** Probabilidad de que el equipo "ignore" algo marcado por el facilitador (reto 01, etc.). */
const FLAG_RATE: Record<Strategy, number> = { aleatoria: 0.25, optima: 0, conservadora: 0.1, resultados: 0.35, personas: 0.15 }

const reduce = createReducer(content)

function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32)
}

function score(effect: Effect | undefined, strategy: Strategy): number {
  if (!effect) return 0
  const w = WEIGHTS[strategy]
  let total = 0
  for (const [id, d] of Object.entries(effect.indicators ?? {})) {
    const weight = w[id] ?? 1
    // La estrategia conservadora pesa doble las pérdidas.
    total += (d ?? 0) * weight * (strategy === 'conservadora' && (d ?? 0) < 0 ? 2 : 1)
  }
  for (const s of effect.schedule ?? []) total += score(content.events.find((e) => e.id === s.event)?.effect, strategy)
  return total
}

function pickOption(options: ChallengeOption[], strategy: Strategy, rand: () => number) {
  if (strategy === 'aleatoria') return options[Math.floor(rand() * options.length)]
  return [...options].sort((a, b) => score(b.effect, strategy) - score(a.effect, strategy))[0]
}

function pickOutcome(challenge: Challenge, strategy: Strategy, rand: () => number): string {
  const entries = Object.entries(challenge.outcomes ?? {}).filter(([, o]) => o) as [string, Outcome][]
  if (strategy === 'aleatoria') return entries[Math.floor(rand() * entries.length)][0]
  const r = rand()
  const [pSuccess, pPartial] = QUALITY[strategy]
  const tone = r < pSuccess ? 'success' : r < pPartial ? 'partial' : 'fail'
  const matching = entries.filter(([k, o]) => outcomeTone(k, o) === tone)
  const pool = matching.length ? matching : entries
  return pool[Math.floor(rand() * pool.length)][0]
}

function pickBonuses(bonuses: Bonus[], strategy: Strategy, rand: () => number): Bonus[] {
  const groups = new Map<string, Bonus[]>()
  const loose: Bonus[] = []
  for (const b of bonuses) {
    if (b.group) groups.set(b.group, [...(groups.get(b.group) ?? []), b])
    else loose.push(b)
  }
  const picked: Bonus[] = []
  for (const list of groups.values()) {
    if (strategy === 'aleatoria') picked.push(list[Math.floor(rand() * list.length)])
    else if (strategy === 'optima') picked.push([...list].sort((a, b) => score(b.effect, strategy) - score(a.effect, strategy))[0])
    else picked.push(rand() < QUALITY[strategy][0] ? [...list].sort((a, b) => score(b.effect, 'optima') - score(a.effect, 'optima'))[0] : list[Math.floor(rand() * list.length)])
  }
  for (const b of loose) if (strategy === 'optima' ? score(b.effect, 'optima') > 0 : rand() < QUALITY[strategy][0]) picked.push(b)
  return picked
}

export interface GameResult {
  state: GameState
  events: string[]
}

export function playGame(seed: number, teams: number, strategy: Strategy): GameResult {
  const rand = rng(seed)
  let now = 0
  const run = (s: GameState, a: ActionInput) => reduce(s, { ...a, now: ++now } as never)
  let s = run(emptyState(0), {
    type: 'START_GAME',
    teams: Array.from({ length: teams }, (_, i) => ({ name: `E${i + 1}`, color: '', icon: '' })),
  })
  const events: string[] = []
  for (let guard = 0; guard < 400 && s.status === 'playing'; guard++) {
    if (s.eventQueue.length) {
      const q = s.eventQueue[0]
      events.push(`${q.event}:${q.teamId}`)
      const ev = content.events.find((e) => e.id === q.event)
      const opt = ev?.options?.length ? pickOption(ev.options, strategy, rand) : undefined
      s = run(s, { type: 'APPLY_EVENT', uid: q.uid, optionId: opt?.id })
      continue
    }
    const ch = content.challenges.find((c) => c.id === s.agenda[s.stepIndex]?.challenge)
    if (!ch) break
    for (const team of resolvers(s, content)) {
      for (const f of ch.facilitatorFlags ?? []) {
        // Banderas de "ignorar" (reto 01) dependen del estilo; las de recorte (reto 05) son elecciones.
        const rate = f.flag.startsWith('sin_') ? 0.4 : FLAG_RATE[strategy]
        if (rand() < rate) s = run(s, { type: 'TOGGLE_FLAG', teamId: team.id, flag: f.flag })
      }
      if (ch.options?.length) s = run(s, { type: 'RESOLVE', teamId: team.id, optionId: pickOption(ch.options, strategy, rand).id })
      else if (ch.outcomes) s = run(s, { type: 'RESOLVE', teamId: team.id, outcome: pickOutcome(ch, strategy, rand) })
      for (const b of pickBonuses(ch.bonuses ?? [], strategy, rand))
        if (!bonusesUsed(s, team.id).includes(b.id)) s = run(s, { type: 'APPLY_BONUS', teamId: team.id, bonusId: b.id })
    }
    s = run(s, { type: 'COMPLETE_STEP' })
  }
  return { state: s, events }
}

// ─── Reporte ──────────────────────────────────────────────────────────────
export interface BalanceReport {
  markdown: string
  profileShare: Record<Strategy | 'total', Record<string, number>>
  eventShare: Record<string, number>
  unfinished: number
}

const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0)
const fmt = (x: number) => `${x.toFixed(1)}%`

function quantiles(values: number[]) {
  const a = [...values].sort((x, y) => x - y)
  const q = (p: number) => a[Math.floor(p * (a.length - 1))] ?? 0
  return [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map(q)
}

export function runBalance(gamesPerStrategy: number): BalanceReport {
  const profileCounts: Record<string, Record<string, number>> = {}
  const teamsPer: Record<string, number> = {}
  const eventTeams: Record<string, number> = {}
  const awardStats: Record<string, { given: number; winners: number }> = {}
  const finals: Record<string, Record<string, number[]>> = {}
  let games = 0
  let totalTeams = 0
  let unfinished = 0

  for (const strategy of STRATEGIES) {
    for (let g = 0; g < gamesPerStrategy; g++) {
      const seed = (STRATEGIES.indexOf(strategy) + 1) * 100_003 + g
      const teams = 2 + (g % 5) // 2,3,4,5,6 equipos por igual
      const { state, events } = playGame(seed, teams, strategy)
      games++
      if (state.status !== 'finished') unfinished++
      for (const e of new Set(events)) {
        const id = e.split(':')[0]
        eventTeams[id] = (eventTeams[id] ?? 0) + 1
      }
      for (const a of computeAwards(state, content)) {
        const st = (awardStats[a.award.title] ??= { given: 0, winners: 0 })
        if (a.winners.length) {
          st.given++
          st.winners += a.winners.length
        }
      }
      for (const t of state.teams) {
        totalTeams++
        teamsPer[strategy] = (teamsPer[strategy] ?? 0) + 1
        const p = summarizeTeam(t, state, content).profile?.title ?? '?'
        for (const key of [strategy, 'total']) {
          profileCounts[key] ??= {}
          profileCounts[key][p] = (profileCounts[key][p] ?? 0) + 1
        }
        for (const [k, v] of Object.entries(t.indicators)) {
          for (const key of [strategy, 'total']) ((finals[key] ??= {})[k] ??= []).push(v)
        }
      }
    }
  }
  teamsPer.total = totalTeams

  const profileTitles = content.profiles.map((p) => p.title)
  const profileShare = Object.fromEntries(
    [...STRATEGIES, 'total'].map((k) => [k, Object.fromEntries(profileTitles.map((t) => [t, pct(profileCounts[k]?.[t] ?? 0, teamsPer[k])]))]),
  ) as BalanceReport['profileShare']
  const eventShare = Object.fromEntries(content.events.map((e) => [e.id, pct(eventTeams[e.id] ?? 0, totalTeams)]))

  const L: string[] = []
  L.push('# Reporte de balance — Punto Crítico', '')
  L.push(`Generado con \`npm run balance\`: **${games} partidas** (${gamesPerStrategy} por estrategia, de 2 a 6 equipos), ${totalTeams} equipos simulados.`, '')
  L.push('Estrategias: **aleatoria** (todo al azar), **óptima** (siempre lo que más suma, facilitador califica éxito), **conservadora** (evita pérdidas, cuida recursos), **resultados** (prioriza Resultados) y **personas** (prioriza Equipo y Liderazgo). Fuera de la óptima, la calidad de las respuestas abiertas se simula con probabilidades.', '')

  L.push('## Perfiles (% de equipos)', '')
  L.push(`| Perfil | ${STRATEGIES.join(' | ')} | **Total** |`, `|---|${STRATEGIES.map(() => '---:').join('|')}|---:|`)
  for (const t of profileTitles) L.push(`| ${t} | ${STRATEGIES.map((s) => fmt(profileShare[s][t])).join(' | ')} | **${fmt(profileShare.total[t])}** |`)
  L.push('')

  L.push('## Indicadores finales (todas las estrategias)', '')
  L.push('| Indicador | mín | p10 | p25 | mediana | p75 | p90 | máx |', '|---|---:|---:|---:|---:|---:|---:|---:|')
  for (const d of content.indicators) L.push(`| ${d.label} | ${quantiles(finals.total[d.id]).join(' | ')} |`)
  L.push('')
  L.push('Mediana por estrategia:', '')
  L.push(`| Indicador | ${STRATEGIES.join(' | ')} |`, `|---|${STRATEGIES.map(() => '---:').join('|')}|`)
  for (const d of content.indicators) L.push(`| ${d.label} | ${STRATEGIES.map((s) => quantiles(finals[s][d.id])[3]).join(' | ')} |`)
  L.push('')

  L.push('## Rangos alcanzados (% de equipos)', '')
  L.push('| Indicador | ≤ 30 | ≤ 35 | ≥ 60 | ≥ 65 | ≥ 70 | ≥ 75 | ≥ 80 |', '|---|---:|---:|---:|---:|---:|---:|---:|')
  for (const d of content.indicators) {
    const v = finals.total[d.id]
    const share = (f: (x: number) => boolean) => fmt(pct(v.filter(f).length, v.length))
    L.push(`| ${d.label} | ${share((x) => x <= 30)} | ${share((x) => x <= 35)} | ${share((x) => x >= 60)} | ${share((x) => x >= 65)} | ${share((x) => x >= 70)} | ${share((x) => x >= 75)} | ${share((x) => x >= 80)} |`)
  }
  L.push('')

  L.push('## Eventos (% de equipos que lo vivieron)', '')
  L.push('| Evento | Tipo | % |', '|---|---|---:|')
  for (const e of content.events) L.push(`| ${e.title} | ${e.kind} | ${fmt(eventShare[e.id])} |`)
  L.push('')

  L.push('## Reconocimientos', '')
  L.push('| Reconocimiento | % de partidas otorgado | ganadores promedio (empates) |', '|---|---:|---:|')
  for (const [title, st] of Object.entries(awardStats)) L.push(`| ${title} | ${fmt(pct(st.given, games))} | ${(st.given ? st.winners / st.given : 0).toFixed(2)} |`)
  L.push('')

  const main = profileTitles.slice(0, -1)
  const impossible = main.filter((t) => profileShare.total[t] < 0.5)
  const tooFrequent = profileTitles.filter((t) => profileShare.aleatoria[t] > 50 || profileShare.total[t] > 45)
  const neverEvents = content.events.filter((e) => eventShare[e.id] === 0).map((e) => e.title)
  L.push('## Alertas', '')
  L.push(`- Perfiles prácticamente imposibles (< 0.5% total): ${impossible.length ? impossible.join(', ') : 'ninguno ✅'}`)
  L.push(`- Perfiles demasiado frecuentes (> 50% al azar o > 45% total): ${tooFrequent.length ? tooFrequent.join(', ') : 'ninguno ✅'}`)
  L.push(`- Eventos que nunca ocurrieron: ${neverEvents.length ? neverEvents.join(', ') : 'ninguno ✅'}`)
  L.push(`- Partidas que no terminaron: ${unfinished === 0 ? 'ninguna ✅' : unfinished}`)
  L.push('')
  return { markdown: L.join('\n'), profileShare, eventShare, unfinished }
}
