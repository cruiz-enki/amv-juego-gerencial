import { useRef } from 'react'
import { downloadBackup, parseBackup } from '../../state/persistence'
import { useGame } from '../../state/useGame'
import { Button } from '../ui/Button'
import { Section } from './Section'
import { viewHref } from '../../lib/paths'

export function GameAdmin() {
  const { state, content, dispatch, reset, load, saveFailed } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const parsed = parseBackup(await file.text())
    if (parsed) load(parsed.state, parsed.content)
    else window.alert('El archivo no es un respaldo válido de partida.')
  }

  return (
    <Section title="Partida">
      {saveFailed && (
        <p className="mb-2 rounded-lg bg-danger/15 p-2 text-sm text-danger">
          ⚠ El navegador no permite guardar. Usa “Descargar respaldo” con frecuencia.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => window.open(viewHref('facilitador'), 'punto-critico-facilitador', 'width=560,height=900')}>
          🪟 Abrir en otra ventana
        </Button>
        <Button size="sm" onClick={() => downloadBackup({ state, past: [], content })}>💾 Descargar respaldo</Button>
        <Button size="sm" onClick={() => fileRef.current?.click()}>📂 Cargar respaldo</Button>
        <Button
          size="sm"
          onClick={() => window.confirm('¿Terminar la partida y mostrar resultados finales?') && dispatch({ type: 'FINISH' })}
          disabled={state.status === 'finished'}
        >
          🏁 Terminar
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="col-span-2"
          onClick={() => window.confirm('¿Borrar la partida actual y volver al inicio? No se puede deshacer.') && reset()}
        >
          Reiniciar todo
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => void onImport(e.target.files?.[0])} />
    </Section>
  )
}
