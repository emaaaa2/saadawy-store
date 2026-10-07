<template>
  <div class="min-h-[60vh] flex items-center justify-center px-6">
    <div v-if="errorMessage" class="text-center max-w-sm">
      <Icon name="mdi:alert-circle-outline" class="text-4xl text-red-400 mb-3" />
      <p class="text-ink font-semibold mb-1">{{ $t('pages.confirm.failed') }}</p>
      <p class="text-sm text-taupe mb-5">{{ errorMessage }}</p>
      <NuxtLink
        :to="`/login?next=${encodeURIComponent(next)}`"
        class="inline-block bg-olive text-beige px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gold hover:text-olive transition"
      >
        {{ $t('pages.confirm.tryAgain') }}
      </NuxtLink>
    </div>

    <div v-else class="text-center">
      <Icon name="mdi:loading" class="text-3xl text-gold animate-spin mb-3" />
      <p class="text-sm text-taupe">{{ $t('pages.confirm.signingIn') }}</p>
    </div>
  </div>
</template>

<script setup>
const { t } = useLang()
useSeoMeta({ title: () => t('pages.confirm.metaTitle'), robots: 'noindex' })

const route = useRoute()
const user = useSupabaseUser()
const next = safeRedirectPath(route.query.next)
const errorMessage = ref(
  typeof route.query.error_description === 'string' ? route.query.error_description : ''
)

watch(
  user,
  (value) => {
    if (value && !errorMessage.value) navigateTo(next, { replace: true })
  },
  { immediate: true }
)

let timeoutId = null
onMounted(() => {
  if (errorMessage.value) return
  timeoutId = setTimeout(() => {
    if (!user.value) errorMessage.value = t('pages.confirm.timeout')
  }, 8000)
})
onUnmounted(() => clearTimeout(timeoutId))
</script>
