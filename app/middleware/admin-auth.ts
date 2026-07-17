export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  try {
    await $fetch('/api/admin/check-auth')
  } catch {
    return navigateTo('/admin/login')
  }
})