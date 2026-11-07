<template>
  <div>
    <p :id="id" ref="textEl" dir="auto" class="whitespace-pre-line" :class="[textClass, !expanded && clamp]">{{ text }}</p>
    <!-- Shown only when the text is longer than the clamp (measured in the browser). -->
    <button
      v-if="overflowing || expanded"
      type="button"
      class="mt-1 text-sm font-semibold text-ink underline underline-offset-2 hover:text-gold transition"
      :aria-expanded="expanded"
      :aria-controls="id"
      @click="expanded = !expanded"
    >
      {{ expanded ? $t('product.readLess') : $t('product.readMore') }}
    </button>
  </div>
</template>

<script setup>
// Long text cut to a few lines with a "read more" button. `clamp` is a Tailwind line-clamp class.
const props = defineProps({
  text: { type: String, required: true },
  textClass: { type: [String, Array, Object], default: '' },
  clamp: { type: String, default: 'line-clamp-5' },
})

const id = useId()
const textEl = ref(null)
const expanded = ref(false)
const overflowing = ref(false)

function measure() {
  const el = textEl.value
  if (!el || expanded.value) return
  overflowing.value = el.scrollHeight > el.clientHeight + 1
}

watch(() => props.text, async () => {
  expanded.value = false
  await nextTick()
  measure()
})

// Measured again whenever the paragraph changes size: styles or fonts can arrive after mount,
// and the width changes with the screen.
let observer
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(textEl.value)
  document.fonts?.ready.then(measure)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
