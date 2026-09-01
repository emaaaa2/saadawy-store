export const FREE_SHIPPING_THRESHOLD = 500

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

const TIER_FEES: Record<1 | 2 | 3, number> = {
  1: 50,
  2: 70,
  3: 100
}

export function calculateShipping(governorate: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  const tier = GOVERNORATE_TIERS[governorate] ?? 3
  return TIER_FEES[tier]
}
