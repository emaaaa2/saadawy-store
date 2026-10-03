<template>
  <div
    class="bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0"
    :title="showImage ? undefined : src ? 'Photo file is missing — upload a new one' : 'No photo yet'"
  >
    <img
      v-if="showImage"
      ref="img"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="failed = true"
    />
    <Icon v-else name="mdi:image-off-outline" class="text-stone-300" :class="iconClass" />
  </div>
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  missing: { type: Boolean, default: false },
  iconClass: { type: String, default: 'text-lg' },
})

const img = ref(null)
const failed = ref(false)
const showImage = computed(() => props.src && !props.missing && !failed.value)

watch(() => props.src, () => { failed.value = false })

// A server-rendered image can fail before Vue starts listening for errors.
onMounted(() => {
  if (img.value?.complete && img.value.naturalWidth === 0) failed.value = true
})
</script>
