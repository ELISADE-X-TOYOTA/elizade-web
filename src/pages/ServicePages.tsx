import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Wrench,
  History,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn } from '@/components/effects/PageTransition'
import {
  branches,
  ownedVehicles,
  serviceAppointments,
  serviceHistory,
  activeServiceJob,
  getBranchById,
  getOwnedVehicleById,
} from '@/data/dummy'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

const statusColors: Record<string, string> = {
  confirmed: 'success',
  awaiting_approval: 'warning',
  in_progress: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

export function ServicePage() {
  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Service & Maintenance</h1>
        <p className="text-muted-foreground mt-1">Book, track, and manage your service appointments</p>
      </FadeIn>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/service/book">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Book Service</p>
                <p className="text-xs text-muted-foreground">Schedule appointment</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/service/track/sa-2">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-amber-500/30">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Wrench className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold">Track Active Job</p>
                <p className="text-xs text-amber-600">Awaiting approval</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/service/history">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <History className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">Service History</p>
                <p className="text-xs text-muted-foreground">Past records</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <FadeIn>
        <h2 className="font-display text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <div className="space-y-3">
          {serviceAppointments.map((apt) => {
            const vehicle = getOwnedVehicleById(apt.vehicleId)
            const branch = getBranchById(apt.branchId)
            return (
              <Card key={apt.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <img src={vehicle?.image} alt="" className="h-16 w-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize">{apt.serviceType} Service</p>
                      <Badge variant={statusColors[apt.status] as 'success' | 'warning' | 'default'}>
                        {apt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{vehicle?.model} · {branch?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(apt.scheduledAt)}</p>
                  </div>
                  <Link to={`/service/track/${apt.id}`}>
                    <Button size="sm" variant="outline">Track</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </FadeIn>
    </div>
  )
}

export function ServiceBookPage() {
  const [vehicleId, setVehicleId] = useState(ownedVehicles[0].id)

  const handleBook = () => toast.success('Service appointment booked!')

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/service"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">Book Service</h1></FadeIn>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <select
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {ownedVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} — {v.mileage.toLocaleString()} km</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Service Type</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
              <option value="periodic">Periodic Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="recall">Recall Service</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Service Centre</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
              {branches.filter((b) => b.type !== 'showroom').map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue="2026-06-25" /></div>
            <div className="space-y-2"><Label>Time</Label><Input type="time" defaultValue="09:00" /></div>
          </div>
          <div className="space-y-2">
            <Label>Current Mileage (km)</Label>
            <Input type="number" defaultValue={42500} />
          </div>
          <div className="space-y-2">
            <Label>Describe issue or service needed</Label>
            <textarea className="flex min-h-24 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm" placeholder="Describe the issue or service required..." />
          </div>
          <div className="space-y-2">
            <Label>Attachments (photos/videos)</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  Upload
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleBook}>Book Appointment</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function ServiceTrackPage() {
  const job = activeServiceJob
  const completedStages = job.stages.filter((s) => s.completed).length
  const progress = (completedStages / job.stages.length) * 100

  const handleApprove = () => toast.success('Additional work approved!')
  const handleReject = () => toast.info('Additional work rejected')

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/service"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Live Service Tracking</h1>
        <p className="text-muted-foreground flex items-center gap-2 mt-1">
          <Clock className="h-4 w-4" />
          Est. completion: {formatDateTime(job.estimatedCompletion)}
        </p>
      </FadeIn>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Job Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-6 space-y-3">
            {job.stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  stage.completed ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {stage.completed ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${stage.completed ? '' : 'text-muted-foreground'}`}>{stage.label}</p>
                  {stage.timestamp && <p className="text-xs text-muted-foreground">{formatDateTime(stage.timestamp)}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional work approval */}
      {job.additionalWork && job.additionalWork.status === 'pending_approval' && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Additional Work Requires Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{job.additionalWork.description}</p>
            <p className="font-display text-2xl font-bold">{formatCurrency(job.additionalWork.cost)}</p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleApprove}>Approve</Button>
              <Button variant="outline" className="flex-1" onClick={handleReject}>Decline</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice preview */}
      {job.invoice && (
        <Card>
          <CardHeader><CardTitle>Digital Invoice Preview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {job.invoice.lineItems.map((item) => (
              <div key={item.description} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.description}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(job.invoice.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(job.invoice.tax)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(job.invoice.total)}</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function ServiceHistoryPage() {
  return (
    <div className="space-y-6">
      <Link to="/service"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">Service History</h1></FadeIn>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Vehicles</TabsTrigger>
          {ownedVehicles.map((v) => (
            <TabsTrigger key={v.id} value={v.id}>{v.model}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="space-y-3 mt-4">
          {serviceHistory.map((item) => {
            const vehicle = getOwnedVehicleById(item.vehicleId)
            return (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.type}</p>
                      <Badge variant="outline">{vehicle?.model}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.branchName} · {formatDate(item.date)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.mileage.toLocaleString()} km · {item.description}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.cost)}</p>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
        {ownedVehicles.map((v) => (
          <TabsContent key={v.id} value={v.id} className="space-y-3 mt-4">
            {serviceHistory.filter((h) => h.vehicleId === v.id).map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <p className="font-semibold">{item.type}</p>
                  <p className="text-sm text-muted-foreground">{item.branchName} · {formatDate(item.date)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <p className="font-semibold mt-2">{formatCurrency(item.cost)}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
