import { apiFetch } from '@/lib/api'

export interface CustomerSegments {
  total: number
  active: number
  inactive: number
  verified: number
  unverified: number
  hasVehicle: number
  noVehicle: number
  new: number
  premium: number
  atRisk: number
}

export interface OwnedVehicleBrief {
  id: string
  vin: string
  make: string
  model: string
  year: number
  registrationNumber: string
  purchaseDate?: string | null
}

export interface CustomerNoteBrief {
  id: string
  body: string
  createdAt: string
  authorName: string
}

export interface CustomerListItem {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone: string
  city: string
  state: string
  avatar?: string | null
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  ownedVehicles: OwnedVehicleBrief[]
  crmNotes: CustomerNoteBrief[]
}

export interface PaginatedCustomers {
  items: CustomerListItem[]
  total: number
  page: number
  size: number
  pages: number
}

export interface CustomerContact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone: string
  city: string
  state: string
  avatar?: string | null
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerPreferences {
  pushEnabled: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  marketingOptIn: boolean
}

export interface CustomerActivityItem {
  id: string
  type: string
  title: string
  description: string
  status?: string | null
  timestamp: string
}

export interface CustomerProfile {
  contact: CustomerContact
  preferences: CustomerPreferences
  activity: CustomerActivityItem[]
}

export interface CustomerVehicle {
  id: string
  vin: string
  make: string
  model: string
  trim: string
  year: number
  color: string
  colorHex: string
  mileage: number
  registrationNumber: string
  purchaseDate?: string | null
  imageUrl?: string | null
  isPrimary: boolean
  nextServiceDue?: string | null
  nextServiceMileage?: number | null
  createdAt: string
}

export interface CustomerVehiclesResponse {
  customerId: string
  vehicles: CustomerVehicle[]
  totalVehicles: number
}

export interface CustomerNote {
  id: string
  customerId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
  updatedAt: string
}

export type CustomerSegmentFilter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'verified'
  | 'unverified'
  | 'has_vehicle'
  | 'no_vehicle'

export function getCustomerSegments(): Promise<CustomerSegments> {
  return apiFetch('/admin/customers/segments')
}

export function listCustomers(params: {
  q?: string
  segment?: CustomerSegmentFilter
  page?: number
  size?: number
} = {}): Promise<PaginatedCustomers> {
  const q = new URLSearchParams()
  if (params.q) q.set('q', params.q)
  if (params.segment) q.set('segment', params.segment)
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  const qs = q.toString()
  return apiFetch(`/admin/customers${qs ? `?${qs}` : ''}`)
}

export function getCustomerProfile(id: string): Promise<CustomerProfile> {
  return apiFetch(`/admin/customers/${id}`)
}

export function getCustomerVehicles(id: string): Promise<CustomerVehiclesResponse> {
  return apiFetch(`/admin/customers/${id}/vehicles`)
}

export function getCustomerNotes(id: string): Promise<CustomerNote[]> {
  return apiFetch(`/admin/customers/${id}/notes`)
}

export function createCustomerNote(id: string, body: string): Promise<CustomerNote> {
  return apiFetch(`/admin/customers/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function updateCustomerNote(
  customerId: string,
  noteId: string,
  body: string,
): Promise<CustomerNote> {
  return apiFetch(`/admin/customers/${customerId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  })
}

export function deleteCustomerNote(customerId: string, noteId: string): Promise<void> {
  return apiFetch(`/admin/customers/${customerId}/notes/${noteId}`, { method: 'DELETE' })
}
