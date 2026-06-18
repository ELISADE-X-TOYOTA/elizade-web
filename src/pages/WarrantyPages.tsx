import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Shield, AlertTriangle, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn } from '@/components/effects/PageTransition'
import {
  ownedVehicles,
  warrantyCertificates,
  warrantyClaims,
  recallNotices,
  getOwnedVehicleById,
} from '@/data/dummy'
import { formatDate } from '@/lib/utils'

export function WarrantyPage() {
  const activeRecall = recallNotices.filter((r) => r.affected)

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Warranty & Recalls</h1>
        <p className="text-muted-foreground mt-1">Certificates, claims, and recall alerts</p>
      </FadeIn>

      {activeRecall.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Active Recall Alerts</p>
                {activeRecall.map((r) => (
                  <div key={r.id} className="mt-2">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.referenceCode} · {r.severity}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="certificates">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="recalls">Recalls</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4 mt-4">
          {warrantyCertificates.map((cert) => {
            const vehicle = getOwnedVehicleById(cert.vehicleId)
            return (
              <Card key={cert.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{vehicle?.year} {vehicle?.model} — {cert.type} Warranty</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(cert.coverageStart)} — {formatDate(cert.coverageEnd)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={cert.status === 'active' ? 'success' : 'secondary'}>{cert.status}</Badge>
                  </div>
                  <ul className="mt-4 space-y-1">
                    {cert.coverageDetails.map((d) => (
                      <li key={d} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    <FileText className="h-4 w-4" />
                    View Digital Certificate
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="claims" className="space-y-4 mt-4">
          <Link to="/warranty/claim">
            <Button className="gap-2"><FileText className="h-4 w-4" />File New Claim</Button>
          </Link>
          {warrantyClaims.map((claim) => {
            const vehicle = getOwnedVehicleById(claim.vehicleId)
            return (
              <Card key={claim.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{claim.claimType} Claim</p>
                      <p className="text-sm text-muted-foreground">{vehicle?.model} · {formatDate(claim.createdAt)}</p>
                      <p className="text-sm mt-2">{claim.description}</p>
                      {claim.resolutionNotes && (
                        <p className="text-sm text-emerald-600 mt-2">{claim.resolutionNotes}</p>
                      )}
                    </div>
                    <Badge variant={claim.status === 'approved' ? 'success' : 'warning'}>
                      {claim.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="recalls" className="space-y-4 mt-4">
          {recallNotices.map((recall) => (
            <Card key={recall.id} className={recall.affected ? 'border-destructive/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{recall.title}</p>
                    <p className="text-xs text-muted-foreground">{recall.referenceCode} · {formatDate(recall.issuedAt)}</p>
                    <p className="text-sm text-muted-foreground mt-2">{recall.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={recall.severity === 'critical' ? 'destructive' : 'warning'}>{recall.severity}</Badge>
                    {recall.affected && <Badge variant="destructive">Your vehicle affected</Badge>}
                  </div>
                </div>
                {recall.affected && (
                  <Link to="/service/book">
                    <Button size="sm" className="mt-3">Book Recall Service</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function WarrantyClaimPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/warranty"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">File Warranty Claim</h1></FadeIn>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
              {ownedVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Claim Type</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
              <option>Electrical</option>
              <option>Powertrain</option>
              <option>Body & Paint</option>
              <option>Air Conditioning</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea className="flex min-h-28 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm" placeholder="Describe the issue in detail..." />
          </div>
          <div className="space-y-2">
            <Label>Supporting Media</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  Photo/Video
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={() => toast.success('Warranty claim submitted!')}>
            Submit Claim
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
