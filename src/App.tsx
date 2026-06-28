import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute, PublicOnlyRoute, AdminRoute, AdminOnlyRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage, RegisterPage } from '@/pages/AuthPages'
import { DashboardPage } from '@/pages/DashboardPage'
import { VehiclesPage } from '@/pages/VehiclesPage'
import { VehicleDetailPage } from '@/pages/VehicleDetailPage'
import { ComparePage } from '@/pages/ComparePage'
import {
  SalesHubPage,
  TestDrivePage,
  QuotePage,
  ReservePage,
  TradeInPage,
  FinancingPage,
} from '@/pages/SalesPages'
import {
  ServicePage,
  ServiceBookPage,
  ServiceTrackPage,
  ServiceHistoryPage,
} from '@/pages/ServicePages'
import { WarrantyPage, WarrantyClaimPage } from '@/pages/WarrantyPages'
import { SupportPage, SupportTicketPage, NewTicketPage } from '@/pages/SupportPages'
import { ProfilePage, MyVehiclesPage } from '@/pages/ProfilePages'
import { NotificationsPage } from '@/pages/NotificationsPage'

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminInventoryPage = lazy(() =>
  import('@/pages/admin/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })),
)
const AdminCustomersPage = lazy(() =>
  import('@/pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })),
)
const AdminLeadsPage = lazy(() =>
  import('@/pages/admin/AdminPages').then((m) => ({ default: m.AdminLeadsPage })),
)
const AdminServiceOpsPage = lazy(() =>
  import('@/pages/admin/AdminPages').then((m) => ({ default: m.AdminServiceOpsPage })),
)
const AdminWarrantyPage = lazy(() =>
  import('@/pages/admin/AdminWarrantyPage').then((m) => ({ default: m.AdminWarrantyPage })),
)
const AdminSupportPage = lazy(() =>
  import('@/pages/admin/AdminSupportPage').then((m) => ({ default: m.AdminSupportPage })),
)
const AdminNotificationsPage = lazy(() =>
  import('@/pages/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage })),
)
const AdminAnalyticsPage = lazy(() =>
  import('@/pages/admin/AdminPages').then((m) => ({ default: m.AdminAnalyticsPage })),
)
const AdminStaffPage = lazy(() =>
  import('@/pages/admin/AdminStaffPage').then((m) => ({ default: m.AdminStaffPage })),
)

function PageLoader() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  )
}

function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </AdminLayout>
    </AdminRoute>
  )
}

function AdminStaffShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminOnlyRoute>
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </AdminLayout>
    </AdminOnlyRoute>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

            <Route path="/vehicles" element={<PublicLayout><VehiclesPage /></PublicLayout>} />
            <Route path="/vehicles/compare" element={<PublicLayout><ComparePage /></PublicLayout>} />
            <Route path="/vehicles/:id" element={<PublicLayout><VehicleDetailPage /></PublicLayout>} />

            <Route path="/dashboard" element={<CustomerShell><DashboardPage /></CustomerShell>} />
            <Route path="/sales" element={<CustomerShell><SalesHubPage /></CustomerShell>} />
            <Route path="/sales/test-drive" element={<CustomerShell><TestDrivePage /></CustomerShell>} />
            <Route path="/sales/quote" element={<CustomerShell><QuotePage /></CustomerShell>} />
            <Route path="/sales/reserve" element={<CustomerShell><ReservePage /></CustomerShell>} />
            <Route path="/sales/trade-in" element={<CustomerShell><TradeInPage /></CustomerShell>} />
            <Route path="/sales/financing" element={<CustomerShell><FinancingPage /></CustomerShell>} />
            <Route path="/service" element={<CustomerShell><ServicePage /></CustomerShell>} />
            <Route path="/service/book" element={<CustomerShell><ServiceBookPage /></CustomerShell>} />
            <Route path="/service/track/:id" element={<CustomerShell><ServiceTrackPage /></CustomerShell>} />
            <Route path="/service/history" element={<CustomerShell><ServiceHistoryPage /></CustomerShell>} />
            <Route path="/warranty" element={<CustomerShell><WarrantyPage /></CustomerShell>} />
            <Route path="/warranty/claim" element={<CustomerShell><WarrantyClaimPage /></CustomerShell>} />
            <Route path="/support" element={<CustomerShell><SupportPage /></CustomerShell>} />
            <Route path="/support/new" element={<CustomerShell><NewTicketPage /></CustomerShell>} />
            <Route path="/support/:id" element={<CustomerShell><SupportTicketPage /></CustomerShell>} />
            <Route path="/profile" element={<CustomerShell><ProfilePage /></CustomerShell>} />
            <Route path="/my-vehicles" element={<CustomerShell><MyVehiclesPage /></CustomerShell>} />
            <Route path="/notifications" element={<CustomerShell><NotificationsPage /></CustomerShell>} />

            <Route path="/admin/dashboard" element={<AdminShell><AdminDashboardPage /></AdminShell>} />
            <Route path="/admin/inventory" element={<AdminShell><AdminInventoryPage /></AdminShell>} />
            <Route path="/admin/customers" element={<AdminShell><AdminCustomersPage /></AdminShell>} />
            <Route path="/admin/leads" element={<AdminShell><AdminLeadsPage /></AdminShell>} />
            <Route path="/admin/service" element={<AdminShell><AdminServiceOpsPage /></AdminShell>} />
            <Route path="/admin/warranty" element={<AdminShell><AdminWarrantyPage /></AdminShell>} />
            <Route path="/admin/support" element={<AdminShell><AdminSupportPage /></AdminShell>} />
            <Route path="/admin/notifications" element={<AdminShell><AdminNotificationsPage /></AdminShell>} />
            <Route path="/admin/analytics" element={<AdminShell><AdminAnalyticsPage /></AdminShell>} />
            <Route path="/admin/staff" element={<AdminStaffShell><AdminStaffPage /></AdminStaffShell>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  )
}
