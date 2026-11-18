# Publicación en GitHub Pages (GH-001)

Punto Crítico es un sitio **100 % estático** (Vite + React, estado en `localStorage`, sin backend,
sin variables de entorno, sin secretos). Se publica en dos lugares a la vez:

| Destino | Base | Cómo se publica | Rutas |
|---|---|---|---|
| Vercel (actual) | `/` | Push a `main` (integración Git de Vercel) | `/`, `/facilitador`, `/privado`, `/admin` (rewrite de `vercel.json`) |
| GitHub Pages | `/amv-juego-gerencial/` | Workflow `.github/workflows/deploy-pages.yml` en cada push a `main` (o manual) | `/amv-juego-gerencial/`, `…/#/facilitador`, `…/#/privado`, `…/#/admin` |

URL esperada: `https://cruiz-enki.github.io/amv-juego-gerencial/`

## Cómo funciona la compatibilidad

- `vite.config.ts` toma la base de `PAGES_BASE` (por defecto `/`). Sólo el workflow la define,
  así que **Vercel y el desarrollo local compilan exactamente igual que antes**.
- `src/lib/paths.ts`:
  - `assetUrl('/figuras/x.svg')` antepone la base a los recursos de `public/`.
  - `viewHref('facilitador')` da `/facilitador` con base raíz y `<base>#/facilitador` en subdirectorio
    (Pages no tiene rewrites; el hash nunca pide otra página al servidor).
  - `pathWithoutBase()` permite que `App.tsx` reconozca la vista aunque la URL lleve la base.
- El workflow copia `index.html` a `404.html`: si alguien abre una ruta profunda sin hash
  (p. ej. `/amv-juego-gerencial/facilitador`), Pages sirve la app igual (con código HTTP 404).
- `.nojekyll` evita que Pages procese el sitio con Jekyll.

## Al agregar contenido

- Imágenes nuevas: ponlas en `public/figuras/` y refiérelas como `/figuras/archivo.svg`
  (el componente que las pinta debe pasar por `assetUrl`).
- Enlaces a vistas internas: usa `viewHref(...)`, nunca `"/admin"` escrito a mano.

## Configuración única en GitHub (manual)

1. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Si el repo es privado, Pages requiere plan **GitHub Pro / Team / Enterprise**; el sitio
   publicado es **público** aunque el repo sea privado.
3. Hacer merge del PR (o lanzar el workflow con *Run workflow*).

## Verificación después de publicar

- `curl -I https://cruiz-enki.github.io/amv-juego-gerencial/` → 200.
- Abrir la URL, iniciar partida, abrir `#/facilitador`, `#/privado` (reto 02 muestra la figura) y `#/admin`.
- Consola sin errores; fuentes Inter / Space Grotesk cargadas.

## Reversión

- Rápida: Settings → Pages → *Unpublish site* (o desactivar el workflow en Actions). Vercel no se ve afectado.
- Completa: revertir el commit de merge del PR. Con base `/` el código vuelve al comportamiento idéntico al anterior.

## Nota sobre datos

`localStorage` es por origen: partidas, borradores y snapshots del admin hechos en Vercel **no**
aparecen en Pages (y viceversa). Para llevar una configuración usa Exportar/Importar JSON en `/admin`.
`cruiz-enki.github.io` es un origen compartido con cualquier otro sitio de Pages de esa cuenta;
las claves llevan prefijo `punto-critico:` y no contienen secretos.
