import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'newsletter')

  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('newsletter_subscribers')
    .select('email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Anyone can subscribe, so an "email" could be an Excel formula (=…, +…, @…) that runs when the
  // file is opened. escapeFormulae puts a ' in front of those so Excel shows them as plain text.
  const csv = Papa.unparse(data, { escapeFormulae: true })

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="newsletter-subscribers-${Date.now()}.csv"`)

  return csv
})
