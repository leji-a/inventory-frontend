<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePeriodsStore } from '../stores/periods'
import { useRecordsStore } from '../stores/records'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const router = useRouter()

const auth = useAuthStore()
const periodsStore = usePeriodsStore()
const recordsStore = useRecordsStore()
const productsStore = useProductsStore()

const loading = ref(true)

const periodId = Number(route.params.id)

onMounted(async () => {
  if (!auth.token) {
    router.push('/login')
    return
  }

  await Promise.all([
    productsStore.items.length ? null : productsStore.fetchAll(),
    periodsStore.fetchAll(),
    recordsStore.fetchByPeriod(periodId)
  ])

  loading.value = false
})

const period = computed(() =>
  periodsStore.allPeriods.find(p => p.id === periodId)
)

const periodRecords = computed(() =>
  recordsStore.byPeriod[periodId] ?? []
)

const enrichedProducts = computed(() => {
  return productsStore.items
    .map(p => {
      const record = periodRecords.value.find(r => r.product_id === p.id)
      return {
        ...p,
        quantity: record?.quantity ?? 0
      }
    })
    .filter(p => p.quantity > 0)
})

const exporting = ref(false)

async function exportPeriod() {
  if (!period.value) return

  exporting.value = true

  try {
    const isActive = period.value.status === 'active'

    const endpoint = isActive
      ? '/inventory/export/current'
      : `/inventory/export/period/${period.value.id}`

    const res = await fetch(import.meta.env.VITE_API_URL + endpoint, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    if (!res.ok) {
      throw new Error('Error al exportar CSV')
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url

    const name = isActive
      ? `inventario_actual.csv`
      : `inventario_${period.value.name.replace(/\s+/g, '_')}.csv`

    a.download = name
    a.click()

    URL.revokeObjectURL(url)
  } catch (err) {
    alert('No se pudo exportar el período.')
  } finally {
    exporting.value = false
  }
}

</script>

<template>
  <div class="period-details-wrapper" v-if="!loading">
    <button class="btn-secondary" @click="router.back()">← Volver</button>

    <h1>Detalles del Período</h1>

    <div v-if="period" class="period-card">
      <h2>{{ period.name }}</h2>
      <p><strong>Fecha inicio:</strong> {{ formatDate(period.start_date) }}</p>
      <p><strong>Fecha cierre:</strong> {{ formatDate(period.end_date || '—') }}</p>
      <p><strong>Notas:</strong> {{ period.notes || 'Sin notas' }}</p>
    </div>

    <div class="export-buttons" style="margin: 1rem 0;">
  <button 
    class="btn-secondary"
    :disabled="exporting"
    @click="exportPeriod"
  >
    {{ exporting ? 'Exportando...' : 'Exportar este período' }}
  </button>
</div>

    <h2>Productos registrados</h2>

    <div v-if="enrichedProducts.length">
      <table class="period-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in enrichedProducts" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.categoryNames?.join(', ') || 'Sin categoría' }}</td>
            <td class="qty">{{ p.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else>No hay productos registrados en este período.</p>
  </div>
</template>

<style scoped>
.period-details-wrapper {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  color: #eee;
}

.btn-back {
  background: none;
  border: none;
  color: #646cff;
  font-size: 1.1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.period-card {
  background: #1c1c1c;
  border: 1px solid #333;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.period-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.period-table th, .period-table td {
  border-bottom: 1px solid #333;
  padding: 0.7rem;
}

.qty {
  text-align: right;
  font-weight: bold;
}

.btn-secondary {
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border-light);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
} 

.btn-secondary:hover:not(:disabled) {
  background: var(--border-light);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
