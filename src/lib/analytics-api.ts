import { apiFetch } from '@/lib/api'

export interface InventoryModelStat {
  model: string
  available: number
  reserved: number
  sold: number
  total: number
}

export interface NamedCount {
  name: string
  count: number
}

export interface AnalyticsOverview {
  inventoryByModel: InventoryModelStat[]
  inventoryAvailable: number
  inventoryReserved: number
  inventorySold: number
  customersTotal: number
  customersNew30d: number
  customersWithVehicle: number
  openSupportTickets: number
  slaAtRiskTickets: number
  supportByCategory: NamedCount[]
  pendingWarrantyClaims: number
  warrantyClaimsByStatus: NamedCount[]
  activeCertificates: number
  activeRecalls: number
  campaignsSent: number
  activeNotificationRules: number
  unreadNotificationsTotal: number
  serviceToday: number | null
  serviceCapacity: number | null
  leadsActive: number | null
}

export function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiFetch('/admin/analytics/overview')
}
