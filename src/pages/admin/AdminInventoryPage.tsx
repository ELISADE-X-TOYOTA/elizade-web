import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Car,
  ChevronLeft,
  CreditCard,
  Calendar,
  Eye,
  Fuel,
  Gauge,
  ImagePlus,
  Loader2,
  MapPin,
  Maximize2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react'
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
import { getVehicleImages } from '@/lib/images'
import type { Branch } from '@/types'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'

const AVAILABILITY = ['available', 'reserved', 'sold', 'transferred'] as const
const FEATURED_TONES = [
  'from-amber-100/80 via-amber-50/40 to-card dark:from-amber-500/10',
  'from-sky-100/80 via-sky-50/40 to-card dark:from-sky-500/10',
  'from-rose-100/80 via-rose-50/40 to-card dark:from-rose-500/10',
]

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

type DrawerMode = 'detail' | 'edit' | 'create'

function statusVariant(status: string) {
  if (status === 'available') return 'default' as const
  if (status === 'reserved') return 'warning' as const
  return 'secondary' as const
}

function availabilityBadgeClass(status: string) {
  if (status === 'available') return 'border-transparent bg-[#ffcf0f]/25 text-[#121a2a] dark:bg-[#ffcf0f]/20 dark:text-[#ffcf0f]'
  if (status === 'reserved') return 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400'
  return ''
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

function pickFeatured(items: VehicleAdminListItem[]) {
  const promo = items.filter((v) => v.isPromotional && v.availability === 'available')
  const available = items.filter((v) => v.availability === 'available' && v.isPublished)
  const pool = [...promo, ...available.filter((v) => !promo.some((p) => p.id === v.id))]
  return pool.slice(0, 3)
}

export function AdminInventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<VehicleAdminListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<string>('all')
  const [makeFilter, setMakeFilter] = useState('all')
  const [branches, setBranches] = useState<Branch[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VehicleCreateBody>(EMPTY_FORM)
  const [detail, setDetail] = useState<VehicleAdminDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const openedFromUrl = useRef<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAdminVehicles({
        page,
        limit: 24,
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

  const makes = useMemo(() => {
    const set = new Set(items.map((v) => v.make))
    return ['all', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((v) => {
      if (makeFilter !== 'all' && v.make !== makeFilter) return false
      if (!q) return true
      return `${v.make} ${v.model} ${v.trim} ${v.vin ?? ''} ${v.stockNumber ?? ''}`.toLowerCase().includes(q)
    })
  }, [items, search, makeFilter])

  const featured = useMemo(() => pickFeatured(filtered), [filtered])
  const featuredIds = useMemo(() => new Set(featured.map((f) => f.id)), [featured])
  const listRows = useMemo(() => filtered.filter((v) => !featuredIds.has(v.id)), [filtered, featuredIds])

  const openCreate = () => {
    setEditingId(null)
    setDetail(null)
    setDrawerMode('create')
    setDetailLoading(false)
    setForm({ ...EMPTY_FORM, branchId: branches[0]?.id ?? '' })
    setDrawerOpen(true)
  }

  const loadDetail = async (id: string, mode: DrawerMode) => {
    setEditingId(id)
    setDrawerMode(mode)
    setDrawerOpen(true)
    setDetailLoading(true)
    setDetail(null)
    const row = items.find((v) => v.id === id)
    if (row) setForm(formFromListItem(row))
    try {
      const d = await getAdminVehicle(id)
      setDetail(d)
      if (mode === 'edit') setForm(formFromDetail(d))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load vehicle')
      setDrawerOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const openDetail = (id: string) => loadDetail(id, 'detail')
  const openEdit = (id: string) => loadDetail(id, 'edit')

  useEffect(() => {
    const vehicleId = searchParams.get('vehicle')
    if (!vehicleId || openedFromUrl.current === vehicleId || loading) return
    openedFromUrl.current = vehicleId
    openDetail(vehicleId)
    searchParams.delete('vehicle')
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, loading, setSearchParams])

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
      if (detail?.id === id) setDetail(await getAdminVehicle(id))
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
      setDrawerOpen(false)
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

  const vehicleImage = (url: string | null | undefined, model: string) => {
    const resolved = resolveMediaUrl(url)
    if (resolved && !resolved.includes('unsplash.com') && !resolved.includes('picsum.photos')) {
      return resolved
    }
    return getVehicleImages(model)[0] || ''
  }

  const detailImage = vehicleImage(
    detail?.images?.find((img) => img.isPrimary)?.url
      ?? detail?.images?.[0]?.url
      ?? detail?.primaryImageUrl
      ?? items.find((v) => v.id === editingId)?.primaryImageUrl,
    detail?.model ?? items.find((v) => v.id === editingId)?.model ?? 'Corolla',
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Vehicle inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publish, price, and manage catalogue listings</p>
        </div>
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
          <Button variant="outline" className="gap-2 rounded-xl" disabled={importing} onClick={() => importRef.current?.click()}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Bulk import
          </Button>
          <Button className="gap-2 rounded-xl shadow-md shadow-[#ffcf0f]/20" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add vehicle
          </Button>
        </div>
      </div>

      {/* Search + filters — RentalX style */}
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search a vehicle — model, VIN, stock number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-2xl border-border/70 bg-[#f7f8fb] pl-11 pr-14 dark:bg-muted/30"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-xl"
              title="Filter availability"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm lg:min-w-[180px]"
          >
            <option value="all">All availability</option>
            {AVAILABILITY.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Brand pills */}
      <div className="flex flex-wrap gap-2">
        {makes.map((make) => (
          <button
            key={make}
            type="button"
            onClick={() => setMakeFilter(make)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              makeFilter === make
                ? 'border-[#121a2a] bg-[#121a2a] text-white dark:border-[#ffcf0f] dark:bg-[#ffcf0f] dark:text-[#121a2a]'
                : 'border-border bg-card text-muted-foreground hover:border-foreground/30',
            )}
          >
            {make === 'all' ? 'All brands' : make}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Car className="mx-auto h-10 w-10 opacity-40" />
            <p className="mt-4 font-medium">No vehicles found</p>
            <Button className="mt-4 rounded-xl" onClick={openCreate}>Add your first listing</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Featured top 3 */}
          {featured.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Featured listings</h2>
                <p className="text-xs text-muted-foreground">Promotional & available units</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {featured.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => openDetail(v.id)}
                    className={cn(
                      'group overflow-hidden rounded-[1.75rem] border border-border/60 bg-card text-left shadow-sm transition-all hover:shadow-lg',
                    )}
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      {v.isPromotional && (
                        <Badge className="absolute left-4 top-4 z-10 bg-[#c8102e] text-white">Promo</Badge>
                      )}
                      <VehicleThumb
                        src={vehicleImage(v.primaryImageUrl, v.model)}
                        alt={`${v.year} ${v.model}`}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className={cn('p-4', FEATURED_TONES[i % FEATURED_TONES.length])}>
                      <p className="font-display text-lg font-bold">{v.year} {v.model}</p>
                      <p className="text-sm text-muted-foreground">{v.trim} · {v.color}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="font-display text-xl font-bold">{formatCurrency(Number(v.price))}</p>
                        <Badge variant={statusVariant(v.availability)} className={availabilityBadgeClass(v.availability)}>
                          {v.availability}
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{v.branchName}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List table */}
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="font-display text-base font-semibold">All listings</h2>
              <p className="text-xs text-muted-foreground">{listRows.length} vehicles in current view</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#f8f9fc] text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground dark:bg-muted/20">
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3 hidden md:table-cell">Branch</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Published</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listRows.map((v) => (
                    <tr
                      key={v.id}
                      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-[#ffcf0f]/5"
                      onClick={() => openDetail(v.id)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                            <VehicleThumb src={vehicleImage(v.primaryImageUrl, v.model)} alt="" />
                          </div>
                          <div>
                            <p className="font-semibold">{v.year} {v.model} {v.trim}</p>
                            <p className="text-xs font-mono text-muted-foreground">{v.vin ?? v.stockNumber ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{v.branchName}</td>
                      <td className="px-5 py-4 font-display font-bold">{formatCurrency(Number(v.price))}</td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(v.availability)} className={availabilityBadgeClass(v.availability)}>
                          {v.availability}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <Badge
                          variant={v.isPublished ? 'default' : 'outline'}
                          className={v.isPublished ? 'border-transparent bg-[#ffcf0f]/25 text-[#121a2a]' : ''}
                        >
                          {v.isPublished ? 'Live' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => openEdit(v.id)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 24 && (
              <div className="flex items-center justify-between border-t border-border/60 px-5 py-4">
                <p className="text-xs text-muted-foreground">Page {page} · {total} total</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page * 24 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Drawer — detail hero or edit form */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerMode === 'create' ? 'New vehicle' : undefined}
        description={drawerMode === 'create' ? 'Listing details for the public catalogue' : undefined}
        width={drawerMode === 'detail' ? '2xl' : 'xl'}
        customHeader={
          drawerMode === 'detail' && (detail || detailLoading) ? (
            <div className="relative overflow-hidden bg-[#e4e7ec] dark:bg-[#151c28]">
              {detailLoading ? (
                <div className="flex h-[32rem] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : detail ? (
                <>
                  <div className="relative px-6 pb-6 pt-5">
                    <Button variant="ghost" size="sm" className="mb-2 gap-1 rounded-full" onClick={closeDrawer}>
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>

                    <div className="relative grid gap-6 lg:grid-cols-[1fr_18rem]">
                      {/* Left — vehicle hero */}
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {detail.make}
                        </p>
                        <h2 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-[2.35rem]">
                          {detail.model}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {detail.year} {detail.trim} · {detail.fuelType} {detail.transmission.toLowerCase()}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {[
                            { key: 'A', label: 'Available', active: detail.availability === 'available' },
                            { key: 'P', label: 'Published', active: detail.isPublished },
                            { key: 'M', label: 'Promo', active: detail.isPromotional },
                            { key: 'B', label: detail.branchCity?.slice(0, 3) ?? 'BR', active: true },
                          ].map((dot) => (
                            <span
                              key={dot.key}
                              title={dot.label}
                              className={cn(
                                'inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border shadow-sm',
                                dot.active
                                  ? 'border-[#ffcf0f] bg-[#ffcf0f] text-[#121a2a]'
                                  : 'border-border bg-white/90 text-muted-foreground dark:bg-card',
                              )}
                            >
                              {dot.key}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#d0d4dc] dark:bg-muted">
                          <VehicleThumb
                            src={detailImage}
                            alt={`${detail.year} ${detail.model}`}
                          />
                        </div>
                      </div>

                      {/* Right — floating panel overlapping hero (reference: AI assistant card) */}
                      <div className="relative z-10 rounded-[1.35rem] border border-white/70 bg-white/95 p-4 shadow-[0_20px_50px_rgba(18,26,42,0.12)] backdrop-blur-sm dark:border-border dark:bg-card lg:-mt-2 lg:mb-6">
                        <p className="font-display text-base font-semibold">Listing controls</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Manage catalogue visibility & specs</p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {[
                            { label: 'Edit listing', sub: 'Specs & price', icon: Pencil, action: () => editingId && openEdit(editingId) },
                            { label: 'Publish', sub: detail.isPublished ? 'Live on web' : 'Draft', icon: Eye, action: () => editingId && openEdit(editingId) },
                            { label: 'Images', sub: `${detail.images?.length ?? 0} photos`, icon: ImagePlus, action: () => editingId && openEdit(editingId) },
                            { label: 'Remove', sub: 'Archive', icon: Trash2, action: () => editingId && handleDelete(editingId) },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={item.action}
                              className="rounded-2xl border border-border/60 bg-[#f7f8fb] p-3 text-left transition-colors hover:border-[#ffcf0f]/50 hover:bg-[#ffcf0f]/10 dark:bg-muted/20"
                            >
                              <item.icon className="h-4 w-4 text-[#121a2a] dark:text-[#ffcf0f]" />
                              <p className="mt-2 text-xs font-semibold">{item.label}</p>
                              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 space-y-2">
                          <select
                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                            value={detail.availability}
                            onChange={(e) => editingId && handleStatusChange(editingId, e.target.value)}
                          >
                            {AVAILABILITY.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value={`${detail.year} ${detail.model} — ${formatCurrency(Number(detail.price))}`}
                              className="h-11 rounded-xl border-border/70 bg-[#f7f8fb] text-xs"
                            />
                            <Button
                              className="h-11 shrink-0 gap-1.5 rounded-xl bg-[#121a2a] px-4 text-white hover:bg-[#121a2a]/90 hover:text-white [&_svg]:text-white"
                              onClick={() => editingId && openEdit(editingId)}
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info widgets — location / timeline / pricing */}
                  <div className="grid gap-3 border-t border-black/5 bg-[#eef0f4]/90 px-6 py-5 dark:border-white/5 dark:bg-[#121a2a]/50 sm:grid-cols-3">
                    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
                      <Maximize2 className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/50" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Branch location</p>
                      <p className="mt-2 text-sm font-semibold leading-snug">{detail.branchName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{detail.branchCity}, {detail.branchState}</p>
                      <div className="relative mt-3 h-16 overflow-hidden rounded-xl bg-gradient-to-br from-[#ffcf0f]/15 to-secondary">
                        <MapPin className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-[#121a2a] drop-shadow dark:text-[#ffcf0f]" />
                      </div>
                    </div>

                    <div className="relative rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
                      <Maximize2 className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/50" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Listing timeline</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Calendar className="h-4 w-4 shrink-0 text-[#121a2a] dark:text-[#ffcf0f]" />
                        <div>
                          <p className="font-display text-2xl font-bold leading-none">
                            {new Date(detail.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(detail.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            {detail.updatedAt ? ` · Updated ${formatDateTime(detail.updatedAt)}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
                      <Maximize2 className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/50" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pricing</p>
                      <div className="mt-3 flex items-start gap-3">
                        <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[5px] border-[#ffcf0f] bg-white" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-semibold">List price</p>
                          </div>
                          <p className="font-display mt-1 text-xl font-bold">{formatCurrency(Number(detail.price))}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {detail.promotionalPrice
                              ? `Promo ${formatCurrency(Number(detail.promotionalPrice))}`
                              : `${detail.fuelType} · ${detail.engine || '—'}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spec strip */}
                  <div className="flex flex-wrap gap-4 border-t border-black/5 px-6 py-4 text-xs text-muted-foreground dark:border-white/5">
                    <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> VIN {detail.vin ?? '—'}</span>
                    <span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> Stock {detail.stockNumber ?? '—'}</span>
                    <span className="inline-flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" /> {detail.color}</span>
                    <Badge variant={statusVariant(detail.availability)} className={cn('capitalize', availabilityBadgeClass(detail.availability))}>
                      {detail.availability}
                    </Badge>
                  </div>
                </>
              ) : null}
            </div>
          ) : undefined
        }
        footer={
          drawerMode !== 'detail' ? (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || detailLoading} className="rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save changes' : 'Create listing'}
              </Button>
            </div>
          ) : undefined
        }
      >
        {drawerMode !== 'detail' && (
          <>
            {detailLoading && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Loading listing details…
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
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
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
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">VIN</Label>
                  <Input value={form.vin ?? ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Stock number</Label>
                  <Input value={form.stockNumber ?? ''} onChange={(e) => setForm({ ...form, stockNumber: e.target.value })} />
                </div>
              </div>
            </DrawerSection>

            <DrawerSection title="Pricing & status">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Price (₦) *</Label>
                  <Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
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
                      <option key={s} value={s}>{s}</option>
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
                  <Input value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} />
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
                      <VehicleThumb src={vehicleImage(img.url, detail?.model ?? form.model)} alt="" className="h-full w-full object-cover" />
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
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUploadImages(e.target.files)} />
                <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="h-4 w-4" /> Upload images
                </Button>
              </DrawerSection>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
