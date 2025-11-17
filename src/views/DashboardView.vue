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

  if (!productStore.items.length) await productStore.fetchAll()
  if (!periodStore.activePeriod) await periodStore.fetchActive()
})

async function logout() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-wrapper">

    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <button class="btn-logout" @click="logout">Logout</button>
    </div>

    <div v-if="periodStore.activePeriod" class="period-card">
      <h3 class="period-title">{{ periodStore.activePeriod.name }}</h3>
      <p class="period-notes">{{ periodStore.activePeriod.notes }}</p>
      <p class="period-start">Inicio: {{ periodStore.activePeriod.start_date }}</p>
    </div>

    <div v-if="productStore.items?.length" class="products-section">
      <h3>Productos</h3>
      <ul class="product-list">
        <li v-for="p in productStore.items" :key="p.id" class="product-item">
          <span class="product-name">{{ p.name }}</span>
          <span class="product-price">${{ p.price }}</span>
          <span class="product-categories">{{ p.categoryNames }}</span>
        </li>
      </ul>
    </div>

    <p v-else class="no-products">No hay productos cargados.</p>

  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  color: #eee;
  font-family: system-ui, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  font-size: 2rem;
  font-weight: 600;
}

.btn-logout {
  background-color: #f87171;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-logout:hover {
  opacity: 0.85;
}

/* Period card */
.period-card {
  background-color: #1b1b1b;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.period-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.period-notes {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 0.5rem;
}

.period-start {
  font-size: 0.9rem;
  color: #999;
}

/* Products section */
.products-section {
  background-color: #1b1b1b;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1rem 1.5rem;
}

.product-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
}

.product-item:last-child {
  border-bottom: none;
}

.product-name {
  font-weight: 500;
}

.product-price {
  color: #8ee5ff;
}

.product-categories {
  color: #ccc;
  font-size: 0.9rem;
}

.no-products {
  text-align: center;
  margin-top: 1rem;
  color: #999;
}
</style>
