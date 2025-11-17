<script setup lang="ts">
import { computed } from 'vue'
import type { Product, InventoryRecord, InventoryPeriod } from '../api/types'
import ProductCard from './ProductCard.vue'

const props = defineProps<{
  products?: Product[] | null
  records?: InventoryRecord[] | null
  period?: InventoryPeriod | null
  filterMode?: 'all' | 'included' | 'excluded'
}>()

const productsSafe = computed(() => (Array.isArray(props.products) ? props.products : []))
const recordsSafe = computed(() => (Array.isArray(props.records) ? props.records : []))
const filterMode = computed(() => props.filterMode ?? 'all')

const recordMap = computed(() => {
  const map: Record<number, InventoryRecord> = {}
  for (const r of recordsSafe.value) {
    if (r && typeof r.product_id === 'number') map[r.product_id] = r
  }
  return map
})

const includedList = computed(() => {
  if (!props.period) return []
  const ids = recordsSafe.value.map(r => r.product_id)
  return productsSafe.value.filter(p => ids.includes(p.id))
})

const excludedList = computed(() => {
  if (!props.period) return productsSafe.value // if period exists but no records, all are excluded
  const ids = recordsSafe.value.map(r => r.product_id)
  return productsSafe.value.filter(p => !ids.includes(p.id))
})

const finalList = computed(() => {
  switch (filterMode.value) {
    case 'included': return includedList.value
    case 'excluded': return excludedList.value
    default: return productsSafe.value
  }
})

function formatProduct(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images?.[0] ?? '',
    categories: p.categoryNames ?? [],
    quantity: recordMap.value[p.id]?.quantity ?? null,
    notes: recordMap.value[p.id]?.notes ?? ''
  }
}
</script>

<template>
  <div>
    <h2 class="section-title">Productos</h2>

    <div v-if="finalList.length" class="products-grid">
      <ProductCard
        v-for="prod in finalList"
        :key="prod.id"
        :product="formatProduct(prod)"
      />
    </div>

    <p v-else>No hay productos disponibles para este filtro.</p>
  </div>
</template>

<style scoped>
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-main);
}
</style>