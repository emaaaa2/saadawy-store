<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to || undefined"
    class="adm-card p-5 flex items-start gap-4"
    :class="{ 'hover:border-olive/30 hover:shadow-md transition': to }"
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
  olive: 'bg-olive/10 text-olive',
  gold: 'bg-gold/15 text-gold',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  sky: 'bg-sky-50 text-sky-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}
</script>
