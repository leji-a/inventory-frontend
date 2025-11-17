<template>
  <div>
    <h2 class="section-title">Productos</h2>

    <div v-if="productStore.items.length" class="products-grid">
      <ProductCard
        v-for="product in productStore.items"
        :key="product.id"
        :product="formatProduct(product)"
      />
    </div>

    <p v-else>No hay productos cargados.</p>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '../stores/products'
import ProductCard from './ProductCard.vue'

const productStore = useProductsStore()

function formatProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image || '', // placeholder handled in ProductCard
    categories: product.categoryNames || []
  }
}
</script>

<style scoped>
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f3f3f3;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
</style>
