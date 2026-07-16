import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { BrandMark } from '@/components/branding/BrandMark'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-background">
      <div className="flex flex-col flex-1 lg:w-[min(52%,640px)] lg:shrink-0 lg:border-r border-border/60">
        <header className="flex items-center justify-between px-5 sm:px-8 py-4">
          <Link to="/login" className="flex items-center hover:opacity-90 transition-opacity">
            <BrandMark size="xl" className="h-36 sm:h-40" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-12">
          <div className="w-full max-w-[400px] animate-fade-in">
            <div className="mb-7">
              <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{subtitle}</p>
            </div>

            {children}
          </div>
        </main>

        <footer className="px-5 sm:px-8 py-5 text-center sm:text-left text-xs text-muted-foreground border-t border-border/50">
          © {new Date().getFullYear()} · Staff portal
        </footer>
      </div>

      <AuthBrandPanel />
    </div>
  )
}
