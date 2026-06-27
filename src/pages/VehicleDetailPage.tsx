import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Fuel,
  Cog,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  ArrowLeftRight,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Rotate3d,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn } from '@/components/effects/PageTransition'
import { SafeImage } from '@/components/ui/safe-image'
import { getPublicVehicle } from '@/lib/inventory-api'
import { mapDetailToVehicle } from '@/lib/vehicle-mappers'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'

export function VehicleDetailPage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [show360, setShow360] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPublicVehicle(id)
      .then((detail) => {
        if (!cancelled) {
          setVehicle(mapDetailToVehicle(detail))
          setImageIndex(0)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Vehicle not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{error ?? 'Vehicle not found'}</p>
        <Link to="/vehicles"><Button className="mt-4">Back to catalogue</Button></Link>
      </div>
    )
  }

  const salesActions = [
    { to: `/sales/test-drive?vehicle=${vehicle.id}`, label: 'Book Test Drive', icon: Calendar },
    { to: `/sales/quote?vehicle=${vehicle.id}`, label: 'Get Quotation', icon: FileText },
    { to: `/sales/reserve?vehicle=${vehicle.id}`, label: 'Reserve', icon: CreditCard },
    { to: `/sales/trade-in`, label: 'Trade-In', icon: ArrowLeftRight },
    { to: `/sales/financing?vehicle=${vehicle.id}`, label: 'Financing', icon: Calculator },
  ]

  const gallery = vehicle.images.length > 0 ? vehicle.images : ['']

  return (
    <div className="space-y-6">
      <Link to="/vehicles">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to catalogue
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        <FadeIn>
          <div className="space-y-4">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden glass">
              <AnimatePresence mode="wait">
                <motion.div key={imageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
                  <SafeImage
                    src={gallery[imageIndex]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              {vehicle.isPromotional && (
                <Badge className="absolute top-4 left-4 bg-primary">{vehicle.promotionLabel}</Badge>
              )}
              <Button
                size="sm"
                variant="glass"
                className="absolute bottom-4 right-4 gap-2"
                onClick={() => setShow360(!show360)}
              >
                <Rotate3d className="h-4 w-4" />
                {show360 ? 'Photos' : '360° View'}
              </Button>
              {gallery.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="glass"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setImageIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="glass"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setImageIndex((i) => (i + 1) % gallery.length)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`h-14 w-20 sm:h-16 sm:w-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      i === imageIndex ? 'border-primary' : 'border-transparent opacity-60'
                    }`}
                  >
                    <SafeImage src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={vehicle.availability === 'available' ? 'success' : 'warning'}>
                  {vehicle.availability}
                </Badge>
                <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: vehicle.colorHex }} />
                <span className="text-sm text-muted-foreground">{vehicle.color}</span>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-lg text-muted-foreground">{vehicle.trim}</p>
            </div>

            <div>
              {vehicle.promotionalPrice ? (
                <div>
                  <p className="font-display text-3xl font-bold">{formatCurrency(vehicle.promotionalPrice)}</p>
                  <p className="text-muted-foreground line-through">{formatCurrency(vehicle.price)}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Save {formatCurrency(vehicle.price - vehicle.promotionalPrice)}
                  </p>
                </div>
              ) : (
                <p className="font-display text-3xl font-bold">{formatCurrency(vehicle.price)}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Fuel, label: vehicle.fuelType },
                { icon: Cog, label: vehicle.transmission },
                { icon: MapPin, label: vehicle.branchCity ?? 'Lagos' },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {salesActions.map((action) => (
                <Link key={action.label} to={action.to}>
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <Tabs defaultValue="specs">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="engine">Engine</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>
          <TabsContent value="specs">
            <Card>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(vehicle.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="engine">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Engine</span><span className="font-medium">{vehicle.engine}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Transmission</span><span className="font-medium">{vehicle.transmission}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fuel Type</span><span className="font-medium">{vehicle.fuelType}</span></div>
                {vehicle.vin && (
                  <div className="flex justify-between"><span className="text-muted-foreground">VIN</span><span className="font-mono text-sm">{vehicle.vin}</span></div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="location">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="font-semibold">{vehicle.branchName ?? 'Elizade showroom'}</p>
                  <p className="text-muted-foreground">{vehicle.branchCity}, {vehicle.branchState}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
