import { cn } from '@/lib/utils'

export const ELIZADE_LOGO_FULL = '/images/elizade-logo-full.png'

const heights = {
  sm: 'h-14',
  md: 'h-20',
  lg: 'h-28',
  xl: 'h-40',
} as const

export function BrandMark({
  size = 'md',
  className,
}: {
  size?: keyof typeof heights
  className?: string
}) {
  return (
    <img
      src={ELIZADE_LOGO_FULL}
      alt=""
      className={cn('w-auto shrink-0 object-contain object-left', heights[size], className)}
    />
  )
}
