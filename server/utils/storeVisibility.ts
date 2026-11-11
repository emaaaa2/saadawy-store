// The store only shows products that have a photo: either a main photo file that exists in our
// storage (has_photo, kept up to date by the triggers in supabase_add_product_has_photo.sql) or a
// main photo linked from another site. Products without one stay in the dashboard and appear on the
// store by themselves as soon as a photo is added. Use with `.or(SHOWN_IN_STORE)`.
export const SHOWN_IN_STORE = 'has_photo.eq.true,image.not.like.*product-images*'
