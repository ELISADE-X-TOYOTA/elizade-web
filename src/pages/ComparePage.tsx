import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  FileText,
  Fuel,
  GitCompareArrows,
  Loader2,
  MapPin,
  Settings2,
} from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'
import { Button } from '@/components/ui/button'
import { compareVehicles as fetchCompareVehicles } from '@/lib/inventory-api'
import { mapDetailToVehicle } from '@/lib/vehicle-mappers'
import { cn, formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'

type CompareRow = {
  key: string
  label: string
  values: string[]
  group: 'overview' | 'performance' | 'specs'
}

function buildRows(items: Vehicle[]): CompareRow[] {
  const overview: CompareRow[] = [
    {
      key: 'price',
      label: 'Price',
      values: items.map((v) => formatCurrency(v.promotionalPrice ?? v.price)),
      group: 'overview',
    },
    {
      key: 'availability',
      label: 'Availability',
      values: items.map((v) => v.availability.charAt(0).toUpperCase() + v.availability.slice(1)),
      group: 'overview',
    },
    {
      key: 'year',
      label: 'Model year',
      values: items.map((v) => String(v.year)),
      group: 'overview',
    },
    {
      key: 'color',
      label: 'Exterior colour',
      values: items.map((v) => v.color),
      group: 'overview',
    },
    {
      key: 'location',
      label: 'Showroom',
      values: items.map((v) =>
        v.branchCity && v.branchState ? `${v.branchCity}, ${v.branchState}` : '—',
      ),
      group: 'overview',
    },
  ]

  const performance: CompareRow[] = [
    { key: 'engine', label: 'Engine', values: items.map((v) => v.engine), group: 'performance' },
    { key: 'fuel', label: 'Fuel type', values: items.map((v) => v.fuelType), group: 'performance' },
    {
      key: 'transmission',
      label: 'Transmission',
      values: items.map((v) => v.transmission),
      group: 'performance',
    },
  ]

  const specKeys = [...new Set(items.flatMap((v) => Object.keys(v.specs)))]
  const specs: CompareRow[] = specKeys.map((key) => ({
    key: `spec-${key}`,
    label: key,
    values: items.map((v) => v.specs[key] ?? '—'),
    group: 'specs',
  }))

  return [...overview, ...performance, ...specs]
}

function rowDiffers(row: CompareRow) {
  return new Set(row.values).size > 1
}

function CompareEmpty({ message, showBrowse }: { message: string; showBrowse?: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-card/50 px-8 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <GitCompareArrows className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Compare vehicles</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
      {showBrowse && (
        <Link to="/vehicles" className="mt-8 inline-block">
          <Button className="h-11 gap-2 bg-foreground px-6 text-background hover:bg-foreground/90">
            Browse catalogue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}

function VehicleHero({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  const price = vehicle.promotionalPrice ?? vehicle.price
  const savings = vehicle.promotionalPrice ? vehicle.price - vehicle.promotionalPrice : 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
        <SafeImage
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.model} ${vehicle.trim}`}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
          Vehicle {index + 1}
        </span>
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {vehicle.make} · {vehicle.year}
        </p>
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {vehicle.model} {vehicle.trim}
        </h2>
        {vehicle.branchName && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {vehicle.branchName}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Starting from</p>
        <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{formatCurrency(price)}</p>
        {vehicle.promotionalPrice && (
          <>
            <p className="text-sm text-muted-foreground line-through">{formatCurrency(vehicle.price)}</p>
            <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Save {formatCurrency(savings)}
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
          <Button variant="outline" className="h-10 w-full">
            View details
          </Button>
        </Link>
        <Link to={`/sales/quote?vehicle=${vehicle.id}`} className="flex-1">
          <Button className="h-10 w-full gap-2 bg-foreground text-background hover:bg-foreground/90">
            <FileText className="h-4 w-4" />
            Get quote
          </Button>
        </Link>
      </div>
    </div>
  )
}

function ComparisonTable({ items, rows }: { items: Vehicle[]; rows: CompareRow[] }) {
  const groups: { id: CompareRow['group']; title: string; icon: typeof Fuel }[] = [
    { id: 'overview', title: 'Overview', icon: Check },
    { id: 'performance', title: 'Performance', icon: Settings2 },
    { id: 'specs', title: 'Specifications', icon: Fuel },
  ]

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const groupRows = rows.filter((r) => r.group === group.id)
        if (groupRows.length === 0) return null

        return (
          <section key={group.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-4">
              <group.icon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/70">
                    <th className="sticky left-0 z-10 w-[38%] bg-card px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Feature
                    </th>
                    {items.map((v) => (
                      <th
                        key={v.id}
                        className="px-5 py-4 text-left font-semibold text-foreground"
                      >
                        {v.model} {v.trim}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((row) => {
                    const different = rowDiffers(row)
                    return (
                      <tr
                        key={row.key}
                        className={cn(
                          'border-b border-border/50 last:border-0',
                          different && 'bg-accent/[0.03]',
                        )}
                      >
                        <td className="sticky left-0 z-10 bg-card px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">{row.label}</span>
                            {different && (
                              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground">
                                Differs
                              </span>
                            )}
                          </div>
                        </td>
                        {row.values.map((value, i) => (
                          <td key={`${row.key}-${i}`} className="px-5 py-4 font-medium text-foreground">
                            {row.label === 'Exterior colour' && items[i] ? (
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="h-4 w-4 rounded-sm border border-border/80"
                                  style={{ backgroundColor: items[i].colorHex }}
                                />
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function ComparePage() {
  const [params] = useSearchParams()
  const ids = params.get('ids')?.split(',').filter(Boolean) ?? []
  const [compareVehicles, setCompareVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ids.length !== 2) {
      setCompareVehicles([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCompareVehicles(ids)
      .then((items) => {
        if (!cancelled) setCompareVehicles(items.map(mapDetailToVehicle))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load comparison')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ids.join(',')])

  const rows = useMemo(() => buildRows(compareVehicles), [compareVehicles])

  const diffCount = useMemo(() => rows.filter(rowDiffers).length, [rows])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <CompareEmpty message={error} showBrowse />
  }

  if (compareVehicles.length === 0 && ids.length === 0) {
    return (
      <CompareEmpty
        message="Select two vehicles from the catalogue to see a detailed side-by-side comparison."
        showBrowse
      />
    )
  }

  if (ids.length === 1) {
    return (
      <CompareEmpty
        message="Add one more vehicle to compare. You can select up to two models from the catalogue."
        showBrowse
      />
    )
  }

  if (ids.length === 2 && compareVehicles.length === 0) {
    return (
      <CompareEmpty
        message="One or both vehicles could not be found. They may have been sold or removed from the catalogue."
        showBrowse
      />
    )
  }

  if (compareVehicles.length > 2) {
    return (
      <CompareEmpty
        message="You can compare up to two vehicles at a time. Adjust your selection and try again."
        showBrowse
      />
    )
  }

  const [left, right] = compareVehicles

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="border-b border-border/70 pb-8">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalogue
        </Link>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Side-by-side comparison
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {left.model} vs {right.model}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Review pricing, performance, and specifications to choose the Toyota that fits your
              needs. Rows marked &ldquo;Differs&rdquo; highlight where these models vary.
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="rounded-xl border border-border bg-card px-5 py-3">
              <p className="text-2xl font-semibold tabular-nums">{diffCount}</p>
              <p className="text-muted-foreground">differences found</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-5 py-3">
              <p className="text-2xl font-semibold tabular-nums">{rows.length}</p>
              <p className="text-muted-foreground">data points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero comparison */}
      <section className="relative rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="hidden lg:block absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
            vs
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <VehicleHero vehicle={left} index={0} />
          <VehicleHero vehicle={right} index={1} />
        </div>
      </section>

      {/* Quick glance strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Lowest price',
            value: formatCurrency(
              Math.min(
                left.promotionalPrice ?? left.price,
                right.promotionalPrice ?? right.price,
              ),
            ),
          },
          {
            label: 'Fuel options',
            value: [...new Set([left.fuelType, right.fuelType])].join(' · '),
          },
          {
            label: 'Transmissions',
            value: [...new Set([left.transmission, right.transmission])].join(' · '),
          },
          {
            label: 'Availability',
            value: [...new Set([left.availability, right.availability])]
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' · '),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-secondary/20 px-4 py-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Detailed table */}
      <ComparisonTable items={compareVehicles} rows={rows} />

      {/* Footer CTA */}
      <section className="rounded-2xl border border-border bg-foreground px-6 py-8 text-background sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Ready to take the next step?</h2>
            <p className="mt-2 max-w-xl text-sm text-background/70">
              Book a test drive or request a formal quotation for either model. Our team will follow
              up from your preferred Elizade showroom.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to={`/sales/test-drive?vehicle=${left.id}`}>
              <Button
                variant="outline"
                className="h-11 w-full gap-2 border-background/30 bg-transparent text-background hover:bg-background/10 sm:w-auto"
              >
                <Calendar className="h-4 w-4" />
                Test drive
              </Button>
            </Link>
            <Link to="/vehicles">
              <Button className="h-11 w-full gap-2 bg-background text-foreground hover:bg-background/90 sm:w-auto">
                <GitCompareArrows className="h-4 w-4" />
                Compare other models
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
