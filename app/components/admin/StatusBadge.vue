<template>
  <span class="adm-badge" :class="meta.badge">
    <span class="w-1.5 h-1.5 rounded-full" :class="meta.dot"></span>
    {{ meta.label }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: { type: String, required: true },
})

const meta = computed(() => ORDER_STATUS_META[props.status] ?? { label: props.status, badge: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' })
</script>
