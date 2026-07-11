<template>
  <header class="px-6 py-4 bg-olive relative overflow-visible">
    <div class="flex items-center justify-between gap-6">
      <NuxtLink to="/" class="shrink-0">
        <img src="/logo.svg" alt="Saadawy Store" class="h-24 -my-4" />
      </NuxtLink>

      <nav
        class="hidden md:flex items-center gap-8 text-beige font-medium text-base absolute left-1/2 -translate-x-1/2"
      >
        <NuxtLink to="/" class="hover:text-gold transition">Home</NuxtLink>
        <NuxtLink to="/category/skincare" class="hover:text-gold transition"
          >Skincare</NuxtLink
        >
        <NuxtLink to="/category/perfume" class="hover:text-gold transition"
          >Perfume</NuxtLink
        >
        <NuxtLink to="/category/bags" class="hover:text-gold transition"
          >Bags</NuxtLink
        >
        <NuxtLink to="/category/kitchen" class="hover:text-gold transition"
          >Kitchen</NuxtLink
        >
        <NuxtLink to="/category/hijab" class="hover:text-gold transition"
          >Hijab & Essentials</NuxtLink
        >
      </nav>

      <div class="flex items-center gap-5 text-beige shrink-0">
        <div
          class="hidden lg:flex items-center bg-beige/10 rounded-full px-4 py-2 gap-2"
        >
          <Icon name="mdi:magnify" class="text-beige text-xl" />
          <input
            type="text"
            placeholder="Search products..."
            class="bg-transparent text-beige placeholder-beige/60 outline-none text-sm w-40 focus:w-56 transition-all"
          />
        </div>

        <button
          class="lg:hidden hidden sm:block hover:text-gold transition"
          aria-label="Search"
        >
          <Icon name="mdi:magnify" class="text-2xl" />
        </button>

        <button
          class="hidden sm:block hover:text-gold transition"
          aria-label="Wishlist"
        >
          <Icon name="mdi:heart-outline" class="text-2xl" />
        </button>

        <button
          class="hidden sm:block hover:text-gold transition"
          aria-label="Account"
        >
          <Icon name="mdi:account-outline" class="text-2xl" />
        </button>

        <button class="relative hover:text-gold transition" aria-label="Cart">
          <Icon name="mdi:cart-outline" class="text-2xl" />
          <span
            class="absolute -top-2 -right-2 bg-gold text-olive text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
          >
            0
          </span>
        </button>

        <button
          class="md:hidden"
          aria-label="Menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <Icon
            :name="isMenuOpen ? 'mdi:close' : 'mdi:menu'"
            class="text-2xl"
          />
        </button>
      </div>
    </div>

    <div
      v-if="isMenuOpen"
      class="md:hidden pt-4 mt-4 border-t border-beige/20 text-beige"
    >
      <nav class="flex flex-col gap-4 font-medium">
        <NuxtLink
          to="/"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Home</NuxtLink
        >
        <NuxtLink
          to="/category/skincare"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Skincare</NuxtLink
        >
        <NuxtLink
          to="/category/perfume"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Perfume</NuxtLink
        >
        <NuxtLink
          to="/category/bags"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Bags</NuxtLink
        >
        <NuxtLink
          to="/category/kitchen"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Kitchen</NuxtLink
        >
        <NuxtLink
          to="/category/hijab"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Hijab & Essentials</NuxtLink
        >
      </nav>

      <div
        class="flex items-center gap-6 pt-4 mt-4 border-t border-beige/20 sm:hidden"
      >
        <button
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
          aria-label="Search"
        >
          <Icon name="mdi:magnify" class="text-xl" />
          <span>Search</span>
        </button>
        <button
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
          aria-label="Wishlist"
        >
          <Icon name="mdi:heart-outline" class="text-xl" />
          <span>Wishlist</span>
        </button>
        <button
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
          aria-label="Account"
        >
          <Icon name="mdi:account-outline" class="text-xl" />
          <span>Account</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const isMenuOpen = ref(false);
</script>
