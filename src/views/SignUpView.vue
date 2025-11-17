<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()
const error = ref('')
const loading = ref(false)

async function handleSignup() {
  error.value = ''
  loading.value = true
  try {
    await auth.signup(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Crear cuenta</h1>

      <form @submit.prevent="handleSignup" class="auth-form">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="auth-input"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="auth-input"
        />

        <button
          class="auth-button"
          :disabled="loading"
        >
          {{ loading ? "..." : "Registrarse" }}
        </button>
      </form>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <router-link to="/login" class="auth-link">
        ¿Ya tiene una cuenta? Ingresar
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* Matches Login View EXACTLY */

/* Outer layout */
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Card */
.auth-card {
  width: 100%;
  max-width: 360px;
  background: #181818;
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
}

/* Title */
.auth-title {
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Inputs */
.auth-input {
  padding: 0.75rem 1rem;
  background: #111;
  color: #eee;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}

.auth-input:focus {
  outline: none;
  border-color: #646cff;
}

/* Button */
.auth-button {
  padding: 0.75rem;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Error */
.auth-error {
  color: #ff6b6b;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

/* Link */
.auth-link {
  margin-top: 1.2rem;
  color: #8aa0ff;
  text-align: center;
  display: block;
  font-size: 0.9rem;
}
</style>
