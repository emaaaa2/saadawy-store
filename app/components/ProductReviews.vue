<template>
  <div class="mt-phi-4 max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-phi-h2 font-bold text-ink mb-1">{{ $t('product.reviews.title') }}</h2>
        <div v-if="reviews.length > 0" class="flex items-center gap-2">
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-base"
              :class="star <= Math.round(averageRating) ? 'text-gold' : 'text-ink/15'"
            />
          </div>
          <span class="text-sm text-taupe">
            {{ tc('product.reviewsSummary', reviews.length, { rating: averageRating.toFixed(1) }) }}
          </span>
        </div>
        <p v-else class="text-sm text-taupe">{{ $t('product.reviews.none') }}</p>
      </div>

      <button
        class="text-sm font-semibold text-gold hover:underline shrink-0"
        @click="showForm = !showForm"
      >
        {{ showForm ? $t('product.reviews.cancel') : $t('product.reviews.write') }}
      </button>
    </div>

    <form
      v-if="showForm"
      class="bg-page border border-ink/10 rounded-2xl p-5 mb-6 space-y-3"
      @submit.prevent="handleSubmit"
    >
      <div class="grid sm:grid-cols-2 gap-3">
        <input
          v-model="form.customerName"
          type="text"
          dir="auto"
          :placeholder="$t('product.reviews.name')"
          required
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-surface text-sm"
        />
        <input
          v-model="form.location"
          type="text"
          dir="auto"
          :placeholder="$t('product.reviews.location')"
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-surface text-sm"
        />
      </div>

      <div class="flex gap-1">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          :aria-label="$t('product.reviews.rate', { n: star })"
          @click="form.rating = star"
        >
          <Icon
            name="mdi:star"
            class="text-2xl transition"
            :class="star <= form.rating ? 'text-gold' : 'text-ink/15'"
          />
        </button>
      </div>

      <textarea
        v-model="form.comment"
        required
        rows="3"
        maxlength="1000"
        dir="auto"
        :placeholder="$t('product.reviews.comment')"
        class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold bg-surface text-sm"
      ></textarea>

      <button
        type="submit"
        :disabled="isSubmitting || form.rating === 0"
        class="bg-olive text-beige px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? $t('product.reviews.submitting') : $t('product.reviews.submit') }}
      </button>
    </form>

    <div v-if="reviews.length > 0" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border-b border-ink/10 pb-4 last:border-0"
      >
        <div class="flex items-center justify-between mb-1">
          <p dir="auto" class="font-semibold text-ink text-sm">{{ review.customer_name }}</p>
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-sm"
              :class="star <= review.rating ? 'text-gold' : 'text-ink/15'"
            />
          </div>
        </div>
        <p v-if="review.location" dir="auto" class="text-xs text-taupe mb-2">{{ review.location }}</p>
        <p dir="auto" class="text-sm text-ink/80 leading-relaxed">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  productId: { type: String, required: true },
  openTrigger: { type: Number, default: 0 },
});

const toast = useToastStore();
const { t, tc } = useLang();

const { data } = await useFetch("/api/reviews", {
  query: { productId: props.productId, limit: 50 },
});

const reviews = computed(() => data.value?.reviews ?? []);
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  return reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length;
});

const showForm = ref(false);

watch(
  () => props.openTrigger,
  (value) => {
    if (value > 0) showForm.value = true;
  }
);
const isSubmitting = ref(false);
const form = ref({
  customerName: "",
  location: "",
  rating: 0,
  comment: "",
});

async function handleSubmit() {
  if (form.value.rating === 0) {
    toast.error(t("product.reviews.pickRating"));
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/reviews", {
      method: "POST",
      body: { ...form.value, productId: props.productId },
    });
    toast.show(t("product.reviews.thanks"));
    showForm.value = false;
    form.value = { customerName: "", location: "", rating: 0, comment: "" };
  } catch (error) {
    toast.error(apiErrorMessage(error, t));
  } finally {
    isSubmitting.value = false;
  }
}
</script>
