<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const goToPrev = () => {
  if (props.currentPage > 1 && !props.loading) {
    emit('change', props.currentPage - 1)
  }
}

const goToNext = () => {
  if (props.currentPage < props.totalPages && !props.loading) {
    emit('change', props.currentPage + 1)
  }
}
</script>

<template>
  <div class="pagination-wrapper">
    <button
      class="btn-secondary"
      @click="goToPrev"
      :disabled="currentPage <= 1 || loading"
    >
      ⬅ Anterior
    </button>

    <span class="pagination-info">
      Página {{ currentPage }} de {{ totalPages }}
    </span>

    <button
      class="btn-secondary"
      @click="goToNext"
      :disabled="currentPage >= totalPages || loading"
    >
      Siguiente ➡
    </button>
  </div>
</template>

<style scoped>
.pagination-wrapper {
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
</style>
