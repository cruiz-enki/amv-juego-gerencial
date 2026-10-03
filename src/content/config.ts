import type { GameConfig } from '../engine/types'

/** Configuración de la partida: nombre, rango de equipos y orden de retos. */
export const gameConfig: GameConfig = {
  title: 'Punto Crítico',
  subtitle: 'Un día al mando · Diplomado en Habilidades Gerenciales AMV',
  premise:
    'Su comité directivo tiene un solo día para entregar el Proyecto Horizonte al cliente más importante del año. Cada decisión cuenta. Cada atajo deja huella.',
  teams: { min: 2, max: 6, default: 4 },
  defaultTurnMode: 'active-team',
  targetMinutes: 90,
  // Orden de los retos principales. `turnMode` aquí sobrescribe el del reto.
  agenda: [
    { challenge: 'bandeja-0800' },
    { challenge: 'talento-dificil' },
    { challenge: 'recorte-presupuesto' },
    { challenge: 'junta-90' },
    { challenge: 'equipo-fracturado' },
    { challenge: 'caida-plataforma' },
    { challenge: 'proveedor-clave' },
    { challenge: 'delegar-o-cargar' },
    { challenge: 'torre-presion' },
    { challenge: 'cambio-alcance' },
    { challenge: 'rendicion-cuentas' },
  ],
}
