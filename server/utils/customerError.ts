// Errors customers can see. `code` lets the store show the message in the
// shopper's language (see app/locales/errors.ts); `message` stays as the English fallback.
export function customerError(statusCode: number, code: string, message: string, params?: Record<string, unknown>) {
  return createError({ statusCode, statusMessage: message, data: { code, params } })
}
