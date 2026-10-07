<template>
  <div>
    <AdminPageHeader :title="$t('admin.reviews.metaTitle')" :description="$t('admin.reviews.description')">
      <button
        v-if="filter === 'pending' && filteredReviews.length > 1"
        type="button"
        class="adm-btn adm-btn-primary"
        :disabled="isBulkBusy"
        @click="approveAll"
      >
        <Icon name="mdi:check-all" class="text-base" />
        {{ $t('admin.reviews.approveAll', { count: filteredReviews.length }) }}
      </button>
    </AdminPageHeader>

    <section class="adm-card overflow-hidden">
      <div class="px-4 pt-2">
        <AdminTabs v-model="filter" :tabs="tabs" />
      </div>

      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.reviews.loadFailed')" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>

      <AdminEmptyState
        v-else-if="!pending && filteredReviews.length === 0"
        icon="mdi:star-outline"
        :title="filter === 'pending' ? $t('admin.reviews.noneWaiting') : $t('admin.reviews.noneHere')"
        :description="filter === 'pending' ? $t('admin.reviews.caughtUp') : ''"
      />

      <ul v-else class="divide-y divide-stone-200">
        <li v-for="review in filteredReviews" :key="review.id" class="flex gap-4 px-5 py-4">
          <div class="w-9 h-9 rounded-full bg-gold/15 text-gold font-semibold flex items-center justify-center uppercase shrink-0">
            {{ review.customer_name?.[0] ?? '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p dir="auto" class="font-medium text-stone-800">{{ review.customer_name }}</p>
              <span class="text-xs text-stone-500"><bdi>{{ review.location || '—' }}</bdi> · {{ timeAgo(review.created_at) }}</span>
              <span class="adm-badge" :class="review.approved ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'">
                {{ review.approved ? $t('admin.reviews.approved') : $t('admin.reviews.waiting') }}
              </span>
            </div>
            <div class="flex items-center gap-0.5 mt-1">
              <Icon v-for="star in 5" :key="star" name="mdi:star" class="text-sm" :class="star <= review.rating ? 'text-gold' : 'text-stone-200'" />
            </div>
            <p dir="auto" class="text-sm text-stone-700 leading-relaxed mt-2 whitespace-pre-line">{{ review.comment }}</p>
            <p v-if="review.product" class="text-xs text-stone-500 mt-2">
              {{ $t('admin.reviews.on') }}
              <a :href="`/product/${review.product.slug}`" target="_blank" rel="noopener" dir="auto" class="text-ink hover:underline">{{ $pname(review.product) }}</a>
            </p>
            <p v-else class="text-xs text-stone-500 mt-2">{{ $t('admin.reviews.storeReview') }}</p>
          </div>
          <div class="flex flex-col sm:flex-row items-end sm:items-start gap-1.5 shrink-0">
            <button
              v-if="!review.approved"
              type="button"
              class="adm-btn adm-btn-primary adm-btn-sm"
              :disabled="busyIds.has(review.id)"
              @click="setApproved(review, true)"
            >
              <Icon name="mdi:check" class="text-sm" />
              {{ $t('admin.reviews.approve') }}
            </button>
            <button
              v-else
              type="button"
              class="adm-btn adm-btn-secondary adm-btn-sm"
              :disabled="busyIds.has(review.id)"
              @click="setApproved(review, false)"
            >
              {{ $t('admin.reviews.hide') }}
            </button>
            <button type="button" class="adm-icon-btn hover:!text-red-600 hover:!bg-red-50" :title="$t('admin.common.delete')" :aria-label="$t('admin.common.delete')" @click="handleDelete(review)">
              <Icon name="mdi:trash-can-outline" class="text-lg" />
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'reviews'
})
const { t } = useLang()
useSeoMeta({ title: () => t('admin.reviews.metaTitle'), robots: 'noindex' })

const toast = useToastStore()
const { confirm } = useAdminConfirm()
const { refresh: refreshBadges } = useAdminBadges()
const filter = ref('pending')
const busyIds = reactive(new Set())
const isBulkBusy = ref(false)

const { data, pending, error, refresh } = await useFetch('/api/admin/reviews')
const reviews = computed(() => data.value?.reviews ?? [])

const tabs = computed(() => [
  { value: 'pending', label: t('admin.reviews.waiting'), count: reviews.value.filter((r) => !r.approved).length },
  { value: 'approved', label: t('admin.reviews.approved'), count: reviews.value.filter((r) => r.approved).length },
  { value: 'all', label: t('admin.reviews.all'), count: reviews.value.length },
])

const filteredReviews = computed(() => {
  if (filter.value === 'pending') return reviews.value.filter((r) => !r.approved)
  if (filter.value === 'approved') return reviews.value.filter((r) => r.approved)
  return reviews.value
})

async function setApproved(review, approved) {
  busyIds.add(review.id)
  try {
    await $fetch(`/api/admin/reviews/${review.id}`, { method: 'PATCH', body: { approved } })
    toast.show(approved ? t('admin.reviews.approvedToast') : t('admin.reviews.hiddenToast'))
    await refresh()
    refreshBadges()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    busyIds.delete(review.id)
  }
}

async function approveAll() {
  const list = [...filteredReviews.value]
  const ok = await confirm({
    title: t('admin.reviews.approveAllTitle', { count: list.length }),
    message: t('admin.reviews.approveAllText'),
    confirmLabel: t('admin.reviews.approveAllConfirm'),
  })
  if (!ok) return

  isBulkBusy.value = true
  const results = await Promise.allSettled(
    list.map((review) => $fetch(`/api/admin/reviews/${review.id}`, { method: 'PATCH', body: { approved: true } }))
  )
  isBulkBusy.value = false
  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed) toast.error(t('admin.reviews.approveAllPartial', { done: list.length - failed, failed }))
  else toast.show(t('admin.reviews.approveAllDone', { count: list.length }))
  await refresh()
  refreshBadges()
}

async function handleDelete(review) {
  const ok = await confirm({
    title: t('admin.reviews.deleteTitle'),
    message: t('admin.reviews.deleteText', { name: review.customer_name }),
    confirmLabel: t('admin.common.delete'),
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' })
    toast.show(t('admin.reviews.deleted'))
    await refresh()
    refreshBadges()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}
</script>
