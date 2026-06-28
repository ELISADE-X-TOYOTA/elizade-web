import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Activity,
  ArrowUpDown,
  BadgeCheck,
  Building2,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
  createStaff,
  listStaff,
  sendStaffLoginOtp,
  updateStaff,
  type StaffMember,
} from '@/lib/staff-api'
import { cn, formatDateTime } from '@/lib/utils'

const DEPARTMENTS = ['Sales', 'Service', 'Warranty', 'Support', 'Operations'] as const
const NIGERIAN_STATES = ['Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Delta', 'Edo', 'Ogun', 'Kaduna', 'Enugu']

const DEPT_CHART_COLORS: Record<string, string> = {
  Sales: '#8b5cf6',
  Service: '#10b981',
  Warranty: '#f59e0b',
  Support: '#0ea5e9',
  Operations: '#f43f5e',
}

const DEPT_STYLES: Record<string, { pill: string; dot: string; soft: string }> = {
  Sales: {
    pill: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/20',
    dot: 'bg-violet-500',
    soft: 'from-violet-500/25 via-violet-500/10 to-transparent',
  },
  Service: {
    pill: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-500',
    soft: 'from-emerald-500/25 via-emerald-500/10 to-transparent',
  },
  Warranty: {
    pill: 'bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/20',
    dot: 'bg-amber-500',
    soft: 'from-amber-500/25 via-amber-500/10 to-transparent',
  },
  Support: {
    pill: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/20',
    dot: 'bg-sky-500',
    soft: 'from-sky-500/25 via-sky-500/10 to-transparent',
  },
  Operations: {
    pill: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/20',
    dot: 'bg-rose-500',
    soft: 'from-rose-500/25 via-rose-500/10 to-transparent',
  },
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  department: 'Sales',
  city: 'Lagos',
  state: 'Lagos',
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'pending'
type SortKey = 'name' | 'newest' | 'department'
type ViewMode = 'list' | 'grid'

function deptStyle(dept: string) {
  return DEPT_STYLES[dept] ?? DEPT_STYLES.Operations
}

function staffName(m: StaffMember) {
  return `${m.firstName} ${m.lastName}`.trim()
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

function StatusPill({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'secondary'} className="gap-1">
      <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground')} />
      {active ? 'Active' : 'Deactivated'}
    </Badge>
  )
}

function DeptPill({ department }: { department: string }) {
  const s = deptStyle(department)
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', s.pill)}>
      {department}
    </span>
  )
}

export function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [page, setPage] = useState(1)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const pageSize = 10

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<StaffMember | null>(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reassignDept, setReassignDept] = useState('')
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    state: '',
  })

  const loadStaff = async () => {
    setLoading(true)
    try {
      setStaff(await listStaff())
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const stats = useMemo(() => {
    const active = staff.filter((s) => s.isActive).length
    const verified = staff.filter((s) => s.isVerified).length
    const deptCounts = DEPARTMENTS.map((d) => ({
      name: d,
      count: staff.filter((s) => s.department === d).length,
      color: DEPT_CHART_COLORS[d],
    }))
    const activeDepts = deptCounts.filter((d) => d.count > 0).length
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const added30d = staff.filter((s) => new Date(s.createdAt).getTime() > thirtyDaysAgo).length
    const stateCounts = Object.entries(
      staff.reduce<Record<string, number>>((acc, s) => {
        acc[s.state] = (acc[s.state] ?? 0) + 1
        return acc
      }, {}),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      total: staff.length,
      active,
      inactive: staff.length - active,
      verified,
      unverified: staff.length - verified,
      activeDepts,
      added30d,
      deptCounts,
      stateCounts,
    }
  }, [staff])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let rows = staff.filter((s) => {
      if (deptFilter !== 'all' && s.department !== deptFilter) return false
      if (statusFilter === 'active' && !s.isActive) return false
      if (statusFilter === 'inactive' && s.isActive) return false
      if (statusFilter === 'pending' && s.isVerified) return false
      if (!q) return true
      const name = staffName(s).toLowerCase()
      return (
        name.includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.department.toLowerCase().includes(q)
      )
    })

    rows = [...rows].sort((a, b) => {
      if (sortKey === 'name') return staffName(a).localeCompare(staffName(b))
      if (sortKey === 'department') return a.department.localeCompare(b.department)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return rows
  }, [staff, search, deptFilter, statusFilter, sortKey])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, deptFilter, statusFilter, sortKey])

  const activityData = useMemo(
    () =>
      [
        { name: 'Active', value: stats.active, color: '#10b981' },
        { name: 'Deactivated', value: stats.inactive, color: '#64748b' },
      ].filter((d) => d.value > 0),
    [stats.active, stats.inactive],
  )

  const deptChartData = useMemo(
    () => stats.deptCounts.filter((d) => d.count > 0),
    [stats.deptCounts],
  )

  const openDetail = (member: StaffMember) => {
    setSelected(member)
    setReassignDept(member.department)
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      city: member.city,
      state: member.state,
    })
    setDetailOpen(true)
  }

  const refreshMember = (updated: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    setSelected(updated)
    setReassignDept(updated.department)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await createStaff({ ...form, sendWelcomeOtp: true })
      setStaff((prev) => [created, ...prev])
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      toast.success('Staff created — OTP sent to API terminal')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create staff')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReassign = async () => {
    if (!selected || reassignDept === selected.department) return
    setActionLoading('reassign')
    try {
      refreshMember(await updateStaff(selected.id, { department: reassignDept }))
      toast.success('Department updated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async () => {
    if (!selected) return
    const next = !selected.isActive
    setActionLoading('status')
    try {
      refreshMember(await updateStaff(selected.id, { isActive: next }))
      toast.success(next ? 'Staff reactivated' : 'Staff deactivated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResendOtp = async () => {
    if (!selected) return
    setActionLoading('otp')
    try {
      await sendStaffLoginOtp(selected.id)
      toast.success('Login OTP sent — check API terminal')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not send OTP')
    } finally {
      setActionLoading(null)
    }
  }

  const editDirty =
    selected &&
    (editForm.firstName !== selected.firstName ||
      editForm.lastName !== selected.lastName ||
      editForm.email !== selected.email ||
      editForm.city !== selected.city ||
      editForm.state !== selected.state)

  const handleSaveProfile = async () => {
    if (!selected || !editDirty) return
    setActionLoading('profile')
    try {
      refreshMember(
        await updateStaff(selected.id, {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          city: editForm.city,
          state: editForm.state,
        }),
      )
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setActionLoading(null)
    }
  }

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Status', 'City', 'State', 'Joined']
    const rows = filtered.map((s) => [
      staffName(s),
      s.email,
      s.phone,
      s.department,
      s.isActive ? 'Active' : 'Deactivated',
      s.city,
      s.state,
      formatDateTime(s.createdAt),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'elizade-staff.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }

  const selectedName = selected ? staffName(selected) : ''
  const selectedDeptStyle = selected ? deptStyle(selected.department) : deptStyle('Operations')
  const activePct = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Page title row — lead-management style */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Team management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Onboard staff, assign departments, and manage portal access
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 rounded-xl" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 rounded-xl shadow-md shadow-[#ffcf0f]/20" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add staff
          </Button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-6 border-b border-border/70">
        {(
          [
            { key: 'all', label: 'All staff' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Deactivated' },
            { key: 'pending', label: 'Pending verification' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'relative pb-3 text-sm font-medium transition-colors',
              statusFilter === tab.key
                ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#ffcf0f]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compact KPI strip */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total team', value: stats.total, sub: 'Portal accounts', tone: 'text-violet-600' },
          { label: 'Active now', value: stats.active, sub: `${activePct}% ready`, tone: 'text-emerald-600' },
          { label: 'Departments', value: stats.activeDepts, sub: 'Staffed areas', tone: 'text-amber-600' },
          { label: 'New hires (30d)', value: stats.added30d, sub: `${stats.verified} verified`, tone: 'text-sky-600' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border/70 bg-card px-4 py-3.5 shadow-sm"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className={cn('font-display mt-1 text-2xl font-bold tabular-nums', item.tone)}>{item.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-border bg-background py-2 pl-3 pr-9 text-sm"
              >
                <option value="all">All departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-10 appearance-none rounded-xl border border-border bg-background py-2 pl-3 pr-9 text-sm"
              >
                <option value="newest">Sort: Newest</option>
                <option value="name">Sort: Name</option>
                <option value="department">Sort: Department</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="flex rounded-xl border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
            </div>

            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-full pl-10"
              />
            </div>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={loadStaff} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{' '}
          {filtered.length} staff
        </span>
        <button
          type="button"
          onClick={() => setInsightsOpen((v) => !v)}
          className="font-medium text-foreground hover:text-[#c8102e]"
        >
          {insightsOpen ? 'Hide team insights' : 'Show team insights'}
        </button>
      </div>

      {/* Collapsible charts */}
      {insightsOpen && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-emerald-500" />
                Account status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityData.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={activityData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" nameKey="name">
                      {activityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-violet-500" />
                By department
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deptChartData.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deptChartData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="count" nameKey="name">
                      {deptChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-sky-500" />
                Top locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.stateCounts.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.stateCounts} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                    <Bar dataKey="count" name="Staff" radius={[0, 6, 6, 0]} barSize={14} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Directory — list or grid */}
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-medium">No staff found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {staff.length === 0 ? 'Add your first team member to get started.' : 'Try adjusting your filters.'}
            </p>
            {staff.length === 0 && (
              <Button className="mt-4 gap-2 rounded-xl" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Add staff
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <AvatarImage name={staffName(member)} className="h-11 w-11 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{staffName(member)}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <DeptPill department={member.department} />
                      <StatusPill active={member.isActive} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <p className="text-[11px] text-muted-foreground">{member.city}, {member.state}</p>
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => openDetail(member)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f8f9fc] text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground dark:bg-muted/20">
                  <th className="px-5 py-3.5">Profile</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Contact</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Quick action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => openDetail(member)}
                    className={cn(
                      'group cursor-pointer border-b border-border/50 transition-colors hover:bg-[#ffcf0f]/5',
                      selected?.id === member.id && detailOpen && 'bg-[#ffcf0f]/8',
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarImage name={staffName(member)} className="h-10 w-10 text-xs ring-2 ring-border/60" />
                        <div>
                          <p className="font-semibold">{staffName(member)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Joined {formatDateTime(member.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm">{member.email}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{member.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <DeptPill department={member.department} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-sm">{member.city}</p>
                      <p className="text-xs text-muted-foreground">{member.state}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        <StatusPill active={member.isActive} />
                        {member.isVerified ? (
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">Pending</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          title="Send OTP"
                          disabled={!member.isActive || actionLoading === `otp-${member.id}`}
                          onClick={async () => {
                            setActionLoading(`otp-${member.id}`)
                            try {
                              await sendStaffLoginOtp(member.id)
                              toast.success('OTP sent — check API terminal')
                            } catch (err) {
                              toast.error(err instanceof ApiError ? err.message : 'Could not send OTP')
                            } finally {
                              setActionLoading(null)
                            }
                          }}
                        >
                          {actionLoading === `otp-${member.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          title="Email"
                          onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          title="Call"
                          onClick={() => window.open(`tel:${member.phone}`, '_blank')}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          title="View profile"
                          onClick={() => openDetail(member)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={page === n ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-9 rounded-lg"
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail drawer */}
      <Drawer
        open={detailOpen && !!selected}
        onClose={() => setDetailOpen(false)}
        width="xl"
        customHeader={
          selected && (
            <div className="relative overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-80', selectedDeptStyle.soft)} />
              <div className="relative px-6 pb-5 -mt-10">
                <AvatarImage name={selectedName} className="h-16 w-16 text-lg ring-4 ring-card shadow-lg" />
                <div className="mt-3">
                  <h2 className="font-display text-xl font-bold tracking-tight">{selectedName}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{selected.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <DeptPill department={selected.department} />
                    <StatusPill active={selected.isActive} />
                    {selected.isVerified && (
                      <Badge variant="outline" className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }
        footer={
          selected && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                disabled={actionLoading !== null}
                onClick={handleToggleActive}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selected.isActive ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" /> Deactivate
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" /> Reactivate
                  </>
                )}
              </Button>
              <Button
                className="flex-1"
                disabled={!selected.isActive || actionLoading !== null}
                onClick={handleResendOtp}
              >
                {actionLoading === 'otp' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Send OTP
                  </>
                )}
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <Tabs defaultValue="overview">
            <TabsList className="mb-5 w-full justify-start h-auto flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Edit profile</TabsTrigger>
              <TabsTrigger value="department">Department</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5 mt-0">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Phone, label: 'Phone (OTP login)', value: selected.phone, mono: true },
                  { icon: Mail, label: 'Work email', value: selected.email },
                  { icon: MapPin, label: 'Location', value: `${selected.city}, ${selected.state}` },
                  { icon: Calendar, label: 'Joined', value: formatDateTime(selected.createdAt) },
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
                      <p className={cn('text-sm font-medium mt-0.5 break-all', row.mono && 'font-mono text-xs')}>
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <DrawerSection title="Personal details" accent="violet">
                <div className="space-y-3 rounded-xl border border-border/70 p-4 bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-first" className="text-xs">First name</Label>
                      <Input
                        id="edit-first"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-last" className="text-xs">Last name</Label>
                      <Input
                        id="edit-last"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email" className="text-xs">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-city" className="text-xs">City</Label>
                      <Input
                        id="edit-city"
                        value={editForm.city}
                        onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-state" className="text-xs">State</Label>
                      <select
                        id="edit-state"
                        value={editForm.state}
                        onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button disabled={!editDirty || actionLoading !== null} onClick={handleSaveProfile} className="w-full">
                    {actionLoading === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
                  </Button>
                </div>
              </DrawerSection>
            </TabsContent>

            <TabsContent value="department" className="mt-0">
              <DrawerSection title="Department assignment" accent="amber">
                <div className="space-y-3 rounded-xl border border-border/70 p-4 bg-muted/20">
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENTS.map((d) => {
                      const s = deptStyle(d)
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setReassignDept(d)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                            reassignDept === d ? s.pill : 'border-border text-muted-foreground hover:bg-muted/50',
                          )}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                  <Button
                    variant="secondary"
                    disabled={reassignDept === selected.department || actionLoading !== null}
                    onClick={handleReassign}
                    className="w-full"
                  >
                    {actionLoading === 'reassign' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update department'}
                  </Button>
                </div>
              </DrawerSection>
            </TabsContent>

            <TabsContent value="access" className="mt-0 space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                <p className="text-sm font-medium">Portal access</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Staff sign in with OTP using their registered phone number. Deactivated accounts cannot authenticate
                  until reactivated.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/80 p-4 bg-muted/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Phone numbers cannot be changed from this panel. Sessions expire when the JWT lapses after deactivation.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        width="xl"
        customHeader={
          <div className="relative overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900" />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent" />
            <div className="relative px-6 pb-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white tracking-tight">Add staff member</h2>
                  <p className="text-sm text-white/75 mt-0.5">Pre-verified account · OTP login at /login</p>
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" disabled={submitting} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="staff-create-form" className="flex-1 gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create & send OTP
            </Button>
          </div>
        }
      >
        <form id="staff-create-form" onSubmit={handleCreate} className="space-y-5">
          <DrawerSection title="Personal" accent="violet">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-4 bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="sf-first" className="text-xs">First name</Label>
                <Input
                  id="sf-first"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-last" className="text-xs">Last name</Label>
                <Input
                  id="sf-last"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Sign-in credentials" accent="sky">
            <div className="space-y-3 rounded-xl border border-border/70 p-4 bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="sf-phone" className="text-xs">Mobile number</Label>
                <Input
                  id="sf-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0810 789 1548"
                  className="font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">Nigerian format · used for OTP login</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-email" className="text-xs">Work email</Label>
                <Input
                  id="sf-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="name@elizade.com"
                  required
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Role & location" accent="emerald">
            <div className="space-y-3 rounded-xl border border-border/70 p-4 bg-muted/20">
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((d) => {
                  const s = deptStyle(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, department: d }))}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                        form.department === d ? s.pill : 'border-border text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sf-city" className="text-xs">City</Label>
                  <Input
                    id="sf-city"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sf-state" className="text-xs">State</Label>
                  <select
                    id="sf-state"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </DrawerSection>

          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Account is created as <strong className="text-foreground">verified</strong>. Welcome OTP prints to the
              API terminal in development.
            </p>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
