import type { ChapterDef } from '../engine/types'

/**
 * Bloques del día para el tablero. Cada reto además tiene su propia hora (`clock`).
 * `marker` es texto libre.
 */
export const chapters: ChapterDef[] = [
  { id: 'arranque', label: 'Arranque', marker: '08:00' },
  { id: 'manana', label: 'Media mañana', marker: '10:00' },
  { id: 'mediodia', label: 'Mediodía', marker: '12:00' },
  { id: 'tarde', label: 'Tarde', marker: '14:00' },
  { id: 'cierre', label: 'Recta final', marker: '15:50' },
  { id: 'consejo', label: 'El Consejo', marker: '17:00' },
]
