import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FadeIn } from '@/components/effects/PageTransition'
import {
  branches,
  getVehicleById,
  quotations,
  reservations,
  tradeInRequests,
  testDriveBookings,
} from '@/data/dummy'
import { formatDateTime } from '@/lib/utils'

export function SalesHubPage() {
  const [params] = useSearchParams()
  const vehicleId = params.get('vehicle') || 'v-2'
  const vehicle = getVehicleById(vehicleId)

  return (
    <div className="space-y-6">
      <Link to={`/vehicles/${vehicleId}`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to vehicle
        </Button>
      </Link>
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Sales & Commerce</h1>
        <p className="text-muted-foreground mt-1">Manage your purchase journey</p>
      </FadeIn>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: `/sales/test-drive?vehicle=${vehicleId}`, label: 'Test Drive', desc: 'Book a test drive' },
          { to: `/sales/quote?vehicle=${vehicleId}`, label: 'Quotation', desc: 'Get formal quote' },
          { to: `/sales/reserve?vehicle=${vehicleId}`, label: 'Reservation', desc: 'Reserve with deposit' },
          { to: '/sales/trade-in', label: 'Trade-In', desc: 'Value your current car' },
          { to: `/sales/financing?vehicle=${vehicleId}`, label: 'Financing', desc: 'Calculate payments' },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardContent className="p-6">
                <p className="font-display font-semibold">{item.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {vehicle && (
        <Card>
          <CardHeader><CardTitle>Selected Vehicle</CardTitle></CardHeader>
          <CardContent className="flex gap-4 items-center">
            <img src={vehicle.images[0]} alt="" className="h-20 w-28 rounded-xl object-cover" />
            <div>
              <p className="font-semibold">{vehicle.year} {vehicle.model} {vehicle.trim}</p>
              <p className="text-sm text-muted-foreground">{vehicle.color}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function TestDrivePage() {
  const [params] = useSearchParams()
  const vehicleId = params.get('vehicle') || 'v-2'
  const vehicle = getVehicleById(vehicleId)
  const existing = testDriveBookings[0]

  const handleBook = () => toast.success('Test drive booked successfully!')

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/sales"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">Book Test Drive</h1></FadeIn>

      {existing && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="font-medium text-sm">Upcoming test drive confirmed</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(existing.scheduledAt)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          {vehicle && (
            <div className="flex gap-4 items-center p-4 rounded-xl bg-muted/30">
              <img src={vehicle.images[0]} alt="" className="h-16 w-24 rounded-lg object-cover" />
              <p className="font-semibold">{vehicle.year} {vehicle.model} {vehicle.trim}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Showroom</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
              {branches.filter((b) => b.type !== 'service_centre').map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" defaultValue="2026-06-28" />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" defaultValue="10:00" />
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleBook}>Confirm Test Drive</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function QuotePage() {
  const quote = quotations[0]
  const vehicle = getVehicleById(quote.vehicleId)

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/sales"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">Formal Quotation</h1></FadeIn>

      <Card>
        <CardHeader>
          <CardTitle>Quotation #{quote.id}</CardTitle>
          <p className="text-sm text-muted-foreground">Valid until {quote.validUntil}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicle && (
            <div className="flex gap-4 items-center">
              <img src={vehicle.images[0]} alt="" className="h-20 w-28 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{vehicle.year} {vehicle.model} {vehicle.trim}</p>
                <p className="text-sm text-muted-foreground">{vehicle.color}</p>
              </div>
            </div>
          )}
          <div className="space-y-2 border-t border-border pt-4">
            {quote.lineItems.map((item) => (
              <div key={item.description} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.description}</span>
                <span className="font-medium">{item.amount < 0 ? '-' : ''}₦{Math.abs(item.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-display text-2xl font-bold border-t border-border pt-4">
            <span>Total</span>
            <span>₦{quote.total.toLocaleString()}</span>
          </div>
          <Button className="w-full" onClick={() => toast.success('Quotation accepted!')}>Accept Quotation</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function ReservePage() {
  const [params] = useSearchParams()
  const vehicleId = params.get('vehicle') || 'v-1'
  const vehicle = getVehicleById(vehicleId)
  const reservation = reservations[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/sales"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">Vehicle Reservation</h1></FadeIn>

      <Card>
        <CardContent className="p-6 space-y-4">
          {vehicle && (
            <div className="flex gap-4 items-center">
              <img src={vehicle.images[0]} alt="" className="h-20 w-28 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{vehicle.year} {vehicle.model} {vehicle.trim}</p>
                <p className="text-2xl font-bold mt-1">₦{(vehicle.promotionalPrice || vehicle.price).toLocaleString()}</p>
              </div>
            </div>
          )}
          <div className="p-4 rounded-xl bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm"><span>Holding deposit</span><span className="font-semibold">₦{reservation.depositAmount.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>Status</span><span className="text-emerald-600 font-medium capitalize">{reservation.status.replace('_', ' ')}</span></div>
            <div className="flex justify-between text-sm"><span>Expires</span><span>{reservation.expiresAt.split('T')[0]}</span></div>
          </div>
          <p className="text-xs text-muted-foreground">Payment gateway integration pending. Demo mode — no real payment processed.</p>
          <Button className="w-full" size="lg" onClick={() => toast.success('Reservation confirmed!')}>Pay Holding Deposit</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function TradeInPage() {
  const existing = tradeInRequests[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/sales"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">Trade-In Valuation</h1></FadeIn>

      {existing.status === 'valued' && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Estimated value for your {existing.year} {existing.make} {existing.model}</p>
            <p className="font-display text-3xl font-bold text-emerald-600">₦{existing.estimatedValue?.toLocaleString()}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Make</Label><Input defaultValue={existing.make} /></div>
            <div className="space-y-2"><Label>Model</Label><Input defaultValue={existing.model} /></div>
            <div className="space-y-2"><Label>Year</Label><Input type="number" defaultValue={existing.year} /></div>
            <div className="space-y-2"><Label>Mileage (km)</Label><Input type="number" defaultValue={existing.mileage} /></div>
          </div>
          <div className="space-y-2">
            <Label>Condition notes</Label>
            <textarea className="flex min-h-24 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm" defaultValue={existing.conditionNotes} />
          </div>
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  Upload photo
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => toast.success('Trade-in request submitted!')}>Submit for Valuation</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function FinancingPage() {
  const [params] = useSearchParams()
  const vehicleId = params.get('vehicle') || 'v-2'
  const vehicle = getVehicleById(vehicleId)
  const [deposit, setDeposit] = useState(30)
  const [tenor, setTenor] = useState(48)
  const price = vehicle?.promotionalPrice || vehicle?.price || 52000000
  const depositAmount = price * (deposit / 100)
  const loanAmount = price - depositAmount
  const monthlyRate = 0.18 / 12
  const monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, tenor)) / (Math.pow(1 + monthlyRate, tenor) - 1)

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/sales"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Financing Calculator</h1>
        <p className="text-muted-foreground text-sm mt-1">Client-side estimate · 18% annual interest (demo)</p>
      </FadeIn>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="text-center p-6 rounded-2xl bg-primary/5">
            <p className="text-sm text-muted-foreground">Estimated monthly payment</p>
            <p className="font-display text-4xl font-bold text-primary mt-2">₦{Math.round(monthly).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">for {tenor} months</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Deposit: {deposit}% (₦{Math.round(depositAmount).toLocaleString()})</Label>
              <input type="range" min={10} max={70} value={deposit} onChange={(e) => setDeposit(+e.target.value)} className="w-full mt-2 accent-primary" />
            </div>
            <div>
              <Label>Tenor: {tenor} months</Label>
              <input type="range" min={12} max={60} step={6} value={tenor} onChange={(e) => setTenor(+e.target.value)} className="w-full mt-2 accent-primary" />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Vehicle price</span><span>₦{price.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span>₦{Math.round(depositAmount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Loan amount</span><span>₦{Math.round(loanAmount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Interest rate</span><span>18% p.a.</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
