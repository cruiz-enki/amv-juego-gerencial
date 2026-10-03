import type { HTMLAttributes } from 'react'

export function Panel({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-panel/80 shadow-[0_10px_40px_rgb(0_0_0/0.35)] backdrop-blur ${className}`}
      {...props}
    />
  )
}

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs font-semibold tracking-[0.2em] text-muted uppercase ${className}`}>{children}</p>
}

export function Chip({ children, color, className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${className}`}
      style={{ borderColor: color ? `color-mix(in oklab, ${color} 45%, transparent)` : undefined, color }}
    >
      {children}
    </span>
  )
}
