export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (body.password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Incorrect password'
    })
  }

  setCookie(event, 'admin_session', config.sessionSecret, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict'
  })

  return { success: true }
})