<template>
  <div class="px-8 py-8 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-olive">Newsletter Subscribers</h1>
      <a
        href="/api/admin/newsletter/export"
        class="bg-olive text-beige px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition"
      >
        Export CSV
      </a>
    </div>

    <p class="text-sm text-taupe mb-4">{{ total }} total subscribers</p>

    <div class="bg-white rounded-2xl border border-olive/10 p-5 mb-6">
      <h2 class="font-semibold text-olive mb-3">Send a Campaign</h2>
      <div class="space-y-3">
        <input
          v-model="campaign.subject"
          type="text"
          placeholder="Subject (e.g. New arrivals this week!)"
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        />
        <textarea
          v-model="campaign.message"
          rows="5"
          placeholder="Write your message to subscribers..."
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        ></textarea>
        <button
          :disabled="isSending || !campaign.subject.trim() || !campaign.message.trim()"
          class="bg-olive text-beige px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition disabled:opacity-50"
          @click="handleSendCampaign"
        >
          {{ isSending ? "Sending..." : `Send to ${total} Subscriber${total === 1 ? "" : "s"}` }}
        </button>
      </div>
    </div>

    <div v-if="pending" class="text-center py-12 text-olive/50">Loading...</div>

    <div v-else-if="subscribers.length === 0" class="text-center py-12 text-olive/50">
      No subscribers yet.
    </div>

    <div v-else class="bg-white rounded-2xl overflow-hidden border border-olive/10">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-olive/10 text-left text-olive/50 text-xs uppercase tracking-wide">
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Subscribed</th>
            <th class="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sub in subscribers"
            :key="sub.id"
            class="border-b border-olive/5 last:border-0 hover:bg-beige/30 transition"
          >
            <td class="px-5 py-3 text-olive">{{ sub.email }}</td>
            <td class="px-5 py-3 text-taupe">{{ new Date(sub.created_at).toLocaleDateString() }}</td>
            <td class="px-5 py-3 text-right">
              <button
                class="text-red-500 hover:text-red-600 transition"
                aria-label="Remove subscriber"
                @click="handleRemove(sub)"
              >
                <Icon name="mdi:trash-can-outline" class="text-lg" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button
        :disabled="currentPage === 1"
        class="px-4 py-2 rounded-full text-sm border border-olive/20 disabled:opacity-30 hover:bg-olive/5 transition"
        @click="currentPage--"
      >
        Previous
      </button>
      <span class="text-sm text-olive/70">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        class="px-4 py-2 rounded-full text-sm border border-olive/20 disabled:opacity-30 hover:bg-olive/5 transition"
        @click="currentPage++"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const currentPage = ref(1)

const { data, pending, refresh } = await useFetch('/api/admin/newsletter', {
  query: { page: currentPage },
  watch: [currentPage]
})

const subscribers = computed(() => data.value?.subscribers ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)

async function handleRemove(sub) {
  const confirmed = confirm(`Remove "${sub.email}" from the newsletter list?`)
  if (!confirmed) return

  await $fetch(`/api/admin/newsletter/${sub.id}`, { method: 'DELETE' })
  refresh()
}

const campaign = ref({ subject: '', message: '' })
const isSending = ref(false)
const toast = useToastStore()

async function handleSendCampaign() {
  const confirmed = confirm(`Send this email to ${total.value} subscriber${total.value === 1 ? '' : 's'}?`)
  if (!confirmed) return

  isSending.value = true

  try {
    const result = await $fetch('/api/admin/newsletter/send', {
      method: 'POST',
      body: campaign.value
    })
    toast.show(`Sent to ${result.sent} of ${result.total} subscribers${result.failed ? ` (${result.failed} failed)` : ''}`)
    campaign.value = { subject: '', message: '' }
  } catch (error) {
    toast.show(error.data?.statusMessage || 'Something went wrong. Please try again.')
  } finally {
    isSending.value = false
  }
}
</script>
