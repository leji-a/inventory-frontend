<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCategoriesStore } from '../stores/categories'

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits(['update:modelValue'])

const store = useCategoriesStore()

// Traer categorías al montar el componente
onMounted(() => {
  if (store.items.length === 0) {
    store.fetchAll().catch(err => console.error('Error fetching categories:', err))
  }
})

// Lista de categorías
const categories = computed(() => store.items)

// Actualizar selección de categorías
function toggleCategory(id: number) {
  const current = [...props.modelValue]
  const exists = current.includes(id)

  const updated = exists
    ? current.filter(c => c !== id)
    : [...current, id]

  emit('update:modelValue', updated)
}

function isChecked(id: number) {
  return props.modelValue.includes(id)
}
</script>

<template>
  <div class="category-selector">
    <div v-if="store.loading">Cargando categorías...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else class="list">
      <label v-for="cat in categories" :key="cat.id" class="item">
        <input
          type="checkbox"
          :value="cat.id"
          :checked="isChecked(cat.id)"
          @change="toggleCategory(cat.id)"
        />
        <span>{{ cat.name }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.category-selector {
  border: 1px solid var(--border-light);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--bg-card);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
