import type { Challenge } from '../../engine/types'
import { negotiationSecret } from '../negotiation'

// Retos 06–09 · 11:20 a 13:20 — fuente: documento "Punto Crítico" (contenido v1).

export const middayChallenges: Challenge[] = [
  {
    id: 'nadie-tiene-todo',
    code: '06',
    clock: '11:20',
    title: 'Nadie tiene todo',
    type: 'negotiation',
    inPerson: true,
    categories: ['negociacion', 'comunicacion', 'decisiones'],
    chapter: 'manana',
    turnMode: 'interaction',
    minutes: 8,
    durationSec: 300,
    narrative:
      'Cada equipo necesita completar una misión. Ningún equipo posee todos los recursos: presupuesto, horas de especialistas, información, acceso al cliente, capacidad logística, contacto con proveedor, tiempo adicional.',
    instructions: [
      'Durante 5 minutos pueden intercambiar recursos, ofrecer favores, establecer alianzas, negociar información y crear acuerdos.',
      'No pueden simplemente regalar todo.',
      'Cada equipo tiene un objetivo secreto.',
    ],
    secret: negotiationSecret,
    outcomes: {
      // balance v3: liderazgo 3 → 1
      success: { label: 'Cumplen su objetivo', effect: { indicators: { resultados: 8, recursos: 5, liderazgo: 1 } } },
      partial: { label: 'Cumplen parcialmente', effect: { indicators: { resultados: 4 } } },
      fail: { label: 'No cumplen', effect: { indicators: { resultados: -3 } } },
    },
    bonuses: [
      {
        id: 'acuerdo-explicado',
        label: 'Acuerdo donde ambas partes explican qué ganaron',
        effect: { indicators: { reputacion: 4, equipo: 2 } },
      },
    ],
    facilitator: {
      notes:
        'Entrega a cada equipo su tarjeta secreta (vista privada: sólo aparecen tantas tarjetas como equipos). Observar quién pregunta, quién asume, quién cede demasiado, quién busca intereses y quién sólo discute posiciones. Califica a cada equipo y otorga la bonificación si aplica.',
    },
  },
  {
    id: 'ventas-vs-operaciones',
    code: '07',
    clock: '12:10',
    title: 'Ventas vs. Operaciones',
    type: 'open',
    categories: ['conflictos', 'comunicacion', 'liderazgo', 'ie-empatia'],
    chapter: 'mediodia',
    minutes: 5,
    durationSec: 180,
    narrative:
      'Ventas acusa a Operaciones: “Siempre retrasan nuestros compromisos con clientes.” Operaciones responde: “Ventas promete cosas sin consultarnos.” Ambas áreas tienen ejemplos para demostrar que la otra está equivocada. La discusión ya empieza a afectar al resto del personal.',
    instructions: ['Tienen 3 minutos para explicar cómo intervendrían.'],
    outcomes: {
      success: { label: 'Intervención sólida', effect: { indicators: { equipo: 7, liderazgo: 6, resultados: 3, reputacion: 2 } } },
      partial: { label: 'Intervención parcial', effect: { indicators: { equipo: 3, liderazgo: 2 } } },
      fail: {
        label: 'Tomaron partido',
        feedback: 'Tomar partido inmediatamente u “ordenar que se lleven bien” no resuelve el conflicto.',
        effect: { indicators: { equipo: -6, liderazgo: -5 } },
      },
    },
    facilitator: {
      notes: 'Fallo = tomar partido inmediatamente u “ordenar que se lleven bien”.',
      reference: [
        'Escuchar ambas versiones.',
        'Separar personas de problemas.',
        'Identificar causas del proceso.',
        'Acordar reglas de coordinación.',
        'Definir seguimiento.',
      ],
    },
  },
  {
    id: 'tres-proveedores',
    code: '08',
    clock: '12:40',
    title: 'Tres proveedores, una decisión',
    type: 'tool',
    categories: ['decisiones', 'recursos'],
    chapter: 'mediodia',
    turnMode: 'all-teams',
    minutes: 6,
    durationSec: 360,
    narrative: 'Deben elegir un proveedor. Definan primero cuánto pesa cada criterio. Después seleccionen.',
    table: {
      columns: ['Precio', 'Calidad', 'Entrega', 'Experiencia', 'Servicio'],
      rows: [
        { label: 'Proveedor A', cells: ['Excelente', 'Media', 'Riesgosa', 'Alta', 'Media'] },
        { label: 'Proveedor B', cells: ['Alto', 'Excelente', 'Excelente', 'Alta', 'Excelente'] },
        { label: 'Proveedor C', cells: ['Medio', 'Buena', 'Buena', 'Baja', 'Bueno'] },
      ],
    },
    outcomes: {
      success: {
        label: 'Con criterios y ponderación',
        effect: { indicators: { liderazgo: 1, resultados: 5, recursos: 4 } }, // balance v3: liderazgo 3 → 1
      },
      'solo-precio': {
        label: 'Sólo por precio',
        tone: 'partial',
        effect: { indicators: { recursos: 2, resultados: -3 } },
      },
    },
    takeaway: 'La decisión está tomada. Pero ninguna decisión elimina la incertidumbre.',
    bonuses: [
      {
        id: 'eligio-a',
        group: 'proveedor',
        label: 'Eligieron proveedor A',
        effect: { schedule: [{ event: 'proveedor-a-retraso', afterSteps: 0 }] },
      },
      {
        id: 'eligio-b',
        group: 'proveedor',
        label: 'Eligieron proveedor B',
        effect: { schedule: [{ event: 'proveedor-b-costo', afterSteps: 0 }] },
      },
      {
        id: 'eligio-c',
        group: 'proveedor',
        label: 'Eligieron proveedor C',
        effect: { schedule: [{ event: 'proveedor-c-acompanamiento', afterSteps: 0 }] },
      },
    ],
    facilitator: {
      notes:
        'La app no dice que exista una respuesta correcta. Califica el método y marca qué proveedor eligió cada equipo: al continuar aparecerá su mini evento.',
    },
  },
  {
    id: 'el-rumor',
    code: '09',
    clock: '13:20',
    title: 'El rumor',
    type: 'decision',
    categories: ['liderazgo', 'comunicacion', 'ie-autorregulacion'],
    chapter: 'mediodia',
    turnMode: 'all-teams',
    minutes: 4,
    narrative:
      'Empieza a circular un rumor: “Van a despedir gente después de terminar este proyecto.” Tú sabes que Dirección está revisando costos, pero no existe todavía ninguna decisión confirmada. El equipo empieza a preguntar.',
    options: [
      {
        id: 'a',
        label: '“Eso es falso. Nadie va a perder su empleo.”',
        effect: { indicators: { equipo: 3, liderazgo: -5, reputacion: -4 }, setFlags: ['promesa_sin_informacion'] },
      },
      {
        id: 'b',
        label: 'No decir nada hasta tener información oficial.',
        effect: { indicators: { equipo: -5, liderazgo: -2 } },
      },
      {
        id: 'c',
        label: 'Explicar qué información sí tienes, qué no sabes y cuándo actualizarás al equipo.',
        effect: { indicators: { liderazgo: 7, equipo: 5, reputacion: 4 } },
      },
      {
        id: 'd',
        label: 'Decir que es decisión de Dirección y que tú tampoco puedes hacer nada.',
        effect: { indicators: { liderazgo: -7, equipo: -5 } },
      },
    ],
    takeaway: 'Comunicar incertidumbre no significa inventar certezas.',
    facilitator: { notes: 'La opción A deja la bandera “promesa sin información”.' },
  },
]
