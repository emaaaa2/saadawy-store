<template>
  <div class="px-8 py-8 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-olive">Reviews</h1>
      <div class="flex items-center gap-2 text-sm">
        <button
          class="px-4 py-2 rounded-full font-medium transition"
          :class="filter === 'pending' ? 'bg-olive text-beige' : 'bg-beige text-olive'"
          @click="filter = 'pending'"
        >
          Pending ({{ pendingCount }})
        </button>
        <button
          class="px-4 py-2 rounded-full font-medium transition"
          :class="filter === 'all' ? 'bg-olive text-beige' : 'bg-beige text-olive'"
          @click="filter = 'all'"
        >
          All
        </button>
      </div>
    </div>

    <div v-if="pending" class="text-center py-12 text-olive/50">Loading...</div>

    <div v-else-if="filteredReviews.length === 0" class="text-center py-12 text-olive/50">
      No reviews here.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="review in filteredReviews"
        :key="review.id"
        class="bg-white rounded-2xl border border-olive/10 p-5"
      >
        <div class="flex items-start justify-between gap-4 mb-2">
          <div>
            <p class="font-semibold text-olive">{{ review.customer_name }}</p>
            <p class="text-xs text-taupe">
              {{ review.location || "—" }} · {{ new Date(review.created_at).toLocaleDateString() }}
            </p>
          </div>
          <span
            class="text-xs font-bold px-2 py-1 rounded-full shrink-0"
            :class="review.approved ? 'bg-sage/20 text-sage' : 'bg-gold/20 text-gold'"
          >
            {{ review.approved ? "Approved" : "Pending" }}
          </span>
        </div>

        <div class="flex gap-0.5 mb-2">
          <Icon
            v-for="star in 5"
            :key="star"
            name="mdi:star"
            class="text-sm"
            :class="star <= review.rating ? 'text-gold' : 'text-olive/15'"
          />
        </div>

        <p class="text-sm text-olive/80 leading-relaxed mb-4">{{ review.comment }}</p>

        <div class="flex items-center gap-2">
          <button
            v-if="!review.approved"
            class="text-xs font-semibold px-3 py-1.5 rounded-full bg-sage text-white hover:opacity-90 transition"
            @click="setApproved(review, true)"
          >
            Approve
          </button>
          <button
            v-else
            class="text-xs font-semibold px-3 py-1.5 rounded-full bg-beige text-olive hover:bg-olive/10 transition"
            @click="setApproved(review, false)"
          >
            Unapprove
          </button>
          <button
            class="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
            @click="handleDelete(review)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const filter = ref('pending')

const { data, pending, refresh } = await useFetch('/api/admin/reviews')

const reviews = computed(() => data.value?.reviews ?? [])
const pendingCount = computed(() => reviews.value.filter((r) => !r.approved).length)

const filteredReviews = computed(() =>
  filter.value === 'pending' ? reviews.value.filter((r) => !r.approved) : reviews.value
)

async function setApproved(review, approved) {
  await $fetch(`/api/admin/reviews/${review.id}`, {
    method: 'PATCH',
    body: { approved }
  })
  refresh()
}

async function handleDelete(review) {
  const confirmed = confirm(`Delete this review from "${review.customer_name}"?`)
  if (!confirmed) return

  await $fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' })
  refresh()
}
</script>
