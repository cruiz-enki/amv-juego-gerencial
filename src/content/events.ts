import type { GameEvent } from '../engine/types'

/**
 * Eventos — fuente: documento "Punto Crítico" (contenido v1).
 * - conditional: el motor revisa `trigger` al iniciar cada paso (minStep/maxStep acotan cuándo).
 * - consequence: lo programa una decisión previa (`schedule` en el efecto de una opción o bono).
 * - surprise:    sólo lo activa el facilitador.
 *
 * Índices de paso: el reto 01 es el paso 0, el reto 05 el paso 4, etc.
 */
export const events: GameEvent[] = [
  {
    id: 'todo-urge',
    title: 'Todo urge',
    kind: 'conditional',
    tone: 'crisis',
    narrative: 'Tres personas diferentes acaban de decir: “Esto urge.” No todo puede ser prioridad.',
    question: '¿Qué criterio usarán para decidir qué realmente requiere atención inmediata?',
    trigger: { indicator: 'recursos', op: '<', value: 45 },
    // Sólo justo después del reto 04.
    minStep: 4,
    maxStep: 4,
    effect: { indicators: { recursos: -4 } },
    options: [
      { id: 'solida', label: 'Respuesta sólida', effect: { indicators: { liderazgo: 3 } } },
      { id: 'sin-criterio', label: 'Sin criterio claro', effect: {} },
    ],
    facilitatorNotes: 'Evento sorpresa 01: aparece después del reto 04 si Recursos < 45.',
  },
  {
    id: 'se-contagia-el-comportamiento',
    title: 'Se contagia el comportamiento',
    kind: 'consequence',
    tone: 'negative',
    narrative:
      'El problema no desapareció. Otro integrante del equipo acaba de responder agresivamente: “Si Mariana puede hacerlo, ¿por qué yo no?”',
    takeaway: 'Lo que toleras también comunica.',
    effect: { indicators: { equipo: -7, liderazgo: -5 } },
    facilitatorNotes: 'Consecuencia diferida A: la programa la opción A del reto 03 (talento sin límites).',
  },
  {
    id: 'proveedor-a-retraso',
    title: 'La entrega se retrasa',
    kind: 'consequence',
    tone: 'negative',
    narrative: 'El proveedor A avisa que la entrega se retrasa.',
    effect: { indicators: { resultados: -5 }, setFlags: ['problema_proveedor'] },
    facilitatorNotes: 'Mini evento del reto 08 (eligieron proveedor A).',
  },
  {
    id: 'proveedor-b-costo',
    title: 'Dirección cuestiona el costo',
    kind: 'consequence',
    tone: 'negative',
    narrative: 'Dirección cuestiona el costo del proveedor B.',
    effect: { indicators: { recursos: -5 } },
    facilitatorNotes: 'Mini evento del reto 08 (eligieron proveedor B).',
  },
  {
    id: 'proveedor-c-acompanamiento',
    title: 'Necesita acompañamiento adicional',
    kind: 'consequence',
    tone: 'neutral',
    narrative: 'El proveedor C necesita acompañamiento adicional para cumplir.',
    effect: { indicators: { recursos: -2, liderazgo: -1 }, setFlags: ['problema_proveedor'] },
    facilitatorNotes: 'Mini evento del reto 08 (eligieron proveedor C).',
  },
  {
    id: 'la-persona-clave',
    title: 'La persona clave',
    kind: 'conditional',
    tone: 'negative',
    narrative:
      '¿Recuerdan a la persona que pidió hablar con ustedes a las 08:00? Acaba de comunicar que está considerando dejar el proyecto.',
    question: '¿Gastan 2 puntos de Recursos para abrir una conversación de recuperación?',
    trigger: { flag: 'persona_ignorada' },
    minStep: 10,
    effect: { indicators: { equipo: -7, resultados: -4 } },
    options: [
      {
        id: 'recuperar',
        label: 'Abrir conversación de recuperación (cuesta Recursos)',
        effect: { indicators: { recursos: -2, equipo: 3, liderazgo: 3 } },
      },
      { id: 'no', label: 'No abrir la conversación', effect: {} },
    ],
    facilitatorNotes: 'Evento sorpresa 02: después del reto 10, si en el reto 01 ignoraron al colaborador.',
  },
  {
    id: 'el-cliente-no-olvido',
    title: 'El cliente no olvidó',
    kind: 'conditional',
    tone: 'crisis',
    narrative: 'El cliente que solicitó atención esta mañana escala el problema con Dirección.',
    trigger: { flag: 'cliente_ignorado' },
    minStep: 10,
    effect: { indicators: { reputacion: -8, resultados: -3 } },
    facilitatorNotes: 'Evento sorpresa 03: después del reto 10, si en el reto 01 ignoraron al cliente.',
  },
  {
    id: 'la-promesa-regresa',
    title: 'La promesa regresa',
    kind: 'conditional',
    tone: 'crisis',
    narrative:
      'Dirección confirma que sí habrá ajustes en la organización. Hace unas horas aseguraron al equipo: “Nadie va a perder su empleo.” Ahora tienen que enfrentar esa conversación.',
    takeaway: 'Comunicar con tranquilidad no significa inventar certezas.',
    trigger: { flag: 'promesa_sin_informacion' },
    minStep: 10,
    effect: { indicators: { liderazgo: -6, equipo: -5, reputacion: -4 } },
    facilitatorNotes: 'Consecuencia de la opción A del reto 09. Aparece después del reto 10, una sola vez.',
  },
  {
    id: 'la-senal-del-proveedor',
    title: 'La señal de la mañana',
    kind: 'conditional',
    tone: 'negative',
    narrative:
      'El problema con el proveedor ya llegó. Esta señal apareció desde la mañana. No atender un riesgo no significa que desaparezca.',
    trigger: { all: [{ flag: 'riesgo_proveedor' }, { flag: 'problema_proveedor' }] },
    effect: { indicators: { resultados: -3 } },
    facilitatorNotes:
      'Si en el reto 01 ignoraron al proveedor, el primer problema de proveedor (reto 08 o reto 10) cuesta Resultados −3 adicional. Sólo una vez.',
  },
  {
    id: 'la-reputacion-habla',
    title: 'La reputación habla',
    kind: 'conditional',
    tone: 'positive',
    narrative:
      'Un cliente anterior recomienda su equipo con un nuevo prospecto. Su reputación les compra tiempo y confianza.',
    takeaway: 'La reputación también es un recurso.',
    trigger: { indicator: 'reputacion', op: '>=', value: 65 },
    minStep: 14,
    effect: { indicators: { resultados: 5, recursos: 3 } },
    facilitatorNotes: 'Evento sorpresa 04: después del reto 14, si Reputación ≥ 65.',
  },
  {
    id: 'la-factura-invisible',
    title: 'La factura invisible',
    kind: 'conditional',
    tone: 'negative',
    narrative: 'Los resultados continúan. Pero empiezan a aparecer errores, ausencias, fricción y retrabajo.',
    takeaway: 'El costo de descuidar al equipo rara vez aparece inmediatamente.',
    trigger: { indicator: 'equipo', op: '<=', value: 35 },
    minStep: 14,
    effect: { indicators: { resultados: -6, recursos: -5 } },
    facilitatorNotes: 'Evento sorpresa 05: después del reto 14, si Equipo ≤ 35.',
  },
]
