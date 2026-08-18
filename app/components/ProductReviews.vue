<template>
  <div class="mt-phi-4 max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-phi-h2 font-bold text-olive mb-1">Reviews</h2>
        <div v-if="reviews.length > 0" class="flex items-center gap-2">
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-base"
              :class="star <= Math.round(averageRating) ? 'text-gold' : 'text-olive/15'"
            />
          </div>
          <span class="text-sm text-taupe">
            {{ averageRating.toFixed(1) }} ({{ reviews.length }} review{{ reviews.length > 1 ? "s" : "" }})
          </span>
        </div>
        <p v-else class="text-sm text-taupe">No reviews yet — be the first!</p>
      </div>

      <button
        class="text-sm font-semibold text-gold hover:underline shrink-0"
        @click="showForm = !showForm"
      >
        {{ showForm ? "Cancel" : "Write a Review" }}
      </button>
    </div>

    <form
      v-if="showForm"
      class="bg-beige border border-olive/10 rounded-2xl p-5 mb-6 space-y-3"
      @submit.prevent="handleSubmit"
    >
      <div class="grid sm:grid-cols-2 gap-3">
        <input
          v-model="form.customerName"
          type="text"
          placeholder="Your Name"
          required
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-white text-sm"
        />
        <input
          v-model="form.location"
          type="text"
          placeholder="Location (optional)"
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-white text-sm"
        />
      </div>

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
            class="text-2xl transition"
            :class="star <= form.rating ? 'text-gold' : 'text-olive/15'"
          />
        </button>
      </div>

      <textarea
        v-model="form.comment"
        required
        rows="3"
        maxlength="1000"
        placeholder="Share your experience with this product..."
        class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-white text-sm"
      ></textarea>

      <button
        type="submit"
        :disabled="isSubmitting || form.rating === 0"
        class="bg-olive text-beige px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? "Submitting..." : "Submit Review" }}
      </button>
    </form>

    <div v-if="reviews.length > 0" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border-b border-olive/10 pb-4 last:border-0"
      >
        <div class="flex items-center justify-between mb-1">
          <p class="font-semibold text-olive text-sm">{{ review.customer_name }}</p>
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-sm"
              :class="star <= review.rating ? 'text-gold' : 'text-olive/15'"
            />
          </div>
        </div>
        <p v-if="review.location" class="text-xs text-taupe mb-2">{{ review.location }}</p>
        <p class="text-sm text-olive/80 leading-relaxed">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  productId: { type: String, required: true },
});

const toast = useToastStore();

const { data, refresh } = await useFetch("/api/reviews", {
  query: { productId: props.productId, limit: 50 },
});

const reviews = computed(() => data.value?.reviews ?? []);
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  return reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length;
});

const showForm = ref(false);
const isSubmitting = ref(false);
const form = ref({
  customerName: "",
  location: "",
  rating: 0,
  comment: "",
});

async function handleSubmit() {
  if (form.value.rating === 0) {
    toast.show("Please select a rating");
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/reviews", {
      method: "POST",
      body: { ...form.value, productId: props.productId },
    });
    toast.show("Thank you! Your review will appear after a quick check.");
    showForm.value = false;
    form.value = { customerName: "", location: "", rating: 0, comment: "" };
  } catch (error) {
    toast.show(error.data?.statusMessage || "Something went wrong. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}

function openForm() {
  showForm.value = true;
}

defineExpose({ openForm });
</script>
