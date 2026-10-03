import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-ink hover:brightness-110 shadow-[0_0_24px_rgb(56_225_255/0.35)]',
  secondary: 'bg-panel-2 text-text border border-line-strong hover:border-accent/60',
  ghost: 'text-muted hover:text-text hover:bg-white/5',
  danger: 'bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25',
}
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-4 text-xl rounded-2xl',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-semibold transition disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
