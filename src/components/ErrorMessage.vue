<template>
  <p v-if="message" class="error-msg">
    {{ message }}
  </p>
</template>

<script setup>
defineProps({
  message: { type: String, default: "" }
});
</script>

<style scoped>
.error-msg {
  background: rgba(255, 0, 0, 0.17);
  border-left: 3px solid #ff4d4f;
  color: #ffb3b3;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin: 0.4rem 0 0.2rem;
}
</style>
