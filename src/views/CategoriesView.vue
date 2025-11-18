<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import ErrorMessage from '../components/ErrorMessage.vue'

const categoriesStore = useCategoriesStore()

const showCreateForm = ref(false)
const categoryName = ref('')
const categoryDescription = ref('')
const formLoading = ref(false)
const formError = ref('')

onMounted(async () => {
  try {
    await categoriesStore.fetchAll()
  } catch (error) {
    console.error('Error loading categories:', error)
  }
})

// Formatear fechas de forma segura
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES')
}

const isSubmitDisabled = computed(() =>
  formLoading.value || !categoryName.value.trim()
)

const handleCreateCategory = async () => {
  if (!categoryName.value.trim()) {
    formError.value = 'El nombre es obligatorio'
    return
  }

  formLoading.value = true
  formError.value = ''

  try {
    await categoriesStore.createCategory({
      name: categoryName.value.trim(),
      description: categoryDescription.value.trim() || undefined
    })
    categoryName.value = ''
    categoryDescription.value = ''
    showCreateForm.value = false
  } catch (err: any) {
    formError.value = err.message || 'Error al crear la categoría'
  } finally {
    formLoading.value = false
  }
}

const handleDeleteCategory = async (id: number, name: string) => {
  if (!confirm(`¿Eliminar la categoría "${name}"?`)) return
  try {
    await categoriesStore.deleteCategory(id)
  } catch (err: any) {
    alert(err.message || 'Error al eliminar la categoría')
  }
}
</script>

<template>
  <div class="categories-view">

    <div class="header">
      <h1>Gestión de Categorías</h1>
      <button
        class="btn-primary"
        @click="showCreateForm = !showCreateForm"
        :disabled="categoriesStore.loading"
      >
        {{ showCreateForm ? 'Cancelar' : '+ Nueva Categoría' }}
      </button>
    </div>

    <!-- Crear categoría -->
    <div v-if="showCreateForm" class="create-form">
      <h2>Nueva Categoría</h2>

      <form @submit.prevent="handleCreateCategory" class="form">
        <div class="field">
          <label for="categoryName">Nombre *</label>
          <input
            id="categoryName"
            v-model="categoryName"
            type="text"
            placeholder="Nombre"
            class="input"
            :disabled="formLoading"
          />
        </div>

        <div class="field">
          <label for="categoryDescription">Descripción</label>
          <textarea
            id="categoryDescription"
            v-model="categoryDescription"
            placeholder="Descripción opcional"
            class="textarea"
            rows="3"
            :disabled="formLoading"
          />
        </div>

        <ErrorMessage :message="formError" />

        <div class="form-actions">
          <button class="btn-primary" type="submit" :disabled="isSubmitDisabled">
            {{ formLoading ? 'Creando...' : 'Crear Categoría' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de categorías -->
    <div class="categories-list">
      <ErrorMessage :message="categoriesStore.error" />

      <div v-if="categoriesStore.loading" class="loading">
        Cargando categorías...
      </div>

      <div v-else-if="categoriesStore.items.length === 0" class="empty-state">
        <p>No hay categorías creadas</p>
        <button class="btn-primary" @click="showCreateForm = true">
          Crear primera categoría
        </button>
      </div>

      <div v-else class="categories-grid">
        <div
          v-for="category in categoriesStore.items"
          :key="category.id"
          class="category-card"
        >
          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <p v-if="category.description" class="category-description">
              {{ category.description }}
            </p>

            <div class="category-meta">
              <span>Creado: {{ formatDate(category.created_at) }}</span>
              <span v-if="category.updated_at">Actualizado: {{ formatDate(category.updated_at) }}</span>
            </div>
          </div>

          <div class="category-actions">
            <button
              class="btn-danger"
              @click="handleDeleteCategory(category.id, category.name)"
              :disabled="categoriesStore.loading"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped>
.categories-view {
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

.categories-grid {
  display: grid;
  gap: 1rem;
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: border-color 0.2s;
}

.category-card:hover {
  border-color: var(--accent);
}

.category-info {
  flex: 1;
}

.category-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: var(--text-main);
}

.category-description {
  margin: 0 0 0.75rem 0;
  color: var(--text-dim);
  font-size: 0.9rem;
  line-height: 1.4;
}

.category-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.meta-item {
  background: var(--bg-input);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.category-actions {
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination-info {
  color: var(--text-dim);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .categories-view {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .category-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .category-actions {
    align-self: flex-end;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>