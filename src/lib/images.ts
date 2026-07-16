/** Fallback vehicle photos when the API image is missing or broken. */

export const CAR_IMAGE_POOL: string[] = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzGVzVg_2I0uBcIXbPHfbrnu_zMcCmkJBp0n8OB3al2w&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3emKlXRIgpEufUk4Mt9uoIn-qnywLE6xud6L5BFZb5Q&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNdhZDZdxnUn6HXoZNjid90Vf0i959TY9iYL4sBQkr7A&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjglcsy8b8ReSpFb_8qnNMzi1LLF2k-HBZyvDSOqxCEg&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKa-7w7jNoL-irPZQZFGZTVc34wuM6gZbd2bZua3j0ag&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlzgyVHZ99X4Egasb6Y2avWJEXlNSC0cacJr2I5hDdgA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnEnmNXW4WoQUoWXiL_Q5mXC4dPDD5bZUUUg6_PKC5hw&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG0AYvNme00ghOXHfbsMTxPzAAd9q9di5mGvlMF-PW6Q&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiDJVGABoKldXIwzw6pjDaxT9uO2xCUBOpbSA2GQAVRw&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX-_FmsHoM1uJFtS11VcoLfNgnce9Z1Eo5UeYB--VGzA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSgSiOHiqQRkKXB8DCeDMsiBpXa7hsF_WL7paRQJzB8g&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxH4Zbw3B1UWEkzNW4DOmUyQJgYBDVkynhPVdOnQ4W6w&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2GJvZkQnIzSXu771TMJT2HpqPs9S2LkCZoP7KoLuxzQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNc7FkvwpE_ZXf9Q5KTxosBtJWtJ8LeXaX7GK92jkYMA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2u008SQNPT9Ux1JktTFYEOpQNC5LyaosPSXrp-65oSw&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkAgif1oNjvYUqUaEn18DxsZXrqGCGeR2Y4dEqkmFmfg&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR2h18adya8hReoah7JMw89tr_fKOevUGbu39yQbJQ_w&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlzKG5-Im30q3n9bBTYPR5mRdxFfr3oRg4tikHFWNsNg&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAF5B83wGoemPvh9d0JrV8rSPAokm-0pkkU-uHHcwprQ&s=10',
]

export const vehicleImageSets: Record<string, string[]> = {
  corolla: CAR_IMAGE_POOL,
  camry: CAR_IMAGE_POOL,
  rav4: CAR_IMAGE_POOL,
  highlander: CAR_IMAGE_POOL,
  hilux: CAR_IMAGE_POOL,
  landcruiser: CAR_IMAGE_POOL,
  prius: CAR_IMAGE_POOL,
  yaris: CAR_IMAGE_POOL,
  sienna: CAR_IMAGE_POOL,
  fortuner: CAR_IMAGE_POOL,
}

export const PLACEHOLDER_VEHICLE = '/images/vehicle-placeholder.svg'

/** Login sidebar hero — Toyota Supra poster. */
export const AUTH_HERO_IMAGE =
  'https://i.pinimg.com/736x/b1/c0/33/b1c033b35ba1c7ddec045d9df1dd4135.jpg'

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
    highlander: 'highlander',
    prius: 'prius',
    yaris: 'yaris',
    sienna: 'sienna',
    fortuner: 'fortuner',
  }
  const resolved = map[key] || Object.keys(vehicleImageSets).find((k) => key.includes(k)) || 'corolla'
  const pool = vehicleImageSets[resolved] ?? CAR_IMAGE_POOL
  const offset = Array.from(modelKey).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % pool.length
  return [pool[offset], pool[(offset + 1) % pool.length]]
}
