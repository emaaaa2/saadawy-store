<template>
  <div>
    <AdminPageHeader title="Newsletter" :description="`${total.toLocaleString('en-US')} subscriber${total === 1 ? '' : 's'}`">
      <a href="/api/admin/newsletter/export" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:download-outline" class="text-base" />
        Export CSV
      </a>
    </AdminPageHeader>

    <div class="grid lg:grid-cols-5 gap-6 items-start">
      <section class="adm-card lg:col-span-3">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">Send an email</h2>
            <p class="text-xs text-stone-500 mt-0.5">Goes to every subscriber.</p>
          </div>
        </div>
        <form class="p-5 space-y-4" @submit.prevent="handleSendCampaign">
          <div>
            <label for="campaign-subject" class="adm-label">Subject</label>
            <input id="campaign-subject" v-model="campaign.subject" type="text" maxlength="150" placeholder="New arrivals this week!" class="adm-input" />
          </div>
          <div>
            <label for="campaign-message" class="adm-label">Message</label>
            <textarea id="campaign-message" v-model="campaign.message" rows="10" placeholder="Write your message to subscribers…" class="adm-input"></textarea>
            <p class="adm-hint">{{ campaign.message.length.toLocaleString('en-US') }} characters</p>
          </div>
          <div class="flex items-center justify-end gap-3">
            <p class="text-xs text-stone-500 mr-auto">You'll be asked to confirm before it sends.</p>
            <button
              type="submit"
              :disabled="isSending || !campaign.subject.trim() || !campaign.message.trim() || !total"
              class="adm-btn adm-btn-primary"
            >
              <Icon :name="isSending ? 'mdi:loading' : 'mdi:send-outline'" class="text-base" :class="{ 'animate-spin': isSending }" />
              {{ isSending ? 'Sending…' : `Send to ${total.toLocaleString('en-US')}` }}
            </button>
          </div>
        </form>
      </section>

      <section class="adm-card lg:col-span-2 overflow-hidden">
        <div class="adm-card-header">
          <h2 class="adm-card-title">Subscribers</h2>
        </div>

        <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" title="Couldn't load subscribers" :description="adminErrorMessage(error)" />
        <AdminEmptyState
          v-else-if="!pending && subscribers.length === 0"
          icon="mdi:email-outline"
          title="No subscribers yet"
          description="People who sign up in the store footer appear here."
        />
        <ul v-else class="divide-y divide-stone-200" :class="{ 'opacity-60': pending }">
          <li v-for="sub in subscribers" :key="sub.id" class="group flex items-center gap-3 px-5 py-2.5">
            <div class="min-w-0 flex-1">
              <p class="text-sm text-stone-800 truncate">{{ sub.email }}</p>
              <p class="text-xs text-stone-500">{{ formatDate(sub.created_at) }}</p>
            </div>
            <button
              type="button"
              class="adm-icon-btn opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 hover:!text-red-600 hover:!bg-red-50"
              :aria-label="`Remove ${sub.email}`"
              title="Remove"
              @click="handleRemove(sub)"
            >
              <Icon name="mdi:trash-can-outline" class="text-lg" />
            </button>
          </li>
        </ul>

        <AdminPagination v-if="totalPages > 1" v-model="currentPage" :total-pages="totalPages" :total="total" :page-size="pageSize" />
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'newsletter'
})
useSeoMeta({ title: 'Newsletter', robots: 'noindex' })

const toast = useToastStore()
const { confirm } = useAdminConfirm()
const currentPage = ref(1)

const { data, pending, error, refresh } = await useFetch('/api/admin/newsletter', {
  query: { page: currentPage },
})

const subscribers = computed(() => data.value?.subscribers ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
const pageSize = computed(() => data.value?.pageSize ?? 50)

async function handleRemove(sub) {
  const ok = await confirm({
    title: 'Remove subscriber?',
    message: `${sub.email} won't get newsletter emails anymore.`,
    confirmLabel: 'Remove',
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/newsletter/${sub.id}`, { method: 'DELETE' })
    toast.show(`${sub.email} removed`)
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}

const campaign = ref({ subject: '', message: '' })
const isSending = ref(false)

async function handleSendCampaign() {
  const ok = await confirm({
    title: `Send “${campaign.value.subject.trim()}”?`,
    message: `It goes to ${total.value} subscriber${total.value === 1 ? '' : 's'} right away and can't be undone.`,
    confirmLabel: 'Send now',
  })
  if (!ok) return

  isSending.value = true
  try {
    const result = await $fetch('/api/admin/newsletter/send', { method: 'POST', body: campaign.value })
    const message = `Sent to ${result.sent} of ${result.total} subscribers${result.failed ? ` (${result.failed} failed)` : ''}`
    if (result.failed) toast.error(message)
    else toast.show(message)
    campaign.value = { subject: '', message: '' }
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSending.value = false
  }
}
</script>
