import { apiFetch, apiUpload } from '@/lib/api'

export type VinLookup = {
  found: boolean
  vin: string
  canSubmit: boolean
  reason?: string | null
  vehiclePreview?: {
    inventoryVehicleId?: string | null
    make: string
    model: string
    trim: string
    year: number
    color: string
    availability?: string | null
  } | null
}

export type OwnershipRequest = {
  id: string
  vin: string
  registrationNumber?: string | null
  status: string
  documentUrls: string[]
  customerNotes?: string | null
  adminNotes?: string | null
  vehiclePreview?: VinLookup['vehiclePreview']
  ownedVehicleId?: string | null
  createdAt: string
  updatedAt: string
}

export type OwnershipRequestListItem = OwnershipRequest & {
  customerId: string
  customerName: string
  customerEmail?: string | null
}

export type PaginatedOwnershipRequests = {
  items: OwnershipRequestListItem[]
  total: number
  page: number
  size: number
  pages: number
}

export function lookupVin(vin: string) {
  return apiFetch<VinLookup>(`/ownership/lookup?vin=${encodeURIComponent(vin)}`)
}

export function listOwnershipRequests(status = 'pending', page = 1) {
  return apiFetch<PaginatedOwnershipRequests>(
    `/admin/ownership/requests?status=${encodeURIComponent(status)}&page=${page}&size=50`,
  )
}

export function getOwnershipRequest(id: string) {
  return apiFetch<OwnershipRequestListItem>(`/admin/ownership/requests/${id}`)
}

export function updateOwnershipRequest(
  id: string,
  body: {
    status?: string
    adminNotes?: string
    registrationNumber?: string
    inServiceDate?: string
  },
) {
  return apiFetch<OwnershipRequestListItem>(`/admin/ownership/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function uploadOwnershipDocument(file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiUpload<{ url: string }>('/ownership/documents/upload', form)
}
