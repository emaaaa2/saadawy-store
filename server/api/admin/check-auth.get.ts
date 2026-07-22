export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

if (session !== config.sessionSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return { authenticated: true }
})