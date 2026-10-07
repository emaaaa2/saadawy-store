<template>
  <div>
    <AdminPageHeader :title="$t('admin.newsletter.metaTitle')" :description="plural(total, 'subscriber')">
      <a href="/api/admin/newsletter/export" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:download-outline" class="text-base" />
        {{ $t('admin.products.exportCsv') }}
      </a>
    </AdminPageHeader>

    <div class="grid lg:grid-cols-5 gap-6 items-start">
      <section class="adm-card lg:col-span-3">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">{{ $t('admin.newsletter.sendEmail') }}</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.newsletter.goesToAll') }}</p>
          </div>
        </div>
        <form class="p-5 space-y-4" @submit.prevent="handleSendCampaign">
          <div>
            <label for="campaign-subject" class="adm-label">{{ $t('admin.newsletter.subject') }}</label>
            <input id="campaign-subject" v-model="campaign.subject" dir="auto" type="text" maxlength="150" :placeholder="$t('admin.newsletter.subjectPlaceholder')" class="adm-input" />
          </div>
          <div>
            <label for="campaign-message" class="adm-label">{{ $t('admin.newsletter.message') }}</label>
            <textarea id="campaign-message" v-model="campaign.message" dir="auto" rows="10" :placeholder="$t('admin.newsletter.messagePlaceholder')" class="adm-input"></textarea>
            <p class="adm-hint">{{ $t('admin.newsletter.characters', { count: campaign.message.length.toLocaleString('en-US') }) }}</p>
          </div>
          <div class="flex items-center justify-end gap-3">
            <p class="text-xs text-stone-500 me-auto">{{ $t('admin.newsletter.confirmHint') }}</p>
            <button
              type="submit"
              :disabled="isSending || !campaign.subject.trim() || !campaign.message.trim() || !total"
              class="adm-btn adm-btn-primary"
            >
              <Icon :name="isSending ? 'mdi:loading' : 'mdi:send-outline'" class="text-base" :class="{ 'animate-spin': isSending }" />
              {{ isSending ? $t('admin.newsletter.sending') : $t('admin.newsletter.sendTo', { count: total.toLocaleString('en-US') }) }}
            </button>
          </div>
        </form>
      </section>

      <section class="adm-card lg:col-span-2 overflow-hidden">
        <div class="adm-card-header">
          <h2 class="adm-card-title">{{ $t('admin.newsletter.subscribers') }}</h2>
        </div>

        <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.newsletter.loadFailed')" :description="adminErrorMessage(error)" />
        <AdminEmptyState
          v-else-if="!pending && subscribers.length === 0"
          icon="mdi:email-outline"
          :title="$t('admin.newsletter.noneYet')"
          :description="$t('admin.newsletter.noneYetText')"
        />
        <ul v-else class="divide-y divide-stone-200" :class="{ 'opacity-60': pending }">
          <li v-for="sub in subscribers" :key="sub.id" class="group flex items-center gap-3 px-5 py-2.5">
            <div class="min-w-0 flex-1">
              <p dir="ltr" class="text-sm text-stone-800 truncate text-start">{{ sub.email }}</p>
              <p class="text-xs text-stone-500">{{ formatDate(sub.created_at) }}</p>
            </div>
            <button
              type="button"
              class="adm-icon-btn opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 hover:!text-red-600 hover:!bg-red-50"
              :aria-label="$t('admin.newsletter.removeLabel', { email: sub.email })"
              :title="$t('admin.common.remove')"
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
const { t } = useLang()
useSeoMeta({ title: () => t('admin.newsletter.metaTitle'), robots: 'noindex' })

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
    title: t('admin.newsletter.removeTitle'),
    message: t('admin.newsletter.removeText', { email: sub.email }),
    confirmLabel: t('admin.common.remove'),
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/newsletter/${sub.id}`, { method: 'DELETE' })
    toast.show(t('admin.newsletter.removed', { email: sub.email }))
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}

const campaign = ref({ subject: '', message: '' })
const isSending = ref(false)

async function handleSendCampaign() {
  const ok = await confirm({
    title: t('admin.newsletter.sendTitle', { subject: campaign.value.subject.trim() }),
    message: t('admin.newsletter.sendText', { subscribers: plural(total.value, 'subscriber') }),
    confirmLabel: t('admin.newsletter.sendNow'),
  })
  if (!ok) return

  isSending.value = true
  try {
    const result = await $fetch('/api/admin/newsletter/send', { method: 'POST', body: campaign.value })
    const message = t(result.failed ? 'admin.newsletter.sentFailed' : 'admin.newsletter.sent', result)
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
