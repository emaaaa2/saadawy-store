<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:opacity-50"
    :class="modelValue ? 'bg-olive' : 'bg-stone-300'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
      :class="modelValue ? 'translate-x-[18px]' : 'translate-x-0.5'"
    ></span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>
