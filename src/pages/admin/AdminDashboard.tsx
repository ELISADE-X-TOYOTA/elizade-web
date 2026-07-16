import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Wrench,
  HeadphonesIcon,
  Car,
  AlertTriangle,
  ArrowRight,
  Target,
  UserPlus,
  Calendar,
  Sparkles,
  Building2,
  ChevronRight,
  Download,
  Loader2,
  MapPin,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/effects/PageTransition'
import { cn, formatCurrency } from '@/lib/utils'
import { AvatarImage } from '@/components/ui/safe-image'
import { ApiError } from '@/lib/api'
import { getDashboardOverview, type DashboardOverview } from '@/lib/dashboard-api'
import { exportDashboardReport } from '@/lib/dashboard-export'
import { useAuth } from '@/context/AuthContext'
import { useAdminPageTitle } from '@/lib/admin-page-titles'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  fontSize: 12,
}

const PIPELINE_COLORS: Record<string, string> = {
  new: '#6366f1',
  contacted: '#8b5cf6',
  qualified: '#a855f7',
  proposal: '#d946ef',
  negotiation: '#ec4899',
  won: '#10b981',
  lost: '#ef4444',
}

const SOURCE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899', '#8b5cf6']
const SERVICE_TYPE_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444']

function TrendBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
        positive
          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
          : 'bg-rose-500/12 text-rose-700 dark:text-rose-400',
      )}
    >
      {positive ? '↑' : '↓'} {value}
    </span>
  )
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
  trendPositive = true,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accent: 'violet' | 'emerald' | 'amber' | 'sky' | 'rose'
  trend?: string
  trendPositive?: boolean
}) {
  const accents = {
    violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-violet-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/20',
    sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-sky-500/20',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-rose-500/20',
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-display text-2xl sm:text-[28px] font-bold mt-1 tabular-nums tracking-tight truncate">
            {value}
          </p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
          {trend && (
            <div className="mt-2">
              <TrendBadge value={trend} positive={trendPositive} />
            </div>
          )}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1', accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ActivityDot({ color }: { color: string }) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  return <span className={cn('h-2 w-2 rounded-full shrink-0 mt-1.5', map[color] ?? 'bg-muted-foreground')} />
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AdminDashboardPage() {
  const { user } = useAuth()
  const pageTitle = useAdminPageTitle()
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    getDashboardOverview()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const summary = data?.summary
  const leadPipeline = data?.leadPipeline ?? []
  const leadTotal = leadPipeline.reduce((s, x) => s + x.count, 0)
  const serviceTotal = (data?.serviceByType ?? []).reduce((s, x) => s + x.count, 0)
  const serviceCapacity = summary?.serviceCapacity ?? 0
  const serviceToday = summary?.serviceToday ?? 0
  const servicePct = serviceCapacity > 0 ? Math.round((serviceToday / serviceCapacity) * 100) : 0

  const leadSourcesChart = useMemo(
    () =>
      (data?.leadSources ?? []).map((row, i) => ({
        channel: row.source,
        value: row.count,
        color: SOURCE_COLORS[i % SOURCE_COLORS.length],
      })),
    [data?.leadSources],
  )

  const customerGrowthPct = useMemo(() => {
    if (!data?.customerSignupsByMonth?.length) return 0
    const rows = data.customerSignupsByMonth
    const latest = rows[rows.length - 1]?.customers ?? 0
    const prev = rows[rows.length - 2]?.customers ?? 0
    if (prev === 0) return latest > 0 ? 100 : 0
    return Math.round(((latest - prev) / prev) * 100)
  }, [data?.customerSignupsByMonth])

  if (loading) {
    return (
      <PageContainer wide className="flex items-center justify-center min-h-[50vh] gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading live dashboard…
      </PageContainer>
    )
  }

  if (!summary) {
    return (
      <PageContainer wide className="py-20 text-center text-muted-foreground">
        Unable to load dashboard data.
      </PageContainer>
    )
  }

  return (
    <PageContainer wide className="space-y-6 sm:space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <span className="text-foreground font-medium">Operations</span>
              <ChevronRight className="h-3 w-3" />
              <span>Dashboard</span>
            </nav>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {greeting}{user?.firstName ? `, ${user.firstName}` : ''} · {dateStr} · Live data
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              disabled={!data}
              onClick={() => {
                if (data) {
                  exportDashboardReport(data)
                  toast.success('Operations report exported')
                }
              }}
            >
              <Download className="h-4 w-4" />
              Export report
            </Button>
            <Link to="/admin/branches">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <MapPin className="h-4 w-4" />
                Branches
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button size="sm" className="gap-2 rounded-xl">
                <TrendingUp className="h-4 w-4" />
                Full analytics
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Inventory available"
            value={summary.vehiclesAvailable}
            sub={`${summary.vehiclesTotal} total · ${summary.vehiclesReserved} reserved · ${summary.vehiclesSold} sold`}
            icon={Car}
            accent="violet"
            trend={`${summary.vehiclesReserved} reserved`}
            trendPositive
          />
          <MetricCard
            label="Active leads"
            value={summary.leadsActive}
            sub={`${formatCurrency(summary.leadsPipelineValue)} pipeline value`}
            icon={Target}
            accent="emerald"
            trend={`${summary.leadsNewThisWeek} new this week`}
            trendPositive={summary.leadsNewThisWeek > 0}
          />
          <MetricCard
            label="Service today"
            value={serviceCapacity ? `${serviceToday}/${serviceCapacity}` : serviceToday}
            sub={`${summary.serviceInProgress} in progress · ${summary.serviceAwaitingApproval} awaiting approval`}
            icon={Wrench}
            accent="sky"
            trend={serviceCapacity ? `${servicePct}% bay load` : 'No bays configured'}
            trendPositive={serviceToday <= serviceCapacity}
          />
          <MetricCard
            label="Open tickets"
            value={summary.openSupportTickets}
            sub={`${summary.slaAtRiskTickets} SLA risk · ${summary.pendingWarrantyClaims} warranty claims`}
            icon={HeadphonesIcon}
            accent="rose"
            trend={`${summary.branchesActive} active branches`}
            trendPositive={summary.slaAtRiskTickets === 0}
          />
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn className="lg:col-span-2">
          <Card className="h-full overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 border-b border-border/50">
              <div>
                <CardTitle className="text-base font-display">Revenue trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Won leads & service history (₦M)</p>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px]">Last 6 months</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueByMonth ?? []}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffcf0f" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ffcf0f" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="serviceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="sales" stroke="#ffcf0f" fill="url(#salesGrad)" strokeWidth={2.5} name="Sales (won)" />
                    <Area type="monotone" dataKey="service" stroke="#6366f1" fill="url(#serviceGrad)" strokeWidth={2} name="Service" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-display">Pipeline snapshot</CardTitle>
                  <p className="text-xs text-muted-foreground">Live CRM metrics</p>
                </div>
                <Link to="/admin/leads/breakdown">
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs h-8">
                    Full breakdown
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-end justify-between gap-2">
                  <p className="font-display text-2xl font-bold tabular-nums">{formatCurrency(summary.leadsPipelineValue)}</p>
                  <TrendBadge value={`${summary.leadsConversionRate}% won`} positive={summary.leadsConversionRate >= 20} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.leadsActive} active deals · {summary.leadsNewThisWeek} new this week
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 p-4 bg-muted/20 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead pipeline</p>
                {leadTotal > 0 ? (
                  <>
                    <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                      {leadPipeline.filter((s) => s.count > 0).map((s) => (
                        <div
                          key={s.status}
                          style={{
                            width: `${(s.count / leadTotal) * 100}%`,
                            backgroundColor: PIPELINE_COLORS[s.status] ?? '#6366f1',
                          }}
                          title={`${s.stage}: ${s.count}`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {leadPipeline.map((s) => (
                        <div key={s.status} className="flex items-center gap-2 text-[11px]">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIPELINE_COLORS[s.status] }} />
                          <span className="text-muted-foreground truncate">{s.stage}</span>
                          <span className="font-bold ml-auto tabular-nums">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No leads in pipeline yet</p>
                )}
                <Link to="/admin/leads/breakdown" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
                  View detailed pipeline breakdown →
                </Link>
              </div>

              {leadSourcesChart.length > 0 && (
                <>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={leadSourcesChart} dataKey="value" nameKey="channel" innerRadius={36} outerRadius={52} paddingAngle={3}>
                          {leadSourcesChart.map((c) => (
                            <Cell key={c.channel} fill={c.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">Lead sources</p>
                </>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <FadeIn>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Customer sign-ups</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">New registrations by month</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{summary.customersNew30d}</p>
                  <p className="text-xs text-muted-foreground">new in last 30 days</p>
                </div>
                <TrendBadge value={`${customerGrowthPct}% vs prior month`} positive={customerGrowthPct >= 0} />
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.customerSignupsByMonth ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="customers" fill="#10b981" radius={[6, 6, 0, 0]} name="Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Weekly service load</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Booked vs completed this week</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.weeklyServiceLoad ?? []} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="booked" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Booked" />
                    <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Branch snapshot</CardTitle>
              <Building2 className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.branchStats ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No active branches</p>
              ) : (
                data?.branchStats.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border/60 p-3 bg-muted/20">
                    <p className="font-semibold text-sm mb-2">{b.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div>
                        <p className="font-bold text-violet-600 tabular-nums">{b.vehicles}</p>
                        <p className="text-muted-foreground">Vehicles</p>
                      </div>
                      <div>
                        <p className="font-bold text-sky-600 tabular-nums">{b.appointmentsToday}</p>
                        <p className="text-muted-foreground">Today</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600 tabular-nums">{b.activeLeads}</p>
                        <p className="text-muted-foreground">Leads</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Link to="/admin/branches" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
                Manage branches →
              </Link>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-display">Service operations</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{serviceTotal} jobs · last 90 days</p>
            </CardHeader>
            <CardContent>
              {serviceTotal === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">No service appointments yet</p>
              ) : (
                <>
                  <div className="h-[160px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data?.serviceByType ?? []} dataKey="count" nameKey="type" innerRadius={45} outerRadius={70} paddingAngle={2}>
                          {(data?.serviceByType ?? []).map((s, i) => (
                            <Cell key={s.type} fill={SERVICE_TYPE_COLORS[i % SERVICE_TYPE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {(data?.serviceByType ?? []).map((s, i) => (
                      <div key={s.type} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: SERVICE_TYPE_COLORS[i % SERVICE_TYPE_COLORS.length] }} />
                        <span className="text-sm flex-1">{s.type}</span>
                        <span className="text-sm font-bold tabular-nums">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-display">Inventory by model</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Sold vs available stock</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data?.inventoryByModel ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No inventory data</p>
              ) : (
                data?.inventoryByModel.map((v) => {
                  const max = Math.max(...(data?.inventoryByModel ?? []).map((x) => x.sold + x.available), 1)
                  return (
                    <div key={v.model}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{v.model}</span>
                        <span className="text-muted-foreground text-xs">
                          {v.sold} sold · {v.available} avail
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all"
                          style={{ width: `${((v.sold + v.available) / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
              <Link to="/admin/inventory" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline block pt-2">
                Manage inventory →
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-display">Live activity</CardTitle>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="space-y-0">
              {(data?.recentActivity ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
              ) : (
                data?.recentActivity.map((item, i) => (
                  <div key={item.id} className={cn('flex gap-3 py-3', i < (data?.recentActivity.length ?? 0) - 1 && 'border-b border-border/50')}>
                    <ActivityDot color={item.color} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.meta}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{relativeTime(item.time)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Hot leads</CardTitle>
              <Link to="/admin/leads">
                <Button variant="ghost" size="sm" className="text-xs rounded-lg">View all</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {(data?.hotLeads ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hot leads right now</p>
              ) : (
                data?.hotLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <AvatarImage name={lead.customerName} className="h-9 w-9 text-xs shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{lead.customerName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lead.interestedModel}{lead.assignedAgent ? ` · ${lead.assignedAgent}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">{formatCurrency(lead.value)}</p>
                      <Badge variant="outline" className="text-[9px] capitalize mt-1 rounded-full">{lead.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-base font-display">Today&apos;s service</CardTitle>
              </div>
              <Link to="/admin/service">
                <Button variant="ghost" size="sm" className="text-xs rounded-lg">Schedule</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {(data?.todayService ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No appointments today</p>
              ) : (
                data?.todayService.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                    <span className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 w-11">{s.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.customerName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {s.vehicleLabel}{s.bayName ? ` · ${s.bayName}` : ''} · {s.branchName}
                      </p>
                    </div>
                    <Badge
                      variant={s.status === 'awaiting_approval' ? 'warning' : s.status === 'in_progress' ? 'success' : 'outline'}
                      className="text-[9px] capitalize shrink-0 rounded-full"
                    >
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">SLA alerts</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.slaTickets ?? []).length > 0 ? (
                data?.slaTickets.map((t) => (
                  <Link
                    key={t.id}
                    to="/admin/support"
                    className="block p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 transition-colors"
                  >
                    <p className="text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.ticketNumber}{t.assignedTo ? ` · ${t.assignedTo}` : ''}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No critical SLA breaches</p>
              )}
              <Link to="/admin/support" className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline">
                Open support queue →
              </Link>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Team performance</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Leads won and open tickets by staff member</p>
            </CardHeader>
            <CardContent>
              {(data?.staffPerformance ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No staff data</p>
              ) : (
                <div className="space-y-4">
                  {data?.staffPerformance.map((agent, i) => {
                    const accents = ['violet', 'sky', 'emerald', 'amber'] as const
                    const accent = accents[i % accents.length]
                    const ring = {
                      violet: 'ring-violet-500/30',
                      sky: 'ring-sky-500/30',
                      emerald: 'ring-emerald-500/30',
                      amber: 'ring-amber-500/30',
                    }[accent]
                    return (
                      <div key={agent.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/60 bg-muted/20">
                        <AvatarImage name={agent.name} className={cn('h-11 w-11 ring-2', ring)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.department}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-center">
                          <div>
                            <p className="font-bold text-sm tabular-nums text-violet-600 dark:text-violet-400">{agent.leadsWon}</p>
                            <p className="text-[10px] text-muted-foreground">Won</p>
                          </div>
                          <div>
                            <p className="font-bold text-sm tabular-nums text-sky-600 dark:text-sky-400">{agent.ticketsOpen}</p>
                            <p className="text-[10px] text-muted-foreground">Tickets</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.1}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/admin/inventory', label: 'Inventory', icon: Car, desc: `${summary.vehiclesAvailable} units available`, accent: 'bg-violet-500/15 text-violet-600' },
            { to: '/admin/customers', label: 'CRM', icon: Users, desc: `${summary.customersNew30d} new in 30 days`, accent: 'bg-emerald-500/15 text-emerald-600' },
            { to: '/admin/warranty', label: 'Warranty', icon: AlertTriangle, desc: `${summary.pendingWarrantyClaims} claims pending`, accent: 'bg-amber-500/15 text-amber-600' },
            { to: '/admin/leads', label: 'Leads', icon: Target, desc: `${summary.leadsActive} active pipeline`, accent: 'bg-sky-500/15 text-sky-600' },
          ].map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', item.accent)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </FadeIn>
    </PageContainer>
  )
}
