<template>
  <section class="bg-sage/10 px-6 py-phi-4">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-phi-4">
        <span
          class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-phi-1"
        >
          Why Saadawy
        </span>
        <h2 class="text-phi-h2 font-bold text-olive">
          More than just products
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-phi-3 text-center">
        <div v-for="item in points" :key="item.title">
          <div
            class="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-olive/10"
          >
            <Icon :name="item.icon" class="text-2xl text-olive" />
          </div>
          <h3 class="font-semibold text-olive text-lg mb-2">
            {{ item.title }}
          </h3>
          <p class="text-taupe text-sm leading-relaxed">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const points = [
  {
    title: "Carefully Curated",
    desc: "Every piece is hand-picked by us before it ever reaches you — no randomness, no filler.",
    icon: "mdi:check-decagram-outline",
  },
  {
    title: "Always Fresh",
    desc: "New arrivals every week, so there is always something new to discover.",
    icon: "mdi:refresh",
  },
  {
    title: "Delivered to Your Door",
    desc: "Order from anywhere, and we bring it straight to you — no hassle, no long trips.",
    icon: "mdi:truck-fast-outline",
  },
];
</script>
