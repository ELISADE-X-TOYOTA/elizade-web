import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Play,
  Plus,
  Wrench,
  XCircle,
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiError } from '@/lib/api'
import {
  addAdditionalWork,
  changeAppointmentStatus,
  createServiceBay,
  getServiceAppointment,
  getServiceJob,
  getServiceStats,
  listServiceAppointments,
  listServiceBays,
  listServiceHistory,
  updateAdditionalWork,
  updateJobStage,
  updateServiceBay,
  type AppointmentBoardItem,
  type AppointmentDetail,
  type JobDetail,
  type ServiceBay,
  type ServiceStats,
} from '@/lib/service-ops-api'
import { listBranches } from '@/lib/vehicle-mappers'
import type { Branch } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { useAdminPageTitle } from '@/lib/admin-page-titles'
import { useAuth } from '@/context/AuthContext'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  requested: 'outline',
  confirmed: 'secondary',
  in_progress: 'default',
  awaiting_approval: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

const STATUS_CHART_COLORS: Record<string, string> = {
  confirmed: '#6366f1',
  in_progress: '#8b5cf6',
  awaiting_approval: '#f59e0b',
  completed: '#22c55e',
  requested: '#94a3b8',
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
  icon: typeof Calendar
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

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_BAY_FORM = {
  branchId: '',
  name: '',
  isActive: true,
}

export function AdminServiceOpsPage() {
  const pageTitle = useAdminPageTitle()
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [appointments, setAppointments] = useState<AppointmentBoardItem[]>([])
  const [bays, setBays] = useState<ServiceBay[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [date, setDate] = useState(todayIso())
  const [branchId, setBranchId] = useState('')
  const [bayBranchFilter, setBayBranchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<AppointmentDetail | null>(null)
  const [job, setJob] = useState<JobDetail | null>(null)

  const [bayDrawerOpen, setBayDrawerOpen] = useState(false)
  const [editingBay, setEditingBay] = useState<ServiceBay | null>(null)
  const [bayForm, setBayForm] = useState(EMPTY_BAY_FORM)
  const [baySaving, setBaySaving] = useState(false)
  const [extraForm, setExtraForm] = useState({ description: '', cost: '' })
  const [extraSaving, setExtraSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, apptRes, branchRows, historyRes, bayRows] = await Promise.all([
        getServiceStats(),
        listServiceAppointments({
          date,
          branchId: branchId || undefined,
          status: statusFilter,
        }),
        listBranches(),
        listServiceHistory(1, 1),
        listServiceBays(bayBranchFilter || undefined),
      ])
      setStats(statsRes)
      setAppointments(apptRes)
      setBranches(branchRows)
      setHistoryTotal(historyRes.total)
      setBays(bayRows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load service operations')
    } finally {
      setLoading(false)
    }
  }, [date, branchId, bayBranchFilter, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const statusChart = Object.entries(
    appointments.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1
      return acc
    }, {}),
  ).map(([status, count]) => ({
    status: status.replace('_', ' '),
    key: status,
    count,
  }))

  const openAppointment = async (row: AppointmentBoardItem) => {
    setBusyId(row.id)
    try {
      const detail = await getServiceAppointment(row.id)
      setSelected(detail)
      setJob(detail.jobId ? await getServiceJob(detail.jobId) : null)
      setDrawerOpen(true)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load appointment')
    } finally {
      setBusyId(null)
    }
  }

  const runAction = async (id: string, action: 'confirm' | 'start' | 'complete' | 'cancel') => {
    setBusyId(id)
    try {
      const detail = await changeAppointmentStatus(id, action)
      setSelected(detail)
      setJob(detail.jobId ? await getServiceJob(detail.jobId) : null)
      toast.success(`Appointment ${action === 'start' ? 'started' : action + 'ed'}`)
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  const toggleStage = async (stageId: string, completed: boolean) => {
    if (!job) return
    setBusyId(stageId)
    try {
      setJob(await updateJobStage(job.id, stageId, completed))
      toast.success(completed ? 'Stage completed' : 'Stage reopened')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update stage')
    } finally {
      setBusyId(null)
    }
  }

  const allowedActions = (status: string): Array<'confirm' | 'start' | 'complete' | 'cancel'> => {
    switch (status) {
      case 'requested':
        return ['confirm', 'cancel']
      case 'confirmed':
        return ['start', 'cancel']
      case 'in_progress':
      case 'awaiting_approval':
        return ['complete', 'cancel']
      default:
        return []
    }
  }

  const openCreateBay = () => {
    setEditingBay(null)
    setBayForm({
      ...EMPTY_BAY_FORM,
      branchId: bayBranchFilter || branches[0]?.id || '',
    })
    setBayDrawerOpen(true)
  }

  const openEditBay = (bay: ServiceBay) => {
    setEditingBay(bay)
    setBayForm({
      branchId: bay.branchId,
      name: bay.name,
      isActive: bay.isActive,
    })
    setBayDrawerOpen(true)
  }

  const saveBay = async () => {
    if (!bayForm.name.trim()) {
      toast.error('Bay name is required')
      return
    }
    if (!editingBay && !bayForm.branchId) {
      toast.error('Select a branch')
      return
    }

    setBaySaving(true)
    try {
      if (editingBay) {
        await updateServiceBay(editingBay.id, {
          name: bayForm.name.trim(),
          isActive: bayForm.isActive,
        })
        toast.success('Bay updated')
      } else {
        await createServiceBay({
          branchId: bayForm.branchId,
          name: bayForm.name.trim(),
        })
        toast.success('Bay created')
      }
      setBayDrawerOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save bay')
    } finally {
      setBaySaving(false)
    }
  }

  const toggleBayActive = async (bay: ServiceBay) => {
    setBusyId(bay.id)
    try {
      await updateServiceBay(bay.id, { isActive: !bay.isActive })
      toast.success(bay.isActive ? 'Bay deactivated' : 'Bay activated')
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update bay')
    } finally {
      setBusyId(null)
    }
  }

  const submitExtraWork = async () => {
    if (!job) return
    const cost = Number(extraForm.cost)
    if (!extraForm.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      toast.error('Enter a valid cost greater than zero')
      return
    }
    setExtraSaving(true)
    try {
      setJob(await addAdditionalWork(job.id, { description: extraForm.description.trim(), cost }))
      setExtraForm({ description: '', cost: '' })
      toast.success('Additional work sent for customer approval')
      await load()
      if (selected) {
        const detail = await getServiceAppointment(selected.id)
        setSelected(detail)
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add additional work')
    } finally {
      setExtraSaving(false)
    }
  }

  const decideExtraWork = async (workId: string, status: 'approved' | 'rejected') => {
    if (!job) return
    setBusyId(workId)
    try {
      setJob(await updateAdditionalWork(job.id, workId, { status }))
      toast.success(status === 'approved' ? 'Additional work approved' : 'Additional work rejected')
      await load()
      if (selected) {
        const detail = await getServiceAppointment(selected.id)
        setSelected(detail)
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update additional work')
    } finally {
      setBusyId(null)
    }
  }

  const canAddExtraWork =
    job != null && (job.status === 'in_progress' || job.status === 'awaiting_approval')

  const activeBayCount = bays.filter((b) => b.isActive).length

  return (
    <div className="space-y-6">
      <PageHeader title={pageTitle} description="Daily schedules, bay management, and live job progress">
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button variant="outline" className="gap-2" onClick={openCreateBay}>
              <Plus className="h-4 w-4" />
              Add bay
            </Button>
          )}
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatHighlight
          label="Today's appointments"
          value={stats?.todaysAppointments ?? 0}
          sub={`${appointments.length} on ${date}`}
          icon={Calendar}
          tone="bg-sky-500/15 text-sky-600"
        />
        <StatHighlight
          label="In progress"
          value={stats?.inProgress ?? 0}
          sub="Active bay jobs"
          icon={Wrench}
          tone="bg-violet-500/15 text-violet-600"
        />
        <StatHighlight
          label="Awaiting approval"
          value={stats?.awaitingApproval ?? 0}
          sub="Extra work pending"
          icon={Clock}
          tone="bg-amber-500/15 text-amber-600"
        />
        <StatHighlight
          label="Completed today"
          value={stats?.completed ?? 0}
          sub={`${historyTotal}+ history records`}
          icon={CheckCircle2}
          tone="bg-emerald-500/15 text-emerald-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-display text-base">Schedule load by status</CardTitle>
            <div className="flex flex-wrap gap-2 text-sm">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              />
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs max-w-[160px]"
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-[220px]">
            {statusChart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No appointments for this day</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} className="capitalize" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {statusChart.map((row) => (
                      <Cell key={row.key} fill={STATUS_CHART_COLORS[row.key] ?? 'var(--color-primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Quick filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {['all', 'confirmed', 'in_progress', 'awaiting_approval', 'completed'].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? 'default' : 'outline'}
                className="capitalize"
                onClick={() => setStatusFilter(s)}
              >
                {s.replace('_', ' ')}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Daily schedule — {date === todayIso() ? 'Today' : date}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading schedule…
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-16 text-center">No appointments scheduled</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left">
                  <th className="py-3 px-4 font-medium">Time</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Vehicle</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Bay</th>
                  <th className="py-3 px-4 font-medium">Branch</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 w-8" />
                </tr>
              </thead>
              <tbody>
                {appointments.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/40 hover:bg-muted/20 cursor-pointer"
                    onClick={() => openAppointment(s)}
                  >
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      {formatDateTime(s.scheduledAt).split(',')[1]?.trim() ?? formatDateTime(s.scheduledAt)}
                    </td>
                    <td className="py-3 px-4 font-medium">{s.customerName}</td>
                    <td className="py-3 px-4">{s.vehicleLabel}</td>
                    <td className="py-3 px-4 capitalize">{s.serviceType.replace('_', ' ')}</td>
                    <td className="py-3 px-4">{s.bayName ?? '—'}</td>
                    <td className="py-3 px-4">{s.branchName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'outline'} className="capitalize text-[10px]">
                        {s.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {busyId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-500" />
              Service bays
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {activeBayCount} active · {bays.length} total
              {!isAdmin && ' · View only (admin can add or edit)'}
            </p>
          </div>
          <select
            value={bayBranchFilter}
            onChange={(e) => setBayBranchFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm max-w-[200px]"
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading bays…
            </div>
          ) : bays.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No service bays configured
              {isAdmin ? ' — add one to assign appointments to bays.' : '.'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left">
                  <th className="py-3 px-4 font-medium">Bay</th>
                  <th className="py-3 px-4 font-medium">Branch</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Added</th>
                  {isAdmin && <th className="py-3 px-4 font-medium w-40">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bays.map((bay) => (
                  <tr key={bay.id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium">{bay.name}</td>
                    <td className="py-3 px-4">{bay.branchName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={bay.isActive ? 'success' : 'secondary'}>
                        {bay.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(bay.createdAt)}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditBay(bay)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={bay.isActive ? 'destructive' : 'default'}
                            disabled={busyId === bay.id}
                            onClick={() => toggleBayActive(bay)}
                          >
                            {busyId === bay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : bay.isActive ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.customerName ?? 'Appointment'}
        description={selected ? `${selected.vehicleLabel} · ${selected.branchName}` : undefined}
        width="lg"
      >
        {selected && (
          <>
            <DrawerSection title="Appointment">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={STATUS_VARIANT[selected.status] ?? 'outline'} className="capitalize mt-1">
                    {selected.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p>{formatDateTime(selected.scheduledAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service type</p>
                  <p className="capitalize">{selected.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bay</p>
                  <p>{selected.bayName ?? 'Unassigned'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Issue</p>
                  <p>{selected.issueDescription}</p>
                </div>
              </div>
            </DrawerSection>

            {allowedActions(selected.status).length > 0 && (
              <DrawerSection title="Actions">
                <div className="flex flex-wrap gap-2">
                  {allowedActions(selected.status).map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      variant={action === 'cancel' ? 'destructive' : action === 'start' ? 'default' : 'outline'}
                      disabled={busyId === selected.id}
                      onClick={() => runAction(selected.id, action)}
                      className="gap-1 capitalize"
                    >
                      {action === 'start' && <Play className="h-3.5 w-3.5" />}
                      {action === 'complete' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {action === 'cancel' && <XCircle className="h-3.5 w-3.5" />}
                      {action}
                    </Button>
                  ))}
                </div>
              </DrawerSection>
            )}

            {job && (
              <DrawerSection title="Job progress">
                <p className="text-xs text-muted-foreground mb-3">
                  {job.stagesCompleted}/{job.stagesTotal} stages complete · {job.status.replace('_', ' ')}
                </p>
                <Tabs defaultValue="stages">
                  <TabsList className="mb-3">
                    <TabsTrigger value="stages">Stages</TabsTrigger>
                    <TabsTrigger value="extras">Extra work ({job.additionalWork.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="stages" className="space-y-2">
                    {job.stages.map((stage) => (
                      <label
                        key={stage.id}
                        className="flex items-center gap-3 rounded-lg border border-border/60 p-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={stage.completed}
                          disabled={busyId === stage.id}
                          onChange={(e) => toggleStage(stage.id, e.target.checked)}
                        />
                        <span className={cn('text-sm', stage.completed && 'line-through text-muted-foreground')}>
                          {stage.label}
                        </span>
                      </label>
                    ))}
                  </TabsContent>
                  <TabsContent value="extras" className="space-y-3">
                    {canAddExtraWork && (
                      <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Request additional work</p>
                        <Input
                          value={extraForm.description}
                          onChange={(e) => setExtraForm({ ...extraForm, description: e.target.value })}
                          placeholder="Describe the extra repair or part needed"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={extraForm.cost}
                            onChange={(e) => setExtraForm({ ...extraForm, cost: e.target.value })}
                            placeholder="Cost (₦)"
                            className="flex-1"
                          />
                          <Button size="sm" onClick={submitExtraWork} disabled={extraSaving}>
                            {extraSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send for approval'}
                          </Button>
                        </div>
                      </div>
                    )}
                    {job.additionalWork.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No additional work requests</p>
                    ) : (
                      job.additionalWork.map((w) => (
                        <div key={w.id} className="rounded-lg border border-border/60 p-3 text-sm space-y-2">
                          <p className="font-medium">{w.description}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            ₦{Number(w.cost).toLocaleString()} · {w.status.replace('_', ' ')}
                          </p>
                          {w.status === 'pending_approval' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={busyId === w.id}
                                onClick={() => decideExtraWork(w.id, 'approved')}
                              >
                                Approve on behalf
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === w.id}
                                onClick={() => decideExtraWork(w.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </DrawerSection>
            )}
          </>
        )}
      </Drawer>

      <Drawer
        open={bayDrawerOpen}
        onClose={() => setBayDrawerOpen(false)}
        title={editingBay ? 'Edit service bay' : 'New service bay'}
        description={
          editingBay
            ? 'Rename the bay or deactivate it to stop new assignments'
            : 'Add a workshop bay at a branch for scheduling and job tracking'
        }
        width="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setBayDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBay} disabled={baySaving}>
              {baySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingBay ? 'Save changes' : 'Create bay'}
            </Button>
          </div>
        }
      >
        <DrawerSection title="Bay details">
          <div className="space-y-3">
            {!editingBay && (
              <div className="space-y-1">
                <Label>Branch</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={bayForm.branchId}
                  onChange={(e) => setBayForm({ ...bayForm, branchId: e.target.value })}
                >
                  <option value="">Select branch…</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {editingBay && (
              <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <p className="text-xs text-muted-foreground">Branch</p>
                <p className="font-medium">{editingBay.branchName}</p>
              </div>
            )}
            <div className="space-y-1">
              <Label>Bay name</Label>
              <Input
                value={bayForm.name}
                onChange={(e) => setBayForm({ ...bayForm, name: e.target.value })}
                placeholder="Bay 1 · Express lane"
              />
            </div>
            {editingBay && (
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Inactive bays cannot be assigned to appointments</p>
                </div>
                <Switch
                  checked={bayForm.isActive}
                  onCheckedChange={(checked) => setBayForm({ ...bayForm, isActive: checked })}
                />
              </div>
            )}
          </div>
        </DrawerSection>
      </Drawer>
    </div>
  )
}
