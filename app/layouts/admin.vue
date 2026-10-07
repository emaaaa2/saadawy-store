<template>
  <div class="min-h-screen bg-stone-100 text-stone-800 font-body">
    <AdminSidebar />
    <div class="lg:ps-64 min-w-0">
      <AdminTopbar />
      <main class="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
        <slot />
      </main>
    </div>
    <AdminConfirmDialog />
    <AppToast />
  </div>
</template>

<script setup>
const isNavOpen = useState('admin-nav-open', () => false)
const route = useRoute()

watch(() => route.fullPath, () => { isNavOpen.value = false })

const { t } = useLang()
useHead({ titleTemplate: (title) => (title ? `${title} · ${t('admin.titleSuffix')}` : t('admin.titleSuffix')) })
</script>
