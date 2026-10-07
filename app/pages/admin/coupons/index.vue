<template>
  <div>
    <AdminPageHeader :title="$t('admin.coupons.metaTitle')" :description="$t('admin.coupons.description')">
      <button type="button" class="adm-btn adm-btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="text-base" />
        {{ $t('admin.coupons.new') }}
      </button>
    </AdminPageHeader>

    <section class="adm-card overflow-hidden">
      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.coupons.loadFailed')" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>

      <AdminEmptyState
        v-else-if="!pending && coupons.length === 0"
        icon="mdi:ticket-percent-outline"
        :title="$t('admin.coupons.noneYet')"
        :description="$t('admin.coupons.noneYetText')"
      >
        <button type="button" class="adm-btn adm-btn-primary" @click="openCreate">{{ $t('admin.coupons.new') }}</button>
      </AdminEmptyState>

      <div v-else class="overflow-x-auto">
        <table class="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th>{{ $t('admin.coupons.table.code') }}</th>
              <th>{{ $t('admin.coupons.table.discount') }}</th>
              <th>{{ $t('admin.coupons.table.minimum') }}</th>
              <th>{{ $t('admin.coupons.table.used') }}</th>
              <th>{{ $t('admin.coupons.table.expires') }}</th>
              <th>{{ $t('admin.coupons.table.active') }}</th>
              <th class="w-24"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-stone-50">
              <td>
                <button type="button" class="group inline-flex items-center gap-1.5 font-mono font-semibold" dir="ltr" :title="$t('admin.coupons.copyCode')" @click="copyCode(coupon.code)">
                  {{ coupon.code }}
                  <Icon name="mdi:content-copy" class="text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
                <p v-if="coupon.code === settings.welcomeCouponCode" class="text-[11px] text-gold mt-0.5">{{ $t('admin.coupons.welcomeCode') }}</p>
              </td>
              <td class="font-medium">
                {{ offLabel(coupon.discount_type, coupon.discount_value) }}
              </td>
              <td class="text-stone-600">{{ coupon.min_order_total ? formatMoney(coupon.min_order_total) : '—' }}</td>
              <td>
                <p class="text-stone-700">{{ coupon.used_count }}{{ coupon.usage_limit ? ` / ${coupon.usage_limit}` : '' }}</p>
                <div v-if="coupon.usage_limit" class="w-20 h-1 bg-stone-100 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-olive rounded-full" :style="{ width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` }"></div>
                </div>
              </td>
              <td>
                <span v-if="!coupon.expires_at" class="text-stone-400">{{ $t('admin.common.never') }}</span>
                <span v-else-if="isExpired(coupon)" class="adm-badge bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400">{{ $t('admin.coupons.expired', { date: formatDate(coupon.expires_at) }) }}</span>
                <span v-else class="text-stone-600">{{ formatDate(coupon.expires_at) }}</span>
              </td>
              <td>
                <AdminToggle
                  :model-value="coupon.active"
                  :disabled="busyIds.has(coupon.id)"
                  :aria-label="$t('admin.coupons.activeLabel', { code: coupon.code })"
                  @update:model-value="toggleActive(coupon, $event)"
                />
              </td>
              <td>
                <div class="flex items-center justify-end gap-0.5">
                  <button type="button" class="adm-icon-btn" :title="$t('admin.common.edit')" :aria-label="$t('admin.common.edit')" @click="openEdit(coupon)">
                    <Icon name="mdi:pencil-outline" class="text-lg" />
                  </button>
                  <button type="button" class="adm-icon-btn hover:!text-red-600 hover:!bg-red-50" :title="$t('admin.common.delete')" :aria-label="$t('admin.common.delete')" @click="handleDelete(coupon)">
                    <Icon name="mdi:trash-can-outline" class="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminDrawer v-model:open="isDrawerOpen" :title="editing ? $t('admin.coupons.editTitle', { code: editing.code }) : $t('admin.coupons.new')">
      <form id="coupon-form" class="space-y-5" @submit.prevent="handleSave">
        <div>
          <label for="coupon-code" class="adm-label">{{ $t('admin.coupons.code') }}</label>
          <input
            id="coupon-code"
            v-model="form.code"
            type="text"
            required
            :disabled="!!editing"
            placeholder="WELCOME10"
            dir="ltr"
            pattern="[A-Za-z0-9_\-]{3,30}"
            class="adm-input font-mono uppercase"
          />
          <p class="adm-hint">{{ editing ? $t('admin.coupons.codeLocked') : $t('admin.coupons.codeHint') }}</p>
        </div>

        <div>
          <span class="adm-label">{{ $t('admin.coupons.discount') }}</span>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <button
              v-for="type in discountTypes"
              :key="type.value"
              type="button"
              class="h-10 rounded-lg border text-sm font-medium transition"
              :class="form.discountType === type.value ? 'border-ink bg-ink/5 text-ink' : 'border-stone-200 text-stone-600 hover:border-stone-300'"
              @click="form.discountType = type.value"
            >
              {{ type.label }}
            </button>
          </div>
          <div class="relative">
            <input
              id="coupon-value"
              v-model.number="form.discountValue"
              type="number"
              required
              min="0.01"
              :max="form.discountType === 'percentage' ? 100 : undefined"
              step="0.01"
              class="adm-input pe-12"
              :aria-label="form.discountType === 'percentage' ? $t('admin.coupons.discountPercent') : $t('admin.coupons.discountAmount')"
            />
            <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ form.discountType === 'percentage' ? '%' : currency }}</span>
          </div>
        </div>

        <div>
          <label for="coupon-min" class="adm-label">{{ $t('admin.coupons.minimum') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
          <div class="relative">
            <input id="coupon-min" v-model.number="form.minOrderTotal" type="number" min="0" step="0.01" placeholder="0" class="adm-input pe-12" />
            <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ currency }}</span>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label for="coupon-limit" class="adm-label">{{ $t('admin.coupons.usageLimit') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
            <input id="coupon-limit" v-model.number="form.usageLimit" type="number" min="1" step="1" :placeholder="$t('admin.coupons.unlimited')" class="adm-input" />
          </div>
          <div>
            <label for="coupon-expires" class="adm-label">{{ $t('admin.coupons.expiresOn') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
            <input id="coupon-expires" v-model="form.expiresAt" type="date" class="adm-input" />
          </div>
        </div>

        <div class="rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-600">
          <Icon name="mdi:information-outline" class="text-base text-stone-400 align-[-3px] me-1" />
          {{ summary }}
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="adm-btn adm-btn-secondary" @click="isDrawerOpen = false">{{ $t('admin.common.cancel') }}</button>
          <button type="submit" form="coupon-form" class="adm-btn adm-btn-primary" :disabled="isSaving">
            {{ isSaving ? $t('admin.common.saving') : editing ? $t('admin.common.save') : $t('admin.coupons.create') }}
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
  adminPermission: 'coupons'
})
const { t, tc, isAr } = useLang()
useSeoMeta({ title: () => t('admin.coupons.metaTitle'), robots: 'noindex' })
const currency = computed(() => (isAr.value ? 'ج.م' : 'EGP'))

const toast = useToastStore()
const settings = useStoreSettings()
const { confirm } = useAdminConfirm()
const { data, pending, error, refresh } = await useFetch('/api/admin/coupons')
const coupons = computed(() => data.value?.coupons ?? [])

const discountTypes = computed(() => [
  { value: 'percentage', label: t('admin.coupons.percentage') },
  { value: 'fixed', label: t('admin.coupons.fixed') },
])

function offLabel(type, value) {
  return type === 'percentage'
    ? t('admin.coupons.percentOff', { value })
    : t('admin.coupons.amountOff', { amount: formatMoney(value) })
}

const emptyForm = () => ({ code: '', discountType: 'percentage', discountValue: null, minOrderTotal: null, usageLimit: null, expiresAt: '' })
const form = ref(emptyForm())
const editing = ref(null)
const isDrawerOpen = ref(false)
const isSaving = ref(false)
const busyIds = reactive(new Set())

const summary = computed(() => {
  const f = form.value
  if (!f.discountValue) return t('admin.coupons.summaryEmpty')
  const code = f.code ? f.code.toUpperCase() : t('admin.coupons.summary.thisCode')
  const parts = [t('admin.coupons.summary.gives', { code, off: offLabel(f.discountType, f.discountValue) })]
  if (f.minOrderTotal) parts.push(t('admin.coupons.summary.min', { amount: formatMoney(f.minOrderTotal) }))
  if (f.usageLimit) parts.push(tc('admin.coupons.summary.uses', f.usageLimit))
  if (f.expiresAt) parts.push(t('admin.coupons.summary.until', { date: formatDate(f.expiresAt) }))
  return `${parts.join(' ')}.`
})

function isExpired(coupon) {
  return coupon.expires_at && new Date(coupon.expires_at) < new Date()
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  isDrawerOpen.value = true
}

function openEdit(coupon) {
  editing.value = coupon
  form.value = {
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    minOrderTotal: coupon.min_order_total || null,
    usageLimit: coupon.usage_limit,
    expiresAt: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
  }
  isDrawerOpen.value = true
}

async function handleSave() {
  isSaving.value = true
  try {
    if (editing.value) {
      const { code, ...changes } = form.value
      await $fetch(`/api/admin/coupons/${editing.value.id}`, { method: 'PATCH', body: changes })
      toast.show(t('admin.coupons.updated', { code: editing.value.code }))
    } else {
      await $fetch('/api/admin/coupons', { method: 'POST', body: form.value })
      toast.show(t('admin.coupons.created', { code: form.value.code.toUpperCase() }))
    }
    isDrawerOpen.value = false
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}

async function toggleActive(coupon, active) {
  busyIds.add(coupon.id)
  try {
    await $fetch(`/api/admin/coupons/${coupon.id}`, { method: 'PATCH', body: { active } })
    toast.show(t(active ? 'admin.coupons.turnedOn' : 'admin.coupons.turnedOff', { code: coupon.code }))
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    busyIds.delete(coupon.id)
  }
}

async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code)
    toast.show(t('admin.common.copied', { text: code }))
  } catch {
    toast.error(t('admin.common.copyFailed'))
  }
}

async function handleDelete(coupon) {
  const ok = await confirm({
    title: t('admin.coupons.deleteTitle', { code: coupon.code }),
    message: t('admin.coupons.deleteText'),
    confirmLabel: t('admin.common.delete'),
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
    toast.show(t('admin.coupons.deleted', { code: coupon.code }))
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}
</script>
