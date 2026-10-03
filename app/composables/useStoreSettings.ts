// Loaded once per visit by plugins/store-settings.ts; edited from Dashboard → Store settings.
export function useStoreSettings() {
  return useState<StoreSettings>('store-settings', () => structuredClone(STORE_SETTINGS_DEFAULTS))
}
