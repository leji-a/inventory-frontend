<script lang="ts" setup>
import { computed, ref } from 'vue'

interface ProductCardProps {
  id: number
  name: string
  price: number
  image?: string
  categories: string[]
  quantity?: number | null
  notes?: string
}

const props = defineProps<{
  product: ProductCardProps
}>();

const emit = defineEmits<{
  (e: 'add-to-period', payload: { productId: number; quantity: number; notes: string }): void
  (e: 'edit-record', payload: { productId: number; quantity: number; notes: string }): void
}>();

const productImage = computed(() => props.product.image || 'https://via.placeholder.com/240x160?text=No+Image')

const showForm = ref(false)
const quantity = ref<number>(props.product.quantity ?? 1)
const notes = ref(props.product.notes ?? '')

const isEditing = computed(() => props.product.quantity != null)

const handleSubmit = () => {
  if (!quantity.value || quantity.value <= 0) return
  if (isEditing.value) {
    emit('edit-record', { productId: props.product.id, quantity: quantity.value, notes: notes.value })
  } else {
    emit('add-to-period', { productId: props.product.id, quantity: quantity.value, notes: notes.value })
  }
  showForm.value = false
}
</script>

<template>
  <div class="product-card">
    <img :src="productImage" :alt="props.product.name" class="product-image" />

    <div class="product-info">
      <h3 class="product-name">{{ props.product.name }}</h3>
      <p class="product-price">${{ props.product.price.toFixed(2) }}</p>

      <div class="product-categories">
        <span v-for="cat in props.product.categories" :key="cat" class="category-badge">{{ cat }}</span>
      </div>

      <div v-if="props.product.quantity != null" class="product-qty">
        <strong>Cantidad:</strong> {{ props.product.quantity }}
      </div>

      <div v-if="props.product.notes" class="product-notes">
        <strong>Notas:</strong> {{ props.product.notes }}
      </div>

      <button class="btn-primary btn-add" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : isEditing ? 'Editar' : 'Agregar a periodo' }}
      </button>

      <div v-if="showForm" class="add-period-form">
        <input type="number" v-model.number="quantity" placeholder="Cantidad" class="input-small" min="1" />
        <input type="text" v-model="notes" placeholder="Notas" class="input-small" />
        <button class="btn-primary btn-submit" @click="handleSubmit">{{ isEditing ? 'Guardar' : 'Añadir' }}</button>
      </div>
    </div>
  </div>
</template>

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

.btn-add {
  margin-top: 0.5rem;
  padding: 0.5rem;
  font-size: 0.85rem;
}

.add-period-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
  flex-wrap: wrap;
}

.input-small {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  width: 100px;
}

.btn-submit {
  padding: 0.4rem 0.8rem;
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
</style>
