<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-phi-3">
    <button
      :disabled="modelValue <= 1"
      class="px-4 py-2 rounded-full text-sm border border-ink/20 disabled:opacity-30 hover:bg-ink/5 transition"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      {{ $t('common.previous') }}
    </button>
    <span class="text-sm text-ink/70">{{ $t('common.page', { page: modelValue, total: totalPages }) }}</span>
    <button
      :disabled="modelValue >= totalPages"
      class="px-4 py-2 rounded-full text-sm border border-ink/20 disabled:opacity-30 hover:bg-ink/5 transition"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      {{ $t('common.next') }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, default: 1 },
})
defineEmits(['update:modelValue'])
</script>
