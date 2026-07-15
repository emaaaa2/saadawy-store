export function useProducts() {
  const supabase = useSupabaseClient()

  async function getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data
  }

  async function getProductsByCategory(category) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data
  }

  return { getAllProducts, getProductsByCategory }
}