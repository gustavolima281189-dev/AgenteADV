'use client'

import { useState, useMemo } from 'react'
import { DocumentoJuridico } from '@/lib/supabase'

const CATEGORIA_COLORS: Record<string, string> = {
  'Cível': 'bg-blue-100 text-blue-700',
  'Trabalhista': 'bg-orange-100 text-orange-700',
  'Tributário': 'bg-yellow-100 text-yellow-700',
  'Criminal': 'bg-red-100 text-red-700',
  'Contratual': 'bg-purple-100 text-purple-700',
  'Administrativo': 'bg-cyan-100 text-cyan-700',
  'Outros': 'bg-gray-100 text-gray-600',
}

interface Props {
  documentos: DocumentoJuridico[]
  onSelect: (doc: DocumentoJuridico) => void
}

export default function HistoryTable({ documentos, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const areas = useMemo(
    () => Array.from(new Set(documentos.map((d) => d.categoria_area))).sort(),
    [documentos]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return documentos.filter((doc) => {
      const matchSearch =
        !q ||
        doc.tipo.toLowerCase().includes(q) ||
        doc.numero_processo_ou_id?.toLowerCase().includes(q) ||
        doc.polo_ativo_ou_contratante.some((p) => p.toLowerCase().includes(q)) ||
        doc.polo_passivo_ou_contratado.some((p) => p.toLowerCase().includes(q)) ||
        doc.sintese.toLowerCase().includes(q)
      const matchArea = !filterArea || doc.categoria_area === filterArea
      const matchStatus = !filterStatus || doc.status_leitura === filterStatus
      return matchSearch && matchArea && matchStatus
    })
  }, [documentos, search, filterArea, filterStatus])

  const exportCSV = () => {
    const headers = [
      'Tipo', 'Área', 'Polo Ativo', 'Polo Passivo',
      'Processo', 'Data Identificada', 'Status', 'Criado em', 'Síntese',
    ]
    const rows = filtered.map((doc) => [
      doc.tipo,
      doc.categoria_area,
      doc.polo_ativo_ou_contratante.join('; '),
      doc.polo_passivo_ou_contratado.join('; '),
      doc.numero_processo_ou_id ?? '',
      doc.data_identificada ? new Date(doc.data_identificada).toLocaleDateString('pt-BR') : '',
      doc.status_leitura,
      doc.criado_em ? new Date(doc.criado_em).toLocaleDateString('pt-BR') : '',
      doc.sintese,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasFilters = search || filterArea || filterStatus
  const clearFilters = () => { setSearch(''); setFilterArea(''); setFilterStatus('') }

  if (documentos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">Nenhum documento processado ainda</p>
        <p className="text-xs text-gray-400 mt-1">Faça upload de um PDF para começar</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Histórico</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} de {documentos.length} documento(s)
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tipo, partes, processo ou síntese..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 bg-white transition-all"
          >
            <option value="">Todas as áreas</option>
            {areas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 bg-white transition-all"
          >
            <option value="">Todos os status</option>
            <option value="Sucesso">Sucesso</option>
            <option value="Falha">Falha</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-gray-400">Nenhum resultado para os filtros aplicados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Área</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Partes</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Data</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => onSelect(doc)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 truncate max-w-[200px] group-hover:text-blue-700 transition-colors">
                      {doc.tipo}
                    </p>
                    {doc.numero_processo_ou_id && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{doc.numero_processo_ou_id}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      CATEGORIA_COLORS[doc.categoria_area] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {doc.categoria_area}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700 truncate max-w-[200px]">
                      {[...doc.polo_ativo_ou_contratante, ...doc.polo_passivo_ou_contratado].join(', ') || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {doc.criado_em ? new Date(doc.criado_em).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      doc.status_leitura === 'Sucesso'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {doc.status_leitura}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
