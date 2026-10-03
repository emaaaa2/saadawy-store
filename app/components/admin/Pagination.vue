<template>
  <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-stone-200 text-sm">
    <p class="text-stone-500">
      <template v-if="total">
        Showing <span class="font-medium text-stone-800">{{ from }}–{{ to }}</span> of
        <span class="font-medium text-stone-800">{{ total.toLocaleString('en-US') }}</span>
      </template>
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="adm-btn adm-btn-secondary adm-btn-sm"
        :disabled="modelValue <= 1"
        @click="$emit('update:modelValue', modelValue - 1)"
      >
        <Icon name="mdi:chevron-left" class="text-base" />
        Previous
      </button>
      <span class="text-stone-500 px-1">{{ modelValue }} / {{ Math.max(totalPages, 1) }}</span>
      <button
        type="button"
        class="adm-btn adm-btn-secondary adm-btn-sm"
        :disabled="modelValue >= totalPages"
        @click="$emit('update:modelValue', modelValue + 1)"
      >
        Next
        <Icon name="mdi:chevron-right" class="text-base" />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 50 },
})
defineEmits(['update:modelValue'])

const from = computed(() => (props.modelValue - 1) * props.pageSize + 1)
const to = computed(() => Math.min(props.modelValue * props.pageSize, props.total))
</script>
