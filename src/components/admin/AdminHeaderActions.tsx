import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Building2,
  Car,
  HeadphonesIcon,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Settings,
  Shield,
  Target,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { AvatarImage } from '@/components/ui/safe-image'
import { useAuth } from '@/context/AuthContext'
import { getDashboardSummary, type DashboardSummary } from '@/lib/dashboard-api'
import { cn } from '@/lib/utils'

const HELP_LINKS = [
  { to: '/admin/dashboard', label: 'Operations overview', icon: LayoutDashboard },
  { to: '/admin/inventory', label: 'Vehicle inventory', icon: Car },
  { to: '/admin/customers', label: 'Customer CRM', icon: Users },
  { to: '/admin/leads', label: 'Lead pipeline', icon: Target },
  { to: '/admin/service', label: 'Service operations', icon: Wrench },
  { to: '/admin/warranty', label: 'Warranty & recalls', icon: Shield },
  { to: '/admin/support', label: 'Support inbox', icon: HeadphonesIcon },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
] as const

const ADMIN_HELP_LINKS = [
  { to: '/admin/branches', label: 'Branches & locations', icon: MapPin },
  { to: '/admin/staff', label: 'Team management', icon: UserCog },
] as const

export function AdminHeaderActions() {
  const { user, isAdmin } = useAuth()
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  useEffect(() => {
    let cancelled = false
    setSummaryLoading(true)
    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        if (!cancelled) setSummary(null)
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const alertCount =
    (summary?.slaAtRiskTickets ?? 0) +
    (summary?.openSupportTickets ?? 0) +
    (summary?.pendingWarrantyClaims ?? 0)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="hidden rounded-full sm:inline-flex"
        aria-label="Help and shortcuts"
        onClick={() => setHelpOpen(true)}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        aria-label="Notifications and alerts"
        asChild
      >
        <Link to="/admin/notifications">
          <Bell className="h-4 w-4" />
          {!summaryLoading && alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c8102e] px-1 text-[9px] font-bold text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden rounded-full sm:inline-flex"
        aria-label="Portal settings"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Drawer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Help & shortcuts"
        description="Quick links and tips for the Elizade Connect admin portal"
        width="md"
      >
        <DrawerSection title="Search">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use the search bar in the header to find customers, vehicles, support tickets
            {isAdmin ? ', and staff members' : ''}. Type at least two characters to search.
          </p>
        </DrawerSection>

        <DrawerSection title="Modules">
          <div className="grid gap-1">
            {[...HELP_LINKS, ...(isAdmin ? ADMIN_HELP_LINKS : [])].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setHelpOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </DrawerSection>

        <DrawerSection title="Roles">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Staff</strong> can manage inventory, CRM, leads, service,
              warranty, support, and notifications.
            </p>
            {isAdmin && (
              <p>
                <strong className="text-foreground">Admin</strong> additionally manages branches, service bays,
                and team accounts.
              </p>
            )}
          </div>
        </DrawerSection>

        <DrawerSection title="Need more help?">
          <p className="text-sm text-muted-foreground leading-relaxed">
            For DMS integration, production OTP, or account issues, contact your Elizade IT / systems team.
          </p>
        </DrawerSection>
      </Drawer>

      <Drawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Portal settings"
        description="Your account and workspace preferences"
        width="md"
      >
        <DrawerSection title="Account">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
            <AvatarImage src={user?.avatar} name={fullName} className="h-12 w-12" />
            <div className="min-w-0">
              <p className="font-semibold truncate">{fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? user?.phone}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="capitalize text-[10px]">
                  {user?.role}
                </Badge>
                {user?.department && (
                  <Badge variant="secondary" className="text-[10px]">
                    {user.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Appearance">
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Light, dark, or system</p>
            </div>
            <ThemeToggle />
          </div>
        </DrawerSection>

        {summary && (
          <DrawerSection title="Live snapshot">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground">Open tickets</p>
                <p className="text-xl font-bold tabular-nums">{summary.openSupportTickets}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground">SLA at risk</p>
                <p className={cn('text-xl font-bold tabular-nums', summary.slaAtRiskTickets > 0 && 'text-rose-600')}>
                  {summary.slaAtRiskTickets}
                </p>
              </div>
            </div>
          </DrawerSection>
        )}

        <DrawerSection title="Quick actions">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link to="/admin/notifications" onClick={() => setSettingsOpen(false)}>
                <Bell className="h-4 w-4" />
                Notification rules & broadcasts
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link to="/admin/support" onClick={() => setSettingsOpen(false)}>
                <HeadphonesIcon className="h-4 w-4" />
                Support inbox
              </Link>
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link to="/admin/staff" onClick={() => setSettingsOpen(false)}>
                    <UserCog className="h-4 w-4" />
                    Manage staff
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link to="/admin/branches" onClick={() => setSettingsOpen(false)}>
                    <Building2 className="h-4 w-4" />
                    Manage branches
                  </Link>
                </Button>
              </>
            )}
          </div>
        </DrawerSection>
      </Drawer>
    </>
  )
}
