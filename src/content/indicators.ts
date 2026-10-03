import type { IndicatorDef } from '../engine/types'

/**
 * Indicadores globales. Para agregar, quitar o renombrar uno basta editar esta
 * lista: equipos, barras, marcador y final se adaptan solos.
 */
export const indicators: IndicatorDef[] = [
  {
    id: 'resultados',
    label: 'Resultados',
    icon: '📈',
    description: 'Avance real del proyecto y cumplimiento de compromisos.',
    color: '#38e1ff',
    min: 0,
    max: 100,
    initial: 50,
    danger: 30,
  },
  {
    id: 'equipo',
    label: 'Equipo',
    icon: '🤝',
    description: 'Clima, confianza, energía y cohesión de las personas.',
    color: '#4ade80',
    min: 0,
    max: 100,
    initial: 50,
    danger: 30,
  },
  {
    id: 'liderazgo',
    label: 'Liderazgo',
    icon: '🧭',
    description: 'Credibilidad, dirección y coherencia del comité.',
    color: '#a78bfa',
    min: 0,
    max: 100,
    initial: 50,
    danger: 30,
  },
  {
    id: 'recursos',
    label: 'Recursos',
    icon: '💰',
    description: 'Presupuesto, tiempo y capacidad disponibles.',
    color: '#ffb547',
    min: 0,
    max: 100,
    initial: 50,
    danger: 30,
  },
  {
    id: 'reputacion',
    label: 'Reputación',
    icon: '⭐',
    description: 'Confianza del cliente, de otras áreas y de la dirección.',
    color: '#f472b6',
    min: 0,
    max: 100,
    initial: 50,
    danger: 30,
  },
]
