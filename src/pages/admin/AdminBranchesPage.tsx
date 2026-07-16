import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Building2,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Store,
  Wrench,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { Switch } from '@/components/ui/switch'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { ApiError } from '@/lib/api'
import {
  createBranch,
  getBranchSummary,
  listAdminBranches,
  updateBranch,
  type BranchAdmin,
  type BranchSummary,
  type BranchType,
} from '@/lib/branches-api'
import { cn, formatDateTime } from '@/lib/utils'
import { useAdminPageTitle } from '@/lib/admin-page-titles'

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja',
  'Rivers',
  'Oyo',
  'Kano',
  'Delta',
  'Edo',
  'Ogun',
  'Kaduna',
  'Enugu',
  'Anambra',
  'Imo',
]

const TYPE_FILTERS = [
  { key: 'all', label: 'All types' },
  { key: 'both', label: 'Showroom + Service' },
  { key: 'showroom', label: 'Showroom' },
  { key: 'service_centre', label: 'Service centre' },
] as const

const TYPE_META: Record<
  BranchType,
  { label: string; icon: typeof Store; pill: string; chart: string }
> = {
  both: {
    label: 'Showroom & service',
    icon: Building2,
    pill: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/20',
    chart: '#8b5cf6',
  },
  showroom: {
    label: 'Showroom',
    icon: Store,
    pill: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/20',
    chart: '#0ea5e9',
  },
  service_centre: {
    label: 'Service centre',
    icon: Wrench,
    pill: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    chart: '#10b981',
  },
}

const EMPTY_FORM = {
  name: '',
  type: 'both' as BranchType,
  city: '',
  state: 'Lagos',
  address: '',
  phone: '',
  isActive: true,
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
  icon: typeof MapPin
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

export function AdminBranchesPage() {
  const pageTitle = useAdminPageTitle()
  const [summary, setSummary] = useState<BranchSummary | null>(null)
  const [branches, setBranches] = useState<BranchAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showInactive, setShowInactive] = useState(true)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<BranchAdmin | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, rows] = await Promise.all([
        getBranchSummary(),
        listAdminBranches({
          q: search.trim() || undefined,
          type: typeFilter,
          includeInactive: showInactive,
        }),
      ])
      setSummary(summaryRes)
      setBranches(rows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load branches')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, showInactive])

  useEffect(() => {
    load()
  }, [load])

  const typeChart = useMemo(
    () =>
      Object.entries(summary?.byType ?? {})
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({
          key,
          name: TYPE_META[key as BranchType]?.label ?? key,
          value: count,
          fill: TYPE_META[key as BranchType]?.chart ?? '#6366f1',
        })),
    [summary],
  )

  const stateChart = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const b of branches) {
      counts[b.state] = (counts[b.state] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [branches])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (branch: BranchAdmin) => {
    setEditing(branch)
    setForm({
      name: branch.name,
      type: branch.type,
      city: branch.city,
      state: branch.state,
      address: branch.address,
      phone: branch.phone ?? '',
      isActive: branch.isActive,
    })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      toast.error('Name, city, and address are required')
      return
    }
    setBusyId(editing?.id ?? 'create')
    try {
      if (editing) {
        await updateBranch(editing.id, {
          name: form.name.trim(),
          type: form.type,
          city: form.city.trim(),
          state: form.state,
          address: form.address.trim(),
          phone: form.phone.trim() || undefined,
          isActive: form.isActive,
        })
        toast.success('Branch updated')
      } else {
        await createBranch({
          name: form.name.trim(),
          type: form.type,
          city: form.city.trim(),
          state: form.state,
          address: form.address.trim(),
          phone: form.phone.trim() || undefined,
          isActive: form.isActive,
        })
        toast.success('Branch created')
      }
      setDrawerOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setBusyId(null)
    }
  }

  const toggleActive = async (branch: BranchAdmin) => {
    setBusyId(branch.id)
    try {
      await updateBranch(branch.id, { isActive: !branch.isActive })
      toast.success(branch.isActive ? 'Branch deactivated' : 'Branch activated')
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description="Manage Elizade showrooms and service centres across Nigeria"
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add branch
        </Button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatHighlight
          label="Total locations"
          value={summary?.total ?? 0}
          sub={`${summary?.active ?? 0} active · ${summary?.inactive ?? 0} inactive`}
          icon={MapPin}
          tone="bg-sky-500/15 text-sky-600"
        />
        <StatHighlight
          label="Showroom + service"
          value={summary?.byType?.both ?? 0}
          sub="Full-service branches"
          icon={Building2}
          tone="bg-violet-500/15 text-violet-600"
        />
        <StatHighlight
          label="Showrooms"
          value={summary?.byType?.showroom ?? 0}
          sub="Sales-focused"
          icon={Store}
          tone="bg-indigo-500/15 text-indigo-600"
        />
        <StatHighlight
          label="Service centres"
          value={summary?.byType?.service_centre ?? 0}
          sub="After-sales only"
          icon={Wrench}
          tone="bg-emerald-500/15 text-emerald-600"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">By branch type</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            {typeChart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No branches yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>
                    {typeChart.map((row) => (
                      <Cell key={row.key} fill={row.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Locations by state</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            {stateChart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No branches yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={4} name="Branches" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, city, state, address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={typeFilter === f.key ? 'default' : 'outline'}
                onClick={() => setTypeFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
            Show inactive
          </label>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading branches…
        </div>
      ) : branches.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            No branches match this filter
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const meta = TYPE_META[branch.type]
            const Icon = meta.icon
            return (
              <Card
                key={branch.id}
                className={cn(
                  'border-border/80 overflow-hidden transition-colors hover:border-primary/30',
                  !branch.isActive && 'opacity-70',
                )}
              >
                <div className={cn('h-1.5 w-full bg-gradient-to-r', meta.pill.includes('violet') ? 'from-violet-500 to-violet-400' : meta.pill.includes('sky') ? 'from-sky-500 to-sky-400' : 'from-emerald-500 to-emerald-400')} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', meta.pill)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold leading-snug truncate">{branch.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {branch.city}, {branch.state}
                        </p>
                      </div>
                    </div>
                    <Badge variant={branch.isActive ? 'success' : 'secondary'}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                    {branch.phone && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        {branch.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn('capitalize border', meta.pill)}>
                      {meta.label}
                    </Badge>
                    <Badge variant="outline">{branch.vehicleCount} vehicles</Badge>
                    <Badge variant="outline">{branch.serviceBayCount} bays</Badge>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(branch)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={branch.isActive ? 'destructive' : 'default'}
                      className="flex-1"
                      disabled={busyId === branch.id}
                      onClick={() => toggleActive(branch)}
                    >
                      {busyId === branch.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : branch.isActive ? (
                        'Deactivate'
                      ) : (
                        'Activate'
                      )}
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    Updated {formatDateTime(branch.updatedAt)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit branch' : 'New branch'}
        description={editing ? 'Update location details visible across inventory and service ops' : 'Add a showroom or service centre'}
        width="lg"
      >
        <DrawerSection title="Location">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Branch name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Elizade Victoria Island"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as BranchType })}
              >
                <option value="both">Showroom & service centre</option>
                <option value="showroom">Showroom only</option>
                <option value="service_centre">Service centre only</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone (optional)</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Active on customer channels</p>
                <p className="text-xs text-muted-foreground">Inactive branches are hidden from public listings</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </label>
          </div>
        </DrawerSection>
        <Button className="w-full gap-2" disabled={busyId !== null} onClick={handleSave}>
          {busyId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
          {editing ? 'Save changes' : 'Create branch'}
        </Button>
      </Drawer>
    </div>
  )
}
