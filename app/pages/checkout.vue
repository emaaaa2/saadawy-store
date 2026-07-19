<template>
  <div class="px-6 py-phi-3 max-w-2xl mx-auto">
    <h1 class="text-phi-h2 font-bold text-olive mb-phi-3">Checkout</h1>

    <div v-if="cart.items.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:cart-off" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">Your cart is empty</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm">Continue shopping</NuxtLink>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-phi-2">
      <div class="bg-beige border border-olive/10 rounded-2xl p-5">
        <h3 class="font-semibold text-olive mb-3">Order Summary</h3>
        <div v-for="item in cart.items" :key="item.id" class="flex justify-between text-sm py-2 border-b border-olive/10 last:border-0">
          <span class="text-olive/80">{{ item.name }} × {{ item.quantity }}</span>
          <span class="font-medium text-olive">EGP {{ (item.sale_price ?? item.price) * item.quantity }}</span>
        </div>
        <div class="flex justify-between pt-3 font-bold text-olive">
          <span>Total</span>
          <span>EGP {{ cart.subtotal }}</span>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-olive mb-1">Full Name</label>
          <input v-model="form.customerName" type="text" required class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
        </div>
        <div>
          <label class="block text-sm font-medium text-olive mb-1">Phone Number</label>
          <input v-model="form.phone" type="tel" required class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
        </div>
        <div>
          <label class="block text-sm font-medium text-olive mb-1">Delivery Address</label>
          <textarea v-model="form.address" required rows="3" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"></textarea>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-2">Payment Method</label>
        <div class="space-y-2">
          <label class="flex items-center gap-3 border border-olive/20 rounded-lg p-3 cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5">
            <input v-model="form.paymentMethod" type="radio" value="cash_on_delivery" required />
            <Icon name="mdi:cash" class="text-lg text-olive" />
            <span class="text-sm text-olive">Cash on Delivery</span>
          </label>

          <label class="flex items-center gap-3 border border-olive/20 rounded-lg p-3 cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5">
            <input v-model="form.paymentMethod" type="radio" value="bank_transfer" required />
            <Icon name="mdi:bank-transfer" class="text-lg text-olive" />
            <span class="text-sm text-olive">Bank Transfer / Vodafone Cash</span>
          </label>

          <label class="flex items-center gap-3 border border-olive/10 rounded-lg p-3 opacity-40 cursor-not-allowed">
            <input type="radio" disabled />
            <Icon name="mdi:credit-card-outline" class="text-lg text-olive" />
            <span class="text-sm text-olive">Pay by Card (Coming Soon)</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
      </button>
    </form>
  </div>
</template>

<script setup>
const cart = useCartStore()
const isSubmitting = ref(false)

const form = ref({
  customerName: '',
  phone: '',
  address: '',
  paymentMethod: ''
})

async function handleSubmit() {
  isSubmitting.value = true

  try {
    const { order } = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        customerName: form.value.customerName,
        phone: form.value.phone,
        address: form.value.address,
        paymentMethod: form.value.paymentMethod,
        items: cart.items,
        total: cart.subtotal
      }
    })

let message = `Hi! I just placed an order.%0AOrder Number: ${order.order_number}%0AName: ${form.value.customerName}%0ATotal: EGP ${order.total}`

if (form.value.paymentMethod === 'bank_transfer') {
  message += `%0A%0APlease transfer to:%0AVodafone Cash: 01000000000%0ABank Account: XXXXXXXXXXXX (Bank Name)%0AThen send me the receipt here.`
}    const whatsappUrl = `https://wa.me/201025287580?text=${message}`

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