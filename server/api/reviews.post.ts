import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
  const location = typeof body.location === 'string' ? body.location.trim() : ''
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
  const rating = Number(body.rating)

  if (!customerName || customerName.length > 80) {
    throw customerError(400, 'reviewName', 'Please enter your name')
  }
  if (!comment || comment.length > 1000) {
    throw customerError(400, 'reviewComment', 'Please enter a review (max 1000 characters)')
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw customerError(400, 'reviewRating', 'Rating must be between 1 and 5')
  }

  const productId = typeof body.productId === 'string' && body.productId ? body.productId : null

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('reviews')
    .insert({
      customer_name: customerName,
      location: location || null,
      rating,
      comment,
      product_id: productId,
      approved: false
    })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
