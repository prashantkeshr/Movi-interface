import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'muted' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

const variants: Record<string, string> = {
  default:  'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]',
  accent:   'bg-[var(--accent)] text-[#0a0a14] font-semibold',
  success:  'bg-[var(--green)] bg-opacity-15 text-[var(--green)]',
  warning:  'bg-amber-500/15 text-amber-400',
  error:    'bg-red-500/15 text-red-400',
  muted:    'bg-[var(--bg-card)] text-[var(--text-muted)]',
  outline:  'border border-[var(--border)] text-[var(--text-secondary)]',
}

const sizes: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] font-medium
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
