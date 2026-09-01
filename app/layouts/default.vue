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
    <WelcomeOfferPopup />
  </div>
</template>