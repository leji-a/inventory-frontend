<template>
  <div class="product-card">
    <img
      :src="product.image || placeholder"
      :alt="product.name"
      class="product-image"
    />

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">${{ product.price.toFixed(2) }}</p>

      <div class="product-categories">
        <span
          v-for="cat in product.categories"
          :key="cat"
          class="category-badge"
        >
          {{ cat }}
        </span>
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
  }
}>()
</script>

<style scoped>
.product-card {
  background-color: #1b1b1b;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  width: 240px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.product-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-color: #111;
}

.product-info {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-name {
  font-size: 1rem;
  color: #eee;
  font-weight: 500;
}

.product-price {
  font-size: 1rem;
  font-weight: 600;
  color: #646cff;
}

.product-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.category-badge {
  background-color: #2a2a2a;
  color: #f3f3f3;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}
</style>
