<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { usePeriodsStore } from '../stores/periods'

const router = useRouter()
const auth = useAuthStore()
const productStore = useProductsStore()
const periodStore = usePeriodsStore()

onMounted(async () => {
  if (!auth.token) {
    router.push('/login')
    return
  }

  // Ensure data is loaded only if not already
  if (!productStore.items.length) await productStore.fetchAll()
  if (!periodStore.activePeriod) await periodStore.fetchActive()
})

async function logout() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div>
    <h2>Dashboard</h2>
    <button @click="logout">Logout</button>

    <div v-if="periodStore.activePeriod">
      <h3>Active Period</h3>
      <pre>{{ periodStore.activePeriod }}</pre>
    </div>

    <div v-if="productStore.items?.length">
      <h3>Products</h3>
      <ul>
        <li v-for="p in productStore.items" :key="p.id">
          {{ p.name }} - ${{ p.price }} - {{ p.categoryNames }}
        </li>
      </ul>
    </div>

    <p v-else>No products loaded.</p>
  </div>
</template>
