<template>
  <section class="bg-white px-6 py-6 md:py-phi-3">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-phi-3 items-center bg-beige border border-olive/10 rounded-3xl overflow-hidden">
      <div class="p-6 md:p-phi-3">
        <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
          Visit Us
        </span>
        <h2 class="text-xl md:text-phi-h2 font-bold text-olive mb-4">
          Our Store Location
        </h2>

        <div v-if="settings.address" class="flex items-start gap-3 mb-4">
          <Icon name="mdi:map-marker-outline" class="text-2xl text-gold shrink-0 mt-0.5" />
          <p class="text-olive/80 leading-relaxed">{{ settings.address }}</p>
        </div>

        <div v-if="settings.openingHours" class="flex items-start gap-3 mb-6">
          <Icon name="mdi:clock-outline" class="text-2xl text-gold shrink-0 mt-0.5" />
          <p class="text-olive/80">{{ settings.openingHours }}</p>
        </div>

        <a
          v-if="settings.mapUrl"
          :href="settings.mapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition"
        >
          <Icon name="mdi:map" class="text-lg" />
          Get Directions
        </a>
      </div>

      <div class="h-64 md:h-full min-h-[300px]">
        <iframe
          src="https://www.google.com/maps?q=30.1331467,31.2787858&output=embed"
          class="w-full h-full border-0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
const settings = useStoreSettings()
</script>
