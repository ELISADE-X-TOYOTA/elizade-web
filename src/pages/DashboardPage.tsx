import { Link } from 'react-router-dom'
import {
  Car,
  Wrench,
  Shield,
  Bell,
  HeadphonesIcon,
  ArrowRight,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FadeIn, StaggerChildren } from '@/components/effects/PageTransition'
import { SafeImage } from '@/components/ui/safe-image'
import {
  dashboardStats,
  ownedVehicles,
  serviceAppointments,
  notifications,
  recallNotices,
} from '@/data/dummy'
import { formatDate, formatDateTime } from '@/lib/utils'

export function DashboardPage() {
  const primaryVehicle = ownedVehicles.find((v) => v.isPrimary)
  const upcomingAppointment = serviceAppointments[0]
  const activeRecall = recallNotices.find((r) => r.affected)

  const quickActions = [
    { to: '/service/book', label: 'Book Service', icon: Wrench, color: 'text-blue-500' },
    { to: '/vehicles', label: 'Browse Cars', icon: Car, color: 'text-primary' },
    { to: '/warranty/claim', label: 'File Claim', icon: Shield, color: 'text-emerald-500' },
    { to: '/support/new', label: 'Get Help', icon: HeadphonesIcon, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold">
            Good morning, Adaeze 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your vehicles today.
          </p>
        </div>
      </FadeIn>

      {/* Alerts */}
      {activeRecall && (
        <FadeIn delay={0.05}>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Critical Recall Alert</p>
                <p className="text-sm text-muted-foreground truncate">{activeRecall.title}</p>
              </div>
              <Link to="/warranty">
                <Button size="sm" variant="destructive">View</Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Stats grid */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Services', value: dashboardStats.upcomingServices, icon: Calendar },
          { label: 'Active Tickets', value: dashboardStats.activeTickets, icon: HeadphonesIcon },
          { label: 'Notifications', value: dashboardStats.unreadNotifications, icon: Bell },
          { label: 'Warranty Alerts', value: dashboardStats.warrantyAlerts, icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="content-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-display text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </StaggerChildren>

      {/* Quick actions */}
      <FadeIn>
        <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                  <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Primary vehicle */}
        {primaryVehicle && (
          <FadeIn>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Primary Vehicle
                  <Badge variant="success">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <SafeImage
                    src={primaryVehicle.image}
                    alt=""
                    className="h-20 w-28 sm:h-24 sm:w-32 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-display font-semibold text-lg">
                      {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">{primaryVehicle.trim} · {primaryVehicle.color}</p>
                    <p className="text-xs text-muted-foreground mt-1">{primaryVehicle.mileage.toLocaleString()} km</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Next service</span>
                        <span>{formatDate(primaryVehicle.nextServiceDue)}</span>
                      </div>
                      <Progress value={85} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {primaryVehicle.nextServiceMileage - primaryVehicle.mileage} km until {primaryVehicle.nextServiceMileage.toLocaleString()} km service
                      </p>
                    </div>
                  </div>
                </div>
                <Link to="/my-vehicles">
                  <Button variant="outline" size="sm" className="mt-4 w-full gap-2">
                    View all vehicles
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Upcoming appointment */}
        {upcomingAppointment && (
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{upcomingAppointment.serviceType} Service</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(upcomingAppointment.scheduledAt)}
                      </p>
                    </div>
                    <Badge variant="success" className="ml-auto">Confirmed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{upcomingAppointment.issueDescription}</p>
                  <Link to={`/service/track/${upcomingAppointment.id}`}>
                    <Button variant="outline" size="sm" className="w-full">View details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>

      {/* Recent notifications */}
      <FadeIn>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Recent Notifications</h2>
          <Link to="/notifications" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {notifications.slice(0, 3).map((n) => (
            <Card key={n.id} className={!n.isRead ? 'border-primary/20 bg-primary/5' : ''}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-muted'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(n.createdAt)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  )
}
