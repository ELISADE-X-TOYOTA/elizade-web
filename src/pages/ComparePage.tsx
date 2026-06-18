import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/effects/PageTransition'
import { vehicles } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

export function ComparePage() {
  const [params] = useSearchParams()
  const ids = params.get('ids')?.split(',') || []
  const compareVehicles = vehicles.filter((v) => ids.includes(v.id))

  if (compareVehicles.length < 2) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Select at least 2 vehicles to compare</p>
        <Link to="/vehicles"><Button className="mt-4">Browse vehicles</Button></Link>
      </div>
    )
  }

  const specKeys = [...new Set(compareVehicles.flatMap((v) => Object.keys(v.specs)))]

  return (
    <div className="space-y-6">
      <Link to="/vehicles">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Compare Vehicles</h1>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-6">
        {compareVehicles.map((v) => (
          <Card key={v.id}>
            <img src={v.images[0]} alt="" className="h-48 w-full object-cover rounded-t-2xl" />
            <CardHeader>
              <CardTitle>{v.year} {v.model} {v.trim}</CardTitle>
              <p className="text-2xl font-bold">{formatCurrency(v.promotionalPrice || v.price)}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Engine</span><span>{v.engine}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fuel</span><span>{v.fuelType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transmission</span><span>{v.transmission}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span>{v.color}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Full Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left text-muted-foreground">Specification</th>
                  {compareVehicles.map((v) => (
                    <th key={v.id} className="py-3 px-4 text-left font-medium">{v.model} {v.trim}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specKeys.map((key) => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="py-3 pr-4 text-muted-foreground">{key}</td>
                    {compareVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">{v.specs[key] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
