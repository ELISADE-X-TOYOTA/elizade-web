import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpDown, GitCompareArrows, Loader2, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listPublicVehicles } from '@/lib/inventory-api'
import {
  branchMap,
  getBranchLabel,
  listBranches,
  mapListItemToVehicle,
} from '@/lib/vehicle-mappers'
import { cn, formatCurrency } from '@/lib/utils'
import type { AvailabilityStatus, Branch, Vehicle } from '@/types'

const fuelOptions = [
  { value: 'all', label: 'All fuel types' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'diesel', label: 'Diesel' },
] as const

const availabilityOptions = [
  { value: 'all', label: 'All status' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
] as const

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Model name' },
] as const

type SortValue = (typeof sortOptions)[number]['value']

const availabilityLabel: Record<AvailabilityStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  transferred: 'Transferred',
}

function availabilityTone(status: AvailabilityStatus) {
  if (status === 'available') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
  if (status === 'reserved') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
  return 'bg-muted text-muted-foreground'
}

function VehicleCard({
  vehicle,
  isComparing,
  onToggleCompare,
  branches,
}: {
  vehicle: Vehicle
  isComparing: boolean
  onToggleCompare: () => void
  branches: Map<string, Branch>
}) {
  const location = getBranchLabel(vehicle.branchId, branches)
  const displayPrice = vehicle.promotionalPrice ?? vehicle.price

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200',
        isComparing
          ? 'border-foreground ring-1 ring-foreground/10 shadow-md'
          : 'border-border hover:border-foreground/20 hover:shadow-lg hover:shadow-black/[0.04]',
      )}
    >
      <Link to={`/vehicles/${vehicle.id}`} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <SafeImage
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={cn(
              'rounded-md px-2 py-1 text-[11px] font-medium tracking-wide backdrop-blur-sm',
              availabilityTone(vehicle.availability),
            )}
          >
            {availabilityLabel[vehicle.availability]}
          </span>
          {vehicle.isPromotional && vehicle.promotionLabel && (
            <span className="rounded-md bg-foreground/90 px-2 py-1 text-[11px] font-medium text-background backdrop-blur-sm">
              {vehicle.promotionLabel}
            </span>
          )}
        </div>
        {isComparing && (
          <span className="absolute right-3 top-3 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
            Selected
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {vehicle.make} · {vehicle.year}
          </p>
          <Link to={`/vehicles/${vehicle.id}`} className="block">
            <h2 className="font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-foreground">
              {vehicle.model} {vehicle.trim}
            </h2>
          </Link>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Fuel</dt>
            <dd className="mt-0.5 font-medium">{vehicle.fuelType}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Transmission</dt>
            <dd className="mt-0.5 font-medium">{vehicle.transmission}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Exterior</dt>
            <dd className="mt-0.5 flex items-center gap-2 font-medium">
              <span
                className="inline-block h-3.5 w-3.5 rounded-sm border border-border/80"
                style={{ backgroundColor: vehicle.colorHex }}
              />
              {vehicle.color}
            </dd>
          </div>
          {vehicle.branchId && (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Location</dt>
              <dd className="mt-0.5 flex items-start gap-1 font-medium">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {location}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-auto border-t border-border/70 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">From</p>
              <p className="font-display text-xl font-semibold tracking-tight">{formatCurrency(displayPrice)}</p>
              {vehicle.promotionalPrice && (
                <p className="text-xs text-muted-foreground line-through">{formatCurrency(vehicle.price)}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
              <Button className="h-10 w-full bg-foreground text-background hover:bg-foreground/90">
                View details
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-10 px-3 transition-colors',
                isComparing && 'border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background',
              )}
              onClick={onToggleCompare}
              aria-pressed={isComparing}
              title={isComparing ? 'Remove from compare' : 'Add to compare'}
            >
              <GitCompareArrows className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [fuelFilter, setFuelFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortValue>('featured')
  const [compareList, setCompareList] = useState<string[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [totalStock, setTotalStock] = useState(0)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listBranches().then(setBranches).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const fuelType =
      fuelFilter === 'all' ? undefined : fuelFilter.charAt(0).toUpperCase() + fuelFilter.slice(1)
    const availability = availabilityFilter === 'all' ? undefined : availabilityFilter
    const sort =
      sortBy === 'price-asc'
        ? 'price'
        : sortBy === 'price-desc'
          ? '-price'
          : '-createdAt'

    listPublicVehicles({ fuelType, availability, sort, limit: 100 })
      .then((res) => {
        if (cancelled) return
        setVehicles(res.items.map(mapListItemToVehicle))
        setTotalStock(res.total)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load vehicles')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fuelFilter, availabilityFilter, sortBy])

  const branchLookup = useMemo(() => branchMap(branches), [branches])

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q || `${v.make} ${v.model} ${v.trim} ${v.color}`.toLowerCase().includes(q)
      return matchSearch
    })

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => `${a.model} ${a.trim}`.localeCompare(`${b.model} ${b.trim}`))
    }

    return list
  }, [vehicles, search, sortBy])

  const compareVehicles = useMemo(
    () => compareList.map((id) => vehicles.find((v) => v.id === id)).filter(Boolean) as Vehicle[],
    [compareList],
  )

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const clearFilters = () => {
    setSearch('')
    setFuelFilter('all')
    setAvailabilityFilter('all')
    setSortBy('featured')
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    fuelFilter !== 'all' ||
    availabilityFilter !== 'all' ||
    sortBy !== 'featured'

  return (
    <div className={cn('space-y-8', compareList.length > 0 && 'pb-32')}>
      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(200,16,46,0.06),transparent_50%)]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            New vehicle inventory
          </p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Browse Toyota models
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Explore current Elizade stock across our showroom network. Compare up to two models,
                review specifications, and enquire when you are ready.
              </p>
            </div>
            <div className="flex shrink-0 divide-x divide-border rounded-xl border border-border bg-background/80">
              <div className="px-5 py-3 text-center sm:px-6">
                <p className="text-2xl font-semibold tabular-nums">{filtered.length}</p>
                <p className="text-xs text-muted-foreground">shown</p>
              </div>
              <div className="px-5 py-3 text-center sm:px-6">
                <p className="text-2xl font-semibold tabular-nums">{totalStock}</p>
                <p className="text-xs text-muted-foreground">in stock</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Refine results
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortValue)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by model, trim, or colour…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="flex flex-wrap gap-2">
              {fuelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFuelFilter(opt.value)}
                  className={cn(
                    'rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
                    fuelFilter === opt.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAvailabilityFilter(opt.value)}
                  className={cn(
                    'rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
                    availabilityFilter === opt.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} vehicle{filtered.length === 1 ? '' : 's'} match your filters
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Reset all
            </button>
          </div>
        )}
      </section>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <p className="font-medium text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">Ensure the API is running on port 8002.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="font-medium">No vehicles match your search</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or search for a different model.
          </p>
          <Button variant="outline" className="mt-6" onClick={clearFilters}>
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Results
            </h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} model{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isComparing={compareList.includes(vehicle.id)}
                onToggleCompare={() => toggleCompare(vehicle.id)}
                branches={branchLookup}
              />
            ))}
          </div>
        </>
      )}

      {/* Compare dock */}
      {compareList.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
                  {compareList.length}
                </div>
                <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
                  {compareVehicles.map((v) => (
                    <div
                      key={v.id}
                      className="flex min-w-[200px] items-center gap-3 rounded-xl border border-border bg-card p-2 pr-3"
                    >
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <SafeImage
                          src={v.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {v.model} {v.trim}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatCurrency(v.promotionalPrice ?? v.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompare(v.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label={`Remove ${v.model} from compare`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {compareList.length < 2 && (
                    <div className="flex min-w-[160px] items-center justify-center rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                      Select one more vehicle
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button variant="outline" className="h-10" onClick={() => setCompareList([])}>
                  Clear
                </Button>
                <Link
                  to={`/vehicles/compare?ids=${compareList.join(',')}`}
                  className={compareList.length < 2 ? 'pointer-events-none opacity-50' : ''}
                >
                  <Button
                    className="h-10 gap-2 bg-foreground px-5 text-background hover:bg-foreground/90"
                    disabled={compareList.length < 2}
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare side by side
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
