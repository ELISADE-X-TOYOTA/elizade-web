import { apiFetch } from '@/lib/api'

export interface ServiceStats {
  todaysAppointments: number
  inProgress: number
  awaitingApproval: number
  completed: number
}

export interface AppointmentBoardItem {
  id: string
  customerId: string
  customerName: string
  vehicleId: string
  vehicleLabel: string
  registrationNumber: string
  serviceType: string
  scheduledAt: string
  status: string
  branchId: string
  branchName: string
  bayId?: string | null
  bayName?: string | null
  technicianId?: string | null
  technicianName?: string | null
  jobId?: string | null
  jobStatus?: string | null
}

export interface AppointmentDetail extends AppointmentBoardItem {
  issueDescription: string
  technicianNotes?: string | null
  estimatedCompletion?: string | null
  mileageAtBooking: number
  createdAt: string
  updatedAt: string
  job?: {
    id: string
    status: string
    estimatedCompletion?: string | null
    startedAt?: string | null
    completedAt?: string | null
  } | null
}

export interface JobStage {
  id: string
  label: string
  completed: boolean
  completedAt?: string | null
  sortOrder: number
}

export interface JobDetail {
  id: string
  appointmentId: string
  status: string
  serviceType: string
  customerName: string
  vehicleLabel: string
  bayName?: string | null
  stagesTotal: number
  stagesCompleted: number
  stages: JobStage[]
  additionalWork: {
    id: string
    description: string
    cost: number
    status: string
  }[]
}

export interface ServiceHistoryItem {
  id: string
  ownedVehicleId: string
  customerName: string
  vehicleLabel: string
  registrationNumber: string
  branchName: string
  serviceType: string
  performedAt: string
  mileage: number
  description: string
  cost: number
}

export interface PaginatedHistory {
  items: ServiceHistoryItem[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ServiceBay {
  id: string
  branchId: string
  branchName: string
  name: string
  isActive: boolean
  createdAt: string
}

export function getServiceStats(): Promise<ServiceStats> {
  return apiFetch('/admin/service/stats')
}

export function listServiceAppointments(params?: {
  date?: string
  branchId?: string
  status?: string
  bayId?: string
}): Promise<AppointmentBoardItem[]> {
  const q = new URLSearchParams()
  if (params?.date) q.set('date', params.date)
  if (params?.branchId) q.set('branchId', params.branchId)
  if (params?.status && params.status !== 'all') q.set('status', params.status)
  if (params?.bayId) q.set('bayId', params.bayId)
  const suffix = q.toString()
  return apiFetch(`/admin/service/appointments${suffix ? `?${suffix}` : ''}`)
}

export function getServiceAppointment(id: string): Promise<AppointmentDetail> {
  return apiFetch(`/admin/service/appointments/${id}`)
}

export function changeAppointmentStatus(
  id: string,
  action: 'confirm' | 'start' | 'complete' | 'cancel',
): Promise<AppointmentDetail> {
  return apiFetch(`/admin/service/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}

export function getServiceJob(id: string): Promise<JobDetail> {
  return apiFetch(`/admin/service/jobs/${id}`)
}

export function updateJobStage(jobId: string, stageId: string, completed: boolean): Promise<JobDetail> {
  return apiFetch(`/admin/service/jobs/${jobId}/stages/${stageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  })
}

export function addAdditionalWork(
  jobId: string,
  body: { description: string; cost: number },
): Promise<JobDetail> {
  return apiFetch(`/admin/service/jobs/${jobId}/additional-work`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateAdditionalWork(
  jobId: string,
  workId: string,
  body: { status: 'approved' | 'rejected' | 'pending_approval' },
): Promise<JobDetail> {
  return apiFetch(`/admin/service/jobs/${jobId}/additional-work/${workId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function listServiceHistory(page = 1, size = 10): Promise<PaginatedHistory> {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  return apiFetch(`/admin/service/history?${q}`)
}

export function createServiceHistory(body: {
  ownedVehicleId: string
  branchId: string
  serviceType: string
  performedAt: string
  mileage: number
  description: string
  cost?: number
}): Promise<ServiceHistoryItem> {
  return apiFetch('/admin/service/history', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listServiceBays(branchId?: string): Promise<ServiceBay[]> {
  const q = branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''
  return apiFetch(`/admin/service/bays${q}`)
}

export function createServiceBay(body: { branchId: string; name: string }): Promise<ServiceBay> {
  return apiFetch('/admin/service/bays', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateServiceBay(
  id: string,
  body: Partial<{ name: string; isActive: boolean }>,
): Promise<ServiceBay> {
  return apiFetch(`/admin/service/bays/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
