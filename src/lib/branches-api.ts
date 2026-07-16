import { apiFetch } from '@/lib/api'

export type BranchType = 'showroom' | 'service_centre' | 'both'

export interface BranchAdmin {
  id: string
  name: string
  type: BranchType
  city: string
  state: string
  address: string
  phone?: string | null
  openingHours?: Record<string, string> | null
  isActive: boolean
  vehicleCount: number
  serviceBayCount: number
  createdAt: string
  updatedAt: string
}

export interface BranchSummary {
  total: number
  active: number
  inactive: number
  byType: Record<string, number>
}

export function getBranchSummary(): Promise<BranchSummary> {
  return apiFetch('/admin/branches/summary')
}

export function listAdminBranches(params?: {
  q?: string
  type?: string
  includeInactive?: boolean
}): Promise<BranchAdmin[]> {
  const q = new URLSearchParams()
  if (params?.q) q.set('q', params.q)
  if (params?.type && params.type !== 'all') q.set('type', params.type)
  if (params?.includeInactive === false) q.set('includeInactive', 'false')
  const suffix = q.toString()
  return apiFetch(`/admin/branches${suffix ? `?${suffix}` : ''}`)
}

export function getAdminBranch(id: string): Promise<BranchAdmin> {
  return apiFetch(`/admin/branches/${id}`)
}

export function createBranch(body: {
  name: string
  type: BranchType
  city: string
  state: string
  address: string
  phone?: string
  isActive?: boolean
}): Promise<BranchAdmin> {
  return apiFetch('/admin/branches', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateBranch(
  id: string,
  body: Partial<{
    name: string
    type: BranchType
    city: string
    state: string
    address: string
    phone: string
    isActive: boolean
  }>,
): Promise<BranchAdmin> {
  return apiFetch(`/admin/branches/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
