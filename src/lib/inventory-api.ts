import { apiFetch, apiUpload } from '@/lib/api'

export interface VehicleImage {
  id: string
  url: string
  altText?: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface VehicleListItem {
  id: string
  make: string
  model: string
  trim: string
  year: number
  color: string
  colorHex: string
  price: string | number
  promotionalPrice?: string | number | null
  isPromotional: boolean
  promotionLabel?: string | null
  fuelType: string
  transmission: string
  availability: string
  branchId: string
  primaryImageUrl?: string | null
  createdAt: string
}

export interface VehicleListResponse {
  items: VehicleListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface VehicleDetail extends VehicleListItem {
  engine: string
  mileage?: number | null
  branchName: string
  branchCity: string
  branchState: string
  specs: Record<string, string>
  images: VehicleImage[]
  updatedAt?: string | null
  vin?: string
}

export interface VehicleAdminListItem {
  id: string
  vin?: string | null
  stockNumber?: string | null
  make: string
  model: string
  trim: string
  year: number
  color: string
  price: string | number
  promotionalPrice?: string | number | null
  isPromotional: boolean
  availability: string
  branchId: string
  branchName: string
  isPublished: boolean
  primaryImageUrl?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface VehicleAdminListResponse {
  items: VehicleAdminListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface VehicleAdminDetail extends VehicleDetail {
  stockNumber?: string | null
  isPublished: boolean
  publishedAt?: string | null
  createdById?: string | null
  deletedAt?: string | null
}

export interface VehicleCreateBody {
  vin?: string
  stockNumber?: string
  make?: string
  model: string
  trim: string
  year: number
  color: string
  colorHex?: string
  price: number
  promotionalPrice?: number
  isPromotional?: boolean
  promotionLabel?: string
  fuelType: string
  transmission: string
  engine: string
  mileage?: number
  availability?: string
  branchId: string
  specs?: Record<string, string>
  isPublished?: boolean
}

export interface BulkImportResult {
  total: number
  created: number
  failed: number
  createdIds: string[]
  errors: { row: number; errors: string[] }[]
}

export interface ListVehiclesParams {
  branchId?: string
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  fuelType?: string
  transmission?: string
  availability?: string
  page?: number
  limit?: number
  sort?: string
}

export interface AdminListVehiclesParams {
  branchId?: string
  make?: string
  model?: string
  availability?: string
  isPublished?: boolean
  includeDeleted?: boolean
  page?: number
  limit?: number
  sort?: string
}

function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') q.set(key, String(value))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function listPublicVehicles(params: ListVehiclesParams = {}): Promise<VehicleListResponse> {
  return apiFetch(`/vehicles${toQuery(params as Record<string, string | number | boolean | undefined>)}`, {}, false)
}

export function getPublicVehicle(id: string): Promise<VehicleDetail> {
  return apiFetch(`/vehicles/${id}`, {}, false)
}

export function compareVehicles(ids: string[]): Promise<VehicleDetail[]> {
  return apiFetch(`/vehicles/compare?ids=${ids.join(',')}`, {}, false)
}

export function listAdminVehicles(params: AdminListVehiclesParams = {}): Promise<VehicleAdminListResponse> {
  return apiFetch(`/admin/vehicles${toQuery(params as Record<string, string | number | boolean | undefined>)}`)
}

export function getAdminVehicle(id: string): Promise<VehicleAdminDetail> {
  return apiFetch(`/admin/vehicles/${id}`)
}

export function createVehicle(body: VehicleCreateBody): Promise<VehicleAdminDetail> {
  return apiFetch('/admin/vehicles', { method: 'POST', body: JSON.stringify(body) })
}

export function updateVehicle(id: string, body: Partial<VehicleCreateBody>): Promise<VehicleAdminDetail> {
  return apiFetch(`/admin/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export function updateVehicleStatus(id: string, availability: string): Promise<VehicleAdminDetail> {
  return apiFetch(`/admin/vehicles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ availability }),
  })
}

export function deleteVehicle(id: string): Promise<void> {
  return apiFetch(`/admin/vehicles/${id}`, { method: 'DELETE' })
}

export function uploadVehicleImages(id: string, files: File[]): Promise<VehicleAdminDetail> {
  const form = new FormData()
  for (const file of files) form.append('files', file)
  return apiUpload(`/admin/vehicles/${id}/images`, form)
}

export function deleteVehicleImage(vehicleId: string, imageId: string): Promise<void> {
  return apiFetch(`/admin/vehicles/${vehicleId}/images/${imageId}`, { method: 'DELETE' })
}

export function bulkImportVehicles(file: File): Promise<BulkImportResult> {
  const form = new FormData()
  form.append('file', file)
  return apiUpload('/admin/vehicles/bulk-import', form)
}
