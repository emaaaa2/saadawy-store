<template>
  <section class="px-6 py-8 md:py-phi-4 bg-page">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-6 md:mb-phi-3">
        <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
          {{ $t('home.whyUs.eyebrow') }}
        </span>
        <h2 class="text-xl md:text-phi-h2 font-bold text-ink text-balance">
          {{ $t('home.whyUs.title') }}
        </h2>
        <p class="mt-3 inline-flex items-center gap-2 text-sm text-taupe">
          <Icon name="mdi:account-heart-outline" class="text-lg text-gold" />
          {{ $t('home.whyUs.trust', { count: CUSTOMERS }) }}
        </p>
      </div>

      <div class="grid gap-3 md:gap-5 md:grid-cols-4">
        <!-- Variety: the number, then every category one tap away. -->
        <div class="relative md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden bg-olive text-beige">
          <img src="/images/pic.jpg" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div class="absolute inset-0 bg-gradient-to-t from-olive via-olive/90 to-olive/70"></div>

          <div class="relative h-full flex flex-col p-6 md:p-8">
            <span class="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center mb-4">
              <Icon name="mdi:view-grid-plus-outline" class="text-2xl text-gold" />
            </span>
            <h3 class="text-lg md:text-phi-h3 font-bold leading-tight text-balance">{{ $t('home.whyUs.variety.title') }}</h3>
            <p class="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span dir="ltr" class="text-5xl md:text-6xl font-bold text-gold leading-none">{{ PRODUCTS }}</span>
              <span class="text-sm md:text-base text-beige/85">{{ $t('home.whyUs.variety.count', { count: STORE_CATEGORIES.length }) }}</span>
            </p>
            <p class="mt-3 text-sm text-beige/75 leading-relaxed max-w-md">{{ $t('home.whyUs.variety.text') }}</p>

            <div class="mt-auto pt-6 flex flex-wrap gap-2">
              <NuxtLink
                v-for="cat in STORE_CATEGORIES"
                :key="cat.slug"
                :to="`/category/${cat.slug}`"
                class="inline-flex items-center gap-1.5 rounded-full border border-beige/20 bg-beige/10 px-3 py-1.5 text-xs md:text-sm text-beige hover:bg-gold hover:border-gold hover:text-olive transition"
              >
                <Icon :name="cat.icon" class="text-base" />
                {{ categoryName(cat.slug) }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- New every day: the latest products themselves, not just the claim. -->
        <div class="md:col-span-2 rounded-3xl bg-surface border border-ink/10 p-5 md:p-6">
          <div class="flex items-start gap-3">
            <span class="w-11 h-11 shrink-0 rounded-full bg-gold/10 flex items-center justify-center">
              <Icon name="mdi:calendar-star-outline" class="text-2xl text-gold" />
            </span>
            <div class="min-w-0">
              <h3 class="font-semibold text-ink md:text-lg">{{ $t('home.whyUs.fresh.title') }}</h3>
              <p class="text-sm text-taupe leading-snug mt-0.5">{{ $t('home.whyUs.fresh.text') }}</p>
            </div>
          </div>

          <div v-if="latest.length" class="mt-4 grid grid-cols-4 gap-2 md:gap-3">
            <NuxtLink
              v-for="product in latest"
              :key="product.id"
              :to="`/product/${product.slug}`"
              :title="productName(product)"
              class="group min-w-0"
            >
              <div class="relative aspect-square rounded-xl bg-tint/40 ring-1 ring-ink/5 overflow-hidden">
                <NuxtImg
                  :src="product.image"
                  :alt="productName(product)"
                  :width="160"
                  :height="160"
                  loading="lazy"
                  class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span class="hidden sm:inline absolute top-1.5 start-1.5 rounded-full bg-olive text-beige text-[10px] font-bold px-1.5 py-0.5">
                  {{ $t('home.whyUs.fresh.badge') }}
                </span>
              </div>
              <p class="mt-1.5 text-[11px] md:text-xs leading-tight text-taupe text-center line-clamp-2 group-hover:text-gold transition">
                {{ categoryName(product.category) }}
              </p>
            </NuxtLink>
          </div>

          <NuxtLink to="/new-arrivals" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline">
            {{ $t('home.whyUs.fresh.cta') }}
            <Icon name="mdi:arrow-right" class="text-base rtl:-scale-x-100" />
          </NuxtLink>
        </div>

        <div class="md:col-span-2 grid sm:grid-cols-2 gap-3 md:gap-5">
          <div v-for="feature in features" :key="feature.icon" class="flex items-start gap-3 sm:block rounded-3xl bg-surface border border-ink/10 p-5 md:p-6">
            <span class="w-11 h-11 shrink-0 rounded-full bg-gold/10 flex items-center justify-center sm:mb-3">
              <Icon :name="feature.icon" class="text-2xl text-gold" />
            </span>
            <div class="min-w-0">
              <h3 class="font-semibold text-ink text-sm md:text-base mb-1">{{ feature.title }}</h3>
              <p class="text-xs md:text-sm text-taupe leading-snug">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  // The home page's /api/home data (newest products overall and per category).
  shelves: { type: Object, default: null },
})

// The shop's real numbers (the website shows only the products that have photos so far).
const PRODUCTS = '4000+'
const CUSTOMERS = '5000'

const { tm, categoryName, productName } = useLang()
const featureIcons = ['mdi:basket-outline', 'mdi:truck-fast-outline']

const features = computed(() =>
  tm('home.whyUs.features').map((text, index) => ({ icon: featureIcons[index], ...text }))
)

// The newest products, one per category, so the card shows the range as well as what's new.
const latest = computed(() => {
  const newestPerSection = (props.shelves?.sections ?? [])
    .map((section) => section.products[0])
    .filter(Boolean)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  const picked = []
  for (const product of [...(props.shelves?.newArrivals ?? []), ...newestPerSection]) {
    if (!product.image || picked.some((p) => p.category === product.category)) continue
    picked.push(product)
    if (picked.length === 4) break
  }
  return picked
})
</script>
