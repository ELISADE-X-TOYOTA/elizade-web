import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  BarChart3,
  Download,
  Loader2,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiError } from '@/lib/api'
import {
  fetchAllLeads,
  getLeadPipeline,
  type LeadListItem,
  type LeadPipeline,
} from '@/lib/leads-api'
import { exportPipelineBreakdown, STAGE_LABELS, STAGE_ORDER } from '@/lib/pipeline-export'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'

const CHART_COLORS: Record<string, string> = {
  new: '#6366f1',
  contacted: '#8b5cf6',
  qualified: '#a855f7',
  proposal: '#d946ef',
  negotiation: '#ec4899',
  won: '#10b981',
  lost: '#ef4444',
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  sub?: string
  icon: typeof Users
  tone: string
}) {
  return (
    <Card className="border-border/80">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold tabular-nums mt-0.5">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminPipelineBreakdownPage() {
  const [pipeline, setPipeline] = useState<LeadPipeline | null>(null)
  const [leads, setLeads] = useState<LeadListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<string>('all')

  useEffect(() => {
    Promise.all([getLeadPipeline(), fetchAllLeads()])
      .then(([pipe, allLeads]) => {
        setPipeline(pipe)
        setLeads(allLeads)
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load pipeline breakdown'))
      .finally(() => setLoading(false))
  }, [])

  const stageRows = useMemo(() => {
    if (!pipeline) return []
    const total = pipeline.totalLeads || 1
    return STAGE_ORDER.map((status) => {
      const row = pipeline.byStatus.find((s) => s.status === status)
      const count = row?.count ?? 0
      const value = Number(row?.value ?? 0)
      return {
        status,
        label: STAGE_LABELS[status] ?? status,
        count,
        value,
        avg: count > 0 ? Math.round(value / count) : 0,
        share: Math.round((count / total) * 100),
      }
    })
  }, [pipeline])

  const chartData = stageRows.filter((row) => row.count > 0)

  const sourceRows = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>()
    for (const lead of leads) {
      const key = lead.source || 'unknown'
      const prev = map.get(key) ?? { count: 0, value: 0 }
      map.set(key, { count: prev.count + 1, value: prev.value + Number(lead.value) })
    }
    return [...map.entries()]
      .map(([source, stats]) => ({ source, ...stats }))
      .sort((a, b) => b.count - a.count)
  }, [leads])

  const agentRows = useMemo(() => {
    const map = new Map<string, { name: string; count: number; value: number; won: number }>()
    for (const lead of leads) {
      const key = lead.assignedAgent?.id ?? 'unassigned'
      const name = lead.assignedAgent
        ? `${lead.assignedAgent.firstName} ${lead.assignedAgent.lastName}`.trim()
        : 'Unassigned'
      const prev = map.get(key) ?? { name, count: 0, value: 0, won: 0 }
      map.set(key, {
        name,
        count: prev.count + 1,
        value: prev.value + Number(lead.value),
        won: prev.won + (lead.status === 'won' ? 1 : 0),
      })
    }
    return [...map.values()].sort((a, b) => b.count - a.count)
  }, [leads])

  const filteredLeads = useMemo(() => {
    if (activeStage === 'all') return leads
    return leads.filter((lead) => lead.status === activeStage)
  }, [leads, activeStage])

  const handleExport = () => {
    if (!pipeline) return
    exportPipelineBreakdown(pipeline, leads)
    toast.success('Pipeline breakdown exported')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading pipeline breakdown…
      </div>
    )
  }

  if (!pipeline) {
    return <p className="py-20 text-center text-muted-foreground">Unable to load pipeline data.</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline breakdown"
        description="Detailed stage analysis, source mix, agent ownership, and full lead export"
      >
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/dashboard">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button className="gap-2 rounded-xl" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export breakdown
          </Button>
        </div>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total pipeline value"
          value={formatCurrency(Number(pipeline.totalValue))}
          sub={`${pipeline.totalLeads} leads in CRM`}
          icon={Target}
          tone="bg-violet-500/15 text-violet-600"
        />
        <StatCard
          label="Conversion rate"
          value={`${pipeline.conversionRate}%`}
          sub="Won vs closed (won + lost)"
          icon={TrendingUp}
          tone="bg-emerald-500/15 text-emerald-600"
        />
        <StatCard
          label="New this week"
          value={pipeline.newThisWeek}
          sub="Fresh inquiries"
          icon={BarChart3}
          tone="bg-sky-500/15 text-sky-600"
        />
        <StatCard
          label="Active deals"
          value={stageRows.filter((r) => !['won', 'lost'].includes(r.status)).reduce((s, r) => s + r.count, 0)}
          sub="Excluding won/lost"
          icon={Users}
          tone="bg-amber-500/15 text-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Stage volume & value</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No pipeline data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" width={96} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, _name, item) => [
                      `${value} leads · ${formatCurrency(item.payload.value)}`,
                      'Stage',
                    ]}
                  />
                  <Bar dataKey="count" radius={4} barSize={20}>
                    {chartData.map((row) => (
                      <Cell key={row.status} fill={CHART_COLORS[row.status] ?? '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Stage detail table</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Stage</th>
                  <th className="py-2 pr-3 font-semibold">Count</th>
                  <th className="py-2 pr-3 font-semibold">Value</th>
                  <th className="py-2 pr-3 font-semibold">Avg deal</th>
                  <th className="py-2 font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {stageRows.map((row) => (
                  <tr key={row.status} className="border-b border-border/50">
                    <td className="py-2.5 pr-3 font-medium">{row.label}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{row.count}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{formatCurrency(row.value)}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{formatCurrency(row.avg)}</td>
                    <td className="py-2.5 tabular-nums text-muted-foreground">{row.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">By lead source</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Source</th>
                  <th className="py-2 pr-3 font-semibold">Leads</th>
                  <th className="py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {sourceRows.map((row) => (
                  <tr key={row.source} className="border-b border-border/50">
                    <td className="py-2.5 pr-3 capitalize">{row.source}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{row.count}</td>
                    <td className="py-2.5 tabular-nums">{formatCurrency(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">By assigned agent</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Agent</th>
                  <th className="py-2 pr-3 font-semibold">Leads</th>
                  <th className="py-2 pr-3 font-semibold">Won</th>
                  <th className="py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {agentRows.map((row) => (
                  <tr key={row.name} className="border-b border-border/50">
                    <td className="py-2.5 pr-3 font-medium">{row.name}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{row.count}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{row.won}</td>
                    <td className="py-2.5 tabular-nums">{formatCurrency(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="font-display text-base">Lead register</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'} shown
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={activeStage === 'all' ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setActiveStage('all')}
              >
                All
              </Button>
              {STAGE_ORDER.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={activeStage === status ? 'default' : 'outline'}
                  className="rounded-full capitalize"
                  onClick={() => setActiveStage(status)}
                >
                  {STAGE_LABELS[status]}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No leads in this stage.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Model</th>
                  <th className="px-5 py-3 font-semibold">Stage</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Value</th>
                  <th className="px-5 py-3 font-semibold">Agent</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <p className="font-medium">{lead.customerName}</p>
                      <p className="text-xs text-muted-foreground">{lead.email ?? lead.phone}</p>
                    </td>
                    <td className="px-5 py-3">{lead.interestedModel}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className="capitalize">
                        {STAGE_LABELS[lead.status] ?? lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 capitalize text-muted-foreground">{lead.source}</td>
                    <td className="px-5 py-3 tabular-nums font-medium">{formatCurrency(Number(lead.value))}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {lead.assignedAgent
                        ? `${lead.assignedAgent.firstName} ${lead.assignedAgent.lastName}`.trim()
                        : 'Unassigned'}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(lead.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
