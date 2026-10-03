import { serverSupabaseServiceRole } from '#supabase/server'

// Counts of things waiting on an admin, limited to the sections this admin can open.
export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event)
  const client = serverSupabaseServiceRole(event)
  const can = (permission: AdminPermission) => access.permissions.includes(permission)

  const [orders, reviews] = await Promise.all([
    can('orders') ? client.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending') : null,
    can('reviews') ? client.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false) : null,
  ])

  return {
    orders: orders?.count ?? 0,
    reviews: reviews?.count ?? 0,
  }
})
