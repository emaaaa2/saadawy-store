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
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }

      const toast = useToastStore()
      toast.show(`${product.name} added to cart`)

      this.saveToStorage()
    },
    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToStorage()
    },
    increaseQty(productId) {
      const item = this.items.find(item => item.id === productId)
      if (item) item.quantity++
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