<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  product: {
    id: number
    name: string
    price: number
    image: string
    categories: string[]
    quantity: number | null
    notes: string
  }
}>()

const emit = defineEmits<{
  (e: 'add-to-period', payload: { productId: number; quantity: number; notes: string }): void
  (e: 'edit-record', payload: { productId: number; quantity: number; notes: string }): void
  (e: 'delete-record', payload: { productId: number }): void
}>()

const quantity = ref(props.product.quantity ?? 1)
const notes = ref(props.product.notes ?? '')
const editing = ref(false)

function save() {
  if (props.product.quantity === null) {
    emit('add-to-period', {
      productId: props.product.id,
      quantity: quantity.value,
      notes: notes.value
    })
  } else {
    emit('edit-record', {
      productId: props.product.id,
      quantity: quantity.value,
      notes: notes.value
    })
  }
  editing.value = false
}
</script>

<template>
  <div class="product-card">

    <img v-if="product.image" :src="product.image" class="product-image" />

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">${{ product.price }}</p>

      <div class="product-categories">
        <span
          v-for="c in product.categories"
          :key="c"
          class="category-badge"
        >
          {{ c }}
        </span>
      </div>

      <div v-if="product.quantity !== null">
        <p class="product-qty"><strong>Cantidad:</strong> {{ product.quantity }}</p>
        <p class="product-notes" v-if="product.notes"><strong>Nota:</strong> {{ product.notes }}</p>
      </div>
    </div>

    <!-- Acciones -->
    <div class="actions">
      <button class="btn-primary" @click="editing = true">
        {{ product.quantity === null ? "Agregar" : "Editar" }}
      </button>

      <button
        v-if="product.quantity !== null"
        class="btn-primary"
        style="background:#dc2626"
        @click="emit('delete-record', { productId: product.id })"
      >
        Eliminar
      </button>
    </div>

    <!-- Modal -->
    <div v-if="editing" class="modal">
      <div class="modal-content">

        <h4>{{ product.quantity === null ? "Agregar al período" : "Editar registro" }}</h4>

        <label>Cantidad</label>
        <input type="number" v-model.number="quantity" min="1" class="input-small" />

        <label>Notas</label>
        <textarea v-model="notes" class="input-small" style="width:100%"></textarea>

        <div class="modal-actions">
          <button class="btn-primary" @click="save">Guardar</button>
          <button class="btn-primary" style="background:#6b7280" @click="editing = false">Cancelar</button>
        </div>

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

/* Botón principal */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

/* Inputs */
.input-small {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 320px;
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 12px;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}
</style>
