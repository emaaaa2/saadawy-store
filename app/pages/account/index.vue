<template>
  <div class="px-6 py-phi-3 max-w-3xl mx-auto">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-phi-3">
      <div class="flex items-center gap-4">
        <img
          v-if="avatarUrl && !avatarFailed"
          :src="avatarUrl"
          alt=""
          referrerpolicy="no-referrer"
          class="w-14 h-14 rounded-full object-cover border border-ink/10"
          @error="avatarFailed = true"
        />
        <div v-else class="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xl font-bold">
          {{ initial }}
        </div>
        <div>
          <span class="inline-block text-xs font-semibold text-gold uppercase tracking-wide">{{ $t('pages.account.eyebrow') }}</span>
          <h1 dir="auto" class="text-xl md:text-phi-h3 font-bold text-ink leading-tight">{{ displayName }}</h1>
          <p class="text-sm text-taupe">{{ user?.email }}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink
          v-if="isAdmin"
          to="/admin"
          class="flex items-center gap-2 text-sm font-semibold bg-olive text-beige px-5 py-2 rounded-full hover:bg-gold hover:text-olive transition"
        >
          <Icon name="mdi:view-dashboard-outline" class="text-base" />
          {{ $t('pages.account.adminDashboard') }}
        </NuxtLink>
        <button
          type="button"
          :disabled="isSigningOut"
          class="text-sm font-semibold text-ink px-5 py-2 rounded-full border border-ink/20 hover:bg-ink/5 transition disabled:opacity-50"
          @click="signOut"
        >
          {{ isSigningOut ? $t('pages.account.signingOut') : $t('pages.account.signOut') }}
        </button>
      </div>
    </div>

    <h2 class="text-lg font-bold text-ink mb-4">{{ $t('pages.account.myOrders') }}</h2>

    <div v-if="pending" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-24 bg-ink/5 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-page border border-ink/10 rounded-2xl p-6 text-center">
      <p class="text-ink font-semibold mb-1">{{ $t('pages.account.loadFailed') }}</p>
      <button type="button" class="text-sm font-semibold text-gold hover:underline" @click="refresh()">{{ $t('pages.account.tryAgain') }}</button>
    </div>

    <div v-else-if="orders.length === 0" class="bg-page border border-ink/10 rounded-2xl p-phi-3 text-center">
      <Icon name="mdi:shopping-outline" class="text-4xl text-ink/20 mb-3" />
      <p class="text-ink font-semibold mb-1">{{ $t('pages.account.noOrders') }}</p>
      <p class="text-sm text-taupe mb-4">{{ $t('pages.account.noOrdersText') }}</p>
      <NuxtLink
        to="/"
        class="inline-block bg-olive text-beige px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gold hover:text-olive transition"
      >
        {{ $t('pages.account.startShopping') }}
      </NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.order_number"
        class="bg-surface border border-ink/10 rounded-2xl p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p class="font-bold text-ink tabular-nums">{{ order.order_number }}</p>
            <p class="text-xs text-taupe">
              {{ date(order.created_at) }}
              <template v-if="order.payment_method"> · {{ $t(`pages.account.payment.${order.payment_method}`) }}</template>
            </p>
          </div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full" :class="statusStyles[order.status] ?? 'bg-ink/5 text-ink'">
            {{ $t(`checkout.track.status.${order.status}`) }}
          </span>
        </div>

        <ul class="space-y-1 mb-3">
          <li v-for="item in order.items" :key="item.id" class="flex justify-between gap-3 text-sm text-ink/80">
            <span class="truncate"><bdi>{{ item.name }}</bdi> × {{ item.quantity }}</span>
            <span class="shrink-0 tabular-nums">{{ price((item.sale_price ?? item.price) * item.quantity) }}</span>
          </li>
        </ul>

        <div class="flex justify-between gap-3 pt-3 border-t border-ink/10 text-sm">
          <span class="text-taupe">
            {{ order.shipping_fee ? $t('pages.account.shipping', { amount: price(order.shipping_fee) }) : $t('pages.account.freeShipping') }}
            <template v-if="order.discount"> · {{ $t('pages.account.saved', { amount: price(order.discount) }) }}</template>
          </span>
          <span class="font-bold text-ink tabular-nums">{{ price(order.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'customer-auth' })

const { t, price, date } = useLang()
useSeoMeta({ title: () => t('pages.account.metaTitle'), robots: 'noindex' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const isSigningOut = ref(false)
const avatarFailed = ref(false)
const { isAdmin, check: checkAdmin } = useAdminAccess()
onMounted(checkAdmin)

const { data, pending, error, refresh } = await useFetch('/api/account/orders')
const orders = computed(() => data.value?.orders ?? [])

const meta = computed(() => user.value?.user_metadata ?? {})
const displayName = computed(() => meta.value.full_name || meta.value.name || user.value?.email || t('pages.account.eyebrow'))
const avatarUrl = computed(() => meta.value.avatar_url || meta.value.picture || '')
const initial = computed(() => displayName.value.charAt(0).toUpperCase())

const statusStyles = {
  awaiting_payment: 'bg-taupe/10 text-taupe',
  pending: 'bg-gold/10 text-gold',
  confirmed: 'bg-sage/10 text-sage',
  delivered: 'bg-green-50 dark:bg-green-500/15 text-green-600',
  cancelled: 'bg-red-50 dark:bg-red-500/15 text-red-500',
}

async function signOut() {
  isSigningOut.value = true
  await supabase.auth.signOut()
  await navigateTo('/')
}
</script>
