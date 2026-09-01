<template>
  <div class="px-8 py-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-olive mb-2">Shipping</h1>
    <p class="text-sm text-taupe mb-6">
      Set the shipping fee for each governorate tier, and the order total that qualifies for free shipping.
    </p>

    <form class="bg-white rounded-2xl border border-olive/10 p-5 space-y-5" @submit.prevent="handleSave">
      <div>
        <label class="block text-sm font-medium text-olive mb-1">
          Tier 1 — Cairo, Giza, Qalyubia
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="form.tier1_fee"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
          />
          <span class="text-sm text-taupe shrink-0">EGP</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-1">
          Tier 2 — Alexandria, Delta & Canal cities
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="form.tier2_fee"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
          />
          <span class="text-sm text-taupe shrink-0">EGP</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-1">
          Tier 3 — Upper Egypt, Sinai & remote areas
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="form.tier3_fee"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
          />
          <span class="text-sm text-taupe shrink-0">EGP</span>
        </div>
      </div>

      <div class="pt-3 border-t border-olive/10">
        <label class="block text-sm font-medium text-olive mb-1">
          Free shipping over
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="form.free_shipping_threshold"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold text-sm"
          />
          <span class="text-sm text-taupe shrink-0">EGP</span>
        </div>
        <p class="text-xs text-taupe mt-1">Orders at or above this total (after coupon discount) get free shipping.</p>
      </div>

      <button
        type="submit"
        :disabled="isSaving"
        class="bg-olive text-beige px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSaving ? "Saving..." : "Save Changes" }}
      </button>

      <p v-if="savedMessage" class="text-sm text-sage">{{ savedMessage }}</p>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin-auth",
});

const { data } = await useFetch("/api/admin/shipping-settings");

const form = ref({
  tier1_fee: data.value?.tier1_fee ?? 50,
  tier2_fee: data.value?.tier2_fee ?? 70,
  tier3_fee: data.value?.tier3_fee ?? 100,
  free_shipping_threshold: data.value?.free_shipping_threshold ?? 500,
});

const isSaving = ref(false);
const savedMessage = ref("");
const errorMessage = ref("");

async function handleSave() {
  isSaving.value = true;
  savedMessage.value = "";
  errorMessage.value = "";

  try {
    await $fetch("/api/admin/shipping-settings", {
      method: "PATCH",
      body: form.value,
    });
    savedMessage.value = "Shipping settings saved.";
  } catch (error) {
    errorMessage.value = error.data?.statusMessage || "Something went wrong.";
  } finally {
    isSaving.value = false;
  }
}
</script>
