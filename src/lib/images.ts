/** Reliable image URLs — picsum seeds + ui-avatars (no Unsplash hotlink issues) */

export const vehicleImageSets: Record<string, string[]> = {
  corolla: [
    'https://picsum.photos/seed/toyota-corolla-1/1200/800',
    'https://picsum.photos/seed/toyota-corolla-2/1200/800',
    'https://picsum.photos/seed/toyota-corolla-3/1200/800',
  ],
  camry: [
    'https://picsum.photos/seed/toyota-camry-1/1200/800',
    'https://picsum.photos/seed/toyota-camry-2/1200/800',
  ],
  rav4: [
    'https://picsum.photos/seed/toyota-rav4-1/1200/800',
    'https://picsum.photos/seed/toyota-rav4-2/1200/800',
  ],
  hilux: [
    'https://picsum.photos/seed/toyota-hilux-1/1200/800',
    'https://picsum.photos/seed/toyota-hilux-2/1200/800',
  ],
  landcruiser: [
    'https://picsum.photos/seed/toyota-landcruiser-1/1200/800',
    'https://picsum.photos/seed/toyota-landcruiser-2/1200/800',
  ],
}

export const PLACEHOLDER_VEHICLE = '/images/vehicle-placeholder.svg'

export function avatarUrl(name: string, bg = 'EB0A1E'): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=256&bold=true&format=svg`
}

export function getVehicleImages(modelKey: string): string[] {
  const key = modelKey.toLowerCase().replace(/\s+/g, '')
  const map: Record<string, string> = {
    corolla: 'corolla',
    camry: 'camry',
    rav4: 'rav4',
    hilux: 'hilux',
    landcruiser: 'landcruiser',
    'land cruiser': 'landcruiser',
  }
  const resolved = map[key] || Object.keys(vehicleImageSets).find((k) => key.includes(k)) || 'corolla'
  return vehicleImageSets[resolved] ?? vehicleImageSets.corolla
}
