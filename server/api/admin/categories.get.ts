export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')
  const settings = await getStoreSettings(event)
  return { categories: settings.categories }
})
