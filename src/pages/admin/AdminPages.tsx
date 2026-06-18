import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Upload, Send, Calendar, Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { PageHeader, StatCard } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VehicleThumb } from '@/components/ui/safe-image'
import {
  inventoryList,
  adminCustomers,
  adminLeads,
  serviceScheduleToday,
  adminWarrantyQueue,
  adminSupportQueue,
  notificationRules,
  broadcastCampaigns,
  customerSegments,
  slaConfigs,
  recallAdminList,
  vehicleSalesByModel,
  revenueChart,
  adminKpis,
} from '@/data/admin-dummy'
import { getBranchById } from '@/data/dummy'
import { formatCurrency, formatDateTime } from '@/lib/utils'
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

export function AdminInventoryPage() {
  const [search, setSearch] = useState('')

  const filtered = inventoryList.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" description="Publish, price, and manage vehicle listings">
        <Button className="gap-2" onClick={() => toast.success('Upload form opened (demo)')}>
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search VIN, model..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <Card key={v.id} className="overflow-hidden group hover:shadow-xl transition-all">
            <div className="aspect-[16/10] overflow-hidden">
              <VehicleThumb src={v.image} alt={v.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.vin}</p>
                </div>
                <Badge variant={v.status === 'available' ? 'success' : v.status === 'reserved' ? 'warning' : 'secondary'}>
                  {v.status}
                </Badge>
              </div>
              <p className="font-display text-lg font-bold">{formatCurrency(v.price)}</p>
              <p className="text-xs text-muted-foreground">{getBranchById(v.branch)?.name} · {v.color}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info('Edit listing (demo)')}>Edit</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success('Status updated')}>Availability</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AdminCustomersPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader title="Customer CRM" description="Profiles, segments, and ownership history">
        <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" /> Export</Button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {customerSegments.map((seg) => (
          <Card key={seg.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{seg.name}</p>
              <p className="font-display text-2xl font-bold mt-1">{seg.count.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{seg.criteria}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Vehicles</th>
                <th className="pb-3 pr-4">Segment</th>
                <th className="pb-3 pr-4">Total Spend</th>
                <th className="pb-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {adminCustomers
                .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                .map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs">{c.vehicles.join(', ')}</td>
                    <td className="py-3 pr-4"><Badge variant="outline">{c.segment}</Badge></td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(c.totalSpend)}</td>
                    <td className="py-3 text-xs text-muted-foreground">{formatDateTime(c.lastActive)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
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

export function AdminWarrantyPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Warranty & Recalls" description="Certificate issuance, claims workflow, recall management">
        <Button className="gap-2" onClick={() => toast.success('Recall campaign initiated (demo)')}>
          <Send className="h-4 w-4" /> Trigger Recall
        </Button>
      </PageHeader>

      <Tabs defaultValue="claims">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="claims">Claims Queue</TabsTrigger>
          <TabsTrigger value="recalls">Recalls</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-3 mt-4">
          {adminWarrantyQueue.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{c.claimType} — {c.vehicle}</p>
                  <p className="text-sm text-muted-foreground">{c.customerName}</p>
                  <p className="text-sm mt-1">{c.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge variant="warning" className="capitalize">{c.status.replace('_', ' ')}</Badge>
                  <Button size="sm" onClick={() => toast.success('Claim approved (demo)')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('Escalated (demo)')}>Escalate</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recalls" className="space-y-3 mt-4">
          {recallAdminList.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.referenceCode}</p>
                    <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                  </div>
                  <Badge variant={r.severity === 'critical' ? 'destructive' : 'warning'}>{r.severity}</Badge>
                </div>
                <div className="flex gap-4 mt-3 text-sm">
                  <span>Affected: <strong>{r.affectedCount}</strong></span>
                  <span>Notified: <strong>{r.notifiedCount}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Digital warranty issuance — generate certificates for sold vehicles</p>
              <Button className="mt-4" onClick={() => toast.success('Certificate generated (demo)')}>Issue Certificate</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Support Inbox" description="Unified tickets across all categories with SLA enforcement" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {adminSupportQueue.map((t) => (
            <Card key={t.id} className={t.slaStatus === 'at_risk' ? 'border-amber-500/40 bg-amber-500/5' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge>{t.category}</Badge>
                  <Badge variant="outline">{t.status.replace('_', ' ')}</Badge>
                  <Badge variant={t.priority === 'high' ? 'destructive' : 'secondary'}>{t.priority}</Badge>
                  {t.slaStatus === 'at_risk' && <Badge variant="warning">SLA at risk</Badge>}
                </div>
                <p className="font-semibold">{t.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.ticketNumber} · {t.customerName} · {t.assignedTo}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm">Reply</Button>
                  <Button size="sm" variant="outline">Assign</Button>
                  <Button size="sm" variant="outline">Resolve</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">SLA Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {slaConfigs.map((s) => (
              <div key={s.category} className="p-3 rounded-xl bg-muted/30">
                <p className="font-medium text-sm">{s.category}</p>
                <p className="text-xs text-muted-foreground">Response: {s.response} · Resolution: {s.resolution}</p>
                {s.breaches > 0 && <Badge variant="warning" className="mt-1 text-[10px]">{s.breaches} breaches</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notification Engine" description="Rules, broadcasts, and service reminder configuration">
        <Button className="gap-2" onClick={() => toast.success('Broadcast scheduled (demo)')}>
          <Send className="h-4 w-4" /> New Broadcast
        </Button>
      </PageHeader>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="broadcasts">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-3 mt-4">
          {notificationRules.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Trigger: {r.trigger} · Cadence: {r.cadence}</p>
                  <div className="flex gap-1 mt-2">
                    {r.channels.map((ch) => <Badge key={ch} variant="outline" className="text-[10px]">{ch}</Badge>)}
                  </div>
                </div>
                <Badge variant={r.active ? 'success' : 'secondary'}>{r.active ? 'Active' : 'Disabled'}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-3 mt-4">
          {broadcastCampaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.segment} · Reach: {c.reach.toLocaleString()}</p>
                </div>
                <Badge variant={c.status === 'sent' ? 'success' : 'warning'}>{c.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Business Intelligence" description="Sales, service, and customer analytics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Monthly Revenue" value={formatCurrency(adminKpis.totalRevenue)} trend={{ value: '+12.4%', positive: true }} />
        <StatCard label="New Customers" value={adminKpis.newCustomersMonth} trend={{ value: '+15.3%', positive: true }} />
        <StatCard label="Lead Conversion" value="17%" trend={{ value: '+2.1%', positive: true }} />
        <StatCard label="CSAT Score" value="4.7★" sub="Across all channels" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="font-display text-base">Revenue by Month (₦M)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="service" stroke="#6366f1" strokeWidth={2} name="Service" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-base">Sales by Model</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleSalesByModel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" />
                <YAxis dataKey="model" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="var(--color-primary)" name="Sold YTD" radius={4} />
                <Bar dataKey="available" fill="#6366f1" name="In Stock" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
