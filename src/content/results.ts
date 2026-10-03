import type { AwardDef, Condition, ManagerProfile } from '../engine/types'

const ALL = ['resultados', 'equipo', 'liderazgo', 'recursos', 'reputacion']
const atLeast = (indicator: string, value: number): Condition => ({ indicator, op: '>=', value })

/**
 * Perfiles finales — fuente: documento "Punto Crítico". Se asigna el PRIMERO que
 * cumpla su condición, así que van del más específico al más general.
 */
export const profiles: ManagerProfile[] = [
  {
    id: 'equilibrado',
    title: 'Equipo equilibrado',
    icon: '⚖️',
    description:
      'Lograron equilibrar resultados, personas y recursos. Su siguiente reto es decidir en qué dimensión quieren convertirse en extraordinarios.',
    match: { all: [...ALL.map((id) => atLeast(id, 60)), { spread: '<=', value: 20 }] },
  },
  {
    id: 'ejecutor',
    title: 'Ejecutor',
    icon: '🚀',
    description:
      'Logran que las cosas ocurran. Su fortaleza es la orientación a resultados. Su reto es asegurar que la velocidad no genere costos invisibles.',
    match: atLeast('resultados', 80),
  },
  {
    id: 'estratega',
    title: 'Estratega',
    icon: '♟️',
    description:
      'Su fortaleza está en analizar, priorizar y utilizar los recursos con intención. Su riesgo es convertir cada problema en un cálculo y perder de vista a las personas.',
    match: { all: [atLeast('resultados', 70), atLeast('recursos', 65)] },
  },
  {
    id: 'constructor',
    title: 'Constructor de equipos',
    icon: '🌱',
    description:
      'Generan confianza y desarrollan capacidad colectiva. Su siguiente reto es mantener esa fortaleza sin evitar decisiones difíciles.',
    match: { all: [atLeast('equipo', 75), atLeast('liderazgo', 65)] },
  },
  {
    id: 'negociador',
    title: 'Negociador',
    icon: '🤝',
    description:
      'Saben construir acuerdos y proteger relaciones. Su reto es no confundir consenso con evitar decisiones.',
    match: { all: [atLeast('reputacion', 75), atLeast('recursos', 60)] },
  },
  {
    id: 'bombero',
    title: 'Bombero profesional',
    icon: '🧯',
    description:
      'Son excelentes reaccionando bajo presión. Salvan situaciones difíciles, aunque demasiadas cosas terminan dependiendo de su capacidad para apagar incendios.',
    match: { all: [atLeast('resultados', 60), { indicator: 'recursos', op: '<=', value: 45 }] },
  },
  {
    // Respaldo técnico (no viene en el documento): para equipos que no cumplen ningún perfil.
    id: 'en-construccion',
    title: 'Estilo en construcción',
    icon: '🧩',
    description: 'Su estilo gerencial todavía no se inclina por una dimensión dominante.',
  },
]

export const awards: AwardDef[] = [
  { id: 'liderazgo', title: 'Mejor liderazgo', icon: '🧭', description: 'Mayor indicador de Liderazgo.', metric: { kind: 'highest', indicator: 'liderazgo' } },
  {
    id: 'estrategia',
    title: 'Mejor estrategia',
    icon: '♟️',
    description: 'Mejor desempeño en los retos 05, 08, 13 y 14.',
    metric: { kind: 'challengeGain', challenges: ['el-recorte', 'tres-proveedores', 'mapa-del-terreno', 'decidir-sin-certeza'] },
  },
  {
    id: 'negociacion',
    title: 'Mejor negociación',
    icon: '🤝',
    description: 'Mejor resultado acumulado en los retos 06 y 12.',
    metric: { kind: 'challengeGain', challenges: ['nadie-tiene-todo', 'cliente-quiere-todo'] },
  },
  { id: 'equipo', title: 'Mejor equipo', icon: '🌱', description: 'Mayor indicador de Equipo.', metric: { kind: 'highest', indicator: 'equipo' } },
  {
    id: 'crisis',
    title: 'Mejor manejo de crisis',
    icon: '🚨',
    description: 'Resultado más alto en el reto 10.',
    metric: { kind: 'challengeGain', challenges: ['punto-critico'] },
  },
  { id: 'recursos', title: 'Mejor uso de recursos', icon: '💰', description: 'Mayor indicador de Recursos.', metric: { kind: 'highest', indicator: 'recursos' } },
  { id: 'reputacion', title: 'Mayor reputación', icon: '⭐', description: 'Mayor indicador de Reputación.', metric: { kind: 'highest', indicator: 'reputacion' } },
]
