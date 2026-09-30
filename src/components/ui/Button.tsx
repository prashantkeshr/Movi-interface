import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  children?: ReactNode
}

const variants: Record<string, string> = {
  primary:   'bg-[var(--accent)] text-[#080c14] font-semibold hover:bg-[var(--accent-dim)] shadow-sm',
  secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)]',
  ghost:     'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  outline:   'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
  danger:    'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30',
}

const sizes: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-[6px]',
  md: 'text-sm px-4 py-2 gap-2 rounded-[8px]',
  lg: 'text-base px-6 py-3 gap-2.5 rounded-[10px]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 font-medium
        disabled:opacity-50 disabled:pointer-events-none select-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
      {iconRight && !loading && iconRight}
    </button>
  )
}
