<template>
  <div>
    <HomeHero />
    <div v-fade-in>
      <QuizBanner />
    </div>
    <div v-fade-in>
      <CategoryGrid />
    </div>

    <!-- Product shelves, store-style: offers, best sellers, new arrivals, then one row per section. -->
    <div v-fade-in>
      <ProductRail :title="$t('home.deals')" :products="shelves?.deals" badge="Sale" />
    </div>
    <div v-fade-in>
      <BestSellers />
    </div>
    <div v-fade-in>
      <ProductRail :title="$t('home.newArrivals')" link="/new-arrivals" :products="shelves?.newArrivals" />
    </div>
    <div v-for="section in shelves?.sections ?? []" :key="section.slug" v-fade-in>
      <ProductRail :title="categoryName(section.slug)" :link="`/category/${section.slug}`" :products="section.products" />
    </div>

    <!-- <div v-fade-in>
      <InstagramGallery />
    </div> -->
    <div v-fade-in>
      <WhyUs :shelves="shelves" />
    </div>
    <ExploreGrid />
    <div v-fade-in>
      <ReviewsSection />
    </div>
    <div v-fade-in>
      <StoreLocation />
    </div>
  </div>
</template>

<script setup>
const { t, categoryName } = useLang()

const { data: shelves } = await useFetch('/api/home', { key: 'home-shelves' })

useSeoMeta({
  title: () => t('home.metaTitle'),
  ogTitle: () => t('common.storeName'),
  description: () => t('home.metaDescription'),
  ogDescription: () => t('home.metaDescription'),
  ogImage: '/images/pic.jpg'
})
</script>
