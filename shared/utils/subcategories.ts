// The types inside each category (e.g. Makeup → Lips). `value` is what products store and what the
// store's links use; `label` is English, `labelAr` Arabic (useLang().subcategoryLabel()).
// These are the defaults: Dashboard → Categories can add, rename and remove them (store settings).
export interface Subcategory { value: string; label: string; labelAr: string }

export const DEFAULT_SUBCATEGORIES: Record<string, Subcategory[]> = {
  skincare: [
    { value: 'cleansers', label: 'Cleansers', labelAr: 'غسول ومنظفات' },
    { value: 'serums', label: 'Serums', labelAr: 'سيرم' },
    { value: 'moisturizers', label: 'Moisturizers', labelAr: 'مرطبات' },
    { value: 'sunscreen', label: 'Sunscreen', labelAr: 'واقي شمس' },
    { value: 'body-care', label: 'Body Care', labelAr: 'العناية بالجسم' },
    { value: 'masks-and-scrubs', label: 'Masks & Scrubs', labelAr: 'ماسكات وسكراب' },
  ],
  perfume: [
    { value: 'perfume-sets', label: 'Perfume Sets', labelAr: 'أطقم عطور' },
    { value: 'other', label: 'Singles', labelAr: 'عطور فردية' },
  ],
  makeup: [
    { value: 'face', label: 'Face', labelAr: 'الوجه' },
    { value: 'eyes', label: 'Eyes', labelAr: 'العيون' },
    { value: 'lips', label: 'Lips', labelAr: 'الشفايف' },
    { value: 'brushes-and-tools', label: 'Brushes & Tools', labelAr: 'فرش وأدوات' },
  ],
  haircare: [
    { value: 'shampoo', label: 'Shampoo', labelAr: 'شامبو' },
    { value: 'conditioner-and-treatments', label: 'Conditioner & Treatments', labelAr: 'بلسم وعلاجات' },
    { value: 'hair-oils', label: 'Hair Oils', labelAr: 'زيوت الشعر' },
    { value: 'styling', label: 'Styling', labelAr: 'تصفيف' },
  ],
  bags: [
    { value: 'makeup-bags', label: 'Makeup Bags', labelAr: 'شنط مكياج' },
    { value: 'fashion-bags', label: 'Fashion Bags', labelAr: 'شنط موضة' },
    { value: 'kids-bags', label: 'Kids Bags', labelAr: 'شنط أطفال' },
    { value: 'other', label: 'Other', labelAr: 'أخرى' },
  ],
  kitchen: [
    { value: 'mugs-and-cups', label: 'Mugs & Cups', labelAr: 'مجات وأكواب' },
    { value: 'cookware', label: 'Cookware', labelAr: 'أدوات الطبخ' },
    { value: 'prep-tools', label: 'Prep Tools', labelAr: 'أدوات التحضير' },
    { value: 'storage', label: 'Storage', labelAr: 'التخزين' },
    { value: 'home-and-bins', label: 'Home & Bins', labelAr: 'البيت والسلال' },
  ],
  hijab: [
    { value: 'scarves', label: 'Scarves', labelAr: 'طرح وإيشاربات' },
    { value: 'bonnets', label: 'Bonnets', labelAr: 'بونيهات' },
    { value: 'pins-and-accessories', label: 'Pins & Accessories', labelAr: 'دبابيس وإكسسوارات' },
    { value: 'other', label: 'Other', labelAr: 'أخرى' },
  ],
  accessories: [
    { value: 'jewelry', label: 'Jewelry', labelAr: 'مجوهرات' },
    { value: 'hair-accessories', label: 'Hair Accessories', labelAr: 'إكسسوارات الشعر' },
    { value: 'nail-care', label: 'Nail Care', labelAr: 'العناية بالأظافر' },
    { value: 'lashes-and-tools', label: 'Lashes & Tools', labelAr: 'رموش وأدوات' },
    { value: 'toys', label: 'Toys', labelAr: 'ألعاب' },
    { value: 'other', label: 'Other', labelAr: 'أخرى' },
  ],
}

export const SUBCATEGORY_NAME_LIMIT = 40
export const MAX_SUBCATEGORIES = 40

/** A category's types: the dashboard's list if it has been saved, else the defaults above. */
export function subcategoriesFor(settings: { subcategories?: Record<string, Subcategory[] | undefined> } | null | undefined, category: string | null | undefined): Subcategory[] {
  if (!category) return []
  return settings?.subcategories?.[category] ?? DEFAULT_SUBCATEGORIES[category] ?? []
}

/** Lower-case letters, digits and dashes, from an English name ("Lip Oils & Balms" → "lip-oils-balms"). */
export function subcategorySlug(text: string) {
  return text.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}
