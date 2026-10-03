import type { FlagDef } from '../engine/types'

/**
 * Banderas que pueden marcar a un equipo. El id es el que usan retos y eventos;
 * `label` es lo que se lee en el panel y (si `showInDossier`) en el expediente final.
 */
export const flags: FlagDef[] = [
  { id: 'persona_ignorada', label: 'Ignoraron al colaborador que pidió hablar', showInDossier: true },
  { id: 'cliente_ignorado', label: 'Ignoraron al cliente de la mañana', showInDossier: true },
  { id: 'riesgo_proveedor', label: 'Ignoraron el aviso del proveedor', showInDossier: true },
  { id: 'talento_sin_limites', label: 'No intervinieron con Mariana', showInDossier: true },
  { id: 'feedback_mariana', label: 'Dieron retroalimentación privada a Mariana', showInDossier: true },
  { id: 'mediacion_directa', label: 'Mediaron el conflicto de Mariana de inmediato', showInDossier: true },
  { id: 'sin_capacitacion', label: 'Eliminaron capacitación', showInDossier: true },
  { id: 'sin_campana', label: 'Eliminaron la campaña comercial', showInDossier: true },
  { id: 'sin_mantenimiento', label: 'Eliminaron mantenimiento preventivo', showInDossier: true },
  { id: 'sin_apoyo', label: 'Eliminaron el apoyo temporal', showInDossier: true },
  { id: 'sin_tecnologia', label: 'Eliminaron la actualización tecnológica', showInDossier: true },
  { id: 'promesa_sin_informacion', label: 'Prometieron algo sin tener la información', showInDossier: true },
  { id: 'lanzamiento_anticipado', label: 'Lanzaron antes de tener certeza', showInDossier: true },
  { id: 'oportunidad_perdida', label: 'Sacrificaron la oportunidad por estabilidad', showInDossier: true },
  { id: 'piloto_controlado', label: 'Probaron con un piloto controlado', showInDossier: true },
  { id: 'problema_proveedor', label: 'Enfrentaron un problema con el proveedor' },
]
