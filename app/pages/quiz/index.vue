<template>
  <div class="relative min-h-[80vh] bg-page px-6 py-phi-3 overflow-hidden">
    <div class="pointer-events-none absolute -top-16 -start-16 w-72 h-72 bg-gold/10 rounded-full blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-16 -end-16 w-72 h-72 bg-rose/10 rounded-full blur-3xl"></div>

    <div class="relative max-w-2xl mx-auto">
      <div v-if="step <= 3" class="mb-phi-3">
        <button
          v-if="step > 1"
          class="text-sm text-taupe hover:text-ink transition flex items-center gap-0.5 mb-4"
          @click="goBack"
        >
          <Icon name="mdi:chevron-left" class="text-lg rtl:-scale-x-100" />
          {{ $t('quiz.back') }}
        </button>

        <div class="flex items-center justify-center gap-2 sm:gap-3">
          <template v-for="n in 3" :key="n">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
              :class="n < step
                ? 'bg-gold text-beige'
                : n === step
                  ? 'bg-olive text-beige ring-4 ring-gold/20'
                  : 'bg-ink/10 text-ink/40'"
            >
              <Icon v-if="n < step" name="mdi:check" class="text-sm" />
              <span v-else>{{ n }}</span>
            </div>
            <div
              v-if="n < 3"
              class="w-10 sm:w-20 h-0.5 rounded-full transition-colors duration-300"
              :class="n < step ? 'bg-gold' : 'bg-ink/10'"
            ></div>
          </template>
        </div>
      </div>

      <Transition name="quiz-step" mode="out-in">
        <div v-if="step === 1" key="step-1" class="bg-surface rounded-3xl shadow-xl shadow-olive/5 border border-ink/5 p-8 sm:p-12 text-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-tint flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
            <Icon name="mdi:sparkles" class="text-3xl text-white" />
          </div>
          <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2">{{ $t('quiz.eyebrow') }}</p>
          <h1 class="text-phi-h1 font-bold text-ink mb-3">{{ $t('quiz.title') }}</h1>
          <p class="text-sm sm:text-base text-taupe mb-phi-2 max-w-md mx-auto">
            {{ $t('quiz.intro') }}
          </p>
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="group relative flex flex-col items-center gap-3 p-5 sm:p-7 rounded-2xl border-2 transition-all duration-200"
              :class="category === cat.value
                ? 'border-gold bg-tint/40 shadow-md'
                : 'border-ink/10 bg-surface hover:border-ink/25 hover:shadow-md hover:-translate-y-0.5'"
              @click="selectCategory(cat.value)"
            >
              <span
                v-if="category === cat.value"
                class="absolute top-2.5 end-2.5 w-5 h-5 rounded-full bg-gold text-beige flex items-center justify-center"
              >
                <Icon name="mdi:check" class="text-xs" />
              </span>
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
                :class="category === cat.value ? 'bg-gold text-beige' : 'bg-tint/60 text-gold group-hover:bg-tint'"
              >
                <Icon :name="cat.icon" class="text-2xl" />
              </div>
              <span class="font-semibold text-ink text-sm">{{ categoryName(cat.value) }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="step === 2" key="step-2" class="bg-surface rounded-3xl shadow-xl shadow-olive/5 border border-ink/5 p-8 sm:p-12">
          <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2 text-center">{{ $t('quiz.forCategory', { category: categoryLabel }) }}</p>
          <h2 class="text-phi-h2 font-bold text-ink mb-phi-2 text-center">{{ $t('quiz.focusQuestion') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="opt in currentFocusOptions"
              :key="opt.value"
              class="group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-start"
              :class="focus === opt.value
                ? 'border-gold bg-tint/40 shadow-md'
                : 'border-ink/10 bg-surface hover:border-ink/25 hover:shadow-md hover:-translate-y-0.5'"
              @click="selectFocus(opt.value)"
            >
              <span
                v-if="focus === opt.value"
                class="absolute top-2.5 end-2.5 w-5 h-5 rounded-full bg-gold text-beige flex items-center justify-center"
              >
                <Icon name="mdi:check" class="text-xs" />
              </span>
              <div
                class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors"
                :class="focus === opt.value ? 'bg-gold text-beige' : 'bg-tint/60 text-gold group-hover:bg-tint'"
              >
                <Icon :name="opt.icon" class="text-xl" />
              </div>
              <span>
                <span class="block font-semibold text-ink text-sm">{{ $t(`quiz.focus.${category}.${opt.value}.label`) }}</span>
                <span class="block text-xs text-taupe">{{ $t(`quiz.focus.${category}.${opt.value}.desc`) }}</span>
              </span>
            </button>
          </div>
        </div>

        <div v-else-if="step === 3" key="step-3" class="bg-surface rounded-3xl shadow-xl shadow-olive/5 border border-ink/5 p-8 sm:p-12">
          <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2 text-center">{{ $t('quiz.lastStep') }}</p>
          <h2 class="text-phi-h2 font-bold text-ink mb-phi-2 text-center">{{ $t('quiz.priorityQuestion') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="opt in priorityOptions"
              :key="opt.value"
              class="group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-start"
              :class="priority === opt.value
                ? 'border-gold bg-tint/40 shadow-md'
                : 'border-ink/10 bg-surface hover:border-ink/25 hover:shadow-md hover:-translate-y-0.5'"
              @click="selectPriority(opt.value)"
            >
              <span
                v-if="priority === opt.value"
                class="absolute top-2.5 end-2.5 w-5 h-5 rounded-full bg-gold text-beige flex items-center justify-center"
              >
                <Icon name="mdi:check" class="text-xs" />
              </span>
              <div
                class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors"
                :class="priority === opt.value ? 'bg-gold text-beige' : 'bg-tint/60 text-gold group-hover:bg-tint'"
              >
                <Icon :name="opt.icon" class="text-xl" />
              </div>
              <span>
                <span class="block font-semibold text-ink text-sm">{{ $t(`quiz.priority.${opt.value}.label`) }}</span>
                <span class="block text-xs text-taupe">{{ $t(`quiz.priority.${opt.value}.desc`) }}</span>
              </span>
            </button>
          </div>
        </div>

        <div v-else key="step-4">
          <div class="text-center mb-phi-3">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-tint flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
              <Icon name="mdi:check-decagram" class="text-3xl text-white" />
            </div>
            <p class="text-xs font-bold text-gold uppercase tracking-widest mb-2">{{ $t('quiz.resultsEyebrow') }}</p>
            <h2 class="text-phi-h1 font-bold text-ink mb-3">{{ $t('quiz.resultsTitle') }}</h2>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-tint/60 text-ink">{{ categoryLabel }}</span>
              <span v-if="focusLabel" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-tint/60 text-ink">{{ focusLabel }}</span>
              <span v-if="priorityLabel" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-tint/60 text-ink">{{ priorityLabel }}</span>
            </div>
          </div>

          <div v-if="loadingResults" class="text-center">
            <div class="inline-flex items-center gap-2 text-sm text-taupe mb-phi-2">
              <Icon name="mdi:loading" class="text-lg text-gold animate-spin" />
              {{ $t('quiz.finding') }}
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
              <div v-for="n in 8" :key="n" class="aspect-square bg-ink/5 rounded-2xl animate-pulse"></div>
            </div>
          </div>

          <div v-else-if="results.length === 0" class="bg-surface rounded-3xl shadow-xl shadow-olive/5 border border-ink/5 p-phi-3 text-center">
            <Icon name="mdi:package-variant-closed" class="text-5xl text-ink/20 mb-4" />
            <p class="text-ink font-semibold mb-1">{{ $t('quiz.noMatches') }}</p>
            <p class="text-sm text-taupe mb-4">{{ $t('quiz.noMatchesText', { category: categoryLabel }) }}</p>
            <NuxtLink
              :to="`/category/${category}`"
              class="inline-block bg-olive text-beige px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gold transition"
            >
              {{ $t('quiz.browse', { category: categoryLabel }) }}
            </NuxtLink>
          </div>

          <template v-else>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2 mb-phi-2">
              <ProductCard
                v-for="product in results"
                :key="product.id"
                :product="product"
                class="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              />
            </div>

            <div class="text-center">
              <NuxtLink
                :to="`/category/${category}?subcategory=${focus}`"
                class="inline-flex items-center gap-1 text-sm text-ink font-semibold hover:text-gold transition"
              >
                {{ $t('quiz.viewAll', { count: resultsTotal }) }}
                <Icon name="mdi:arrow-right" class="text-base rtl:-scale-x-100" />
              </NuxtLink>
            </div>
          </template>

          <div class="text-center mt-phi-3">
            <button
              class="inline-flex items-center gap-1.5 text-sm text-taupe hover:text-ink transition"
              @click="retake"
            >
              <Icon name="mdi:refresh" class="text-base" />
              {{ $t('quiz.retake') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { t, categoryName } = useLang()

useSeoMeta({
  title: () => t('quiz.metaTitle'),
  description: () => t('quiz.metaDescription'),
  ogTitle: () => `${t('quiz.title')} | ${t('common.storeName')}`,
  ogDescription: () => t('quiz.ogDescription')
})

const categories = [
  { value: 'skincare', icon: 'mdi:face-woman-shimmer-outline' },
  { value: 'haircare', icon: 'mdi:hair-dryer-outline' },
  { value: 'makeup', icon: 'mdi:lipstick' },
  { value: 'perfume', icon: 'mdi:spray-bottle' },
]

// Text for each option lives in locales/quiz.ts under quiz.focus.<category>.<value>.
const focusOptions = {
  skincare: [
    { value: 'cleansers', icon: 'mdi:water-outline' },
    { value: 'moisturizers', icon: 'mdi:water-plus-outline' },
    { value: 'serums', icon: 'mdi:eyedropper' },
    { value: 'sunscreen', icon: 'mdi:weather-sunny' },
    { value: 'body-care', icon: 'mdi:human' },
    { value: 'masks-and-scrubs', icon: 'mdi:sparkles' },
  ],
  haircare: [
    { value: 'shampoo', icon: 'mdi:water-outline' },
    { value: 'conditioner-and-treatments', icon: 'mdi:bottle-tonic-outline' },
    { value: 'hair-oils', icon: 'mdi:oil' },
    { value: 'styling', icon: 'mdi:hair-dryer-outline' },
  ],
  makeup: [
    { value: 'face', icon: 'mdi:face-woman-outline' },
    { value: 'eyes', icon: 'mdi:eye-outline' },
    { value: 'lips', icon: 'mdi:lipstick' },
    { value: 'brushes-and-tools', icon: 'mdi:brush-outline' },
  ],
  perfume: [
    { value: 'perfume-sets', icon: 'mdi:gift-outline' },
    { value: 'other', icon: 'mdi:spray-bottle' },
  ],
}

const priorityOptions = [
  { value: 'rating', icon: 'mdi:star-outline' },
  { value: 'bestseller', icon: 'mdi:fire' },
  { value: 'price_asc', icon: 'mdi:cash' },
  { value: 'newest', icon: 'mdi:new-box' },
]

const step = ref(1)
const category = ref('')
const focus = ref('')
const priority = ref('')
const loadingResults = ref(false)
const results = ref([])
const resultsTotal = ref(0)

const currentFocusOptions = computed(() => focusOptions[category.value] ?? [])
const categoryLabel = computed(() => (category.value ? categoryName(category.value) : ''))
const focusLabel = computed(() => {
  const known = (focusOptions[category.value] ?? []).some((o) => o.value === focus.value)
  return known ? t(`quiz.focus.${category.value}.${focus.value}.label`) : ''
})
const priorityLabel = computed(() =>
  priorityOptions.some((p) => p.value === priority.value) ? t(`quiz.priority.${priority.value}.label`) : ''
)

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
