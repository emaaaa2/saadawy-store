<template>
  <Teleport to="body">
    <Transition name="adm-fade">
      <div v-if="request" class="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="settle(false)"></div>
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-label="request.title"
          class="relative w-full max-w-md bg-surface rounded-xl shadow-2xl p-6"
        >
          <div class="flex gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="request.danger ? 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-ink/10 text-ink'"
            >
              <Icon :name="request.danger ? 'mdi:alert-outline' : 'mdi:help-circle-outline'" class="text-xl" />
            </div>
            <div class="min-w-0 pt-1">
              <h2 class="text-base font-semibold text-stone-800">{{ request.title }}</h2>
              <p v-if="request.message" class="text-sm text-stone-500 mt-1.5 leading-relaxed">{{ request.message }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="adm-btn adm-btn-secondary" @click="settle(false)">{{ $t('admin.common.cancel') }}</button>
            <button
              ref="confirmButton"
              type="button"
              class="adm-btn"
              :class="request.danger ? 'adm-btn-danger' : 'adm-btn-primary'"
              @click="settle(true)"
            >
              {{ request.confirmLabel || $t('admin.common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const { request, settle } = useAdminConfirm()
const confirmButton = ref(null)

watch(request, async (value) => {
  if (!value) return
  await nextTick()
  confirmButton.value?.focus()
})

function onKeydown(event) {
  if (event.key === 'Escape' && request.value) settle(false)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  settle(false)
})
</script>

<style scoped>
.adm-fade-enter-active,
.adm-fade-leave-active {
  transition: opacity 0.15s ease;
}
.adm-fade-enter-from,
.adm-fade-leave-to {
  opacity: 0;
}
</style>
