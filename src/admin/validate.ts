import type { Condition, Effect, GameContent } from '../engine/types'

export type AdminSection = 'challenges' | 'events' | 'profiles' | 'awards' | 'indicators' | 'flags' | 'general'

export interface Issue {
  level: 'error' | 'warning'
  message: string
  target?: { section: AdminSection; id?: string }
}

const CHALLENGE_TYPES = ['decision', 'open', 'timed', 'negotiation', 'tool', 'crisis', 'event', 'physical']
const TURN_MODES = ['active-team', 'all-teams', 'per-team', 'interaction']
const EVENT_KINDS = ['conditional', 'consequence', 'surprise']
const EVENT_TONES = ['positive', 'negative', 'neutral', 'crisis']
const TONES = ['success', 'partial', 'fail']
const COMPARATORS = ['<', '<=', '>', '>=', '==']
const METRICS = ['highest', 'globalIndex', 'balance', 'mostDecisions', 'challengeGain']

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const isStr = (v: unknown) => typeof v === 'string'
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v)

/**
 * Revisión estructural (forma de los datos). Se usa al importar un JSON y al
 * leer localStorage: si falla, la configuración no se aplica.
 */
export function checkSchema(data: unknown): string[] {
  const errors: string[] = []
  const err = (m: string) => errors.length < 40 && errors.push(m)
  if (!isObj(data)) return ['La configuración debe ser un objeto JSON.']
  const arrays = ['indicators', 'categories', 'chapters', 'flags', 'resources', 'challenges', 'events', 'profiles', 'awards', 'teamPresets']
  for (const k of arrays) if (!Array.isArray(data[k])) err(`Falta la lista "${k}".`)
  const config = data.config
  if (!isObj(config)) err('Falta "config".')
  else {
    if (!isStr(config.title)) err('config.title debe ser texto.')
    if (!isObj(config.teams) || !isNum(config.teams.min) || !isNum(config.teams.max) || !isNum(config.teams.default))
      err('config.teams debe tener min, max y default numéricos.')
    if (!Array.isArray(config.agenda) || !config.agenda.every((a) => isObj(a) && isStr(a.challenge)))
      err('config.agenda debe ser una lista de { challenge }.')
    if (!['hidden', 'qualitative', 'numeric'].includes(config.publicEffects as string)) err('config.publicEffects no es válido.')
    if (!isObj(config.closing) || !Array.isArray(config.closing.lines) || !isObj(config.closing.finale))
      err('config.closing incompleto.')
  }
  if (errors.length) return errors

  const checkEffect = (e: unknown, where: string) => {
    if (!isObj(e)) return err(`${where}: "effect" debe ser un objeto.`)
    if (e.indicators !== undefined && (!isObj(e.indicators) || !Object.values(e.indicators).every((v) => v === undefined || isNum(v))))
      err(`${where}: los efectos sobre indicadores deben ser números.`)
    for (const k of ['setFlags', 'clearFlags'])
      if (e[k] !== undefined && (!Array.isArray(e[k]) || !(e[k] as unknown[]).every(isStr))) err(`${where}: ${k} debe ser una lista de textos.`)
    if (e.schedule !== undefined && (!Array.isArray(e.schedule) || !e.schedule.every((s) => isObj(s) && isStr(s.event) && isNum(s.afterSteps))))
      err(`${where}: schedule debe ser una lista de { event, afterSteps }.`)
  }

  ;(data.indicators as unknown[]).forEach((d, i) => {
    if (!isObj(d) || !isStr(d.id) || !isStr(d.label) || ![d.min, d.max, d.initial, d.danger].every(isNum))
      err(`Indicador #${i + 1}: requiere id, label, min, max, initial y danger.`)
  })
  ;(data.flags as unknown[]).forEach((f, i) => {
    if (!isObj(f) || !isStr(f.id) || !isStr(f.label)) err(`Bandera #${i + 1}: requiere id y label.`)
  })
  ;(data.challenges as unknown[]).forEach((c, i) => {
    const where = `Reto #${i + 1}`
    if (!isObj(c)) return err(`${where}: no es un objeto.`)
    if (!isStr(c.id) || !isStr(c.title)) err(`${where}: requiere id y title.`)
    if (!CHALLENGE_TYPES.includes(c.type as string)) err(`${where} (${String(c.id)}): tipo desconocido "${String(c.type)}".`)
    if (c.turnMode !== undefined && !TURN_MODES.includes(c.turnMode as string)) err(`${where}: modo desconocido.`)
    if (!Array.isArray(c.categories) || !isStr(c.chapter) || !isStr(c.narrative)) err(`${where}: requiere categories, chapter y narrative.`)
    if (!isObj(c.facilitator) || !isStr(c.facilitator.notes)) err(`${where}: requiere facilitator.notes.`)
    if (c.options !== undefined) {
      if (!Array.isArray(c.options)) err(`${where}: options debe ser una lista.`)
      else
        c.options.forEach((o, j) => {
          if (!isObj(o) || !isStr(o.id) || !isStr(o.label)) return err(`${where} opción #${j + 1}: requiere id y label.`)
          checkEffect(o.effect, `${where} opción ${o.id}`)
        })
    }
    if (c.outcomes !== undefined) {
      if (!isObj(c.outcomes)) err(`${where}: outcomes debe ser un objeto.`)
      else
        for (const [k, o] of Object.entries(c.outcomes)) {
          if (o === undefined) continue
          if (isObj(o)) checkEffect(o.effect, `${where} resultado ${k}`)
          else err(`${where} resultado ${k}: no es un objeto.`)
        }
    }
  })
  ;(data.events as unknown[]).forEach((e, i) => {
    const where = `Evento #${i + 1}`
    if (!isObj(e) || !isStr(e.id) || !isStr(e.title) || !isStr(e.narrative)) return err(`${where}: requiere id, title y narrative.`)
    if (!EVENT_KINDS.includes(e.kind as string)) err(`${where} (${e.id}): kind desconocido.`)
    if (!EVENT_TONES.includes(e.tone as string)) err(`${where} (${e.id}): tone desconocido.`)
    checkEffect(e.effect, `${where} (${e.id})`)
  })
  ;(data.profiles as unknown[]).forEach((p, i) => {
    if (!isObj(p) || !isStr(p.id) || !isStr(p.title) || !isStr(p.description)) err(`Perfil #${i + 1}: requiere id, title y description.`)
  })
  ;(data.awards as unknown[]).forEach((a, i) => {
    if (!isObj(a) || !isStr(a.id) || !isStr(a.title) || !isObj(a.metric) || !METRICS.includes(a.metric.kind as string))
      err(`Reconocimiento #${i + 1}: requiere id, title y un criterio válido.`)
  })
  return errors
}

/** Errores de forma de una condición (claves desconocidas, tipos incorrectos). */
export function conditionShapeErrors(cond: unknown): string[] {
  if (cond === undefined) return []
  if (!isObj(cond)) return ['la condición no es un objeto']
  const keys = Object.keys(cond)
  if ('all' in cond || 'any' in cond) {
    const list = cond.all ?? cond.any
    if (!Array.isArray(list)) return ['"all"/"any" debe ser una lista']
    return list.flatMap(conditionShapeErrors)
  }
  if ('not' in cond) return conditionShapeErrors(cond.not)
  if ('indicator' in cond || 'resource' in cond) {
    if (!isStr(cond.indicator ?? cond.resource) || !COMPARATORS.includes(cond.op as string) || !isNum(cond.value))
      return ['comparación incompleta (requiere operador y número)']
    return []
  }
  if ('flag' in cond) return isStr(cond.flag) && cond.flag ? [] : ['bandera vacía']
  if ('chose' in cond) return isObj(cond.chose) && isStr(cond.chose.challenge) && isStr(cond.chose.option) ? [] : ['"eligió" incompleto']
  if ('outcome' in cond) return isObj(cond.outcome) && isStr(cond.outcome.challenge) && isStr(cond.outcome.is) ? [] : ['"resultado" incompleto']
  if ('completed' in cond) return isStr(cond.completed) ? [] : ['"completó" incompleto']
  if ('stepAtLeast' in cond) return isNum(cond.stepAtLeast) ? [] : ['"paso" debe ser un número']
  if ('spread' in cond) return COMPARATORS.includes(cond.spread as string) && isNum(cond.value) ? [] : ['"diferencia" incompleta']
  return [`tipo de condición desconocido (${keys.join(', ') || 'vacío'})`]
}

/** Validación completa del contenido: errores bloquean el snapshot; advertencias no. */
export function validateConfig(c: GameContent): Issue[] {
  const issues: Issue[] = []
  const error = (message: string, target?: Issue['target']) => issues.push({ level: 'error', message, target })
  const warn = (message: string, target?: Issue['target']) => issues.push({ level: 'warning', message, target })

  const ids = {
    indicator: new Set(c.indicators.map((x) => x.id)),
    category: new Set(c.categories.map((x) => x.id)),
    chapter: new Set(c.chapters.map((x) => x.id)),
    resource: new Set(c.resources.map((x) => x.id)),
    challenge: new Set(c.challenges.map((x) => x.id)),
    event: new Set(c.events.map((x) => x.id)),
    flag: new Set(c.flags.map((x) => x.id)),
  }
  const activeChallenge = (id: string) => c.challenges.find((x) => x.id === id)?.active !== false
  const activeEvent = (id: string) => c.events.find((x) => x.id === id)?.active !== false

  const dupes = (list: { id: string }[], label: string, section: AdminSection) => {
    const seen = new Set<string>()
    for (const { id } of list) {
      if (!id?.trim()) error(`${label} con id vacío.`, { section })
      else if (seen.has(id)) error(`${label} duplicado: "${id}".`, { section, id })
      seen.add(id)
    }
  }
  dupes(c.challenges, 'Reto', 'challenges')
  dupes(c.events, 'Evento', 'events')
  dupes(c.indicators, 'Indicador', 'indicators')
  dupes(c.profiles, 'Perfil', 'profiles')
  dupes(c.awards, 'Reconocimiento', 'awards')
  dupes(c.flags, 'Bandera', 'flags')

  const checkCondition = (cond: Condition | undefined, where: string, target: Issue['target']) => {
    if (!cond) return
    for (const m of conditionShapeErrors(cond)) error(`${where}: condición inválida — ${m}.`, target)
    const walk = (x: Condition) => {
      if (!isObj(x)) return
      if ('all' in x && Array.isArray(x.all)) x.all.forEach(walk)
      else if ('any' in x && Array.isArray(x.any)) x.any.forEach(walk)
      else if ('not' in x) walk(x.not)
      else if ('indicator' in x) {
        const def = c.indicators.find((d) => d.id === x.indicator)
        if (!def) error(`${where}: indicador desconocido "${x.indicator}".`, target)
        else if ((x.op === '>=' || x.op === '>') && x.value > def.max) warn(`${where}: ${def.label} nunca puede superar ${def.max} (condición imposible).`, target)
        else if ((x.op === '<=' || x.op === '<') && x.value < def.min) warn(`${where}: ${def.label} nunca baja de ${def.min} (condición imposible).`, target)
      } else if ('resource' in x && !ids.resource.has(x.resource)) error(`${where}: recurso desconocido "${x.resource}".`, target)
      else if ('flag' in x && !ids.flag.has(x.flag)) error(`${where}: bandera "${x.flag}" no existe en el catálogo.`, target)
      else if ('chose' in x && !ids.challenge.has(x.chose.challenge)) error(`${where}: reto desconocido "${x.chose.challenge}".`, target)
      else if ('outcome' in x && !ids.challenge.has(x.outcome.challenge)) error(`${where}: reto desconocido "${x.outcome.challenge}".`, target)
      else if ('completed' in x && !ids.challenge.has(x.completed)) error(`${where}: reto desconocido "${x.completed}".`, target)
    }
    walk(cond)
  }

  const checkEffect = (e: Effect, where: string, target: Issue['target'], ownerActive: boolean) => {
    for (const k of Object.keys(e.indicators ?? {}))
      if (!ids.indicator.has(k)) error(`${where}: indicador desconocido "${k}".`, target)
    for (const k of Object.keys(e.resources ?? {}))
      if (!ids.resource.has(k)) error(`${where}: recurso desconocido "${k}".`, target)
    for (const f of [...(e.setFlags ?? []), ...(e.clearFlags ?? [])])
      if (!ids.flag.has(f)) error(`${where}: bandera "${f}" no existe en el catálogo.`, target)
    for (const s of e.schedule ?? []) {
      if (!ids.event.has(s.event)) error(`${where}: evento programado desconocido "${s.event}".`, target)
      else if (ownerActive && !activeEvent(s.event)) warn(`${where}: programa "${s.event}", que está inactivo.`, target)
      if (s.afterSteps < 0) error(`${where}: el retraso no puede ser negativo.`, target)
    }
    if (e.injectChallenge) {
      if (!ids.challenge.has(e.injectChallenge)) error(`${where}: reto inyectado desconocido "${e.injectChallenge}".`, target)
      else if (ownerActive && !activeChallenge(e.injectChallenge)) warn(`${where}: inyecta "${e.injectChallenge}", que está inactivo.`, target)
    }
  }

  const inAgenda = new Set(c.config.agenda.map((a) => a.challenge))
  const injected = new Set(
    [...c.challenges.flatMap((ch) => [...(ch.options ?? []).map((o) => o.effect), ...Object.values(ch.outcomes ?? {}).map((o) => o?.effect)]), ...c.events.map((e) => e.effect)]
      .map((e) => e?.injectChallenge)
      .filter(Boolean),
  )

  for (const ch of c.challenges) {
    const t = { section: 'challenges' as const, id: ch.id }
    const where = `Reto ${ch.code ?? ''} "${ch.title || ch.id}"`
    const on = ch.active !== false
    if (!ch.title?.trim()) error(`Reto "${ch.id}" sin título.`, t)
    if (!ids.chapter.has(ch.chapter)) error(`${where}: capítulo desconocido "${ch.chapter}".`, t)
    for (const cat of ch.categories) if (!ids.category.has(cat)) warn(`${where}: competencia desconocida "${cat}".`, t)
    const optionIds = new Set<string>()
    ch.options?.forEach((o, i) => {
      if (!o.label?.trim()) error(`${where}: la opción ${i + 1} está vacía.`, t)
      if (!o.id?.trim()) error(`${where}: la opción ${i + 1} no tiene clave.`, t)
      else if (optionIds.has(o.id)) error(`${where}: clave de opción repetida "${o.id}".`, t)
      optionIds.add(o.id)
      checkEffect(o.effect, `${where} · opción ${o.id}`, t, on)
    })
    for (const [k, o] of Object.entries(ch.outcomes ?? {})) {
      if (!o) continue
      checkEffect(o.effect, `${where} · resultado "${o.label ?? k}"`, t, on)
      if (!TONES.includes(k) && !o.tone) warn(`${where}: el resultado "${k}" no tiene tono (se mostrará como parcial).`, t)
    }
    ch.bonuses?.forEach((b) => checkEffect(b.effect, `${where} · bono "${b.label}"`, t, on))
    ch.facilitatorFlags?.forEach((f) => !ids.flag.has(f.flag) && error(`${where}: bandera "${f.flag}" no existe en el catálogo.`, t))
    ch.callbacks?.forEach((cb) => checkCondition(cb.when, `${where} · texto condicionado`, t))
    checkCondition(ch.conditions, where, t)
    if (on) {
      if (!ch.narrative?.trim()) error(`${where}: está activo pero no tiene narrativa.`, t)
      const resolvable = (ch.options?.length ?? 0) > 0 || Object.keys(ch.outcomes ?? {}).length > 0
      if (!resolvable && !ch.showDossier) warn(`${where}: no tiene opciones ni resultados calificables.`, t)
      if (!ch.facilitator.notes?.trim()) warn(`${where}: sin notas para el facilitador.`, t)
      if (!inAgenda.has(ch.id) && !injected.has(ch.id)) warn(`${where}: está activo pero no está en la agenda ni lo inyecta nada (nunca aparecerá).`, t)
    }
  }

  for (const ev of c.events) {
    const t = { section: 'events' as const, id: ev.id }
    const where = `Evento "${ev.title || ev.id}"`
    if (!ev.title?.trim()) error(`Evento "${ev.id}" sin título.`, t)
    checkEffect(ev.effect, where, t, ev.active !== false)
    ev.options?.forEach((o, i) => {
      if (!o.label?.trim()) error(`${where}: la respuesta ${i + 1} está vacía.`, t)
      checkEffect(o.effect, `${where} · respuesta ${o.id}`, t, ev.active !== false)
    })
    if (ev.kind === 'conditional' && !ev.trigger) error(`${where}: es condicional pero no tiene condición.`, t)
    checkCondition(ev.trigger, where, t)
    if (ev.minStep !== undefined && ev.maxStep !== undefined && ev.minStep > ev.maxStep) error(`${where}: "desde el paso" es mayor que "hasta el paso".`, t)
  }

  c.profiles.forEach((p) => {
    checkCondition(p.match, `Perfil "${p.title || p.id}"`, { section: 'profiles', id: p.id })
    if (!p.title?.trim()) error(`Perfil "${p.id}" sin nombre.`, { section: 'profiles', id: p.id })
  })
  const activeProfiles = c.profiles.filter((p) => p.active !== false)
  if (!activeProfiles.some((p) => !p.match)) warn('No hay perfil de respaldo (sin condición): algunos equipos podrían quedar sin perfil.', { section: 'profiles' })
  const fallbackIndex = activeProfiles.findIndex((p) => !p.match)
  if (fallbackIndex >= 0 && fallbackIndex < activeProfiles.length - 1)
    warn('El perfil de respaldo no está al final: los perfiles debajo de él nunca se asignarán.', { section: 'profiles' })

  for (const a of c.awards) {
    const t = { section: 'awards' as const, id: a.id }
    if (a.metric.kind === 'highest' && !ids.indicator.has(a.metric.indicator)) error(`Reconocimiento "${a.title}": indicador desconocido.`, t)
    if (a.metric.kind === 'challengeGain') {
      if (!a.metric.challenges.length) error(`Reconocimiento "${a.title}": elige al menos un reto.`, t)
      for (const id of a.metric.challenges) if (!ids.challenge.has(id)) error(`Reconocimiento "${a.title}": reto desconocido "${id}".`, t)
    }
  }

  for (const d of c.indicators) {
    const t = { section: 'indicators' as const, id: d.id }
    if (d.min >= d.max) error(`Indicador "${d.label}": el mínimo debe ser menor que el máximo.`, t)
    if (d.initial < d.min || d.initial > d.max) error(`Indicador "${d.label}": el valor inicial está fuera del rango.`, t)
  }

  for (const a of c.config.agenda)
    if (!ids.challenge.has(a.challenge)) error(`Agenda: reto desconocido "${a.challenge}".`, { section: 'challenges' })
  if (!c.config.agenda.some((a) => activeChallenge(a.challenge))) error('No hay retos activos en la agenda.', { section: 'challenges' })
  const { min, max } = c.config.teams
  if (min < 1 || max < min || c.config.teams.default < min || c.config.teams.default > max)
    error('Configuración: rango de equipos inválido.', { section: 'general' })
  return issues
}
