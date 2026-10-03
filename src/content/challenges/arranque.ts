import type { Challenge } from '../../engine/types'

// Retos 01–05 · 08:00 a 10:40 — fuente: documento "Punto Crítico" (contenido v1).

export const morningChallenges: Challenge[] = [
  {
    id: 'reunion-que-no-puede-esperar',
    code: '01',
    clock: '08:00',
    title: 'La reunión que no puede esperar',
    type: 'tool',
    categories: ['decisiones', 'planeacion', 'liderazgo'],
    chapter: 'arranque',
    turnMode: 'all-teams',
    minutes: 4,
    durationSec: 240,
    narrative:
      'Son las 08:00. A las 10:00 tienes una reunión crítica con Dirección. Antes de eso aparecen siete asuntos:',
    items: [
      'Un cliente importante solicita hablar contigo.',
      'Dos colaboradores llevan varios días en conflicto.',
      'El reporte mensual todavía no está terminado.',
      'Un proveedor informa que podría retrasarse.',
      'Un integrante de tu equipo pide hablar contigo “urgentemente”.',
      'Hay un error administrativo que puede corregirse hoy.',
      'Apareció una oportunidad comercial que vence esta tarde.',
    ],
    instructions: [
      'Solo pueden atender personalmente 3 antes de las 10:00.',
      'Definan: los 3 que atenderán directamente, qué delegan, qué agendan y qué deciden no atender todavía.',
    ],
    outcomes: {
      success: {
        label: 'Priorización con criterio',
        feedback: 'Existe priorización clara, delegación y criterio.',
        effect: { indicators: { liderazgo: 6, resultados: 4, equipo: 3 } },
      },
      partial: {
        label: 'Casi todo en sus manos',
        feedback: 'Priorizan razonablemente, pero quieren resolver casi todo personalmente.',
        effect: { indicators: { resultados: 3, liderazgo: 1, recursos: -2 } },
      },
      fail: {
        label: 'Por orden de llegada',
        feedback: 'No priorizan, resuelven por orden de llegada o intentan hacerlo todo.',
        effect: { indicators: { liderazgo: -5, recursos: -4 } },
      },
    },
    facilitatorFlags: [
      { flag: 'persona_ignorada', label: 'Ignoraron por completo al colaborador' },
      { flag: 'cliente_ignorado', label: 'Ignoraron al cliente' },
      { flag: 'riesgo_proveedor', label: 'Ignoraron al proveedor' },
    ],
    facilitator: {
      notes:
        'No preguntar “¿cuál es la respuesta correcta?”. Buscar si distinguen entre hacer, delegar, calendarizar y descartar. Marca las banderas si ignoran al colaborador, al cliente o al proveedor: se usarán más tarde.',
    },
  },
  {
    id: 'mensaje-imposible',
    code: '02',
    clock: '08:40',
    title: 'El mensaje imposible',
    type: 'timed',
    inPerson: true,
    categories: ['comunicacion'],
    chapter: 'arranque',
    turnMode: 'all-teams',
    minutes: 5,
    durationSec: 60,
    narrative:
      'MISIÓN DE COMUNICACIÓN. Una persona sabe exactamente qué debe construirse. Las demás no pueden verlo. Tienen 60 segundos.',
    instructions: [
      'Un representante por equipo ve la figura en privado.',
      'Debe describirla sin mostrarla, sin señalar y sin dibujar.',
      'El resto del equipo la reconstruye.',
    ],
    secret: {
      title: 'Figura para el representante',
      image: '/figuras/mensaje-imposible.svg',
      body: 'Figura provisional: reemplázala por la definitiva en public/figuras/.',
      rules: [
        'No puede mostrar la imagen.',
        'No puede señalar.',
        'No puede dibujar.',
        'Opcional: no puede decir nombres de figuras específicas.',
      ],
    },
    followUp: {
      title: 'Antes de ver el resultado',
      items: ['¿Qué hicieron para comprobar que todos estaban entendiendo lo mismo?'],
    },
    outcomes: {
      success: {
        label: 'Reproducción muy similar',
        effect: { indicators: { equipo: 6, liderazgo: 4, resultados: 3 } },
      },
      partial: {
        label: 'Reproducción parcial',
        effect: { indicators: { equipo: 3, liderazgo: 2 } },
      },
      fail: {
        label: 'Muy diferente',
        effect: { indicators: { equipo: -2, resultados: -2 } },
      },
    },
    facilitator: {
      notes:
        'Muestra la figura sólo al representante (botón "Vista privada" en este panel). Escuchar si aparecen preguntas, confirmación, lenguaje claro y retroalimentación. Haz la pregunta posterior antes de mostrar el resultado.',
    },
  },
  {
    id: 'talento-dificil',
    code: '03',
    clock: '09:20',
    title: 'El talento difícil',
    type: 'decision',
    categories: ['liderazgo', 'conflictos', 'equipos'],
    chapter: 'arranque',
    minutes: 4,
    narrative:
      'Mariana es una de las personas con mejores resultados del equipo. Hoy, frente a todos, confrontó duramente a un compañero por un error. Su reclamo tenía fundamento. La forma en que lo hizo dejó al equipo incómodo y al compañero visiblemente molesto. ¿Qué haces?',
    options: [
      {
        id: 'a',
        label: 'No intervienes. Sus resultados hablan por ella.',
        effect: {
          indicators: { resultados: 4, equipo: -8, liderazgo: -6, reputacion: -2 },
          setFlags: ['talento_sin_limites'],
          schedule: [{ event: 'se-contagia-el-comportamiento', afterSteps: 4 }],
        },
      },
      {
        id: 'b',
        label: 'Hablas en privado con Mariana: reconoces el problema que señaló y marcas el límite sobre la forma.',
        effect: { indicators: { liderazgo: 7, equipo: 6, resultados: 2 }, setFlags: ['feedback_mariana'] },
      },
      {
        id: 'c',
        label: 'Reúnes inmediatamente a ambas personas para resolver el conflicto frente a ti.',
        effect: { indicators: { liderazgo: 3, equipo: 2, resultados: -2 }, setFlags: ['mediacion_directa'] },
      },
      {
        id: 'd',
        label: 'Aplicas de inmediato una sanción formal.',
        effect: { indicators: { liderazgo: 1, equipo: -2, reputacion: 2, resultados: -2 } },
      },
    ],
    takeaway:
      'Los resultados no eliminan la responsabilidad sobre el comportamiento. Liderar implica gestionar tanto qué se logra como cómo se logra.',
    facilitator: {
      notes:
        'La opción A programa la consecuencia diferida “Se contagia el comportamiento”, que aparece 3 retos después (antes del reto 07).',
    },
  },
  {
    id: 'cinco-pendientes',
    code: '04',
    clock: '10:00',
    title: 'Cinco pendientes, dos manos',
    type: 'tool',
    categories: ['planeacion', 'decisiones', 'liderazgo'],
    chapter: 'manana',
    turnMode: 'all-teams',
    minutes: 5,
    durationSec: 300,
    narrative: 'Tienen estas cinco tareas:',
    itemStyle: 'letter',
    items: [
      'Cliente estratégico pide respuesta antes de una hora.',
      'Preparar una presentación para dentro de tres semanas.',
      'Autorizar una compra rutinaria que otro responsable puede revisar.',
      'Resolver una falla que detuvo parcialmente la operación.',
      'Revisar personalmente el diseño de una invitación interna.',
    ],
    instructions: [
      'Clasifiquen cada tarea: urgente + importante · importante + no urgente · urgente + no importante · no urgente + no importante.',
      '¿Qué hacen ustedes, qué delegan y qué eliminan?',
    ],
    outcomes: {
      success: { label: 'Matriz sólida', effect: { indicators: { liderazgo: 5, recursos: 6, resultados: 4 } } },
      partial: { label: 'Matriz parcial', effect: { indicators: { recursos: 2, resultados: 2 } } },
      fail: { label: 'Sin criterio', effect: { indicators: { recursos: -5, liderazgo: -3 } } },
    },
    facilitator: {
      notes: 'No castigar pequeñas diferencias justificadas.',
      reference: [
        'A = urgente / importante',
        'B = importante / no urgente',
        'C = urgente o rutinaria / delegable',
        'D = urgente / importante',
        'E = baja prioridad',
      ],
    },
  },
  {
    id: 'el-recorte',
    code: '05',
    clock: '10:40',
    title: 'El recorte',
    type: 'decision',
    categories: ['planeacion', 'decisiones', 'recursos'],
    chapter: 'manana',
    turnMode: 'all-teams',
    minutes: 5,
    durationSec: 300,
    narrative:
      'Dirección acaba de anunciar: el presupuesto del proyecto se reduce 25%. Actualmente financian cinco iniciativas:',
    items: [
      'Capacitación del equipo.',
      'Campaña comercial.',
      'Mantenimiento preventivo.',
      'Contratación de apoyo temporal.',
      'Actualización tecnológica.',
    ],
    instructions: ['Solo pueden conservar tres completamente.', '¿Cuáles conservan y por qué?'],
    outcomes: {
      success: {
        label: 'Decisión coherente',
        feedback: 'Decisión coherente con riesgos y objetivos.',
        effect: { indicators: { recursos: 6, resultados: 4, liderazgo: 3 } },
      },
      partial: { label: 'Decisión parcial', effect: { indicators: { recursos: 2, resultados: 2 } } },
      fail: {
        label: 'Recortes arbitrarios',
        feedback: 'Recortes arbitrarios o exclusivamente por costo.',
        effect: { indicators: { recursos: -5, resultados: -3 } },
      },
    },
    facilitatorFlags: [
      { flag: 'sin_capacitacion', label: 'Eliminaron capacitación' },
      { flag: 'sin_campana', label: 'Eliminaron campaña comercial' },
      { flag: 'sin_mantenimiento', label: 'Eliminaron mantenimiento' },
      { flag: 'sin_apoyo', label: 'Eliminaron apoyo temporal' },
      { flag: 'sin_tecnologia', label: 'Eliminaron actualización tecnológica' },
    ],
    facilitator: {
      notes:
        'No existe combinación universal correcta: evalúa la lógica. Marca qué iniciativas eliminó cada equipo (“sin capacitación” se retoma en el reto 11).',
    },
  },
]
