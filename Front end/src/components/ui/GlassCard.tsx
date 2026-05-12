import { HTMLAttributes, forwardRef } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  large?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className = '', hover = false, large = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`glass ${large ? 'rounded-[28px]' : ''} ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-hi)]' : ''
      } ${className}`}
      style={{ borderRadius: large ? 'var(--radius-lg)' : 'var(--radius)' }}
      {...props}
    >
      {children}
    </div>
  )
)

GlassCard.displayName = 'GlassCard'
export default GlassCard
