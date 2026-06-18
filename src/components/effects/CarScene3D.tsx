/** Lightweight CSS hero — replaces heavy Three.js canvas */
export function CarScene3D({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl bg-crimson-gradient">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-[#ffcf0f]/25 blur-2xl" />
          <div className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full bg-[#c8102e]/35 blur-2xl" />
        </div>
        <svg
          viewBox="0 0 400 200"
          className="w-[85%] max-w-md animate-[float_6s_ease-in-out_infinite]"
          fill="none"
        >
          <rect x="60" y="100" width="280" height="50" rx="12" fill="#c8102e" />
          <path d="M120 100 L160 55 L300 55 L340 100 Z" fill="#0a1628" />
          <circle cx="120" cy="155" r="28" fill="#111" stroke="#333" strokeWidth="4" />
          <circle cx="280" cy="155" r="28" fill="#111" stroke="#333" strokeWidth="4" />
          <circle cx="120" cy="155" r="10" fill="#555" />
          <circle cx="280" cy="155" r="10" fill="#555" />
          <rect x="170" y="62" width="80" height="35" rx="4" fill="#ffcf0f" opacity="0.35" />
        </svg>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
