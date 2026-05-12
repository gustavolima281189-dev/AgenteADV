interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      {icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
        >
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{title}</p>
        {description && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{description}</p>}
      </div>
      {action}
    </div>
  )
}
