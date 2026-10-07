<template>
  <!-- Shows the mode it switches to: a moon for dark, a sun to go back to light. Compact (phone
       headers): just the icon, like the header's other icons; otherwise a small button with a word. -->
  <button
    type="button"
    :aria-label="isDark ? $t('common.theme.toLight') : $t('common.theme.toDark')"
    :title="isDark ? $t('common.theme.toLight') : $t('common.theme.toDark')"
    class="shrink-0 inline-flex items-center justify-center transition-colors hover:text-gold"
    :class="compact ? '' : 'h-8 gap-1.5 px-3 rounded-full border border-ink/20 text-sm font-medium hover:border-gold'"
    @click="toggleTheme"
  >
    <!-- Thin outline sun and crescent (Lucide's shapes, ISC license). -->
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      :class="compact ? 'w-6 h-6' : 'w-4 h-4'"
    >
      <template v-if="isDark">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </template>
      <path v-else d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
    <span v-if="!compact">{{ isDark ? $t('common.theme.lightShort') : $t('common.theme.darkShort') }}</span>
  </button>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false },
})

const { isDark, toggleTheme } = useTheme()
</script>
