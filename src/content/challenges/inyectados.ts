import type { Challenge } from '../../engine/types'

// Retos que NO están en la agenda: sólo aparecen cuando un evento los inyecta.

export const injectedChallenges: Challenge[] = [
  {
    id: 'renuncia-clave',
    title: 'Una renuncia sobre la mesa',
    type: 'crisis',
    categories: ['liderazgo', 'equipos', 'conflictos', 'comunicacion'],
    chapter: 'quiebre',
    narrative:
      'Mariana, tu coordinadora más confiable, pide cinco minutos: tiene una oferta de otra empresa y está pensando aceptarla. Dice que "ya no ve hacia dónde va el equipo".',
    options: [
      {
        id: 'a',
        label: 'Escuchar a fondo antes de ofrecer algo',
        feedback: 'Descubren que el problema no es el sueldo sino la falta de dirección. Hay margen para recuperarla.',
        effect: { indicators: { equipo: 6, liderazgo: 4 } },
      },
      {
        id: 'b',
        label: 'Igualar la oferta de inmediato',
        feedback: 'Se queda, por ahora. El motivo de fondo sigue ahí y el presupuesto lo resiente.',
        effect: { indicators: { recursos: -8, equipo: 2 } },
      },
      {
        id: 'c',
        label: 'Desearle suerte y preparar el reemplazo',
        feedback: 'Decisión limpia, pero el resto del equipo toma nota de lo poco que se intentó retenerla.',
        effect: { indicators: { equipo: -6, resultados: -3 } },
      },
    ],
    facilitator: { notes: 'Aparece cuando el indicador Equipo de un comité baja de 40.' },
  },
]
