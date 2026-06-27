import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Car,
  Filter,
  ImagePlus,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { VehicleThumb } from '@/components/ui/safe-image'
import { ApiError } from '@/lib/api'
import {
  bulkImportVehicles,
  createVehicle,
  deleteVehicle,
  deleteVehicleImage,
  getAdminVehicle,
  listAdminVehicles,
  updateVehicle,
  updateVehicleStatus,
  uploadVehicleImages,
  type VehicleAdminDetail,
  type VehicleAdminListItem,
  type VehicleCreateBody,
} from '@/lib/inventory-api'
import { listBranches, resolveMediaUrl } from '@/lib/vehicle-mappers'
import type { Branch } from '@/types'
import { formatCurrency } from '@/lib/utils'

const AVAILABILITY = ['available', 'reserved', 'sold', 'transferred'] as const

const EMPTY_FORM: VehicleCreateBody = {
  make: 'Toyota',
  model: '',
  trim: '',
  year: new Date().getFullYear(),
  color: '',
  colorHex: '#000000',
  price: 0,
  fuelType: 'Petrol',
  transmission: 'Automatic',
  engine: '',
  branchId: '',
  specs: {},
  isPublished: true,
  availability: 'available',
}

function statusVariant(status: string) {
  if (status === 'available') return 'success' as const
  if (status === 'reserved') return 'warning' as const
  return 'secondary' as const
}

function formFromListItem(row: VehicleAdminListItem): VehicleCreateBody {
  return {
    vin: row.vin ?? undefined,
    stockNumber: row.stockNumber ?? undefined,
    make: row.make,
    model: row.model,
    trim: row.trim,
    year: row.year,
    color: row.color,
    colorHex: '#000000',
    price: Number(row.price),
    promotionalPrice: row.promotionalPrice ? Number(row.promotionalPrice) : undefined,
    isPromotional: row.isPromotional,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engine: '',
    availability: row.availability,
    branchId: row.branchId,
    specs: {},
    isPublished: row.isPublished,
  }
}

function formFromDetail(d: VehicleAdminDetail): VehicleCreateBody {
  return {
    vin: d.vin ?? undefined,
    stockNumber: d.stockNumber ?? undefined,
    make: d.make,
    model: d.model,
    trim: d.trim,
    year: d.year,
    color: d.color,
    colorHex: d.colorHex,
    price: Number(d.price),
    promotionalPrice: d.promotionalPrice ? Number(d.promotionalPrice) : undefined,
    isPromotional: d.isPromotional,
    promotionLabel: d.promotionLabel ?? undefined,
    fuelType: d.fuelType,
    transmission: d.transmission,
    engine: d.engine,
    mileage: d.mileage ?? undefined,
    availability: d.availability,
    branchId: d.branchId,
    specs: (d.specs ?? {}) as Record<string, string>,
    isPublished: d.isPublished,
  }
}

export function AdminInventoryPage() {
  const [items, setItems] = useState<VehicleAdminListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<string>('all')
  const [branches, setBranches] = useState<Branch[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VehicleCreateBody>(EMPTY_FORM)
  const [detail, setDetail] = useState<VehicleAdminDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAdminVehicles({
        page,
        limit: 12,
        availability: availability === 'all' ? undefined : availability,
        sort: '-createdAt',
      })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [page, availability])

  useEffect(() => {
    listBranches()
      .then(setBranches)
      .catch(() => toast.error('Could not load branches'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (v) =>
        `${v.make} ${v.model} ${v.trim} ${v.vin ?? ''} ${v.stockNumber ?? ''}`
          .toLowerCase()
          .includes(q),
    )
  }, [items, search])

  const openCreate = () => {
    setEditingId(null)
    setDetail(null)
    setDetailLoading(false)
    setForm({
      ...EMPTY_FORM,
      branchId: branches[0]?.id ?? '',
    })
    setDrawerOpen(true)
  }

  const openEdit = (id: string) => {
    const row = items.find((v) => v.id === id)
    if (!row) return

    setEditingId(id)
    setDetail(null)
    setForm(formFromListItem(row))
    setDrawerOpen(true)
    setDetailLoading(true)

    getAdminVehicle(id)
      .then((d) => {
        setDetail(d)
        setForm(formFromDetail(d))
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load vehicle')
        setDrawerOpen(false)
      })
      .finally(() => setDetailLoading(false))
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDetailLoading(false)
  }

  const handleSave = async () => {
    if (!form.model || !form.trim || !form.branchId || !form.price) {
      toast.error('Model, trim, branch, and price are required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateVehicle(editingId, form)
        toast.success('Vehicle updated')
      } else {
        await createVehicle(form)
        toast.success('Vehicle created')
      }
      setDrawerOpen(false)
      setDetailLoading(false)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, next: string) => {
    try {
      await updateVehicleStatus(id, next)
      toast.success('Availability updated')
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Status update failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Soft-delete this listing?')) return
    try {
      await deleteVehicle(id)
      toast.success('Vehicle removed')
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const result = await bulkImportVehicles(file)
      toast.success(`Import complete: ${result.created} created, ${result.failed} failed`)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleUploadImages = async (files: FileList | null) => {
    if (!editingId || !files?.length) return
    setSaving(true)
    try {
      const updated = await uploadVehicleImages(editingId, Array.from(files))
      setDetail(updated)
      toast.success('Images uploaded')
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!editingId) return
    try {
      await deleteVehicleImage(editingId, imageId)
      const d = await getAdminVehicle(editingId)
      setDetail(d)
      toast.success('Image removed')
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove image')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" description="Publish, price, and manage vehicle listings">
        <div className="flex flex-wrap gap-2">
          <input
            ref={importRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            disabled={importing}
            onClick={() => importRef.current?.click()}
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Bulk import
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add vehicle
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search VIN, model, stock…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">All availability</option>
            {AVAILABILITY.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Car className="mx-auto h-10 w-10 opacity-40" />
            <p className="mt-4 font-medium">No vehicles found</p>
            <Button className="mt-4" onClick={openCreate}>
              Add your first listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <Card key={v.id} className="overflow-hidden group hover:shadow-xl transition-all">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <VehicleThumb
                    src={resolveMediaUrl(v.primaryImageUrl)}
                    alt={`${v.year} ${v.model}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold">
                        {v.year} {v.model} {v.trim}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{v.vin ?? v.stockNumber ?? '—'}</p>
                    </div>
                    <Badge variant={statusVariant(v.availability)}>{v.availability}</Badge>
                  </div>
                  <p className="font-display text-lg font-bold">{formatCurrency(Number(v.price))}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.branchName} · {v.color}
                    {!v.isPublished && ' · Draft'}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(v.id)}>
                      Edit
                    </Button>
                    <select
                      className="flex-1 h-9 rounded-md border border-border bg-background px-2 text-xs"
                      value={v.availability}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    >
                      {AVAILABILITY.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(v.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {page} · {total} total
              </span>
              <Button
                variant="outline"
                disabled={page * 12 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? 'Edit vehicle' : 'New vehicle'}
        description="Listing details shown on the public catalogue when published."
        width="xl"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || detailLoading}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                'Save changes'
              ) : (
                'Create listing'
              )}
            </Button>
          </div>
        }
      >
        {detailLoading && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Loading full listing details…
          </div>
        )}
        <DrawerSection title="Identity">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Model *</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trim *</Label>
              <Input value={form.trim} onChange={(e) => setForm({ ...form, trim: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Year</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Branch *</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">VIN</Label>
              <Input value={form.vin ?? ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Stock number</Label>
              <Input
                value={form.stockNumber ?? ''}
                onChange={(e) => setForm({ ...form, stockNumber: e.target.value })}
              />
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Pricing & status">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Price (₦) *</Label>
              <Input
                type="number"
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Promotional price</Label>
              <Input
                type="number"
                value={form.promotionalPrice ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    promotionalPrice: e.target.value ? Number(e.target.value) : undefined,
                    isPromotional: Boolean(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Availability</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={form.availability ?? 'available'}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
              >
                {AVAILABILITY.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Published</Label>
              <label className="flex items-center gap-2 h-10 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished ?? true}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Visible on public catalogue
              </label>
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Specifications">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Exterior colour</Label>
              <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Colour hex</Label>
              <Input value={form.colorHex} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fuel type</Label>
              <Input value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Transmission</Label>
              <Input
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Engine</Label>
              <Input value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} />
            </div>
          </div>
        </DrawerSection>

        {editingId && !detailLoading && detail && (
          <DrawerSection title="Images">
            <div className="flex flex-wrap gap-2 mb-3">
              {detail.images.map((img) => (
                <div key={img.id} className="relative h-20 w-28 rounded-lg overflow-hidden border">
                  <VehicleThumb src={resolveMediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded bg-black/60 p-1 text-white"
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUploadImages(e.target.files)}
            />
            <Button type="button" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-4 w-4" /> Upload images
            </Button>
          </DrawerSection>
        )}
      </Drawer>
    </div>
  )
}
