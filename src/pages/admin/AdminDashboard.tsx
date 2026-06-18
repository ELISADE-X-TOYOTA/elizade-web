import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Wrench,
  HeadphonesIcon,
  Car,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/layout/PageHeader'
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
} from '@/data/admin-dummy'
import { formatCurrency } from '@/lib/utils'
import { AvatarImage } from '@/components/ui/safe-image'

export function AdminDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={`Good afternoon, Divine`}
        description="Elizade Connect operations overview — Wednesday, 17 June 2026"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Revenue (Jun)"
          value={formatCurrency(adminKpis.totalRevenue)}
          icon={TrendingUp}
          trend={{ value: `${adminKpis.revenueGrowth}% vs last month`, positive: true }}
        />
        <StatCard
          label="Active Leads"
          value={adminKpis.activeLeads}
          icon={Users}
          trend={{ value: `${adminKpis.leadsGrowth}% growth`, positive: true }}
        />
        <StatCard
          label="Service Today"
          value={`${adminKpis.serviceToday}/${adminKpis.serviceCapacity}`}
          sub="appointments booked"
          icon={Wrench}
        />
        <StatCard
          label="Open Tickets"
          value={adminKpis.openTickets}
          sub={`${adminKpis.slaAtRisk} at SLA risk`}
          icon={HeadphonesIcon}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-display">Revenue Trend (₦M)</CardTitle>
              <Badge variant="outline">Sales + Service</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }} />
                    <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fill="url(#salesGrad)" strokeWidth={2} name="Sales" />
                    <Area type="monotone" dataKey="service" stroke="#6366f1" fill="transparent" strokeWidth={2} name="Service" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base font-display">Lead Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadPipelineChart} dataKey="count" nameKey="stage" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {leadPipelineChart.map((entry) => (
                        <Cell key={entry.stage} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {leadPipelineChart.slice(0, 4).map((s) => (
                  <div key={s.stage} className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground">{s.stage}</span>
                    <span className="font-semibold ml-auto">{s.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Hot Leads</CardTitle>
              <Link to="/admin/leads"><Button variant="ghost" size="sm">View all</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {adminLeads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{lead.customerName}</p>
                    <p className="text-xs text-muted-foreground">{lead.interestedModel} · {lead.assignedAgent}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatCurrency(lead.value)}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{lead.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Today&apos;s Service Schedule</CardTitle>
              <Link to="/admin/service"><Button variant="ghost" size="sm">Full schedule</Button></Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {serviceScheduleToday.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs font-mono text-muted-foreground w-12">{s.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.customer}</p>
                    <p className="text-xs text-muted-foreground">{s.vehicle} · {s.bay} · {s.branch}</p>
                  </div>
                  <Badge variant={s.status === 'awaiting_approval' ? 'warning' : 'outline'} className="text-[10px] capitalize shrink-0">
                    {s.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">SLA Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              {adminSupportQueue.filter((t) => t.slaStatus === 'at_risk').map((t) => (
                <Link key={t.id} to="/admin/support" className="block p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.ticketNumber} · {t.assignedTo}</p>
                </Link>
              ))}
              {adminSupportQueue.filter((t) => t.slaStatus !== 'at_risk').length === 0 && (
                <p className="text-sm text-muted-foreground">No critical SLA breaches</p>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Agent Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-4">
                    <AvatarImage src={agent.avatar} name={agent.name} className="h-10 w-10" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.department}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div><p className="font-bold">{agent.leadsConverted}</p><p className="text-muted-foreground">Won</p></div>
                      <div><p className="font-bold">{agent.ticketsHandled}</p><p className="text-muted-foreground">Tickets</p></div>
                      <div><p className="font-bold">{agent.satisfaction}★</p><p className="text-muted-foreground">Rating</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/admin/inventory', label: 'Inventory', icon: Car, desc: `${adminKpis.inventoryAvailable} available` },
          { to: '/admin/customers', label: 'CRM', icon: Users, desc: `${adminKpis.newCustomersMonth} new this month` },
          { to: '/admin/warranty', label: 'Warranty', icon: AlertTriangle, desc: '2 claims pending' },
          { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp, desc: 'Full BI report' },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <item.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
