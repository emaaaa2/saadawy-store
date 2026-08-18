<template>
  <section v-if="reviews.length > 0" class="bg-white px-6 py-6 md:py-phi-3">
    <div class="max-w-6xl mx-auto">
    <div class="text-center mb-4 md:mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        Customer Reviews
      </span>
      <h2 class="text-xl md:text-phi-h2 font-bold text-olive mb-3">
        What Our Customers Say
      </h2>
      <NuxtLink
        to="/write-review"
        class="text-sm font-semibold text-gold hover:underline"
      >
        Write a Review
      </NuxtLink>
    </div>

    <div class="grid md:grid-cols-3 gap-phi-2">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="relative bg-beige border border-olive/10 rounded-2xl p-6"
      >
        <Icon name="mdi:format-quote-close" class="absolute top-4 right-4 text-4xl text-gold/20" />

        <div class="flex items-center justify-between mb-3">
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-base"
              :class="star <= review.rating ? 'text-gold' : 'text-olive/15'"
            />
          </div>
          <span class="flex items-center gap-1 text-xs text-sage font-medium">
            <Icon name="mdi:check-decagram" class="text-sm" />
            Verified
          </span>
        </div>

        <p class="text-sm text-olive/80 leading-relaxed mb-5">
          {{ review.comment }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-olive/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-olive/10 flex items-center justify-center font-semibold text-olive text-sm">
              {{ review.customer_name.charAt(0) }}
            </div>
            <div>
              <p class="font-semibold text-olive text-sm">{{ review.customer_name }}</p>
              <p class="text-xs text-taupe">{{ review.location }}</p>
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
const { data } = await useFetch("/api/reviews", { query: { limit: 6 } });
const reviews = computed(() => data.value?.reviews ?? []);

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const units = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "week", secs: 604800 },
    { label: "day", secs: 86400 },
  ];

  for (const unit of units) {
    const count = Math.floor(seconds / unit.secs);
    if (count >= 1) return `${count} ${unit.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Today";
}
</script>
