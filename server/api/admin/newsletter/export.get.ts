import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('newsletter_subscribers')
    .select('email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const csv = Papa.unparse(data)

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="newsletter-subscribers-${Date.now()}.csv"`)

  return csv
})
