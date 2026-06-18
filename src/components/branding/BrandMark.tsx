import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-8 w-8 text-xs rounded-lg',
  md: 'h-9 w-9 text-sm rounded-xl',
  lg: 'h-11 w-11 text-base rounded-xl',
} as const

export function BrandMark({
  size = 'md',
  className,
}: {
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center font-display font-bold text-[#ffcf0f] bg-[#121a2a] ring-1 ring-border/80',
        sizes[size],
        className,
      )}
    >
      EC
    </div>
  )
}
