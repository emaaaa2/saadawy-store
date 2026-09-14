<template>
  <div class="relative min-h-[80vh] bg-beige px-6 py-phi-3 overflow-hidden">
    <div class="pointer-events-none absolute -top-16 -left-16 w-72 h-72 bg-gold/10 rounded-full blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 bg-rose/10 rounded-full blur-3xl"></div>

    <div class="relative max-w-2xl mx-auto">
      <div v-if="step <= 3" class="mb-phi-3">
        <button
          v-if="step > 1"
          class="text-sm text-taupe hover:text-olive transition flex items-center gap-0.5 mb-4"
          @click="goBack"
        >
          <Icon name="mdi:chevron-left" class="text-lg" />
          Back
        </button>

        <div class="flex items-center justify-center gap-2 sm:gap-3">
          <template v-for="n in 3" :key="n">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
              :class="n < step
                ? 'bg-gold text-beige'
                : n === step
                  ? 'bg-olive text-beige ring-4 ring-gold/20'
                  : 'bg-olive/10 text-olive/40'"
            >
              <Icon v-if="n < step" name="mdi:check" class="text-sm" />
              <span v-else>{{ n }}</span>
            </div>
            <div
              v-if="n < 3"
              class="w-10 sm:w-20 h-0.5 rounded-full transition-colors duration-300"
              :class="n < step ? 'bg-gold' : 'bg-olive/10'"
            ></div>
          </template>
        </div>
      </div>

      <Transition name="quiz-step" mode="out-in">
        <div v-if="step === 1" key="step-1" class="bg-white rounded-3xl shadow-xl shadow-olive/5 border border-olive/5 p-8 sm:p-12 text-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-champagne flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
            <Icon name="mdi:sparkles" class="text-3xl text-white" />
          </div>
          <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2">Personalized For You</p>
          <h1 class="text-phi-h1 font-bold text-olive mb-3">Beauty Quiz</h1>
          <p class="text-sm sm:text-base text-taupe mb-phi-2 max-w-md mx-auto">
            Answer 3 quick questions and we'll match you with products picked just for you.
          </p>
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="group relative flex flex-col items-center gap-3 p-5 sm:p-7 rounded-2xl border-2 transition-all duration-200"
              :class="category === cat.value
                ? 'border-gold bg-champagne/40 shadow-md'
                : 'border-olive/10 bg-white hover:border-olive/25 hover:shadow-md hover:-translate-y-0.5'"
              @click="selectCategory(cat.value)"
            >
              <span
                v-if="category === cat.value"
                class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gold text-beige flex items-center justify-center"
              >
                <Icon name="mdi:check" class="text-xs" />
              </span>
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
                :class="category === cat.value ? 'bg-gold text-beige' : 'bg-champagne/60 text-gold group-hover:bg-champagne'"
              >
                <Icon :name="cat.icon" class="text-2xl" />
              </div>
              <span class="font-semibold text-olive text-sm">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="step === 2" key="step-2" class="bg-white rounded-3xl shadow-xl shadow-olive/5 border border-olive/5 p-8 sm:p-12">
          <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2 text-center">For {{ categoryLabel }}</p>
          <h2 class="text-phi-h2 font-bold text-olive mb-phi-2 text-center">What's your main focus?</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="opt in currentFocusOptions"
              :key="opt.value"
              class="group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left"
              :class="focus === opt.value
                ? 'border-gold bg-champagne/40 shadow-md'
                : 'border-olive/10 bg-white hover:border-olive/25 hover:shadow-md hover:-translate-y-0.5'"
              @click="selectFocus(opt.value)"
            >
              <span
                v-if="focus === opt.value"
                class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gold text-beige flex items-center justify-center"
              >
                <Icon name="mdi:check" class="text-xs" />
              </span>
              <div
                class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors"
                :class="focus === opt.value ? 'bg-gold text-beige' : 'bg-champagne/60 text-gold group-hover:bg-champagne'"
              >
                <Icon :name="opt.icon" class="text-xl" />
              </div>
              <span>
                <span class="block font-semibold text-olive text-sm">{{ opt.label }}</span>
                <span class="block text-xs text-taupe">{{ opt.desc }}</span>
              </span>
            </button>
          </div>
        </div>

        <div v-else-if="step === 3" key="step-3" class="bg-white rounded-3xl shadow-xl shadow-olive/5 border border-olive/5 p-8 sm:p-12">
          <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2 text-center">Last Step</p>
          <h2 class="text-phi-h2 font-bold text-olive mb-phi-2 text-center">What matters most to you?</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="opt in priorityOptions"
              :key="opt.value"
              class="group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left"
              :class="priority === opt.value
                ? 'border-gold bg-champagne/40 shadow-md'
                : 'border-olive/10 bg-white hover:border-olive/25 hover:shadow-md hover:-translate-y-0.5'"
              @click="selectPriority(opt.value)"
            >
              <span
                v-if="priority === opt.value"
                class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gold text-beige flex items-center justify-center"
              >
                <Icon name="mdi:check" class="text-xs" />
              </span>
              <div
                class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors"
                :class="priority === opt.value ? 'bg-gold text-beige' : 'bg-champagne/60 text-gold group-hover:bg-champagne'"
              >
                <Icon :name="opt.icon" class="text-xl" />
              </div>
              <span>
                <span class="block font-semibold text-olive text-sm">{{ opt.label }}</span>
                <span class="block text-xs text-taupe">{{ opt.desc }}</span>
              </span>
            </button>
          </div>
        </div>

        <div v-else key="step-4">
          <div class="text-center mb-phi-3">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-champagne flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
              <Icon name="mdi:check-decagram" class="text-3xl text-white" />
            </div>
            <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2">Curated Just For You</p>
            <h2 class="text-phi-h1 font-bold text-olive mb-3">Your Perfect Picks</h2>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-champagne/60 text-olive">{{ categoryLabel }}</span>
              <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-champagne/60 text-olive">{{ focusLabel }}</span>
              <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-champagne/60 text-olive">{{ priorityLabel }}</span>
            </div>
          </div>

          <div v-if="loadingResults" class="text-center">
            <div class="inline-flex items-center gap-2 text-sm text-taupe mb-phi-2">
              <Icon name="mdi:loading" class="text-lg text-gold animate-spin" />
              Finding your matches...
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
              <div v-for="n in 8" :key="n" class="aspect-square bg-olive/5 rounded-2xl animate-pulse"></div>
            </div>
          </div>

          <div v-else-if="results.length === 0" class="bg-white rounded-3xl shadow-xl shadow-olive/5 border border-olive/5 p-phi-3 text-center">
            <Icon name="mdi:package-variant-closed" class="text-5xl text-olive/20 mb-4" />
            <p class="text-olive font-semibold mb-1">No exact matches yet</p>
            <p class="text-sm text-taupe mb-4">Try browsing the full {{ categoryLabel }} collection instead.</p>
            <NuxtLink
              :to="`/category/${category}`"
              class="inline-block bg-olive text-beige px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gold transition"
            >
              Browse {{ categoryLabel }}
            </NuxtLink>
          </div>

          <template v-else>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2 mb-phi-2">
              <NuxtLink
                v-for="product in results"
                :key="product.id"
                :to="`/product/${product.slug}`"
                class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div class="relative aspect-square bg-champagne overflow-hidden">
                  <NuxtImg
                    v-if="product.image && !failedImages.has(product.image)"
                    :src="product.image"
                    :alt="product.name"
                    :width="400"
                    :height="400"
                    loading="lazy"
                    class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    @error="failedImages.add(product.image)"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
                  </div>

                  <span
                    v-if="product.badge"
                    class="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full"
                    :class="{
                      'bg-olive text-beige': product.badge === 'Best Seller',
                      'bg-gold text-beige': product.badge === 'New',
                      'bg-rose text-olive': product.badge === 'Sale',
                    }"
                  >
                    {{ product.badge }}
                  </span>

                  <button
                    class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:text-gold transition"
                    :aria-label="wishlist.isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
                    @click.stop.prevent="wishlist.toggle(product)"
                  >
                    <Icon
                      :name="wishlist.isInWishlist(product.id) ? 'mdi:heart' : 'mdi:heart-outline'"
                      class="text-lg"
                      :class="wishlist.isInWishlist(product.id) ? 'text-gold' : ''"
                    />
                  </button>

                  <div
                    class="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <button
                      class="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white/95 text-olive hover:bg-gold hover:text-beige transition shadow-md"
                      aria-label="Quick view"
                      @click.stop.prevent="quickView.open(product)"
                    >
                      <Icon name="mdi:eye-outline" class="text-sm" />
                      Quick View
                    </button>
                  </div>
                </div>

                <div class="p-3">
                  <p class="text-sm font-medium text-olive mb-1 truncate group-hover:text-gold transition">
                    {{ product.name }}
                  </p>
                  <div v-if="product.reviewCount" class="flex items-center gap-1 mb-1">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      name="mdi:star"
                      class="text-xs"
                      :class="star <= Math.round(product.rating) ? 'text-gold' : 'text-olive/15'"
                    />
                    <span class="text-xs text-taupe">({{ product.reviewCount }})</span>
                  </div>
                  <p v-if="product.stock > 0 && product.stock < 3" class="text-xs font-semibold text-red-500 mb-1">
                    Only {{ product.stock }} left!
                  </p>
                  <div class="flex items-center justify-between">
                    <div>
                      <span v-if="product.sale_price" class="text-xs text-taupe line-through mr-1">
                        EGP {{ product.price }}
                      </span>
                      <span class="font-bold text-olive text-sm">
                        EGP {{ product.sale_price ?? product.price }}
                      </span>
                    </div>
                    <button
                      class="w-7 h-7 rounded-full bg-olive text-beige flex items-center justify-center hover:bg-gold transition"
                      aria-label="Add to cart"
                      @click.stop.prevent="cart.addItem(product)"
                    >
                      <Icon name="mdi:cart-outline" class="text-sm" />
                    </button>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <div class="text-center">
              <NuxtLink
                :to="`/category/${category}?subcategory=${focus}`"
                class="inline-flex items-center gap-1 text-sm text-olive font-semibold hover:text-gold transition"
              >
                View all {{ resultsTotal }} products in this category
                <Icon name="mdi:arrow-right" class="text-base" />
              </NuxtLink>
            </div>
          </template>

          <div class="text-center mt-phi-3">
            <button
              class="inline-flex items-center gap-1.5 text-sm text-taupe hover:text-olive transition"
              @click="retake"
            >
              <Icon name="mdi:refresh" class="text-base" />
              Retake Quiz
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const quickView = useQuickViewStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const failedImages = reactive(new Set())

useSeoMeta({
  title: 'Beauty Quiz — Find Your Perfect Products',
  description: 'Take our quick beauty quiz and get personalized skincare, haircare, makeup, and perfume recommendations from Saadawy Store.',
  ogTitle: 'Beauty Quiz | Saadawy Store',
  ogDescription: "Answer 3 quick questions and discover products picked just for you."
})

const categories = [
  { value: 'skincare', label: 'Skincare', icon: 'mdi:face-woman-shimmer-outline' },
  { value: 'haircare', label: 'Haircare', icon: 'mdi:hair-dryer-outline' },
  { value: 'makeup', label: 'Makeup', icon: 'mdi:lipstick' },
  { value: 'perfume', label: 'Perfume', icon: 'mdi:spray-bottle' },
]

const focusOptions = {
  skincare: [
    { value: 'cleansers', label: 'Deep Cleansing', desc: 'Wash away dirt & impurities', icon: 'mdi:water-outline' },
    { value: 'moisturizers', label: 'Hydration & Repair', desc: 'Lock in moisture all day', icon: 'mdi:water-plus-outline' },
    { value: 'serums', label: 'Targeted Treatment', desc: 'Focused active ingredients', icon: 'mdi:eyedropper' },
    { value: 'sunscreen', label: 'Sun Protection', desc: 'Shield & prevent damage', icon: 'mdi:weather-sunny' },
    { value: 'body-care', label: 'Head-to-Toe Care', desc: 'Nourish your whole body', icon: 'mdi:human' },
    { value: 'masks-and-scrubs', label: 'Exfoliate & Refresh', desc: 'Masks & scrubs for glow', icon: 'mdi:sparkles' },
  ],
  haircare: [
    { value: 'shampoo', label: 'Cleanse & Refresh', desc: 'Gentle everyday cleansing', icon: 'mdi:water-outline' },
    { value: 'conditioner-and-treatments', label: 'Repair & Nourish', desc: 'Deep conditioning treatments', icon: 'mdi:bottle-tonic-outline' },
    { value: 'hair-oils', label: 'Natural Oils', desc: 'Shine & nourish naturally', icon: 'mdi:oil' },
    { value: 'styling', label: 'Style & Hold', desc: 'Shape your perfect look', icon: 'mdi:hair-dryer-outline' },
  ],
  makeup: [
    { value: 'face', label: 'Flawless Face', desc: 'Foundation, concealer & more', icon: 'mdi:face-woman-outline' },
    { value: 'eyes', label: 'Eye-Catching Look', desc: 'Eyeshadow, liner & mascara', icon: 'mdi:eye-outline' },
    { value: 'lips', label: 'Perfect Pout', desc: 'Lipstick, gloss & liner', icon: 'mdi:lipstick' },
    { value: 'brushes-and-tools', label: 'Tools & Brushes', desc: 'Blend like a pro', icon: 'mdi:brush-outline' },
  ],
  perfume: [
    { value: 'perfume-sets', label: 'Gift-Ready Sets', desc: 'Perfect for gifting', icon: 'mdi:gift-outline' },
    { value: 'other', label: 'Signature Scent', desc: 'A single standout fragrance', icon: 'mdi:spray-bottle' },
  ],
}

const priorityOptions = [
  { value: 'rating', label: 'Top Rated', desc: 'Highest reviewed picks', icon: 'mdi:star-outline' },
  { value: 'bestseller', label: 'Best Sellers', desc: 'What everyone is loving', icon: 'mdi:fire' },
  { value: 'price_asc', label: 'Best Value', desc: 'Great quality, fair price', icon: 'mdi:cash' },
  { value: 'newest', label: 'Newest Arrivals', desc: 'Fresh in the store', icon: 'mdi:new-box' },
]

const step = ref(1)
const category = ref('')
const focus = ref('')
const priority = ref('')
const loadingResults = ref(false)
const results = ref([])
const resultsTotal = ref(0)

const currentFocusOptions = computed(() => focusOptions[category.value] ?? [])
const categoryLabel = computed(() => categories.find((c) => c.value === category.value)?.label ?? '')
const focusLabel = computed(() => (focusOptions[category.value] ?? []).find((o) => o.value === focus.value)?.label ?? '')
const priorityLabel = computed(() => priorityOptions.find((p) => p.value === priority.value)?.label ?? '')

const SELECT_DELAY = 280

function goBack() {
  if (step.value === 2) step.value = 1
  else if (step.value === 3) step.value = 2
}

function selectCategory(value) {
  category.value = value
  focus.value = ''
  setTimeout(() => { step.value = 2 }, SELECT_DELAY)
}

function selectFocus(value) {
  focus.value = value
  setTimeout(() => { step.value = 3 }, SELECT_DELAY)
}

function selectPriority(value) {
  priority.value = value
  setTimeout(async () => {
    step.value = 4
    await loadResults()
  }, SELECT_DELAY)
}

function scoreBadge(product) {
  if (product.badge === 'Best Seller') return 2
  if (product.badge === 'New') return 1
  return 0
}

function applyPriority(list, priorityValue) {
  const sorted = [...list]
  if (priorityValue === 'rating') {
    sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  } else if (priorityValue === 'bestseller') {
    sorted.sort((a, b) => scoreBadge(b) - scoreBadge(a))
  } else if (priorityValue === 'price_asc') {
    sorted.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price))
  }
  return sorted
}

async function loadResults() {
  loadingResults.value = true
  try {
    const { products, total } = await $fetch('/api/products', {
      query: { category: category.value, subcategory: focus.value, limit: 40 }
    })
    resultsTotal.value = total
    results.value = applyPriority(products, priority.value).slice(0, 8)
  } finally {
    loadingResults.value = false
  }
  navigateTo(
    { path: '/quiz', query: { category: category.value, focus: focus.value, priority: priority.value } },
    { replace: true }
  )
}

function retake() {
  step.value = 1
  category.value = ''
  focus.value = ''
  priority.value = ''
  results.value = []
  resultsTotal.value = 0
  navigateTo({ path: '/quiz' }, { replace: true })
}

onMounted(() => {
  const q = route.query
  if (typeof q.category === 'string' && typeof q.focus === 'string' && typeof q.priority === 'string') {
    category.value = q.category
    focus.value = q.focus
    priority.value = q.priority
    step.value = 4
    loadResults()
  }
})
</script>

<style scoped>
.quiz-step-enter-active,
.quiz-step-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.quiz-step-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.quiz-step-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
