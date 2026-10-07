<template>
  <div class="pb-24">
    <AdminPageHeader :title="$t('admin.settings.metaTitle')" :description="$t('admin.settings.description')">
      <span v-if="updatedAt" class="text-xs text-stone-500">{{ $t('admin.settings.lastSaved', { time: timeAgo(updatedAt) }) }}</span>
    </AdminPageHeader>

    <div v-if="!isSetUp" class="adm-card border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 p-4 mb-6 flex gap-3 text-sm">
      <Icon name="mdi:database-alert-outline" class="text-xl text-amber-600 dark:text-amber-400 shrink-0" />
      <div>
        <p class="font-medium text-stone-800">{{ $t('admin.settings.setupTitle') }}</p>
        <p class="text-stone-600 mt-0.5">
          {{ setupParts[0] }}<code dir="ltr" class="font-mono text-xs bg-surface border border-amber-200 dark:border-amber-500/30 rounded px-1">supabase_add_store_settings.sql</code>{{ setupParts[1] }}
        </p>
      </div>
    </div>

    <form id="settings-form" class="space-y-6 max-w-3xl" @submit.prevent="handleSave">
      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">{{ $t('admin.settings.whatsapp') }}</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.settings.whatsappHint') }}</p>
          </div>
          <Icon name="mdi:whatsapp" class="text-2xl text-[#25D366]" />
        </div>
        <div class="p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label for="whatsapp-orders" class="adm-label">{{ $t('admin.settings.ordersNumber') }}</label>
            <input id="whatsapp-orders" v-model="form.whatsappOrders" type="tel" dir="ltr" required class="adm-input rtl:text-right" />
            <p class="adm-hint">{{ $t('admin.settings.ordersNumberHint') }}</p>
          </div>
          <div>
            <label for="whatsapp-support" class="adm-label">{{ $t('admin.settings.supportNumber') }}</label>
            <input id="whatsapp-support" v-model="form.whatsappSupport" type="tel" dir="ltr" required class="adm-input rtl:text-right" />
            <p class="adm-hint">{{ $t('admin.settings.supportNumberHint') }}</p>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <h2 class="adm-card-title">{{ $t('admin.settings.paymentMethods') }}</h2>
        </div>
        <div class="divide-y divide-stone-200">
          <div v-for="method in PAYMENT_METHODS" :key="method.value" class="flex items-center gap-4 px-5 py-3.5">
            <Icon :name="method.icon" class="text-xl text-stone-400" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-800">{{ $t(`admin.settings.methodNames.${method.value}`) }}</p>
              <p class="text-xs text-stone-500">{{ $t(`admin.settings.methodHints.${method.value}`) }}</p>
            </div>
            <AdminToggle
              v-model="form.paymentMethods[method.value]"
              :aria-label="$t('admin.settings.offer', { method: $t(`admin.settings.methodNames.${method.value}`) })"
            />
          </div>
        </div>

        <div v-if="form.paymentMethods.bank_transfer" class="border-t border-stone-200 bg-stone-50/60 p-5">
          <p class="text-sm font-medium text-stone-800 mb-1">{{ $t('admin.settings.transferDetails') }}</p>
          <p class="text-xs text-stone-500 mb-4">{{ $t('admin.settings.transferHint') }}</p>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label for="vodafone-cash" class="adm-label">{{ $t('admin.settings.vodafoneCash') }}</label>
              <input id="vodafone-cash" v-model="form.vodafoneCash" type="tel" dir="ltr" class="adm-input rtl:text-right" />
            </div>
            <div>
              <label for="instapay" class="adm-label">{{ $t('admin.settings.instapay') }}</label>
              <input id="instapay" v-model="form.instapay" type="text" dir="ltr" placeholder="name@instapay" class="adm-input rtl:text-right" />
            </div>
            <div>
              <label for="bank-name" class="adm-label">{{ $t('admin.settings.bankName') }}</label>
              <input id="bank-name" v-model="form.bankName" type="text" dir="auto" :placeholder="$t('admin.settings.bankNamePlaceholder')" class="adm-input" />
            </div>
            <div>
              <label for="bank-account-name" class="adm-label">{{ $t('admin.settings.accountName') }}</label>
              <input id="bank-account-name" v-model="form.bankAccountName" type="text" dir="auto" class="adm-input" />
            </div>
            <div class="sm:col-span-2">
              <label for="bank-account-number" class="adm-label">{{ $t('admin.settings.accountNumber') }}</label>
              <input id="bank-account-number" v-model="form.bankAccountNumber" type="text" dir="ltr" class="adm-input font-mono rtl:text-right" />
            </div>
          </div>
          <p v-if="!hasTransferDetails" class="adm-hint text-amber-700 dark:text-amber-400 mt-3">
            {{ $t('admin.settings.noTransferDetails') }}
          </p>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">{{ $t('admin.settings.delivery') }}</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.settings.deliveryHint') }}</p>
          </div>
        </div>
        <div class="p-5">
          <span class="adm-label">{{ $t('admin.settings.deliveryTime') }}</span>
          <div class="grid sm:grid-cols-2 gap-3">
            <div v-for="l in langOrder" :key="l">
              <label :for="`delivery-time-${l}`" class="lang-label">{{ langName(l) }}</label>
              <input
                :id="`delivery-time-${l}`"
                v-model="form[BILINGUAL_SETTINGS.deliveryTime[l]]"
                type="text"
                maxlength="60"
                :dir="l === 'ar' ? 'rtl' : 'ltr'"
                :placeholder="l === 'ar' ? $t('admin.settings.deliveryPlaceholderAr') : $t('admin.settings.deliveryPlaceholderEn')"
                class="adm-input"
              />
            </div>
          </div>
          <p class="adm-hint">{{ $t('admin.settings.leaveEmptyToHide') }} {{ $t('admin.settings.bothLanguagesHint') }}</p>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">{{ $t('admin.settings.location') }}</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.settings.bothLanguagesHint') }}</p>
          </div>
        </div>
        <div class="p-5 space-y-5">
          <div>
            <span class="adm-label">{{ $t('admin.settings.address') }}</span>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="l in langOrder" :key="l">
                <label :for="`store-address-${l}`" class="lang-label">{{ langName(l) }}</label>
                <textarea
                  :id="`store-address-${l}`"
                  v-model="form[BILINGUAL_SETTINGS.address[l]]"
                  rows="3"
                  maxlength="300"
                  :dir="l === 'ar' ? 'rtl' : 'ltr'"
                  class="adm-input"
                ></textarea>
              </div>
            </div>
          </div>
          <div>
            <span class="adm-label">{{ $t('admin.settings.openingHours') }}</span>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="l in langOrder" :key="l">
                <label :for="`opening-hours-${l}`" class="lang-label">{{ langName(l) }}</label>
                <input
                  :id="`opening-hours-${l}`"
                  v-model="form[BILINGUAL_SETTINGS.openingHours[l]]"
                  type="text"
                  maxlength="120"
                  :dir="l === 'ar' ? 'rtl' : 'ltr'"
                  class="adm-input"
                />
              </div>
            </div>
          </div>
          <div>
            <label for="map-url" class="adm-label">{{ $t('admin.settings.mapLink') }}</label>
            <input id="map-url" v-model="form.mapUrl" type="url" dir="ltr" placeholder="https://maps.app.goo.gl/…" class="adm-input rtl:text-right" />
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">{{ $t('admin.settings.social') }}</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.settings.socialHint') }}</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div v-for="social in socials" :key="social.field" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Icon :name="social.icon" class="text-xl text-stone-500" />
            </div>
            <div class="flex-1">
              <label :for="social.field" class="sr-only">{{ social.label }}</label>
              <input
                :id="social.field"
                v-model="form[social.field]"
                type="url"
                dir="ltr"
                :placeholder="$t('admin.settings.socialLink', { name: social.label })"
                class="adm-input rtl:text-right"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">{{ $t('admin.settings.welcome') }}</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.settings.welcomeHint') }}</p>
          </div>
          <AdminToggle v-model="form.welcomePopupEnabled" :aria-label="$t('admin.settings.showWelcome')" />
        </div>
        <div v-if="form.welcomePopupEnabled" class="p-5 space-y-5">
          <div>
            <label for="welcome-code" class="adm-label">{{ $t('admin.settings.couponCode') }}</label>
            <input id="welcome-code" v-model="form.welcomeCouponCode" type="text" dir="ltr" required class="adm-input font-mono uppercase sm:max-w-xs rtl:text-right" />
            <p class="adm-hint">
              {{ $t('admin.settings.couponHintBefore') }}
              <NuxtLink v-if="can('coupons')" to="/admin/coupons" class="text-ink hover:underline">{{ $t('admin.sections.coupons') }}</NuxtLink>
              <span v-else>{{ $t('admin.sections.coupons') }}</span>.
            </p>
          </div>
          <div>
            <span class="adm-label">{{ $t('admin.settings.message') }}</span>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="l in langOrder" :key="l">
                <label :for="`welcome-message-${l}`" class="lang-label">{{ langName(l) }}</label>
                <textarea
                  :id="`welcome-message-${l}`"
                  v-model="form[BILINGUAL_SETTINGS.welcomeMessage[l]]"
                  rows="3"
                  maxlength="300"
                  :dir="l === 'ar' ? 'rtl' : 'ltr'"
                  class="adm-input"
                ></textarea>
              </div>
            </div>
            <p class="adm-hint">{{ $t('admin.settings.bothLanguagesHint') }}</p>
          </div>
        </div>
      </section>
    </form>

    <Transition name="adm-bar">
      <div v-if="isDirty" class="fixed bottom-0 inset-x-0 lg:start-64 z-30 bg-surface border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Icon name="mdi:circle-edit-outline" class="text-lg text-amber-600 dark:text-amber-400" />
          <p class="text-sm text-stone-700 me-auto">{{ $t('admin.settings.unsaved') }}</p>
          <button type="button" class="adm-btn adm-btn-secondary" :disabled="isSaving" @click="discard">{{ $t('admin.settings.discard') }}</button>
          <button type="submit" form="settings-form" class="adm-btn adm-btn-primary" :disabled="isSaving">
            {{ isSaving ? $t('admin.common.saving') : $t('admin.common.save') }}
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
const { t, isAr } = useLang()
useSeoMeta({ title: () => t('admin.settings.metaTitle'), robots: 'noindex' })

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

// The dashboard's own language comes first in the side-by-side inputs.
const langOrder = computed(() => (isAr.value ? ['ar', 'en'] : ['en', 'ar']))
const langName = (l) => (l === 'ar' ? t('admin.settings.inArabic') : t('admin.settings.inEnglish'))
const setupParts = computed(() => t('admin.settings.setupText', { file: '\u0000' }).split('\u0000'))

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
    toast.error(t('admin.settings.keepOnePayment'))
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
    toast.show(t('admin.settings.saved'))
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
    title: t('admin.common.unsavedTitle'),
    message: t('admin.settings.leaveText'),
    confirmLabel: t('admin.common.leave'),
    danger: true,
  })
})
</script>

<style scoped>
.lang-label {
  @apply block text-[11px] font-medium text-stone-400 mb-1;
}
.adm-bar-enter-active,
.adm-bar-leave-active {
  transition: transform 0.2s ease;
}
.adm-bar-enter-from,
.adm-bar-leave-to {
  transform: translateY(100%);
}
</style>
