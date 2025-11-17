<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()
const error = ref('')

async function handleLogin() {
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="p-4 max-w-sm mx-auto">
    <h2 class="text-xl mb-4">Login</h2>
    <form @submit.prevent="handleLogin" class="space-y-2">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 w-full" />
      <input v-model="password" type="password" placeholder="Password" class="border p-2 w-full" />
      <button class="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    <router-link to="/signup" class="text-sm text-blue-700">Sign up</router-link>
  </div>
</template>
