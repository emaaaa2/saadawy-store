export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')
  const settings = await getStoreSettings(event)
  return {
    categories: settings.categories,
    subcategories: allSubcategories(settings),
    // So the page can say how many products a type has before it's removed.
    subcategoryCounts: await getSubcategoryCounts(event),
  }
})
