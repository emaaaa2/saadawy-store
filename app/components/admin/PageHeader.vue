<template>
  <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
    <div class="flex items-start gap-3 min-w-0">
      <NuxtLink v-if="back" :to="back" class="adm-icon-btn mt-0.5 border border-stone-200 bg-white" aria-label="Back">
        <Icon name="mdi:arrow-left" class="text-lg" />
      </NuxtLink>
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-semibold text-stone-800 tracking-tight">{{ title }}</h1>
        <p v-if="description" class="text-sm text-stone-500 mt-1">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  back: { type: String, default: '' },
})
</script>
