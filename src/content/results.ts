import type { AwardDef, ManagerProfile } from '../engine/types'

/**
 * Perfiles gerenciales (provisionales). Se asigna el PRIMERO cuya condición
 * se cumpla, así que el orden importa. El último no tiene condición: respaldo.
 */
export const profiles: ManagerProfile[] = [
  {
    id: 'arquitecto',
    title: 'Arquitecto del equilibrio',
    icon: '🏛️',
    description: 'Sostuvo resultados sin sacrificar personas, recursos ni confianza.',
    match: {
      all: ['resultados', 'equipo', 'liderazgo', 'recursos', 'reputacion'].map((id) => ({
        indicator: id,
        op: '>=' as const,
        value: 60,
      })),
    },
  },
  {
    id: 'motor',
    title: 'Motor de resultados',
    icon: '🚀',
    description: 'Empujó la entrega a toda costa. El reto pendiente: el costo humano.',
    match: { all: [{ indicator: 'resultados', op: '>=', value: 65 }, { indicator: 'equipo', op: '<', value: 50 }] },
  },
  {
    id: 'personas',
    title: 'Líder de personas',
    icon: '🌱',
    description: 'Cuidó al equipo y ganó credibilidad desde la confianza.',
    match: { all: [{ indicator: 'equipo', op: '>=', value: 65 }, { indicator: 'liderazgo', op: '>=', value: 55 }] },
  },
  {
    id: 'estratega',
    title: 'Estratega confiable',
    icon: '♟️',
    description: 'Combinó avance real con una reputación sólida frente a terceros.',
    match: { all: [{ indicator: 'resultados', op: '>=', value: 60 }, { indicator: 'reputacion', op: '>=', value: 60 }] },
  },
  {
    id: 'guardian',
    title: 'Guardián de recursos',
    icon: '🛡️',
    description: 'Cuidó cada peso y cada hora. Podría arriesgar más.',
    match: { indicator: 'recursos', op: '>=', value: 65 },
  },
  {
    id: 'reconstruccion',
    title: 'Comité en reconstrucción',
    icon: '🔧',
    description: 'Algún frente quedó en zona crítica. Hay aprendizaje valioso en lo que no salió.',
    match: {
      any: ['resultados', 'equipo', 'liderazgo', 'recursos', 'reputacion'].map((id) => ({
        indicator: id,
        op: '<' as const,
        value: 30,
      })),
    },
  },
  {
    id: 'en-desarrollo',
    title: 'Comité en desarrollo',
    icon: '🧩',
    description: 'Decisiones razonables, sin un sello distintivo todavía.',
  },
]

export const awards: AwardDef[] = [
  { id: 'comite-del-dia', title: 'Comité del día', icon: '🏆', description: 'Mayor índice global.', metric: { kind: 'globalIndex' } },
  { id: 'equilibrio', title: 'Mejor equilibrio', icon: '⚖️', description: 'Indicadores más parejos.', metric: { kind: 'balance' } },
  { id: 'resultados', title: 'Entrega impecable', icon: '📈', description: 'Más Resultados.', metric: { kind: 'highest', indicator: 'resultados' } },
  { id: 'equipo', title: 'Corazón del equipo', icon: '🤝', description: 'Más Equipo.', metric: { kind: 'highest', indicator: 'equipo' } },
  { id: 'liderazgo', title: 'Brújula del día', icon: '🧭', description: 'Más Liderazgo.', metric: { kind: 'highest', indicator: 'liderazgo' } },
  { id: 'reputacion', title: 'Palabra de honor', icon: '⭐', description: 'Más Reputación.', metric: { kind: 'highest', indicator: 'reputacion' } },
]
