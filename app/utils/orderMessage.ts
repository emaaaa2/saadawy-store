type Translate = (key: string, params?: Record<string, unknown>) => string
interface CartLine { sku?: string | null; quantity: number; variant_id?: string | null; chosen_image?: string | null; image?: string | null }

/**
 * One cart line in the WhatsApp order message: name (with its colour) × quantity and the product
 * code, plus a link to the chosen colour's photo so the shop sees exactly which one was picked.
 */
export function orderItemLines<T extends CartLine>(item: T, t: Translate, itemName: (item: T) => string) {
  const code = item.sku ? ` (${t('checkout.whatsapp.code', { value: item.sku })})` : ''
  const lines = [`- ${itemName(item)} x${item.quantity}${code}`]
  const photo = item.chosen_image || (item.variant_id && item.image)
  if (photo) lines.push(`  ${t('checkout.whatsapp.photo', { value: photo })}`)
  return lines
}
