import { Star } from 'lucide-react'
import { SafeImage, AvatarImage } from '@/components/ui/safe-image'
import { AUTH_HERO_IMAGE } from '@/lib/images'
import { cn } from '@/lib/utils'

export interface AuthTestimonial {
  name: string
  role: string
  quote: string
  avatar?: string
}

const defaultTestimonials: AuthTestimonial[] = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Corolla owner · Lagos',
    quote: 'Booking service and approving work in the app saved me three trips to the showroom.',
    avatar: 'https://i.pravatar.cc/150?u=adaeze',
  },
  {
    name: 'Chinedu Okoro',
    role: 'Camry owner · Abuja',
    quote: 'Got my quotation and financing estimate in minutes. Transparent and professional.',
    avatar: 'https://i.pravatar.cc/150?u=chinedu',
  },
  {
    name: 'Ngozi Eze',
    role: 'Land Cruiser owner',
    quote: 'The recall alert came through immediately. Elizade Connect feels like a true companion.',
    avatar: 'https://i.pravatar.cc/150?u=ngozi',
  },
]

function TestimonialGlass({
  testimonial,
  className,
  delayClass,
}: {
  testimonial: AuthTestimonial
  className?: string
  delayClass?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-[#0a1628]/80 p-5 shadow-2xl animate-fade-in',
        delayClass,
        className,
      )}
    >
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#ffcf0f] text-[#ffcf0f]" />
        ))}
      </div>
      <p className="text-sm text-white/85 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        <AvatarImage src={testimonial.avatar} name={testimonial.name} className="h-9 w-9 ring-2 ring-white/10" />
        <div>
          <p className="text-sm font-medium text-white">{testimonial.name}</p>
          <p className="text-xs text-white/50">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}

export function AuthBrandPanel({
  mode = 'login',
  testimonials = defaultTestimonials,
}: {
  mode?: 'login' | 'register'
  testimonials?: AuthTestimonial[]
}) {
  const heroImage = AUTH_HERO_IMAGE
  const [primary, secondary] = testimonials

  return (
    <aside className="relative hidden lg:flex flex-1 flex-col overflow-hidden bg-[#0a1628]">
      <SafeImage
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/95 via-[#121a2a]/75 to-[#8b0a1a]/55" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c8102e] via-[#ffcf0f] to-[#c8102e]" />

      <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffcf0f]/90">
            Elizade Nigeria
          </p>
          <h2 className="mt-4 font-display text-3xl xl:text-4xl font-bold leading-tight text-white">
            {mode === 'register'
              ? 'Drive smarter with Elizade Connect'
              : 'Welcome back to connected ownership'}
          </h2>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Sales, service, warranty, and support — unified for Toyota customers across Nigeria.
          </p>
        </div>

        <div className="flex-1 flex items-end pb-4">
          <div className="relative w-full max-w-md">
            {secondary && (
              <TestimonialGlass
                testimonial={secondary}
                className="absolute -top-6 right-0 w-[88%] scale-[0.92] opacity-60 pointer-events-none"
                delayClass="animate-fade-in-delay-1"
              />
            )}
            {primary && (
              <TestimonialGlass testimonial={primary} className="relative z-10 w-full" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-white/10 text-xs text-white/45">
          <div>
            <p className="font-display text-lg font-bold text-white">50+</p>
            <p>Years legacy</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="font-display text-lg font-bold text-white">6</p>
            <p>Showrooms</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="font-display text-lg font-bold text-white">24/7</p>
            <p>Digital access</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
