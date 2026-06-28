import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Car,
  Users,
  UserCog,
  Target,
  Wrench,
  Shield,
  HeadphonesIcon,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BrandMark } from '@/components/branding/BrandMark'
import { AvatarImage } from '@/components/ui/safe-image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { AdminGlobalSearch } from '@/components/admin/AdminGlobalSearch'

const baseNavItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/inventory', label: 'Inventory', icon: Car },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/leads', label: 'Leads', icon: Target },
  { to: '/admin/service', label: 'Service Ops', icon: Wrench },
  { to: '/admin/warranty', label: 'Warranty', icon: Shield },
  { to: '/admin/support', label: 'Support', icon: HeadphonesIcon },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const adminOnlyNavItems = [{ to: '/admin/staff', label: 'Staff', icon: UserCog }]

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Operations overview',
  '/admin/inventory': 'Vehicle inventory',
  '/admin/customers': 'Customer CRM',
  '/admin/leads': 'Lead pipeline',
  '/admin/service': 'Service operations',
  '/admin/warranty': 'Warranty & recalls',
  '/admin/support': 'Support inbox',
  '/admin/notifications': 'Notifications',
  '/admin/analytics': 'Business intelligence',
  '/admin/staff': 'Team management',
}

function pageTitle(pathname: string) {
  const match = Object.entries(PAGE_TITLES).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))
  return match?.[1] ?? 'Admin portal'
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const navItems = isAdmin ? [...baseNavItems, ...adminOnlyNavItems] : baseNavItems
  const portalLabel = isAdmin ? 'Admin portal' : 'Staff portal'
  const subtitle = useMemo(() => pageTitle(location.pathname), [location.pathname])

  return (
    <div className="min-h-screen bg-[#eef1f6] dark:bg-[#0c1018]">
      {/* Desktop sidebar shell — rounded navy panel like reference */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col transition-transform lg:translate-x-0',
          'lg:top-3 lg:bottom-3 lg:left-3 lg:rounded-[1.35rem]',
          'bg-[#0a1628] text-white shadow-2xl shadow-black/20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-[4.25rem] items-center gap-3 border-b border-white/10 px-5">
          <BrandMark size="md" className="brightness-110" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] font-bold tracking-tight">Elizade Connect</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">{portalLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Menu</p>
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-all',
                  active
                    ? 'bg-[#ffcf0f] text-[#121a2a] shadow-lg shadow-[#ffcf0f]/20'
                    : 'text-white/65 hover:bg-white/8 hover:text-white',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                    active ? 'bg-[#121a2a]/10' : 'bg-white/6 group-hover:bg-white/10',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom promo card — reference-style utility block */}
        <div className="px-3 pb-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e2a3f] to-[#121a2a] p-4">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#ffcf0f]/10 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffcf0f]/15 text-[#ffcf0f]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dealership ops hub</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                  Inventory, CRM, service, and support in one workspace.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/6 p-3">
            <AvatarImage src={user?.avatar} name={fullName} className="h-10 w-10 ring-2 ring-[#ffcf0f]/30" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{fullName || 'User'}</p>
              <p className="truncate text-[10px] uppercase tracking-wide text-white/45">
                {user?.role} · {user?.department ?? 'Operations'}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-xl text-white/60 hover:bg-white/8 hover:text-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-[calc(17.5rem+0.75rem)]">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-white/85 px-4 py-3 backdrop-blur-xl dark:bg-[#121a2a]/90 sm:px-6 lg:px-8 lg:py-4">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">{subtitle}</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Welcome back, <span className="font-medium text-foreground">{user?.firstName}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <AdminGlobalSearch isAdmin={isAdmin} />

              <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                <Button variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex">
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c8102e]" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex">
                  <Settings className="h-4 w-4" />
                </Button>

                <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card py-1 pl-1 pr-3 shadow-sm sm:flex">
                  <AvatarImage src={user?.avatar} name={fullName} className="h-8 w-8" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{fullName || 'User'}</p>
                    <p className="truncate text-[10px] capitalize text-muted-foreground">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
