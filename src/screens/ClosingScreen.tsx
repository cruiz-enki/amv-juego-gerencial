import { Button } from '../components/ui/Button'
import { useGame } from '../state/useGame'

/** "Misión completada": las líneas aparecen una tras otra. */
export function ClosingScreen() {
  const { content, dispatch } = useGame()
  const { closing } = content.config
  return (
    <main className="grid min-h-[calc(100vh-4.5rem)] place-items-center px-6 py-10">
      <div className="max-w-4xl text-center">
        <h1 className="animate-pop font-display text-7xl font-bold tracking-tight text-accent uppercase">{closing.title}</h1>
        <ul className="mt-10 grid gap-3">
          {closing.lines.map((line, i) => (
            <li
              key={i}
              className={`animate-rise text-3xl ${i >= closing.lines.length - 2 ? 'mt-4 font-display font-semibold text-text' : 'text-text/85'}`}
              style={{ animationDelay: `${600 + i * 650}ms` }}
            >
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-12 flex justify-center gap-3 animate-rise" style={{ animationDelay: `${800 + closing.lines.length * 650}ms` }}>
          <Button variant="ghost" onClick={() => dispatch({ type: 'GO', screen: 'final' })}>
            ← Resultados
          </Button>
          <Button size="lg" variant="primary" onClick={() => dispatch({ type: 'GO', screen: 'credits' })}>
            Continuar ▶
          </Button>
        </div>
      </div>
    </main>
  )
}
