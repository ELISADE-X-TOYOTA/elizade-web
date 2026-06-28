import { apiFetch } from '@/lib/api'

export interface DashboardSummary {
  vehiclesTotal: number
  vehiclesAvailable: number
  vehiclesReserved: number
  customersTotal: number
  customersNew30d: number
  staffTotal: number
  staffActive: number
  openSupportTickets: number
  slaAtRiskTickets: number
  pendingWarrantyClaims: number
  activeNotificationRules: number
  campaignsSent: number
  unreadNotificationsTotal: number
  leadsActive: number | null
  serviceToday: number | null
  serviceCapacity: number | null
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch('/admin/dashboard/summary')
}
