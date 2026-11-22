// A category's types (e.g. Makeup → Lips): the list from Dashboard → Categories, or the defaults
// in shared/utils/subcategories.ts until it's been edited there. Reactive: follows the store settings.
export function useSubcategories() {
  const settings = useStoreSettings()
  return (category: string | null | undefined) => subcategoriesFor(settings.value, category)
}
