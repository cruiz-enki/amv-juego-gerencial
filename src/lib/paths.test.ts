import { afterEach, describe, expect, it, vi } from 'vitest'

async function load(base: string) {
  vi.resetModules()
  vi.stubEnv('BASE_URL', base)
  return import('./paths')
}

afterEach(() => vi.unstubAllEnvs())

describe('paths con base raíz (Vercel / local)', () => {
  it('no cambia nada', async () => {
    const p = await load('/')
    expect(p.assetUrl('/favicon.svg')).toBe('/favicon.svg')
    expect(p.viewHref('admin')).toBe('/admin')
    expect(p.pathWithoutBase('/facilitador')).toBe('/facilitador')
  })
})

describe('paths bajo /amv-juego-gerencial/ (GitHub Pages)', () => {
  it('antepone la base a recursos de /public', async () => {
    const p = await load('/amv-juego-gerencial/')
    expect(p.assetUrl('/figuras/mensaje-imposible.svg')).toBe('/amv-juego-gerencial/figuras/mensaje-imposible.svg')
    expect(p.assetUrl('/amv-juego-gerencial/favicon.svg')).toBe('/amv-juego-gerencial/favicon.svg')
    expect(p.assetUrl('https://x.test/a.png')).toBe('https://x.test/a.png')
    expect(p.assetUrl('data:image/svg+xml,abc')).toBe('data:image/svg+xml,abc')
  })
  it('usa hash para las vistas internas y quita la base de la ruta', async () => {
    const p = await load('/amv-juego-gerencial/')
    expect(p.viewHref('facilitador')).toBe('/amv-juego-gerencial/#/facilitador')
    expect(p.pathWithoutBase('/amv-juego-gerencial/admin')).toBe('/admin')
    expect(p.pathWithoutBase('/amv-juego-gerencial/')).toBe('/')
  })
})
