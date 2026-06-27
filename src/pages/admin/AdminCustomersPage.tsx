import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Activity,
  BadgeCheck,
  Car,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarImage } from '@/components/ui/safe-image'
import { ApiError } from '@/lib/api'
import {
  createCustomerNote,
  deleteCustomerNote,
  getCustomerNotes,
  getCustomerProfile,
  getCustomerSegments,
  getCustomerVehicles,
  listCustomers,
  updateCustomerNote,
  type CustomerListItem,
  type CustomerNote,
  type CustomerProfile,
  type CustomerSegmentFilter,
  type CustomerSegments,
  type CustomerVehicle,
} from '@/lib/customers-api'
import { cn, formatDateTime } from '@/lib/utils'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#64748b']

const FILTER_SEGMENTS: {
  key: CustomerSegmentFilter
  label: string
}[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'verified', label: 'Verified' },
  { key: 'unverified', label: 'Unverified' },
  { key: 'has_vehicle', label: 'Has vehicle' },
  { key: 'no_vehicle', label: 'No vehicle' },
]

function customerName(c: CustomerListItem) {
  return `${c.firstName} ${c.lastName}`.trim()
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-foreground">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
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
  icon: typeof Users
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

export function AdminCustomersPage() {
  const [segments, setSegments] = useState<CustomerSegments | null>(null)
  const [segment, setSegment] = useState<CustomerSegmentFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [segmentsLoading, setSegmentsLoading] = useState(true)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<CustomerListItem | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([])
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [noteBody, setNoteBody] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingNote, setSavingNote] = useState(false)

  const loadSegments = useCallback(async () => {
    setSegmentsLoading(true)
    try {
      setSegments(await getCustomerSegments())
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load segments')
    } finally {
      setSegmentsLoading(false)
    }
  }, [])

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listCustomers({
        q: search.trim() || undefined,
        segment,
        page,
        size: 15,
      })
      setCustomers(res.items)
      setTotal(res.total)
      setPages(res.pages)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [search, segment, page])

  useEffect(() => {
    loadSegments()
  }, [loadSegments])

  useEffect(() => {
    const t = window.setTimeout(loadCustomers, 300)
    return () => window.clearTimeout(t)
  }, [loadCustomers])

  const activityData = useMemo(() => {
    if (!segments) return []
    return [
      { name: 'Active', value: segments.active, color: '#10b981' },
      { name: 'Inactive', value: segments.inactive, color: '#64748b' },
    ].filter((d) => d.value > 0)
  }, [segments])

  const ownershipData = useMemo(() => {
    if (!segments) return []
    return [
      { name: 'With vehicle', value: segments.hasVehicle, color: '#6366f1' },
      { name: 'No vehicle', value: segments.noVehicle, color: '#94a3b8' },
    ].filter((d) => d.value > 0)
  }, [segments])

  const engagementData = useMemo(() => {
    if (!segments) return []
    return [
      { name: 'Verified', value: segments.verified },
      { name: 'Unverified', value: segments.unverified },
      { name: 'New (30d)', value: segments.new },
      { name: 'Premium', value: segments.premium },
      { name: 'At risk', value: segments.atRisk },
    ]
  }, [segments])

  const verificationData = useMemo(() => {
    if (!segments) return []
    return [
      { name: 'Verified', value: segments.verified, color: '#0ea5e9' },
      { name: 'Unverified', value: segments.unverified, color: '#f59e0b' },
    ].filter((d) => d.value > 0)
  }, [segments])

  const openCustomer = (customer: CustomerListItem) => {
    setSelected(customer)
    setProfile(null)
    setVehicles(customer.ownedVehicles.length ? [] : [])
    setNotes(customer.crmNotes.map((n) => ({
      id: n.id,
      customerId: customer.id,
      authorId: '',
      authorName: n.authorName,
      body: n.body,
      createdAt: n.createdAt,
      updatedAt: n.createdAt,
    })))
    setDrawerOpen(true)
    setDetailLoading(true)
    setNoteBody('')
    setEditingNoteId(null)

    Promise.all([
      getCustomerProfile(customer.id),
      getCustomerVehicles(customer.id),
      getCustomerNotes(customer.id),
    ])
      .then(([p, v, n]) => {
        setProfile(p)
        setVehicles(v.vehicles)
        setNotes(n)
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load profile')
        setDrawerOpen(false)
      })
      .finally(() => setDetailLoading(false))
  }

  const handleSaveNote = async () => {
    if (!selected || !noteBody.trim()) return
    setSavingNote(true)
    try {
      if (editingNoteId) {
        const updated = await updateCustomerNote(selected.id, editingNoteId, noteBody.trim())
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
        toast.success('Note updated')
      } else {
        const created = await createCustomerNote(selected.id, noteBody.trim())
        setNotes((prev) => [created, ...prev])
        toast.success('Note added')
      }
      setNoteBody('')
      setEditingNoteId(null)
      loadCustomers()
      loadSegments()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save note')
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!selected || !window.confirm('Delete this note?')) return
    try {
      await deleteCustomerNote(selected.id, noteId)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      toast.success('Note deleted')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete note')
    }
  }

  const selectedName = selected ? customerName(selected) : ''

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer CRM"
        description="Segment intelligence, ownership history, and relationship notes"
      />

      {/* KPI row */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatHighlight
          label="Total customers"
          value={segments?.total ?? 0}
          sub="Registered on Connect"
          icon={Users}
          tone="bg-indigo-500/12 text-indigo-600 dark:text-indigo-400"
        />
        <StatHighlight
          label="Active accounts"
          value={segments?.active ?? 0}
          sub={`${segments?.inactive ?? 0} inactive`}
          icon={UserCheck}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatHighlight
          label="Vehicle owners"
          value={segments?.hasVehicle ?? 0}
          sub={`${segments?.noVehicle ?? 0} prospects without vehicle`}
          icon={Car}
          tone="bg-violet-500/12 text-violet-600 dark:text-violet-400"
        />
        <StatHighlight
          label="Needs attention"
          value={segments?.atRisk ?? 0}
          sub={`${segments?.new ?? 0} new in last 30 days`}
          icon={ShieldAlert}
          tone="bg-amber-500/12 text-amber-700 dark:text-amber-400"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Account activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentsLoading ? (
              <div className="flex h-[220px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activityData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No activity data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {activityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-violet-500" />
              Vehicle ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentsLoading ? (
              <div className="flex h-[220px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ownershipData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No ownership data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ownershipData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {ownershipData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-500" />
              Engagement segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentsLoading ? (
              <div className="flex h-[220px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={engagementData} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                    {engagementData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification strip */}
      {!segmentsLoading && segments && (
        <Card className="border-border/80 bg-gradient-to-r from-card via-card to-secondary/20">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Verification status
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{segments.verified}</span> verified ·{' '}
                <span className="font-semibold text-foreground">{segments.unverified}</span> pending ·{' '}
                <span className="font-semibold text-foreground">{segments.premium}</span> premium tier
              </p>
            </div>
            <div className="h-16 w-full md:w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={28}
                    dataKey="value"
                    nameKey="name"
                  >
                    {verificationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segment filters */}
      <div className="flex flex-wrap gap-2">
        {FILTER_SEGMENTS.map((seg) => (
          <button
            key={seg.key}
            type="button"
            onClick={() => {
              setSegment(seg.key)
              setPage(1)
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              segment === seg.key
                ? 'border-foreground bg-foreground text-background shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
            )}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Customer table */}
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-display">Customer directory</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? 'Loading…' : `${total} customer${total === 1 ? '' : 's'} matching filter`}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10 h-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No customers match this filter.</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/10 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Location</th>
                    <th className="px-5 py-3 font-semibold">Vehicles</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Notes</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer group transition-colors"
                      onClick={() => openCustomer(c)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarImage name={customerName(c)} className="h-9 w-9 text-xs" />
                          <div>
                            <p className="font-medium">{customerName(c)}</p>
                            <p className="text-xs text-muted-foreground">{c.email ?? c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {c.city}, {c.state}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {c.ownedVehicles.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-1 text-violet-700 dark:text-violet-300">
                            <Car className="h-3 w-3" />
                            {c.ownedVehicles.map((v) => `${v.year} ${v.model}`).join(', ')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={c.isActive ? 'success' : 'secondary'}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {c.isVerified && (
                            <Badge variant="outline" className="gap-1">
                              <BadgeCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold">
                          {c.crmNotes.length}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pages > 1 && (
                <div className="flex justify-center gap-2 py-5 border-t border-border/60">
                  <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    Page {page} of {pages}
                  </span>
                  <Button variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Drawer
        open={drawerOpen && !!selected}
        onClose={() => setDrawerOpen(false)}
        width="xl"
        customHeader={
          selected && (
            <div className="relative overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-transparent to-emerald-500/15" />
              <div className="relative px-6 pb-5 -mt-10">
                <AvatarImage
                  src={selected.avatar ?? undefined}
                  name={selectedName}
                  className="h-16 w-16 text-lg ring-4 ring-card shadow-lg"
                />
                <div className="mt-3">
                  <h2 className="font-display text-xl font-bold tracking-tight">{selectedName}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{selected.email ?? selected.phone}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={selected.isActive ? 'success' : 'secondary'}>
                      {selected.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {selected.isVerified && (
                      <Badge variant="outline" className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                    {selected.ownedVehicles.length > 0 && (
                      <Badge variant="outline" className="gap-1 border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                        <Car className="h-3 w-3" /> {selected.ownedVehicles.length} vehicle
                        {selected.ownedVehicles.length === 1 ? '' : 's'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }
      >
        {detailLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          </div>
        ) : selected ? (
          <Tabs defaultValue="overview">
            <TabsList className="mb-5 w-full justify-start h-auto flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles ({vehicles.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5 mt-0">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: profile?.contact.email ?? selected.email ?? '—' },
                  { icon: Phone, label: 'Phone', value: profile?.contact.phone ?? selected.phone },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: `${profile?.contact.city ?? selected.city}, ${profile?.contact.state ?? selected.state}`,
                  },
                  {
                    icon: UserCheck,
                    label: 'Member since',
                    value: formatDateTime(profile?.contact.createdAt ?? selected.createdAt),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60">
                      <row.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium mt-0.5 break-all">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DrawerSection title="Communication preferences" accent="sky">
                <div className="grid grid-cols-2 gap-2">
                  {profile &&
                    Object.entries({
                      Push: profile.preferences.pushEnabled,
                      SMS: profile.preferences.smsEnabled,
                      Email: profile.preferences.emailEnabled,
                      Marketing: profile.preferences.marketingOptIn,
                    }).map(([label, on]) => (
                      <div
                        key={label}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-sm',
                          on
                            ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-800 dark:text-emerald-300'
                            : 'border-border bg-muted/30 text-muted-foreground',
                        )}
                      >
                        <span className="font-medium">{label}</span>
                        <span className="block text-xs mt-0.5 opacity-80">{on ? 'Enabled' : 'Off'}</span>
                      </div>
                    ))}
                </div>
              </DrawerSection>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-3 mt-0">
              {vehicles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <Car className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-3">No owned vehicles on file.</p>
                </div>
              ) : (
                vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex gap-4 rounded-xl border border-border/70 bg-card p-4 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {v.year} {v.make} {v.model} {v.trim}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{v.vin}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {v.registrationNumber} · {v.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-0">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                <Label className="text-xs">{editingNoteId ? 'Edit note' : 'Add internal note'}</Label>
                <textarea
                  className="w-full min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Visible to staff only — follow-ups, preferences, objections…"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveNote} disabled={savingNote || !noteBody.trim()} className="gap-2">
                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {editingNoteId ? 'Update note' : 'Add note'}
                  </Button>
                  {editingNoteId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNoteId(null)
                        setNoteBody('')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No notes yet.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-border/70 p-4">
                      <div className="flex justify-between gap-2 mb-2">
                        <p className="text-xs text-muted-foreground">
                          {note.authorName} · {formatDateTime(note.createdAt)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNoteId(note.id)
                              setNoteBody(note.body)
                            }}
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.body}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              {!profile?.activity.length ? (
                <p className="text-sm text-muted-foreground text-center py-12">No activity recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-0">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  {profile.activity.map((item) => (
                    <div key={item.id} className="relative pb-6 last:pb-0">
                      <span className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-indigo-500" />
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 ml-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{item.title}</p>
                          {item.status && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {item.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{formatDateTime(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </Drawer>
    </div>
  )
}
