import { ButtonHTMLAttributes, forwardRef } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const SIZE = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-6 py-2.5 text-sm rounded-[14px]',
  lg: 'px-8 py-3.5 text-sm rounded-[16px]',
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${SIZE[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
      )}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
export default Button
