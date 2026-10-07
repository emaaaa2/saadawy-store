<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-phi-4 text-center">
      <div class="w-24 h-24 rounded-full bg-ink/5 flex items-center justify-center mb-6">
        <Icon
          :name="is404 ? 'mdi:map-marker-question-outline' : 'mdi:alert-circle-outline'"
          class="text-5xl text-ink/40"
        />
      </div>

      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        {{ is404 ? '404' : $t('common.errorPage.code', { code: error?.statusCode ?? '' }) }}
      </p>
      <h1 class="text-phi-h1 font-bold text-ink mb-3">
        {{ is404 ? $t('common.errorPage.notFound') : $t('common.errorPage.failed') }}
      </h1>
      <p class="text-taupe max-w-md mb-8">
        {{ is404 ? $t('common.errorPage.notFoundText') : $t('common.errorPage.failedText') }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          class="bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition"
          @click="handleError"
        >
          {{ $t('common.backHome') }}
        </button>
        <NuxtLink
          to="/category/skincare"
          class="border border-ink/20 text-ink px-6 py-3 rounded-full font-semibold hover:bg-ink/5 transition"
        >
          {{ $t('checkout.continueShopping') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const { t } = useLang()
const is404 = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => (is404.value ? t('common.errorPage.notFound') : t('common.errorPage.failed')),
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>
