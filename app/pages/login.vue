<template>
  <div class="px-6 py-phi-4 max-w-md mx-auto text-center">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">My Account</span>
    <h1 class="text-phi-h2 font-bold text-olive mb-3">Sign in to Saadawy</h1>
    <p class="text-sm text-taupe mb-phi-3 max-w-xs mx-auto">
      See all your orders in one place and check out faster next time.
    </p>

    <button
      type="button"
      :disabled="isRedirecting"
      class="w-full flex items-center justify-center gap-3 bg-white border border-olive/20 rounded-full py-3 font-semibold text-olive hover:border-gold hover:shadow-md transition disabled:opacity-60"
      @click="signInWithGoogle(next)"
    >
      <GoogleIcon />
      {{ isRedirecting ? 'Opening Google…' : 'Continue with Google' }}
    </button>
    <p v-if="errorMessage" class="text-sm text-red-500 mt-3">{{ errorMessage }}</p>

    <p class="text-sm text-taupe mt-phi-3">
      Prefer not to sign in?
      <NuxtLink :to="cart.items.length ? '/checkout' : '/'" class="font-semibold text-olive hover:text-gold transition">
        {{ cart.items.length ? 'Check out as a guest' : 'Keep shopping' }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Sign in', robots: 'noindex' })

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
