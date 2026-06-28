/** Verified Toyota catalogue photos — matched to backend seed (Wikimedia Commons). */

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb'

export const vehicleImageSets: Record<string, string[]> = {
  corolla: [
    `${W}/9/9f/2018_Toyota_Corolla_%28E210%29_Ascent_sedan_%282018-08-27%29_01.jpg/1280px-2018_Toyota_Corolla_%28E210%29_Ascent_sedan_%282018-08-27%29_01.jpg`,
    `${W}/4/4f/2020_Toyota_Corolla_Hybrid_%28ZE141R%29_Ascent_sport_hatchback_%282020-07-17%29.jpg/1280px-2020_Toyota_Corolla_Hybrid_%28ZE141R%29_Ascent_sport_hatchback_%282020-07-17%29.jpg`,
  ],
  camry: [
    `${W}/6/68/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/1280px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg`,
    `${W}/7/7e/2021_Toyota_Camry_%28ASV70R%29_Ascent_Hybrid_sedan_%282021-03-22%29.jpg/1280px-2021_Toyota_Camry_%28ASV70R%29_Ascent_Hybrid_sedan_%282021-03-22%29.jpg`,
  ],
  rav4: [
    `${W}/5/5f/2019_Toyota_RAV4_%28AXAH52R%29_GX_%28hybrid%29_wagon_%2818-03-2019%29.jpg/1280px-2019_Toyota_RAV4_%28AXAH52R%29_GX_%28hybrid%29_wagon_%2818-03-2019%29.jpg`,
    `${W}/8/8d/2020_Toyota_RAV4_%28AXAH54R%29_Cruiser_%28hybrid%29_wagon_%282020-07-06%29.jpg/1280px-2020_Toyota_RAV4_%28AXAH54R%29_Cruiser_%28hybrid%29_wagon_%282020-07-06%29.jpg`,
  ],
  highlander: [
    `${W}/8/82/2020_Toyota_Highlander_%28MXU80R%29_GXL_wagon_%282020-08-31%29.jpg/1280px-2020_Toyota_Highlander_%28MXU80R%29_GXL_wagon_%282020-08-31%29.jpg`,
    `${W}/0/0a/2021_Toyota_Kluger_%28AXUH78R%29_GXL_%28hybrid%29_wagon_%282021-08-18%29.jpg/1280px-2021_Toyota_Kluger_%28AXUH78R%29_GXL_%28hybrid%29_wagon_%282021-08-18%29.jpg`,
  ],
  hilux: [
    `${W}/1/16/2016_Toyota_Hilux_%28GN126R%29_SR5_4-door_utility_%282016-01-06%29.jpg/1280px-2016_Toyota_Hilux_%28GN126R%29_SR5_4-door_utility_%282016-01-06%29.jpg`,
    `${W}/4/4a/2019_Toyota_Hilux_%28GUN126R%29_SR5_4-door_utility_%282019-08-08%29.jpg/1280px-2019_Toyota_Hilux_%28GUN126R%29_SR5_4-door_utility_%282019-08-08%29.jpg`,
  ],
  landcruiser: [
    `${W}/9/9c/2022_Toyota_Land_Cruiser_%28J300%29_ZX_%28cropped%29.jpg/1280px-2022_Toyota_Land_Cruiser_%28J300%29_ZX_%28cropped%29.jpg`,
    `${W}/6/6a/2016_Toyota_Land_Cruiser_%28VDJ200R%29_VX_wagon_%282016-01-06%29.jpg/1280px-2016_Toyota_Land_Cruiser_%28VDJ200R%29_VX_wagon_%282016-01-06%29.jpg`,
  ],
  prius: [
    `${W}/3/3e/2016_Toyota_Prius_%28ZVW60R%29_i-Tech_liftback_%282016-10-12%29_01.jpg/1280px-2016_Toyota_Prius_%28ZVW60R%29_i-Tech_liftback_%282016-10-12%29_01.jpg`,
    `${W}/f/f2/2017_Toyota_Prius_%28ZVW60R%29_i-Tech_liftback_%282017-11-16%29.jpg/1280px-2017_Toyota_Prius_%28ZVW60R%29_i-Tech_liftback_%282017-11-16%29.jpg`,
  ],
  yaris: [
    `${W}/b/b3/2020_Toyota_Yaris_%28MXPH10R%29_ZR_hatchback_%282020-12-19%29.jpg/1280px-2020_Toyota_Yaris_%28MXPH10R%29_ZR_hatchback_%282020-12-19%29.jpg`,
    `${W}/8/8e/2017_Toyota_Yaris_%28XP130%29_Ascent_hatchback_%282017-11-16%29.jpg/1280px-2017_Toyota_Yaris_%28XP130%29_Ascent_hatchback_%282017-11-16%29.jpg`,
  ],
  sienna: [
    `${W}/5/5a/2021_Toyota_Sienna_%28XL40%29_XLE_%28cropped%29.jpg/1280px-2021_Toyota_Sienna_%28XL40%29_XLE_%28cropped%29.jpg`,
    `${W}/4/4d/2015_Toyota_Sienna_%28US%29.jpg/1280px-2015_Toyota_Sienna_%28US%29.jpg`,
  ],
  fortuner: [
    `${W}/6/6e/2016_Toyota_Fortuner_%28New_Zealand%29.jpg/1280px-2016_Toyota_Fortuner_%28New_Zealand%29.jpg`,
    `${W}/8/8b/2018_Toyota_Fortuner_%28AN160%29_VXR_wagon_%282018-08-31%29.jpg/1280px-2018_Toyota_Fortuner_%28AN160%29_VXR_wagon_%282018-08-31%29.jpg`,
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
    highlander: 'highlander',
    prius: 'prius',
    yaris: 'yaris',
    sienna: 'sienna',
    fortuner: 'fortuner',
  }
  const resolved = map[key] || Object.keys(vehicleImageSets).find((k) => key.includes(k)) || 'corolla'
  return vehicleImageSets[resolved] ?? vehicleImageSets.corolla
}
