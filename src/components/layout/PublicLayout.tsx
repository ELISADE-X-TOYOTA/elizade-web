import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BrandMark } from '@/components/branding/BrandMark'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <div className="h-0.5 bg-gradient-to-r from-[#c8102e] via-[#ffcf0f] to-[#c8102e]" />
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 lg:px-8">
          <Link to="/vehicles" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrandMark size="sm" />
            <span className="font-semibold text-sm">Elizade Connect</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" state={{ from: location }}>
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {children}
      </main>
    </div>
  )
}
