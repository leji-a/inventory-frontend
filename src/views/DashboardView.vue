<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePeriodsStore } from '../stores/periods'
import { useRecordsStore } from '../stores/records'
import DashboardProducts from '../components/DashboardProducts.vue'
import { formatDate } from '../utils/formatDate'
import { ProductAPI } from '../api/endpoints/products'
import type { Product } from '../api/types'

const router = useRouter()
const auth = useAuthStore()
const periodStore = usePeriodsStore()
const recordsStore = useRecordsStore()

const filterMode = ref<'all' | 'included' | 'excluded'>('all')

// Estado local para el Dashboard - NO usa el store
const dashboardProducts = ref<Product[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  if (!auth.token) {
    router.push('/login')
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const response = await ProductAPI.list(auth.token, 1, 100)
    dashboardProducts.value = response.data
  } catch (err: any) {
    console.error('Error cargando productos para Dashboard:', err)
    error.value = 'Error al cargar productos'
  } finally {
    loading.value = false
  }
  
  if (!periodStore.activePeriod) {
    await periodStore.fetchActive()
  }

  if (periodStore.activePeriod) {
    await recordsStore.fetchByPeriod(periodStore.activePeriod.id)
  }
})

const products = computed(() => dashboardProducts.value)

const boundRecords = computed({
  get() {
    const p = periodStore.activePeriod
    if (!p) return []
    return recordsStore.byPeriod[p.id] ?? []
  },
  set(newValue) {
    const p = periodStore.activePeriod
    if (!p) return
    recordsStore.byPeriod[p.id] = newValue
  }
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
      <div class="user-info">
       <span class="user-email">{{ auth.user?.email }}</span>
       <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading state -->

    <div v-if="periodStore.activePeriod" class="active-period-card">
      <h2>{{ periodStore.activePeriod.name }}</h2>
      <p><strong>Notas:</strong> {{ periodStore.activePeriod.notes || 'N/A' }}</p>
      <p><strong>Fecha inicio:</strong> {{ formatDate(periodStore.activePeriod.start_date) }}</p>
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

    <div v-if="!periodStore.activePeriod" class="active-period-card">
      <h2>No hay un periodo activo</h2>  
      <button class="btn-primary" @click="$router.push('/periods')">
          Crear un periodo
      </button>
    </div>

    <div class="filter-box">
      <label>Filtrar:</label>
      <select v-model="filterMode">
        <option value="all">Todos</option>
        <option value="included">Incluidos en el período</option>
        <option value="excluded">No incluidos</option>
      </select>
    </div>

    <div v-if="loading" class="loading-message">
      Cargando productos...
    </div>
    
    <DashboardProducts
      v-if="!loading"
      :products="products"
      v-model:records="boundRecords"
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

/* ----- HEADER ----- */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Usuario */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  font-size: 0.95rem;
  color: #aaa;
  font-weight: 500;
}

/* Logout */
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

/* ----- MESSAGES ----- */
.error-message {
  background: rgba(220, 38, 38, 0.15);
  border-left: 3px solid #dc2626;
  color: #fca5a5;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #aaa;
  font-size: 1rem;
}

/* ----- PERIOD CARD ----- */
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

/* Botones */
.period-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
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

/* ----- FILTER BOX ----- */
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

/* ----------------------------- */
/*         RESPONSIVE            */
/* ----------------------------- */

/* 📱 Móviles ≤ 768px */
@media (max-width: 768px) {
  .dashboard-wrapper {
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
  }

  .active-period-card {
    padding: 1rem;
  }

  .period-buttons {
    flex-direction: column;
    width: 100%;
  }

  .period-buttons button {
    width: 100%;
  }

  .filter-box select {
    width: 100%;
    margin-top: 0.3rem;
  }
}

/* 📱 Teléfonos pequeños ≤ 480px */
@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.6rem;
  }

  .user-email {
    font-size: 0.85rem;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
  }

  .active-period-card h2 {
    font-size: 1.3rem;
  }

  .btn-primary {
    padding: 0.6rem 1.2rem;
  }
}
</style>