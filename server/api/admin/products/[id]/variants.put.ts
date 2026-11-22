import { serverSupabaseServiceRole } from '#supabase/server'

// Saves a product's colours / shades as the editor shows them (the list replaces what's saved):
// new ones are added, missing ones deleted, the rest updated in this order. The product's stock
// becomes their total (database trigger, supabase_add_product_variants.sql).
// Body: { variants: [{ id?, name, nameEn, color, image, stock }], original: [{ id, stock }] (as the
// page loaded them), stock? (the product's own stock again, used when the last colour is removed) }
const MAX_VARIANTS = 60
const NAME_LIMIT = 60

interface VariantInput { id: string | null; name: string; name_en: string | null; color: string | null; image: string | null; stock: number; position: number }

const changedError = () => adminError(409, 'productChanged', 'This product was just changed by someone else or by an order. Refresh and try again.')

function readVariant(input: unknown, position: number): VariantInput {
  const v = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

  const name = text(v.name)
  if (!name || name.length > NAME_LIMIT) throw adminError(400, 'variantName', 'Every colour needs a name (up to 60 letters)')
  const nameEn = text(v.nameEn)
  if (nameEn.length > NAME_LIMIT) throw adminError(400, 'variantName', 'Every colour needs a name (up to 60 letters)')

  const color = text(v.color)
  const image = text(v.image)
  const stock = Number(v.stock)
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw adminError(400, 'stockInvalid', 'Stock must be a whole number, 0 or more')

  return {
    id: typeof v.id === 'string' && v.id ? v.id : null,
    name,
    name_en: nameEn || null,
    color: /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : null,
    image: /^https:\/\/\S+$/.test(image) && image.length <= 500 ? image : null,
    stock,
    position,
  }
}

const summary = (list: { name: string; stock: number }[]) => list.map((v) => `${v.name}: ${v.stock}`).join('، ') || null

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')
  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')
  const body = (await readBody(event)) ?? {}

  if (!Array.isArray(body.variants)) throw adminError(400, 'nothingToUpdate', 'Nothing to update')
  if (body.variants.length > MAX_VARIANTS) throw adminError(400, 'tooManyVariants', 'A product can have up to 60 colours', { max: MAX_VARIANTS })
  const wanted = body.variants.map(readVariant)

  const names = new Set<string>()
  for (const v of wanted) {
    const key = v.name.toLowerCase()
    if (names.has(key)) throw adminError(400, 'variantDuplicate', `Two colours have the same name: ${v.name}`, { name: v.name })
    names.add(key)
  }

  const { data: product, error: productError } = await client.from('products').select('id, sku, name').eq('id', productId).maybeSingle()
  if (productError) throw internalError(productError)
  if (!product) throw adminError(404, 'productNotFound', 'This product no longer exists')

  const { data: rows, error: readError } = await client.from('product_variants').select(VARIANT_FIELDS).eq('product_id', productId).order('position')
  if (readError) throw adminError(500, 'variantsSql', 'Run supabase_add_product_variants.sql in Supabase first')
  const saved = (rows ?? []) as ProductVariant[]
  const byId = new Map(saved.map((v) => [v.id, v]))

  // The page sends each colour's stock as it showed it: if an order (or another admin) changed it
  // since, or removed the colour, stop instead of overwriting that.
  for (const o of Array.isArray(body.original) ? body.original : []) {
    const now = byId.get(o?.id)
    if (now && Number(now.stock) !== Number(o.stock)) throw changedError()
  }
  if (wanted.some((v) => v.id && !byId.has(v.id))) throw changedError()

  const keep = new Set(wanted.filter((v) => v.id).map((v) => v.id))
  const removed = saved.filter((v) => !keep.has(v.id))
  if (removed.length) {
    const { error } = await client.from('product_variants').delete().in('id', removed.map((v) => v.id))
    if (error) throw internalError(error)
  }

  for (const v of wanted.filter((x) => x.id)) {
    const before = byId.get(v.id!)!
    const row: Record<string, unknown> = { name: v.name, name_en: v.name_en, color: v.color, image: v.image, position: v.position }
    let query = client.from('product_variants').update(row).eq('id', v.id!)
    if (v.stock !== before.stock) {
      row.stock = v.stock
      query = client.from('product_variants').update(row).eq('id', v.id!).eq('stock', before.stock) // unless an order just took some
    }
    const { data, error } = await query.select('id')
    if (error) throw internalError(error)
    if (!data?.length) throw changedError()
  }

  const added = wanted.filter((v) => !v.id)
  if (added.length) {
    const { error } = await client.from('product_variants').insert(added.map(({ id: _id, ...v }) => ({ ...v, product_id: productId })))
    if (error) throw internalError(error)
  }

  // The last colour is gone: the product has its own stock again.
  if (!wanted.length && saved.length && Number.isInteger(body.stock) && body.stock >= 0) {
    const { error } = await client.from('products').update({ stock: body.stock }).eq('id', productId)
    if (error) throw internalError(error)
  }

  const variants = (await getVariants(client, [productId!]))[productId!] ?? []
  const { data: after, error: afterError } = await client.from('products').select('*').eq('id', productId).single()
  if (afterError) throw internalError(afterError)

  const changes = changedColumns({ variants: summary(saved) }, { variants: summary(variants) })
  if (Object.keys(changes).length) {
    await logActivity(event, access.email, 'product.update', product.sku ?? productId, { name: product.name, changes })
  }
  return { variants, product: after }
})
