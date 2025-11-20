<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import ProductImagesManager from '../components/ProductImagesManager.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const router = useRouter()
const store = useProductsStore()

// Campos del form
const name = ref('')
const price = ref(0)

// Para edición
const editingId = ref<number | null>(null)

// UI states
const showCreateForm = ref(false)
const saving = ref(false)
const successMessage = ref('')

function startCreate() {
  editingId.value = null
  name.value = ''
  price.value = 0
  store.imageError = null
  successMessage.value = ''
  showCreateForm.value = true
}

function cancelCreate() {
  showCreateForm.value = false
  startCreate()
}

function startEdit(product: any) {
  editingId.value = product.id
  name.value = product.name
  price.value = product.price
  store.imageError = null
  successMessage.value = ''
  showCreateForm.value = false
}

function cancelEdit() {
  editingId.value = null
  name.value = ''
  price.value = 0
}

async function saveBasicInfo() {
  if (!name.value.trim()) {
    store.error = 'El nombre es obligatorio'
    return
  }

  saving.value = true
  store.error = null
  store.imageError = null
  successMessage.value = ''

  try {
    if (editingId.value === null) {
      // Crear producto
      const created = await store.addProduct({ 
        name: name.value, 
        price: price.value 
      })
      
      successMessage.value = '✅ Producto creado. Ahora puedes agregar imágenes.'
      
      // Cambiar a modo edición para agregar imágenes
      editingId.value = created.id
      showCreateForm.value = false
      
    } else {
      // Actualizar producto
      await store.updateProduct(editingId.value, { 
        name: name.value, 
        price: price.value 
      })
      
      successMessage.value = '✅ Producto actualizado correctamente'
      
      setTimeout(() => {
        successMessage.value = ''
      }, 2000)
    }

    await store.fetchAll()

  } catch (err: any) {
    console.error('Error guardando producto:', err)
    store.error = err.message || 'Error al guardar el producto'
  } finally {
    saving.value = false
  }
}

async function handleAddImageUrl(productId: number, url: string) {
  try {
    await store.addImageUrl(productId, url)
    successMessage.value = '✅ Imagen agregada'
    setTimeout(() => { successMessage.value = '' }, 2000)
  } catch (err) {
    console.error('Error adding image URL:', err)
  }
}

async function handleUploadImage(productId: number, file: File) {
  try {
    await store.uploadImageFile(productId, file)
    successMessage.value = '✅ Imagen subida correctamente'
    setTimeout(() => { successMessage.value = '' }, 2000)
  } catch (err) {
    console.error('Error uploading image:', err)
  }
}

async function handleDeleteImage(productId: number, imageId: number) {
  try {
    await store.deleteImage(productId, imageId)
    successMessage.value = '✅ Imagen eliminada'
    setTimeout(() => { successMessage.value = '' }, 2000)
  } catch (err) {
    console.error('Error deleting image:', err)
  }
}

const handleDeleteProduct = async (id: number, name: string) => {
  if (!confirm(`¿Eliminar el producto "${name}"?`)) return
  try {
    await store.removeProduct(id)
  } catch (err: any) {
    alert(err.message || 'Error al eliminar el producto')
  }
}

const isSaveDisabled = computed(() => 
  saving.value || store.uploadingImage || !name.value.trim()
)
</script>

<template>
  <div class="products-view">

    <div class="header">
      <button class="btn-secondary" @click="router.push('/')">
        ⬅ Volver al Dashboard
      </button>
      
      <h1>Gestión de Productos</h1>

      <button
        class="btn-primary"
        @click="showCreateForm ? cancelCreate() : startCreate()"
        :disabled="store.loading || saving || store.uploadingImage"
      >
        {{ showCreateForm ? 'Cancelar' : '+ Nuevo Producto' }}
      </button>
    </div>

    <!-- Formulario de creación -->
    <div v-if="showCreateForm" class="create-form">
      <h2>Nuevo Producto</h2>
      <form @submit.prevent="saveBasicInfo" class="form">

        <div class="field">
          <label for="productName">Nombre *</label>
          <input
            id="productName"
            v-model="name"
            type="text"
            placeholder="Nombre del producto"
            class="input"
            :disabled="saving"
          />
        </div>

        <div class="field">
          <label for="productPrice">Precio *</label>
          <input
            id="productPrice"
            v-model.number="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="input"
            :disabled="saving"
          />
        </div>

        <ErrorMessage :message="store.error" />
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <button 
            class="btn-primary" 
            type="submit"
            :disabled="isSaveDisabled"
          >
            {{ saving ? 'Guardando...' : 'Crear Producto' }}
          </button>
        </div>

        <p class="info-text">
          💡 Después de crear el producto podrás agregar imágenes
        </p>

      </form>
    </div>

    <!-- Lista de productos -->
    <div class="products-list">

      <div v-if="store.loading" class="loading">
        Cargando productos...
      </div>

      <div v-else-if="store.items.length === 0" class="empty-state">
        <p>No hay productos disponibles</p>
      </div>

      <div v-else class="products-grid">
        <div v-for="product in store.items" :key="product.id" class="product-card">

          <!-- Modo edición -->
          <div v-if="editingId === product.id" class="edit-section">
            <div class="edit-header">
              <h3>Editando: {{ product.name }}</h3>
              <button class="btn-secondary" @click="cancelEdit">
                ✕ Cerrar
              </button>
            </div>

            <!-- Información básica -->
            <div class="basic-info-form">
              <div class="field">
                <label>Nombre *</label>
                <input v-model="name" type="text" class="input" placeholder="Nombre" />
              </div>

              <div class="field">
                <label>Precio *</label>
                <input v-model.number="price" type="number" step="0.01" class="input" placeholder="0.00" />
              </div>

              <button 
                class="btn-primary" 
                @click="saveBasicInfo" 
                :disabled="isSaveDisabled"
              >
                {{ saving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>

            <!-- Gestor de imágenes -->
            <div class="images-section">
              <h4>Imágenes del producto</h4>
              
              <ErrorMessage :message="store.imageError" />
              
              <div v-if="successMessage" class="success-message">
                {{ successMessage }}
              </div>

              <ProductImagesManager
                :product-id="product.id"
                :images="product.images || []"
                :uploading="store.uploadingImage"
                @add-url="(url) => handleAddImageUrl(product.id, url)"
                @upload-file="(file) => handleUploadImage(product.id, file)"
                @delete-image="(imageId) => handleDeleteImage(product.id, imageId)"
              />
            </div>
          </div>

          <!-- Modo vista -->
          <div v-else class="product-view">
            <div class="product-info">
              <div class="product-header">
                <div>
                  <h3>{{ product.name }}</h3>
                  <p class="product-price">${{ product.price.toFixed(2) }}</p>
                </div>

                <div v-if="product.images?.length" class="images-preview">
                  <img 
                    v-for="img in product.images.slice(0, 3)"
                    :key="img.id"
                    :src="img.image_url"
                    class="product-thumbnail"
                    :alt="`${product.name} - imagen ${img.display_order + 1}`"
                  />
                  <span v-if="product.images.length > 3" class="more-images">
                    +{{ product.images.length - 3 }}
                  </span>
                </div>
                <p v-else class="no-images">Sin imágenes</p>
              </div>

              <div v-if="product.categoryNames?.length" class="product-categories">
                <span v-for="cat in product.categoryNames" :key="cat" class="category-badge">
                  {{ cat }}
                </span>
              </div>
            </div>

            <div class="product-actions">
              <button 
                class="btn-secondary" 
                @click="startEdit(product)" 
                :disabled="store.loading || saving || store.uploadingImage"
              >
                ✏️ Editar
              </button>
              <button 
                class="btn-danger" 
                @click="handleDeleteProduct(product.id, product.name)" 
                :disabled="store.loading || saving || store.uploadingImage"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.products-view {
  max-width: 1000px;
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

.create-form h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
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

.input {
  padding: 0.75rem 1rem;
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.info-text {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0;
  text-align: center;
}

.success-message {
  background: rgba(34, 197, 94, 0.15);
  border-left: 3px solid #22c55e;
  color: #86efac;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.products-grid {
  display: grid;
  gap: 1.5rem;
}

.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.2s;
}

.product-card:hover {
  border-color: var(--accent);
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.edit-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.basic-info-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-input);
  border-radius: 8px;
}

.images-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.images-section h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-main);
}

.product-view {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.product-info h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1.2rem;
  color: var(--text-main);
}

.product-price {
  margin: 0;
  color: var(--accent);
  font-size: 1.1rem;
  font-weight: bold;
}

.images-preview {
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.more-images {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.no-images {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0;
}

.product-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.category-badge {
  background: var(--bg-input);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.product-actions {
  display: flex;
  flex-direction: column;
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
  white-space: nowrap;
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
  white-space: nowrap;
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

@media (max-width: 768px) {
  .products-view {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .product-view {
    flex-direction: column;
  }
  
  .product-actions {
    flex-direction: row;
    align-self: flex-end;
  }

  .product-header {
    flex-direction: column;
  }
}
</style>