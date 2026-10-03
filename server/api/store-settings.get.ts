export default defineEventHandler(async (event) => {
  // Everything here is shown on the storefront anyway (numbers, links, payment details).
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return await getStoreSettings(event)
})
