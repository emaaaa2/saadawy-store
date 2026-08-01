<template>
  <div class="flex bg-beige min-h-screen">
    <AdminSidebar />
    <main class="flex-1 overflow-x-hidden pt-16 lg:pt-0">
      <slot />
    </main>
  </div>
</template>