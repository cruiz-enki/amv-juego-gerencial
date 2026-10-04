import { validateConfig } from '../admin/validate'
import type { GameContent } from '../engine/types'
import { categories } from './categories'
import { challenges } from './challenges'
import { chapters } from './chapters'
import { gameConfig } from './config'
import { events } from './events'
import { flags } from './flags'
import { indicators } from './indicators'
import { resources } from './resources'
import { awards, profiles } from './results'
import { teamPresets } from './teamPresets'

export const content: GameContent = {
  config: gameConfig,
  indicators,
  categories,
  chapters,
  flags,
  resources,
  challenges,
  events,
  profiles,
  awards,
  teamPresets,
}

/**
 * Revisa referencias rotas en el contenido (ids inexistentes, duplicados…).
 * Devuelve sólo los ERRORES; las advertencias se ven en /admin.
 */
export function validateContent(c: GameContent): string[] {
  return validateConfig(c)
    .filter((i) => i.level === 'error')
    .map((i) => i.message)
}
