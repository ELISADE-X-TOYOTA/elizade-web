import { apiFetch, setAccessToken } from '@/lib/api'
import type { UserProfile } from '@/types'

export interface OtpRequestBody {
  phone: string
  purpose: 'login' | 'register'
  firstName?: string
  lastName?: string
  email?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export async function requestOtp(body: OtpRequestBody) {
  return apiFetch<{ message: string; expires_in_minutes: number }>(
    '/auth/otp/request',
    { method: 'POST', body: JSON.stringify(body) },
    false,
  )
}

export async function verifyOtp(phone: string, code: string) {
  const data = await apiFetch<AuthResponse>(
    '/auth/otp/verify',
    { method: 'POST', body: JSON.stringify({ phone, code }) },
    false,
  )
  setAccessToken(data.access_token)
  return data
}

export async function fetchCurrentUser() {
  return apiFetch<UserProfile>('/auth/me')
}

export function logoutApi() {
  setAccessToken(null)
}
