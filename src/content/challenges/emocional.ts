import type { Challenge } from '../../engine/types'

// Inteligencia emocional explícita (iteración 5) — fuente: propuesta de Carlos, 6-oct-2026.
// Los números (IE1, IE2), las horas y la posición en la agenda se pueden cambiar en /admin.

export const emotionalChallenges: Challenge[] = [
  {
    id: 'no-eres-tu-pero-te-pega',
    code: 'IE1',
    clock: '09:40',
    title: 'No eres tú, pero te pega',
    type: 'decision',
    categories: ['ie-autoconciencia', 'ie-autorregulacion', 'ie-empatia'],
    chapter: 'arranque',
    turnMode: 'all-teams',
    minutes: 4,
    narrative:
      'Acabas de recibir una llamada donde Dirección cuestiona duramente un resultado de tu área. Sales de esa llamada molesto y, segundos después, un colaborador se acerca para pedirte ayuda con un problema que pudo haber evitado. ¿Qué haces?',
    options: [
      {
        id: 'a',
        label: 'Le respondes inmediatamente y le haces notar que “esto ya debería saberlo”.',
        recommendation: 'discouraged',
        effect: {
          indicators: { equipo: -5, liderazgo: -4, resultados: 1 },
          setFlags: ['descarga_emocional'],
          schedule: [{ event: 'la-factura-emocional', afterSteps: 3 }],
        },
      },
      {
        id: 'b',
        label: 'Te tomas un momento breve para reconocer cómo vienes de la llamada y después atiendes el problema.',
        recommendation: 'recommended',
        effect: { indicators: { liderazgo: 5, equipo: 4, resultados: 2 } },
      },
      {
        id: 'c',
        label: 'Le dices que no puedes atenderlo ahora y agendas un momento concreto para revisarlo.',
        recommendation: 'acceptable',
        effect: { indicators: { liderazgo: 3, equipo: 2, recursos: 2 } },
      },
      {
        id: 'd',
        label: 'Finges que no estás molesto y respondes como si nada.',
        recommendation: 'discouraged',
        effect: { indicators: { liderazgo: 1 } },
      },
    ],
    takeaway: 'Autorregularse no significa “no sentir”. Significa reconocer el estado emocional antes de dejar que decida por ti.',
    facilitator: {
      notes:
        'La opción A deja la bandera “descarga emocional” y programa “La factura emocional” 3 retos después. B es la respuesta deseada; C es aceptable (regula aplazando con un compromiso concreto); D reprime en lugar de regular.',
    },
  },
  {
    id: 'la-persona-dificil',
    code: 'IE2',
    clock: '13:40',
    title: 'La persona difícil',
    type: 'open',
    inPerson: true,
    categories: ['ie-empatia', 'ie-manejo-emocional', 'ie-autorregulacion', 'comunicacion', 'conflictos'],
    chapter: 'mediodia',
    turnMode: 'all-teams',
    minutes: 5,
    durationSec: 120,
    narrative:
      'Un integrante del equipo llega visiblemente molesto y dice: “Aquí nunca escuchan. Ya estoy harto de que las decisiones siempre las tomen sin nosotros.”',
    instructions: ['El facilitador interpreta a la persona molesta.', 'El equipo responde en vivo.'],
    outcomes: {
      success: {
        label: 'Escucha y valida',
        criteria: 'Escuchan antes de defenderse, reconocen la emoción, separan emoción de hecho, preguntan y buscan la necesidad detrás de la queja.',
        effect: { indicators: { equipo: 7, liderazgo: 5, reputacion: 2 } },
      },
      partial: {
        label: 'Escucha a medias',
        criteria: 'Reconocen la emoción pero se defienden o buscan calmar antes de entender.',
        effect: { indicators: { equipo: 3, liderazgo: 2 } },
      },
      fail: {
        label: 'A la defensiva',
        criteria: 'Responden a la defensiva, minimizan la emoción o intentan “calmar” de inmediato.',
        effect: { indicators: { equipo: -6, liderazgo: -4 } },
      },
    },
    takeaway: 'Validar una emoción no es darle la razón a toda la interpretación: es entender antes de responder.',
    facilitator: {
      notes:
        'Respuesta deseada: NO “calmar” a la persona de inmediato, sino validar la emoción sin necesariamente aceptar toda su interpretación.',
      reference: [
        'Escuchan antes de defenderse.',
        'Reconocen la emoción.',
        'Separan emoción de hecho.',
        'Hacen preguntas.',
        'Evitan responder a la defensiva.',
        'Buscan entender la necesidad detrás de la queja.',
      ],
    },
  },
]
