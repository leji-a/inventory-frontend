<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'fileSelected', file: File | null): void
}>()

const filePreview = ref<string | null>(null)

watch(() => props.modelValue, () => {
  filePreview.value = null
})

function onFileChange(e: Event) {
  const t = e.target as HTMLInputElement
  const file = t.files?.[0] || null
  
  if (!file) {
    filePreview.value = null
    emit('fileSelected', null)
    return
  }

  emit('fileSelected', file)

  const reader = new FileReader()
  reader.onload = () => {
    filePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function clearFile() {
  filePreview.value = null
  emit('fileSelected', null)
  
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}
</script>

<template>
  <div class="image-uploader">
    <div class="field">
      <label>URL de imagen</label>
      <input type="text"
        :value="modelValue || ''"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        placeholder="https://ejemplo.com/imagen.jpg"
        class="input"
      />
    </div>

    <div class="field">
      <label>O subir archivo</label>
      <input type="file" 
        class="input" 
        accept="image/jpeg,image/png,image/webp"
        @change="onFileChange" 
      />
    </div>

    <div v-if="modelValue && !filePreview" class="preview-section">
      <p class="preview-label">Vista previa (URL):</p>
      <img :src="modelValue" class="preview" @error="() => {}" />
    </div>

    <div v-if="filePreview" class="preview-section">
      <p class="preview-label">Vista previa (Archivo):</p>
      <img :src="filePreview" class="preview" />
      <button type="button" @click="clearFile" class="btn-clear">
        ✕ Quitar archivo
      </button>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-size: 0.9rem;
  color: var(--text-dim);
}

.input {
  padding: 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-main);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-label {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin: 0;
}

.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.btn-clear {
  align-self: flex-start;
  padding: 0.3rem 0.8rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-clear:hover {
  opacity: 0.9;
}
</style>