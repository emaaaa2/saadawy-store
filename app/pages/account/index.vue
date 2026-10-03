<template>
  <div class="px-6 py-phi-3 max-w-3xl mx-auto">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-phi-3">
      <div class="flex items-center gap-4">
        <img
          v-if="avatarUrl && !avatarFailed"
          :src="avatarUrl"
          alt=""
          referrerpolicy="no-referrer"
          class="w-14 h-14 rounded-full object-cover border border-olive/10"
          @error="avatarFailed = true"
        />
        <div v-else class="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xl font-bold">
          {{ initial }}
        </div>
        <div>
          <span class="inline-block text-xs font-semibold text-gold uppercase tracking-wide">My Account</span>
          <h1 class="text-xl md:text-phi-h3 font-bold text-olive leading-tight">{{ displayName }}</h1>
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
          Admin Dashboard
        </NuxtLink>
        <button
          type="button"
          :disabled="isSigningOut"
          class="text-sm font-semibold text-olive px-5 py-2 rounded-full border border-olive/20 hover:bg-olive/5 transition disabled:opacity-50"
          @click="signOut"
        >
          {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
        </button>
      </div>
    </div>

    <h2 class="text-lg font-bold text-olive mb-4">My Orders</h2>

    <div v-if="pending" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-24 bg-olive/5 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-beige border border-olive/10 rounded-2xl p-6 text-center">
      <p class="text-olive font-semibold mb-1">Couldn't load your orders</p>
      <button type="button" class="text-sm font-semibold text-gold hover:underline" @click="refresh()">Try again</button>
    </div>

    <div v-else-if="orders.length === 0" class="bg-beige border border-olive/10 rounded-2xl p-phi-3 text-center">
      <Icon name="mdi:shopping-outline" class="text-4xl text-olive/20 mb-3" />
      <p class="text-olive font-semibold mb-1">No orders yet</p>
      <p class="text-sm text-taupe mb-4">Orders you place while signed in will show up here.</p>
      <NuxtLink
        to="/"
        class="inline-block bg-olive text-beige px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gold hover:text-olive transition"
      >
        Start shopping
      </NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.order_number"
        class="bg-white border border-olive/10 rounded-2xl p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p class="font-bold text-olive tabular-nums">{{ order.order_number }}</p>
            <p class="text-xs text-taupe">{{ formatDate(order.created_at) }} · {{ paymentLabel(order.payment_method) }}</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full" :class="statusStyles[order.status] ?? 'bg-olive/5 text-olive'">
            {{ statusLabels[order.status] ?? order.status }}
          </span>
        </div>

        <ul class="space-y-1 mb-3">
          <li v-for="item in order.items" :key="item.id" class="flex justify-between gap-3 text-sm text-olive/80">
            <span class="truncate"><bdi>{{ item.name }}</bdi> × {{ item.quantity }}</span>
            <span class="shrink-0 tabular-nums">EGP {{ (item.sale_price ?? item.price) * item.quantity }}</span>
          </li>
        </ul>

        <div class="flex justify-between pt-3 border-t border-olive/10 text-sm">
          <span class="text-taupe">
            {{ order.shipping_fee ? `Shipping EGP ${order.shipping_fee}` : 'Free shipping' }}
            <template v-if="order.discount"> · Saved EGP {{ order.discount }}</template>
          </span>
          <span class="font-bold text-olive tabular-nums">EGP {{ order.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'customer-auth' })
useSeoMeta({ title: 'My Account', robots: 'noindex' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const isSigningOut = ref(false)
const avatarFailed = ref(false)
const { isAdmin, check: checkAdmin } = useAdminAccess()
onMounted(checkAdmin)

const { data, pending, error, refresh } = await useFetch('/api/account/orders')
const orders = computed(() => data.value?.orders ?? [])

const meta = computed(() => user.value?.user_metadata ?? {})
const displayName = computed(() => meta.value.full_name || meta.value.name || user.value?.email || 'My Account')
const avatarUrl = computed(() => meta.value.avatar_url || meta.value.picture || '')
const initial = computed(() => displayName.value.charAt(0).toUpperCase())

const statusLabels = {
  awaiting_payment: 'Awaiting Payment',
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const statusStyles = {
  awaiting_payment: 'bg-taupe/10 text-taupe',
  pending: 'bg-gold/10 text-gold',
  confirmed: 'bg-sage/10 text-sage',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-500',
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function paymentLabel(method) {
  return { cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer', card: 'Card' }[method] ?? method
}

async function signOut() {
  isSigningOut.value = true
  await supabase.auth.signOut()
  await navigateTo('/')
}
</script>
