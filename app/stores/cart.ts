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
    addItem(product) {
      const toast = useToastStore()
      const existing = this.items.find(item => item.id === product.id)

      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error({ key: 'cart.onlyAvailable', params: { count: product.stock, product } })
          return
        }
        existing.quantity++
      } else {
        if (product.stock < 1) {
          toast.error({ key: 'cart.soldOut', params: { product } })
          return
        }
        this.items.push({ ...product, quantity: 1 })
      }

      toast.show({ key: 'cart.added', params: { product } }, 'success', 'cart')

      this.saveToStorage()
    },
    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToStorage()
    },
    increaseQty(productId) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (item.quantity >= item.stock) {
          const toast = useToastStore()
          toast.error({ key: 'cart.onlyAvailable', params: { count: item.stock, product: item } })
          return
        }
        item.quantity++
      }
      this.saveToStorage()
    },
    decreaseQty(productId) {
      const item = this.items.find(item => item.id === productId)
      if (item && item.quantity > 1) {
        item.quantity--
      } else if (item) {
        this.removeItem(productId)
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