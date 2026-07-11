<template>
  <section class="bg-beige px-4 py-16 md:py-24">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
      <div class="text-center md:text-left">
        <span
          class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-4"
        >
          New arrivals every week
        </span>

        <h1
          class="text-4xl md:text-5xl font-bold text-olive leading-tight mb-6"
        >
          Everything your home needs,
          <span class="text-gold">in one place</span>
        </h1>

        <p class="text-lg text-taupe max-w-xl mx-auto md:mx-0 mb-8">
          From skincare to bags, kitchen essentials to hijab and everyday needs
          — carefully selected pieces, all under one roof.
        </p>

        <div
          class="flex items-center justify-center md:justify-start gap-4 flex-wrap"
        >
          <NuxtLink
            to="/category/skincare"
            class="bg-olive text-beige px-8 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition"
          >
            Shop Now
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="border border-olive text-olive px-8 py-3 rounded-full font-semibold hover:bg-olive hover:text-beige transition"
          >
            Contact Us
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-3xl overflow-hidden shadow-lg">
        <img
          src="/images/hero.png"
          alt="Saadawy Store products"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  </section>
</template>
