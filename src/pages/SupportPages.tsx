import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Clock, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/effects/PageTransition'
import { supportTickets } from '@/data/dummy'
import { formatDateTime } from '@/lib/utils'
import type { TicketCategory } from '@/types'

const categoryColors: Record<TicketCategory, string> = {
  sales: 'default',
  service: 'warning',
  warranty: 'success',
  billing: 'secondary',
  general: 'outline',
}

export function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">Track inquiries and get help</p>
        </FadeIn>
        <Link to="/support/new">
          <Button>New Ticket</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {supportTickets.map((ticket) => (
          <Link key={ticket.id} to={`/support/${ticket.id}`}>
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={categoryColors[ticket.category] as 'default' | 'warning' | 'success' | 'secondary' | 'outline'}>
                        {ticket.category}
                      </Badge>
                      <Badge variant="outline">{ticket.status.replace('_', ' ')}</Badge>
                      {ticket.satisfactionRating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs">{ticket.satisfactionRating}</span>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold mt-2">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ticket.ticketNumber} · {formatDateTime(ticket.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      SLA: {formatDateTime(ticket.resolutionDue)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function SupportTicketPage() {
  const { id } = useParams()
  const ticket = supportTickets.find((t) => t.id === id) || supportTickets[0]
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)

  const handleSend = () => {
    if (message.trim()) {
      toast.success('Message sent')
      setMessage('')
    }
  }

  const handleRate = () => {
    if (rating > 0) toast.success('Thank you for your feedback!')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/support"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>

      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge>{ticket.category}</Badge>
              <Badge variant="outline">{ticket.status.replace('_', ' ')}</Badge>
            </div>
            <h1 className="font-display text-2xl font-bold mt-2">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground">{ticket.ticketNumber}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Response due: {formatDateTime(ticket.firstResponseDue)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Resolution due: {formatDateTime(ticket.resolutionDue)}</span>
        </div>
      </FadeIn>

      {/* Messages */}
      <Card>
        <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.sender === 'customer'
                  ? 'bg-primary text-primary-foreground'
                  : msg.sender === 'staff'
                    ? 'glass'
                    : 'bg-muted text-muted-foreground text-center text-xs'
              }`}>
                {msg.sender === 'staff' && <p className="text-xs font-semibold text-primary mb-1">Elizade Support</p>}
                <p>{msg.body}</p>
                <p className="text-[10px] opacity-60 mt-1">{formatDateTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      )}

      {ticket.status === 'resolved' && !ticket.satisfactionRating && (
        <Card>
          <CardHeader><CardTitle>Rate your experience</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                  <Star className={`h-8 w-8 ${s <= rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <textarea className="flex min-h-20 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm mb-3" placeholder="Additional feedback (optional)" />
            <Button onClick={handleRate}>Submit Rating</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function NewTicketPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/support"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <FadeIn><h1 className="font-display text-3xl font-bold">New Support Ticket</h1></FadeIn>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm">
              <option value="sales">Sales</option>
              <option value="service">Service</option>
              <option value="warranty">Warranty</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input placeholder="Brief description of your issue" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea className="flex min-h-28 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm" placeholder="Provide details..." />
          </div>
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  Upload file
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
            Expected response time: Sales — 2 hours · Service — 4 hours · Warranty — 24 hours · Billing — 48 hours
          </div>
          <Button className="w-full" size="lg" onClick={() => toast.success('Ticket created!')}>Submit Ticket</Button>
        </CardContent>
      </Card>
    </div>
  )
}
