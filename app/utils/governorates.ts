export const governorates = [
  { value: 'Cairo', label: 'القاهرة' },
  { value: 'Giza', label: 'الجيزة' },
  { value: 'Qalyubia', label: 'القليوبية' },
  { value: 'Alexandria', label: 'الإسكندرية' },
  { value: 'Dakahlia', label: 'الدقهلية' },
  { value: 'Sharqia', label: 'الشرقية' },
  { value: 'Monufia', label: 'المنوفية' },
  { value: 'Gharbia', label: 'الغربية' },
  { value: 'Beheira', label: 'البحيرة' },
  { value: 'Kafr El Sheikh', label: 'كفر الشيخ' },
  { value: 'Damietta', label: 'دمياط' },
  { value: 'Port Said', label: 'بورسعيد' },
  { value: 'Ismailia', label: 'الإسماعيلية' },
  { value: 'Suez', label: 'السويس' },
  { value: 'Fayoum', label: 'الفيوم' },
  { value: 'Beni Suef', label: 'بني سويف' },
  { value: 'Minya', label: 'المنيا' },
  { value: 'Asyut', label: 'أسيوط' },
  { value: 'Sohag', label: 'سوهاج' },
  { value: 'Qena', label: 'قنا' },
  { value: 'Luxor', label: 'الأقصر' },
  { value: 'Aswan', label: 'أسوان' },
  { value: 'Red Sea', label: 'البحر الأحمر' },
  { value: 'New Valley', label: 'الوادي الجديد' },
  { value: 'Matrouh', label: 'مطروح' },
  { value: 'North Sinai', label: 'شمال سيناء' },
  { value: 'South Sinai', label: 'جنوب سيناء' },
]

const TIER_FEES = { 1: 50, 2: 70, 3: 100 }

const GOVERNORATE_TIERS = {
  Cairo: 1, Giza: 1, Qalyubia: 1,
  Alexandria: 2, Dakahlia: 2, Sharqia: 2, Monufia: 2, Gharbia: 2, Beheira: 2,
  'Kafr El Sheikh': 2, Damietta: 2, 'Port Said': 2, Ismailia: 2, Suez: 2,
  Fayoum: 3, 'Beni Suef': 3, Minya: 3, Asyut: 3, Sohag: 3, Qena: 3, Luxor: 3,
  Aswan: 3, 'Red Sea': 3, 'New Valley': 3, Matrouh: 3, 'North Sinai': 3, 'South Sinai': 3,
}

export const FREE_SHIPPING_THRESHOLD = 500

export function estimateShipping(governorate, subtotal) {
  if (!governorate) return null
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  const tier = GOVERNORATE_TIERS[governorate] ?? 3
  return TIER_FEES[tier]
}
