import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, GitCompareArrows, Bell, Fuel, Cog } from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FadeIn, StaggerChildren } from '@/components/effects/PageTransition'
import { vehicles } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'
import type { AvailabilityStatus } from '@/types'

const availabilityBadge: Record<AvailabilityStatus, { variant: 'success' | 'warning' | 'secondary' | 'outline'; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  reserved: { variant: 'warning', label: 'Reserved' },
  sold: { variant: 'secondary', label: 'Sold' },
  transferred: { variant: 'outline', label: 'Transferred' },
}

export function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [fuelFilter, setFuelFilter] = useState<string>('all')
  const [compareList, setCompareList] = useState<string[]>([])

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch = `${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(search.toLowerCase())
      const matchFuel = fuelFilter === 'all' || v.fuelType.toLowerCase() === fuelFilter
      return matchSearch && matchFuel
    })
  }, [search, fuelFilter])

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0a1628] text-white p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#121a2a]/90 to-[#8b0a1a]/40" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffcf0f]/60 to-transparent" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ffcf0f]/90">
                New Toyota inventory
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mt-2">Vehicle Catalogue</h1>
              <p className="text-white/60 mt-1 text-sm">Browse availability across Elizade showrooms nationwide</p>
            </div>
            {compareList.length > 0 && (
              <Link to={`/vehicles/compare?ids=${compareList.join(',')}`}>
                <Button className="gap-2 shrink-0">
                  <GitCompareArrows className="h-4 w-4" />
                  Compare ({compareList.length})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.05}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search model, trim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'petrol', 'hybrid', 'diesel'].map((fuel) => (
              <Button
                key={fuel}
                variant={fuelFilter === fuel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFuelFilter(fuel)}
                className="capitalize"
              >
                {fuel === 'all' ? 'All' : fuel}
              </Button>
            ))}
          </div>
        </div>
      </FadeIn>

      <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vehicle) => {
          const badge = availabilityBadge[vehicle.availability]
          const isComparing = compareList.includes(vehicle.id)
          return (
            <div key={vehicle.id} className="content-auto">
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <SafeImage
                    src={vehicle.images[0]}
                    alt={`${vehicle.model} ${vehicle.trim}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {vehicle.isPromotional && (
                      <Badge className="bg-primary">{vehicle.promotionLabel}</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-display font-bold text-lg">
                      {vehicle.year} {vehicle.model} {vehicle.trim}
                    </p>
                    <div className="flex items-center gap-3 text-white/70 text-xs mt-1">
                      <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{vehicle.fuelType}</span>
                      <span className="flex items-center gap-1"><Cog className="h-3 w-3" />{vehicle.transmission}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      {vehicle.promotionalPrice ? (
                        <>
                          <p className="font-display text-xl font-bold">{formatCurrency(vehicle.promotionalPrice)}</p>
                          <p className="text-xs text-muted-foreground line-through">{formatCurrency(vehicle.price)}</p>
                        </>
                      ) : (
                        <p className="font-display text-xl font-bold">{formatCurrency(vehicle.price)}</p>
                      )}
                    </div>
                    <div
                      className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: vehicle.colorHex }}
                      title={vehicle.color}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
                      <Button size="sm" className="w-full">View Details</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={isComparing ? 'default' : 'outline'}
                      onClick={() => toggleCompare(vehicle.id)}
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </StaggerChildren>
    </div>
  )
}
