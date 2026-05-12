'use client'

import { useState, useEffect, useMemo, useRef, DragEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DocumentoJuridico } from '@/lib/supabase'
import { registerGSAP, revealOnScroll } from '@/lib/gsap'
import AppSidebar from '@/components/ui/Sidebar'
import KpiCard from '@/components/ui/KpiCard'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

const AREA_COLOR: Record<string, string> = {
  'Cível':          'ativo',
  'Trabalhista':    'pendente',
  'Tributário':     'pendente',
  'Criminal':       'atrasado',
  'Contratual':     'ativo',
  'Administrativo': 'concluido',
  'Outros':         'concluido',
}

export default function AppWorkspace() {
  const [result, setResult]       = useState<DocumentoJuridico | null>(null)
  const [history, setHistory]     = useState<DocumentoJuridico[]>([])
  const [loading, setLoading]     = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId]       = useState('')
  const [selected, setSelected]   = useState<DocumentoJuridico | null>(null)
  const [dragging, setDragging]   = useState(false)
  const [search, setSearch]       = useState('')
  const [filterArea, setFilterArea]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const inputRef  = useRef<HTMLInputElement>(null)
  const cardsRef  = useRef<HTMLDivElement>(null)
  const router    = useRouter()

  useEffect(() => {
    registerGSAP()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email ?? '')
        setUserId(session.user.id)
        fetchHistory(session.user.id)
      } else {
        fetchHistory('')
      }
    })
  }, [])

  useEffect(() => {
    if (cardsRef.current) {
      revealOnScroll('[data-reveal]', { stagger: 0.06, y: 24 })
    }
  }, [history])

  const fetchHistory = async (uid: string) => {
    let q = supabase
      .from('documentos_juridicos')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(50)
    if (uid) q = q.eq('user_id', uid)
    const { data } = await q
    if (data) setHistory(data as DocumentoJuridico[])
  }

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') return
    setLoading(true)
    setResult(null)
    const { data: { session } } = await supabase.auth.getSession()
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/upload`,
        {
          method: 'POST',
          body: fd,
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Erro ao processar')
      setResult(data as DocumentoJuridico)
      fetchHistory(userId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const metrics = useMemo(() => {
    const total   = history.length
    const success = history.filter(d => d.status_leitura === 'Sucesso').length
    const rate    = total > 0 ? Math.round((success / total) * 100) : 0
    const last7   = history.filter(d => {
      if (!d.criado_em) return false
      return (Date.now() - new Date(d.criado_em).getTime()) / 86400000 <= 7
    }).length
    const areas: Record<string, number> = {}
    history.forEach(d => { areas[d.categoria_area] = (areas[d.categoria_area] ?? 0) + 1 })
    const topArea = Object.entries(areas).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { total, rate, last7, topArea }
  }, [history])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return history.filter(d => {
      const matchSearch = !q
        || d.tipo.toLowerCase().includes(q)
        || d.numero_processo_ou_id?.toLowerCase().includes(q)
        || d.polo_ativo_ou_contratante.some(p => p.toLowerCase().includes(q))
        || d.polo_passivo_ou_contratado.some(p => p.toLowerCase().includes(q))
        || d.sintese.toLowerCase().includes(q)
      return matchSearch
        && (!filterArea   || d.categoria_area  === filterArea)
        && (!filterStatus || d.status_leitura  === filterStatus)
    })
  }, [history, search, filterArea, filterStatus])

  const exportCSV = () => {
    const headers = ['Tipo','Área','Polo Ativo','Polo Passivo','Processo','Status','Data']
    const rows = filtered.map(d => [
      d.tipo, d.categoria_area,
      d.polo_ativo_ou_contratante.join('; '),
      d.polo_passivo_ou_contratado.join('; '),
      d.numero_processo_ou_id ?? '',
      d.status_leitura,
      d.criado_em ? new Date(d.criado_em).toLocaleDateString('pt-BR') : '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `leitoradv_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const areas = useMemo(() => Array.from(new Set(history.map(d => d.categoria_area))).sort(), [history])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <AppSidebar userEmail={userEmail} onLogout={userEmail ? handleLogout : undefined} />

      <main className="flex-1 flex flex-col" style={{ marginLeft: 220, minHeight: '100vh' }}>
        {/* Topbar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-8 py-5"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'rgba(5,13,26,0.75)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div>
            <p className="eyebrow mb-0.5">Leitor ADV</p>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
              Analisar Peça Jurídica
            </h1>
          </div>
          {!userEmail && (
            <a href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </a>
          )}
        </header>

        <div className="flex-1 px-8 py-8 space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-reveal>
            <KpiCard
              label="Total processado"
              value={metrics.total}
              accent="blue"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <KpiCard
              label="Taxa de leitura"
              value={metrics.rate}
              unit="%"
              accent="emerald"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <KpiCard
              label="Últimos 7 dias"
              value={metrics.last7}
              accent="gold"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <KpiCard
              label="Área principal"
              value={metrics.topArea}
              accent="blue"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 10V5a2 2 0 012-2z" /></svg>}
            />
          </div>

          {/* Upload + Result */}
          <div className={`grid gap-6 ${result ? 'lg:grid-cols-2' : 'max-w-xl'}`} data-reveal>
            {/* Drop Zone */}
            <div
              className="glass rounded-[20px] p-6"
              style={{
                border: dragging
                  ? `2px dashed var(--ink-primary)`
                  : `2px dashed var(--border)`,
                transition: 'border-color 0.2s ease',
              }}
            >
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>
                Enviar Peça
              </p>
              <div
                onClick={() => !loading && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className="rounded-[16px] p-10 text-center cursor-pointer transition-all"
                style={{
                  background: dragging ? 'oklch(0.68 0.14 230 / 0.06)' : 'var(--glass-bg)',
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? 'none' : 'auto',
                }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'oklch(0.68 0.14 230 / 0.12)' }}
                    >
                      <span
                        className="w-5 h-5 border-2 border-t-transparent rounded-full"
                        style={{ borderColor: 'var(--ink-primary)', animation: 'spin 0.8s linear infinite' }}
                      />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                      Processando peça...
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                      OCR + análise via IA em andamento
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'oklch(0.68 0.14 230 / 0.1)', color: 'var(--ink-primary)' }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                        Arrastar PDF ou clicar para selecionar
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                        Apenas PDF · máx. 20 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
              />
            </div>

            {/* Result */}
            {result && (
              <div
                className="glass rounded-[20px] p-6 space-y-5"
                style={{ animation: 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) forwards' }}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                    Resultado da extração
                  </p>
                  <Badge status={result.status_leitura.toLowerCase()} />
                </div>

                <Field label="Tipo de peça" value={result.tipo} />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="eyebrow mb-1.5">Área</p>
                    <Badge status={AREA_COLOR[result.categoria_area] ?? 'ativo'} label={result.categoria_area} />
                  </div>
                  {result.data_identificada && (
                    <Field label="Data" value={new Date(result.data_identificada).toLocaleDateString('pt-BR')} />
                  )}
                  {result.numero_processo_ou_id && (
                    <Field label="Processo" value={result.numero_processo_ou_id} mono />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="eyebrow mb-2">Polo ativo</p>
                    {result.polo_ativo_ou_contratante.length > 0
                      ? result.polo_ativo_ou_contratante.map((p, i) => (
                          <p key={i} className="text-xs px-2.5 py-1.5 rounded-xl mb-1" style={{ background: 'oklch(0.68 0.14 230 / 0.08)', color: 'var(--text-1)' }}>{p}</p>
                        ))
                      : <p className="text-xs italic" style={{ color: 'var(--text-3)' }}>Não identificado</p>
                    }
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Polo passivo</p>
                    {result.polo_passivo_ou_contratado.length > 0
                      ? result.polo_passivo_ou_contratado.map((p, i) => (
                          <p key={i} className="text-xs px-2.5 py-1.5 rounded-xl mb-1" style={{ background: 'oklch(0.78 0.13 85 / 0.08)', color: 'var(--text-1)' }}>{p}</p>
                        ))
                      : <p className="text-xs italic" style={{ color: 'var(--text-3)' }}>Não identificado</p>
                    }
                  </div>
                </div>
                <div>
                  <p className="eyebrow mb-2">Síntese</p>
                  <p className="text-[13px] leading-relaxed px-3 py-2.5 rounded-xl" style={{ background: 'var(--glass-bg)', color: 'var(--text-1)', border: '1px solid var(--border)' }}>
                    {result.sintese}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Histórico */}
          <div id="historico" className="glass rounded-[20px] overflow-hidden" data-reveal ref={cardsRef}>
            {/* Controls */}
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Histórico de peças</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {filtered.length} de {history.length} registro(s)
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={exportCSV}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar CSV
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-3)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por tipo, partes, processo..."
                  className="w-full pl-8 pr-4 py-2 text-[13px] rounded-[12px] outline-none"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                    fontFamily: 'var(--font-display)',
                  }}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {([''].concat(areas)).map(area => (
                  <button
                    key={area}
                    onClick={() => setFilterArea(area)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                    style={{
                      background: filterArea === area ? 'var(--ink-primary)' : 'var(--glass-bg)',
                      color: filterArea === area ? '#050d1a' : 'var(--text-2)',
                      border: `1px solid ${filterArea === area ? 'var(--ink-primary)' : 'var(--border)'}`,
                    }}
                  >
                    {area || 'Todas as áreas'}
                  </button>
                ))}
                <button
                  onClick={() => setFilterStatus(filterStatus === 'Sucesso' ? '' : 'Sucesso')}
                  className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: filterStatus === 'Sucesso' ? 'oklch(0.68 0.14 155 / 0.2)' : 'var(--glass-bg)',
                    color: filterStatus === 'Sucesso' ? 'var(--emerald)' : 'var(--text-2)',
                    border: `1px solid ${filterStatus === 'Sucesso' ? 'oklch(0.68 0.14 155 / 0.4)' : 'var(--border)'}`,
                  }}
                >
                  Sucesso
                </button>
                <button
                  onClick={() => setFilterStatus(filterStatus === 'Falha' ? '' : 'Falha')}
                  className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: filterStatus === 'Falha' ? 'oklch(0.68 0.14 20 / 0.2)' : 'var(--glass-bg)',
                    color: filterStatus === 'Falha' ? 'var(--rose)' : 'var(--text-2)',
                    border: `1px solid ${filterStatus === 'Falha' ? 'oklch(0.68 0.14 20 / 0.4)' : 'var(--border)'}`,
                  }}
                >
                  Falha
                </button>
                {(search || filterArea || filterStatus) && (
                  <button
                    onClick={() => { setSearch(''); setFilterArea(''); setFilterStatus('') }}
                    className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                    style={{ color: 'var(--ink-primary)', border: '1px solid transparent' }}
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                title="Nenhuma peça processada"
                description="Envie um PDF para iniciar a extração automática."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Tipo / Processo','Área','Partes','Data','Status'].map(h => (
                        <th key={h} className="text-left px-6 py-3" style={{ color: 'var(--text-3)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(doc => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelected(doc)}
                        className="cursor-pointer transition-all"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium truncate max-w-[200px]" style={{ color: 'var(--text-1)' }}>{doc.tipo}</p>
                          {doc.numero_processo_ou_id && (
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{doc.numero_processo_ou_id}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={AREA_COLOR[doc.categoria_area] ?? 'ativo'} label={doc.categoria_area} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="truncate max-w-[180px]" style={{ color: 'var(--text-2)' }}>
                            {[...doc.polo_ativo_ou_contratante, ...doc.polo_passivo_ou_contratado].join(', ') || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--text-3)' }}>
                          {doc.criado_em ? new Date(doc.criado_em).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={doc.status_leitura.toLowerCase()} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Document Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes da Peça">
        {selected && (
          <div className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              <Badge status={selected.status_leitura.toLowerCase()} />
              <Badge status={AREA_COLOR[selected.categoria_area] ?? 'ativo'} label={selected.categoria_area} />
            </div>
            <Field label="Tipo" value={selected.tipo} />
            {selected.numero_processo_ou_id && <Field label="Processo" value={selected.numero_processo_ou_id} mono />}
            {selected.data_identificada && <Field label="Data identificada" value={new Date(selected.data_identificada).toLocaleDateString('pt-BR')} />}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="eyebrow mb-2">Polo ativo</p>
                {selected.polo_ativo_ou_contratante.map((p, i) => (
                  <p key={i} className="text-xs px-2.5 py-1.5 rounded-xl mb-1" style={{ background: 'oklch(0.68 0.14 230 / 0.08)', color: 'var(--text-1)' }}>{p}</p>
                ))}
              </div>
              <div>
                <p className="eyebrow mb-2">Polo passivo</p>
                {selected.polo_passivo_ou_contratado.map((p, i) => (
                  <p key={i} className="text-xs px-2.5 py-1.5 rounded-xl mb-1" style={{ background: 'oklch(0.78 0.13 85 / 0.08)', color: 'var(--text-1)' }}>{p}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-2">Síntese</p>
              <p className="text-[13px] leading-relaxed px-3 py-2.5 rounded-xl" style={{ background: 'var(--glass-bg)', color: 'var(--text-1)', border: '1px solid var(--border)' }}>
                {selected.sintese}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-1)' }}>{value}</p>
    </div>
  )
}
