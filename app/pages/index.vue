<template>
  <div>
    <HomeHero />
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
useSeoMeta({
  title: 'Cosmetics, Perfumes, Skincare & Everyday Essentials',
  ogTitle: 'Saadawy Store',
  description: 'Shop cosmetics, perfumes, skincare, haircare, bags, kitchen essentials and more, all in one place. Fast delivery across Egypt.',
  ogDescription: 'Shop cosmetics, perfumes, skincare, haircare, bags, kitchen essentials and more, all in one place. Fast delivery across Egypt.',
  ogImage: '/images/pic.jpg'
})
</script>