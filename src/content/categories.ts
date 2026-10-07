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
  // Inteligencia emocional: competencia transversal con subcompetencias.
  { id: 'inteligencia-emocional', label: 'Inteligencia emocional', icon: '💗' },
  { id: 'ie-autoconciencia', label: 'Autoconciencia', icon: '🪞', parent: 'inteligencia-emocional' },
  { id: 'ie-autorregulacion', label: 'Autorregulación', icon: '🧘', parent: 'inteligencia-emocional' },
  { id: 'ie-empatia', label: 'Empatía', icon: '💞', parent: 'inteligencia-emocional' },
  { id: 'ie-manejo-emocional', label: 'Manejo emocional', icon: '🌡️', parent: 'inteligencia-emocional' },
  { id: 'ie-conciencia-social', label: 'Conciencia social', icon: '👥', parent: 'inteligencia-emocional' },
]
