<template>
  <div class="px-6 py-phi-4 max-w-3xl mx-auto">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
      {{ $t('pages.about.eyebrow') }}
    </span>
    <h1 class="text-phi-h1 font-bold text-ink mb-phi-2">{{ $t('pages.about.title') }}</h1>

    <div class="space-y-5 text-ink/80 leading-relaxed">
      <p v-for="(paragraph, index) in tm('pages.about.paragraphs')" :key="index">{{ paragraph }}</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-phi-2 mt-phi-3 pt-phi-3 border-t border-ink/10 text-center">
      <div v-for="stat in stats" :key="stat.number">
        <p class="text-2xl font-bold text-gold mb-1">{{ stat.number }}</p>
        <p class="text-xs text-taupe">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid sm:grid-cols-3 gap-phi-2 mt-phi-3 pt-phi-3 border-t border-ink/10">
      <div v-for="value in tm('pages.about.values')" :key="value.title" class="text-center">
        <p class="font-bold text-ink text-lg mb-1">{{ value.title }}</p>
        <p class="text-sm text-taupe">{{ value.text }}</p>
      </div>
    </div>

    <div class="mt-phi-3 pt-phi-3 border-t border-ink/10 text-center">
      <p class="text-ink font-semibold mb-1">{{ $t('pages.about.question') }}</p>
      <p class="text-sm text-taupe mb-4">{{ $t('pages.about.happyToHelp') }}</p>
      <NuxtLink
        to="/contact"
        class="inline-block bg-olive text-beige px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition"
      >
        {{ $t('pages.about.getInTouch') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { t, tm } = useLang()

useSeoMeta({
  title: () => t('pages.about.metaTitle'),
  description: () => t('pages.about.metaDescription'),
})

// Same numbers as the home page's "Why choose us" section.
const statNumbers = ['5000+', '4000+', '6+', null]
const stats = computed(() =>
  tm('home.whyUs.stats').map((stat, index) => ({
    number: statNumbers[index] ?? t('home.whyUs.daily'),
    label: stat.label,
  }))
)
</script>
