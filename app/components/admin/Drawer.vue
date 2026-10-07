<template>
  <Teleport to="body">
    <Transition name="adm-drawer">
      <div v-if="open" class="fixed inset-0 z-[140] flex justify-end">
        <div class="adm-drawer-backdrop absolute inset-0 bg-black/50" @click="close"></div>
        <aside
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="adm-drawer-panel relative w-full sm:max-w-xl h-full bg-surface shadow-2xl flex flex-col"
        >
          <header class="flex items-start justify-between gap-4 px-6 py-5 border-b border-stone-200">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-stone-800 truncate">{{ title }}</h2>
              <p v-if="subtitle" class="text-sm text-stone-500 mt-0.5">{{ subtitle }}</p>
              <slot name="meta" />
            </div>
            <button type="button" class="adm-icon-btn -me-2" :aria-label="$t('admin.common.close')" @click="close">
              <Icon name="mdi:close" class="text-xl" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="px-6 py-4 border-t border-stone-200 bg-stone-50/60">
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
const emit = defineEmits(['update:open'])

function close() {
  emit('update:open', false)
}

function onKeydown(event) {
  // Leave Escape to the confirm dialog when one is open on top.
  if (event.key === 'Escape' && props.open && !useAdminConfirm().request.value) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.adm-drawer-enter-active,
.adm-drawer-leave-active {
  transition: opacity 0.2s ease;
}
.adm-drawer-enter-active .adm-drawer-panel,
.adm-drawer-leave-active .adm-drawer-panel {
  transition: transform 0.25s ease;
}
.adm-drawer-enter-from,
.adm-drawer-leave-to {
  opacity: 0;
}
.adm-drawer-enter-from .adm-drawer-panel,
.adm-drawer-leave-to .adm-drawer-panel {
  transform: translateX(100%);
}
/* In Arabic the panel sits on the left, so it slides in from the left. */
[dir='rtl'] .adm-drawer-enter-from .adm-drawer-panel,
[dir='rtl'] .adm-drawer-leave-to .adm-drawer-panel {
  transform: translateX(-100%);
}
</style>
