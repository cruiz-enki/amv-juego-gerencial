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
    description: 'Capacidad para alcanzar objetivos.',
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
    description: 'Cuidado, cohesión y desarrollo de personas.',
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
    description: 'Capacidad de dirigir, decidir, delegar y asumir responsabilidad.',
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
    description: 'Uso inteligente de tiempo, dinero y capacidad.',
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
    description: 'Confianza generada con clientes y actores externos.',
    color: '#f472b6',
    min: 0,
    max: 100,
    initial: 50,
    danger: 30,
  },
]
