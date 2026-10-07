// Errors the dashboard shows. `code` lets it show the message in the admin's language
// (admin.errors in app/locales/admin.ts); `message` stays as the English fallback.
export function adminError(statusCode: number, code: string, message: string, params?: Record<string, unknown>) {
  return createError({ statusCode, statusMessage: message, data: { adminCode: code, params } })
}
