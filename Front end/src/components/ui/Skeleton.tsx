interface Props { className?: string; rounded?: string }

export default function Skeleton({ className = '', rounded = 'rounded-xl' }: Props) {
  return <div className={`shimmer-bone ${rounded} ${className}`} />
}
