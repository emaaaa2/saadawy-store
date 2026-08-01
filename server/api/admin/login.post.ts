export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (body.password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Incorrect password'
    })
  }

  setAdminSessionCookie(event, config.sessionSecret)

  return { success: true }
})