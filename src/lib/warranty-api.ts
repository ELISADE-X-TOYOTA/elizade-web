import { apiFetch } from '@/lib/api'

export interface WarrantySummary {
  pendingClaims: number
  activeCertificates: number
  activeRecalls: number
  escalatedClaims: number
}

export interface WarrantyClaim {
  id: string
  claimType: string
  description: string
  status: string
  customerId: string
  customerName: string
  vehicleLabel: string
  assignedToId?: string | null
  assignedToName?: string | null
  resolutionNotes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedClaims {
  items: WarrantyClaim[]
  total: number
  page: number
  size: number
  pages: number
}

export interface OwnedVehicleOption {
  id: string
  customerId: string
  customerName: string
  label: string
  registrationNumber: string
  vin: string
}

export interface WarrantyCertificate {
  id: string
  certificateNumber: string
  type: string
  status: string
  customerName: string
  vehicleLabel: string
  coverageStart: string
  coverageEnd: string
  coverageDetails: string[]
}

export interface RecallCampaign {
  id: string
  referenceCode: string
  title: string
  description: string
  severity: string
  affectedModels: string[]
  affectedCount: number
  notifiedCount: number
  completedCount: number
  isActive: boolean
  issuedAt: string
}

export function getWarrantySummary(): Promise<WarrantySummary> {
  return apiFetch('/admin/warranty/summary')
}

export function listWarrantyClaims(status = 'pending', page = 1, size = 20): Promise<PaginatedClaims> {
  const q = new URLSearchParams({ status, page: String(page), size: String(size) })
  return apiFetch(`/admin/warranty/claims?${q}`)
}

export function getWarrantyClaim(id: string): Promise<WarrantyClaim> {
  return apiFetch(`/admin/warranty/claims/${id}`)
}

export function updateWarrantyClaim(
  id: string,
  body: Partial<{ status: string; resolutionNotes: string; assignedToId: string }>,
): Promise<WarrantyClaim> {
  return apiFetch(`/admin/warranty/claims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function listOwnedVehicleOptions(q?: string): Promise<OwnedVehicleOption[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiFetch(`/admin/warranty/owned-vehicles${qs}`)
}

export function listWarrantyCertificates(): Promise<WarrantyCertificate[]> {
  return apiFetch('/admin/warranty/certificates')
}

export function createWarrantyCertificate(body: {
  ownedVehicleId: string
  type?: string
  coverageDetails?: string[]
}): Promise<WarrantyCertificate> {
  return apiFetch('/admin/warranty/certificates', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listRecallCampaigns(): Promise<RecallCampaign[]> {
  return apiFetch('/admin/warranty/recalls')
}

export function createRecallCampaign(body: {
  referenceCode: string
  title: string
  description: string
  severity?: string
  affectedModels?: string[]
  affectedYearFrom?: number
  affectedYearTo?: number
}): Promise<RecallCampaign> {
  return apiFetch('/admin/warranty/recalls', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function notifyRecallCampaign(id: string): Promise<{ recall: RecallCampaign; notifiedCount: number }> {
  return apiFetch(`/admin/warranty/recalls/${id}/notify`, { method: 'POST' })
}
