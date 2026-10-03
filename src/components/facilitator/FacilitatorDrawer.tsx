import { useEffect } from 'react'
import { FacilitatorPanel } from './FacilitatorPanel'

export function FacilitatorDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/50 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-[min(32rem,100vw)] flex-col border-l border-line-strong bg-deep shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Panel del facilitador"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-display text-lg font-bold">🎛️ Panel del facilitador</p>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-muted hover:bg-white/5 hover:text-text" aria-label="Cerrar panel">
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <FacilitatorPanel />
        </div>
      </aside>
    </>
  )
}
