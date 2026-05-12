'use client'

import { useEffect } from 'react'
import GlassCard from './GlassCard'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5,13,26,0.7)', backdropFilter: 'blur(24px)' }}
      />
      <GlassCard
        large
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto"
        style={{ animation: 'fade-up 0.25s cubic-bezier(0.22,1,0.36,1) forwards' }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
            style={{
              borderBottom: '1px solid var(--border)',
              background: 'rgba(5,13,26,0.8)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{title}</p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-hi)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </GlassCard>
    </div>
  )
}
