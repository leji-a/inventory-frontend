<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'fileSelected', file: File | null): void
}>()

const preview = ref(props.modelValue ?? null)

watch(() => props.modelValue, v => {
  preview.value = v
})

function onFileChange(e: Event) {
  const t = e.target as HTMLInputElement
  const file = t.files?.[0] || null
  emit('fileSelected', file)

  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    preview.value = reader.result as string
    emit('update:modelValue', preview.value)
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="image-uploader">
    <input type="text"
      :value="modelValue || ''"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      placeholder="URL de imagen"
      class="input"
    />

    <input type="file" class="input" @change="onFileChange" />

    <img
      v-if="preview"
      :src="preview"
      class="preview"
    />
  </div>
</template>

<style scoped>
.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 6px;
}
</style>
