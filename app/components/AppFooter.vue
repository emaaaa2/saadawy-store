<template>
  <footer class="bg-olive text-beige">
    <div class="max-w-6xl mx-auto px-6 pt-phi-3 pb-phi-2">
      <div class="grid md:grid-cols-4 gap-phi-3 pb-phi-3 border-b border-beige/10">
        <div class="md:col-span-1">
          <img
            src="/logo-trimmed-beige.svg"
            :alt="$t('common.storeName')"
            class="h-20 mb-phi-1"
          />
          <p class="text-sm text-beige/70 leading-relaxed">
            {{ $t('nav.footer.about') }}
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-phi-1 text-gold text-sm uppercase tracking-wide">{{ $t('nav.footer.shop') }}</h4>
          <ul class="space-y-2.5 text-sm text-beige/80">
            <li v-for="slug in shopCategories" :key="slug">
              <NuxtLink :to="`/category/${slug}`" class="hover:text-gold transition">{{ categoryName(slug) }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-phi-1 text-gold text-sm uppercase tracking-wide">{{ $t('nav.footer.customerService') }}</h4>
          <ul class="space-y-2.5 text-sm text-beige/80">
            <li><NuxtLink to="/about" class="hover:text-gold transition">{{ $t('nav.footer.aboutUs') }}</NuxtLink></li>
            <li><NuxtLink to="/track-order" class="hover:text-gold transition">{{ $t('nav.trackOrder') }}</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-gold transition">{{ $t('nav.footer.contact') }}</NuxtLink></li>
            <li><NuxtLink to="/wishlist" class="hover:text-gold transition">{{ $t('nav.wishlist') }}</NuxtLink></li>
            <li><NuxtLink to="/returns" class="hover:text-gold transition">{{ $t('nav.footer.returns') }}</NuxtLink></li>
            <li>
              <a
                :href="supportWhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-gold transition"
              >{{ $t('nav.footer.chatWhatsApp') }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-phi-1 text-gold text-sm uppercase tracking-wide">
            {{ $t('nav.footer.stayInLoop') }}
          </h4>
          <p class="text-sm text-beige/70 mb-phi-1 leading-relaxed">
            {{ $t('nav.footer.newsletterText') }}
          </p>

          <form
            class="flex items-center bg-beige/10 rounded-full ps-4 pe-1 py-1 mb-phi-2 focus-within:ring-1 focus-within:ring-gold transition"
            @submit.prevent="handleSubscribe"
          >
            <input
              v-model="email"
              type="email"
              dir="ltr"
              :placeholder="$t('nav.footer.emailPlaceholder')"
              required
              class="bg-transparent flex-1 min-w-0 text-sm text-beige placeholder-beige/50 outline-none rtl:text-right"
            />
            <button
              type="submit"
              :disabled="isSubscribing"
              class="w-8 h-8 shrink-0 rounded-full bg-gold text-olive flex items-center justify-center hover:bg-beige transition disabled:opacity-50"
              :aria-label="$t('nav.footer.subscribe')"
            >
              <Icon name="mdi:send-outline" class="text-sm rtl:-scale-x-100" />
            </button>
          </form>

          <div class="flex items-center gap-3">
            <a
              v-for="channel in channels"
              :key="channel.name"
              :href="channel.link"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="channel.name"
              class="w-9 h-9 rounded-full bg-beige/10 flex items-center justify-center hover:bg-gold hover:text-olive transition"
            >
              <Icon :name="channel.icon" class="text-lg" />
            </a>
          </div>
        </div>
      </div>

      <div class="pt-phi-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-beige/60">
        <p>{{ $t('nav.footer.rights', { year: new Date().getFullYear() }) }}</p>
        <nav class="flex items-center gap-4" :aria-label="$t('nav.footer.policies')">
          <NuxtLink to="/privacy" class="hover:text-gold transition">{{ $t('nav.footer.privacy') }}</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-gold transition">{{ $t('nav.footer.terms') }}</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup>
const email = ref("");
const isSubscribing = ref(false);
const toast = useToastStore();
const { t, categoryName } = useLang();
const shopCategories = ["skincare", "makeup", "haircare", "perfume", "bags", "kitchen", "hijab"];

async function handleSubscribe() {
  isSubscribing.value = true;

  try {
    const { alreadySubscribed } = await $fetch("/api/newsletter", {
      method: "POST",
      body: { email: email.value },
    });

    toast.show(t(alreadySubscribed ? "nav.footer.alreadySubscribed" : "nav.footer.subscribed"));
    email.value = "";
  } catch (error) {
    toast.error(t("common.somethingWrong"));
  } finally {
    isSubscribing.value = false;
  }
}
const settings = useStoreSettings();
const supportWhatsApp = computed(() => `https://wa.me/${toWhatsAppNumber(settings.value.whatsappSupport)}`);

const channels = computed(() =>
  [
    { name: "WhatsApp", icon: "mdi:whatsapp", link: supportWhatsApp.value },
    { name: "Facebook", icon: "mdi:facebook", link: settings.value.facebookUrl },
    { name: "Instagram", icon: "mdi:instagram", link: settings.value.instagramUrl },
    { name: "TikTok", icon: "mdi:music-note", link: settings.value.tiktokUrl },
  ].filter((channel) => channel.link)
);
</script>
