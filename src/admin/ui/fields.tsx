import type { ReactNode } from 'react'

const input =
  'w-full rounded-lg border border-line-strong bg-deep px-2.5 py-1.5 text-sm text-text outline-none placeholder:text-faint focus:border-accent'

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1 text-sm ${className}`}>
      <span className="font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  )
}

export function TextInput({ value, onChange, placeholder, mono = false }: { value: string | undefined; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return <input className={`${input} ${mono ? 'font-mono' : ''}`} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function TextArea({ value, onChange, rows = 3, placeholder }: { value: string | undefined; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea className={`${input} leading-relaxed`} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

/** Número; vacío = undefined. */
export function NumberInput({ value, onChange, step = 1, placeholder, className = '' }: { value: number | undefined; onChange: (v: number | undefined) => void; step?: number; placeholder?: string; className?: string }) {
  return (
    <input
      type="number"
      className={`${input} tabular-nums ${className}`}
      value={value ?? ''}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
    />
  )
}

export function Select<T extends string>({ value, onChange, options }: { value: T | undefined; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value as T)}>
      {value === undefined && <option value="">—</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), onChange(!checked))}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-success' : 'bg-white/15'}`}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition ${checked ? 'left-[1.1rem]' : 'left-0.5'}`} />
      </span>
      {label}
    </label>
  )
}

/** Lista de textos: una línea por elemento. */
export function LinesInput({ value, onChange, rows = 3, placeholder }: { value: string[] | undefined; onChange: (v: string[] | undefined) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      className={`${input} leading-relaxed`}
      rows={rows}
      placeholder={placeholder ?? 'Una línea por elemento'}
      value={(value ?? []).join('\n')}
      onChange={(e) => {
        const lines = e.target.value.split('\n')
        onChange(lines.length === 1 && lines[0] === '' ? undefined : lines)
      }}
    />
  )
}

export function ChipSelect({ value, options, onChange, placeholder = 'Agregar…' }: { value: string[]; options: { value: string; label: string }[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const rest = options.filter((o) => !value.includes(o.value))
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value.filter((x) => x !== v))}
          className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs text-text hover:border-danger hover:text-danger"
          title="Quitar"
        >
          {options.find((o) => o.value === v)?.label ?? v} ✕
        </button>
      ))}
      {rest.length > 0 && (
        <select className="rounded-lg border border-line bg-deep px-2 py-1 text-xs text-muted" value="" onChange={(e) => e.target.value && onChange([...value, e.target.value])}>
          <option value="">{placeholder}</option>
          {rest.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export function Card({ title, actions, children, className = '' }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-panel/70 p-4 ${className}`}>
      {(title || actions) && (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="font-display text-base font-bold">{title}</h3>}
          {actions && <div className="flex flex-wrap gap-1.5">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export function SmallButton({ children, onClick, variant = 'default', title, disabled }: { children: ReactNode; onClick: () => void; variant?: 'default' | 'primary' | 'danger' | 'ghost'; title?: string; disabled?: boolean }) {
  const styles = {
    default: 'border border-line-strong bg-panel-2 hover:border-accent/60',
    primary: 'bg-accent text-ink font-semibold hover:brightness-110',
    danger: 'border border-danger/40 text-danger hover:bg-danger/10',
    ghost: 'text-muted hover:text-text hover:bg-white/5',
  }[variant]
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`rounded-lg px-2.5 py-1 text-sm transition disabled:opacity-40 ${styles}`}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }) {
  const styles = {
    neutral: 'border-line text-muted',
    accent: 'border-accent/50 text-accent',
    success: 'border-success/50 text-success',
    warning: 'border-accent-2/60 text-accent-2',
    danger: 'border-danger/50 text-danger',
  }[tone]
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${styles}`}>{children}</span>
}
