export function useAdminAccess() {
  const user = useSupabaseUser()
  const requestFetch = useRequestFetch()
  const access = useState<AdminAccess | null>('admin-access', () => null)
  const checkedFor = useState<string | null>('admin-access-checked-for', () => null)
  const checkedAt = useState<number>('admin-access-checked-at', () => 0)

  async function check(force = false) {
    const userId = user.value?.sub ?? null
    if (!userId) {
      access.value = null
      checkedFor.value = null
      return null
    }
    if (!force && checkedFor.value === userId) return access.value

    checkedFor.value = userId
    checkedAt.value = Date.now()
    try {
      access.value = await requestFetch<AdminAccess>('/api/admin/check-auth')
    } catch {
      access.value = null
    }
    return access.value
  }

  // Re-asks the server only when the last answer is older than maxAge, so moving
  // between dashboard pages stays instant. Every admin API still checks on its own.
  function checkIfStale(maxAge = 60_000) {
    return check(Date.now() - checkedAt.value > maxAge)
  }

  const isAdmin = computed(() => !!access.value)
  const can = (permission: AdminPermission) => !!access.value?.permissions.includes(permission)

  return { access, isAdmin, can, check, checkIfStale }
}
