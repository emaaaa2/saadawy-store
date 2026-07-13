<template>
  <section class="relative px-6 py-phi-4 overflow-hidden">
    <img
      src="/images/pic.jpg"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-olive/80"></div>

    <div class="relative max-w-4xl mx-auto text-center text-beige">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        Why Customers Love Saadawy
      </span>
      <h2 class="text-phi-h2 font-bold mb-phi-3">
        Why Thousands Choose Saadawy
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
        <div v-for="stat in stats" :key="stat.label">
          <p class="text-3xl md:text-4xl font-bold text-gold mb-1">{{ stat.number }}</p>
          <p class="text-sm text-beige/80">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { number: '5000+', label: 'Happy Customers' },
  { number: '2500+', label: 'Products' },
  { number: '6+', label: 'Categories' },
  { number: 'Weekly', label: 'New Arrivals' },
]
</script>