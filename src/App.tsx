import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PublicOnlyRoute, AdminRoute, AdminOnlyRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/AuthPages'

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
  import('@/pages/admin/AdminLeadsPage').then((m) => ({ default: m.AdminLeadsPage })),
)
const AdminPipelineBreakdownPage = lazy(() =>
  import('@/pages/admin/AdminPipelineBreakdownPage').then((m) => ({ default: m.AdminPipelineBreakdownPage })),
)
const AdminServiceOpsPage = lazy(() =>
  import('@/pages/admin/AdminServiceOpsPage').then((m) => ({ default: m.AdminServiceOpsPage })),
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
const AdminBranchesPage = lazy(() =>
  import('@/pages/admin/AdminBranchesPage').then((m) => ({ default: m.AdminBranchesPage })),
)

function PageLoader() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
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
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

            <Route path="/admin/dashboard" element={<AdminShell><AdminDashboardPage /></AdminShell>} />
            <Route path="/admin/inventory" element={<AdminShell><AdminInventoryPage /></AdminShell>} />
            <Route path="/admin/customers" element={<AdminShell><AdminCustomersPage /></AdminShell>} />
            <Route path="/admin/leads" element={<AdminShell><AdminLeadsPage /></AdminShell>} />
            <Route path="/admin/leads/breakdown" element={<AdminShell><AdminPipelineBreakdownPage /></AdminShell>} />
            <Route path="/admin/service" element={<AdminShell><AdminServiceOpsPage /></AdminShell>} />
            <Route path="/admin/warranty" element={<AdminShell><AdminWarrantyPage /></AdminShell>} />
            <Route path="/admin/support" element={<AdminShell><AdminSupportPage /></AdminShell>} />
            <Route path="/admin/notifications" element={<AdminShell><AdminNotificationsPage /></AdminShell>} />
            <Route path="/admin/analytics" element={<AdminShell><AdminAnalyticsPage /></AdminShell>} />
            <Route path="/admin/staff" element={<AdminStaffShell><AdminStaffPage /></AdminStaffShell>} />
            <Route path="/admin/branches" element={<AdminStaffShell><AdminBranchesPage /></AdminStaffShell>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  )
}
