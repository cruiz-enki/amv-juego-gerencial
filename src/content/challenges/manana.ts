import type { Challenge } from '../../engine/types'

// CONTENIDO MOCK — sólo para probar el motor. El contenido final se escribirá después.

export const morningChallenges: Challenge[] = [
  {
    id: 'bandeja-0800',
    title: 'La bandeja de las 8:00',
    type: 'tool',
    categories: ['planeacion', 'decisiones'],
    chapter: 'arranque',
    turnMode: 'all-teams',
    durationSec: 180,
    narrative:
      'Llegan al piso y hay ocho pendientes esperando: el cliente pide confirmar la fecha de entrega, Finanzas quiere el presupuesto actualizado, dos personas faltaron, un proveedor no responde, Dirección cita a junta a las 9:00, hay un reporte de calidad abierto, Recursos Humanos pide evaluaciones y alguien dejó una caja de donas.',
    instructions: [
      'Usen la matriz de Eisenhower: urgente/importante.',
      'Elijan las 3 acciones que el comité hará antes de las 9:00.',
      'Digan qué van a delegar y a quién.',
    ],
    outcomes: {
      success: {
        label: 'Matriz sólida',
        feedback: 'Priorizaron con criterio y supieron qué soltar. El día arranca con foco.',
        effect: { indicators: { resultados: 5, liderazgo: 4, recursos: 3 } },
      },
      partial: {
        label: 'Matriz incompleta',
        feedback: 'Hay foco, pero algunas urgencias aparentes se colaron como importantes.',
        effect: { indicators: { resultados: 2, liderazgo: 1 } },
      },
      fail: {
        label: 'Todo es urgente',
        feedback: 'Intentar atender todo a la vez consume la mañana.',
        effect: { indicators: { recursos: -4, equipo: -2 }, setFlags: ['sin-foco'] },
      },
    },
    facilitator: {
      notes:
        'Esperado: confirmar fecha al cliente y reporte de calidad como urgente/importante; presupuesto importante no urgente (agendar); evaluaciones RH delegables; donas = ruido.',
      debrief: ['¿Qué dejaron fuera y por qué?', '¿Qué criterio usaron para delegar?'],
    },
  },
  {
    id: 'talento-dificil',
    title: 'El talento difícil',
    type: 'decision',
    categories: ['liderazgo', 'comunicacion', 'conflictos', 'equipos', 'decisiones'],
    chapter: 'arranque',
    narrative:
      'Uno de los integrantes con mejores resultados del equipo acaba de confrontar públicamente al responsable de otra área. Tiene razón respecto al problema, pero la forma generó tensión entre ambos equipos.',
    options: [
      {
        id: 'a',
        label: 'Hablar de inmediato con la persona, en privado',
        detail: 'Reconocer el fondo, corregir la forma.',
        feedback:
          'La conversación privada protege a la persona y marca un límite claro. La otra área aún espera una señal pública de que el tema se atendió.',
        effect: { indicators: { liderazgo: 6, equipo: 3, resultados: -2 } },
      },
      {
        id: 'b',
        label: 'Dejarlo pasar: sus resultados son excelentes',
        detail: 'No distraer al equipo en un día crítico.',
        feedback:
          'El día avanza sin fricción visible. El mensaje implícito, sin embargo, es que los resultados compran excepciones.',
        effect: {
          indicators: { resultados: 4, liderazgo: -5, equipo: -4 },
          setFlags: ['tolera-conductas'],
          schedule: [{ event: 'clima-tenso', afterSteps: 2 }],
        },
      },
      {
        id: 'c',
        label: 'Reunir a ambas partes y abordar el conflicto',
        detail: 'Resolverlo de frente, hoy.',
        feedback:
          'Abrir el diálogo muestra madurez, pero sin preparar antes a cada parte, la reunión arranca a la defensiva y consume tiempo.',
        effect: { indicators: { reputacion: 4, liderazgo: 3, equipo: 1, resultados: -4 } },
      },
    ],
    facilitator: {
      notes:
        'No hay respuesta perfecta. La secuencia más sólida suele ser A y después C. B dispara una consecuencia diferida (clima tenso) dos pasos después.',
      debrief: ['¿Separaron el fondo de la forma?', '¿Qué mensaje recibe el resto del equipo?'],
    },
  },
  {
    id: 'recorte-presupuesto',
    title: 'Recorte del 20%',
    type: 'decision',
    categories: ['recursos', 'decisiones', 'planeacion'],
    chapter: 'operacion',
    narrative:
      'Finanzas avisa que, por un ajuste corporativo, el presupuesto del proyecto se reduce 20% a partir de hoy. La entrega al cliente sigue programada para las 17:00.',
    options: [
      {
        id: 'a',
        label: 'Recortar capacitación y horas extra',
        detail: 'Lo más rápido de mover.',
        feedback: 'El número cuadra hoy. El equipo absorbe la diferencia con esfuerzo extra no reconocido.',
        effect: { indicators: { recursos: 10, equipo: -7 }, setFlags: ['sobrecarga'] },
      },
      {
        id: 'b',
        label: 'Renegociar alcance con el cliente',
        detail: 'Entregar menos, pero bien.',
        feedback: 'Protege la calidad, aunque el cliente percibe que el compromiso original no era firme.',
        effect: { indicators: { recursos: 6, reputacion: -5, resultados: -2 } },
      },
      {
        id: 'c',
        label: 'Redistribuir priorizando la ruta crítica',
        detail: 'Congelar lo no esencial.',
        feedback: 'Requiere decisiones incómodas sobre qué detener; varias personas ven pausado su trabajo.',
        effect: { indicators: { recursos: 4, resultados: 3, liderazgo: 3, equipo: -2 } },
      },
    ],
    facilitator: {
      notes: 'La opción A activa la bandera "sobrecarga", que puede disparar el evento de desgaste más adelante.',
      debrief: ['¿Qué información les faltó para decidir?', '¿A quién consultaron (o no)?'],
    },
  },
  {
    id: 'junta-90',
    title: '90 segundos con Dirección',
    type: 'timed',
    categories: ['comunicacion', 'liderazgo'],
    chapter: 'operacion',
    durationSec: 90,
    narrative:
      'La directora general sale de otra reunión y les concede 90 segundos en el pasillo: quiere saber cómo va el proyecto y qué necesitan de ella.',
    instructions: [
      'Un vocero del equipo presenta de pie.',
      'Estado del proyecto, riesgo principal y una petición concreta.',
      'Cuando el tiempo termina, se corta.',
    ],
    outcomes: {
      success: {
        label: 'Claro y accionable',
        feedback: 'Mensaje estructurado y petición concreta. Dirección se va con algo que hacer.',
        effect: { indicators: { liderazgo: 6, reputacion: 4 } },
      },
      partial: {
        label: 'Se entendió a medias',
        feedback: 'El estado quedó claro, pero la petición se diluyó.',
        effect: { indicators: { liderazgo: 2 } },
      },
      fail: {
        label: 'Se acabó el tiempo',
        feedback: 'Demasiado contexto, ninguna conclusión. Dirección pierde confianza.',
        effect: { indicators: { reputacion: -5, liderazgo: -3 } },
      },
    },
    facilitator: {
      notes: 'Evaluar estructura (situación–riesgo–petición), tono y si respetaron el tiempo.',
    },
  },
]
