import type { GameEvent } from '../engine/types'

/**
 * Eventos: aparecen como modal sobre el tablero.
 * - Con `trigger`: el motor los revisa al iniciar cada paso (condicionales).
 * - Sin `trigger`: sólo por consecuencia programada o porque el facilitador los activa.
 */
export const events: GameEvent[] = [
  // ── Condicionales ────────────────────────────────────────────────────────
  {
    id: 'renuncia',
    title: 'Alguien está pensando irse',
    tone: 'negative',
    narrative: 'El clima del equipo pasó factura: una persona clave pidió hablar contigo en privado.',
    trigger: { indicator: 'equipo', op: '<', value: 40 },
    minStep: 2,
    effect: { indicators: { equipo: -2 }, injectChallenge: 'renuncia-clave' },
    facilitatorNotes: 'Inserta el reto "Una renuncia sobre la mesa" para este equipo.',
  },
  {
    id: 'cliente-renegocia',
    title: 'El cliente abre la puerta',
    tone: 'positive',
    narrative: 'Su reputación les precede: el cliente acepta renegociar las condiciones de entrega a su favor.',
    trigger: { indicator: 'reputacion', op: '>', value: 75 },
    effect: { indicators: { resultados: 6, recursos: 4 } },
  },
  {
    id: 'desgaste',
    title: 'Desgaste acumulado',
    tone: 'negative',
    narrative: 'Las horas extra se notan: errores pequeños, respuestas cortantes, dos personas con dolor de cabeza.',
    trigger: { all: [{ flag: 'sobrecarga' }, { indicator: 'equipo', op: '<', value: 55 }] },
    minStep: 3,
    effect: { indicators: { equipo: -6, resultados: -4 }, clearFlags: ['sobrecarga'] },
  },
  // ── Consecuencias diferidas (programadas por decisiones) ────────────────
  {
    id: 'clima-tenso',
    title: 'El precedente pesa',
    tone: 'negative',
    narrative:
      'Otra persona del equipo levantó la voz en una reunión. Cuando se le pidió calma, respondió: "Si a él se le permite…".',
    effect: { indicators: { equipo: -6, liderazgo: -4, reputacion: -3 }, setFlags: ['clima-tenso'] },
    facilitatorNotes: 'Consecuencia de ignorar el incidente en "El talento difícil".',
  },
  {
    id: 'cliente-descubre',
    title: 'El cliente lo descubrió',
    tone: 'crisis',
    narrative: 'El cliente se enteró de la caída por un tercero y pregunta por qué nadie le avisó.',
    effect: { indicators: { reputacion: -12, liderazgo: -4 } },
    facilitatorNotes: 'Consecuencia de ocultar la falla en "Crisis: la plataforma cae".',
  },
  // ── Sorpresas manuales (el facilitador decide cuándo) ───────────────────
  {
    id: 'auditoria',
    title: 'Auditoría sorpresa',
    tone: 'neutral',
    narrative: 'Contraloría llega sin aviso a revisar gastos del proyecto. Todos los comités pierden tiempo atendiendo.',
    effect: { target: 'all', indicators: { recursos: -5 } },
  },
  {
    id: 'apagon',
    title: 'Apagón en el piso',
    tone: 'crisis',
    narrative: 'Se va la luz durante 40 minutos. Nada de computadoras, nada de internet.',
    effect: { target: 'all', indicators: { resultados: -4 } },
  },
  {
    id: 'reconocimiento',
    title: 'Reconocimiento público',
    tone: 'positive',
    narrative: 'La dirección menciona al comité como ejemplo en el canal general de la empresa.',
    effect: { indicators: { liderazgo: 4, equipo: 3 } },
  },
  {
    id: 'mentor',
    title: 'Llega un mentor',
    tone: 'positive',
    narrative: 'Un directivo con experiencia ofrece media hora de asesoría.',
    effect: { resources: { comodin: 1 }, indicators: { liderazgo: 2 } },
  },
]
