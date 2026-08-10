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
          class="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-olive/95 via-olive/60 sm:via-olive/50 to-olive/20 sm:to-transparent"
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
              Shop Now
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="border border-beige text-beige px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-beige hover:text-olive transition"
            >
              Contact Us
            </NuxtLink>
          </div>
        </div>
      </div>

      <button
        class="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-beige/20 text-beige hover:bg-beige/40 transition"
        aria-label="Previous slide"
        @click="prevSlide"
      >
        <Icon name="mdi:chevron-left" class="text-2xl" />
      </button>
      <button
        class="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-beige/20 text-beige hover:bg-beige/40 transition"
        aria-label="Next slide"
        @click="nextSlide"
      >
        <Icon name="mdi:chevron-right" class="text-2xl" />
      </button>

      <div class="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        <button
          v-for="(slide, index) in slides"
          :key="slide.image"
          class="h-2 rounded-full transition-all"
          :class="index === activeIndex ? 'w-6 bg-gold' : 'w-2 bg-beige/50 hover:bg-beige/80'"
          :aria-label="`Go to slide ${index + 1}`"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
const slides = [
  {
    image: "/images/pic.jpg",
    alt: "Saadawy Store products",
    badge: "New arrivals every week",
    title: "Everything You Love,",
    titleGold: "All In One Place",
    description:
      "From skincare to bags, kitchen essentials to hijab and everyday needs — carefully selected pieces, all under one roof.",
    ctaLink: "/category/skincare",
  },
  {
    image: "/images/skincare.jpg",
    alt: "Skincare products",
    badge: "Glow every day",
    title: "Skincare That",
    titleGold: "Actually Works",
    description:
      "Cleansers, serums, and moisturizers picked for real results — for every skin type and budget.",
    ctaLink: "/category/skincare",
  },
  {
    image: "/images/perfume1.jpg",
    alt: "Perfume collection",
    badge: "Signature scents",
    title: "Find Your",
    titleGold: "Perfect Fragrance",
    description:
      "A curated collection of perfumes for men and women, from everyday favorites to statement scents.",
    ctaLink: "/category/perfume",
  },
  {
    image: "/images/makeup.jpg",
    alt: "Makeup products",
    badge: "Beauty essentials",
    title: "Makeup",
    titleGold: "Must-Haves",
    description:
      "Everything you need to complete your look, from everyday basics to bold statement pieces.",
    ctaLink: "/category/makeup",
  },
];

const activeIndex = ref(0);
let intervalId = null;

function startAutoplay() {
  intervalId = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slides.length;
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
  activeIndex.value = (activeIndex.value + 1) % slides.length;
  resume();
}

function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length;
  resume();
}

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
