import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  BadgeCheck,
  Car,
  ChevronRight,
  FileText,
  Loader2,
  Megaphone,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiError } from '@/lib/api'
import {
  createRecallCampaign,
  createWarrantyCertificate,
  getWarrantySummary,
  listOwnedVehicleOptions,
  listRecallCampaigns,
  listWarrantyCertificates,
  listWarrantyClaims,
  notifyRecallCampaign,
  updateWarrantyClaim,
  type OwnedVehicleOption,
  type RecallCampaign,
  type WarrantyCertificate,
  type WarrantyClaim,
  type WarrantySummary,
} from '@/lib/warranty-api'
import { listSupportAssignees, type SupportAssignee } from '@/lib/support-api'
import { cn, formatDateTime } from '@/lib/utils'

const CLAIM_FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
] as const

const CLAIM_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  submitted: 'outline',
  under_review: 'secondary',
  escalated: 'warning',
  approved: 'success',
  rejected: 'destructive',
  closed: 'default',
}

const SEVERITY_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'warning',
  critical: 'destructive',
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
  icon: typeof Shield
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

export function AdminWarrantyPage() {
  const [summary, setSummary] = useState<WarrantySummary | null>(null)
  const [claims, setClaims] = useState<WarrantyClaim[]>([])
  const [claimsTotal, setClaimsTotal] = useState(0)
  const [claimFilter, setClaimFilter] = useState('pending')
  const [recalls, setRecalls] = useState<RecallCampaign[]>([])
  const [certificates, setCertificates] = useState<WarrantyCertificate[]>([])
  const [assignees, setAssignees] = useState<SupportAssignee[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [claimDrawerOpen, setClaimDrawerOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [assigneeId, setAssigneeId] = useState('')

  const [certDrawerOpen, setCertDrawerOpen] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleOptions, setVehicleOptions] = useState<OwnedVehicleOption[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [certType, setCertType] = useState('standard')
  const [creatingCert, setCreatingCert] = useState(false)

  const [recallDrawerOpen, setRecallDrawerOpen] = useState(false)
  const [recallForm, setRecallForm] = useState({
    referenceCode: '',
    title: '',
    description: '',
    severity: 'medium',
    affectedModels: '',
    affectedYearFrom: '',
    affectedYearTo: '',
  })
  const [creatingRecall, setCreatingRecall] = useState(false)
  const [notifyingRecallId, setNotifyingRecallId] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, claimRes, recallRows, certRows, assigneeRows] = await Promise.all([
        getWarrantySummary(),
        listWarrantyClaims(claimFilter, 1, 50),
        listRecallCampaigns(),
        listWarrantyCertificates(),
        listSupportAssignees(),
      ])
      setSummary(summaryRes)
      setClaims(claimRes.items)
      setClaimsTotal(claimRes.total)
      setRecalls(recallRows)
      setCertificates(certRows)
      setAssignees(assigneeRows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load warranty data')
    } finally {
      setLoading(false)
    }
  }, [claimFilter])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!certDrawerOpen) return
    const t = window.setTimeout(async () => {
      try {
        setVehicleOptions(await listOwnedVehicleOptions(vehicleSearch.trim() || undefined))
      } catch {
        /* ignore search errors */
      }
    }, 300)
    return () => window.clearTimeout(t)
  }, [certDrawerOpen, vehicleSearch])

  const openClaim = (claim: WarrantyClaim) => {
    setSelectedClaim(claim)
    setResolutionNotes(claim.resolutionNotes ?? '')
    setAssigneeId(claim.assignedToId ?? '')
    setClaimDrawerOpen(true)
  }

  const handleClaimUpdate = async (status?: string) => {
    if (!selectedClaim) return
    setBusyId(selectedClaim.id)
    try {
      const updated = await updateWarrantyClaim(selectedClaim.id, {
        ...(status ? { status } : {}),
        resolutionNotes: resolutionNotes.trim() || undefined,
        assignedToId: assigneeId || '',
      })
      setSelectedClaim(updated)
      toast.success(status ? `Claim ${status.replace('_', ' ')}` : 'Claim updated')
      await loadAll()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update claim')
    } finally {
      setBusyId(null)
    }
  }

  const handleCreateCertificate = async () => {
    if (!selectedVehicleId) {
      toast.error('Select a vehicle')
      return
    }
    setCreatingCert(true)
    try {
      await createWarrantyCertificate({ ownedVehicleId: selectedVehicleId, type: certType })
      toast.success('Certificate issued')
      setCertDrawerOpen(false)
      setSelectedVehicleId('')
      setVehicleSearch('')
      await loadAll()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to issue certificate')
    } finally {
      setCreatingCert(false)
    }
  }

  const handleCreateRecall = async () => {
    if (!recallForm.referenceCode.trim() || !recallForm.title.trim() || !recallForm.description.trim()) {
      toast.error('Fill in reference, title, and description')
      return
    }
    setCreatingRecall(true)
    try {
      await createRecallCampaign({
        referenceCode: recallForm.referenceCode.trim(),
        title: recallForm.title.trim(),
        description: recallForm.description.trim(),
        severity: recallForm.severity,
        affectedModels: recallForm.affectedModels
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        affectedYearFrom: recallForm.affectedYearFrom ? Number(recallForm.affectedYearFrom) : undefined,
        affectedYearTo: recallForm.affectedYearTo ? Number(recallForm.affectedYearTo) : undefined,
      })
      toast.success('Recall campaign created')
      setRecallDrawerOpen(false)
      setRecallForm({
        referenceCode: '',
        title: '',
        description: '',
        severity: 'medium',
        affectedModels: '',
        affectedYearFrom: '',
        affectedYearTo: '',
      })
      await loadAll()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create recall')
    } finally {
      setCreatingRecall(false)
    }
  }

  const handleNotifyRecall = async (recall: RecallCampaign) => {
    setNotifyingRecallId(recall.id)
    try {
      const res = await notifyRecallCampaign(recall.id)
      toast.success(`Notified ${res.notifiedCount} customer${res.notifiedCount === 1 ? '' : 's'}`)
      await loadAll()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to send notifications')
    } finally {
      setNotifyingRecallId(null)
    }
  }

  const recallProgress = useMemo(
    () =>
      recalls.map((r) => ({
        ...r,
        notifyPct: r.affectedCount > 0 ? Math.round((r.notifiedCount / r.affectedCount) * 100) : 0,
        completePct: r.affectedCount > 0 ? Math.round((r.completedCount / r.affectedCount) * 100) : 0,
      })),
    [recalls],
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Warranty & Recalls"
        description="Claims workflow, certificate issuance, and recall campaign management"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setRecallDrawerOpen(true)}>
            <Megaphone className="h-4 w-4" /> New recall
          </Button>
          <Button className="gap-2" onClick={() => setCertDrawerOpen(true)}>
            <Plus className="h-4 w-4" /> Issue certificate
          </Button>
        </div>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatHighlight
          label="Pending claims"
          value={summary?.pendingClaims ?? 0}
          sub={`${summary?.escalatedClaims ?? 0} escalated`}
          icon={ShieldAlert}
          tone="bg-amber-500/12 text-amber-600 dark:text-amber-400"
        />
        <StatHighlight
          label="Active certificates"
          value={summary?.activeCertificates ?? 0}
          sub="Currently valid coverage"
          icon={BadgeCheck}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatHighlight
          label="Active recalls"
          value={summary?.activeRecalls ?? 0}
          sub="Open campaigns"
          icon={AlertTriangle}
          tone="bg-rose-500/12 text-rose-600 dark:text-rose-400"
        />
        <StatHighlight
          label="Queue total"
          value={claimsTotal}
          sub="Matching current filter"
          icon={FileText}
          tone="bg-indigo-500/12 text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading warranty data…
        </div>
      ) : (
        <Tabs defaultValue="claims">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="claims">Claims ({claimsTotal})</TabsTrigger>
            <TabsTrigger value="recalls">Recalls ({recalls.length})</TabsTrigger>
            <TabsTrigger value="certificates">Certificates ({certificates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-4 mt-6">
            <div className="flex flex-wrap gap-2">
              {CLAIM_FILTERS.map((f) => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={claimFilter === f.key ? 'default' : 'outline'}
                  onClick={() => setClaimFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {claims.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  No claims match this filter
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Claim</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Vehicle</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Assignee</th>
                        <th className="px-4 py-3 font-medium">Updated</th>
                        <th className="px-4 py-3 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-border/40 hover:bg-muted/20 cursor-pointer transition-colors"
                          onClick={() => openClaim(c)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium">{c.claimType}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{c.description}</p>
                          </td>
                          <td className="px-4 py-3">{c.customerName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.vehicleLabel}</td>
                          <td className="px-4 py-3">
                            <Badge variant={CLAIM_STATUS_VARIANT[c.status] ?? 'outline'} className="capitalize">
                              {c.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{c.assignedToName ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(c.updatedAt)}</td>
                          <td className="px-4 py-3">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recalls" className="space-y-4 mt-6">
            {recallProgress.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center text-sm text-muted-foreground">No recall campaigns yet</CardContent>
              </Card>
            ) : (
              recallProgress.map((r) => (
                <Card key={r.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={SEVERITY_VARIANT[r.severity] ?? 'outline'} className="capitalize">
                            {r.severity}
                          </Badge>
                          <Badge variant={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Closed'}</Badge>
                          <span className="text-xs font-mono text-muted-foreground">{r.referenceCode}</span>
                        </div>
                        <h3 className="font-display font-semibold text-lg">{r.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                        {r.affectedModels.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Models: {r.affectedModels.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 min-w-[200px]">
                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                          <div className="rounded-xl bg-muted/40 p-3">
                            <p className="font-display text-lg font-bold">{r.affectedCount}</p>
                            <p className="text-muted-foreground mt-0.5">Affected</p>
                          </div>
                          <div className="rounded-xl bg-muted/40 p-3">
                            <p className="font-display text-lg font-bold">{r.notifiedCount}</p>
                            <p className="text-muted-foreground mt-0.5">Notified</p>
                          </div>
                          <div className="rounded-xl bg-muted/40 p-3">
                            <p className="font-display text-lg font-bold">{r.completedCount}</p>
                            <p className="text-muted-foreground mt-0.5">Done</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          disabled={notifyingRecallId === r.id || r.notifiedCount >= r.affectedCount}
                          onClick={() => handleNotifyRecall(r)}
                        >
                          {notifyingRecallId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Megaphone className="h-4 w-4" />
                          )}
                          Notify pending ({Math.max(0, r.affectedCount - r.notifiedCount)})
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Notification progress</span>
                          <span>{r.notifyPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${r.notifyPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Service completion</span>
                          <span>{r.completePct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${r.completePct}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4 mt-6">
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <p className="text-sm text-muted-foreground mb-4">No certificates issued yet</p>
                  <Button className="gap-2" onClick={() => setCertDrawerOpen(true)}>
                    <Plus className="h-4 w-4" /> Issue first certificate
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-display">{cert.certificateNumber}</CardTitle>
                        <Badge variant={cert.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                          {cert.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{cert.vehicleLabel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCheck className="h-4 w-4 shrink-0" />
                        <span>{cert.customerName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{cert.type} warranty</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(cert.coverageStart)} → {formatDateTime(cert.coverageEnd)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cert.coverageDetails.slice(0, 4).map((d) => (
                          <Badge key={d} variant="outline" className="text-[10px]">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Drawer
        open={claimDrawerOpen}
        onClose={() => setClaimDrawerOpen(false)}
        title={selectedClaim?.claimType ?? 'Claim'}
        description={selectedClaim?.vehicleLabel}
        width="lg"
        footer={
          selectedClaim && !['approved', 'rejected', 'closed'].includes(selectedClaim.status) ? (
            <div className="flex flex-wrap gap-2 justify-end w-full">
              <Button variant="outline" onClick={() => setClaimDrawerOpen(false)}>Close</Button>
              <Button variant="outline" disabled={busyId === selectedClaim.id} onClick={() => handleClaimUpdate()}>
                Save notes
              </Button>
              <Button variant="outline" disabled={busyId === selectedClaim.id} onClick={() => handleClaimUpdate('escalated')}>
                Escalate
              </Button>
              <Button variant="outline" disabled={busyId === selectedClaim.id} onClick={() => handleClaimUpdate('rejected')}>
                Reject
              </Button>
              <Button disabled={busyId === selectedClaim.id} onClick={() => handleClaimUpdate('approved')}>
                Approve
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setClaimDrawerOpen(false)}>Close</Button>
          )
        }
      >
        {selectedClaim && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={CLAIM_STATUS_VARIANT[selectedClaim.status] ?? 'outline'} className="capitalize">
                {selectedClaim.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{selectedClaim.claimType}</Badge>
            </div>
            <DrawerSection title="Customer">
              <p className="text-sm font-medium">{selectedClaim.customerName}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedClaim.description}</p>
            </DrawerSection>
            <div className="space-y-1.5">
              <Label className="text-xs">Assign to</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Resolution notes</Label>
              <textarea
                className="w-full min-h-[96px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document inspection findings, parts ordered, or rejection reason…"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Opened {formatDateTime(selectedClaim.createdAt)} · Updated {formatDateTime(selectedClaim.updatedAt)}
            </p>
          </div>
        )}
      </Drawer>

      <Drawer
        open={certDrawerOpen}
        onClose={() => setCertDrawerOpen(false)}
        title="Issue warranty certificate"
        description="Link coverage to a customer vehicle"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setCertDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCertificate} disabled={creatingCert}>
              {creatingCert ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Issue certificate'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Search vehicle or customer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="Registration, VIN, model, or name…"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vehicle</Label>
            <select
              className="w-full min-h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="">Select vehicle…</option>
              {vehicleOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {v.customerName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Certificate type</Label>
            <select
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
            >
              <option value="standard">Standard (12 months)</option>
              <option value="extended">Extended (24 months)</option>
            </select>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={recallDrawerOpen}
        onClose={() => setRecallDrawerOpen(false)}
        title="Create recall campaign"
        description="Define affected models and notify matching vehicles"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setRecallDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRecall} disabled={creatingRecall}>
              {creatingRecall ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create campaign'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Reference code</Label>
              <Input
                value={recallForm.referenceCode}
                onChange={(e) => setRecallForm((f) => ({ ...f, referenceCode: e.target.value }))}
                placeholder="REC-2026-0150"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Severity</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={recallForm.severity}
                onChange={(e) => setRecallForm((f) => ({ ...f, severity: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              value={recallForm.title}
              onChange={(e) => setRecallForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Fuel pump module inspection"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={recallForm.description}
              onChange={(e) => setRecallForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the defect and required action…"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Affected models (comma-separated)</Label>
            <Input
              value={recallForm.affectedModels}
              onChange={(e) => setRecallForm((f) => ({ ...f, affectedModels: e.target.value }))}
              placeholder="RAV4, Camry"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Year from</Label>
              <Input
                type="number"
                value={recallForm.affectedYearFrom}
                onChange={(e) => setRecallForm((f) => ({ ...f, affectedYearFrom: e.target.value }))}
                placeholder="2022"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Year to</Label>
              <Input
                type="number"
                value={recallForm.affectedYearTo}
                onChange={(e) => setRecallForm((f) => ({ ...f, affectedYearTo: e.target.value }))}
                placeholder="2025"
              />
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
