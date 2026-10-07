import { describe, expect, it } from 'vitest'
import { content as base } from '../content'
import { createReducer, emptyState } from '../engine/reducer'
import { computeAwards, summarizeTeam } from '../engine/results'
import type { GameContent } from '../engine/types'
import { rootReducer } from '../state/rootReducer'
import { countChanges, diffItem, itemStatus } from './diff'
import { deleteItem, duplicateChallenge, duplicateEvent, flagUsage, moveById, moveInAgenda, renameId, restoreItem, setActive } from './operations'
import { previewState } from './preview'
import {
  buildExport,
  clone,
  DRAFT_KEY,
  loadDraft,
  loadSnapshot,
  nextGameContent,
  parseImport,
  saveDraft,
  saveSnapshot,
  SNAPSHOT_KEY,
  type KeyValueStore,
} from './storage'
import { checkSchema, validateConfig } from './validate'

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) }
}
const fresh = () => clone(base)
const errors = (c: GameContent) => validateConfig(c).filter((i) => i.level === 'error').map((i) => i.message)
const warnings = (c: GameContent) => validateConfig(c).filter((i) => i.level === 'warning').map((i) => i.message)
const teams = [{ name: 'A', color: '', icon: '' }, { name: 'B', color: '', icon: '' }]

describe('guardado del borrador', () => {
  it('guarda, carga e incrementa la versión local', () => {
    const store = memoryStore()
    const c = fresh()
    c.challenges[0].title = 'Editado'
    const v1 = saveDraft(c, null, store, 1000)
    const v2 = saveDraft(c, v1, store, 2000)
    expect([v1.version, v2.version]).toEqual([1, 2])
    expect(v2.createdAt).toBe(1000)
    expect(loadDraft(store)?.content.challenges[0].title).toBe('Editado')
  })

  it('ignora un borrador corrupto', () => {
    const store = memoryStore()
    store.setItem(DRAFT_KEY, '{"content": {"challenges": 3}}')
    expect(loadDraft(store)).toBeNull()
  })
})

describe('restaurar', () => {
  it('restaura un elemento modificado y elimina uno nuevo', () => {
    let c = fresh()
    c.challenges[2].title = 'Otro'
    expect(itemStatus(base, c, 'challenges', 'talento-dificil')).toBe('modified')
    c = restoreItem(c, base, 'challenges', 'talento-dificil')
    expect(itemStatus(base, c, 'challenges', 'talento-dificil')).toBe('same')
    const dup = duplicateChallenge(c, 'el-rumor')
    const removed = restoreItem(dup.content, base, 'challenges', dup.newId)
    expect(removed.challenges.some((x) => x.id === dup.newId)).toBe(false)
    expect(removed.config.agenda.some((a) => a.challenge === dup.newId)).toBe(false)
    expect(countChanges(base, removed)).toBe(0)
  })

  it('sólo permite borrar elementos creados en admin', () => {
    expect(deleteItem(fresh(), base, 'challenges', 'el-rumor').challenges).toHaveLength(base.challenges.length)
  })
})

describe('duplicar', () => {
  it('crea una copia inactiva con id nuevo, junto al original en la agenda', () => {
    const { content, newId } = duplicateChallenge(fresh(), 'talento-dificil')
    expect(newId).toBe('talento-dificil-copia')
    const copy = content.challenges.find((c) => c.id === newId)!
    expect(copy.active).toBe(false)
    expect(copy.title).toContain('(copia)')
    const ids = content.config.agenda.map((a) => a.challenge)
    expect(ids.indexOf(newId)).toBe(ids.indexOf('talento-dificil') + 1)
    expect(duplicateChallenge(content, 'talento-dificil').newId).toBe('talento-dificil-copia-2')
    expect(errors(content)).toEqual([])
    expect(countChanges(base, content)).toBe(1)
  })

  it('duplica eventos', () => {
    const { content, newId } = duplicateEvent(fresh(), 'todo-urge')
    expect(content.events.find((e) => e.id === newId)).toMatchObject({ active: false, kind: 'conditional' })
  })

  it('renombrar un id actualiza sus referencias', () => {
    const c = renameId(fresh(), 'la-promesa-regresa', 'promesa-v2')
    expect(c.events.some((e) => e.id === 'promesa-v2')).toBe(true)
    expect(errors(c)).toEqual([])
  })
})

describe('activar / desactivar', () => {
  it('un reto inactivo no entra en nuevas partidas pero sigue existiendo', () => {
    const c = setActive(fresh(), 'challenges', 'mapa-del-terreno', false)
    const s = createReducer(c)(emptyState(0), { type: 'START_GAME', teams, now: 1 })
    expect(s.agenda).toHaveLength(16)
    expect(s.agenda.some((a) => a.challenge === 'mapa-del-terreno')).toBe(false)
    expect(c.challenges.some((x) => x.id === 'mapa-del-terreno')).toBe(true)
  })

  it('eventos, perfiles y reconocimientos inactivos se ignoran', () => {
    let c = setActive(fresh(), 'events', 'todo-urge', false)
    c = setActive(c, 'profiles', 'equilibrado', false)
    c = setActive(c, 'awards', 'liderazgo', false)
    const reduce = createReducer(c)
    let s = reduce(emptyState(0), { type: 'START_GAME', teams, now: 1 })
    s = reduce(s, { type: 'ADJUST', teamId: 't1', indicator: 'recursos', delta: -20, now: 2 })
    for (let i = 0; i < 4; i++) s = reduce(s, { type: 'SKIP_STEP', now: 3 + i })
    expect(s.eventQueue.some((q) => q.event === 'todo-urge')).toBe(false)
    const team = { ...s.teams[0], indicators: { resultados: 70, equipo: 65, liderazgo: 75, recursos: 62, reputacion: 66 } }
    expect(summarizeTeam(team, s, c).profile?.id).not.toBe('equilibrado')
    expect(computeAwards(s, c).some((a) => a.award.id === 'liderazgo')).toBe(false)
  })
})

describe('exportar / importar', () => {
  it('exporta todo y se puede volver a importar igual', () => {
    const c = fresh()
    c.events[0].title = 'Cambiado'
    const file = buildExport(c, new Date('2026-10-04T10:00:00Z'))
    expect(file).toMatchObject({ kind: 'punto-critico-config', formatVersion: 1, exportedAt: '2026-10-04T10:00:00.000Z' })
    for (const k of ['challenges', 'events', 'profiles', 'awards', 'indicators', 'flags', 'config'] as const) expect(file.content[k]).toBeDefined()
    const back = parseImport(JSON.stringify(file))
    expect(back.errors).toEqual([])
    expect(back.content).toEqual(c)
  })

  it('rechaza archivos inválidos explicando por qué', () => {
    expect(parseImport('no es json').errors[0]).toMatch(/JSON/)
    expect(parseImport(JSON.stringify({ kind: 'otra-cosa', content: {} })).errors[0]).toMatch(/no es una configuración/)
    const broken = fresh() as unknown as Record<string, unknown>
    delete broken.challenges
    expect(parseImport(JSON.stringify(broken)).errors).toContain('Falta la lista "challenges".')
    const badEffect = fresh()
    ;(badEffect.challenges[0].outcomes!.success!.effect.indicators as Record<string, unknown>).liderazgo = 'mucho'
    const r = parseImport(JSON.stringify(badEffect))
    expect(r.content).toBeNull()
    expect(r.errors.join()).toMatch(/deben ser números/)
  })
})

describe('validación', () => {
  it('el contenido base pasa el esquema y no tiene errores ni advertencias', () => {
    expect(checkSchema(base)).toEqual([])
    expect(validateConfig(base)).toEqual([])
  })

  it('detecta errores estructurales', () => {
    const c = fresh()
    c.challenges[1].id = c.challenges[0].id
    c.challenges[2].title = ''
    c.challenges[3].options = [{ id: 'a', label: '', effect: {} }]
    c.challenges[4].outcomes!.success!.effect.indicators = { felicidad: 3 }
    c.events[0].trigger = { indicator: 'recursos', op: '~' as never, value: 4 }
    c.challenges[5].narrative = ''
    const e = errors(c).join('\n')
    expect(e).toMatch(/Reto duplicado/)
    expect(e).toMatch(/sin título/)
    expect(e).toMatch(/opción 1 está vacía/)
    expect(e).toMatch(/indicador desconocido "felicidad"/)
    expect(e).toMatch(/condición inválida/)
    expect(e).toMatch(/no tiene narrativa/)
  })

  it('referencias a banderas inexistentes son errores', () => {
    const c = fresh()
    c.challenges[2].options![0].effect.setFlags = ['no_existe']
    c.challenges[0].facilitatorFlags![0].flag = 'tampoco'
    c.events[0].trigger = { flag: 'fantasma' }
    const e = errors(c).join('\n')
    expect(e).toMatch(/"no_existe" no existe/)
    expect(e).toMatch(/"tampoco" no existe/)
    expect(e).toMatch(/"fantasma" no existe/)
    expect(flagUsage(base, 'talento_sin_limites')).toBeGreaterThan(0)
  })

  it('advierte perfiles imposibles y respaldo mal ubicado sin bloquear', () => {
    const c = fresh()
    c.profiles[0].match = { indicator: 'equipo', op: '>=', value: 120 }
    c.profiles = moveById(c.profiles, 'en-construccion', -1)
    expect(errors(c)).toEqual([])
    const w = warnings(c).join('\n')
    expect(w).toMatch(/condición imposible/)
    expect(w).toMatch(/respaldo no está al final/)
  })
})

describe('snapshot', () => {
  it('la próxima partida usa el snapshot; sin snapshot, la base', () => {
    const store = memoryStore()
    expect(nextGameContent(store).source).toBe('base')
    const c = fresh()
    c.challenges[2].title = 'Versión AMV'
    saveSnapshot(c, 4, store, 5000)
    const next = nextGameContent(store)
    expect(next.source).toBe('snapshot')
    expect(next.snapshot).toMatchObject({ version: 4, createdAt: 5000 })
    expect(next.content.challenges[2].title).toBe('Versión AMV')
    store.setItem(SNAPSHOT_KEY, 'basura')
    expect(loadSnapshot(store)).toBeNull()
  })

  it('una partida iniciada con el snapshot lo congela: cambios posteriores no la afectan', () => {
    const snap = setActive(fresh(), 'challenges', 'mapa-del-terreno', false)
    snap.challenges[2].title = 'Versión AMV'
    snap.challenges[2].options![0].effect.indicators = { equipo: -10 }
    let g = rootReducer({ state: emptyState(0), past: [] }, { type: '@START', now: 1, teams, content: snap })
    expect(g.state.agenda).toHaveLength(16)
    expect(g.content?.challenges[2].title).toBe('Versión AMV')
    // Después de iniciar, el admin cambia el contenido y crea otro snapshot.
    snap.challenges[2].title = 'CAMBIO POSTERIOR'
    snap.challenges[2].options![0].effect.indicators = { equipo: -1 }
    expect(g.content?.challenges[2].title).toBe('Versión AMV')
    // La partida sigue usando los efectos congelados.
    g = rootReducer(g, { type: 'COMPLETE_STEP', now: 2 })
    g = rootReducer(g, { type: 'COMPLETE_STEP', now: 3 })
    expect(g.state.agenda[g.state.stepIndex].challenge).toBe('talento-dificil')
    g = rootReducer(g, { type: 'RESOLVE', teamId: 't1', optionId: 'a', now: 4 })
    expect(g.state.teams[0].indicators.equipo).toBe(40)
  })
})

describe('vista previa', () => {
  it('arma una partida de prueba para un reto o un evento', () => {
    const s = previewState(base, 'challenge', 'el-rumor', 6)
    expect(s.teams).toHaveLength(6)
    expect(s.screen).toBe('challenge')
    expect(s.agenda).toEqual([expect.objectContaining({ challenge: 'el-rumor', turnMode: 'all-teams' })])
    const e = previewState(base, 'event', 'todo-urge')
    expect(e.eventQueue[0]).toMatchObject({ event: 'todo-urge', teamId: 't1' })
  })
})

describe('orden', () => {
  it('reordenar perfiles cambia cuál se asigna', () => {
    const c = fresh()
    const s = createReducer(c)(emptyState(0), { type: 'START_GAME', teams, now: 1 })
    const team = { ...s.teams[0], indicators: { resultados: 90, equipo: 50, liderazgo: 90, recursos: 70, reputacion: 70 } }
    expect(summarizeTeam(team, s, c).profile?.id).toBe('negociador')
    let moved = c
    for (let i = 0; i < 3; i++) moved = { ...moved, profiles: moveById(moved.profiles, 'estratega', -1) }
    expect(moved.profiles[0].id).toBe('estratega')
    expect(summarizeTeam(team, s, moved).profile?.id).toBe('estratega')
  })

  it('mover un reto en la agenda cambia el orden de juego', () => {
    const c = moveInAgenda(fresh(), 'talento-dificil', -1)
    expect(c.config.agenda.slice(1, 3).map((a) => a.challenge)).toEqual(['talento-dificil', 'mensaje-imposible'])
    expect(countChanges(base, c)).toBe(1)
    expect(diffItem(base.challenges, c.challenges)).toEqual([])
  })
})
