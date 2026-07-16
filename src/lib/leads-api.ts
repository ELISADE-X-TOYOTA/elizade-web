import { apiFetch } from '@/lib/api'

export interface AgentBrief {
  id: string
  firstName: string
  lastName: string
  email?: string | null
}

export interface LeadListItem {
  id: string
  customerName: string
  email?: string | null
  phone: string
  source: string
  status: string
  interestedModel: string
  value: number
  assignedAgent?: AgentBrief | null
  createdAt: string
  updatedAt: string
}

export interface LeadNote {
  id: string
  leadId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface LeadDetail extends LeadListItem {
  notes?: string | null
  wonAt?: string | null
  lostAt?: string | null
  lostReason?: string | null
  activity: LeadNote[]
}

export interface PaginatedLeads {
  items: LeadListItem[]
  total: number
  page: number
  size: number
  pages: number
}

export interface StatusCount {
  status: string
  count: number
  value: number
}

export interface LeadPipeline {
  totalLeads: number
  totalValue: number
  conversionRate: number
  newThisWeek: number
  byStatus: StatusCount[]
}

export function getLeadPipeline(): Promise<LeadPipeline> {
  return apiFetch('/admin/leads/pipeline')
}

export function listLeads(params?: {
  status?: string
  source?: string
  assignedAgentId?: string
  branchId?: string
  q?: string
  page?: number
  size?: number
}): Promise<PaginatedLeads> {
  const q = new URLSearchParams()
  if (params?.status && params.status !== 'all') q.set('status', params.status)
  if (params?.source) q.set('source', params.source)
  if (params?.assignedAgentId) q.set('assignedAgentId', params.assignedAgentId)
  if (params?.branchId) q.set('branchId', params.branchId)
  if (params?.q) q.set('q', params.q)
  q.set('page', String(params?.page ?? 1))
  q.set('size', String(params?.size ?? 20))
  return apiFetch(`/admin/leads?${q}`)
}

export function getLead(id: string): Promise<LeadDetail> {
  return apiFetch(`/admin/leads/${id}`)
}

export function createLead(body: {
  customerName: string
  phone: string
  source: string
  interestedModel: string
  email?: string
  value?: number
  notes?: string
  assignedAgentId?: string
}): Promise<LeadDetail> {
  return apiFetch('/admin/leads', { method: 'POST', body: JSON.stringify(body) })
}

export function updateLeadStatus(
  id: string,
  body: { status: string; notes?: string },
): Promise<LeadDetail> {
  return apiFetch(`/admin/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function assignLead(id: string, assignedAgentId: string): Promise<LeadDetail> {
  return apiFetch(`/admin/leads/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedAgentId }),
  })
}

export function markLeadWon(id: string, body?: { vehicleId?: string; notes?: string }): Promise<LeadDetail> {
  return apiFetch(`/admin/leads/${id}/won`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  })
}

export function markLeadLost(
  id: string,
  body: { lostReason: string; notes?: string },
): Promise<LeadDetail> {
  return apiFetch(`/admin/leads/${id}/lost`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function addLeadNote(id: string, body: string): Promise<LeadNote> {
  return apiFetch(`/admin/leads/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

/** Fetch every lead across paginated API pages (for exports / breakdown). */
export async function fetchAllLeads(): Promise<LeadListItem[]> {
  const pageSize = 100
  const first = await listLeads({ page: 1, size: pageSize })
  const all = [...first.items]
  for (let page = 2; page <= first.pages; page += 1) {
    const next = await listLeads({ page, size: pageSize })
    all.push(...next.items)
  }
  return all
}
