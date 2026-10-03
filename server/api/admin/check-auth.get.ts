export default defineEventHandler(async (event) => {
  return await requireAdmin(event)
})
