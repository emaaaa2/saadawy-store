<template>
  <div>
    <AdminPageHeader :title="$t('admin.admins.metaTitle')" :description="$t('admin.admins.description')">
      <button type="button" class="adm-btn adm-btn-primary" @click="openAdd">
        <Icon name="mdi:account-plus-outline" class="text-base" />
        {{ $t('admin.admins.add') }}
      </button>
    </AdminPageHeader>

    <section class="adm-card overflow-hidden">
      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.admins.loadFailed')" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>

      <ul v-else class="divide-y divide-stone-200">
        <li v-for="email in owners" :key="email" class="flex flex-wrap items-center gap-4 px-5 py-4">
          <div class="w-9 h-9 rounded-full bg-olive text-white font-semibold flex items-center justify-center uppercase shrink-0">{{ email[0] }}</div>
          <div class="flex-1 min-w-0">
            <p dir="ltr" class="font-medium text-stone-800 truncate text-start">{{ email }}</p>
            <p class="text-xs text-stone-500">{{ $t('admin.admins.ownerHint') }}</p>
          </div>
          <span class="adm-badge bg-olive text-white">{{ $t('admin.nav.owner') }}</span>
        </li>

        <li v-for="admin in admins" :key="admin.id" class="flex flex-wrap items-center gap-4 px-5 py-4">
          <div class="w-9 h-9 rounded-full bg-gold/15 text-gold font-semibold flex items-center justify-center uppercase shrink-0">{{ admin.email[0] }}</div>
          <div class="flex-1 min-w-0">
            <p dir="ltr" class="font-medium text-stone-800 truncate text-start">{{ admin.email }}</p>
            <div class="flex flex-wrap gap-1 mt-1.5">
              <span v-for="permission in admin.permissions" :key="permission" class="adm-badge bg-stone-100 text-stone-600">
                {{ sectionLabel(permission) }}
              </span>
              <span v-if="!admin.permissions.length" class="text-xs text-red-600 dark:text-red-400">{{ $t('admin.admins.noAccess') }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm" @click="openEdit(admin)">
              <Icon name="mdi:pencil-outline" class="text-sm" />
              {{ $t('admin.admins.editAccess') }}
            </button>
            <button type="button" class="adm-icon-btn hover:!text-red-600 hover:!bg-red-50" :aria-label="$t('admin.admins.removeLabel', { email: admin.email })" :title="$t('admin.common.remove')" @click="handleRemove(admin)">
              <Icon name="mdi:trash-can-outline" class="text-lg" />
            </button>
          </div>
        </li>

        <li v-if="!pending && admins.length === 0">
          <AdminEmptyState icon="mdi:account-group-outline" :title="$t('admin.admins.noneYet')" :description="$t('admin.admins.noneYetText')">
            <button type="button" class="adm-btn adm-btn-secondary" @click="openAdd">{{ $t('admin.admins.add') }}</button>
          </AdminEmptyState>
        </li>
      </ul>
    </section>

    <AdminDrawer v-model:open="isDrawerOpen" :title="editing ? $t('admin.admins.editAccess') : $t('admin.admins.add')" :subtitle="editing?.email">
      <form id="admin-form" class="space-y-6" @submit.prevent="handleSave">
        <div v-if="!editing">
          <label for="new-admin-email" class="adm-label">{{ $t('admin.admins.email') }}</label>
          <input id="new-admin-email" v-model="form.email" dir="ltr" type="email" required placeholder="name@gmail.com" class="adm-input" />
          <p class="adm-hint">{{ $t('admin.admins.emailHint') }}</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="adm-label mb-0">{{ $t('admin.admins.canManage') }}</span>
            <button type="button" class="text-xs font-medium text-ink hover:underline" @click="toggleAll">
              {{ form.permissions.length === ADMIN_SECTIONS.length ? $t('admin.admins.clearAll') : $t('admin.admins.selectAll') }}
            </button>
          </div>
          <div class="adm-card divide-y divide-stone-200">
            <label
              v-for="section in ADMIN_SECTIONS"
              :key="section.permission"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50"
            >
              <Icon :name="section.icon" class="text-lg text-stone-400" />
              <span class="flex-1 text-sm text-stone-800">{{ $t(`admin.sections.${section.permission}`) }}</span>
              <input v-model="form.permissions" type="checkbox" :value="section.permission" class="adm-checkbox" />
            </label>
          </div>
          <p class="adm-hint">{{ $t('admin.admins.ownerOnly') }}</p>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="adm-btn adm-btn-secondary" @click="isDrawerOpen = false">{{ $t('admin.common.cancel') }}</button>
          <button type="submit" form="admin-form" class="adm-btn adm-btn-primary" :disabled="isSaving || form.permissions.length === 0">
            {{ isSaving ? $t('admin.common.saving') : editing ? $t('admin.admins.saveAccess') : $t('admin.admins.add') }}
          </button>
        </div>
      </template>
    </AdminDrawer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminOwnerOnly: true
})
const { t } = useLang()
useSeoMeta({ title: () => t('admin.admins.metaTitle'), robots: 'noindex' })

const toast = useToastStore()
const { confirm } = useAdminConfirm()
const { data, pending, error, refresh } = await useFetch('/api/admin/admins')
const owners = computed(() => data.value?.owners ?? [])
const admins = computed(() => data.value?.admins ?? [])

const isDrawerOpen = ref(false)
const isSaving = ref(false)
const editing = ref(null)
const form = ref({ email: '', permissions: [] })

function sectionLabel(permission) {
  return ADMIN_SECTIONS.some((s) => s.permission === permission) ? t(`admin.sections.${permission}`) : permission
}

function openAdd() {
  editing.value = null
  form.value = { email: '', permissions: ['orders'] }
  isDrawerOpen.value = true
}

function openEdit(admin) {
  editing.value = admin
  form.value = { email: admin.email, permissions: [...admin.permissions] }
  isDrawerOpen.value = true
}

function toggleAll() {
  form.value.permissions = form.value.permissions.length === ADMIN_SECTIONS.length
    ? []
    : ADMIN_SECTIONS.map((s) => s.permission)
}

async function handleSave() {
  isSaving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/admin/admins/${editing.value.id}`, { method: 'PATCH', body: { permissions: form.value.permissions } })
      toast.show(t('admin.admins.accessUpdated', { email: editing.value.email }))
    } else {
      await $fetch('/api/admin/admins', { method: 'POST', body: form.value })
      toast.show(t('admin.admins.added', { email: form.value.email.trim() }))
    }
    isDrawerOpen.value = false
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}

async function handleRemove(admin) {
  const ok = await confirm({
    title: t('admin.admins.removeTitle', { email: admin.email }),
    message: t('admin.admins.removeText'),
    confirmLabel: t('admin.common.remove'),
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' })
    toast.show(t('admin.admins.removed', { email: admin.email }))
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}
</script>
