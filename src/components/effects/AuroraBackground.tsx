/** Static gradients — no continuous Framer Motion (GPU friendly) */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/15 blur-3xl opacity-60" />
      <div className="absolute -right-1/4 top-1/4 h-[320px] w-[320px] rounded-full bg-accent/10 blur-3xl opacity-50" />
    </div>
  )
}
