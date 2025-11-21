<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ProductImage } from '../api/types'

const props = defineProps<{
  images: ProductImage[]
  startIndex: number
}>()

const emit = defineEmits(['close'])

const index = ref(props.startIndex)

function close() {
  emit('close')
}

function next() {
  index.value = (index.value + 1) % props.images.length
}

function prev() {
  index.value = (index.value - 1 + props.images.length) % props.images.length
}

onMounted(() => {
  const listener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }
  window.addEventListener('keydown', listener)
})
</script>

<template>
  <div class="overlay" @click.self="close">
    <button class="btn close-btn" @click="close">✕</button>

    <button class="btn nav left" @click.stop="prev">‹</button>

    <img
      :src="images[index]!.image_url"
      class="gallery-image"
    />

    <button class="btn nav right" @click.stop="next">›</button>

    <div class="counter">
      {{ index + 1 }} / {{ images.length }}
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.gallery-image {
  max-width: 90%;
  max-height: 80vh;
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
}

.btn {
  position: absolute;
  background: rgba(20,20,20,0.6);
  border: 1px solid #555;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  color: #ddd;
  font-size: 1.6rem;
}

.close-btn {
  top: 20px;
  right: 20px;
  font-size: 1.4rem;
}

.nav.left {
  left: 30px;
  font-size: 2rem;
}

.nav.right {
  right: 30px;
  font-size: 2rem;
}

.counter {
  position: absolute;
  bottom: 20px;
  color: #ccc;
  font-size: 1rem;
}
</style>
