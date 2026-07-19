<template>
  <div class="min-h-screen bg-beige px-6 py-8">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/admin/products" class="text-olive/60 hover:text-olive">
          <Icon name="mdi:arrow-left" class="text-xl" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-olive">
          {{ isNew ? 'Add Product' : 'Edit Product' }}
        </h1>
      </div>

      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl p-6 space-y-4 border border-olive/10">
        <div>
          <label class="block text-sm font-medium text-olive mb-1">Name</label>
          <input v-model="form.name" type="text" required class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
        </div>

        <div>
          <label class="block text-sm font-medium text-olive mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-olive mb-1">Price (EGP)</label>
            <input v-model.number="form.price" type="number" required min="0" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
          </div>
          <div>
            <label class="block text-sm font-medium text-olive mb-1">Sale Price (optional)</label>
            <input v-model.number="form.salePrice" type="number" min="0" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-olive mb-1">Category</label>
          <select v-model="form.category" required class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold">
            <option value="">Select category</option>
            <option value="skincare">Skincare</option>
            
            <option value="perfume">Perfume</option>
            <option value="bags">Bags</option>
            <option value="kitchen">Kitchen</option>
            <option value="hijab">Hijab & Essentials</option>
            <option value="accessories">Accessories</option>
            <option value="makeup">Makeup</option>
<option value="haircare">Haircare</option>
<option value="uncategorized">Uncategorized</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-olive mb-1">Badge (optional)</label>
          <select v-model="form.badge" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold">
            <option value="">None</option>
            <option value="Best Seller">Best Seller</option>
            <option value="New">New</option>
            <option value="Sale">Sale</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-olive mb-1">Image URL</label>
          <input v-model="form.image" type="text" placeholder="/images/products/example.jpg" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
        </div>

        <div>
          <label class="block text-sm font-medium text-olive mb-1">Stock</label>
          <input v-model.number="form.stock" type="number" required min="0" class="w-full border border-olive/20 rounded-lg px-4 py-2.5 outline-none focus:border-gold" />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-olive text-beige py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Saving...' : (isNew ? 'Add Product' : 'Save Changes') }}
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

const route = useRoute()
const isNew = computed(() => route.params.id === 'new')
const isSubmitting = ref(false)

const form = ref({
  name: '',
  description: '',
  price: null,
  salePrice: null,
  category: '',
  badge: '',
  image: '',
  stock: 0
})

if (!isNew.value) {
  const { data } = await useFetch(`/api/admin/products/${route.params.id}`)
  if (data.value?.product) {
    const p = data.value.product
    form.value = {
      name: p.name,
      description: p.description,
      price: p.price,
      salePrice: p.sale_price,
      category: p.category,
      badge: p.badge ?? '',
      image: p.image,
      stock: p.stock
    }
  }
}

async function handleSubmit() {
  isSubmitting.value = true

  try {
    if (isNew.value) {
      await $fetch('/api/admin/products', {
        method: 'POST',
        body: form.value
      })
    } else {
      await $fetch(`/api/admin/products/${route.params.id}`, {
        method: 'PATCH',
        body: form.value
      })
    }
    await navigateTo('/admin/products')
  } catch (error) {
    alert('Something went wrong. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>