export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: []
  }),
  getters: {
    count: (state) => state.items.length
  },
  actions: {
    isInWishlist(productId) {
      return this.items.some(item => item.id === productId)
    },
    toggle(product) {
      const toast = useToastStore()
      const index = this.items.findIndex(item => item.id === product.id)

      if (index === -1) {
        this.items.push(product)
        toast.show({ key: 'cart.wishlistAdded', params: { product } })
      } else {
        this.items.splice(index, 1)
        toast.show({ key: 'cart.wishlistRemoved', params: { product } })
      }

      this.saveToStorage()
    },
    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToStorage()
    },
    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem('saadawy-wishlist', JSON.stringify(this.items))
      }
    },
    loadFromStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('saadawy-wishlist')
        if (saved) {
          this.items = JSON.parse(saved)
        }
      }
    }
  }
})
