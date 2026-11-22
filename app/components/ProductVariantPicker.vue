<template>
  <div ref="root" class="mb-6">
    <p class="text-sm text-ink mb-2.5">
      <span class="font-semibold">{{ $t('product.variant.label') }}:</span>
      <span dir="auto" class="ms-1" :class="selected ? 'text-ink' : 'text-taupe'">
        {{ selected ? variantName(selected) : $t('product.variant.choose') }}
      </span>
    </p>

    <div class="flex flex-wrap gap-2.5" role="radiogroup" :aria-label="$t('product.variant.label')">
      <button
        v-for="variant in variants"
        :key="variant.id"
        type="button"
        role="radio"
        :aria-checked="variant.id === modelValue"
        :aria-label="variantLabel(variant)"
        :title="variantLabel(variant)"
        :disabled="variant.stock < 1"
        class="relative transition disabled:cursor-not-allowed"
        :class="[shapeClass(variant), variant.id === modelValue ? 'ring-2 ring-gold ring-offset-2 ring-offset-page' : 'hover:ring-2 hover:ring-gold/40 hover:ring-offset-2 hover:ring-offset-page']"
        @click="$emit('update:modelValue', variant.id)"
      >
        <!-- Colour swatch, else the colour's photo, else its name. -->
        <span v-if="variant.color" class="block w-full h-full rounded-full border border-ink/10" :style="{ backgroundColor: variant.color }"></span>
        <img v-else-if="variant.image" :src="variant.image" alt="" class="w-full h-full object-cover rounded-lg" loading="lazy" />
        <span v-else dir="auto" class="text-sm">{{ variantName(variant) }}</span>

        <!-- Sold out: dimmed with a line across. -->
        <span v-if="variant.stock < 1" class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span class="block w-[130%] h-px bg-ink/60 -rotate-45"></span>
        </span>
      </button>
    </div>

    <p v-if="error" class="text-sm text-red-500 mt-2 flex items-center gap-1.5">
      <Icon name="mdi:alert-circle-outline" class="text-base" />
      {{ $t('product.variant.required') }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  variants: { type: Array, required: true },
  modelValue: { type: String, default: null },
  // Shown when the customer tries to add to the cart without choosing.
  error: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const { t, variantName } = useLang()
const root = ref(null)
const selected = computed(() => props.variants.find((v) => v.id === props.modelValue) ?? null)

const variantLabel = (variant) => (variant.stock < 1 ? `${variantName(variant)} — ${t('common.outOfStock')}` : variantName(variant))

function shapeClass(variant) {
  if (variant.color) return `w-9 h-9 rounded-full p-0.5 ${variant.stock < 1 ? 'opacity-40' : ''}`
  if (variant.image) return `w-14 h-14 rounded-lg p-0.5 bg-surface border border-ink/10 ${variant.stock < 1 ? 'opacity-40' : ''}`
  return `px-4 py-2 rounded-full border overflow-hidden ${variant.id === props.modelValue ? 'border-gold bg-gold/10 text-ink' : 'border-ink/20 text-ink/80'} ${variant.stock < 1 ? 'opacity-40' : ''}`
}

defineExpose({ scrollIntoView: () => root.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })
</script>
