<template>
  <div>
    <Transition name="adm-fade">
      <div v-if="isOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="isOpen = false"></div>
    </Transition>

    <aside
      class="fixed inset-y-0 start-0 z-50 w-64 bg-surface border-e border-stone-200 flex flex-col transition-transform duration-200 lg:translate-x-0"
      :class="isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full rtl:translate-x-full'"
    >
      <div class="h-16 shrink-0 flex items-center justify-between gap-2 px-5 border-b border-stone-200">
        <NuxtLink to="/admin" class="flex items-center gap-2.5" @click="isOpen = false">
          <span class="relative w-8 h-8 flex items-center justify-center">
            <img src="/logo-icon-petals-olive.svg" alt="" class="h-8 absolute dark-logo" />
            <img src="/logo-icon-frame-olive.svg" alt="" class="h-8 absolute dark-logo" />
          </span>
          <img src="/logo-name-olive.svg" :alt="$t('common.storeName')" class="h-[18px] dark-logo" />
        </NuxtLink>
        <button type="button" class="adm-icon-btn lg:hidden" :aria-label="$t('admin.nav.closeMenu')" @click="isOpen = false">
          <Icon name="mdi:close" class="text-xl" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-5" :aria-label="$t('admin.nav.label')">
        <div v-for="group in groups" :key="group.name">
          <p class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{{ $t(`admin.groups.${group.name}`) }}</p>
          <div class="space-y-0.5">
            <NuxtLink
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition"
              :class="isActive(item.path) ? 'bg-olive text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'"
              @click="isOpen = false"
            >
              <Icon :name="item.icon" class="text-lg shrink-0" :class="isActive(item.path) ? 'text-white' : 'text-stone-400'" />
              <span class="truncate">{{ $t(`admin.sections.${item.permission}`) }}</span>
              <span
                v-if="badges[item.permission] > 0"
                class="ms-auto text-[11px] font-semibold rounded-full px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center"
                :class="isActive(item.path) ? 'bg-white/20 text-white' : badgeTone[item.permission]"
              >
                {{ badges[item.permission] > 99 ? '99+' : badges[item.permission] }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="shrink-0 border-t border-stone-200 p-3">
        <div class="flex items-center gap-3 px-2 py-1.5">
          <div class="w-8 h-8 rounded-full bg-gold/15 text-gold text-sm font-semibold flex items-center justify-center uppercase shrink-0">
            {{ access?.email?.[0] ?? '?' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-stone-800 truncate" :title="access?.email">{{ access?.email }}</p>
            <p class="text-xs text-stone-500">{{ access?.isOwner ? $t('admin.nav.owner') : $t('admin.nav.admin') }}</p>
          </div>
          <button type="button" class="adm-icon-btn" :title="$t('admin.nav.signOut')" :aria-label="$t('admin.nav.signOut')" @click="signOut">
            <Icon name="mdi:logout" class="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
const route = useRoute()
const supabase = useSupabaseClient()
const { access, can } = useAdminAccess()
const { badges, refresh } = useAdminBadges()
const isOpen = useState('admin-nav-open', () => false)

const badgeTone = {
  orders: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  reviews: 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400',
}

const groups = computed(() => {
  const result = []
  for (const section of ADMIN_SECTIONS) {
    if (!can(section.permission)) continue
    let group = result.find((g) => g.name === section.group)
    if (!group) result.push((group = { name: section.group, items: [] }))
    group.items.push(section)
  }
  if (access.value?.isOwner) {
    let settings = result.find((g) => g.name === 'Settings')
    if (!settings) result.push((settings = { name: 'Settings', items: [] }))
    settings.items.push({ permission: 'admins', label: 'Admins', path: '/admin/admins', icon: 'mdi:shield-account-outline' })
  }
  return result
})

function isActive(path) {
  return path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)
}

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/')
}

let intervalId = null
onMounted(() => {
  refresh()
  intervalId = setInterval(refresh, 60000)
})
onUnmounted(() => clearInterval(intervalId))
</script>

<style scoped>
.adm-fade-enter-active,
.adm-fade-leave-active {
  transition: opacity 0.2s ease;
}
.adm-fade-enter-from,
.adm-fade-leave-to {
  opacity: 0;
}
</style>
