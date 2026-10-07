import type { GameConfig } from '../engine/types'

/** Configuración de la partida — fuente: documento "Punto Crítico" (contenido v1). */
export const gameConfig: GameConfig = {
  title: 'Punto Crítico',
  subtitle: 'Diplomado de Habilidades Gerenciales · Generación AMV',
  premise: 'Una jornada gerencial bajo presión, de las 08:00 a las 17:00. Cada decisión deja huella.',
  teams: { min: 2, max: 6, default: 4 },
  defaultTurnMode: 'active-team',
  targetMinutes: 90,
  // El público ve hacia dónde se movió cada indicador (flechas), no los números.
  // Opciones: 'hidden' | 'qualitative' | 'numeric'. El facilitador puede cambiarlo en vivo.
  publicEffects: 'qualitative',
  agenda: [
    { challenge: 'reunion-que-no-puede-esperar' },
    { challenge: 'mensaje-imposible' },
    { challenge: 'talento-dificil' },
    { challenge: 'no-eres-tu-pero-te-pega' },
    { challenge: 'cinco-pendientes' },
    { challenge: 'el-recorte' },
    { challenge: 'nadie-tiene-todo' },
    { challenge: 'ventas-vs-operaciones' },
    { challenge: 'tres-proveedores' },
    { challenge: 'el-rumor' },
    { challenge: 'la-persona-dificil' },
    { challenge: 'punto-critico' },
    { challenge: 'quiere-pero-no-puede' },
    { challenge: 'cliente-quiere-todo' },
    { challenge: 'mapa-del-terreno' },
    { challenge: 'decidir-sin-certeza' },
    { challenge: 'el-consejo' },
  ],
  closing: {
    title: 'Misión completada',
    lines: [
      'Hoy resolvieron conflictos.',
      'Negociaron.',
      'Priorizaron.',
      'Tomaron decisiones sin tener toda la información.',
      'Dirigieron personas.',
      'Administraron recursos.',
      'Y enfrentaron consecuencias.',
      'Durante el diplomado lo llamamos: Habilidades Gerenciales.',
      'A partir de mañana vuelve a llamarse: trabajo.',
    ],
    finale: {
      title: 'Punto Crítico',
      lines: ['Diplomado de Habilidades Gerenciales', 'Generación AMV'],
      signoff: 'Felicidades.',
    },
  },
}
