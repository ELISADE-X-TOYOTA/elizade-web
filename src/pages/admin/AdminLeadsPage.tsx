import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BarChart3,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Target,
  TrendingUp,
  UserCheck,
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { ApiError } from '@/lib/api'
import {
  addLeadNote,
  assignLead,
  createLead,
  getLead,
  getLeadPipeline,
  listLeads,
  markLeadLost,
  markLeadWon,
  updateLeadStatus,
  type LeadDetail,
  type LeadListItem,
  type LeadPipeline,
} from '@/lib/leads-api'
import { listSupportAssignees, type SupportAssignee } from '@/lib/support-api'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'
import { useAdminPageTitle } from '@/lib/admin-page-titles'
import type { LeadStatus } from '@/types'

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
] as const

const PIPELINE_STAGES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation']

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  new: 'outline',
  contacted: 'secondary',
  qualified: 'default',
  proposal: 'warning',
  negotiation: 'warning',
  won: 'success',
  lost: 'destructive',
}

const CHART_COLORS: Record<string, string> = {
  new: '#94a3b8',
  contacted: '#6366f1',
  qualified: '#8b5cf6',
  proposal: '#f59e0b',
  negotiation: '#f97316',
  won: '#22c55e',
  lost: '#ef4444',
}

function StatHighlight({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  sub?: string
  icon: typeof Target
  tone: string
}) {
  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold tabular-nums mt-0.5">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminLeadsPage() {
  const pageTitle = useAdminPageTitle()
  const [pipeline, setPipeline] = useState<LeadPipeline | null>(null)
  const [leads, setLeads] = useState<LeadListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [assignees, setAssignees] = useState<SupportAssignee[]>([])

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<LeadDetail | null>(null)
  const [noteBody, setNoteBody] = useState('')
  const [lostReason, setLostReason] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    source: 'Showroom walk-in',
    interestedModel: '',
    value: '',
    assignedAgentId: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pipeRes, listRes, assigneeRows] = await Promise.all([
        getLeadPipeline(),
        listLeads({ status: statusFilter, q: search.trim() || undefined, page: 1, size: 50 }),
        listSupportAssignees(),
      ])
      setPipeline(pipeRes)
      setLeads(listRes.items)
      setTotal(listRes.total)
      setAssignees(assigneeRows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    load()
  }, [load])

  const chartData = useMemo(
    () =>
      (pipeline?.byStatus ?? [])
        .filter((s) => s.status !== 'won' && s.status !== 'lost')
        .map((s) => ({
          status: s.status.replace('_', ' '),
          key: s.status,
          count: s.count,
          value: Number(s.value),
        })),
    [pipeline],
  )

  const openLead = async (lead: LeadListItem) => {
    setBusyId(lead.id)
    try {
      setSelected(await getLead(lead.id))
      setDrawerOpen(true)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load lead')
    } finally {
      setBusyId(null)
    }
  }

  const refreshSelected = async (id: string) => {
    const detail = await getLead(id)
    setSelected(detail)
    await load()
  }

  const handleCreate = async () => {
    if (!form.customerName.trim() || !form.phone.trim() || !form.interestedModel.trim()) {
      toast.error('Name, phone, and model are required')
      return
    }
    setBusyId('create')
    try {
      await createLead({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        source: form.source.trim(),
        interestedModel: form.interestedModel.trim(),
        value: form.value ? Number(form.value) : 0,
        assignedAgentId: form.assignedAgentId || undefined,
      })
      toast.success('Lead created')
      setCreateOpen(false)
      setForm({
        customerName: '',
        phone: '',
        email: '',
        source: 'Showroom walk-in',
        interestedModel: '',
        value: '',
        assignedAgentId: '',
      })
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create lead')
    } finally {
      setBusyId(null)
    }
  }

  const advanceStatus = async (lead: LeadDetail, next: LeadStatus) => {
    setBusyId(lead.id)
    try {
      await updateLeadStatus(lead.id, { status: next })
      toast.success(`Moved to ${next}`)
      await refreshSelected(lead.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status')
    } finally {
      setBusyId(null)
    }
  }

  const nextStage = (current: string): LeadStatus | null => {
    const idx = PIPELINE_STAGES.indexOf(current as LeadStatus)
    if (idx < 0 || idx >= PIPELINE_STAGES.length - 1) return null
    return PIPELINE_STAGES[idx + 1]
  }

  return (
    <div className="space-y-6">
      <PageHeader title={pageTitle} description="Track inquiries from first touch to purchase">
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/leads/breakdown">
            <Button variant="outline" className="gap-2 rounded-xl">
              <BarChart3 className="h-4 w-4" />
              Pipeline breakdown
            </Button>
          </Link>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Lead
          </Button>
        </div>
      </PageHeader>

      {loading && !pipeline ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading pipeline…
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatHighlight
              label="Active pipeline"
              value={pipeline?.totalLeads ?? 0}
              sub={`${total} shown · ${formatCurrency(Number(pipeline?.totalValue ?? 0))} total value`}
              icon={Users}
              tone="bg-violet-500/15 text-violet-600"
            />
            <StatHighlight
              label="Conversion rate"
              value={`${pipeline?.conversionRate ?? 0}%`}
              sub="Won vs closed (won + lost)"
              icon={TrendingUp}
              tone="bg-emerald-500/15 text-emerald-600"
            />
            <StatHighlight
              label="New this week"
              value={pipeline?.newThisWeek ?? 0}
              sub="Fresh inquiries"
              icon={Target}
              tone="bg-sky-500/15 text-sky-600"
            />
            <StatHighlight
              label="In negotiation"
              value={pipeline?.byStatus.find((s) => s.status === 'negotiation')?.count ?? 0}
              sub="Hot deals closing soon"
              icon={BarChart3}
              tone="bg-amber-500/15 text-amber-600"
            />
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Pipeline by stage</CardTitle>
              </CardHeader>
              <CardContent className="h-[260px]">
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-16 text-center">No pipeline data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="status" type="category" width={88} tick={{ fontSize: 11 }} className="capitalize" />
                      <Tooltip
                        formatter={(value, _name, item) => [
                          `${value} leads · ${formatCurrency(item.payload.value)}`,
                          'Pipeline',
                        ]}
                      />
                      <Bar dataKey="count" radius={4} barSize={18}>
                        {chartData.map((row) => (
                          <Cell key={row.key} fill={CHART_COLORS[row.key] ?? 'var(--color-primary)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Outcome split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['won', 'lost'].map((key) => {
                  const row = pipeline?.byStatus.find((s) => s.status === key)
                  const pct =
                    pipeline && pipeline.totalLeads > 0
                      ? Math.round(((row?.count ?? 0) / pipeline.totalLeads) * 100)
                      : 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1 capitalize">
                        <span className="font-medium">{key}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {row?.count ?? 0} · {formatCurrency(Number(row?.value ?? 0))}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', key === 'won' ? 'bg-emerald-500' : 'bg-red-400')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, phone, email, model…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={statusFilter === f.key ? 'default' : 'outline'}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {leads.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground text-sm">
              No leads match this filter
            </CardContent>
          </Card>
        ) : (
          leads.map((lead) => (
            <Card
              key={lead.id}
              className="border-border/80 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => openLead(lead)}
            >
              <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{lead.customerName}</p>
                    <Badge variant={STATUS_VARIANT[lead.status] ?? 'outline'} className="capitalize">
                      {lead.status}
                    </Badge>
                    <Badge variant="outline">{lead.source}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lead.interestedModel} · {lead.phone}
                    {lead.assignedAgent
                      ? ` · ${lead.assignedAgent.firstName} ${lead.assignedAgent.lastName}`
                      : ' · Unassigned'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-display text-lg font-bold tabular-nums">{formatCurrency(Number(lead.value))}</p>
                  {busyId === lead.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.customerName ?? 'Lead detail'}
        description={selected ? `${selected.interestedModel} · ${selected.source}` : undefined}
        width="lg"
      >
        {selected && (
          <>
            <DrawerSection title="Overview">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant={STATUS_VARIANT[selected.status] ?? 'outline'} className="capitalize mt-1">
                    {selected.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Value</p>
                  <p className="font-bold">{formatCurrency(Number(selected.value))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p>{selected.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p>{selected.email ?? '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Updated</p>
                  <p>{formatDateTime(selected.updatedAt)}</p>
                </div>
              </div>
            </DrawerSection>

            {!['won', 'lost'].includes(selected.status) && (
              <DrawerSection title="Pipeline actions">
                <div className="flex flex-wrap gap-2">
                  {nextStage(selected.status) && (
                    <Button
                      size="sm"
                      disabled={busyId === selected.id}
                      onClick={() => advanceStatus(selected, nextStage(selected.status)!)}
                    >
                      Advance to {nextStage(selected.status)}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-600"
                    disabled={busyId === selected.id}
                    onClick={async () => {
                      setBusyId(selected.id)
                      try {
                        await markLeadWon(selected.id)
                        toast.success('Marked as won')
                        await refreshSelected(selected.id)
                      } catch (err) {
                        toast.error(err instanceof ApiError ? err.message : 'Failed')
                      } finally {
                        setBusyId(null)
                      }
                    }}
                  >
                    Mark won
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="lost-reason">Lost reason</Label>
                  <Input
                    id="lost-reason"
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    placeholder="Required to mark lost"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busyId === selected.id || !lostReason.trim()}
                    onClick={async () => {
                      setBusyId(selected.id)
                      try {
                        await markLeadLost(selected.id, { lostReason: lostReason.trim() })
                        toast.success('Marked as lost')
                        setLostReason('')
                        await refreshSelected(selected.id)
                      } catch (err) {
                        toast.error(err instanceof ApiError ? err.message : 'Failed')
                      } finally {
                        setBusyId(null)
                      }
                    }}
                  >
                    Mark lost
                  </Button>
                </div>
              </DrawerSection>
            )}

            <DrawerSection title="Assign agent">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selected.assignedAgent?.id ?? ''}
                onChange={async (e) => {
                  if (!e.target.value) return
                  setBusyId(selected.id)
                  try {
                    await assignLead(selected.id, e.target.value)
                    toast.success('Agent assigned')
                    await refreshSelected(selected.id)
                  } catch (err) {
                    toast.error(err instanceof ApiError ? err.message : 'Failed to assign')
                  } finally {
                    setBusyId(null)
                  }
                }}
              >
                <option value="">Select agent…</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </DrawerSection>

            <DrawerSection title="Activity">
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {selected.activity.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No notes yet</p>
                ) : (
                  selected.activity.map((n) => (
                    <div key={n.id} className="rounded-lg border border-border/60 p-3 text-sm">
                      <p className="text-xs text-muted-foreground mb-1">
                        {n.authorName} · {formatDateTime(n.createdAt)}
                      </p>
                      <p>{n.body}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add follow-up note…"
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={!noteBody.trim() || busyId === selected.id}
                  onClick={async () => {
                    setBusyId(selected.id)
                    try {
                      await addLeadNote(selected.id, noteBody.trim())
                      setNoteBody('')
                      toast.success('Note added')
                      await refreshSelected(selected.id)
                    } catch (err) {
                      toast.error(err instanceof ApiError ? err.message : 'Failed to add note')
                    } finally {
                      setBusyId(null)
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </DrawerSection>
          </>
        )}
      </Drawer>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New lead" description="Manual entry for walk-in or phone inquiry" width="lg">
        <DrawerSection title="Contact">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Customer name</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
          </div>
        </DrawerSection>
        <DrawerSection title="Deal">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Interested model</Label>
              <Input value={form.interestedModel} onChange={(e) => setForm({ ...form, interestedModel: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Source</Label>
                <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Est. value (₦)</Label>
                <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Assign to</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.assignedAgentId}
                onChange={(e) => setForm({ ...form, assignedAgentId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DrawerSection>
        <Button className="w-full gap-2" disabled={busyId === 'create'} onClick={handleCreate}>
          {busyId === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
          Create lead
        </Button>
      </Drawer>
    </div>
  )
}
