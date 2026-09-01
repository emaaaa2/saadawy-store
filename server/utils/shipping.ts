export const GOVERNORATE_TIERS: Record<string, 1 | 2 | 3> = {
  'Cairo': 1,
  'Giza': 1,
  'Qalyubia': 1,
  'Alexandria': 2,
  'Dakahlia': 2,
  'Sharqia': 2,
  'Monufia': 2,
  'Gharbia': 2,
  'Beheira': 2,
  'Kafr El Sheikh': 2,
  'Damietta': 2,
  'Port Said': 2,
  'Ismailia': 2,
  'Suez': 2,
  'Fayoum': 3,
  'Beni Suef': 3,
  'Minya': 3,
  'Asyut': 3,
  'Sohag': 3,
  'Qena': 3,
  'Luxor': 3,
  'Aswan': 3,
  'Red Sea': 3,
  'New Valley': 3,
  'Matrouh': 3,
  'North Sinai': 3,
  'South Sinai': 3
}

export interface ShippingSettings {
  tier1_fee: number
  tier2_fee: number
  tier3_fee: number
  free_shipping_threshold: number
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  tier1_fee: 50,
  tier2_fee: 70,
  tier3_fee: 100,
  free_shipping_threshold: 500
}

export function calculateShipping(governorate: string, subtotal: number, settings: ShippingSettings): number {
  if (subtotal >= settings.free_shipping_threshold) return 0
  const tier = GOVERNORATE_TIERS[governorate] ?? 3
  const fees = { 1: settings.tier1_fee, 2: settings.tier2_fee, 3: settings.tier3_fee }
  return fees[tier]
}
