import type { SecretInfo } from '../engine/types'

/**
 * Reto 06 — "Nadie tiene todo". Tarjetas de objetivo secreto (una por equipo, en orden).
 *
 * Reglas de diseño (verificadas en negotiation.test.ts):
 * - Ningún equipo tiene lo que necesita: siempre debe negociar.
 * - Con las primeras N tarjetas (N = 2…6) cada necesidad la tiene al menos otro equipo.
 * - Con 6 equipos cada necesidad la ofrecen 2 o más equipos: hay varias combinaciones posibles.
 * Con 2 equipos el intercambio es necesariamente directo entre ellos.
 */

export type NegotiationResource =
  | 'presupuesto'
  | 'especialistas'
  | 'logistica'
  | 'informacion'
  | 'cliente'
  | 'proveedor'
  | 'horas'

export const negotiationResources: Record<NegotiationResource, { label: string; unit: string }> = {
  presupuesto: { label: 'Presupuesto', unit: '$30,000' },
  especialistas: { label: 'Especialistas', unit: '2 especialistas' },
  logistica: { label: 'Capacidad logística', unit: '1 turno de logística' },
  informacion: { label: 'Información técnica', unit: 'el expediente técnico' },
  cliente: { label: 'Acceso al cliente', unit: '1 reunión con el cliente' },
  proveedor: { label: 'Contacto con proveedor', unit: 'el contacto del proveedor' },
  horas: { label: 'Horas disponibles', unit: '20 horas de equipo' },
}

export interface NegotiationCard {
  strength: string
  gap: string
  has: NegotiationResource[]
  needs: NegotiationResource[]
}

export const negotiationCards: NegotiationCard[] = [
  {
    strength: 'Mucho presupuesto y gente con tiempo libre.',
    gap: 'No conocen al cliente ni tienen capacidad de distribución.',
    has: ['presupuesto', 'especialistas', 'horas'],
    needs: ['cliente', 'logistica'],
  },
  {
    strength: 'Relación directa con el cliente y operación logística propia.',
    gap: 'Sin dinero disponible y sin especialistas.',
    has: ['cliente', 'logistica', 'informacion'],
    needs: ['presupuesto', 'especialistas'],
  },
  {
    strength: 'Presupuesto sano y la confianza del proveedor.',
    gap: 'Les falta información técnica y no tienen horas libres.',
    has: ['presupuesto', 'proveedor', 'cliente'],
    needs: ['informacion', 'horas'],
  },
  {
    strength: 'Especialistas, información técnica y capacidad logística.',
    gap: 'Sin contacto con el proveedor y con presupuesto agotado.',
    has: ['especialistas', 'informacion', 'logistica'],
    needs: ['proveedor', 'presupuesto'],
  },
  {
    strength: 'Mucho tiempo disponible, logística y buena relación con el proveedor.',
    gap: 'No tienen acceso al cliente ni la información técnica.',
    has: ['horas', 'proveedor', 'logistica'],
    needs: ['cliente', 'informacion'],
  },
  {
    strength: 'Acceso al cliente, información técnica y horas disponibles.',
    gap: 'Sin especialistas y sin contacto con el proveedor.',
    has: ['cliente', 'informacion', 'horas'],
    needs: ['proveedor', 'especialistas'],
  },
]

const list = (ids: NegotiationResource[], unit = false) =>
  ids.map((id) => (unit ? `${negotiationResources[id].label} (${negotiationResources[id].unit})` : negotiationResources[id].label)).join(' · ')

/** Tarjetas listas para la vista privada (se muestran sólo tantas como equipos haya). */
export const negotiationSecret: SecretInfo = {
  title: 'Objetivos secretos (una tarjeta por equipo)',
  body: 'Entrega a cada equipo SÓLO su tarjeta. Cumplen el objetivo si al final tienen lo que necesitan sin haber regalado todo lo suyo.',
  cards: negotiationCards.map((c, i) => ({
    title: `Tarjeta ${i + 1}`,
    lines: [
      `Fortaleza: ${c.strength}`,
      `Tienen: ${list(c.has)}.`,
      `Carencia: ${c.gap}`,
      `Objetivo secreto — consigan: ${list(c.needs, true)}.`,
    ],
  })),
}
