<template>
  <div>
    <HomeHero />
    <div v-fade-in>
      <QuizBanner />
    </div>
    <div v-fade-in>
      <CategoryGrid />
    </div>
    <div v-fade-in>
      <BestSellers />
    </div>
    <div v-fade-in>
      <NewCollection />
    </div>
    <!-- <div v-fade-in>
      <InstagramGallery />
    </div> -->
    <div v-fade-in>
      <WhyUs />
    </div>
    <div v-fade-in>
      <ReviewsSection />
    </div>
    <div v-fade-in>
      <StoreLocation />
    </div>
  </div>
</template>

<script setup>
const { t } = useLang()

useSeoMeta({
  title: () => t('home.metaTitle'),
  ogTitle: () => t('common.storeName'),
  description: () => t('home.metaDescription'),
  ogDescription: () => t('home.metaDescription'),
  ogImage: '/images/pic.jpg'
})
</script>
