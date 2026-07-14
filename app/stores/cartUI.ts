export const useCartUIStore = defineStore('cartUI', {
  state: () => ({
    isOpen: false
  }),
  actions: {
    open() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    toggle() {
      this.isOpen = !this.isOpen
    }
  }
})