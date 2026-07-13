<template>
  <section class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-phi-3 items-center bg-beige border border-olive/10 rounded-3xl overflow-hidden">
      <div class="p-8 md:p-phi-3">
        <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
          Visit Us
        </span>
        <h2 class="text-phi-h2 font-bold text-olive mb-4">
          Our Store Location
        </h2>

        <div class="flex items-start gap-3 mb-4">
          <Icon name="mdi:map-marker-outline" class="text-2xl text-gold shrink-0 mt-0.5" />
          <p class="text-olive/80 leading-relaxed">
            برج الحرمين، الشارع الجديد، شبرا الخيمة، بجوار مستشفى وادي الطب
          </p>
        </div>

        <div class="flex items-start gap-3 mb-6">
          <Icon name="mdi:clock-outline" class="text-2xl text-gold shrink-0 mt-0.5" />
          <p class="text-olive/80">
            Open daily: 10:00 AM – 2:00 AM
          </p>
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=%D8%A8%D8%B1%D8%AC%20%D8%A7%D9%84%D8%AD%D8%B1%D9%85%D9%8A%D9%86%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B1%D8%B9%20%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF%20%D8%B4%D8%A8%D8%B1%D8%A7%20%D8%A7%D9%84%D8%AE%D9%8A%D9%85%D8%A9%20%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89%20%D9%88%D8%A7%D8%AF%D9%8A%20%D8%A7%D9%84%D8%B7%D8%A8"
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
          src="https://www.google.com/maps?q=%D8%A8%D8%B1%D8%AC%20%D8%A7%D9%84%D8%AD%D8%B1%D9%85%D9%8A%D9%86%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B1%D8%B9%20%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF%20%D8%B4%D8%A8%D8%B1%D8%A7%20%D8%A7%D9%84%D8%AE%D9%8A%D9%85%D8%A9%20%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89%20%D9%88%D8%A7%D8%AF%D9%8A%20%D8%A7%D9%84%D8%B7%D8%A8&output=embed"
          class="w-full h-full border-0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </section>
</template>