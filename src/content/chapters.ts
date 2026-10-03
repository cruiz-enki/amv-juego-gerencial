import type { ChapterDef } from '../engine/types'

/**
 * Etapas del "día". `marker` es texto libre: puede ser una hora, una fase o
 * cualquier otra etiqueta. El tablero las dibuja en este orden.
 */
export const chapters: ChapterDef[] = [
  { id: 'arranque', label: 'Arranque', marker: '08:00', description: 'La bandeja llena y el día apenas empieza.' },
  { id: 'operacion', label: 'Presión operativa', marker: '10:00', description: 'Las primeras fricciones aparecen.' },
  { id: 'quiebre', label: 'Punto de quiebre', marker: '12:00', description: 'Algo se rompe. ¿Cómo responde el comité?' },
  { id: 'negociacion', label: 'Mesa de negociación', marker: '14:00', description: 'Nadie gana solo.' },
  { id: 'cierre', label: 'Recta final', marker: '16:00', description: 'Poco tiempo, mucho en juego.' },
  { id: 'rendicion', label: 'Rendición de cuentas', marker: '17:00', description: 'El comité responde por sus decisiones.' },
]
