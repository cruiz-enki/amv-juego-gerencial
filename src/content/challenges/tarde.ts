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
    outcomes: {
      success: { label: 'Excelente', effect: { indicators: { liderazgo: 8, resultados: 6, recursos: 4 } } },
      partial: { label: 'Parcial', effect: { indicators: { liderazgo: 3, resultados: 2 } } },
      fail: {
        label: 'Caótico',
        feedback: 'Intentaron resolver los cinco ellos mismos.',
        effect: { indicators: { liderazgo: -6, recursos: -7, resultados: -4 } },
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
    categories: ['equipos', 'liderazgo'],
    chapter: 'tarde',
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
    categories: ['negociacion', 'comunicacion'],
    chapter: 'tarde',
    minutes: 6,
    durationSec: 180,
    narrative:
      'El cliente solicita 20% más alcance, misma fecha y mismo presupuesto. Y agrega: “Pensamos que por nuestra relación podrían apoyarnos.”',
    instructions: [
      'Tienen 3 minutos para preparar su respuesta.',
      'El facilitador interpreta al cliente.',
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
      success: { label: 'Correcto + buena prioridad', effect: { indicators: { resultados: 5, liderazgo: 3 } } },
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
    type: 'tool',
    categories: ['decisiones', 'planeacion'],
    chapter: 'cierre',
    turnMode: 'all-teams',
    minutes: 6,
    durationSec: 360,
    narrative: 'El proyecto está listo al 85%. Tienen tres caminos:',
    itemStyle: 'letter',
    items: [
      'Lanzar ahora: 70% de probabilidad de funcionar correctamente; 30% de una falla visible para clientes.',
      'Retrasar una semana: 95% de probabilidad de lanzamiento estable, pero se pierde una oportunidad comercial importante.',
      'Piloto limitado: reduce la exposición al riesgo, pero no permite aprovechar toda la oportunidad actual.',
    ],
    instructions: ['¿Qué hacen?'],
    followUp: { title: 'Después de decidir', items: ['¿Qué riesgo están aceptando deliberadamente?'] },
    outcomes: {
      success: {
        label: 'Riesgo y consecuencia claros',
        effect: { indicators: { liderazgo: 5, resultados: 4 } },
      },
      fail: {
        label: '“Creemos que va a salir bien”',
        effect: { indicators: { liderazgo: -2 } },
      },
    },
    facilitatorFlags: [
      { flag: 'camino_lanzar', label: 'Eligieron lanzar ahora' },
      { flag: 'camino_retrasar', label: 'Eligieron retrasar una semana' },
      { flag: 'camino_piloto', label: 'Eligieron piloto limitado' },
    ],
    facilitator: {
      notes:
        'No hay respuesta correcta. Marca el camino elegido. El resultado de cada camino (preconfigurado, recomendado para evento presencial) está por definir.',
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
