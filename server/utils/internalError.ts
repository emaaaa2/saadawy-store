/**
 * For failures the visitor can't fix (database down, unexpected errors): the details go to the
 * server log, the visitor only learns that something went wrong — database messages name tables
 * and columns, which shouldn't be handed to strangers.
 */
export function internalError(error: unknown) {
  console.error(error)
  return createError({ statusCode: 500, statusMessage: 'Something went wrong. Please try again.' })
}
