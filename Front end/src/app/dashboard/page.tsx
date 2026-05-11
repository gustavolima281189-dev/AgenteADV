'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DocumentoJuridico } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import UploadZone from '@/components/UploadZone'
import ResultCard from '@/components/ResultCard'
import HistoryTable from '@/components/HistoryTable'
import DocumentModal from '@/components/DocumentModal'

interface MetricCardProps {
  label: string
  value: string | number
  icon: 'docs' | 'check' | 'calendar' | 'tag'
  small?: boolean
}

function MetricCard({ label, value, icon, small }: MetricCardProps) {
  const icons = {
    docs: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    check: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    calendar: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    tag: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 10V5a2 2 0 012-2z" />
      </svg>
    ),
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icons[icon]}
        </div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
      <p className={`font-bold text-gray-900 ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [result, setResult] = useState<DocumentoJuridico | null>(null)
  const [history, setHistory] = useState<DocumentoJuridico[]>([])
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<DocumentoJuridico | null>(null)
  const [userId, setUserId] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email ?? '')
        setUserId(session.user.id)
        fetchHistory(session.user.id)
      } else {
        fetchHistory('')
      }
    })
  }, [router])

  const fetchHistory = async (uid: string) => {
    let query = supabase
      .from('documentos_juridicos')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(50)

    if (uid) query = query.eq('user_id', uid)

    const { data } = await query
    if (data) setHistory(data as DocumentoJuridico[])
  }

  const handleUpload = async (file: File) => {
    setLoading(true)
    setResult(null)

    const { data: { session } } = await supabase.auth.getSession()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/upload`,
        {
          method: 'POST',
          body: formData,
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
        }
      )

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail ?? 'Erro ao processar documento')

      setResult(data as DocumentoJuridico)
      fetchHistory(userId)
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const metrics = useMemo(() => {
    const total = history.length
    const success = history.filter((d) => d.status_leitura === 'Sucesso').length
    const rate = total > 0 ? Math.round((success / total) * 100) : 0
    const last7 = history.filter((d) => {
      if (!d.criado_em) return false
      const diff = (Date.now() - new Date(d.criado_em).getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 7
    }).length
    const areaCount: Record<string, number> = {}
    history.forEach((d) => {
      areaCount[d.categoria_area] = (areaCount[d.categoria_area] ?? 0) + 1
    })
    const topArea = Object.entries(areaCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { total, rate, last7, topArea }
  }, [history])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userEmail={userEmail} />

      <main className="flex-1 ml-60 px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total de documentos" value={metrics.total} icon="docs" />
          <MetricCard label="Taxa de sucesso" value={`${metrics.rate}%`} icon="check" />
          <MetricCard label="Últimos 7 dias" value={metrics.last7} icon="calendar" />
          <MetricCard label="Área principal" value={metrics.topArea} icon="tag" small />
        </div>

        <div className={`grid gap-6 ${result ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-xl'}`}>
          <UploadZone onUpload={handleUpload} loading={loading} />
          {result && (
            <div className="animate-slide-up">
              <ResultCard documento={result} />
            </div>
          )}
        </div>

        <HistoryTable documentos={history} onSelect={setSelectedDoc} />
      </main>

      <DocumentModal documento={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  )
}
