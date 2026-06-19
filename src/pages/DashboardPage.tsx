import { Link } from 'react-router-dom'
import {
  Car,
  Wrench,
  Shield,
  Bell,
  HeadphonesIcon,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronRight,
  Circle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/effects/PageTransition'
import { SafeImage } from '@/components/ui/safe-image'
import { useAuth } from '@/context/AuthContext'
import {
  ownedVehicles,
  serviceAppointments,
  notifications,
  recallNotices,
  activeServiceJob,
  warrantyCertificates,
  getBranchById,
  getOwnedVehicleById,
} from '@/data/dummy'
import { cn, formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

function RingProgress({
  value,
  size = 52,
  label,
  accent = 'primary',
}: {
  value: number
  size?: number
  label?: string
  accent?: 'primary' | 'blue' | 'emerald'
}) {
  const stroke = 3.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c
  const accentClass =
    accent === 'blue' ? 'text-blue-500' : accent === 'emerald' ? 'text-emerald-500' : 'text-[#ffcf0f]'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(accentClass, 'transition-all duration-700 ease-out')}
        />
      </svg>
      {label && (
        <span className="absolute text-[10px] font-semibold tabular-nums text-foreground">{label}</span>
      )}
    </div>
  )
}

function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-2 w-2 shrink-0', className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

type ActivityItem = {
  id: string
  time: string
  title: string
  body?: string
  link?: string
  live?: boolean
  unread?: boolean
  kind: 'service' | 'notification' | 'appointment' | 'recall'
  category?: string
}

const ACTIVITY_COLORS: Record<string, { bg: string; icon: string; Icon: typeof Bell }> = {
  service: { bg: 'bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400', Icon: Wrench },
  appointment: { bg: 'bg-violet-500/10', icon: 'text-violet-600 dark:text-violet-400', Icon: Calendar },
  recall: { bg: 'bg-rose-500/10', icon: 'text-rose-600 dark:text-rose-400', Icon: AlertTriangle },
  sales: { bg: 'bg-amber-500/10', icon: 'text-amber-700 dark:text-amber-400', Icon: Car },
  warranty: { bg: 'bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', Icon: Shield },
  promo: { bg: 'bg-[#ffcf0f]/15', icon: 'text-[#b8960a] dark:text-[#ffcf0f]', Icon: Bell },
  support: { bg: 'bg-purple-500/10', icon: 'text-purple-600 dark:text-purple-400', Icon: HeadphonesIcon },
  default: { bg: 'bg-muted', icon: 'text-muted-foreground', Icon: Bell },
}

function ActivityIcon({ item }: { item: ActivityItem }) {
  if (item.live) return <LiveDot className="mt-1" />
  const key =
    item.kind === 'service'
      ? 'service'
      : item.kind === 'appointment'
        ? 'appointment'
        : item.category ?? 'default'
  const meta = ACTIVITY_COLORS[key] ?? ACTIVITY_COLORS.default
  const Icon = meta.Icon
  return (
    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5', meta.bg)}>
      <Icon className={cn('h-4 w-4', meta.icon)} />
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.firstName ?? 'there'

  const primaryVehicle = ownedVehicles.find((v) => v.isPrimary)
  const liveAppointment = serviceAppointments.find((a) => a.status === 'awaiting_approval')
  const upcomingAppointment = serviceAppointments.find((a) => a.status === 'confirmed')
  const activeRecall = recallNotices.find((r) => r.affected)
  const activeWarranty = warrantyCertificates.find((w) => w.vehicleId === primaryVehicle?.id && w.status === 'active')
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const mileagePct = primaryVehicle
    ? Math.round((primaryVehicle.mileage / primaryVehicle.nextServiceMileage) * 100)
    : 0
  const daysToService = primaryVehicle ? daysUntil(primaryVehicle.nextServiceDue) : 0
  const kmRemaining = primaryVehicle ? primaryVehicle.nextServiceMileage - primaryVehicle.mileage : 0

  const completedStages = activeServiceJob.stages.filter((s) => s.completed).length
  const jobProgress = Math.round((completedStages / activeServiceJob.stages.length) * 100)

  const attentionCount =
    (liveAppointment ? 1 : 0) + (activeRecall ? 1 : 0) + unreadCount

  const activityFeed: ActivityItem[] = [
  ...(liveAppointment && activeServiceJob.additionalWork
    ? [{
        id: 'live-job',
        time: notifications[0]?.createdAt ?? new Date().toISOString(),
        title: 'Approval needed — additional work',
        body: activeServiceJob.additionalWork.description,
        link: `/service/track/${liveAppointment.id}`,
        live: true,
        kind: 'service' as const,
      }]
    : []),
  ...notifications.slice(0, 5).map((n) => ({
    id: n.id,
    time: n.createdAt,
    title: n.title,
    body: n.body,
    link: n.deepLink,
    unread: !n.isRead,
    kind: 'notification' as const,
    category: n.category,
  })),
  ...(upcomingAppointment
    ? [{
        id: 'upcoming',
        time: upcomingAppointment.scheduledAt,
        title: `Upcoming ${upcomingAppointment.serviceType} service`,
        body: formatDateTime(upcomingAppointment.scheduledAt),
        link: `/service/track/${upcomingAppointment.id}`,
        kind: 'appointment' as const,
      }]
    : []),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6)

  const quickActions = [
    { to: '/service/book', label: 'Book service', icon: Wrench, iconClass: 'text-blue-600', hover: 'hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-500/10' },
    { to: '/vehicles', label: 'Browse', icon: Car, iconClass: 'text-[#c9a000] dark:text-[#ffcf0f]', hover: 'hover:border-[#ffcf0f]/40 hover:bg-[#ffcf0f]/8' },
    { to: '/warranty', label: 'Warranty', icon: Shield, iconClass: 'text-emerald-600', hover: 'hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10' },
    { to: '/support/new', label: 'Support', icon: HeadphonesIcon, iconClass: 'text-violet-600', hover: 'hover:border-violet-200 hover:bg-violet-50/50 dark:hover:bg-violet-500/10' },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {new Intl.DateTimeFormat('en-NG', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              {getGreeting()},{' '}
              <span className="text-[#000] dark:text-[#fff]">{firstName}</span>
            </h1>
          </div>
          <Link to="/service/book">
            <Button size="sm" className="gap-2 shrink-0">
              <Wrench className="h-4 w-4" />
              Book service
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Attention — action queue */}
      {attentionCount > 0 && (
        <FadeIn delay={0.03}>
          <section className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-black/20 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 bg-muted/40 dark:bg-[#121820]/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <LiveDot />
                <h2 className="text-sm font-semibold truncate">Needs your attention</h2>
                <Badge
                  variant="secondary"
                  className="h-5 px-2 text-[10px] tabular-nums bg-primary/15 text-foreground border-0 dark:bg-primary/20"
                >
                  {attentionCount}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Tap to review</p>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveAppointment && activeServiceJob.additionalWork && (
                <Link
                  to={`/service/track/${liveAppointment.id}`}
                  className="group relative flex gap-3 rounded-xl border border-border bg-background dark:bg-[#0f141c] p-4 transition-all hover:shadow-md dark:hover:shadow-black/30 hover:border-blue-500/30 dark:hover:border-blue-400/25 overflow-hidden"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-400/15 ring-1 ring-blue-500/20 dark:ring-blue-400/25 ml-2">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm font-semibold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Approve repair work
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Additional work pending</p>
                    <p className="text-sm font-bold tabular-nums mt-2 text-foreground">
                      {formatCurrency(activeServiceJob.additionalWork.cost)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground shrink-0 self-center transition-colors" />
                </Link>
              )}

              {activeRecall && (
                <Link
                  to="/warranty"
                  className="group relative flex gap-3 rounded-xl border border-border bg-background dark:bg-[#0f141c] p-4 transition-all hover:shadow-md dark:hover:shadow-black/30 hover:border-rose-500/30 dark:hover:border-rose-400/25 overflow-hidden"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-400/15 ring-1 ring-rose-500/20 dark:ring-rose-400/25 ml-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm font-semibold leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      Recall inspection
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activeRecall.title}</p>
                    <Badge variant="outline" className="mt-2 text-[10px] border-rose-500/25 text-rose-600 dark:text-rose-400 dark:border-rose-400/30">
                      {activeRecall.severity}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground shrink-0 self-center transition-colors" />
                </Link>
              )}

              {unreadCount > 0 && (
                <Link
                  to="/notifications"
                  className="group relative flex gap-3 rounded-xl border border-border bg-background dark:bg-[#0f141c] p-4 transition-all hover:shadow-md dark:hover:shadow-black/30 hover:border-primary/40 dark:hover:border-primary/30 overflow-hidden sm:col-span-2 lg:col-span-1"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 dark:bg-primary/20 ring-1 ring-primary/25 ml-2">
                    <Bell className="h-4 w-4 text-[#9a7b00] dark:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm font-semibold leading-snug">Unread alerts</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {unreadCount} notification{unreadCount !== 1 ? 's' : ''} waiting
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/25 text-xs font-bold tabular-nums text-[#121a2a] dark:text-primary">
                      {unreadCount}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              )}
            </div>
          </section>
        </FadeIn>
      )}

      {/* Live service tracker */}
      {liveAppointment && (
        <FadeIn delay={0.05}>
          <Card className="border-border shadow-md dark:shadow-black/25 overflow-hidden bg-card">
            <div
              className="h-1 w-full bg-gradient-to-r from-blue-500 via-primary to-emerald-500 opacity-90 dark:opacity-70 dark:from-blue-400/80 dark:via-primary/90 dark:to-emerald-400/80"
              aria-hidden
            />

            <div className="px-5 sm:px-6 py-5 border-b border-border/60 bg-muted/30 dark:bg-[#121820]/60">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-400/15 ring-1 ring-blue-500/20 dark:ring-blue-400/20">
                    <LiveDot className="scale-125" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-display">Service in progress</CardTitle>
                      <Badge className="text-[10px] h-5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 dark:bg-emerald-400/15">
                        Live
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {getOwnedVehicleById(liveAppointment.vehicleId)?.model} ·{' '}
                      {getBranchById(liveAppointment.branchId)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 dark:bg-[#0f141c] px-3 py-2 text-sm text-muted-foreground shrink-0">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span className="tabular-nums">Est. {formatDateTime(activeServiceJob.estimatedCompletion)}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-muted-foreground">Overall progress</span>
                  <span className="font-bold tabular-nums text-foreground">{jobProgress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted dark:bg-[#1e2a3f] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-primary dark:from-emerald-500/90 dark:to-primary/90 transition-all duration-700 ease-out"
                    style={{ width: `${jobProgress}%` }}
                  />
                </div>
              </div>

              {/* Step timeline — scroll on small screens */}
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex min-w-[min(100%,640px)] sm:min-w-0 items-start justify-between gap-1 relative pt-1">
                  <div className="absolute top-[15px] left-[8%] right-[8%] h-px bg-border dark:bg-[#2a3548]" aria-hidden />
                  <div
                    className="absolute top-[15px] left-[8%] h-px bg-gradient-to-r from-emerald-500 to-primary dark:from-emerald-400/90 dark:to-primary/90 transition-all duration-700"
                    style={{ width: `${Math.max(0, jobProgress - 8)}%` }}
                    aria-hidden
                  />
                  {activeServiceJob.stages.map((stage, i) => {
                    const isCurrent = !stage.completed && activeServiceJob.stages[i - 1]?.completed
                    const isPending = !stage.completed && !isCurrent
                    return (
                      <div
                        key={stage.label}
                        className="flex flex-col items-center gap-2 z-10 flex-1 min-w-[64px] max-w-[88px]"
                      >
                        {stage.completed ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 ring-2 ring-emerald-500/30 dark:ring-emerald-400/35">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : isCurrent ? (
                          <div className="relative flex h-8 w-8 items-center justify-center">
                            <span className="absolute inset-0 rounded-full bg-primary/25 dark:bg-primary/20 animate-ping opacity-40" />
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-card dark:bg-[#161d2b] ring-2 ring-primary shadow-sm shadow-primary/20">
                              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 dark:bg-[#1e2a3f] ring-1 ring-border dark:ring-[#3a4558]">
                            <Circle className="h-4 w-4 stroke-muted-foreground/50 dark:stroke-[#6b7a90] fill-none" />
                          </div>
                        )}
                        <span
                          className={cn(
                            'text-[10px] sm:text-[11px] text-center leading-tight w-full',
                            stage.completed && 'text-emerald-700 dark:text-emerald-400/90 font-medium',
                            isCurrent && 'text-foreground font-semibold',
                            isPending && 'text-muted-foreground',
                          )}
                        >
                          {stage.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2 border-t border-border/50">
                {activeServiceJob.additionalWork && (
                  <p className="text-xs text-muted-foreground max-w-md">
                    <span className="font-medium text-foreground">Action needed:</span>{' '}
                    Approve {formatCurrency(activeServiceJob.additionalWork.cost)} additional work
                  </p>
                )}
                <Link to={`/service/track/${liveAppointment.id}`} className="shrink-0">
                  <Button size="sm" className="w-full sm:w-auto gap-2 shadow-sm">
                    Open service tracker
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Meaningful metrics — contextual, not random counts */}
      <FadeIn delay={0.08}>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {primaryVehicle && (
            <Card className="border-border shadow-sm border-t-2 border-t-blue-500/40">
              <CardContent className="p-5 flex items-center gap-4">
                <RingProgress value={mileagePct} label={`${mileagePct}%`} accent="blue" />
                <div>
                  <p className="text-xs text-muted-foreground">Service interval</p>
                  <p className="font-display text-xl font-bold tabular-nums mt-0.5">
                    {kmRemaining.toLocaleString()} km
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">until {primaryVehicle.nextServiceMileage.toLocaleString()} km</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-border shadow-sm border-t-2 border-t-[#ffcf0f]/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcf0f]/15">
                  <Calendar className="h-4 w-4 text-[#b8960a] dark:text-[#ffcf0f]" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Next service</p>
              </div>
              <p className="font-display text-xl font-bold tabular-nums">
                {primaryVehicle ? (
                  daysToService === 0 ? 'Today' : `${daysToService} days`
                ) : (
                  '—'
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {primaryVehicle ? formatDate(primaryVehicle.nextServiceDue) : 'No vehicle linked'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm border-t-2 border-t-emerald-500/40">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Warranty</p>
              </div>
              <p className="font-display text-xl font-bold">
                {activeWarranty ? 'Active' : 'Review'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeWarranty
                  ? `Until ${formatDate(activeWarranty.coverageEnd)}`
                  : 'Check coverage status'}
              </p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Vehicle */}
        {primaryVehicle && (
          <FadeIn className="lg:col-span-2">
            <Card className="border-border shadow-sm h-full overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-[#ffcf0f]/60 to-transparent" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  Primary vehicle
                  <Badge className="bg-[#ffcf0f]/20 text-[#121a2a] dark:text-[#ffcf0f] border-0 text-[10px]">Primary</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SafeImage
                  src={primaryVehicle.image}
                  alt=""
                  className="w-full aspect-[16/10] rounded-xl object-cover ring-1 ring-border/60"
                />
                <div>
                  <p className="font-display font-semibold text-lg leading-tight">
                    {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {primaryVehicle.trim} · {primaryVehicle.color}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground tabular-nums">
                    <span>{primaryVehicle.mileage.toLocaleString()} km</span>
                    <span>{primaryVehicle.registrationNumber}</span>
                  </div>
                </div>
                <Link to="/my-vehicles">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    Manage vehicles
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Live activity feed */}
        <FadeIn delay={0.1} className="lg:col-span-3">
          <Card className="border-border shadow-sm h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-display">Activity</CardTitle>
                {unreadCount > 0 && (
                  <Badge className="text-[10px] h-5 px-1.5 tabular-nums bg-[#ffcf0f]/20 text-[#121a2a] dark:text-[#ffcf0f] border-0">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <Link to="/notifications" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/60">
                {activityFeed.map((item, idx) => (
                  <li key={item.id}>
                    <Link
                      to={item.link ?? '/notifications'}
                      className={cn(
                        'flex items-start gap-3 px-5 py-4 transition-colors',
                        item.unread ? 'bg-[#ffcf0f]/[0.04] hover:bg-[#ffcf0f]/[0.07]' : 'hover:bg-muted/40',
                      )}
                    >
                      <ActivityIcon item={item} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{item.title}</p>
                        {item.body && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[11px] shrink-0 tabular-nums',
                          idx === 0 && item.live
                            ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground',
                        )}
                      >
                        {idx === 0 && item.live ? 'Live' : relativeTime(item.time)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Quick actions — compact row */}
      <FadeIn delay={0.12}>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Button
                variant="outline"
                size="sm"
                className={cn('gap-2 h-9 bg-card transition-colors', action.hover)}
              >
                <action.icon className={cn('h-3.5 w-3.5', action.iconClass)} />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* Upcoming appointment — detail card */}
      {upcomingAppointment && (
        <FadeIn delay={0.14}>
          <Card className="border-border shadow-sm border-l-2 border-l-violet-500/50">
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium capitalize">{upcomingAppointment.serviceType} service booked</p>
                  <Badge variant="success" className="text-[10px]">Confirmed</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDateTime(upcomingAppointment.scheduledAt)} · {getBranchById(upcomingAppointment.branchId)?.name}
                </p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {upcomingAppointment.issueDescription}
                </p>
              </div>
              <Link to={`/service/track/${upcomingAppointment.id}`} className="shrink-0">
                <Button variant="outline" size="sm">Details</Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
