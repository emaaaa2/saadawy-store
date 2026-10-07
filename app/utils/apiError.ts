// Turns a failed $fetch into a message in the shopper's language.
// Errors from server/utils/customerError.ts carry a code; anything else falls back to a generic message.
export function apiErrorMessage(error: any, t: (key: string, params?: Record<string, any>) => string) {
  const detail = error?.data?.data
  if (detail?.code) return t(`errors.${detail.code}`, detail.params)
  return t('common.somethingWrong')
}
