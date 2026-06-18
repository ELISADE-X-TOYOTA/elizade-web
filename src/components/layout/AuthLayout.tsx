import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { BrandMark } from '@/components/branding/BrandMark'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  mode?: 'login' | 'register'
}

export function AuthLayout({ children, title, subtitle, mode = 'login' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-background">
      {/* Form column — easemize / split-login inspired */}
      <div className="flex flex-col flex-1 lg:w-[min(52%,640px)] lg:shrink-0 lg:border-r border-border/60">
        <header className="flex items-center justify-between px-5 sm:px-8 py-4">
          <Link to="/vehicles" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <BrandMark size="md" />
            <span className="font-semibold text-sm sm:text-base hidden sm:block">Elizade Connect</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/vehicles">
              <Button variant="ghost" size="sm" className="text-muted-foreground hidden sm:inline-flex">
                Vehicles
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-12">
          <div className="w-full max-w-[400px] animate-fade-in">
            <div className="mb-7">
              <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{subtitle}</p>
            </div>

            {children}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                OTP-secured
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                No password needed
              </span>
            </div>
          </div>
        </main>

        <footer className="px-5 sm:px-8 py-5 text-center sm:text-left text-xs text-muted-foreground border-t border-border/50">
          © {new Date().getFullYear()} Elizade Nigeria Limited
        </footer>
      </div>

      {/* Hero + testimonials — easemize sign-in pattern */}
      <AuthBrandPanel mode={mode} />
    </div>
  )
}
