// Counts shown next to sidebar links (pending orders, reviews to approve).
export function useAdminBadges() {
  const badges = useState('admin-badges', () => ({ orders: 0, reviews: 0 }))

  async function refresh() {
    try {
      badges.value = await $fetch('/api/admin/badges')
    } catch {
      // Keep the last counts; they're only hints.
    }
  }

  return { badges, refresh }
}
