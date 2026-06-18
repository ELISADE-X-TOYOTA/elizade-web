import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  UserCog,
  Users,
  UserCheck,
  Building2,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Sparkles,
  Filter,
  ChevronRight,
  MoreHorizontal,
  UserMinus,
  UserPlus,
  BadgeCheck,
  Clock,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { AvatarImage } from '@/components/ui/safe-image'
import { FadeIn } from '@/components/effects/PageTransition'
import { ApiError } from '@/lib/api'
import { createStaff, listStaff, updateStaff, type StaffMember } from '@/lib/staff-api'
import { cn, formatDateTime } from '@/lib/utils'

const STAFF_DEPARTMENTS = ['Sales', 'Service', 'Warranty', 'Support', 'Operations'] as const

const DEPARTMENT_META: Record<
  string,
  { color: string; bg: string; border: string; icon: typeof Users }
> = {
  Sales: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Users },
  Service: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: UserCog },
  Warranty: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: Shield },
  Support: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Phone },
  Operations: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Building2 },
}

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Delta', 'Edo', 'Ogun', 'Kaduna', 'Enugu',
]

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

function StaffSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted/70 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DepartmentBadge({ department }: { department: string }) {
  const meta = DEPARTMENT_META[department] ?? DEPARTMENT_META.Operations
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        meta.bg,
        meta.border,
        meta.color,
      )}
    >
      <Icon className="h-3 w-3" />
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
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const loadStaff = async () => {
    setLoading(true)
    try {
      const rows = await listStaff()
      setStaff(rows)
      if (rows.length && !selectedId) setSelectedId(rows[0].id)
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
    const departments = new Set(staff.map((s) => s.department)).size
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recent = staff.filter((s) => new Date(s.createdAt).getTime() > thirtyDaysAgo).length
    return { total: staff.length, active, departments, recent }
  }, [staff])

  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of STAFF_DEPARTMENTS) counts[d] = 0
    staff.forEach((s) => {
      counts[s.department] = (counts[s.department] ?? 0) + 1
    })
    return counts
  }, [staff])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return staff.filter((s) => {
      if (deptFilter !== 'all' && s.department !== deptFilter) return false
      if (statusFilter === 'active' && !s.isActive) return false
      if (statusFilter === 'inactive' && s.isActive) return false
      if (!q) return true
      return (
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.department.toLowerCase().includes(q)
      )
    })
  }, [staff, search, deptFilter, statusFilter])

  const selected = staff.find((s) => s.id === selectedId) ?? filtered[0] ?? null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await createStaff({ ...form, sendWelcomeOtp: true })
      setStaff((prev) => [created, ...prev])
      setSelectedId(created.id)
      setShowForm(false)
      setForm(EMPTY_FORM)
      toast.success('Staff account created — OTP sent to API terminal')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create staff')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (member: StaffMember) => {
    setTogglingId(member.id)
    try {
      const updated = await updateStaff(member.id, { isActive: !member.isActive })
      setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      toast.success(updated.isActive ? 'Staff reactivated' : 'Staff deactivated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Staff Management"
        description="Onboard team members, assign departments, and control portal access across Elizade operations."
      >
        <Button className="gap-2 shadow-md shadow-primary/20" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add team member
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total team" value={stats.total} icon={Users} sub="Staff accounts" />
        <StatCard
          label="Active now"
          value={stats.active}
          icon={UserCheck}
          sub={`${stats.total - stats.active} inactive`}
          trend={
            stats.total > 0
              ? { value: `${Math.round((stats.active / stats.total) * 100)}% online-ready`, positive: true }
              : undefined
          }
        />
        <StatCard label="Departments" value={stats.departments} icon={Building2} sub="With assigned staff" />
        <StatCard label="Added (30d)" value={stats.recent} icon={Sparkles} sub="New hires this month" />
      </div>

      {/* Department breakdown */}
      <FadeIn>
        <Card className="border-border/60 overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team by department</CardTitle>
              <Badge variant="outline" className="text-[10px]">{stats.total} members</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {STAFF_DEPARTMENTS.map((dept) => {
                const meta = DEPARTMENT_META[dept]
                const count = departmentCounts[dept] ?? 0
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDeptFilter(deptFilter === dept ? 'all' : dept)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all min-w-[140px]',
                      deptFilter === dept
                        ? cn(meta.bg, meta.border, 'ring-2 ring-primary/30 shadow-sm')
                        : 'border-border/60 hover:border-border hover:bg-muted/40',
                    )}
                  >
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', meta.bg)}>
                      <meta.icon className={cn('h-4 w-4', meta.color)} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{dept}</p>
                      <p className="font-display font-bold tabular-nums">
                        {count}
                        <span className="text-xs font-normal text-muted-foreground ml-1">({pct}%)</span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Main grid: list + detail */}
      <div className="grid xl:grid-cols-5 gap-4 sm:gap-6">
        <FadeIn className="xl:col-span-3" delay={0.05}>
          <Card className="overflow-hidden border-border/60">
            <CardHeader className="space-y-4 border-b border-border/50 bg-muted/10 pb-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <CardTitle className="font-display text-base">Team directory</CardTitle>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, email, phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-background"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {(['all', 'active', 'inactive'] as StatusFilter[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? 'default' : 'outline'}
                    className="h-8 rounded-full text-xs capitalize"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === 'all' ? 'All status' : s}
                  </Button>
                ))}
                {deptFilter !== 'all' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full text-xs gap-1"
                    onClick={() => setDeptFilter('all')}
                  >
                    <X className="h-3 w-3" />
                    Clear {deptFilter}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <StaffSkeleton />
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                    <UserCog className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">No team members found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {staff.length === 0
                      ? 'Add your first Elizade staff member to grant portal access via phone OTP.'
                      : 'Try adjusting your search or filters.'}
                  </p>
                  {staff.length === 0 && (
                    <Button className="mt-6 gap-2" onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4" />
                      Add first team member
                    </Button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {filtered.map((member) => {
                    const fullName = `${member.firstName} ${member.lastName}`
                    const isSelected = selected?.id === member.id
                    return (
                      <li key={member.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(member.id)}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 sm:p-5 text-left transition-colors group',
                            isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/40',
                          )}
                        >
                          <AvatarImage
                            name={fullName}
                            className={cn(
                              'h-12 w-12 ring-2 transition-all',
                              isSelected ? 'ring-primary/40' : 'ring-border group-hover:ring-primary/20',
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold truncate">{fullName}</p>
                              {member.isVerified && (
                                <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" aria-label="Verified" />
                              )}
                              <Badge variant={member.isActive ? 'success' : 'secondary'} className="text-[10px]">
                                {member.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <DepartmentBadge department={member.department} />
                              <span className="text-[11px] text-muted-foreground font-mono">{member.phone}</span>
                            </div>
                          </div>
                          <ChevronRight
                            className={cn(
                              'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                              isSelected && 'text-primary translate-x-0.5',
                            )}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Detail panel */}
        <FadeIn className="xl:col-span-2" delay={0.1}>
          <Card className="border-border/60 overflow-hidden h-full min-h-[320px]">
            {selected ? (
              <>
                <div className="relative p-6 pb-8 bg-gradient-to-br from-[#0a1628] via-[#0d1f38] to-[#0a1628] text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,207,15,0.15),transparent_50%)]" />
                  <div className="relative flex items-start gap-4">
                    <AvatarImage
                      name={`${selected.firstName} ${selected.lastName}`}
                      className="h-16 w-16 ring-2 ring-[#ffcf0f]/50 text-lg"
                    />
                    <div className="flex-1 min-w-0 pt-1">
                      <h2 className="font-display text-xl font-bold truncate">
                        {selected.firstName} {selected.lastName}
                      </h2>
                      <p className="text-white/60 text-sm mt-0.5">Staff · {selected.department}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge
                          className={cn(
                            'border-0',
                            selected.isActive
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white/10 text-white/70',
                          )}
                        >
                          {selected.isActive ? 'Active account' : 'Deactivated'}
                        </Badge>
                        {selected.isVerified && (
                          <Badge className="bg-[#ffcf0f]/20 text-[#ffcf0f] border-0 gap-1">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[11px] text-muted-foreground">Phone (OTP login)</p>
                          <p className="font-mono text-sm font-medium">{selected.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[11px] text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate">{selected.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[11px] text-muted-foreground">Location</p>
                          <p className="text-sm font-medium">{selected.city}, {selected.state}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-3 rounded-xl border border-border/60">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Joined
                        </p>
                        <p className="font-medium mt-1">{formatDateTime(selected.createdAt)}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/60">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Portal
                        </p>
                        <p className="font-medium mt-1">Staff access</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-border p-4 bg-muted/20">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Staff sign in at <span className="font-mono text-foreground">/login</span> with their phone.
                      Accounts are pre-verified — OTP appears in the API terminal during development.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant={selected.isActive ? 'outline' : 'default'}
                      className="flex-1 gap-2"
                      disabled={togglingId === selected.id}
                      onClick={() => toggleActive(selected)}
                    >
                      {selected.isActive ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Reactivate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0" aria-label="More actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[320px] text-center p-8">
                <UserCog className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Select a team member to view details</p>
              </CardContent>
            )}
          </Card>
        </FadeIn>
      </div>

      {/* Add staff slide-over */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => !submitting && setShowForm(false)}
            aria-label="Close"
          />
          <div
            className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl animate-fade-in flex flex-col h-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  New team member
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Pre-verified staff account with phone OTP access
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form id="staff-create-form" onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Quick onboarding
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  After creation, a welcome OTP is sent. The new member can sign in immediately at the staff portal.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="staff-first">First name</Label>
                    <Input
                      id="staff-first"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="h-11 rounded-xl"
                      placeholder="Goodness"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-last">Last name</Label>
                    <Input
                      id="staff-last"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="h-11 rounded-xl"
                      placeholder="Obi"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credentials</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="staff-phone">Mobile number</Label>
                    <Input
                      id="staff-phone"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="h-11 rounded-xl font-mono"
                      placeholder="0818 789 1548"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">Used for OTP sign-in — Nigerian format</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-email">Work email</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="h-11 rounded-xl"
                      placeholder="goodness@elizade.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role & location</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="staff-dept">Department</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {STAFF_DEPARTMENTS.map((d) => {
                        const meta = DEPARTMENT_META[d]
                        const active = form.department === d
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, department: d }))}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all',
                              active
                                ? cn(meta.bg, meta.border, 'ring-2 ring-primary/30')
                                : 'border-border hover:bg-muted/50',
                            )}
                          >
                            <meta.icon className={cn('h-4 w-4 shrink-0', active ? meta.color : 'text-muted-foreground')} />
                            <span className="font-medium">{d}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="staff-city">City</Label>
                      <Input
                        id="staff-city"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staff-state">State</Label>
                      <select
                        id="staff-state"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                        value={form.state}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      >
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-border/50 bg-muted/10 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="staff-create-form"
                className="flex-1 h-12 rounded-xl shadow-md shadow-primary/20 gap-2"
                disabled={submitting}
              >
                {submitting ? 'Creating…' : 'Create & send OTP'}
                {!submitting && <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
