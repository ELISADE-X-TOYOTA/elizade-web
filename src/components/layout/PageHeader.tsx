import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8', className)}>
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-2xl">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2 shrink-0">{children}</div>}
    </div>
  )
}

export function PageContainer({
  children,
  className,
  wide,
}: {
  children: React.ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div className={cn('w-full mx-auto', wide ? 'max-w-[1600px]' : 'max-w-7xl', className)}>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: { value: string; positive: boolean }
}) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
          <p className="font-display text-2xl sm:text-3xl font-bold mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-emerald-600' : 'text-destructive')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
