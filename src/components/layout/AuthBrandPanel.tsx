import { SafeImage } from '@/components/ui/safe-image'
import { BrandMark } from '@/components/branding/BrandMark'
import { AUTH_HERO_IMAGE } from '@/lib/images'

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden lg:flex flex-1 flex-col overflow-hidden bg-[#3d0a12]">
      <SafeImage
        src={AUTH_HERO_IMAGE}
        alt="Toyota Supra"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0508]/90 via-[#3d0a12]/20 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c8102e] via-[#ffcf0f] to-[#c8102e]" />

      <div className="relative z-10 mt-auto p-10 xl:p-12">
        
        <h2 className="mt-5 font-display text-3xl xl:text-4xl font-bold leading-tight text-white">
          Admin operations portal
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/70 leading-relaxed">
          Manage inventory, leads, service, warranty, and customer operations from one connected dashboard.
        </p>
      </div>
    </aside>
  )
}
