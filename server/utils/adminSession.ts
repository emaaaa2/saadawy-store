import { createHmac } from 'node:crypto'
import type { H3Event } from 'h3'

function getAdminSessionToken(sessionSecret: string) {
  return createHmac('sha256', sessionSecret).update('admin').digest('hex')
}

export function setAdminSessionCookie(event: H3Event, sessionSecret: string) {
  setCookie(event, 'admin_session', getAdminSessionToken(sessionSecret), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict'
  })
}

export function requireAdminSession(event: H3Event, sessionSecret: string) {
  const session = getCookie(event, 'admin_session')

  if (session !== getAdminSessionToken(sessionSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
