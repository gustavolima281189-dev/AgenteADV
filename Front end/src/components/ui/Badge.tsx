type Status = 'ativo' | 'pendente' | 'atrasado' | 'concluido' | 'sucesso' | 'falha' | string

const BADGE_STYLES: Record<string, string> = {
  ativo:     'bg-[oklch(0.68_0.14_230_/_0.15)] text-[oklch(0.68_0.14_230)] border-[oklch(0.68_0.14_230_/_0.3)]',
  pendente:  'bg-[oklch(0.78_0.13_85_/_0.15)] text-[oklch(0.78_0.13_85)] border-[oklch(0.78_0.13_85_/_0.3)]',
  atrasado:  'bg-[oklch(0.68_0.14_20_/_0.15)] text-[oklch(0.68_0.14_20)] border-[oklch(0.68_0.14_20_/_0.3)]',
  concluido: 'bg-[oklch(0.68_0.14_155_/_0.15)] text-[oklch(0.68_0.14_155)] border-[oklch(0.68_0.14_155_/_0.3)]',
  sucesso:   'bg-[oklch(0.68_0.14_155_/_0.15)] text-[oklch(0.68_0.14_155)] border-[oklch(0.68_0.14_155_/_0.3)]',
  falha:     'bg-[oklch(0.68_0.14_20_/_0.15)] text-[oklch(0.68_0.14_20)] border-[oklch(0.68_0.14_20_/_0.3)]',
}

interface Props {
  status: Status
  label?: string
}

const LABELS: Record<string, string> = {
  ativo: 'Ativo', pendente: 'Pendente', atrasado: 'Atrasado',
  concluido: 'Concluído', sucesso: 'Sucesso', falha: 'Falha',
}

export default function Badge({ status, label }: Props) {
  const key = status.toLowerCase()
  const style = BADGE_STYLES[key] ?? 'bg-white/10 text-white/60 border-white/10'
  const display = label ?? LABELS[key] ?? status

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style}`}>
      {display}
    </span>
  )
}
