// Non-admins get the regular 404 page, so the admin area looks like it doesn't exist.
// Admins without access to a page are sent to the first section they can use.
export default defineNuxtRouteMiddleware(async (to) => {
  const notFound = () => createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })

  if (!useSupabaseUser().value) return notFound()

  const access = await useAdminAccess().checkIfStale()
  if (!access) return notFound()

  const required = to.meta.adminPermission as AdminPermission | undefined
  const allowed = to.meta.adminOwnerOnly
    ? access.isOwner
    : !required || access.permissions.includes(required)
  if (allowed) return

  const fallback = ADMIN_SECTIONS.find((section) => access.permissions.includes(section.permission))
  if (fallback && fallback.path !== to.path) return navigateTo(fallback.path)
  return notFound()
})
