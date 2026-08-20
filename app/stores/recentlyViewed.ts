export const useRecentlyViewedStore = defineStore('recentlyViewed', {
  state: () => ({
    items: []
  }),
  actions: {
    track(product) {
      if (import.meta.client) {
        const saved = localStorage.getItem('saadawy-recently-viewed')
        if (saved) this.items = JSON.parse(saved)
      }
      this.items = this.items.filter(item => item.id !== product.id)
      this.items.unshift(product)
      this.items = this.items.slice(0, 10)
      this.saveToStorage()
    },
    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem('saadawy-recently-viewed', JSON.stringify(this.items))
      }
    },
    loadFromStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('saadawy-recently-viewed')
        if (saved) {
          this.items = JSON.parse(saved)
        }
      }
    }
  }
})
