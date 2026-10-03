import { useEffect, useState } from 'react'

/** Fecha actual que se refresca cada `intervalMs` mientras `active` sea true. */
export function useNow(active: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [active, intervalMs])
  // En pausa el valor queda congelado: quien lo use no depende de él.
  return now
}
