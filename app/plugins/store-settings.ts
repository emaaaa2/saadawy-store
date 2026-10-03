export default defineNuxtPlugin(async () => {
  const settings = useStoreSettings()

  await callOnce('store-settings', async () => {
    try {
      settings.value = await $fetch<StoreSettings>('/api/store-settings')
    } catch {
      // Keep the defaults; the store still works without saved settings.
    }
  })
})
