<template>
  <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-stone-200 text-sm">
    <p class="text-stone-500">
      <template v-if="total">
        {{ $t('admin.common.showing', { from, to, total: total.toLocaleString('en-US') }) }}
      </template>
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="adm-btn adm-btn-secondary adm-btn-sm"
        :disabled="modelValue <= 1"
        @click="$emit('update:modelValue', modelValue - 1)"
      >
        <Icon name="mdi:chevron-left" class="text-base rtl:-scale-x-100" />
        {{ $t('admin.common.previous') }}
      </button>
      <span class="text-stone-500 px-1">{{ modelValue }} / {{ Math.max(totalPages, 1) }}</span>
      <button
        type="button"
        class="adm-btn adm-btn-secondary adm-btn-sm"
        :disabled="modelValue >= totalPages"
        @click="$emit('update:modelValue', modelValue + 1)"
      >
        {{ $t('admin.common.next') }}
        <Icon name="mdi:chevron-right" class="text-base rtl:-scale-x-100" />
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
