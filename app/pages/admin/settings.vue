<template>
  <div class="pb-24">
    <AdminPageHeader title="Store settings" description="Contact numbers, payment details and links shown across the store.">
      <span v-if="updatedAt" class="text-xs text-stone-500">Last saved {{ timeAgo(updatedAt) }}</span>
    </AdminPageHeader>

    <div v-if="!isSetUp" class="adm-card border-amber-200 bg-amber-50/60 p-4 mb-6 flex gap-3 text-sm">
      <Icon name="mdi:database-alert-outline" class="text-xl text-amber-600 shrink-0" />
      <div>
        <p class="font-medium text-stone-800">One-time setup needed</p>
        <p class="text-stone-600 mt-0.5">
          Run <code class="font-mono text-xs bg-white border border-amber-200 rounded px-1">supabase_add_store_settings.sql</code>
          in Supabase → SQL Editor, then refresh this page. Until then the store uses the values below.
        </p>
      </div>
    </div>

    <form id="settings-form" class="space-y-6 max-w-3xl" @submit.prevent="handleSave">
      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">WhatsApp</h2>
            <p class="text-xs text-stone-500 mt-0.5">Egyptian numbers like 01012345678 work as they are.</p>
          </div>
          <Icon name="mdi:whatsapp" class="text-2xl text-[#25D366]" />
        </div>
        <div class="p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label for="whatsapp-orders" class="adm-label">Orders number</label>
            <input id="whatsapp-orders" v-model="form.whatsappOrders" type="tel" required class="adm-input" />
            <p class="adm-hint">Customers send their order here after checkout.</p>
          </div>
          <div>
            <label for="whatsapp-support" class="adm-label">Customer service number</label>
            <input id="whatsapp-support" v-model="form.whatsappSupport" type="tel" required class="adm-input" />
            <p class="adm-hint">The green chat button, footer and contact page.</p>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <h2 class="adm-card-title">Payment methods</h2>
        </div>
        <div class="divide-y divide-stone-200">
          <div v-for="method in PAYMENT_METHODS" :key="method.value" class="flex items-center gap-4 px-5 py-3.5">
            <Icon :name="method.icon" class="text-xl text-stone-400" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-800">{{ method.label }}</p>
              <p class="text-xs text-stone-500">{{ methodHints[method.value] }}</p>
            </div>
            <AdminToggle v-model="form.paymentMethods[method.value]" :aria-label="`Offer ${method.label}`" />
          </div>
        </div>

        <div v-if="form.paymentMethods.bank_transfer" class="border-t border-stone-200 bg-stone-50/60 p-5">
          <p class="text-sm font-medium text-stone-800 mb-1">Transfer details</p>
          <p class="text-xs text-stone-500 mb-4">Sent to the customer in the WhatsApp message when they choose bank transfer. Leave empty what you don't use.</p>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label for="vodafone-cash" class="adm-label">Vodafone Cash number</label>
              <input id="vodafone-cash" v-model="form.vodafoneCash" type="tel" class="adm-input" />
            </div>
            <div>
              <label for="instapay" class="adm-label">InstaPay address</label>
              <input id="instapay" v-model="form.instapay" type="text" placeholder="name@instapay" class="adm-input" />
            </div>
            <div>
              <label for="bank-name" class="adm-label">Bank name</label>
              <input id="bank-name" v-model="form.bankName" type="text" placeholder="e.g. CIB" class="adm-input" />
            </div>
            <div>
              <label for="bank-account-name" class="adm-label">Account holder name</label>
              <input id="bank-account-name" v-model="form.bankAccountName" type="text" class="adm-input" />
            </div>
            <div class="sm:col-span-2">
              <label for="bank-account-number" class="adm-label">Account number / IBAN</label>
              <input id="bank-account-number" v-model="form.bankAccountNumber" type="text" class="adm-input font-mono" />
            </div>
          </div>
          <p v-if="!hasTransferDetails" class="adm-hint text-amber-700 mt-3">
            Add at least one way to pay, or customers won't know where to send the money.
          </p>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">Delivery</h2>
            <p class="text-xs text-stone-500 mt-0.5">Shown under the Add to Cart button. Fees are set in Shipping.</p>
          </div>
        </div>
        <div class="p-5">
          <label for="delivery-time" class="adm-label">Delivery time</label>
          <input id="delivery-time" v-model="form.deliveryTime" type="text" maxlength="60" placeholder="e.g. 2–4 working days" class="adm-input sm:max-w-xs" />
          <p class="adm-hint">Leave empty to hide it.</p>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <h2 class="adm-card-title">Store location</h2>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label for="store-address" class="adm-label">Address</label>
            <textarea id="store-address" v-model="form.address" rows="2" dir="auto" class="adm-input"></textarea>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label for="opening-hours" class="adm-label">Opening hours</label>
              <input id="opening-hours" v-model="form.openingHours" type="text" class="adm-input" />
            </div>
            <div>
              <label for="map-url" class="adm-label">Google Maps link</label>
              <input id="map-url" v-model="form.mapUrl" type="url" placeholder="https://maps.app.goo.gl/…" class="adm-input" />
            </div>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">Social media</h2>
            <p class="text-xs text-stone-500 mt-0.5">Leave a link empty to hide that icon.</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div v-for="social in socials" :key="social.field" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Icon :name="social.icon" class="text-xl text-stone-500" />
            </div>
            <div class="flex-1">
              <label :for="social.field" class="sr-only">{{ social.label }}</label>
              <input :id="social.field" v-model="form[social.field]" type="url" :placeholder="`${social.label} link`" class="adm-input" />
            </div>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">Welcome popup</h2>
            <p class="text-xs text-stone-500 mt-0.5">Shown once to new visitors with a discount code.</p>
          </div>
          <AdminToggle v-model="form.welcomePopupEnabled" aria-label="Show welcome popup" />
        </div>
        <div v-if="form.welcomePopupEnabled" class="p-5 space-y-4">
          <div>
            <label for="welcome-code" class="adm-label">Coupon code</label>
            <input id="welcome-code" v-model="form.welcomeCouponCode" type="text" required class="adm-input font-mono uppercase sm:max-w-xs" />
            <p class="adm-hint">
              Make sure this code exists and is switched on in
              <NuxtLink v-if="can('coupons')" to="/admin/coupons" class="text-olive hover:underline">Coupons</NuxtLink>
              <span v-else>Coupons</span>.
            </p>
          </div>
          <div>
            <label for="welcome-message" class="adm-label">Message</label>
            <textarea id="welcome-message" v-model="form.welcomeMessage" rows="2" maxlength="300" class="adm-input"></textarea>
          </div>
        </div>
      </section>
    </form>

    <Transition name="adm-bar">
      <div v-if="isDirty" class="fixed bottom-0 inset-x-0 lg:left-64 z-30 bg-white border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Icon name="mdi:circle-edit-outline" class="text-lg text-amber-600" />
          <p class="text-sm text-stone-700 mr-auto">You have unsaved changes</p>
          <button type="button" class="adm-btn adm-btn-secondary" :disabled="isSaving" @click="discard">Discard</button>
          <button type="submit" form="settings-form" class="adm-btn adm-btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'settings'
})
useSeoMeta({ title: 'Store settings', robots: 'noindex' })

const toast = useToastStore()
const storeSettings = useStoreSettings()
const { can } = useAdminAccess()
const { confirm } = useAdminConfirm()
const { data } = await useFetch('/api/admin/store-settings')

const form = ref(structuredClone(toRaw(data.value?.settings ?? STORE_SETTINGS_DEFAULTS)))
const saved = ref(JSON.stringify(form.value))
const isSetUp = ref(data.value?.isSetUp ?? false)
const updatedAt = ref(data.value?.updatedAt ?? null)
const isSaving = ref(false)
const isDirty = computed(() => JSON.stringify(form.value) !== saved.value)

const methodHints = {
  cash_on_delivery: 'Customer pays the courier.',
  bank_transfer: 'Customer transfers, then sends the receipt on WhatsApp.',
  card: 'Online card payment through Paymob.',
}

const socials = [
  { field: 'facebookUrl', label: 'Facebook', icon: 'mdi:facebook' },
  { field: 'instagramUrl', label: 'Instagram', icon: 'mdi:instagram' },
  { field: 'tiktokUrl', label: 'TikTok', icon: 'mdi:music-note' },
]

const hasTransferDetails = computed(() =>
  ['vodafoneCash', 'instapay', 'bankAccountNumber'].some((field) => form.value[field]?.trim())
)

async function handleSave() {
  if (!Object.values(form.value.paymentMethods).some(Boolean)) {
    toast.error('Keep at least one payment method turned on')
    return
  }

  isSaving.value = true
  try {
    const result = await $fetch('/api/admin/store-settings', { method: 'PATCH', body: form.value })
    form.value = structuredClone(result.settings)
    saved.value = JSON.stringify(form.value)
    storeSettings.value = structuredClone(result.settings)
    isSetUp.value = true
    updatedAt.value = result.updatedAt
    toast.show('Settings saved — the store is updated')
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}

function discard() {
  form.value = JSON.parse(saved.value)
}

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
  return await confirm({
    title: 'Leave without saving?',
    message: 'Your changes to the store settings will be lost.',
    confirmLabel: 'Leave',
    danger: true,
  })
})
</script>

<style scoped>
.adm-bar-enter-active,
.adm-bar-leave-active {
  transition: transform 0.2s ease;
}
.adm-bar-enter-from,
.adm-bar-leave-to {
  transform: translateY(100%);
}
</style>
