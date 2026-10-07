<template>
  <div class="px-6 py-phi-4 max-w-lg mx-auto">
    <div class="text-center mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        {{ $t('checkout.track.eyebrow') }}
      </span>
      <h1 class="text-phi-h1 font-bold text-ink">{{ $t('checkout.track.title') }}</h1>
    </div>

    <form v-if="!order" class="space-y-4" @submit.prevent="handleTrack">
      <div>
        <label for="track-order-number" class="block text-sm font-medium text-ink mb-1">{{ $t('checkout.track.orderNumber') }}</label>
        <input
          id="track-order-number"
          v-model="form.orderNumber"
          type="text"
          dir="ltr"
          :placeholder="$t('checkout.track.orderPlaceholder')"
          required
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold rtl:text-right"
        />
      </div>

      <div>
        <label for="track-phone" class="block text-sm font-medium text-ink mb-1">{{ $t('checkout.track.phone') }}</label>
        <input
          id="track-phone"
          v-model="form.phone"
          type="tel"
          dir="ltr"
          :placeholder="$t('checkout.track.phoneHint')"
          required
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold rtl:text-right"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isLoading ? $t('checkout.track.checking') : $t('checkout.track.submit') }}
      </button>
    </form>

    <div v-else>
      <div class="bg-page border border-ink/10 rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-1">
          <p class="font-semibold text-ink">{{ $t('checkout.track.orderLabel', { number: order.order_number }) }}</p>
          <span
            class="text-xs font-bold px-2.5 py-1 rounded-full"
            :class="statusStyles[order.status]"
          >
            {{ $t(`checkout.track.status.${order.status}`) }}
          </span>
        </div>
        <p class="text-xs text-taupe">
          {{ $t('checkout.track.placedOn', { date: date(order.created_at) }) }}
        </p>
      </div>

      <div v-if="order.status !== 'cancelled'" class="flex items-center mb-8">
        <template v-for="(step, index) in steps" :key="step.value">
          <div class="flex flex-col items-center flex-1">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :class="stepIndex >= index ? 'bg-olive text-beige' : 'bg-ink/10 text-ink/30'"
            >
              <Icon :name="step.icon" class="text-lg" />
            </div>
            <p
              class="text-xs mt-2 text-center"
              :class="stepIndex >= index ? 'text-ink font-semibold' : 'text-ink/40'"
            >
              {{ $t(`checkout.track.steps.${step.key}`) }}
            </p>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="h-0.5 flex-1 -mt-6"
            :class="stepIndex > index ? 'bg-olive' : 'bg-ink/10'"
          ></div>
        </template>
      </div>

      <div v-else class="flex items-center gap-3 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 mb-8">
        <Icon name="mdi:close-circle" class="text-2xl text-red-500 shrink-0" />
        <p class="text-sm text-red-600">{{ $t('checkout.track.cancelledNotice') }}</p>
      </div>

      <div class="border-t border-ink/10 pt-4 mb-6">
        <p class="text-xs font-semibold text-ink/60 uppercase tracking-wide mb-3">
          {{ $t('checkout.track.itemsCount', { count: order.items.length }) }}
        </p>
        <div class="space-y-2">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span class="text-ink/80"><bdi>{{ item.name }}</bdi> × {{ item.quantity }}</span>
            <span class="font-medium text-ink shrink-0">
              {{ price((item.sale_price ?? item.price) * item.quantity) }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 mt-3 border-t border-ink/10 font-bold text-ink">
          <span>{{ $t('checkout.track.total') }}</span>
          <span>{{ price(order.total) }}</span>
        </div>
      </div>

      <button
        class="text-sm text-gold hover:underline"
        @click="order = null"
      >
        {{ $t('checkout.track.trackAnother') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { t, price, date } = useLang();

useSeoMeta({
  title: () => t("checkout.track.metaTitle"),
  description: () => t("checkout.track.metaDescription"),
});

const form = ref({ orderNumber: "", phone: "" });
const order = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const steps = [
  { value: "pending", key: "placed", icon: "mdi:cart-check" },
  { value: "confirmed", key: "confirmed", icon: "mdi:check-circle-outline" },
  { value: "delivered", key: "delivered", icon: "mdi:package-variant-closed-check" },
];

const statusStyles = {
  awaiting_payment: "bg-taupe/10 text-taupe",
  pending: "bg-gold/10 text-gold",
  confirmed: "bg-sage/10 text-sage",
  delivered: "bg-green-50 dark:bg-green-500/15 text-green-600",
  cancelled: "bg-red-50 dark:bg-red-500/15 text-red-500",
};

const stepIndex = computed(() => {
  if (!order.value) return -1;
  const status = order.value.status === "awaiting_payment" ? "pending" : order.value.status;
  return steps.findIndex((s) => s.value === status);
});

async function handleTrack() {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    const { order: foundOrder } = await $fetch("/api/track-order", {
      query: { orderNumber: form.value.orderNumber.trim(), phone: form.value.phone.trim() },
    });
    order.value = foundOrder;
  } catch (error) {
    errorMessage.value = apiErrorMessage(error, t);
  } finally {
    isLoading.value = false;
  }
}
</script>
