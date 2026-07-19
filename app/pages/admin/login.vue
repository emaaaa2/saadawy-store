<template>
  <div class="min-h-screen bg-olive flex items-center justify-center px-6">
    <div class="bg-white rounded-2xl p-8 max-w-sm w-full">
      <img src="/logo.svg" alt="Saadawy Store" class="h-16 mx-auto mb-6" />
      <h1 class="text-xl font-bold text-olive text-center mb-6">Admin Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"
        />

        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-olive text-beige py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
        >
          {{ isLoading ? 'Checking...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'admin-auth'
})

const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value }
    })
    await navigateTo('/admin')
  } catch (error) {
    errorMessage.value = 'Incorrect password. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>