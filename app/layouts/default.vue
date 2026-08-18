<template>
  <div>
        <CartReminder />

    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <WhatsAppButton />
    <ProductQuickView />
    <CartSidebar />
    <AppToast />
  </div>
</template>