import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Car, CheckCircle2, FileText, Loader2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { ApiError } from '@/lib/api'
import {
  listOwnershipRequests,
  updateOwnershipRequest,
  type OwnershipRequestListItem,
} from '@/lib/ownership-api'
import { cn, formatDateTime } from '@/lib/utils'
import { useAdminPageTitle } from '@/lib/admin-page-titles'

const STATUS_FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'pending_documents', label: 'Needs documents' },
  { key: 'under_review', label: 'Under review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
] as const

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  pending: 'outline',
  pending_documents: 'warning',
  under_review: 'secondary',
  approved: 'success',
  rejected: 'destructive',
}

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

function inServiceDateToIso(date: string): string {
  return `${date}T12:00:00.000Z`
}

export function AdminOwnershipPage() {
  useAdminPageTitle()
  const [filter, setFilter] = useState('pending')
  const [items, setItems] = useState<OwnershipRequestListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<OwnershipRequestListItem | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [inServiceDate, setInServiceDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listOwnershipRequests(filter)
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const openItem = (row: OwnershipRequestListItem) => {
    setSelected(row)
    setAdminNotes(row.adminNotes ?? '')
    setRegistrationNumber(row.registrationNumber ?? '')
    setInServiceDate('')
    setDrawerOpen(true)
  }

  const handleUpdate = async (status?: string) => {
    if (!selected) return

    if (status === 'approved' && inServiceDate && inServiceDate > todayDateInputValue()) {
      toast.error('In-service date cannot be in the future')
      return
    }

    setBusyId(selected.id)
    try {
      const updated = await updateOwnershipRequest(selected.id, {
        status,
        adminNotes: adminNotes.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
        inServiceDate:
          status === 'approved' && inServiceDate.trim()
            ? inServiceDateToIso(inServiceDate.trim())
            : undefined,
      })
      setSelected(updated)
      toast.success(status ? `Request ${status.replace('_', ' ')}` : 'Request updated')
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
        title="Vehicle ownership"
        description="Review customer chassis/VIN claims and link purchased vehicles to their accounts"
      />

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'default' : 'outline'}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
          <Badge variant="secondary" className="ml-auto self-center">
            {total} request{total === 1 ? '' : 's'}
          </Badge>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">No requests match this filter</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">VIN / Chassis</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/60 hover:bg-muted/40 cursor-pointer"
                    onClick={() => openItem(row)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.customerName}</p>
                      <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.vin}</td>
                    <td className="px-4 py-3">
                      {row.vehiclePreview ? (
                        <span>
                          {row.vehiclePreview.year} {row.vehiclePreview.model} {row.vehiclePreview.trim}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not in inventory</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'} className="capitalize">
                        {row.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Ownership request"
        description={selected?.vin}
        width="lg"
        footer={
          selected && !['approved', 'rejected'].includes(selected.status) ? (
            <div className="flex flex-wrap gap-2 justify-end w-full">
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
              <Button variant="outline" disabled={busyId === selected.id} onClick={() => handleUpdate()}>
                Save notes
              </Button>
              <Button
                variant="outline"
                disabled={busyId === selected.id}
                onClick={() => handleUpdate('pending_documents')}
              >
                Request documents
              </Button>
              <Button variant="outline" disabled={busyId === selected.id} onClick={() => handleUpdate('rejected')}>
                Reject
              </Button>
              <Button disabled={busyId === selected.id} onClick={() => handleUpdate('approved')}>
                Approve & link vehicle
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={STATUS_VARIANT[selected.status] ?? 'outline'} className="capitalize">
                {selected.status.replace('_', ' ')}
              </Badge>
              {selected.vehiclePreview && (
                <Badge variant="outline">
                  {selected.vehiclePreview.year} {selected.vehiclePreview.model}
                </Badge>
              )}
            </div>

            <DrawerSection title="Customer">
              <p className="text-sm font-medium">{selected.customerName}</p>
              <p className="text-sm text-muted-foreground">{selected.customerEmail}</p>
              {selected.customerNotes && (
                <p className="text-sm mt-2 text-muted-foreground">{selected.customerNotes}</p>
              )}
            </DrawerSection>

            {selected.vehiclePreview && (
              <DrawerSection title="Matched vehicle">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10')}>
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selected.vehiclePreview.year} {selected.vehiclePreview.make} {selected.vehiclePreview.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.vehiclePreview.trim} · {selected.vehiclePreview.color}
                      {selected.vehiclePreview.availability ? ` · ${selected.vehiclePreview.availability}` : ''}
                    </p>
                  </div>
                </div>
              </DrawerSection>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Registration number</Label>
              <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
            </div>

            {!['approved', 'rejected'].includes(selected.status) && (
              <div className="space-y-1.5">
                <Label className="text-xs">In-service / delivery date</Label>
                <Input
                  type="date"
                  value={inServiceDate}
                  max={todayDateInputValue()}
                  onChange={(e) => setInServiceDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Sets the warranty start date. Leave blank to use today&apos;s date when you approve.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Admin notes (visible to customer when requesting documents)</Label>
              <textarea
                className="w-full min-h-[96px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ask for purchase invoice, ID, or registration papers…"
              />
            </div>

            {selected.documentUrls.length > 0 && (
              <DrawerSection title="Uploaded documents">
                <ul className="space-y-2">
                  {selected.documentUrls.map((url) => (
                    <li key={url}>
                      <a
                        href={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? ''}${url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View document
                      </a>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

            {selected.status === 'approved' && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Vehicle linked — warranty certificate issued automatically
              </div>
            )}
            {selected.status === 'rejected' && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                Request rejected
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
