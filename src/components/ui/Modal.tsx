import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title?: string
}

const sizes: Record<string, string> = {
  sm:   'max-w-md',
  md:   'max-w-2xl',
  lg:   'max-w-4xl',
  xl:   'max-w-6xl',
  full: 'max-w-[95vw]',
}

export function Modal({ isOpen, onClose, children, size = 'md', title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full ${sizes[size]} bg-[var(--bg-modal)]
          border border-[var(--border)] rounded-[var(--radius-xl)]
          shadow-[var(--shadow-xl)] overflow-hidden`}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-[var(--radius)] text-[var(--text-muted)]
                hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full
              bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
