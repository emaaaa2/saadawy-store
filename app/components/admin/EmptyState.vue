<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-14">
    <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
      <Icon :name="icon" class="text-2xl" />
    </div>
    <p class="text-sm font-semibold text-stone-800">{{ title }}</p>
    <p v-if="description" class="text-sm text-stone-500 mt-1 max-w-sm">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'mdi:tray' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
