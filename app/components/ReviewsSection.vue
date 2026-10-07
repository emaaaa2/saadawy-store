<template>
  <section v-if="reviews.length > 0" class="bg-surface px-6 py-6 md:py-phi-3">
    <div class="max-w-6xl mx-auto">
    <div class="text-center mb-4 md:mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        {{ $t('home.reviews.eyebrow') }}
      </span>
      <h2 class="text-xl md:text-phi-h2 font-bold text-ink mb-3">
        {{ $t('home.reviews.title') }}
      </h2>
      <NuxtLink
        to="/write-review"
        class="text-sm font-semibold text-gold hover:underline"
      >
        {{ $t('home.reviews.write') }}
      </NuxtLink>
    </div>

    <!-- Swipeable row on phones, three columns from tablets up. -->
    <div class="flex md:grid md:grid-cols-3 gap-4 md:gap-phi-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 pb-1">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="relative shrink-0 w-[85%] sm:w-[60%] md:w-auto snap-center bg-page border border-ink/10 rounded-2xl p-6 flex flex-col"
      >
        <Icon name="mdi:format-quote-close" class="absolute top-4 end-4 text-4xl text-gold/20" />

        <div class="flex items-center justify-between gap-3 mb-3 pe-10">
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-base"
              :class="star <= review.rating ? 'text-gold' : 'text-ink/15'"
            />
          </div>
          <span class="flex items-center gap-1 text-xs text-sage font-medium">
            <Icon name="mdi:check-decagram" class="text-sm" />
            {{ $t('home.reviews.verified') }}
          </span>
        </div>

        <p dir="auto" class="flex-1 text-sm text-ink/80 leading-relaxed mb-5">
          {{ review.comment }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-ink/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-ink/10 flex items-center justify-center font-semibold text-ink text-sm">
              {{ review.customer_name.charAt(0) }}
            </div>
            <div>
              <p dir="auto" class="font-semibold text-ink text-sm">{{ review.customer_name }}</p>
              <p dir="auto" class="text-xs text-taupe">{{ review.location }}</p>
            </div>
          </div>
          <p class="text-xs text-taupe">{{ timeAgo(review.created_at) }}</p>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup>
const { t, tc } = useLang();
const { data } = await useFetch("/api/reviews", { query: { limit: 6 } });
const reviews = computed(() => data.value?.reviews ?? []);

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const units = [
    { key: "year", secs: 31536000 },
    { key: "month", secs: 2592000 },
    { key: "week", secs: 604800 },
    { key: "day", secs: 86400 },
  ];

  for (const unit of units) {
    const count = Math.floor(seconds / unit.secs);
    if (count >= 1) return tc(`home.reviews.ago.${unit.key}`, count);
  }
  return t("home.reviews.today");
}
</script>
