<template>
  <div class="px-6 py-phi-3 max-w-2xl mx-auto">
    <h1 class="text-phi-h2 font-bold text-olive mb-phi-3">Checkout</h1>

    <div v-if="cart.items.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:cart-off" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">Your cart is empty</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm"
        >Continue shopping</NuxtLink
      >
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-phi-2">
      <div class="bg-beige border border-olive/10 rounded-2xl p-5">
        <h3 class="font-semibold text-olive mb-3">Order Summary</h3>
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex justify-between text-sm py-2 border-b border-olive/10 last:border-0"
        >
          <span class="text-olive/80"
            >{{ item.name }} × {{ item.quantity }}</span
          >
          <span class="font-medium text-olive"
            >EGP {{ (item.sale_price ?? item.price) * item.quantity }}</span
          >
        </div>
        <div class="flex items-center gap-2 pt-3 border-t border-olive/10">
          <input
            v-model="couponCode"
            type="text"
            placeholder="Coupon code"
            :disabled="!!appliedCoupon"
            class="flex-1 border border-olive/20 rounded-lg px-3 py-2 outline-none focus:border-gold text-sm uppercase disabled:bg-olive/5 disabled:text-olive/50"
          />
          <button
            v-if="!appliedCoupon"
            type="button"
            :disabled="isApplyingCoupon || !couponCode.trim()"
            class="text-sm font-semibold text-olive px-4 py-2 rounded-lg border border-olive/20 hover:bg-olive/5 transition disabled:opacity-50 shrink-0"
            @click="handleApplyCoupon"
          >
            {{ isApplyingCoupon ? "..." : "Apply" }}
          </button>
          <button
            v-else
            type="button"
            class="text-sm font-semibold text-red-500 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition shrink-0"
            @click="removeCoupon"
          >
            Remove
          </button>
        </div>
        <p v-if="couponError" class="text-xs text-red-500 mt-1">{{ couponError }}</p>
        <p v-if="appliedCoupon" class="text-xs text-sage mt-1">
          Coupon "{{ appliedCoupon.code }}" applied — you saved EGP {{ appliedCoupon.discount }}
        </p>

        <div v-if="appliedCoupon" class="flex justify-between pt-3 text-sm text-olive/70">
          <span>Discount</span>
          <span>- EGP {{ appliedCoupon.discount }}</span>
        </div>
        <div v-if="form.governorate" class="flex justify-between pt-3 text-sm text-olive/70">
          <span>Shipping</span>
          <span>{{ shippingFee === 0 ? 'Free' : `EGP ${shippingFee}` }}</span>
        </div>
        <p v-else class="text-xs text-taupe pt-3">Select a governorate to see shipping cost</p>
        <div class="flex justify-between pt-3 font-bold text-olive">
          <span>Total</span>
          <span>EGP {{ finalTotal }}</span>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-olive mb-1"
            >Full Name</label
          >
          <input
            v-model="form.customerName"
            type="text"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-olive mb-1"
            >Phone Number</label
          >
          <input
            v-model="form.phone"
            type="tel"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-olive mb-1"
            >Governorate</label
          >
          <select
            v-model="form.governorate"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-white"
          >
            <option value="" disabled>Select your governorate</option>
            <option v-for="g in governorates" :key="g.value" :value="g.value">{{ g.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-olive mb-1"
            >Delivery Address</label
          >
          <textarea
            v-model="form.address"
            required
            rows="3"
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
          ></textarea>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-2"
          >Payment Method</label
        >
        <div class="space-y-2">
          <label
            class="flex items-center gap-3 border border-olive/20 rounded-lg p-3 cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5"
          >
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="cash_on_delivery"
              required
            />
            <Icon name="mdi:cash" class="text-lg text-olive" />
            <span class="text-sm text-olive">Cash on Delivery</span>
          </label>

          <label
            class="flex items-center gap-3 border border-olive/20 rounded-lg p-3 cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5"
          >
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="bank_transfer"
              required
            />
            <Icon name="mdi:bank-transfer" class="text-lg text-olive" />
            <span class="text-sm text-olive"
              >Bank Transfer / Vodafone Cash</span
            >
          </label>

          <label
            class="flex items-center gap-3 border border-olive/20 rounded-lg p-3 cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5"
          >
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="card"
              required
            />
            <Icon name="mdi:credit-card-outline" class="text-lg text-olive" />
            <span class="text-sm text-olive">Pay by Card</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? "Placing Order..." : "Place Order" }}
      </button>
    </form>
  </div>
</template>

<script setup>
const cart = useCartStore();
const isSubmitting = ref(false);

const { data: shippingSettings } = await useFetch('/api/shipping-settings');

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
    couponError.value = error.data?.statusMessage || "Invalid coupon code";
  } finally {
    isApplyingCoupon.value = false;
  }
}

function removeCoupon() {
  appliedCoupon.value = null;
  couponCode.value = "";
  couponError.value = "";
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
        alert(`Your order ${order.order_number} was saved, but starting the card payment failed. Please try again or contact us on WhatsApp.`)
        console.error(paymentError)
        return
      }
    }

    const itemsList = cart.items
      .map((item) => `- ${item.name} x${item.quantity}`)
      .join('%0A')

    let message = `Hi! I just placed an order.%0AOrder Number: ${order.order_number}%0AName: ${form.value.customerName}%0APhone: ${form.value.phone}%0AAddress: ${encodeURIComponent(form.value.address)}%0A%0AItems:%0A${itemsList}%0A%0ATotal: EGP ${order.total}`

    if (form.value.paymentMethod === 'bank_transfer') {
      message += `%0A%0APlease transfer to:%0AVodafone Cash: 01000000000%0ABank Account: XXXXXXXXXXXX (Bank Name)%0AThen send me the receipt here.`
    }

    const whatsappUrl = `https://wa.me/201025287580?text=${message}`
    cart.clearCart()
    window.location.href = whatsappUrl
  } catch (error) {
    alert('Something went wrong. Please try again.')
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>