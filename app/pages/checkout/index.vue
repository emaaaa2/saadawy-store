<template>
  <div class="px-6 py-phi-3 max-w-2xl mx-auto">
    <h1 class="text-phi-h2 font-bold text-ink mb-phi-3">{{ $t('checkout.title') }}</h1>

    <div v-if="cart.items.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:cart-off" class="text-5xl text-ink/20 mb-4" />
      <p class="text-ink font-semibold mb-1">{{ $t('checkout.empty') }}</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm"
        >{{ $t('checkout.continueShopping') }}</NuxtLink
      >
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-phi-2">
      <div v-if="user" class="flex items-center gap-2 text-sm text-ink/80 bg-sage/10 rounded-xl px-4 py-3">
        <Icon name="mdi:check-circle-outline" class="text-lg text-sage shrink-0" />
        <span>{{ $t('checkout.signedInAs', { email: user.email }) }}</span>
      </div>
      <div v-else class="flex flex-wrap items-center justify-between gap-3 text-sm bg-page border border-ink/10 rounded-xl px-4 py-3">
        <span class="text-ink/80">{{ $t('checkout.guestHint') }}</span>
        <NuxtLink
          to="/login?next=/checkout"
          class="flex items-center gap-2 font-semibold text-ink bg-surface border border-ink/20 rounded-full px-4 py-1.5 hover:border-gold transition shrink-0"
        >
          <GoogleIcon />
          {{ $t('checkout.signIn') }}
        </NuxtLink>
      </div>

      <div class="bg-page border border-ink/10 rounded-2xl p-5">
        <h3 class="font-semibold text-ink mb-3">{{ $t('checkout.summary') }}</h3>
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex justify-between gap-3 text-sm py-2 border-b border-ink/10 last:border-0"
        >
          <span class="text-ink/80"
            ><bdi>{{ productName(item) }}</bdi> × {{ item.quantity }}</span
          >
          <span class="font-medium text-ink shrink-0"
            >{{ price((item.sale_price ?? item.price) * item.quantity) }}</span
          >
        </div>
        <div class="flex items-center gap-2 pt-3 border-t border-ink/10">
          <input
            v-model="couponCode"
            type="text"
            dir="ltr"
            :placeholder="$t('checkout.couponPlaceholder')"
            :disabled="!!appliedCoupon"
            class="flex-1 min-w-0 border border-ink/20 rounded-lg px-3 py-2 outline-none focus:border-gold text-sm uppercase rtl:text-right disabled:bg-ink/5 disabled:text-ink/50"
          />
          <button
            v-if="!appliedCoupon"
            type="button"
            :disabled="isApplyingCoupon || !couponCode.trim()"
            class="text-sm font-semibold text-ink px-4 py-2 rounded-lg border border-ink/20 hover:bg-ink/5 transition disabled:opacity-50 shrink-0"
            @click="handleApplyCoupon"
          >
            {{ isApplyingCoupon ? "..." : $t('checkout.apply') }}
          </button>
          <button
            v-else
            type="button"
            class="text-sm font-semibold text-red-500 px-4 py-2 rounded-lg border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/15 transition shrink-0"
            @click="removeCoupon"
          >
            {{ $t('checkout.remove') }}
          </button>
        </div>
        <p v-if="couponError" class="text-xs text-red-500 mt-1">{{ couponError }}</p>
        <p v-if="appliedCoupon" class="text-xs text-sage mt-1">
          {{ $t('checkout.couponApplied', { code: appliedCoupon.code, amount: price(appliedCoupon.discount) }) }}
        </p>

        <div v-if="appliedCoupon" class="flex justify-between pt-3 text-sm text-ink/70">
          <span>{{ $t('checkout.discount') }}</span>
          <span>- {{ price(appliedCoupon.discount) }}</span>
        </div>
        <div v-if="form.governorate" class="flex justify-between pt-3 text-sm text-ink/70">
          <span>{{ $t('checkout.shipping') }}</span>
          <span>{{ shippingFee === 0 ? $t('checkout.free') : price(shippingFee) }}</span>
        </div>
        <p v-else class="text-xs text-taupe pt-3">{{ $t('checkout.pickGovernorateForShipping') }}</p>
        <div class="flex justify-between pt-3 font-bold text-ink">
          <span>{{ $t('checkout.total') }}</span>
          <span>{{ price(finalTotal) }}</span>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="checkout-name" class="block text-sm font-medium text-ink mb-1"
            >{{ $t('checkout.fullName') }}</label
          >
          <input
            id="checkout-name"
            v-model="form.customerName"
            type="text"
            dir="auto"
            required
            autocomplete="name"
            class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
          />
        </div>
        <div>
          <label for="checkout-phone" class="block text-sm font-medium text-ink mb-1"
            >{{ $t('checkout.phone') }}</label
          >
          <input
            id="checkout-phone"
            v-model="form.phone"
            type="tel"
            dir="ltr"
            required
            autocomplete="tel"
            class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold rtl:text-right"
          />
        </div>
        <div>
          <label for="checkout-governorate" class="block text-sm font-medium text-ink mb-1"
            >{{ $t('checkout.governorate') }}</label
          >
          <select
            id="checkout-governorate"
            v-model="form.governorate"
            required
            class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-surface"
          >
            <option value="" disabled>{{ $t('checkout.pickGovernorate') }}</option>
            <option v-for="g in governorates" :key="g.value" :value="g.value">{{ governorateName(g) }}</option>
          </select>
        </div>
        <div>
          <label for="checkout-address" class="block text-sm font-medium text-ink mb-1"
            >{{ $t('checkout.address') }}</label
          >
          <textarea
            id="checkout-address"
            v-model="form.address"
            required
            dir="auto"
            rows="3"
            autocomplete="street-address"
            class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
          ></textarea>
        </div>
      </div>

      <div>
        <span class="block text-sm font-medium text-ink mb-2"
          >{{ $t('checkout.paymentMethod') }}</span
        >
        <div class="space-y-2">
          <label
            v-for="method in paymentMethods"
            :key="method.value"
            class="flex items-center gap-3 border border-ink/20 rounded-lg p-3 cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5"
          >
            <input
              v-model="form.paymentMethod"
              type="radio"
              :value="method.value"
              required
            />
            <Icon :name="method.icon" class="text-lg text-ink" />
            <span class="text-sm text-ink">{{ $t(`checkout.payment.${method.value}`) }}</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? $t('checkout.placing') : $t('checkout.placeOrder') }}
      </button>
      <p class="text-xs text-taupe text-center -mt-2">
        <template v-for="(part, index) in agreeParts" :key="index">
          <NuxtLink v-if="part === '{terms}'" to="/terms" target="_blank" class="underline hover:text-gold">{{ $t('checkout.terms') }}</NuxtLink>
          <NuxtLink v-else-if="part === '{returns}'" to="/returns" target="_blank" class="underline hover:text-gold">{{ $t('checkout.returnsPolicy') }}</NuxtLink>
          <template v-else>{{ part }}</template>
        </template>
      </p>
    </form>
  </div>
</template>

<script setup>
const cart = useCartStore();
const user = useSupabaseUser();
const toast = useToastStore();
const { t, price, productName, governorateName } = useLang();
const isSubmitting = ref(false);
useSeoMeta({ title: () => t("checkout.title"), robots: "noindex" });
const storeSettings = useStoreSettings();
const paymentMethods = computed(() => enabledPaymentMethods(storeSettings.value));

const { data: shippingSettings } = await useFetch('/api/shipping-settings', { key: 'shipping-settings' });

// "By placing your order you agree to our {terms} and {returns}." with the two parts as links.
const agreeParts = computed(() =>
  t("checkout.agree", { terms: "\u0000{terms}\u0000", returns: "\u0000{returns}\u0000" }).split("\u0000").filter(Boolean)
);

const form = ref({
  customerName: "",
  phone: "",
  governorate: "",
  address: "",
  paymentMethod: "",
});

const couponCode = ref("");
const appliedCoupon = ref(null);
const couponError = ref("");
const isApplyingCoupon = ref(false);

const afterDiscount = computed(() => {
  return appliedCoupon.value
    ? Math.max(0, cart.subtotal - appliedCoupon.value.discount)
    : cart.subtotal;
});

const shippingFee = computed(() => {
  return estimateShipping(form.value.governorate, afterDiscount.value, shippingSettings.value) ?? 0;
});

const finalTotal = computed(() => {
  return afterDiscount.value + shippingFee.value;
});

onMounted(async () => {
  if (!user.value) return;

  const meta = user.value.user_metadata ?? {};
  form.value.customerName ||= meta.full_name || meta.name || "";

  try {
    const { orders } = await $fetch("/api/account/orders", { query: { limit: 1 } });
    const lastOrder = orders[0];
    if (lastOrder) {
      form.value.phone ||= lastOrder.phone || "";
      form.value.governorate ||= lastOrder.governorate || "";
      form.value.address ||= lastOrder.address || "";
    }
  } catch {
    // prefill is a convenience; the form still works empty
  }
});

async function handleApplyCoupon() {
  couponError.value = "";
  isApplyingCoupon.value = true;

  try {
    const result = await $fetch("/api/coupons/validate", {
      method: "POST",
      body: { code: couponCode.value.trim(), subtotal: cart.subtotal },
    });
    appliedCoupon.value = result;
  } catch (error) {
    couponError.value = apiErrorMessage(error, t);
  } finally {
    isApplyingCoupon.value = false;
  }
}

function removeCoupon() {
  appliedCoupon.value = null;
  couponCode.value = "";
  couponError.value = "";
}

// The WhatsApp message the customer sends the store after ordering.
function whatsappMessage(order) {
  const line = (key, value) => t(`checkout.whatsapp.${key}`, { value });
  const lines = [
    t("checkout.whatsapp.placed"),
    line("orderNumber", order.order_number),
    line("name", form.value.customerName),
    line("phone", form.value.phone),
    line("address", form.value.address),
    "",
    t("checkout.whatsapp.items"),
    ...cart.items.map((item) => `- ${productName(item)} x${item.quantity}`),
    "",
    line("total", price(order.total)),
  ];

  if (form.value.paymentMethod === "bank_transfer") {
    const s = storeSettings.value;
    const transfer = [
      s.vodafoneCash && line("vodafoneCash", s.vodafoneCash),
      s.instapay && line("instapay", s.instapay),
      s.bankAccountNumber && line("bankAccount", `${s.bankAccountNumber}${s.bankName ? ` (${s.bankName})` : ""}`),
      s.bankAccountName && line("accountName", s.bankAccountName),
    ].filter(Boolean);
    lines.push("");
    if (transfer.length) lines.push(t("checkout.whatsapp.transferTo"), ...transfer, t("checkout.whatsapp.sendReceipt"));
    else lines.push(t("checkout.whatsapp.askDetails"));
  }

  return lines.join("\n");
}

async function handleSubmit() {
  isSubmitting.value = true

  try {
    const { order } = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        customerName: form.value.customerName,
        phone: form.value.phone,
        governorate: form.value.governorate,
        address: form.value.address,
        paymentMethod: form.value.paymentMethod,
        items: cart.items,
        total: cart.subtotal,
        couponCode: appliedCoupon.value?.code || undefined
      }
    })

    if (form.value.paymentMethod === 'card') {
      try {
        const { clientSecret } = await $fetch('/api/checkout/create-payment', {
          method: 'POST',
          body: {
            orderNumber: order.order_number
          }
        })

        const config = useRuntimeConfig()
        sessionStorage.setItem('lastOrder', JSON.stringify({
          orderNumber: order.order_number,
          customerName: form.value.customerName,
          phone: form.value.phone,
          address: form.value.address,
          items: cart.items,
          total: order.total
        }))
        cart.clearCart()
        window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${config.public.paymobPublicKey}&clientSecret=${clientSecret}`
        return
      } catch (paymentError) {
        toast.error(t('checkout.cardFailed', { order: order.order_number }))
        console.error(paymentError)
        return
      }
    }

    const whatsappUrl = `https://wa.me/${toWhatsAppNumber(storeSettings.value.whatsappOrders)}?text=${encodeURIComponent(whatsappMessage(order))}`
    cart.clearCart()
    window.location.href = whatsappUrl
  } catch (error) {
    toast.error(apiErrorMessage(error, t))
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
