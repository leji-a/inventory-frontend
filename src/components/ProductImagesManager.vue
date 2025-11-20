<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProductImage } from '../api/types'

const props = defineProps<{
  productId: number
  images: ProductImage[]
  uploading?: boolean
}>()

const emit = defineEmits<{
  (e: 'addUrl', url: string): void
  (e: 'uploadFile', file: File): void
  (e: 'deleteImage', imageId: number): void
}>()

const newImageUrl = ref('')
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => a.display_order - b.display_order)
})

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) {
    selectedFile.value = null
    previewUrl.value = null
    return
  }

  // Validar tipo
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    alert('Solo se permiten imágenes JPG, PNG o WEBP')
    return
  }

  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no debe superar 5MB')
    return
  }

  selectedFile.value = file

  // Crear preview
  const reader = new FileReader()
  reader.onload = () => {
    previewUrl.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function uploadFile() {
  if (!selectedFile.value) return
  
  emit('uploadFile', selectedFile.value)
  
  // Limpiar después de subir
  selectedFile.value = null
  previewUrl.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function addUrl() {
  const url = newImageUrl.value.trim()
  
  if (!url) {
    alert('Ingresa una URL')
    return
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    alert('La URL debe comenzar con http:// o https://')
    return
  }

  emit('addUrl', url)
  newImageUrl.value = ''
}

function deleteImage(imageId: number, _imageUrl: string) {
  if (!confirm('¿Eliminar esta imagen?')) return
  emit('deleteImage', imageId)
}

function cancelFile() {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div class="images-manager">
    
    <!-- Galería de imágenes existentes -->
    <div v-if="sortedImages.length > 0" class="images-gallery">
      <div v-for="img in sortedImages" :key="img.id" class="image-item">
        <img :src="img.image_url" :alt="`Imagen ${img.display_order + 1}`" />
        <button 
          type="button"
          class="btn-delete-image"
          @click="deleteImage(img.id, img.image_url)"
          :disabled="uploading"
        >
          ✕
        </button>
        <span class="image-order">#{{ img.display_order + 1 }}</span>
      </div>
    </div>

    <p v-else class="no-images-text">Sin imágenes</p>

    <!-- Agregar nueva imagen -->
    <div class="add-image-section">
      <h4>Agregar nueva imagen</h4>

      <!-- Opción 1: Subir archivo -->
      <div class="upload-option">
        <label class="upload-label">
          <strong>Opción 1:</strong> Subir desde tu computadora
        </label>
        
        <input 
          ref="fileInputRef"
          type="file" 
          accept="image/jpeg,image/png,image/webp"
          @change="handleFileSelect"
          class="file-input"
          :disabled="uploading"
        />

        <div v-if="previewUrl" class="file-preview">
          <img :src="previewUrl" alt="Preview" />
          <div class="preview-actions">
            <button 
              type="button"
              class="btn-upload" 
              @click="uploadFile"
              :disabled="uploading"
            >
              {{ uploading ? 'Subiendo...' : '📤 Subir imagen' }}
            </button>
            <button 
              type="button"
              class="btn-cancel" 
              @click="cancelFile"
              :disabled="uploading"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <div class="divider">O</div>

      <!-- Opción 2: URL -->
      <div class="url-option">
        <label class="upload-label">
          <strong>Opción 2:</strong> Agregar desde URL
        </label>
        
        <div class="url-input-group">
          <input 
            v-model="newImageUrl"
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            class="input"
            :disabled="uploading"
            @keyup.enter="addUrl"
          />
          <button 
            type="button"
            class="btn-add-url"
            @click="addUrl"
            :disabled="uploading || !newImageUrl.trim()"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.images-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.images-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--border-light);
  transition: border-color 0.2s;
}

.image-item:hover {
  border-color: var(--accent);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-delete-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.btn-delete-image:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-delete-image:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-order {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.no-images-text {
  text-align: center;
  color: var(--text-dim);
  padding: 2rem;
  background: var(--bg-input);
  border-radius: 8px;
  border: 2px dashed var(--border-light);
}

.add-image-section {
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
}

.add-image-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--text-main);
}

.upload-option,
.url-option {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-label {
  font-size: 0.9rem;
  color: var(--text-dim);
}

.file-input {
  padding: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-main);
  cursor: pointer;
}

.file-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-preview {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.file-preview img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--border-light);
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-upload,
.btn-cancel,
.btn-add-url {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.btn-upload {
  background: var(--accent);
  color: white;
}

.btn-cancel {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-light);
}

.btn-add-url {
  background: var(--accent);
  color: white;
  white-space: nowrap;
}

.btn-upload:hover:not(:disabled),
.btn-add-url:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-cancel:hover:not(:disabled) {
  background: var(--border-light);
}

.btn-upload:disabled,
.btn-cancel:disabled,
.btn-add-url:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  color: var(--text-dim);
  font-weight: 600;
  margin: 1rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: var(--border-light);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.url-input-group {
  display: flex;
  gap: 0.5rem;
}

.input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.9rem;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>