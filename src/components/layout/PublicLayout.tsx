import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BrandMark } from '@/components/branding/BrandMark'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navLinks = [{ to: '/vehicles', label: 'New vehicles' }]

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/vehicles" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <BrandMark size="sm" />
              <div className="hidden sm:block leading-tight">
                <span className="block text-sm font-semibold tracking-tight">Elizade Connect</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Toyota Nigeria
                </span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const active = location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'text-foreground bg-secondary/80'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="h-9 px-4">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" state={{ from: location }}>
                  <Button variant="ghost" size="sm" className="h-9 px-4 text-muted-foreground">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="h-9 px-4 bg-foreground text-background hover:bg-foreground/90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">{children}</div>
      </main>

      <footer className="border-t border-border/80 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-medium text-foreground">Elizade Nigeria Limited</p>
            <p className="mt-1 text-xs">Authorised Toyota distributor · Sales &amp; after-sales nationwide</p>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} Elizade Nigeria Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
