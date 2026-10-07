<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to || undefined"
    class="adm-card p-5 flex items-start gap-4"
    :class="{ 'hover:border-ink/30 hover:shadow-md transition': to }"
  >
    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :class="tones[tone]">
      <Icon :name="icon" class="text-xl" />
    </div>
    <div class="min-w-0">
      <p class="text-sm text-stone-500">{{ label }}</p>
      <p class="text-2xl font-semibold text-stone-800 mt-1 tracking-tight">{{ value }}</p>
      <p v-if="hint" class="text-xs text-stone-500 mt-1">{{ hint }}</p>
    </div>
  </component>
</template>

<script setup>
import { NuxtLink } from '#components'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  hint: { type: String, default: '' },
  tone: { type: String, default: 'olive' },
  to: { type: String, default: '' },
})

const tones = {
  olive: 'bg-ink/10 text-ink',
  gold: 'bg-gold/15 text-gold',
  amber: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
  red: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  sky: 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
}
</script>
