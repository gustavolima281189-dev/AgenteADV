'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { registerGSAP, revealOnScroll, navShrink } from '@/lib/gsap'
import { gsap } from 'gsap'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'

const FEATURES = [
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: 'Leitura estruturada',
    description: 'OCR de alta fidelidade extrai o texto bruto da peça — inclusive PDFs escaneados — preservando a hierarquia do documento.',
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: 'Extração automática',
    description: 'A IA identifica tipo, área, partes, pedidos e síntese. Sem templates fixos: cada peça é analisada em contexto.',
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Histórico permanente',
    description: 'Cada peça analisada fica indexada. Busca por partes, número do processo ou tipo de documento em milissegundos.',
  },
]

const STEPS = [
  { n: '01', label: 'Enviar a peça', desc: 'Arraste o PDF ou selecione o arquivo. Até 20 MB.' },
  { n: '02', label: 'Processar',     desc: 'OCR converte o documento. A IA extrai a estrutura jurídica.' },
  { n: '03', label: 'Extrair',       desc: 'Tipo, partes, área, síntese e processo identificados e disponíveis.' },
]

const FAQS = [
  { q: 'Que tipos de PDF são suportados?', a: 'PDFs nativos e escaneados. O OCR suporta documentos em português com qualidade de impressão padrão judicial.' },
  { q: 'Os dados ficam armazenados?', a: 'Sim. Cada peça processada é salva com vínculo à conta do operador. Não há compartilhamento entre contas.' },
  { q: 'A análise substitui a leitura do advogado?', a: 'Não. O sistema realiza triagem e extração de dados estruturados. A interpretação jurídica permanece com o operador.' },
  { q: 'Há limite de uso?', a: 'O plano base inclui 50 peças/mês. O plano Escritório é ilimitado dentro dos recursos contratados.' },
]

export default function LandingPage() {
  const navRef  = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGSAP()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Nav shrink on scroll
    if (navRef.current) navShrink(navRef.current)

    // Hero text reveal
    if (!reduced && heroRef.current) {
      const words = heroRef.current.querySelectorAll('.hero-word')
      gsap.set(words, { opacity: 0, y: 28 })
      gsap.to(words, {
        opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, delay: 0.2,
      })
      const sub = heroRef.current.querySelector('.hero-sub')
      if (sub) gsap.fromTo(sub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.6 })
      const cta = heroRef.current.querySelector('.hero-cta')
      if (cta) gsap.fromTo(cta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', delay: 0.85 })
    }

    // Scroll reveals
    revealOnScroll('[data-reveal]', { stagger: 0.08 })
  }, [])

  const heroWords = 'A tese emerge. O direito prevalece.'.split(' ')

  return (
    <div style={{ background: 'var(--bg-deep)' }}>
      {/* Navbar */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
        style={{
          paddingTop: 24,
          paddingBottom: 24,
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(5,13,26,0.7)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--ink-primary)', color: '#050d1a' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Leitor ADV</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link href="/app"><Button variant="primary" size="sm">Usar agora</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center px-6 grid-texture"
        style={{ minHeight: '100vh', paddingTop: 140, paddingBottom: 100 }}
      >
        <p className="eyebrow mb-6">Sistema de triagem jurídica</p>
        <h1
          className="max-w-3xl mx-auto"
          style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          {heroWords.map((w, i) => (
            <span key={i} className="hero-word inline-block mr-[0.25em]"
              style={{ color: i >= 2 ? 'var(--ink-gold)' : 'var(--text-1)' }}>
              {w}
            </span>
          ))}
        </h1>
        <p
          className="hero-sub max-w-lg mx-auto mt-6 leading-relaxed"
          style={{ fontSize: 16, color: 'var(--text-2)' }}
        >
          Envie a peça. Em segundos: tipo, partes, área, síntese e número de processo
          identificados e indexados. Sem ajuste manual.
        </p>
        <div className="hero-cta flex items-center gap-3 mt-10">
          <Link href="/app"><Button variant="primary" size="lg">Analisar peça</Button></Link>
          <Link href="#como-funciona"><Button variant="ghost" size="lg">Como funciona</Button></Link>
        </div>

        {/* Gradient glow */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: 200,
            background: 'linear-gradient(to top, var(--bg-deep), transparent)',
          }}
        />
      </section>

      {/* Features */}
      <section className="px-8 pb-28" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="text-center mb-16" data-reveal>
          <p className="eyebrow mb-3">Funcionalidades</p>
          <h2 style={{ fontSize: 36 }}>Precisão na extração.<br />Ordem na análise.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <GlassCard key={i} className="p-6 space-y-4" hover data-reveal>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'oklch(0.68 0.14 230 / 0.1)', color: 'var(--ink-primary)' }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-1)' }}>{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="px-8 py-28 grid-texture"
        style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="text-center mb-16" data-reveal>
            <p className="eyebrow mb-3">Processo</p>
            <h2 style={{ fontSize: 36 }}>Três etapas. Resultado imediato.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col gap-3" data-reveal>
                <span className="font-mono text-sm" style={{ color: 'var(--ink-gold)' }}>{s.n}</span>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>{s.label}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-28" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="text-center mb-16" data-reveal>
          <p className="eyebrow mb-3">Planos</p>
          <h2 style={{ fontSize: 36 }}>Simples. Sem surpresas.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Base */}
          <GlassCard className="p-7 space-y-5" data-reveal>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-3)' }}>BASE</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                Gratuito
              </p>
              <p className="text-[13px] mt-2" style={{ color: 'var(--text-2)' }}>50 peças por mês</p>
            </div>
            <ul className="space-y-2.5">
              {['OCR + extração automática','Histórico de 30 dias','1 operador'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-2)' }}>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--emerald)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/app"><Button variant="ghost" size="md" className="w-full">Começar</Button></Link>
          </GlassCard>

          {/* Escritório */}
          <GlassCard
            className="p-7 space-y-5"
            style={{ border: '1px solid oklch(0.78 0.13 85 / 0.35)' }}
            data-reveal
          >
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-gold)' }}>ESCRITÓRIO</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                R$ 197<span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>/mês</span>
              </p>
              <p className="text-[13px] mt-2" style={{ color: 'var(--text-2)' }}>Peças ilimitadas</p>
            </div>
            <ul className="space-y-2.5">
              {['Tudo do plano Base','Peças ilimitadas','Histórico permanente','Múltiplos operadores','Exportação CSV','Suporte prioritário'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-2)' }}>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--ink-gold)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/app"><Button variant="primary" size="md" className="w-full">Contratar</Button></Link>
          </GlassCard>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="px-8 py-28 grid-texture"
        style={{ borderTop: '1px solid var(--border)', maxWidth: '100%' }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="text-center mb-12" data-reveal>
            <p className="eyebrow mb-3">Perguntas</p>
            <h2 style={{ fontSize: 36 }}>Respostas diretas.</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <GlassCard key={i} className="p-5 space-y-2" data-reveal>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{faq.q}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-28 text-center">
        <div data-reveal>
          <p className="eyebrow mb-4">Pronto para usar</p>
          <h2 className="mb-4" style={{ fontSize: 40 }}>Comece agora.</h2>
          <p className="mb-8 mx-auto" style={{ maxWidth: 400, color: 'var(--text-2)', fontSize: 15 }}>
            Nenhuma configuração. Nenhuma curva de aprendizado. Envie a primeira peça e veja o resultado.
          </p>
          <Link href="/app"><Button variant="primary" size="lg">Analisar primeira peça</Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-8 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
          Leitor ADV — Agencia Borges
        </p>
        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
          Sistema de triagem jurídica automatizada
        </p>
      </footer>
    </div>
  )
}
