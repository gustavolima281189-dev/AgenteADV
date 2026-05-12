'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem { href: string; label: string; icon: React.ReactNode }

const NAV: NavItem[] = [
  {
    href: '/app',
    label: 'Analisar Peça',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/app#historico',
    label: 'Histórico',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

interface Props { userEmail?: string; onLogout?: () => void }

export default function AppSidebar({ userEmail = '', onLogout }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col z-20"
      style={{
        width: 220,
        background: 'rgba(5,13,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--ink-primary)', color: '#050d1a' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-700 leading-none" style={{ color: 'var(--text-1)', fontWeight: 700 }}>Leitor ADV</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Sistema Jurídico</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="eyebrow px-3 mb-3">Ferramentas</p>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href.split('#')[0] + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[13px] font-medium transition-all duration-200"
              style={{
                background: active ? 'var(--glass-bg)' : 'transparent',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              <span style={{ color: active ? 'var(--ink-primary)' : 'inherit' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-6 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {userEmail && (
          <div className="px-3 py-2 mb-1 rounded-[14px]" style={{ background: 'var(--glass-bg)' }}>
            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-2)' }}>{userEmail}</p>
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-[13px] transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-1)'
              e.currentTarget.style.background = 'var(--glass-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Encerrar sessão
          </button>
        )}
      </div>
    </aside>
  )
}
