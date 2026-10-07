// `label` is English, `labelAr` Arabic; show the right one with useLang().subcategoryLabel().
export const categorySubcategories: Record<string, { value: string; label: string; labelAr: string }[]> = {
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
