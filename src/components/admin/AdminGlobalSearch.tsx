import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, HeadphonesIcon, LayoutDashboard, Loader2, Search, UserCog, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchAdminWorkspace, type AdminSearchResult } from '@/lib/admin-search'
import { cn } from '@/lib/utils'

const TYPE_META: Record<AdminSearchResult['type'], { icon: typeof Users; label: string }> = {
  customer: { icon: Users, label: 'Customer' },
  vehicle: { icon: Car, label: 'Vehicle' },
  ticket: { icon: HeadphonesIcon, label: 'Ticket' },
  staff: { icon: UserCog, label: 'Staff' },
  page: { icon: LayoutDashboard, label: 'Page' },
}

export function AdminGlobalSearch({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = window.setTimeout(() => {
      searchAdminWorkspace(query, isAdmin)
        .then(setResults)
        .finally(() => setLoading(false))
    }, 300)
    return () => window.clearTimeout(t)
  }, [query, isAdmin])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={wrapRef} className="relative hidden min-w-[220px] flex-1 sm:block lg:min-w-[300px] lg:flex-none">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search customers, vehicles, tickets…"
        className="h-10 rounded-full border-border/70 bg-[#f7f8fb] pl-10 shadow-sm dark:bg-[#1e2a3f]"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">
          <div className="border-b border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
            Search across customers, inventory, support{isAdmin ? ', and staff' : ''}
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No matches for “{query.trim()}”</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((row) => {
                const meta = TYPE_META[row.type]
                const Icon = meta.icon
                return (
                  <li key={`${row.type}-${row.id}`}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                      onClick={() => {
                        navigate(row.href)
                        setOpen(false)
                        setQuery('')
                      }}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ffcf0f]/15 text-[#121a2a] dark:text-[#ffcf0f]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{row.title}</span>
                          <span className={cn('shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase')}>
                            {meta.label}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.subtitle}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
