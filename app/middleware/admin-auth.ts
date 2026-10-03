// Non-admins get the regular 404 page, so the admin area looks like it doesn't exist.
export default defineNuxtRouteMiddleware(async () => {
  const notFound = () => createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })

  if (!useSupabaseUser().value) return notFound()

  try {
    await useRequestFetch()('/api/admin/check-auth')
  } catch {
    return notFound()
  }
})
