'use client'

import { useEffect, useRef } from 'react'
import GlassCard from './GlassCard'
import { countUp, registerGSAP } from '@/lib/gsap'

interface Props {
  label: string
  value: number | string
  unit?: string
  icon: React.ReactNode
  accent?: 'blue' | 'gold' | 'emerald' | 'rose'
}

const ACCENT = {
  blue:    'var(--ink-primary)',
  gold:    'var(--ink-gold)',
  emerald: 'var(--emerald)',
  rose:    'var(--rose)',
}

export default function KpiCard({ label, value, unit = '', icon, accent = 'blue' }: Props) {
  const numRef = useRef<HTMLSpanElement>(null)
  const color = ACCENT[accent]
  const isNumeric = typeof value === 'number'

  useEffect(() => {
    registerGSAP()
    if (isNumeric && numRef.current) countUp(numRef.current, value as number)
    else if (numRef.current) numRef.current.textContent = String(value)
  }, [value, isNumeric])

  return (
    <GlassCard className="p-5 flex flex-col gap-4" hover>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.06em] mb-1" style={{ color: 'var(--text-3)' }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          <span ref={numRef}>{isNumeric ? '0' : value}</span>
          {unit && <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-2)' }}>{unit}</span>}
        </p>
      </div>
    </GlassCard>
  )
}
