import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Clock,
  HeadphonesIcon,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { Switch } from '@/components/ui/switch'
import { ApiError } from '@/lib/api'
import { listCustomers, type CustomerListItem } from '@/lib/customers-api'
import {
  assignTicket,
  createSupportTicket,
  getSupportSummary,
  getSupportTicket,
  listSlaConfigs,
  listSupportAssignees,
  listSupportTickets,
  replyToTicket,
  resolveTicket,
  updateSlaConfig,
  type SlaConfig,
  type SupportAssignee,
  type SupportSummary,
  type SupportTicketDetail,
  type SupportTicketListItem,
} from '@/lib/support-api'
import { cn, formatDateTime } from '@/lib/utils'

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'waiting_customer', label: 'Waiting' },
  { key: 'resolved', label: 'Resolved' },
] as const

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All categories' },
  { key: 'service', label: 'Service' },
  { key: 'sales', label: 'Sales' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'billing', label: 'Billing' },
  { key: 'general', label: 'General' },
] as const

const PRIORITY_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'warning',
  urgent: 'destructive',
}

function StatHighlight({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  sub?: string
  icon: typeof Inbox
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
          <p className="font-display text-2xl font-bold tabular-nums mt-0.5">{value.toLocaleString()}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminSupportPage() {
  const [summary, setSummary] = useState<SupportSummary | null>(null)
  const [tickets, setTickets] = useState<SupportTicketListItem[]>([])
  const [ticketsTotal, setTicketsTotal] = useState(0)
  const [slaConfigs, setSlaConfigs] = useState<SlaConfig[]>([])
  const [assignees, setAssignees] = useState<SupportAssignee[]>([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [slaFilter, setSlaFilter] = useState(false)
  const [search, setSearch] = useState('')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<SupportTicketDetail | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [busy, setBusy] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOptions, setCustomerOptions] = useState<CustomerListItem[]>([])
  const [ticketForm, setTicketForm] = useState({
    customerId: '',
    category: 'service',
    subject: '',
    priority: 'medium',
    body: '',
  })
  const [creating, setCreating] = useState(false)

  const [editingSlaId, setEditingSlaId] = useState<string | null>(null)
  const [slaDraft, setSlaDraft] = useState({ responseHours: 0, resolutionHours: 0, isActive: true })
  const [savingSla, setSavingSla] = useState(false)

  const loadQueue = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, ticketRes, slaRows, assigneeRows] = await Promise.all([
        getSupportSummary(),
        listSupportTickets({
          status: statusFilter,
          category: categoryFilter,
          slaStatus: slaFilter ? 'at_risk' : 'all',
          q: search.trim() || undefined,
          size: 50,
        }),
        listSlaConfigs(),
        listSupportAssignees(),
      ])
      setSummary(summaryRes)
      setTickets(ticketRes.items)
      setTicketsTotal(ticketRes.total)
      setSlaConfigs(slaRows)
      setAssignees(assigneeRows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load support queue')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, categoryFilter, slaFilter, search])

  useEffect(() => {
    const t = window.setTimeout(loadQueue, 300)
    return () => window.clearTimeout(t)
  }, [loadQueue])

  useEffect(() => {
    if (!createOpen) return
    const t = window.setTimeout(async () => {
      try {
        const res = await listCustomers({ q: customerSearch.trim() || undefined, size: 20 })
        setCustomerOptions(res.items)
      } catch {
        /* ignore */
      }
    }, 300)
    return () => window.clearTimeout(t)
  }, [createOpen, customerSearch])

  const openTicket = async (ticket: SupportTicketListItem) => {
    setDrawerOpen(true)
    setSelected(null)
    setReplyBody('')
    try {
      setSelected(await getSupportTicket(ticket.id))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load ticket')
      setDrawerOpen(false)
    }
  }

  const handleReply = async () => {
    if (!selected || !replyBody.trim()) return
    setBusy(true)
    try {
      const res = await replyToTicket(selected.id, replyBody.trim())
      setSelected(res.ticket)
      setReplyBody('')
      toast.success('Reply sent')
      await loadQueue()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to send reply')
    } finally {
      setBusy(false)
    }
  }

  const handleResolve = async () => {
    if (!selected) return
    setBusy(true)
    try {
      setSelected(await resolveTicket(selected.id))
      toast.success('Ticket resolved')
      await loadQueue()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to resolve ticket')
    } finally {
      setBusy(false)
    }
  }

  const handleAssign = async (assignedToId: string) => {
    if (!selected) return
    setBusy(true)
    try {
      setSelected(await assignTicket(selected.id, assignedToId))
      toast.success('Ticket assigned')
      await loadQueue()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to assign ticket')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!ticketForm.customerId || !ticketForm.subject.trim()) {
      toast.error('Select a customer and enter a subject')
      return
    }
    setCreating(true)
    try {
      const created = await createSupportTicket({
        customerId: ticketForm.customerId,
        category: ticketForm.category,
        subject: ticketForm.subject.trim(),
        priority: ticketForm.priority,
        body: ticketForm.body.trim() || undefined,
      })
      toast.success('Ticket created')
      setCreateOpen(false)
      setTicketForm({ customerId: '', category: 'service', subject: '', priority: 'medium', body: '' })
      setCustomerSearch('')
      await loadQueue()
      setSelected(created)
      setDrawerOpen(true)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  const startEditSla = (sla: SlaConfig) => {
    setEditingSlaId(sla.id)
    setSlaDraft({
      responseHours: sla.responseHours,
      resolutionHours: sla.resolutionHours,
      isActive: sla.isActive,
    })
  }

  const handleSaveSla = async () => {
    if (!editingSlaId) return
    setSavingSla(true)
    try {
      await updateSlaConfig(editingSlaId, slaDraft)
      toast.success('SLA updated')
      setEditingSlaId(null)
      await loadQueue()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update SLA')
    } finally {
      setSavingSla(false)
    }
  }

  const atRiskCount = useMemo(
    () => tickets.filter((t) => t.slaStatus === 'at_risk').length,
    [tickets],
  )

  return (
    <div className="space-y-8">
      <PageHeader title="Support Inbox" description="Unified tickets across all categories with SLA enforcement">
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New ticket
        </Button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatHighlight
          label="Open tickets"
          value={summary?.openTickets ?? 0}
          sub={`${summary?.unassignedTickets ?? 0} unassigned`}
          icon={Inbox}
          tone="bg-indigo-500/12 text-indigo-600 dark:text-indigo-400"
        />
        <StatHighlight
          label="SLA at risk"
          value={summary?.atRiskTickets ?? 0}
          sub={`${atRiskCount} in current view`}
          icon={AlertTriangle}
          tone="bg-amber-500/12 text-amber-600 dark:text-amber-400"
        />
        <StatHighlight
          label="Resolved today"
          value={summary?.resolvedToday ?? 0}
          sub="Closed since midnight"
          icon={UserCheck}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatHighlight
          label="Queue total"
          value={ticketsTotal}
          sub="Matching filters"
          icon={HeadphonesIcon}
          tone="bg-sky-500/12 text-sky-600 dark:text-sky-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search ticket number, subject, or customer…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {CATEGORY_FILTERS.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant={slaFilter ? 'default' : 'outline'}
                  className="gap-1.5"
                  onClick={() => setSlaFilter((v) => !v)}
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> SLA at risk only
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading inbox…
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                No tickets match your filters
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Ticket</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium">Assignee</th>
                      <th className="px-4 py-3 font-medium">SLA</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr
                        key={t.id}
                        className={cn(
                          'border-b border-border/40 hover:bg-muted/20 cursor-pointer transition-colors',
                          t.slaStatus === 'at_risk' && 'bg-amber-500/5',
                        )}
                        onClick={() => openTicket(t)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.ticketNumber} · {t.customerName}
                          </p>
                          <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                            {t.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 capitalize">{t.category}</td>
                        <td className="px-4 py-3">
                          <Badge variant={PRIORITY_VARIANT[t.priority] ?? 'outline'} className="capitalize">
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{t.assignedToName ?? '—'}</td>
                        <td className="px-4 py-3">
                          {t.slaStatus === 'at_risk' ? (
                            <Badge variant="warning">At risk</Badge>
                          ) : (
                            <Badge variant="success">OK</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(t.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Clock className="h-4 w-4" /> SLA configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {slaConfigs.map((s) => (
              <div key={s.id} className="rounded-xl border border-border/60 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm capitalize">{s.category}</p>
                  {editingSlaId !== s.id && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => startEditSla(s)}>
                      Edit
                    </Button>
                  )}
                </div>
                {editingSlaId === s.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px]">Response (h)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={slaDraft.responseHours}
                          onChange={(e) => setSlaDraft((d) => ({ ...d, responseHours: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Resolution (h)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={slaDraft.resolutionHours}
                          onChange={(e) => setSlaDraft((d) => ({ ...d, resolutionHours: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Active</Label>
                      <Switch
                        checked={slaDraft.isActive}
                        onCheckedChange={(v) => setSlaDraft((d) => ({ ...d, isActive: v }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingSlaId(null)}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveSla} disabled={savingSla}>
                        {savingSla ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Response: {s.responseHours}h · Resolution: {s.resolutionHours}h
                    {!s.isActive && ' · Inactive'}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? selected.ticketNumber : 'Ticket'}
        description={selected?.subject}
        width="lg"
        footer={
          selected && selected.status !== 'resolved' && selected.status !== 'closed' ? (
            <div className="flex gap-2 justify-end w-full">
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
              <Button variant="outline" onClick={handleResolve} disabled={busy}>Resolve</Button>
              <Button onClick={handleReply} disabled={busy || !replyBody.trim()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reply'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
          )
        }
      >
        {!selected ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge className="capitalize">{selected.category}</Badge>
              <Badge variant="outline" className="capitalize">{selected.status.replace('_', ' ')}</Badge>
              <Badge variant={PRIORITY_VARIANT[selected.priority] ?? 'outline'} className="capitalize">
                {selected.priority}
              </Badge>
              {selected.slaStatus === 'at_risk' && <Badge variant="warning">SLA at risk</Badge>}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-muted-foreground">First response due</p>
                <p className="font-medium mt-0.5">{formatDateTime(selected.firstResponseDue)}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-muted-foreground">Resolution due</p>
                <p className="font-medium mt-0.5">{formatDateTime(selected.resolutionDue)}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Customer: {selected.customerName}</p>

            <div className="space-y-1.5">
              <Label className="text-xs">Assign to</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={selected.assignedToId ?? ''}
                onChange={(e) => e.target.value && handleAssign(e.target.value)}
                disabled={busy}
              >
                <option value="">Unassigned</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <DrawerSection title="Conversation">
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {selected.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                ) : (
                  selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'rounded-xl border p-3',
                        m.senderType === 'staff'
                          ? 'border-primary/20 bg-primary/5 ml-4'
                          : 'border-border/60 bg-muted/20 mr-4',
                      )}
                    >
                      <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {m.senderName ?? m.senderType} · {formatDateTime(m.createdAt)}
                      </p>
                      <p className="text-sm">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
            </DrawerSection>

            {selected.status !== 'resolved' && selected.status !== 'closed' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Reply</Label>
                <textarea
                  className="w-full min-h-[96px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write your response to the customer…"
                />
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create support ticket"
        description="Open a ticket on behalf of a customer"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create ticket'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Search customer</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Name, phone, or email…"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Customer</Label>
            <select
              className="w-full min-h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={ticketForm.customerId}
              onChange={(e) => setTicketForm((f) => ({ ...f, customerId: e.target.value }))}
            >
              <option value="">Select customer…</option>
              {customerOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} · {c.phone}
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={ticketForm.category}
                onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="service">Service</option>
                <option value="sales">Sales</option>
                <option value="warranty">Warranty</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={ticketForm.priority}
                onChange={(e) => setTicketForm((f) => ({ ...f, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Input
              value={ticketForm.subject}
              onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Brief summary of the issue"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Initial message (optional)</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={ticketForm.body}
              onChange={(e) => setTicketForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Details captured during phone call or walk-in…"
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
