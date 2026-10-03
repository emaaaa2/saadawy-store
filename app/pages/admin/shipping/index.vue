<template>
  <div>
    <AdminPageHeader title="Shipping" description="Delivery fees by governorate group, and when shipping becomes free.">
      <button type="submit" form="shipping-form" class="adm-btn adm-btn-primary" :disabled="isSaving || !isDirty">
        <Icon :name="isSaving ? 'mdi:loading' : 'mdi:content-save-outline'" class="text-base" :class="{ 'animate-spin': isSaving }" />
        {{ isSaving ? 'Saving…' : 'Save changes' }}
      </button>
    </AdminPageHeader>

    <form id="shipping-form" class="grid lg:grid-cols-3 gap-6 items-start" @submit.prevent="handleSave">
      <section class="adm-card lg:col-span-2 overflow-hidden">
        <div class="adm-card-header">
          <h2 class="adm-card-title">Delivery fees</h2>
        </div>
        <div class="divide-y divide-stone-200">
          <div v-for="tier in tiers" :key="tier.field" class="p-5 grid sm:grid-cols-[1fr_180px] gap-4 items-start">
            <div>
              <label :for="tier.field" class="text-sm font-medium text-stone-800">{{ tier.title }}</label>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span v-for="name in tier.governorates" :key="name" class="adm-badge bg-stone-100 text-stone-600">{{ name }}</span>
              </div>
            </div>
            <div class="relative">
              <input :id="tier.field" v-model.number="form[tier.field]" type="number" min="0" step="0.01" required class="adm-input pr-12 text-right" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">EGP</span>
            </div>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <h2 class="adm-card-title">Free shipping</h2>
        </div>
        <div class="p-5">
          <label for="free_shipping_threshold" class="adm-label">Free on orders over</label>
          <div class="relative">
            <input id="free_shipping_threshold" v-model.number="form.free_shipping_threshold" type="number" min="0" step="0.01" required class="adm-input pr-12" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">EGP</span>
          </div>
          <p class="adm-hint">Counted after any coupon discount. Set a very high number to turn free shipping off.</p>

          <div class="mt-5 rounded-lg bg-stone-50 border border-stone-200 p-4 text-sm space-y-1.5">
            <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Example</p>
            <p class="flex justify-between gap-3"><span class="text-stone-500">Cairo, {{ formatMoney(sample) }} order</span><span class="font-medium whitespace-nowrap">{{ feeFor(1, sample) }}</span></p>
            <p class="flex justify-between gap-3"><span class="text-stone-500">Aswan, {{ formatMoney(sample) }} order</span><span class="font-medium whitespace-nowrap">{{ feeFor(3, sample) }}</span></p>
            <p class="flex justify-between gap-3"><span class="text-stone-500">Any, {{ formatMoney(form.free_shipping_threshold || 0) }} order</span><span class="font-medium text-emerald-700">Free</span></p>
          </div>
        </div>
      </section>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'shipping',
})
useSeoMeta({ title: 'Shipping', robots: 'noindex' })

const toast = useToastStore()
const { data } = await useFetch('/api/admin/shipping-settings')

const toForm = (value) => ({
  tier1_fee: value?.tier1_fee ?? DEFAULT_SHIPPING_SETTINGS.tier1_fee,
  tier2_fee: value?.tier2_fee ?? DEFAULT_SHIPPING_SETTINGS.tier2_fee,
  tier3_fee: value?.tier3_fee ?? DEFAULT_SHIPPING_SETTINGS.tier3_fee,
  free_shipping_threshold: value?.free_shipping_threshold ?? DEFAULT_SHIPPING_SETTINGS.free_shipping_threshold,
})

const form = ref(toForm(data.value))
const saved = ref(JSON.stringify(form.value))
const isDirty = computed(() => JSON.stringify(form.value) !== saved.value)
const isSaving = ref(false)

const namesForTier = (tier) =>
  governorates.filter((g) => (GOVERNORATE_TIERS[g.value] ?? 3) === tier).map((g) => g.label)

const tiers = [
  { field: 'tier1_fee', title: 'Greater Cairo', governorates: namesForTier(1) },
  { field: 'tier2_fee', title: 'Alexandria, Delta & Canal', governorates: namesForTier(2) },
  { field: 'tier3_fee', title: 'Upper Egypt, Sinai & remote areas', governorates: namesForTier(3) },
]

const sample = computed(() => Math.max(Math.round((form.value.free_shipping_threshold || 0) / 2), 100))

function feeFor(tier, subtotal) {
  if (subtotal >= form.value.free_shipping_threshold) return 'Free'
  return formatMoney(form.value[`tier${tier}_fee`])
}

async function handleSave() {
  isSaving.value = true
  try {
    await $fetch('/api/admin/shipping-settings', { method: 'PATCH', body: form.value })
    saved.value = JSON.stringify(form.value)
    toast.show('Shipping fees saved')
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}
</script>
