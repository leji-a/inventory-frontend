<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { usePeriodsStore } from '../stores/periods'
import { useRecordsStore } from '../stores/records'

import DashboardProducts from '../components/DashboardProducts.vue'

const router = useRouter()
const auth = useAuthStore()
const productStore = useProductsStore()
const periodStore = usePeriodsStore()
const recordsStore = useRecordsStore()

const filterMode = ref<'all' | 'included' | 'excluded'>('all')

onMounted(async () => {
  if (!auth.token) {
    router.push('/login')
    return
  }

  if (!productStore.items.length) await productStore.fetchAll()
  if (!periodStore.activePeriod) await periodStore.fetchActive()

  if (periodStore.activePeriod) {
    await recordsStore.fetchByPeriod(periodStore.activePeriod.id)
  }
})

const products = computed(() => productStore.items ?? [])
const activeRecords = computed(() => {
  const p = periodStore.activePeriod
  if (!p) return []
  return recordsStore.byPeriod[p.id] ?? []
})

function logout() {
  auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-header">

      <h1>Dashboard</h1>
      <button class="logout-btn" @click="logout">Logout</button>
    </div>

    <div v-if="periodStore.activePeriod" class="active-period-card">
      <h2>{{ periodStore.activePeriod.name }}</h2>
      <p><strong>Notas:</strong> {{ periodStore.activePeriod.notes || 'N/A' }}</p>
      <p><strong>Fecha inicio:</strong> {{ periodStore.activePeriod.start_date }}</p>
      <div class="period-buttons">
        <button class="btn-primary" @click="$router.push('/categories')">
          Ir a Categorías
        </button>
        <button class="btn-primary" @click="$router.push('/periods')">
          Ir a Períodos
        </button>
        <button class="btn-primary" @click="$router.push('/products')">
          Ir a Productos
        </button>
      </div>
    </div>
    <div class="filter-box">
      <label>Filtrar:</label>
      <select v-model="filterMode">
        <option value="all">Todos</option>
        <option value="included">Incluidos en el período</option>
        <option value="excluded">No incluidos</option>
      </select>
    </div>

    <DashboardProducts
      :products="products"
      :records="activeRecords"
      :period="periodStore.activePeriod"
      :filterMode="filterMode"
    />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 1280px;
  margin: 2rem auto;
  padding: 1rem;
  color: #eee;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: #646cff;
  color: white;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.logout-btn:hover {
  opacity: 0.85;
}

.active-period-card {
  background-color: #1b1b1b;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.active-period-card h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #646cff;
}

.active-period-card button {
  display: block;
  margin: 0;
}

.filter-box {
  margin-bottom: 1.5rem;
}

select {
  background: #1b1b1b;
  color: #eee;
  border: 1px solid #333;
  padding: 0.5rem;
  border-radius: 6px;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.period-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
