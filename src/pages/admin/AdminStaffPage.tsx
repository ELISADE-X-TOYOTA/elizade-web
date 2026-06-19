import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  UserPlus,
  UserMinus,
  BadgeCheck,
  Send,
  Loader2,
  Users,
  UserCheck,
  Building2,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Sparkles,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerField, DrawerSection } from '@/components/ui/drawer'
import { AvatarImage } from '@/components/ui/safe-image'
import { PageContainer } from '@/components/layout/PageHeader'
import { FadeIn } from '@/components/effects/PageTransition'
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

const DEPT_STYLES: Record<string, { pill: string; dot: string; icon: string; soft: string }> = {
  Sales: {
    pill: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/20',
    dot: 'bg-violet-500',
    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    soft: 'from-violet-500/20 to-violet-500/5',
  },
  Service: {
    pill: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    soft: 'from-emerald-500/20 to-emerald-500/5',
  },
  Warranty: {
    pill: 'bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/20',
    dot: 'bg-amber-500',
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    soft: 'from-amber-500/20 to-amber-500/5',
  },
  Support: {
    pill: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/20',
    dot: 'bg-sky-500',
    icon: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    soft: 'from-sky-500/20 to-sky-500/5',
  },
  Operations: {
    pill: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/20',
    dot: 'bg-rose-500',
    icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    soft: 'from-rose-500/20 to-rose-500/5',
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

type StatusFilter = 'all' | 'active' | 'inactive'

function deptStyle(dept: string) {
  return DEPT_STYLES[dept] ?? DEPT_STYLES.Operations
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        active
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          active ? 'bg-emerald-500' : 'bg-rose-500',
        )}
      />
      {active ? 'Active' : 'Deactivated'}
    </span>
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

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accent: 'violet' | 'emerald' | 'rose' | 'amber'
  trend?: string
}) {
  const accents = {
    violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-violet-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-rose-500/20',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-display text-2xl sm:text-[28px] font-bold mt-1 tabular-nums tracking-tight">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
          {trend && (
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">{trend}</p>
          )}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1', accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

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
      const rows = await listStaff()
      setStaff(rows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return staff.filter((s) => {
      if (deptFilter !== 'all' && s.department !== deptFilter) return false
      if (statusFilter === 'active' && !s.isActive) return false
      if (statusFilter === 'inactive' && s.isActive) return false
      if (!q) return true
      const name = `${s.firstName} ${s.lastName}`.toLowerCase()
      return (
        name.includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.department.toLowerCase().includes(q)
      )
    })
  }, [staff, search, deptFilter, statusFilter])

  const stats = useMemo(() => {
    const active = staff.filter((s) => s.isActive).length
    const deptCounts = DEPARTMENTS.map((d) => ({
      name: d,
      count: staff.filter((s) => s.department === d).length,
    }))
    const activeDepts = deptCounts.filter((d) => d.count > 0).length
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const added30d = staff.filter((s) => new Date(s.createdAt).getTime() > thirtyDaysAgo).length
    return {
      total: staff.length,
      active,
      inactive: staff.length - active,
      activeDepts,
      added30d,
      deptCounts,
    }
  }, [staff])

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
      const updated = await updateStaff(selected.id, { department: reassignDept })
      refreshMember(updated)
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
      const updated = await updateStaff(selected.id, { isActive: next })
      refreshMember(updated)
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
      const updated = await updateStaff(selected.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        city: editForm.city,
        state: editForm.state,
      })
      refreshMember(updated)
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
      `${s.firstName} ${s.lastName}`,
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

  const selectedName = selected ? `${selected.firstName} ${selected.lastName}` : ''
  const selectedDeptStyle = selected ? deptStyle(selected.department) : deptStyle('Operations')

  return (
    <PageContainer wide className="space-y-6 sm:space-y-8">
      {/* Breadcrumb + header */}
      <FadeIn>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Link to="/admin" className="hover:text-foreground transition-colors">Dashboard</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Staff</span>
            </nav>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Team directory</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              Onboard staff, assign departments, and control portal access across Elizade operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2 rounded-xl shadow-sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add staff
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Metric cards */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard label="Total team" value={stats.total} sub="Staff accounts" icon={Users} accent="violet" />
          <MetricCard
            label="Active now"
            value={stats.active}
            sub={`${stats.inactive} deactivated`}
            icon={UserCheck}
            accent="emerald"
            trend={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% online-ready` : undefined}
          />
          <MetricCard label="Departments" value={stats.activeDepts} sub="With assigned staff" icon={Building2} accent="amber" />
          <MetricCard label="Added (30d)" value={stats.added30d} sub="New hires this month" icon={Sparkles} accent="rose" />
        </div>
      </FadeIn>

      {/* Department chips */}
      <FadeIn delay={0.08}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold">Team by department</CardTitle>
              <Badge variant="outline" className="text-[10px] font-medium rounded-full">
                {stats.total} members
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {stats.deptCounts.map((d) => {
                const s = deptStyle(d.name)
                const pct = stats.total > 0 ? Math.round((d.count / stats.total) * 100) : 0
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setDeptFilter(deptFilter === d.name ? 'all' : d.name)}
                    className={cn(
                      'flex min-w-[120px] flex-col gap-2 rounded-2xl border p-3 transition-all shrink-0',
                      'hover:shadow-sm',
                      deptFilter === d.name
                        ? 'border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-border/80 bg-muted/30 hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('h-2 w-2 rounded-full shrink-0', s.dot)} />
                      <span className="text-lg font-bold tabular-nums">{d.count}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{pct}% of team</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.1}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base font-display">All staff</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Click a row to view profile and manage access</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, email, phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 rounded-xl bg-background/80"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Deactivated</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 w-[26%]">
                    Staff
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    Department
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    Status
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">
                    Joined
                  </th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
                      <p className="text-sm">Loading team directory…</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="mx-auto max-w-xs">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 mb-4">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold">No staff found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {staff.length === 0 ? 'Add your first team member to get started.' : 'Try adjusting your filters.'}
                        </p>
                        {staff.length === 0 && (
                          <Button size="sm" className="mt-4 gap-2 rounded-xl" onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" /> Add staff
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((member) => {
                    const name = `${member.firstName} ${member.lastName}`
                    const isSelected = selected?.id === member.id && detailOpen
                    return (
                      <tr
                        key={member.id}
                        onClick={() => openDetail(member)}
                        className={cn(
                          'border-b border-border/50 cursor-pointer transition-colors group',
                          'hover:bg-muted/40',
                          isSelected && 'bg-primary/5',
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <AvatarImage name={name} className="h-9 w-9 text-xs shrink-0 ring-2 ring-background" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate text-[13px]">{name}</p>
                              <p className="text-[11px] text-muted-foreground truncate md:hidden">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell truncate max-w-[200px] text-[13px]">
                          {member.email}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground hidden lg:table-cell">
                          {member.phone}
                        </td>
                        <td className="px-5 py-3.5">
                          <DeptPill department={member.department} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPill active={member.isActive} />
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell tabular-nums">
                          {formatDateTime(member.createdAt).split(',')[0]}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg opacity-60 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(member)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
              <span>
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
                <span className="font-semibold text-foreground">{staff.length}</span> staff
              </span>
              {deptFilter !== 'all' && (
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setDeptFilter('all')}
                >
                  Clear department filter
                </button>
              )}
            </div>
          )}
        </Card>
      </FadeIn>

      {/* Detail drawer */}
      <Drawer
        open={detailOpen && !!selected}
        onClose={() => setDetailOpen(false)}
        width="lg"
        customHeader={
          selected && (
            <div className="relative overflow-hidden">
              <div
                className={cn(
                  'h-28 bg-gradient-to-br from-navy via-navy-light to-navy',
                  'relative',
                )}
              />
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-60',
                  selectedDeptStyle.soft,
                )}
              />
              <div className="relative px-6 pb-5 -mt-10">
                <AvatarImage
                  name={selectedName}
                  className="h-16 w-16 text-lg ring-4 ring-card shadow-lg"
                />
                <div className="mt-3">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{selectedName}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Staff · <span className="font-medium text-foreground">{selected.department}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusPill active={selected.isActive} />
                    {selected.isVerified && (
                      <Badge variant="outline" className="text-[10px] gap-1 rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
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
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                disabled={actionLoading !== null}
                onClick={handleToggleActive}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selected.isActive ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Reactivate
                  </>
                )}
              </Button>
              <Button
                className="flex-1 rounded-xl"
                disabled={!selected.isActive || actionLoading !== null}
                onClick={handleResendOtp}
              >
                {actionLoading === 'otp' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-6 -mt-2">
            <div className="grid gap-3 rounded-2xl border border-border/80 p-4 bg-muted/20">
              <DrawerField
                label="Phone (OTP login)"
                value={selected.phone}
                mono
                icon={Phone}
                iconClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
              />
              <DrawerField
                label="Email"
                value={selected.email}
                icon={Mail}
                iconClass="bg-violet-500/15 text-violet-600 dark:text-violet-400"
              />
              <DrawerField
                label="Location"
                value={`${selected.city}, ${selected.state}`}
                icon={MapPin}
                iconClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              />
              <DrawerField
                label="Joined"
                value={formatDateTime(selected.createdAt)}
                icon={Calendar}
                iconClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
              />
            </div>

            <DrawerSection title="Edit profile" accent="violet">
              <div className="space-y-3 rounded-2xl border border-border/80 p-4 bg-card">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-first" className="text-xs">First name</Label>
                    <Input
                      id="edit-first"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="h-9 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-last" className="text-xs">Last name</Label>
                    <Input
                      id="edit-last"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="h-9 rounded-xl"
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
                    className="h-9 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-city" className="text-xs">City</Label>
                    <Input
                      id="edit-city"
                      value={editForm.city}
                      onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                      className="h-9 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-state" className="text-xs">State</Label>
                    <select
                      id="edit-state"
                      value={editForm.state}
                      onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                      className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={!editDirty || actionLoading !== null}
                  onClick={handleSaveProfile}
                  className="w-full rounded-xl"
                >
                  {actionLoading === 'profile' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </DrawerSection>

            <DrawerSection title="Department" accent="amber">
              <div className="space-y-3 rounded-2xl border border-border/80 p-4 bg-card">
                <div className="flex flex-wrap gap-2 mb-2">
                  {DEPARTMENTS.map((d) => {
                    const s = deptStyle(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setReassignDept(d)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-semibold transition-all',
                          reassignDept === d
                            ? cn(s.pill, 'ring-2 ring-offset-1 ring-offset-background', s.dot.replace('bg-', 'ring-'))
                            : 'border-border text-muted-foreground hover:bg-muted/50',
                        )}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={reassignDept === selected.department || actionLoading !== null}
                  onClick={handleReassign}
                  className="w-full rounded-xl"
                >
                  {actionLoading === 'reassign' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Update department'
                  )}
                </Button>
              </div>
            </DrawerSection>

            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border/80 p-4 bg-muted/20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <Shield className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deactivated staff cannot sign in. Sessions expire when the JWT lapses. Phone numbers cannot be changed from this panel.
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        width="lg"
        customHeader={
          <div className="relative overflow-hidden border-b border-border/60">
            <div className="h-24 bg-gradient-to-br from-violet-600/90 via-indigo-600/80 to-navy relative" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,207,15,0.25),transparent_50%)]" />
            <div className="relative px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
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
          <>
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={submitting}
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="staff-create-form" className="flex-1 gap-2 rounded-xl" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create & send OTP
            </Button>
          </>
        }
      >
        <form id="staff-create-form" onSubmit={handleCreate} className="space-y-6 -mt-2">
          <DrawerSection title="Personal" accent="violet">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 p-4 bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="sf-first" className="text-xs">First name</Label>
                <Input
                  id="sf-first"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                  className="h-10 rounded-xl bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-last" className="text-xs">Last name</Label>
                <Input
                  id="sf-last"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                  className="h-10 rounded-xl bg-background"
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Sign-in credentials" accent="sky">
            <div className="space-y-3 rounded-2xl border border-border/80 p-4 bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="sf-phone" className="text-xs">Mobile number</Label>
                <Input
                  id="sf-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0810 789 1548"
                  className="h-10 font-mono rounded-xl bg-background"
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
                  className="h-10 rounded-xl bg-background"
                  required
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Role & location" accent="emerald">
            <div className="space-y-3 rounded-2xl border border-border/80 p-4 bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="sf-dept" className="text-xs">Department</Label>
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
                          form.department === d
                            ? cn(s.pill, 'ring-2 ring-offset-1 ring-offset-background')
                            : 'border-border text-muted-foreground hover:bg-muted/50',
                        )}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sf-city" className="text-xs">City</Label>
                  <Input
                    id="sf-city"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="h-10 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sf-state" className="text-xs">State</Label>
                  <select
                    id="sf-state"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </DrawerSection>

          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Account is created as <strong className="text-foreground">verified</strong>. Welcome OTP prints to the API terminal in development.
            </p>
          </div>
        </form>
      </Drawer>
    </PageContainer>
  )
}
