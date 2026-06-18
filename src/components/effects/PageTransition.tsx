import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerScrollProps {
  title: React.ReactNode
  children: React.ReactNode
}

/** Scroll section without 3D transforms (avoids scroll jank) */
export function ContainerScroll({ title, children }: ContainerScrollProps) {
  return (
    <div className="relative py-12 md:py-20">
      <div className="mb-8 md:mb-10 text-center animate-fade-in">{title}</div>
      <div
        className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border shadow-lg animate-fade-in-delay-1"
      >
        {children}
      </div>
    </div>
  )
}

export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="animate-fade-in">{children}</div>
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn('animate-fade-in', className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

export function StaggerChildren({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

/** Kept for compatibility — plain div wrapper */
export const staggerItem = {}
