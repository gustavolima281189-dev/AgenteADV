'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { registerGSAP } from '@/lib/gsap'
import { gsap } from 'gsap'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [ready, setReady]         = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const router  = useRouter()

  useEffect(() => {
    registerGSAP()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6)  { setError('Mínimo de 6 caracteres.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Falha ao redefinir. Tente novamente.'); setLoading(false) }
    else { await supabase.auth.signOut(); router.push('/login') }
  }

  const EyeOpen  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  const EyeOff   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'var(--bg-deep)',
        backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% -20%, oklch(0.68 0.14 230 / 0.15) 0%, transparent 70%)',
      }}
    >
      <div ref={cardRef} style={{ width: '100%', maxWidth: 400, opacity: 0 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5" style={{ background: 'var(--ink-primary)', color: '#050d1a' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Nova senha</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Defina uma nova credencial de acesso</p>
        </div>

        <div className="glass rounded-[24px] p-7">
          {!ready ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <span className="w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--ink-primary)', animation: 'spin 0.8s linear infinite' }} />
              <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Verificando link...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {(['Nova senha', 'Confirmar senha'] as const).map((lbl, idx) => {
                const isFirst = idx === 0
                const show    = isFirst ? showPass : showConf
                const toggle  = isFirst ? () => setShowPass(!showPass) : () => setShowConf(!showConf)
                const val     = isFirst ? password : confirm
                const set     = isFirst ? setPassword : setConfirm
                return (
                  <div key={lbl}>
                    <label className="eyebrow mb-2 block">{lbl}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="input-field pr-8"
                      />
                      <button type="button" onClick={toggle} className="absolute right-0 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
                        {show ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>
                )
              })}
              {error && (
                <p className="text-[12px] px-3 py-2 rounded-xl" style={{ background: 'oklch(0.68 0.14 20 / 0.12)', color: 'var(--rose)', border: '1px solid oklch(0.68 0.14 20 / 0.25)' }}>
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
                {loading ? 'Salvando...' : 'Definir nova senha'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
