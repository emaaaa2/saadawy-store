export function useIsAdmin() {
  const user = useSupabaseUser()
  const requestFetch = useRequestFetch()
  const isAdmin = useState('is-admin', () => false)
  const checkedFor = useState<string | null>('is-admin-checked-for', () => null)

  async function check() {
    const userId = user.value?.sub ?? null
    if (!userId) {
      isAdmin.value = false
      checkedFor.value = null
      return
    }
    if (checkedFor.value === userId) return

    checkedFor.value = userId
    try {
      await requestFetch('/api/admin/check-auth')
      isAdmin.value = true
    } catch {
      isAdmin.value = false
    }
  }

  return { isAdmin, check }
}
