import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PLACEHOLDER_VEHICLE } from '@/lib/images'
import { Car } from 'lucide-react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
}

export function SafeImage({ src, alt = '', className, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  const imgSrc = error || !src ? PLACEHOLDER_VEHICLE : src

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

export function AvatarImage({
  src,
  name,
  className,
}: {
  src?: string
  name: string
  className?: string
}) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0',
          className,
        )}
      >
        {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover shrink-0', className)}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

export function VehicleThumb({
  src,
  alt,
  className,
  fit = 'cover',
}: {
  src: string
  alt: string
  className?: string
  fit?: 'cover' | 'contain'
}) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-muted', className)}>
        <Car className="h-8 w-8 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'block h-full w-full',
        fit === 'cover' ? 'object-cover object-center' : 'object-contain object-center',
        className,
      )}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
