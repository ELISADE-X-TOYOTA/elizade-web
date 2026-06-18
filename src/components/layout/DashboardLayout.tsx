import { Link, useLocation } from 'react-router-dom'
import {
  Car,
  LayoutDashboard,
  Wrench,
  Shield,
  HeadphonesIcon,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BrandMark } from '@/components/branding/BrandMark'
import { AvatarImage } from '@/components/ui/safe-image'
import { useAuth } from '@/context/AuthContext'
import { notifications } from '@/data/dummy'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
  { to: '/service', label: 'Service', icon: Wrench },
  { to: '/warranty', label: 'Warranty', icon: Shield },
  { to: '/support', label: 'Support', icon: HeadphonesIcon },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
]

const mobileNavItems = navItems.slice(0, 5)

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const fullName = `${user?.firstName} ${user?.lastName}`

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
      <aside className="hidden lg:flex w-[280px] flex-col glass-strong border-r border-border/50 fixed inset-y-0 left-0 z-40">
        <div className="flex h-16 items-center gap-3 px-5 border-b border-border/50">
          <BrandMark size="md" />
          <div>
            <p className="font-semibold text-sm">Elizade Connect</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Customer</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-secondary text-foreground font-medium border-l-2 border-[#ffcf0f] -ml-[2px] pl-[14px]'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.to === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#121a2a] text-[10px] font-bold text-[#ffcf0f] px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 rounded-xl p-3 bg-muted/30">
            <AvatarImage src={user?.avatar} name={fullName} className="h-10 w-10 ring-2 ring-primary/15" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50 safe-top">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-semibold text-sm">Elizade Connect</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border/50 p-3 space-y-0.5 bg-background max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
                    active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
            <Button variant="ghost" className="w-full justify-start gap-2 mt-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </nav>
        )}
      </div>

      <main className="flex-1 lg:pl-[280px] pb-[72px] lg:pb-0">
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pt-[4.5rem] lg:pt-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
