<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-phi-4 text-center">
      <div class="w-24 h-24 rounded-full bg-olive/5 flex items-center justify-center mb-6">
        <Icon
          :name="is404 ? 'mdi:map-marker-question-outline' : 'mdi:alert-circle-outline'"
          class="text-5xl text-olive/40"
        />
      </div>

      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        {{ is404 ? '404' : `Error ${error?.statusCode ?? ''}` }}
      </p>
      <h1 class="text-phi-h1 font-bold text-olive mb-3">
        {{ is404 ? 'Page Not Found' : 'Something Went Wrong' }}
      </h1>
      <p class="text-taupe max-w-md mb-8">
        {{
          is404
            ? "The page you're looking for doesn't exist or may have been moved."
            : "We hit a snag loading this page. Please try again in a moment."
        }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          class="bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition"
          @click="handleError"
        >
          Back to Homepage
        </button>
        <NuxtLink
          to="/category/skincare"
          class="border border-olive/20 text-olive px-6 py-3 rounded-full font-semibold hover:bg-olive/5 transition"
        >
          Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const is404 = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => (is404.value ? 'Page Not Found' : 'Error'),
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>
