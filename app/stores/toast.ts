export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    isVisible: false
  }),
  actions: {
    show(message) {
      this.message = message
      this.isVisible = true

      setTimeout(() => {
        this.isVisible = false
      }, 2500)
    }
  }
})