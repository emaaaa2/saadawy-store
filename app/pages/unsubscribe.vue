<template>
  <div class="min-h-[60vh] flex items-center justify-center px-6 py-12">
    <div class="text-center max-w-md">
      <template v-if="done">
        <Icon name="mdi:email-check-outline" class="text-5xl text-sage mb-3" />
        <h1 class="text-xl font-bold text-ink mb-2">{{ $t('pages.unsubscribe.doneTitle') }}</h1>
        <p class="text-sm text-taupe mb-6">{{ $t('pages.unsubscribe.doneText') }}</p>
      </template>

      <template v-else-if="!linkLooksValid">
        <Icon name="mdi:link-variant-off" class="text-5xl text-red-400 mb-3" />
        <h1 class="text-xl font-bold text-ink mb-2">{{ $t('pages.unsubscribe.invalidTitle') }}</h1>
        <p class="text-sm text-taupe mb-6">{{ $t('pages.unsubscribe.invalidText') }}</p>
      </template>

      <template v-else>
        <Icon name="mdi:email-remove-outline" class="text-5xl text-gold mb-3" />
        <h1 class="text-xl font-bold text-ink mb-2">{{ $t('pages.unsubscribe.title') }}</h1>
        <p class="text-sm text-taupe mb-6">
          {{ $t('pages.unsubscribe.text') }}
          <span dir="ltr" class="block font-semibold text-ink mt-1">{{ email }}</span>
        </p>
        <button
          type="button"
          class="bg-olive text-beige px-7 py-2.5 rounded-full text-sm font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-60"
          :disabled="busy"
          @click="unsubscribe"
        >
          {{ busy ? $t('pages.unsubscribe.working') : $t('pages.unsubscribe.button') }}
        </button>
        <p v-if="errorText" class="text-sm text-red-500 mt-4">{{ errorText }}</p>
      </template>

      <NuxtLink to="/" class="block mt-6 text-sm text-taupe underline hover:text-gold">{{ $t('pages.unsubscribe.backHome') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { t } = useLang()
useSeoMeta({ title: () => t('pages.unsubscribe.metaTitle'), robots: 'noindex' })

const route = useRoute()
const email = computed(() => (typeof route.query.e === 'string' ? route.query.e : ''))
const signature = computed(() => (typeof route.query.s === 'string' ? route.query.s : ''))
const linkLooksValid = computed(() => email.value.includes('@') && /^[0-9a-f]{32}$/.test(signature.value))

const done = ref(false)
const busy = ref(false)
const errorText = ref('')

// Only on a click: email security scanners open links in emails, and must not unsubscribe anyone.
async function unsubscribe() {
  busy.value = true
  errorText.value = ''
  try {
    await $fetch('/api/newsletter/unsubscribe', { method: 'POST', body: { e: email.value, s: signature.value } })
    done.value = true
  } catch (error) {
    errorText.value = apiErrorMessage(error, t)
  } finally {
    busy.value = false
  }
}
</script>
