import type { Challenge } from '../../engine/types'

// Retos 10–15 · 14:00 a 17:00 — fuente: documento "Punto Crítico" (contenido v1).

export const afternoonChallenges: Challenge[] = [
  {
    id: 'punto-critico',
    code: '10',
    clock: '14:00',
    title: 'Punto crítico',
    type: 'crisis',
    ambience: 'crisis',
    categories: ['planeacion', 'liderazgo', 'decisiones'],
    chapter: 'tarde',
    turnMode: 'all-teams',
    minutes: 7,
    durationSec: 120,
    narrative: 'En menos de 10 minutos ocurre todo esto:',
    items: [
      'Un cliente amenaza con cancelar.',
      'Falta una persona clave.',
      'El proveedor confirma retraso.',
      'Aparece un error en información enviada.',
      'Dirección solicita una actualización inmediata.',
    ],
    instructions: [
      'Solo pueden resolver directamente dos.',
      'Los demás deben delegarse, contenerse, posponerse o escalarse.',
      'Tienen 120 segundos.',
    ],
    // Todos enfrentan "el proveedor confirma retraso": se marca problema_proveedor.
    outcomes: {
      success: {
        label: 'Excelente',
        // balance v2: liderazgo 8 → 6, +3 reputación (contienen al cliente que amenaza cancelar)
        effect: { indicators: { liderazgo: 6, resultados: 6, recursos: 4, reputacion: 3 }, setFlags: ['problema_proveedor'] },
      },
      partial: { label: 'Parcial', effect: { indicators: { liderazgo: 3, resultados: 2 }, setFlags: ['problema_proveedor'] } },
      fail: {
        label: 'Caótico',
        feedback: 'Intentaron resolver los cinco ellos mismos.',
        effect: { indicators: { liderazgo: -6, recursos: -7, resultados: -4 }, setFlags: ['problema_proveedor'] },
      },
    },
    takeaway: 'Gerenciar no es hacer todo. Es lograr que lo importante ocurra.',
    facilitator: {
      notes: 'No valorar únicamente qué escogieron. Valorar criterio, delegación, comunicación e impacto.',
    },
  },
  {
    id: 'quiere-pero-no-puede',
    code: '11',
    clock: '14:40',
    title: 'Quiere, pero no puede todavía',
    type: 'open',
    categories: ['equipos', 'liderazgo', 'ie-empatia'],
    chapter: 'tarde',
    turnMode: 'all-teams',
    minutes: 5,
    narrative:
      'Luis tiene excelente actitud, buena disposición, compromiso y relaciones positivas. Pero sus resultados están por debajo de lo esperado desde hace dos meses. ¿Qué haces?',
    instructions: ['Propongan su intervención.'],
    callbacks: [
      {
        when: { flag: 'sin_capacitacion' },
        title: 'Un momento…',
        text: 'Hace unas horas ustedes eliminaron capacitación del presupuesto. ¿Cambia algo su decisión?',
      },
    ],
    followUp: {
      title: 'Antes de decidir',
      items: [
        '¿Sabe exactamente qué se espera?',
        '¿Tiene conocimientos suficientes?',
        '¿Tiene herramientas?',
        '¿Ha recibido retroalimentación?',
        '¿Existe seguimiento?',
      ],
    },
    outcomes: {
      success: {
        label: 'Diagnóstico antes de sancionar',
        effect: { indicators: { liderazgo: 7, equipo: 6, resultados: 3 } },
      },
      partial: {
        label: 'Capacitación sin diagnóstico',
        effect: { indicators: { equipo: 3, liderazgo: 2 } },
      },
      fail: {
        label: 'Reemplazarlo',
        feedback: '“Si no mejora, reemplazarlo” como primera respuesta.',
        effect: { indicators: { equipo: -5, liderazgo: -5 } },
      },
    },
    facilitator: {
      notes:
        'No mostrar las preguntas al inicio: deja que el equipo proponga y después usa “Mostrar preguntas”. Si el equipo eliminó capacitación en el reto 05, la pantalla se lo recuerda automáticamente.',
    },
  },
  {
    id: 'cliente-quiere-todo',
    code: '12',
    clock: '15:15',
    title: 'El cliente quiere todo',
    type: 'negotiation',
    inPerson: true,
    categories: ['negociacion', 'comunicacion', 'ie-autorregulacion'],
    chapter: 'tarde',
    turnMode: 'all-teams',
    minutes: 6,
    durationSec: 180,
    narrative:
      'El cliente solicita 20% más alcance, misma fecha y mismo presupuesto. Y agrega: “Pensamos que por nuestra relación podrían apoyarnos.”',
    instructions: [
      'Tienen 3 minutos para preparar su respuesta.',
      'El facilitador interpreta al cliente con cada equipo (o un vocero por equipo responde en ronda).',
      'Pueden aceptar, rechazar, negociar alcance, modificar fecha, modificar costo, dividir por fases o pedir contraprestación.',
    ],
    outcomes: {
      success: { label: 'Excelente', effect: { indicators: { reputacion: 7, resultados: 5, recursos: 5 } } },
      partial: { label: 'Parcial', effect: { indicators: { reputacion: 3, resultados: 2 } } },
      'acepta-todo': {
        label: 'Aceptan todo sin negociar',
        tone: 'fail',
        effect: { indicators: { reputacion: 2, recursos: -8, equipo: -4 } },
      },
      'rechazo-rigido': {
        label: 'Rechazo rígido',
        tone: 'fail',
        effect: { indicators: { recursos: 2, reputacion: -7 } },
      },
    },
    facilitator: { notes: 'Interpretas al cliente. Busca que negocien variables, no sólo precio.' },
  },
  {
    id: 'mapa-del-terreno',
    code: '13',
    clock: '15:50',
    title: 'El mapa del terreno',
    type: 'tool',
    categories: ['planeacion', 'decisiones'],
    chapter: 'cierre',
    turnMode: 'all-teams',
    minutes: 5,
    durationSec: 300,
    narrative: 'Clasifiquen estos elementos en un FODA:',
    items: [
      'Equipo con mucha experiencia.',
      'Dependencia excesiva de un proveedor.',
      'Nuevo mercado creciendo rápidamente.',
      'Competidor internacional entrando.',
      'Buena reputación con clientes actuales.',
      'Tecnología interna anticuada.',
      'Nueva regulación favorable.',
      'Escasez de talento especializado.',
    ],
    instructions: ['Segunda parte: elijan UN elemento del FODA sobre el que actuarían primero y argumenten.'],
    outcomes: {
      // balance v3: liderazgo 3 → 1
      success: { label: 'Correcto + buena prioridad', effect: { indicators: { resultados: 5, liderazgo: 1 } } },
      partial: { label: 'Correcto', effect: { indicators: { resultados: 3 } } },
    },
    facilitator: {
      notes: 'En la segunda parte importa la argumentación.',
      reference: ['Fortalezas: 1, 5', 'Debilidades: 2, 6', 'Oportunidades: 3, 7', 'Amenazas: 4, 8'],
    },
  },
  {
    id: 'decidir-sin-certeza',
    code: '14',
    clock: '16:20',
    title: 'Decidir sin certeza',
    type: 'decision',
    categories: ['decisiones', 'planeacion'],
    chapter: 'cierre',
    turnMode: 'all-teams',
    minutes: 6,
    durationSec: 360,
    narrative: 'El proyecto está listo al 85%. Tienen tres caminos. ¿Qué hacen?',
    // Resultado preconfigurado (no probabilístico) para la experiencia presencial.
    options: [
      {
        id: 'a',
        label: 'Lanzar ahora',
        detail: '70% de probabilidad de funcionar bien · 30% de una falla visible para clientes.',
        feedback:
          'Salieron al mercado de inmediato: aparece una falla menor visible para algunos clientes, pero el lanzamiento sí ocurre. Ganaron velocidad, pero asumieron exposición. El riesgo no desapareció por haber decidido rápido.',
        effect: { indicators: { resultados: 4, reputacion: -4, liderazgo: 1 }, setFlags: ['lanzamiento_anticipado'] },
      },
      {
        id: 'b',
        label: 'Retrasar una semana',
        detail: '95% de lanzamiento estable, pero se pierde una oportunidad comercial importante.',
        feedback: 'La estabilidad aumentó, pero tuvo un costo de oportunidad.',
        effect: { indicators: { resultados: 3, reputacion: 1, recursos: -3 }, setFlags: ['oportunidad_perdida'] },
      },
      {
        id: 'c',
        label: 'Piloto limitado',
        detail: 'Reduce la exposición al riesgo, pero no aprovecha toda la oportunidad actual.',
        feedback: 'Redujeron exposición sin detener completamente el avance.',
        effect: { indicators: { resultados: 4, liderazgo: 4, recursos: -2 }, setFlags: ['piloto_controlado'] },
      },
    ],
    followUp: { title: 'Después de decidir', items: ['¿Qué riesgo están aceptando deliberadamente?'] },
    // La calidad del argumento se califica aparte (bono excluyente por equipo).
    bonuses: [
      {
        id: 'riesgo-claro',
        group: 'argumento',
        label: 'Identifican claramente riesgo y consecuencia',
        effect: { indicators: { liderazgo: 5, resultados: 4 } },
      },
      {
        id: 'creemos-que-saldra-bien',
        group: 'argumento',
        label: 'Sólo “creemos que va a salir bien”',
        effect: { indicators: { liderazgo: -2 } },
      },
    ],
    facilitator: {
      notes:
        'Ninguna opción es la correcta. Cada equipo elige un camino (efecto preconfigurado) y, tras la pregunta “¿qué riesgo aceptan?”, califica su argumento con el bono correspondiente.',
    },
  },
  {
    id: 'el-consejo',
    code: '15',
    clock: '17:00',
    title: 'El Consejo',
    type: 'open',
    categories: ['comunicacion', 'liderazgo'],
    chapter: 'consejo',
    turnMode: 'all-teams',
    minutes: 10,
    durationSec: 120,
    showDossier: true,
    narrative:
      'Son las 17:00. La jornada terminó. El Consejo ya conoce sus números. Ahora quiere saber algo más importante: ¿cómo tomaron sus decisiones?',
    instructions: [
      '¿Cuál fue la decisión más difícil?',
      '¿Qué decisión cambiarían?',
      '¿Qué competencia gerencial utilizaron más?',
      '¿Qué aprendieron sobre su manera de trabajar como equipo?',
    ],
    facilitator: {
      notes:
        'Preparación: 2 minutos (temporizador). Presentación: máximo 3 minutos por equipo (ajusta con el temporizador del panel). Cada equipo ve su expediente en pantalla.',
    },
  },
]
