<template>
  <div class="px-8 py-8 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-olive mb-6">Coupons</h1>

    <div class="bg-white rounded-2xl border border-olive/10 p-5 mb-6">
      <h2 class="font-semibold text-olive mb-3">Create a Coupon</h2>
      <form class="grid sm:grid-cols-2 gap-3" @submit.prevent="handleCreate">
        <input
          v-model="form.code"
          type="text"
          placeholder="CODE (e.g. WELCOME10)"
          required
          class="border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm uppercase"
        />

        <select
          v-model="form.discountType"
          class="border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount (EGP)</option>
        </select>

        <input
          v-model.number="form.discountValue"
          type="number"
          min="0.01"
          step="0.01"
          :placeholder="form.discountType === 'percentage' ? 'Discount % (e.g. 10)' : 'Discount EGP (e.g. 50)'"
          required
          class="border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        />

        <input
          v-model.number="form.minOrderTotal"
          type="number"
          min="0"
          step="0.01"
          placeholder="Minimum order (optional)"
          class="border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        />

        <input
          v-model.number="form.usageLimit"
          type="number"
          min="1"
          placeholder="Usage limit (optional)"
          class="border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        />

        <input
          v-model="form.expiresAt"
          type="date"
          class="border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
        />

        <button
          type="submit"
          :disabled="isCreating"
          class="sm:col-span-2 bg-olive text-beige px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition disabled:opacity-50"
        >
          {{ isCreating ? "Creating..." : "Create Coupon" }}
        </button>
      </form>
    </div>

    <div v-if="pending" class="text-center py-12 text-olive/50">Loading...</div>

    <div v-else-if="coupons.length === 0" class="text-center py-12 text-olive/50">
      No coupons yet.
    </div>

    <div v-else class="bg-white rounded-2xl overflow-hidden border border-olive/10">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-olive/10 text-left text-olive/50 text-xs uppercase tracking-wide">
            <th class="px-5 py-3 font-medium">Code</th>
            <th class="px-5 py-3 font-medium">Discount</th>
            <th class="px-5 py-3 font-medium">Used</th>
            <th class="px-5 py-3 font-medium">Expires</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="coupon in coupons"
            :key="coupon.id"
            class="border-b border-olive/5 last:border-0"
          >
            <td class="px-5 py-3 font-mono font-semibold text-olive">{{ coupon.code }}</td>
            <td class="px-5 py-3 text-olive/80">
              {{ coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `EGP ${coupon.discount_value}` }}
            </td>
            <td class="px-5 py-3 text-taupe">
              {{ coupon.used_count }}{{ coupon.usage_limit ? ` / ${coupon.usage_limit}` : '' }}
            </td>
            <td class="px-5 py-3 text-taupe">
              {{ coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '—' }}
            </td>
            <td class="px-5 py-3">
              <button
                class="text-xs font-bold px-2.5 py-1 rounded-full"
                :class="coupon.active ? 'bg-sage/10 text-sage' : 'bg-taupe/10 text-taupe'"
                @click="toggleActive(coupon)"
              >
                {{ coupon.active ? "Active" : "Disabled" }}
              </button>
            </td>
            <td class="px-5 py-3 text-right">
              <button
                class="text-red-500 hover:text-red-600 transition"
                aria-label="Delete coupon"
                @click="handleDelete(coupon)"
              >
                <Icon name="mdi:trash-can-outline" class="text-lg" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { data, pending, refresh } = await useFetch('/api/admin/coupons')
const coupons = computed(() => data.value?.coupons ?? [])

const toast = useToastStore()

const form = ref({
  code: '',
  discountType: 'percentage',
  discountValue: null,
  minOrderTotal: null,
  usageLimit: null,
  expiresAt: ''
})

const isCreating = ref(false)

async function handleCreate() {
  isCreating.value = true

  try {
    await $fetch('/api/admin/coupons', {
      method: 'POST',
      body: form.value
    })
    toast.show(`Coupon "${form.value.code.toUpperCase()}" created`)
    form.value = { code: '', discountType: 'percentage', discountValue: null, minOrderTotal: null, usageLimit: null, expiresAt: '' }
    refresh()
  } catch (error) {
    toast.show(error.data?.statusMessage || 'Something went wrong. Please try again.')
  } finally {
    isCreating.value = false
  }
}

async function toggleActive(coupon) {
  await $fetch(`/api/admin/coupons/${coupon.id}`, {
    method: 'PATCH',
    body: { active: !coupon.active }
  })
  refresh()
}

async function handleDelete(coupon) {
  const confirmed = confirm(`Delete coupon "${coupon.code}"?`)
  if (!confirmed) return

  await $fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
  refresh()
}
</script>
