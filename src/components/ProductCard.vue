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

    <div class="image-wrapper">
      <img v-if="product.image" :src="product.image" class="product-image" />
      <div v-else class="image-placeholder">Sin imagen</div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>

      <p class="product-price">
        ${{ product.price }}
      </p>

      <div class="product-categories">
        <span
          v-for="c in product.categories"
          :key="c"
          class="category-badge"
        >
          {{ c }}
        </span>
      </div>

      <div v-if="product.quantity !== null" class="record-info">
        <p><strong>Cantidad:</strong> {{ product.quantity }}</p>
        <p v-if="product.notes"><strong>Nota:</strong> {{ product.notes }}</p>
      </div>
    </div>

    <div class="actions">
      <button class="btn" @click="editing = true">
        {{ product.quantity === null ? "Agregar" : "Editar" }}
      </button>

      <button
        v-if="product.quantity !== null"
        class="btn btn-danger"
        @click="emit('delete-record', { productId: product.id })"
      >
        Eliminar
      </button>
    </div>

    <div v-if="editing" class="modal">
      <div class="modal-content">
        <h4 class="modal-title">
          {{ product.quantity === null ? "Agregar al período" : "Editar registro" }}
        </h4>

        <label class="label">Cantidad</label>
        <input type="number" v-model.number="quantity" min="1" class="input" />

        <label class="label">Notas</label>
        <textarea v-model="notes" class="input textarea"></textarea>

        <div class="modal-actions">
          <button class="btn" @click="save">Guardar</button>
          <button class="btn btn-secondary" @click="editing = false">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>


<style scoped>

.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  padding: 1rem;

  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  transition: 0.25s ease;
  min-width: 240px;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 18px rgba(0,0,0,0.35);
}

@media (min-width: 640px) {
  .product-card {
    grid-template-columns: 160px 1fr;
    grid-template-areas:
      "image info"
      "actions actions";
    align-items: start;
  }
}

.image-wrapper {
  grid-area: image;
  width: 100%;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  background: #151515;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-placeholder {
  color: #666;
  opacity: 0.7;
  font-size: 0.9rem;
}

.product-info {
  grid-area: info;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.product-name {
  font-size: 1.15rem;
  font-weight: 600;
}

.product-price {
  font-weight: 700;
  color: var(--accent);
  font-size: 1.1rem;
  margin: 0.2rem 0;
}

.product-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.category-badge {
  background: #111;
  padding: 0.28rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  font-size: 0.75rem;
  color: var(--text-dim);
}

.record-info {
  margin-top: 0.5rem;
  color: var(--text-dim);
}

.actions {
  grid-area: actions;
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 639px) {
  .actions {
    flex-direction: column;
  }
}

.btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.85;
}

.btn-danger {
  background: #dc2626;
}

.btn-secondary {
  background: #6b7280;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(1px);
}

.modal-content {
  width: 340px;
  background: var(--bg-card);
  padding: 1.3rem;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  animation: pop 0.15s ease;
}

.modal-title {
  font-size: 1.15rem;
  margin-bottom: 0.7rem;
}

.label {
  margin-top: 0.5rem;
  font-weight: 500;
}

.input {
  padding: 0.45rem 0.6rem;
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  margin-top: 0.2rem;
}

.textarea {
  height: 80px;
  resize: none;
}

.modal-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

@keyframes pop {
  from { transform: scale(0.93); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

</style>
