import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn } from '@/components/effects/PageTransition'
import { userProfile, ownedVehicles, watchlist } from '@/data/dummy'
import { formatDate } from '@/lib/utils'

export function ProfilePage() {
  const [prefs, setPrefs] = useState(userProfile.preferences)

  const handleSave = () => toast.success('Profile updated!')

  return (
    <div className="space-y-6 max-w-3xl">
      <FadeIn>
        <h1 className="font-display text-3xl font-bold">Profile & Settings</h1>
      </FadeIn>

      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <img src={userProfile.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/20" />
          <div>
            <h2 className="font-display text-2xl font-bold">{userProfile.firstName} {userProfile.lastName}</h2>
            <p className="text-muted-foreground">{userProfile.email}</p>
            <p className="text-sm text-muted-foreground">{userProfile.phone}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input defaultValue={userProfile.firstName} /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input defaultValue={userProfile.lastName} /></div>
                <div className="space-y-2"><Label>Email</Label><Input defaultValue={userProfile.email} type="email" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input defaultValue={userProfile.phone} /></div>
                <div className="space-y-2"><Label>City</Label><Input defaultValue={userProfile.city} /></div>
                <div className="space-y-2"><Label>State</Label><Input defaultValue={userProfile.state} /></div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              {[
                { key: 'pushEnabled' as const, label: 'Push Notifications', desc: 'Service reminders, recalls, updates' },
                { key: 'smsEnabled' as const, label: 'SMS Notifications', desc: 'Appointment confirmations via SMS' },
                { key: 'emailEnabled' as const, label: 'Email Notifications', desc: 'Quotations, invoices, newsletters' },
                { key: 'marketingOptIn' as const, label: 'Marketing Communications', desc: 'Promotions and offers' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={prefs[item.key]}
                    onCheckedChange={(v) => setPrefs({ ...prefs, [item.key]: v })}
                  />
                </div>
              ))}
              <Button onClick={handleSave}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function MyVehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold">My Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage your registered vehicles</p>
        </FadeIn>
        <Button className="gap-2" onClick={() => toast.info('Vehicle claiming flow — enter chassis/VIN to verify ownership')}>
          <Plus className="h-4 w-4" />
          Claim Vehicle
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {ownedVehicles.map((v) => (
          <Card key={v.id} className="overflow-hidden">
            <div className="relative h-48">
              <img src={v.image} alt="" className="h-full w-full object-cover" />
              {v.isPrimary && <Badge className="absolute top-3 left-3">Primary</Badge>}
            </div>
            <CardContent className="p-5">
              <h3 className="font-display text-xl font-bold">{v.year} {v.make} {v.model}</h3>
              <p className="text-sm text-muted-foreground">{v.trim} · {v.color}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div><span className="text-muted-foreground">VIN</span><p className="font-mono text-xs">{v.vin}</p></div>
                <div><span className="text-muted-foreground">Reg.</span><p>{v.registrationNumber}</p></div>
                <div><span className="text-muted-foreground">Mileage</span><p>{v.mileage.toLocaleString()} km</p></div>
                <div><span className="text-muted-foreground">Purchased</span><p>{formatDate(v.purchaseDate)}</p></div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link to="/service/book" className="flex-1"><Button variant="outline" size="sm" className="w-full">Book Service</Button></Link>
                <Link to="/warranty" className="flex-1"><Button variant="outline" size="sm" className="w-full">Warranty</Button></Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Watchlist */}
      <FadeIn>
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notify Me Watchlist
        </h2>
        <div className="space-y-2">
          {watchlist.map((w) => (
            <Card key={w.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{w.model} {w.trim}</p>
                  {w.color && <p className="text-sm text-muted-foreground">{w.color}</p>}
                </div>
                <Badge variant={w.isActive ? 'success' : 'secondary'}>
                  {w.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  )
}
