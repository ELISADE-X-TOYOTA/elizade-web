import type { UserProfile } from '@/types'

export function getPostAuthPath(role: UserProfile['role']): string {
  return role === 'admin' || role === 'staff' ? '/admin/dashboard' : '/dashboard'
}

export function canAccessAdminPortal(role: UserProfile['role'] | undefined): boolean {
  return role === 'admin' || role === 'staff'
}
