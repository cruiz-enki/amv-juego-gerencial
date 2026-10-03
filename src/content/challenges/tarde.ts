import type { Challenge } from '../../engine/types'

// CONTENIDO MOCK — sólo para probar el motor. El contenido final se escribirá después.

export const afternoonChallenges: Challenge[] = [
  {
    id: 'equipo-fracturado',
    title: 'Veteranos contra nuevos',
    type: 'open',
    categories: ['equipos', 'conflictos', 'liderazgo'],
    chapter: 'quiebre',
    durationSec: 120,
    narrative:
      'El equipo se partió en dos: los veteranos sienten que los nuevos "no entienden cómo se hacen las cosas" y los nuevos sienten que nadie escucha sus ideas. Hoy ya no comieron juntos.',
    instructions: [
      'Expliquen en qué etapa de desarrollo está este equipo.',
      'Propongan dos acciones concretas para las próximas 48 horas.',
    ],
    outcomes: {
      success: {
        label: 'Diagnóstico y plan',
        feedback: 'Nombraron la etapa y propusieron acciones que reconstruyen confianza.',
        effect: { indicators: { equipo: 8, liderazgo: 3 } },
      },
      partial: {
        label: 'Buenas intenciones',
        feedback: 'Las acciones ayudan, pero no atacan la causa.',
        effect: { indicators: { equipo: 3 } },
      },
      fail: {
        label: 'Se tomó partido',
        feedback: 'La propuesta favorece a un grupo; el otro se repliega.',
        effect: { indicators: { equipo: -6, liderazgo: -2 } },
      },
    },
    facilitator: {
      notes: 'Referencia: Tuckman (formación, conflicto, normalización, desempeño). Buscar acciones de integración con objetivo compartido.',
    },
  },
  {
    id: 'caida-plataforma',
    title: 'Crisis: la plataforma cae',
    type: 'crisis',
    categories: ['decisiones', 'comunicacion', 'liderazgo'],
    chapter: 'quiebre',
    narrative:
      'A las 12:40 la plataforma que usará el cliente deja de responder. Sistemas calcula dos horas para restablecerla. El cliente tiene una demostración interna a las 15:00.',
    options: [
      {
        id: 'a',
        label: 'Avisar al cliente ya, con un plan',
        feedback: 'Transparencia temprana: incómodo hoy, pero el cliente puede reorganizar su demostración.',
        effect: { indicators: { reputacion: 6, resultados: -3 } },
      },
      {
        id: 'b',
        label: 'Arreglar en silencio y avisar sólo si no se logra',
        feedback: 'Si sale bien nadie se entera. Si no, el cliente lo descubrirá por su cuenta.',
        effect: {
          indicators: { resultados: 3 },
          setFlags: ['oculto-falla'],
          schedule: [{ event: 'cliente-descubre', afterSteps: 2 }],
        },
      },
      {
        id: 'c',
        label: 'Detener todo y escalar a Dirección',
        feedback: 'Se gana respaldo, pero se frena el trabajo de todos mientras se decide.',
        effect: { indicators: { recursos: -6, liderazgo: 2, reputacion: 2 } },
      },
    ],
    facilitator: {
      notes: 'B programa el evento "El cliente lo descubre" dos pasos después.',
    },
  },
  {
    id: 'proveedor-clave',
    title: 'El proveedor clave',
    type: 'negotiation',
    categories: ['negociacion', 'recursos', 'comunicacion'],
    chapter: 'negociacion',
    turnMode: 'interaction',
    durationSec: 240,
    narrative:
      'El proveedor del componente crítico puede entregar a tiempo sólo a UNO de dos clientes. Cada par de equipos negocia: uno representa al proveedor y otro al comité que necesita la pieza.',
    instructions: [
      'Formen parejas de equipos (el facilitador las asigna).',
      'Tienen 4 minutos para llegar a un acuerdo por escrito.',
      'Busquen un acuerdo que ambas partes puedan sostener.',
    ],
    outcomes: {
      success: {
        label: 'Acuerdo ganar–ganar',
        feedback: 'Encontraron intereses detrás de las posiciones.',
        effect: { indicators: { resultados: 5, recursos: 4, reputacion: 3 } },
      },
      partial: {
        label: 'Acuerdo frágil',
        feedback: 'Hay acuerdo, pero una parte cedió de más.',
        effect: { indicators: { resultados: 2, recursos: -2 } },
      },
      fail: {
        label: 'Sin acuerdo',
        feedback: 'Se rompió la mesa. Ambos pierden tiempo.',
        effect: { indicators: { resultados: -4, reputacion: -3 } },
      },
    },
    facilitator: {
      notes: 'Califica a cada equipo por separado. Observa posiciones vs. intereses y la MAAN de cada parte.',
    },
  },
  {
    id: 'delegar-o-cargar',
    title: '¿Delegar o cargar?',
    type: 'decision',
    categories: ['liderazgo', 'equipos', 'planeacion'],
    chapter: 'cierre',
    narrative:
      'Tu mejor analista está al límite y la entrega depende de su trabajo. Un integrante junior pide hacerse cargo de una parte; tiene potencial, pero nunca lo ha hecho.',
    options: [
      {
        id: 'a',
        label: 'Delegar al junior con acompañamiento',
        feedback: 'Más lento hoy, pero el equipo gana capacidad y el analista respira.',
        effect: { indicators: { equipo: 5, liderazgo: 4, resultados: -2 }, clearFlags: ['sobrecarga'] },
      },
      {
        id: 'b',
        label: 'Que el analista lo termine; es lo seguro',
        feedback: 'Se entrega con calidad. El analista acumula otra noche larga.',
        effect: { indicators: { resultados: 4, equipo: -4 }, setFlags: ['sobrecarga'] },
      },
      {
        id: 'c',
        label: 'Lo hace el propio comité',
        feedback: 'Resuelve el pendiente, pero el comité deja de dirigir para operar.',
        effect: { indicators: { resultados: 2, liderazgo: -3, recursos: -3 } },
      },
    ],
    facilitator: { notes: 'Liga con liderazgo situacional: nivel de competencia/compromiso del junior.' },
  },
  {
    id: 'torre-presion',
    title: 'La torre bajo presión',
    type: 'physical',
    categories: ['equipos', 'comunicacion', 'planeacion'],
    chapter: 'cierre',
    turnMode: 'all-teams',
    durationSec: 300,
    narrative:
      'Cada equipo recibe el mismo material. Deben construir la torre más alta que se sostenga sola. A la mitad del tiempo, una persona del equipo deberá seguir con los ojos vendados.',
    instructions: [
      'Material: lo que entregue el facilitador.',
      'Planeen 1 minuto antes de tocar el material.',
      'La torre debe sostenerse 10 segundos sin apoyo.',
    ],
    outcomes: {
      success: {
        label: 'Torre en pie',
        feedback: 'Planeación y comunicación bajo cambio de condiciones.',
        effect: { indicators: { equipo: 5, resultados: 4 } },
      },
      partial: {
        label: 'Se sostuvo a medias',
        feedback: 'Buena ejecución, poca adaptación al cambio.',
        effect: { indicators: { equipo: 2 } },
      },
      fail: {
        label: 'Se cayó',
        feedback: 'La prisa le ganó al plan.',
        effect: { indicators: { equipo: -2, resultados: -2 } },
      },
    },
    facilitator: { notes: 'Actividad fuera de pantalla. Usa el temporizador del proyector y avisa a la mitad.' },
  },
  {
    id: 'cambio-alcance',
    title: 'Una cosita más…',
    type: 'decision',
    categories: ['negociacion', 'decisiones', 'comunicacion'],
    chapter: 'cierre',
    narrative:
      'A las 16:30 el cliente llama: "Ya que están en eso, ¿pueden agregar un reporte adicional? Es pequeño." No está en el contrato y el equipo ya está al límite.',
    options: [
      {
        id: 'a',
        label: 'Aceptar sin condiciones',
        feedback: 'El cliente queda contento hoy; el precedente queda puesto.',
        effect: { indicators: { reputacion: 4, equipo: -5, recursos: -4 } },
      },
      {
        id: 'b',
        label: 'Aceptar a cambio de mover la fecha de ese reporte',
        feedback: 'Se negocia una concesión por otra. Requiere sostener la conversación.',
        effect: { indicators: { reputacion: 3, resultados: 2, liderazgo: 2 } },
      },
      {
        id: 'c',
        label: 'Rechazar: no está en el alcance',
        feedback: 'Se protege al equipo, aunque el cliente percibe rigidez.',
        effect: { indicators: { equipo: 3, reputacion: -4 } },
      },
    ],
    facilitator: { notes: 'Observa si piden información antes de decidir (¿qué tan urgente? ¿para qué lo necesita?).' },
  },
  {
    id: 'rendicion-cuentas',
    title: 'Rendición de cuentas',
    type: 'open',
    categories: ['liderazgo', 'comunicacion'],
    chapter: 'rendicion',
    turnMode: 'all-teams',
    durationSec: 60,
    narrative:
      'Son las 17:00. Cada comité tiene un minuto frente al consejo para responder: ¿qué decisión del día volverían a tomar y cuál cambiarían?',
    instructions: ['Un minuto por equipo.', 'Una decisión que sostienen y una que cambiarían, con el porqué.'],
    outcomes: {
      success: {
        label: 'Reflexión honesta',
        feedback: 'Asumen sus decisiones y aprenden de ellas.',
        effect: { indicators: { liderazgo: 4, reputacion: 3 } },
      },
      partial: {
        label: 'Reflexión parcial',
        feedback: 'Defendieron más de lo que reflexionaron.',
        effect: { indicators: { liderazgo: 1 } },
      },
      fail: {
        label: 'Culparon al contexto',
        feedback: 'Ninguna decisión fue propia.',
        effect: { indicators: { liderazgo: -3 } },
      },
    },
    facilitator: { notes: 'Cierre reflexivo antes del resumen final.' },
  },
]
