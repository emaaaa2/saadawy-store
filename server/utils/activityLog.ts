import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

let warned = false

/** Records a dashboard change (supabase_admin_activity.sql); throws if it can't be saved. Returns the entry id. */
export async function recordActivity(event: H3Event, adminEmail: string, action: string, target: string | number | null, details?: unknown) {
  const { data, error } = await serverSupabaseServiceRole(event)
    .from('admin_activity')
    .insert({ admin_email: adminEmail, action, target: target === null ? null : String(target), details: details ?? null })
    .select('id')
    .single()
  if (error) throw error
  return data.id as number
}

/**
 * Same, but never fails the request it belongs to: the change already happened, so a logging
 * problem only goes to the server log.
 */
export async function logActivity(event: H3Event, adminEmail: string, action: string, target: string | number | null, details?: unknown) {
  try {
    await recordActivity(event, adminEmail, action, target, details)
  } catch (error: any) {
    if (!warned) console.error('Activity log failed (has supabase_admin_activity.sql been run?):', error?.message ?? error)
    warned = true
  }
}

/** The columns of `after` whose value differs from `before`, as { column: [before, after] }. */
export function changedColumns(before: Record<string, any>, after: Record<string, any>, columns = Object.keys(after)) {
  const changes: Record<string, [unknown, unknown]> = {}
  for (const column of columns) {
    const a = before?.[column] ?? null
    const b = after?.[column] ?? null
    if (JSON.stringify(a) !== JSON.stringify(b)) changes[column] = [a, b]
  }
  return changes
}
