<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCategoriesStore } from '../stores/categories'
import ProductImagesManager from '../components/ProductImagesManager.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import CategoriesSelector from '../components/CategoriesSelector.vue'
import Pagination from '../components/Pagination.vue'

const router = useRouter()
const store = useProductsStore()
const categoriesStore = useCategoriesStore()

const showCreateForm = ref(false)
const saving = ref(false)
const successMessage = ref('')

const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  price: 0,
  categoryIds: [] as number[]
})

function resetForm() {
  form.name = ''
  form.price = 0
  form.categoryIds = []
  store.error = null
  store.imageError = null
  successMessage.value = ''
}

function startCreate() {
  editingId.value = null
  resetForm()
  showCreateForm.value = true
}

function cancelCreate() {
  resetForm()
  showCreateForm.value = false
}

function startEdit(product: any) {
  editingId.value = product.id
  form.name = product.name
  form.price = product.price
  form.categoryIds = product.categoryIds ?? []
  store.error = null
  store.imageError = null
  successMessage.value = ''
  showCreateForm.value = false
}

function cancelEdit() {
  editingId.value = null
  resetForm()
}

async function saveBasicInfo() {
  if (!form.name.trim()) {
    store.error = 'El nombre es obligatorio'
    return
  }
  if (form.price <= 0) {
    store.error = 'El precio debe ser mayor a 0'
    return
  }

  saving.value = true
  store.error = null
  store.imageError = null
  successMessage.value = ''

  try {
    if (editingId.value === null) {
      const created = await store.addProduct({
        name: form.name,
        price: form.price,
        categoryIds: form.categoryIds
      })

      successMessage.value = '✅ Producto creado. Ahora puedes agregar imágenes.'
      editingId.value = created.id
      showCreateForm.value = false

    } else {
      await store.updateProduct(editingId.value, {
        name: form.name,
        price: form.price,
        categoryIds: form.categoryIds
      })

      successMessage.value = '✅ Producto actualizado correctamente'
      setTimeout(() => { successMessage.value = '' }, 2000)
    }

    await loadProducts()
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
    await loadProducts()
  } catch (err: any) {
    alert(err.message || 'Error al eliminar el producto')
  }
}

const isSaveDisabled = computed(() =>
  saving.value || store.uploadingImage || !form.name.trim()
)

const searchQuery = ref('')

async function loadProducts() {
  await store.fetchAll(store.pagination.page || 1, store.pagination.limit || 8) 
}

const goToPage = async (page: number) => {
  await store.fetchAll(page, store.pagination.limit)
}

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return store.items

  return store.items.filter(p =>
    p.name.toLowerCase().includes(q)
  )
})

const isSearching = computed(() => searchQuery.value.trim().length > 0)

const productsToShow = computed(() => {
  if (isSearching.value) {
    return filteredProducts.value
  }
  return store.items
})

const showPagination = computed(() => {
  if (store.loading) return false

  if (isSearching.value) return false

  const p = store.pagination

  if (!p || !Number.isFinite(p.totalPages)) return false

  return p.totalPages > 1
})

watch(searchQuery, async () => {
  if (!isSearching.value) {
    await loadProducts()
  }
})

onMounted(async () => {
  await loadProducts()
  if (categoriesStore.items.length === 0) {
    await categoriesStore.fetchAll()
  }
})
</script>

<template>
  <div class="products-view">

    <div class="header">
      <button class="btn-secondary" @click="router.push('/')">⬅ Volver al Dashboard</button>
      <h1>Gestión de Productos</h1>
      <button
        class="btn-primary"
        @click="showCreateForm ? cancelCreate() : startCreate()"
        :disabled="store.loading || saving || store.uploadingImage"
      >
        {{ showCreateForm ? 'Cancelar' : '+ Nuevo Producto' }}
      </button>
    </div>

    <!-- FORMULARIO -->
    <div v-if="showCreateForm || editingId !== null" class="create-form">
      <h2>{{ editingId === null ? 'Nuevo Producto' : 'Editar Producto' }}</h2>

      <form @submit.prevent="saveBasicInfo" class="form">

        <div class="field">
          <label>Nombre *</label>
          <input v-model="form.name" type="text" class="input" :disabled="saving" />
        </div>

        <div class="field">
          <label>Precio *</label>
          <input v-model.number="form.price" type="number" step="0.01" class="input" :disabled="saving" />
        </div>

        <div class="field">
          <label>Categorías</label>
          <CategoriesSelector v-model="form.categoryIds" />
        </div>

        <ErrorMessage :message="store.error" />

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <button class="btn-primary" type="submit" :disabled="isSaveDisabled">
            {{ saving ? 'Guardando...' : editingId === null ? 'Crear Producto' : 'Guardar cambios' }}
          </button>
        </div>

        <button
    v-if="editingId !== null"
    class="btn-danger"
    type="button"
    @click="cancelEdit"
    :disabled="saving"
  >
    Cerrar formulario de Edición
  </button>

        <p class="info-text" v-if="editingId === null">
          💡 Después de crear el producto podrás agregar imágenes
        </p>
      </form>

      <div v-if="editingId !== null" class="images-section">
        <h4>Imágenes del producto</h4>

        <ErrorMessage :message="store.imageError" />

        <ProductImagesManager
          :product-id="editingId!"
          :images="store.items.find(p => p.id === editingId)?.images || []"
          :uploading="store.uploadingImage"
          @add-url="(url) => handleAddImageUrl(editingId!, url)"
          @upload-file="(file) => handleUploadImage(editingId!, file)"
          @delete-image="(imageId) => handleDeleteImage(editingId!, imageId)"
        />
      </div>
    </div>

    <!-- LISTA DE PRODUCTOS -->
    <div class="products-list">

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="input search-input"
        />
      </div>

      <div v-if="store.loading" class="loading">Cargando productos...</div>
      <div v-else-if="store.items.length === 0" class="empty-state">No hay productos disponibles</div>

      <div v-else class="products-grid">
        <div v-for="product in productsToShow" :key="product.id" class="product-card">
          <div class="product-view">
            <div class="product-info">
              <div class="product-header">
                <div>
                  <h3>{{ product.name }}</h3>
                  <p class="product-price">${{ product.price.toFixed(2) }}</p>
                </div>

                <div v-if="product.images?.length" class="images-preview">
                  <img
                    v-for="img in product.images.slice(0, 2)"
                    :key="img.id"
                    :src="img.image_url"
                    class="product-thumbnail"
                  />
                  <span v-if="product.images.length > 2" class="more-images">+{{ product.images.length - 2 }}</span>
                </div>

                <p v-else class="no-images">Sin imágenes</p>
              </div>

              <div v-if="product.categoryNames?.length" class="product-categories">
                <span v-for="cat in product.categoryNames" :key="cat" class="category-badge">{{ cat }}</span>
              </div>
            </div>

            <div class="product-actions">
              <button class="btn-secondary" @click="startEdit(product)">Editar</button>
              <button class="btn-danger" @click="handleDeleteProduct(product.id, product.name)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- PAGINACIÓN -->
    <div v-if="showPagination" class="pagination-container">
      <Pagination
        :currentPage="store.pagination.page"
        :totalPages="store.pagination.totalPages"
        :loading="store.loading"
        @change="goToPage"
      />
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

.images-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
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

.search-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 96%;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-light);
  background: var(--bg-input);
  color: var(--text-main);
}

.pagination-container {
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-light);
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