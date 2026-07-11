<template>
  <footer class="bg-olive text-beige px-6 py-phi-4">
    <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-phi-3">
      <div class="md:col-span-1">
        <img src="/logo.svg" alt="Saadawy Store" class="h-16 mb-phi-1" />
        <p class="text-sm text-beige/70 leading-relaxed">
          A lifestyle retail store offering a carefully selected range of beauty
          and everyday essentials — cosmetics, perfumes, skincare, haircare,
          accessories, handbags, and home.
        </p>
      </div>

      <div>
        <h4 class="font-semibold mb-phi-1 text-gold">Shop</h4>
        <ul class="space-y-2 text-sm text-beige/80">
          <li>
            <NuxtLink to="/category/skincare" class="hover:text-gold transition"
              >Skincare</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/category/perfume" class="hover:text-gold transition"
              >Perfume</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/category/bags" class="hover:text-gold transition"
              >Bags</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/category/kitchen" class="hover:text-gold transition"
              >Kitchen</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/category/hijab" class="hover:text-gold transition"
              >Hijab & Essentials</NuxtLink
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold mb-phi-1 text-gold">Company</h4>
        <ul class="space-y-2 text-sm text-beige/80">
          <li>
            <NuxtLink to="/about" class="hover:text-gold transition"
              >About Us</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/contact" class="hover:text-gold transition"
              >Contact</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/faq" class="hover:text-gold transition"
              >FAQ</NuxtLink
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold mb-phi-1 text-gold">Get in Touch</h4>
        <ul class="space-y-2 text-sm text-beige/80">
          <li class="flex items-center gap-2">
            <Icon name="mdi:whatsapp" class="text-lg" />
            +20 1xx xxx xxxx
          </li>
          <li class="flex items-center gap-2">
            <Icon name="mdi:email-outline" class="text-lg" />
            hello@saadawy.com
          </li>
          <li class="flex items-center gap-3 pt-2">
            <a
              href="#"
              aria-label="Instagram"
              class="hover:text-gold transition"
            >
              <Icon name="mdi:instagram" class="text-xl" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              class="hover:text-gold transition"
            >
              <Icon name="mdi:facebook" class="text-xl" />
            </a>
            <a href="#" aria-label="TikTok" class="hover:text-gold transition">
              <Icon name="mdi:music-note" class="text-xl" />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="max-w-6xl mx-auto border-t border-beige/20 mt-phi-3 pt-phi-1 text-sm text-beige/60 text-center"
    >
      © {{ new Date().getFullYear() }} Saadawy Store. All rights reserved.
    </div>
  </footer>
</template>
