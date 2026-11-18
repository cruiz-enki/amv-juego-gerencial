/**
 * Rutas y recursos compatibles con cualquier "base" de Vite.
 *
 * - Vercel / desarrollo: base = "/"  → todo queda igual que antes (/admin, /favicon.svg).
 * - GitHub Pages:        base = "/amv-juego-gerencial/" → los recursos se sirven bajo
 *   ese subdirectorio y las vistas internas usan hash (#/facilitador), porque Pages
 *   no tiene "rewrites" hacia index.html.
 */

const BASE = import.meta.env.BASE_URL || '/'

/** Antepone la base a una ruta absoluta de /public ("/figuras/x.svg"). URLs externas, data: y relativas no se tocan. */
export function assetUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  if (BASE !== '/' && path.startsWith(BASE)) return path
  return BASE.replace(/\/$/, '') + path
}

export type AppView = 'admin' | 'facilitador' | 'privado'

/** Enlace a una vista interna: "/admin" con base raíz, "<base>#/admin" en un subdirectorio. */
export function viewHref(view: AppView): string {
  return BASE === '/' ? `/${view}` : `${BASE}#/${view}`
}

/** Ruta actual sin la base (p. ej. "/amv-juego-gerencial/admin" → "/admin"). */
export function pathWithoutBase(pathname: string): string {
  const base = BASE.replace(/\/$/, '')
  if (base && pathname.toLowerCase().startsWith(base.toLowerCase())) return pathname.slice(base.length) || '/'
  return pathname
}
