import type { ResourceDef } from '../engine/types'

/** Recursos contables por equipo (fichas). Distintos del indicador "Recursos". */
export const resources: ResourceDef[] = [
  {
    id: 'comodin',
    label: 'Comodín de asesoría',
    icon: '🃏',
    initial: 1,
    description: 'Permite pedir una pista al facilitador durante un reto.',
  },
]
