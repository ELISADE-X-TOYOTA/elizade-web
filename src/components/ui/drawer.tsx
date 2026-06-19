import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'md' | 'lg' | 'xl'
  customHeader?: React.ReactNode
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  customHeader,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <div
        className={cn(
          'relative flex h-full w-full flex-col bg-card border-l border-border shadow-2xl animate-fade-in',
          width === 'xl' ? 'max-w-xl' : width === 'lg' ? 'max-w-lg' : 'max-w-md',
        )}
      >
        {customHeader ? (
          <div className="shrink-0 relative">
            {customHeader}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/30 hover:text-white border-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 -mr-2" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border bg-muted/40 px-6 py-4 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function DrawerSection({
  title,
  children,
  className,
  accent,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  accent?: 'violet' | 'emerald' | 'amber' | 'sky' | 'rose'
}) {
  const accentBar = accent
    ? {
        violet: 'bg-violet-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        sky: 'bg-sky-500',
        rose: 'bg-rose-500',
      }[accent]
    : 'bg-primary'

  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <div className="flex items-center gap-2">
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', accentBar)} />
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</p>
        </div>
      )}
      {children}
    </div>
  )
}

export function DrawerField({
  label,
  value,
  mono,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  mono?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconClass?: string
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            iconClass ?? 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 space-y-0.5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={cn('text-sm font-medium text-foreground', mono && 'font-mono text-[13px]')}>{value}</p>
      </div>
    </div>
  )
}
