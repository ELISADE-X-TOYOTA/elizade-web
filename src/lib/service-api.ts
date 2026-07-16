import { apiFetch } from '@/lib/api'

export interface CustomerAppointment {
  id: string
  vehicleId: string
  vehicleLabel: string
  serviceType: string
  scheduledAt: string
  status: string
  branchId: string
  branchName: string
  jobId?: string | null
  pendingAdditionalWork: boolean
}

export interface ServiceJobStage {
  id: string
  label: string
  completed: boolean
  completedAt?: string | null
  sortOrder: number
}

export interface AdditionalWorkItem {
  id: string
  description: string
  cost: number
  status: string
  customerRespondedAt?: string | null
  createdAt: string
}

export interface ServiceJobTrack {
  id: string
  appointmentId: string
  status: string
  serviceType: string
  customerName: string
  vehicleLabel: string
  bayName?: string | null
  estimatedCompletion?: string | null
  startedAt?: string | null
  completedAt?: string | null
  stagesTotal: number
  stagesCompleted: number
  stages: ServiceJobStage[]
  additionalWork: AdditionalWorkItem[]
  invoice?: {
    subtotal: number
    tax: number
    total: number
    lineItems: { id: string; description: string; amount: number; sortOrder: number }[]
  } | null
}

export interface ServiceTrackPayload {
  appointment: {
    id: string
    status: string
    serviceType: string
    scheduledAt: string
    branchName: string
    vehicleLabel: string
    issueDescription: string
    estimatedCompletion?: string | null
    jobId?: string | null
  }
  job: ServiceJobTrack | null
}

export function listMyServiceAppointments(): Promise<CustomerAppointment[]> {
  return apiFetch('/service/appointments')
}

export function getServiceTrack(appointmentId: string): Promise<ServiceTrackPayload> {
  return apiFetch(`/service/appointments/${appointmentId}/track`)
}

export function respondAdditionalWork(
  jobId: string,
  workId: string,
  decision: 'approve' | 'reject',
): Promise<ServiceJobTrack> {
  return apiFetch(`/service/jobs/${jobId}/additional-work/${workId}`, {
    method: 'PATCH',
    body: JSON.stringify({ decision }),
  })
}
