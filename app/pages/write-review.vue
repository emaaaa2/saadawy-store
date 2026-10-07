<template>
  <div class="px-6 py-phi-4 max-w-lg mx-auto">
    <div class="text-center mb-phi-3">
      <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
        {{ $t('pages.writeReview.eyebrow') }}
      </span>
      <h1 class="text-phi-h1 font-bold text-ink">{{ $t('pages.writeReview.title') }}</h1>
    </div>

    <div v-if="submitted" class="text-center py-phi-3">
      <Icon name="mdi:check-circle" class="text-6xl text-sage mb-4" />
      <p class="text-ink font-semibold mb-1">{{ $t('pages.writeReview.thanks') }}</p>
      <p class="text-sm text-taupe">
        {{ $t('pages.writeReview.thanksText') }}
      </p>
      <NuxtLink to="/" class="inline-block mt-6 text-gold hover:underline text-sm">
        {{ $t('pages.writeReview.backHome') }}
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="review-name" class="block text-sm font-medium text-ink mb-1">{{ $t('pages.writeReview.name') }}</label>
        <input
          id="review-name"
          v-model="form.customerName"
          type="text"
          dir="auto"
          required
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />
      </div>

      <div>
        <label for="review-location" class="block text-sm font-medium text-ink mb-1">
          {{ $t('pages.writeReview.location') }} <span class="text-taupe font-normal">{{ $t('pages.writeReview.optional') }}</span>
        </label>
        <input
          id="review-location"
          v-model="form.location"
          type="text"
          dir="auto"
          :placeholder="$t('pages.writeReview.locationPlaceholder')"
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />
      </div>

      <div>
        <span class="block text-sm font-medium text-ink mb-2">{{ $t('pages.writeReview.rating') }}</span>
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
              class="text-3xl transition"
              :class="star <= form.rating ? 'text-gold' : 'text-ink/15'"
            />
          </button>
        </div>
      </div>

      <div>
        <label for="review-comment" class="block text-sm font-medium text-ink mb-1">{{ $t('pages.writeReview.review') }}</label>
        <textarea
          id="review-comment"
          v-model="form.comment"
          required
          dir="auto"
          rows="4"
          maxlength="1000"
          class="w-full border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting || form.rating === 0"
        class="w-full bg-olive text-beige py-3.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
      >
        {{ isSubmitting ? $t('product.reviews.submitting') : $t('product.reviews.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup>
const { t } = useLang();
useSeoMeta({ title: () => t("pages.writeReview.metaTitle") });

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
    toast.error(t("product.reviews.pickRating"));
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
    toast.error(apiErrorMessage(error, t));
  } finally {
    isSubmitting.value = false;
  }
}
</script>
