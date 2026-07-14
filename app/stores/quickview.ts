export const useQuickViewStore = defineStore('quickview', {
  state: () => ({
    isOpen: false,
    product: null
  }),
  actions: {
    open(product) {
      this.product = product
      this.isOpen = true
    },
    close() {
      this.isOpen = false
      this.product = null
    }
  }
})