<template>
  <section class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="text-center mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        Customer Reviews
      </span>
      <h2 class="text-phi-h2 font-bold text-olive">
        What Our Customers Say
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-phi-2">
      <div
        v-for="review in reviews"
        :key="review.name"
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
          {{ review.text }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-olive/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-olive/10 flex items-center justify-center font-semibold text-olive text-sm">
              {{ review.name.charAt(0) }}
            </div>
            <div>
              <p class="font-semibold text-olive text-sm">{{ review.name }}</p>
              <p class="text-xs text-taupe">{{ review.location }}</p>
            </div>
          </div>
          <p class="text-xs text-taupe">{{ review.date }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const reviews = [
  {
    name: 'Sara Ahmed',
    location: 'Cairo',
    rating: 5,
    date: '2 weeks ago',
    text: 'Amazing quality products and super fast delivery. My go-to store for skincare now!'
  },
  {
    name: 'Mona Khaled',
    location: 'Alexandria',
    rating: 5,
    date: '1 month ago',
    text: 'Love the variety here — found everything from perfume to kitchen essentials in one place.'
  },
  {
    name: 'Nour Hassan',
    location: 'Giza',
    rating: 4,
    date: '1 month ago',
    text: 'Great customer service and beautiful packaging. Will definitely order again.'
  }
]
</script>