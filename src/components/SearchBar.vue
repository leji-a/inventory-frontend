<template>
  <div class="search-bar">
    <input
      v-model="model"
      type="text"
      class="search-input"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineModel } from 'vue'

const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
}>()
</script>

<style scoped>
.search-bar {
  width: 100%;
  display: flex;
  justify-content: center;
}
.search-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
