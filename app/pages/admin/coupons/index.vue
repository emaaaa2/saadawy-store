<template>
  <div>
    <AdminPageHeader title="Coupons" description="Discount codes customers can use at checkout.">
      <button type="button" class="adm-btn adm-btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="text-base" />
        New coupon
      </button>
    </AdminPageHeader>

    <section class="adm-card overflow-hidden">
      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" title="Couldn't load coupons" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">Try again</button>
      </AdminEmptyState>

      <AdminEmptyState
        v-else-if="!pending && coupons.length === 0"
        icon="mdi:ticket-percent-outline"
        title="No coupons yet"
        description="Create a code like WELCOME10 to give customers a discount."
      >
        <button type="button" class="adm-btn adm-btn-primary" @click="openCreate">New coupon</button>
      </AdminEmptyState>

      <div v-else class="overflow-x-auto">
        <table class="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Minimum order</th>
              <th>Used</th>
              <th>Expires</th>
              <th>Active</th>
              <th class="w-24"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-stone-50">
              <td>
                <button type="button" class="group inline-flex items-center gap-1.5 font-mono font-semibold" title="Copy code" @click="copyCode(coupon.code)">
                  {{ coupon.code }}
                  <Icon name="mdi:content-copy" class="text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
                <p v-if="coupon.code === settings.welcomeCouponCode" class="text-[11px] text-gold mt-0.5">Welcome popup code</p>
              </td>
              <td class="font-medium">
                {{ coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `${formatMoney(coupon.discount_value)} off` }}
              </td>
              <td class="text-stone-600">{{ coupon.min_order_total ? formatMoney(coupon.min_order_total) : '—' }}</td>
              <td>
                <p class="text-stone-700">{{ coupon.used_count }}{{ coupon.usage_limit ? ` / ${coupon.usage_limit}` : '' }}</p>
                <div v-if="coupon.usage_limit" class="w-20 h-1 bg-stone-100 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-olive rounded-full" :style="{ width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` }"></div>
                </div>
              </td>
              <td>
                <span v-if="!coupon.expires_at" class="text-stone-400">Never</span>
                <span v-else-if="isExpired(coupon)" class="adm-badge bg-red-50 text-red-600">Expired {{ formatDate(coupon.expires_at) }}</span>
                <span v-else class="text-stone-600">{{ formatDate(coupon.expires_at) }}</span>
              </td>
              <td>
                <AdminToggle
                  :model-value="coupon.active"
                  :disabled="busyIds.has(coupon.id)"
                  :aria-label="`Coupon ${coupon.code} active`"
                  @update:model-value="toggleActive(coupon, $event)"
                />
              </td>
              <td>
                <div class="flex items-center justify-end gap-0.5">
                  <button type="button" class="adm-icon-btn" title="Edit" aria-label="Edit coupon" @click="openEdit(coupon)">
                    <Icon name="mdi:pencil-outline" class="text-lg" />
                  </button>
                  <button type="button" class="adm-icon-btn hover:!text-red-600 hover:!bg-red-50" title="Delete" aria-label="Delete coupon" @click="handleDelete(coupon)">
                    <Icon name="mdi:trash-can-outline" class="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminDrawer v-model:open="isDrawerOpen" :title="editing ? `Edit ${editing.code}` : 'New coupon'">
      <form id="coupon-form" class="space-y-5" @submit.prevent="handleSave">
        <div>
          <label for="coupon-code" class="adm-label">Code</label>
          <input
            id="coupon-code"
            v-model="form.code"
            type="text"
            required
            :disabled="!!editing"
            placeholder="WELCOME10"
            pattern="[A-Za-z0-9_\-]{3,30}"
            class="adm-input font-mono uppercase"
          />
          <p class="adm-hint">{{ editing ? "The code can't be changed. Create a new coupon instead." : '3–30 letters or numbers, no spaces.' }}</p>
        </div>

        <div>
          <span class="adm-label">Discount</span>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <button
              v-for="type in discountTypes"
              :key="type.value"
              type="button"
              class="h-10 rounded-lg border text-sm font-medium transition"
              :class="form.discountType === type.value ? 'border-olive bg-olive/5 text-olive' : 'border-stone-200 text-stone-600 hover:border-stone-300'"
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
              class="adm-input pr-12"
              :aria-label="form.discountType === 'percentage' ? 'Discount percent' : 'Discount amount'"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ form.discountType === 'percentage' ? '%' : 'EGP' }}</span>
          </div>
        </div>

        <div>
          <label for="coupon-min" class="adm-label">Minimum order <span class="text-stone-400 font-normal">(optional)</span></label>
          <div class="relative">
            <input id="coupon-min" v-model.number="form.minOrderTotal" type="number" min="0" step="0.01" placeholder="0" class="adm-input pr-12" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">EGP</span>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label for="coupon-limit" class="adm-label">Usage limit <span class="text-stone-400 font-normal">(optional)</span></label>
            <input id="coupon-limit" v-model.number="form.usageLimit" type="number" min="1" step="1" placeholder="Unlimited" class="adm-input" />
          </div>
          <div>
            <label for="coupon-expires" class="adm-label">Expires on <span class="text-stone-400 font-normal">(optional)</span></label>
            <input id="coupon-expires" v-model="form.expiresAt" type="date" class="adm-input" />
          </div>
        </div>

        <div class="rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-600">
          <Icon name="mdi:information-outline" class="text-base text-stone-400 align-[-3px] mr-1" />
          {{ summary }}
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="adm-btn adm-btn-secondary" @click="isDrawerOpen = false">Cancel</button>
          <button type="submit" form="coupon-form" class="adm-btn adm-btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create coupon' }}
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
useSeoMeta({ title: 'Coupons', robots: 'noindex' })

const toast = useToastStore()
const settings = useStoreSettings()
const { confirm } = useAdminConfirm()
const { data, pending, error, refresh } = await useFetch('/api/admin/coupons')
const coupons = computed(() => data.value?.coupons ?? [])

const discountTypes = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed amount' },
]

const emptyForm = () => ({ code: '', discountType: 'percentage', discountValue: null, minOrderTotal: null, usageLimit: null, expiresAt: '' })
const form = ref(emptyForm())
const editing = ref(null)
const isDrawerOpen = ref(false)
const isSaving = ref(false)
const busyIds = reactive(new Set())

const summary = computed(() => {
  const f = form.value
  if (!f.discountValue) return 'Enter a discount to see how it works.'
  const off = f.discountType === 'percentage' ? `${f.discountValue}% off` : `${formatMoney(f.discountValue)} off`
  const parts = [`${(f.code || 'This code').toUpperCase()} gives ${off}`]
  if (f.minOrderTotal) parts.push(`on orders of ${formatMoney(f.minOrderTotal)} or more`)
  if (f.usageLimit) parts.push(`for the first ${f.usageLimit} use${f.usageLimit === 1 ? '' : 's'}`)
  if (f.expiresAt) parts.push(`until ${formatDate(f.expiresAt)}`)
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
      toast.show(`${editing.value.code} updated`)
    } else {
      await $fetch('/api/admin/coupons', { method: 'POST', body: form.value })
      toast.show(`Coupon ${form.value.code.toUpperCase()} created`)
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
    toast.show(`${coupon.code} ${active ? 'turned on' : 'turned off'}`)
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
    toast.show(`${code} copied`)
  } catch {
    toast.error("Couldn't copy the code")
  }
}

async function handleDelete(coupon) {
  const ok = await confirm({
    title: `Delete coupon ${coupon.code}?`,
    message: 'Customers will no longer be able to use it. To pause it instead, switch it off.',
    confirmLabel: 'Delete',
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
    toast.show(`${coupon.code} deleted`)
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}
</script>
