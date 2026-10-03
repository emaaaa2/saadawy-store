import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { orders: data };
});
