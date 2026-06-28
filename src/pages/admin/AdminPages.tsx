import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Calendar, Loader2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader, StatCard } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  adminLeads,
  serviceScheduleToday,
} from '@/data/admin-dummy'
import { ApiError } from '@/lib/api'
import { getAnalyticsOverview, type AnalyticsOverview } from '@/lib/analytics-api'
import { formatCurrency } from '@/lib/utils'
import type { LeadStatus } from '@/types'

const leadStatusColor: Record<LeadStatus, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  new: 'outline',
  contacted: 'secondary',
  qualified: 'default',
  proposal: 'warning',
  negotiation: 'warning',
  won: 'success',
  lost: 'destructive',
}

export function AdminLeadsPage() {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? adminLeads : adminLeads.filter((l) => l.status === filter)

  return (
    <div className="space-y-6">
      <PageHeader title="Lead Pipeline" description="Track inquiries from first touch to purchase">
        <Button onClick={() => toast.success('Lead created (demo)')} className="gap-2"><Plus className="h-4 w-4" /> New Lead</Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {['all', 'new', 'qualified', 'proposal', 'negotiation', 'won'].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)} className="capitalize">
            {s === 'all' ? 'All' : s}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{lead.customerName}</p>
                  <Badge variant={leadStatusColor[lead.status]} className="capitalize">{lead.status}</Badge>
                  <Badge variant="outline">{lead.source}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{lead.interestedModel} · {lead.assignedAgent}</p>
                {lead.notes && <p className="text-xs text-muted-foreground mt-1">{lead.notes}</p>}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="font-display text-lg font-bold">{formatCurrency(lead.value)}</p>
                <Button size="sm" variant="outline" onClick={() => toast.info('Assign agent (demo)')}>Assign</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AdminServiceOpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Service Operations" description="Daily schedules, bay management, job transfers">
        <Button variant="outline" onClick={() => toast.info('Add manual history (demo)')}>Add History Record</Button>
      </PageHeader>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Today's Appointments" value={serviceScheduleToday.length} icon={Calendar} />
        <StatCard label="In Progress" value={serviceScheduleToday.filter((s) => s.status === 'in_progress').length} />
        <StatCard label="Awaiting Approval" value={serviceScheduleToday.filter((s) => s.status === 'awaiting_approval').length} />
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">Daily Schedule — All Branches</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-3 pr-3">Time</th>
                <th className="pb-3 pr-3">Customer</th>
                <th className="pb-3 pr-3">Vehicle</th>
                <th className="pb-3 pr-3">Type</th>
                <th className="pb-3 pr-3">Bay</th>
                <th className="pb-3 pr-3">Branch</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceScheduleToday.map((s) => (
                <tr key={s.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="py-3 pr-3 font-mono text-xs">{s.time}</td>
                  <td className="py-3 pr-3 font-medium">{s.customer}</td>
                  <td className="py-3 pr-3">{s.vehicle}</td>
                  <td className="py-3 pr-3">{s.type}</td>
                  <td className="py-3 pr-3">{s.bay}</td>
                  <td className="py-3 pr-3">{s.branch}</td>
                  <td className="py-3">
                    <Badge variant={s.status === 'awaiting_approval' ? 'warning' : 'outline'} className="capitalize text-[10px]">
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export { AdminNotificationsPage } from './AdminNotificationsPage'

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalyticsOverview()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const inventoryChart = (data?.inventoryByModel ?? []).map((row) => ({
    model: row.model,
    available: row.available,
    sold: row.sold,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Business Intelligence" description="Live operational metrics from inventory, CRM, support, and warranty" />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading analytics…
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Inventory available" value={data.inventoryAvailable} sub={`${data.inventoryReserved} reserved · ${data.inventorySold} sold`} />
            <StatCard label="Customers" value={data.customersTotal} sub={`${data.customersNew30d} new in 30 days`} />
            <StatCard label="Open tickets" value={data.openSupportTickets} sub={`${data.slaAtRiskTickets} SLA at risk`} />
            <StatCard label="Pending claims" value={data.pendingWarrantyClaims} sub={`${data.activeCertificates} active certificates`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Inventory by model</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" />
                    <YAxis dataKey="model" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="available" fill="var(--color-primary)" name="Available" radius={4} />
                    <Bar dataKey="sold" fill="#6366f1" name="Sold" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-base">Operations snapshot</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                    <p className="text-muted-foreground text-xs">Customers with vehicle</p>
                    <p className="text-2xl font-bold tabular-nums">{data.customersWithVehicle}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                    <p className="text-muted-foreground text-xs">Active recalls</p>
                    <p className="text-2xl font-bold tabular-nums">{data.activeRecalls}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                    <p className="text-muted-foreground text-xs">Campaigns sent</p>
                    <p className="text-2xl font-bold tabular-nums">{data.campaignsSent}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 bg-muted/20">
                    <p className="text-muted-foreground text-xs">Unread notifications</p>
                    <p className="text-2xl font-bold tabular-nums">{data.unreadNotificationsTotal}</p>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open tickets by category</p>
                  {data.supportByCategory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open tickets</p>
                  ) : (
                    data.supportByCategory.map((row) => (
                      <div key={row.name} className="flex justify-between text-sm capitalize">
                        <span>{row.name.replace('_', ' ')}</span>
                        <span className="font-bold tabular-nums">{row.count}</span>
                      </div>
                    ))
                  )}
                </div>
                {data.serviceToday != null && data.serviceCapacity != null && (
                  <p className="text-sm text-muted-foreground pt-2">
                    Service today: <strong>{data.serviceToday}/{data.serviceCapacity}</strong> bay slots
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
