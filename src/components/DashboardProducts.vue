<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product, InventoryRecord, InventoryPeriod } from '../api/types'
import ProductCard from './ProductCard.vue'
import { usePeriodsStore } from '../stores/periods'
import { useRecordsStore } from '../stores/records'
import { useAuthStore } from '../stores/auth'
import { RecordAPI } from '../api/endpoints/records'

const props = defineProps<{
  products?: Product[] | null
  records?: InventoryRecord[] | null
  period?: InventoryPeriod | null
  filterMode?: 'all' | 'included' | 'excluded'
}>()

const emit = defineEmits<{
  (e: 'update:records', records: InventoryRecord[]): void
}>()

const periodsStore = usePeriodsStore()
const recordsStore = useRecordsStore()
const authStore = useAuthStore()

const productsSafe = computed(() => props.products ?? [])
const recordsSafe = computed(() => props.records ?? [])

const recordMap = computed(() => {
  const map: Record<number, InventoryRecord> = {}
  for (const r of recordsSafe.value) {
    if (r?.product_id != null) map[r.product_id] = r
  }
  return map
})

const filterMode = computed(() => props.filterMode ?? 'all')

const finalList = computed(() => {
  switch (filterMode.value) {
    case 'included':
      return productsSafe.value.filter(p => recordMap.value[p.id])
    case 'excluded':
      return productsSafe.value.filter(p => !recordMap.value[p.id])
    default:
      return productsSafe.value
  }
})

const successMessage = ref('')

async function updateRecords() {
  const period = periodsStore.activePeriod
  if (!period || !authStore.token) return
  const updated = await RecordAPI.listByPeriod(authStore.token, period.id)
  emit('update:records', updated)
}

async function handleAddToPeriod(payload: { productId: number; quantity: number; notes: string }) {
  const period = periodsStore.activePeriod
  if (!period || !authStore.token) return

  await recordsStore.upsert(period.id, payload.productId, payload.quantity, payload.notes)
  successMessage.value = '✅ Producto agregado al período'
  setTimeout(() => (successMessage.value = ''), 2000)

  await updateRecords()
}

async function handleEditRecord(payload: { productId: number; quantity: number; notes: string }) {
  const period = periodsStore.activePeriod
  if (!period || !authStore.token) return

  await recordsStore.upsert(period.id, payload.productId, payload.quantity, payload.notes)
  successMessage.value = '✅ Registro actualizado'
  setTimeout(() => (successMessage.value = ''), 2000)

  await updateRecords()
}

async function handleDeleteRecord(payload: { productId: number }) {
  const period = periodsStore.activePeriod
  if (!period || !authStore.token) return

  if (!confirm("¿Eliminar este producto del período?")) return

  await RecordAPI.delete(authStore.token, period.id, payload.productId)

  successMessage.value = '🗑️ Registro eliminado'
  setTimeout(() => (successMessage.value = ''), 2000)

  await updateRecords()
}
</script>

<template>
  <div class="products-container">
    <h2 class="section-title">Productos</h2>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div v-if="finalList.length" class="products-grid">
      <ProductCard
        v-for="p in finalList"
        :key="p.id"
        :product="{
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0]?.image_url ?? '',
          categories: p.categoryNames ?? [],
          quantity: recordMap[p.id]?.quantity ?? null,
          notes: recordMap[p.id]?.notes ?? ''
        }"
        @add-to-period="handleAddToPeriod"
        @edit-record="handleEditRecord"
        @delete-record="handleDeleteRecord"
      />
    </div>

    <p v-else>No hay productos disponibles para este filtro.</p>
  </div>
</template>

<style scoped>
.products-container {
  margin-top: 1.5rem;
  padding: 0 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.8rem; /* más aire entre tarjetas */
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.success-message {
  margin-top: 0.5rem;
  background: rgba(34, 197, 94, 0.15);
  border-left: 3px solid #22c55e;
  color: #22c55e;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
}
</style>
