<template>
  <div class="product-card">
    <img :src="product.image || placeholder" :alt="product.name" class="product-image" />

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">${{ product.price.toFixed(2) }}</p>

      <div class="product-categories">
        <span v-for="cat in product.categories" :key="cat" class="category-badge">
          {{ cat }}
        </span>
      </div>

      <div v-if="product.quantity !== null && product.quantity !== undefined" class="product-qty">
        <strong>Cantidad:</strong> {{ product.quantity }}
      </div>

      <div v-if="product.notes" class="product-notes">
        <strong>Notas:</strong> {{ product.notes }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const placeholder = 'https://via.placeholder.com/240x160?text=No+Image'

defineProps<{
  product: {
    id: number
    name: string
    price: number
    image?: string
    categories: string[]
    quantity?: number | null
    notes?: string
  }
}>()
</script>

<style scoped>
.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.35);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  border-radius: 8px;
  background: #111;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-main);
}

.product-price {
  font-weight: bold;
  color: var(--accent);
  margin: 0.2rem 0;
}

.product-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.category-badge {
  background: #222;
  border: 1px solid var(--border-light);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-dim);
}

.product-qty,
.product-notes {
  margin-top: 0.4rem;
  color: var(--text-dim);
  font-size: 0.95rem;
}
</style>