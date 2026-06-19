import { Link } from 'react-router-dom'
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
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/effects/PageTransition'
import {
  adminKpis,
  revenueChart,
  leadPipelineChart,
  adminLeads,
  adminSupportQueue,
  serviceScheduleToday,
  agentPerformance,
  customerGrowthChart,
  acquisitionChannels,
  branchPerformance,
  serviceOpsByType,
  weeklyServiceLoad,
  revenueTarget,
  activityFeed,
  vehicleSalesByModel,
} from '@/data/admin-dummy'
import { cn, formatCurrency } from '@/lib/utils'
import { AvatarImage } from '@/components/ui/safe-image'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  fontSize: 12,
}

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

const leadTotal = leadPipelineChart.reduce((s, x) => s + x.count, 0)
const serviceTotal = serviceOpsByType.reduce((s, x) => s + x.count, 0)
const revenuePct = Math.round((revenueTarget.achieved / revenueTarget.target) * 100)

export function AdminDashboardPage() {
  const slaAtRisk = adminSupportQueue.filter((t) => t.slaStatus === 'at_risk')
  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <PageContainer wide className="space-y-6 sm:space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <span className="text-foreground font-medium">Operations</span>
              <ChevronRight className="h-3 w-3" />
              <span>Dashboard</span>
            </nav>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting}, Divine
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Elizade Connect overview · {dateStr}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/admin/staff">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Users className="h-4 w-4" />
                Staff
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

      {/* KPI row */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Revenue (Jun)"
            value={formatCurrency(adminKpis.totalRevenue)}
            sub="Sales + service combined"
            icon={TrendingUp}
            accent="violet"
            trend={`${adminKpis.revenueGrowth}% vs last month`}
            trendPositive
          />
          <MetricCard
            label="Active leads"
            value={adminKpis.activeLeads}
            sub={`${leadTotal} in pipeline`}
            icon={Target}
            accent="emerald"
            trend={`${adminKpis.leadsGrowth}% growth`}
            trendPositive
          />
          <MetricCard
            label="Service today"
            value={`${adminKpis.serviceToday}/${adminKpis.serviceCapacity}`}
            sub="Bay appointments booked"
            icon={Wrench}
            accent="sky"
            trend={`${Math.round((adminKpis.serviceToday / adminKpis.serviceCapacity) * 100)}% capacity`}
            trendPositive={adminKpis.serviceToday < adminKpis.serviceCapacity}
          />
          <MetricCard
            label="Open tickets"
            value={adminKpis.openTickets}
            sub={`${adminKpis.slaAtRisk} at SLA risk`}
            icon={HeadphonesIcon}
            accent="rose"
            trend={`${adminKpis.slaAtRisk} need attention`}
            trendPositive={false}
          />
        </div>
      </FadeIn>

      {/* Revenue target + main chart */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn className="lg:col-span-2">
          <Card className="h-full overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 border-b border-border/50">
              <div>
                <CardTitle className="text-base font-display">Revenue trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Monthly sales & service (₦M)</p>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px]">Jan – Jun 2026</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
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
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#ffcf0f"
                      fill="url(#salesGrad)"
                      strokeWidth={2.5}
                      name="Sales"
                    />
                    <Area
                      type="monotone"
                      dataKey="service"
                      stroke="#6366f1"
                      fill="url(#serviceGrad)"
                      strokeWidth={2}
                      name="Service"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Monthly target</CardTitle>
              <p className="text-xs text-muted-foreground">Revenue vs ₦1.05B goal</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-end justify-between gap-2">
                  <p className="font-display text-3xl font-bold tabular-nums">₦{revenueTarget.achieved}M</p>
                  <TrendBadge value={`${revenuePct}%`} positive={revenuePct >= 80} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target ₦{revenueTarget.target}M · Last month ₦{revenueTarget.lastMonth}M
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-violet-500 transition-all"
                    style={{ width: `${Math.min(revenuePct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>₦0</span>
                  <span>₦{revenueTarget.target}M target</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 p-4 bg-muted/20 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead pipeline</p>
                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                  {leadPipelineChart.map((s) => (
                    <div
                      key={s.stage}
                      style={{
                        width: `${(s.count / leadTotal) * 100}%`,
                        backgroundColor: s.color,
                      }}
                      title={`${s.stage}: ${s.count}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {leadPipelineChart.slice(0, 4).map((s) => (
                    <div key={s.stage} className="flex items-center gap-2 text-[11px]">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-muted-foreground truncate">{s.stage}</span>
                      <span className="font-bold ml-auto tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
                <Link to="/admin/leads" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
                  View all leads →
                </Link>
              </div>

              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={acquisitionChannels}
                      dataKey="value"
                      nameKey="channel"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {acquisitionChannels.map((c) => (
                        <Cell key={c.channel} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-center text-muted-foreground">Lead acquisition channels</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Customer growth + service load */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <FadeIn>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Customer base</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Registered owners vs churn</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{adminKpis.newCustomersMonth}</p>
                  <p className="text-xs text-muted-foreground">new this month</p>
                </div>
                <TrendBadge value={`${adminKpis.customerGrowth}%`} positive />
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerGrowthChart} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="customers" fill="#10b981" radius={[6, 6, 0, 0]} name="Customers" />
                    <Bar dataKey="churned" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Churned" opacity={0.7} />
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
              <p className="text-xs text-muted-foreground mt-1">Booked vs completed by day</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyServiceLoad} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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

      {/* Branch performance + service ops + vehicle sales */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Branch performance</CardTitle>
              <Building2 className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              {branchPerformance.map((b) => {
                const pct = Math.round((b.revenue / b.target) * 100)
                const onTarget = b.revenue >= b.target
                return (
                  <div key={b.branch} className="rounded-xl border border-border/60 p-3 bg-muted/20">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-semibold text-sm">{b.branch}</p>
                      <span
                        className={cn(
                          'text-[10px] font-bold rounded-full px-2 py-0.5',
                          onTarget
                            ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
                        )}
                      >
                        {pct}% of target
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                      <div
                        className={cn('h-full rounded-full', onTarget ? 'bg-emerald-500' : 'bg-amber-500')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>₦{b.revenue}M revenue</span>
                      <span>{b.units} units · {b.satisfaction}★</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-display">Service operations</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{serviceTotal} jobs this quarter</p>
            </CardHeader>
            <CardContent>
              <div className="h-[160px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceOpsByType}
                      dataKey="count"
                      nameKey="type"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {serviceOpsByType.map((s) => (
                        <Cell key={s.type} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {serviceOpsByType.map((s) => (
                  <div key={s.type} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm flex-1">{s.type}</span>
                    <span className="text-sm font-bold tabular-nums">{s.count}</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">
                      {Math.round((s.count / serviceTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
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
              {vehicleSalesByModel.map((v, i) => {
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899']
                const max = Math.max(...vehicleSalesByModel.map((x) => x.sold))
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
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(v.sold / max) * 100}%`,
                          backgroundColor: colors[i % colors.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              <Link to="/admin/inventory" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline block pt-2">
                Manage inventory →
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Activity + leads + schedule */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-display">Live activity</CardTitle>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="space-y-0">
              {activityFeed.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex gap-3 py-3',
                    i < activityFeed.length - 1 && 'border-b border-border/50',
                  )}
                >
                  <ActivityDot color={item.color} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{item.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.meta}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
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
              {adminLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <AvatarImage name={lead.customerName} className="h-9 w-9 text-xs shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{lead.customerName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {lead.interestedModel} · {lead.assignedAgent}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold">{formatCurrency(lead.value)}</p>
                    <Badge variant="outline" className="text-[9px] capitalize mt-1 rounded-full">
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
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
              {serviceScheduleToday.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
                >
                  <span className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 w-11">
                    {s.time}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.customer}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.vehicle} · {s.bay} · {s.branch}
                    </p>
                  </div>
                  <Badge
                    variant={s.status === 'awaiting_approval' ? 'warning' : s.status === 'in_progress' ? 'success' : 'outline'}
                    className="text-[9px] capitalize shrink-0 rounded-full"
                  >
                    {s.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* SLA + agents */}
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
              {slaAtRisk.length > 0 ? (
                slaAtRisk.map((t) => (
                  <Link
                    key={t.id}
                    to="/admin/support"
                    className="block p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 transition-colors"
                  >
                    <p className="text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.ticketNumber} · {t.assignedTo}
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
              <p className="text-xs text-muted-foreground mt-1">Leads won, tickets handled, satisfaction</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent, i) => {
                  const accents = ['violet', 'sky', 'emerald', 'amber'] as const
                  const accent = accents[i % accents.length]
                  const ring = {
                    violet: 'ring-violet-500/30',
                    sky: 'ring-sky-500/30',
                    emerald: 'ring-emerald-500/30',
                    amber: 'ring-amber-500/30',
                  }[accent]
                  return (
                    <div
                      key={agent.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border/60 bg-muted/20"
                    >
                      <AvatarImage
                        src={agent.avatar}
                        name={agent.name}
                        className={cn('h-11 w-11 ring-2', ring)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.department}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
                        <div>
                          <p className="font-bold text-sm tabular-nums text-violet-600 dark:text-violet-400">
                            {agent.leadsConverted}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Won</p>
                        </div>
                        <div>
                          <p className="font-bold text-sm tabular-nums text-sky-600 dark:text-sky-400">
                            {agent.ticketsHandled}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Tickets</p>
                        </div>
                        <div>
                          <p className="font-bold text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                            {agent.avgResponseMin}m
                          </p>
                          <p className="text-[10px] text-muted-foreground">Response</p>
                        </div>
                        <div>
                          <p className="font-bold text-sm tabular-nums text-amber-600 dark:text-amber-400">
                            {agent.satisfaction}★
                          </p>
                          <p className="text-[10px] text-muted-foreground">Rating</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Quick nav */}
      <FadeIn delay={0.1}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/admin/inventory', label: 'Inventory', icon: Car, desc: `${adminKpis.inventoryAvailable} units available`, accent: 'bg-violet-500/15 text-violet-600' },
            { to: '/admin/customers', label: 'CRM', icon: Users, desc: `${adminKpis.newCustomersMonth} new this month`, accent: 'bg-emerald-500/15 text-emerald-600' },
            { to: '/admin/warranty', label: 'Warranty', icon: AlertTriangle, desc: '2 claims pending', accent: 'bg-amber-500/15 text-amber-600' },
            { to: '/admin/staff', label: 'Staff', icon: Users, desc: 'Team directory', accent: 'bg-sky-500/15 text-sky-600' },
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
