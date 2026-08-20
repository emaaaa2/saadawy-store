<template>
  <div class="px-6 py-phi-4 max-w-lg mx-auto">
    <div class="text-center mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        Order Status
      </span>
      <h1 class="text-phi-h1 font-bold text-olive">Track Your Order</h1>
    </div>

    <form v-if="!order" class="space-y-4" @submit.prevent="handleTrack">
      <div>
        <label class="block text-sm font-medium text-olive mb-1">Order Number</label>
        <input
          v-model="form.orderNumber"
          type="text"
          placeholder="e.g. SDW-123456"
          required
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-1">Phone Number</label>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="The phone number you ordered with"
          required
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isLoading ? "Searching..." : "Track Order" }}
      </button>
    </form>

    <div v-else>
      <div class="bg-beige border border-olive/10 rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-1">
          <p class="font-semibold text-olive">Order {{ order.order_number }}</p>
          <span
            class="text-xs font-bold px-2.5 py-1 rounded-full"
            :class="statusStyles[order.status]"
          >
            {{ statusLabels[order.status] }}
          </span>
        </div>
        <p class="text-xs text-taupe">
          Placed on {{ new Date(order.created_at).toLocaleDateString() }}
        </p>
      </div>

      <div v-if="order.status !== 'cancelled'" class="flex items-center mb-8">
        <template v-for="(step, index) in steps" :key="step.value">
          <div class="flex flex-col items-center flex-1">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :class="stepIndex >= index ? 'bg-olive text-beige' : 'bg-olive/10 text-olive/30'"
            >
              <Icon :name="step.icon" class="text-lg" />
            </div>
            <p
              class="text-xs mt-2 text-center"
              :class="stepIndex >= index ? 'text-olive font-semibold' : 'text-olive/40'"
            >
              {{ step.label }}
            </p>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="h-0.5 flex-1 -mt-6"
            :class="stepIndex > index ? 'bg-olive' : 'bg-olive/10'"
          ></div>
        </template>
      </div>

      <div v-else class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
        <Icon name="mdi:close-circle" class="text-2xl text-red-500 shrink-0" />
        <p class="text-sm text-red-600">This order has been cancelled.</p>
      </div>

      <div class="border-t border-olive/10 pt-4 mb-6">
        <p class="text-xs font-semibold text-olive/60 uppercase tracking-wide mb-3">
          Items ({{ order.items.length }})
        </p>
        <div class="space-y-2">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-olive/80">{{ item.name }} × {{ item.quantity }}</span>
            <span class="font-medium text-olive">
              EGP {{ (item.sale_price ?? item.price) * item.quantity }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 mt-3 border-t border-olive/10 font-bold text-olive">
          <span>Total</span>
          <span>EGP {{ order.total }}</span>
        </div>
      </div>

      <button
        class="text-sm text-gold hover:underline"
        @click="order = null"
      >
        Track another order
      </button>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: "Track Your Order",
  description: "Track your Saadawy Store order status using your order number and phone number.",
});

const form = ref({ orderNumber: "", phone: "" });
const order = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const steps = [
  { value: "pending", label: "Order Placed", icon: "mdi:cart-check" },
  { value: "confirmed", label: "Confirmed", icon: "mdi:check-circle-outline" },
  { value: "delivered", label: "Delivered", icon: "mdi:package-variant-closed-check" },
];

const statusLabels = {
  awaiting_payment: "Awaiting Payment",
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusStyles = {
  awaiting_payment: "bg-taupe/10 text-taupe",
  pending: "bg-gold/10 text-gold",
  confirmed: "bg-sage/10 text-sage",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
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
    errorMessage.value = error.data?.statusMessage || "Something went wrong. Please try again.";
  } finally {
    isLoading.value = false;
  }
}
</script>
