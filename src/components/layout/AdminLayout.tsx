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
  ChevronLeft,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BrandMark } from '@/components/branding/BrandMark'
import { AvatarImage } from '@/components/ui/safe-image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const fullName = `${user?.firstName} ${user?.lastName}`
  const navItems = isAdmin ? [...baseNavItems, ...adminOnlyNavItems] : baseNavItems
  const portalLabel = isAdmin ? 'Admin Portal' : 'Staff Portal'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-border/50 glass-strong transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center gap-3 px-5 border-b border-border/50">
          <BrandMark size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Elizade Connect</p>
            <Badge variant="secondary" className="text-[10px] mt-0.5">{portalLabel}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/50 p-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl p-3 bg-muted/30">
            <AvatarImage src={user?.avatar} name={fullName} className="h-10 w-10 ring-2 ring-primary/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{fullName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{user?.role} · {user?.department}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 glass-strong px-4 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate hidden sm:block">
              Welcome back, <span className="font-semibold">{user?.firstName}</span>
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <ChevronLeft className="h-3 w-3" />
              Customer view
            </Button>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
