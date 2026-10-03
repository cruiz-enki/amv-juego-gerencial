import { currentChallenge } from '../engine/selectors'
import { useGame } from '../state/useGame'

/**
 * Vista privada (#/privado): muestra la información secreta del reto actual
 * (figura, tarjetas) en un dispositivo que NO es el proyector.
 */
export function PrivateView() {
  const { state, content } = useGame()
  const challenge = currentChallenge(state, content)
  const secret = challenge?.secret
  if (!secret) {
    return <p className="p-8 text-xl text-muted">El reto actual no tiene información privada.</p>
  }
  return (
    <main className="mx-auto max-w-5xl p-6">
      <p className="text-sm font-semibold tracking-[0.2em] text-accent-2 uppercase">🔒 Sólo para quien debe verlo · {challenge.title}</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{secret.title}</h1>
      {secret.image && <img src={secret.image} alt="Figura secreta" className="mx-auto mt-6 max-h-[70vh] rounded-2xl bg-white p-6" />}
      {secret.body && <p className="mt-4 text-lg text-muted">{secret.body}</p>}
      {secret.rules && (
        <ul className="mt-4 grid gap-1 text-xl">
          {secret.rules.map((r) => (
            <li key={r}>⛔ {r}</li>
          ))}
        </ul>
      )}
      {secret.cards && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {secret.cards.map((c, i) => (
            <section key={i} className="rounded-2xl border border-line-strong bg-panel p-5">
              <h2 className="font-display text-2xl font-bold">{state.teams[i]?.name ?? c.title}</h2>
              {c.lines.map((l) => (
                <p key={l} className="mt-2 text-lg">{l}</p>
              ))}
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
