import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const session = getCookie(event, "admin_session");

if (session !== config.sessionSecret) {
      throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

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
