// One cart line per product, per colour (each colour has its own stock) and per chosen photo (a
// product with several designs under one code: the customer orders the one in the photo).
export const cartLineKey = (item) => [item.id, item.variant_id, item.chosen_image].filter(Boolean).join(':')

// Pieces of this product (and colour) already in the cart, over all its lines.
const inCart = (items, line) => items
  .filter((item) => item.id === line.id && (item.variant_id ?? null) === (line.variant_id ?? null))
  .reduce((sum, item) => sum + item.quantity, 0)

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    subtotal: (state) => {
      return state.items.reduce((total, item) => {
        const price = item.sale_price ?? item.price
        return total + (price * item.quantity)
      }, 0)
    }
  },
  actions: {
    // `variant`: the chosen colour/shade, required for a product that has them (the product page picks it).
    // `chosenImage`: the photo the customer picked on the product page, shown in the cart and the order.
    addItem(product, variant = null, chosenImage = null) {
      const toast = useToastStore()
      // The colour's own stock and photo; the colour list itself isn't kept in the cart.
      const { variants: _variants, ...base } = product
      const line = variant
        ? {
            ...base,
            variant_id: variant.id,
            variant_name: variant.name,
            variant_name_en: variant.name_en,
            image: variant.image || product.image,
            stock: variant.stock,
          }
        : { ...base }
      if (chosenImage) Object.assign(line, { chosen_image: chosenImage, image: chosenImage })
      const existing = this.items.find(item => cartLineKey(item) === cartLineKey(line))

      if (inCart(this.items, line) >= line.stock) {
        toast.error({ key: line.stock < 1 ? 'cart.soldOut' : 'cart.onlyAvailable', params: { count: line.stock, product: line } })
        return
      }

      if (existing) {
        if (existing.quantity >= line.stock) {
          toast.error({ key: 'cart.onlyAvailable', params: { count: line.stock, product: line } })
          return
        }
        existing.quantity++
      } else {
        if (line.stock < 1) {
          toast.error({ key: 'cart.soldOut', params: { product: line } })
          return
        }
        this.items.push({ ...line, quantity: 1 })
      }

      toast.show({ key: 'cart.added', params: { product: line } }, 'success', 'cart')

      this.saveToStorage()
    },
    // These take the line's key (cartLineKey), which is the product id for products without colours.
    removeItem(key) {
      this.items = this.items.filter(item => cartLineKey(item) !== key)
      this.saveToStorage()
    },
    increaseQty(key) {
      const item = this.items.find(item => cartLineKey(item) === key)
      if (item) {
        if (inCart(this.items, item) >= item.stock) {
          const toast = useToastStore()
          toast.error({ key: 'cart.onlyAvailable', params: { count: item.stock, product: item } })
          return
        }
        item.quantity++
      }
      this.saveToStorage()
    },
    decreaseQty(key) {
      const item = this.items.find(item => cartLineKey(item) === key)
      if (item && item.quantity > 1) {
        item.quantity--
      } else if (item) {
        this.removeItem(key)
      }
      this.saveToStorage()
    },
    clearCart() {
      this.items = []
      this.saveToStorage()
    },
    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem('saadawy-cart', JSON.stringify(this.items))
      }
    },
    loadFromStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('saadawy-cart')
        if (saved) {
          this.items = JSON.parse(saved)
        }
      }
    }
  }
})
