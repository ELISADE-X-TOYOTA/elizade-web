import { useLocation } from 'react-router-dom'

export const ADMIN_PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Operations overview',
  '/admin/inventory': 'Vehicle inventory',
  '/admin/customers': 'Customer CRM',
  '/admin/ownership': 'Vehicle ownership claims',
  '/admin/leads': 'Lead pipeline',
  '/admin/leads/breakdown': 'Pipeline breakdown',
  '/admin/service': 'Service operations',
  '/admin/warranty': 'Warranty & recalls',
  '/admin/support': 'Support inbox',
  '/admin/notifications': 'Notifications',
  '/admin/analytics': 'Business intelligence',
  '/admin/branches': 'Branches & locations',
  '/admin/staff': 'Team management',
}

export function getAdminPageTitle(pathname: string): string {
  const match = Object.entries(ADMIN_PAGE_TITLES).find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  )
  return match?.[1] ?? 'Admin portal'
}

export function useAdminPageTitle(): string {
  const { pathname } = useLocation()
  return getAdminPageTitle(pathname)
}

/** Drawer / panel header — matches main admin sidebar */
export const ADMIN_SIDEBAR_BG = '#0a1628'
