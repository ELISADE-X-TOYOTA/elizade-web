import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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
import { ApiError } from '@/lib/api'
import { getAnalyticsOverview, type AnalyticsOverview } from '@/lib/analytics-api'
import { useAdminPageTitle } from '@/lib/admin-page-titles'

export { AdminNotificationsPage } from './AdminNotificationsPage'
export { AdminLeadsPage } from './AdminLeadsPage'
export { AdminServiceOpsPage } from './AdminServiceOpsPage'

export function AdminAnalyticsPage() {
  const pageTitle = useAdminPageTitle()
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
      <PageHeader title={pageTitle} description="Live operational metrics from inventory, CRM, support, and warranty" />

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
