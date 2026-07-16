import type { UserProfile } from '@/types'

export function getPostAuthPath(role: UserProfile['role']): string {
  if (role === 'admin' || role === 'staff') {
    return '/admin/dashboard'
  }
  return '/login'
}

export function canAccessAdminPortal(role: UserProfile['role'] | undefined): boolean {
  return role === 'admin' || role === 'staff'
}
