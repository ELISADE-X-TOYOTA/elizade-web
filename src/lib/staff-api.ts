import { apiFetch } from '@/lib/api'

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  city: string
  state: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface StaffCreateBody {
  phone: string
  firstName: string
  lastName: string
  email: string
  department: string
  city?: string
  state?: string
  sendWelcomeOtp?: boolean
}

export function listStaff(): Promise<StaffMember[]> {
  return apiFetch<StaffMember[]>('/admin/staff')
}

export function createStaff(body: StaffCreateBody): Promise<StaffMember> {
  return apiFetch<StaffMember>('/admin/staff', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateStaff(
  id: string,
  body: Partial<{
    firstName: string
    lastName: string
    email: string
    department: string
    city: string
    state: string
    isActive: boolean
  }>,
): Promise<StaffMember> {
  return apiFetch<StaffMember>(`/admin/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function sendStaffLoginOtp(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/staff/${id}/send-otp`, {
    method: 'POST',
  })
}
