import type { Challenge, GameContent } from '../../engine/types'
import { useAdmin } from '../AdminContext'

/** Edita un reto del borrador: `up` recibe una copia mutable del reto. */
export function useChallenge(id: string) {
  const { draft, edit } = useAdmin()
  const challenge = draft.challenges.find((c) => c.id === id)
  const up = (fn: (c: Challenge, d: GameContent) => void) =>
    edit((d) => {
      const c = d.challenges.find((x) => x.id === id)
      if (c) fn(c, d)
    })
  return { challenge, up }
}

