import { apiFetch } from '@/lib/api'

export interface DashboardSummary {
  vehiclesTotal: number
  vehiclesAvailable: number
  vehiclesReserved: number
  vehiclesSold: number
  customersTotal: number
  customersNew30d: number
  customersWithVehicle: number
  staffTotal: number
  staffActive: number
  branchesTotal: number
  branchesActive: number
  openSupportTickets: number
  slaAtRiskTickets: number
  pendingWarrantyClaims: number
  activeNotificationRules: number
  campaignsSent: number
  unreadNotificationsTotal: number
  leadsActive: number
  leadsPipelineValue: number
  leadsNewThisWeek: number
  leadsConversionRate: number
  serviceToday: number
  serviceInProgress: number
  serviceAwaitingApproval: number
  serviceCapacity: number
  serviceCompletedToday: number
}

export interface PipelineStage {
  stage: string
  status: string
  count: number
  value: number
}

export interface LeadSourceRow {
  source: string
  count: number
}

export interface HotLeadRow {
  id: string
  customerName: string
  interestedModel: string
  status: string
  value: number
  assignedAgent?: string | null
}

export interface ServiceSlotRow {
  id: string
  time: string
  customerName: string
  vehicleLabel: string
  branchName: string
  bayName?: string | null
  status: string
}

export interface SlaTicketRow {
  id: string
  ticketNumber: string
  subject: string
  assignedTo?: string | null
}

export interface InventoryModelRow {
  model: string
  sold: number
  available: number
}

export interface ServiceTypeRow {
  type: string
  count: number
}

export interface BranchStatRow {
  id: string
  name: string
  vehicles: number
  appointmentsToday: number
  activeLeads: number
}

export interface WeeklyLoadRow {
  day: string
  booked: number
  completed: number
}

export interface MonthlySignupRow {
  month: string
  customers: number
}

export interface RevenueMonthRow {
  month: string
  sales: number
  service: number
}

export interface ActivityRow {
  id: string
  text: string
  meta: string
  time: string
  color: string
}

export interface StaffPerformanceRow {
  id: string
  name: string
  department: string
  leadsWon: number
  ticketsOpen: number
}

export interface DashboardOverview {
  summary: DashboardSummary
  leadPipeline: PipelineStage[]
  leadSources: LeadSourceRow[]
  hotLeads: HotLeadRow[]
  todayService: ServiceSlotRow[]
  slaTickets: SlaTicketRow[]
  inventoryByModel: InventoryModelRow[]
  serviceByType: ServiceTypeRow[]
  branchStats: BranchStatRow[]
  weeklyServiceLoad: WeeklyLoadRow[]
  customerSignupsByMonth: MonthlySignupRow[]
  revenueByMonth: RevenueMonthRow[]
  recentActivity: ActivityRow[]
  staffPerformance: StaffPerformanceRow[]
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch('/admin/dashboard/summary')
}

export function getDashboardOverview(): Promise<DashboardOverview> {
  return apiFetch('/admin/dashboard/overview')
}
