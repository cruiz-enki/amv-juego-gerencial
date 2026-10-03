import type { CategoryDef } from '../engine/types'

/** Módulos del diplomado. Un reto puede pertenecer a varias categorías. */
export const categories: CategoryDef[] = [
  { id: 'liderazgo', label: 'Liderazgo', icon: '🧭' },
  { id: 'decisiones', label: 'Toma de decisiones', icon: '⚖️' },
  { id: 'equipos', label: 'Desarrollo de equipos', icon: '🌱' },
  { id: 'comunicacion', label: 'Comunicación', icon: '📣' },
  { id: 'negociacion', label: 'Negociación', icon: '🤝' },
  { id: 'conflictos', label: 'Manejo de conflictos', icon: '⚡' },
  { id: 'planeacion', label: 'Planeación y priorización', icon: '🗺️' },
  { id: 'recursos', label: 'Gestión de recursos', icon: '📦' },
]
