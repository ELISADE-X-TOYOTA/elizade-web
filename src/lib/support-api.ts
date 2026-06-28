import { apiFetch } from '@/lib/api'

export interface SupportSummary {
  openTickets: number
  atRiskTickets: number
  unassignedTickets: number
  resolvedToday: number
}

export interface SupportAssignee {
  id: string
  name: string
}

export interface SlaConfig {
  id: string
  category: string
  responseHours: number
  resolutionHours: number
  isActive: boolean
}

export interface SupportTicketListItem {
  id: string
  ticketNumber: string
  subject: string
  category: string
  status: string
  priority: string
  slaStatus: string
  customerId: string
  customerName: string
  assignedToId?: string | null
  assignedToName?: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  senderType: string
  senderName?: string | null
  body: string
  createdAt: string
}

export interface SupportTicketDetail extends SupportTicketListItem {
  firstResponseDue: string
  resolutionDue: string
  firstResponseAt?: string | null
  resolvedAt?: string | null
  messages: TicketMessage[]
}

export interface PaginatedTickets {
  items: SupportTicketListItem[]
  total: number
  page: number
  size: number
  pages: number
}

export function getSupportSummary(): Promise<SupportSummary> {
  return apiFetch('/admin/support/summary')
}

export function listSupportAssignees(): Promise<SupportAssignee[]> {
  return apiFetch('/admin/support/assignees')
}

export function listSlaConfigs(): Promise<SlaConfig[]> {
  return apiFetch('/admin/support/sla-configs')
}

export function updateSlaConfig(
  id: string,
  body: Partial<{ responseHours: number; resolutionHours: number; isActive: boolean }>,
): Promise<SlaConfig> {
  return apiFetch(`/admin/support/sla-configs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function listSupportTickets(params: {
  status?: string
  category?: string
  slaStatus?: string
  q?: string
  page?: number
  size?: number
} = {}): Promise<PaginatedTickets> {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.category) q.set('category', params.category)
  if (params.slaStatus) q.set('slaStatus', params.slaStatus)
  if (params.q) q.set('q', params.q)
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  const qs = q.toString()
  return apiFetch(`/admin/support/tickets${qs ? `?${qs}` : ''}`)
}

export function createSupportTicket(body: {
  customerId: string
  category: string
  subject: string
  priority?: string
  body?: string
}): Promise<SupportTicketDetail> {
  return apiFetch('/admin/support/tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getSupportTicket(id: string): Promise<SupportTicketDetail> {
  return apiFetch(`/admin/support/tickets/${id}`)
}

export function replyToTicket(id: string, body: string): Promise<{ ticket: SupportTicketDetail; message: TicketMessage }> {
  return apiFetch(`/admin/support/tickets/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function assignTicket(id: string, assignedToId: string): Promise<SupportTicketDetail> {
  return apiFetch(`/admin/support/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToId }),
  })
}

export function resolveTicket(id: string): Promise<SupportTicketDetail> {
  return apiFetch(`/admin/support/tickets/${id}/resolve`, { method: 'POST' })
}
