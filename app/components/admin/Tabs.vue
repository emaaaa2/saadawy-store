<template>
  <div class="flex gap-1 overflow-x-auto scrollbar-hide border-b border-stone-200">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition"
      :class="modelValue === tab.value ? 'text-stone-800' : 'text-stone-500 hover:text-stone-800'"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <span
        v-if="tab.count !== undefined"
        class="text-xs rounded-full px-1.5 min-w-[1.25rem] text-center"
        :class="modelValue === tab.value ? 'bg-olive text-white' : 'bg-stone-100 text-stone-500'"
      >
        {{ tab.count }}
      </span>
      <span
        v-if="modelValue === tab.value"
        class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-olive"
      ></span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true },
})
defineEmits(['update:modelValue'])
</script>
