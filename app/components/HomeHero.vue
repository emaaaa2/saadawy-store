<template>
  <section class="px-6 pt-4 md:pt-phi-2 pb-6 md:pb-phi-3">
    <div
      class="max-w-6xl mx-auto relative rounded-3xl overflow-hidden shadow-lg aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9]"
      @mouseenter="pause"
      @mouseleave="resume"
    >
      <div
        v-for="(slide, index) in slides"
        :key="slide.image"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="index === activeIndex ? 'opacity-100 z-[1]' : 'opacity-0 pointer-events-none'"
      >
        <img
          :src="slide.image"
          :alt="slide.alt"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r sm:rtl:bg-gradient-to-l from-olive/95 via-olive/60 sm:via-olive/50 to-olive/20 sm:to-transparent"
        ></div>

        <div
          class="relative h-full flex flex-col justify-end sm:justify-center px-6 sm:px-10 md:px-16 py-8 sm:py-0 max-w-xl"
        >
          <span
            class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3"
          >
            {{ slide.badge }}
          </span>

          <h1 class="text-2xl md:text-phi-h1 font-bold text-beige leading-tight mb-3 md:mb-4">
            {{ slide.title }}
            <span class="text-gold">{{ slide.titleGold }}</span>
          </h1>

          <p class="text-beige/80 text-sm md:text-phi-lead mb-6 hidden sm:block">
            {{ slide.description }}
          </p>

          <div class="flex items-center gap-3 flex-wrap">
            <NuxtLink
              :to="slide.ctaLink"
              class="bg-gold text-olive px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-beige transition"
            >
              {{ $t('common.shopNow') }}
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="border border-beige text-beige px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-beige hover:text-olive transition"
            >
              {{ $t('home.hero.contactUs') }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <button
        class="hidden sm:flex absolute start-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-beige/20 text-beige hover:bg-beige/40 transition"
        :aria-label="$t('home.hero.prev')"
        @click="prevSlide"
      >
        <Icon name="mdi:chevron-left" class="text-2xl rtl:-scale-x-100" />
      </button>
      <button
        class="hidden sm:flex absolute end-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-beige/20 text-beige hover:bg-beige/40 transition"
        :aria-label="$t('home.hero.next')"
        @click="nextSlide"
      >
        <Icon name="mdi:chevron-right" class="text-2xl rtl:-scale-x-100" />
      </button>

      <div class="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        <button
          v-for="(slide, index) in slides"
          :key="slide.image"
          class="h-2 rounded-full transition-all"
          :class="index === activeIndex ? 'w-6 bg-gold' : 'w-2 bg-beige/50 hover:bg-beige/80'"
          :aria-label="$t('home.hero.goTo', { n: index + 1 })"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
const { tm, price } = useLang()
const { data: shippingSettings } = await useFetch('/api/shipping-settings', { key: 'shipping-settings' })
const freeShippingThreshold = computed(() => shippingSettings.value?.free_shipping_threshold ?? DEFAULT_SHIPPING_SETTINGS.free_shipping_threshold)

const slideMedia = [
  { image: "/images/pic.jpg", ctaLink: "/category/skincare" },
  { image: "/images/skincare.jpg", ctaLink: "/category/skincare" },
  { image: "/images/perfume1.jpg", ctaLink: "/category/perfume" },
  { image: "/images/makeup.jpg", ctaLink: "/category/makeup" },
  { image: "/images/hero.png", ctaLink: "/" },
];

// Text comes from locales/home.ts in the chosen language.
const slides = computed(() =>
  tm('home.hero.slides').map((text, index) => ({
    ...slideMedia[index],
    ...text,
    titleGold: text.titleGold.replace('{amount}', price(freeShippingThreshold.value)),
  }))
);

const activeIndex = ref(0);
let intervalId = null;

function startAutoplay() {
  intervalId = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slideMedia.length;
  }, 5000);
}

function pause() {
  clearInterval(intervalId);
}

function resume() {
  clearInterval(intervalId);
  startAutoplay();
}

function goToSlide(index) {
  activeIndex.value = index;
  resume();
}

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % slideMedia.length;
  resume();
}

function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + slideMedia.length) % slideMedia.length;
  resume();
}

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
