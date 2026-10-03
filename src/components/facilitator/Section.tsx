import type { ReactNode } from 'react'

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}
