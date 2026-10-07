<template>
  <div class="px-6 py-phi-4 max-w-md mx-auto text-center">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">{{ $t('pages.login.eyebrow') }}</span>
    <h1 class="text-phi-h2 font-bold text-ink mb-3">{{ $t('pages.login.title') }}</h1>
    <p class="text-sm text-taupe mb-phi-3 max-w-xs mx-auto">
      {{ $t('pages.login.text') }}
    </p>

    <button
      type="button"
      :disabled="isRedirecting"
      class="w-full flex items-center justify-center gap-3 bg-surface border border-ink/20 rounded-full py-3 font-semibold text-ink hover:border-gold hover:shadow-md transition disabled:opacity-60"
      @click="signInWithGoogle(next)"
    >
      <GoogleIcon />
      {{ isRedirecting ? $t('pages.login.opening') : $t('pages.login.google') }}
    </button>
    <p v-if="errorMessage" class="text-sm text-red-500 mt-3">{{ $t('pages.login.unavailable') }}</p>

    <p class="text-sm text-taupe mt-phi-3">
      {{ $t('pages.login.preferNot') }}
      <NuxtLink :to="cart.items.length ? '/checkout' : '/'" class="font-semibold text-ink hover:text-gold transition">
        {{ cart.items.length ? $t('pages.login.guestCheckout') : $t('pages.login.keepShopping') }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup>
const { t } = useLang()
useSeoMeta({ title: () => t('pages.login.metaTitle'), robots: 'noindex' })

const route = useRoute()
const user = useSupabaseUser()
const cart = useCartStore()
const next = safeRedirectPath(route.query.next, '/account')
const { signInWithGoogle, isRedirecting, errorMessage } = useGoogleSignIn()

watch(
  user,
  (value) => {
    if (value) navigateTo(next, { replace: true })
  },
  { immediate: true }
)
</script>
