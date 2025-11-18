<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import { usePeriodsStore } from "../stores/periods"

import SearchBar from "../components/SearchBar.vue"
import Pagination from "../components/Pagination.vue"
import ErrorMessage from "../components/ErrorMessage.vue"

const router = useRouter()
const auth = useAuthStore()
const periodStore = usePeriodsStore()

const searchQuery = ref("")

const filteredPeriods = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return periodStore.allPeriods
  return periodStore.allPeriods.filter(p =>
    p.name.toLowerCase().includes(q)
  )
})

const currentPage = ref(1)
const limit = 5

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPeriods.value.length / limit))
)

const paginatedPeriods = computed(() => {
  const start = (currentPage.value - 1) * limit
  return filteredPeriods.value.slice(start, start + limit)
})

function changePage(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
  }
}

const showCreateForm = ref(false)

const newPeriod = ref({
  name: "",
  start_date: new Date().toISOString().slice(0, 10),
  notes: ""
})

async function createPeriod() {
  if (!newPeriod.value.name.trim()) {
    alert("El nombre es obligatorio")
    return
  }

  await periodStore.create({
    name: newPeriod.value.name,
    start_date: newPeriod.value.start_date,
    notes: newPeriod.value.notes
  })

  newPeriod.value.name = ""
  newPeriod.value.notes = ""

  await periodStore.fetchAll()
  showCreateForm.value = false
}

async function closePeriod(id: number) {
  if (!confirm("¿Cerrar este período?")) return
  await periodStore.close(id)
  await periodStore.fetchAll()
  await periodStore.fetchActive()
}

onMounted(async () => {
  if (!auth.token) {
    router.push("/login")
    return
  }

  await periodStore.fetchAll()
  await periodStore.fetchActive()
})
</script>

<template>
  <div class="periods-view">

    <div class="header">
      <button class="btn-secondary" @click="router.push('/')">⬅ Volver</button>

      <h1>Gestión de Períodos</h1>

      <SearchBar v-model="searchQuery" placeholder="Buscar períodos..." />

      <button class="btn-primary" @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? "Cancelar" : "+ Nuevo Período" }}
      </button>
    </div>

    <div v-if="showCreateForm" class="create-form">
      <h2>Nuevo Período</h2>

      <div class="form">
        <div class="field">
          <label>Nombre *</label>
          <input v-model="newPeriod.name" class="input" />
        </div>

        <div class="field">
          <label>Fecha de inicio</label>
          <input v-model="newPeriod.start_date" type="date" class="input" />
        </div>

        <div class="field">
          <label>Notas</label>
          <textarea v-model="newPeriod.notes" rows="3" class="textarea"></textarea>
        </div>

        <div class="form-actions">
          <button class="btn-primary" @click="createPeriod">Crear</button>
        </div>
      </div>
    </div>

    <div class="periods-list">
      <ErrorMessage :message="periodStore.error" />

      <div v-if="paginatedPeriods.length === 0" class="empty-state">
        <p>No hay períodos para mostrar</p>
      </div>

      <div v-else class="periods-grid">
        <div
          v-for="p in paginatedPeriods"
          :key="p.id"
          class="period-card"
          :class="{ active: p.id === periodStore.activePeriod?.id }"
        >
          <div class="period-info">
            <h3>
              {{ p.name }}
              <span v-if="p.id === periodStore.activePeriod?.id" class="badge">Activo</span>
            </h3>

            <p><strong>Inicio:</strong> {{ p.start_date }}</p>
            <p><strong>Notas:</strong> {{ p.notes || "N/A" }}</p>
          </div>

          <div class="period-actions">
            <button
              class="btn-danger"
              @click="closePeriod(p.id)"
              v-if="p.id === periodStore.activePeriod?.id"
            >
              Cerrar período
            </button>
          </div>
        </div>
      </div>
    </div>

    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @change="changePage"
    />
  </div>
</template>

<style scoped>
.periods-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.create-form {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
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

.input,
.textarea {
  padding: 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-main);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.periods-grid {
  display: grid;
  gap: 1rem;
}

.period-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.2s;
}

.period-card.active {
  border-color: var(--accent);
}

.badge {
  background: var(--accent);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.period-actions {
  margin-top: 1rem;
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
</style>
