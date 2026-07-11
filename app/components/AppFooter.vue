<template>
  <footer class="bg-olive text-beige px-6 pt-phi-2 pb-phi-4">
    <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-phi-3">
      <div class="md:col-span-1">
        <img src="/logo.svg" alt="Saadawy Store" class="h-24 mb-phi-1" />
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
        <h4 class="font-semibold mb-phi-1 text-gold">Customer Service</h4>
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
            <NuxtLink to="/shipping" class="hover:text-gold transition"
              >Shipping & Delivery</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/returns" class="hover:text-gold transition"
              >Returns & Exchanges</NuxtLink
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
        <h4 class="font-semibold mb-phi-1 text-gold">
          Subscribe to our Newsletter
        </h4>
        <p class="text-sm text-beige/70 mb-phi-1 leading-relaxed">
          Be the first to know about new arrivals and exclusive offers.
        </p>

        <form
          class="flex items-center bg-beige/10 rounded-full pl-4 pr-1 py-1 mb-phi-2"
          @submit.prevent="handleSubscribe"
        >
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            class="bg-transparent flex-1 text-sm text-beige placeholder-beige/50 outline-none"
          />
          <button
            type="submit"
            class="w-8 h-8 shrink-0 rounded-full bg-gold text-olive flex items-center justify-center hover:bg-beige transition"
            aria-label="Subscribe"
          >
            <Icon name="mdi:send-outline" class="text-sm" />
          </button>
        </form>

        <div class="flex items-center gap-4">
          <a href="#" aria-label="Instagram" class="hover:text-gold transition">
            <Icon name="mdi:instagram" class="text-xl" />
          </a>
          <a href="#" aria-label="Facebook" class="hover:text-gold transition">
            <Icon name="mdi:facebook" class="text-xl" />
          </a>
          <a href="#" aria-label="TikTok" class="hover:text-gold transition">
            <Icon name="mdi:music-note" class="text-xl" />
          </a>
          <a href="#" aria-label="WhatsApp" class="hover:text-gold transition">
            <Icon name="mdi:whatsapp" class="text-xl" />
          </a>
        </div>
      </div>
    </div>

    <div
      class="max-w-6xl mx-auto border-t border-beige/20 mt-phi-3 pt-phi-1 text-sm text-beige/60 text-center"
    >
      © {{ new Date().getFullYear() }} Saadawy Store. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
const email = ref("");

function handleSubscribe() {
  console.log("Subscribed with:", email.value);
  alert("Thank you for subscribing!");
  email.value = "";
}
</script>
