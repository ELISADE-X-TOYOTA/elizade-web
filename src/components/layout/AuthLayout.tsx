import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
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
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                {mode === 'register' ? 'Get started' : 'Secure sign-in'}
              </span>
              <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold tracking-tight mt-3">{title}</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{subtitle}</p>
            </div>

            {children}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {['OTP-secured', 'No password', 'Bank-grade encryption'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {label}
                </span>
              ))}
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
