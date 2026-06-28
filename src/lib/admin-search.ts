import { listCustomers } from '@/lib/customers-api'
import { listAdminVehicles } from '@/lib/inventory-api'
import { listStaff } from '@/lib/staff-api'
import { listSupportTickets } from '@/lib/support-api'

export type AdminSearchResult = {
  id: string
  type: 'customer' | 'vehicle' | 'ticket' | 'staff' | 'page'
  title: string
  subtitle: string
  href: string
}

const QUICK_PAGES: AdminSearchResult[] = [
  { id: 'page-dashboard', type: 'page', title: 'Operations overview', subtitle: 'Admin dashboard', href: '/admin/dashboard' },
  { id: 'page-inventory', type: 'page', title: 'Vehicle inventory', subtitle: 'Manage listings', href: '/admin/inventory' },
  { id: 'page-customers', type: 'page', title: 'Customer CRM', subtitle: 'Profiles & notes', href: '/admin/customers' },
  { id: 'page-support', type: 'page', title: 'Support inbox', subtitle: 'Tickets & SLA', href: '/admin/support' },
  { id: 'page-warranty', type: 'page', title: 'Warranty & recalls', subtitle: 'Claims & certificates', href: '/admin/warranty' },
  { id: 'page-notifications', type: 'page', title: 'Notifications', subtitle: 'Rules & broadcasts', href: '/admin/notifications' },
  { id: 'page-staff', type: 'page', title: 'Team management', subtitle: 'Staff accounts', href: '/admin/staff' },
]

export async function searchAdminWorkspace(query: string, isAdmin: boolean): Promise<AdminSearchResult[]> {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const pageHits = QUICK_PAGES.filter(
    (p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q),
  ).slice(0, 3)

  try {
    const [customers, vehicles, tickets, staff] = await Promise.all([
      listCustomers({ q: query.trim(), size: 5 }).then((r) =>
        r.items.map((c) => ({
          id: c.id,
          type: 'customer' as const,
          title: `${c.firstName} ${c.lastName}`.trim(),
          subtitle: `${c.phone} · ${c.email}`,
          href: `/admin/customers?q=${encodeURIComponent(query.trim())}`,
        })),
      ),
      listAdminVehicles({ page: 1, limit: 8, sort: '-createdAt' }).then((r) =>
        r.items
          .filter((v) =>
            `${v.make} ${v.model} ${v.trim} ${v.vin ?? ''} ${v.stockNumber ?? ''}`.toLowerCase().includes(q),
          )
          .slice(0, 5)
          .map((v) => ({
            id: v.id,
            type: 'vehicle' as const,
            title: `${v.year} ${v.model} ${v.trim}`,
            subtitle: `${v.vin ?? v.stockNumber ?? 'No VIN'} · ${v.branchName}`,
            href: `/admin/inventory?vehicle=${v.id}`,
          })),
      ),
      listSupportTickets({ q: query.trim(), size: 5 }).then((r) =>
        r.items.map((t) => ({
          id: t.id,
          type: 'ticket' as const,
          title: t.subject,
          subtitle: `${t.ticketNumber} · ${t.customerName}`,
          href: `/admin/support?q=${encodeURIComponent(t.ticketNumber)}`,
        })),
      ),
      isAdmin
        ? listStaff().then((rows) =>
            rows
              .filter((s) =>
                `${s.firstName} ${s.lastName} ${s.email} ${s.phone}`.toLowerCase().includes(q),
              )
              .slice(0, 4)
              .map((s) => ({
                id: s.id,
                type: 'staff' as const,
                title: `${s.firstName} ${s.lastName}`.trim(),
                subtitle: `${s.department} · ${s.email}`,
                href: '/admin/staff',
              })),
          )
        : Promise.resolve([]),
    ])

    return [...pageHits, ...customers, ...vehicles, ...tickets, ...staff].slice(0, 12)
  } catch {
    return pageHits
  }
}
