<script setup lang="ts">
// src/views/ProductsView.vue
import { ref } from 'vue'
import { useProductsStore } from '../stores/products'
import ImageUploader from '../components/ImageUploader.vue'

const store = useProductsStore()

// Campos del form
const name = ref('')
const price = ref(0)
const imageUrlInput = ref<string | null>(null)
const imageFile = ref<File | null>(null)

// Para edición
const editingId = ref<number | null>(null)

function startCreate() {
  editingId.value = null
  name.value = ''
  price.value = 0
  imageUrlInput.value = null
  imageFile.value = null
}

function startEdit(product: any) {
  editingId.value = product.id
  name.value = product.name
  price.value = product.price

  // Usamos la primera imagen si existe
  imageUrlInput.value = product.images?.[0] ?? null
  imageFile.value = null
}

async function save() {
  if (editingId.value === null) {
    // crear
    await store.addProduct(
      { name: name.value, price: price.value },
      {
        imageUrl: imageFile.value ? null : imageUrlInput.value,
        imageFile: imageFile.value,
      }
    )
  } else {
    // actualizar
    await store.updateProduct(
      editingId.value,
      { name: name.value, price: price.value },
      {
        imageUrl: imageFile.value ? null : imageUrlInput.value,
        imageFile: imageFile.value,
      }
    )
  }

  startCreate()
  store.fetchAll()
}
</script>

<template>
  <div class="products-view">

    <div class="header">
      <h1>{{ editingId ? 'Editar producto' : 'Crear producto' }}</h1>
    </div>

    <div class="create-form">
      <div class="form">

        <div class="field">
          <label>Nombre</label>
          <input v-model="name" class="input" placeholder="Nombre" />
        </div>

        <div class="field">
          <label>Precio</label>
          <input v-model.number="price" type="number" class="input" placeholder="Precio" />
        </div>

        <div class="field">
          <label>Imagen</label>
          <ImageUploader 
            v-model="imageUrlInput"
            @fileSelected="file => imageFile = file"
          />
        </div>

        <div class="form-actions">
          <button class="btn-primary" @click="save">
            {{ editingId ? 'Guardar cambios' : 'Crear' }}
          </button>
        </div>

      </div>
    </div>

    <div class="products-grid">
      <div v-for="p in store.items" :key="p.id" class="product-card">

        <div class="product-info">
          <h3>{{ p.name }}</h3>
          <p class="price">$ {{ p.price }}</p>

          <img 
            v-if="p.images?.length"
            :src="p.images[0]"
            class="preview"
          />
        </div>

        <div class="product-actions">
          <button class="btn-secondary" @click="startEdit(p)">Editar</button>
          <button class="btn-danger" @click="store.removeProduct(p.id)">Eliminar</button>
        </div>

      </div>
    </div>

  </div>
</template>



<style scoped>
.products-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
}

.create-form {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-main);
}

.input, .textarea {
  padding: 0.75rem 1rem;
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input:focus, .textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.input:disabled, .textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.products-grid {
  display: grid;
  gap: 1rem;
}

.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: border-color 0.2s;
}

.product-card:hover {
  border-color: var(--accent);
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: var(--text-main);
}

.product-info .price {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.9rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
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

.btn-danger {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-dim);
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-light);
}

.empty-state .btn-primary {
  margin-top: 1rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .products-view {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .product-card {
    flex-direction: column;
    gap: 1rem;
  }

  .product-actions {
    align-self: flex-end;
  }
}

.preview {
  max-width: 150px;
  max-height: 150px;
  margin-top: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
}
</style>
