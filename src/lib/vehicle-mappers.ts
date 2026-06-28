import { apiFetch } from '@/lib/api'
import type { Branch, AvailabilityStatus, Vehicle } from '@/types'
import type { VehicleDetail, VehicleListItem } from '@/lib/inventory-api'

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('/images')) return url
  if (url.startsWith('/media')) {
    const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
    if (apiUrl.startsWith('http')) {
      return `${apiUrl.replace(/\/api\/v1\/?$/, '')}${url}`
    }
    return url
  }
  return url
}

function toNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined
  return Number(value)
}

export function mapListItemToVehicle(item: VehicleListItem): Vehicle {
  return {
    id: item.id,
    make: item.make,
    model: item.model,
    trim: item.trim,
    year: item.year,
    color: item.color,
    colorHex: item.colorHex,
    price: Number(item.price),
    promotionalPrice: toNumber(item.promotionalPrice),
    isPromotional: item.isPromotional,
    promotionLabel: item.promotionLabel ?? undefined,
    fuelType: item.fuelType,
    transmission: item.transmission,
    engine: '',
    availability: item.availability as AvailabilityStatus,
    branchId: item.branchId,
    images: item.primaryImageUrl ? [resolveMediaUrl(item.primaryImageUrl)] : [],
    specs: {},
  }
}

export function mapDetailToVehicle(detail: VehicleDetail): Vehicle {
  const images =
    detail.images?.length > 0
      ? [...detail.images]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((img) => resolveMediaUrl(img.url))
      : detail.primaryImageUrl
        ? [resolveMediaUrl(detail.primaryImageUrl)]
        : []

  return {
    id: detail.id,
    make: detail.make,
    model: detail.model,
    trim: detail.trim,
    year: detail.year,
    color: detail.color,
    colorHex: detail.colorHex,
    price: Number(detail.price),
    promotionalPrice: toNumber(detail.promotionalPrice),
    isPromotional: detail.isPromotional,
    promotionLabel: detail.promotionLabel ?? undefined,
    fuelType: detail.fuelType,
    transmission: detail.transmission,
    engine: detail.engine,
    mileage: detail.mileage ?? undefined,
    availability: detail.availability as AvailabilityStatus,
    branchId: detail.branchId,
    branchName: detail.branchName,
    branchCity: detail.branchCity,
    branchState: detail.branchState,
    images,
    specs: (detail.specs ?? {}) as Record<string, string>,
    vin: detail.vin,
  }
}

export interface BranchOption {
  id: string
  name: string
  city: string
  state: string
}

export function listBranches(): Promise<Branch[]> {
  return apiFetch('/branches', {}, false)
}

export function branchMap(branches: Branch[]): Map<string, Branch> {
  return new Map(branches.map((b) => [b.id, b]))
}

export function getBranchLabel(
  branchId: string,
  branches: Map<string, Branch>,
  fallback?: { city?: string; state?: string; name?: string },
): string {
  const branch = branches.get(branchId)
  if (branch) return `${branch.city}, ${branch.state}`
  if (fallback?.city) return `${fallback.city}${fallback.state ? `, ${fallback.state}` : ''}`
  return fallback?.name ?? '—'
}
