<template>
  <div class="px-6 py-phi-4 max-w-lg mx-auto">
    <div class="text-center mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        Share Your Experience
      </span>
      <h1 class="text-phi-h1 font-bold text-olive">Write a Review</h1>
    </div>

    <div v-if="submitted" class="text-center py-phi-3">
      <Icon name="mdi:check-circle" class="text-6xl text-sage mb-4" />
      <p class="text-olive font-semibold mb-1">Thank you for your review!</p>
      <p class="text-sm text-taupe">
        It'll appear on the site after we take a quick look.
      </p>
      <NuxtLink to="/" class="inline-block mt-6 text-gold hover:underline text-sm">
        Back to Home
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-olive mb-1">Your Name</label>
        <input
          v-model="form.customerName"
          type="text"
          required
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-1">
          Location <span class="text-taupe font-normal">(optional)</span>
        </label>
        <input
          v-model="form.location"
          type="text"
          placeholder="e.g. Cairo"
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-2">Rating</label>
        <div class="flex gap-1">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            aria-label="Rate"
            @click="form.rating = star"
          >
            <Icon
              name="mdi:star"
              class="text-3xl transition"
              :class="star <= form.rating ? 'text-gold' : 'text-olive/15'"
            />
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-olive mb-1">Your Review</label>
        <textarea
          v-model="form.comment"
          required
          rows="4"
          maxlength="1000"
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting || form.rating === 0"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? "Submitting..." : "Submit Review" }}
      </button>
    </form>
  </div>
</template>

<script setup>
const form = ref({
  customerName: "",
  location: "",
  rating: 0,
  comment: "",
});

const isSubmitting = ref(false);
const submitted = ref(false);
const toast = useToastStore();

async function handleSubmit() {
  if (form.value.rating === 0) {
    toast.show("Please select a rating");
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/reviews", {
      method: "POST",
      body: form.value,
    });
    submitted.value = true;
  } catch (error) {
    toast.show(error.data?.statusMessage || "Something went wrong. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>
