<template>
  <section class="px-6 py-8 md:py-phi-4 bg-page">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-6 md:mb-phi-4">
        <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
          {{ $t('home.whyUs.eyebrow') }}
        </span>
        <h2 class="text-xl md:text-phi-h2 font-bold text-ink">
          {{ $t('home.whyUs.title') }}
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-phi-3">
        <div
          v-for="badge in badges"
          :key="badge.icon"
          class="bg-surface rounded-2xl border border-ink/10 p-5 md:p-8 text-center"
        >
          <div
            class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center"
          >
            <Icon :name="badge.icon" class="text-2xl md:text-3xl text-gold" />
          </div>
          <h3 class="font-semibold text-ink text-sm md:text-base mb-1">
            {{ badge.title }}
          </h3>
          <p class="text-xs md:text-sm text-taupe leading-snug">
            {{ badge.description }}
          </p>
        </div>
      </div>

      <div class="relative rounded-3xl overflow-hidden">
        <img src="/images/pic.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-olive/80"></div>

        <div class="relative grid grid-cols-2 md:grid-cols-4 gap-phi-2 text-center text-beige px-6 py-8 md:py-phi-3">
          <div v-for="stat in stats" :key="stat.number">
            <p class="text-3xl md:text-4xl font-bold text-gold mb-1">{{ stat.number }}</p>
            <p class="text-sm text-beige/80">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t, tm } = useLang()
const badgeIcons = ["mdi:certificate-outline", "mdi:shield-check-outline", "mdi:autorenew", "mdi:truck-fast-outline"];
const statNumbers = ["5000+", "4000+", "6+", null];

const badges = computed(() =>
  tm("home.whyUs.features").map((text, index) => ({ icon: badgeIcons[index], ...text }))
);

const stats = computed(() =>
  tm("home.whyUs.stats").map((text, index) => ({
    number: statNumbers[index] ?? t("home.whyUs.daily"),
    label: text.label,
  }))
);
</script>
