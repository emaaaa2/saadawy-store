<template>
  <section class="px-6 py-8 md:py-phi-4 bg-beige">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-6 md:mb-phi-4">
        <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
          Why Customers Love Saadawy
        </span>
        <h2 class="text-xl md:text-phi-h2 font-bold text-olive">
          Why Thousands Choose Saadawy
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-phi-3">
        <div
          v-for="badge in badges"
          :key="badge.title"
          class="bg-white rounded-2xl border border-olive/10 p-5 md:p-8 text-center"
        >
          <div
            class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center"
          >
            <Icon :name="badge.icon" class="text-2xl md:text-3xl text-gold" />
          </div>
          <h3 class="font-semibold text-olive text-sm md:text-base mb-1">
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
          <div v-for="stat in stats" :key="stat.label">
            <p class="text-3xl md:text-4xl font-bold text-gold mb-1">{{ stat.number }}</p>
            <p class="text-sm text-beige/80">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const badges = [
  {
    icon: "mdi:certificate-outline",
    title: "Original Products",
    description: "100% authentic guaranteed",
  },
  {
    icon: "mdi:shield-check-outline",
    title: "Secure Shopping",
    description: "Safe payments you can trust",
  },
  {
    icon: "mdi:autorenew",
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
  {
    icon: "mdi:truck-fast-outline",
    title: "Fast Delivery",
    description: "Quick & reliable to your door",
  },
];

const stats = [
  { number: '5000+', label: 'Happy Customers' },
  { number: '4000+', label: 'Products' },
  { number: '6+', label: 'Categories' },
  { number: 'Daily', label: 'New Arrivals' },
]
</script>
