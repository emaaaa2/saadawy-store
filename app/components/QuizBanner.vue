<template>
  <section class="px-6 py-6 md:py-phi-3">
    <div class="max-w-6xl mx-auto relative overflow-hidden rounded-3xl bg-olive shadow-xl">
      <div class="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-rose/10 rounded-full blur-3xl"></div>

      <!-- Compact on phones so products show up sooner; same as before from tablets up. -->
      <div class="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 p-5 sm:p-10">
        <div class="flex flex-row items-center gap-4 sm:gap-5 text-start">
          <div class="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <span class="pulse-ring absolute inset-0 rounded-full bg-gold"></span>
            <span class="pulse-ring pulse-ring-delay absolute inset-0 rounded-full bg-gold"></span>
            <div class="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gold to-tint flex items-center justify-center shadow-lg shadow-gold/20">
              <Icon name="mdi:auto-fix" class="text-2xl sm:text-3xl text-white" />
            </div>
          </div>
          <div>
            <p class="hidden sm:block text-xs font-bold text-gold uppercase tracking-widest mb-1">{{ $t('home.quiz.eyebrow') }}</p>
            <h2 class="text-lg sm:text-phi-h3 font-bold text-beige mb-1 leading-snug">{{ $t('home.quiz.title') }}</h2>
            <p class="text-xs sm:text-sm text-beige/70 max-w-sm">{{ $t('home.quiz.text') }}</p>
          </div>
        </div>

        <NuxtLink
          to="/quiz"
          class="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gold text-olive font-bold px-8 py-3 sm:py-3.5 rounded-full hover:bg-champagne hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          {{ $t('home.quiz.cta') }}
          <span class="inline-flex rtl:-scale-x-100">
            <Icon name="mdi:arrow-right" class="nudge-arrow text-lg" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.55;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}
.pulse-ring {
  animation: pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.pulse-ring-delay {
  animation-delay: 1.2s;
}

@keyframes nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}
.nudge-arrow {
  animation: nudge 1.6s ease-in-out infinite;
}
</style>
