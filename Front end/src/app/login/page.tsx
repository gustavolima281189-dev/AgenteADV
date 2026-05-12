'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { registerGSAP } from '@/lib/gsap'
import { gsap } from 'gsap'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [mode, setMode]             = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent]   = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const router  = useRouter()

  useEffect(() => {
    registerGSAP()
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }
      )
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Credenciais inválidas. Verifique e-mail e senha.'); setLoading(false) }
    else router.push('/app')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setResetSent(true)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'var(--bg-deep)',
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 50% -20%, oklch(0.68 0.14 230 / 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 80% 120%, oklch(0.78 0.13 85 / 0.08) 0%, transparent 60%)
        `,
      }}
    >
      <div ref={cardRef} style={{ width: '100%', maxWidth: 400, opacity: 0 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5"
            style={{ background: 'var(--ink-primary)', color: '#050d1a' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Leitor ADV</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
            {mode === 'login' ? 'Acesso ao sistema' : 'Redefinir senha'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-[24px] p-7">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="eyebrow mb-2 block">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operador@escritorio.com.br"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="eyebrow">Senha</label>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError('') }}
                    className="text-[11px] transition-colors"
                    style={{ color: 'var(--ink-primary)' }}
                  >
                    Recuperar acesso
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-3)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                  >
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-[12px] px-3 py-2 rounded-xl" style={{ background: 'oklch(0.68 0.14 20 / 0.12)', color: 'var(--rose)', border: '1px solid oklch(0.68 0.14 20 / 0.25)' }}>
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" size="md" loading={loading} className="w-full mt-2">
                {loading ? 'Autenticando...' : 'Acessar sistema'}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              {resetSent ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Instruções enviadas</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>
                    Verifique a caixa de entrada do e-mail informado.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-5">
                  <div>
                    <label className="eyebrow mb-2 block">E-mail cadastrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="operador@escritorio.com.br"
                      required
                      className="input-field"
                    />
                  </div>
                  {error && (
                    <p className="text-[12px] px-3 py-2 rounded-xl" style={{ background: 'oklch(0.68 0.14 20 / 0.12)', color: 'var(--rose)', border: '1px solid oklch(0.68 0.14 20 / 0.25)' }}>
                      {error}
                    </p>
                  )}
                  <Button type="submit" variant="ghost" size="md" loading={loading} className="w-full">
                    {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                  </Button>
                </form>
              )}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setResetSent(false) }}
                className="w-full text-center text-[12px] transition-colors"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                Voltar ao acesso
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] mt-5" style={{ color: 'var(--text-3)' }}>
          <Link href="/" style={{ color: 'var(--text-3)' }}>Leitor ADV</Link> · Sistema de triagem jurídica
        </p>
      </div>
    </div>
  )
}
