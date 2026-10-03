let hideTimer: ReturnType<typeof setTimeout> | undefined

type ToastType = 'success' | 'error'
// 'cart' adds a "View cart" button that opens the cart drawer.
type ToastAction = 'cart' | null

export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    type: 'success' as ToastType,
    action: null as ToastAction,
    isVisible: false
  }),
  actions: {
    show(message: string, type: ToastType = 'success', action: ToastAction = null) {
      this.message = message
      this.type = type
      this.action = action
      this.isVisible = true

      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        this.isVisible = false
      }, type === 'error' ? 4500 : action ? 4000 : 2500)
    },
    error(message: string) {
      this.show(message, 'error')
    },
    hide() {
      clearTimeout(hideTimer)
      this.isVisible = false
    }
  }
})
