import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/effects/PageTransition'
import { ApiError } from '@/lib/api'
import {
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotificationItem,
} from '@/lib/notifications-api'
import { formatDateTime } from '@/lib/utils'

const categoryColors: Record<string, 'default' | 'warning' | 'success' | 'secondary' | 'destructive'> = {
  service: 'default',
  sales: 'secondary',
  warranty: 'warning',
  support: 'success',
  promo: 'destructive',
  system: 'secondary',
}

export function NotificationsPage() {
  const [items, setItems] = useState<UserNotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listUserNotifications())
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const unread = items.filter((n) => !n.isRead).length

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    setBusy(true)
    try {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to mark all as read')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">{unread} unread</p>
        </FadeIn>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading notifications…
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card
              key={n.id}
              className={!n.isRead ? 'border-primary/20 bg-primary/5 cursor-pointer' : ''}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    !n.isRead ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Bell className={`h-5 w-5 ${!n.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{n.title}</p>
                      <Badge variant={categoryColors[n.category] ?? 'secondary'} className="text-[10px]">{n.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDateTime(n.createdAt)}</p>
                    {n.deepLink && (
                      <Link to={n.deepLink} className="text-xs text-primary hover:underline mt-2 inline-block">
                        View details →
                      </Link>
                    )}
                  </div>
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
