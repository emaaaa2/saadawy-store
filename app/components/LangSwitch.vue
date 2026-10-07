<template>
  <!-- Shows the language it switches to. Compact (phone headers): just its short name in a circle;
       otherwise a small globe button with the language's full name. -->
  <button
    type="button"
    :lang="other.value"
    :aria-label="other.name"
    :title="other.name"
    class="shrink-0 inline-flex items-center justify-center border transition-colors hover:border-gold hover:text-gold"
    :class="compact
      ? ['w-7 h-7 rounded-full border-ink/25 font-bold leading-none', other.value === 'ar' ? 'text-sm' : 'text-[11px] tracking-wide']
      : 'h-8 gap-1.5 px-3 rounded-full border-ink/20 text-sm font-medium'"
    @click="setLang(other.value)"
  >
    <Icon v-if="!compact" name="mdi:web" class="text-base" />
    <span :class="{ '[font-family:Alexandria,sans-serif]': other.value === 'ar' }">
      {{ compact ? other.short : other.name }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false },
})

const { lang, setLang } = useLang()

const options = [
  { value: 'en', short: 'EN', name: 'English' },
  { value: 'ar', short: 'ع', name: 'العربية' },
]
const other = computed(() => options.find((option) => option.value !== lang.value))
</script>
