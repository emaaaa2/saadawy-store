interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  danger?: boolean
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

// Only ever set from a click in the browser, so one shared ref is enough.
const request = shallowRef<ConfirmRequest | null>(null)

export function useAdminConfirm() {
  function confirm(options: ConfirmOptions) {
    return new Promise<boolean>((resolve) => {
      request.value?.resolve(false)
      request.value = { ...options, resolve }
    })
  }

  function settle(ok: boolean) {
    request.value?.resolve(ok)
    request.value = null
  }

  return { request, confirm, settle }
}
